export interface SettingItem {
  key: string
  titleKey: string
  descriptionKey: string
  defaultValue: unknown
  type: 'string' | 'boolean' | 'number' | 'select' | 'path'
}

export interface SettingOptions {
  theme?: 'light' | 'dark' | 'system'
  language?: string
  autoUpdate?: boolean
  [key: string]: unknown
}
