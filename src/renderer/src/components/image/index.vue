<template>
  <div ref="containerRef" class="image-container">
    <!-- 原始图片 -->
    <div
      v-if="originalImageUrl"
      class="original-image"
      :class="{ 'hide-original': processedImageUrl }"
      :style="imageStyle"
    >
      <img ref="originalImageRef" :src="originalImageUrl" :alt="alt" @load="handleImageLoad" />
    </div>

    <!-- 处理后的图片 -->
    <div
      v-if="processedImageUrl"
      class="processed-image"
      :class="{ 'show-processed': processedImageUrl }"
      :style="imageStyle"
    >
      <img :src="processedImageUrl" :alt="alt" />
    </div>

    <!-- 加载中遮罩 -->
    <div v-if="!processedImageUrl && originalImageUrl" class="loading-mask">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { IProcessedImage } from '@renderer/definitions/module'
import { defineProps, computed, ref, watch, onBeforeUnmount } from 'vue'

const props = defineProps<{
  image: IProcessedImage
  alt?: string
}>()
// refs
const containerRef = ref<HTMLDivElement | null>(null)
const originalImageRef = ref<HTMLImageElement | null>(null)

// 图片尺寸状态
const imageSize = ref<{ width: number; height: number }>({ width: 0, height: 0 })

// 存储图片的 URL
const originalImageUrl = ref<string>('')
const processedImageUrl = ref<string>('')

// 存储创建的 URL 对象，以便在组件卸载时释放
const objectUrls = ref<string[]>([])

// 创建 URL 的函数
const createObjectURL = (file: File | null): string => {
  if (!file) return ''
  const url = URL.createObjectURL(file)
  objectUrls.value.push(url)
  return url
}

// 清除所有创建的 URL
const clearObjectURLs = (): void => {
  objectUrls.value.forEach(url => {
    URL.revokeObjectURL(url)
  })
  objectUrls.value = []
}

// 监听图片变化
watch(
  () => props.image,
  newImage => {
    // 释放之前的 URL
    clearObjectURLs()

    console.log('+++++++++++-------------', newImage)

    // 创建新的 URL
    if (newImage.originalImage) {
      originalImageUrl.value = createObjectURL(newImage.originalImage)
    }

    if (newImage.processedImage) {
      processedImageUrl.value = createObjectURL(newImage.processedImage)
    } else {
      processedImageUrl.value = ''
    }
  },
  { immediate: true, deep: true }
)

// 计算图片样式
const imageStyle = computed(() => {
  if (!containerRef.value || !imageSize.value.width || !imageSize.value.height) {
    return {}
  }

  const containerWidth = containerRef.value.clientWidth
  const containerHeight = containerRef.value.clientHeight
  const maxWidth = containerWidth * 0.6
  const maxHeight = containerHeight * 0.8

  const widthRatio = maxWidth / imageSize.value.width
  const heightRatio = maxHeight / imageSize.value.height
  const scale = Math.min(widthRatio, heightRatio, 1)

  return {
    width: `${imageSize.value.width * scale}px`,
    height: `${imageSize.value.height * scale}px`,
    objectFit: 'contain' as const
  }
})

// 处理图片加载完成事件
const handleImageLoad = (): void => {
  if (originalImageRef.value) {
    imageSize.value = {
      width: originalImageRef.value.naturalWidth,
      height: originalImageRef.value.naturalHeight
    }
  }
}

// 组件卸载时释放所有 URL
onBeforeUnmount(() => {
  clearObjectURLs()
})
</script>

<style lang="less" scoped>
.image-container {
  position: relative;
  overflow: hidden; /* 确保超出容器的内容不可见 */
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.original-image,
.processed-image {
  position: absolute;
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.original-image img,
.processed-image img {
  max-width: 100%;
  max-height: 100%;
}

.original-image img {
  opacity: 1;
  transition: clip-path 1.2s ease;
  will-change: clip-path;
  clip-path: inset(0 0 0 0); /* 初始状态：完全显示 */
}

.original-image.hide-original img {
  clip-path: inset(0 100% 0 0); /* 隐藏状态：从右到左裁剪到0宽度 */
}

.processed-image {
  opacity: 0;
  transition: all 1.2s ease; /* 延长动画时间，与原始图片保持一致 */
  img {
    background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAGUExURb+/v////5nD/3QAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAUSURBVBjTYwABQSCglEENMxgYGAAynwRB8BEAgQAAAABJRU5ErkJggg==');
  }
}

.processed-image.show-processed {
  opacity: 1;
  transform: translateX(0);
}

.loading-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
