<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="overlay" @mousedown.self="$emit('update:modelValue', false)">
        <div class="modal" :style="{ '--modal-width': width }">
          <div class="modal-header">
            <h3>{{ title }}</h3>
            <button class="btn btn-icon btn-ghost close-x" @click="$emit('update:modelValue', false)">
              <AppIcon name="close" :size="18" />
            </button>
          </div>
          <div class="modal-body">
            <slot />
          </div>
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import AppIcon from './AppIcon.vue'
defineProps({ modelValue: Boolean, title: String, width: { default: '480px' } })
defineEmits(['update:modelValue'])
</script>

<style scoped>
.modal {
  width: var(--modal-width, 480px);
  max-width: calc(100vw - 32px);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.close-x { color: var(--text-muted); }
.modal-body { padding: 24px; overflow-y: auto; flex: 1; }
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 24px;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}

/* Mobile sheet */
@media (max-width: 768px) {
  .overlay { align-items: flex-end; padding: 0; }
  .modal {
    width: 100vw;
    max-width: 100vw;
    max-height: 90vh;
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  }
}
</style>

<style>
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

@media (max-width: 768px) {
  .modal-fade-enter-active .modal, .modal-fade-leave-active .modal {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .modal-fade-enter-from .modal, .modal-fade-leave-to .modal {
    transform: translateY(100%);
  }
}
</style>
