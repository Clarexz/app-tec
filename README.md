# CampusConectado

App Android para alumnos del TecNM Campus Reynosa. Aquí puedes ver los **avisos** del campus, consultar los **talleres**, **inscribirte** y revisar **mis inscripciones**.

Hecha por **Ravyn Studio** · Equipo 1 · App e integración.

## Qué hace

- **Inicio de sesión:** cada alumno entra con su **número de control** y su **contraseña** (las 4 primeras letras de su CURP). La sesión se queda guardada en el teléfono; la primera vez se le pide su nombre completo.
- **Avisos:** lista de avisos del campus, con recarga al deslizar hacia abajo.
- **Talleres:** lista de talleres con horario, búsqueda por número y detalle de cada taller.
- **Inscribirme:** eliges un taller y te inscribes con los datos de tu sesión.
- **Mis inscripciones:** tus inscripciones, cargadas automáticamente con tu número de control.
- **Mi cuenta:** tu nombre y número de control, cambiar nombre y cerrar sesión.
- **Estado del servidor (oculto):** mantén presionado el logo en Avisos o en el inicio de sesión, o entra desde *Mi cuenta*. Muestra el estado de los tres servicios y su tiempo de respuesta.

## Stack

- Expo SDK 58 y React Native (0.88), con TypeScript estricto
- Expo Router para la navegación (rutas en `src/app/`)
- TanStack Query para datos remotos
- AsyncStorage para la sesión del alumno
- lucide-react-native para íconos
- Tipografías Funnel Display, Funnel Sans y Caveat, cargadas con `@expo-google-fonts`

## Cómo correrla

Requisitos: Node.js y npm, Expo Go en tu teléfono o un emulador de Android.

```bash
npm install
```

```bash
cp .env.example .env
```

```bash
npx expo start
```

Abre la app con Expo Go escaneando el código QR, o presiona `a` para abrirla en el emulador de Android.

Revisiones antes de subir cambios:

```bash
npx tsc --noEmit
```

```bash
npx expo-doctor
```

## Variables de entorno

Se definen en `.env` (copiado desde `.env.example`). Las variables que empiezan con `EXPO_PUBLIC_` se incluyen en la app al compilarla. La app siempre usa los servicios reales.

| Variable | Valor de ejemplo | Para qué sirve |
|---|---|---|
| `EXPO_PUBLIC_API_HOST` | `http://2.24.29.189` | Host del VPS, sin puerto ni `/` final. |
| `EXPO_PUBLIC_PORT_AVISOS` | `30001` | Puerto del servicio Avisos. |
| `EXPO_PUBLIC_PORT_TALLERES` | `30002` | Puerto del servicio Talleres. |
| `EXPO_PUBLIC_PORT_INSCRIPCIONES` | `30003` | Puerto del servicio Inscripciones. |

## Inicio de sesión

El servidor todavía no tiene un servicio de login, así que por ahora las credenciales se validan dentro de la app, en `src/auth/cuentas.ts` (cuenta de prueba: `22580076` / `MACB`). Cuando exista el servicio, solo hay que cambiar `verificarCredenciales` en ese archivo por la llamada HTTP; el resto de la app (sesión en `src/auth/sesion.tsx` y rutas protegidas en `src/app/_layout.tsx`) no cambia.

## Builds con EAS

Los perfiles están en `eas.json`.

```bash
npx eas-cli@latest build -p android --profile preview
```

APK conectado al servidor real.

```bash
npx eas-cli@latest build -p android --profile production
```

AAB para Google Play.

El tráfico HTTP plano (`http://`) se habilita con `usesCleartextTraffic` mediante `expo-build-properties`. **Esto debe probarse en el APK, no solo en Expo Go.**

## Estructura de carpetas

