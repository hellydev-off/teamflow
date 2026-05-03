<template>
  <div class="kanban-board">
    <KanbanColumn
      v-for="col in columns"
      :key="col.status"
      :status="col.status"
      :label="col.label"
      :tasks="tasksByStatus[col.status] || []"
      @openTask="$emit('openTask', $event)"
      @drop="onDrop"
      @addTask="onAddTask"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import KanbanColumn from './KanbanColumn.vue'
import { useTaskStore } from '../../stores/task.js'
import { useAuthStore } from '../../stores/auth.js'
import { useCompanyStore } from '../../stores/company.js'
import { useActivityStore } from '../../stores/activity.js'

const props = defineProps({ tasks: Array, projectId: String })
defineEmits(['openTask'])

const taskStore = useTaskStore()
const authStore = useAuthStore()
const companyStore = useCompanyStore()
const activityStore = useActivityStore()

const columns = [
  { status: 'backlog', label: 'Бэклог' },
  { status: 'todo', label: 'К выполнению' },
  { status: 'inprogress', label: 'В работе' },
  { status: 'review', label: 'На проверке' },
  { status: 'done', label: 'Выполнено' }
]

const tasksByStatus = computed(() => {
  const map = {}
  for (const col of columns) map[col.status] = []
  for (const t of props.tasks) {
    if (map[t.status]) map[t.status].push(t)
    else map['backlog'].push(t)
  }
  return map
})

function onDrop({ taskId, status }) {
  const cid = companyStore.activeCompanyId
  const uid = authStore.currentUser?.id
  taskStore.moveStatus(taskId, status, cid, uid)
  const t = taskStore.getById(taskId)
  if (t) {
    activityStore.addLog(cid, { userId: uid, action: `Задача "${t.title}" перемещена в ${status}`, entityType: 'task', entityId: taskId, meta: {} })
  }
}

function onAddTask({ title, status }) {
  const cid = companyStore.activeCompanyId
  const uid = authStore.currentUser?.id
  taskStore.createTask(cid, {
    title,
    status,
    projectId: props.projectId || taskStore.tasks[0]?.projectId,
    creatorId: uid
  })
  activityStore.addLog(cid, { userId: uid, action: `Создана задача "${title}"`, entityType: 'task', entityId: null, meta: {} })
}
</script>

<style scoped>
.kanban-board {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 16px;
  align-items: flex-start;
}
</style>
