import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
    strictPort: !!process.env.PORT,
  },
  optimizeDeps: {
    // luckyexcel se carga con import() dinámico; pre-bundlearlo evita
    // que Vite recargue la página la primera vez que se abre la previsualización
    include: ['luckyexcel'],
  },
})
