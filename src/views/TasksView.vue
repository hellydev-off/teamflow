<template>
  <div>
    <div class="page-header">
      <h1>Задачи</h1>
      <div class="view-toggle">
        <button :class="{ active: view === 'kanban' }" @click="view = 'kanban'">
          <AppIcon name="kanban" :size="14" />
          <span class="toggle-label">Канбан</span>
        </button>
        <button :class="{ active: view === 'list' }" @click="view = 'list'">
          <AppIcon name="list" :size="14" />
          <span class="toggle-label">Список</span>
        </button>
      </div>
    </div>

    <div class="filter-bar card">
      <AppInput v-model="filters.search" placeholder="Поиск по задачам..." wrap-class="filter-search">
        <template #prefix><AppIcon name="search" :size="15" color="var(--text-muted)" /></template>
      </AppInput>
      <AppSelect v-model="filters.projectId" :options="projectOptions" placeholder="Все проекты" clearable class="filter-sel" />
      <AppSelect v-model="filters.assigneeId" :options="assigneeOptions" placeholder="Все исполнители" clearable class="filter-sel" />
      <AppSelect v-model="filters.priority" :options="priorityOptions" placeholder="Приоритет" clearable class="filter-sel" />
      <AppSelect v-model="filters.status" :options="statusOptions" placeholder="Статус" clearable class="filter-sel" />
      <AppInput v-model="filters.deadlineFrom" type="date" wrap-class="filter-date" />
      <AppInput v-model="filters.deadlineTo" type="date" wrap-class="filter-date" />
      <button v-if="hasFilters" class="btn btn-ghost btn-sm clear-btn" @click="clearFilters">
        <AppIcon name="close" :size="13" />
        Сбросить
      </button>
    </div>

    <div style="margin-top:20px">
      <KanbanBoard v-if="view === 'kanban'" :tasks="filteredTasks" @openTask="openTask" />
      <TaskListView v-else :tasks="filteredTasks" @openTask="openTask" @deleteTask="confirmDelete" />
    </div>

    <TaskDetailPanel v-if="selectedTask" :task="liveTask" @close="selectedTask = null" @update="onUpdate" />
    <ConfirmDialog v-model="showDelete" title="Удалить задачу?" :message="`Удалить '${deleteTarget?.title}'?`" action-label="Удалить" @confirm="doDelete" />
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useTaskStore } from '../stores/task.js'
import { useProjectStore } from '../stores/project.js'
import { useTeamStore } from '../stores/team.js'
import { useCompanyStore } from '../stores/company.js'
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '../utils/i18n.js'
import AppIcon from '../components/ui/AppIcon.vue'
import AppInput from '../components/ui/AppInput.vue'
import AppSelect from '../components/ui/AppSelect.vue'
import KanbanBoard from '../components/tasks/KanbanBoard.vue'
import TaskListView from '../components/tasks/TaskListView.vue'
import TaskDetailPanel from '../components/tasks/TaskDetailPanel.vue'
import ConfirmDialog from '../components/ui/ConfirmDialog.vue'

const taskStore = useTaskStore()
const projectStore = useProjectStore()
const teamStore = useTeamStore()
const companyStore = useCompanyStore()

const view = ref('kanban')
const selectedTask = ref(null)
const showDelete = ref(false)
const deleteTarget = ref(null)
const filters = reactive({ search: '', projectId: '', assigneeId: '', priority: '', status: '', deadlineFrom: '', deadlineTo: '' })

const projects = computed(() => projectStore.getByCompany(companyStore.activeCompanyId))
const employees = computed(() => teamStore.employees)
const filteredTasks = computed(() => taskStore.getFiltered(filters))
const hasFilters = computed(() => Object.values(filters).some(v => v !== ''))
const liveTask = computed(() => selectedTask.value ? taskStore.getById(selectedTask.value.id) : null)

const projectOptions = computed(() => projects.value.map(p => ({ value: p.id, label: p.name })))
const assigneeOptions = computed(() => employees.value.map(u => ({ value: u.id, label: u.name })))
const priorityOptions = PRIORITY_OPTIONS
const statusOptions = STATUS_OPTIONS

function clearFilters() { Object.keys(filters).forEach(k => filters[k] = '') }
function openTask(task) { selectedTask.value = task }
function onUpdate() {}
function confirmDelete(task) { deleteTarget.value = task; showDelete.value = true }
function doDelete() {
  if (!deleteTarget.value) return
  taskStore.deleteTask(deleteTarget.value.id, companyStore.activeCompanyId)
  window.$toast?.success('Задача удалена')
}
</script>

<style scoped>
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.view-toggle {
  display: flex; background: var(--surface); border-radius: var(--radius-md);
  border: 1.5px solid var(--border); padding: 4px; gap: 4px;
}
.view-toggle button {
  display: flex; align-items: center; gap: 5px;
  padding: 7px 12px; border-radius: var(--radius-sm); font-size: 13px;
  color: var(--text-muted); transition: all var(--transition); min-height: 36px;
}
.view-toggle button.active { background: var(--accent-gradient); color: #fff; font-weight: 600; }
.filter-bar { display: flex; align-items: center; gap: 8px; padding: 12px 16px; flex-wrap: wrap; }
.filter-bar :deep(.filter-search) { flex: 1; min-width: 180px; }
.filter-bar :deep(.filter-sel) { min-width: 140px; max-width: 180px; }
.filter-bar :deep(.filter-date) { width: 140px; flex-shrink: 0; }
.clear-btn { flex-shrink: 0; }

@media (max-width: 768px) {
  .toggle-label { display: none; }
  .filter-bar :deep(.filter-search),
  .filter-bar :deep(.filter-sel),
  .filter-bar :deep(.filter-date) { min-width: 0; max-width: none; width: 100%; flex: none; }
}
</style>
