<template>
  <div class="env-checker">
    <div ref="stepsContainerRef" class="steps-container">
      <div
        v-for="step in sortedSteps"
        :key="step.id"
        :ref="
          el => {
            if (currentStepIndex === step.originalIndex) currentStepRef = el
          }
        "
        class="step-item"
        :class="{
          'current-step': currentStepIndex === step.originalIndex,
          'completed-step': step.status === 'finish',
          'error-step': step.status === 'error'
        }"
      >
        <div class="step-icon-container">
          <div
            class="step-icon"
            :class="{
              active: currentStepIndex === step.originalIndex,
              completed: step.status === 'finish',
              error: step.status === 'error'
            }"
          >
            <icon-loading v-if="step.loading" />
            <icon-check v-else-if="step.status === 'finish'" />
            <icon-close v-else-if="step.status === 'error'" />
            <icon-sync v-else-if="currentStepIndex === step.originalIndex" />
            <icon-minus v-else />
          </div>
        </div>
        <div class="step-content">
          <div
            class="step-title"
            :class="{ 'current-title': currentStepIndex === step.originalIndex }"
          >
            {{ step.title }}
          </div>
          <div
            class="step-description"
            :class="{
              'error-text': step.status === 'error',
              'success-text': step.status === 'finish',
              'active-text': currentStepIndex === step.originalIndex
            }"
          >
            {{ step.description }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import Bridge from '../../ipc/Bridge'
import { MenuModelMap, ModelStatus } from '../../../../common/definitions/model'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const emit = defineEmits(['env-ready'])

const bridge = new Bridge()
const envModule = bridge.getModule('environment')
const settingModule = bridge.getModule('setting') // 添加 settingModule

const currentStepIndex = ref(0)
const stepsContainerRef = ref<HTMLElement | null>(null)
const currentStepRef = ref<HTMLElement | null>(null)

// 监听当前步骤变化，滚动到中间
watch(currentStepIndex, () => {
  setTimeout(() => {
    if (currentStepRef.value && stepsContainerRef.value) {
      const container = stepsContainerRef.value
      const element = currentStepRef.value

      const containerHeight = container.clientHeight
      const elementTop = element.offsetTop
      const elementHeight = element.clientHeight

      // 计算滚动位置，使当前步骤位于容器中间
      const scrollTo = elementTop - containerHeight / 2 + elementHeight / 2

      container.scrollTo({
        top: scrollTo,
        behavior: 'smooth'
      })
    }
  }, 100)
})

const steps = ref([
  {
    id: 'environment',
    originalIndex: 0,
    title: t('entry.steps.environment.title'),
    description: t('entry.steps.environment.waiting'),
    status: 'wait',
    loading: false
  },
  {
    id: 'dependencies',
    originalIndex: 1,
    title: t('entry.steps.dependencies.title'),
    description: t('entry.steps.dependencies.waiting'),
    status: 'wait',
    loading: false
  },
  {
    id: 'config',
    originalIndex: 2,
    title: t('entry.steps.config.title'),
    description: t('entry.steps.config.waiting'),
    status: 'wait',
    loading: false
  }
])

// 根据步骤状态排序：已完成的在上方，当前的在中间，未完成的在下方
const sortedSteps = computed(() => {
  return [...steps.value].sort((a, b) => {
    // 当前步骤始终在中间
    if (a.originalIndex === currentStepIndex.value) return 0
    if (b.originalIndex === currentStepIndex.value) return 0

    // 已完成的步骤在上方
    if (a.status === 'finish' && b.status !== 'finish') return -1
    if (a.status !== 'finish' && b.status === 'finish') return 1

    // 未完成的步骤按原始顺序排列
    return a.originalIndex - b.originalIndex
  })
})

// WebGPU 支持状态
const webGPUSupported = ref(false)

/**
 * 检查 WebGPU 支持情况
 */
const checkWebGPU = async (): Promise<boolean> => {
  steps.value[0].loading = true
  steps.value[0].status = 'process'
  steps.value[0].description = t('entry.steps.environment.checking')

  try {
    if (!navigator.gpu) {
      steps.value[0].status = 'error'
      steps.value[0].description = t('entry.steps.environment.notSupported')
      steps.value[0].loading = false
      return false
    }

    const adapter = await navigator.gpu.requestAdapter()
    const supported = !!adapter

    steps.value[0].status = 'finish'
    steps.value[0].description = t('entry.steps.environment.finished')

    steps.value[0].loading = false
    return supported
  } catch (error) {
    console.error('WebGPU 检测失败:', error)
    steps.value[0].status = 'error'
    steps.value[0].description = t('entry.steps.environment.checkFailed')
    steps.value[0].loading = false
    return false
  }
}

/**
 * 检查模型下载情况
 */
const checkModels = async (): Promise<void> => {
  steps.value[1].loading = true
  steps.value[1].status = 'process'
  steps.value[1].description = t('entry.steps.dependencies.checking')

  try {
    // 获取所有需要的模型列表
    const allModels: ModelStatus[] = []
    // 从 setting 中获取 GPU 支持情况
    const enableGPU = await settingModule.get('enableGPU', true)
    const useGPU = webGPUSupported.value && enableGPU

    for (const [menuKey, models] of MenuModelMap.entries()) {
      const modelList = {
        menuKey,
        modelKey: useGPU ? models[0] : models[1],
        download: false
      }
      allModels.push(modelList)
    }

    // 去重
    const uniqueModels = [...new Set(allModels)]

    console.log('uniqueModels', uniqueModels)

    // 检查模型下载情况
    const status = await envModule.checkModels(uniqueModels)

    console.log('result', status)

    localStorage.setItem('modelStatusList', JSON.stringify(status))

    steps.value[1].status = 'finish'
    steps.value[1].description = t('entry.steps.dependencies.finished')

    steps.value[1].loading = false
  } catch (error) {
    console.error('模型检测失败:', error)
    steps.value[1].status = 'error'
    steps.value[1].description = t('entry.steps.dependencies.checkFailed')
    steps.value[1].loading = false
  }
}

/**
 * 检查系统配置
 */
const checkSystemConfig = async (): Promise<void> => {
  steps.value[2].loading = true
  steps.value[2].status = 'process'
  steps.value[2].description = t('entry.steps.config.checking')

  try {
    // 这里可以添加系统配置检查逻辑
    // 例如检查存储路径是否可写等

    // 模拟检查成功
    setTimeout(() => {
      steps.value[2].status = 'finish'
      steps.value[2].description = t('entry.steps.config.normal')
      steps.value[2].loading = false

      emit('env-ready')
    }, 1000)
  } catch (error) {
    console.error('系统配置检查失败:', error)
    steps.value[2].status = 'error'
    steps.value[2].description = t('entry.steps.config.checkFailed')
    steps.value[2].loading = false
  }
}

/**
 * 执行环境检查
 */
const checkEnv = async (): Promise<void> => {
  try {
    // 第一步：检查 WebGPU
    currentStepIndex.value = 0
    webGPUSupported.value = await checkWebGPU()

    // 如果系统不支持 WebGPU 但设置中启用了 GPU，则自动禁用 GPU
    const currentEnableGPU = await settingModule.get('enableGPU', true)
    if (!webGPUSupported.value && currentEnableGPU) {
      await settingModule.set('enableGPU', false)
    }

    // 第二步：检查模型
    currentStepIndex.value = 1
    await checkModels()

    // 第三步：检查系统配置
    currentStepIndex.value = 2
    await checkSystemConfig()
  } catch (error) {
    console.error('环境检查失败:', error)
  }
}

onMounted(() => {
  checkEnv()
})
</script>

<style scoped>
.env-checker {
  padding: 32px;
  width: 90vw;
  height: 100%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.steps-container {
  position: relative;
  width: 200px;
  padding: 20px 0;
  max-height: 400px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.steps-container::-webkit-scrollbar {
  width: 6px;
}

.steps-container::-webkit-scrollbar-thumb {
  background-color: var(--color-neutral-3);
  border-radius: 3px;
}

.steps-container::-webkit-scrollbar-track {
  background-color: var(--color-fill-1);
}

.step-item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  padding: 8px;
  border-radius: 8px;
}

.completed-step .step-icon-container {
  animation: pulse 0.5s ease-in-out;
}

.step-icon-container {
  width: 28px;
  height: 28px;
  margin-right: 16px;
  position: relative;
  z-index: 1;
  flex-shrink: 0;
}

.step-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: var(--color-neutral-3);
  color: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.3s ease;
}

.step-icon.active {
  background-color: rgb(var(--primary-6));
  box-shadow: 0 0 0 4px rgba(var(--primary-6), 0.2);
}

.step-icon.completed {
  background-color: rgb(var(--success-6));
}

.step-icon.error {
  background-color: rgb(var(--danger-6));
}

.step-content {
  flex: 1;
}

.step-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
  transition: all 0.3s ease;
  color: var(--color-text-2);
}

.current-title {
  font-size: 18px;
  font-weight: 600;
}

.step-description {
  font-size: 14px;
  color: var(--color-text-3);
  transition: all 0.3s ease;
}

.active-text {
  color: rgb(var(--primary-6));
}

.success-text {
  color: rgb(var(--success-6));
}

.error-text {
  color: rgb(var(--danger-6));
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
</style>
