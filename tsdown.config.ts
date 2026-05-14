import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: './src/action.ts',
  },
  target: ['es2025'],
  format: 'esm',
  clean: true,
  noExternal: [/.*/],
  // Keep Pi SDK packages external: their provider sub-deps (Google SDK) have
  // broken DTS resolution in pnpm's virtual store, and they are heavy enough
  // to warrant runtime imports rather than inlining in the action bundle.
  external: [
    '@earendil-works/pi-agent-core',
    '@earendil-works/pi-ai',
    'typebox',
  ],
  treeshake: true,
  dts: false,
  outDir: './dist',
  inlineOnly: false,
  outputOptions: {
    codeSplitting: false,
  },
})
