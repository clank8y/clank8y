import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: './src/index.ts',
  },
  target: ['es2025'],
  format: 'esm',
  clean: true,
  noExternal: [/.*/],
  // Keep Pi SDK packages external: their provider sub-deps have broken DTS
  // relative-path resolution in pnpm's virtual store. They are declared as
  // runtime dependencies and will be available on the consumer's module path.
  external: [
    '@earendil-works/pi-agent-core',
    '@earendil-works/pi-ai',
    'typebox',
  ],
  treeshake: true,
  dts: true,
  outDir: './dist',
  inlineOnly: false,
  outputOptions: {
    codeSplitting: false,
  },
})
