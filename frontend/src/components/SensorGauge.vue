<template>
  <div class="sensor-gauge">
    <div class="flex items-center justify-between mb-2">
      <span class="text-sm text-secondary">{{ title }}</span>
      <span class="text-lg font-bold">{{ value }}{{ unit }}</span>
    </div>
    <el-progress
      :percentage="percentage"
      :color="['#4080ff']"
      :show-text="false"
      :stroke-width="12"
      track-color="rgba(64, 128, 255, 0.1)"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: String,
  value: Number,
  unit: String,
  max: {
    type: Number,
    default: 100
  }
});

const percentage = computed(() => (props.value / props.max) * 100);
</script>

<style scoped>
.sensor-gauge {
  background-color: var(--secondary-color);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
}

:deep(.el-progress-bar__outer) {
  border-radius: 4px;
  background-color: rgba(64, 128, 255, 0.1);
}

:deep(.el-progress-bar__inner) {
  border-radius: 4px;
  transition: all 0.3s ease;
}
</style>
