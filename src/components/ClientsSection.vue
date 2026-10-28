<script setup>
import { onMounted, ref } from 'vue'
import CrossPattern from '@/components/ui/CrossPattern.vue'
import Marquee from '@/components/ui/marquee/Marquee.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { useTextReveal } from '@/composables/useTextReveal'
import { fetchClients } from '@/lib/api'

const sectionRef = ref(null)

const {
  data: clients,
  isLoading,
  loadError,
  load: loadClients,
} = useAsyncData(fetchClients, {
  initialValue: [],
  errorMessage: 'No pudimos cargar los clientes en este momento.',
})

onMounted(loadClients)

useTextReveal(sectionRef, () => [isLoading.value, loadError.value])
</script>

<template>
  <section ref="sectionRef" class="flex bg-[#f3f3f3] px-5 py-16 text-white lg:h-screen lg:items-center lg:px-14 lg:pt-24 lg:pb-0">
    <div
      class="flex w-full flex-col overflow-hidden rounded-[24px] border border-[#1f1f1f]/5 bg-[#1f1f1f] px-5 py-9 text-white lg:rounded-[32px] lg:px-14 lg:py-16"
    >
      <div class="relative mx-auto max-w-6xl text-center">
        <p data-text-reveal class="text-[11px] font-light tracking-[0.18em] text-white/70 lg:text-xs lg:tracking-[0.22em]">
          [04] NUESTROS CLIENTES
        </p>

        <h2 data-text-reveal class="mx-auto mt-3 max-w-[880px] text-[2rem] font-light leading-[1.08] tracking-tight lg:text-6xl lg:leading-[1.12]">
          Estas empresas confian en nosotros
        </h2>
      </div>

      <div class="-mx-5 mt-8 flex grow flex-col justify-center overflow-hidden border-y border-white/10 lg:-mx-14 lg:mb-12 lg:mt-12">
        <div v-if="isLoading" class="px-8 py-10 text-center text-white/70">
          Cargando clientes...
        </div>

        <div v-else-if="loadError" class="px-8 py-10 text-center">
          <p class="text-white/70">{{ loadError }}</p>
          <button
            type="button"
            @click="loadClients"
            class="mt-5 inline-flex bg-white px-5 py-2 text-xs font-light tracking-[0.12em] text-black transition hover:bg-brand-orange"
          >
            REINTENTAR
          </button>
        </div>

        <Marquee v-else class="[--duration:58s] [--gap:0rem] p-0 lg:[--duration:80s]" reverse pause-on-hover>
          <div
            v-for="client in clients"
            :key="client.name"
            class="flex h-20 w-[170px] shrink-0 items-center justify-center border-r border-white/10 px-5 lg:h-28 lg:w-[280px] lg:px-8"
          >
            <img
              :src="client.logo"
              :alt="client.name"
              class="max-h-9 max-w-[118px] object-contain lg:max-h-12 lg:max-w-none"
            />
          </div>
        </Marquee>
      </div>

      <div class="mx-auto max-w-6xl shrink-0">
        <div class="mt-8 grid gap-6 lg:mt-10 lg:grid-cols-12 lg:gap-8">
          <div class="lg:col-span-3 lg:col-start-1 text-center lg:text-left">
          <p data-text-reveal class="text-xs font-light tracking-[0.18em] text-white/40">
              [CONFIANZA INDUSTRIAL]
            </p>
          </div>

          <div class="mx-auto lg:col-span-4 lg:col-start-5">
            <p data-text-reveal class="max-w-md text-center text-sm font-light leading-snug text-white/65 lg:text-lg">
              Acompañamos a empresas que requieren integracion, continuidad operativa y
              respuestas tecnicas precisas en entornos productivos exigentes.
            </p>
          </div>

          <div class="hidden justify-center lg:col-span-3 lg:col-start-10 lg:flex">
            <CrossPattern class="grid grid-cols-3 gap-x-2 gap-y-1 text-brand-orange -scale-x-100" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
