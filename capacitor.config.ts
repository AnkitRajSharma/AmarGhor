import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.amarghor.app',
  appName: 'AmarGhor',
  webDir: 'public',
  server: {
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#052e16',
  },
};

export default config;
