<template>
  <div
    class="kanban-column"
    :class="{ 'drag-over': isDragOver }"
    :data-status="status"
    @dragover.prevent="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <div class="column-header">
      <div class="col-title-row">
        <span class="column-title">{{ label }}</span>
        <span class="task-count">{{ tasks.length }}</span>
      </div>
    </div>

    <div class="column-tasks">
      <TaskCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @open="$emit('openTask', task)"
        @touchDrop="$emit('drop', $event)"
      />
      <div v-if="!tasks.length" class="empty-col">
        <AppIcon name="tasks" :size="20" color="var(--border)" />
      </div>
    </div>

    <div class="quick-add">
      <div v-if="adding" class="quick-add-form">
        <input
          ref="addInput"
          v-model="newTitle"
          class="qa-input"
          placeholder="Название задачи..."
          @keydown.enter="submitAdd"
          @keydown.esc="adding = false"
        />
        <div class="quick-add-actions">
          <button class="btn btn-primary btn-sm" @click="submitAdd">Добавить</button>
          <button class="btn btn-ghost btn-sm" @click="adding = false">Отмена</button>
        </div>
      </div>
      <button v-else class="add-task-btn" @click="startAdd">
        <AppIcon name="plus" :size="14" />
        Добавить задачу
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import TaskCard from './TaskCard.vue'
import AppIcon from '../ui/AppIcon.vue'

const props = defineProps({ status: String, label: String, tasks: Array })
const emit = defineEmits(['openTask', 'drop', 'addTask'])

const isDragOver = ref(false)
const adding = ref(false)
const newTitle = ref('')
const addInput = ref(null)
let leaveTimer = null

function onDragOver() { clearTimeout(leaveTimer); isDragOver.value = true }
function onDragLeave() { leaveTimer = setTimeout(() => { isDragOver.value = false }, 80) }
function onDrop(e) {
  isDragOver.value = false
  const taskId = e.dataTransfer.getData('taskId')
  if (taskId) emit('drop', { taskId, status: props.status })
}

async function startAdd() {
  adding.value = true
  await nextTick()
  addInput.value?.focus()
}
function submitAdd() {
  const title = newTitle.value.trim()
  if (!title) return
  emit('addTask', { title, status: props.status })
  newTitle.value = ''
  adding.value = false
}
</script>

<style scoped>
.kanban-column {
  background: var(--surface-2);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-lg);
  display: flex; flex-direction: column;
  min-width: 260px; max-width: 300px; flex: 1;
  max-height: calc(100vh - 200px);
  transition: border-color var(--transition), background var(--transition), box-shadow var(--transition);
  flex-shrink: 0;
}
.kanban-column.drag-over {
  border-color: var(--accent) !important;
  background: var(--accent-light) !important;
  box-shadow: 0 0 0 2px var(--accent-light);
}
.column-header { padding: 14px 16px 10px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
.col-title-row { display: flex; align-items: center; justify-content: space-between; }
.column-title { font-weight: 700; font-size: 13px; }
.task-count {
  background: var(--border); color: var(--text-muted);
  border-radius: var(--radius-full);
  padding: 1px 8px; font-size: 11px; font-weight: 700;
}
.column-tasks { flex: 1; padding: 10px; display: flex; flex-direction: column; gap: 8px; overflow-y: auto; }
.empty-col { display: flex; align-items: center; justify-content: center; padding: 24px 0; opacity: 0.4; }
.quick-add { padding: 8px 10px; border-top: 1px solid var(--border); flex-shrink: 0; }
.add-task-btn {
  width: 100%; padding: 7px 10px; text-align: left;
  font-size: 13px; color: var(--text-muted);
  border-radius: var(--radius-md);
  transition: all var(--transition);
  display: flex; align-items: center; gap: 6px;
  min-height: 36px;
}
.add-task-btn:hover { background: var(--surface); color: var(--accent); }
.quick-add-form { display: flex; flex-direction: column; gap: 6px; }
.quick-add-actions { display: flex; gap: 6px; }
.qa-input {
  width: 100%; padding: 8px 12px;
  border: 1.5px solid var(--border); border-radius: var(--radius-md);
  background: var(--surface); color: var(--text); font-family: inherit; font-size: 13px;
  outline: none;
}
.qa-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-light); }
</style>
