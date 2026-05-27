<script setup lang="ts">
import { ref } from 'vue';

// Definición de la interfaz del idioma
interface Language {
  id: string;
  name: string;
  nativeName: string;
  description: string; // Pequeña descripción del idioma (Fase 12)
  flagPath?: string;
  flagSvg?: string; // Bandera en SVG embebido para máxima fidelidad y carga instantánea
}

// Emits del componente
const emit = defineEmits<{
  (e: 'languageSelected', languageId: string): void;
}>();

// Datos estáticos de los idiomas disponibles
const languages = ref<Language[]>([
  {
    id: 'de',
    name: 'Alemán',
    nativeName: 'Deutsch',
    description: 'Explora la potencia de la cultura y la ciencia germánica.',
    // SVG circular oficial de la bandera de Alemania
    flagSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="w-12 h-12 rounded-full shadow-md"><g clip-path="circle(256 256 256)"><path fill="#ffce00" d="M0 0h512v512H0z"/><path d="M0 0h512v341.3H0z"/><path fill="#dd0000" d="M0 170.7h512v170.6H0z"/></g></svg>`
  },
  {
    id: 'pt',
    name: 'Portugués',
    nativeName: 'Português',
    description: 'Conecta con la calidez y la alegría de la cultura lusófona.',
    // SVG circular oficial de la bandera de Portugal
    flagSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="w-12 h-12 rounded-full shadow-md"><g clip-path="circle(256 256 256)"><path fill="#ff0000" d="M0 0h512v512H0z"/><path fill="#006600" d="M0 0h204.8v512H0z"/><circle cx="204.8" cy="256" r="76.8" fill="#ffce00"/><path fill="#ff0000" d="M192 204.8h25.6v102.4H192z"/><path fill="#ffffff" d="M185.6 217.6h38.4v76.8h-38.4z"/><circle cx="204.8" cy="256" r="38.4" fill="#002b7f"/></g></svg>`
  },
  {
    id: 'en',
    name: 'Inglés',
    nativeName: 'English',
    description: 'Domina el idioma de los negocios y la comunicación global.',
    // SVG circular oficial de la bandera de EE.UU.
    flagSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="w-12 h-12 rounded-full shadow-md"><g clip-path="circle(256 256 256)"><path fill="#ffffff" d="M0 0h512v512H0z"/><path fill="#b22234" d="M0 0h512v39.4H0zm0 78.8h512v39.4H0zm0 78.8h512v39.4H0zm0 78.8h512v39.4H0zm0 78.7h512v39.4H0zm0 78.8h512v39.4H0zm0 78.8h512v39.4H0z"/><path fill="#3c3b6e" d="M0 0h204.8v275.8H0z"/><g fill="#ffffff"><circle cx="25.6" cy="27.6" r="6"/><circle cx="76.8" cy="27.6" r="6"/><circle cx="128" cy="27.6" r="6"/><circle cx="179.2" cy="27.6" r="6"/><circle cx="51.2" cy="55.2" r="6"/><circle cx="102.4" cy="55.2" r="6"/><circle cx="153.6" cy="55.2" r="6"/><circle cx="25.6" cy="82.8" r="6"/><circle cx="76.8" cy="82.8" r="6"/><circle cx="128" cy="82.8" r="6"/><circle cx="179.2" cy="82.8" r="6"/><circle cx="51.2" cy="110.4" r="6"/><circle cx="102.4" cy="110.4" r="6"/><circle cx="153.6" cy="110.4" r="6"/><circle cx="25.6" cy="137.9" r="6"/><circle cx="76.8" cy="137.9" r="6"/><circle cx="128" cy="137.9" r="6"/><circle cx="179.2" cy="137.9" r="6"/><circle cx="51.2" cy="165.5" r="6"/><circle cx="102.4" cy="165.5" r="6"/><circle cx="153.6" cy="165.5" r="6"/><circle cx="25.6" cy="193.1" r="6"/><circle cx="76.8" cy="193.1" r="6"/><circle cx="128" cy="193.1" r="6"/><circle cx="179.2" cy="193.1" r="6"/><circle cx="51.2" cy="220.7" r="6"/><circle cx="102.4" cy="220.7" r="6"/><circle cx="153.6" cy="220.7" r="6"/><circle cx="25.6" cy="248.3" r="6"/><circle cx="76.8" cy="248.3" r="6"/><circle cx="128" cy="248.3" r="6"/><circle cx="179.2" cy="248.3" r="6"/></g></g></svg>`
  },
  {
    id: 'es',
    name: 'Español',
    nativeName: 'Español',
    description: 'Habla la lengua de la pasión, el arte y la gran comunidad.',
    // SVG circular oficial de la bandera de España
    flagSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="w-12 h-12 rounded-full shadow-md"><g clip-path="circle(256 256 256)"><path fill="#c60b1e" d="M0 0h512v512H0z"/><path fill="#ffc400" d="M0 128h512v256H0z"/><circle cx="140" cy="256" r="36" fill="#c60b1e"/><circle cx="140" cy="256" r="26" fill="#ffc400"/></g></svg>`
  },
  {
    id: 'it',
    name: 'Italiano',
    nativeName: 'Italiano',
    description: 'Sumérgete en la belleza del arte, la moda y su gastronomía.',
    // SVG circular oficial de la bandera de Italia
    flagSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="w-12 h-12 rounded-full shadow-md"><g clip-path="circle(256 256 256)"><path fill="#ffffff" d="M0 0h512v512H0z"/><path fill="#009246" d="M0 0h170.7v512H0z"/><path fill="#ce2b37" d="M341.3 0H512v512H341.3z"/></g></svg>`
  }
]);

const selectLanguage = (id: string) => {
  emit('languageSelected', id);
};

// Control de alerta de "Próximamente" para flechas del carrusel
const showSoonAlert = ref(false);
let alertTimeout: any = null;

const triggerSoonAlert = () => {
  showSoonAlert.value = true;
  clearTimeout(alertTimeout);
  alertTimeout = setTimeout(() => {
    showSoonAlert.value = false;
  }, 2500);
};
</script>

<template>
  <!-- Carrusel/Grilla interactiva de selección de idiomas -->
  <div class="w-full flex items-center justify-between gap-4 font-body mt-4 relative">
    
    <!-- Alerta Flotante Premium en Formato Tarjeta 3D (Fase 12) -->
    <Transition name="fade">
      <div 
        v-if="showSoonAlert" 
        class="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-brand-blue text-brand-cream font-body text-xs p-4 rounded-2xl border-2 border-[#b6cf7b] shadow-2xl flex flex-col items-center gap-1.5 z-50 w-72 text-center transition-all duration-300"
      >
        <span class="font-title font-extrabold text-brand-greenLight text-sm flex items-center gap-1">
          🌍 ¡Más idiomas próximamente!
        </span>
        <span class="text-[10px] text-brand-cream/80 leading-relaxed font-medium">
          Estamos preparando nuevos cursos, evaluaciones dinámicas y comunidades para expandir tu fluidez. ¡Mantente atento!
        </span>
      </div>
    </Transition>

    <!-- Botón de navegación izquierda de carrusel -->
    <button 
      @click="triggerSoonAlert"
      class="w-10 h-10 rounded-full bg-brand-blue text-brand-cream hover:bg-brand-blue/80 flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
        <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
      </svg>
    </button>

    <!-- Contenedor de la lista de tarjetas de idiomas de carácter puramente informativo con hover premium sin desbordamiento (Fase 12) -->
    <div class="flex-1 flex flex-wrap md:flex-nowrap justify-center items-stretch gap-3 md:gap-4 overflow-x-auto md:overflow-x-visible py-2">
      <div
        v-for="lang in languages"
        :key="lang.id"
        class="bg-[#9ec1df] text-brand-dark px-4 py-6 rounded-[2rem] flex flex-col gap-2.5 border-2 border-brand-blue/10 shadow-md hover:shadow-xl hover:border-brand-blue/30 hover:scale-[1.02] transition-all duration-300 min-w-[165px] sm:min-w-[180px] md:min-w-[185px] lg:min-w-[200px] max-w-[230px] text-center items-center relative overflow-hidden"
      >
        <!-- Bandera circular vectorizada -->
        <div v-html="lang.flagSvg" class="flex-shrink-0" />
        
        <div class="flex flex-col">
          <span class="font-title font-bold text-base leading-snug text-brand-dark">{{ lang.name }}</span>
          <span class="text-xs text-brand-blue/70 font-semibold font-body">{{ lang.nativeName }}</span>
        </div>

        <!-- Descripción del Idioma -->
        <p class="text-[11px] font-body text-gray-700 leading-relaxed px-1">
          {{ lang.description }}
        </p>
      </div>
    </div>

    <!-- Botón de navegación derecha de carrusel -->
    <button 
      @click="triggerSoonAlert"
      class="w-10 h-10 rounded-full bg-brand-blue text-brand-cream hover:bg-brand-blue/80 flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
        <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
      </svg>
    </button>

  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
