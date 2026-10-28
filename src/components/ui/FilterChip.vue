<script setup>
defineProps({
  active: { type: Boolean, default: false },
})
</script>

<template>
  <button
    type="button"
    :class="[
      'border px-4 py-2.5 text-[11px] font-light tracking-[0.1em] transition lg:px-5 lg:py-3 lg:text-xs lg:tracking-[0.12em]',
      active
        ? 'border-[#1f1f1f] bg-[#1f1f1f] text-white'
        : 'border-black/15 bg-transparent text-black/65 hover:border-brand-orange hover:text-black',
    ]"
  >
    <slot />
  </button>
</template>
