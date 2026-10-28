import { ref } from 'vue'

export const useAsyncData = (fetcher, { initialValue = null, errorMessage = '' } = {}) => {
  const data = ref(initialValue)
  const isLoading = ref(true)
  const loadError = ref('')
  let latestRequestId = 0

  // Solo la última solicitud actualiza el estado, para que una respuesta lenta de una
  // carga anterior no pise a la más reciente.
  const load = async () => {
    const requestId = ++latestRequestId
    const isLatest = () => requestId === latestRequestId

    isLoading.value = true
    loadError.value = ''

    try {
      const result = await fetcher()
      if (isLatest()) data.value = result
    } catch (_error) {
      if (!isLatest()) return
      data.value = initialValue
      loadError.value = errorMessage
    } finally {
      if (isLatest()) isLoading.value = false
    }
  }

  return { data, isLoading, loadError, load }
}
