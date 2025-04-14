import Base from './Base'
import { BridgeEvent } from '../../../common/definitions/bridge'

interface ImageFile {
  path: string
  relativePath: string
  base64: string
}

class File extends Base {
  private static instance: File | null = null

  private constructor() {
    super('file')
  }

  static getInstance(): File {
    if (!File.instance) {
      File.instance = new File()
    }
    return File.instance
  }

  async selectFolder(): Promise<string | null> {
    return this.invoke<string | null>(BridgeEvent.FILE_SELECT_FOLDER)
  }

  async selectImage(): Promise<string | null> {
    return this.invoke<string | null>(BridgeEvent.FILE_SELECT_IMAGE)
  }

  async selectFolderImages(): Promise<ImageFile[] | null> {
    return this.invoke<ImageFile[] | null>(BridgeEvent.FILE_SELECT_FOLDER_IMAGES)
  }
}

export default File
