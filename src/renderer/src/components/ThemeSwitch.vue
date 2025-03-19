<template>
  <div class="theme-switch">
    <div @click="toggleTheme">
      <i :class="`iconfont icon-${isDark ? 'dark' : 'light'}`"></i>
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
}

onMounted(async () => {
  updateThemeClass()
})
</script>

<style>
:root {
  --bg-color: #ffffff;
  --text-color: #000000;
}

:root.dark {
  --bg-color: #1a1a1a;
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
