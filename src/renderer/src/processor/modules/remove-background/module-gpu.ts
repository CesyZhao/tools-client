import { RawImage } from '@huggingface/transformers'
import { PretrainedConfig } from '@huggingface/transformers/types/configs'
import AbstractModule from '../AbstractModule'
import { DeviceType } from 'src/common/definitions/model'

class RemoveBackgroundModuleWebGPU extends AbstractModule<string, Promise<boolean>> {
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

  async process(url: string): Promise<boolean> {
    const image = await RawImage.fromURL(url)
    console.log(image)
    return true
  }

  destroy(): void {
    super.destroy()
    RemoveBackgroundModuleWebGPU.instance = null
  }
}

export default RemoveBackgroundModuleWebGPU
