# CampusConectado

App Android para alumnos del TecNM Campus Reynosa. Aquí puedes ver los **avisos** del campus, consultar los **talleres**, **inscribirte** y revisar **mis inscripciones**.

Hecha por **Ravyn Studio** · Equipo 1 · App e integración.

## Qué hace

- **Avisos:** lista de avisos del campus, con recarga al deslizar hacia abajo.
- **Talleres:** lista de talleres con horario, búsqueda por número y detalle de cada taller.
- **Inscribirme:** formulario con matrícula, nombre y taller. Recuerda tu matrícula y tu nombre en el teléfono.
- **Mis inscripciones:** consulta tus inscripciones por matrícula.
- **Estado del servidor (oculto):** mantén presionado el logo de Avisos o toca el ícono de actividad en el encabezado. Muestra el estado de los tres servicios, el modo de datos y, en modo de prueba, simulaciones de fallas.

## Stack

- Expo SDK 58 y React Native (0.88), con TypeScript estricto
- Expo Router para la navegación (rutas en `src/app/`)
- TanStack Query para datos remotos
- AsyncStorage para la matrícula y el nombre guardados, y para las inscripciones de prueba
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

Se definen en `.env` (copiado desde `.env.example`). Las variables que empiezan con `EXPO_PUBLIC_` se incluyen en la app al compilarla.

| Variable | Valor de ejemplo | Para qué sirve |
|---|---|---|
| `EXPO_PUBLIC_USE_MOCKS` | `true` | `true` = toda la app con datos de prueba. `false` = servidor real. |
| `EXPO_PUBLIC_API_HOST` | `http://2.24.29.189` | Host del VPS, sin puerto ni `/` final. |
| `EXPO_PUBLIC_PORT_AVISOS` | `30001` | Puerto del servicio Avisos. |
| `EXPO_PUBLIC_PORT_TALLERES` | `30002` | Puerto del servicio Talleres. |
| `EXPO_PUBLIC_PORT_INSCRIPCIONES` | `30003` | Puerto del servicio Inscripciones. |
| `EXPO_PUBLIC_MOCK_SERVICES` | `talleres` | Con `USE_MOCKS=false`, servicios que siguen con datos de prueba, separados por coma. |

## Modos de datos

### Datos de prueba

`EXPO_PUBLIC_USE_MOCKS=true`. Todo es falso y no se necesita conexión al servidor. En la pantalla *Estado del servidor* puedes simular fallas: "Talleres no responde" (503), "Sin red" y "Latencia alta" (3 s).

### Servidor real

`EXPO_PUBLIC_USE_MOCKS=false`, con host `2.24.29.189`. Avisos (`:30001`) e Inscripciones (`:30003`) son reales.

Talleres (Equipo 3) todavía no está desplegado, así que se deja en datos de prueba con `EXPO_PUBLIC_MOCK_SERVICES=talleres`.

> **Aviso:** mientras Talleres sea falso y el servidor sea real, inscribirse devuelve **503** ("Talleres no responde"). Esto se corrige cuando el Equipo 3 despliegue Talleres y el Equipo 4 ajuste `TALLERES_URL`.

### Cómo cambiar a servidor real

1. Pon `EXPO_PUBLIC_USE_MOCKS=false` en `.env`.
2. Cuando Talleres esté arriba, quita `talleres` de `EXPO_PUBLIC_MOCK_SERVICES`; déjalo vacío o bórralo.
3. Reinicia Expo con `npx expo start -c` para que tome los cambios.
4. Abre *Estado del servidor* y verifica que los tres servicios estén "En línea" y sin etiqueta "Datos de prueba".
5. Si Talleres responde con un formato distinto al supuesto, ajusta solo `src/api/real.ts`, `src/types` y `src/api/errors.ts`.

## Builds con EAS

Los perfiles están en `eas.json`.

```bash
npx eas-cli@latest build -p android --profile preview
```

APK con datos de prueba (`USE_MOCKS=true`).

