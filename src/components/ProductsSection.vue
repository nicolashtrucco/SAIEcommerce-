<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import ProductCard from '@/components/ProductCard.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { useTextReveal } from '@/composables/useTextReveal'
import { fetchProducts } from '@/lib/api'

const FEATURED_PRODUCTS_LIMIT = 3

const sectionRef = ref(null)

// Si la carga falla, la home muestra el estado vacío en lugar de un error.
const { data: products, isLoading, load: loadProducts } = useAsyncData(
  async () => (await fetchProducts()).slice(0, FEATURED_PRODUCTS_LIMIT),
  { initialValue: [] },
)

onMounted(loadProducts)

useTextReveal(sectionRef, () => [isLoading.value, products.value.length])
</script>

<template>
  <section ref="sectionRef" id="productos" class="bg-[#f3f3f3] px-5 py-16 text-black lg:px-14 lg:pt-24 lg:pb-0">
    <div class="overflow-hidden">
      <div class="grid gap-10 lg:grid-cols-12 lg:gap-10">
        <div class="lg:col-span-4">
          <p data-text-reveal class="text-xs font-light tracking-[0.22em] text-black/70">[04] PRODUCTOS</p>
          <h2 data-text-reveal class="mt-5 max-w-md text-[2rem] font-light leading-[1.08] tracking-tight lg:text-5xl lg:leading-[1.12]">
            Componentes industriales disponibles para tu operación.
          </h2>
          <p data-text-reveal class="mt-5 max-w-sm text-[15px] font-light leading-snug text-black/70 lg:mt-6 lg:text-lg">
            Seleccionamos productos confiables para automatización, control y continuidad operativa.
            Consultanos por disponibilidad, variantes y asesoramiento técnico.
          </p>

          <RouterLink
            to="/products"
            class="mt-8 inline-flex bg-[#1f1f1f] px-5 py-3 text-xs font-light tracking-[0.12em] text-white transition hover:bg-brand-orange hover:text-black lg:mt-12 lg:px-6"
          >
            VER PRODUCTOS
          </RouterLink>
        </div>

        <div class="lg:col-span-8">
          <div v-if="isLoading" class="flex h-48 items-center justify-center border border-black/10 bg-white">
            <p class="text-lg font-light text-black/40">Cargando productos...</p>
          </div>

          <div v-else-if="products.length === 0" class="flex h-48 items-center justify-center border border-black/10 bg-white">
            <p class="text-lg font-light text-black/40">Sin productos disponibles.</p>
          </div>

          <div v-else class="grid gap-4 lg:grid-cols-3">
            <ProductCard v-for="product in products" :key="product.code" :product="product" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
