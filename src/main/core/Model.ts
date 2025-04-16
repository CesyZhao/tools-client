import * as fs from 'fs'
import * as path from 'path'
import * as https from 'https'
import * as http from 'http'
import { app } from 'electron'
import { createWriteStream } from 'fs'
import { pipeline } from 'stream/promises'
import modelConfigList from '../config/model'
import { BridgeEvent } from '../../common/definitions/bridge'
import Base from './Base'
import Setting from './Setting'
import { ModelConfig } from '../../common/definitions/model'
import Log from './Log'
const log = Log.getInstance()

interface DownloadProgress {
  modelName: string
  progress: number
  status: 'downloading' | 'completed' | 'error'
  message?: string
}

class Model extends Base {
  private static instance: Model | null = null
  private setting: Setting
  private downloadingModels: Map<
    string,
    {
      abort: () => void
      progress: DownloadProgress
    }
  > = new Map()

  private constructor() {
    super('model')
    this.setting = Setting.getInstance()
    this.registerHandlers()
  }

  static getInstance(): Model {
    if (!Model.instance) {
      Model.instance = new Model()
    }
    return Model.instance
  }

  protected registerHandlers(): void {
    this.handle(BridgeEvent.MODEL_DOWNLOAD, this.downloadModel.bind(this))
    this.handle(BridgeEvent.MODEL_CANCEL_DOWNLOAD, this.cancelDownload.bind(this))
    this.handle(BridgeEvent.MODEL_GET_DOWNLOAD_PROGRESS, this.getDownloadProgress.bind(this))
  }

  private getDownloadPathByModelName(modelName: string): string {
    const url = `https://hf-mirror.com/${modelName}/resolve/main/`
    return url
  }

  /**
   * 获取模型存储路径
   */
  private getModelPath(): string {
    return this.setting.get<string>('modelPath', path.join(app.getPath('userData'), 'models'))
  }

  /**
   * 获取模型配置
   * @param modelName 模型名称
   */
  private getModelConfig(modelName: string): ModelConfig | undefined {
    return modelConfigList.find(config => config.modelName === modelName)
  }

