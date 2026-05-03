<template>
  <div class="onboarding-bg">
    <div class="wizard card">
      <div class="progress-track">
        <div class="progress-fill" :style="{ width: ((step / 3) * 100) + '%' }"></div>
      </div>
      <div class="steps-labels">
        <span v-for="i in 3" :key="i" :class="{ active: step >= i, current: step === i }">
          {{ stepLabels[i - 1] }}
        </span>
      </div>

      <!-- Step 1: Company -->
      <div v-if="step === 1" class="step-content">
        <div class="step-heading">
          <div class="step-icon-wrap">
            <AppIcon name="building" :size="22" color="#fff" />
          </div>
          <div>
            <h2>Ваша компания</h2>
            <p class="step-sub">Настройте рабочее пространство</p>
          </div>
        </div>
        <div class="form-group">
          <label>Название компании *</label>
          <AppInput v-model="company.name" placeholder="Acme Inc." :error="!!err.name" />
          <span v-if="err.name" class="err">{{ err.name }}</span>
        </div>
        <div class="form-group">
          <label>Отрасль</label>
          <AppSelect v-model="company.industry" :options="industries" />
        </div>
        <div class="form-group">
          <label>Логотип компании</label>
          <div class="emoji-grid">
            <button
              v-for="e in emojis"
              :key="e"
              class="emoji-btn"
              :class="{ selected: company.logoEmoji === e }"
              @click="company.logoEmoji = e"
            >{{ e }}</button>
          </div>
        </div>
      </div>

      <!-- Step 2: Team -->
      <div v-if="step === 2" class="step-content">
        <div class="step-heading">
          <div class="step-icon-wrap">
            <AppIcon name="team" :size="22" color="#fff" />
          </div>
          <div>
            <h2>Ваша команда</h2>
            <p class="step-sub">Добавьте сотрудников компании</p>
          </div>
        </div>
        <div class="team-rows">
          <div v-for="(row, i) in team" :key="i" class="team-row card">
            <AppInput v-model="row.name" placeholder="Имя" wrap-class="row-input" />
            <AppInput v-model="row.email" type="email" placeholder="Email" wrap-class="row-input" />
            <AppSelect v-model="row.role" :options="roleOptions" wrap-class="row-select" />
            <button v-if="team.length > 1" class="btn btn-icon btn-ghost remove-row" @click="team.splice(i, 1)">
              <AppIcon name="close" :size="14" />
            </button>
          </div>
        </div>
        <button class="btn btn-ghost btn-sm add-row-btn" @click="addRow">
          <AppIcon name="plus" :size="14" />
          Добавить сотрудника
        </button>
        <span v-if="err.team" class="err">{{ err.team }}</span>
      </div>

      <!-- Step 3: First Project -->
      <div v-if="step === 3" class="step-content">
        <div class="step-heading">
          <div class="step-icon-wrap">
            <AppIcon name="projects" :size="22" color="#fff" />
          </div>
          <div>
            <h2>Первый проект</h2>
            <p class="step-sub">Создайте проект для отслеживания работы</p>
          </div>
        </div>
        <div class="form-group">
          <label>Название проекта *</label>
          <AppInput v-model="project.name" placeholder="Редизайн сайта" :error="!!err.project" />
          <span v-if="err.project" class="err">{{ err.project }}</span>
        </div>
        <div class="form-group">
          <label>Описание</label>
          <AppInput v-model="project.description" type="textarea" placeholder="О чём этот проект?" />
        </div>
        <div class="form-group">
          <label>Цвет проекта</label>
          <div class="color-grid">
            <button
              v-for="c in colors"
              :key="c"
              class="color-dot-btn"
              :class="{ selected: project.color === c }"
              :style="{ background: c }"
              @click="project.color = c"
            ></button>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="wizard-footer">
        <button v-if="step > 1" class="btn btn-secondary" @click="step--">
          <AppIcon name="chevron-right" :size="16" style="transform:rotate(180deg)" />
          Назад
        </button>
        <div style="flex:1"></div>
        <button v-if="step < 3" class="btn btn-primary" @click="nextStep">
          Далее
          <AppIcon name="chevron-right" :size="16" color="#fff" />
        </button>
        <button v-else class="btn btn-primary" @click="finish" :disabled="loading">
          {{ loading ? 'Создаём...' : 'Запустить TeamFlow' }}
          <AppIcon v-if="!loading" name="arrow-right" :size="16" color="#fff" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { useCompanyStore } from '../stores/company.js'
import { useProjectStore } from '../stores/project.js'
import { useTaskStore } from '../stores/task.js'
import { useTeamStore } from '../stores/team.js'
import { useActivityStore } from '../stores/activity.js'
import { initCompanyData } from '../utils/seedData.js'
import AppIcon from '../components/ui/AppIcon.vue'
import AppInput from '../components/ui/AppInput.vue'
import AppSelect from '../components/ui/AppSelect.vue'

const router = useRouter()
const authStore = useAuthStore()
const companyStore = useCompanyStore()
const projectStore = useProjectStore()
const taskStore = useTaskStore()
const teamStore = useTeamStore()
const activityStore = useActivityStore()

