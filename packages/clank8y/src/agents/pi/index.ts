import { Agent } from '@earendil-works/pi-agent-core'
import type { AgentEvent } from '@earendil-works/pi-agent-core'
import { getModel } from '@earendil-works/pi-ai'
import type { Model } from '@earendil-works/pi-ai'
import { consola } from 'consola'
import { logAgentMessage, logUsageSummary } from '../../logging'
import type { UsageTotals } from '../../logging'
import type { Clank8yMCPServers, HTTPStartResult } from '../../mcp'
import { startAll, stopAll } from '../../mcp'
import { connectMcpServer } from '../../mcp/remote'
import type { ManagedMcpConnection } from '../../mcp/remote'
import { getSharedTools } from '../../modes'
import { getClank8yRuntimeContext } from '../../setup'
import { toolDefToAgentTool } from '../../tools'
import { doesReportArtifactExist, getReportArtifactPath } from '../../utils/artifacts'
import type { Clank8yAgent, Clank8yAgentFactory, Clank8yProfile } from '..'
import { writeFile } from 'node:fs/promises'

export const PI_AGENT_NAME = 'pi'

// ─── Model resolution ─────────────────────────────────────────────────────────

/**
 * Maps legacy clank8y model names to their canonical Pi SDK `[provider, id]` pairs.
 * Users can also pass `provider:model-id` strings directly (e.g. `anthropic:claude-opus-4-5`).
 */
const LEGACY_MODEL_MAP: Record<string, readonly [string, string]> = {
  'claude-sonnet-4.6': ['anthropic', 'claude-sonnet-4-20250514'],
  'claude-sonnet-4.5': ['anthropic', 'claude-sonnet-4-5-20251022'],
  'claude-haiku-4.5': ['anthropic', 'claude-haiku-4-5-20251022'],
  'claude-opus-4.6': ['anthropic', 'claude-opus-4-5-20251001'],
  'claude-opus-4.6-fast': ['anthropic', 'claude-opus-4-5-20251001'],
  'claude-opus-4.5': ['anthropic', 'claude-opus-4-5-20251001'],
  'claude-sonnet-4': ['anthropic', 'claude-sonnet-4-20250514'],
  'gpt-5.3-codex': ['openai', 'gpt-4o'],
  'gpt-5.2-codex': ['openai', 'gpt-4o'],
  'gpt-5.2': ['openai', 'gpt-4o'],
  'gpt-5.1-codex-max': ['openai', 'gpt-4o'],
  'gpt-5.1-codex': ['openai', 'gpt-4o'],
  'gpt-5.1': ['openai', 'gpt-4o'],
  'gpt-5.1-codex-mini': ['openai', 'gpt-4o-mini'],
  'gpt-5-mini': ['openai', 'gpt-4o-mini'],
  'gpt-4.1': ['openai', 'gpt-4.1'],
  'gemini-3-pro-preview': ['google', 'gemini-2.5-pro-preview'],
}

/**
 * Resolves a clank8y model string to a Pi SDK {@link Model} object.
 *
 * Accepts two input formats:
 * - **`provider:model-id`** — explicit format, e.g. `anthropic:claude-sonnet-4-20250514`
 * - **Legacy names** — clank8y-internal names like `claude-sonnet-4.6` mapped via `LEGACY_MODEL_MAP`
 *
 * When neither format matches, a heuristic based on model name prefix is used.
 * `as any` casts are required because the Pi SDK exposes strict provider/model-ID
 * union types generated from a static registry, which cannot accept arbitrary strings.
 */
export function resolveModel(modelString: string): Model<any> {
  // Support explicit `provider:model-id` format
  const colonIndex = modelString.indexOf(':')
  if (colonIndex > 0) {
    const provider = modelString.slice(0, colonIndex)
    const id = modelString.slice(colonIndex + 1)

    return getModel(provider as any, id as any)
  }

  // Legacy mapping
  const mapped = LEGACY_MODEL_MAP[modelString]
  if (mapped) {
    return getModel(mapped[0] as any, mapped[1] as any)
  }

  // Heuristic fallback by model name prefix
  if (modelString.startsWith('claude-')) {
    return getModel('anthropic', modelString as any)
  }

  if (modelString.startsWith('gpt-') || modelString.startsWith('o1') || modelString.startsWith('o3')) {
    return getModel('openai', modelString as any)
  }

  if (modelString.startsWith('gemini-')) {
    return getModel('google', modelString as any)
  }

  // Final fallback: treat as openai-compatible

  return getModel('openai', modelString as any)
}

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

// ─── MCP connection helpers ──────────────────────────────────────────────────

async function openMcpConnections(
  mcps: Clank8yMCPServers,
  startResults: Record<string, unknown>,
): Promise<ManagedMcpConnection[]> {
  const connections: ManagedMcpConnection[] = []

  for (const [name, server] of Object.entries(mcps)) {
    if (server.serverType !== 'http') {
      continue
    }

    const result = (startResults as Record<string, HTTPStartResult>)[name]
    if (!result?.url) {
      continue
    }

    const allowedTools = server.allowedTools[0] !== '*' ? server.allowedTools : undefined
    const conn = await connectMcpServer(name, result.url, { allowedTools })
    connections.push(conn)
  }

  return connections
}

async function closeMcpConnections(connections: ManagedMcpConnection[]): Promise<void> {
  await Promise.all(connections.map((c) => c.close()))
}

// ─── Run helpers ──────────────────────────────────────────────────────────────

async function runPiAgent(
  systemPrompt: string,
  profile: Clank8yProfile,
  agentTools: ReturnType<typeof toolDefToAgentTool>[],
): Promise<{ agent: Agent, totals: UsageTotals }> {
  const totals: UsageTotals = {
    inputTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    cost: 0,
  }

  const agentToken = resolveAgentToken()
  const model = resolveModel(profile.model)

  const agent = new Agent({
    initialState: {
      systemPrompt,
      model,
      tools: agentTools,
    },
    getApiKey: async () => agentToken,
  })

  subscribeToAgentEvents(agent, PI_AGENT_NAME, profile.model)

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
      const mcpStatus = selectModeOptions.mcp.status
      if (mcpStatus.state !== 'running' || !('url' in mcpStatus)) {
        throw new Error('Select mode MCP server must be running before calling selectMode.')
      }

      const { url } = mcpStatus as { state: 'running', url: string }

      const connection = await connectMcpServer('selectMode', url, {
        allowedTools: selectModeOptions.mcp.allowedTools,
      })

      const agentToken = resolveAgentToken()
      const model = resolveModel(profile.model)

      const agent = new Agent({
        initialState: {
          systemPrompt: selectModeOptions.prompt,
          model,
          tools: connection.tools,
        },
        getApiKey: async () => agentToken,
      })

      subscribeToAgentEvents(agent, PI_AGENT_NAME, profile.model)

      try {
        await agent.prompt('Select the appropriate clank8y mode for this request.')
      } finally {
        await connection.close()
      }
    },

    run: async ({ mode, prompt, mcps }) => {
      const startResults = await startAll(mcps)

      const connections = await openMcpConnections(mcps, startResults as Record<string, unknown>)

      const sharedTools = getSharedTools().map(toolDefToAgentTool)
      const mcpTools = connections.flatMap((c) => c.tools)
      const allTools = [...sharedTools, ...mcpTools]

      try {
        const { agent, totals } = await runPiAgent(prompt, profile, allTools)
        logUsageSummary(totals)

        if (mode === 'IncidentFix') {
          await ensureIncidentFixReport(agent)
        }
      } finally {
        await closeMcpConnections(connections)
        await stopAll(mcps)
      }
    },
  }
}