  /**
   * 下载模型
   * @param modelName 模型名称
   */
  public async downloadModel(modelName: string): Promise<boolean> {
    const modelConfig = this.getModelConfig(modelName)
    if (!modelConfig) {
      log.error(`未找到模型配置: ${modelName}`)
      return false
    }

    if (this.downloadingModels.has(modelName)) {
      log.info(`模型 ${modelName} 已经在下载中`)
      return true
    }

    const modelPath = this.getModelPath()
    const modelDir = path.join(modelPath, modelName)

    // 确保模型目录存在
    if (!fs.existsSync(modelDir)) {
      fs.mkdirSync(modelDir, { recursive: true })
    }

    // 创建下载进度对象
    const progress: DownloadProgress = {
      modelName,
      progress: 0,
      status: 'downloading'
    }

    try {
      // 获取基础下载URL
      const baseDownloadUrl = this.getDownloadPathByModelName(modelName)

      // 如果没有指定文件，默认下载一个model.onnx
      const filesToDownload =
        modelConfig.files && modelConfig.files.length > 0 ? modelConfig.files : ['model.onnx']

      let totalFilesSize = 0
      let downloadedSize = 0
      const abortControllers: AbortController[] = []

      // 创建一个函数来更新总进度
      const updateTotalProgress = (chunkSize: number): void => {
        downloadedSize += chunkSize
        if (totalFilesSize > 0) {
          progress.progress = Math.min(0.99, downloadedSize / totalFilesSize)
          this.sendEvent(BridgeEvent.MODEL_DOWNLOAD_PROGRESS, progress)
        }
      }

      // 创建一个函数来下载单个文件
      const downloadFile = async (fileName: string): Promise<boolean> => {
        const fileUrl = new URL(path.join(baseDownloadUrl, fileName))
        log.info(`开始下载文件: ${fileUrl}`)

        // 处理可能的重定向
        const followRedirects = async (url: URL): Promise<boolean> => {
          const protocol = url.protocol === 'https:' ? https : http
          const abortController = new AbortController()
          abortControllers.push(abortController)

          return new Promise((resolve, reject) => {
            const req = protocol.get(
              url.toString(),
              { signal: abortController.signal },
              async response => {
                // 处理重定向
                if (
                  response.statusCode === 301 ||
                  response.statusCode === 302 ||
                  response.statusCode === 307
                ) {
                  const redirectUrl = response.headers.location
                  if (!redirectUrl) {
                    reject(new Error('重定向但没有提供 Location 头'))
                    return
                  }

                  log.info(`重定向到: ${redirectUrl}`)
                  // 构建完整的重定向 URL
                  const newUrl = new URL(redirectUrl, url.origin)
                  // 递归处理重定向
                  try {
                    const result = await followRedirects(newUrl)
                    resolve(result)
                  } catch (error) {
                    reject(error)
                  }
                  return
                }

                // 检查响应状态码
                if (response.statusCode !== 200) {
                  reject(new Error(`下载失败，状态码: ${response.statusCode}`))
                  return
                }

                const fileSize = parseInt(response.headers['content-length'] || '0', 10)
                log.info(`文件大小: ${fileSize} 字节`)

                if (fileSize > 0) {
                  totalFilesSize += fileSize
                }

                // 处理文件路径，保留目录结构
                const filePath = path.join(modelDir, fileName)

                // 确保文件的目录存在
                const fileDir = path.dirname(filePath)
                if (!fs.existsSync(fileDir)) {
                  fs.mkdirSync(fileDir, { recursive: true })
                }

                const fileStream = createWriteStream(filePath)

                // 监听数据接收事件，更新进度
                response.on('data', chunk => {
                  updateTotalProgress(chunk.length)
                })

                // 监听错误事件
                fileStream.on('error', err => {
                  log.error(`文件写入错误: ${err.message}`)
                  reject(err)
                })

                try {
                  // 使用 pipeline 处理流，确保完整性
                  await pipeline(response, fileStream)
                  log.info(`文件 ${fileName} 下载完成`)
                  resolve(true)
                } catch (error) {
                  log.error(`文件 ${fileName} 下载失败: ${error.message}`)
                  reject(error)
                }
              }
            )

            req.on('error', error => {
              log.error(`请求错误: ${error.message}`)
              reject(error)
            })

            // 设置请求超时
            req.setTimeout(60000, () => {
              req.destroy()
              reject(new Error('请求超时'))
            })
          })
        }

        // 开始下载，处理可能的重定向
        return followRedirects(fileUrl)
      }

      // 存储取消下载的方法
      this.downloadingModels.set(modelName, {
        abort: () => {
          abortControllers.forEach(controller => {
            try {
              controller.abort()
            } catch (e) {
              log.error('取消下载时出错:', e)
            }
          })
        },
        progress
      })

      // 并行下载所有文件
      try {
        // 创建所有文件的下载任务
        const downloadTasks = filesToDownload.map(fileName => downloadFile(fileName))

        // 并行执行所有下载任务
        const results = await Promise.all(downloadTasks)

        // 检查是否所有文件都下载成功
        if (results.every(result => result === true)) {
          // 所有文件下载完成
          progress.status = 'completed'
          progress.progress = 1
          this.sendEvent(BridgeEvent.MODEL_DOWNLOAD_PROGRESS, progress)

          // 从下载列表中移除
          this.downloadingModels.delete(modelName)
          return true
        } else {
          // 有文件下载失败
          log.error(`部分文件下载失败`)
          progress.status = 'error'
          progress.message = '部分文件下载失败'
          this.sendEvent(BridgeEvent.MODEL_DOWNLOAD_PROGRESS, progress)
          this.downloadingModels.delete(modelName)
          return false
        }
      } catch (error) {
        log.error(`下载模型 ${modelName} 失败:`, error)
        progress.status = 'error'
        progress.message = error.message
        this.sendEvent(BridgeEvent.MODEL_DOWNLOAD_PROGRESS, progress)
        this.downloadingModels.delete(modelName)
        return false
      }
      // 所有文件下载完成
      progress.status = 'completed'
      progress.progress = 1
      this.sendEvent(BridgeEvent.MODEL_DOWNLOAD_PROGRESS, progress)

      // 从下载列表中移除
      this.downloadingModels.delete(modelName)

      return true
    } catch (error) {
      log.error(`下载模型 ${modelName} 失败:`, error)
      progress.status = 'error'
      progress.message = error.message
      this.sendEvent(BridgeEvent.MODEL_DOWNLOAD_PROGRESS, progress)
      this.downloadingModels.delete(modelName)
      return false
    }
  }

  /**
   * 取消下载
   * @param modelName 模型名称
   */
  public cancelDownload(modelName: string): boolean {
    const downloadInfo = this.downloadingModels.get(modelName)
    if (!downloadInfo) {
      return false
    }

    downloadInfo.abort()
    this.downloadingModels.delete(modelName)

    // 发送取消事件
    const progress = downloadInfo.progress
    progress.status = 'error'
    progress.message = '下载已取消'
    this.sendEvent(BridgeEvent.MODEL_DOWNLOAD_PROGRESS, progress)

    return true
  }

  /**
   * 获取下载进度
   * @param modelName 模型名称
   */
  public getDownloadProgress(modelName: string): DownloadProgress | null {
    const downloadInfo = this.downloadingModels.get(modelName)
    return downloadInfo ? downloadInfo.progress : null
  }
}

export default Model
