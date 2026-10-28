import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

let refreshFrameId = null

// Varias secciones piden un refresh al montarse o al recibir datos; agruparlos en un
// único frame evita recalcular todos los ScrollTriggers una vez por sección.
export const scheduleScrollTriggerRefresh = () => {
  if (refreshFrameId) return

  refreshFrameId = window.requestAnimationFrame(() => {
    refreshFrameId = null
    ScrollTrigger.refresh()
  })
}

export { gsap, ScrollTrigger }
