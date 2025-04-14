<template>
  <div v-click-outside="closePopover">
    <span class="iconfont icon-setting" @click="handlePopoverVisibleChange"></span>
    <Transition name="modal">
      <div v-show="visible" class="setting-mask">
        <div class="setting-popper">
          <div class="setting-header">
            <h2>{{ $t('settings.title') }}</h2>
            <div class="header-actions">
              <a-button type="text" status="warning" @click="handleReset">
                <template #icon><icon-refresh /></template>
                {{ $t('settings.reset') }}
              </a-button>
              <a-button type="text" @click="closePopover">
                <template #icon><icon-close /></template>
              </a-button>
            </div>
          </div>
          <div class="setting-content">
            <div v-for="category in appSetting" :key="category.key" class="setting-category">
              <h3 class="category-title">{{ $t(category.titleKey) }}</h3>
              <div v-for="setting in category.items" :key="setting.key" class="setting-item">
                <div class="setting-item-label">
                  <a-tooltip position="top">
                    <template #content>
                      {{ $t(setting.descriptionKey) }}
                    </template>
                    {{ $t(setting.titleKey) }}
                    <icon-question-circle-fill class="tip-icon" />
                  </a-tooltip>
                </div>
                <div class="setting-item-content">
                  <template v-if="setting.type === 'path'">
                    <a-input v-model="setting.value" readonly size="small">
                      <template #append>
                        <span class="clickable" @click="handlePathSelect(setting)">{{
                          $t('settings.select')
                        }}</span>
                      </template>
                    </a-input>
                  </template>
                  <a-switch
                    v-else-if="setting.type === 'boolean'"
                    v-model="setting.value"
                    size="small"
                    @change="value => handleValueChange(setting.key, value)"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="setting-footer">
            <a-button type="primary" @click="closePopover">{{ $t('settings.confirm') }}</a-button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { IconQuestionCircleFill, IconRefresh } from '@arco-design/web-vue/es/icon'
import { ref, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useI18n } from 'vue-i18n'
import vClickOutside from '../../directives/click-outside'
import Bridge from '../../ipc/Bridge'
import { SettingGroup } from '../../../../common/definitions/setting'

const bridge = new Bridge()
const settingModule = bridge.getModule('setting')
const fileModule = bridge.getModule('file')
const { t } = useI18n()

const visible = defineModel<boolean>()
const appSetting = ref<SettingGroup[]>([])

// 添加缺失的方法
const handlePopoverVisibleChange = (): void => {
  visible.value = !visible.value
  if (visible.value) {
    initSettings()
  }
}

const closePopover = (): void => {
  visible.value = false
}

// 实现路径选择功能
const handlePathSelect = async (setting): Promise<void> => {
  try {
    const selectedPath = await fileModule.selectFolder()
    if (selectedPath) {
      await settingModule.set(setting.key, selectedPath)
      setting.value = selectedPath
      Message.success(t('settings.messages.pathUpdated'))
    }
  } catch (error) {
    console.error('选择路径失败:', error)
    Message.error(t('settings.messages.pathSelectFailed'))
  }
}

const initSettings = async (): Promise<void> => {
  try {
    const settingsData = await settingModule.getAll()

    // 确保每个设置项都有值，如果没有值就使用默认值
    settingsData.forEach(category => {
      category.items.forEach(item => {
        if (item.value === undefined) {
          item.value = item.defaultValue
        }
      })
    })

    appSetting.value = settingsData
  } catch (error) {
    console.error('加载设置失败:', error)
    Message.error(t('settings.messages.loadFailed'))
  }
}

const handleValueChange = async (key: string, value): Promise<void> => {
  try {
    await settingModule.set(key, value)
    Message.success(t('settings.messages.saved'))
  } catch (error) {
    console.error('保存设置失败:', error)
    Message.error(t('settings.messages.saveFailed'))
  }
}

const handleReset = async (): Promise<void> => {
  try {
    await settingModule.reset()
    await initSettings()
    Message.success(t('settings.messages.resetSuccess'))
  } catch (error) {
    console.error('重置设置失败:', error)
    Message.error(t('settings.messages.resetFailed'))
  }
}

onMounted(() => {
  initSettings()
})
</script>

<style scoped lang="less">
.icon-setting {
  font-size: 16px;
  cursor: pointer;
  color: var(--color-text-2);
  transition: all 0.3s ease;

  &:hover {
    transform: rotate(30deg);
    color: rgb(var(--primary-6));
  }
}

.setting-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99;
}

.setting-popper {
  position: relative;
  width: 480px;
  max-height: 90vh;
  background: var(--color-bg-1);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
}

.setting-header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;

  .header-actions {
    display: flex;
    gap: 8px;
    align-items: center;

    .arco-btn-text {
      padding: 4px 8px;
    }
  }

  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text-1);
  }
}

.setting-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  max-height: 60vh;
}

.setting-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
}

.setting-category {
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }

  .category-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text-1);
    margin-bottom: 20px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--color-border);
  }
}

.setting-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--color-fill-1);
  }

  &-label {
    width: 120px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: var(--color-text-2);

    .tip-icon {
      font-size: 14px;
      color: var(--color-text-3);
      opacity: 0.6;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        color: var(--color-text-2);
        opacity: 1;
      }
    }
  }

  &-content {
    flex: 1;
    margin-left: 24px;
    display: flex;
    align-items: center;
  }
}

.clickable {
  cursor: pointer;
  color: rgb(var(--primary-6));

  &:hover {
    color: rgb(var(--primary-5));
  }
}

.slider-wrapper {
  padding: 6px 0;
  display: flex;
  align-items: center;
  width: 100%;

  .arco-slider {
    flex: 1;
    margin-right: 12px;
  }

  .slider-value {
    min-width: 24px;
    text-align: center;
    color: var(--color-text-2);
    font-size: 12px;
  }
}

// 弹窗动画
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;

  .setting-popper {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;

  .setting-popper {
    transform: scale(0.95) translateY(20px);
  }
}

.modal-enter-to,
.modal-leave-from {
  opacity: 1;

  .setting-popper {
    transform: scale(1) translateY(0);
  }
}
</style>
