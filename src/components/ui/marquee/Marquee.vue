<script setup>
const props = defineProps({
  class: { type: String, required: false },
  reverse: { type: Boolean, required: false },
  pauseOnHover: { type: Boolean, required: false, default: false },
  vertical: { type: Boolean, required: false, default: false },
  repeat: { type: Number, required: false, default: 4 },
})
</script>

<template>
  <div
    :class="[
      'group flex gap-(--gap) overflow-hidden p-2 [--duration:40s] [--gap:1rem]',
      props.vertical ? 'flex-col' : 'flex-row',
      props.class,
    ]"
  >
    <div
      v-for="index in props.repeat"
      :key="index"
      :style="{
        animationDirection: props.reverse ? 'reverse' : 'normal',
      }"
      :class="[
        'flex shrink-0 justify-around gap-(--gap)',
        props.vertical ? 'animate-marquee-vertical flex-col' : 'animate-marquee flex-row',
        props.pauseOnHover ? 'group-hover:paused' : '',
      ]"
    >
      <slot />
    </div>
  </div>
</template>

<style scoped>
.animate-marquee {
  animation: marquee var(--duration) linear infinite;
  animation-direction: reverse;
}

.animate-marquee-vertical {
  animation: marquee-vertical var(--duration) linear infinite;
}

@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(calc(-100% - var(--gap)));
  }
}

@keyframes marquee-vertical {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(calc(-100% - var(--gap)));
  }
}
</style>
