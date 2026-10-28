import { useRouter } from 'vue-router'
import { navigateToHomeSection } from '@/lib/sectionNavigation'

export const useHomeNavigation = ({ navbarRef, beforeNavigate } = {}) => {
  const router = useRouter()

  const navigateTo = async (link, event) => {
    event?.preventDefault()
    await beforeNavigate?.()
    await navigateToHomeSection(router, link, navbarRef?.value)
  }

  return { navigateTo }
}
