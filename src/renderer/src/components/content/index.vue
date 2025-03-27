<template>
  <div class="main-content" :class="{ 'show-work-zone': selectedKey }">
    <div @click="download">1111111</div>
    <div class="content-left">
      <WorkZone v-if="selectedKey" :selected-key="selectedKey" />
    </div>
    <div class="content-right">
      <Menu :selected-key="selectedKey" @select="handleMenuSelect" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import Menu from '@renderer/components/menu/index.vue'
import WorkZone from '@renderer/components/work-zone/index.vue'
import { ref } from 'vue'

const selectedKey = ref('')

const handleMenuSelect = (menu): void => {
  selectedKey.value = menu.key
}

const download = (): void => {
  fetch('https://hf-mirror.com/briaai/RMBG-1.4/resolve/main/onnx/model_quantized.onnx').then(
    response => response.blob()
  )
}
</script>

<style scoped lang="less">
.main-content {
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
  .content-left {
    width: 0;
    transition: width 0.2s;
    will-change: width;
  }
  .content-right {
    width: 100%;
    transition: width 0.2s;
    will-change: width;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &.show-work-zone {
    .content-left {
      width: calc(100% - 300px);
    }
    .content-right {
      width: 300px;
      align-items: flex-start;
      border-left: 1px solid var(--color-neutral-3);
    }
  }
}
</style>
