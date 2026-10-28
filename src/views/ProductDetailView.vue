<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAsyncData } from '@/composables/useAsyncData'
import { useTextReveal } from '@/composables/useTextReveal'
import { fetchProductByCode } from '@/lib/api'
import { getProductInquiryUrl } from '@/lib/contact'

const PRODUCT_NOT_FOUND_MESSAGE = 'No encontramos el producto solicitado.'

const route = useRoute()
const sectionRef = ref(null)

const {
  data: product,
  isLoading,
  loadError,
  load: loadProduct,
} = useAsyncData(() => fetchProductByCode(String(route.params.code)), {
  errorMessage: PRODUCT_NOT_FOUND_MESSAGE,
})

const productDetails = computed(() => {
  if (!product.value) return []

  return [
    { label: 'REFERENCIA', value: product.value.code },
    { label: 'CATEGORIA', value: product.value.category },
    { label: 'STOCK', value: 'Stock disponible', highlight: true },
    { label: 'PRECIO', value: 'A cotizar' },
    { label: 'ORIGEN', value: product.value.origin },
    { label: 'CONDICION', value: product.value.condition },
  ]
})

watch(() => route.params.code, loadProduct)

onMounted(loadProduct)

useTextReveal(sectionRef, () => [isLoading.value, product.value?.code, loadError.value])
</script>

<template>
  <section ref="sectionRef" class="min-h-screen bg-[#f3f3f3] px-5 pb-16 pt-28 text-black lg:px-14 lg:pb-24 lg:pt-40">
    <div v-if="isLoading" class="border border-black/10 bg-white px-8 py-12 text-center">
      <p class="text-2xl font-light">Cargando producto...</p>
    </div>

    <div v-else-if="product" class="grid gap-9 lg:grid-cols-12 lg:gap-12">
      <div class="lg:col-span-6">
          <div class="lg:sticky lg:top-32">
          <p data-text-reveal class="text-xs font-light tracking-[0.22em] text-black/55">[DETALLE PRODUCTO]</p>
          <h1 data-text-reveal class="mt-5 max-w-[760px] text-[2.35rem] font-light leading-[1.02] tracking-tight lg:text-7xl">
            {{ product.name }}
          </h1>

          <p data-text-reveal class="mt-6 max-w-xl text-[15px] font-light leading-snug text-black/70 lg:mt-8 lg:text-lg">
            {{ product.description }}
          </p>

          <div class="mt-8 flex flex-wrap gap-2 lg:mt-10 lg:gap-3">
            <RouterLink
              to="/products"
              class="inline-flex border border-black/15 px-4 py-2.5 text-[10px] font-light tracking-[0.1em] text-black/65 transition hover:border-brand-orange hover:text-black lg:px-6 lg:py-3 lg:text-xs lg:tracking-[0.12em]"
            >
              VOLVER AL CATALOGO
            </RouterLink>

            <a
              :href="getProductInquiryUrl(product.name)"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex bg-[#1f1f1f] px-4 py-2.5 text-[10px] font-light tracking-[0.1em] text-white transition hover:bg-brand-orange hover:text-black lg:px-6 lg:py-3 lg:text-xs lg:tracking-[0.12em]"
            >
              COTIZAR PRODUCTO
            </a>
          </div>
        </div>
      </div>

      <div class="lg:col-span-5 lg:col-start-8">
        <div class="border border-black/10 bg-white p-4 lg:p-6">
          <div class="flex min-h-[260px] items-center justify-center bg-[#f3f3f3] p-5 lg:min-h-[380px] lg:p-8">
            <img :src="product.image" :alt="product.name" class="max-h-[220px] w-full object-contain lg:max-h-[320px]" />
          </div>

          <dl class="mt-5 grid grid-cols-1 border-y border-black/10 text-sm font-light sm:grid-cols-2 lg:mt-6">
            <div
              v-for="(detail, index) in productDetails"
              :key="detail.label"
              :class="[
                'py-4 sm:py-4',
                index % 2 === 0 ? 'sm:border-r sm:border-black/10 sm:pr-4' : 'sm:pl-4',
                index < productDetails.length - 2 ? 'border-b border-black/10' : '',
              ]"
            >
              <dt data-text-reveal class="text-[10px] tracking-[0.18em] text-black/40">{{ detail.label }}</dt>
              <dd
                data-text-reveal
                :class="[
                  'mt-2 leading-tight',
                  detail.highlight ? 'text-green-800' : 'text-black/75',
                ]"
              >
                {{ detail.value }}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div class="border-y border-black/10 py-8 lg:col-span-12">
        <div class="grid gap-8 lg:grid-cols-12">
          <div class="lg:col-span-3">
            <p data-text-reveal class="text-xs font-light tracking-[0.18em] text-black/45">INFORMACION COMERCIAL</p>
          </div>

          <div class="grid gap-6 lg:col-span-8 lg:col-start-5 lg:grid-cols-3">
            <article>
              <p data-text-reveal class="text-xl font-light leading-tight">Cotizacion personalizada</p>
              <p data-text-reveal class="mt-3 text-sm font-light leading-snug text-black/60">
                El precio se confirma segun disponibilidad, cantidad y condiciones de entrega.
              </p>
            </article>

            <article>
              <p data-text-reveal class="text-xl font-light leading-tight">Soporte tecnico</p>
              <p data-text-reveal class="mt-3 text-sm font-light leading-snug text-black/60">
                Acompañamiento para validar compatibilidad con tablero, PLC o red industrial.
              </p>
            </article>

            <article>
              <p data-text-reveal class="text-xl font-light leading-tight">Consulta directa</p>
              <p data-text-reveal class="mt-3 text-sm font-light leading-snug text-black/60">
                Contacto por WhatsApp para confirmar referencia, stock y alternativa equivalente.
              </p>
            </article>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="border border-black/10 bg-white px-8 py-12 text-center">
      <p class="text-2xl font-light">{{ loadError || PRODUCT_NOT_FOUND_MESSAGE }}</p>
      <RouterLink
        to="/products"
        class="mt-6 inline-flex bg-[#1f1f1f] px-6 py-3 text-xs font-light tracking-[0.12em] text-white transition hover:bg-brand-orange hover:text-black"
      >
        VOLVER AL CATALOGO
      </RouterLink>
    </div>
  </section>
</template>
