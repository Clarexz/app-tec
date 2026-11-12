# Manual técnico — App CampusConectado

**Equipo 1 · App e integración** · Proyecto CampusConectado · TecNM Campus Reynosa
Versión de la app: **1.1.0** (`app.json`) · Fecha del documento: 12 de noviembre de 2026

> **Datos ficticios.** En este documento la IP del VPS se escribe como `203.0.113.10` (rango reservado para documentación, RFC 5737). El valor real va solo en `.env` / `eas.json` y no se publica aquí. Los números de control, nombres y contraseñas de los ejemplos también son inventados.

---

## 1. Qué es

CampusConectado es una app Android para alumnos: inician sesión con su número de control, ven los **avisos** del campus, consultan los **talleres**, se **inscriben** y revisan **mis inscripciones**. Consume tres microservicios Flask desplegados por los equipos 2, 3 y 4 en un clúster K3s.

| Servicio | Equipo | Namespace | Puerto (NodePort) |
|---|---|---|---|
| Avisos | 2 | `equipo2` | 30001 |
| Talleres | 3 | `equipo3` | 30002 |
| Inscripciones | 4 | `equipo4` | 30003 |

## 2. Stack (versiones exactas)

Rango declarado en `package.json` y versión **instalada** según `package-lock.json` (`npm ci` del 2026-11-12).

| Paquete | Declarado | Instalado | Uso |
|---|---|---|---|
| `expo` | `~58.0.24` | 58.0.24 | SDK 58 |
| `react-native` | `0.88.1` | 0.88.1 | Motor nativo |
| `react` / `react-dom` | `19.3.0` | 19.3.0 | UI |
| `expo-router` | `~58.0.31` | 58.0.31 | Navegación por archivos (`src/app/`) |
| `@tanstack/react-query` | `^5.106.1` | 5.106.1 | Caché, reintentos y estados de carga |
| `@react-native-async-storage/async-storage` | `2.2.0` | 2.2.0 | Sesión guardada en el teléfono |
| `expo-build-properties` | `~58.0.12` | 58.0.12 | `usesCleartextTraffic` en Android |
| `expo-haptics` | `~58.0.8` | 58.0.8 | Vibración de éxito/error |
| `expo-font` | `~58.0.11` | 58.0.12 | Carga de fuentes |
| `expo-splash-screen` | `~58.0.14` | 58.0.14 | Splash mientras carga la sesión |
| `expo-status-bar` | `~58.0.5` | 58.0.5 | Barra de estado |
| `react-native-screens` | `~4.30.1` | 4.30.1 | Pantallas nativas |
| `react-native-safe-area-context` | `~5.11.1` | 5.11.1 | Márgenes seguros |
| `react-native-gesture-handler` | `~3.3.0` | 3.3.0 | Gestos |
| `react-native-reanimated` | `4.7.1` | 4.7.1 | Animaciones de entrada |
| `react-native-worklets` | `0.13.0` | 0.13.0 | Requerido por Reanimated 4 |
| `react-native-svg` | `15.16.0` | 15.16.0 | Íconos |
| `lucide-react-native` | `^1.70.0` | 1.70.0 | Íconos |
| `@expo-google-fonts/funnel-display` · `funnel-sans` · `caveat` | `^0.4.1` · `^0.4.2` · `^0.4.2` | — | Tipografías |
| `typescript` (dev) | `~6.0.3` | 6.0.3 | TypeScript estricto |
| `eslint` (dev) / `eslint-config-expo` | `^9.0.0` / `~58.0.4` | 9.39.5 / 58.0.4 | `npx expo lint` |

Herramientas: Node.js 22, npm 10, Expo CLI 58.1.20, EAS CLI (`npx eas-cli@latest`).

## 3. Estructura de carpetas

