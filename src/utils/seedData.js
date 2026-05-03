import { setCompanyData } from './localStorage.js'

const COLORS = ['#3b82f6', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316']

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

// Creates only the company users (owner + wizard team members). No demo tasks or projects.
export function initCompanyData(company, ownerUser, teamRows) {
  const companyId = company.id

  const ownerRecord = {
    id: ownerUser.id,
    companyId,
    name: ownerUser.name,
    email: ownerUser.email,
    password: ownerUser.password,
    role: 'owner',
    color: COLORS[0],
    createdAt: ownerUser.createdAt || new Date().toISOString()
  }

  const teamMembers = teamRows
    .filter(r => r.name && r.name.trim())
    .map((r, i) => ({
      id: uid(),
      companyId,
      name: r.name.trim(),
      email: r.email || `user${i + 1}@company.com`,
      password: 'changeme123',
      role: r.role || 'employee',
      color: COLORS[(i + 1) % COLORS.length],
      createdAt: new Date().toISOString()
    }))

  const users = [ownerRecord, ...teamMembers]
  setCompanyData(companyId, 'users', users)
  setCompanyData(companyId, 'projects', [])
  setCompanyData(companyId, 'tasks', [])
  setCompanyData(companyId, 'activity', [])

  return { users }
}
