<script setup lang="ts">
import { ref } from 'vue';
import LanguageSelector from '~/components/organisms/LanguageSelector.vue';
import BaseButton from '~/components/atoms/BaseButton.vue';

// Importación del Composable de sesión de Discord
import { useAuth } from '~/composables/useAuth';

// Desestructuración de estados de autenticación reactivos
const { user, isAuthenticated, logout } = useAuth();

// Estados reactivos de navegación de la Landing Page
const isMobileMenuOpen = ref(false);
const isPlansOpen = ref(false);
const isTestDropdownOpen = ref(false);

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const togglePlans = () => {
  isPlansOpen.value = !isPlansOpen.value;
};

const loginWithDiscord = () => {
  navigateTo('/api/auth/login', { external: true });
};

// Control de flujo seguro: redirecciona a la página de test /test?lang=xx si está logueado
const handleLanguageSelected = (langId: string) => {
  if (isAuthenticated.value) {
    navigateTo(`/test?lang=${langId}`);
  } else {
    alert('Se requiere iniciar sesión con Discord para realizar la evaluación de nivelación.');
    loginWithDiscord();
  }
};

// Desplazamiento suave a la sección de selección de idiomas
const scrollToLanguages = () => {
  const element = document.getElementById('languages-section');
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};
</script>