```
app-tec/
├── app.json              Config de Expo (nombre, paquete Android, plugins, cleartext)
├── app.config.ts         Extiende app.json: versión desde CI y plugin de firma
├── eas.json              Perfiles de build en la nube (preview = APK, production = AAB)
├── .env.example          Plantilla de variables EXPO_PUBLIC_*
├── plugins/
│   └── withReleaseSigning.js   Firma el APK release con un keystore propio (opcional)
├── .github/workflows/    ci.yml (lint, tsc, expo-doctor, bundle) · release.yml (APK con Gradle)
├── assets/images/        Ícono, ícono adaptativo y splash
├── docs/                 Especificación, guía de integración y esta entrega
└── src/
    ├── app/              RUTAS (Expo Router): cada archivo es una pantalla
    │   ├── _layout.tsx         Raíz: fuentes, splash, QueryClient, sesión, Stack protegido
    │   ├── login.tsx           Inicio de sesión
    │   ├── perfil.tsx          Mi cuenta (modal)
    │   ├── estado.tsx          Estado del servidor (diagnóstico)
    │   ├── taller/[id].tsx     Detalle de un taller
    │   └── (tabs)/             Pestañas: index (Avisos), talleres, inscribirme, mis-inscripciones
    ├── api/              Capa HTTP
    │   ├── http.ts             fetchJson: timeout, parseo tolerante, ApiError
    │   ├── real.ts             Una función por endpoint
    │   ├── errors.ts           ApiError, mensajeDeError, mensajeExito
    │   ├── services.ts         Interfaz CampusApi
    │   ├── queryClient.ts      Reintentos y caché por defecto
    │   └── index.ts            export const api
    ├── hooks/index.ts    Hooks de React Query (useAvisos, useTalleres, useInscribir…)
    ├── auth/             Sesión del alumno (contexto + AsyncStorage) y validación local
    ├── components/       Componentes compartidos (Button, Card, Banner, TallerPicker…)
    ├── theme/            Colores, espacios y tipografía
    ├── types/api.ts      Tipos del contrato (Aviso, Taller, Inscripcion…)
    └── config.ts         Lee EXPO_PUBLIC_* y arma las URLs
```

`ios/` y `android/` **no** están en el repo: se generan con `npx expo prebuild` (Continuous Native Generation). La configuración nativa se hace solo en `app.json` y en plugins.

## 4. Arquitectura interna

```
Pantalla (src/app)  →  Hook (src/hooks)  →  api (src/api/index.ts)  →  realApi (real.ts)  →  fetchJson (http.ts)  →  servicio
      ↑                      │
      └── mensajeDeError ────┘   (ApiError → título + texto + detalle)
```

1. **Pantallas** (`src/app/**`): solo muestran datos y estados (cargando, vacío, error, éxito). No llaman a `fetch` directamente.
2. **Hooks** (`src/hooks/index.ts`): envuelven cada operación con React Query.
   - `useAvisos`, `useTalleres` (`staleTime` 30 s), `useTaller(id)` (no reintenta 404), `useInscripciones(matricula)` (solo si hay matrícula), `useSalud` (los 3 `/salud` en paralelo), `useTallerNombre` (cruza `taller_id` con la caché de talleres).
   - `useInscribir`: normaliza (`trim`, mayúsculas), **valida antes de enviar** (el servidor acepta `""`) y, al 201, agrega la inscripción a la caché de *Mis inscripciones* y la revalida. Ante 409 revalida la lista.
3. **Capa `api`**: `api` implementa la interfaz `CampusApi` (`services.ts`). Hoy `api = realApi`.
4. **Mock / real.** La versión 1.0.0 tenía `src/api/mock/` y un selector por servicio (`EXPO_PUBLIC_USE_MOCKS`, `EXPO_PUBLIC_MOCK_SERVICES`) porque Talleres aún no estaba desplegado. En la 1.1.0, con los tres servicios arriba, el equipo decidió quitar el modo de prueba (`DECISIONES.md` §17 y §22). La interfaz `CampusApi` se conservó: para volver a tener un mock basta con otra implementación de `CampusApi` y elegirla en `src/api/index.ts`. Para pruebas sin celular se usa `docs/entrega/pruebas_automatizadas/servidor-local.js` (§11).
5. **Sesión** (`src/auth`): `SesionProvider` guarda `{noControl, nombre}` en AsyncStorage (`sesion.v1`). `_layout.tsx` usa `Stack.Protected`: sin sesión solo existen `login` y `estado`. La validación de credenciales es **local y temporal** (`src/auth/cuentas.ts`) porque el servidor no tiene servicio de login; cambiar a uno real solo toca `verificarCredenciales`.

Diagramas: `Diagrama_arquitectura.svg`, `Diagrama_flujo_app.svg` y `Diagrama_secuencia_inscripcion.svg` (con su `.mmd` y `.png`).

## 5. Configuración (variables `EXPO_PUBLIC_*`)

