import { MenuKey } from '../../../common/definitions/menu'
import RemoveBackgroundModule from './modules/remove-background/module'
import { kebabCase } from 'lodash'
// import RemoveBackgroundModuleWebGPU from './modules/remove-background/module-webgpu'
import { env } from '@huggingface/transformers'

const modelMap = new Map([[MenuKey.RemoveBackground, RemoveBackgroundModule]])

const menuNameList = [MenuKey.RemoveBackground]

class Processor {
  currentModule!: RemoveBackgroundModule
  localModelPath!: string
  enableWebGPU = false
  modelMap!: Map<MenuKey, unknown>

  constructor(localModelPath, enableWebGPU = false) {
    env.allowLocalModels = true
    env.allowRemoteModels = false
    env.localModelPath = localModelPath

    menuNameList.forEach(name => {
      const dirName = kebabCase(name)
      import(`./modules/${dirName}/module${enableWebGPU ? '-webgpu' : ''}.ts`).then(module => {
        modelMap.set(name, module)
      })
    })
  }

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
