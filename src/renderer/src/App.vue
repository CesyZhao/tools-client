<template>
  <div class="app">
    <Entry v-if="!envReady" @env-ready="envReady = true" />
    <template v-else>
      <Header />
      <Content />
    </template>
  </div>
</template>

<script setup lang="ts">
import Header from '@renderer/components/header/index.vue'
import Content from '@renderer/components/content/index.vue'
import Entry from '@renderer/components/entry/index.vue'
import { ref } from 'vue'

const envReady = ref(false)
</script>

<style lang="less" scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
