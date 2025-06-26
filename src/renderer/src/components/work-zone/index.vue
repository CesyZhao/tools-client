<template>
  <div class="work-zone">
    <div v-show="modelLoading || modelLoadFailed" class="model-status-container">
      <a-spin v-if="modelLoading" :size="32" :tip="$t('work-zone.modelLoading')"></a-spin>

      <div v-if="modelLoadFailed" class="model-load-failed">
        <icon-exclamation-circle-fill class="error-icon" />
        <p>{{ $t('work-zone.modelLoadFailed') }}</p>
        <p class="error-tip">{{ $t('work-zone.modelLoadFailedTip') }}</p>
        <a-button type="text" @click="retryLoadModel">
          <template #icon><icon-refresh /></template>
          {{ $t('work-zone.retry') }}
        </a-button>
      </div>
    </div>

    <div
      v-show="!modelLoading && !modelLoadFailed"
      class="upload-area"
      :class="{ empty: !currentImage }"
      @dragover.prevent
      @drop.prevent="handleDrop"
      @paste="handlePaste"
      @click="triggerUpload(false)"
    >
      <!-- 现有的上传区域内容 -->
      <div v-if="!currentImage" class="upload-content">
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
      <ProcessedImageList
        v-else
        :image="currentImage"
        :processed-images-list="processedImageList"
        @add-image="triggerUpload"
        @select-image="selectImage"
      />

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
import ProcessedImageList from '@renderer/components/processed-image-list/index.vue'
import { IProcessedImage } from '@renderer/definitions/module'
import { getUUID } from '@renderer/utils/string'

const bridge = new Bridge()
const setting = bridge.getModule('setting')

const { selectedKey } = defineProps(['selectedKey'])
const modelLoading = ref(false)
const modelLoadFailed = ref(false)
const currentProcessor = ref<Processor | null>(null)

onMounted(async () => {
  const modelPath = await setting.get('modelPath')
  const enableGPU = await setting.get('enableGPU')
  const processor = new Processor(modelPath, enableGPU as boolean)
  currentProcessor.value = processor
})

const loadModel = async (): Promise<void> => {
  if (!currentProcessor.value) return

  modelLoading.value = true
  modelLoadFailed.value = false

  try {
    await currentProcessor.value.applyModel(selectedKey)
    modelLoadFailed.value = false
  } catch (error) {
    console.error('模型加载失败:', error)
    modelLoadFailed.value = true
  } finally {
    modelLoading.value = false
  }
}

const retryLoadModel = (): void => {
  loadModel()
}

watchEffect(() => {
  if (!currentProcessor.value) return
  loadModel()
})

const fileInput = ref<HTMLInputElement | null>(null)

const currentImage = ref<IProcessedImage | null>(null)

const processedImageList = ref<IProcessedImage[]>([])

const handleUpload = async (file: File): Promise<void> => {
  if (file.size > 10 * 1024 * 1024) {
    alert('图片大小不能超过10MB')
    return
  }
  const image = {
    originalImage: file,
    id: getUUID()
  }
  currentImage.value = image
  const processedImage: IProcessedImage = {
    ...image
  }
  processedImageList.value.push(processedImage)
  const result = await currentProcessor.value?.process(file)
  processedImage.processedImage = result as File
  currentImage.value = processedImage
  console.log(processedImageList, '-------')
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

const triggerUpload = (force: boolean = false): void => {
  if (currentImage.value && !force) return
  fileInput.value?.click()
}

const selectImage = (image: IProcessedImage): void => {
  currentImage.value = image
}

const handleFileChange = (e: Event): void => {
  const target = e.target as HTMLInputElement
  const files = target.files
  if (files?.length) {
    handleUpload(files[0])
    target.value = ''
  }
}
</script>

<style lang="less" scoped>
.work-zone {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  .model-status-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
  }

  .model-load-failed {
    text-align: center;
    padding: 32px;
    border-radius: 8px;
    max-width: 400px;
    animation: fadeIn 0.3s ease-in-out;

    .error-icon {
      font-size: 48px;
      color: rgb(var(--danger-6));
      margin-bottom: 16px;
    }

    p {
      margin-bottom: 16px;
      font-size: 18px;
      font-weight: 500;
      color: var(--color-text-1);
    }

    .error-tip {
      font-size: 14px;
      color: var(--color-text-3);
      margin-bottom: 24px;
    }

    .arco-btn {
      padding: 8px 24px;
      font-size: 14px;
      transition: all 0.3s;

      &:hover {
        transform: scale(1.05);
      }
    }
  }

  .upload-area {
    width: 100%;
    height: 100%;
    transition: all 0.3s;
    position: relative;
    overflow: hidden;

    &.empty:hover {
      cursor: pointer;
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

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
