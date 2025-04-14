import { BridgeEvent } from '../../../common/definitions/bridge'
import { ModelStatus } from '../../../common/definitions/model'
import Base from './Base'

class Environment extends Base {
  private static instance: Environment | null = null

  private constructor() {
    super('environment')
  }

  static getInstance(): Environment {
    if (!Environment.instance) {
      Environment.instance = new Environment()
    }
    return Environment.instance
  }

  /**
   * 检查模型文件是否存在
   */
  async checkModels(list: ModelStatus[]): Promise<{ [key: string]: boolean }> {
    return this.invoke<{ [key: string]: boolean }>(BridgeEvent.ENVIRONMENT_CHECK_MODELS, list)
  }
}

export default Environment
