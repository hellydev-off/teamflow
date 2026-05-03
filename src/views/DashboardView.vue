<template>
  <div class="dashboard">
    <div class="dash-header">
      <div>
        <h1>{{ greeting }}, {{ currentUser?.name?.split(' ')[0] }} 👋</h1>
        <p class="text-muted">{{ currentDate }}</p>
      </div>
    </div>

    <!-- Stats row -->
    <div class="stats-row">
      <div v-for="stat in stats" :key="stat.label" class="stat-card card">
        <div class="stat-icon-wrap" :style="{ background: stat.bg }">
          <AppIcon :name="stat.icon" :size="20" :color="stat.color" />
        </div>
        <div class="stat-body">
          <div class="stat-num">{{ stat.value }}</div>
          <div class="stat-label text-muted">{{ stat.label }}</div>
        </div>
        <div class="stat-trend" :class="stat.trendClass">
          <AppIcon :name="stat.trendIcon" :size="14" />
        </div>
      </div>
    </div>

    <div class="dash-grid">
      <!-- My tasks today -->
      <div class="card section-card">
        <div class="section-header">
          <h3>Мои задачи на сегодня</h3>
          <RouterLink to="/tasks" class="text-accent text-sm see-all">Все задачи →</RouterLink>
        </div>
        <div v-if="myTasksToday.length" class="tasks-list">
          <div v-for="task in myTasksToday" :key="task.id" class="task-row-item" @click="openTask(task)">
            <div class="priority-dot" :class="task.priority"></div>
            <span class="task-title-item">{{ task.title }}</span>
            <span class="tag-chip">{{ getProject(task.projectId)?.name || '—' }}</span>
            <span class="status-badge" :class="task.status">{{ statusLabel(task.status) }}</span>
          </div>
        </div>
        <EmptyState v-else icon="tasks" heading="Задач нет" subtext="На сегодня нет задач — отличная работа!" />
      </div>

      <!-- Project progress -->
      <div class="card section-card">
        <div class="section-header">
          <h3>Прогресс по проектам</h3>
          <RouterLink to="/projects" class="text-accent text-sm see-all">Все проекты →</RouterLink>
        </div>
        <div v-if="projects.length" class="project-list">
          <div v-for="proj in projects" :key="proj.id" class="project-item" @click="$router.push(`/projects/${proj.id}`)">
            <div class="proj-dot" :style="{ background: proj.color }"></div>
            <div class="proj-info">
              <div class="proj-name">{{ proj.name }}</div>
              <AvatarGroup :users="projMembers(proj)" :max="3" />
            </div>
            <div class="proj-stats">
              <ProgressBar :pct="projectStats(proj.id).percent" :color="proj.color" />
              <div class="proj-pct text-sm text-muted">{{ projectStats(proj.id).percent }}% · {{ projectStats(proj.id).done }}/{{ projectStats(proj.id).total }}</div>
            </div>
          </div>
        </div>
        <EmptyState v-else icon="projects" heading="Проектов пока нет" subtext="Создайте первый проект" action="Создать проект" @action="$router.push('/projects')" />
      </div>
    </div>

    <!-- Activity + Analytics -->
    <div class="dash-row">
      <div class="card section-card activity-card">
        <h3 style="margin-bottom:16px">Последние действия</h3>
        <div v-if="recentActivity.length" class="activity-feed">
          <div v-for="entry in recentActivity" :key="entry.id" class="activity-item">
            <div class="avatar avatar-sm" :style="{ background: getUser(entry.userId)?.color }">
              {{ initials(getUser(entry.userId)?.name) }}
            </div>
            <div class="activity-text">
              <span class="activity-name">{{ getUser(entry.userId)?.name || 'Кто-то' }}</span>
              <span class="text-muted"> — {{ entry.action }}</span>
            </div>
            <span class="activity-time text-sm text-muted">{{ timeAgo(entry.createdAt) }}</span>
          </div>
        </div>
        <EmptyState v-else icon="notification" heading="Нет активности" subtext="Здесь появятся последние действия команды" />
      </div>

      <div class="card section-card analytics-mini">
        <h3 style="margin-bottom:16px">Задачи по статусу</h3>
        <DonutChart v-if="tasks.length" :segments="statusSegments" />
        <EmptyState v-else icon="analytics" heading="Нет данных" subtext="Добавьте задачи для отображения статистики" />

        <template v-if="tasks.length">
          <h3 style="margin:24px 0 16px">Выполнено за неделю</h3>
          <BarChart :bars="weekBars" color="var(--accent)" />

          <div v-if="overdueCount > 0" class="overdue-card">
            <div class="overdue-num">{{ overdueCount }}</div>
            <div class="overdue-label">Просрочено</div>
          </div>
        </template>
      </div>
    </div>

    <!-- Workload -->
    <div v-if="workloadBars.length" class="card section-card" style="margin-top:24px">
      <h3 style="margin-bottom:16px">Нагрузка команды</h3>
      <HorizontalBarChart :bars="workloadBars" />
    </div>

    <TaskDetailPanel v-if="selectedTask" :task="liveTask" @close="selectedTask = null" @update="onTaskUpdate" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useTaskStore } from '../stores/task.js'
