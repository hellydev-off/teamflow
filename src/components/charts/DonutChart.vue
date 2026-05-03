<template>
  <div class="donut-wrap">
    <div class="donut" :style="{ background: gradient }">
      <div class="donut-hole">
        <div class="donut-center-val">{{ total }}</div>
        <div class="donut-center-label">total</div>
      </div>
    </div>
    <div class="donut-legend">
      <div v-for="seg in segments" :key="seg.label" class="legend-item">
        <span class="legend-dot" :style="{ background: seg.color }"></span>
        <span class="legend-label">{{ seg.label }}</span>
        <span class="legend-val">{{ seg.value }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ segments: Array }) // [{label, value, color}]

const total = computed(() => props.segments.reduce((s, x) => s + x.value, 0))

const gradient = computed(() => {
  if (!total.value) return 'conic-gradient(var(--border) 0deg 360deg)'
  let deg = 0
  const parts = props.segments.map(s => {
    const angle = (s.value / total.value) * 360
    const part = `${s.color} ${deg}deg ${deg + angle}deg`
    deg += angle
    return part
  })
  return `conic-gradient(${parts.join(', ')})`
})
</script>

<style scoped>
.donut-wrap { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; }
.donut {
  width: 140px; height: 140px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.donut-hole {
  width: 90px; height: 90px;
  background: var(--surface);
  border-radius: 50%;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.donut-center-val { font-size: 22px; font-weight: 700; }
.donut-center-label { font-size: 11px; color: var(--text-muted); }
.donut-legend { display: flex; flex-direction: column; gap: 8px; }
.legend-item { display: flex; align-items: center; gap: 8px; font-size: 13px; }
.legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.legend-label { color: var(--text-muted); flex: 1; }
.legend-val { font-weight: 600; }
</style>
