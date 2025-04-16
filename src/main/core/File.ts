import * as fs from 'fs'
import * as path from 'path'
import { dialog, BrowserWindow } from 'electron'
import Base from './Base'
import { BridgeEvent } from '../../common/definitions/bridge'
import Log from './Log'
const log = Log.getInstance()

interface ImageFile {
  path: string
  relativePath: string
  base64: string
}

class File extends Base {
  private static instance: File | null = null

  private constructor() {
    super('file')
    this.registerHandlers()
  }

  static getInstance(): File {
    if (!File.instance) {
      File.instance = new File()
    }
    return File.instance
  }

  protected registerHandlers(): void {
    this.handle(BridgeEvent.FILE_SELECT_FOLDER, this.selectFolder.bind(this))
    this.handle(BridgeEvent.FILE_SELECT_IMAGE, this.selectImage.bind(this))
    this.handle(BridgeEvent.FILE_SELECT_FOLDER_IMAGES, this.selectFolderImages.bind(this))
  }

  /**
   * 选择文件夹
   * @returns 选择的文件夹路径
   */
  public async selectFolder(): Promise<string | null> {
    const window = BrowserWindow.getFocusedWindow()
    if (!window) {
      return null
    }

    const result = await dialog.showOpenDialog(window, {
      properties: ['openDirectory']
    })

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }

    return result.filePaths[0]
  }

  /**
   * 选择单张图片
   * @returns 图片的 base64 字符串
   */
  public async selectImage(): Promise<string | null> {
    const window = BrowserWindow.getFocusedWindow()
    if (!window) {
      return null
    }

    const result = await dialog.showOpenDialog(window, {
      properties: ['openFile'],
      filters: [{ name: '图片', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] }]
    })

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }

    try {
      const imagePath = result.filePaths[0]
      const imageBuffer = fs.readFileSync(imagePath)
      const base64 = imageBuffer.toString('base64')
      const extension = path.extname(imagePath).substring(1)
      return `data:image/${extension};base64,${base64}`
    } catch (error) {
      log.error('读取图片失败:', error)
      return null
    }
  }

  /**
   * 选择文件夹内所有图片
   * @returns 保留文件夹结构的所有图片 base64
   */
  public async selectFolderImages(): Promise<ImageFile[] | null> {
    const folderPath = await this.selectFolder()
    if (!folderPath) {
      return null
    }

    try {
      const imageFiles: ImageFile[] = []
      await this.readImagesFromFolder(folderPath, '', imageFiles)
      return imageFiles
    } catch (error) {
      log.error('读取文件夹图片失败:', error)
      return null
    }
  }

  /**
   * 递归读取文件夹中的图片
   * @param folderPath 文件夹路径
   * @param relativePath 相对路径
   * @param result 结果数组
   */
  private async readImagesFromFolder(
    folderPath: string,
    relativePath: string,
    result: ImageFile[]
  ): Promise<void> {
    const files = fs.readdirSync(folderPath)

    for (const file of files) {
      const filePath = path.join(folderPath, file)
      const fileRelativePath = path.join(relativePath, file)
      const stat = fs.statSync(filePath)

      if (stat.isDirectory()) {
        // 递归读取子文件夹
        await this.readImagesFromFolder(filePath, fileRelativePath, result)
      } else {
        // 检查是否为图片文件
        const extension = path.extname(file).toLowerCase()
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(extension)) {
          try {
            const imageBuffer = fs.readFileSync(filePath)
            const base64 = imageBuffer.toString('base64')
            const extName = extension.substring(1)

            result.push({
              path: filePath,
              relativePath: fileRelativePath,
              base64: `data:image/${extName};base64,${base64}`
            })
          } catch (error) {
            log.error(`读取图片 ${filePath} 失败:`, error)
          }
        }
      }
    }
  }
}

export default File
