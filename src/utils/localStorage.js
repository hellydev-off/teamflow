const PREFIX = 'crm'

export function lsGet(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function lsSet(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function lsRemove(key) {
  localStorage.removeItem(key)
}

export function companyKey(companyId, entity) {
  return `${PREFIX}_${companyId}_${entity}`
}

export function getCompanyData(companyId, entity) {
  return lsGet(companyKey(companyId, entity)) || []
}

export function setCompanyData(companyId, entity, data) {
  lsSet(companyKey(companyId, entity), data)
}

export function removeCompanyData(companyId) {
  const entities = ['projects', 'tasks', 'users', 'activity']
  entities.forEach(e => lsRemove(companyKey(companyId, e)))
}
