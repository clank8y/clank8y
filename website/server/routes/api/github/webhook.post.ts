import { defineHandler, HTTPError, readBody } from 'nitro/h3'
import { createEventHandler } from '@octokit/webhooks'
import process from 'node:process'

export default defineHandler(async (event) => {
  if (!process.env.GITHUB_WEBHOOK_SECRET) {
    console.error('GITHUB_WEBHOOK_SECRET is not set. Cannot verify webhook signatures.')
    throw HTTPError.status(500, 'Internal server error')
  }

  const body = readBody(event)

  console.log('Received GitHub webhook request with body:', body, 'and headers:', Object.fromEntries(event.req.headers.entries()))

  const eventHandler = createEventHandler({
    secret: process.env.GITHUB_WEBHOOK_SECRET,
  })

  eventHandler.on('issue_comment.created', async ({ id, name, payload }) => {
    console.log(`Received GitHub webhook event: ${name} (delivery ID: ${id})`)
    console.log('Event payload:', payload)
  })

  eventHandler.on('pull_request.opened', async ({ id, name, payload }) => {
    console.log(`Received GitHub webhook event: ${name} (delivery ID: ${id})`)
    console.log('Event payload:', payload)
  })

  // put this inside your webhooks route handler
  try {
    eventHandler
      .receive({
        id: event.req.headers.get('x-github-delivery') as any,
        name: event.req.headers.get('x-github-event') as any,
        payload: body as any,
      })
  } catch (error) {
    console.error('Error processing GitHub webhook:', error)
    throw HTTPError.status(401, 'Invalid webhook signature')
  }
})
