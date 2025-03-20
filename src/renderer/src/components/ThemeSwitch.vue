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
:root {
  --bg-color: #ffffff;
  --bg-color-1: #f5f5f5;
  --text-color: #000000;
}

:root.dark {
  --bg-color: #1a1a1a;
  --bg-color-1: #262626;
  --text-color: #ffffff;
}

body {
  background-color: var(--bg-color);
  color: var(--text-color);
}

.theme-switch {
  padding: 10px;
  cursor: pointer;
}

.theme-switch button {
  margin-right: 10px;
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid var(--text-color);
  background: var(--bg-color);
  color: var(--text-color);
  cursor: pointer;
}
</style>
