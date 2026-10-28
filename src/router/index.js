import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ProductsView from '../views/ProductsView.vue'
import ProductDetailView from '../views/ProductDetailView.vue'
import AdminView from '../views/AdminView.vue'
import LoginView from '../views/LoginView.vue'
import { isAdminSessionActive } from '@/lib/auth'
import {
  getHomeNavLink,
  scrollToHomeSection,
  stopSectionScrollTracking,
} from '@/lib/sectionNavigation'
import { smoothScrollTo } from '@/lib/smoothScroll'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // Lenis controla el scroll, así que el router nunca devuelve una posición propia.
  scrollBehavior: async (to, from, savedPosition) => {
    stopSectionScrollTracking()

    if (savedPosition) {
      smoothScrollTo(savedPosition.top, { immediate: true })
    } else if (to.hash) {
      await scrollToHomeSection(getHomeNavLink(to.hash), null, { syncHistory: false })
    } else if (to.path !== from.path) {
      smoothScrollTo(0)
    }

    return false
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/products',
      name: 'products',
      component: ProductsView,
    },
    {
      path: '/products/:code',
      name: 'product-detail',
      component: ProductDetailView,
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
  ],
})

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true

  const isAuthenticated = await isAdminSessionActive()
  if (isAuthenticated) return true

  return {
    name: 'login',
    query: { redirect: to.fullPath },
  }
})

export default router
