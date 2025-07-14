import { RawImage } from '@huggingface/transformers'
import { PretrainedConfig } from '@huggingface/transformers/types/configs'
import AbstractModule from '../AbstractModule'
import { ModelKey } from '@common/definitions/model'

class RemoveBackgroundModule extends AbstractModule<string, Promise<boolean>> {
  static instance: RemoveBackgroundModule | null = null
  readonly name = 'remove-background'

  // 模型配置
  protected modelConfig = {
    modelId: ModelKey.Briaai,
    config: { model_type: 'custom' } as PretrainedConfig
  }

  // 处理器配置
  protected processorConfig = {
    modelId: ModelKey.Briaai,
    options: {
      do_normalize: true,
      do_pad: false,
      do_rescale: true,
      do_resize: true,
      image_mean: [0.5, 0.5, 0.5],
      feature_extractor_type: 'ImageFeatureExtractor',
      image_std: [1, 1, 1],
      resample: 2,
      rescale_factor: 0.00392156862745098,
      size: { width: 1024, height: 1024 }
    }
  }

  static getInstance(): RemoveBackgroundModule {
    if (!RemoveBackgroundModule.instance) {
      RemoveBackgroundModule.instance = new RemoveBackgroundModule()
    }
    return RemoveBackgroundModule.instance
  }

  async process(url: string): Promise<boolean> {
    const image = await RawImage.fromURL(url)
    console.log(image)
    return true
  }

  destroy(): void {
    super.destroy()
    RemoveBackgroundModule.instance = null
  }
}

export default RemoveBackgroundModule
