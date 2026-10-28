<script setup>
defineProps({
  size: { type: String, default: 'sm' },
})

// Clases completas y literales: Tailwind no detecta clases armadas dinámicamente.
const CORNER_CLASSES = {
  sm: [
    'pointer-events-none absolute -top-1 -left-1 h-4 w-4 border-t border-l border-current/40',
    'pointer-events-none absolute -top-1 -right-1 h-4 w-4 border-t border-r border-current/40',
    'pointer-events-none absolute -bottom-1 -left-1 h-4 w-4 border-b border-l border-current/40',
    'pointer-events-none absolute -bottom-1 -right-1 h-4 w-4 border-b border-r border-current/40',
  ],
  lg: [
    'absolute -top-3 -left-3 h-8 w-8 border-t-2 border-l-2 border-brand-orange/40 lg:-top-4 lg:-left-4 lg:h-12 lg:w-12',
    'absolute -top-3 -right-3 h-8 w-8 border-t-2 border-r-2 border-brand-orange/40 lg:-top-4 lg:-right-4 lg:h-12 lg:w-12',
    'absolute -bottom-3 -left-3 h-8 w-8 border-b-2 border-l-2 border-brand-orange/40 lg:-bottom-4 lg:-left-4 lg:h-12 lg:w-12',
    'absolute -bottom-3 -right-3 h-8 w-8 border-b-2 border-r-2 border-brand-orange/40 lg:-bottom-4 lg:-right-4 lg:h-12 lg:w-12',
  ],
}
</script>

<template>
  <div v-for="cornerClass in CORNER_CLASSES[size]" :key="cornerClass" :class="cornerClass"></div>
</template>
