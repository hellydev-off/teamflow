<template>
  <div class="progress-bar-track">
    <div class="progress-bar-fill" :style="{ width: pct + '%', background: color }"></div>
  </div>
</template>

<script setup>
defineProps({ pct: { default: 0 }, color: { default: 'var(--accent)' } })
</script>
