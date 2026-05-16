import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: './src/action.ts',
  },
  target: ['es2025'],
  format: 'esm',
  clean: true,
  noExternal: [/.*/],
  treeshake: true,
  dts: false,
  outDir: './dist',
  inlineOnly: false,
  outputOptions: {
    codeSplitting: false,
  },
})
