<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { padIndex } from '@/lib/format'

const industries = [
  {
    name: 'Alimenticia',
    image:
      'https://images.unsplash.com/photo-1651525670114-2b8117390b28?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=85&w=1600&utm_source=chatgpt.com',
  },
  {
    name: 'Siderúrgica',
    image:
      'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1600&q=85',
  },
  {
    name: 'Papelera',
    image:
      'https://images.unsplash.com/photo-1597165826924-f0e9fb81762e?auto=format&fit=crop&w=1600&q=85',
  },
  {
    name: 'Química',
    image:
      'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1600&q=85',
  },
  {
    name: 'Automotriz',
    image:
      'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1600&q=85',
  },
  {
    name: 'Agroindustrial',
    image:
      'https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?auto=format&fit=crop&w=1600&q=85',
  },
  {
    name: 'Logística',
    image:
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=85',
  },
  {
    name: 'Energética',
    image:
      'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1600&q=85',
  },
]

const AUTOPLAY_INTERVAL_MS = 2000
const activeIndustry = ref(0)
const currentIndustry = computed(() => industries[activeIndustry.value])
let autoplayTimer = null

const showNextIndustry = () => {
  activeIndustry.value = (activeIndustry.value + 1) % industries.length
}

const stopAutoplay = () => {
  if (!autoplayTimer) return
  clearInterval(autoplayTimer)
  autoplayTimer = null
}

const startAutoplay = () => {
  stopAutoplay()
  autoplayTimer = setInterval(showNextIndustry, AUTOPLAY_INTERVAL_MS)
}

onMounted(() => {
  startAutoplay()
})

onUnmounted(() => {
  stopAutoplay()
})
</script>

<template>
  <section
    id="industrias"
    class="bg-[#f3f3f3] text-black lg:h-screen lg:overflow-hidden"
  >
    <div
      class="mx-auto flex h-full w-full max-w-[1600px] flex-col px-5 pt-16 pb-8 lg:px-14 lg:pt-24 lg:pb-0"
    >
      <!-- Header -->
      <div
        class="grid shrink-0 gap-5 lg:grid-cols-12 lg:gap-12"
      >
        <div class="lg:col-span-7">
          <p
            data-text-reveal
            class="text-[10px] font-light tracking-[0.22em] lg:text-xs"
          >
            [03] INDUSTRIAS
          </p>

          <h2
            data-text-reveal
            class="mt-3 max-w-[720px] text-[1.8rem] font-light leading-[1.05] tracking-tight lg:mt-4 lg:text-5xl xl:text-[3.4rem]"
          >
            Experiencia aplicada en procesos industriales de alta exigencia operativa.
          </h2>
        </div>

        <div
          class="flex items-end lg:col-span-4 lg:col-start-9"
        >
          <p
            data-text-reveal
            class="max-w-md text-[13px] font-light leading-snug text-black/60 lg:text-[15px]"
          >
            Trabajamos junto a plantas, equipos de ingeniería e integradores
            en sectores donde la continuidad, la trazabilidad y la precisión
            técnica son críticas para cada operación.
          </p>
        </div>
      </div>

      <!-- Main -->
      <div
        class="mt-7 grid min-h-0 flex-1 border-t border-black/10 pt-5 lg:mt-8 lg:grid-cols-12 lg:gap-12 lg:pt-6"
      >
        <!-- Industries -->
        <div
          class="order-2 flex min-h-0 flex-col lg:order-1 lg:col-span-6"
        >
          <div class="flex min-h-0 flex-1 flex-col">
            <div
              v-for="(industry, index) in industries"
              :key="industry.name"
              class="relative flex min-h-0 flex-1 items-center border-b border-black/10"
            >
              <!-- Active indicator -->
              <span
                class="mr-4 h-px bg-black transition-all duration-500 lg:mr-6"
                :class="activeIndustry === index ? 'w-7' : 'w-0'"
              />

              <!-- Number -->
              <span
                class="w-7 text-[9px] font-light tracking-[0.15em] text-black/30 transition-colors duration-300 lg:w-8 lg:text-[10px]"
                :class="activeIndustry === index ? 'text-black/70' : ''"
              >
                {{ padIndex(index + 1) }}
              </span>

              <!-- Name -->
              <span
                class="text-[1.2rem] font-light tracking-tight transition-all duration-500 lg:text-[1.7rem]"
                :class="
                  activeIndustry === index
                    ? 'translate-x-1 text-black'
                    : 'text-black/35'
                "
              >
                {{ industry.name }}
              </span>

              <!-- Arrow -->
              <span
                class="ml-auto mr-1 text-xs font-light transition-all duration-500"
                :class="
                  activeIndustry === index
                    ? 'translate-x-0 opacity-100'
                    : '-translate-x-2 opacity-0'
                "
              >
                →
              </span>
            </div>
          </div>
        </div>

        <!-- Image -->
        <div
          class="order-1 mb-6 min-h-0 lg:order-2 lg:col-span-6 lg:mb-0"
        >
          <div
            class="relative h-full min-h-[240px] overflow-hidden bg-black/5"
          >
            <Transition name="image-fade" mode="out-in">
              <img
                :key="currentIndustry.image"
                :src="currentIndustry.image"
                :alt="currentIndustry.name"
                class="absolute inset-0 h-full w-full object-cover"
              />
            </Transition>

            <!-- Overlay -->
            <div class="absolute inset-0 bg-black/10" />

            <!-- Metadata -->
            <div
              class="absolute bottom-0 left-0 right-0 flex items-end justify-between p-5 text-white lg:p-6"
            >
              <div>
                <p
                  class="text-[8px] font-light tracking-[0.2em] text-white/60"
                >
                  APLICACIÓN INDUSTRIAL
                </p>

                <p class="mt-1.5 text-lg font-light lg:text-xl">
                  {{ currentIndustry.name }}
                </p>
              </div>

              <span
                class="text-[9px] font-light tracking-[0.15em] text-white/60"
              >
                {{ padIndex(activeIndustry + 1) }} /
                {{ padIndex(industries.length) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.image-fade-enter-active,
.image-fade-leave-active {
  transition:
    opacity 0.45s ease,
    transform 0.7s ease;
}

.image-fade-enter-from {
  opacity: 0;
  transform: scale(1.04);
}

.image-fade-leave-to {
  opacity: 0;
  transform: scale(0.98);
}
</style>

