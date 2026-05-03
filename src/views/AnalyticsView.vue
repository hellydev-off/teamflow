<template>
  <div class="analytics">
    <h1 style="margin-bottom:24px">Аналитика</h1>

    <template v-if="tasks.length">
      <div class="summary-row">
        <div v-for="s in summary" :key="s.label" class="stat-card card">
          <div class="stat-icon-wrap" :style="{ background: s.bg }">
            <AppIcon :name="s.icon" :size="20" :color="s.color" />
          </div>
          <div>
            <div class="stat-val">{{ s.value }}</div>
            <div class="stat-lbl text-muted">{{ s.label }}</div>
          </div>
        </div>
      </div>

      <div class="charts-row">
        <div class="card chart-card">
          <h3 class="chart-title">Задачи по проектам</h3>
          <HorizontalBarChart :bars="byProject" />
        </div>
        <div class="card chart-card">
          <h3 class="chart-title">Нагрузка команды</h3>
          <HorizontalBarChart :bars="byEmployee" />
        </div>
      </div>

      <div class="charts-row">
        <div class="card chart-card">
          <h3 class="chart-title">Выполнено за 7 дней</h3>
          <BarChart :bars="weekBars" color="var(--success)" />
        </div>
        <div class="card chart-card">
          <h3 class="chart-title">Распределение по приоритету</h3>
          <DonutChart :segments="prioritySegs" />
        </div>
      </div>

      <div class="card table-card">
        <h3 class="chart-title">Просроченные задачи</h3>
        <table v-if="overdueList.length" class="table">
          <thead>
            <tr>
              <th @click="sort('title')">Задача {{ sortIcon('title') }}</th>
              <th @click="sort('projectId')">Проект {{ sortIcon('projectId') }}</th>
              <th>Исполнитель</th>
              <th @click="sort('daysOverdue')">Дней просрочено {{ sortIcon('daysOverdue') }}</th>
              <th>Приоритет</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in sortedOverdue" :key="t.id">
              <td>{{ t.title }}</td>
              <td>
                <span class="proj-pill" :style="{ background: getProject(t.projectId)?.color + '22', color: getProject(t.projectId)?.color }">
                  {{ getProject(t.projectId)?.name || '—' }}
                </span>
              </td>
              <td>
                <div v-if="getUser(t.assigneeId)" class="assignee-inline">
                  <div class="avatar avatar-sm" :style="{ background: getUser(t.assigneeId)?.color }">{{ initials(getUser(t.assigneeId)?.name) }}</div>
                  <span class="text-sm">{{ getUser(t.assigneeId)?.name }}</span>
                </div>
                <span v-else class="text-muted text-sm">—</span>
              </td>
              <td style="color:var(--danger);font-weight:700">{{ daysOverdue(t.deadline) }}д</td>
              <td>
                <div class="priority-cell">
                  <AppIcon :name="`priority-${t.priority}`" :size="13" :color="priorityColor(t.priority)" />
                  <span class="priority-label" :class="t.priority">{{ priorityLabel(t.priority) }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <EmptyState v-else icon="check" heading="Нет просроченных задач!" subtext="Отличная работа — все в срок." />
      </div>

      <div class="card table-card">
        <h3 class="chart-title">Топ исполнителей</h3>
        <table class="table">
          <thead>
            <tr><th>Место</th><th>Сотрудник</th><th>Выполнено</th><th>Эффективность</th></tr>
          </thead>
          <tbody>
            <tr v-for="(p, i) in topPerformers" :key="p.id">
              <td><span class="rank">{{ i + 1 }}</span></td>
              <td>
                <div class="assignee-inline">
                  <div class="avatar avatar-sm" :style="{ background: p.color }">{{ initials(p.name) }}</div>
                  <span>{{ p.name }}</span>
                </div>
              </td>
              <td>{{ p.completed }}</td>
              <td>
                <div class="rate-cell">
                  <div class="rate-bar" :style="{ width: p.rate + '%', background: p.color }"></div>
                  <span>{{ p.rate }}%</span>
                </div>
              </td>
            </tr>
            <tr v-if="!topPerformers.length">
              <td colspan="4" style="text-align:center;color:var(--text-muted);padding:20px">Нет данных</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <EmptyState
      v-else
      icon="analytics"
      heading="Недостаточно данных"
      subtext="Добавьте задачи для отображения аналитики"
      action="Перейти к задачам"
      @action="$router.push('/tasks')"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useTaskStore } from '../stores/task.js'
import { useProjectStore } from '../stores/project.js'
import { useTeamStore } from '../stores/team.js'
import { useCompanyStore } from '../stores/company.js'
import { isOverdue, daysAgo, formatDayLabel } from '../utils/dateUtils.js'
import { PRIORITY_LABELS } from '../utils/i18n.js'
import AppIcon from '../components/ui/AppIcon.vue'
import HorizontalBarChart from '../components/charts/HorizontalBarChart.vue'
import BarChart from '../components/charts/BarChart.vue'
import DonutChart from '../components/charts/DonutChart.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import { useRouter } from 'vue-router'

const taskStore = useTaskStore()
const projectStore = useProjectStore()
const teamStore = useTeamStore()
const companyStore = useCompanyStore()

const tasks = computed(() => taskStore.tasks)
const projects = computed(() => projectStore.getByCompany(companyStore.activeCompanyId))
const employees = computed(() => teamStore.employees)

const completed = computed(() => tasks.value.filter(t => t.status === 'done').length)
const overdueList = computed(() => tasks.value.filter(t => isOverdue(t.deadline) && t.status !== 'done'))