<template>
  <!-- Layout global con fondo bg-brand-cream según especificaciones de diseño de marca -->
  <div class="min-h-screen bg-brand-cream text-brand-dark flex flex-col font-body transition-colors duration-500">
    
    <!-- HEADER / NAVBAR PREMIUM RESPONSIVO MOBILE-FIRST (Fase 14) -->
    <header class="w-full bg-brand-cream/80 backdrop-blur-md sticky top-0 z-50 px-4 py-3 md:px-6 md:py-4 border-b border-brand-blue/10 flex items-center justify-between">
      
      <!-- Logo Talkitier original de la referencia -->
      <div class="flex items-center cursor-pointer" @click="navigateTo('/')">
        <img src="/assets/logos/logo-full-dark.svg" alt="Talkitier" class="h-7 md:h-10 object-contain" />
      </div>

      <!-- Menú de Navegación de Escritorio -->
      <nav class="hidden md:flex items-center gap-4">
        <!-- Selector de planes -->
        <button 
          @click="togglePlans" 
          class="bg-brand-blue text-brand-cream hover:bg-brand-blue/90 text-xs font-semibold px-5 py-2.5 rounded-talki border border-brand-lightBlue/20 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 text-brand-greenLight">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 21L14.907 18L21 21L20.187 15.904L24 12.188L18.828 11.458L16.5 6.75L14.172 11.458L9 12.188L12.813 15.904Z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707-.707" />
          </svg>
          Planes
        </button>
        
        <!-- Renderizado Condicional según Autenticación -->
        <div v-if="isAuthenticated && user" class="flex items-center gap-3">
          <img 
            :src="`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`" 
            alt="Avatar de Discord" 
            class="w-8 h-8 rounded-full border border-brand-blue/20 shadow-sm object-cover" 
            @error="(e: any) => e.target.src = 'https://cdn.discordapp.com/embed/avatars/0.png'"
          />
          <span class="font-title font-bold text-sm text-brand-blue tracking-tight">{{ user.username }}</span>
          <BaseButton variant="accent" class="text-xs text-red-600 hover:text-red-700 !px-3 !py-1.5" @click="logout">
            Cerrar sesión
          </BaseButton>
        </div>
        <BaseButton v-else variant="secondary" class="!bg-brand-blue !text-brand-cream hover:!bg-brand-blue/95 border-none shadow-md" @click="loginWithDiscord">
          Iniciar sesión
        </BaseButton>
      </nav>

      <!-- Botón de Menú de Hamburguesa para Móviles -->
      <button class="md:hidden w-9 h-9 rounded-talki bg-brand-blue text-brand-cream flex items-center justify-center transition-all active:scale-95" @click="toggleMobileMenu">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4.5 h-4.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

    </header>

    <div v-if="isMobileMenuOpen" class="md:hidden bg-brand-cream border-b border-brand-blue/10 px-4 py-3 flex flex-col gap-2.5 shadow-lg">
      <button 
        @click="togglePlans(); isMobileMenuOpen = false;" 
        class="bg-brand-blue text-brand-cream hover:bg-brand-blue/90 text-xs font-semibold py-2.5 rounded-talki w-full transition-all flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 text-brand-greenLight">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 21L14.907 18L21 21L20.187 15.904L24 12.188L18.828 11.458L16.5 6.75L14.172 11.458L9 12.188L12.813 15.904Z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707-.707" />
        </svg>
        Planes
      </button>
      
      <!-- Menú condicional para dispositivos móviles -->
      <div v-if="isAuthenticated && user" class="flex flex-col items-center gap-2 py-2 border-t border-brand-blue/10">
        <div class="flex items-center gap-2">
          <img 
            :src="`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`" 
            alt="Avatar de Discord" 
            class="w-7 h-7 rounded-full border border-brand-blue/20 shadow-sm"
            @error="(e: any) => e.target.src = 'https://cdn.discordapp.com/embed/avatars/0.png'"
          />
          <span class="font-title font-bold text-sm text-brand-blue">{{ user.username }}</span>
        </div>
        <BaseButton variant="accent" class="text-xs text-red-600 hover:text-red-700 w-full justify-center !py-2" @click="logout">
          Cerrar sesión
        </BaseButton>
      </div>
      <BaseButton v-else variant="secondary" class="!bg-brand-blue !text-brand-cream justify-center w-full shadow-md border-none !py-2.5" @click="loginWithDiscord">
        Iniciar sesión
      </BaseButton>
    </div>

    <!-- CONTENIDO PRINCIPAL RESPONSIVO -->
    <main class="flex-1 flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-16">
      
      <!-- RENDERIZADO DE LA LANDING PAGE ESTÁNDAR -->
      <div class="w-full flex flex-col gap-10 md:gap-20">
        
        <!-- SECCIÓN HERO RESPONSIVA -->
        <section class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <!-- Columna Izquierda: Información de Valor -->
          <div class="lg:col-span-7 flex flex-col gap-5 text-left">
            <h2 class="font-title font-extrabold text-3xl md:text-5xl lg:text-6xl text-brand-dark leading-tight tracking-tight">
              El espacio donde tu idioma <span class="bg-[#b6cf7b]/40 px-2 py-0.5 rounded-lg border-b-4 border-brand-greenDark/60">cobra vida.</span>
            </h2>
            
            <p class="font-body text-sm md:text-lg text-gray-700 leading-relaxed max-w-xl">
              Ofrecemos grupos conversacionales de lenguas extranjeras para personas principiantes o avanzadas en el mundo de los idiomas.
              Haz el test, descubre tu rango, únete a un servidor de Discord y aprende con amigos.
            </p>

            <!-- Botón CTA Dinámico según estado de sesión -->
            <BaseButton
              v-if="!isAuthenticated"
              variant="primary"
              class="self-start !bg-[#5865F2] hover:!bg-[#4752C4] !text-white px-6 py-3.5 md:px-8 md:py-4 text-sm md:text-lg flex items-center gap-3 shadow-lg shadow-[#5865F2]/20 hover:shadow-[#5865F2]/40 rounded-talki font-title tracking-wide transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              @click="loginWithDiscord"
            >
              <!-- Icono oficial de Discord vectorizado -->
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 127.14 96.36" class="w-5 h-5 md:w-6 md:h-6 fill-current">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.47,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c.9-.65,1.76-1.34,2.58-2a75.58,75.58,0,0,0,73,0c.83.69,1.69,1.38,2.58,2a68.43,68.43,0,0,1-10.5,5A77.7,77.7,0,0,0,102,85.51a105.73,105.73,0,0,0,31-18.83C130.67,54.65,125.13,31.58,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.42,65.69,73.24,60,73.24,53S78.42,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"/>
              </svg>
              INICIAR SESIÓN CON DISCORD
            </BaseButton>

            <div v-else class="relative inline-block self-start z-30">
              <BaseButton
                variant="primary"
                class="px-6 py-3.5 md:px-8 md:py-4 text-sm md:text-lg flex items-center gap-2 rounded-talki font-title tracking-wide shadow-lg shadow-brand-greenLight/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                @click="isTestDropdownOpen = !isTestDropdownOpen"
              >
                COMENZAR TEST
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 md:w-5 md:h-5 transition-transform" :class="{ 'rotate-180': isTestDropdownOpen }">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </BaseButton>

              <!-- Panel Premium de Selección de Idioma para el Test (Fase 12/14) -->
              <div v-if="isTestDropdownOpen" class="absolute left-0 mt-2 w-[290px] xs:w-[320px] sm:w-[420px] bg-white border-2 border-brand-blue/15 rounded-3xl shadow-2xl p-3 sm:p-4 flex flex-col gap-3 animate-fade-in z-50">
                <div class="flex items-center justify-between border-b border-brand-blue/10 pb-2">
                  <span class="text-[10px] sm:text-xs font-bold text-brand-blue uppercase tracking-wider font-title">Elige el idioma del test</span>
                  <span class="bg-brand-greenLight text-brand-blue text-[8px] sm:text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Selección Obligatoria</span>
                </div>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                  <button
                    v-for="lang in [
                      { id: 'de', name: 'Deutsch', label: 'Alemán', desc: 'Evalúa tu nivel de alemán e intégrate a los canales.', flag: `<svg class='w-6 h-6 rounded-full' viewBox='0 0 512 512'><g clip-path='circle(256 256 256)'><path fill='#ffce00' d='M0 0h512v512H0z'/><path d='M0 0h512v341.3H0z'/><path fill='#dd0000' d='M0 170.7h512v170.6H0z'/></g></svg>` },
                      { id: 'pt', name: 'Português', label: 'Portugués', desc: 'Mide tu fluidez en portugués y conéctate con la red.', flag: `<svg class='w-6 h-6 rounded-full' viewBox='0 0 512 512'><g clip-path='circle(256 256 256)'><path fill='#ff0000' d='M0 0h512v512H0z'/><path fill='#006600' d='M0 0h204.8v512H0z'/><circle cx='204.8' cy='256' r='76.8' fill='#ffce00'/><path fill='#ff0000' d='M192 204.8h25.6v102.4H192z'/><path fill='#ffffff' d='M185.6 217.6h38.4v76.8h-38.4z'/><circle cx='204.8' cy='256' r='38.4' fill='#002b7f'/></g></svg>` },
                      { id: 'en', name: 'English', label: 'Inglés', desc: 'Certifica tu capacidad de conversación internacional.', flag: `<svg class='w-6 h-6 rounded-full' viewBox='0 0 512 512'><g clip-path='circle(256 256 256)'><path fill='#ffffff' d='M0 0h512v512H0z'/><path fill='#b22234' d='M0 0h512v39.4H0zm0 78.8h512v39.4H0zm0 78.8h512v39.4H0zm0 78.8h512v39.4H0zm0 78.7h512v39.4H0zm0 78.8h512v39.4H0zm0 78.8h512v39.4H0z'/><path fill='#3c3b6e' d='M0 0h204.8v275.8H0z'/></g></svg>` },
                      { id: 'es', name: 'Español', label: 'Español', desc: 'Mide tus habilidades nativas y avanza en la comunidad.', flag: `<svg class='w-6 h-6 rounded-full' viewBox='0 0 512 512'><g clip-path='circle(256 256 256)'><path fill='#c60b1e' d='M0 0h512v512H0z'/><path fill='#ffc400' d='M0 128h512v256H0z'/><circle cx='140' cy='256' r='36' fill='#c60b1e'/><circle cx='140' cy='256' r='26' fill='#ffc400'/></g></svg>` },
                      { id: 'it', name: 'Italiano', label: 'Italiano', desc: 'Comienza tu test de italiano y domina el vocabulario.', flag: `<svg class='w-6 h-6 rounded-full' viewBox='0 0 512 512'><g clip-path='circle(256 256 256)'><path fill='#ffffff' d='M0 0h512v512H0z'/><path fill='#009246' d='M0 0h170.7v512H0z'/><path fill='#ce2b37' d='M341.3 0H512v512H341.3z'/></g></svg>` }
                    ]"
                    :key="lang.id"
                    @click="handleLanguageSelected(lang.id); isTestDropdownOpen = false;"
                    class="w-full text-left p-3 bg-brand-cream/40 border border-brand-blue/10 hover:border-brand-greenLight rounded-2xl hover:bg-brand-blue/5 flex flex-col gap-1.5 transition-all cursor-pointer group text-brand-dark"
                  >
                    <div class="flex items-center gap-2">
                      <div v-html="lang.flag" class="w-6 h-6 flex-shrink-0" />
                      <div class="flex flex-col">
                        <span class="font-title font-bold text-sm text-brand-blue leading-none group-hover:text-brand-greenDark">{{ lang.name }}</span>
                        <span class="text-[9px] font-body text-gray-500 font-semibold">{{ lang.label }}</span>
                      </div>
                    </div>
                    <!-- Pequeña tarjeta con la descripción del idioma -->
                    <p class="text-[10px] font-body text-gray-600 leading-relaxed">
                      {{ lang.desc }}
                    </p>
                  </button>
                </div>
              </div>
            </div>

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
        <section id="languages-section" class="flex flex-col items-center gap-6 mt-8">
          
          <!-- Bocadillo de diálogo de la mascota animada -->
          <div class="relative bg-brand-greenLight text-brand-dark px-8 py-4 rounded-talki font-title font-bold text-lg md:text-xl shadow-lg border border-brand-greenDark/20 tracking-wide inline-block">
            ¡Mira todos los idiomas que puedes aprender!
            
            <!-- Cola del bocadillo apuntando hacia abajo -->
            <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-4 h-4 bg-brand-greenLight border-r border-b border-brand-greenDark/20" />
          </div>

          <!-- Selector de Idiomas con navegación interactiva y control de sesión -->
          <LanguageSelector @languageSelected="handleLanguageSelected" />

        </section>

      </div>

    </main>

    <!-- MODAL DE PLANES COMPARATIVOS DE LA LANDING (Fase 12) -->
    <div v-if="isPlansOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-[#040a21]/60 backdrop-blur-sm" @click="togglePlans" />

      <div class="relative bg-white text-brand-dark w-full max-w-3xl rounded-[2rem] shadow-2xl p-6 md:p-8 flex flex-col gap-6 border-4 border-[#b6cf7b] max-h-[90vh] overflow-y-auto z-10">
        
        <!-- Botón de Cerrar Modal -->
        <button 
          @click="togglePlans" 
          class="absolute top-4 right-4 w-8 h-8 rounded-full bg-brand-blue/10 hover:bg-brand-blue/20 flex items-center justify-center transition-all cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 text-brand-blue">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Cabecera del Modal -->
        <div class="text-center flex flex-col gap-1.5 mt-2">
          <h3 class="font-title font-extrabold text-2xl md:text-3xl text-brand-blue leading-snug">Nuestros Planes 🚀</h3>
          <p class="font-body text-xs md:text-sm text-gray-500 max-w-lg mx-auto">
            Elige la opción que mejor se adapte a tu ritmo de aprendizaje y saca el máximo provecho a tu experiencia.
          </p>
        </div>

        <!-- Columnas Comparativas -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
          
          <!-- Plan Gratis -->
          <div class="bg-[#1f2060]/5 border-2 border-brand-blue/10 p-5 rounded-talki flex flex-col gap-4">
            <div class="border-b border-brand-blue/10 pb-3">
              <h4 class="font-title font-bold text-lg text-brand-blue">Plan Free ⚡</h4>
              <p class="font-body text-xs text-gray-500">Acceso básico de por vida</p>
            </div>
            <ul class="font-body text-xs md:text-sm flex flex-col gap-3 text-gray-700 flex-1">
              <li class="flex items-center gap-2">
                <svg class="w-4 h-4 text-[#b6cf7b] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                Acceso ilimitado 24/7 al servidor
              </li>
              <li class="flex items-center gap-2">
                <svg class="w-4 h-4 text-[#b6cf7b] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                Grupos grandes y dinámicos
              </li>
              <li class="flex items-center gap-2">
                <svg class="w-4 h-4 text-[#b6cf7b] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                Moderación limitada a eventos
              </li>
              <li class="flex items-center gap-2">
                <svg class="w-4 h-4 text-[#b6cf7b] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                Interacción espontánea en salas
              </li>
              <li class="flex items-center gap-2">
                <svg class="w-4 h-4 text-[#b6cf7b] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                Turno de voz estándar
              </li>
              <li class="flex items-center gap-2 text-gray-400 line-through">
                <svg class="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Material de apoyo no incluido
              </li>
            </ul>
            <div class="mt-2 pt-3 border-t border-brand-blue/5 text-center">
              <span class="font-title font-extrabold text-xl text-brand-blue">$0 USD</span>
            </div>
          </div>

          <!-- Plan Premium -->
          <div class="bg-brand-blue text-white p-5 rounded-talki flex flex-col gap-4 shadow-xl border-2 border-[#b6cf7b]">
            <div class="border-b border-brand-lightBlue/20 pb-3 flex justify-between items-start">
              <div>
                <h4 class="font-title font-bold text-lg text-brand-greenLight">Plan Premium ⭐</h4>
                <p class="font-body text-xs text-brand-lightBlue">Experiencia completa y guiada</p>
              </div>
              <span class="bg-brand-greenLight text-brand-blue text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Recomendado</span>
            </div>
            <ul class="font-body text-xs md:text-sm flex flex-col gap-3 text-brand-cream flex-1">
              <li class="flex items-center gap-2">
                <svg class="w-4 h-4 text-brand-greenLight flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                Acceso ilimitado 24/7 al servidor
              </li>
              <li class="flex items-center gap-2">
                <svg class="w-4 h-4 text-brand-greenLight flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                Grupos súper reducidos (4-5 personas)
              </li>
              <li class="flex items-center gap-2">
                <svg class="w-4 h-4 text-brand-greenLight flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                Moderación activa y dedicada
              </li>
              <li class="flex items-center gap-2">
                <svg class="w-4 h-4 text-brand-greenLight flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                Reportes semanales de progreso (DM)
              </li>
              <li class="flex items-center gap-2">
                <svg class="w-4 h-4 text-brand-greenLight flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                Prioridad de voz en canales de audio
              </li>
              <li class="flex items-center gap-2">
                <svg class="w-4 h-4 text-brand-greenLight flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                Guías y recursos exclusivos (PDF)
              </li>
            </ul>
            <div class="mt-2 pt-3 border-t border-brand-lightBlue/20 text-center">
              <span class="font-title font-extrabold text-xl text-brand-greenLight">¡Acceso Premium!</span>
            </div>
          </div>

        </div>

        <!-- Sección de Contacto -->
        <div class="bg-brand-blue/5 border border-brand-blue/15 p-4 rounded-talki text-center flex flex-col gap-1.5 mt-2">
          <p class="font-body text-xs md:text-sm text-gray-600">
            ¿Quieres unirte a nuestro programa Premium y acelerar tu aprendizaje?
          </p>
          <a 
            href="mailto:talkitier@gmail.com" 
            class="font-title font-bold text-sm md:text-base text-brand-blue hover:text-brand-blue/80 underline flex items-center justify-center gap-2 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            Contacta a talkitier@gmail.com
          </a>
        </div>

      </div>
    </div>

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
