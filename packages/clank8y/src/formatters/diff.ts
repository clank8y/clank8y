import type { PRFiles } from '../types'

export interface CachedDiff {
  content: string
  toc: string
}

export function formatFilesWithLineNumbers(files: PRFiles): CachedDiff {
  const output: string[] = []
  const tocEntries: string[] = []
  let currentLine = 1

  for (const file of files) {
    const fileStartLine = currentLine

    output.push(`## ${file.filename}`)
    output.push(`status: ${file.status}, +${file.additions}/-${file.deletions}`)
    currentLine += 2

    if (!file.patch) {
      output.push('(binary file or no textual patch available)')
      output.push('')
      currentLine += 2
      tocEntries.push(`- ${file.filename} -> lines ${fileStartLine}-${currentLine - 1}`)
      continue
    }

    const lines = file.patch.split('\n')
    let oldLine = 0
    let newLine = 0

    for (const line of lines) {
      const hunkMatch = line.match(/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/)
      if (hunkMatch) {
        const oldStart = hunkMatch[1]
        const newStart = hunkMatch[2]
        if (!oldStart || !newStart) {
          continue
        }

        oldLine = Number.parseInt(oldStart, 10)
        newLine = Number.parseInt(newStart, 10)
        output.push(line)
        currentLine += 1
        continue
      }

      const marker = line[0] ?? ' '
      const code = line.slice(1)

      if (marker === '-') {
        output.push(`|${oldLine}|-|${code}`)
        oldLine += 1
      } else if (marker === '+') {
        output.push(`|${newLine}|+|${code}`)
        newLine += 1
      } else {
        output.push(`|${oldLine}|${newLine}||${code}`)
        oldLine += 1
        newLine += 1
      }

      currentLine += 1
    }

    output.push('')
    currentLine += 1
    tocEntries.push(`- ${file.filename} -> lines ${fileStartLine}-${currentLine - 1}`)
  }

  const toc = ['# TOC', ...tocEntries, ''].join('\n')
  const content = `${toc}${output.join('\n')}`

  return {
    content,
    toc,
  }
}
