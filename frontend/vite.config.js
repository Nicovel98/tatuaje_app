import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Carga variables del sistema y de archivos .env
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl =
    process.env.VITE_API_URL ||
    env.VITE_API_URL ||
    'https://tatuajeapp-dev.up.railway.app/api'

  return {
    plugins: [react()],
    define: {
      // Inyecta directamente la variable en el código cliente durante el build
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
    },
  }
})
