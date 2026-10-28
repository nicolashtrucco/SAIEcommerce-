// Debe coincidir con el breakpoint `lg` de Tailwind.
export const DESKTOP_MEDIA_QUERY = '(min-width: 1024px)'
export const MOBILE_MEDIA_QUERY = '(max-width: 1023px)'

const REDUCED_MOTION_MEDIA_QUERY = '(prefers-reduced-motion: reduce)'

const matchesMedia = (query) => window.matchMedia(query).matches

export const isDesktopViewport = () => matchesMedia(DESKTOP_MEDIA_QUERY)

export const prefersReducedMotion = () => matchesMedia(REDUCED_MOTION_MEDIA_QUERY)
