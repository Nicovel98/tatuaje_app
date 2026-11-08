import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Carga todas las variables de entorno del sistema (process.env) y de archivos .env
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = process.env.VITE_API_URL || env.VITE_API_URL || ''

  return {
    plugins: [react()],
    define: {
      // Fuerza a Vite a inyectar directamente la variable del entorno de build
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
    },
  }
})
