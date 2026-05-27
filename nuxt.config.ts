// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Registro de módulos principales de la aplicación
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxtjs/google-fonts'
  ],

  // Configuración de fuentes de Google para descarga y optimización local
  googleFonts: {
    families: {
      'Lexend Deca': [400, 600, 700],
      Comfortaa: [400, 600, 700]
    },
    display: 'swap',
    download: true // Descarga las fuentes en local para optimizar el LCP y evitar llamadas externas
  },

  // Habilitar compatibilidad con Nuxt 4 utilizando el directorio raíz para la aplicación
  future: {
    compatibilityVersion: 4
  },
  dir: {
    app: '.'
  },
  telemetry: false,

  // Configuración de variables de entorno seguras para OAuth2 en el servidor
  runtimeConfig: {
    discordClientSecret: process.env.DISCORD_CLIENT_SECRET || '',
    public: {
      discordClientId: process.env.DISCORD_CLIENT_ID || '',
      discordRedirectUri: process.env.DISCORD_REDIRECT_URI || ''
    }
  }
})
