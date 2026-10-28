<script setup>
import CrossPattern from '@/components/ui/CrossPattern.vue'

const stats = [
  { value: '25+', description: 'Años de experiencia en automatización de procesos industriales.' },
  { value: '400+', description: 'Clientes que nos eligen como aliado tecnológico.' },
  { value: '1000+', description: 'Obras realizadas integrando PLC, HMI, SCADA y redes industriales.' },
]
</script>

<template>
  <section id="nosotros" class="bg-[#f3f3f3] px-5 py-16 text-black lg:px-14 lg:py-24">
    <div class="grid gap-12 lg:grid-cols-12 lg:gap-10">
      <div class="flex min-h-[360px] flex-col lg:col-span-7 lg:min-h-[460px]">
        <div>
          <p data-text-reveal class="text-xs font-light tracking-[0.22em]">[01] SOBRE NOSOTROS</p>
          <h2 data-text-reveal class="mt-5 max-w-[720px] text-[2rem] font-light leading-[1.08] tracking-tight lg:text-6xl lg:leading-[1.12]">
            Desde 1998 integramos soluciones de automatización industrial para procesos,
            proyectos e instalaciones.
          </h2>
        </div>

        <div class="mt-auto flex items-end justify-between pt-14 lg:pt-20">
          <p data-text-reveal class="text-xs font-light tracking-[0.18em]">[1998 - 2026]</p>

          <CrossPattern class="grid grid-cols-3 gap-x-2 gap-y-1 text-brand-orange -scale-x-100" />
        </div>
      </div>

      <div class="lg:col-span-4 lg:col-start-9">
        <div class="border-l border-black/10">
          <article
            v-for="(stat, index) in stats"
            :key="stat.value"
            :class="
              index === 0
                ? 'border-b border-black/10 pb-8 pl-5 lg:pb-10 lg:pl-8'
                : 'border-b border-black/10 py-8 pl-5 lg:py-10 lg:pl-8'
            "
          >
            <p data-text-reveal class="text-4xl font-light leading-none lg:text-5xl">{{ stat.value }}</p>
            <p data-text-reveal class="mt-4 max-w-xs text-base font-light leading-snug text-black/70 lg:mt-5 lg:text-lg">
              {{ stat.description }}
            </p>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>
