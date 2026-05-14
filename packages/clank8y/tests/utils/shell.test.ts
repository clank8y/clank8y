import { describe, expect, test } from 'vitest'
import { extractCommandNames } from '../../src/utils/shell'

describe('extractCommandNames', () => {
  test('extracts single command', () => {
    expect(extractCommandNames('ls -la')).toEqual(['ls'])
  })

  test('extracts from && chain', () => {
    expect(extractCommandNames('cd /tmp && echo hello && ls -la')).toEqual(['cd', 'echo', 'ls'])
  })

  test('extracts from pipe chain', () => {
    expect(extractCommandNames('cat file.txt | grep foo | wc -l')).toEqual(['cat', 'grep', 'wc'])
  })

  test('extracts from semicolon chain', () => {
    expect(extractCommandNames('echo a; echo b; echo c')).toEqual(['echo', 'echo', 'echo'])
  })

  test('extracts from || chain', () => {
    expect(extractCommandNames('test -f file || touch file')).toEqual(['test', 'touch'])
  })

  test('strips leading path', () => {
    expect(extractCommandNames('/usr/bin/rm -rf /')).toEqual(['rm'])
  })

  test('strips env assignments', () => {
    expect(extractCommandNames('NODE_ENV=production npm run build')).toEqual(['npm'])
  })

  test('handles mixed operators', () => {
    expect(extractCommandNames('cd /repo && npm test || echo failed; rm -rf dist')).toEqual(['cd', 'npm', 'echo', 'rm'])
  })

  test('returns empty array for empty string', () => {
    expect(extractCommandNames('')).toEqual([])
  })
})
