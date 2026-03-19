export function normalizeEscapedNewlines(text: string): string {
  return text.replace(/\\r\\n|\\n|\\r/g, (match) => {
    if (match === '\\r\\n') {
      return '\r\n'
    }

    return '\n'
  })
}

export function stripSurroundingQuotes(text: string): string {
  let result = text
  if (result.startsWith('"'))
    result = result.slice(1)
  if (result.endsWith('"'))
    result = result.slice(0, -1)
  return result
}

export function normalizeToolString(text: string): string {
  return normalizeEscapedNewlines(stripSurroundingQuotes(text))
}
