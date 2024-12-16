<template>
  <div class="camera-feed">
    <div class="camera-container">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg">{{ title }}</h3>
        <el-button-group>
          <el-button size="small" type="primary" :icon="Expand">全屏</el-button>
          <el-button size="small" type="primary" :icon="Camera">截图</el-button>
        </el-button-group>
      </div>
      <div class="video-container">
        <img :src="streamUrl" alt="Camera Feed" class="w-full h-full object-cover" />
        <div class="video-overlay">
          <p class="text-sm">{{ location }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Camera, Expand } from '@element-plus/icons-vue';

defineProps({
  title: String,
  streamUrl: String,
  location: String
});
</script>

<style scoped>
.camera-feed {
  background-color: var(--secondary-color);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid rgba(64, 128, 255, 0.2);
  box-shadow: var(--border-glow);
}

.video-container {
  position: relative;
  aspect-ratio: 16 / 9;
  border-radius: 0.5rem;
  overflow: hidden;
  background-color: rgba(26, 29, 45, 0.5);
  border: 1px solid rgba(64, 128, 255, 0.2);
}

.video-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.5rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  color: var(--text-primary);
}

:deep(.el-button-group) .el-button {
  border-color: rgba(64, 128, 255, 0.4);
}

:deep(.el-button-group) .el-button:hover {
  border-color: var(--accent-color);
}
</style>
