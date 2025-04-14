import { app } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import Base from './Base'
import { SettingGroup } from '../../common/definitions/setting'
import { BridgeEvent } from '../../common/definitions/bridge'
import { defaultSettings } from '../config/setting'

class Setting extends Base {
  private static instance: Setting | null = null
  private settingsPath: string
  private settings: SettingGroup[] = []

  private constructor() {
    super('setting')
    this.settingsPath = path.join(app.getPath('userData'), 'settings.json')
    this.loadSettings()
    this.registerHandlers()
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
        const loadedSettings = JSON.parse(data)

        if (Array.isArray(loadedSettings)) {
          this.settings = loadedSettings
        } else {
          // 如果是旧格式（对象格式），转换为新格式（数组格式）
          this.settings = this.convertToGroupFormat(loadedSettings)
        }
      } else {
        // 默认设置
        this.settings = JSON.parse(JSON.stringify(defaultSettings))
        this.saveSettings()
      }
    } catch (error) {
      console.error('加载设置失败:', error)
      // 出错时使用默认设置
      this.settings = JSON.parse(JSON.stringify(defaultSettings))
    }
  }

  private convertToGroupFormat(settingsObj: Record<string, unknown>): SettingGroup[] {
    const result = JSON.parse(JSON.stringify(defaultSettings))

    // 填充已有的设置值
    for (const group of result) {
      for (const item of group.items) {
        if (item.key in settingsObj) {
          item.value = settingsObj[item.key]
        }
      }
    }

    return result
  }

  private saveSettings(): void {
    try {
      // 确保目录存在
      const dir = path.dirname(this.settingsPath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFileSync(this.settingsPath, JSON.stringify(this.settings, null, 2))
    } catch (error) {
      console.error('保存设置失败:', error)
    }
  }

  get<T>(key: string, defaultValue?: T): T {
    // 从设置组中查找
    for (const group of this.settings) {
      for (const item of group.items) {
        if (item.key === key) {
          return (item.value !== undefined ? item.value : item.defaultValue) as T
        }
      }
    }

    return defaultValue as T
  }

  set<T>(key: string, value: T): void {
    // 更新设置组
    let updated = false
    for (const group of this.settings) {
      for (const item of group.items) {
        if (item.key === key) {
          item.value = value
          updated = true
          break
        }
      }
      if (updated) break
    }

    this.saveSettings()
  }

  getAll(): SettingGroup[] {
    return this.settings
  }

  reset(): void {
    this.settings = JSON.parse(JSON.stringify(defaultSettings))
    this.saveSettings()
  }
}

export default Setting
