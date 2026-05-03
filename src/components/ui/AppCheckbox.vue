<template>
  <label class="app-checkbox" :class="{ disabled, checked: modelValue }">
    <input
      type="checkbox"
      class="checkbox-hidden"
      :checked="modelValue"
      :disabled="disabled"
      @change="$emit('update:modelValue', $event.target.checked)"
    />
    <span class="checkbox-box">
      <svg class="checkmark" viewBox="0 0 12 10" fill="none">
        <polyline
          class="check-path"
          points="1,5 4,9 11,1"
          stroke="white"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>
    <span v-if="$slots.default || label" class="checkbox-label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script setup>
defineProps({
  modelValue: Boolean,
  disabled: Boolean,
  label: String
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.app-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.app-checkbox.disabled { opacity: 0.4; cursor: not-allowed; }

.checkbox-hidden {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}

.checkbox-box {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 2px solid var(--border);
  background: var(--surface);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
}
.app-checkbox:not(.disabled):hover .checkbox-box {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-light);
}
.app-checkbox.checked .checkbox-box {
  background: var(--accent-gradient);
  border-color: transparent;
}

.checkmark {
  width: 12px;
  height: 10px;
  overflow: visible;
}
.check-path {
  stroke-dasharray: 18;
  stroke-dashoffset: 18;
  animation: draw-check 0.2s ease forwards;
}
@keyframes draw-check {
  to { stroke-dashoffset: 0; }
}

.checkbox-label { font-size: 14px; }
</style>
