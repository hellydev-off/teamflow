import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getCompanyData, setCompanyData } from '../utils/localStorage.js'

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

export const useActivityStore = defineStore('activity', () => {
  const _log = ref([])

  function load(companyId) {
    _log.value = getCompanyData(companyId, 'activity')
  }

  function save(companyId) {
    setCompanyData(companyId, 'activity', _log.value)
  }

  function addLog(companyId, entry) {
    const record = {
      id: uid(),
      companyId,
      ...entry,
      createdAt: new Date().toISOString()
    }
    _log.value.unshift(record)
    if (_log.value.length > 200) _log.value = _log.value.slice(0, 200)
    save(companyId)
    return record
  }

  function getRecent(n = 10) {
    return [..._log.value].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, n)
  }

  function getByTask(taskId) {
    return _log.value.filter(e => e.entityId === taskId)
  }

  return { log: _log, load, addLog, getRecent, getByTask }
})
