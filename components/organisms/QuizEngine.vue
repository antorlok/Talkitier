<script setup lang="ts">
import { ref, computed } from 'vue';
import BaseButton from '../atoms/BaseButton.vue';
import ProgressBar from '../molecules/ProgressBar.vue';

// Definición de las interfaces para la estructura del Test JSON (Data-Driven UI)
interface Option {
  id: string;
  text: string;
  points: number;
}

interface BlankDetail {
  options: string[];
  correct: string;
  points: number;
}

interface Question {
  id: string;
  text: string;
  type?: 'reading' | 'grammar' | 'cloze';
  options?: Option[];
  blanks?: Record<string, BlankDetail>;
}

interface Section {
  id: string;
  level: string;
  instruction: string;
  text?: string;
  questions?: Question[];
}

interface Module {
  id: string;
  type: 'reading' | 'cloze';
  grading: 'automated';
  sections: Section[];
}

interface QuizData {
  language: string;
  tier_thresholds: Record<string, number>;
  modules: Module[];
}

// Props recibidos por el componente (soporta quizData o testData para flexibilidad de integración)
const props = defineProps<{
  quizData?: QuizData;
  testData?: QuizData;
  discordStatus?: 'idle' | 'loading' | 'success' | 'error' | 'pending_sync';
  discordMessage?: string;
}>();

// Computado defensivo para unificar ambos nombres de props
const resolvedQuizData = computed(() => {
  const data = props.quizData || props.testData;
  if (!data) {
    throw new Error('QuizEngine requiere "quizData" o "testData" para inicializarse correctamente.');
  }
  return data;
});

// Emits del componente
const emit = defineEmits<{
  (e: 'finish', payload: { answers: Record<string, any>; score: number }): void;
  (e: 'retry'): void;
}>();

// Exponer reintento de sincronización al componente padre
const retryDiscordSync = () => {
  emit('retry');
};

// --- ESTADO REACTIVO DEL MOTOR ---
const currentModuleIndex = ref(0);
const currentSectionIndex = ref(0);
const userAnswers = ref<Record<string, { optionId: string; points: number }>>({});
const clozeAnswers = ref<Record<string, string>>({});
const testCompleted = ref(false);
const calculatedTier = ref('A1');
const totalScore = ref(0);

// --- PROPIEDADES COMPUTADAS DE NAVEGACIÓN ---
const currentModule = computed<Module>(() => resolvedQuizData.value.modules[currentModuleIndex.value] as Module);
const currentSection = computed<Section>(() => currentModule.value.sections[currentSectionIndex.value] as Section);

const overallProgress = computed(() => {
  const totalModules = resolvedQuizData.value.modules.length;
  if (totalModules === 0) return 0;
  return (currentModuleIndex.value / totalModules) * 100;
});

const progressLabel = computed(() => {
  return `Módulo ${currentModuleIndex.value + 1} de ${resolvedQuizData.value.modules.length} (${getModuleTypeName(currentModule.value.type)})`;
});

// Comprobar si se ha seleccionado respuesta en preguntas de opción múltiple
const isCurrentQuestionAnswered = (questionId: string) => {
  return userAnswers.value[questionId] !== undefined;
};

// Comprobar si la sección actual está completa/válida para avanzar
const isSectionValid = computed(() => {
  const mod = currentModule.value;
  const sec = currentSection.value;

  if (mod.type === 'reading') {
    if (!sec.questions) return true;
    return sec.questions.every(q => isCurrentQuestionAnswered(q.id));
  }

  if (mod.type === 'cloze') {
    const q = sec.questions?.[0];
    if (!q || q.type !== 'cloze' || !q.blanks) return true;
    return Object.keys(q.blanks).every(blankKey => {
      const answerKey = `${q.id}_${blankKey}`;
      return clozeAnswers.value[answerKey] !== undefined && clozeAnswers.value[answerKey] !== '';
    });
  }

  return false;
});

// Traducir nombres de módulos a español para el header
const getModuleTypeName = (type: string) => {
  switch (type) {
    case 'reading': return 'Lectura y Vocabulario';
    case 'cloze': return 'Estructura Avanzada';
    default: return type;
  }
};

