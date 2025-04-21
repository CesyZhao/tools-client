import { MenuKey } from '../../../common/definitions/menu'
import RemoveBackgroundModule from './modules/remove-background/module'
import RemoveBackgroundModuleWebGPU from './modules/remove-background/module-gpu'
import { env } from '@huggingface/transformers'

const modelMap = new Map([[MenuKey.RemoveBackground, RemoveBackgroundModule]])

const modelMapWebGPU = new Map([[MenuKey.RemoveBackground, RemoveBackgroundModuleWebGPU]])

class Processor {
  currentModule!: RemoveBackgroundModule | RemoveBackgroundModuleWebGPU
  localModelPath!: string
  enableWebGPU = false
  modelMap!: typeof modelMap | typeof modelMapWebGPU

  constructor(localModelPath, enableWebGPU = false) {
    env.allowLocalModels = true
    env.allowRemoteModels = false
    env.useBrowserCache = false
    // env.localModelPath = localModelPath

    this.modelMap = enableWebGPU ? modelMapWebGPU : modelMap

    if (enableWebGPU && env.backends?.onnx?.wasm) {
      env.backends.onnx.wasm.proxy = true
    }
  }

  async applyModel(menuKey: MenuKey): Promise<void> {
    const module = this.modelMap.get(menuKey)
    if (module) {
      const instance = module.getInstance()
      await instance.load()
      this.currentModule = instance
    }
  }

  process(args): void {
    this.currentModule.process(args)
  }
}

export default Processor
