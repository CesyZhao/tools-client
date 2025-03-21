<template>
  <a-tooltip
    content-class="themed-tooltip"
    arrow-class="themed-tooltip"
    mini
    v-bind="{ ...$props }"
  >
    <slot />
  </a-tooltip>
</template>

<style lang="less">
.themed-tooltip {
  background-color: var(--color-neutral-2);
  color: var(--color-text-1);
}
</style>