Se leen en `src/config.ts` con acceso literal a `process.env.EXPO_PUBLIC_…` (así Expo las incrusta en el bundle al compilar). **Cualquier cambio requiere reiniciar Metro con caché limpia** (`npx expo start -c`) o recompilar el APK.

| Variable | Ejemplo (ficticio) | Por defecto en código | Para qué |
|---|---|---|---|
| `EXPO_PUBLIC_API_HOST` | `http://203.0.113.10` | IP del VPS | Host sin puerto; se quita la `/` final |
| `EXPO_PUBLIC_PORT_AVISOS` | `30001` | 30001 | Puerto de Avisos |
| `EXPO_PUBLIC_PORT_TALLERES` | `30002` | 30002 | Puerto de Talleres |
| `EXPO_PUBLIC_PORT_INSCRIPCIONES` | `30003` | 30003 | Puerto de Inscripciones |

Valores fijos en `config.ts`: `timeoutMs = 8000`. URLs resultantes: `${host}:${puerto}`.

> Las `EXPO_PUBLIC_*` quedan **visibles dentro del APK**. No se debe poner nada secreto en ellas (no hay ni hace falta: los servicios no usan autenticación).

Para el build: las variables van en `eas.json` → `build.<perfil>.env` (EAS) o en `vars.API_HOST` del repositorio (GitHub Actions).

## 6. Consumo de cada servicio

Todas las llamadas pasan por `fetchJson` (`src/api/http.ts`):

- Encabezado `Accept: application/json`; en `POST`, `Content-Type: application/json` (sin él, Inscripciones no lee el cuerpo y responde 400).
- **Timeout de 8 s** con `AbortController`. Un timeout o un fallo de red se convierte en `ApiError(status 0)`.
- El cuerpo se lee como texto y se intenta `JSON.parse`. Si la respuesta no es 2xx, se toma `error` (o `mensaje`) como `detalle`. Si el cuerpo es HTML (404/405 de Flask), no se rompe: queda solo el mensaje amigable.
- Una respuesta 2xx que no es JSON también es error (“Respuesta no válida”).

| Operación (hook) | Método y URL | Respuestas que maneja la app |
|---|---|---|
| `salud(s)` (`useSalud`) | `GET http://203.0.113.10:{30001\|30002\|30003}/salud` | 200 `{"estado":"ok"}` → *En línea*; cualquier otra cosa → *Sin respuesta*. Nunca lanza error; mide ms. |
| `avisos()` (`useAvisos`) | `GET http://203.0.113.10:30001/avisos` | 200 `[{id,titulo,mensaje}]`. No existe `/avisos/{id}`. |
| `talleres()` (`useTalleres`) | `GET http://203.0.113.10:30002/talleres` | 200 `[{id,nombre,horario}]` |
| `taller(id)` (`useTaller`, búsqueda) | `GET http://203.0.113.10:30002/talleres/{id}` | 200 taller · 404 `{"error":"Taller no encontrado","id_solicitado":N}` |
| `inscribir(n)` (`useInscribir`) | `POST http://203.0.113.10:30003/inscripciones` cuerpo `{"matricula":"21580001","nombre":"Luis Pérez","taller_id":2}` | 201 · 400 · 404 · 409 · 503 (abajo) |
| `inscripciones(m)` (`useInscripciones`) | `GET http://203.0.113.10:30003/inscripciones?matricula=21580001` | 200 `[]` o lista de `{id,matricula,nombre,taller_id}`. Con matrícula vacía la app ni llama (devuelve `[]`). |

En la app, la **matrícula** que espera el servidor es el **número de control** de la sesión, normalizado a mayúsculas y sin espacios.

### 6.1 Errores y mensajes al alumno (`src/api/errors.ts`)

