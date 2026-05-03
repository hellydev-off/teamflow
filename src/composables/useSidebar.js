import { useLocalStorage } from '@vueuse/core'
import { ref } from 'vue'

const collapsed = useLocalStorage('crm_sidebar_collapsed', false)
const mobileOpen = ref(false)

export function useSidebar() {
  return { collapsed, mobileOpen }
}
