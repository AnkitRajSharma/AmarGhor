import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.amarghor.app',
  appName: 'AmarGhor',
  webDir: 'public',
  server: {
    url: 'https://amarghor.onrender.com',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#052e16',
  },
};

export default config;