import { useProjectStore } from '../stores/project.js'
import { useTeamStore } from '../stores/team.js'
import { useActivityStore } from '../stores/activity.js'
import { useCompanyStore } from '../stores/company.js'
import { currentDateDisplay, timeAgo, daysAgo, formatDayLabel, isOverdue } from '../utils/dateUtils.js'
import { STATUS_LABELS } from '../utils/i18n.js'
import AppIcon from '../components/ui/AppIcon.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import AvatarGroup from '../components/ui/AvatarGroup.vue'
import ProgressBar from '../components/ui/ProgressBar.vue'
import DonutChart from '../components/charts/DonutChart.vue'
import BarChart from '../components/charts/BarChart.vue'
import HorizontalBarChart from '../components/charts/HorizontalBarChart.vue'
import TaskDetailPanel from '../components/tasks/TaskDetailPanel.vue'

const authStore = useAuthStore()
const taskStore = useTaskStore()
const projectStore = useProjectStore()
const teamStore = useTeamStore()
const activityStore = useActivityStore()
const companyStore = useCompanyStore()

const currentUser = computed(() => authStore.currentUser)
const tasks = computed(() => taskStore.tasks)
const projects = computed(() => projectStore.getByCompany(companyStore.activeCompanyId))
const employees = computed(() => teamStore.employees)
const currentDate = currentDateDisplay()

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Доброе утро'
  if (h < 17) return 'Добрый день'
  return 'Добрый вечер'
})

const myTasksToday = computed(() => taskStore.getMyTasksToday(currentUser.value?.id))
const recentActivity = computed(() => activityStore.getRecent(10))

