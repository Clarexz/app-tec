import type { ConfigContext, ExpoConfig } from 'expo/config';

// Extiende app.json. En CI, APP_VERSION y ANDROID_VERSION_CODE sobrescriben la versión.
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? 'CampusConectado',
  slug: config.slug ?? 'campusconectado',
  version: process.env.APP_VERSION || config.version,
  android: {
    ...config.android,
    versionCode: process.env.ANDROID_VERSION_CODE
      ? Number(process.env.ANDROID_VERSION_CODE)
      : config.android?.versionCode,
  },
  plugins: [...(config.plugins ?? []), './plugins/withReleaseSigning'],
});
