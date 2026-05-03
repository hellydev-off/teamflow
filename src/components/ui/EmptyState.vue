<template>
  <div class="empty-state">
    <div class="empty-icon">
      <AppIcon :name="icon" :size="32" color="var(--accent)" />
    </div>
    <h3>{{ heading }}</h3>
    <p v-if="subtext">{{ subtext }}</p>
    <button v-if="action" class="btn btn-primary" @click="$emit('action')">{{ action }}</button>
  </div>
</template>

<script setup>
import AppIcon from './AppIcon.vue'
defineProps({ icon: { default: 'tasks' }, heading: String, subtext: String, action: { default: null } })
defineEmits(['action'])
</script>

<style scoped>
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 12px; padding: 40px 24px; text-align: center;
}
.empty-icon {
  width: 68px; height: 68px;
  background: var(--accent-light);
  border-radius: var(--radius-lg);
  display: flex; align-items: center; justify-content: center;
}
.empty-state h3 { color: var(--text); font-size: 15px; }
.empty-state p { color: var(--text-muted); max-width: 280px; font-size: 13px; }
</style>
