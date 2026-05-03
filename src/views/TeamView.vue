<template>
  <div>
    <div class="page-header">
      <h1>Команда</h1>
      <button v-if="canManage" class="btn btn-primary" @click="showInvite = true">
        <AppIcon name="plus" :size="16" color="#fff" />
        Пригласить
      </button>
    </div>

    <div v-if="employees.length" class="team-grid">
      <div v-for="emp in employees" :key="emp.id" class="emp-card card" @click="openProfile(emp)">
        <div class="emp-avatar avatar avatar-xl" :style="{ background: emp.color }">{{ initials(emp.name) }}</div>
        <div class="emp-info">
          <div class="emp-name">{{ emp.name }}</div>
          <div class="emp-email text-muted text-sm">{{ emp.email }}</div>
          <span class="badge" :class="`badge-${emp.role}`">{{ roleLabel(emp.role) }}</span>
        </div>
        <div class="emp-stats text-sm text-muted">
          <AppIcon name="tasks" :size="12" />
          {{ taskCount(emp.id) }} активных задач
        </div>
        <div v-if="canManage && emp.id !== currentUser?.id" class="emp-actions" @click.stop>
          <AppSelect :model-value="emp.role" @update:model-value="changeRole(emp, $event)" :options="roleOptions" small />
          <button class="btn btn-icon btn-ghost danger-btn" @click="confirmRemove(emp)">
            <AppIcon name="delete" :size="15" />
          </button>
        </div>
      </div>
    </div>

    <EmptyState v-else icon="team" heading="Команда пуста" subtext="Пригласите сотрудников для совместной работы"
      :action="canManage ? '+ Пригласить сотрудника' : null" @action="showInvite = true" />

    <AppModal v-model="showProfile" :title="profileEmp?.name || ''" width="520px">
      <div v-if="profileEmp" class="profile-content">
        <div class="profile-header">
          <div class="avatar avatar-xl" :style="{ background: profileEmp.color }">{{ initials(profileEmp.name) }}</div>
          <div>
            <h3>{{ profileEmp.name }}</h3>
            <p class="text-muted">{{ profileEmp.email }}</p>
            <span class="badge mt-4" :class="`badge-${profileEmp.role}`">{{ roleLabel(profileEmp.role) }}</span>
          </div>
        </div>
        <div class="profile-stats">
          <div class="stat-mini card"><div class="stat-num">{{ taskCount(profileEmp.id) }}</div><div class="stat-lbl text-muted text-sm">Активных</div></div>
          <div class="stat-mini card"><div class="stat-num">{{ doneCount(profileEmp.id) }}</div><div class="stat-lbl text-muted text-sm">Выполнено</div></div>
          <div class="stat-mini card"><div class="stat-num">{{ completionRate(profileEmp.id) }}%</div><div class="stat-lbl text-muted text-sm">Эффективность</div></div>
        </div>
        <h4 style="margin-bottom:10px">Последние задачи</h4>
        <div class="recent-tasks">
          <div v-for="task in recentTasks(profileEmp.id)" :key="task.id" class="recent-task-row">
            <div class="priority-dot" :class="task.priority"></div>
            <span class="text-sm">{{ task.title }}</span>
            <span class="status-badge" :class="task.status" style="margin-left:auto">{{ statusLabel(task.status) }}</span>
          </div>
          <div v-if="!recentTasks(profileEmp.id).length" class="text-muted text-sm">Задач нет</div>
        </div>
      </div>
    </AppModal>

    <AppModal v-model="showInvite" title="Пригласить сотрудника">
      <div class="flex flex-col gap-16">
        <div class="form-group">
          <label>Полное имя *</label>
          <AppInput v-model="inviteForm.name" placeholder="Иван Иванов" :error="!!err.name" />
          <span v-if="err.name" class="err">{{ err.name }}</span>
        </div>
        <div class="form-group">
          <label>Email *</label>
          <AppInput v-model="inviteForm.email" type="email" placeholder="ivan@company.com" :error="!!err.email" />
          <span v-if="err.email" class="err">{{ err.email }}</span>
        </div>
        <div class="form-group">
          <label>Роль</label>
          <AppSelect v-model="inviteForm.role" :options="roleOptions" />
        </div>
      </div>
      <template #footer>
        <button class="btn btn-secondary" @click="showInvite = false">Отмена</button>
        <button class="btn btn-primary" @click="invite">Добавить</button>
      </template>
    </AppModal>

    <ConfirmDialog v-model="showRemove" title="Удалить сотрудника?" :message="`Удалить ${removeTarget?.name} из команды?`" action-label="Удалить" @confirm="doRemove" />
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useTeamStore } from '../stores/team.js'
import { useTaskStore } from '../stores/task.js'
import { useAuthStore } from '../stores/auth.js'
import { useCompanyStore } from '../stores/company.js'
import { ROLE_LABELS, STATUS_LABELS, ROLE_OPTIONS } from '../utils/i18n.js'
import AppIcon from '../components/ui/AppIcon.vue'
import AppInput from '../components/ui/AppInput.vue'
import AppSelect from '../components/ui/AppSelect.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import AppModal from '../components/ui/AppModal.vue'
import ConfirmDialog from '../components/ui/ConfirmDialog.vue'

