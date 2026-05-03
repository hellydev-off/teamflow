<template>
  <aside
    class="sidebar"
    :class="{ collapsed, 'mobile-open': mobileOpen }"
    ref="sidebarRef"
  >
    <!-- Collapse toggle (desktop only) -->
    <button class="collapse-btn" @click="toggleCollapse" aria-label="Toggle sidebar">
      <AppIcon
        name="arrow-right"
        :size="14"
        :style="{
          transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }"
      />
    </button>

    <div class="sidebar-inner">

    <!-- Company switcher -->
    <div class="company-area" @click="showSwitcher = !showSwitcher" ref="companyRef">
      <div class="company-logo">{{ currentCompany?.logoEmoji || '🏢' }}</div>
      <Transition name="label-fade">
        <div v-if="!collapsed" class="company-info">
          <div class="company-name truncate">{{ currentCompany?.name || 'Компания' }}</div>
          <div class="company-industry text-sm text-muted">{{ currentCompany?.industry }}</div>
        </div>
      </Transition>
      <Transition name="label-fade">
        <AppIcon v-if="!collapsed" name="chevron-down" :size="14" color="var(--text-muted)" :style="{ transform: showSwitcher ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }" />
      </Transition>
    </div>

    <Transition name="fade">
      <div v-if="showSwitcher" class="company-dropdown">
        <div
          v-for="c in companies"
          :key="c.id"
          class="dropdown-item"
          :class="{ active: c.id === activeCompanyId }"
          @click="switchTo(c.id)"
        >
          <span>{{ c.logoEmoji }}</span>
          <span v-if="!collapsed" class="truncate">{{ c.name }}</span>
          <AppIcon v-if="c.id === activeCompanyId" name="check" :size="14" color="var(--accent)" />
        </div>
        <hr class="dropdown-sep" />
        <div class="dropdown-item" @click="goNew">
          <AppIcon name="plus" :size="16" color="var(--accent)" />
          <span v-if="!collapsed">Создать компанию</span>
        </div>
      </div>
    </Transition>

    <!-- Nav -->
    <nav class="nav">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-link"
        :class="{ active: isActive(item.to) }"
        @click="mobileOpen = false"
      >
        <span class="nav-icon-wrap">
          <AppIcon :name="item.icon" :size="18" />
        </span>
        <Transition name="label-fade">
          <span v-if="!collapsed" class="nav-label">{{ item.label }}</span>
        </Transition>
        <span v-if="collapsed" class="nav-tooltip">{{ item.label }}</span>
      </RouterLink>
    </nav>

    <!-- Bottom -->
    <div class="sidebar-bottom">

      <!-- User card + inline logout -->
      <div class="user-row">
        <div class="avatar avatar-sm" :style="{ background: currentUser?.color }">
          {{ initials(currentUser?.name) }}
        </div>
        <Transition name="label-fade">
          <div v-if="!collapsed" class="user-info">
            <div class="user-name truncate">{{ currentUser?.name }}</div>
            <span class="badge" :class="`badge-${currentUser?.role}`">{{ roleLabel(currentUser?.role) }}</span>
          </div>
        </Transition>
        <Transition name="label-fade">
          <button v-if="!collapsed" class="logout-icon-btn" @click.stop="logout" title="Выйти">
            <AppIcon name="logout" :size="15" />
          </button>
        </Transition>
        <span v-if="collapsed" class="nav-tooltip">{{ currentUser?.name }}</span>
      </div>

      <!-- Theme: toggle when expanded, clickable icon when collapsed -->
      <div
        class="theme-row"
        :class="{ 'theme-row--clickable': collapsed }"
        @click="collapsed ? themeStore.toggleTheme() : undefined"
      >
        <div class="nav-icon-wrap">
          <AppIcon :name="themeStore.theme === 'dark' ? 'theme-light' : 'theme-dark'" :size="16" />
        </div>
        <Transition name="label-fade">
          <span v-if="!collapsed" class="theme-label text-muted">{{ themeStore.theme === 'dark' ? 'Светлая тема' : 'Тёмная тема' }}</span>
        </Transition>
        <Transition name="label-fade">
          <AppToggle
            v-if="!collapsed"
            :model-value="themeStore.theme === 'dark'"
            @update:model-value="themeStore.toggleTheme()"
          />
        </Transition>
        <span v-if="collapsed" class="nav-tooltip">{{ themeStore.theme === 'dark' ? 'Светлая тема' : 'Тёмная тема' }}</span>
      </div>

      <!-- Logout icon-only row (collapsed state) -->
      <button v-if="collapsed" class="nav-link logout-row" @click="logout">
        <span class="nav-icon-wrap">
          <AppIcon name="logout" :size="16" />
        </span>
        <span class="nav-tooltip">Выйти</span>
      </button>

    </div>

    </div><!-- /sidebar-inner -->
  </aside>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth.js'
