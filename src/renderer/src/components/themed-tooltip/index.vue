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
  background-color: var(--bg-color-1);
  color: var(--text-color);
}
</style>
