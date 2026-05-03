<template>
  <div class="list-wrap card">
    <div class="table-scroll">
      <table class="table">
        <thead>
          <tr>
            <th style="width:24px"></th>
            <th @click="sort('title')">Задача <span class="sort-icon">{{ sortIcon('title') }}</span></th>
            <th @click="sort('assigneeId')" class="col-hide-sm">Исполнитель <span class="sort-icon">{{ sortIcon('assigneeId') }}</span></th>
            <th @click="sort('priority')" class="col-hide-sm">Приоритет <span class="sort-icon">{{ sortIcon('priority') }}</span></th>
            <th @click="sort('deadline')" class="col-hide-xs">Срок <span class="sort-icon">{{ sortIcon('deadline') }}</span></th>
            <th @click="sort('status')">Статус <span class="sort-icon">{{ sortIcon('status') }}</span></th>
            <th style="width:80px"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="task in sorted" :key="task.id" class="task-row" @click="$emit('openTask', task)">
            <td><div class="priority-dot" :class="task.priority"></div></td>
            <td>
              <div class="task-title-cell">{{ task.title }}</div>
              <div class="task-tags-row">
                <span v-for="tag in task.tags.slice(0, 2)" :key="tag" class="tag-chip">{{ tag }}</span>
              </div>
            </td>
            <td class="col-hide-sm">
              <div v-if="getUser(task.assigneeId)" class="assignee-cell">
                <div class="avatar avatar-sm" :style="{ background: getUser(task.assigneeId)?.color }">
                  {{ initials(getUser(task.assigneeId)?.name) }}
                </div>
                <span class="text-sm">{{ getUser(task.assigneeId)?.name }}</span>
              </div>
              <span v-else class="text-muted text-sm">Не назначено</span>
            </td>
            <td class="col-hide-sm">
              <div class="priority-cell">
                <AppIcon :name="`priority-${task.priority}`" :size="14" :color="priorityColor(task.priority)" />
                <span class="priority-label" :class="task.priority">{{ priorityLabel(task.priority) }}</span>
              </div>
            </td>
            <td class="col-hide-xs">
              <span v-if="task.deadline" class="text-sm" :class="{ 'text-danger': isOverdue(task.deadline) }">
                {{ formatDate(task.deadline) }}
              </span>
              <span v-else class="text-muted text-sm">—</span>
            </td>
            <td @click.stop class="status-cell">
              <AppSelect
                :model-value="task.status"
                @update:model-value="changeStatus(task, $event)"
                :options="statusOptions"
                small
              />
            </td>
            <td @click.stop class="actions-cell">
              <button class="btn btn-icon btn-ghost" @click="$emit('openTask', task)">
                <AppIcon name="edit" :size="14" />
              </button>
              <button class="btn btn-icon btn-ghost danger-btn" @click="$emit('deleteTask', task)">
                <AppIcon name="delete" :size="14" />
              </button>
            </td>
          </tr>
          <tr v-if="!sorted.length">
            <td colspan="7" style="text-align:center; color:var(--text-muted); padding:40px">Задач не найдено</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTeamStore } from '../../stores/team.js'
import { useTaskStore } from '../../stores/task.js'
import { useAuthStore } from '../../stores/auth.js'
import { useCompanyStore } from '../../stores/company.js'
import { formatDate, isOverdue } from '../../utils/dateUtils.js'
import { PRIORITY_LABELS, STATUS_OPTIONS } from '../../utils/i18n.js'
import AppIcon from '../ui/AppIcon.vue'
import AppSelect from '../ui/AppSelect.vue'

const props = defineProps({ tasks: Array })
const emit = defineEmits(['openTask', 'deleteTask'])

const teamStore = useTeamStore()
const taskStore = useTaskStore()
const authStore = useAuthStore()
const companyStore = useCompanyStore()

const statusOptions = STATUS_OPTIONS
const sortKey = ref('createdAt')
const sortDir = ref('desc')

function sort(key) {
  if (sortKey.value === key) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else { sortKey.value = key; sortDir.value = 'asc' }
}
function sortIcon(key) {
  if (sortKey.value !== key) return '↕'
  return sortDir.value === 'asc' ? '↑' : '↓'
}

const sorted = computed(() =>
  [...props.tasks].sort((a, b) => {
    let av = a[sortKey.value] || '', bv = b[sortKey.value] || ''
    if (av < bv) return sortDir.value === 'asc' ? -1 : 1
    if (av > bv) return sortDir.value === 'asc' ? 1 : -1
    return 0
  })
)

function getUser(id) { return id ? teamStore.getById(id) : null }
function initials(name) { return name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?' }
function priorityLabel(p) { return PRIORITY_LABELS[p] || p }
function priorityColor(p) {
  return { low: 'var(--priority-low)', medium: 'var(--priority-medium)', high: 'var(--priority-high)', critical: 'var(--priority-critical)' }[p]
}
function changeStatus(task, status) {
  taskStore.moveStatus(task.id, status, companyStore.activeCompanyId, authStore.currentUser?.id)
}
</script>

<style scoped>
.list-wrap { overflow: hidden; }
.table-scroll { overflow-x: auto; }
.task-title-cell { font-size: 13px; font-weight: 500; }
.task-tags-row { display: flex; gap: 4px; margin-top: 3px; }
.assignee-cell { display: flex; align-items: center; gap: 6px; }
.priority-cell { display: flex; align-items: center; gap: 5px; }
.priority-label { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: var(--radius-full); }
.priority-label.low { background: rgba(16,185,129,0.12); color: var(--priority-low); }
.priority-label.medium { background: rgba(245,158,11,0.12); color: var(--priority-medium); }
.priority-label.high { background: rgba(239,68,68,0.12); color: var(--priority-high); }
.priority-label.critical { background: rgba(124,58,237,0.12); color: var(--priority-critical); }
.status-cell { min-width: 150px; }
.text-danger { color: var(--danger); font-weight: 500; }
.sort-icon { opacity: 0.5; }
.actions-cell { display: flex; gap: 2px; opacity: 0; transition: opacity 0.2s; }
tr:hover .actions-cell { opacity: 1; }
.task-row { cursor: pointer; }
.danger-btn { color: var(--danger) !important; }
.danger-btn:hover { background: rgba(239,68,68,0.08) !important; }

@media (max-width: 768px) {
  .col-hide-sm { display: none; }
}
@media (max-width: 480px) {
  .col-hide-xs { display: none; }
}
</style>
