<template>
  <div class="menu-container">
    <div class="menu-grid" :class="{ selected: selectedKey }">
      <themed-tooltip v-for="item in menuItems" :key="item.key" :content="$t(item.titleKey)">
        <a-card
          class="menu-item"
          :class="{
            'menu-item-active': selectedKey === item.key,
            'menu-item-unavailable': !item.download,
            'menu-item-downloading': item.downloading
          }"
          hoverable
          @click="handleMenuClick(item)"
        >
          <div class="menu-content">
            <i :class="`menu-icon iconfont icon-${item.icon}`"></i>
            <span class="menu-text">{{ $t(item.titleKey) }}</span>
          </div>
          <div v-if="!item.download" class="download-overlay">
            <template v-if="item.downloading">
              <a-progress
                :percent="item.progress || 0"
                type="circle"
                size="small"
                :stroke-width="3"
                :show-text="false"
              />
            </template>
            <template v-else>
              <i class="iconfont icon-download"></i>
              <span>{{ $t('common.download') }}</span>
            </template>
          </div>
        </a-card>
      </themed-tooltip>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useI18n } from 'vue-i18n'
import { IMenuItem } from '@renderer/definitions/menu'
import menuList from '@renderer/config/menu'
import Bridge from '@renderer/ipc/Bridge'
import { isFunction } from 'lodash'

type MenuItemWithStatus = IMenuItem & {
  download: boolean
  downloading?: boolean
  progress?: number
}

const emit = defineEmits(['select'])
const { selectedKey } = defineProps(['selectedKey'])
const { t } = useI18n()

const eventHandler = ref<() => void>()

const menuItems = ref<MenuItemWithStatus[]>(menuList)
const bridge = new Bridge()
const modelModule = bridge.getModule('model')

const handleMenuClick = (item: MenuItemWithStatus): void => {
  if (!item.download) {
    if (item.downloading) {
      Message.info(t('common.downloading'))
      return
    }
    // 开始下载模型
    startModelDownload(item)
    return
  }
  emit('select', item)
}

const startModelDownload = async (item: MenuItemWithStatus): Promise<void> => {
  try {
    // 设置下载状态
    const index = menuItems.value.findIndex(i => i.key === item.key)
    if (index !== -1) {
      menuItems.value[index].downloading = true
      menuItems.value[index].progress = 0
    }
    Message.success(t('common.downloadStarted'))

    // 通知主进程开始下载
    await modelModule.downloadModel(item.modelKey)
  } catch (error) {
    console.error('下载模型失败:', error)
    Message.error(t('common.downloadFailed'))

    // 重置下载状态
    const index = menuItems.value.findIndex(i => i.key === item.key)
    if (index !== -1) {
      menuItems.value[index].downloading = false
      menuItems.value[index].progress = 0
    }
  }
}

// 监听下载进度
const handleDownloadProgress = (process): void => {
  const { modelName, progress } = process
  const index = menuItems.value.findIndex(item => item.modelKey === modelName)

  const menuItem = menuItems.value[index]

  if (index !== -1) {
    menuItem.progress = Math.floor(progress * 100)

    // 下载完成
    if (progress >= 1) {
      menuItem.downloading = false
      menuItem.download = true

      emit('select', menuItem)

      // 更新本地存储
      updateLocalStorage()

      Message.success(t('common.downloadCompleted', { name: t(menuItems.value[index].titleKey) }))
    }
  }
}

// 更新本地存储
const updateLocalStorage = (): void => {
  const modelStatusList = menuItems.value.map(item => ({
    key: item.key,
    download: item.download
  }))
  localStorage.setItem('modelStatusList', JSON.stringify(modelStatusList))
}

onMounted(() => {
  const modelStatusList = JSON.parse(localStorage.getItem('modelStatusList') || '[]')

  menuItems.value = menuItems.value.map(item => {
    const modelStatus = modelStatusList.find(statusObject => statusObject.menuKey === item.key)
    item.modelKey = modelStatus?.modelKey || undefined
    item.download = modelStatus?.download || false
    item.downloading = false
    item.progress = 0
    return item
  })

  eventHandler.value = modelModule.onDownloadProgress(handleDownloadProgress)
})

onUnmounted(() => {
  if (isFunction(eventHandler.value)) {
    eventHandler.value()
  }
})
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
    position: relative;
    overflow: hidden;

    &:hover {
      transform: translateY(-2px);
    }

    &.menu-item-active {
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

    &.menu-item-unavailable {
      opacity: 0.7;
      .menu-content {
        filter: grayscale(30%);
        opacity: 0.8;
      }
    }

    &.menu-item-downloading {
      .download-overlay {
        background-color: rgba(0, 0, 0, 0.7);
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

  .download-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 12px;
    transition: all 0.3s;

    .iconfont {
      font-size: 24px;
      margin-bottom: 4px;
    }

    .progress-text {
      margin-top: 8px;
      font-size: 12px;
    }

    &:hover {
      background-color: rgba(0, 0, 0, 0.6);
    }
  }
}
</style>
