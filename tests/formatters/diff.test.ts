import { expect, test } from 'vitest'
import { formatFilesWithLineNumbers } from '../../src/formatters'
import type { PRFiles } from '../../src/types'

test('formatFilesWithLineNumbers renders diff artifact with toc and line markers', () => {
  const files = [
    {
      filename: 'src/example.ts',
      status: 'modified',
      additions: 2,
      deletions: 1,
      patch: '@@ -1,2 +1,3 @@\n const before = true\n-console.log(before)\n+const after = true\n+console.log(after)',
    },
    {
      filename: 'assets/logo.png',
      status: 'modified',
      additions: 0,
      deletions: 0,
      patch: undefined,
    },
  ] satisfies Partial<PRFiles[number]>[] as PRFiles

  expect(formatFilesWithLineNumbers(files)).toMatchInlineSnapshot(`
    {
      "content": "# TOC
    - src/example.ts -> lines 1-8
    - assets/logo.png -> lines 9-12
    ## src/example.ts
    status: modified, +2/-1
    @@ -1,2 +1,3 @@
    |1|1||const before = true
    |2|-|console.log(before)
    |2|+|const after = true
    |3|+|console.log(after)

    ## assets/logo.png
    status: modified, +0/-0
    (binary file or no textual patch available)
    ",
      "toc": "# TOC
    - src/example.ts -> lines 1-8
    - assets/logo.png -> lines 9-12
    ",
    }
  `)
})
