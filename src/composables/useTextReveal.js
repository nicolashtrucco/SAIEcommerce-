import { nextTick, onBeforeUnmount, onMounted, watch } from 'vue'
import { scheduleScrollTriggerRefresh } from '@/lib/gsap'
import { createScrollTextReveal } from '@/lib/textReveal'

// `watchSource` permite rearmar la animación cuando cambia el contenido renderizado
// (por ejemplo, al terminar de cargar datos).
export const useTextReveal = (rootRef, watchSource) => {
  let cleanup = () => {}

  const setupTextReveal = async () => {
    await nextTick()

    cleanup()

    if (!rootRef.value) return

    cleanup = createScrollTextReveal(rootRef.value)
    scheduleScrollTriggerRefresh()
  }

  onMounted(setupTextReveal)

  if (watchSource) {
    watch(watchSource, setupTextReveal, { flush: 'post' })
  }

  onBeforeUnmount(() => {
    cleanup()
  })
}
