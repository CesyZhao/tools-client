<template>
  <div class="header">
    <div class="header-left">
      <img src="@renderer/assets/electron.svg" alt="logo" />
      <div class="app-name">Tools Client</div>
    </div>
    <div class="header-right">
      <ThemeSwitch />
      <LanguageSwitch />
    </div>
  </div>
</template>

<script lang="ts" setup>
import ThemeSwitch from './ThemeSwitch.vue'
import LanguageSwitch from './LanguageSwitch.vue'
</script>

<style lang="less" scoped>
.header {
  display: grid;
  grid-template-columns: auto 88px;
  height: 72px;
  width: 100%;

  padding: 24px 16px 0;
  .header-left {
    display: grid;
    grid-template-columns: 40px auto;
    align-items: center;
    .app-name {
      background: linear-gradient(315deg, #201c44, #3d339b);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-weight: 700;
      font-size: 20px;
    }
    img {
      width: 36px;
      height: 36px;
    }
  }
  .header-right {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
  }
}
:root.dark {
  .app-name {
    background: linear-gradient(315deg, #42d392 25%, #647eff);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 700;
  }
}
</style>