```bash
npx eas-cli@latest build -p android --profile real
```

APK apuntando al servidor real (`USE_MOCKS=false`, `MOCK_SERVICES=talleres`). Es el que usamos para la demo.

```bash
npx eas-cli@latest build -p android --profile production
```

AAB para Google Play.

El tráfico HTTP plano (`http://`) se habilita con `usesCleartextTraffic` mediante `expo-build-properties`. **Esto debe probarse en el APK, no solo en Expo Go.**

## Estructura de carpetas

```
src/
├── app/          Rutas (Expo Router): (tabs)/, taller/[id].tsx, estado.tsx
├── api/          Cliente de servicios, errores y flags de simulación
│   └── mock/     Datos y respuestas de prueba
├── hooks/        Hooks de TanStack Query
├── components/   Componentes compartidos
├── theme/        Colores, espacios, tipografías y textos
├── storage/      Matrícula y nombre guardados en el teléfono
└── types/        Tipos de la API
```

## Matriz de pruebas

Pruebas manuales en modo de datos de prueba, salvo que se indique lo contrario.

| # | Prueba | Resultado esperado | Resultado |
|---|---|---|---|
| 1 | Abrir Avisos | Se muestran al menos 3 avisos | ✅ Pasa (web, datos de prueba) |
| 2 | Abrir Talleres | Se muestran al menos 3 talleres, cada uno con horario | ✅ Pasa (web, datos de prueba) |
| 3 | Buscar taller `1` | Abre el detalle del taller 1 | ✅ Pasa (web, datos de prueba) |
| 4 | Buscar taller `99` | Aparece "Ese taller no existe" | ✅ Pasa (web, datos de prueba) |
| 5 | Inscribir matrícula `A001`, nombre `Ana`, taller `2` | Mensaje de éxito | ✅ Pasa (web, datos de prueba) |
| 6 | Repetir la inscripción de la prueba 5 | Aparece "Ya estás inscrito" | ✅ Pasa (web, datos de prueba) |
| 7 | Tocar "Enviar sin validar (prueba)" con el formulario vacío | Aparece "Faltan datos" | ✅ Pasa (web, datos de prueba) |
| 8 | Inscribirme con taller `99` (escrito a mano) | Aparece "Ese taller no existe" | ✅ Pasa (web, datos de prueba) |
| 9 | En *Estado del servidor*, activar "Talleres no responde" e inscribirse | Error 503 con "Talleres no responde" | ✅ Pasa (web, datos de prueba) |
| 10 | Mis inscripciones con matrícula `A001` | Lista con nombre del taller y horario | ✅ Pasa (web, datos de prueba) |
| 11 | En *Estado del servidor*, activar "Sin red" e intentar consultar | "Sin conexión con el campus" y botón Reintentar | ✅ Pasa (web, datos de prueba) |
| 12 | Abrir *Estado del servidor* | Tres servicios con estado y tiempo de respuesta en ms | ✅ Pasa (web, datos de prueba) |
| 13 | Cerrar y volver a abrir la app | Matrícula y nombre precargados | ✅ Pasa (web, datos de prueba) |

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

El workflow `Release` compila dos APK y los publica en la página de Releases. También puedes lanzarlo a mano desde la pestaña Actions (`workflow_dispatch`); en ese caso solo se generan los APK como artefactos, sin publicar release. Si la etiqueta lleva guion (por ejemplo `v1.0.0-rc1`), el release se marca como prerelease.

### Los dos APK

- `CampusConectado-X-pruebas.apk`: datos de prueba, ideal para demo sin servidor.
- `CampusConectado-X-servidor.apk`: conectado a Avisos e Inscripciones reales; Talleres sigue con datos de prueba hasta que el Equipo 3 lo publique.

### Firma (opcional)

En *Settings > Secrets and variables > Actions* puedes definir:

- Secrets: `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.
- Variables: `API_HOST` (por defecto `http://2.24.29.189`) y `MOCK_SERVICES` (por defecto `talleres`).

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
