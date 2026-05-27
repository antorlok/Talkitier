<script setup lang="ts">
import { ref, computed, onUnmounted, watch } from 'vue';
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
  audio_url?: string;
  prompt_text?: string;
  min_words?: number;
  max_words?: number;
  visual_stimulus_url?: string;
  prep_time_seconds?: number;
  recording_time_seconds?: number;
}

interface Module {
  id: string;
  type: 'reading' | 'listening' | 'writing' | 'speaking';
  grading: 'automated' | 'deferred';
  config?: {
    max_plays?: number;
    block_seek?: boolean;
    block_paste?: boolean;
    show_word_counter?: boolean;
    require_media_access?: boolean;
    max_attempts?: number;
  };
  sections: Section[];
}

interface QuizData {
  language: string;
  tier_thresholds: Record<string, number>;
  modules: Module[];
}

// Props recibidos por el componente
const props = defineProps<{
  quizData: QuizData;
}>();

// Emits del componente
const emit = defineEmits<{
  (e: 'finish', payload: { answers: Record<string, any>; score: number }): void;
}>();

// --- ESTADO REACTIVO DEL MOTOR ---
const currentModuleIndex = ref(0);
const currentSectionIndex = ref(0);
const answers = ref<Record<string, any>>({});
const quizFinished = ref(false);

// Referencias a elementos del DOM
const audioPlayer = ref<HTMLAudioElement | null>(null);

// --- ESTADOS PARTICULARES DE LOS SUB-MÓDULOS ---

// 1. Listening Module State
const audioPlaying = ref(false);
const audioPlaysCount = ref(0);
const audioDuration = ref(0);
const audioCurrentTime = ref(0);

// 2. Writing Module State
const writingText = ref('');
const wordCount = computed(() => {
  const text = writingText.value.trim();
  return text === '' ? 0 : text.split(/\s+/).length;
});

// 3. Speaking Module State (Idle -> MediaAccess -> Preparation -> Recording -> Done)
type SpeakingState = 'idle' | 'media_access' | 'preparation' | 'recording' | 'done';
const speakingStatus = ref<SpeakingState>('idle');
const mediaStream = ref<MediaStream | null>(null);
const timerSeconds = ref(0);
let timerInterval: any = null;

// --- PROPIEDADES COMPUTADAS DE NAVEGACIÓN ---
const currentModule = computed<Module>(() => props.quizData.modules[currentModuleIndex.value] as Module);
const currentSection = computed<Section>(() => currentModule.value.sections[currentSectionIndex.value] as Section);

const overallProgress = computed(() => {
  const totalModules = props.quizData.modules.length;
  if (totalModules === 0) return 0;
  return (currentModuleIndex.value / totalModules) * 100;
});

const progressLabel = computed(() => {
  return `Módulo ${currentModuleIndex.value + 1} de ${props.quizData.modules.length} (${getModuleTypeName(currentModule.value.type)})`;
});

// Comprobar si se ha seleccionado respuesta en preguntas de opción múltiple
const isCurrentQuestionAnswered = (questionId: string) => {
  return answers.value[questionId] !== undefined;
};

// Comprobar si la sección actual está completa/válida para avanzar
const isSectionValid = computed(() => {
  const mod = currentModule.value;
  const sec = currentSection.value;

  if (mod.type === 'reading' || mod.type === 'listening') {
    if (!sec.questions) return true;
    return sec.questions.every(q => isCurrentQuestionAnswered(q.id));
  }

  if (mod.type === 'writing') {
    const min = sec.min_words || 0;
    const max = sec.max_words || Infinity;
    return wordCount.value >= min && wordCount.value <= max;
  }

  if (mod.type === 'speaking') {
    return speakingStatus.value === 'done';
  }

  return false;
});

// Traducir nombres de módulos a español para el header
const getModuleTypeName = (type: string) => {
  switch (type) {
    case 'reading': return 'Lectura Comprensiva';
    case 'listening': return 'Comprensión Auditiva';
    case 'writing': return 'Expresión Escrita';
    case 'speaking': return 'Expresión Oral';
    default: return type;
  }
};

// --- GESTIÓN DE ACCIONES Y TIMERS ---

// Limpiar timers para prevenir memory leaks
const clearActiveTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

