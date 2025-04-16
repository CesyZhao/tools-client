import { MenuKey } from '../../../common/definitions/menu'
import RemoveBackgroundModule from './modules/remove-background/module'
// import RemoveBackgroundModuleWebGPU from './modules/remove-background/module-webgpu'
import { env } from '@huggingface/transformers'

const modelMap = new Map([[MenuKey.RemoveBackground, RemoveBackgroundModule]])

env.allowLocalModels = true
env.allowRemoteModels = false
env.localModelPath = 'file:///Users/sifan/Documents/models/'

class Processor {
  currentModule!: RemoveBackgroundModule

  async applyModel(menuKey: MenuKey): Promise<void> {
    const module = modelMap.get(menuKey)
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
