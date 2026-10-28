<script setup>
import { computed, reactive, ref } from 'vue'
import { toast } from 'vue3-toastify'
import { useTextReveal } from '@/composables/useTextReveal'
import { sendContactInquiry } from '@/lib/api'
import { contactChannels } from '@/lib/contact'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^[\d+\s\-()]*$/
const REQUIRED_FIELDS = ['name', 'email', 'text']

const createEmptyForm = () => ({
  name: '',
  number: '',
  email: '',
  text: '',
})

const requiredWithMinLength = ({ requiredMessage, minLength, minLengthMessage }) => (value) => {
  const trimmedValue = value.trim()

  if (!trimmedValue) return requiredMessage
  if (trimmedValue.length < minLength) return minLengthMessage
  return ''
}

// Cada regla devuelve el mensaje de error del campo, o '' si es válido.
const validators = {
  name: requiredWithMinLength({
    requiredMessage: 'El nombre es obligatorio.',
    minLength: 2,
    minLengthMessage: 'El nombre debe tener al menos 2 caracteres.',
  }),
  number: (value) =>
    value && !PHONE_PATTERN.test(value) ? 'Solo se permiten números, +, espacios y guiones.' : '',
  email: (value) => {
    if (!value.trim()) return 'El email es obligatorio.'
    if (!EMAIL_PATTERN.test(value)) return 'El email no es valido.'
    return ''
  },
  text: requiredWithMinLength({
    requiredMessage: 'El mensaje es obligatorio.',
    minLength: 10,
    minLengthMessage: 'El mensaje debe tener al menos 10 caracteres.',
  }),
}

const sectionRef = ref(null)
const isSending = ref(false)
const contactForm = reactive(createEmptyForm())
const errors = reactive(createEmptyForm())

const validateField = (field) => {
  errors[field] = validators[field](contactForm[field])
}

const getFieldStateClass = (field) =>
  errors[field] ? 'border-red-500 focus:border-red-500' : 'border-black/15'

const isFormValid = computed(() =>
  REQUIRED_FIELDS.every((field) => !errors[field] && contactForm[field].trim()),
)

const resetContactForm = () => {
  Object.assign(contactForm, createEmptyForm())
  Object.assign(errors, createEmptyForm())
}

const submitContactForm = async () => {
  REQUIRED_FIELDS.forEach(validateField)

  if (!isFormValid.value || isSending.value) return

  isSending.value = true

  try {
    await sendContactInquiry(contactForm)
    toast.success('Se abrió tu cliente de correo para enviar la consulta.')
    resetContactForm()
  } catch (error) {
    toast.error(error.message || 'No pudimos enviar la consulta. Intentá nuevamente.')
  } finally {
    isSending.value = false
  }
}

useTextReveal(sectionRef)
</script>

