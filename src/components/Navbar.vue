<script setup>
import { nextTick, ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import CornerAccents from '@/components/ui/CornerAccents.vue'
import { useHomeNavigation } from '@/composables/useHomeNavigation'
import { logoutAdmin } from '@/lib/auth'
import { CONTACT_EMAIL, CONTACT_PHONE } from '@/lib/contact'
import { gsap } from '@/lib/gsap'
import { isDesktopViewport } from '@/lib/media'
import { getNavLinkHref, homeNavLinks } from '@/lib/sectionNavigation'
import { setSmoothScrollLocked } from '@/lib/smoothScroll'

const SCROLLED_THRESHOLD_PX = 8
// Tras un scroll el stack fijado sigue moviéndose (scrub), así que el color del logo
// se sigue recalculando un rato más para acompañar ese movimiento.
const LOGO_THEME_TRACKING_MS = 1000
const VIEWPORT_EVENTS = ['scroll', 'resize', 'orientationchange']
const LINK_HOVER_TWEEN = { duration: 0.32, ease: 'power3.out' }

const isMenuOpen = ref(false)
const isInHeader = ref(true)
const hasScrolled = ref(false)
const navbarRef = ref(null)
const menuPanelRef = ref(null)
const router = useRouter()
const route = useRoute()
let animationFrameId = null
let logoThemeTrackingUntil = 0
let menuLinksTimeline = null

const closeMenu = () => {
  isMenuOpen.value = false
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

// Lenis queda detenido mientras el menú está abierto: hay que cerrarlo (y esperar a
// que el watcher lo reactive) antes de navegar para que el scroll pueda ejecutarse.
const { navigateTo } = useHomeNavigation({
  navbarRef,
  beforeNavigate: async () => {
    closeMenu()
    await nextTick()
  },
})

const goToHome = () => navigateTo(homeNavLinks[0])

const goBack = async () => {
  if (route.name === 'product-detail') {
    await router.push('/products')
  } else if (route.name === 'products') {
    await router.push('/')
  }
}

const handleAdminLogout = async () => {
  await logoutAdmin()
  await router.push('/login')
}

const getMenuLinks = () =>
  Array.from(menuPanelRef.value?.querySelectorAll('[data-navbar-link]') ?? [])

const animateMenuLinksIn = async () => {
  if (!isDesktopViewport()) return

  await nextTick()

  const links = getMenuLinks()
  if (!links.length) return

  menuLinksTimeline?.kill()
  menuLinksTimeline = gsap.timeline().fromTo(
    links,
    { autoAlpha: 0, x: 28, skewX: 4 },
    {
      autoAlpha: 1,
      x: 0,
      skewX: 0,
      duration: 0.62,
      ease: 'power3.out',
      stagger: 0.07,
      clearProps: 'transform,opacity,visibility',
    },
  )
}

const handleLinkEnter = (event) => {
  if (!isDesktopViewport()) return

  gsap.to(event.currentTarget, { ...LINK_HOVER_TWEEN, x: 10, color: '#FF9933' })
}

const handleLinkLeave = (event) => {
  if (!isDesktopViewport()) return

  gsap.to(event.currentTarget, {
    ...LINK_HOVER_TWEEN,
    x: 0,
    color: '#ffffff',
    clearProps: 'transform,color',
  })
}

watch(isMenuOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
  setSmoothScrollLocked(open)

  if (open) {
    animateMenuLinksIn()
  } else {
    menuLinksTimeline?.kill()
    gsap.set(getMenuLinks(), { clearProps: 'transform,opacity,visibility,color' })
  }
})

const updateLogoTheme = () => {
  const navbarElement = navbarRef.value
  if (!navbarElement) return

  hasScrolled.value = window.scrollY > SCROLLED_THRESHOLD_PX

  if (route.path === '/' && !hasScrolled.value) {
    isInHeader.value = true
    return
  }

  const navbarBounds = navbarElement.getBoundingClientRect()
  const sampleX = Math.min(window.innerWidth - 1, Math.max(1, navbarBounds.left + 32))
  const sampleY = Math.min(window.innerHeight - 1, navbarBounds.bottom + 8)
  const elementBehindNavbar = document.elementFromPoint(sampleX, sampleY)

  isInHeader.value = Boolean(elementBehindNavbar?.closest('header'))
}

const trackLogoTheme = () => {
  updateLogoTheme()

  animationFrameId =
    performance.now() < logoThemeTrackingUntil ? window.requestAnimationFrame(trackLogoTheme) : null
}

const requestLogoThemeUpdate = () => {
  logoThemeTrackingUntil = performance.now() + LOGO_THEME_TRACKING_MS
  if (animationFrameId) return
  animationFrameId = window.requestAnimationFrame(trackLogoTheme)
}

watch(() => route.fullPath, requestLogoThemeUpdate, { flush: 'post' })

onMounted(() => {
  updateLogoTheme()
  VIEWPORT_EVENTS.forEach((eventName) => {
    window.addEventListener(eventName, requestLogoThemeUpdate, { passive: true })
  })
})

onUnmounted(() => {
  document.body.style.overflow = ''
  setSmoothScrollLocked(false)
  menuLinksTimeline?.kill()
  VIEWPORT_EVENTS.forEach((eventName) => {
    window.removeEventListener(eventName, requestLogoThemeUpdate)
  })

  if (animationFrameId) {
    window.cancelAnimationFrame(animationFrameId)
  }
})
</script>

<template>
  <nav
    ref="navbarRef"
    :class="[
      'pointer-events-none fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-6 transition-colors duration-300 lg:px-14 lg:py-10',
      isInHeader
        ? hasScrolled
          ? 'bg-[#f3f3f3] lg:bg-transparent'
          : 'bg-transparent'
        : isMenuOpen
          ? 'bg-transparent'
          : 'bg-[#f3f3f3]',
    ]"
  >

    <!-- Logo -->
    <button type="button" aria-label="Ir al inicio" @click="goToHome" class="pointer-events-auto flex items-center">
      <img
        :src="
          isMenuOpen || (isInHeader && !hasScrolled)
            ? '/LogoBlancoNaranja.png'
            : '/LogoGris.png'
        "
        alt="Logo Sai"
        class="h-7 object-contain lg:hidden"
      />
      <img
        :src="isMenuOpen || isInHeader ? '/LogoBlancoNaranja.png' : '/LogoGris.png'"
        alt="Logo Sai"
        class="hidden h-10 object-contain lg:block"
      />
    </button>

    <!-- Contenedor de botones -->
    <div class="pointer-events-auto flex items-center gap-3 lg:gap-4">
      <!-- Botón cerrar sesión (solo en admin) -->
      <button
        v-if="route.name === 'admin'"
        type="button"
        aria-label="Cerrar sesión"
        @click="handleAdminLogout"
        class="relative z-50 flex h-9 items-center px-3 py-2 text-[10px] font-semibold tracking-widest text-brand-orange lg:h-10 lg:px-4 lg:text-xs"
      >
        <CornerAccents />

        SALIR
      </button>

      <!-- Flecha para volver (solo en productos) -->
      <button
        v-if="route.name === 'products' || route.name === 'product-detail'"
        type="button"
        aria-label="Volver"
        @click="goBack"
        class="relative z-50 flex h-9 w-9 items-center justify-center text-brand-orange/90 transition hover:text-brand-orange lg:h-10 lg:w-10"
      >
        <CornerAccents />

        <span class="text-2xl font-light">←</span>
      </button>

      <!-- Botón menú -->
      <button
        type="button"
        aria-label="Abrir menú"
        @click="toggleMenu"
        :class="[
          'relative z-50 flex h-9 w-9 items-center justify-center text-brand-orange/90 transition hover:text-brand-orange lg:h-10 lg:w-10',
          isMenuOpen ? 'bg-black text-brand-orange' : '',
        ]"
      >
        <CornerAccents />

        <span v-if="!isMenuOpen" class="flex flex-col gap-1.5">
          <span class="h-[2px] w-5 bg-current"></span>
          <span class="h-[2px] w-5 bg-current"></span>
          <span class="h-[2px] w-5 bg-current"></span>
        </span>

        <span v-else class="text-2xl font-light">✕</span>
      </button>
    </div>
  </nav>

  <!-- Overlay -->
  <div
    v-if="isMenuOpen"
    @click="closeMenu"
    class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
  ></div>

  <!-- Sidebar -->
  <aside
    ref="menuPanelRef"
    :class="[
      'fixed inset-0 z-40 w-screen max-w-none transform bg-black transition-all duration-300 ease-in-out lg:inset-auto lg:right-13 lg:top-9 lg:h-auto lg:w-[calc(100vw-3.5rem)] lg:max-w-[420px] lg:bg-transparent',
      isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 pointer-events-none opacity-0',
    ]"
  >
    <div class="flex min-h-full items-center justify-center bg-black px-6 py-16 text-white lg:block lg:min-h-0 lg:px-10 lg:pb-18 lg:pt-20">
      <nav class="space-y-6 text-center lg:space-y-5 lg:text-left">
        <a
          v-for="link in homeNavLinks"
          :key="link.label"
          :href="getNavLinkHref(link)"
          @click="navigateTo(link, $event)"
          @mouseenter="handleLinkEnter"
          @mouseleave="handleLinkLeave"
          data-navbar-link
          class="block text-[2.2rem] font-light uppercase leading-none tracking-tight text-white transition hover:text-brand-orange lg:text-3xl"
        >
          {{ link.label }}
        </a>
      </nav>
    </div>

    <div class="mt-3 hidden bg-black px-6 py-6 text-white lg:mt-4 lg:block lg:px-10 lg:py-8">
      <div class="space-y-3 text-base font-light leading-tight text-white/75 lg:space-y-4 lg:text-xl">
        <a :href="CONTACT_EMAIL.href" class="block transition hover:text-brand-orange">
          {{ CONTACT_EMAIL.value }}
        </a>
        <a
          :href="CONTACT_PHONE.href"
          target="_blank"
          rel="noopener noreferrer"
          class="block transition hover:text-brand-orange"
        >
          {{ CONTACT_PHONE.value }}
        </a>
      </div>
    </div>
  </aside>
</template>
