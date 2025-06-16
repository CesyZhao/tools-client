import { RawImage } from '@huggingface/transformers'
import { PretrainedConfig } from '@huggingface/transformers/types/configs'
import AbstractModule from '../AbstractModule'
import { DeviceType } from 'src/common/definitions/model'

class RemoveBackgroundModuleWebGPU extends AbstractModule<Blob, Promise<unknown>> {
  static instance: RemoveBackgroundModuleWebGPU | null = null
  readonly name = 'remove-background'

  // 模型配置
  protected modelConfig = {
    modelId: 'Xenova/modnet',
    device: 'webgpu' as DeviceType,
    config: {
      model_type: 'modnet',
      architectures: ['MODNet']
    } as unknown as PretrainedConfig
  }

  // 处理器配置
  protected processorConfig = {
    modelId: 'Xenova/modnet'
  }

  static getInstance(): RemoveBackgroundModuleWebGPU {
    if (!RemoveBackgroundModuleWebGPU.instance) {
      RemoveBackgroundModuleWebGPU.instance = new RemoveBackgroundModuleWebGPU()
    }
    return RemoveBackgroundModuleWebGPU.instance
  }

  async process(file: Blob): Promise<unknown> {
    return new Promise((resolve, reject) => {
      if (!this.processor || !this.model) {
        reject('processor or model is not loaded')
        return
      }

      const reader = new FileReader()

      reader.onload = async (e2): Promise<void> => {
        const url = e2.target?.result as string

        const image = await RawImage.fromURL(url)

        const { pixel_values } = await this.processor!(image)

        // Predict alpha matte
        const { output } = await this.model!({ input: pixel_values })

        resolve(output)
      }

      reader.readAsDataURL(file)
    })
  }

  destroy(): void {
    super.destroy()
    RemoveBackgroundModuleWebGPU.instance = null
  }
}

export default RemoveBackgroundModuleWebGPU
