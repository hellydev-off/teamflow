import { createRouter, createWebHistory } from 'vue-router'
import { lsGet } from '../utils/localStorage.js'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/login', name: 'login', component: () => import('../views/LoginView.vue'), meta: { public: true } },
  { path: '/onboarding', name: 'onboarding', component: () => import('../views/OnboardingView.vue'), meta: { public: true } },
  {
    path: '/',
    component: () => import('../components/layout/AppLayout.vue'),
    children: [
      { path: 'dashboard', name: 'dashboard', component: () => import('../views/DashboardView.vue') },
      { path: 'projects', name: 'projects', component: () => import('../views/ProjectsView.vue') },
      { path: 'projects/:id', name: 'project-detail', component: () => import('../views/ProjectDetailView.vue') },
      { path: 'tasks', name: 'tasks', component: () => import('../views/TasksView.vue') },
      { path: 'team', name: 'team', component: () => import('../views/TeamView.vue') },
      { path: 'analytics', name: 'analytics', component: () => import('../views/AnalyticsView.vue') },
      {
        path: 'settings', name: 'settings',
        component: () => import('../views/SettingsView.vue'),
        meta: { roles: ['owner', 'admin'] }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const user = lsGet('crm_current_user')
  const companies = lsGet('crm_companies') || []

  if (to.meta.public) {
    // Unauthenticated users cannot access onboarding directly — must register first
    if (to.path === '/onboarding' && !user) return next('/login')

    // Authenticated users on login → redirect appropriately
    if (user && to.path === '/login') {
      if (!user.companyId || !companies.length) return next('/onboarding')
      return next('/dashboard')
    }
    return next()
  }

  // Protected routes: must be logged in
  if (!user) return next('/login')

  // Must have completed onboarding (have a company)
  if (!user.companyId || !companies.length) return next('/onboarding')

  // Role-based access
  if (to.meta.roles && !to.meta.roles.includes(user.role)) {
    return next('/dashboard')
  }

  next()
})

export default router
