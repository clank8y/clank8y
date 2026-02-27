import { defineConfig } from 'nitro'

export default defineConfig({
  serverDir: './server',
  compatibilityDate: '2026-01-01',
  preset: 'cloudflare-module',
  cloudflare: {
    deployConfig: true,
    nodeCompat: true,
    wrangler: {
      name: 'clank8y-website',
      observability: {
        enabled: true,
        head_sampling_rate: 1,
        logs: {
          enabled: true,
          head_sampling_rate: 1,
          invocation_logs: true,
        },
      },
    },
  },
})
