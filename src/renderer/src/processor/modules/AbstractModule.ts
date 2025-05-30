import { PretrainedConfig } from '@huggingface/transformers/types/configs'
import { PretrainedProcessorOptions } from '@huggingface/transformers/types/base/processing_utils'
import BaseModule from './BaseModule'
import { DeviceType } from 'src/common/definitions/model'
import { AutoModel, AutoProcessor } from '@huggingface/transformers'

abstract class AbstractModule<U, X> extends BaseModule<U, X> {
  // 模型配置
  protected abstract modelConfig: {
    modelId: string
    config?: PretrainedConfig
    device?: DeviceType
  }

  // 处理器配置
  protected abstract processorConfig: {
    modelId: string
    options?: PretrainedProcessorOptions
  }

  // 加载模型和处理器
  async load(): Promise<void> {
    if (this.model && this.processor) return

    try {
      // 加载模型
      this.model = await AutoModel.from_pretrained(this.modelConfig.modelId, {
        device: this.modelConfig.device,
        config: this.modelConfig.config
      })

      // 加载处理器
      this.processor = await AutoProcessor.from_pretrained(this.processorConfig.modelId, {
        config: this.processorConfig.options
      })
    } catch (error) {
      console.error(`加载模型失败: ${this.name}`, error)
      throw error
    }
  }
}

export default AbstractModule
