import '@renderer/assets/main.css'
import '@renderer/assets/icon/iconfont.css'
import ThemedTooltip from './components/ThemedTooltip.vue'

import { createApp } from 'vue'
import App from './App.vue'
import { i18n } from './i18n'

const app = createApp(App)

app.component('ThemedTooltip', ThemedTooltip)

app.use(i18n)
app.mount('#app')
