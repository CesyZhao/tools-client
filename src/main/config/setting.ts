import { app } from 'electron'
import * as path from 'path'
import { SettingItem } from '../../common/definitions/setting'

export interface SettingGroup {
  key: string
  titleKey: string
  items: SettingItem[]
}

const defaultModelPath = path.join(app.getPath('userData'), 'models')
const defaultSavePath = path.join(app.getPath('downloads'), 'tools-client')

export const defaultSettings: SettingGroup[] = [
  {
    key: 'paths',
    titleKey: 'settings.paths.title',
    items: [
      {
        key: 'modelPath',
        titleKey: 'settings.paths.modelPath.title',
        descriptionKey: 'settings.paths.modelPath.description',
        defaultValue: defaultModelPath,
        type: 'path'
      },
      {
        key: 'savePath',
        titleKey: 'settings.paths.savePath.title',
        descriptionKey: 'settings.paths.savePath.description',
        defaultValue: defaultSavePath,
        type: 'path'
      }
    ]
  }
]

// 国际化词条
export const i18nKeys = {
  zh: {
    'settings.paths.title': '路径设置',
    'settings.paths.modelPath.title': '模型下载路径',
    'settings.paths.modelPath.description': '设置AI模型的下载和存储位置',
    'settings.paths.savePath.title': '文件保存路径',
    'settings.paths.savePath.description': '设置处理后的文件默认保存位置'
  },
  en: {
    'settings.paths.title': 'Path Settings',
    'settings.paths.modelPath.title': 'Model Download Path',
    'settings.paths.modelPath.description': 'Set the download and storage location for AI models',
    'settings.paths.savePath.title': 'File Save Path',
    'settings.paths.savePath.description': 'Set the default save location for processed files'
  }
}
