import { gsap, ScrollTrigger } from '@/lib/gsap'
import { isDesktopViewport, prefersReducedMotion } from '@/lib/media'

export const TEXT_REVEAL_SELECTOR = '[data-text-reveal]'

const DEFAULT_DURATION = 0.78
const DEFAULT_EASE = 'power2.out'

// El texto arranca casi opaco para que siga siendo legible antes de animarse.
const getHiddenState = () => ({
  opacity: 0.84,
  y: isDesktopViewport() ? 22 : 14,
})

const VISIBLE_STATE = {
  opacity: 1,
  y: 0,
  clearProps: 'transform,opacity',
}

const getTextRevealTargets = (root) => {
  if (!root) return []

  if (root.matches?.(TEXT_REVEAL_SELECTOR)) {
    return [root]
  }

  return gsap.utils.toArray(root.querySelectorAll(TEXT_REVEAL_SELECTOR))
}

// Devuelve los targets animables, o `null` si no hay nada que animar (sin targets o
// con reduced motion, en cuyo caso el texto queda directamente visible).
const getAnimatableTargets = (root) => {
  const targets = getTextRevealTargets(root)

  if (!targets.length) return null

  if (prefersReducedMotion()) {
    gsap.set(targets, VISIBLE_STATE)
    return null
  }

  return targets
}

export const createTextRevealTimeline = (root, options = {}) => {
  const targets = getAnimatableTargets(root)
  if (!targets) return null

  return gsap
    .timeline({
      paused: options.paused ?? false,
      defaults: {
        duration: options.duration ?? DEFAULT_DURATION,
        ease: options.ease ?? DEFAULT_EASE,
      },
    })
    .fromTo(targets, getHiddenState(), {
      ...VISIBLE_STATE,
      stagger: options.stagger ?? 0.07,
    })
}

export const createScrollTextReveal = (root, options = {}) => {
  const targets = getAnimatableTargets(root)
  if (!targets) return () => {}

  const ctx = gsap.context(() => {
    gsap.set(targets, getHiddenState())

    ScrollTrigger.batch(targets, {
      start: options.start ?? 'top 88%',
      once: true,
      interval: 0.08,
      batchMax: options.batchMax ?? 5,
      onEnter: (batch) => {
        gsap.to(batch, {
          ...VISIBLE_STATE,
          duration: options.duration ?? DEFAULT_DURATION,
          ease: options.ease ?? DEFAULT_EASE,
          stagger: options.stagger ?? 0.06,
          overwrite: true,
        })
      },
    })
  }, root)

  return () => ctx.revert()
}
