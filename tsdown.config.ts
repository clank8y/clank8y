import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: './src/index.ts',
  },
  target: ['es2023'],
  format: 'esm',
  clean: true,
  dts: false,
  outDir: './dist',
  noExternal: [/.*/],
  treeshake: true,
  inlineOnly: false,
})
