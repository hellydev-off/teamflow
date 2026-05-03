<template>
  <div>
    <div class="page-header">
      <h1>Проекты</h1>
      <button v-if="canCreate" class="btn btn-primary" @click="showModal = true">
        <AppIcon name="plus" :size="16" color="#fff" />
        Новый проект
      </button>
    </div>

    <div v-if="loading" class="projects-grid">
      <div v-for="i in 6" :key="i" class="card skeleton-card skeleton"></div>
    </div>

    <div v-else-if="projects.length" class="projects-grid">
      <div
        v-for="proj in projects"
        :key="proj.id"
        class="project-card card"
        @click="$router.push(`/projects/${proj.id}`)"
      >
        <div class="card-top" :style="{ background: proj.color }"></div>
        <div class="card-body">
          <div class="proj-header">
            <h3 class="truncate">{{ proj.name }}</h3>
            <span class="status-badge" :class="proj.status">{{ proj.status === 'active' ? 'Активный' : proj.status }}</span>
          </div>
          <p class="proj-desc text-muted">{{ proj.description || 'Описание отсутствует' }}</p>
          <AvatarGroup :users="projMembers(proj)" :max="4" />
          <div class="proj-footer">
            <span class="text-sm text-muted">{{ taskCount(proj.id) }} задач</span>
            <span class="text-sm text-muted">{{ projectStats(proj.id).percent }}% готово</span>
          </div>
          <ProgressBar :pct="projectStats(proj.id).percent" :color="proj.color" />
        </div>
      </div>
    </div>

    <EmptyState
      v-else
      icon="projects"
      heading="Проектов пока нет"
      subtext="Создайте первый проект для отслеживания работы"
      :action="canCreate ? '+ Создать проект' : null"
      @action="showModal = true"
    />

    <AppModal v-model="showModal" title="Новый проект">
      <div class="flex flex-col gap-16">
        <div class="form-group">
          <label>Название проекта *</label>
          <AppInput v-model="form.name" placeholder="Редизайн сайта" :error="!!err.name" />
          <span v-if="err.name" class="err">{{ err.name }}</span>
        </div>
        <div class="form-group">
          <label>Описание</label>
          <AppInput v-model="form.description" type="textarea" placeholder="О чём этот проект?" />
        </div>
        <div class="form-group">
          <label>Цвет</label>
          <div class="color-row">
            <button
              v-for="c in colorOptions"
              :key="c"
              class="color-dot-btn"
              :class="{ selected: form.color === c }"
              :style="{ background: c }"
              @click="form.color = c"
            ></button>
          </div>
        </div>
        <div class="form-group">
          <label>Участники</label>
          <div class="members-list">
            <label v-for="u in employees" :key="u.id" class="member-check">
              <AppCheckbox :model-value="form.memberIds.includes(u.id)" @update:model-value="toggleMember(u.id, $event)" />
              <div class="avatar avatar-sm" :style="{ background: u.color }">{{ initials(u.name) }}</div>
              <span>{{ u.name }}</span>
              <span class="badge" :class="`badge-${u.role}`">{{ roleLabel(u.role) }}</span>
            </label>
          </div>
        </div>
      </div>
      <template #footer>
        <button class="btn btn-secondary" @click="showModal = false">Отмена</button>
        <button class="btn btn-primary" @click="createProject">Создать проект</button>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useProjectStore } from '../stores/project.js'
import { useTaskStore } from '../stores/task.js'
import { useTeamStore } from '../stores/team.js'
import { useAuthStore } from '../stores/auth.js'
import { useCompanyStore } from '../stores/company.js'
import { useActivityStore } from '../stores/activity.js'
import { ROLE_LABELS } from '../utils/i18n.js'
import AppIcon from '../components/ui/AppIcon.vue'
import AppInput from '../components/ui/AppInput.vue'
import AppCheckbox from '../components/ui/AppCheckbox.vue'
import AvatarGroup from '../components/ui/AvatarGroup.vue'
import ProgressBar from '../components/ui/ProgressBar.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import AppModal from '../components/ui/AppModal.vue'

const projectStore = useProjectStore()
const taskStore = useTaskStore()
const teamStore = useTeamStore()
const authStore = useAuthStore()
const companyStore = useCompanyStore()
const activityStore = useActivityStore()

const loading = ref(true)
const showModal = ref(false)
const err = ref({})
const colorOptions = ['#3b82f6','#6366f1','#10b981','#f59e0b','#ef4444','#ec4899','#14b8a6','#f97316']
const form = reactive({ name: '', description: '', color: '#3b82f6', memberIds: [] })

const projects = computed(() => projectStore.getByCompany(companyStore.activeCompanyId))
const employees = computed(() => teamStore.employees)
const canCreate = computed(() => authStore.hasRole('owner', 'admin'))

onMounted(() => setTimeout(() => loading.value = false, 250))

function toggleMember(id, checked) {
  if (checked) form.memberIds = [...form.memberIds, id]
  else form.memberIds = form.memberIds.filter(x => x !== id)
}
function projMembers(proj) {
  return (proj.memberIds || []).map(id => teamStore.getById(id)).filter(Boolean)
}
function taskCount(id) { return taskStore.tasks.filter(t => t.projectId === id).length }
function projectStats(id) { return projectStore.getStats(id, taskStore.tasks) }
function initials(name) { return name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?' }
function roleLabel(r) { return ROLE_LABELS[r] || r }

function createProject() {
  err.value = {}
  if (!form.name.trim()) { err.value.name = 'Название обязательно'; return }
  const proj = projectStore.createProject(companyStore.activeCompanyId, { ...form })
  activityStore.addLog(companyStore.activeCompanyId, {
    userId: authStore.currentUser?.id,
    action: `Создал проект "${form.name}"`,
    entityType: 'project', entityId: proj.id, meta: {}
  })
  Object.assign(form, { name: '', description: '', color: '#3b82f6', memberIds: [] })
  showModal.value = false
  window.$toast?.success('Проект создан')
}
</script>

<style scoped>
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
.projects-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.project-card { cursor: pointer; transition: transform var(--transition), box-shadow var(--transition); overflow: hidden; }
.project-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px var(--shadow); }
.card-top { height: 5px; }
.card-body { padding: 18px; display: flex; flex-direction: column; gap: 12px; }
.proj-header { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.proj-desc { font-size: 13px; line-height: 1.4; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.proj-footer { display: flex; justify-content: space-between; }
.skeleton-card { height: 220px; }
.color-row { display: flex; gap: 10px; flex-wrap: wrap; }
.color-dot-btn { width: 28px; height: 28px; border-radius: 50%; border: 3px solid transparent; transition: all var(--transition); cursor: pointer; min-height: 28px; }
.color-dot-btn:hover { transform: scale(1.1); }
.color-dot-btn.selected { border-color: var(--text); box-shadow: 0 0 0 2px var(--surface), 0 0 0 4px var(--text); }
.members-list { display: flex; flex-direction: column; gap: 4px; max-height: 220px; overflow-y: auto; }
.member-check {
  display: flex; align-items: center; gap: 10px;
  cursor: pointer; padding: 8px 10px;
  border-radius: var(--radius-md);
  transition: background var(--transition);
  min-height: 44px;
}
.member-check:hover { background: var(--surface-2); }
.err { color: var(--danger); font-size: 12px; }

@media (max-width: 1024px) { .projects-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px) { .projects-grid { grid-template-columns: 1fr; } }
</style>
