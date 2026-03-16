import { defineConfig } from 'bumpp'

export default defineConfig({
  // also commit the newly built action
  files: ['package.json', 'package-lock.json', 'jsr.json', 'jsr.jsonc', 'deno.json', 'deno.jsonc', './dist/index.mjs'],
})
