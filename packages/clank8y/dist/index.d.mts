import { Writable } from "node:stream";

//#region ../../node_modules/.pnpm/@types+aws-lambda@8.10.160/node_modules/@types/aws-lambda/handler.d.ts
/**
 * {@link Handler} context parameter.
 * See {@link https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html AWS documentation}.
 */
interface Context {
  callbackWaitsForEmptyEventLoop: boolean;
  functionName: string;
  functionVersion: string;
  invokedFunctionArn: string;
  memoryLimitInMB: string;
  awsRequestId: string;
  logGroupName: string;
  logStreamName: string;
  identity?: CognitoIdentity | undefined;
  clientContext?: ClientContext | undefined;
  tenantId?: string | undefined;
  getRemainingTimeInMillis(): number; // Functions for compatibility with earlier Node.js Runtime v0.10.42
  // No longer documented, so they are deprecated, but they still work
  // as of the 12.x runtime, so they are not removed from the types.
  /** @deprecated Use handler callback or promise result */
  done(error?: Error, result?: any): void;
  /** @deprecated Use handler callback with first argument or reject a promise result */
  fail(error: Error | string): void;
  /** @deprecated Use handler callback with second argument or resolve a promise result */
  succeed(messageOrObject: any): void; // Unclear what behavior this is supposed to have, I couldn't find any still extant reference,
  // and it behaves like the above, ignoring the object parameter.
  /** @deprecated Use handler callback or promise result */
  succeed(message: string, object: any): void;
}
interface CognitoIdentity {
  cognitoIdentityId: string;
  cognitoIdentityPoolId: string;
}
interface ClientContext {
  client: ClientContextClient;
  custom?: any;
  env: ClientContextEnv;
}
interface ClientContextClient {
  installationId: string;
  appTitle: string;
  appVersionName: string;
  appVersionCode: string;
  appPackageName: string;
}
interface ClientContextEnv {
  platformVersion: string;
  platform: string;
  make: string;
  model: string;
  locale: string;
}
/**
 * Interface for using response streaming from AWS Lambda.
 * To indicate to the runtime that Lambda should stream your function’s responses, you must wrap your function handler with the `awslambda.streamifyResponse()` decorator.
 *
 * The `streamifyResponse` decorator accepts the following additional parameter, `responseStream`, besides the default node handler parameters, `event`, and `context`.
 * The new `responseStream` object provides a stream object that your function can write data to. Data written to this stream is sent immediately to the client. You can optionally set the Content-Type header of the response to pass additional metadata to your client about the contents of the stream.
 *
 * {@link https://aws.amazon.com/blogs/compute/introducing-aws-lambda-response-streaming/ AWS blog post}
 * {@link https://docs.aws.amazon.com/lambda/latest/dg/config-rs-write-functions.html AWS documentation}
 *
 * @example <caption>Writing to the response stream</caption>
 * import 'aws-lambda';
 *
 * export const handler = awslambda.streamifyResponse(
 *   async (event, responseStream, context) => {
 *       responseStream.setContentType("text/plain");
 *       responseStream.write("Hello, world!");
 *       responseStream.end();
 *   }
 * );
 *
 * @example <caption>Using pipeline</caption>
 * import 'aws-lambda';
 * import { Readable } from 'stream';
 * import { pipeline } from 'stream/promises';
 * import zlib from 'zlib';
 *
 * export const handler = awslambda.streamifyResponse(
 *   async (event, responseStream, context) => {
 *     // As an example, convert event to a readable stream.
 *     const requestStream = Readable.from(Buffer.from(JSON.stringify(event)));
 *
 *     await pipeline(requestStream, zlib.createGzip(), responseStream);
 *   }
 * );
 */
