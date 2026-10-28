
<script setup>
import CornerAccents from '@/components/ui/CornerAccents.vue'
import { useHomeNavigation } from '@/composables/useHomeNavigation'
import { CONTACT_EMAIL, CONTACT_PHONE } from '@/lib/contact'
import { getHomeNavLink } from '@/lib/sectionNavigation'

const { navigateTo } = useHomeNavigation()
const specialtiesLink = { href: '#especialidades' }
const aboutLink = getHomeNavLink('#nosotros')
const contactLink = { href: '#contacto' }
</script>

<template>
  <header
    id="inicio"
    class="relative isolate min-h-svh overflow-hidden text-white lg:h-screen lg:min-h-[720px]"
  >
    <video
      class="absolute inset-0 z-0 h-full w-full object-cover"
      autoplay
      muted
      loop
      playsinline
      preload="auto"
      aria-hidden="true"
    >
      <source src="/VideoRobotComprimido33mb.mov" />
    </video>

    <div class="absolute inset-0 z-10 bg-black/50 lg:bg-black/65"></div>

    <div
      class="absolute inset-0 z-10 bg-gradient-to-b
             from-black/25 via-transparent to-black/75 lg:hidden"
    ></div>

    <div
      class="relative z-20 flex min-h-svh flex-col
             px-5 pb-6 pt-24
             sm:px-7 sm:pb-8
             lg:h-full lg:px-14 lg:pb-14 lg:pt-24"
    >
      <!-- Mobile -->
      <div class="mt-6 lg:hidden">
        <p
          data-text-reveal
          class="text-[10px] font-light tracking-[0.17em] text-white/75"
        >
          AUTOMATIZACIÓN INDUSTRIAL
        </p>

        <h1
          data-text-reveal
          class="mt-4 max-w-[360px] text-[2.75rem] font-semibold
                 leading-[1.02] tracking-[-0.045em]
                 min-[390px]:text-5xl"
        >
          Soluciones para la industria.
        </h1>

        <p
          data-text-reveal
          class="mt-4 max-w-[340px] text-[15px] font-light
                 leading-relaxed text-white/80"
        >
          Integramos procesos, proyectos e instalaciones industriales.
        </p>
      </div>

      <!-- Desktop: título protagonista -->
      <div class="mt-5 hidden max-w-5xl lg:mt-24 lg:block">
        <p
          data-text-reveal
          class="text-xs font-light tracking-[0.24em] text-white/65
                 xl:text-sm"
        >
          AUTOMATIZACIÓN INDUSTRIAL
        </p>

        <h1
          data-text-reveal
          class="mt-6 max-w-[1000px] text-6xl font-medium
                 leading-[1.08] tracking-[-0.04em]
                 xl:text-7xl xl:leading-[1.06]"
        >
          Integramos soluciones para procesos, proyectos e instalaciones industriales
        </h1>
      </div>

      <!-- Separador desktop -->
      <div class="mt-12 hidden border-t border-white/20 lg:block xl:mt-14"></div>

      <!-- Mobile: experiencia y acción -->
      <div class="mt-auto pt-10 lg:hidden">
        <div class="mb-7 flex items-center gap-3">
          <span class="h-9 w-[3px] shrink-0 bg-brand-orange"></span>

          <div>
            <p data-text-reveal class="text-sm font-medium text-white">
              Más de 25 años de experiencia
            </p>

            <p class="mt-1 text-xs font-light leading-relaxed text-white/65">
              Soluciones para distintos sectores industriales.
            </p>
          </div>
        </div>

        <a
          href="#contacto"
          @click="navigateTo(contactLink, $event)"
          class="flex min-h-14 items-center justify-between gap-4
                 bg-white px-5 text-xs font-medium uppercase
                 tracking-[0.09em] text-black
                 transition-colors duration-200 hover:bg-brand-orange
                 focus-visible:outline focus-visible:outline-2
                 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          <span>Hablemos de tu proyecto</span>
          <span aria-hidden="true" class="text-lg">↗</span>
        </a>

        <a
          href="#especialidades"
          @click="navigateTo(specialtiesLink, $event)"
          class="mt-4 flex min-h-10 items-center justify-center gap-2
                 text-xs font-light text-white/75
                 transition-colors hover:text-white"
        >
          Conocer nuestros servicios
          <span aria-hidden="true">↓</span>
        </a>
      </div>

      <!-- Desktop: bloques secundarios -->
      <div class="mt-auto hidden grid-cols-12 items-end gap-6 pt-6 lg:grid">
        <article
          class="relative col-span-4 col-start-5 bg-brand-orange
                 px-6 py-5 text-black"
        >
          <CornerAccents size="lg" />

          <p
            data-text-reveal
            class="text-[10px] font-light tracking-[0.22em] opacity-75
                   xl:text-xs"
          >
            EXPERIENCIA
          </p>

          <h2
            data-text-reveal
            class="mt-3 max-w-[19rem] text-base font-normal leading-snug
                   xl:text-lg"
          >
            Más de 25 años aportando soluciones para las industrias.
          </h2>

          <a
            href="#nosotros"
            @click="navigateTo(aboutLink, $event)"
            class="mt-5 inline-flex items-center gap-2 text-[10px]
                   tracking-[0.08em] transition-opacity hover:opacity-60
                   xl:text-xs"
          >
            CONOCER MÁS
            <span aria-hidden="true">↗</span>
          </a>
        </article>

        <aside class="col-span-3 col-start-10">
          <p class="text-[10px] font-light tracking-[0.22em] text-white/55 xl:text-xs">
            CONTACTO
          </p>

          <div class="mt-3 space-y-2 text-sm font-light text-white/85 xl:text-base">
            <a
              :href="CONTACT_EMAIL.href"
              class="block break-words transition-colors hover:text-brand-orange"
            >
              {{ CONTACT_EMAIL.value }}
            </a>

            <a
              :href="CONTACT_PHONE.href"
              target="_blank"
              rel="noopener noreferrer"
              class="block transition-colors hover:text-brand-orange"
            >
              {{ CONTACT_PHONE.value }}
            </a>
          </div>

          <a
            href="#contacto"
            @click="navigateTo(contactLink, $event)"
            class="mt-5 flex min-h-11 items-center justify-between
                   gap-4 bg-white px-5 text-[10px] font-normal
                   tracking-[0.1em] text-black
                   transition-colors hover:bg-brand-orange
                   focus-visible:outline focus-visible:outline-2
                   focus-visible:outline-offset-4 focus-visible:outline-white
                   xl:text-xs"
          >
            <span>HABLEMOS DE TU PROYECTO</span>
            <span aria-hidden="true" class="text-base">↗</span>
          </a>
        </aside>
      </div>
    </div>
  </header>
</template>
