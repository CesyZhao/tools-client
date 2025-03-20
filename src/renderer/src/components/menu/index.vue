<template>
  <div class="menu-container">
    <div class="menu-grid">
      <a-card
        v-for="item in menuItems"
        :key="item.key"
        class="menu-item"
        :class="{ 'menu-item-active': item.active }"
        hoverable
        @click="handleMenuClick(item)"
      >
        <div class="menu-content">
          <component :is="item.icon" size="28" />
          <span class="menu-text">{{ item.title }}</span>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { IconEraser } from '@arco-design/web-vue/es/icon'

interface MenuItem {
  key: string
  title: string
  icon: unknown
  active?: boolean
  tag?: string
  tagColor?: string
}

const emit = defineEmits(['select'])

const menuItems = ref<MenuItem[]>([
  { key: 'enhance', title: '变清晰', icon: IconEraser, active: true },
  { key: 'removeWatermark', title: 'AI去水印', icon: IconEraser },
  { key: 'textReplace', title: '文字替换', icon: IconEraser },
  { key: 'extractDraft', title: '提取线稿', icon: IconEraser },
  { key: 'smartCrop', title: '智能抠图', icon: IconEraser },
  { key: 'removeObject', title: '涂抹消除', icon: IconEraser },
  { key: 'similarImage', title: 'AI相似图', icon: IconEraser },
  { key: 'partialReplace', title: '局部替换', icon: IconEraser },
  { key: 'styleTransfer', title: '风格转换', icon: IconEraser },
  { key: 'backgroundReplace', title: '背景替换', icon: IconEraser },
  { key: 'aiExpand', title: 'AI扩图', icon: IconEraser },
  { key: 'aiPaint', title: 'AI重绘', icon: IconEraser, tag: '内测', tagColor: '#165DFF' }
])

const handleMenuClick = (item: MenuItem): void => {
  menuItems.value.forEach(i => (i.active = i.key === item.key))
  emit('select', item)
}
</script>

<style lang="less" scoped>
.menu-container {
  padding: 16px;

  .menu-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }

  .menu-item {
    cursor: pointer;
    transition: all 0.3s;
    background: var(--color-bg-2);
    border-radius: 4px;

    &:hover {
      transform: translateY(-2px);
    }

    &.menu-item-active {
      border: 1px solid var(--color-primary-light-4);
      background: var(--color-primary-light-1);
    }
  }

  .menu-content {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    .menu-text {
      flex: 1;
    }
  }
}
</style>
