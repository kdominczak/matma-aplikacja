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
    // logowanie przez Google (src/lib/account.ts) – tylko Google; bez SDK Facebooka i Twittera w APK
    // (Apple włączymy razem z wersją na iOS)
    SocialLogin: {
      providers: { google: true, facebook: false, apple: false, twitter: false },
      logLevel: 1,
    },
  },
};

export default config;