onUnmounted(() => {
  clearActiveTimer();
  if (mediaStream.value) {
    mediaStream.value.getTracks().forEach(track => track.stop());
  }
  if (audioPlayer.value) {
    audioPlayer.value.pause();
  }
});

// Manejar cambios de módulo/sección para resetear estados específicos
watch([currentModuleIndex, currentSectionIndex], () => {
  clearActiveTimer();
  
  // Resetear estados del listening
  audioPlaying.value = false;
  audioPlaysCount.value = 0;
  audioDuration.value = 0;
  audioCurrentTime.value = 0;

  // Resetear estados del writing
  writingText.value = '';

  // Resetear estados de speaking
  speakingStatus.value = 'idle';
  if (mediaStream.value) {
    mediaStream.value.getTracks().forEach(track => track.stop());
    mediaStream.value = null;
  }
});

// --- LÓGICA POR MÓDULO ---

// --- 1. READING & LISTENING (Respuestas de Opción Múltiple) ---
const selectOption = (questionId: string, option: Option) => {
  // Guardamos la respuesta seleccionada y los puntos asignados por el test
  answers.value[questionId] = {
    optionId: option.id,
    points: option.points
  };
};

// --- 2. LISTENING COMPONENT CONTROLS ---
const toggleAudio = () => {
  if (!audioPlayer.value) return;

  if (audioPlaying.value) {
    audioPlayer.value.pause();
    audioPlaying.value = false;
  } else {
    // Si ya alcanzó el límite de reproducciones configuradas, bloquear
    const maxPlays = currentModule.value.config?.max_plays || Infinity;
    if (audioPlaysCount.value >= maxPlays) return;

    audioPlayer.value.play();
    audioPlaying.value = true;
  }
};

const onAudioPlay = () => {
  audioPlaying.value = true;
};

const onAudioPause = () => {
  audioPlaying.value = false;
};

const onAudioEnded = () => {
  audioPlaying.value = false;
  audioPlaysCount.value++;
  audioCurrentTime.value = audioDuration.value;
};

const onLoadedMetadata = () => {
  if (audioPlayer.value) {
    audioDuration.value = audioPlayer.value.duration;
  }
};

const onTimeUpdate = () => {
  if (audioPlayer.value) {
    audioCurrentTime.value = audioPlayer.value.currentTime;
  }
};

