import { app } from 'electron'
import * as path from 'path'
import { SettingGroup } from '../../common/definitions/setting'

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
        type: 'path',
        value: undefined
      },
      {
        key: 'savePath',
        titleKey: 'settings.paths.savePath.title',
        descriptionKey: 'settings.paths.savePath.description',
        defaultValue: defaultSavePath,
        type: 'path',
        value: undefined
      }
    ]
  },
  {
    key: 'performance',
    titleKey: 'settings.performance.title',
    items: [
      {
        key: 'enableGPU',
        titleKey: 'settings.performance.enableGPU.title',
        descriptionKey: 'settings.performance.enableGPU.description',
        defaultValue: false,
        type: 'boolean',
        value: undefined
      }
    ]
  }
]