<template>
  <section ref="sectionRef" id="contacto" class="bg-[#f3f3f3] px-5 py-16 text-black lg:px-14 lg:py-24">
    <div>
      <div class="grid gap-6 lg:grid-cols-12 lg:items-stretch lg:gap-6 xl:gap-8">
        <div class="flex flex-col lg:col-span-4">
          <p data-text-reveal class="text-xs font-light tracking-[0.22em] text-black/60">[05] CONTACTO</p>
          <h2 data-text-reveal class="mt-5 max-w-xl text-[2rem] font-light leading-[1.08] tracking-tight lg:text-5xl lg:leading-[1.12]">
            Hablemos de tu próximo proyecto.
          </h2>
          <p data-text-reveal class="mt-5 max-w-md text-[15px] font-light leading-snug text-black/70 lg:mt-6 lg:text-lg">
            Contanos qué necesitás resolver y nuestro equipo técnico se pondrá en contacto para
            acompañarte con una respuesta precisa.
          </p>

          <div
            class="relative mt-8 min-h-[240px] flex-1 overflow-hidden rounded-[24px] bg-[#1f1f1f] bg-cover bg-center lg:mt-10 lg:min-h-[360px] lg:rounded-[32px]"
            style="background-image: url('/PersonaReal.jpeg')"
          >
          </div>
        </div>

        <div class="lg:col-span-5">
          <div class="h-full rounded-[24px] border border-black/10 bg-white p-5 lg:rounded-[32px] lg:p-8">
            <form data-text-reveal class="grid gap-4 lg:gap-5" @submit.prevent="submitContactForm">
              <div>
                <label for="contact-name" class="text-xs font-light tracking-[0.18em] text-black/50">
                  NOMBRE
                </label>
                <input
                  id="contact-name"
                  v-model="contactForm.name"
                  name="name"
                  type="text"
                  required
                  placeholder="Tu nombre"
                  @blur="validateField('name')"
                  @input="validateField('name')"
                  class="mt-3 w-full border-b bg-transparent py-3 text-base font-light outline-none transition placeholder:text-black/35 focus:border-brand-orange lg:py-4 lg:text-lg"
                  :class="getFieldStateClass('name')"
                />
                <p v-if="errors.name" class="mt-2 text-xs font-light text-red-500">
                  {{ errors.name }}
                </p>
              </div>

              <div class="grid gap-5 lg:grid-cols-2">
                <div>
                  <label
                    for="contact-number"
                    class="text-xs font-light tracking-[0.18em] text-black/50"
                  >
                    TELÉFONO
                  </label>
                  <input
                    id="contact-number"
                    v-model="contactForm.number"
                    name="number"
                    type="tel"
                    placeholder="+54 341 ..."
                    @blur="validateField('number')"
                    @input="validateField('number')"
                    class="mt-3 w-full border-b bg-transparent py-3 text-base font-light outline-none transition placeholder:text-black/35 focus:border-brand-orange lg:py-4 lg:text-lg"
                    :class="getFieldStateClass('number')"
                  />
                  <p v-if="errors.number" class="mt-2 text-xs font-light text-red-500">
                    {{ errors.number }}
                  </p>
                </div>

                <div>
                  <label
                    for="contact-email"
                    class="text-xs font-light tracking-[0.18em] text-black/50"
                  >
                    EMAIL
                  </label>
                  <input
                    id="contact-email"
                    v-model="contactForm.email"
                    name="email"
                    type="email"
                    required
                    placeholder="tu@email.com"
                    @blur="validateField('email')"
                    @input="validateField('email')"
                    class="mt-3 w-full border-b bg-transparent py-3 text-base font-light outline-none transition placeholder:text-black/35 focus:border-brand-orange lg:py-4 lg:text-lg"
                    :class="getFieldStateClass('email')"
                  />
                  <p v-if="errors.email" class="mt-2 text-xs font-light text-red-500">
                    {{ errors.email }}
                  </p>
                </div>
              </div>

              <div>
                <label for="contact-text" class="text-xs font-light tracking-[0.18em] text-black/50">
                  MENSAJE
                </label>
                <textarea
                  id="contact-text"
                  v-model="contactForm.text"
                  name="text"
                  rows="5"
                  required
                  placeholder="Contanos brevemente qué necesitás."
                  @blur="validateField('text')"
                  @input="validateField('text')"
                  class="mt-3 w-full resize-none border-b bg-transparent py-3 text-base font-light outline-none transition placeholder:text-black/35 focus:border-brand-orange lg:py-4 lg:text-lg"
                  :class="getFieldStateClass('text')"
                ></textarea>
                <p v-if="errors.text" class="mt-2 text-xs font-light text-red-500">
                  {{ errors.text }}
                </p>
              </div>

              <button
                type="submit"
                :disabled="!isFormValid || isSending"
                class="mt-4 inline-flex w-full justify-center bg-[#1f1f1f] px-6 py-3 text-xs font-light tracking-[0.12em] text-white transition hover:bg-brand-orange hover:text-black disabled:cursor-not-allowed disabled:opacity-50 sm:w-fit lg:px-7 lg:py-4"
              >
                {{ isSending ? 'ENVIANDO...' : 'ENVIAR CONSULTA' }}
              </button>
            </form>

          </div>
        </div>

        <aside class="lg:col-span-3">
          <div class="flex h-full flex-col rounded-[24px] border border-black/10 bg-white p-5 lg:rounded-[32px] lg:p-8">
            <p data-text-reveal class="text-xs font-light tracking-[0.18em] text-black/45">OTROS MÉTODOS</p>
            <p data-text-reveal class="mt-4 text-base font-light leading-snug text-black/70 lg:mt-5 lg:text-lg">
              También podés contactarnos directo por estos canales.
            </p>

            <div class="mt-6 divide-y divide-black/10 lg:mt-8">
              <a
                v-for="method in contactChannels"
                :key="method.label"
                :href="method.href"
                target="_blank"
                rel="noopener noreferrer"
                data-text-reveal
                class="block py-5 transition hover:text-brand-orange lg:py-6"
              >
                <span class="block text-xs font-light tracking-[0.18em] text-black/45">
                  {{ method.label }}
                </span>
                <span class="mt-3 block text-base font-light leading-snug lg:text-lg">
                  {{ method.value }}
                </span>
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </section>
</template>
