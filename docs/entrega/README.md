# CampusConectado — App (Equipo 1)

App Android para alumnos del TecNM Campus Reynosa: inicias sesión con tu número de control, ves los **avisos** del campus, consultas los **talleres**, te **inscribes** y revisas **mis inscripciones**. Consume tres microservicios Flask (Avisos, Talleres e Inscripciones) desplegados en K3s por los equipos 2, 3 y 4.

Versión **1.1.0** · Expo SDK 58 · React Native 0.88 · TypeScript · Hecha por Ravyn Studio.

> En esta carpeta los datos son ficticios: la IP del VPS aparece como `203.0.113.10` (rango de documentación) y los números de control son de ejemplo.

## Documentos de esta entrega

| Documento | Contenido |
|---|---|
| [`Manual_tecnico_App.md`](Manual_tecnico_App.md) | Stack, arquitectura, consumo de servicios, errores, cleartext, APK, decisiones y verificación |
| [`Manual_de_usuario.md`](Manual_de_usuario.md) | Guía para el alumno y lista de capturas |
| [`Bitacora_de_desarrollo.md`](Bitacora_de_desarrollo.md) | Historial reconstruido con `git log` |
| [`Evidencias_pruebas_App.md`](Evidencias_pruebas_App.md) | Matriz de pruebas (celular + automáticas) |
| `Diagrama_arquitectura.{mmd,svg,png}` | App → IP pública → NodePorts → Services → Pods → PVC |
| `Diagrama_flujo_app.{mmd,svg,png}` | Navegación entre pantallas |
| `Diagrama_secuencia_inscripcion.{mmd,svg,png}` | Registrar inscripción: 201/400/404/409/503 |
| [`pruebas_automatizadas/`](pruebas_automatizadas/README.md) | Pruebas de la capa de datos contra una réplica local del servidor |
| `capturas/` | Capturas tomadas desde el celular |

## Requisitos

- Node.js 22 y npm 10.
- Para probar: un Android con **Expo Go** o un emulador.
- Para el APK: cuenta de Expo (EAS) o GitHub Actions del repositorio.
- Conexión a internet con salida a los puertos 30001–30003 del VPS.

## Instalación

Desde la raíz del repositorio:

```bash
npm ci
```

```bash
cp .env.example .env
```

Para agregar paquetes usa siempre `npx expo install <paquete>` (elige la versión compatible con el SDK).

## Variables

En `.env` (se incrustan en la app al compilar; no pongas secretos):

| Variable | Ejemplo | Para qué |
|---|---|---|
| `EXPO_PUBLIC_API_HOST` | `http://203.0.113.10` | Host del VPS, sin puerto ni `/` final |
| `EXPO_PUBLIC_PORT_AVISOS` | `30001` | Puerto de Avisos |
| `EXPO_PUBLIC_PORT_TALLERES` | `30002` | Puerto de Talleres |
| `EXPO_PUBLIC_PORT_INSCRIPCIONES` | `30003` | Puerto de Inscripciones |

Si cambias una variable, reinicia con caché limpia (`npx expo start -c`).

## Ejecución

```bash
npx expo start -c
```

Escanea el QR con Expo Go. No uses la versión web para probar contra el servidor: los servicios no tienen CORS.

Revisiones antes de entregar:

```bash
npx expo lint
```

```bash
npx tsc --noEmit
```

```bash
npx expo-doctor
```

## APK

Con EAS (perfil `preview` de `eas.json`, genera un `.apk`):

```bash
npx eas-cli@latest build -p android --profile preview
```

El perfil `production` genera un AAB para Google Play. También se puede compilar sin cuenta de Expo con GitHub Actions: crea y sube una etiqueta `v*` y el workflow *Release* publica `CampusConectado-<versión>-android.apk`.

El HTTP sin cifrar se permite con `expo-build-properties` → `android.usesCleartextTraffic: true` (en `app.json`). **Pruébalo en el APK**, no solo en Expo Go.

## Estructura

```
src/
├── app/          Rutas (Expo Router): login, (tabs)/, taller/[id], perfil, estado
├── api/          fetchJson, servicios, errores y QueryClient
├── hooks/        Hooks de React Query
├── auth/         Sesión del alumno
├── components/   Componentes compartidos
├── theme/        Colores, espacios y tipografía
├── types/        Tipos del contrato de la API
└── config.ts     Variables EXPO_PUBLIC_* y URLs
```

Más detalle en el [manual técnico](Manual_tecnico_App.md).
