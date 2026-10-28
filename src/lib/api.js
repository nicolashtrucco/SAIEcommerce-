import { getAdminToken } from '@/lib/auth'
import { CONTACT_EMAIL } from '@/lib/contact'
import demoClients from '@/data/demo-clients.json'
import demoProducts from '@/data/demo-products.json'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '')

const getErrorMessage = async (response) => {
  try {
    const data = await response.json()
    return data.message || `API request failed: ${response.status}`
  } catch (_error) {
    return `API request failed: ${response.status}`
  }
}

const getAuthHeaders = async () => {
  const token = await getAdminToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const buildUrl = (path, params) => {
  const url = new URL(`${API_BASE_URL}${path}`)

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      url.searchParams.set(key, String(value))
    }
  })

  return url.toString()
}

// `json` se serializa como JSON; `formData` se envía tal cual para que el navegador
// defina el boundary del multipart.
const apiRequest = async (
  path,
  { method = 'GET', params = {}, json, formData, authenticated = false } = {},
) => {
  if (!API_BASE_URL) {
    throw new Error('Esta función requiere un backend configurado.')
  }

  const headers = {
    ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...(authenticated ? await getAuthHeaders() : {}),
  }

  const response = await fetch(buildUrl(path, params), {
    method,
    headers,
    body: json !== undefined ? JSON.stringify(json) : formData,
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }

  return response.json()
}

// Endpoints CRUD del panel admin, que comparten la misma forma para cada recurso.
const createAdminResource = (resource, bodyType) => {
  const basePath = `/api/admin/${resource}`
  const getItemPath = (id) => `${basePath}/${encodeURIComponent(id)}`
  const withBody = (method, body) => ({ method, [bodyType]: body, authenticated: true })

  return {
    list: () => apiRequest(basePath, { authenticated: true }),
    create: (body) => apiRequest(basePath, withBody('POST', body)),
    update: (id, body) => apiRequest(getItemPath(id), withBody('PUT', body)),
    remove: (id) => apiRequest(getItemPath(id), { method: 'DELETE', authenticated: true }),
  }
}

const adminCategories = createAdminResource('categories', 'json')
const adminProducts = createAdminResource('products', 'formData')
const adminClients = createAdminResource('clients', 'formData')

const demoCategories = [...new Map(
  demoProducts.map((product) => [
    product.categorySlug,
    {
      id: product.categoryId,
      name: product.category,
      slug: product.categorySlug,
      isActive: true,
    },
  ]),
).values()]

export const fetchCategories = async () => demoCategories

export const fetchProducts = async (params = {}) => {
  const category = String(params.category || '').trim().toLowerCase()
  const search = String(params.search || '').trim().toLowerCase()

  return demoProducts.filter((product) => {
    const matchesCategory =
      !category ||
      category === 'todos' ||
      product.categorySlug.toLowerCase() === category ||
      product.category.toLowerCase() === category
    const matchesSearch =
      !search ||
      [product.name, product.code, product.description, product.category].some((value) =>
        value.toLowerCase().includes(search),
      )

    return matchesCategory && matchesSearch
  })
}

export const fetchProductByCode = async (code) => {
  const product = demoProducts.find(
    (item) => item.code.toLowerCase() === String(code).trim().toLowerCase(),
  )

  if (!product) throw new Error('Product not found')

  return product
}

export const fetchClients = async () =>
  demoClients
    .filter((client) => client.isActive)
    .sort((firstClient, secondClient) => firstClient.sortOrder - secondClient.sortOrder)

export const sendContactInquiry = async ({ name, number, email, text }) => {
  const subject = encodeURIComponent(`Consulta web de ${name}`)
  const body = encodeURIComponent(
    `Nombre: ${name}\nTeléfono: ${number || 'No informado'}\nEmail: ${email}\n\nConsulta:\n${text}`,
  )

  window.location.href = `${CONTACT_EMAIL.href}?subject=${subject}&body=${body}`
}

export const fetchAdminCategories = adminCategories.list
export const createAdminCategory = adminCategories.create
export const updateAdminCategory = adminCategories.update
export const deleteAdminCategory = adminCategories.remove

export const fetchAdminProducts = adminProducts.list
export const createAdminProduct = adminProducts.create
export const updateAdminProduct = adminProducts.update
export const deleteAdminProduct = adminProducts.remove

export const fetchAdminClients = adminClients.list
export const createAdminClient = adminClients.create
export const updateAdminClient = adminClients.update
export const deleteAdminClient = adminClients.remove
