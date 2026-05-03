import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getCompanyData, setCompanyData } from '../utils/localStorage.js'

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

const COLORS = ['#6c63ff', '#ff6584', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#14b8a6', '#f97316']

export const useTeamStore = defineStore('team', () => {
  const _employees = ref([])

  function load(companyId) {
    _employees.value = getCompanyData(companyId, 'users')
  }

  function save(companyId) {
    setCompanyData(companyId, 'users', _employees.value)
  }

  const employees = computed(() => _employees.value)

  function getByCompany(companyId) {
    return _employees.value.filter(u => u.companyId === companyId)
  }

  function getById(id) {
    return _employees.value.find(u => u.id === id) || null
  }

  function addEmployee(companyId, data) {
    const emp = {
      id: uid(),
      companyId,
      name: data.name,
      email: data.email,
      password: data.password || 'changeme123',
      role: data.role || 'employee',
      color: COLORS[_employees.value.length % COLORS.length],
      createdAt: new Date().toISOString()
    }
    _employees.value.push(emp)
    save(companyId)
    return emp
  }

  function updateEmployee(id, updates, companyId) {
    const idx = _employees.value.findIndex(u => u.id === id)
    if (idx !== -1) {
      _employees.value[idx] = { ..._employees.value[idx], ...updates }
      save(companyId)
    }
  }

  function removeEmployee(id, companyId) {
    _employees.value = _employees.value.filter(u => u.id !== id)
    save(companyId)
  }

  function initials(name) {
    if (!name) return '?'
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  }

  return { employees, load, getByCompany, getById, addEmployee, updateEmployee, removeEmployee, initials }
})
