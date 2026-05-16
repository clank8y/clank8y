import { Agent } from '@earendil-works/pi-agent-core'
import type { AgentEvent, AgentTool } from '@earendil-works/pi-agent-core'
import { consola } from 'consola'
import { logAgentMessage, logUsageSummary } from '../../logging'
import type { UsageTotals } from '../../logging'
import { startAll, stopAll } from '../../tools/external'
import { createPiToolBundle } from '../../tools'
import { getClank8yRuntimeContext } from '../../setup'
import { doesReportArtifactExist, getReportArtifactPath } from '../../utils/artifacts'
import type { Clank8yAgent, Clank8yAgentFactory, Clank8yProfile } from '..'
import { writeFile } from 'node:fs/promises'

export const PI_AGENT_NAME = 'pi'

// ─── Agent token ──────────────────────────────────────────────────────────────

function resolveAgentToken(): string {
  return getClank8yRuntimeContext().auth.agentToken
}

// ─── Event subscription ──────────────────────────────────────────────────────

function subscribeToAgentEvents(agent: Agent, agentName: string, model: string): void {
  const turnStarts = new Map<string, number>()

  agent.subscribe((event: AgentEvent) => {
    switch (event.type) {
      case 'turn_start': {
        const key = String(turnStarts.size)
        turnStarts.set(key, Date.now())
        break
      }

      case 'turn_end': {
        // Log last recorded turn duration
        const keys = [...turnStarts.keys()]
        const lastKey = keys[keys.length - 1]
        if (lastKey !== undefined) {
          const start = turnStarts.get(lastKey)
          if (start) {
            consola.info(`thought for ${((Date.now() - start) / 1000).toFixed(1)}s`)
            turnStarts.delete(lastKey)
          }
        }
        break
      }

      case 'tool_execution_start': {
        const { toolName, args } = event
        const label = toolName.startsWith('mcp__') ? toolName.replace(/^mcp__\w+__/, '') : toolName

        if (label === 'report_intent') {
          const intent = (args as { intent?: unknown })?.intent
          if (intent) {
            consola.info(`🤖 clanking next... ${String(intent)}`)
          }
          break
        }

        consola.info(`→ tool: ${label}${args !== undefined ? ` ${JSON.stringify(args)}` : ''}`)
        break
      }

      case 'message_end': {
        const msg = event.message
        if (msg.role === 'assistant' && 'content' in msg) {
          const content = (msg as { role: string, content: unknown }).content
          const text = Array.isArray(content)
            ? content
                .filter((c): c is { type: 'text', text: string } => (c as any).type === 'text')
                .map((c) => c.text)
                .join('')
            : typeof content === 'string'
              ? content
              : null

          if (text) {
            logAgentMessage({ agent: agentName, model }, text)
          }
        }

        break
      }
    }
  })
}

// ─── Usage accumulation ───────────────────────────────────────────────────────

function accumulateUsage(event: AgentEvent, totals: UsageTotals): void {
  if (event.type === 'turn_end') {
    const msg = event.message as any
    if (msg?.usage) {
      totals.inputTokens += msg.usage.input ?? 0
      totals.outputTokens += msg.usage.output ?? 0
      totals.cacheReadTokens += msg.usage.cacheRead ?? 0
      totals.cacheWriteTokens += msg.usage.cacheWrite ?? 0
      totals.cost += msg.usage.cost?.total ?? 0
    }
  }
}

// ─── Run helpers ──────────────────────────────────────────────────────────────

async function runPiAgent(
  systemPrompt: string,
  profile: Clank8yProfile,
  agentTools: AgentTool[],
): Promise<{ agent: Agent, totals: UsageTotals }> {
  const totals: UsageTotals = {
    inputTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    cost: 0,
  }

  const agentToken = resolveAgentToken()

  const agent = new Agent({
    initialState: {
      systemPrompt,
      model: profile.model,
      tools: agentTools,
    },
    getApiKey: async () => agentToken,
  })

  subscribeToAgentEvents(agent, PI_AGENT_NAME, profile.model.id)

  agent.subscribe((event: AgentEvent) => {
    accumulateUsage(event, totals)
  })

  // Apply timeout via AbortController
  const timeoutHandle = setTimeout(() => {
    consola.warn(`Pi agent timed out after ${profile.timeOutMs}ms`)
    agent.abort()
  }, profile.timeOutMs)

  try {
    consola.info('clank8y getting to work...')
    await agent.prompt('Please proceed.')
  } finally {
    clearTimeout(timeoutHandle)
  }

  return { agent, totals }
}

