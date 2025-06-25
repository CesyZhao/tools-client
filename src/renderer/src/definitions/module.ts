export interface ProcessResponse {
  origialImage: string
  predict: () => Promise<void>
}

export interface IProcessedImage {
  id: string
  originalImage: File
  processedImage?: File
}