const stats = computed(() => {
  const s = taskStore.getStats()
  return [
    { icon: 'tasks', label: 'Всего задач', value: s.total, bg: 'rgba(59,130,246,0.1)', color: '#3b82f6', trend: '+', trendIcon: 'trending-up', trendClass: 'trend-up' },
    { icon: 'clock', label: 'В работе', value: s.inProgress, bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', trend: '→', trendIcon: 'arrow-right', trendClass: '' },
    { icon: 'check', label: 'Выполнено', value: s.completed, bg: 'rgba(16,185,129,0.1)', color: '#10b981', trend: '+', trendIcon: 'trending-up', trendClass: 'trend-up' },
    { icon: 'alert', label: 'Просрочено', value: s.overdue, bg: 'rgba(239,68,68,0.1)', color: '#ef4444', trend: s.overdue > 0 ? '!' : '—', trendIcon: s.overdue > 0 ? 'alert' : 'check', trendClass: s.overdue > 0 ? 'trend-down' : 'trend-up' }
  ]
})

function getProject(id) { return projectStore.getById(id) }
function getUser(id) { return id ? teamStore.getById(id) : null }
function initials(name) {
  return name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'
}
function projMembers(proj) {
  return (proj.memberIds || []).map(id => teamStore.getById(id)).filter(Boolean)
}
function projectStats(id) { return projectStore.getStats(id, tasks.value) }
function statusLabel(s) { return STATUS_LABELS[s] || s }

const statusSegments = computed(() => {
  const t = tasks.value
  return [
    { label: 'Бэклог', value: t.filter(x => x.status === 'backlog').length, color: '#6b7280' },
    { label: 'К выполнению', value: t.filter(x => x.status === 'todo').length, color: 'var(--info)' },
    { label: 'В работе', value: t.filter(x => x.status === 'inprogress').length, color: 'var(--warning)' },
    { label: 'На проверке', value: t.filter(x => x.status === 'review').length, color: '#8b5cf6' },
    { label: 'Выполнено', value: t.filter(x => x.status === 'done').length, color: 'var(--success)' }
  ]
})

const weekBars = computed(() =>
  Array.from({ length: 7 }, (_, i) => {
    const d = daysAgo(6 - i)
    const count = tasks.value.filter(t => t.status === 'done' && t.updatedAt?.startsWith(d)).length
    return { label: formatDayLabel(d), value: count }
  })
)

const overdueCount = computed(() => tasks.value.filter(t => isOverdue(t.deadline) && t.status !== 'done').length)

const workloadBars = computed(() =>
  employees.value.map(u => ({
    label: u.name,
    value: tasks.value.filter(t => t.assigneeId === u.id && t.status !== 'done').length,
    color: u.color
  })).filter(b => b.value > 0)
)

const selectedTask = ref(null)
const liveTask = computed(() => selectedTask.value ? taskStore.getById(selectedTask.value.id) : null)
function openTask(task) { selectedTask.value = task }
function onTaskUpdate() {}
</script>

<style scoped>
.dashboard { display: flex; flex-direction: column; gap: 24px; }
.dash-header { margin-bottom: 4px; }
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.stat-card { display: flex; align-items: center; gap: 14px; padding: 20px; }
.stat-icon-wrap {
  width: 44px; height: 44px; border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.stat-num { font-size: 28px; font-weight: 800; line-height: 1; letter-spacing: -1px; }
.stat-label { font-size: 12px; margin-top: 3px; }
.stat-trend { margin-left: auto; }
.trend-up { color: var(--success); }
.trend-down { color: var(--danger); }
.dash-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.dash-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.section-card { padding: 24px; }
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.see-all { font-weight: 500; }
.tasks-list { display: flex; flex-direction: column; gap: 6px; }
.task-row-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 10px; border-radius: var(--radius-md);
  cursor: pointer; transition: background var(--transition);
}
.task-row-item:hover { background: var(--surface-2); }
.task-title-item { flex: 1; font-size: 13px; }
.project-list { display: flex; flex-direction: column; gap: 10px; }
.project-item {
  display: flex; align-items: center; gap: 12px;
  cursor: pointer; padding: 8px; border-radius: var(--radius-md);
  transition: background var(--transition);
}
.project-item:hover { background: var(--surface-2); }
.proj-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.proj-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.proj-name { font-size: 13px; font-weight: 500; }
.proj-stats { width: 160px; display: flex; flex-direction: column; gap: 4px; }
.proj-pct { text-align: right; }
.activity-feed { display: flex; flex-direction: column; gap: 12px; max-height: 320px; overflow-y: auto; }
.activity-item { display: flex; align-items: flex-start; gap: 10px; }
.activity-text { flex: 1; font-size: 13px; line-height: 1.4; }
.activity-name { font-weight: 600; }
.activity-time { flex-shrink: 0; }
.analytics-mini { display: flex; flex-direction: column; }
.overdue-card {
  margin-top: 16px;
  background: rgba(239,68,68,0.08);
  border: 1px solid rgba(239,68,68,0.2);
  border-radius: var(--radius-md);
  padding: 16px; text-align: center;
}
.overdue-num { font-size: 36px; font-weight: 800; color: var(--danger); }
.overdue-label { color: var(--danger); font-size: 13px; margin-top: 4px; font-weight: 500; }

@media (max-width: 768px) {
  .stats-row { grid-template-columns: 1fr 1fr; }
  .dash-grid { grid-template-columns: 1fr; }
  .dash-row { grid-template-columns: 1fr; }
}
</style>
