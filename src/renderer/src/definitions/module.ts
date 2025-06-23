export interface ProcessResponse {
  origialImage: string
  predict: () => Promise<void>
}

export interface IProcessedImage {
  originalImage: File
  processedImage?: File
}
