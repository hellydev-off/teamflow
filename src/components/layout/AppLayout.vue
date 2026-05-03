<template>
  <div class="app-layout">
    <!-- Mobile hamburger -->
    <button class="hamburger" :class="{ open: mobileOpen }" @click="mobileOpen = !mobileOpen" aria-label="Меню">
      <span></span>
      <span></span>
      <span></span>
    </button>

    <!-- Mobile overlay backdrop -->
    <Transition name="fade">
      <div v-if="mobileOpen" class="mobile-backdrop" @click="mobileOpen = false"></div>
    </Transition>

    <AppSidebar />

    <main class="content-area" :class="{ 'sidebar-collapsed': collapsed }">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useCompanyStore } from '../../stores/company.js'
import { useProjectStore } from '../../stores/project.js'
import { useTaskStore } from '../../stores/task.js'
import { useTeamStore } from '../../stores/team.js'
import { useActivityStore } from '../../stores/activity.js'
import { useSidebar } from '../../composables/useSidebar.js'
import AppSidebar from './AppSidebar.vue'

const companyStore = useCompanyStore()
const projectStore = useProjectStore()
const taskStore = useTaskStore()
const teamStore = useTeamStore()
const activityStore = useActivityStore()

const { collapsed, mobileOpen } = useSidebar()

onMounted(() => {
  const id = companyStore.activeCompanyId
  if (id) {
    projectStore.load(id)
    taskStore.load(id)
    teamStore.load(id)
    activityStore.load(id)
  }
})
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}

.content-area {
  margin-left: 240px;
  flex: 1;
  padding: 32px;
  min-height: 100vh;
  overflow-y: auto;
  background: var(--bg);
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.content-area.sidebar-collapsed { margin-left: 72px; }

/* Hamburger button */
.hamburger {
  display: none;
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: 200;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--surface);
  border: 1.5px solid var(--border);
  box-shadow: 0 2px 12px var(--shadow);
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 10px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.hamburger span {
  display: block;
  width: 20px;
  height: 2px;
  background: var(--text);
  border-radius: 2px;
  transition: transform 0.25s ease, opacity 0.25s ease;
  transform-origin: center;
}
.hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.hamburger.open span:nth-child(2) { opacity: 0; }
.hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

.mobile-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 150;
  backdrop-filter: blur(2px);
}

@media (max-width: 768px) {
  .hamburger { display: flex; }
  .content-area {
    margin-left: 0 !important;
    padding: 16px;
    padding-top: 70px;
  }
}
</style>
