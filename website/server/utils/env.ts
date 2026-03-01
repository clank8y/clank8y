import { HTTPError } from 'nitro/h3'
import process from 'node:process'

function getRequiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    console.error(`Environment variable ${name} is required but not set`)
    throw HTTPError.status(500, `Internal server error`)
  }

  return value
}

export function getAppId(): string {
  return getRequiredEnv('GITHUB_APP_ID')
}

/**
 * Reads GITHUB_APP_PRIVATE_KEY and normalises escaped newlines so the key
 * works regardless of how it was stored in the environment (e.g. wrangler
 * secrets and most CI providers store multiline values with literal `\n`).
 */
export function getAppPrivateKey(): string {
  return getRequiredEnv('GITHUB_APP_PRIVATE_KEY').replace(/\\n/g, '\n')
}

export function getWebhookSecret(): string {
  return getRequiredEnv('GITHUB_WEBHOOK_SECRET')
}
