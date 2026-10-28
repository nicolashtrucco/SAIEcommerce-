<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { toast } from 'vue3-toastify'
import FilterChip from '@/components/ui/FilterChip.vue'
import {
  createAdminCategory,
  createAdminClient,
  createAdminProduct,
  deleteAdminCategory,
  deleteAdminClient,
  deleteAdminProduct,
  fetchAdminCategories,
  fetchAdminClients,
  fetchAdminProducts,
  updateAdminCategory,
  updateAdminClient,
  updateAdminProduct,
} from '@/lib/api'

const MAX_IMAGE_SIZE_MB = Number(import.meta.env.VITE_MAX_IMAGE_SIZE_MB || 3)
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024
const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const DEFAULT_PRODUCT_CONDITION = 'Nuevo'

const tabs = [
  { id: 'products', label: 'Productos' },
  { id: 'categories', label: 'Categorias' },
  { id: 'clients', label: 'Clientes' },
]

const createEmptyCategoryForm = () => ({
  id: null,
  name: '',
  slug: '',
  isActive: true,
})

const createEmptyProductForm = () => ({
  id: null,
  categoryId: '',
  name: '',
  code: '',
  description: '',
  origin: '',
  condition: DEFAULT_PRODUCT_CONDITION,
  isActive: true,
  imageUrl: '',
})

const createEmptyClientForm = () => ({
  id: null,
  name: '',
  isActive: true,
  logoUrl: '',
})

const activeTab = ref('products')
const isLoading = ref(true)
const isSaving = ref(false)
const categories = ref([])
const products = ref([])
const clients = ref([])
const productImageFile = ref(null)
const clientLogoFile = ref(null)

const categoryForm = reactive(createEmptyCategoryForm())
const productForm = reactive(createEmptyProductForm())
const clientForm = reactive(createEmptyClientForm())

const activeCategories = computed(() => categories.value.filter((category) => category.isActive))

const getStatusBadgeClass = (isActive) => [
  'px-3 py-2 text-xs font-light tracking-[0.14em]',
  isActive ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-700',
]

const emptyCategoryForm = () => {
  Object.assign(categoryForm, createEmptyCategoryForm())
}

const emptyProductForm = () => {
  Object.assign(productForm, createEmptyProductForm(), {
    categoryId: activeCategories.value[0]?.id || '',
  })
  productImageFile.value = null
}

const emptyClientForm = () => {
  Object.assign(clientForm, createEmptyClientForm())
  clientLogoFile.value = null
}

const notifyError = (error) => {
  toast.error(error.message || 'Ocurrio un error inesperado.')
}

const validateImage = (file) => {
  if (!file) return true

  if (!VALID_IMAGE_TYPES.includes(file.type)) {
    toast.error('La imagen debe ser JPG, PNG, WEBP o GIF.')
    return false
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    toast.error(`La imagen no puede superar ${MAX_IMAGE_SIZE_MB}MB.`)
    return false
  }

  return true
}

// Devuelve el archivo elegido si es válido; si no, limpia el input y devuelve null.
const getSelectedImage = (event) => {
  const file = event.target.files?.[0]

  if (validateImage(file)) return file || null

  event.target.value = ''
  return null
}

const handleProductImage = (event) => {
  productImageFile.value = getSelectedImage(event)
}

const handleClientLogo = (event) => {
  clientLogoFile.value = getSelectedImage(event)
}

// Los campos opcionales solo se envían si tienen valor.
const buildFormData = (fields, optionalFields = {}) => {
  const formData = new FormData()

  Object.entries(fields).forEach(([key, value]) => formData.append(key, value))
  Object.entries(optionalFields).forEach(([key, value]) => {
    if (value) formData.append(key, value)
  })

  return formData
}

const loadAdminData = async () => {
  isLoading.value = true

  try {
    const [categoryData, productData, clientData] = await Promise.all([
      fetchAdminCategories(),
      fetchAdminProducts(),
      fetchAdminClients(),
    ])

    categories.value = categoryData
    products.value = productData
    clients.value = clientData

    if (!productForm.categoryId) {
      productForm.categoryId = activeCategories.value[0]?.id || ''
    }
  } catch (error) {
    notifyError(error)
  } finally {
    isLoading.value = false
  }
}

