<script setup>
import { computed, onMounted, ref } from 'vue'
import ProductCard from '@/components/ProductCard.vue'
import CrossPattern from '@/components/ui/CrossPattern.vue'
import FilterChip from '@/components/ui/FilterChip.vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { useTextReveal } from '@/composables/useTextReveal'
import { fetchCategories, fetchProducts } from '@/lib/api'

const ALL_CATEGORIES = 'Todos'

const sectionRef = ref(null)
const selectedCategory = ref(ALL_CATEGORIES)
const searchQuery = ref('')

const {
  data: catalog,
  isLoading,
  loadError,
  load: loadCatalog,
} = useAsyncData(
  async () => {
    const [categories, products] = await Promise.all([fetchCategories(), fetchProducts()])
    return { categories: categories.map((category) => category.name), products }
  },
  {
    initialValue: { categories: [], products: [] },
    errorMessage: 'No pudimos cargar el catalogo en este momento.',
  },
)

const categories = computed(() => [ALL_CATEGORIES, ...catalog.value.categories])

const filteredProducts = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return catalog.value.products.filter((product) => {
    const matchesCategory =
      selectedCategory.value === ALL_CATEGORIES || product.category === selectedCategory.value

    const matchesSearch = [product.name, product.category, product.description, product.code]
      .join(' ')
      .toLowerCase()
      .includes(query)

    return matchesCategory && matchesSearch
  })
})

const resetFilters = () => {
  selectedCategory.value = ALL_CATEGORIES
  searchQuery.value = ''
}

onMounted(loadCatalog)

useTextReveal(sectionRef, () => [
  isLoading.value,
  loadError.value,
  filteredProducts.value.length,
])
</script>

<template>
  <section ref="sectionRef" class="min-h-screen bg-[#f3f3f3] px-5 pb-16 pt-28 text-black lg:px-14 lg:pb-24 lg:pt-40">
    <div class="grid gap-7 lg:grid-cols-12 lg:gap-12">
      <div class="lg:col-span-7">
        <p data-text-reveal class="text-xs font-light tracking-[0.22em] text-black/55">[CATALOGO INDUSTRIAL]</p>
        <h1 data-text-reveal class="mt-5 max-w-[820px] text-[2.45rem] font-light leading-[1.02] tracking-tight lg:text-7xl">
          Componentes para automatizar, controlar y sostener tu operación.
        </h1>
      </div>

      <div class="flex flex-col justify-end lg:col-span-4 lg:col-start-9">
        <p data-text-reveal class="max-w-md text-[15px] font-light leading-snug text-black/70 lg:text-lg">
          Explorá una selección de productos de muestra. Filtrá por familia o buscá por nombre,
          aplicación y código técnico.
        </p>

        <CrossPattern class="mt-7 hidden grid-cols-3 gap-x-2 gap-y-1 text-brand-orange -scale-x-100 self-start lg:mt-10 lg:grid lg:self-end" />
      </div>
    </div>

    <div class="mt-10 border-y border-black/10 py-6 lg:mt-20 lg:py-8">
      <div class="grid gap-6 lg:grid-cols-12 lg:items-end">
        <label class="lg:col-span-5">
          <span class="text-xs font-light tracking-[0.18em] text-black/45">BUSCAR PRODUCTO</span>
          <input
            v-model="searchQuery"
            type="search"
            placeholder="PLC, HMI, variador, fuente..."
            class="mt-4 w-full border-b border-black/20 bg-transparent py-3 text-lg font-light outline-none transition placeholder:text-black/35 focus:border-brand-orange lg:py-4 lg:text-xl"
          />
        </label>

        <div class="lg:col-span-7">
          <p class="text-xs font-light tracking-[0.18em] text-black/45">CATEGORIAS</p>
          <div class="mt-4 flex flex-wrap gap-3">
            <FilterChip
              v-for="category in categories"
              :key="category"
              :active="selectedCategory === category"
              @click="selectedCategory = category"
            >
              {{ category.toUpperCase() }}
            </FilterChip>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-7 flex items-center justify-between gap-4 text-xs font-light tracking-[0.18em] text-black/45 lg:mt-10">
      <p data-text-reveal>{{ filteredProducts.length }} PRODUCTOS</p>
    </div>

    <div v-if="isLoading" class="mt-8 border border-black/10 bg-white px-8 py-12 text-center">
      <p class="text-2xl font-light">Cargando productos...</p>
    </div>

    <div v-else-if="loadError" class="mt-8 border border-red-200 bg-white px-8 py-12 text-center">
      <p class="text-2xl font-light text-red-700">{{ loadError }}</p>
      <button
        type="button"
        @click="loadCatalog"
        class="mt-6 inline-flex bg-[#1f1f1f] px-6 py-3 text-xs font-light tracking-[0.12em] text-white transition hover:bg-brand-orange hover:text-black"
      >
        REINTENTAR
      </button>
    </div>

    <div v-else class="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <ProductCard
        v-for="product in filteredProducts"
        :key="product.code"
        :product="product"
        heading-tag="h2"
        variant="catalog"
      />
    </div>

    <div v-if="!isLoading && !loadError && filteredProducts.length === 0" class="mt-8 border border-black/10 bg-white px-8 py-12 text-center">
      <p class="text-2xl font-light">No encontramos productos con esos filtros.</p>
      <button
        type="button"
        @click="resetFilters"
        class="mt-6 inline-flex bg-[#1f1f1f] px-6 py-3 text-xs font-light tracking-[0.12em] text-white transition hover:bg-brand-orange hover:text-black"
      >
        LIMPIAR FILTROS
      </button>
    </div>
  </section>
</template>
