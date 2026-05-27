<template>
  <!-- Definición del layout principal aplicando colores de marca, min-h-screen y fuentes cargadas por optimización -->
  <div class="min-h-screen bg-brand-dark text-brand-cream font-body antialiased flex flex-col">
    <slot />
  </div>
</template>

<script setup lang="ts">
// Componente de Layout por defecto utilizando Composition API y TypeScript.
// Cumple con la regla DRY y se encarga del estilo global del SO/plataforma.
</script>
