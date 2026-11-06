// Firma el APK release con un keystore propio si ANDROID_KEYSTORE_PATH está definido
// al momento del prebuild. Las credenciales se leen del entorno en tiempo de Gradle.
// Sin la variable, no cambia nada (la plantilla de Expo firma release con la llave debug).
const { withAppBuildGradle } = require('expo/config-plugins');

const MARKER = '// withReleaseSigning';

const SIGNING_BLOCK = `        release {
            ${MARKER}
            storeFile file(System.getenv("ANDROID_KEYSTORE_PATH"))
            storePassword System.getenv("ANDROID_KEYSTORE_PASSWORD")
            keyAlias System.getenv("ANDROID_KEY_ALIAS")
            keyPassword System.getenv("ANDROID_KEY_PASSWORD")
        }
`;

function applySigning(src) {
  if (src.includes(MARKER)) return src; // idempotente

  // 1. Agregar signingConfigs.release dentro del bloque signingConfigs existente.
  const sc = /signingConfigs\s*\{/;
  if (!sc.test(src)) {
    throw new Error('withReleaseSigning: no se encontró signingConfigs en build.gradle');
  }
  src = src.replace(sc, (m) => `${m}\n${SIGNING_BLOCK}`);

  // 2. En buildTypes.release usar signingConfigs.release en vez de debug.
  const bt = /(buildTypes\s*\{[\s\S]*?\brelease\s*\{[\s\S]*?)signingConfig\s+signingConfigs\.debug/;
  if (!bt.test(src)) {
    throw new Error('withReleaseSigning: no se encontró signingConfig en buildTypes.release');
  }
  return src.replace(bt, '$1signingConfig signingConfigs.release');
}

module.exports = function withReleaseSigning(config) {
  if (!process.env.ANDROID_KEYSTORE_PATH) return config;
  return withAppBuildGradle(config, (cfg) => {
    cfg.modResults.contents = applySigning(cfg.modResults.contents);
    return cfg;
  });
};
