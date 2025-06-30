<template>
  <div class="image-wrapper">
    <div v-if="image.processedImage" class="tools">
      <i class="iconfont icon-suoxiao" @click="zoomOut"></i>
      <i class="iconfont icon-fangda" @click="zoomIn"></i>
      <i class="iconfont icon-ico-quchubeijing"></i>
      <i class="iconfont icon-undo"></i>
      <i class="iconfont icon-redo"></i>
      <i class="iconfont icon-download"></i>
    </div>
    <div ref="containerRef" class="image-container">
      <!-- 原始图片 -->
      <div
        v-if="originalImageUrl && !backgroundRemoved"
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
        <img
          :src="processedImageUrl"
          :alt="alt"
          :style="imageScale"
          draggable="false"
          @mousedown="startDrag"
          @mouseup="stopDrag"
          @mousemove="drag"
        />
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
        <i class="iconfont icon-left"></i>
      </button>

      <div ref="listContainerRef" class="processed-images-list" @scroll="handleScroll">
        <div ref="listWrapperRef" class="processed-images-wrapper">
          <div class="processed-image-item add-icon" @click="addImage">
            <i class="iconfont icon-tianjia"></i>
          </div>
          <div
            v-for="img in processedImagesList"
            :key="img.id"
            class="processed-image-item"
            :class="{ active: isActiveImage(img) }"
            @click="selectImage(img)"
          >
            <img :src="getImageUrl(img)" :alt="`处理图片 ${img.id}`" />
          </div>
        </div>
      </div>

      <button
        v-show="showScrollButtons"
        class="scroll-button right"
        :disabled="scrollPosition >= maxScrollPosition"
        @click="scrollRight"
      >
        <i class="iconfont icon-right"></i>
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
  (e: 'add-image', force: boolean): void
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
  return createObjectURL(image.originalImage)
}

// 判断是否为当前选中的图片
const isActiveImage = (image: IProcessedImage): boolean => {
  return props.image.id === image.id
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

const backgroundRemoved = ref(false)
const currentScale = ref(1)

// 监听图片变化
watch(
  () => props.image,
  newImage => {
    // 释放之前的 URL
    clearObjectURLs()

    backgroundRemoved.value = false
    currentScale.value = 1

    // 创建新的 URL
    if (newImage.originalImage) {
      originalImageUrl.value = createObjectURL(newImage.originalImage)
    }

    if (newImage.processedImage) {
      processedImageUrl.value = createObjectURL(newImage.processedImage)
      setTimeout(() => {
        backgroundRemoved.value = true
      }, 2000)
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

// 添加图片
const addImage = (): void => {
  emit('add-image', true)
}

const currentPosition = ref({ x: 0, y: 0 })
const isDragging = ref(false)

const imageScale = computed(() => {
  return {
    transform: `scale(${currentScale.value})`,
    ...currentPosition
  }
})

const zoomOut = (): void => {
  currentScale.value *= 0.9
}

const zoomIn = (): void => {
  currentScale.value *= 1.1
}

const startDrag = (): void => {
  isDragging.value = true
}

const stopDrag = (): void => {
  isDragging.value = false
}

const drag = (event: MouseEvent): void => {
  if (isDragging.value) {
    const deltaX = event.clientX - currentPosition.value.x
    const deltaY = event.clientY - currentPosition.value.y
    currentPosition.value = { x: deltaX, y: deltaY }
  }
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
  height: calc(100% - 100px); /* 减去列表高度 */
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

.original-image:not(.hide-original) img {
  transition: none;
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
  background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAGUExURb+/v////5nD/3QAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAUSURBVBjTYwABQSCglEENMxgYGAAynwRB8BEAgQAAAABJRU5ErkJggg==');
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
  height: 64px;
  margin-top: 10px;
}

.processed-images-list {
  width: 100%;
  height: 64px;
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
  width: 64px;
  height: 64px;
  margin-right: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  background: linear-gradient(257deg, rgba(102, 218, 255, 0.1) 0%, rgba(78, 110, 242, 0.1) 100%);

  &.add-icon {
    border: 1px solid var(--color-theme-2);
    background: linear-gradient(257deg, rgba(102, 218, 255, 0.1) 0%, rgba(78, 110, 242, 0.1) 100%);
  }

  &.active {
    border: 1px solid var(--color-theme-2);
  }

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .icon-plus {
    font-size: 24px;
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

.dark :deep(.processed-image img) {
  background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAClJREFUOE9jZGBg+M+AH5jgk2YcNYBhmISBMYF0cIZQOhg1gIFhiIcBAHBaEaElKspWAAAAAElFTkSuQmCC');
}

.tools {
  position: absolute;
  right: 16px;
  top: 8px;
  z-index: 3;
  i {
    margin: 0 8px;
    cursor: pointer;
  }
}
</style>
