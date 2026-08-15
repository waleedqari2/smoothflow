import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    // framegen/sr.js imports './rt.js?v=8' — the query string breaks the dep
    // optimizer on Windows (os error 123). Serve it unbundled in dev instead.
    exclude: ['framegen', 'framegen/sr'],
  },
})
