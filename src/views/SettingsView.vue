<template>
  <div class="settings">
    <h1 style="margin-bottom:24px">Настройки</h1>

    <div class="tabs">
      <button v-for="t in tabs" :key="t.id" :class="{ active: activeTab === t.id }" @click="activeTab = t.id">{{ t.label }}</button>
    </div>

    <!-- Company -->
    <div v-if="activeTab === 'company'" class="tab-content card">
      <h3>Настройки компании</h3>
      <div class="form-group mt-16">
        <label>Название компании</label>
        <AppInput v-model="compForm.name" placeholder="Название компании" />
      </div>
      <div class="form-group mt-8">
        <label>Отрасль</label>
        <AppSelect v-model="compForm.industry" :options="industries" />
      </div>
      <div class="form-group mt-8">
        <label>Логотип компании</label>
        <div class="emoji-grid">
          <button v-for="e in emojis" :key="e" class="emoji-btn" :class="{ selected: compForm.logoEmoji === e }" @click="compForm.logoEmoji = e">{{ e }}</button>
        </div>
      </div>
      <button class="btn btn-primary mt-16" @click="saveCompany">
        <AppIcon name="check" :size="15" color="#fff" />
        Сохранить изменения
      </button>
    </div>

    <!-- Members -->
    <div v-if="activeTab === 'members'" class="tab-content card">
      <h3>Сотрудники</h3>
      <table class="table mt-16">
        <thead>
          <tr><th>Имя</th><th>Email</th><th>Роль</th><th>Действия</th></tr>
        </thead>
        <tbody>
          <tr v-for="(emp, i) in employees" :key="emp.id" :class="{ 'row-alt': i % 2 === 1 }">
            <td>
              <div class="name-cell">
                <div class="avatar avatar-sm" :style="{ background: emp.color }">{{ initials(emp.name) }}</div>
                {{ emp.name }}
              </div>
            </td>
            <td class="text-muted">{{ emp.email }}</td>
            <td>
              <AppSelect
                v-if="canEdit && emp.id !== currentUser?.id"
                :model-value="emp.role"
                @update:model-value="changeRole(emp, $event)"
                :options="roleOptions"
                small
              />
              <span v-else class="badge" :class="`badge-${emp.role}`">{{ roleLabel(emp.role) }}</span>
            </td>
            <td>
              <button v-if="canEdit && emp.id !== currentUser?.id" class="btn btn-danger btn-sm" @click="confirmRemove(emp)">Удалить</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Permissions -->
    <div v-if="activeTab === 'permissions'" class="tab-content card">
      <h3>Матрица прав доступа</h3>
      <p class="text-muted mt-8" style="margin-bottom:16px;font-size:13px">Справочник — только для чтения</p>
      <table class="table permissions-table">
        <thead>
          <tr class="perm-header">
            <th>Действие</th>
            <th v-for="role in roles" :key="role">{{ roleLabel(role) }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="perm in permissions" :key="perm.action">
            <td>{{ perm.action }}</td>
            <td v-for="role in roles" :key="role">
              <AppIcon :name="perm.roles.includes(role) ? 'check' : 'close'" :size="16" :color="perm.roles.includes(role) ? 'var(--success)' : 'var(--border)'" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Danger zone -->
    <div v-if="activeTab === 'danger'" class="tab-content card danger-zone">
      <h3>
        <AppIcon name="alert" :size="18" color="var(--danger)" />
        Опасная зона
      </h3>
      <p class="text-muted mt-8">Эти действия необратимы. Будьте осторожны.</p>
      <div class="danger-action mt-16">
        <div>
          <div class="danger-title">Удалить все данные компании</div>
          <div class="text-sm text-muted">Удаляет все проекты, задачи, сотрудников и активность</div>
        </div>
        <button class="btn btn-danger" @click="showDangerConfirm = true">Удалить всё</button>
      </div>
    </div>

    <ConfirmDialog v-model="showRemove" title="Удалить сотрудника?" :message="`Удалить ${removeTarget?.name}?`" action-label="Удалить" @confirm="doRemove" />
    <ConfirmDialog
      v-model="showDangerConfirm"
      title="Удалить все данные компании"
      message="Введите название компании для подтверждения:"
      action-label="Удалить всё"
      :confirm-text="currentCompany?.name"
      @confirm="deleteAll"
    />
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCompanyStore } from '../stores/company.js'
import { useTeamStore } from '../stores/team.js'
import { useAuthStore } from '../stores/auth.js'
import { useProjectStore } from '../stores/project.js'
import { useTaskStore } from '../stores/task.js'
import { removeCompanyData } from '../utils/localStorage.js'
import { ROLE_LABELS, ROLE_OPTIONS } from '../utils/i18n.js'
import AppIcon from '../components/ui/AppIcon.vue'
import AppInput from '../components/ui/AppInput.vue'
import AppSelect from '../components/ui/AppSelect.vue'
import ConfirmDialog from '../components/ui/ConfirmDialog.vue'

const router = useRouter()
const companyStore = useCompanyStore()
const teamStore = useTeamStore()
const authStore = useAuthStore()
const projectStore = useProjectStore()
const taskStore = useTaskStore()

const activeTab = ref('company')
const showRemove = ref(false)
const showDangerConfirm = ref(false)
const removeTarget = ref(null)
const roleOptions = ROLE_OPTIONS

