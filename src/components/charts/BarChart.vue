<template>
  <div class="bar-chart">
    <div class="bars">
      <div v-for="bar in bars" :key="bar.label" class="bar-col">
        <div class="bar-track">
          <div class="bar-fill" :style="{ height: barHeight(bar.value) + '%', background: color }"></div>
        </div>
        <div class="bar-label">{{ bar.label }}</div>
        <div class="bar-val">{{ bar.value }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  bars: Array, // [{label, value}]
  color: { default: 'var(--accent)' }
})

const max = computed(() => Math.max(...props.bars.map(b => b.value), 1))

function barHeight(val) {
  return Math.round((val / max.value) * 100)
}
</script>

<style scoped>
.bar-chart { width: 100%; }
.bars { display: flex; align-items: flex-end; gap: 8px; height: 120px; }
.bar-col { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; height: 100%; }
.bar-track {
  flex: 1; width: 100%; display: flex; flex-direction: column;
  justify-content: flex-end;
  background: var(--surface-2);
  border-radius: 4px 4px 0 0;
  overflow: hidden;
  min-height: 4px;
}
.bar-fill { border-radius: 4px 4px 0 0; transition: height 0.4s ease; width: 100%; }
.bar-label { font-size: 11px; color: var(--text-muted); }
.bar-val { font-size: 11px; font-weight: 600; }
</style>
