import Base from './Base'
import { BridgeEvent } from '../../../common/definitions/bridge'

interface DownloadProgress {
  modelName: string
  progress: number
  status: 'downloading' | 'completed' | 'error'
  message?: string
}

class Model extends Base {
  private static instance: Model | null = null

  private constructor() {
    super('model')
  }

  static getInstance(): Model {
    if (!Model.instance) {
      Model.instance = new Model()
    }
    return Model.instance
  }

  async downloadModel(modelName: string): Promise<boolean> {
    return this.invoke<boolean>(BridgeEvent.MODEL_DOWNLOAD, modelName)
  }

  async cancelDownload(modelName: string): Promise<boolean> {
    return this.invoke<boolean>(BridgeEvent.MODEL_CANCEL_DOWNLOAD, modelName)
  }

  async getDownloadProgress(modelName: string): Promise<DownloadProgress | null> {
    return this.invoke<DownloadProgress | null>(BridgeEvent.MODEL_GET_DOWNLOAD_PROGRESS, modelName)
  }

  onDownloadProgress(callback: (progress: DownloadProgress) => void): () => void {
    return this.on(BridgeEvent.MODEL_DOWNLOAD_PROGRESS, callback)
  }
}

export default Model
