import { IMenuItem, MenuKey } from '@renderer/definitions/menu'

const menu: Array<IMenuItem> = [
  { key: MenuKey.AddText, titleKey: 'menu.addText', icon: 'tianjiawenzi' },
  { key: MenuKey.ImageRecognition, titleKey: 'menu.imageRecognition', icon: 'tupianshibie' },
  { key: MenuKey.ExtractText, titleKey: 'menu.extractText', icon: 'tiquwenzi' },
  { key: MenuKey.RemoveBackground, titleKey: 'menu.removeBackground', icon: 'mosaic' },
  { key: MenuKey.ImageCompletion, titleKey: 'menu.imageCompletion', icon: 'beijing-tihuanbeijing' },
  { key: MenuKey.ImageGeneration, titleKey: 'menu.imageGeneration', icon: 'tupianshengcheng' }
]

export default menu