| Caso | Origen | Título | Texto | Dónde se ve |
|---|---|---|---|---|
| 201 | Inscripciones | ¡Listo, ya estás inscrito! | Te esperamos en **{taller}**, {horario}. + folio | Pantalla de éxito |
| 400 | Inscripciones (faltan llaves) o validación local | Faltan datos | Revisa tu número de control, tu nombre y el taller, y vuelve a intentarlo. | Banner en Inscribirme |
| 404 (contexto taller/inscripción) | Talleres o Inscripciones | Ese taller no existe | Revisa el número del taller o elige uno de la lista. | Texto bajo el buscador, pantalla de detalle o Banner |
| 409 | Inscripciones (UNIQUE) | Ya estás inscrito | Ya tienes lugar en este taller. Lo ves en *Mis inscripciones*. | Banner + “Ver mis inscripciones” |
| 503 | Inscripciones no pudo hablar con Talleres | Talleres no responde | Algo no salió de nuestro lado. Intenta de nuevo en un momento. | Banner |
| Status 0 (timeout 8 s / sin red) | `fetchJson` | Sin conexión con el campus | No pudimos llegar al servidor. Revisa tu internet e intenta de nuevo. | Estado de error con “Reintentar” |
| Otro 5xx | — | Algo no salió | Ya lo estamos revisando; intenta de nuevo en un momento. | Estado de error |
| Otro 4xx (p. ej. 404 HTML de ruta inexistente) | — | Algo no salió | Intenta de nuevo en un momento. | Estado de error |

Debajo del texto amigable se muestra en letra pequeña el `error` del servidor (`detalle`), útil para la demo.

### 6.2 Reintentos (`src/api/queryClient.ts`)

- Lecturas (GET): **1 reintento con 1 s de espera** en red/5xx, porque un Pod recién recreado puede rechazar conexiones 1–3 s (no hay `readinessProbe`). Nunca se reintenta un 4xx.
- `useTaller` no reintenta 404.
- Inscribirse (POST): **0 reintentos**, para no duplicar la inscripción.
- Sin recarga al volver a la app (`refetchOnWindowFocus: false`); el alumno recarga deslizando hacia abajo.

## 7. Cleartext HTTP en Android

Los servicios se publican con **HTTP sin cifrar**. Desde Android 9, una app release bloquea `http://` por defecto, así que el APK fallaría con “Sin conexión con el campus” aunque en Expo Go todo funcione (Expo Go ya permite cleartext).

Se habilita en `app.json` con el plugin `expo-build-properties`:

```json
["expo-build-properties", { "android": { "usesCleartextTraffic": true } }]
```

Al hacer `prebuild`, esto agrega `android:usesCleartextTraffic="true"` al `AndroidManifest.xml`. **Prueba de aceptación: debe verificarse en el APK instalado, no solo en Expo Go.** Si en el futuro se agrega HTTPS al servidor, este ajuste se puede quitar.

## 8. Cómo correrla (desarrollo con Expo Go)

Requisitos: Node.js 22 y npm, Expo Go (de Play Store) en un Android con internet; o un emulador.

```bash
npm ci
```

```bash
cp .env.example .env
```

Edita `.env` con el host real del VPS y arranca:

```bash
npx expo start -c
```

Escanea el QR con Expo Go (el celular y la computadora en la misma red, o usa `npx expo start --tunnel`). Con `a` se abre en el emulador.

- **No usar la versión web** para probar contra el servidor: los servicios no envían CORS y el navegador bloquea las llamadas.
- Revisiones antes de entregar:

```bash
npx expo lint
```

```bash
npx tsc --noEmit
```

```bash
npx expo-doctor
```

## 9. Cómo generar el APK

### 9.1 Con EAS (nube de Expo)

`eas.json`:

| Perfil | Salida | Variables |
|---|---|---|
| `preview` | **APK** (`buildType: apk`) para instalar directo | `EXPO_PUBLIC_API_HOST` = host del VPS |
| `production` | AAB (`app-bundle`) para Google Play | `EXPO_PUBLIC_API_HOST` = host del VPS |

`appVersionSource: "remote"`: EAS lleva el `versionCode`.

```bash
npx eas-cli@latest login
```

```bash
npx eas-cli@latest build -p android --profile preview
```

Al terminar, EAS da un enlace y un QR para descargar el `.apk`. En el celular hay que permitir “Instalar apps de origen desconocido”.

### 9.2 Con GitHub Actions (sin cuenta de Expo)

`.github/workflows/release.yml` hace `expo prebuild` + `./gradlew assembleRelease` y publica `CampusConectado-<versión>-android.apk` en *Releases*. Se dispara con una etiqueta `v*` o a mano desde *Actions → Release → Run workflow*. El host sale de la variable del repositorio `API_HOST`. La firma con keystore propio es opcional (secrets `ANDROID_KEYSTORE_*`, plugin `plugins/withReleaseSigning.js`); sin keystore se firma con la llave de depuración, suficiente para la demo.

