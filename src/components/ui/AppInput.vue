<template>
  <div
    class="app-input-wrap"
    :class="[{ 'has-prefix': $slots.prefix, 'has-suffix': $slots.suffix, 'is-error': error, 'is-disabled': disabled }, wrapClass]"
  >
    <div v-if="$slots.prefix" class="input-prefix">
      <slot name="prefix" />
    </div>
    <textarea
      v-if="type === 'textarea'"
      class="app-input"
      v-bind="inputAttrs"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <input
      v-else
      class="app-input"
      v-bind="inputAttrs"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <div v-if="$slots.suffix" class="input-suffix">
      <slot name="suffix" />
    </div>
  </div>
</template>

<script setup>
import { useAttrs, computed } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue: { default: '' },
  type: { type: String, default: 'text' },
  placeholder: String,
  disabled: Boolean,
  readonly: Boolean,
  error: Boolean,
  wrapClass: String
})
defineEmits(['update:modelValue'])

const attrs = useAttrs()
const inputAttrs = computed(() => {
  const { class: _, style: __, ...rest } = attrs
  return rest
})
</script>

<style scoped>
.app-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}
.input-prefix {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  pointer-events: none;
  z-index: 1;
}
.input-suffix {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  z-index: 1;
}
.app-input {
  width: 100%;
  padding: 10px 16px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  color: var(--text);
  font-family: inherit;
  font-size: 14px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}
.app-input::placeholder { color: var(--text-muted); }
.app-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-light);
}
.is-error .app-input {
  border-color: var(--danger);
  box-shadow: 0 0 0 3px rgba(239,68,68,0.15);
}
.is-disabled .app-input { opacity: 0.5; cursor: not-allowed; }
.has-prefix .app-input { padding-left: 40px; }
.has-suffix .app-input { padding-right: 40px; }
textarea.app-input {
  resize: vertical;
  min-height: 100px;
  align-self: stretch;
}
.app-input-wrap:has(textarea) { align-items: flex-start; }
.app-input-wrap:has(textarea) .input-prefix { top: 12px; transform: none; }
</style>
