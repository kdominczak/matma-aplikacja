import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'pl.matma.app',
  appName: 'Matma',
  webDir: 'out',
  plugins: {
    // przypomnienia o planie (src/lib/reminders.ts): biała ikona Σ w pasku stanu, kolor marki
    LocalNotifications: {
      smallIcon: 'ic_stat_matma',
      iconColor: '#D4AF37',
    },
  },
};

export default config;
