import { box } from 'consola/utils'

export interface RunLoggerContext {
  repository: string
  pullRequestNumber: number
  branch: string
}

export interface UsageTotals {
  inputTokens: number
  outputTokens: number
  cacheReadTokens: number
  cacheWriteTokens: number
  cost: number
}

function formatTable(headers: string[], values: string[]): string {
  const widths = headers.map((header, index) => Math.max(header.length, values[index]?.length ?? 0))
  const top = `╔${widths.map((width) => '═'.repeat(width + 2)).join('╤')}╗`
  const middle = `╟${widths.map((width) => '─'.repeat(width + 2)).join('┼')}╢`
  const bottom = `╚${widths.map((width) => '═'.repeat(width + 2)).join('╧')}╝`
  const headerRow = `║ ${headers.map((header, index) => header.padEnd(widths[index] ?? header.length, ' ')).join(' │ ')} ║`
  const valueRow = `║ ${values.map((value, index) => value.padEnd(widths[index] ?? value.length, ' ')).join(' │ ')} ║`

  return [top, headerRow, middle, valueRow, bottom].join('\n')
}

export function logUsageSummary(totals: UsageTotals): void {
  console.log(formatTable(
    ['Cost', 'Input', 'Cache Read', 'Cache Write', 'Output'],
    [
      `$${totals.cost.toFixed(4)}`,
      String(totals.inputTokens),
      String(totals.cacheReadTokens),
      String(totals.cacheWriteTokens),
      String(totals.outputTokens),
    ],
  ))
}

export function logAgentMessage(info: {
  agent: string
  model: string
}, lines: string | string[]): void {
  const msg = Array.isArray(lines) ? lines.join('\n') : lines
  console.log(box(msg, {
    title: ` ${info.agent} - ${info.model} `,
    style: {
      borderStyle: 'double',
    },
  }))
}
