import path from 'path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    // Ajout d'un proxy pour rediriger /api vers Spring Boot (Recommandé)
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
    headers: {
      // Ajout de http://localhost:8080 et ws://localhost:8080 dans connect-src
      'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:5173 ws://localhost:5173; script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:5173 ws://localhost:5173; connect-src 'self' http://localhost:5173 ws://localhost:5173 http://localhost:8080 ws://localhost:8080; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: http://localhost:5173; font-src 'self' data: https://fonts.gstatic.com; frame-src 'self'; object-src 'none'; base-uri 'self'"
    }
  }
})