import type {
  Octokit,
} from 'octokit'

export type PRFiles = Awaited<ReturnType<Octokit['rest']['pulls']['listFiles']>>['data']

// Todo handle unions of objects and other types via extract etc
export type DeepOptional<T> = T extends (...args: any[]) => any
  ? T
  : T extends Array<infer U>
    ? Array<DeepOptional<U>>
    : T extends object
      ? { [K in keyof T]?: DeepOptional<T[K]> }
      : T
