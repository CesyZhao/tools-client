import SettingModule from './Setting'
import Environment from './Environment'
import Model from './Model'
import File from './File'
import Log from './Log'

export interface ModuleMap {
  setting: SettingModule
  environment: Environment
  model: Model
  file: File
  log: Log
}

class Bridge {
  private modules: ModuleMap

  constructor() {
    this.modules = {
      setting: SettingModule.getInstance(),
      environment: Environment.getInstance(),
      model: Model.getInstance(),
      file: File.getInstance(),
      log: Log.getInstance()
    }
  }

  public getModule<K extends keyof ModuleMap>(name: K): ModuleMap[K] {
    return this.modules[name]
  }

  public destroy(): void {
    // Object.values(this.modules).forEach((module) => {
    //   module.destroy()
    // })
  }
}

export default Bridge
