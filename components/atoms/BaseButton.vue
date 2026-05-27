<script setup lang="ts">
// Definición de las propiedades del botón base con tipado estricto
interface Props {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  disabled: false,
  type: 'button'
});

defineEmits<{
  (e: 'click', event: MouseEvent): void;
}>();
</script>

<template>
  <!-- Botón base con la clase redondeada custom 'rounded-talki', animaciones suaves de escala y fuentes cargadas -->
  <button
    :type="type"
    :disabled="disabled"
    class="font-body font-semibold px-6 py-3 rounded-talki transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-brand-lightBlue/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
    :class="{
      'bg-brand-greenLight text-brand-dark hover:bg-brand-greenDark hover:text-white hover:shadow-lg hover:shadow-brand-greenLight/20': variant === 'primary',
      'bg-brand-blue text-brand-cream border border-brand-lightBlue/30 hover:border-brand-lightBlue hover:bg-brand-blue/80': variant === 'secondary',
      'bg-transparent text-brand-lightBlue hover:bg-brand-blue/30': variant === 'accent',
      'bg-red-600 text-brand-cream hover:bg-red-700': variant === 'danger'
    }"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>
