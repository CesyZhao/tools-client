<template>
  <div class="language-switch">
    <a-dropdown trigger="click">
      <themed-tooltip :content="$t('nav.language')">
        <i class="iconfont icon-language-outline" />
      </themed-tooltip>
      <template #content>
        <a-doption @click="changeLocale('zh')">
          <a-space>
            中文
            <icon-check v-show="currentLocale === 'zh'" />
          </a-space>
        </a-doption>
        <a-doption @click="changeLocale('en')">
          <a-space>
            English
            <icon-check v-show="currentLocale === 'en'" />
          </a-space>
        </a-doption>
      </template>
    </a-dropdown>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const currentLocale = ref(locale.value)

const changeLocale = (value: string): void => {
  currentLocale.value = value
  locale.value = value
  localStorage.setItem('locale', value)
}
</script>

<style lang="less" scoped>
.language-switch {
  cursor: pointer;
}
</style>
