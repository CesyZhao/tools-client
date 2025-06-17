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

  async process(file: File): Promise<File> {
    if (!this.processor || !this.model) {
      throw new Error('processor or model is not loaded')
    }
    try {
      const image = await RawImage.fromURL(URL.createObjectURL(file))

      const { pixel_values } = await this.processor!(image)

      const { output } = await this.model!({ input: pixel_values })

      const { data: maskData } = await RawImage.fromTensor(output[0].mul(255).to('uint8')).resize(
        image.width,
        image.height
      )

      const canvas = document.createElement('canvas')
      canvas.width = image.width
      canvas.height = image.height
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Could not get 2d context')

      // Draw original image output to canvas
      ctx.drawImage(image.toCanvas(), 0, 0)

      // Update alpha channel
      const pixelData = ctx.getImageData(0, 0, image.width, image.height)
      for (let i = 0; i < maskData.length; ++i) {
        pixelData.data[4 * i + 3] = maskData[i]
      }
      ctx.putImageData(pixelData, 0, 0)

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          blob => (blob ? resolve(blob) : reject(new Error('Failed to create blob'))),
          'image/png'
        )
      )

      const [fileName] = file.name.split('.')
      const processedFile = new File([blob], `${fileName}-bg-blasted.png`, { type: 'image/png' })
      return processedFile
    } catch (error) {
      throw new Error('Failed to process image' + error)
    }
  }

  destroy(): void {
    super.destroy()
    RemoveBackgroundModuleWebGPU.instance = null
  }
}

export default RemoveBackgroundModuleWebGPU
