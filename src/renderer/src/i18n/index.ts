import { createI18n } from 'vue-i18n'

const messages = {
  zh: {
    nav: {
      theme: '主题',
      language: '语言'
    }
  },
  en: {
    nav: {
      theme: 'Theme',
      language: 'Language'
    }
  }
}

export const i18n = createI18n({
  legacy: false,
  locale: 'zh',
  fallbackLocale: 'zh',
  messages
})
