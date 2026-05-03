import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { lsGet, lsSet, lsRemove, getCompanyData, setCompanyData } from '../utils/localStorage.js'

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

const COLORS = ['#3b82f6', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316']

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref(lsGet('crm_current_user'))

  const isAuthenticated = computed(() => !!currentUser.value)

  function hasRole(...roles) {
    return currentUser.value && roles.includes(currentUser.value.role)
  }

  function login(email, password) {
    const companies = lsGet('crm_companies') || []
    for (const company of companies) {
      const users = getCompanyData(company.id, 'users')
      const user = users.find(u => u.email === email && u.password === password)
      if (user) {
        currentUser.value = user
        lsSet('crm_current_user', user)
        lsSet('crm_active_company', company.id)
        return { ok: true, user }
      }
    }
    return { ok: false, error: 'Неверный email или пароль' }
  }

  // Register without a company — user will complete onboarding next
  function register(name, email, password) {
    const companies = lsGet('crm_companies') || []
    for (const company of companies) {
      const users = getCompanyData(company.id, 'users')
      if (users.find(u => u.email === email)) {
        return { ok: false, error: 'Email уже зарегистрирован' }
      }
    }
    const user = {
      id: uid(),
      companyId: null,
      name,
      email,
      password,
      role: 'owner',
      color: COLORS[0],
      createdAt: new Date().toISOString()
    }
    currentUser.value = user
    lsSet('crm_current_user', user)
    return { ok: true, user }
  }

  // Called after onboarding completes — binds user to the new company
  function finalizeWithCompany(companyId, updatedUser) {
    currentUser.value = updatedUser
    lsSet('crm_current_user', updatedUser)
    lsSet('crm_active_company', companyId)
  }

  function logout() {
    currentUser.value = null
    lsRemove('crm_current_user')
    lsRemove('crm_active_company')
  }

  function refreshCurrentUser(companyId) {
    if (!currentUser.value) return
    const users = getCompanyData(companyId, 'users')
    const updated = users.find(u => u.id === currentUser.value.id)
    if (updated) {
      currentUser.value = updated
      lsSet('crm_current_user', updated)
    }
  }

  return { currentUser, isAuthenticated, hasRole, login, logout, register, finalizeWithCompany, refreshCurrentUser }
})
