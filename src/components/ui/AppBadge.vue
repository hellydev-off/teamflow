<template>
  <span class="badge" :class="cls">{{ label }}</span>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ role: String, status: String, label: String })
const cls = computed(() => {
  if (props.role) return `badge-${props.role}`
  if (props.status) return `status-badge ${props.status}`
  return ''
})
</script>
