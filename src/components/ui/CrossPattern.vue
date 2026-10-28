<script setup>
// Cada celda de la grilla 3x3, de izquierda a derecha y de arriba a abajo.
// Las clases de la grilla las define quien usa el componente.
defineProps({
  cells: {
    type: Array,
    default: () => [true, false, false, true, true, false, true, true, true],
  },
})
</script>

<template>
  <div>
    <span v-for="(hasCross, index) in cells" :key="index">{{ hasCross ? '+' : '' }}</span>
  </div>
</template>
