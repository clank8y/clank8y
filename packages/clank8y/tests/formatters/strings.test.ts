import { describe, expect, test } from 'vitest'
import { normalizeEscapedNewlines, normalizeToolString, stripSurroundingQuotes } from '../../src/formatters'

describe('shared formatter strings', () => {
  test('stripSurroundingQuotes strips only the outer quotes', () => {
    expect(stripSurroundingQuotes('"hello"')).toMatchInlineSnapshot('"hello"')
    expect(stripSurroundingQuotes('"hello')).toMatchInlineSnapshot('"hello"')
    expect(stripSurroundingQuotes('hello"')).toMatchInlineSnapshot('"hello"')
  })

  test('normalizeEscapedNewlines converts escaped sequences', () => {
    expect(normalizeEscapedNewlines('line 1\\nline 2\\r\\nline 3')).toMatchInlineSnapshot(`
      "line 1
      line 2
      line 3"
    `)
  })

  test('normalizeToolString handles quoted escaped content', () => {
    expect(normalizeToolString('"alpha\\nbeta"')).toMatchInlineSnapshot(`
      "alpha
      beta"
    `)
  })
})
