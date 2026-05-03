<template>
  <div
    class="task-card card"
    :class="['priority-border-' + task.priority, { dragging: isDragging }]"
    :draggable="canDrag"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
    @touchstart.passive="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
    @click="$emit('open', task)"
  >
    <div class="task-header">
      <AppIcon v-if="canDrag" name="drag" :size="14" color="var(--text-muted)" class="drag-handle" />
      <div class="task-title">{{ task.title }}</div>
    </div>
    <div class="task-tags">
      <span v-for="tag in task.tags.slice(0, 2)" :key="tag" class="tag-chip">{{ tag }}</span>
    </div>
    <div class="task-bottom">
      <div v-if="assignee" class="avatar avatar-sm" :style="{ background: assignee.color }" :title="assignee.name">
        {{ initials(assignee.name) }}
      </div>
      <div v-if="task.deadline" class="deadline" :class="{ overdue: isOverdue(task.deadline) }">
        <AppIcon name="calendar" :size="11" />
        {{ formatDate(task.deadline) }}
      </div>
      <div class="priority-icon">
        <AppIcon :name="`priority-${task.priority}`" :size="14" :color="priorityColor(task.priority)" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTeamStore } from '../../stores/team.js'
import { useAuthStore } from '../../stores/auth.js'
import { formatDate, isOverdue } from '../../utils/dateUtils.js'
import AppIcon from '../ui/AppIcon.vue'

const props = defineProps({ task: Object })
const emit = defineEmits(['open', 'touchDrop'])

const teamStore = useTeamStore()
const authStore = useAuthStore()
const isDragging = ref(false)

const assignee = computed(() => props.task.assigneeId ? teamStore.getById(props.task.assigneeId) : null)
const currentUser = computed(() => authStore.currentUser)
const canDrag = computed(() => {
  const u = currentUser.value
  if (!u) return false
  if (['owner', 'admin', 'manager'].includes(u.role)) return true
  return props.task.assigneeId === u.id
})

function initials(name) { return name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?' }
function priorityColor(p) {
  return { low: 'var(--priority-low)', medium: 'var(--priority-medium)', high: 'var(--priority-high)', critical: 'var(--priority-critical)' }[p] || 'var(--text-muted)'
}

function onDragStart(e) {
  if (!canDrag.value) { e.preventDefault(); return }
  isDragging.value = true
  e.dataTransfer.setData('taskId', props.task.id)
  e.dataTransfer.effectAllowed = 'move'
}
function onDragEnd() { isDragging.value = false }

// Touch drag
let touchClone = null
let touchDragStatus = null

function onTouchStart(e) {
  if (!canDrag.value) return
  const touch = e.touches[0]
  const card = e.currentTarget
  const rect = card.getBoundingClientRect()
  isDragging.value = true

  touchClone = card.cloneNode(true)
  Object.assign(touchClone.style, {
    position: 'fixed', zIndex: '9999', pointerEvents: 'none',
    opacity: '0.85', transform: 'rotate(2deg) scale(1.03)',
    width: rect.width + 'px', margin: '0',
    left: touch.clientX - rect.width / 2 + 'px',
    top: touch.clientY - rect.height / 2 + 'px',
    transition: 'none', borderRadius: 'var(--radius-md)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.25)'
  })
  document.body.appendChild(touchClone)
}

function onTouchMove(e) {
  if (!touchClone) return
  e.preventDefault()
  const touch = e.touches[0]
  touchClone.style.left = touch.clientX - touchClone.offsetWidth / 2 + 'px'
  touchClone.style.top = touch.clientY - touchClone.offsetHeight / 2 + 'px'

  touchClone.style.display = 'none'
  const el = document.elementFromPoint(touch.clientX, touch.clientY)
  touchClone.style.display = ''

  const col = el?.closest('[data-status]')
  touchDragStatus = col?.dataset.status || null

  document.querySelectorAll('[data-status]').forEach(c => {
    c.classList.toggle('drag-over', c.dataset.status === touchDragStatus)
  })
}

function onTouchEnd() {
  isDragging.value = false
  document.querySelectorAll('[data-status]').forEach(c => c.classList.remove('drag-over'))

  if (touchClone) { document.body.removeChild(touchClone); touchClone = null }

  if (touchDragStatus) {
    emit('touchDrop', { taskId: props.task.id, status: touchDragStatus })
    touchDragStatus = null
  }
}
</script>

<style scoped>
.task-card {
  padding: 12px; cursor: pointer;
  transition: box-shadow var(--transition), transform var(--transition);
  user-select: none; border-radius: var(--radius-md);
  -webkit-tap-highlight-color: transparent;
}
.task-card:hover { box-shadow: 0 6px 20px var(--shadow); transform: translateY(-1px); }
.task-card.dragging { opacity: 0.4; transform: rotate(1.5deg); cursor: grabbing; }
.task-header { display: flex; align-items: flex-start; gap: 6px; margin-bottom: 8px; }
.drag-handle { flex-shrink: 0; margin-top: 2px; opacity: 0.4; cursor: grab; }
.task-title { font-size: 13px; font-weight: 500; line-height: 1.4; flex: 1; }
.task-tags { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 10px; }
.task-bottom { display: flex; align-items: center; gap: 6px; }
.deadline { font-size: 11px; color: var(--text-muted); display: flex; align-items: center; gap: 3px; flex: 1; }
.deadline.overdue { color: var(--danger); font-weight: 500; }
.priority-icon { margin-left: auto; display: flex; }
</style>
