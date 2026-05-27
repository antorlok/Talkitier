<script setup lang="ts">
import { ref } from 'vue';
import QuizEngine from '~/components/organisms/QuizEngine.vue';
import LanguageSelector from '~/components/organisms/LanguageSelector.vue';
import BaseButton from '~/components/atoms/BaseButton.vue';

// Carga de los datos de evaluación en inglés (Data-Driven UI)
import enQuizRaw from '~/data/tests/en.json';
const enQuiz = enQuizRaw as any;

// Estados reactivos de la Landing Page
const isTestStarted = ref(false);
const selectedLanguageId = ref('');
const isMobileMenuOpen = ref(false);

const startPlacementTest = (langId: string = 'en') => {
  selectedLanguageId.value = langId;
  isTestStarted.value = true;
};

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};
</script>

<template>
  <!-- Layout global con fondo bg-brand-cream según especificaciones de diseño de marca -->
  <div class="min-h-screen bg-brand-cream text-brand-dark flex flex-col font-body transition-colors duration-500">
    
    <!-- HEADER / NAVBAR PREMIUM -->
    <header class="w-full bg-brand-cream/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 border-b border-brand-blue/10 flex items-center justify-between">
      
      <!-- Logo Talkitier original de la referencia -->
      <div class="flex items-center cursor-pointer" @click="isTestStarted = false">
        <img src="/assets/logos/logo-full-dark.svg" alt="Talkitier" class="h-8 md:h-10 object-contain" />
      </div>

      <!-- Menú de Navegación de Escritorio -->
      <nav class="hidden md:flex items-center gap-4">
        <!-- Selector de idioma actual -->
        <button class="bg-brand-blue text-brand-cream text-xs font-semibold px-4 py-2 rounded-talki border border-brand-lightBlue/20 shadow-sm">
          Idioma: ES
        </button>
        
        <BaseButton variant="accent" class="text-brand-blue hover:text-brand-dark">
          Iniciar sesión
        </BaseButton>
        
        <BaseButton variant="secondary" class="!bg-brand-blue !text-brand-cream hover:!bg-brand-blue/95 border-none shadow-md">
          Registrarse
        </BaseButton>
      </nav>

      <!-- Botón de Menú de Hamburguesa para Móviles -->
      <button class="md:hidden w-10 h-10 rounded-talki bg-brand-blue text-brand-cream flex items-center justify-center transition-all active:scale-95" @click="toggleMobileMenu">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

    </header>

    <!-- Menú desplegable para móviles -->
    <div v-if="isMobileMenuOpen" class="md:hidden bg-brand-cream border-b border-brand-blue/10 px-6 py-4 flex flex-col gap-3 shadow-lg">
      <button class="bg-brand-blue text-brand-cream text-xs font-semibold py-2.5 rounded-talki w-full">
        Idioma: ES
      </button>
      <BaseButton variant="accent" class="text-brand-blue justify-center w-full">
        Iniciar sesión
      </BaseButton>
      <BaseButton variant="secondary" class="!bg-brand-blue !text-brand-cream justify-center w-full">
        Registrarse
      </BaseButton>
    </div>

    <!-- CONTENIDO PRINCIPAL -->
    <main class="flex-1 flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-6 py-8 md:py-16">
      
      <!-- RENDERIZADO DEL ENGINE DE PREGUNTAS (SI SE INICIÓ EL TEST) -->
      <div v-if="isTestStarted" class="w-full flex flex-col items-center gap-4">
        <!-- Botón Volver a la Landing -->
        <BaseButton variant="accent" class="self-start text-brand-blue flex items-center gap-2 mb-4 hover:translate-x-[-4px] transition-transform duration-300" @click="isTestStarted = false">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Volver al Inicio
        </BaseButton>

        <QuizEngine :quizData="enQuiz" />
      </div>

      <!-- RENDERIZADO DE LA LANDING PAGE ESTÁNDAR -->
      <div v-else class="w-full flex flex-col gap-12 md:gap-20">
        
        <!-- SECCIÓN HERO -->
        <section class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <!-- Columna Izquierda: Información de Valor -->
          <div class="lg:col-span-7 flex flex-col gap-6 text-left">
            <h2 class="font-title font-extrabold text-4xl md:text-5xl lg:text-6xl text-brand-dark leading-tight tracking-tight">
              El espacio donde tu idioma <span class="bg-[#b6cf7b]/40 px-2 py-0.5 rounded-lg border-b-4 border-brand-greenDark/60">cobra vida.</span>
            </h2>
            
            <p class="font-body text-base md:text-lg text-gray-700 leading-relaxed max-w-xl">
              Ofrecemos grupos conversacionales de lenguas extranjeras para personas principiantes o avanzadas en el mundo de los idiomas.
              Haz el test, descubre tu rango, únete a un servidor de Discord y aprende con amigos.
            </p>

            <!-- Botón CTA de Discord con micro-animaciones -->
            <BaseButton
              variant="primary"
              class="self-start !bg-[#5865F2] hover:!bg-[#4752C4] !text-white px-8 py-4 text-base md:text-lg flex items-center gap-3 shadow-lg shadow-[#5865F2]/20 hover:shadow-[#5865F2]/40 rounded-talki font-title tracking-wide transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              @click="startPlacementTest('en')"
            >
              <!-- Icono oficial de Discord vectorizado -->
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 127.14 96.36" class="w-6 h-6 fill-current">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.47,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c.9-.65,1.76-1.34,2.58-2a75.58,75.58,0,0,0,73,0c.83.69,1.69,1.38,2.58,2a68.43,68.43,0,0,1-10.5,5A77.7,77.7,0,0,0,102,85.51a105.73,105.73,0,0,0,31-18.83C130.67,54.65,125.13,31.58,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.42,65.69,73.24,60,73.24,53S78.42,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"/>
              </svg>
              ÚNETE A NUESTRO SERVIDOR
            </BaseButton>

          </div>

          <!-- Columna Derecha: Imagen decorativa premium con sticker superpuesto -->
          <div class="lg:col-span-5 relative flex justify-center items-center">
            
            <!-- Contenedor principal de la imagen con diseño orgánico y sombras sutiles -->
            <div class="w-full max-w-[400px] aspect-[4/3] rounded-talki overflow-hidden border-4 border-[#b6cf7b] shadow-2xl relative">
              <img
                src="/assets/images/hero-girl.png"
                alt="Estudiante interactuando con Talkitier"
                class="w-full h-full object-cover"
              />
            </div>

            <!-- Personaje decorativo de marca (editables-28.svg) superpuesto -->
            <div class="absolute -bottom-8 -right-8 w-32 h-32 hidden md:block">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1131 1024" class="w-full h-full text-brand-dark drop-shadow-xl">
                <!-- Cuerpo simplificado del waving character cargado de img/editables-28 -->
                <circle cx="565" cy="400" r="160" fill="none" stroke="currentColor" stroke-width="40" />
                <circle cx="500" cy="370" r="20" fill="currentColor" />
                <circle cx="630" cy="370" r="20" fill="currentColor" />
                <path d="M480 470 q85 50 170 0" fill="none" stroke="currentColor" stroke-width="30" stroke-linecap="round" />
                <path d="M565 560 L565 850" stroke="currentColor" stroke-width="40" />
                <path d="M565 650 L380 500" stroke="currentColor" stroke-width="35" stroke-linecap="round" />
                <path d="M565 650 L780 500" stroke="currentColor" stroke-width="35" stroke-linecap="round" />
                <circle cx="360" cy="480" r="30" fill="currentColor" />
                <circle cx="800" cy="480" r="30" fill="currentColor" />
              </svg>
            </div>

          </div>

        </section>

        <!-- SECCIÓN DE SELECCIÓN DE IDIOMAS CON BOCADILLO DE DIÁLOGO -->
        <section class="flex flex-col items-center gap-6 mt-8">
          
          <!-- Bocadillo de diálogo de la mascota animada -->
          <div class="relative bg-brand-greenLight text-brand-dark px-8 py-4 rounded-talki font-title font-bold text-lg md:text-xl shadow-lg border border-brand-greenDark/20 tracking-wide inline-block">
            ¡Mira todos los idiomas que puedes aprender!
            
            <!-- Cola del bocadillo apuntando hacia abajo -->
            <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-4 h-4 bg-brand-greenLight border-r border-b border-brand-greenDark/20" />
          </div>

          <!-- Selector de Idiomas con navegación interactiva -->
          <LanguageSelector @languageSelected="startPlacementTest" />

        </section>

      </div>

    </main>

    <!-- FOOTER SIMPLE Y ELEGANTE -->
    <footer class="w-full bg-brand-dark text-brand-cream/60 py-6 px-6 text-center text-xs font-body border-t border-brand-blue/20">
      <p>© 2026 Talkitier. Todos los derechos reservados. Hecho con ❤️ para amantes de los idiomas.</p>
    </footer>

  </div>
</template>

<style scoped>
/* Transición de scroll suave */
::-webkit-scrollbar {
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(31, 32, 96, 0.2);
  border-radius: 99px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(31, 32, 96, 0.4);
}
</style>