// --- LÓGICA POR MÓDULO ---

// --- 1. READING (Respuestas de Opción Múltiple) ---
const selectOption = (questionId: string, option: Option) => {
  userAnswers.value[questionId] = {
    optionId: option.id,
    points: option.points
  };
};

// --- 2. CLOZE TEST ---
const handleClozeSelect = (questionId: string, blankKey: string, selectedOption: string, blankData: BlankDetail | undefined) => {
  if (!blankData) return;
  const answerKey = `${questionId}_${blankKey}`;
  clozeAnswers.value[answerKey] = selectedOption;
  
  userAnswers.value[answerKey] = {
    optionId: selectedOption,
    points: selectedOption === blankData.correct ? blankData.points : 0
  };
};

// Separar el texto del Cloze por los marcadores {blank_X}
const parseClozeText = (text: string) => {
  return text.split(/(\{blank_\d+\})/g);
};

// Comprobar si un segmento es un marcador de espacio en blanco
const isBlankMarker = (segment: string) => {
  return /^\{blank_\d+\}$/.test(segment);
};

// Obtener la llave limpia del espacio en blanco a partir del marcador
const getBlankKey = (segment: string) => {
  return segment.replace(/[{}]/g, '');
};

// --- NAVEGACIÓN GENERAL DEL QUIZ ---
const nextStep = () => {
  if (!isSectionValid.value) return;

  const sectionsCount = currentModule.value.sections.length;
  if (currentSectionIndex.value < sectionsCount - 1) {
    // Siguiente sección del módulo actual
    currentSectionIndex.value++;
  } else {
    // Siguiente módulo
    const modulesCount = resolvedQuizData.value.modules.length;
    if (currentModuleIndex.value < modulesCount - 1) {
      currentModuleIndex.value++;
      currentSectionIndex.value = 0;
    } else {
      // Fin del cuestionario
      finishTest();
    }
  }
};

// Finalización y grading automatizado inicial del MCER
const finishTest = () => {
  let sum = 0;
  for (const qId in userAnswers.value) {
    sum += userAnswers.value[qId]?.points ?? 0;
  }
  totalScore.value = sum;

  const thresholds = resolvedQuizData.value.tier_thresholds;
  const thresholdEntries = Object.entries(thresholds).sort((a, b) => b[1] - a[1]);
  const matched = thresholdEntries.find(([_, minScore]) => sum >= minScore);

  calculatedTier.value = matched ? matched[0] : 'A1';
  testCompleted.value = true;

  emit('finish', {
    answers: {
      ...userAnswers.value
    },
    score: totalScore.value
  });
};

// --- COMPONENTE MASCOTA GUÍA ---
// Retorna la imagen adecuada para la mascota según la etapa del examen (módulo actual)
const currentMascot = computed(() => {
  if (testCompleted.value) {
    // Mascota celebrando al finalizar con éxito el test
    return '/img/editables-31.svg';
  }

  // Mapeamos dinámicamente las imágenes para mostrar diferentes facetas de la mascota
  switch (currentModuleIndex.value) {
    case 0:
      // Módulo 1 (Lectura Inicial): Mascota saludando feliz
      return '/img/editables-28.svg';
    case 1:
      // Módulo 2 (Lectura Avanzada): Mascota concentrada
      return '/img/editables-29.svg';
    case 2:
      // Módulo 3 (Estructura Avanzada / Cloze): Mascota pensativa/creativa
      return '/img/editables-30.svg';
    default:
      // Fallback
      return '/img/editables-28.svg';
  }
});

// Mensajes interactivos de la mascota según la etapa y nivel actual
const currentBubbleText = computed(() => {
  if (testCompleted.value) {
    return '¡Extraordinario! Completaste la evaluación. Aquí tienes tu nivel de ingreso.';
  }

  const level = currentSection.value?.level || '';

  switch (currentModuleIndex.value) {
    case 0:
      return `¡Hola! Comencemos con Lectura y Vocabulario (${level}). Lee el texto y elige con calma.`;
    case 1:
      return `¡Excelente! Ahora en Gramática y Sintaxis (${level}) elige la opción que complete la frase.`;
    case 2:
      return `¡El tramo final (${level})! Completa los espacios vacíos del texto Cloze. ¡Tú puedes!`;
    default:
      return `¡Vas muy bien! Sigue respondiendo para obtener un resultado más preciso.`;
  }
});
</script>

