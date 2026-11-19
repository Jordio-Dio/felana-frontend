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
    androidScheme: 'https',
  },
}

export default config