```
src/
├── app/          Rutas (Expo Router): login.tsx, (tabs)/, taller/[id].tsx, perfil.tsx, estado.tsx
├── api/          Cliente de servicios y errores
├── auth/         Sesión del alumno y verificación de credenciales
├── hooks/        Hooks de TanStack Query
├── components/   Componentes compartidos
├── theme/        Colores, espacios, tipografías y textos
└── types/        Tipos de la API
```

## Matriz de pruebas

Pruebas manuales contra el servidor real.

| # | Prueba | Resultado esperado |
|---|---|---|
| 1 | Abrir la app sin sesión | Pantalla de inicio de sesión |
| 2 | Entrar con `22580076` / `MACB` | Pide nombre la primera vez y abre Avisos |
| 3 | Entrar con una contraseña incorrecta | "Número de control o contraseña incorrectos" |
| 4 | Abrir Avisos | Avisos del servidor, saludo con tu nombre |
| 5 | Abrir Talleres y buscar un número que no existe | Aparece "Ese taller no existe" |
| 6 | Inscribirte a un taller | Mensaje de éxito; el taller aparece como inscrito |
| 7 | Repetir la inscripción | Aparece "Ya estás inscrito" |
| 8 | Abrir Mis inscripciones | Lista con nombre del taller y horario |
| 9 | Sin internet, abrir cualquier pestaña | "Sin conexión con el campus" y botón Reintentar |
| 10 | Abrir *Estado del servidor* | Tres servicios con estado y tiempo de respuesta en ms |
| 11 | Cerrar y volver a abrir la app | Sigue la sesión abierta |
| 12 | *Mi cuenta* → Cerrar sesión | Regresa al inicio de sesión |

## Documentación

- [`docs/ESPECIFICACION.md`](docs/ESPECIFICACION.md): especificación del producto, pantallas, mensajes y estilo.
- [`CONTRATO.md`](CONTRATO.md): contrato interno entre módulos (capa de datos, componentes y pantallas).
- [`DECISIONES.md`](DECISIONES.md): decisiones técnicas tomadas y su motivo.

## Releases con GitHub Actions

Los APK se compilan con Gradle en GitHub Actions (no hace falta cuenta de Expo).

### Cómo hacer un release

Crea la etiqueta con la versión:

```bash
git tag v1.0.0
```

Y súbela a GitHub:

```bash
git push origin v1.0.0
```

El workflow `Release` compila el APK y los publica en la página de Releases. También puedes lanzarlo a mano desde la pestaña Actions (`workflow_dispatch`); en ese caso solo se genera el APK como artefacto, sin publicar release. Si la etiqueta lleva guion (por ejemplo `v1.0.0-rc1`), el release se marca como prerelease.

### El APK

- `CampusConectado-X-android.apk`: conectado a los servicios reales.

### Firma (opcional)

En *Settings > Secrets and variables > Actions* puedes definir:

- Secrets: `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.
- Variable: `API_HOST` (por defecto `http://2.24.29.189`).

Para generar un keystore:

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore release.keystore -alias campus -keyalg RSA -keysize 2048 -validity 10000
```

Y para convertirlo a base64 (el resultado es el valor de `ANDROID_KEYSTORE_BASE64`):

```bash
base64 -w0 release.keystore
```

Guarda el keystore y sus contraseñas en un lugar seguro y nunca lo subas al repositorio.

> **Advertencia:** sin keystore, el APK se firma con una llave de depuración. Se instala sin problema para una demo, pero no sirve para Google Play, y las actualizaciones solo se instalan si están firmadas con la misma llave. Configura el keystore antes de distribuir ampliamente.

Google Play requiere AAB, no APK. Se puede agregar más adelante con `bundleRelease`.

### Publicar un release sin tag (desde GitHub)

En **Actions → Release → Run workflow**, escribe la versión (ej. `1.0.1`) y marca **publicar**. El workflow compila los dos APK, crea el tag `v1.0.1` y publica el release. Sin marcar *publicar*, solo deja los APK como artefactos de la ejecución (útil para probar).
