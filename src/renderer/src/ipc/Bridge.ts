import EnvironmentModule from './Environment'
import SettingModule from './Setting'
import FileModule from './File'
import ModelModule from './Model'
import Log from './Log'

export interface ModuleMap {
  setting: SettingModule
  environment: EnvironmentModule
  file: FileModule
  model: ModelModule
  log: Log
}

class Bridge {
  private modules: ModuleMap

  constructor() {
    this.modules = {
      setting: SettingModule.getInstance(),
      environment: EnvironmentModule.getInstance(),
      file: FileModule.getInstance(),
      model: ModelModule.getInstance(),
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