import { useCompanyStore } from '../../stores/company.js'
import { useThemeStore } from '../../stores/theme.js'
import { useProjectStore } from '../../stores/project.js'
import { useTaskStore } from '../../stores/task.js'
import { useTeamStore } from '../../stores/team.js'
import { useActivityStore } from '../../stores/activity.js'
import { ROLE_LABELS } from '../../utils/i18n.js'
import { useSidebar } from '../../composables/useSidebar.js'
import AppIcon from '../ui/AppIcon.vue'
import AppToggle from '../ui/AppToggle.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const companyStore = useCompanyStore()
const themeStore = useThemeStore()
const projectStore = useProjectStore()
const taskStore = useTaskStore()
const teamStore = useTeamStore()
const activityStore = useActivityStore()

const { collapsed, mobileOpen } = useSidebar()
const sidebarRef = ref(null)
const companyRef = ref(null)

const currentUser = computed(() => authStore.currentUser)
const currentCompany = computed(() => companyStore.currentCompany)
const companies = computed(() => companyStore.companies)
const activeCompanyId = computed(() => companyStore.activeCompanyId)
const showSwitcher = ref(false)

const navItems = computed(() => [
  { to: '/dashboard', icon: 'dashboard', label: 'Главная' },
  { to: '/projects', icon: 'projects', label: 'Проекты' },
  { to: '/tasks', icon: 'tasks', label: 'Задачи' },
  { to: '/team', icon: 'team', label: 'Команда' },
  { to: '/analytics', icon: 'analytics', label: 'Аналитика' },
  ...(authStore.hasRole('owner', 'admin') ? [{ to: '/settings', icon: 'settings', label: 'Настройки' }] : [])
])

function isActive(to) {
  return route.path === to || route.path.startsWith(to + '/')
}
function initials(name) {
  return name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'
}
function roleLabel(role) { return ROLE_LABELS[role] || role }

function toggleCollapse() {
  collapsed.value = !collapsed.value
  if (showSwitcher.value) showSwitcher.value = false
}

function switchTo(id) {
  companyStore.switchCompany(id)
  authStore.refreshCurrentUser(id)
  projectStore.load(id)
  taskStore.load(id)
  teamStore.load(id)
  activityStore.load(id)
  showSwitcher.value = false
  mobileOpen.value = false
  router.push('/dashboard')
}

function goNew() {
  showSwitcher.value = false
  mobileOpen.value = false
  router.push('/onboarding')
}

function logout() {
  authStore.logout()
  mobileOpen.value = false
  router.push('/login')
}

function onClickOutside(e) {
  if (companyRef.value && !companyRef.value.contains(e.target)) {
    showSwitcher.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside, true))
onUnmounted(() => document.removeEventListener('click', onClickOutside, true))
</script>

<style scoped>
.sidebar {
  width: 240px;
  height: 100vh;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--border);
  border-radius: 0 var(--radius-xl) var(--radius-xl) 0;
  position: fixed;
  left: 0; top: 0;
  z-index: 160;
  overflow: visible;
  box-shadow: 4px 0 32px var(--shadow);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.sidebar.collapsed { width: 72px; }


.sidebar-inner {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 0 var(--radius-xl) var(--radius-xl) 0;
}

