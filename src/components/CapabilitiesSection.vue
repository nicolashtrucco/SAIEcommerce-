<script setup>
import { ref } from 'vue'
import { useTextReveal } from '@/composables/useTextReveal'
import { padIndex } from '@/lib/format'

const sectionRef = ref(null)

const capabilities = [
  {
    label: 'CONTROL',
    title: 'PLC, HMI y SCADA',
    description:
      'Desarrollo de aplicaciones de control para sistemas basados en PLC, software para paneles HMI, sistemas de supervision SCADA y adquisicion de datos bajo Windows.',
  },
  {
    label: 'COMUNICACION',
    title: 'Redes industriales',
    description:
      'Integracion de redes de comunicacion Profibus, Industrial Ethernet, ControlNet, Modbus y CANopen para procesos industriales.',
  },
  {
    label: 'INFRAESTRUCTURA',
    title: 'Cableado y analisis',
    description:
      'Cableado estructurado, puesta en marcha y analisis de redes para asegurar continuidad operativa y diagnostico preciso.',
  },
]

const partners = [
  {
    name: 'Siemens',
    logo: '/SiemensLogo.png',
  },
  {
    name: 'Rockwell Automation',
    logo: '/RockwellAutomationLogo.png',
  },
]

useTextReveal(sectionRef)
</script>

<template>
  <section
    ref="sectionRef"
    id="especialidades"
    class="bg-[#f3f3f3] px-5 py-16 text-black lg:px-14 lg:pt-24 lg:pb-0"
  >
    <!-- HEADER -->
    <div class="grid gap-6 lg:grid-cols-12 lg:gap-10">
      <div class="lg:col-span-7">
        <p
          data-text-reveal
          class="text-xs font-light tracking-[0.22em]"
        >
          [02] ESPECIALIDADES TECNICAS
        </p>

        <h2
          data-text-reveal
          class="mt-4 max-w-[720px] text-[2rem] font-light leading-[1.08] tracking-tight lg:text-5xl"
        >
          Control, supervision y conectividad para plantas industriales.
        </h2>
      </div>

      <div class="lg:col-span-4 lg:col-start-9">
        <p
          data-text-reveal
          class="max-w-md text-[15px] font-light leading-snug text-black/75 lg:text-lg"
        >
          Integramos tecnologia de automatizacion con criterio de ingenieria,
          soporte local y experiencia en sistemas criticos de produccion.
        </p>
      </div>
    </div>

    <!-- ESPECIALIDADES -->
    <div
      class="mt-8 grid border-y border-black/10 lg:mt-9 lg:grid-cols-3"
    >
      <article
        v-for="(capability, index) in capabilities"
        :key="capability.title"
        class="group relative border-b border-black/10 px-0 py-6 last:border-b-0 lg:min-h-[180px] lg:border-r lg:border-b-0 lg:px-5 lg:py-5 lg:last:border-r-0"
      >
        <div class="flex items-start justify-between">
          <p
            data-text-reveal
            class="text-xs font-light tracking-[0.2em] text-black/40"
          >
            {{ capability.label }}
          </p>

          <span
            class="text-[10px] font-light tracking-[0.15em] text-black/25 transition-colors duration-300 group-hover:text-black/60"
          >
            {{ padIndex(index + 1) }}
          </span>
        </div>

        <h3
          data-text-reveal
          class="mt-4 text-[1.35rem] font-light leading-tight tracking-tight lg:mt-5 lg:text-2xl"
        >
          {{ capability.title }}
        </h3>

        <p
          data-text-reveal
          class="mt-3 max-w-md text-sm font-light leading-snug text-black/60 lg:mt-4"
        >
          {{ capability.description }}
        </p>
      </article>
    </div>

    <!-- SOCIOS ESTRATEGICOS -->
    <div
      class="mt-8 overflow-hidden rounded-[24px] bg-[#1f1f1f] text-white lg:mt-7 lg:rounded-[28px]"
    >
      <div
        class="grid items-center gap-8 px-5 py-8 lg:grid-cols-12 lg:gap-10 lg:px-9 lg:py-9"
      >
        <!-- TEXTO -->
        <div class="lg:col-span-4">
          <p
            data-text-reveal
            class="text-[10px] font-light tracking-[0.22em] text-white/40"
          >
            SOCIOS ESTRATEGICOS
          </p>

          <h3
            data-text-reveal
            class="mt-3 max-w-sm text-xl font-light leading-tight tracking-tight lg:text-2xl"
          >
            Tecnología de fabricantes líderes.
          </h3>

          <p
            data-text-reveal
            class="mt-3 max-w-sm text-sm font-light leading-relaxed text-white/45"
          >
            Soluciones desarrolladas sobre plataformas y tecnologías de
            referencia en automatización industrial.
          </p>
        </div>

        <!-- LOGOS -->
        <div
          class="flex min-h-[110px] items-center justify-between gap-8 border-t border-white/10 pt-7 lg:col-span-7 lg:col-start-6 lg:min-h-0 lg:border-t-0 lg:pt-0"
        >
          <div
            v-for="partner in partners"
            :key="partner.name"
            class="flex flex-1 items-center justify-center"
          >
            <img
              :src="partner.logo"
              :alt="partner.name"
              class="max-h-12 w-auto max-w-[170px] object-contain opacity-75 transition-all duration-500 hover:scale-[1.03] hover:opacity-100 lg:max-h-16 lg:max-w-[220px]"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
