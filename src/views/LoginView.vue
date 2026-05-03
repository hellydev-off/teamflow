<template>
  <div class="auth-bg">
    <div class="auth-card card">
      <div class="auth-brand">
        <div class="brand-icon">
          <AppIcon name="building" :size="28" color="#fff" />
        </div>
        <div>
          <h2 class="auth-title">TeamFlow CRM</h2>
          <p class="auth-sub">Управляйте командой и проектами</p>
        </div>
      </div>

      <div class="tab-toggle">
        <button :class="{ active: tab === 'login' }" @click="tab = 'login'">Войти</button>
        <button :class="{ active: tab === 'register' }" @click="tab = 'register'">Регистрация</button>
      </div>

      <!-- Login -->
      <form v-if="tab === 'login'" @submit.prevent="doLogin" class="auth-form">
        <div class="form-group">
          <label>Email</label>
          <AppInput v-model="email" type="email" placeholder="you@example.com" :error="!!errors.email">
            <template #prefix><AppIcon name="mail" :size="16" color="var(--text-muted)" /></template>
          </AppInput>
          <span v-if="errors.email" class="err">{{ errors.email }}</span>
        </div>
        <div class="form-group">
          <label>Пароль</label>
          <AppInput v-model="password" type="password" placeholder="••••••••" :error="!!errors.password">
            <template #prefix><AppIcon name="lock" :size="16" color="var(--text-muted)" /></template>
          </AppInput>
          <span v-if="errors.password" class="err">{{ errors.password }}</span>
        </div>
        <div v-if="errors.form" class="err form-err">{{ errors.form }}</div>
        <button type="submit" class="btn btn-primary w-full">Войти</button>
      </form>

      <!-- Register -->
      <form v-else @submit.prevent="doRegister" class="auth-form">
        <div class="form-group">
          <label>Полное имя</label>
          <AppInput v-model="name" type="text" placeholder="Иван Иванов" :error="!!errors.name">
            <template #prefix><AppIcon name="user" :size="16" color="var(--text-muted)" /></template>
          </AppInput>
          <span v-if="errors.name" class="err">{{ errors.name }}</span>
        </div>
        <div class="form-group">
          <label>Email</label>
          <AppInput v-model="email" type="email" placeholder="you@example.com" :error="!!errors.email">
            <template #prefix><AppIcon name="mail" :size="16" color="var(--text-muted)" /></template>
          </AppInput>
          <span v-if="errors.email" class="err">{{ errors.email }}</span>
        </div>
        <div class="form-group">
          <label>Пароль</label>
          <AppInput v-model="password" type="password" placeholder="Минимум 6 символов" :error="!!errors.password">
            <template #prefix><AppIcon name="lock" :size="16" color="var(--text-muted)" /></template>
          </AppInput>
          <span v-if="errors.password" class="err">{{ errors.password }}</span>
        </div>
        <div v-if="errors.form" class="err form-err">{{ errors.form }}</div>
        <button type="submit" class="btn btn-primary w-full">Создать аккаунт</button>
        <p class="register-hint">После регистрации вы настроите компанию в мастере</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import AppIcon from '../components/ui/AppIcon.vue'
import AppInput from '../components/ui/AppInput.vue'

const router = useRouter()
const authStore = useAuthStore()

const tab = ref('login')
const email = ref('')
const password = ref('')
const name = ref('')
const errors = ref({})

function validate() {
  errors.value = {}
  if (tab.value === 'register' && !name.value.trim()) errors.value.name = 'Введите имя'
  if (!email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.value.email = 'Введите корректный email'
  if (password.value.length < 6) errors.value.password = 'Минимум 6 символов'
  return Object.keys(errors.value).length === 0
}

function doLogin() {
  if (!validate()) return
  const result = authStore.login(email.value, password.value)
  if (result.ok) router.push('/dashboard')
  else errors.value.form = result.error
}

function doRegister() {
  if (!validate()) return
  const result = authStore.register(name.value, email.value, password.value)
  if (result.ok) router.push('/onboarding')
  else errors.value.form = result.error
}
</script>

<style scoped>
.auth-bg {
  min-height: 100vh;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.auth-card {
  width: 100%;
  max-width: 420px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.auth-brand { display: flex; align-items: center; gap: 14px; }
.brand-icon {
  width: 52px; height: 52px;
  background: var(--accent-gradient);
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(59,130,246,0.35);
}
.auth-title { font-size: 20px; font-weight: 700; margin-bottom: 2px; }
.auth-sub { color: var(--text-muted); font-size: 13px; }
.tab-toggle {
  display: flex;
  background: var(--surface-2);
  border-radius: var(--radius-md);
  padding: 4px; gap: 4px;
}
.tab-toggle button {
  flex: 1; padding: 8px;
  border-radius: calc(var(--radius-md) - 4px);
  font-size: 13px; font-weight: 500;
  color: var(--text-muted);
  transition: all var(--transition);
  min-height: 44px;
}
.tab-toggle button.active {
  background: var(--surface); color: var(--text);
  box-shadow: 0 1px 6px var(--shadow); font-weight: 600;
}
.auth-form { display: flex; flex-direction: column; gap: 16px; }
.err { color: var(--danger); font-size: 12px; }
.form-err {
  text-align: center; padding: 10px;
  background: rgba(239,68,68,0.08); border-radius: var(--radius-md);
  font-size: 13px;
}
.register-hint { text-align: center; font-size: 12px; color: var(--text-muted); }

@media (max-width: 768px) {
  .auth-card { padding: 28px 20px; }
}
</style>
