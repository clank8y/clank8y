import type {
  Octokit,
} from 'octokit'

export type PRFiles = Awaited<ReturnType<Octokit['rest']['pulls']['listFiles']>>['data']

export type DeepOptional<T> = T extends (...args: any[]) => any
  ? T
  : T extends Array<infer U>
    ? Array<DeepOptional<U>>
    : T extends object
      ? { [K in keyof T]?: DeepOptional<T[K]> }
      : T
