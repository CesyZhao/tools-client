import { AutoModel, AutoProcessor } from '@huggingface/transformers'
import BaseModule from '../BaseModule'

class RemoveBackgroundModule implements BaseModule {
  private static instance: RemoveBackgroundModule | null = null
  private model: unknown = null
  private processor: unknown = null

  private constructor() {
    this.name = 'remove-background'
  }

  static getInstance(): RemoveBackgroundModule {
    if (!RemoveBackgroundModule.instance) {
      RemoveBackgroundModule.instance = new RemoveBackgroundModule()
    }
    return RemoveBackgroundModule.instance
  }

  name = 'remove-background'

  async load(): Promise<void> {
    if (this.model && this.processor) return

    this.model = await AutoModel.from_pretrained('briaai/RMBG-1.4', {
      config: { model_type: 'custom' }
    })

    this.processor = await AutoProcessor.from_pretrained('briaai/RMBG-1.4', {
      config: {
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
    })
  }

  destroy(): void {
    this.model = null
    this.processor = null
    RemoveBackgroundModule.instance = null
  }
}

export default RemoveBackgroundModule
