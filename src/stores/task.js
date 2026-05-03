import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getCompanyData, setCompanyData } from '../utils/localStorage.js'
import { isOverdue, isToday } from '../utils/dateUtils.js'

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

export const useTaskStore = defineStore('task', () => {
  const _tasks = ref([])

  function load(companyId) {
    _tasks.value = getCompanyData(companyId, 'tasks')
  }

  function save(companyId) {
    setCompanyData(companyId, 'tasks', _tasks.value)
  }

  const tasks = computed(() => _tasks.value)

  function getByProject(projectId) {
    return _tasks.value.filter(t => t.projectId === projectId)
  }

  function getById(id) {
    return _tasks.value.find(t => t.id === id) || null
  }

  function getFiltered(filters = {}) {
    return _tasks.value.filter(t => {
      if (filters.search && !t.title.toLowerCase().includes(filters.search.toLowerCase())) return false
      if (filters.projectId && t.projectId !== filters.projectId) return false
      if (filters.assigneeId && t.assigneeId !== filters.assigneeId) return false
      if (filters.priority && t.priority !== filters.priority) return false
      if (filters.status && t.status !== filters.status) return false
      if (filters.deadlineFrom && t.deadline < filters.deadlineFrom) return false
      if (filters.deadlineTo && t.deadline > filters.deadlineTo) return false
      return true
    })
  }

  function createTask(companyId, data) {
    const task = {
      id: uid(),
      companyId,
      projectId: data.projectId,
      title: data.title,
      description: data.description || '',
      status: data.status || 'backlog',
      priority: data.priority || 'medium',
      assigneeId: data.assigneeId || null,
      creatorId: data.creatorId,
      deadline: data.deadline || null,
      tags: data.tags || [],
      attachments: [],
      comments: [],
      activityLog: [{ userId: data.creatorId, action: `Created task "${data.title}"`, createdAt: new Date().toISOString() }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    _tasks.value.push(task)
    save(companyId)
    return task
  }

  function updateTask(id, updates, companyId, actorId = null) {
    const idx = _tasks.value.findIndex(t => t.id === id)
    if (idx === -1) return
    const old = _tasks.value[idx]
    const updated = { ...old, ...updates, updatedAt: new Date().toISOString() }
    if (actorId && updates.status && updates.status !== old.status) {
      updated.activityLog = [...(old.activityLog || []), {
        userId: actorId,
        action: `Status changed to ${updates.status}`,
        createdAt: new Date().toISOString()
      }]
    }
    _tasks.value[idx] = updated
    save(companyId)
    return updated
  }

  function deleteTask(id, companyId) {
    _tasks.value = _tasks.value.filter(t => t.id !== id)
    save(companyId)
  }

  function moveStatus(id, status, companyId, actorId) {
    return updateTask(id, { status }, companyId, actorId)
  }

  function addComment(taskId, comment, companyId) {
    const idx = _tasks.value.findIndex(t => t.id === taskId)
    if (idx === -1) return
    const entry = { id: uid(), ...comment, createdAt: new Date().toISOString() }
    _tasks.value[idx] = {
      ..._tasks.value[idx],
      comments: [...(_tasks.value[idx].comments || []), entry],
      updatedAt: new Date().toISOString()
    }
    save(companyId)
    return entry
  }

  function addAttachment(taskId, attachment, companyId) {
    const idx = _tasks.value.findIndex(t => t.id === taskId)
    if (idx === -1) return
    _tasks.value[idx] = {
      ..._tasks.value[idx],
      attachments: [...(_tasks.value[idx].attachments || []), attachment],
      updatedAt: new Date().toISOString()
    }
    save(companyId)
  }

  function removeAttachment(taskId, attachmentName, companyId) {
    const idx = _tasks.value.findIndex(t => t.id === taskId)
    if (idx === -1) return
    _tasks.value[idx] = {
      ..._tasks.value[idx],
      attachments: _tasks.value[idx].attachments.filter(a => a.name !== attachmentName),
      updatedAt: new Date().toISOString()
    }
    save(companyId)
  }

  function getStats(tasks) {
    const list = tasks || _tasks.value
    return {
      total: list.length,
      inProgress: list.filter(t => t.status === 'inprogress').length,
      completed: list.filter(t => t.status === 'done').length,
      overdue: list.filter(t => isOverdue(t.deadline) && t.status !== 'done').length
    }
  }

  function getMyTasksToday(userId) {
    return _tasks.value.filter(t => t.assigneeId === userId && isToday(t.deadline))
  }

  return {
    tasks, load, getByProject, getById, getFiltered,
    createTask, updateTask, deleteTask, moveStatus,
    addComment, addAttachment, removeAttachment, getStats, getMyTasksToday
  }
})