const tabs = [
  { id: 'company', label: 'Компания' },
  { id: 'members', label: 'Сотрудники' },
  { id: 'permissions', label: 'Права доступа' },
  { id: 'danger', label: 'Опасная зона' }
]

const industries = ['Технологии', 'Дизайн', 'Маркетинг', 'Финансы', 'Другое']
const emojis = ['🚀','🏢','💡','🔥','⚡','🌟','🎯','🌈','🏆','💎','🎨','🛠️','📊','🔮','🌊','🎸','🤖','🦄','🌴','🐉']
const roles = ['owner', 'admin', 'manager', 'employee']
const permissions = [
  { action: 'Удалить компанию', roles: ['owner'] },
  { action: 'Биллинг', roles: ['owner'] },
  { action: 'Управление сотрудниками', roles: ['owner', 'admin'] },
  { action: 'Управление ролями', roles: ['owner', 'admin'] },
  { action: 'Создание проектов', roles: ['owner', 'admin'] },
  { action: 'Редактирование проектов', roles: ['owner', 'admin'] },
  { action: 'Удаление проектов', roles: ['owner', 'admin'] },
  { action: 'Создание задач', roles: ['owner', 'admin', 'manager'] },
  { action: 'Назначение задач', roles: ['owner', 'admin', 'manager'] },
  { action: 'Обновление статуса', roles: ['owner', 'admin', 'manager', 'employee'] },
  { action: 'Добавление комментариев', roles: ['owner', 'admin', 'manager', 'employee'] },
  { action: 'Просмотр аналитики', roles: ['owner', 'admin', 'manager'] },
  { action: 'Настройки', roles: ['owner', 'admin'] }
]

const currentCompany = computed(() => companyStore.currentCompany)
const employees = computed(() => teamStore.employees)
const currentUser = computed(() => authStore.currentUser)
const canEdit = computed(() => authStore.hasRole('owner', 'admin'))

const compForm = reactive({ name: '', industry: '', logoEmoji: '' })
watch(currentCompany, c => {
  if (c) { compForm.name = c.name; compForm.industry = c.industry; compForm.logoEmoji = c.logoEmoji }
}, { immediate: true })

function initials(name) { return name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?' }
function roleLabel(r) { return ROLE_LABELS[r] || r }

function saveCompany() {
  companyStore.updateCompany(currentCompany.value.id, { name: compForm.name, industry: compForm.industry, logoEmoji: compForm.logoEmoji })
  window.$toast?.success('Изменения сохранены')
}
function changeRole(emp, role) {
  teamStore.updateEmployee(emp.id, { role }, companyStore.activeCompanyId)
  window.$toast?.success('Роль обновлена')
}
function confirmRemove(emp) { removeTarget.value = emp; showRemove.value = true }
function doRemove() {
  teamStore.removeEmployee(removeTarget.value.id, companyStore.activeCompanyId)
  window.$toast?.success('Сотрудник удалён')
}
function deleteAll() {
  const cid = companyStore.activeCompanyId
  removeCompanyData(cid)
  companyStore.removeCompany(cid)
  authStore.logout()
  router.push('/login')
  window.$toast?.info('Данные компании удалены')
}
</script>

<style scoped>
.settings { display: flex; flex-direction: column; gap: 20px; }
.tabs {
  display: flex; gap: 4px; background: var(--surface); border: 1.5px solid var(--border);
  border-radius: var(--radius-lg); padding: 4px; width: fit-content; overflow-x: auto;
}
.tabs button {
  padding: 8px 18px; border-radius: var(--radius-md); font-size: 14px;
  color: var(--text-muted); transition: all var(--transition); font-weight: 500;
  white-space: nowrap; min-height: 40px;
}
.tabs button.active { background: var(--accent-gradient); color: #fff; font-weight: 600; }
.tab-content { padding: 28px; }
.emoji-grid { display: grid; grid-template-columns: repeat(10, 1fr); gap: 6px; }
.emoji-btn { font-size: 20px; padding: 7px; border-radius: var(--radius-sm); transition: all var(--transition); border: 2px solid transparent; min-height: 44px; }
.emoji-btn:hover { background: var(--surface-2); }
.emoji-btn.selected { border-color: var(--accent); background: var(--accent-light); }
.name-cell { display: flex; align-items: center; gap: 8px; }
.permissions-table th, .permissions-table td { text-align: center; }
.permissions-table th:first-child, .permissions-table td:first-child { text-align: left; }
.perm-header { background: var(--accent-light); }
.perm-header th { color: var(--accent); }
.row-alt td { background: var(--surface-2); }
.danger-zone { border: 1.5px solid rgba(239,68,68,0.3) !important; }
.danger-zone h3 { display: flex; align-items: center; gap: 8px; color: var(--danger); }
.danger-action { display: flex; align-items: center; justify-content: space-between; padding: 16px; background: rgba(239,68,68,0.05); border-radius: var(--radius-md); border: 1px solid rgba(239,68,68,0.2); }
.danger-title { font-weight: 600; margin-bottom: 2px; }

@media (max-width: 768px) {
  .tabs { width: 100%; }
  .tab-content { padding: 20px 16px; }
  .emoji-grid { grid-template-columns: repeat(5, 1fr); }
  .danger-action { flex-direction: column; align-items: flex-start; gap: 12px; }
}
</style>
