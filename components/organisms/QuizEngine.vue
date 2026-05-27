<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import BaseButton from '../atoms/BaseButton.vue';
import ProgressBar from '../molecules/ProgressBar.vue';

// Definición de las interfaces para la estructura del Test JSON (Data-Driven UI)
interface Option {
  id: string;
  text: string;
  points: number;
}

interface Question {
  id: string;
  text: string;
  options: Option[];
}

interface Section {
  id: string;
  level: string;
  instruction: string;
  text?: string;
  questions?: Question[];
  prompt_text?: string;
  min_words?: number;
  max_words?: number;
}

interface Module {
  id: string;
  type: 'reading' | 'writing';
  grading: 'automated' | 'deferred';
  config?: {
    block_paste?: boolean;
    show_word_counter?: boolean;
  };
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
  discordStatus?: 'idle' | 'loading' | 'success' | 'error';
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
}>();

// --- ESTADO REACTIVO DEL MOTOR ---
const currentModuleIndex = ref(0);
const currentSectionIndex = ref(0);
const userAnswers = ref<Record<string, { optionId: string; points: number }>>({});
const writingAnswers = ref<Record<string, { text: string; words: number }>>({});
const testCompleted = ref(false);
const calculatedTier = ref('A1');
const totalScore = ref(0);

// --- ESTADOS PARTICULARES DE LOS SUB-MÓDULOS ---

// Writing Module State
const writingText = ref('');
const wordCount = computed(() => {
  const text = writingText.value.trim();
  return text === '' ? 0 : text.split(/\s+/).length;
});

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

  if (mod.type === 'writing') {
    const min = sec.min_words || 0;
    const max = sec.max_words || Infinity;
    return wordCount.value >= min && wordCount.value <= max;
  }

  return false;
});

// Traducir nombres de módulos a español para el header
const getModuleTypeName = (type: string) => {
  switch (type) {
    case 'reading': return 'Lectura Comprensiva';
    case 'writing': return 'Expresión Escrita';
    default: return type;
  }
};

// Manejar cambios de módulo/sección para resetear estados específicos
watch([currentModuleIndex, currentSectionIndex], () => {
  // Resetear estados del writing
  writingText.value = '';
});

// --- LÓGICA POR MÓDULO ---

// --- 1. READING (Respuestas de Opción Múltiple) ---
const selectOption = (questionId: string, option: Option) => {
  // Guardamos la respuesta seleccionada y los puntos asignados por el test
  userAnswers.value[questionId] = {
    optionId: option.id,
    points: option.points
  };
};

// --- NAVEGACIÓN GENERAL DEL QUIZ ---
const nextStep = () => {
  if (!isSectionValid.value) return;

  // Si estamos en módulo de escritura, guardar texto redactado antes de avanzar
  if (currentModule.value.type === 'writing') {
    writingAnswers.value[currentSection.value.id] = {
      text: writingText.value,
      words: wordCount.value
    };
  }

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
  // 1. Sumamos los puntos de userAnswers
  let sum = 0;
  for (const qId in userAnswers.value) {
    sum += userAnswers.value[qId]?.points ?? 0;
  }
  totalScore.value = sum;

  // 2. Iteramos sobre props.testData.tier_thresholds para determinar el nivel más alto alcanzado
  const thresholds = resolvedQuizData.value.tier_thresholds;
  // Convertimos en tuplas ordenadas por puntaje mínimo descendente para hacer coincidir el umbral superior
  const thresholdEntries = Object.entries(thresholds).sort((a, b) => b[1] - a[1]);
  const matched = thresholdEntries.find(([_, minScore]) => sum >= minScore);

  calculatedTier.value = matched ? matched[0] : 'A1';

  // 3. Establecer testCompleted en true para renderizar la vista de resultados
  testCompleted.value = true;

  // 4. Emitimos el evento de finalización para integraciones y control de flujo superior
  emit('finish', {
    answers: {
      ...userAnswers.value,
      ...writingAnswers.value
    },
    score: totalScore.value
  });
};
</script>