const teamStore = useTeamStore()
const taskStore = useTaskStore()
const authStore = useAuthStore()
const companyStore = useCompanyStore()

const showInvite = ref(false)
const showProfile = ref(false)
const showRemove = ref(false)
const profileEmp = ref(null)
const removeTarget = ref(null)
const err = ref({})
const inviteForm = reactive({ name: '', email: '', role: 'employee' })
const roleOptions = ROLE_OPTIONS

const employees = computed(() => teamStore.employees)
const currentUser = computed(() => authStore.currentUser)
const canManage = computed(() => authStore.hasRole('owner', 'admin'))

function initials(name) { return name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?' }
function roleLabel(r) { return ROLE_LABELS[r] || r }
function statusLabel(s) { return STATUS_LABELS[s] || s }
function taskCount(uid) { return taskStore.tasks.filter(t => t.assigneeId === uid && t.status !== 'done').length }
function doneCount(uid) { return taskStore.tasks.filter(t => t.assigneeId === uid && t.status === 'done').length }
function completionRate(uid) {
  const all = taskStore.tasks.filter(t => t.assigneeId === uid)
  if (!all.length) return 0
  return Math.round((doneCount(uid) / all.length) * 100)
}
function recentTasks(uid) { return taskStore.tasks.filter(t => t.assigneeId === uid).slice(0, 5) }
function openProfile(emp) { profileEmp.value = emp; showProfile.value = true }
function changeRole(emp, role) { teamStore.updateEmployee(emp.id, { role }, companyStore.activeCompanyId); window.$toast?.success('Роль обновлена') }
function confirmRemove(emp) { removeTarget.value = emp; showRemove.value = true }
function doRemove() { teamStore.removeEmployee(removeTarget.value.id, companyStore.activeCompanyId); window.$toast?.success('Сотрудник удалён') }
function invite() {
  err.value = {}
  if (!inviteForm.name.trim()) { err.value.name = 'Введите имя'; return }
  if (!inviteForm.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { err.value.email = 'Введите корректный email'; return }
  teamStore.addEmployee(companyStore.activeCompanyId, { ...inviteForm })
  Object.assign(inviteForm, { name: '', email: '', role: 'employee' })
  showInvite.value = false
  window.$toast?.success('Сотрудник добавлен')
}
</script>

<style scoped>
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
.team-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.emp-card { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 24px 16px; text-align: center; cursor: pointer; transition: transform var(--transition), box-shadow var(--transition); }
.emp-card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px var(--shadow); }
.emp-info { display: flex; flex-direction: column; gap: 4px; align-items: center; }
.emp-name { font-weight: 600; font-size: 14px; }
.emp-stats { display: flex; align-items: center; gap: 4px; }
.emp-actions { display: flex; gap: 6px; align-items: center; width: 100%; }
.danger-btn { color: var(--danger) !important; flex-shrink: 0; }
.profile-header { display: flex; gap: 16px; align-items: center; margin-bottom: 20px; }
.profile-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
.stat-mini { padding: 14px; text-align: center; }
.stat-num { font-size: 24px; font-weight: 800; }
.stat-lbl { margin-top: 2px; }
.recent-tasks { display: flex; flex-direction: column; gap: 6px; }
.recent-task-row { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: var(--radius-md); background: var(--surface-2); transition: background var(--transition); }
.recent-task-row:hover { background: var(--accent-light); }
.err { color: var(--danger); font-size: 12px; }
@media (max-width: 1024px) { .team-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px) {
  .team-grid { grid-template-columns: 1fr; }
  .emp-card { flex-direction: row; text-align: left; padding: 16px; gap: 14px; }
  .emp-info { align-items: flex-start; }
  .emp-avatar { flex-shrink: 0; }
}
</style>