const saveEntity = async ({ id, create, update, buildPayload, messages, resetForm }) => {
  isSaving.value = true

  try {
    if (id) {
      await update(id, buildPayload())
      toast.success(messages.updated)
    } else {
      await create(buildPayload())
      toast.success(messages.created)
    }

    resetForm()
    await loadAdminData()
  } catch (error) {
    notifyError(error)
  } finally {
    isSaving.value = false
  }
}

const deleteEntity = async ({ confirmMessage, remove, id, successMessage, resetForm }) => {
  if (!window.confirm(confirmMessage)) return

  try {
    await remove(id)
    toast.success(successMessage)
    resetForm()
    await loadAdminData()
  } catch (error) {
    notifyError(error)
  }
}

const saveCategory = () =>
  saveEntity({
    id: categoryForm.id,
    create: createAdminCategory,
    update: updateAdminCategory,
    buildPayload: () => ({
      name: categoryForm.name,
      slug: categoryForm.slug,
      isActive: categoryForm.isActive,
    }),
    messages: { created: 'Categoria creada.', updated: 'Categoria actualizada.' },
    resetForm: emptyCategoryForm,
  })

const editCategory = (category) => {
  Object.assign(categoryForm, {
    id: category.id,
    name: category.name,
    slug: category.slug,
    isActive: category.isActive,
  })
  activeTab.value = 'categories'
}

const deleteCategory = (category) =>
  deleteEntity({
    confirmMessage: `Borrar la categoria "${category.name}"?`,
    remove: deleteAdminCategory,
    id: category.id,
    successMessage: 'Categoria borrada.',
    resetForm: emptyCategoryForm,
  })

const saveProduct = () => {
  if (!productForm.id && !productImageFile.value) {
    toast.error('La imagen del producto es obligatoria.')
    return
  }

  return saveEntity({
    id: productForm.id,
    create: createAdminProduct,
    update: updateAdminProduct,
    buildPayload: () =>
      buildFormData(
        {
          categoryId: productForm.categoryId,
          name: productForm.name,
          code: productForm.code,
          description: productForm.description,
          origin: productForm.origin,
          condition: productForm.condition,
          isActive: String(productForm.isActive),
        },
        { imageUrl: productForm.imageUrl, image: productImageFile.value },
      ),
    messages: { created: 'Producto creado.', updated: 'Producto actualizado.' },
    resetForm: emptyProductForm,
  })
}

const editProduct = (product) => {
  Object.assign(productForm, {
    id: product.id,
    categoryId: product.categoryId,
    name: product.name,
    code: product.code,
    description: product.description,
    origin: product.origin || '',
    condition: product.condition || DEFAULT_PRODUCT_CONDITION,
    isActive: product.isActive,
    imageUrl: product.image,
  })
  productImageFile.value = null
  activeTab.value = 'products'
}

const deleteProduct = (product) =>
  deleteEntity({
    confirmMessage: `Borrar el producto "${product.name}"?`,
    remove: deleteAdminProduct,
    id: product.id,
    successMessage: 'Producto borrado.',
    resetForm: emptyProductForm,
  })

const saveClient = () => {
  if (!clientForm.id && !clientLogoFile.value) {
    toast.error('El logo del cliente es obligatorio.')
    return
  }

  return saveEntity({
    id: clientForm.id,
    create: createAdminClient,
    update: updateAdminClient,
    buildPayload: () =>
      buildFormData(
        { name: clientForm.name, isActive: String(clientForm.isActive) },
        { logoUrl: clientForm.logoUrl, image: clientLogoFile.value },
      ),
    messages: { created: 'Cliente creado.', updated: 'Cliente actualizado.' },
    resetForm: emptyClientForm,
  })
}

const editClient = (client) => {
  Object.assign(clientForm, {
    id: client.id,
    name: client.name,
    isActive: client.isActive,
    logoUrl: client.logo,
  })
  clientLogoFile.value = null
  activeTab.value = 'clients'
}

const deleteClient = (client) =>
  deleteEntity({
    confirmMessage: `Borrar el cliente "${client.name}"?`,
    remove: deleteAdminClient,
    id: client.id,
    successMessage: 'Cliente borrado.',
    resetForm: emptyClientForm,
  })

onMounted(loadAdminData)
</script>

