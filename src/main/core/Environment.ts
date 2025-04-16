import * as fs from 'fs'
import * as path from 'path'
import { app } from 'electron'
import modelConfigList from '../config/model'
import Setting from './Setting'
import { BridgeEvent } from '../../common/definitions/bridge'
import Base from './Base'
import { ModelStatus } from '../../common/definitions/model'
import Log from './Log'

const log = Log.getInstance()

class Environment extends Base {
  private static instance: Environment | null = null
  private setting: Setting

  private constructor() {
    super('environment')
    this.setting = Setting.getInstance()
    this.registerHandlers()
  }

  static getInstance(): Environment {
    if (!Environment.instance) {
      Environment.instance = new Environment()
    }
    return Environment.instance
  }

  protected registerHandlers(): void {
    this.handle(BridgeEvent.ENVIRONMENT_CHECK_MODELS, this.checkModelEnvironment.bind(this))
  }

  /**
   * 检查模型环境是否准备就绪
   * @param modelList 要检查的模型状态列表，如果为空则检查所有模型
   */
  public async checkModelEnvironment(modelList?: ModelStatus[]): Promise<ModelStatus[]> {
    const modelPath = this.setting.get<string>(
      'modelPath',
      path.join(app.getPath('userData'), 'models')
    )

    // 复制输入列表，避免修改原始数据
    const result = JSON.parse(JSON.stringify(modelList)) as ModelStatus[]

    // 检查模型根目录是否存在
    if (!fs.existsSync(modelPath)) {
      try {
        fs.mkdirSync(modelPath, { recursive: true })
      } catch (error) {
        log.error('创建模型目录失败:', error)
        // 所有模型标记为未下载
        result.forEach(model => {
          model.download = false
        })
        return result
      }
    }

    // 检查每个模型的文件夹和必要文件
    for (const model of result) {
      // 查找对应的模型配置
      const config = modelConfigList.find(c => c.modelName === model.modelKey)

      if (!config) {
        model.download = false
        continue
      }

      const modelDir = path.join(modelPath, config.modelName)

      // 检查模型文件夹是否存在
      const folderExists = fs.existsSync(modelDir)

      // 检查必要文件是否存在
      let filesExist = true
      if (folderExists && config.files) {
        for (const file of config.files) {
          const filePath = path.join(modelDir, file)
          if (!fs.existsSync(filePath)) {
            filesExist = false
            break
          }
        }
      }
      model.download = folderExists && filesExist
    }

    return result
  }
}

export default Environment