<template>
  <!-- Wrapper principal con estética de marca oscura e interactiva -->
  <div class="w-full max-w-3xl mx-auto p-4 md:p-6 flex flex-col gap-6">
    
    <!-- Barra de Progreso Global a nivel de organismo -->
    <div v-if="!testCompleted" class="bg-brand-blue/30 border border-brand-lightBlue/10 p-4 rounded-talki shadow-xl backdrop-blur-md">
      <ProgressBar :progress="overallProgress" :label="progressLabel" />
    </div>

    <!-- PÁGINA DE RESULTADOS (CUANDO EL QUIZ HA TERMINADO) -->
    <div v-if="testCompleted" class="bg-brand-cream text-brand-dark p-8 md:p-12 rounded-talki shadow-2xl flex flex-col items-center text-center gap-6 border-4 border-brand-greenLight">
      <div class="w-20 h-20 rounded-full bg-brand-greenLight/20 flex items-center justify-center text-brand-greenDark">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-10 h-10">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
      </div>

      <h2 class="text-3xl font-bold font-title text-brand-dark tracking-tight">¡Test Completado!</h2>
      <p class="font-body text-gray-700 max-w-md">
        Has finalizado todas las secciones con éxito.
      </p>

      <!-- Panel de Puntuación Automatizada -->
      <div class="w-full bg-brand-dark text-brand-cream p-6 rounded-talki flex flex-col gap-3 my-2 border border-brand-lightBlue/10 shadow-inner">
        <span class="text-xs md:text-sm font-semibold tracking-wider text-brand-lightBlue uppercase">TU NIVEL DE ENTRADA AUTOMÁTICO</span>
        <span class="text-5xl font-extrabold font-title text-brand-greenLight">{{ calculatedTier }}</span>
        <span class="text-sm font-body text-gray-300">Puntaje de autoevaluación: <strong>{{ totalScore }} puntos</strong></span>
      </div>

      <!-- Estado de asignación de roles de Discord integrado de forma premium -->
      <div v-if="discordStatus === 'loading'" class="w-full bg-brand-blue/15 border border-brand-blue/30 p-4 rounded-talki text-xs md:text-sm text-brand-blue flex items-center justify-center gap-2 animate-pulse shadow-md">
        <svg class="animate-spin h-5 w-5 text-brand-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span class="font-bold">Asignando tu rol de idioma en el servidor de Discord...</span>
      </div>

      <div v-else-if="discordStatus === 'success'" class="w-full bg-brand-greenLight/20 border border-brand-greenDark/30 p-5 rounded-talki text-xs md:text-sm text-brand-greenDark text-left shadow-lg flex flex-col gap-1.5 animate-fade-in">
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

      <div v-else-if="discordStatus === 'error'" class="w-full bg-red-50 border border-red-200 p-5 rounded-talki text-xs md:text-sm text-red-700 text-left shadow-lg flex flex-col gap-1.5 animate-fade-in">
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

      <div class="bg-brand-blue/10 border border-brand-blue/20 p-4 rounded-talki text-xs md:text-sm text-brand-blue max-w-lg text-left">
        <p class="font-bold mb-1">📢 Nota sobre tu evaluación final:</p>
        <p class="font-body text-gray-700">
          El módulo de <strong>Expresión Escrita</strong> (Writing) requiere una revisión diferida por nuestros evaluadores. Una vez calificado manualmente, tu nivel final se actualizará y se te asignará el rol correspondiente en el servidor de Discord.
        </p>
      </div>
    </div>

    <!-- TARJETA DEL CONTENEDOR DE PREGUNTAS (ACTIVA) -->
    <div v-else class="bg-brand-cream text-brand-dark rounded-talki shadow-2xl p-6 md:p-10 flex flex-col gap-6 border-b-8 border-brand-blue relative overflow-hidden">
      
      <!-- Indicador visual del nivel del módulo -->
      <div class="absolute top-0 right-0 bg-brand-blue text-brand-cream text-xs font-bold font-title px-4 py-2 rounded-bl-talki tracking-wide shadow-md">
        Nivel: {{ currentSection.level }}
      </div>

      <!-- Cabecera del Módulo -->
      <div class="flex flex-col gap-2 border-b border-brand-blue/15 pb-4 mt-2">
        <span class="text-xs font-bold tracking-wider text-brand-lightBlue uppercase font-body">Módulo de {{ getModuleTypeName(currentModule.type) }}</span>
        <h3 class="text-lg md:text-xl font-bold font-title leading-relaxed text-brand-dark">
          {{ currentSection.instruction }}
        </h3>
      </div>

      <!-- 1. CASO DE USO: READING -->
      <div v-if="currentModule.type === 'reading'" class="flex flex-col gap-6">
        <!-- Texto del ejercicio de lectura con excelente contraste y espaciado -->
        <div class="bg-brand-blue/5 p-5 md:p-6 rounded-talki border border-brand-blue/10 font-body text-base md:text-lg leading-relaxed text-gray-800 shadow-inner">
          {{ currentSection.text }}
        </div>

        <!-- Renderizado de las preguntas -->
        <div v-for="q in currentSection.questions" :key="q.id" class="flex flex-col gap-4">
          <h4 class="text-md font-bold font-title text-brand-dark leading-snug">
            {{ q.text }}
          </h4>

          <!-- Opciones mapeadas a BaseButton de forma limpia -->
          <div class="grid grid-cols-1 gap-3">
            <BaseButton
              v-for="opt in q.options"
              :key="opt.id"
              :variant="userAnswers[q.id]?.optionId === opt.id ? 'primary' : 'secondary'"
              class="w-full text-left justify-start"
              @click="selectOption(q.id, opt)"
            >
              <div class="flex items-center gap-3">
                <span 
                  class="w-6 h-6 rounded-full flex items-center justify-center border font-bold text-xs"
                  :class="userAnswers[q.id]?.optionId === opt.id ? 'bg-brand-dark text-white border-transparent' : 'border-brand-blue/40 text-brand-blue'"
                >
                  {{ opt.id.slice(-1).toUpperCase() }}
                </span>
                <span class="font-medium text-sm md:text-base leading-relaxed">{{ opt.text }}</span>
              </div>
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- 2. CASO DE USO: WRITING -->
      <div v-if="currentModule.type === 'writing'" class="flex flex-col gap-4">
        <!-- Indicaciones y estímulo del email/texto a escribir -->
        <div class="bg-brand-blue/5 p-5 md:p-6 rounded-talki border border-brand-blue/10 flex flex-col gap-3">
          <span class="text-xs font-bold text-brand-lightBlue uppercase tracking-wider font-body">Instrucciones de Redacción</span>
          <p class="font-body text-sm md:text-base text-gray-800 leading-relaxed">
            {{ currentSection.prompt_text }}
          </p>
        </div>

        <!-- Área de escritura con protección contra pegado y contador activo -->
        <div class="flex flex-col gap-2">
          <div class="flex justify-between items-center text-xs text-gray-500 font-body px-1">
            <span class="flex items-center gap-1.5 text-red-600 font-semibold" v-if="currentModule.config?.block_paste">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5">
                <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L10 8.94l3.47-3.47a.75.75 0 111.06 1.06L11.06 10l3.47 3.47a.75.75 0 11-1.06 1.06L10 11.06l-3.47 3.47a.75.75 0 11-1.06-1.06L8.94 10 5.47 6.53a.75.75 0 010-1.06z" clip-rule="evenodd" />
              </svg>
              Pegado de texto deshabilitado
            </span>
            <span v-else>Listo para redactar</span>
            
            <span 
              class="font-bold text-xs" 
              :class="{
                'text-red-500': wordCount < (currentSection.min_words || 0) || wordCount > (currentSection.max_words || 0),
                'text-brand-greenDark': wordCount >= (currentSection.min_words || 0) && wordCount <= (currentSection.max_words || 0)
              }"
            >
              Palabras: {{ wordCount }} / {{ currentSection.min_words }} - {{ currentSection.max_words }}
            </span>
          </div>

          <textarea
            v-model="writingText"
            rows="8"
            class="w-full bg-white text-brand-dark p-5 rounded-talki border-2 border-brand-blue/15 focus:border-brand-lightBlue focus:ring-4 focus:ring-brand-lightBlue/20 outline-none font-body text-sm md:text-base leading-relaxed transition-all shadow-inner resize-none"
            placeholder="Escribe tu respuesta aquí..."
            @paste.prevent
          />
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
  </div>
</template>
