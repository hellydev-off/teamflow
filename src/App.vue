<template>
  <RouterView />
  <AppToast />
</template>

<script setup>
import { onMounted } from 'vue'
import { useThemeStore } from './stores/theme.js'
import AppToast from './components/ui/AppToast.vue'

const themeStore = useThemeStore()
onMounted(() => themeStore.initTheme())
</script>
