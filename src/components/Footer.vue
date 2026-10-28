<script setup>
import { ref } from 'vue'
import CrossPattern from '@/components/ui/CrossPattern.vue'
import { useHomeNavigation } from '@/composables/useHomeNavigation'
import { useTextReveal } from '@/composables/useTextReveal'
import { CONTACT_ADDRESS, contactChannels } from '@/lib/contact'
import { getHomeNavLink, getNavLinkHref, homeNavLinks } from '@/lib/sectionNavigation'

const footerRef = ref(null)
const homeLink = getHomeNavLink('#inicio')
const contactLink = getHomeNavLink('#contacto')
const currentYear = new Date().getFullYear()

const { navigateTo } = useHomeNavigation()

useTextReveal(footerRef)
</script>

<template>
  <footer ref="footerRef" class="bg-[#1f1f1f] px-5 text-white lg:px-14">
    <div class="px-0 lg:px-14">

      <!-- CONTENIDO PRINCIPAL -->
      <div class="border-b border-white/10 py-7 lg:py-12">
        <div class="grid gap-7 lg:grid-cols-12 lg:gap-10">

          <!-- INFO EMPRESA -->
          <div class="text-center lg:col-span-5 lg:text-left">
            <a
              :href="homeLink.href"
              @click="navigateTo(homeLink, $event)"
              class="inline-block"
              aria-label="Ir al inicio"
            >
              <img
                src="/LogoBlancoNaranja.png"
                alt="SAI Sistemas"
                class="mx-auto h-8 cursor-pointer object-contain lg:mx-0 lg:h-10"
              />
            </a>

            <p
              data-text-reveal
              class="mx-auto mt-3 max-w-sm text-sm font-light leading-relaxed text-white/65 lg:mx-0 lg:max-w-none lg:mt-4"
            >
              Integramos soluciones de automatización industrial para procesos,
              proyectos e instalaciones desde 1998.
            </p>

            <div data-text-reveal class="mt-4 flex flex-col items-center gap-1.5 lg:mt-6 lg:items-start lg:gap-2">
              <a
                v-for="channel in contactChannels"
                :key="channel.label"
                :href="channel.href"
                :target="channel.isExternal ? '_blank' : undefined"
                :rel="channel.isExternal ? 'noopener noreferrer' : undefined"
                :class="[
                  'inline-flex items-center gap-2 text-xs font-light text-white/65 transition hover:text-brand-orange',
                  channel === CONTACT_ADDRESS && 'text-center lg:text-left',
                ]"
              >
                <span class="text-brand-orange">→</span>
                {{ channel.value }}
              </a>
            </div>
          </div>

          <!-- NAV -->
          <div class="text-center lg:col-span-3 lg:col-start-8 lg:text-left">
            <p data-text-reveal class="text-xs font-light tracking-[0.2em] text-white/40">
              NAVEGACIÓN
            </p>

            <nav data-text-reveal class="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-2 lg:mt-4 lg:flex-col lg:gap-2">
              <a
                v-for="link in homeNavLinks"
                :key="link.label"
                :href="getNavLinkHref(link)"
                @click="navigateTo(link, $event)"
                class="text-base font-light text-white/75 transition hover:text-white lg:text-sm"
              >
                {{ link.label }}
              </a>
            </nav>
          </div>

          <!-- CTA -->
          <div class="flex flex-col items-center gap-4 lg:col-span-2 lg:col-start-11 lg:flex lg:flex-col lg:items-end lg:justify-between">

            <!-- Decoración solo desktop -->
            <CrossPattern class="hidden lg:grid grid-cols-3 gap-x-2 gap-y-1 text-brand-orange -scale-x-100" />

            <a
              :href="contactLink.href"
              @click="navigateTo(contactLink, $event)"
              class="inline-flex bg-brand-orange px-6 py-2.5 text-xs font-light tracking-[0.12em] text-black transition hover:bg-white"
            >
              CONTACTAR
            </a>
          </div>

        </div>
      </div>
    </div>
  </footer>

  <!-- BARRA INFERIOR -->
  <div class="border-t border-white/5 bg-black px-5 py-4 lg:px-14 lg:py-5">
  <div class="flex flex-col items-center gap-3 lg:flex-row lg:items-center lg:justify-between">

    <!-- Copyright -->
    <p class="text-center text-[11px] font-light leading-relaxed text-white/45 lg:text-left">
      © {{ currentYear }} SAI Sistemas. Todos los derechos reservados.
    </p>

    <!-- Créditos -->
    <a
      href="https://web.seiminteractive.io/"
      target="_blank"
      rel="noopener noreferrer"
      class="group inline-flex items-center gap-2 text-[11px] font-light text-white"
    >
      <span>Diseñado y desarrollado por</span>

      <img
        src="/SeimFooterBlanco.png"
        alt="SEIM Interactive"
        class="h-3.5 transition duration-300 group-hover:opacity-100 lg:h-4"
      />
    </a>

  </div>
</div>
</template>