<template>
  <!-- Wrapper principal adaptativo con ancho expandido para albergar la mascota al costado -->
  <div class="w-full max-w-5xl mx-auto px-4 py-3 md:px-6 md:py-6 flex flex-col gap-5 sm:gap-6">
    
    <!-- Barra de Progreso Global a nivel de organismo -->
    <div v-if="!testCompleted" class="bg-brand-blue/30 border border-brand-lightBlue/10 p-3 sm:p-4 rounded-talki shadow-xl backdrop-blur-md">
      <ProgressBar :progress="overallProgress" :label="progressLabel" />
    </div>

    <!-- PÁGINA DE RESULTADOS (CUANDO EL QUIZ HA TERMINADO) -->
    <div v-if="testCompleted" class="bg-brand-cream text-brand-dark p-6 md:p-12 rounded-talki shadow-2xl flex flex-col items-center text-center gap-5 md:gap-6 border-4 border-brand-greenLight">
      
      <!-- Mascota celebrando en la pantalla de resultados para darle más vida -->
      <div class="w-32 h-32 md:w-44 md:h-44 relative flex items-center justify-center animate-bounce-subtle mt-2">
        <img :src="currentMascot" alt="Mascota celebrando" class="w-full h-full object-contain filter drop-shadow-xl" />
      </div>

      <h2 class="text-2xl md:text-3xl font-bold font-title text-brand-dark tracking-tight">¡Test Completado!</h2>
      <p class="font-body text-sm md:text-base text-gray-700 max-w-md">
        Has finalizado todas las secciones con éxito.
      </p>

      <!-- Panel de Puntuación Automatizada -->
      <div class="w-full bg-brand-dark text-brand-cream p-5 md:p-6 rounded-talki flex flex-col gap-2.5 md:gap-3 my-1 border border-brand-lightBlue/10 shadow-inner">
        <span class="text-[10px] md:text-xs font-bold tracking-wider text-brand-lightBlue uppercase">TU NIVEL DE ENTRADA AUTOMÁTICO</span>
        <span class="text-4xl md:text-5xl font-extrabold font-title text-brand-greenLight leading-none">{{ calculatedTier }}</span>
        <span class="text-xs md:text-sm font-body text-gray-300">Puntaje de autoevaluación: <strong>{{ totalScore }} puntos</strong></span>
      </div>

      <!-- Estado de asignación de roles de Discord integrado de forma premium -->
      <div v-if="discordStatus === 'loading'" class="w-full bg-brand-blue/15 border border-brand-blue/30 p-4 rounded-talki text-xs md:text-sm text-brand-blue flex items-center justify-center gap-2 animate-pulse shadow-md">
        <svg class="animate-spin h-5 w-5 text-brand-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span class="font-bold">Asignando tu rol de idioma en el servidor de Discord...</span>
      </div>

      <div v-else-if="discordStatus === 'success'" class="w-full bg-brand-greenLight/20 border border-brand-greenDark/30 p-4 md:p-5 rounded-talki text-xs md:text-sm text-brand-greenDark text-left shadow-lg flex flex-col gap-1.5 animate-fade-in">
        <p class="font-bold flex items-center gap-2 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-brand-greenDark">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
          </svg>
          ¡Roles de Discord actualizados!
        </p>
        <p class="font-body text-gray-700 leading-relaxed">
          Hemos asignado exitosamente tu rol correspondiente en el servidor de Discord de Talkitier. ¡Tu perfil ya cuenta con los accesos!
        </p>
      </div>

      <div v-else-if="discordStatus === 'error'" class="w-full bg-red-50 border border-red-200 p-4 md:p-5 rounded-talki text-xs md:text-sm text-red-700 text-left shadow-lg flex flex-col gap-1.5 animate-fade-in">
        <p class="font-bold flex items-center gap-2 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-red-600">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
          </svg>
          Sincronización de Discord pendiente
        </p>
        <p class="font-body text-gray-700 leading-relaxed">
          {{ discordMessage || 'No se pudo asignar el rol de forma automática en este momento.' }}
        </p>
      </div>

      <!-- Estado de Sincronización Pendiente (Usuario no está en el servidor de Discord) -->
      <div v-if="discordStatus === 'pending_sync'" class="w-full flex flex-col gap-4 animate-fade-in">
        <div class="bg-amber-50 border border-amber-200 p-4 md:p-5 rounded-talki text-xs md:text-sm text-amber-800 text-left shadow-md flex flex-col gap-1.5">
          <p class="font-bold flex items-center gap-2 text-sm text-amber-900">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-amber-600">
              <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.537-1.515 2.537H3.72c-1.34 0-2.188-1.37-1.515-2.537l6.28-10.875zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
            </svg>
            Sincronización de Discord pendiente
          </p>
          <p class="font-body text-amber-700 leading-relaxed text-xs md:text-sm">
            Hemos calculado tu nivel con éxito, pero <strong>no pudimos asignar tus roles automáticos porque aún no estás en el servidor de Discord</strong>. Sigue los pasos a continuación para completar la integración.
          </p>
        </div>

        <!-- Botones apilados en móvil y en fila horizontal a partir de pantallas sm/md con alineación perfecta (Fase 14) -->
        <div class="flex flex-col sm:flex-row gap-3 w-full max-w-lg mx-auto mt-2">
          <!-- Paso 1: Unirme al Servidor -->
          <a 
            href="https://discord.gg/jHN3amJyZu" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="flex-1 bg-[#5865F2] hover:bg-[#4752C4] text-white py-3.5 px-5 rounded-talki font-title font-bold text-sm tracking-wider flex items-center justify-center gap-2.5 shadow-lg shadow-[#5865F2]/20 hover:shadow-[#5865F2]/40 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-center no-underline"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 127.14 96.36" class="w-5 h-5 flex-shrink-0 fill-current">
              <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.47,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c.9-.65,1.76-1.34,2.58-2a75.58,75.58,0,0,0,73,0c.83.69,1.69,1.38,2.58,2a68.43,68.43,0,0,1-10.5,5A77.7,77.7,0,0,0,102,85.51a105.73,105.73,0,0,0,31-18.83C130.67,54.65,125.13,31.58,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.42,65.69,73.24,60,73.24,53S78.42,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"/>
            </svg>
            <span>1. Unirme</span>
          </a>

          <!-- Paso 2: Sincronizar Nivel -->
          <button 
            @click="retryDiscordSync" 
            :disabled="discordStatus as string === 'loading'"
            class="flex-1 bg-white hover:bg-brand-cream text-brand-blue border-2 border-brand-blue/30 py-3.5 px-5 rounded-talki font-title font-bold text-sm tracking-wider flex items-center justify-center gap-2.5 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5 flex-shrink-0">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m-4.991 15.118H9.75" />
            </svg>
            <span>2. Sincronizar</span>
          </button>
        </div>
      </div>

      <!-- Botón de Acción Principal (CTA) para entrar a Discord -->
      <a 
        v-if="discordStatus !== 'pending_sync'"
        href="https://discord.gg/jHN3amJyZu" 
        target="_blank" 
        rel="noopener noreferrer" 
        class="w-full max-w-md bg-[#5865F2] hover:bg-[#4752C4] text-white py-3.5 px-6 rounded-talki font-title font-bold text-sm tracking-wider flex items-center justify-center gap-3 shadow-lg shadow-[#5865F2]/20 hover:shadow-[#5865F2]/40 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-center no-underline"
      >
        <!-- Icono oficial de Discord -->
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 127.14 96.36" class="w-5 h-5 flex-shrink-0 fill-current">
          <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.47,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c.9-.65,1.76-1.34,2.58-2a75.58,75.58,0,0,0,73,0c.83.69,1.69,1.38,2.58,2a68.43,68.43,0,0,1-10.5,5A77.7,77.7,0,0,0,102,85.51a105.73,105.73,0,0,0,31-18.83C130.67,54.65,125.13,31.58,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.42,65.69,73.24,60,73.24,53S78.42,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"/>
        </svg>
        <span>Ir al Servidor de Discord</span>
      </a>

      <div class="bg-brand-blue/10 border border-brand-blue/20 p-4 rounded-talki text-xs md:text-sm text-brand-blue max-w-lg text-left">
        <p class="font-bold mb-1">📢 Nota sobre tu evaluación final:</p>
        <p class="font-body text-xs md:text-sm text-gray-700">
          La evaluación se procesa en tiempo real de forma automática. Tus roles de nivel se asignarán instantáneamente en base a tu puntuación obtenida en el cuestionario.
        </p>
      </div>
    </div>

    <!-- SECCIÓN DEL EXAMEN ACTIVO CON DISPOSICIÓN DE DOBLE COLUMNA PARA LA MASCOTA -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
      
      <!-- Tarjeta principal de la pregunta (Desktop: Izquierda, Mobile: Abajo) -->
      <div class="lg:col-span-8 bg-brand-cream text-brand-dark rounded-talki shadow-2xl p-5 md:p-10 flex flex-col gap-5 md:gap-6 border-b-8 border-brand-blue relative overflow-hidden order-2 lg:order-1">
        
        <!-- Indicador visual del nivel del módulo -->
        <div class="absolute top-0 right-0 bg-brand-blue text-brand-cream text-[10px] md:text-xs font-bold font-title px-3 py-1.5 md:px-4 md:py-2 rounded-bl-talki tracking-wide shadow-md">
          Nivel: {{ currentSection.level }}
        </div>

        <!-- Cabecera del Módulo -->
        <div class="flex flex-col gap-1.5 border-b border-brand-blue/15 pb-4 mt-2">
          <span class="text-[10px] font-bold tracking-wider text-brand-lightBlue uppercase font-body">Módulo de {{ getModuleTypeName(currentModule.type) }}</span>
          <h3 class="text-base md:text-xl font-bold font-title leading-relaxed text-brand-dark">
            {{ currentSection.instruction }}
          </h3>
        </div>

        <!-- 1. CASO DE USO: READING / GRAMMAR -->
        <div v-if="currentModule.type === 'reading'" class="flex flex-col gap-5 md:gap-6">
          <!-- Texto del ejercicio de lectura con excelente contraste y espaciado (si existe) -->
          <div v-if="currentSection.text" class="bg-brand-blue/5 p-4 md:p-6 rounded-talki border border-brand-blue/10 font-body text-sm md:text-lg leading-relaxed text-gray-800 shadow-inner">
            {{ currentSection.text }}
          </div>

          <!-- Renderizado de las preguntas -->
          <div v-for="q in currentSection.questions" :key="q.id" class="flex flex-col gap-3.5">
            <h4 class="text-sm md:text-md font-bold font-title text-brand-dark leading-snug">
              {{ q.text }}
            </h4>

            <!-- Opciones mapeadas a BaseButton de forma limpia en 1 columna en móvil y 2 en escritorio -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
              <BaseButton
                v-for="opt in q.options"
                :key="opt.id"
                :variant="userAnswers[q.id]?.optionId === opt.id ? 'primary' : 'secondary'"
                class="w-full text-left justify-start !py-2.5 sm:!py-3"
                @click="selectOption(q.id, opt)"
              >
                <div class="flex items-center gap-2.5">
                  <span 
                    class="w-5.5 h-5.5 md:w-6 md:h-6 rounded-full flex items-center justify-center border font-bold text-[10px] md:text-xs flex-shrink-0"
                    :class="userAnswers[q.id]?.optionId === opt.id ? 'bg-brand-dark text-white border-transparent' : 'border-brand-blue/40 text-brand-blue'"
                  >
                    {{ opt.id.slice(-1).toUpperCase() }}
                  </span>
                  <span class="font-medium text-xs md:text-base leading-snug">{{ opt.text }}</span>
                </div>
              </BaseButton>
            </div>
          </div>
        </div>

        <!-- 2. CASO DE USO: CLOZE TEST -->
        <div v-if="currentModule.type === 'cloze'" class="flex flex-col gap-6">
          <div v-for="q in currentSection.questions" :key="q.id" class="flex flex-col gap-4">
            <!-- Párrafo interactivo con alineación fluida y espaciado de línea amplio (Fase 15) -->
            <div class="bg-brand-blue/5 p-6 md:p-8 rounded-talki border border-brand-blue/10 font-body text-sm md:text-lg leading-loose text-gray-800 shadow-inner">
              <template v-for="(seg, idx) in parseClozeText(q.text)" :key="idx">
                <!-- Si el segmento es un marcador, renderizamos un select inline con estilo premium -->
                <select
                  v-if="isBlankMarker(seg)"
                  :value="clozeAnswers[`${q.id}_${getBlankKey(seg)}`] || ''"
                  @change="e => handleClozeSelect(q.id, getBlankKey(seg), (e.target as HTMLSelectElement).value, q.blanks?.[getBlankKey(seg)])"
                  class="inline-block mx-1.5 px-3 py-1 bg-white border-2 border-brand-blue/15 hover:border-brand-blue/40 focus:border-brand-lightBlue focus:ring-2 focus:ring-brand-lightBlue/10 rounded-xl font-title text-xs md:text-sm font-bold outline-none transition-all shadow-sm text-brand-dark cursor-pointer max-w-[150px] md:max-w-[200px]"
                >
                  <option value="" disabled selected>...</option>
                  <option 
                    v-for="opt in q.blanks?.[getBlankKey(seg)]?.options || []" 
                    :key="opt" 
                    :value="opt"
                  >
                    {{ opt }}
                  </option>
                </select>
                <!-- Si es texto estándar -->
                <span v-else class="align-middle">{{ seg }}</span>
              </template>
            </div>
          </div>
        </div>

        <!-- Barra de Navegación del Cuestionario -->
        <div class="flex justify-between items-center border-t border-brand-blue/15 pt-5 mt-4">
          <!-- Indicador de Preguntas del Módulo -->
          <span class="text-xs font-semibold text-gray-500 font-body">
            Sección {{ currentSectionIndex + 1 }} de {{ currentModule.sections.length }}
          </span>

          <!-- Botón para avanzar, habilitado solo si la sección cumple los criterios de validación -->
          <BaseButton
            variant="primary"
            :disabled="!isSectionValid"
            @click="nextStep"
          >
            {{ currentModuleIndex === resolvedQuizData.modules.length - 1 && currentSectionIndex === currentModule.sections.length - 1 ? 'Finalizar Test' : 'Siguiente' }}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </BaseButton>
        </div>

      </div>

      <!-- Columna de la Mascota Guía (Desktop: Derecha, Mobile: Arriba) -->
      <div class="lg:col-span-4 bg-brand-cream text-brand-dark rounded-talki shadow-2xl p-5 md:p-8 flex flex-col items-center gap-5 border-b-8 border-brand-greenLight w-full relative overflow-hidden order-1 lg:order-2">
        
        <!-- Bocadillo de diálogo con cola de SVG orientada -->
        <div class="relative bg-brand-blue text-brand-cream p-4 rounded-3xl font-body text-xs md:text-sm leading-relaxed border border-brand-lightBlue/20 shadow-md text-center w-full animate-bounce-subtle">
          {{ currentBubbleText }}
          <!-- Cola del bocadillo en móvil (apunta hacia abajo) -->
          <div class="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 rotate-45 w-3 h-3 bg-brand-blue border-r border-b border-brand-lightBlue/20 lg:hidden" />
          <!-- Cola del bocadillo en desktop (apunta hacia la izquierda) -->
          <div class="absolute left-[-6px] top-1/2 transform -translate-y-1/2 rotate-45 w-3 h-3 bg-brand-blue border-l border-b border-brand-lightBlue/20 hidden lg:block" />
        </div>

        <!-- Contenedor premium de la mascota -->
        <div class="w-36 h-36 md:w-52 md:h-52 flex items-center justify-center relative group">
          <img 
            :src="currentMascot" 
            alt="Mascota del proyecto" 
            class="w-full h-full object-contain filter drop-shadow-xl transition-all duration-500 group-hover:scale-105"
          />
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
@keyframes bounce-subtle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}
.animate-bounce-subtle {
  animation: bounce-subtle 4s ease-in-out infinite;
}
</style>
