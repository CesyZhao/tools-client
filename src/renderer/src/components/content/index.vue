<template>
  <div class="main-content" :class="{ 'show-work-zone': selectedKey }">
    <div class="content-left"></div>
    <div class="content-right">
      <Menu @select="handleMenuSelect" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import Menu from '@renderer/components/menu/index.vue'
import { ref } from 'vue'

const selectedKey = ref('')

const handleMenuSelect = (menu): void => {
  selectedKey.value = menu.key
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
      width: calc(100% - 250px);
    }
    .content-right {
      width: 250px;
    }
  }
}
</style>
