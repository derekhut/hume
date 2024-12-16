<script setup>
import { ref } from 'vue';
import DashboardLayout from './components/DashboardLayout.vue';
import SensorGauge from './components/SensorGauge.vue';
import DataChart from './components/DataChart.vue';
import CameraFeed from './components/CameraFeed.vue';

const sensors = ref([
  { id: 1, name: '土壤湿度', value: 65, unit: '%' },
  { id: 2, name: '空气温度', value: 25, unit: '°C' },
  { id: 3, name: '光照强度', value: 850, unit: 'Lux' },
  { id: 4, name: 'CO2浓度', value: 450, unit: 'ppm' }
]);

const cameras = ref([
  { id: 'AB9831171', title: '温室1号', location: '东区大棚', url: 'https://example.com/stream1' },
  { id: 'AC0174303', title: '温室2号', location: '西区大棚', url: 'https://example.com/stream2' }
]);
</script>

<template>
  <DashboardLayout>
    <template #left-panel>
      <div class="space-y-4">
        <SensorGauge
          v-for="sensor in sensors"
          :key="sensor.id"
          :title="sensor.name"
          :value="sensor.value"
          :unit="sensor.unit"
        />
      </div>
    </template>

    <template #main-content>
      <div class="space-y-4">
        <h2 class="text-xl mb-4">实时数据监测</h2>
        <div class="grid grid-cols-2 gap-4">
          <DataChart title="温度变化趋势" />
          <DataChart title="湿度变化趋势" />
          <DataChart title="光照强度趋势" />
          <DataChart title="CO2浓度趋势" />
        </div>
      </div>
    </template>

    <template #right-panel>
      <div class="space-y-4">
        <CameraFeed
          v-for="camera in cameras"
          :key="camera.id"
          :title="camera.title"
          :stream-url="camera.url"
          :location="camera.location"
        />
      </div>
    </template>
  </DashboardLayout>
</template>

<style>
:root {
  --primary-color: #1a1d2d;
  --secondary-color: #232838;
  --accent-color: #4080ff;
  --text-primary: #ffffff;
  --text-secondary: #a0aec0;
}

body {
  background-color: var(--primary-color);
  color: var(--text-primary);
  font-family: system-ui, -apple-system, sans-serif;
}
</style>
