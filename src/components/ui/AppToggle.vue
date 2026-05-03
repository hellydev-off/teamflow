<template>
  <button
    type="button"
    class="app-toggle"
    :class="{ on: modelValue }"
    role="switch"
    :aria-checked="modelValue"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <span class="toggle-track">
      <span class="toggle-thumb"></span>
    </span>
  </button>
</template>

<script setup>
defineProps({ modelValue: Boolean })
defineEmits(['update:modelValue'])
</script>

<style scoped>
.app-toggle {
  display: inline-flex;
  align-items: center;
  padding: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.toggle-track {
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: var(--border);
  position: relative;
  transition: background 0.25s ease;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.app-toggle.on .toggle-track { background: var(--accent); }
.toggle-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  position: absolute;
  left: 3px;
  transition: transform 0.25s ease;
  box-shadow: 0 1px 4px rgba(0,0,0,0.25);
}
.app-toggle.on .toggle-thumb { transform: translateX(20px); }
</style>
