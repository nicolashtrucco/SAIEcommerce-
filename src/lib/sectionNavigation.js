import { isNavigationFailure, NavigationFailureType } from 'vue-router'
import { isDesktopViewport } from '@/lib/media'
import { refreshSmoothScroll, smoothScrollTo } from '@/lib/smoothScroll'

// `stackIndex` indica el panel del stack fijado (pin) en escritorio al que apunta el link.
export const homeNavLinks = [
  { label: 'Inicio', href: '#inicio', stackIndex: 0 },
  { label: 'Nosotros', href: '#nosotros', stackIndex: 1 },
  { label: 'Productos', path: '/products' },
  { label: 'Contacto', href: '#contacto' },
]

export const getHomeNavLink = (hash) =>
  homeNavLinks.find((link) => link.href === hash) ?? { href: hash }

export const getNavLinkHref = (link) => link.path || link.href

const DEFAULT_NAVBAR_HEIGHT = 80
const MAX_TARGET_WAIT_FRAMES = 120
const MAX_STACK_WAIT_FRAMES = 30
const LAYOUT_SETTLE_TIMEOUT_MS = 4000
const USER_SCROLL_EVENTS = ['wheel', 'touchstart', 'keydown']

const nextFrame = () => new Promise((resolve) => window.requestAnimationFrame(resolve))

const waitForFrames = async (count) => {
  for (let frame = 0; frame < count; frame += 1) {
    await nextFrame()
  }
}

const waitFor = async (getValue, maxFrames) => {
  for (let frame = 0; frame < maxFrames; frame += 1) {
    const value = getValue()
    if (value) return value

    await nextFrame()
  }

  return null
}

// Las posiciones del stack solo son válidas cuando GSAP ya aplicó el transform
// inicial a los paneles que entran desde abajo.
const isStackReady = (stackContainer) =>
  Boolean(stackContainer.querySelectorAll('.stack-panel')[1]?.style.transform)

// Posición en el documento ignorando transforms: las animaciones de entrada desplazan
// los elementos de forma temporal y no deben alterar el destino del scroll.
const getLayoutTop = (element) => {
  let top = 0

  for (let node = element; node; node = node.offsetParent) {
    top += node.offsetTop
  }

  return top
}

const getNavbarHeight = (navbarElement) =>
  navbarElement?.offsetHeight ??
  document.querySelector('nav')?.offsetHeight ??
  DEFAULT_NAVBAR_HEIGHT

// El hash apunta al <section>, pero lo que debe quedar alineado debajo de la navbar
// es su primer contenido visible, que empieza después del padding de la sección.
const getSectionScrollTop = (section, navbarElement) => {
  if (section.id === 'inicio') return 0

  const content = section.querySelector('[data-text-reveal]') ?? section
  return getLayoutTop(content) - getNavbarHeight(navbarElement)
}

const getStackPanelScrollTop = (stackContainer, stackIndex) =>
  getLayoutTop(stackContainer) + stackIndex * window.innerHeight

let stopTrackingTarget = () => {}

// Las secciones con datos remotos cambian de alto al terminar de cargar y desplazan
// el destino. Mientras eso ocurra se lo recalcula, salvo que el usuario tome el control
// o empiece otra navegación.
const scrollToSettledTarget = (getTargetTop) => {
  stopTrackingTarget()

  let targetTop = getTargetTop()
  smoothScrollTo(targetTop)

  const resizeObserver = new ResizeObserver(() => {
    const nextTargetTop = getTargetTop()
    if (Math.abs(nextTargetTop - targetTop) < 1) return

    targetTop = nextTargetTop
    refreshSmoothScroll()
    smoothScrollTo(targetTop)
  })

  const stopTracking = () => {
    window.clearTimeout(timeoutId)
    resizeObserver.disconnect()
    USER_SCROLL_EVENTS.forEach((eventName) => window.removeEventListener(eventName, stopTracking))
    stopTrackingTarget = () => {}
  }

  stopTrackingTarget = stopTracking
  const timeoutId = window.setTimeout(stopTracking, LAYOUT_SETTLE_TIMEOUT_MS)
  resizeObserver.observe(document.body)
  USER_SCROLL_EVENTS.forEach((eventName) => {
    window.addEventListener(eventName, stopTracking, { passive: true })
  })
}

export const stopSectionScrollTracking = () => stopTrackingTarget()

export const scrollToHomeSection = async (link, navbarElement, { syncHistory = true } = {}) => {
  const stackContainer = document.querySelector('[data-scroll-stack]')

  if (isDesktopViewport() && stackContainer && Number.isInteger(link.stackIndex)) {
    await waitFor(() => isStackReady(stackContainer), MAX_STACK_WAIT_FRAMES)
    refreshSmoothScroll()
    scrollToSettledTarget(() => getStackPanelScrollTop(stackContainer, link.stackIndex))
  } else {
    const section = await waitFor(() => document.querySelector(link.href), MAX_TARGET_WAIT_FRAMES)
    if (!section) return

    // Deja que el router y los ScrollTriggers terminen de reacomodar el layout.
    await waitForFrames(2)
    refreshSmoothScroll()
    scrollToSettledTarget(() => getSectionScrollTop(section, navbarElement))
  }

  if (syncHistory) window.history.pushState(null, '', link.href)
}

export const navigateToHomeSection = async (router, link, navbarElement) => {
  stopSectionScrollTracking()

  if (link.path) {
    const failure = await router.push(link.path)

    // Si ya estamos en esa ruta el router no ejecuta scrollBehavior.
    if (isNavigationFailure(failure, NavigationFailureType.duplicated)) {
      smoothScrollTo(0)
    }
    return
  }

  if (router.currentRoute.value.path !== '/') {
    await router.push({ path: '/', hash: link.href })
    return
  }

  await scrollToHomeSection(link, navbarElement)
}
