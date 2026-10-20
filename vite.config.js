import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // PostCSS is configured explicitly so Tailwind CSS v3 runs reliably
  // regardless of the auto-discovery behavior of the Vite version.
  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer()],
    },
  },
})
