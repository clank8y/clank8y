import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: './src/index.ts',
  },
  target: ['es2025'],
  format: 'esm',
  clean: true,
  noExternal: [/.*/],
  treeshake: true,
  dts: true,
  outDir: './dist',
  outputOptions: {
    codeSplitting: false,
  },
})
