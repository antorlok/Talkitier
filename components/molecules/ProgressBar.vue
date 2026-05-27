<script setup lang="ts">
// Definición de las propiedades de la barra de progreso
interface Props {
  progress: number; // Porcentaje de 0 a 100
  label?: string;   // Etiqueta textual opcional (por ejemplo: "Paso 1 de 4")
}

defineProps<Props>();
</script>

<template>
  <div class="w-full font-body">
    <!-- Fila superior para etiquetas y porcentaje -->
    <div class="flex justify-between items-center mb-2 text-xs md:text-sm">
      <span v-if="label" class="text-brand-lightBlue font-medium tracking-wide">{{ label }}</span>
      <span class="text-brand-greenLight font-bold font-title">{{ Math.round(progress) }}%</span>
    </div>
    
    <!-- Contenedor exterior de la barra de progreso con borde redondeado custom -->
    <div class="w-full h-3 bg-brand-blue/60 rounded-full overflow-hidden border border-brand-lightBlue/10 p-[2px]">
      <!-- Barra interna con degradado de marca y transición fluida de ancho -->
      <div
        class="h-full bg-gradient-to-r from-brand-lightBlue to-brand-greenLight rounded-full transition-all duration-500 ease-out"
        :style="{ width: `${progress}%` }"
      />
    </div>
  </div>
</template>
