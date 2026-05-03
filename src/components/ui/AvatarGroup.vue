<template>
  <div class="avatar-group">
    <div
      v-for="user in visible"
      :key="user.id"
      class="avatar avatar-sm"
      :style="{ background: user.color }"
      :title="user.name"
    >{{ initials(user.name) }}</div>
    <div v-if="extra > 0" class="avatar avatar-sm extra">+{{ extra }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ users: Array, max: { default: 4 } })

const visible = computed(() => props.users.slice(0, props.max))
const extra = computed(() => Math.max(0, props.users.length - props.max))

function initials(name) {
  return name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'
}
</script>

<style scoped>
.avatar-group { display: flex; }
.avatar-group .avatar { margin-left: -8px; }
.avatar-group .avatar:first-child { margin-left: 0; }
.extra { background: var(--surface-2) !important; color: var(--text-muted) !important; border: 2px solid var(--border); font-size: 9px; }
</style>
