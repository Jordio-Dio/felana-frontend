import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.hibacreation.app',
  appName: 'Hiba Création',
  webDir: 'dist',
  android: {
    // Le site utilise beaucoup de requêtes HTTPS (API, Cloudinary, PostHog)
    allowMixedContent: false,
  },
  server: {
    // L'APK affiche directement le site déployé (aucun code embarqué).
    url: 'https://hiba-creations.vercel.app/login',
    androidScheme: 'https',
    cleartext: false,
  },
}

export default config
