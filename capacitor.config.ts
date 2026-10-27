import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.amarghor.app',
  appName: 'AmarGhor',
  webDir: 'public',
  server: {
    // Connects to live cloud backend so phone works over 5G/4G cellular & Wi-Fi
    url: 'https://nondistortedly-endoblastic-fred.ngrok-free.dev',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#052e16',
  },
};

export default config;
