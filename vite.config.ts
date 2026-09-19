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
    headers: {
      'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:5173 ws://localhost:5173; script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:5173 ws://localhost:5173; connect-src 'self' http://localhost:5173 ws://localhost:5173 http://localhost:8080 ws://localhost:8080 https://felana-backend.onrender.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: http://localhost:5173; font-src 'self' data: https://fonts.gstatic.com; frame-src 'self'; object-src 'none'; base-uri 'self'"
    }
  }
})