export interface ProcessResponse {
  origialImage: string
  predict: () => Promise<void>
}
