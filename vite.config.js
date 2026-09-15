import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import backendApiPlugin from './server/index.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss(), backendApiPlugin(env)],
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true,
    },
    preview: {
      host: '0.0.0.0',
      port: 3000,
    },
  }
})