// Formatear segundos en formato MM:SS
const formatTime = (time: number) => {
  if (isNaN(time)) return '00:00';
  const mins = Math.floor(time / 60);
  const secs = Math.floor(time % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// --- 3. SPEAKING STATE MACHINE & MEDIA CONTROLS ---
const requestMicrophoneAccess = async () => {
  try {
    mediaStream.value = await navigator.mediaDevices.getUserMedia({ audio: true });
    speakingStatus.value = 'preparation';
    startPreparationTimer();
  } catch (error) {
    console.error('Error accediendo al micrófono:', error);
    alert('Se requiere acceso al micrófono para realizar este módulo de Expresión Oral.');
  }
};

const startPreparationTimer = () => {
  speakingStatus.value = 'preparation';
  timerSeconds.value = currentSection.value.prep_time_seconds || 30;

  clearActiveTimer();
  timerInterval = setInterval(() => {
    if (timerSeconds.value > 0) {
      timerSeconds.value--;
    } else {
      clearActiveTimer();
      startRecording();
    }
  }, 1000);
};

const startRecording = () => {
  speakingStatus.value = 'recording';
  timerSeconds.value = currentSection.value.recording_time_seconds || 60;

  clearActiveTimer();
  timerInterval = setInterval(() => {
    if (timerSeconds.value > 0) {
      timerSeconds.value--;
    } else {
      stopRecording();
    }
  }, 1000);
};

const stopRecording = () => {
  clearActiveTimer();
  speakingStatus.value = 'done';
  
  // Guardamos respuesta mockeando el audio grabado
  answers.value[currentSection.value.id] = {
    recorded: true,
    blobUrl: '#mocked_audio_blob_url',
    duration: currentSection.value.recording_time_seconds || 60
  };

  // Detener pistas de audio de captura para liberar el micrófono
  if (mediaStream.value) {
    mediaStream.value.getTracks().forEach(track => track.stop());
  }
};

// --- NAVEGACIÓN GENERAL DEL QUIZ ---
const nextStep = () => {
  if (!isSectionValid.value) return;

  // Si estamos en módulo de escritura, guardar texto redactado antes de avanzar
  if (currentModule.value.type === 'writing') {
    answers.value[currentSection.value.id] = {
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
    const modulesCount = props.quizData.modules.length;
    if (currentModuleIndex.value < modulesCount - 1) {
      currentModuleIndex.value++;
      currentSectionIndex.value = 0;
    } else {
      // Fin del cuestionario
      finishQuiz();
    }
  }
};

// Finalización y grading automatizado inicial
const totalScore = computed(() => {
  let score = 0;
  // Solo se suman puntos automatizados de los módulos correspondientes (Reading y Listening)
  props.quizData.modules.forEach(mod => {
    if (mod.grading === 'automated') {
      mod.sections.forEach(sec => {
        sec.questions?.forEach(q => {
          const ans = answers.value[q.id];
          if (ans && ans.points) {
            score += ans.points;
          }
        });
      });
    }
  });
  return score;
});

const calculatedTier = computed(() => {
  const score = totalScore.value;
  const thresholds = props.quizData.tier_thresholds;
  let finalTier = 'A1';

  // Obtener el rango en base a los thresholds del JSON
  for (const [tier, minScore] of Object.entries(thresholds)) {
    if (score >= minScore) {
      finalTier = tier;
    }
  }
  return finalTier;
});

const finishQuiz = () => {
  quizFinished.value = true;
  emit('finish', {
    answers: answers.value,
    score: totalScore.value
  });
};
</script>

<template>
  <!-- Wrapper principal con estética de marca oscura e interactiva -->
  <div class="w-full max-w-3xl mx-auto p-4 md:p-6 flex flex-col gap-6">
    
    <!-- Barra de Progreso Global a nivel de organismo -->
    <div v-if="!quizFinished" class="bg-brand-blue/30 border border-brand-lightBlue/10 p-4 rounded-talki shadow-xl backdrop-blur-md">
      <ProgressBar :progress="overallProgress" :label="progressLabel" />
    </div>

    <!-- PÁGINA DE RESULTADOS (CUANDO EL QUIZ HA TERMINADO) -->
    <div v-if="quizFinished" class="bg-brand-cream text-brand-dark p-8 md:p-12 rounded-talki shadow-2xl flex flex-col items-center text-center gap-6 border-4 border-brand-greenLight">
      <div class="w-20 h-20 rounded-full bg-brand-greenLight/20 flex items-center justify-center text-brand-greenDark">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-10 h-10">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
      </div>

      <h2 class="text-3xl font-bold font-title text-brand-dark tracking-tight">¡Test Completado!</h2>
      <p class="font-body text-gray-700 max-w-md">
        Has finalizado todas las secciones de lectura, escucha, escritura y expresión oral con éxito.
      </p>

      <!-- Panel de Puntuación Automatizada -->
      <div class="w-full bg-brand-dark text-brand-cream p-6 rounded-talki flex flex-col gap-3 my-2 border border-brand-lightBlue/10 shadow-inner">
        <span class="text-xs md:text-sm font-semibold tracking-wider text-brand-lightBlue uppercase">Tu Nivel de Entrada Automático</span>
        <span class="text-5xl font-extrabold font-title text-brand-greenLight">{{ calculatedTier }}</span>
        <span class="text-sm font-body text-gray-300">Puntaje de autoevaluación inicial: <strong>{{ totalScore }} puntos</strong></span>
      </div>

      <div class="bg-brand-blue/10 border border-brand-blue/20 p-4 rounded-talki text-xs md:text-sm text-brand-blue max-w-lg text-left">
        <p class="font-bold mb-1">📢 Nota sobre tu evaluación final:</p>
        <p class="font-body text-gray-700">
          Los módulos de **Expresión Escrita** (Writing) y **Expresión Oral** (Speaking) requieren una revisión diferida por nuestros evaluadores. Una vez calificados manualmente, tu nivel final se actualizará y se te asignará el rol correspondiente en el servidor de Discord.
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
              :variant="answers[q.id]?.optionId === opt.id ? 'primary' : 'secondary'"
              class="w-full text-left justify-start"
              @click="selectOption(q.id, opt)"
            >
              <div class="flex items-center gap-3">
                <span 
                  class="w-6 h-6 rounded-full flex items-center justify-center border font-bold text-xs"
                  :class="answers[q.id]?.optionId === opt.id ? 'bg-brand-dark text-white border-transparent' : 'border-brand-blue/40 text-brand-blue'"
                >
                  {{ opt.id.slice(-1).toUpperCase() }}
                </span>
                <span class="font-medium text-sm md:text-base leading-relaxed">{{ opt.text }}</span>
              </div>
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- 2. CASO DE USO: LISTENING -->
      <div v-if="currentModule.type === 'listening'" class="flex flex-col gap-6">
        <!-- Audio HTML oculto de reproducción controlada por script -->
        <audio
          ref="audioPlayer"
          :src="currentSection.audio_url"
          class="hidden"
          @play="onAudioPlay"
          @pause="onAudioPause"
          @ended="onAudioEnded"
          @timeupdate="onTimeUpdate"
          @loadedmetadata="onLoadedMetadata"
        />

        <!-- Controles de Audio Premium y Seguros (Bypass del Seek) -->
        <div class="bg-brand-blue text-brand-cream p-5 md:p-6 rounded-talki flex flex-col md:flex-row items-center justify-between gap-4 border border-brand-lightBlue/20 shadow-lg">
          <div class="flex items-center gap-4">
            <!-- Botón de Reproducción Controlado -->
            <BaseButton
              variant="primary"
              :disabled="audioPlaysCount >= (currentModule.config?.max_plays || 2)"
              class="w-14 h-14 !p-0 !rounded-full flex items-center justify-center border border-white/20 shadow-md shadow-brand-greenLight/10 active:scale-90"
              @click="toggleAudio"
            >
              <!-- Icono de Play -->
              <svg v-if="!audioPlaying" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-brand-dark">
                <path fill-rule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clip-rule="evenodd" />
              </svg>
              <!-- Icono de Pause -->
              <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-brand-dark">
                <path fill-rule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clip-rule="evenodd" />
              </svg>
            </BaseButton>

            <div class="flex flex-col text-left">
              <span class="font-title font-semibold text-base leading-snug">Audio Escucha Controlado</span>
              <span class="text-xs text-brand-lightBlue font-body mt-0.5">
                Reproducciones: {{ audioPlaysCount }} / {{ currentModule.config?.max_plays || 2 }} max.
              </span>
            </div>
          </div>

          <!-- Tiempo de reproducción estilizado (No manipulable/Sin seekbar) -->
          <div class="text-right flex flex-col font-mono text-xs md:text-sm text-brand-greenLight font-bold">
            <span>{{ formatTime(audioCurrentTime) }} / {{ formatTime(audioDuration) }}</span>
            <span class="text-[10px] text-gray-400 font-body mt-1">Avance no modificable</span>
          </div>
        </div>

        <!-- Renderizado de las preguntas -->
        <div v-for="q in currentSection.questions" :key="q.id" class="flex flex-col gap-4">
          <h4 class="text-md font-bold font-title text-brand-dark">
            {{ q.text }}
          </h4>

          <div class="grid grid-cols-1 gap-3">
            <BaseButton
              v-for="opt in q.options"
              :key="opt.id"
              :variant="answers[q.id]?.optionId === opt.id ? 'primary' : 'secondary'"
              class="w-full text-left justify-start"
              @click="selectOption(q.id, opt)"
            >
              <div class="flex items-center gap-3">
                <span 
                  class="w-6 h-6 rounded-full flex items-center justify-center border font-bold text-xs"
                  :class="answers[q.id]?.optionId === opt.id ? 'bg-brand-dark text-white border-transparent' : 'border-brand-blue/40 text-brand-blue'"
                >
                  {{ opt.id.slice(-1).toUpperCase() }}
                </span>
                <span class="font-medium text-sm md:text-base leading-relaxed">{{ opt.text }}</span>
              </div>
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- 3. CASO DE USO: WRITING -->
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

      <!-- 4. CASO DE USO: SPEAKING -->
      <div v-if="currentModule.type === 'speaking'" class="flex flex-col gap-6 items-center text-center">
        <!-- Visual Stimulus Image si está presente -->
        <div v-if="currentSection.visual_stimulus_url" class="w-full max-h-64 rounded-talki overflow-hidden border-2 border-brand-blue/20 shadow-md bg-white p-2">
          <img
            :src="currentSection.visual_stimulus_url"
            alt="Estímulo visual para expresión oral"
            class="w-full h-full object-contain rounded-2xl mx-auto"
          />
        </div>

        <!-- Instrucción específica -->
        <div class="bg-brand-blue/5 p-4 rounded-talki w-full text-left border border-brand-blue/10">
          <p class="font-body text-sm md:text-base text-gray-800 leading-relaxed">
            <strong>Indicación:</strong> {{ currentSection.prompt_text }}
          </p>
        </div>

        <!-- MÁQUINA DE ESTADOS - INTERFAZ DE SPEAKING -->
        
        <!-- Estado 4.1: Idle (Aún sin acceso de medios) -->
        <div v-if="speakingStatus === 'idle'" class="flex flex-col items-center gap-4 py-4 w-full">
          <div class="w-16 h-16 rounded-full bg-brand-blue/5 flex items-center justify-center text-brand-blue border border-brand-blue/20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
          </div>
          <p class="text-xs md:text-sm text-gray-600 font-body max-w-sm">
            Este ejercicio requiere acceso al micrófono para grabar tu interpretación por audio.
          </p>
          <BaseButton variant="primary" @click="requestMicrophoneAccess">
            Otorgar Permiso e Iniciar
          </BaseButton>
        </div>

        <!-- Estado 4.2: Preparation (Tiempo de preparación antes de grabar) -->
        <div v-if="speakingStatus === 'preparation'" class="flex flex-col items-center gap-4 py-4 w-full">
          <div class="w-24 h-24 rounded-full border-4 border-dashed border-brand-blue flex flex-col items-center justify-center text-brand-dark animate-pulse shadow-md bg-brand-blue/5">
            <span class="text-xs font-bold text-brand-blue uppercase tracking-wider font-body">Prepara</span>
            <span class="text-3xl font-extrabold font-title">{{ timerSeconds }}s</span>
          </div>
          <p class="text-sm font-body text-gray-700">
            Organiza tus ideas. La grabación comenzará automáticamente al finalizar la cuenta regresiva.
          </p>
          <BaseButton variant="secondary" @click="startRecording">
            Saltar e Iniciar Grabación
          </BaseButton>
        </div>

        <!-- Estado 4.3: Recording (Grabación activa) -->
        <div v-if="speakingStatus === 'recording'" class="flex flex-col items-center gap-4 py-4 w-full">
          <div class="w-24 h-24 rounded-full border-4 border-red-600 flex flex-col items-center justify-center text-red-600 bg-red-50 shadow-lg shadow-red-200">
            <span class="text-xs font-bold uppercase tracking-wider font-body animate-ping">Grabando</span>
            <span class="text-3xl font-extrabold font-title mt-0.5">{{ timerSeconds }}s</span>
          </div>
          <p class="text-sm font-body text-gray-700 font-semibold animate-pulse">
            Habla claramente hacia tu micrófono ahora...
          </p>
          <BaseButton variant="danger" @click="stopRecording">
            Detener y Guardar Grabación
          </BaseButton>
        </div>

        <!-- Estado 4.4: Done (Grabación guardada) -->
        <div v-if="speakingStatus === 'done'" class="flex flex-col items-center gap-3 py-4 w-full">
          <div class="w-16 h-16 rounded-full bg-brand-greenLight/20 flex items-center justify-center text-brand-greenDark border-2 border-brand-greenLight">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-8 h-8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <p class="text-sm font-bold font-title text-brand-greenDark">
            Grabación Guardada Exitosamente
          </p>
          <p class="text-xs text-gray-500 font-body">
            Tu respuesta de audio ha sido almacenada temporalmente y está lista para envío.
          </p>
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
          {{ currentModuleIndex === props.quizData.modules.length - 1 && currentSectionIndex === currentModule.sections.length - 1 ? 'Finalizar Test' : 'Siguiente' }}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </BaseButton>
      </div>

    </div>
  </div>
</template>
