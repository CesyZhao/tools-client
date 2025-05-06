<template>
  <div class="theme-switch">
    <div @click="toggleTheme">
      <themed-tooltip :content="$t('nav.theme')">
        <icon-moon-fill v-if="isDark" />
        <icon-sun-fill v-else />
      </themed-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isDark = ref(false)

const toggleTheme = (): void => {
  isDark.value = !isDark.value
  updateThemeClass()
}

const updateThemeClass = (): void => {
  document.documentElement.classList.toggle('dark', isDark.value)
  if (isDark.value) {
    document.body.setAttribute('arco-theme', 'dark')
  } else {
    document.body.removeAttribute('arco-theme')
  }
}

onMounted(async () => {
  updateThemeClass()
})
</script>

<style>
.theme-switch {
  cursor: pointer;
}
</style>
