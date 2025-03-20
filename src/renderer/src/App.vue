<template>
  <div class="app">
    <Header />
    <Content />
  </div>
</template>

<script setup lang="ts">
import Header from '@renderer/components/header/index.vue'
import Content from '@renderer/components/content/index.vue'
</script>

<style lang="less" scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
