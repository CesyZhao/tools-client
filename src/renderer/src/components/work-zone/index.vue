<template>
  <div class="work-zone">
    <a-spin v-show="modelLoading" :size="32" :tip="$t('work-zone.modelLoading')"></a-spin>

    <div
      v-show="!modelLoading"
      class="upload-area"
      @dragover.prevent
      @drop.prevent="handleDrop"
      @paste="handlePaste"
      @click="triggerUpload"
    >
      <div class="upload-content">
        <i class="iconfont icon-tupian"></i>
        <div class="upload-text">
          <p class="title">
            {{ $t('work-zone.title') }}
          </p>
          <p class="description">{{ $t('work-zone.tip1') }}</p>
          <p class="description">{{ $t('work-zone.tip2') }}</p>
        </div>
        <button class="upload-button">
          {{ $t('work-zone.button') }}
        </button>
      </div>
      <input
        ref="fileInput"
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        class="file-input"
        multiple
        @change="handleFileChange"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watchEffect } from 'vue'
import Processor from '@renderer/processor'
import Bridge from '@renderer/ipc/Bridge'

const bridge = new Bridge()
const setting = bridge.getModule('setting')

const { selectedKey } = defineProps(['selectedKey'])
const modelLoading = ref(false)
const currentProcessor = ref<Processor | null>(null)

onMounted(async () => {
  const modelPath = await setting.get('modelPath')
  const processor = new Processor(modelPath)
  currentProcessor.value = processor
})

watchEffect(async () => {
  modelLoading.value = true
  await currentProcessor?.value?.applyModel(selectedKey)
  modelLoading.value = false
})

const fileInput = ref<HTMLInputElement | null>(null)

const handleUpload = (file: File): void => {
  if (file.size > 10 * 1024 * 1024) {
    alert('图片大小不能超过10MB')
    return
  }
  console.log(currentProcessor.value, '------------------')
  currentProcessor.value?.process(file)
}

const handleDrop = (e: DragEvent): void => {
  const files = e.dataTransfer?.files
  if (files?.length) {
    handleUpload(files[0])
  }
}

const handlePaste = (e: ClipboardEvent): void => {
  const items = e.clipboardData?.items
  if (items?.length) {
    const file = items[0].getAsFile()
    if (file) {
      handleUpload(file)
    }
  }
}

const triggerUpload = (): void => {
  fileInput.value?.click()
}

const handleFileChange = (e: Event): void => {
  const target = e.target as HTMLInputElement
  const files = target.files
  if (files?.length) {
    handleUpload(files[0])
  }
}
</script>

<style lang="less" scoped>
.work-zone {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  .upload-area {
    width: 100%;
    height: 100%;
    cursor: pointer;
    transition: all 0.3s;
    position: relative;
    overflow: hidden;

    &:hover {
      border-color: #409eff;
      background: rgba(64, 158, 255, 0.05);
    }
  }

  .upload-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 24px;
    height: 100%;
    justify-content: center;
  }

  i {
    font-size: 64px;
    margin-bottom: 12px;
    line-height: 1;
  }

  .upload-text {
    text-align: center;

    .title {
      font-size: 18px;
      margin-bottom: 8px;
      span {
        color: var(--color-theme-2);
      }
    }

    .description {
      font-size: 12px;
      color: #666;
    }
  }

  .upload-button {
    margin-top: 24px;
    padding: 10px 48px;
    border: none;
    border-radius: 20px;
    background: linear-gradient(90.95deg, var(--color-theme-2) 0%, var(--color-theme-1) 100%);
    color: white;
    font-size: 14px;
    cursor: pointer;
    transition: opacity 0.3s;

    &:hover {
      opacity: 0.9;
    }
  }

  .file-input {
    display: none;
  }
}
</style>
