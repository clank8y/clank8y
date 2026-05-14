/**
 * Extract individual command names from a shell command string.
 * Splits on &&, ||, ;, | and takes the first token of each segment.
 *
 * Useful for blocklist-checking shell commands before execution,
 * e.g. in `beforeToolCall` hooks of the Pi agent runtime.
 * @param fullCommandText
 */
export function extractCommandNames(fullCommandText: string): string[] {
  return fullCommandText
    .split(/&&|\|\||[;|]/)
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) => {
      // Strip leading env assignments like VAR=value cmd
      const withoutEnv = segment.replace(/^(?:\w+=\S*\s+)+/, '')
      // Take the first token (the command name), strip any leading path
      const firstToken = withoutEnv.split(/\s/)[0] ?? ''
      // Handle paths like /usr/bin/rm → rm
      return firstToken.split('/').pop()?.toLowerCase() ?? ''
    })
    .filter(Boolean)
}
