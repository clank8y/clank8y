import { defineConfig } from 'nitro'

export default defineConfig({
  serverDir: './server',
  compatibilityDate: '2026-01-01',

  cloudflare: {
    deployConfig: true,
    nodeCompat: true,
    wrangler: {
      name: 'clank8y-website',

    },
  },
})