const avgDays = computed(() => {
  const done = tasks.value.filter(t => t.status === 'done' && t.createdAt && t.updatedAt)
  if (!done.length) return 0
  return Math.round(done.reduce((s, t) => s + (new Date(t.updatedAt) - new Date(t.createdAt)) / 86400000, 0) / done.length)
})

const summary = computed(() => [
  { label: 'Всего задач', value: tasks.value.length, icon: 'tasks', bg: 'rgba(59,130,246,0.1)', color: '#3b82f6' },
  { label: 'Выполнено', value: completed.value, icon: 'check', bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
  { label: 'Ср. дней выполнения', value: avgDays.value, icon: 'clock', bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
  { label: 'Просроченных', value: tasks.value.length ? Math.round((overdueList.value.length / tasks.value.length) * 100) + '%' : '0%', icon: 'alert', bg: 'rgba(239,68,68,0.1)', color: '#ef4444' }
])

const byProject = computed(() => projects.value.map(p => ({
  label: p.name, value: tasks.value.filter(t => t.projectId === p.id).length, color: p.color
})))

const byEmployee = computed(() => employees.value.map(u => ({
  label: u.name, value: tasks.value.filter(t => t.assigneeId === u.id && t.status !== 'done').length, color: u.color
})).filter(b => b.value > 0))

const weekBars = computed(() => Array.from({ length: 7 }, (_, i) => {
  const d = daysAgo(6 - i)
  return { label: formatDayLabel(d), value: tasks.value.filter(t => t.status === 'done' && t.updatedAt?.startsWith(d)).length }
}))

const prioritySegs = computed(() => [
  { label: 'Низкий', value: tasks.value.filter(t => t.priority === 'low').length, color: 'var(--priority-low)' },
  { label: 'Средний', value: tasks.value.filter(t => t.priority === 'medium').length, color: 'var(--priority-medium)' },
  { label: 'Высокий', value: tasks.value.filter(t => t.priority === 'high').length, color: 'var(--priority-high)' },
  { label: 'Критический', value: tasks.value.filter(t => t.priority === 'critical').length, color: 'var(--priority-critical)' }
])

const topPerformers = computed(() =>
  employees.value.map(u => {
    const all = tasks.value.filter(t => t.assigneeId === u.id)
    const done = all.filter(t => t.status === 'done').length
    return { ...u, completed: done, rate: all.length ? Math.round((done / all.length) * 100) : 0 }
  }).sort((a, b) => b.completed - a.completed).slice(0, 5)
)

function getProject(id) { return projects.value.find(p => p.id === id) }
function getUser(id) { return id ? teamStore.getById(id) : null }
function initials(name) { return name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?' }
function daysOverdue(dl) { return dl ? Math.floor((Date.now() - new Date(dl).getTime()) / 86400000) : 0 }
function priorityLabel(p) { return PRIORITY_LABELS[p] || p }
function priorityColor(p) {
  return { low: 'var(--priority-low)', medium: 'var(--priority-medium)', high: 'var(--priority-high)', critical: 'var(--priority-critical)' }[p]
}

const sortKey = ref('title')
const sortDir = ref('asc')
function sort(key) {
  if (sortKey.value === key) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else { sortKey.value = key; sortDir.value = 'asc' }
}
function sortIcon(key) {
  if (sortKey.value !== key) return '↕'
  return sortDir.value === 'asc' ? '↑' : '↓'
}
const sortedOverdue = computed(() =>
  [...overdueList.value].map(t => ({ ...t, daysOverdue: daysOverdue(t.deadline) }))
    .sort((a, b) => {
      let av = a[sortKey.value] || '', bv = b[sortKey.value] || ''
      if (typeof av === 'number') return sortDir.value === 'asc' ? av - bv : bv - av
      return sortDir.value === 'asc' ? (av < bv ? -1 : 1) : (av > bv ? -1 : 1)
    })
)
</script>

<style scoped>
.analytics { display: flex; flex-direction: column; gap: 24px; }
.summary-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.stat-card { display: flex; align-items: center; gap: 14px; padding: 20px; }
.stat-icon-wrap { width: 44px; height: 44px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-val { font-size: 28px; font-weight: 800; letter-spacing: -1px; }
.stat-lbl { font-size: 12px; margin-top: 2px; }
.charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.chart-card { padding: 24px; }
.chart-title { margin-bottom: 20px; }
.table-card { padding: 24px; overflow: hidden; }
.assignee-inline { display: flex; align-items: center; gap: 8px; }
.proj-pill { padding: 3px 10px; border-radius: var(--radius-full); font-size: 12px; font-weight: 600; }
.priority-cell { display: flex; align-items: center; gap: 6px; }
.priority-label { padding: 2px 8px; border-radius: var(--radius-full); font-size: 11px; font-weight: 600; }
.priority-label.low { background: rgba(16,185,129,0.12); color: var(--priority-low); }
.priority-label.medium { background: rgba(245,158,11,0.12); color: var(--priority-medium); }
.priority-label.high { background: rgba(239,68,68,0.12); color: var(--priority-high); }
.priority-label.critical { background: rgba(124,58,237,0.12); color: var(--priority-critical); }
.rank { display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; background: var(--accent-light); border-radius: 50%; font-weight: 700; font-size: 12px; color: var(--accent); }
.rate-cell { display: flex; align-items: center; gap: 8px; }
.rate-bar { height: 8px; border-radius: var(--radius-full); min-width: 4px; transition: width 0.4s; }

@media (max-width: 768px) {
  .summary-row { grid-template-columns: 1fr 1fr; }
  .charts-row { grid-template-columns: 1fr; }
  .table-card { overflow-x: auto; }
}
</style>
