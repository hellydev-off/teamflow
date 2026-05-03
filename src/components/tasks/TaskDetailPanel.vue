<template>
  <Teleport to="body">
    <Transition name="slide-right">
      <div v-if="task" class="panel-overlay" @mousedown.self="$emit('close')">
        <div class="panel" ref="panelEl">
          <div class="panel-header">
            <div
              class="panel-title"
              contenteditable
              @blur="updateTitle"
              @keydown.enter.prevent="$event.target.blur()"
              ref="titleEl"
            >{{ task.title }}</div>
            <button class="btn btn-icon btn-ghost close-btn" @click="$emit('close')">
              <AppIcon name="close" :size="18" />
            </button>
          </div>

          <div class="panel-body">
            <div class="section">
              <label class="field-label">Описание</label>
              <div v-if="!editingDesc" class="desc-view" @click="startEditDesc">
                {{ task.description || 'Нажмите для добавления описания...' }}
              </div>
              <AppInput
                v-else
                type="textarea"
                v-model="descVal"
                @blur="saveDesc"
                @keydown.esc="editingDesc = false"
                ref="descInput"
              />
            </div>

            <div class="meta-grid">
              <div class="meta-field">
                <label class="field-label">Статус</label>
                <AppSelect :model-value="task.status" @update:model-value="updateField('status', $event)" :options="statusOptions" />
              </div>
              <div class="meta-field">
                <label class="field-label">Приоритет</label>
                <AppSelect :model-value="task.priority" @update:model-value="updateField('priority', $event)" :options="priorityOptions" />
              </div>
              <div class="meta-field">
                <label class="field-label">Исполнитель</label>
                <AppSelect :model-value="task.assigneeId || ''" @update:model-value="updateField('assigneeId', $event || null)" :options="assigneeOptions" placeholder="Не назначено" clearable />
              </div>
              <div class="meta-field">
                <label class="field-label">Срок</label>
                <AppInput type="date" :model-value="task.deadline || ''" @update:model-value="updateField('deadline', $event || null)" />
              </div>
            </div>

            <div class="section">
              <label class="field-label">Теги</label>
              <div class="tags-wrap">
                <span v-for="tg in task.tags" :key="tg" class="tag-chip tag-removable">
                  {{ tg }}
                  <button @click="removeTag(tg)"><AppIcon name="close" :size="10" /></button>
                </span>
                <input
                  class="tag-input"
                  v-model="tagInput"
                  placeholder="Добавить тег..."
                  @keydown.enter.prevent="addTag"
                />
              </div>
            </div>

            <div class="section">
              <div class="section-header-row">
                <label class="field-label">Вложения</label>
                <button class="btn btn-ghost btn-sm attach-btn" @click="mockAttach">
                  <AppIcon name="attach" :size="13" />
                  Прикрепить файл
                </button>
              </div>
              <div v-if="task.attachments?.length" class="attachments">
                <div v-for="att in task.attachments" :key="att.name" class="attachment">
                  <AppIcon name="attach" :size="14" color="var(--text-muted)" />
                  <span class="att-name">{{ att.name }}</span>
                  <span class="text-muted text-sm">{{ formatSize(att.size) }}</span>
                  <button class="btn btn-icon btn-ghost remove-att" @click="removeAtt(att.name)">
                    <AppIcon name="close" :size="12" />
                  </button>
                </div>
              </div>
            </div>

            <div class="section comments-section">
              <label class="field-label">Комментарии ({{ task.comments?.length || 0 }})</label>
              <div class="comments-list" ref="commentsEl">
                <div v-for="c in task.comments" :key="c.id" class="comment">
                  <div class="avatar avatar-sm" :style="{ background: getUser(c.userId)?.color }">
                    {{ initials(getUser(c.userId)?.name) }}
                  </div>
                  <div class="comment-body">
                    <div class="comment-meta">
                      <strong>{{ getUser(c.userId)?.name || 'Неизвестно' }}</strong>
                      <span class="text-muted text-sm">{{ timeAgo(c.createdAt) }}</span>
                    </div>
                    <div class="comment-text">{{ c.text }}</div>
                  </div>
                </div>
                <div v-if="!task.comments?.length" class="text-muted text-sm no-comments">Комментариев пока нет.</div>
              </div>
              <div class="comment-input-wrap">
                <div class="avatar avatar-sm" :style="{ background: currentUser?.color }">{{ initials(currentUser?.name) }}</div>
                <AppInput v-model="commentText" placeholder="Написать комментарий..." wrap-class="comment-input-field" @keydown.enter.prevent="submitComment" />
                <button class="btn btn-primary btn-sm send-btn" @click="submitComment">
                  <AppIcon name="send" :size="13" color="#fff" />
                </button>
              </div>
            </div>

            <div class="section">
              <label class="field-label">Активность</label>
              <div class="activity-log">
                <div v-for="(entry, i) in (task.activityLog || []).slice().reverse()" :key="i" class="activity-entry">
                  <div class="avatar avatar-sm" :style="{ background: getUser(entry.userId)?.color }">
                    {{ initials(getUser(entry.userId)?.name) }}
                  </div>
                  <div class="entry-text">
                    <span class="text-sm font-med">{{ getUser(entry.userId)?.name || 'Система' }}</span>
                    <span class="text-sm text-muted"> — {{ entry.action }}</span>
                    <div class="text-sm text-muted">{{ timeAgo(entry.createdAt) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useTaskStore } from '../../stores/task.js'
import { useTeamStore } from '../../stores/team.js'
import { useAuthStore } from '../../stores/auth.js'
import { useCompanyStore } from '../../stores/company.js'
import { timeAgo } from '../../utils/dateUtils.js'
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '../../utils/i18n.js'
import AppIcon from '../ui/AppIcon.vue'
import AppInput from '../ui/AppInput.vue'
import AppSelect from '../ui/AppSelect.vue'

const props = defineProps({ task: Object })
const emit = defineEmits(['close', 'update'])

const taskStore = useTaskStore()
const teamStore = useTeamStore()
const authStore = useAuthStore()
const companyStore = useCompanyStore()

const currentUser = computed(() => authStore.currentUser)
const employees = computed(() => teamStore.employees)
const assigneeOptions = computed(() => employees.value.map(u => ({ value: u.id, label: u.name })))
const statusOptions = STATUS_OPTIONS
const priorityOptions = PRIORITY_OPTIONS

const editingDesc = ref(false)
const descVal = ref('')
const tagInput = ref('')
const commentText = ref('')
const commentsEl = ref(null)
const panelEl = ref(null)
const descInput = ref(null)

watch(() => props.task?.id, () => {
  descVal.value = props.task?.description || ''
  editingDesc.value = false
})

function getUser(id) { return id ? teamStore.getById(id) : null }
function initials(name) { return name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?' }

function updateField(field, value) {
  if (!props.task) return
  const cid = companyStore.activeCompanyId
  const uid = authStore.currentUser?.id
  taskStore.updateTask(props.task.id, { [field]: value }, cid, field === 'status' ? uid : null)
  emit('update')
}

function updateTitle(e) {
  const title = e.target.innerText.trim()
  if (title && title !== props.task.title) updateField('title', title)
}

async function startEditDesc() {
  descVal.value = props.task?.description || ''
  editingDesc.value = true
  await nextTick()
  descInput.value?.$el?.querySelector('textarea')?.focus()
}
function saveDesc() {
  editingDesc.value = false
  if (descVal.value !== props.task?.description) updateField('description', descVal.value)
}

function addTag() {
  const t = tagInput.value.trim().replace(',', '')
  if (!t || props.task.tags?.includes(t)) { tagInput.value = ''; return }
  updateField('tags', [...(props.task.tags || []), t])
  tagInput.value = ''
}
function removeTag(tag) { updateField('tags', (props.task.tags || []).filter(t => t !== tag)) }

function mockAttach() {
  const name = `файл-${Date.now()}.pdf`
  taskStore.addAttachment(props.task.id, { name, size: Math.floor(Math.random() * 500000), type: 'application/pdf' }, companyStore.activeCompanyId)
  emit('update')
}
function removeAtt(name) {
  taskStore.removeAttachment(props.task.id, name, companyStore.activeCompanyId)
  emit('update')
}

async function submitComment() {
  const text = commentText.value.trim()
  if (!text) return
  taskStore.addComment(props.task.id, { userId: authStore.currentUser?.id, text }, companyStore.activeCompanyId)
  commentText.value = ''
  emit('update')
  await nextTick()
  commentsEl.value?.scrollTo({ top: commentsEl.value.scrollHeight, behavior: 'smooth' })
}

function formatSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + 'Б'
  if (bytes < 1048576) return (bytes / 1024).toFixed(0) + 'КБ'
  return (bytes / 1048576).toFixed(1) + 'МБ'
}

function onKeydown(e) { if (e.key === 'Escape') emit('close') }
onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.panel-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.3);
  z-index: 200;
  display: flex; justify-content: flex-end;
  backdrop-filter: blur(2px);
}
.panel {
  width: 480px; height: 100vh;
  background: var(--surface);
  border-left: 1px solid var(--border);
  box-shadow: -12px 0 48px var(--shadow);
  display: flex; flex-direction: column;
  overflow: hidden;
}
.panel-header {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 20px 20px 16px;
  border-bottom: 1px solid var(--border); flex-shrink: 0;
}
.panel-title {
  flex: 1; font-size: 16px; font-weight: 600; line-height: 1.4;
  outline: none; cursor: text;
  border-radius: var(--radius-sm); padding: 3px 6px; margin: -3px -6px;
  transition: background var(--transition);
}
.panel-title:focus { background: var(--surface-2); }
.close-btn { flex-shrink: 0; }
.panel-body { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 20px; }
.field-label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.6px; }
.section { display: flex; flex-direction: column; gap: 8px; }
.section-header-row { display: flex; align-items: center; justify-content: space-between; }
.desc-view {
  padding: 10px 12px; border: 1.5px solid var(--border); border-radius: var(--radius-md);
  min-height: 60px; font-size: 13px; color: var(--text-muted);
  cursor: text; line-height: 1.5; transition: border-color var(--transition);
}
.desc-view:hover { border-color: var(--accent); }
.meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.meta-field { display: flex; flex-direction: column; gap: 6px; }
.tags-wrap { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; padding: 8px; background: var(--surface-2); border-radius: var(--radius-md); }
.tag-removable { display: flex; align-items: center; gap: 4px; }
.tag-removable button { display: flex; opacity: 0.6; padding: 0; }
.tag-removable button:hover { opacity: 1; }
.tag-input { border: none; outline: none; background: transparent; font-size: 13px; min-width: 100px; color: var(--text); font-family: inherit; }
.attachments { display: flex; flex-direction: column; gap: 6px; }
.attachment { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius-md); font-size: 13px; }
.att-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.remove-att { margin-left: auto; color: var(--danger) !important; }
.attach-btn { gap: 5px; }
.comments-section { flex: 1; }
.comments-list { max-height: 200px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; padding: 4px 0; }
.no-comments { padding: 8px 0; }
.comment { display: flex; gap: 10px; }
.comment-body { flex: 1; background: var(--surface-2); border-radius: 0 var(--radius-md) var(--radius-md) var(--radius-md); padding: 10px 14px; }
.comment-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.comment-text { font-size: 13px; line-height: 1.5; }
.comment-input-wrap { display: flex; align-items: center; gap: 8px; margin-top: 10px; border-top: 1px solid var(--border); padding-top: 12px; }
.comment-input-wrap :deep(.comment-input-field) { flex: 1; }
.send-btn { flex-shrink: 0; }
.activity-log { display: flex; flex-direction: column; gap: 10px; }
.activity-entry { display: flex; gap: 8px; align-items: flex-start; }
.entry-text { flex: 1; }
.font-med { font-weight: 500; }

@media (max-width: 768px) {
  .panel-overlay { align-items: flex-end; justify-content: center; }
  .panel { width: 100vw; height: 92vh; border-left: none; border-radius: var(--radius-xl) var(--radius-xl) 0 0; }
}
</style>