<template>
  <section class="min-h-screen bg-[#f3f3f3] px-5 pb-16 pt-28 text-black lg:px-14 lg:pb-24 lg:pt-40">
    <div class="grid gap-7 lg:grid-cols-12 lg:gap-12">
      <div class="lg:col-span-7">
        <p class="text-xs font-light tracking-[0.22em] text-black/55">[PANEL ADMINISTRATIVO]</p>
        <h1 class="mt-5 max-w-[820px] text-[2.4rem] font-light leading-[1.02] tracking-tight lg:text-7xl">
          Gestion de catalogo, categorias y clientes.
        </h1>
      </div>

      <div class="flex flex-col justify-end lg:col-span-4 lg:col-start-9">
        <p class="max-w-md text-[15px] font-light leading-snug text-black/70 lg:text-lg">
          Gestiona productos, categorías y el carrusel de logos de forma simple y centralizada.
        </p>
      </div>
    </div>

    <div class="mt-10 flex flex-wrap gap-2 border-y border-black/10 py-5 lg:mt-14 lg:gap-3 lg:py-6">
      <FilterChip
        v-for="tab in tabs"
        :key="tab.id"
        :active="activeTab === tab.id"
        @click="activeTab = tab.id"
      >
        {{ tab.label.toUpperCase() }}
      </FilterChip>
    </div>

    <div v-if="isLoading" class="mt-8 border border-black/10 bg-white px-8 py-12 text-center">
      <p class="text-2xl font-light">Cargando panel...</p>
    </div>

    <div v-else class="mt-7 grid gap-5 lg:grid-cols-12 lg:gap-6">
      <form
        v-if="activeTab === 'products'"
        @submit.prevent="saveProduct"
        class="border border-black/10 bg-white p-5 lg:col-span-5 lg:p-6"
      >
        <div class="flex items-center justify-between gap-4">
          <p class="text-xs font-light tracking-[0.18em] text-black/45">
            {{ productForm.id ? 'EDITAR PRODUCTO' : 'NUEVO PRODUCTO' }}
          </p>
          <button type="button" @click="emptyProductForm" class="border border-black/15 px-4 py-2 text-[10px] font-light tracking-[0.12em] text-black/65 transition hover:border-brand-orange">
            NUEVO
          </button>
        </div>

        <div class="mt-6 grid gap-4">
          <label class="grid gap-2 text-sm font-light text-black/65">
            Categoria
            <select v-model="productForm.categoryId" required class="border border-black/15 bg-transparent px-4 py-3 outline-none focus:border-brand-orange">
              <option value="" disabled>Seleccionar categoria</option>
              <option v-for="category in activeCategories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </label>

          <label class="grid gap-2 text-sm font-light text-black/65">
            Nombre
            <input v-model="productForm.name" required class="border border-black/15 bg-transparent px-4 py-3 outline-none focus:border-brand-orange" />
          </label>

          <label class="grid gap-2 text-sm font-light text-black/65">
            Codigo
            <input v-model="productForm.code" required class="border border-black/15 bg-transparent px-4 py-3 uppercase outline-none focus:border-brand-orange" />
          </label>

          <label class="grid gap-2 text-sm font-light text-black/65">
            Descripcion
            <textarea v-model="productForm.description" required rows="5" class="border border-black/15 bg-transparent px-4 py-3 outline-none focus:border-brand-orange" />
          </label>

          <div class="grid gap-4 md:grid-cols-2">
            <label class="grid gap-2 text-sm font-light text-black/65">
              Origen
              <input v-model="productForm.origin" class="border border-black/15 bg-transparent px-4 py-3 outline-none focus:border-brand-orange" />
            </label>

            <label class="grid gap-2 text-sm font-light text-black/65">
              Condicion
              <select v-model="productForm.condition" class="border border-black/15 bg-transparent px-4 py-3 outline-none focus:border-brand-orange">
                <option>Nuevo</option>
                <option>Usado</option>
                <option>Reacondicionado</option>
              </select>
            </label>
          </div>

          <label class="grid gap-2 text-sm font-light text-black/65">
            Imagen {{ productForm.id ? '(opcional para reemplazar)' : '' }}
            <input type="file" accept="image/*" @change="handleProductImage" class="border border-black/15 bg-transparent px-4 py-3 outline-none focus:border-brand-orange" />
          </label>

          <label class="inline-flex items-center gap-3 text-sm font-light text-black/65">
            <input v-model="productForm.isActive" type="checkbox" />
            Producto activo
          </label>
        </div>

        <div class="mt-6 flex flex-wrap gap-3">
          <button type="submit" :disabled="isSaving" class="bg-[#1f1f1f] px-6 py-3 text-xs font-light tracking-[0.12em] text-white transition hover:bg-brand-orange hover:text-black disabled:opacity-50">
            {{ isSaving ? 'GUARDANDO...' : 'GUARDAR PRODUCTO' }}
          </button>
          <button v-if="productForm.id" type="button" @click="emptyProductForm" class="border border-black/15 px-6 py-3 text-xs font-light tracking-[0.12em] text-black/65 transition hover:border-brand-orange">
            CANCELAR
          </button>
        </div>
      </form>

      <form
        v-if="activeTab === 'categories'"
        @submit.prevent="saveCategory"
        class="border border-black/10 bg-white p-5 lg:col-span-5 lg:p-6"
      >
        <div class="flex items-center justify-between gap-4">
          <p class="text-xs font-light tracking-[0.18em] text-black/45">
            {{ categoryForm.id ? 'EDITAR CATEGORIA' : 'NUEVA CATEGORIA' }}
          </p>
          <button type="button" @click="emptyCategoryForm" class="border border-black/15 px-4 py-2 text-[10px] font-light tracking-[0.12em] text-black/65 transition hover:border-brand-orange">
            NUEVA
          </button>
        </div>

        <div class="mt-6 grid gap-4">
          <label class="grid gap-2 text-sm font-light text-black/65">
            Nombre
            <input v-model="categoryForm.name" required class="border border-black/15 bg-transparent px-4 py-3 outline-none focus:border-brand-orange" />
          </label>

          <!-- <label class="grid gap-2 text-sm font-light text-black/65">
            Slug
            <input v-model="categoryForm.slug" placeholder="Se genera automaticamente si queda vacio" class="border border-black/15 bg-transparent px-4 py-3 outline-none focus:border-brand-orange" />
          </label> -->

          <label class="inline-flex items-center gap-3 text-sm font-light text-black/65">
            <input v-model="categoryForm.isActive" type="checkbox" />
            Categoria activa
          </label>
        </div>

        <div class="mt-6 flex flex-wrap gap-3">
          <button type="submit" :disabled="isSaving" class="bg-[#1f1f1f] px-6 py-3 text-xs font-light tracking-[0.12em] text-white transition hover:bg-brand-orange hover:text-black disabled:opacity-50">
            {{ isSaving ? 'GUARDANDO...' : 'GUARDAR CATEGORIA' }}
          </button>
          <button v-if="categoryForm.id" type="button" @click="emptyCategoryForm" class="border border-black/15 px-6 py-3 text-xs font-light tracking-[0.12em] text-black/65 transition hover:border-brand-orange">
            CANCELAR
          </button>
        </div>
      </form>

      <form
        v-if="activeTab === 'clients'"
        @submit.prevent="saveClient"
        class="border border-black/10 bg-white p-5 lg:col-span-5 lg:p-6"
      >
        <div class="flex items-center justify-between gap-4">
          <p class="text-xs font-light tracking-[0.18em] text-black/45">
            {{ clientForm.id ? 'EDITAR CLIENTE' : 'NUEVO CLIENTE' }}
          </p>
          <button type="button" @click="emptyClientForm" class="border border-black/15 px-4 py-2 text-[10px] font-light tracking-[0.12em] text-black/65 transition hover:border-brand-orange">
            NUEVO
          </button>
        </div>

        <div class="mt-6 grid gap-4">
          <label class="grid gap-2 text-sm font-light text-black/65">
            Nombre
            <input v-model="clientForm.name" required class="border border-black/15 bg-transparent px-4 py-3 outline-none focus:border-brand-orange" />
          </label>

          <label class="grid gap-2 text-sm font-light text-black/65">
            Logo {{ clientForm.id ? '(opcional para reemplazar)' : '' }}
            <input type="file" accept="image/*" @change="handleClientLogo" class="border border-black/15 bg-transparent px-4 py-3 outline-none focus:border-brand-orange" />
          </label>

          <label class="inline-flex items-center gap-3 text-sm font-light text-black/65">
            <input v-model="clientForm.isActive" type="checkbox" />
            Cliente activo
          </label>
        </div>

        <div class="mt-6 flex flex-wrap gap-3">
          <button type="submit" :disabled="isSaving" class="bg-[#1f1f1f] px-6 py-3 text-xs font-light tracking-[0.12em] text-white transition hover:bg-brand-orange hover:text-black disabled:opacity-50">
            {{ isSaving ? 'GUARDANDO...' : 'GUARDAR CLIENTE' }}
          </button>
          <button v-if="clientForm.id" type="button" @click="emptyClientForm" class="border border-black/15 px-6 py-3 text-xs font-light tracking-[0.12em] text-black/65 transition hover:border-brand-orange">
            CANCELAR
          </button>
        </div>
      </form>

      <div class="lg:col-span-7">
        <div v-if="activeTab === 'products'" class="grid gap-4">
          <article v-for="product in products" :key="product.id" class="grid gap-4 border border-black/10 bg-white p-5 md:grid-cols-[120px_1fr]">
            <img :src="product.image" :alt="product.name" class="h-28 w-full bg-[#f3f3f3] object-contain" />
            <div>
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p class="text-xs font-light tracking-[0.18em] text-black/40">{{ product.code }}</p>
                  <h2 class="mt-2 text-2xl font-light">{{ product.name }}</h2>
                  <p class="mt-1 text-sm font-light text-black/55">{{ product.category }} · {{ product.condition }}</p>
                </div>
                <span :class="getStatusBadgeClass(product.isActive)">
                  {{ product.isActive ? 'ACTIVO' : 'INACTIVO' }}
                </span>
              </div>
              <div class="mt-5 flex flex-wrap gap-3">
                <button type="button" @click="editProduct(product)" class="border border-black/15 px-5 py-2 text-xs font-light tracking-[0.12em] transition hover:border-brand-orange">
                  EDITAR
                </button>
                <button type="button" @click="deleteProduct(product)" class="bg-[#1f1f1f] px-5 py-2 text-xs font-light tracking-[0.12em] text-white transition hover:bg-brand-orange hover:text-black">
                  BORRAR
                </button>
              </div>
            </div>
          </article>
          <p v-if="products.length === 0" class="border border-black/10 bg-white p-8 text-center text-xl font-light">
            No hay productos cargados.
          </p>
        </div>

        <div v-if="activeTab === 'categories'" class="grid gap-3">
          <article v-for="category in categories" :key="category.id" class="flex flex-wrap items-center justify-between gap-4 border border-black/10 bg-white p-5">
            <div>
              <h2 class="text-2xl font-light">{{ category.name }}</h2>
              <p class="mt-1 text-sm font-light text-black/50">/{{ category.slug }}</p>
            </div>
            <div class="flex flex-wrap items-center gap-3">
              <span :class="getStatusBadgeClass(category.isActive)">
                {{ category.isActive ? 'ACTIVA' : 'INACTIVA' }}
              </span>
              <button type="button" @click="editCategory(category)" class="border border-black/15 px-5 py-2 text-xs font-light tracking-[0.12em] transition hover:border-brand-orange">
                EDITAR
              </button>
              <button type="button" @click="deleteCategory(category)" class="bg-[#1f1f1f] px-5 py-2 text-xs font-light tracking-[0.12em] text-white transition hover:bg-brand-orange hover:text-black">
                BORRAR
              </button>
            </div>
          </article>
          <p v-if="categories.length === 0" class="border border-black/10 bg-white p-8 text-center text-xl font-light">
            No hay categorias cargadas.
          </p>
        </div>

        <div v-if="activeTab === 'clients'" class="grid gap-3">
          <article v-for="client in clients" :key="client.id" class="grid gap-4 border border-black/10 bg-white p-5 md:grid-cols-[120px_1fr]">
            <img :src="client.logo" :alt="client.name" class="h-24 w-full bg-[#1f1f1f] object-contain p-4" />
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 class="text-2xl font-light">{{ client.name }}</h2>
                <p class="mt-1 text-sm font-light text-black/50">Orden {{ client.sortOrder }}</p>
              </div>
              <div class="flex flex-wrap items-center gap-3">
                <span :class="getStatusBadgeClass(client.isActive)">
                  {{ client.isActive ? 'ACTIVO' : 'INACTIVO' }}
                </span>
                <button type="button" @click="editClient(client)" class="border border-black/15 px-5 py-2 text-xs font-light tracking-[0.12em] transition hover:border-brand-orange">
                  EDITAR
                </button>
                <button type="button" @click="deleteClient(client)" class="bg-[#1f1f1f] px-5 py-2 text-xs font-light tracking-[0.12em] text-white transition hover:bg-brand-orange hover:text-black">
                  BORRAR
                </button>
              </div>
            </div>
          </article>
          <p v-if="clients.length === 0" class="border border-black/10 bg-white p-8 text-center text-xl font-light">
            No hay clientes cargados.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
