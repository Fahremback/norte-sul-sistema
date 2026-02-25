import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nortesulinformatica.gestao',
  appName: 'Norte Sul Informática',
  webDir: 'dist', // Changed from 'www' to 'dist' for Vite build output
  server: {
    androidScheme: 'http',
    cleartext: true, // Allows HTTP traffic for local development with backend
  },
};

export default config;