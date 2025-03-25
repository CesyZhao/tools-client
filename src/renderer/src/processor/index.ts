import { MenuKey } from '@renderer/definitions/menu'
import RemoveBackgroundModule from './modules/remove-background/module'

const modelMap = new Map([[MenuKey.RemoveBackground, RemoveBackgroundModule]])

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
