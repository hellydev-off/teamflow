export const STATUS_LABELS = {
  backlog: 'Бэклог',
  todo: 'К выполнению',
  inprogress: 'В работе',
  review: 'На проверке',
  done: 'Выполнено'
}

export const PRIORITY_LABELS = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
  critical: 'Критический'
}

export const ROLE_LABELS = {
  owner: 'Владелец',
  admin: 'Администратор',
  manager: 'Менеджер',
  employee: 'Сотрудник'
}

export const INDUSTRY_OPTIONS = ['Технологии', 'Дизайн', 'Маркетинг', 'Финансы', 'Другое']

export const ROLE_OPTIONS = [
  { value: 'admin', label: 'Администратор' },
  { value: 'manager', label: 'Менеджер' },
  { value: 'employee', label: 'Сотрудник' }
]

export const STATUS_OPTIONS = [
  { value: 'backlog', label: 'Бэклог' },
  { value: 'todo', label: 'К выполнению' },
  { value: 'inprogress', label: 'В работе' },
  { value: 'review', label: 'На проверке' },
  { value: 'done', label: 'Выполнено' }
]

export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Низкий' },
  { value: 'medium', label: 'Средний' },
  { value: 'high', label: 'Высокий' },
  { value: 'critical', label: 'Критический' }
]
