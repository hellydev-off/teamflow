<template>
  <div v-if="project">
    <div class="proj-detail-header card">
      <div class="proj-accent" :style="{ background: project.color }"></div>
      <div class="header-body">
        <div class="header-top">
          <div>
            <h1>{{ project.name }}</h1>
            <p class="text-muted" style="margin-top:4px">{{ project.description }}</p>
          </div>
          <AvatarGroup :users="members" :max="5" />
        </div>
        <div class="header-actions">
          <div class="view-toggle">
            <button :class="{ active: view === 'kanban' }" @click="view = 'kanban'">
              <AppIcon name="kanban" :size="14" />
              Канбан
            </button>
            <button :class="{ active: view === 'list' }" @click="view = 'list'">
              <AppIcon name="list" :size="14" />
              Список
            </button>
          </div>
          <button v-if="canEdit" class="btn btn-secondary btn-sm" @click="showEdit = true">
            <AppIcon name="edit" :size="13" />
            Редактировать
          </button>
        </div>
      </div>
    </div>

    <div v-if="view === 'kanban'" style="margin-top:24px">
      <KanbanBoard :tasks="projectTasks" :projectId="project.id" @openTask="openTask" />
    </div>
    <div v-else style="margin-top:24px">
      <TaskListView :tasks="projectTasks" @openTask="openTask" @deleteTask="confirmDelete" />
    </div>

    <TaskDetailPanel v-if="selectedTask" :task="liveTask" @close="selectedTask = null" @update="onUpdate" />

    <AppModal v-model="showEdit" title="Редактировать проект">
      <div class="flex flex-col gap-16">
        <div class="form-group">
          <label>Название</label>
          <AppInput v-model="editForm.name" />
        </div>
        <div class="form-group">
          <label>Описание</label>
          <AppInput v-model="editForm.description" type="textarea" />
        </div>
        <div class="form-group">
          <label>Цвет</label>
          <div class="color-row">
            <button v-for="c in colorOptions" :key="c" class="color-dot-btn"
              :class="{ selected: editForm.color === c }" :style="{ background: c }"
              @click="editForm.color = c"></button>
          </div>
        </div>
      </div>
      <template #footer>
        <button class="btn btn-secondary" @click="showEdit = false">Отмена</button>
        <button class="btn btn-primary" @click="saveEdit">Сохранить</button>
      </template>
    </AppModal>

    <ConfirmDialog
      v-model="showDelete"
      title="Удалить задачу?"
      :message="`Удалить '${deleteTarget?.title}'? Это действие нельзя отменить.`"
      action-label="Удалить"
      @confirm="doDelete"
    />
  </div>
  <div v-else>
    <EmptyState icon="alert" heading="Проект не найден" subtext="Этот проект не существует или был удалён." />
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectStore } from '../stores/project.js'
import { useTaskStore } from '../stores/task.js'
import { useTeamStore } from '../stores/team.js'
import { useAuthStore } from '../stores/auth.js'
import { useCompanyStore } from '../stores/company.js'
import AppIcon from '../components/ui/AppIcon.vue'
import AvatarGroup from '../components/ui/AvatarGroup.vue'
import KanbanBoard from '../components/tasks/KanbanBoard.vue'
import TaskListView from '../components/tasks/TaskListView.vue'
import TaskDetailPanel from '../components/tasks/TaskDetailPanel.vue'
import AppModal from '../components/ui/AppModal.vue'
import ConfirmDialog from '../components/ui/ConfirmDialog.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import AppInput from '../components/ui/AppInput.vue'

const route = useRoute()
const projectStore = useProjectStore()
const taskStore = useTaskStore()
const teamStore = useTeamStore()
const authStore = useAuthStore()
const companyStore = useCompanyStore()

const view = ref('kanban')
const showEdit = ref(false)
const showDelete = ref(false)
const deleteTarget = ref(null)
const selectedTask = ref(null)
const colorOptions = ['#3b82f6','#6366f1','#10b981','#f59e0b','#ef4444','#ec4899','#14b8a6','#f97316']

const project = computed(() => projectStore.getById(route.params.id))
const projectTasks = computed(() => taskStore.getByProject(route.params.id))
const members = computed(() => (project.value?.memberIds || []).map(id => teamStore.getById(id)).filter(Boolean))
const canEdit = computed(() => authStore.hasRole('owner', 'admin'))
const liveTask = computed(() => selectedTask.value ? taskStore.getById(selectedTask.value.id) : null)

const editForm = reactive({ name: '', description: '', color: '' })
watch(showEdit, v => {
  if (v && project.value) {
    editForm.name = project.value.name
    editForm.description = project.value.description
    editForm.color = project.value.color
  }
})

function openTask(task) { selectedTask.value = task }
function onUpdate() {}
function saveEdit() {
  projectStore.updateProject(project.value.id, { name: editForm.name, description: editForm.description, color: editForm.color }, companyStore.activeCompanyId)
  showEdit.value = false
  window.$toast?.success('Изменения сохранены')
}
function confirmDelete(task) { deleteTarget.value = task; showDelete.value = true }
function doDelete() {
  if (!deleteTarget.value) return
  taskStore.deleteTask(deleteTarget.value.id, companyStore.activeCompanyId)
  window.$toast?.success('Задача удалена')
}
</script>

<style scoped>
.proj-detail-header { display: flex; overflow: hidden; }
.proj-accent { width: 5px; flex-shrink: 0; }
.header-body { flex: 1; padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; }
.header-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.header-actions { display: flex; align-items: center; gap: 12px; }
.view-toggle {
  display: flex; background: var(--surface-2);
  border-radius: var(--radius-md); padding: 4px; gap: 3px;
}
.view-toggle button {
  display: flex; align-items: center; gap: 5px;
  padding: 7px 12px; border-radius: var(--radius-sm); font-size: 13px;
  color: var(--text-muted); transition: all var(--transition);
}
.view-toggle button.active { background: var(--surface); color: var(--text); box-shadow: 0 1px 6px var(--shadow); font-weight: 600; }
.color-row { display: flex; gap: 10px; }
.color-dot-btn { width: 28px; height: 28px; border-radius: 50%; border: 3px solid transparent; cursor: pointer; transition: all 0.2s; }
.color-dot-btn:hover { transform: scale(1.1); }
.color-dot-btn.selected { border-color: var(--text); box-shadow: 0 0 0 2px var(--surface), 0 0 0 4px var(--text); }
</style>
