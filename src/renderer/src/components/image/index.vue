<template>
  <div class="image-wrapper">
    <div ref="containerRef" class="image-container">
      <!-- 原始图片 -->
      <div
        v-if="originalImageUrl"
        class="original-image"
        :class="{ 'hide-original': processedImageUrl }"
        :style="imageStyle"
      >
        <!-- 加载中遮罩 -->
        <div v-if="!processedImageUrl" class="loading-mask">
          <div class="loading-spinner"></div>
        </div>
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
    </div>

    <!-- 处理图片列表 -->
    <div
      v-if="processedImagesList && processedImagesList.length > 0"
      class="processed-images-list-container"
    >
      <button
        v-show="showScrollButtons"
        class="scroll-button left"
        :disabled="scrollPosition <= 0"
        @click="scrollLeft"
      >
        &lt;
      </button>

      <div ref="listContainerRef" class="processed-images-list" @scroll="handleScroll">
        <div ref="listWrapperRef" class="processed-images-wrapper">
          <div
            v-for="(image, index) in processedImagesList"
            :key="index"
            class="processed-image-item"
            :class="{ active: isActiveImage(image) }"
            @click="selectImage(image)"
          >
            <img :src="getImageUrl(image)" :alt="`处理图片 ${index + 1}`" />
          </div>
        </div>
      </div>

      <button
        v-show="showScrollButtons"
        class="scroll-button right"
        :disabled="scrollPosition >= maxScrollPosition"
        @click="scrollRight"
      >
        &gt;
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { IProcessedImage } from '@renderer/definitions/module'
import { defineProps, defineEmits, computed, ref, watch, onBeforeUnmount, onMounted } from 'vue'

const props = defineProps<{
  image: IProcessedImage
  processedImagesList?: IProcessedImage[] // 处理图片列表
  alt?: string
}>()

const emit = defineEmits<{
  (e: 'select-image', image: IProcessedImage): void
}>()

// refs
const containerRef = ref<HTMLDivElement | null>(null)
const originalImageRef = ref<HTMLImageElement | null>(null)
const listContainerRef = ref<HTMLDivElement | null>(null)
const listWrapperRef = ref<HTMLDivElement | null>(null)

// 图片尺寸状态
const imageSize = ref<{ width: number; height: number }>({ width: 0, height: 0 })

// 存储图片的 URL
const originalImageUrl = ref<string>('')
const processedImageUrl = ref<string>('')

// 存储创建的 URL 对象，以便在组件卸载时释放
const objectUrls = ref<string[]>([])

// 滚动相关状态
const scrollPosition = ref(0)
const maxScrollPosition = ref(0)
const showScrollButtons = ref(false)

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

// 获取图片URL
const getImageUrl = (image: IProcessedImage): string => {
  if (image.processedImage) {
    return createObjectURL(image.processedImage)
  } else if (image.originalImage) {
    return createObjectURL(image.originalImage)
  }
  return ''
}

// 判断是否为当前选中的图片
const isActiveImage = (image: IProcessedImage): boolean => {
  return props.image === image
}

// 选择图片
const selectImage = (image: IProcessedImage): void => {
  emit('select-image', image)
}

// 处理滚动事件
const handleScroll = (): void => {
  if (listContainerRef.value) {
    scrollPosition.value = listContainerRef.value.scrollLeft
  }
}

// 向左滚动
const scrollLeft = (): void => {
  if (listContainerRef.value) {
    listContainerRef.value.scrollBy({ left: -240, behavior: 'smooth' })
  }
}

// 向右滚动
const scrollRight = (): void => {
  if (listContainerRef.value) {
    listContainerRef.value.scrollBy({ left: 240, behavior: 'smooth' })
  }
}

// 更新最大滚动位置
const updateMaxScrollPosition = (): void => {
  if (listContainerRef.value && listWrapperRef.value) {
    const containerWidth = listContainerRef.value.clientWidth
    const contentWidth = listWrapperRef.value.scrollWidth
    maxScrollPosition.value = Math.max(0, contentWidth - containerWidth)
    showScrollButtons.value = contentWidth > containerWidth
  }
}

// 监听图片变化
watch(
  () => props.image,
  newImage => {
    // 释放之前的 URL
    clearObjectURLs()

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

// 监听处理图片列表变化
watch(
  () => props.processedImagesList,
  () => {
    // 在下一个DOM更新周期后更新滚动状态
    setTimeout(() => {
      updateMaxScrollPosition()
    }, 0)
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

// 监听窗口大小变化
const handleResize = (): void => {
  updateMaxScrollPosition()
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  updateMaxScrollPosition()
})

// 组件卸载时释放所有 URL 并移除事件监听
onBeforeUnmount(() => {
  clearObjectURLs()
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="less" scoped>
.image-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  align-items: center;
}

.image-container {
  position: relative;
  overflow: hidden; /* 确保超出容器的内容不可见 */
  width: 100%;
  height: calc(100% - 180px); /* 减去列表高度 */
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
  justify-content: center;
  align-items: center;
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

.original-image {
  z-index: 2;
}

.original-image.hide-original img {
  clip-path: inset(0 100% 0 0); /* 隐藏状态：从右到左裁剪到0宽度 */
}

.processed-image {
  z-index: 1;
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

/* 处理图片列表样式 */
.processed-images-list-container {
  position: relative;
  display: flex;
  align-items: center;
  width: 80%;
  max-width: 80%;
  height: 180px;
  margin-top: 10px;
}

.processed-images-list {
  width: 100%;
  height: 80px;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
}

.processed-images-wrapper {
  display: inline-flex;
  height: 100%;
}

.processed-image-item {
  width: 80px;
  height: 80px;
  margin-right: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;

  &:hover {
    border-color: #aaa;
  }

  &.active {
    border-color: #1890ff;
  }

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
}

.scroll-button {
  position: absolute;
  width: 30px;
  height: 30px;
  background-color: rgba(255, 255, 255, 0.8);
  border: 1px solid #ddd;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 10;
  font-weight: bold;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.left {
    left: -15px;
  }

  &.right {
    right: -15px;
  }
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
