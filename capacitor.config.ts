import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.82ae5662b5f6488d9eaa74c162c99dad',
  appName: 'homedwell-ai',
  webDir: 'dist',
  server: {
    url: 'https://82ae5662-b5f6-488d-9eaa-74c162c99dad.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#hsl(var(--background))",
      showSpinner: true,
      spinnerColor: "#hsl(var(--primary))"
    }
  }
};

export default config;