type StreamifyHandler<TEvent = any, TResult = any> = (event: TEvent, responseStream: awslambda.HttpResponseStream, context: Context) => TResult | Promise<TResult>;
declare global {
  namespace awslambda {
    class HttpResponseStream extends Writable {
      static from(writable: Writable, metadata: Record<string, unknown>): HttpResponseStream;
      setContentType: (contentType: string) => void;
    }
    /**
     * Decorator for using response streaming from AWS Lambda.
     * To indicate to the runtime that Lambda should stream your function’s responses, you must wrap your function handler with the `awslambda.streamifyResponse()` decorator.
     *
     * The `streamifyResponse` decorator accepts the following additional parameter, `responseStream`, besides the default node handler parameters, `event`, and `context`.
     * The new `responseStream` object provides a stream object that your function can write data to. Data written to this stream is sent immediately to the client. You can optionally set the Content-Type header of the response to pass additional metadata to your client about the contents of the stream.
     *
     * {@link https://aws.amazon.com/blogs/compute/introducing-aws-lambda-response-streaming/ AWS blog post}
     * {@link https://docs.aws.amazon.com/lambda/latest/dg/config-rs-write-functions.html AWS documentation}
     *
     * @example <caption>Writing to the response stream</caption>
     * import 'aws-lambda';
     *
     * export const handler = awslambda.streamifyResponse(
     *   async (event, responseStream, context) => {
     *       responseStream.setContentType("text/plain");
     *       responseStream.write("Hello, world!");
     *       responseStream.end();
     *   }
     * );
     *
     * @example <caption>Using pipeline</caption>
     * import 'aws-lambda';
     * import { Readable } from 'stream';
     * import { pipeline } from 'stream/promises';
     * import zlib from 'zlib';
     *
     * export const handler = awslambda.streamifyResponse(
     *   async (event, responseStream, context) => {
     *     // As an example, convert event to a readable stream.
     *     const requestStream = Readable.from(Buffer.from(JSON.stringify(event)));
     *
     *     await pipeline(requestStream, zlib.createGzip(), responseStream);
     *   }
     * );
     */
    function streamifyResponse<TEvent = any, TResult = void>(handler: StreamifyHandler<TEvent, TResult>): StreamifyHandler<TEvent, TResult>;
  }
}
//#endregion
//#region src/types.d.ts
type DeepOptional<T> = T extends ((...args: any[]) => any) ? T : T extends Array<infer U> ? Array<DeepOptional<U>> : T extends object ? { [K in keyof T]?: DeepOptional<T[K]> } : T;
//#endregion
//#region src/modeSelection/schema.d.ts
declare const CLANK8Y_MODES: readonly ["Review", "IncidentFix"];
type Clank8yMode = (typeof CLANK8Y_MODES)[number];
type Clank8yDisabledModes = { [Mode in Clank8yMode]?: true };
//#endregion
//#region src/agents/index.d.ts
type Models = 'claude-sonnet-4.6' | 'claude-sonnet-4.5' | 'claude-haiku-4.5' | 'claude-opus-4.6' | 'claude-opus-4.6-fast' | 'claude-opus-4.5' | 'claude-sonnet-4' | 'gemini-3-pro-preview' | 'gpt-5.3-codex' | 'gpt-5.2-codex' | 'gpt-5.2' | 'gpt-5.1-codex-max' | 'gpt-5.1-codex' | 'gpt-5.1' | 'gpt-5.1-codex-mini' | 'gpt-5-mini' | 'gpt-4.1';
interface Clank8yAgentConfiguration {
  /**
   * Model to use for the run.
   * @default 'claude-sonnet-4.6'
   */
  model: Models | (string & {});
  /**
   * Time limit for the entire clank8y run.
   * @default 1_200_000 (20 minutes)
   */
  timeOutMs: number;
  tools: {
    /**
     * Maximum number of tool calls allowed during the review process.
     * When the limit is reached, the agent will stop making tool calls and proceed with the review based on the information it has.
     * @default 60
     */
    maxCalls: number;
    /**
     * Maximum runtime for each tool call.
     * @default 60_000 (60 seconds)
     */
    maxRuntimeMs: number;
  };
  /**
   * Agent to use for pull request review.
   * @default 'github-copilot'
   */
  agent: 'github-copilot';
  /**
   * Modes disabled for this run.
   * @default {}
   */
  disabledModes: Clank8yDisabledModes;
}
type Clank8yAgentOptions = DeepOptional<Omit<Clank8yAgentConfiguration, 'agent'>>;
//#endregion
//#region src/setup/context.d.ts
interface RepositoryContext {
  owner: string;
  repo: string;
}
interface RunInfo {
  runner: 'github-action';
  id: number;
  url: string;
}
interface Clank8yRuntimeContext {
  promptContext: string;
  auth: {
    githubToken: string;
    copilotToken: string;
  };
  runInfo?: RunInfo;
  options?: {
    suppressModelListing?: boolean;
  };
}
//#endregion
//#region src/clank8y.d.ts
interface Clank8yRunResult {
  status: 'completed';
  mode: string;
  summary: string;
}
interface RunClank8yOptions extends Clank8yAgentOptions, Clank8yRuntimeContext {}
declare function runClank8y(options: RunClank8yOptions): Promise<Clank8yRunResult>;
//#endregion
export { type Clank8yAgentOptions, type Clank8yDisabledModes, type Clank8yMode, type Clank8yRunResult, type Clank8yRuntimeContext, type Models, type RepositoryContext, type RunClank8yOptions, type RunInfo, runClank8y };