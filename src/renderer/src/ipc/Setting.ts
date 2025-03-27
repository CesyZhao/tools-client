import Base from './Base'
import { SettingOptions } from '../../../common/definitions/setting'
import { BridgeEvent } from '../../../common/definitions/bridge'

class Setting extends Base {
  private static instance: Setting | null = null

  private constructor() {
    super('setting')
  }

  static getInstance(): Setting {
    if (!Setting.instance) {
      Setting.instance = new Setting()
    }
    return Setting.instance
  }

  async get<T>(key: string, defaultValue?: T): Promise<T> {
    return this.invoke<T>(BridgeEvent.SETTING_GET, key, defaultValue)
  }

  async set<T>(key: string, value: T): Promise<void> {
    return this.invoke<void>(BridgeEvent.SETTING_SET, key, value)
  }

  async getAll(): Promise<SettingOptions> {
    return this.invoke<SettingOptions>(BridgeEvent.SETTING_GET_ALL)
  }

  async reset(): Promise<void> {
    return this.invoke<void>(BridgeEvent.SETTING_RESET)
  }
}

export default Setting
