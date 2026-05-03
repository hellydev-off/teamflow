<template>
  <div class="hbar-chart">
    <div v-for="bar in bars" :key="bar.label" class="hbar-row">
      <div class="hbar-label">{{ bar.label }}</div>
      <div class="hbar-track">
        <div
          class="hbar-fill"
          :style="{ width: pct(bar.value) + '%', background: bar.color || color }"
        ></div>
      </div>
      <div class="hbar-val">{{ bar.value }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  bars: Array, // [{label, value, color?}]
  color: { default: 'var(--accent)' }
})

const max = computed(() => Math.max(...props.bars.map(b => b.value), 1))
function pct(v) { return Math.round((v / max.value) * 100) }
</script>

<style scoped>
.hbar-chart { display: flex; flex-direction: column; gap: 10px; }
.hbar-row { display: flex; align-items: center; gap: 12px; }
.hbar-label { width: 120px; font-size: 13px; color: var(--text-muted); text-align: right; flex-shrink: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hbar-track { flex: 1; height: 10px; background: var(--surface-2); border-radius: 99px; overflow: hidden; }
.hbar-fill { height: 100%; border-radius: 99px; transition: width 0.4s ease; }
.hbar-val { width: 36px; font-size: 12px; font-weight: 600; text-align: right; }
</style>