/* Collapse toggle button */
.collapse-btn {
  position: absolute;
  right: -14px;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--surface);
  border: 1.5px solid var(--border);
  box-shadow: 0 2px 12px var(--shadow);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  color: var(--text-muted);
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}
.collapse-btn:hover {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
  transform: translateY(-50%) scale(1.12);
}

/* Company area */
.company-area {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--border);
  position: relative;
  transition: background var(--transition);
  min-height: 64px;
  overflow: hidden;
}
.company-area:hover { background: var(--surface-2); }
.company-logo {
  font-size: 18px;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-light);
  border-radius: var(--radius-sm);
  border: 1px solid rgba(59, 130, 246, 0.15);
}
.company-info { flex: 1; min-width: 0; }
.company-name { font-weight: 600; font-size: 13px; }
.sidebar.collapsed .company-area { justify-content: center; padding: 16px 8px; }

/* Company dropdown */
.company-dropdown {
  position: absolute;
  top: 68px; left: 8px; right: 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 30px var(--shadow);
  z-index: 20;
  overflow: hidden;
}
.dropdown-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; cursor: pointer; font-size: 13px;
  transition: background var(--transition);
}
.dropdown-item:hover { background: var(--surface-2); }
.dropdown-item.active { background: var(--accent-light); color: var(--accent); font-weight: 500; }
.dropdown-sep { border: none; border-top: 1px solid var(--border); margin: 2px 0; }

/* Nav */
.nav {
  flex: 1;
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
  overflow-x: hidden;
}
.nav-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  transition: all var(--transition);
  position: relative;
  overflow: visible;
  white-space: nowrap;
  min-height: 44px;
}
.sidebar.collapsed .nav-link { justify-content: center; padding: 9px 0; gap: 0; }
.nav-link:hover {
  background: var(--surface-2);
  color: var(--text);
  transform: translateX(2px);
}
.sidebar.collapsed .nav-link:hover { transform: none; }
.nav-link.active {
  background: var(--accent-gradient);
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.28);
}
.sidebar.collapsed .nav-link.active {
  background: var(--accent-gradient);
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.28);
}

.nav-icon-wrap { display: flex; flex-shrink: 0; width: 18px; justify-content: center; }
.nav-label { flex: 1; }

/* Tooltip on collapsed */
.nav-tooltip {
  position: absolute;
  left: 80px;
  top: 50%;
  transform: translateY(-50%);
  background: var(--text);
  color: var(--surface);
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  pointer-events: none;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.15s ease 0.15s;
  z-index: 200;
}
.sidebar.collapsed .nav-link:hover .nav-tooltip { opacity: 1; }

/* Bottom */
.sidebar-bottom {
  border-top: 1px solid var(--border);
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
}

.theme-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: var(--radius-md);
  min-height: 40px;
  overflow: hidden;
  transition: background var(--transition);
}
.theme-row:hover { background: var(--surface-2); }
.theme-row--clickable { cursor: pointer; }
.sidebar.collapsed .theme-row { justify-content: center; position: relative; }
.theme-label { flex: 1; font-size: 13px; white-space: nowrap; }

.user-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: var(--radius-md);
  min-height: 48px;
  overflow: hidden;
  background: var(--surface-2);
  border: 1px solid var(--border);
}
.sidebar.collapsed .user-row { justify-content: center; position: relative; }
.user-info { min-width: 0; flex: 1; }
.user-name { font-size: 13px; font-weight: 500; }

.logout-icon-btn {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  border: none;
  background: transparent;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition), color var(--transition);
  cursor: pointer;
}
.logout-icon-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger);
}

.logout-row {
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
}
.logout-row:hover {
  background: rgba(239, 68, 68, 0.08) !important;
  color: var(--danger) !important;
}
.sidebar.collapsed .logout-row { justify-content: center; padding: 9px 0; gap: 0; }

/* Label fade transition */
.label-fade-enter-active, .label-fade-leave-active {
  transition: opacity 0.15s ease, width 0.3s ease;
}
.label-fade-enter-from, .label-fade-leave-to { opacity: 0; }

/* Mobile */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    width: 240px !important;
    overflow: hidden;
  }
  .sidebar.mobile-open { transform: translateX(0); }
  .collapse-btn { display: none; }
}
</style>
