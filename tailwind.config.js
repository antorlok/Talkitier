/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#040a21',
          blue: '#1f2060',
          lightBlue: '#98bbd7',
          greenLight: '#b6cf7b',
          greenDark: '#4c7026',
          cream: '#f5f3dc'
        }
      },
      fontFamily: {
        title: ['"Lexend Deca"', 'sans-serif'],
        body: ['Comfortaa', 'sans-serif']
      },
      borderRadius: {
        talki: '2rem'
      }
    }
  },
  plugins: []
}