const step = ref(1)
const err = ref({})
const loading = ref(false)
const stepLabels = ['Компания', 'Команда', 'Проект']
const industries = ['Технологии', 'Дизайн', 'Маркетинг', 'Финансы', 'Другое']
const emojis = ['🚀','🏢','💡','🔥','⚡','🌟','🎯','🌈','🏆','💎','🎨','🛠️','📊','🔮','🌊','🎸','🤖','🦄','🌴','🐉']
const colors = ['#3b82f6','#6366f1','#10b981','#f59e0b','#ef4444','#ec4899','#14b8a6','#f97316']
const roleOptions = [
  { value: 'admin', label: 'Администратор' },
  { value: 'manager', label: 'Менеджер' },
  { value: 'employee', label: 'Сотрудник' }
]

const company = reactive({ name: '', industry: 'Технологии', logoEmoji: '🚀' })
const team = ref([
  { name: '', email: '', role: 'admin' },
  { name: '', email: '', role: 'employee' }
])
const project = reactive({ name: '', description: '', color: '#3b82f6' })

function addRow() { team.value.push({ name: '', email: '', role: 'employee' }) }

function validate1() {
  err.value = {}
  if (!company.name.trim()) { err.value.name = 'Название компании обязательно'; return false }
  return true
}
function validate3() {
  err.value = {}
  if (!project.name.trim()) { err.value.project = 'Название проекта обязательно'; return false }
  return true
}

function nextStep() {
  if (step.value === 1 && !validate1()) return
  step.value++
}

async function finish() {
  if (!validate3()) return
  loading.value = true
  try {
    const ownerUser = authStore.currentUser
    const newCompany = companyStore.createCompany(company.name, company.industry, company.logoEmoji, ownerUser.id)
    companyStore.switchCompany(newCompany.id)
    const filledTeam = team.value.filter(r => r.name && r.name.trim())
    const { users } = initCompanyData(newCompany, ownerUser, filledTeam)
    const ownerRecord = users.find(u => u.id === ownerUser.id)
    authStore.finalizeWithCompany(newCompany.id, ownerRecord)
    projectStore.load(newCompany.id)
    taskStore.load(newCompany.id)
    teamStore.load(newCompany.id)
    activityStore.load(newCompany.id)
    if (project.name.trim()) {
      projectStore.createProject(newCompany.id, {
        name: project.name,
        description: project.description,
        color: project.color,
        memberIds: users.map(u => u.id)
      })
    }
    window.$toast?.success('Добро пожаловать в TeamFlow!')
    router.push('/dashboard')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.onboarding-bg {
  min-height: 100vh;
  background: var(--bg);
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
}
.wizard { width: 100%; max-width: 580px; overflow: hidden; }
.progress-track { height: 4px; background: var(--border); }
.progress-fill { height: 100%; background: var(--accent-gradient); transition: width 0.4s ease; }
.steps-labels {
  display: flex; padding: 14px 24px;
  border-bottom: 1px solid var(--border);
}
.steps-labels span {
  flex: 1; text-align: center; font-size: 12px; font-weight: 500;
  color: var(--text-muted); transition: color var(--transition);
}
.steps-labels span.active { color: var(--accent); }
.steps-labels span.current { font-weight: 700; }
.step-content { padding: 32px; display: flex; flex-direction: column; gap: 20px; }
.step-heading { display: flex; align-items: center; gap: 14px; }
.step-icon-wrap {
  width: 48px; height: 48px;
  background: var(--accent-gradient);
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 14px rgba(59,130,246,0.3);
}
.step-sub { color: var(--text-muted); font-size: 13px; margin-top: 2px; }
.emoji-grid { display: grid; grid-template-columns: repeat(10, 1fr); gap: 6px; }
.emoji-btn {
  font-size: 20px; padding: 7px;
  border-radius: var(--radius-sm);
  transition: all var(--transition);
  border: 2px solid transparent;
  min-height: 44px;
}
.emoji-btn:hover { background: var(--surface-2); }
.emoji-btn.selected { border-color: var(--accent); background: var(--accent-light); }

.team-rows { display: flex; flex-direction: column; gap: 10px; }
.team-row {
  display: flex; gap: 8px; align-items: center;
  padding: 12px 14px;
  border-radius: var(--radius-md);
}
.team-row :deep(.row-input) { flex: 1; min-width: 80px; }
.team-row :deep(.row-select) { width: 150px; flex-shrink: 0; }
.remove-row { flex-shrink: 0; }
.add-row-btn { align-self: flex-start; gap: 6px; color: var(--accent); }

.color-grid { display: flex; gap: 10px; flex-wrap: wrap; }
.color-dot-btn {
  width: 32px; height: 32px; border-radius: 50%;
  border: 3px solid transparent; cursor: pointer;
  transition: all var(--transition); min-height: 32px;
}
.color-dot-btn:hover { transform: scale(1.1); }
.color-dot-btn.selected { border-color: var(--text); box-shadow: 0 0 0 2px var(--surface), 0 0 0 4px var(--text); }

.wizard-footer {
  display: flex; align-items: center;
  padding: 20px 32px;
  border-top: 1px solid var(--border); gap: 12px;
}
.err { color: var(--danger); font-size: 12px; }

@media (max-width: 768px) {
  .step-content { padding: 20px 16px; }
  .emoji-grid { grid-template-columns: repeat(5, 1fr); }
  .team-row { flex-wrap: wrap; }
  .team-row :deep(.row-input), .team-row :deep(.row-select) { width: 100%; min-width: 0; flex: none; }
  .wizard-footer { padding: 16px; }
}
</style>
