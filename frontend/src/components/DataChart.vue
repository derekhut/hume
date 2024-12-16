<template>
  <div class="data-chart">
    <div class="chart-container">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg">{{ title }}</h3>
        <div class="flex gap-2">
          <el-select v-model="selectedPeriod" size="small" class="w-24">
            <el-option label="24h" value="24h" />
            <el-option label="7d" value="7d" />
            <el-option label="30d" value="30d" />
          </el-select>
        </div>
      </div>
      <v-chart class="chart" :option="chartOption" autoresize />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  title: String,
  data: {
    type: Array,
    default: () => []
  }
});

const selectedPeriod = ref('24h');

const chartOption = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(26, 29, 45, 0.9)',
    borderColor: 'rgba(64, 128, 255, 0.2)',
    textStyle: {
      color: '#ffffff'
    }
  },
  grid: {
    top: 40,
    bottom: 40,
    left: 60,
    right: 40,
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    axisLine: {
      lineStyle: {
        color: '#a0aec0'
      }
    },
    axisTick: {
      show: false
    }
  },
  yAxis: {
    type: 'value',
    axisLine: {
      show: false
    },
    axisTick: {
      show: false
    },
    splitLine: {
      lineStyle: {
        color: 'rgba(160, 174, 192, 0.1)'
      }
    },
    axisLabel: {
      color: '#a0aec0'
    }
  },
  series: [
    {
      type: 'line',
      data: [30, 40, 35, 50, 45, 40],
      smooth: true,
      symbol: 'none',
      lineStyle: {
        color: '#4080ff',
        width: 3
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(64,128,255,0.2)' },
            { offset: 1, color: 'rgba(64,128,255,0)' }
          ]
        }
      }
    }
  ]
}));
</script>

<style scoped>
.data-chart {
  background-color: var(--secondary-color);
  border-radius: 0.5rem;
  padding: 1rem;
}

.chart-container {
  width: 100%;
}

.chart {
  height: 300px;
}

:deep(.el-select) {
  --el-select-border-color-hover: var(--accent-color);
  --el-select-input-focus-border-color: var(--accent-color);
}

:deep(.el-select .el-input__wrapper) {
  background-color: var(--primary-color);
  box-shadow: none;
  border: 1px solid rgba(64, 128, 255, 0.2);
}

:deep(.el-select .el-input__wrapper:hover) {
  border-color: var(--accent-color);
}
</style>
