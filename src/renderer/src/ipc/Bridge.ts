import SettingModule from './Setting'

export interface ModuleMap {
  setting: SettingModule
}

class Bridge {
  private modules: ModuleMap

  constructor() {
    this.modules = {
      setting: SettingModule.getInstance()
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
