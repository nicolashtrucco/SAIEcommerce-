import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { prefersReducedMotion } from '@/lib/media'

const SCROLL_TO_DURATION_S = 1.15

let lenis

export const initSmoothScroll = () => {
  if (lenis) return lenis

  lenis = new Lenis({
    autoRaf: false,
    anchors: false,
    lerp: 0.085,
    smoothWheel: true,
    stopInertiaOnNavigate: true,
  })

  lenis.on('scroll', ScrollTrigger.update)

  gsap.ticker.add((time) => {
    lenis?.raf(time * 1000)
  })
  gsap.ticker.lagSmoothing(0)

  return lenis
}

export const refreshSmoothScroll = () => {
  ScrollTrigger.refresh()
  lenis?.resize()
}

export const setSmoothScrollLocked = (locked) => {
  if (locked) {
    lenis?.stop()
  } else {
    lenis?.start()
  }
}

export const smoothScrollTo = (top, { immediate = prefersReducedMotion() } = {}) => {
  const target = Math.max(0, top)

  if (!lenis) {
    window.scrollTo({ top: target, behavior: immediate ? 'auto' : 'smooth' })
    return
  }

  lenis.scrollTo(target, {
    duration: immediate ? 0 : SCROLL_TO_DURATION_S,
    force: true,
    immediate,
  })
}
