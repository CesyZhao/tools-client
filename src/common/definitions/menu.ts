export enum MenuKey {
  AddText = 'addText',
  ImageRecognition = 'imageRecognition',
  ExtractText = 'extractText',
  RemoveBackground = 'removeBackground',
  ImageCompletion = 'imageCompletion',
  ImageGeneration = 'imageGeneration'
}

export const MenuModelMap = new Map<MenuKey, string[]>([
  [MenuKey.RemoveBackground, ['Xenova/modnet', 'briaai/RMBG-1.4']]
])

export interface IMenuItem {
  key: MenuKey
  titleKey: string
  icon: string
  tag?: string
  tagColor?: string
}
