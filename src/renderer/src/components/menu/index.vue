<template>
  <div class="menu-container">
    <div class="menu-grid" :class="{ selected: selectedKey }">
      <themed-tooltip v-for="item in menuItems" :key="item.key" :content="$t(item.titleKey)">
        <a-card
          class="menu-item"
          :class="{ 'menu-item-active': selectedKey === item.key }"
          hoverable
          @click="handleMenuClick(item)"
        >
          <div class="menu-content">
            <i :class="`menu-icon iconfont icon-${item.icon}`"></i>
            <span class="menu-text">{{ $t(item.titleKey) }}</span>
          </div>
        </a-card>
      </themed-tooltip>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { IMenuItem } from '@renderer/definitions/menu'

const emit = defineEmits(['select'])
const { selectedKey } = defineProps(['selectedKey'])

const menuItems = ref<IMenuItem[]>()

const handleMenuClick = (item: IMenuItem): void => {
  emit('select', item)
}
</script>

<style lang="less" scoped>
.menu-container {
  padding: 16px 0;

  .menu-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    &.selected {
      gap: 16px;
      grid-template-columns: repeat(3, 1fr);
      .menu-content {
        padding: 0;
        gap: 4px;
        .menu-icon {
          font-size: 24px;
          line-height: 24px;
        }
      }
    }
  }

  .menu-item {
    cursor: pointer;
    transition: all 0.3s;
    background: var(--color-bg-2);
    border-radius: 8px;
    font-size: 12px;

    &:hover {
      transform: translateY(-2px);
    }

    &.menu-item-active {
      // border: 1px solid var(--color-primary-light-4);
      // background: var(--color-primary-light-1);

      border: 1px solid var(--color-theme-2);
      background: linear-gradient(
        257deg,
        rgba(102, 218, 255, 0.1) 0%,
        rgba(78, 110, 242, 0.1) 100%
      );
      .menu-content {
        color: var(--color-theme-2) !important;
      }
    }
  }

  .menu-content {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    .menu-icon {
      font-size: 32px;
      line-height: 32px;
    }
    .menu-text {
      flex: 1;
      overflow: hidden;
      white-space: nowrap;
      max-width: 48px;
      text-overflow: ellipsis;
    }
  }
}
</style>
