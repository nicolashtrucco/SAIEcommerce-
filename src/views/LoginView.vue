<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CrossPattern from '@/components/ui/CrossPattern.vue'
import { ADMIN_EMAIL, loginAdmin, logoutAdmin } from '@/lib/auth'

const LOGIN_CROSS_CELLS = [true, false, true, false, true, false, true, true, true]

const router = useRouter()
const route = useRoute()
const isSubmitting = ref(false)
const errorMessage = ref('')

const form = reactive({
  email: '',
  password: '',
})

const normalizeEmail = (value) => String(value || '').trim().toLowerCase()

const submitLogin = async () => {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    const credential = await loginAdmin(form.email, form.password)

    if (ADMIN_EMAIL && normalizeEmail(credential.user.email) !== normalizeEmail(ADMIN_EMAIL)) {
      await logoutAdmin()
      errorMessage.value = 'Este usuario no tiene acceso al panel administrativo.'
      return
    }

    await router.push(String(route.query.redirect || '/admin'))
  } catch (_error) {
    errorMessage.value = 'No pudimos iniciar sesion. Revisa el correo y la contrasena.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="min-h-screen bg-[#f3f3f3] px-5 pb-16 pt-28 text-black lg:px-14 lg:pb-24 lg:pt-40">
    <div class="grid min-h-[calc(100vh-12rem)] gap-10 lg:grid-cols-12 lg:items-center lg:gap-12">
      <div class="lg:col-span-6">
        <p class="text-xs font-light tracking-[0.22em] text-black/55">[ACCESO ADMINISTRATIVO]</p>
        <h1 class="mt-5 max-w-[720px] text-[2.4rem] font-light leading-[1.02] tracking-tight lg:text-7xl">
          Gestion segura del catalogo.
        </h1>
        <p class="mt-6 max-w-md text-[15px] font-light leading-snug text-black/70 lg:mt-8 lg:text-lg">
          Inicia sesion con el usuario autorizado para administrar productos, categorias y clientes.
        </p>

        <CrossPattern
          :cells="LOGIN_CROSS_CELLS"
          class="mt-12 grid w-fit grid-cols-3 gap-x-2 gap-y-1 text-brand-orange"
        />
      </div>

      <div class="lg:col-span-5 lg:col-start-8">
        <form
          @submit.prevent="submitLogin"
          class="border border-black/10 bg-white p-5 shadow-sm lg:p-8"
        >
          <div class="flex items-start justify-between gap-6">
            <div>
              <p class="text-xs font-light tracking-[0.18em] text-black/45">LOGIN</p>
              <h2 class="mt-4 text-3xl font-light leading-tight">Panel admin</h2>
            </div>
            <img src="/LogoGris.png" alt="Sai" class="h-9 object-contain" />
          </div>

          <div class="mt-8 grid gap-5">
            <label class="grid gap-2 text-sm font-light text-black/65">
              Correo
              <input
                v-model="form.email"
                type="email"
                autocomplete="email"
                required
                class="border border-black/15 bg-transparent px-4 py-3 outline-none transition focus:border-brand-orange"
              />
            </label>

            <label class="grid gap-2 text-sm font-light text-black/65">
              Contrasena
              <input
                v-model="form.password"
                type="password"
                autocomplete="current-password"
                required
                class="border border-black/15 bg-transparent px-4 py-3 outline-none transition focus:border-brand-orange"
              />
            </label>
          </div>

          <p v-if="errorMessage" class="mt-5 border border-red-200 bg-red-50 px-4 py-3 text-sm font-light text-red-700">
            {{ errorMessage }}
          </p>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="mt-7 inline-flex w-full justify-center bg-[#1f1f1f] px-6 py-3 text-xs font-light tracking-[0.12em] text-white transition hover:bg-brand-orange hover:text-black disabled:opacity-50"
          >
            {{ isSubmitting ? 'INGRESANDO...' : 'INGRESAR' }}
          </button>
        </form>
      </div>
    </div>
  </section>
</template>
