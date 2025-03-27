<script setup lang="ts">
import { onMounted, ref } from 'vue'

// const emit = defineEmits(['env-ready'])

const currentStep = ref(0)
const steps = ref([
  {
    title: '基础环境',
    description: '等待检查',
    status: 'wait',
    loading: false
  },
  {
    title: '必要依赖',
    description: '等待检查',
    status: 'wait',
    loading: false
  },
  {
    title: '系统配置',
    description: '等待完成',
    status: 'wait',
    loading: false
  }
])

const checkEnv = (): void => {}

onMounted(() => {
  checkEnv()
})
</script>

<template>
  <div class="env-checker">
    <a-steps :current="currentStep + 1" :status="steps[currentStep].status">
      <a-step v-for="(step, index) in steps" :key="index">
        <template #icon>
          <div class="step-icon">
            <icon-loading v-if="step.loading" />
            <icon-check v-else-if="step.status === 'finish'" class="success-icon" />
            <icon-close v-else-if="step.status === 'error'" class="error-icon" />
            <icon-minus v-else class="wait-icon" />
          </div>
        </template>
        <template #description>
          <span
            :class="{
              'error-text': step.status === 'error',
              'success-text': step.status === 'finish',
              'active-text': step.status === 'process'
            }"
          >
            {{ step.description }}
          </span>
        </template>
        {{ step.title }}
      </a-step>
    </a-steps>
  </div>
</template>

<style scoped>
.env-checker {
  padding: 32px;
  width: 90vw;
  margin: 0 auto;
}

.active-text {
  color: rgb(var(--primary-6));
}

.success-text {
  color: rgb(var(--success-6));
}

:deep(.arco-steps-item-finish .arco-steps-icon) {
  background-color: rgb(var(--success-6));
  color: var(--color-white);
}

:deep(
  .arco-steps-label-horizontal .arco-steps-item.arco-steps-item-finish .arco-steps-item-title::after
) {
  background-color: rgb(var(--success-6));
}

:deep(
  .arco-steps-label-horizontal
    .arco-steps-item.arco-steps-item-next-error
    .arco-steps-item-title::after
) {
  background-color: rgb(var(--danger-6)) !important;
}

.error-text {
  color: rgb(var(--danger-6));
}

.actions {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}
</style>