## 10. Decisiones técnicas y diferencias con la práctica original

La práctica original pedía la app en **MIT App Inventor**. Se hizo con **Expo + React Native + TypeScript**:

| Tema | App Inventor | Expo / React Native (elegido) | Por qué |
|---|---|---|---|
| Manejo de errores | Bloques `Web.GotText` con `responseCode`; difícil distinguir timeout y HTML | `ApiError` con status, `detalle` del servidor y status 0 para red/timeout | La rúbrica pide mensajes distintos para 400/404/409/503 y sin conexión |
| Timeout y reintentos | Limitados | Timeout 8 s, 1 reintento en lecturas, 0 en POST | Pods que se reinician en la demo |
| Navegación | Una *Screen* por pantalla, estado global incómodo | Expo Router con pestañas, rutas protegidas y parámetros (`/taller/[id]`, `?taller=`) | Flujo Talleres → Detalle → Inscribirme con el taller preseleccionado |
| Caché | Manual con TinyDB | React Query: cruza `taller_id` con talleres, actualiza *Mis inscripciones* al instante | La API de inscripciones no trae nombre ni horario |
| Código | Bloques visuales, sin control de versiones útil | TypeScript estricto, Git, revisión con `tsc` y ESLint | Trabajo en equipo y bitácora reconstruible con `git log` |
| APK | Exportación manual desde el sitio | EAS (`preview`) o GitHub Actions reproducible | Builds repetibles y con versión |
| Diseño | Componentes limitados | Componentes propios, tipografías, accesibilidad (`accessibilityLabel`) | Mejor experiencia para el alumno |

Contras asumidos: curva de aprendizaje mayor, un APK más pesado y la necesidad de `usesCleartextTraffic` (§7).

Otras decisiones (detalle en `DECISIONES.md`):

1. Rutas en `src/app/` (plantilla de SDK 58).
2. Timeout de 8 s: Inscripciones espera hasta 3 s a Talleres, más margen para redes móviles.
3. Validación en la app antes de enviar: el servidor solo revisa que existan las llaves y acepta `""`.
4. Matrícula = número de control, normalizado a mayúsculas (el servidor distingue `a001` de `A001`).
5. Se quitaron los datos de prueba en la 1.1.0; el 503 ya no se simula desde la app.
6. Login local temporal (no hay servicio de login en el servidor); la contraseña nunca viaja al servidor.
7. Sin cancelar inscripciones ni detalle de avisos: el servidor no los ofrece.

### Diferencias conocidas con el servidor / supuestos

- El nombre DNS interno que usa Inscripciones para llegar a Talleres (en el diagrama, `talleres.equipo3.svc.cluster.local`) y que la base SQLite vive en un PVC del namespace `equipo4` se tomaron de la descripción del despliegue; los confirma el Equipo 4 en su manual.
- Avisos y Talleres son listas fijas en el código del servidor; solo Inscripciones persiste datos.

## 11. Verificación (12 de noviembre de 2026)

Corrida en el repositorio, rama con la versión 1.1.0, después de `npm ci`:

| Revisión | Comando | Resultado |
|---|---|---|
| Tipos | `npx tsc --noEmit` | ✅ Sin errores (código de salida 0) |
| Diagnóstico de Expo | `npx expo-doctor` | ✅ `20/20 checks passed. No issues detected!` |
| Lint | `npx expo lint` | ✅ Sin advertencias ni errores |
| Bundle de Android | `npx expo export -p android` | ✅ Bundle Hermes generado (`entry-….hbc`, 6.9 MB) |
| Capa de datos vs. réplica local del servidor | `docs/entrega/pruebas_automatizadas/` | ✅ 16 de 16 casos como se esperaba (`resultado.txt`) |

Nota: con la versión 1.0.0 (antes de la actualización), `expo-doctor` reportaba 19/20 por 11 paquetes con parche atrasado (`expo 58.0.23` → `58.0.24`, `expo-router 58.0.30` → `58.0.31`, etc.). La 1.1.0 los actualizó y ya pasa 20/20.

Pendiente de verificar en el celular (lo llena el equipo en `Evidencias_pruebas_App.md`): todo el flujo contra el servidor real con el APK, cleartext incluido. Desde el entorno donde se generó este documento no hay salida a los puertos 30001–30003 del VPS.
