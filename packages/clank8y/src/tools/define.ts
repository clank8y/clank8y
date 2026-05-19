export function defineTool<TInput = any>(
  config: Record<string, unknown> & { name: string, description?: string, title?: string, schema?: unknown },
  execute: (input: TInput) => Promise<unknown> | unknown,
) {
  return {
    ...config,
    execute,
  }
}

export const tool = {
  text: (text: string) => ({
    content: [{ type: 'text' as const, text }],
  }),
  error: (text: string) => ({
    isError: true,
    content: [{ type: 'text' as const, text }],
  }),
  structured: (structuredContent: unknown, internal?: unknown) => ({
    content: [{ type: 'text' as const, text: JSON.stringify(structuredContent) }],
    internal,
    structuredContent,
  }),
}
