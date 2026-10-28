<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import Header from '@/components/Header.vue'
import AboutSection from '@/components/AboutSection.vue'
import CapabilitiesSection from '@/components/CapabilitiesSection.vue'
import IndustriesSection from '@/components/IndustriesSection.vue'
import ProductsSection from '@/components/ProductsSection.vue'
import ClientsSection from '@/components/ClientsSection.vue'
import ContactSection from '@/components/ContactSection.vue'
import { gsap } from '@/lib/gsap'
import { DESKTOP_MEDIA_QUERY, MOBILE_MEDIA_QUERY } from '@/lib/media'
import { createScrollTextReveal, createTextRevealTimeline } from '@/lib/textReveal'

// Tiempo del timeline del stack (dura 1) a partir del cual se revela el texto del segundo panel.
const SECOND_PANEL_REVEAL_TIME = 0.42

const stackContainer = ref(null)
const stackPin = ref(null)
const stackPanels = ref([])
let stackAnimation

const setStackPanel = (element, index) => {
  if (element) {
    stackPanels.value[index] = element
  }
}

onMounted(async () => {
  await nextTick()

  stackAnimation = gsap.matchMedia()

  stackAnimation.add(DESKTOP_MEDIA_QUERY, () => {
    const panels = stackPanels.value

    gsap.set(panels, {
      zIndex: (index) => index + 1,
    })

    gsap.set(panels.slice(1), {
      yPercent: 100,
    })

    const revealedPanels = new Set()
    const textRevealTimelines = panels.map((panel) =>
      createTextRevealTimeline(panel, {
        paused: true,
        duration: 0.68,
        stagger: 0.055,
      }),
    )

    const playTextReveal = (index) => {
      const revealTimeline = textRevealTimelines[index]

      if (!revealTimeline || revealedPanels.has(index)) return

      revealedPanels.add(index)
      revealTimeline.play(0)
    }

    const initialReveal = gsap.delayedCall(0.05, () => {
      playTextReveal(0)
    })

    // Se usa el tiempo del timeline (suavizado por el scrub) y no el progreso crudo del
    // scroll, para que el texto aparezca cuando el panel realmente llegó a verse.
    // ScrollTrigger puede llamar a onUpdate antes de que la asignación termine.
    let timeline
    timeline = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: stackContainer.value,
        start: 'top top',
        end: () => `+=${window.innerHeight}`,
        pin: stackPin.value,
        scrub: 0.8,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: () => {
          if (timeline?.time() >= SECOND_PANEL_REVEAL_TIME) playTextReveal(1)
        },
      },
    })

    timeline.to(panels[1], { yPercent: 0, duration: 1 }, 0)

    return () => {
      initialReveal.kill()
      textRevealTimelines.forEach((revealTimeline) => revealTimeline?.kill())
      timeline.scrollTrigger?.kill()
      timeline.kill()
      gsap.set(panels, { clearProps: 'all' })
    }
  })

  stackAnimation.add(MOBILE_MEDIA_QUERY, () => {
    const panels = stackPanels.value.filter(Boolean)
    const textRevealCleanups = panels.map((panel) =>
      createScrollTextReveal(panel, {
        start: 'top 86%',
        batchMax: 4,
      }),
    )
    const panelAnimations = panels.slice(1).map((panel) =>
      gsap.fromTo(
        panel,
        {
          y: 56,
          opacity: 0.94,
        },
        {
          y: 0,
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: panel,
            start: 'top 92%',
            end: 'top 38%',
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        },
      ),
    )

    return () => {
      textRevealCleanups.forEach((cleanup) => cleanup())
      panelAnimations.forEach((animation) => {
        animation.scrollTrigger?.kill()
        animation.kill()
      })
      gsap.set(panels, { clearProps: 'transform,opacity' })
    }
  })
})

onBeforeUnmount(() => {
  stackAnimation?.revert()
})
</script>

<template>
  <div>
    <div ref="stackContainer" data-scroll-stack class="relative bg-[#f3f3f3]">
      <div ref="stackPin" class="relative bg-[#f3f3f3] lg:h-screen lg:overflow-hidden">
        <div
          :ref="(element) => setStackPanel(element, 0)"
          class="stack-panel lg:absolute lg:inset-0 lg:overflow-hidden"
        >
          <Header />
        </div>

        <div
          :ref="(element) => setStackPanel(element, 1)"
          class="stack-panel lg:absolute lg:inset-0 lg:overflow-hidden"
        >
          <AboutSection />
        </div>

      </div>
    </div>

    <div class="relative bg-[#f3f3f3]">
      <CapabilitiesSection />
    </div>

    <div class="relative bg-[#f3f3f3]">
      <IndustriesSection />
    </div>

    <!-- ClientsSection con scroll normal -->
    <div class="relative bg-[#f3f3f3]">
      <ClientsSection />
    </div>

    <div class="relative bg-[#f3f3f3]">
      <ProductsSection />
    </div>
    <ContactSection />
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .stack-panel > :where(header, section) {
    min-height: 100vh;
  }

  .stack-panel:not(:first-child) > section {
    padding-top: 9rem;
  }
}
</style>
