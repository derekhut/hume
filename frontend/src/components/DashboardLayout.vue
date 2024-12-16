<template>
  <div class="min-h-screen bg-primary">
    <div class="dashboard-container">
      <!-- Header -->
      <el-card class="header-card mb-4">
        <div class="flex items-center justify-between px-8 h-16">
          <h1 class="text-2xl font-bold">智能农业监测系统</h1>
          <div class="flex items-center gap-4">
            <span>{{ currentTime }}</span>
          </div>
        </div>
      </el-card>

      <!-- Main Content -->
      <div class="grid grid-cols-12 gap-4 p-4">
        <!-- Left Panel -->
        <div class="col-span-3 space-y-4">
          <el-card class="panel-card h-full">
            <template #header>
              <h2 class="text-lg">环境监测</h2>
            </template>
            <slot name="left-panel"></slot>
          </el-card>
        </div>

        <!-- Center Panel -->
        <div class="col-span-6 space-y-4">
          <el-card class="panel-card h-full">
            <slot name="main-content"></slot>
          </el-card>
        </div>

        <!-- Right Panel -->
        <div class="col-span-3 space-y-4">
          <el-card class="panel-card h-full">
            <template #header>
              <h2 class="text-lg">实时监控</h2>
            </template>
            <slot name="right-panel"></slot>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useIntervalFn } from '@vueuse/core';

const currentTime = ref(new Date().toLocaleString());

useIntervalFn(() => {
  currentTime.value = new Date().toLocaleString();
}, 1000);
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  padding: 1rem;
}

.header-card {
  background-color: var(--secondary-color);
  border: 1px solid rgba(64, 128, 255, 0.2);
}

.panel-card {
  background-color: var(--secondary-color);
  border: 1px solid rgba(64, 128, 255, 0.2);
}

:deep(.el-card) {
  --el-card-border-color: transparent;
  --el-card-bg-color: transparent;
}

:deep(.el-card__header) {
  border-bottom: 1px solid rgba(64, 128, 255, 0.2);
  padding: 0.75rem 1rem;
}
</style>
