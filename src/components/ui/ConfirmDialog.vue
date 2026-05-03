<template>
  <AppModal :model-value="modelValue" :title="title" width="400px" @update:model-value="$emit('update:modelValue', $event)">
    <p style="color:var(--text-muted)">{{ message }}</p>
    <div v-if="confirmText" class="confirm-input-wrap">
      <p style="margin-top:12px;font-size:13px">Type <strong>{{ confirmText }}</strong> to confirm:</p>
      <input v-model="typed" class="input" style="margin-top:8px" :placeholder="confirmText" />
    </div>
    <template #footer>
      <button class="btn btn-secondary" @click="$emit('update:modelValue', false)">Cancel</button>
      <button class="btn btn-danger" :disabled="confirmText && typed !== confirmText" @click="confirm">{{ actionLabel }}</button>
    </template>
  </AppModal>
</template>

<script setup>
import { ref } from 'vue'
import AppModal from './AppModal.vue'

const props = defineProps({
  modelValue: Boolean,
  title: { default: 'Confirm' },
  message: String,
  actionLabel: { default: 'Delete' },
  confirmText: { default: null }
})
const emit = defineEmits(['update:modelValue', 'confirm'])
const typed = ref('')

function confirm() {
  if (props.confirmText && typed.value !== props.confirmText) return
  emit('confirm')
  emit('update:modelValue', false)
  typed.value = ''
}
</script>
