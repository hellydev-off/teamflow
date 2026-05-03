import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref('light')

  function initTheme() {
    const saved = localStorage.getItem('crm_theme')
    if (saved) {
      theme.value = saved
    } else {
      theme.value = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    document.documentElement.setAttribute('data-theme', theme.value)
  }

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    localStorage.setItem('crm_theme', theme.value)
    document.documentElement.setAttribute('data-theme', theme.value)
  }

  return { theme, initTheme, toggleTheme }
})
