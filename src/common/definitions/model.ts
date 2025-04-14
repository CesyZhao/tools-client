import { MenuKey } from './menu'

export enum ModelKey {
  Briaai = 'briaai/RMBG-1.4',
  Xenova = 'Xenova/modnet'
}

export const MenuModelMap = new Map<MenuKey, ModelKey[]>([
  [MenuKey.RemoveBackground, [ModelKey.Xenova, ModelKey.Briaai]]
])

export interface ModelStatus {
  menuKey: MenuKey
  modelKey: ModelKey
  download: boolean
}

export interface ModelConfig {
  modelName: ModelKey
  files: string[]
}
