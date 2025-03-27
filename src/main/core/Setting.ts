import { app } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import Base from './Base'
import { SettingOptions } from '../../common/definitions/setting'
import { BridgeEvent } from '../../common/definitions/bridge'

class Setting extends Base {
  private static instance: Setting | null = null
  private settingsPath: string
  private settings: SettingOptions = {}

  private constructor() {
    super('setting')
    this.settingsPath = path.join(app.getPath('userData'), 'settings.json')
    this.loadSettings()
  }

  static getInstance(): Setting {
    if (!Setting.instance) {
      Setting.instance = new Setting()
    }
    return Setting.instance
  }

  protected registerHandlers(): void {
    this.handle(BridgeEvent.SETTING_GET, this.get.bind(this))
    this.handle(BridgeEvent.SETTING_SET, this.set.bind(this))
    this.handle(BridgeEvent.SETTING_GET_ALL, this.getAll.bind(this))
    this.handle(BridgeEvent.SETTING_RESET, this.reset.bind(this))
  }

  private loadSettings(): void {
    try {
      if (fs.existsSync(this.settingsPath)) {
        const data = fs.readFileSync(this.settingsPath, 'utf8')
        this.settings = JSON.parse(data)
      } else {
        // 默认设置
        this.settings = {
          theme: 'system',
          language: 'zh',
          autoUpdate: true
        }
        this.saveSettings()
      }
    } catch (error) {
      console.error('加载设置失败:', error)
    }
  }

  private saveSettings(): void {
    try {
      fs.writeFileSync(this.settingsPath, JSON.stringify(this.settings, null, 2))
    } catch (error) {
      console.error('保存设置失败:', error)
    }
  }

  get<T>(key: string, defaultValue?: T): T {
    return (this.settings[key] as T) ?? (defaultValue as T)
  }

  set<T>(key: string, value: T): void {
    this.settings[key] = value
    this.saveSettings()
  }

  getAll(): SettingOptions {
    return { ...this.settings }
  }

  reset(): void {
    this.settings = {
      theme: 'system',
      language: 'zh',
      autoUpdate: true
    }
    this.saveSettings()
  }
}

export default Setting
