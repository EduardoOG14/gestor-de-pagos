import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.eduardo.gestordepagos',
  appName: 'Gestor de Pagos',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
