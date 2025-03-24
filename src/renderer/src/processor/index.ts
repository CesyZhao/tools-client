import { AutoModel, Processor as AProcessor } from '@huggingface/transformers'
import { MenuKey } from '@renderer/definitions/menu'
import RemoveBackgroundModule from './modules/remove-background/module'

const modelMap = new Map([[MenuKey.RemoveBackground, RemoveBackgroundModule]])

class Processor {
  currentModel: AutoModel | null = null
  currentProcessor: AProcessor | null = null

  applyModel(menuKey: MenuKey): void {
    const module = modelMap.get(menuKey)
    if (module) {
      const instance = module.getInstance()
      this.currentModel = instance.getModel()
      this.currentProcessor = instance.getProcessor()
    }
  }

  process(): void {
    console.log('process')
  }
}

export default Processor
