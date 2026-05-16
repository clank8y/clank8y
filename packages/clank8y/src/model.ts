import { getModel } from '@earendil-works/pi-ai'
import type { Model } from '@earendil-works/pi-ai'
// eslint-disable-next-line antfu/no-import-dist, antfu/no-import-node-modules-by-path
import type { MODELS } from '../node_modules/@earendil-works/pi-ai/dist/models.generated.js'

type PiModels = typeof MODELS

export type PiModelString = {
  [Provider in keyof PiModels & string]: {
    [ModelId in keyof PiModels[Provider] & string]: `${Provider}:${ModelId}`
  }[keyof PiModels[Provider] & string]
}[keyof PiModels & string]

export type Clank8yModelInput = Model<any> | PiModelString

export function getPiModelFromString<TModel extends PiModelString>(model: TModel): ReturnType<typeof getModel> {
  type Provider = TModel extends `${infer TProvider}:${infer _}` ? TProvider : never
  type ModelId = TModel extends `${infer _}:${infer TModelId}` ? TModelId : never
  const [provider, modelId] = model.split(':') as [Provider, ModelId]
  if (!provider || !modelId) {
    throw new Error(`Invalid model string: ${model}. Expected format: "provider:modelId"`)
  }

  return getModel(provider, modelId as any as keyof PiModels[Provider])
}
