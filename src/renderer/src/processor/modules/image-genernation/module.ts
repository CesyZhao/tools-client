import { PretrainedConfig } from '@huggingface/transformers/types/configs'
import AbstractModule from '../AbstractModule'
import { ModelKey } from '@common/definitions/model'

class ImageGenernationModule extends AbstractModule<string, Promise<boolean>> {
  static instance: ImageGenernationModule | null = null
  readonly name = 'image-genernation'

  // 模型配置
  protected modelConfig = {
    modelId: ModelKey.Janus,
    config: { model_type: 'custom' } as PretrainedConfig
  }

  // 处理器配置
  protected processorConfig = {
    modelId: ModelKey.Janus,
    options: {}
  }

  static getInstance(): ImageGenernationModule {
    if (!ImageGenernationModule.instance) {
      ImageGenernationModule.instance = new ImageGenernationModule()
    }
    return ImageGenernationModule.instance
  }

  async process(description: string): Promise<boolean> {
    console.log(description)
    return true
  }

  destroy(): void {
    super.destroy()
    ImageGenernationModule.instance = null
  }
}

export default ImageGenernationModule
