<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, navigateTo } from '#app';
import { useAuth } from '~/composables/useAuth';
import QuizEngine from '~/components/organisms/QuizEngine.vue';
import BaseButton from '~/components/atoms/BaseButton.vue';

// Recuperación reactiva del estado de autenticación de Discord
const { user, isAuthenticated, logout } = useAuth();
const route = useRoute();

// Alias semántico y explícito conforme al protocolo de Clean Architecture solicitado
const MapsTo = (path: string) => navigateTo(path);

// Protección de Ruta (Server & Client Side Guard)
// Si el usuario no cuenta con una sesión activa, es eyectado inmediatamente al origen.
if (!isAuthenticated.value) {
  MapsTo('/');
}

// Estados reactivos para la carga asíncrona de datos
const testData = ref<any>(null);
const loading = ref(true);
const loadError = ref(false);

onMounted(async () => {
  // Doble validación en cliente para evitar fugas de renderizado si el guard principal del setup
  // se ejecuta en un contexto de hidratación asíncrona.
  if (!isAuthenticated.value) {
    return MapsTo('/');
  }

  // Obtención del parámetro de idioma desde el query string, con fallback por defecto en inglés ('en')
  const lang = (route.query.lang as string || 'en').toLowerCase();
  
  try {
    // Importación dinámica asíncrona usando el sistema de módulos ESM nativo en Vite y Nuxt.
    // Esto previene que se carguen de antemano todos los archivos de test y optimiza el bundle.
    const testModule = await import(`../data/tests/${lang}.json`);
    testData.value = testModule.default;
  } catch (error) {
    console.error(`Error al cargar el archivo de test para el idioma: ${lang}`, error);
    loadError.value = true;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <!-- Wrapper global de pantalla completa aplicando bg-brand-cream y min-h-screen -->
  <div class="min-h-screen bg-brand-cream text-brand-dark flex flex-col font-body">
    
    <!-- HEADER MINIMALISTA DE LA EVALUACIÓN -->
    <header class="w-full bg-brand-cream/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 border-b border-brand-blue/10 flex items-center justify-between">
      
      <!-- Enlace seguro de retorno al landing page de selección -->
      <NuxtLink 
        to="/" 
        class="text-brand-blue hover:text-brand-dark font-title font-bold text-sm md:text-base flex items-center gap-2 transition-transform hover:translate-x-[-3px]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Volver al Inicio
      </NuxtLink>

      <!-- Panel informativo con la sesión de Discord del usuario actual -->
      <div v-if="isAuthenticated && user" class="flex items-center gap-3">
        <img 
          :src="`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`" 
          alt="Avatar de Discord" 
          class="w-8 h-8 rounded-full border border-brand-blue/20 shadow-sm"
          @error="(e: any) => e.target.src = 'https://cdn.discordapp.com/embed/avatars/0.png'"
        />
        <span class="font-title font-bold text-sm text-brand-blue hidden md:inline">{{ user.username }}</span>
        <BaseButton variant="accent" class="text-xs text-red-600 hover:text-red-700 !px-3 !py-1.5" @click="logout">
          Cerrar sesión
        </BaseButton>
      </div>

    </header>

    <!-- ÁREA DE CONTENIDO CENTRAL -->
    <main class="flex-1 flex items-center justify-center p-4 md:p-8 w-full max-w-7xl mx-auto">
      
      <!-- 1. Estado de Carga (Loading State) -->
      <div v-if="loading" class="flex flex-col items-center gap-4 text-brand-blue font-title">
        <svg class="animate-spin h-8 w-8 text-brand-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span class="font-bold animate-pulse">Cargando test...</span>
      </div>

      <!-- 2. Estado de Error (Error fallback por si el JSON dinámico no existe) -->
      <div v-else-if="loadError" class="bg-brand-cream border-2 border-red-600 p-8 rounded-talki text-center max-w-md flex flex-col items-center gap-4 shadow-xl">
        <div class="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h2 class="font-title font-bold text-xl text-red-700">Idioma No Disponible</h2>
        <p class="font-body text-sm text-gray-700 leading-relaxed">
          Lo sentimos, la evaluación de nivelación para este idioma aún no está implementada o configurada.
        </p>
        <BaseButton variant="primary" @click="MapsTo('/')">
          Volver a la selección de idiomas
        </BaseButton>
      </div>

      <!-- 3. Renderizado del Cuestionario Activo (QuizEngine montado centralmente) -->
      <div v-else-if="testData" class="w-full flex justify-center animate-fade-in">
        <QuizEngine :testData="testData" v-if="testData" />
      </div>

    </main>

  </div>
</template>
