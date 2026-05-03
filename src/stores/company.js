import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { lsGet, lsSet } from '../utils/localStorage.js'

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

export const useCompanyStore = defineStore('company', () => {
  const companies = ref(lsGet('crm_companies') || [])
  const activeCompanyId = ref(lsGet('crm_active_company') || null)

  const currentCompany = computed(() =>
    companies.value.find(c => c.id === activeCompanyId.value) || null
  )

  function saveCompanies() {
    lsSet('crm_companies', companies.value)
  }

  function createCompany(name, industry, logoEmoji, ownerId) {
    const company = {
      id: uid(),
      name,
      industry,
      logoEmoji,
      createdAt: new Date().toISOString(),
      ownerId
    }
    companies.value.push(company)
    saveCompanies()
    return company
  }

  function switchCompany(id) {
    activeCompanyId.value = id
    lsSet('crm_active_company', id)
  }

  function updateCompany(id, updates) {
    const idx = companies.value.findIndex(c => c.id === id)
    if (idx !== -1) {
      companies.value[idx] = { ...companies.value[idx], ...updates }
      saveCompanies()
    }
  }

  function removeCompany(id) {
    companies.value = companies.value.filter(c => c.id !== id)
    saveCompanies()
  }

  function hasCompany() {
    return companies.value.length > 0
  }

  return { companies, activeCompanyId, currentCompany, createCompany, switchCompany, updateCompany, removeCompany, hasCompany, saveCompanies }
})
