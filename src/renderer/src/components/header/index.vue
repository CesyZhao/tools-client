<template>
  <div class="header">
    <div class="header-left">
      <img src="@renderer/assets/logo.svg" alt="logo" />
      <div class="app-name">Tools Client</div>
    </div>
    <div class="header-right">
      <setting />
    </div>
  </div>
</template>

<script lang="ts" setup>
import Setting from '@renderer/components/setting/index.vue'
</script>

<style lang="less" scoped>
.header {
  display: grid;
  grid-template-columns: auto 32px;
  height: 72px;
  width: 100%;
  border-bottom: 1px solid var(--color-neutral-3);
  box-shadow: 0 0 4px 0 var(--color-neutral-3);
  padding: 12px 16px 0;
  .header-left {
    display: grid;
    grid-template-columns: 40px 120px;
    align-items: center;
    .logo {
      fill: var(--color-theme-2);
    }
    .app-name {
      background: linear-gradient(10deg, var(--color-theme-1) 0%, var(--color-theme-2) 100%);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-weight: 700;
      font-size: 20px;
    }
    img {
      width: 28px;
      height: 28px;
    }
  }
  .header-right {
    display: flex;
    align-items: center;
  }
}
</style>
