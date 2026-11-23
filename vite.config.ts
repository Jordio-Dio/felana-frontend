import path from 'path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Aucun plugin PostCSS n'est nécessaire : Tailwind v4 est appliqué par
  // @tailwindcss/vite. Déclarer explicitement une liste vide empêche Vite
  // d'aller chercher une configuration PostCSS héritée ailleurs sur la machine
  // (qui chargeait un Tailwind v3 incompatible avec l'@import de v4).
  css: {
    postcss: { plugins: [] },
  },
  build: {
    // Vite 8 vise par défaut Safari 16. Or l'iPhone 7 s'arrête à iOS 15.8 :
    // le bundle contenait des "class static blocks" (ES2022), que Safari 15
    // ne sait pas lire DU TOUT. Une seule de ces constructions provoquait un
    // SyntaxError au chargement, donc une page blanche, sans rien afficher.
    // Cibler Safari 15 fait réécrire ces constructions par esbuild.
    target: ['safari15', 'ios15', 'es2020'],
    cssTarget: ['safari15', 'ios15'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})