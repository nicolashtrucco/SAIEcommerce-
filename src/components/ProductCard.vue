<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { getProductInquiryUrl } from '@/lib/contact'
import { truncateText } from '@/lib/format'

const DESCRIPTION_MAX_LENGTH = 80

const props = defineProps({
  product: { type: Object, required: true },
  headingTag: { type: String, default: 'h3' },
  // El catálogo usa acciones más grandes en escritorio que la vista previa de la home.
  variant: { type: String, default: 'preview' },
})

const isCatalog = computed(() => props.variant === 'catalog')
</script>

<template>
  <article
    class="group flex min-h-[360px] flex-col border border-black/10 bg-white p-5 transition hover:border-brand-orange lg:min-h-[440px] lg:p-6"
  >
    <div class="flex items-start justify-between gap-4">
      <span data-text-reveal class="bg-[#f3f3f3] px-3 py-2 text-xs font-light tracking-[0.16em] text-black/55">
        {{ product.category.toUpperCase() }}
      </span>
      <span data-text-reveal class="text-xs font-light tracking-[0.16em] text-green-800">
        STOCK DISPONIBLE
      </span>
    </div>

    <div class="mt-5 flex h-44 items-center justify-center overflow-hidden bg-[#f3f3f3] lg:mt-6 lg:h-56">
      <img
        :src="product.image"
        :alt="product.name"
        class="h-full w-full object-contain"
      />
    </div>

    <div class="mt-6 flex flex-1 flex-col lg:mt-8">
      <p data-text-reveal class="text-xs font-light tracking-[0.18em] text-black/40">{{ product.code }}</p>
      <component
        :is="headingTag"
        data-text-reveal
        class="mt-3 text-xl font-light leading-tight transition group-hover:text-brand-orange lg:mt-4 lg:text-2xl"
      >
        {{ product.name }}
      </component>
      <p data-text-reveal class="mt-3 text-sm font-light leading-snug text-black/65 lg:mt-4 lg:text-base">
        {{ truncateText(product.description, DESCRIPTION_MAX_LENGTH) }}
      </p>

      <div :class="['mt-auto flex flex-wrap gap-2 pt-6 lg:pt-7', isCatalog && 'lg:gap-3']">
        <a
          :href="getProductInquiryUrl(product.name)"
          target="_blank"
          rel="noopener noreferrer"
          :class="[
            'inline-flex bg-[#1f1f1f] px-4 py-2 text-[10px] font-light tracking-[0.1em] text-white transition hover:bg-brand-orange hover:text-black',
            isCatalog && 'lg:px-6 lg:py-3 lg:text-xs lg:tracking-[0.12em]',
          ]"
        >
          CONSULTAR
        </a>
        <RouterLink
          :to="{ name: 'product-detail', params: { code: product.code } }"
          :class="[
            'inline-flex border border-black/15 px-4 py-2 text-[10px] font-light tracking-[0.1em] text-black/65 transition hover:border-brand-orange hover:text-black',
            isCatalog && 'lg:px-6 lg:py-3 lg:text-xs lg:tracking-[0.12em]',
          ]"
        >
          VER DETALLE
        </RouterLink>
      </div>
    </div>
  </article>
</template>
