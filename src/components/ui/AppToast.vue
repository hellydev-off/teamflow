<template>
  <Teleport to="body">
    <div id="toast-container">
      <TransitionGroup name="toast">
        <div v-for="toast in toasts" :key="toast.id" class="toast" :class="toast.type">
          <AppIcon :name="iconMap[toast.type]" :size="16" :color="colorMap[toast.type]" class="toast-icon" />
          <span>{{ toast.message }}</span>
          <button class="toast-close" @click="remove(toast.id)">
            <AppIcon name="close" :size="14" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import AppIcon from './AppIcon.vue'

const toasts = ref([])
let counter = 0

const iconMap = { success: 'check', error: 'close', warning: 'alert', info: 'info' }
const colorMap = { success: 'var(--success)', error: 'var(--danger)', warning: 'var(--warning)', info: 'var(--info)' }

function add(message, type = 'info', duration = 3000) {
  const id = ++counter
  toasts.value.push({ id, message, type })
  setTimeout(() => remove(id), duration)
  return id
}
function remove(id) { toasts.value = toasts.value.filter(t => t.id !== id) }

window.$toast = {
  add,
  success: m => add(m, 'success'),
  error: m => add(m, 'error'),
  info: m => add(m, 'info'),
  warning: m => add(m, 'warning')
}
</script>

<style scoped>
.toast {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 24px var(--shadow);
  min-width: 280px; max-width: 380px;
  font-size: 13px;
}
.toast.success { border-left: 3px solid var(--success); }
.toast.error { border-left: 3px solid var(--danger); }
.toast.warning { border-left: 3px solid var(--warning); }
.toast.info { border-left: 3px solid var(--info); }
.toast-icon { flex-shrink: 0; }
.toast-close { margin-left: auto; opacity: 0.5; padding: 0; display: flex; }
.toast-close:hover { opacity: 1; }
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { transform: translateX(100%); opacity: 0; }
</style>
