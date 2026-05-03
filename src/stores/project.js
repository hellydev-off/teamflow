import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getCompanyData, setCompanyData } from '../utils/localStorage.js'
import { useCompanyStore } from './company.js'

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

export const useProjectStore = defineStore('project', () => {
  const _projects = ref([])

  const companyStore = useCompanyStore()

  function load(companyId) {
    _projects.value = getCompanyData(companyId, 'projects')
  }

  function save(companyId) {
    setCompanyData(companyId, 'projects', _projects.value)
  }

  const projects = computed(() => _projects.value)

  function getByCompany(companyId) {
    return _projects.value.filter(p => p.companyId === companyId)
  }

  function getById(id) {
    return _projects.value.find(p => p.id === id) || null
  }

  function createProject(companyId, data) {
    const project = {
      id: uid(),
      companyId,
      name: data.name,
      description: data.description || '',
      color: data.color || '#6c63ff',
      status: 'active',
      memberIds: data.memberIds || [],
      createdAt: new Date().toISOString()
    }
    _projects.value.push(project)
    save(companyId)
    return project
  }

  function updateProject(id, updates, companyId) {
    const idx = _projects.value.findIndex(p => p.id === id)
    if (idx !== -1) {
      _projects.value[idx] = { ..._projects.value[idx], ...updates }
      save(companyId)
    }
  }

  function deleteProject(id, companyId) {
    _projects.value = _projects.value.filter(p => p.id !== id)
    save(companyId)
  }

  function getStats(projectId, tasks) {
    const projectTasks = tasks.filter(t => t.projectId === projectId)
    const total = projectTasks.length
    const done = projectTasks.filter(t => t.status === 'done').length
    const inProgress = projectTasks.filter(t => t.status === 'inprogress').length
    return {
      total,
      done,
      inProgress,
      percent: total > 0 ? Math.round((done / total) * 100) : 0
    }
  }

  return { projects, load, getByCompany, getById, createProject, updateProject, deleteProject, getStats }
})
