<template>
  <div
    class="app-select"
    ref="containerRef"
    :class="{ open: isOpen, disabled, small }"
  >
    <button
      type="button"
      ref="triggerRef"
      class="select-trigger"
      :disabled="disabled"
      @click="toggle"
    >
      <span class="select-value" :class="{ placeholder: !selectedLabel }">
        {{ selectedLabel || placeholder }}
      </span>
      <div class="select-icons">
        <button
          v-if="clearable && modelValue !== '' && modelValue !== null && modelValue !== undefined"
          type="button"
          class="clear-btn"
          @click.stop="clear"
        >
          <AppIcon name="close" :size="11" />
        </button>
        <AppIcon
          name="chevron-down"
          :size="14"
          class="chevron-icon"
          :style="{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }"
        />
      </div>
    </button>

    <Teleport to="body">
      <Transition name="select-drop">
        <div
          v-if="isOpen"
          ref="dropdownRef"
          class="select-dropdown"
          :style="dropdownStyle"
        >
          <div
            v-for="opt in normalizedOptions"
            :key="String(opt.value)"
            class="select-option"
            :class="{ selected: opt.value === modelValue }"
            @click="select(opt.value)"
          >
            <span>{{ opt.label }}</span>
            <AppIcon v-if="opt.value === modelValue" name="check" :size="14" color="var(--accent)" />
          </div>
          <div v-if="!normalizedOptions.length" class="select-empty">Нет вариантов</div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { onClickOutside } from '@vueuse/core'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  modelValue: { default: '' },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'Выберите...' },
  clearable: Boolean,
  disabled: Boolean,
  small: Boolean
})
const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const containerRef = ref(null)
const triggerRef = ref(null)
const dropdownRef = ref(null)

onClickOutside([containerRef, dropdownRef], () => { isOpen.value = false })

const normalizedOptions = computed(() =>
  props.options.map(o => typeof o === 'string' ? { value: o, label: o } : o)
)

const selectedLabel = computed(() => {
  const v = props.modelValue
  if (v === '' || v === null || v === undefined) return ''
  return normalizedOptions.value.find(o => o.value === v)?.label || String(v)
})

const dropdownStyle = ref({})

function calcDropdownPos() {
  if (!triggerRef.value) return
  const rect = triggerRef.value.getBoundingClientRect()
  const viewH = window.innerHeight
  const dropH = Math.min(normalizedOptions.value.length * 40 + 8, 240)
  const spaceBelow = viewH - rect.bottom
  const top = spaceBelow > dropH ? rect.bottom + 4 : rect.top - dropH - 4

  dropdownStyle.value = {
    position: 'fixed',
    top: top + 'px',
    left: rect.left + 'px',
    width: rect.width + 'px',
    zIndex: '9990'
  }
}

function toggle() {
  if (props.disabled) return
  if (!isOpen.value) calcDropdownPos()
  isOpen.value = !isOpen.value
}

function select(value) {
  emit('update:modelValue', value)
  isOpen.value = false
}

function clear() {
  emit('update:modelValue', '')
}

function onScroll() { if (isOpen.value) isOpen.value = false }

onMounted(() => window.addEventListener('scroll', onScroll, true))
onUnmounted(() => window.removeEventListener('scroll', onScroll, true))
</script>

<style scoped>
.app-select { position: relative; width: 100%; }

.select-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px 10px 16px;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text);
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  text-align: left;
  -webkit-tap-highlight-color: transparent;
}
.select-trigger:hover { border-color: var(--accent); }
.app-select.open .select-trigger {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-light);
}
.app-select.disabled .select-trigger { opacity: 0.5; cursor: not-allowed; }

.app-select.small .select-trigger {
  padding: 6px 8px 6px 12px;
  font-size: 12px;
}

.select-value { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.select-value.placeholder { color: var(--text-muted); }

.select-icons { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
.chevron-icon { transition: transform 0.2s ease; color: var(--text-muted); }
.clear-btn {
  display: flex; align-items: center; justify-content: center;
  width: 18px; height: 18px;
  border-radius: 50%; color: var(--text-muted);
  transition: background 0.15s, color 0.15s;
}
.clear-btn:hover { background: var(--border); color: var(--text); }
</style>

<style>
.select-dropdown {
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 32px var(--shadow);
  overflow-y: auto;
  max-height: 240px;
  padding: 4px;
}
.select-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 12px;
  border-radius: calc(var(--radius-md) - 4px);
  font-size: 14px;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
  gap: 8px;
}
.select-option:hover { background: var(--accent-light); }
.select-option.selected { background: var(--accent-light); color: var(--accent); font-weight: 500; }
.select-empty { padding: 12px; text-align: center; color: var(--text-muted); font-size: 13px; }

.select-drop-enter-active, .select-drop-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.select-drop-enter-from, .select-drop-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