// ─── IncidentFix fallback report ─────────────────────────────────────────────

const MAX_REPORT_RETRIES = 3

const REPORT_REMINDER_PROMPT = [
  'Your investigation report file at `.clank8y/report.md` is missing.',
  'You MUST create this file now using a normal file write tool.',
  'Include: incident summary, confirmed facts, rejected hypotheses,',
  'repositories inspected, branches inspected, changes made (if any),',
  'fix direction, and open questions.',
].join(' ')

function buildFallbackReport(agent: Agent): string {
  const sections: string[] = [
    '# IncidentFix Report (auto-generated fallback)',
    '',
    '> This report was generated automatically because the agent did not produce `.clank8y/report.md`.',
    '',
  ]

  const assistantMessages = agent.state.messages
    .filter((m) => m.role === 'assistant')
    .map((m) => {
      const msg = m as { role: string, content: unknown }
      if (!Array.isArray(msg.content))
        return null

      return msg.content
        .filter((c): c is { type: 'text', text: string } => (c as any).type === 'text')
        .map((c) => c.text)
        .join('')
    })
    .filter(Boolean) as string[]

  if (assistantMessages.length > 0) {
    sections.push('## Agent Responses', '')
    for (const text of assistantMessages) {
      sections.push(text, '')
    }
  } else {
    sections.push('No agent messages were captured during this run.', '')
  }

  return sections.join('\n')
}

async function ensureIncidentFixReport(agent: Agent): Promise<void> {
  let reportExists = await doesReportArtifactExist()

  for (let attempt = 1; attempt <= MAX_REPORT_RETRIES && !reportExists; attempt++) {
    consola.warn(`report.md not found after run (attempt ${attempt}/${MAX_REPORT_RETRIES}), re-prompting agent...`)
    await agent.prompt(REPORT_REMINDER_PROMPT)
    reportExists = await doesReportArtifactExist()
  }

  if (!reportExists) {
    consola.warn('Agent did not produce report.md after retries — generating fallback report.')
    const fallbackReport = buildFallbackReport(agent)
    await writeFile(getReportArtifactPath(), fallbackReport, 'utf-8')
    consola.info(`Fallback report written to ${getReportArtifactPath()}`)
  }
}

// ─── Pi agent factory ─────────────────────────────────────────────────────────

export const piAgent: Clank8yAgentFactory = (profile: Clank8yProfile): Clank8yAgent => {
  return {
    name: PI_AGENT_NAME,

    selectMode: async (selectModeOptions) => {
      const agentToken = resolveAgentToken()

      const agent = new Agent({
        initialState: {
          systemPrompt: selectModeOptions.prompt,
          model: profile.model,
          tools: selectModeOptions.tools,
        },
        getApiKey: async () => agentToken,
      })

      subscribeToAgentEvents(agent, PI_AGENT_NAME, profile.model.id)

      await agent.prompt('Select the appropriate clank8y mode for this request.')
    },

    run: async ({ mode, prompt, externalMcpServers, tools }) => {
      const startResults = await startAll(externalMcpServers)
      let toolBundle: Awaited<ReturnType<typeof createPiToolBundle>> | undefined

      try {
        toolBundle = await createPiToolBundle(externalMcpServers, startResults, tools)
        const { agent, totals } = await runPiAgent(prompt, profile, toolBundle.tools)
        logUsageSummary(totals)

        if (mode === 'IncidentFix') {
          await ensureIncidentFixReport(agent)
        }
      } finally {
        await toolBundle?.close()
        await stopAll(externalMcpServers)
      }
    },
  }
}
