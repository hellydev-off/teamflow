<template>
  <label class="app-radio" :class="{ checked: modelValue === value, disabled }">
    <input
      type="radio"
      class="radio-hidden"
      :value="value"
      :checked="modelValue === value"
      :disabled="disabled"
      @change="$emit('update:modelValue', value)"
    />
    <span class="radio-circle">
      <span class="radio-inner"></span>
    </span>
    <span v-if="$slots.default || label" class="radio-label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script setup>
defineProps({
  modelValue: { default: null },
  value: { default: null },
  disabled: Boolean,
  label: String
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.app-radio {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.app-radio.disabled { opacity: 0.4; cursor: not-allowed; }

.radio-hidden {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}

.radio-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--border);
  background: var(--surface);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.app-radio:not(.disabled):hover .radio-circle {
  border-color: var(--accent);
}
.app-radio.checked .radio-circle {
  border-color: var(--accent);
}

.radio-inner {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent);
  transform: scale(0);
  transition: transform 0.2s ease;
}
.app-radio.checked .radio-inner { transform: scale(1); }

.radio-label { font-size: 14px; }
</style>
