# Bitácora de desarrollo — App CampusConectado

**Equipo 1 · App e integración**

## Cómo se reconstruyó

No se tomaron capturas del avance, así que esta bitácora se armó con el historial de Git del repositorio:

```bash
git log --reverse --format='%h | %ad | %s' --date=format:'%Y-%m-%d %H:%M' --name-status
```

Las horas son UTC (en Reynosa, restar 6 h). **Advertencia de lectura:** los commits se subieron en bloques al cerrar cada jornada, con minutos de diferencia entre sí; por eso las horas marcan **cuándo se registró cada avance**, no cuánto duró el trabajo. Lo que se hizo en cada commit sale de los archivos que cambió y de su mensaje.

Ramas y etiquetas: el trabajo vive en ramas `claude/*`. La etiqueta `v1.0.0` marca el cierre de la primera fase; la versión `1.1.0` está en `app.json` de la segunda.

## Resumen por fases

| Fase | Fecha | Commits | Resultado |
|---|---|---|---|
| 1. Base del proyecto | 2026-11-06 | `422eeee` | Proyecto Expo SDK 58 con Expo Router, TypeScript, tema de marca y contrato de módulos |
| 2. Capa de datos y pantallas | 2026-11-06 | `81e7e7b`, `def5454`, `00b6d3c` | Cliente HTTP, errores, mocks, hooks, componentes y las 6 pantallas |
| 3. QA, CI y releases | 2026-11-06 | `f85b408`, `b17a784`, `6ec487c`, `64a078b`, `10e7e5a` | Matriz de 13 pruebas en modo de prueba, GitHub Actions, APK → **v1.0.0** |
| 4. Sesión y servidor real | 2026-11-12 | `f40cc8a`, `5aab2ce`, `b4a01ae`, `9b140a6`, `2645fe6`, `daddb1d` | Login, rutas protegidas, fin de los datos de prueba, ESLint |
| 5. Integración con el servidor | 2026-11-12 | `85ef808` | Ajustes según la guía de integración, evidencias → **v1.1.0** |
| 6. Documentación de entrega | 2026-11-12 | (este commit) | Manuales, diagramas, evidencias y bitácora en `docs/entrega/` |

## Detalle por commit

### Fase 1 — Base del proyecto (6 de noviembre)

| Hora (UTC) | Commit | Qué se hizo |
|---|---|---|
| 15:53 | `422eeee` Base del proyecto Expo de CampusConectado | Plantilla Expo SDK 58 con Expo Router y TypeScript estricto; `package.json` con dependencias; `app.json` (paquete `mx.ravynstudio.campusconectado`, splash, ícono adaptativo); `eas.json`; tema (`src/theme`: colores, espacios, tipografía); tipos del contrato (`src/types/api.ts`); `docs/ESPECIFICACION.md` y `CONTRATO.md` para repartir el trabajo en paralelo. 27 archivos. |

### Fase 2 — Capa de datos, componentes y pantallas (6 de noviembre)

| Hora (UTC) | Commit | Qué se hizo |
|---|---|---|
| 15:54 | `81e7e7b` Avance: documentación y módulos | Capa `src/api` completa: `http.ts` (timeout, `ApiError`), `errors.ts` (mensajes por código), `real.ts`, `mock/` (datos y simulación de 503, sin red y latencia), `queryClient.ts`; hooks de React Query; 14 componentes (`Button`, `Card`, `Banner`, `TallerPicker`, `StateView`…); pantallas de pestañas, detalle de taller y Estado del servidor; `README.md` y `DECISIONES.md`. |
| 15:54 | `def5454` Capa de datos, componentes base y pantallas | Ajustes a errores, configuración y `TextField`; formulario de Inscribirme y Mis inscripciones. |
| 15:55 | `00b6d3c` Avance de pantallas Avisos y Talleres | Avisos (aviso destacado, recarga) y Talleres (búsqueda por número, lista). |

### Fase 3 — QA, CI y releases (6 de noviembre)

| Hora (UTC) | Commit | Qué se hizo |
|---|---|---|
| 15:59 | `f85b408` Avance: QA y pipeline de releases | Ajustes a la barra de pestañas tras revisión. |
| 16:01 | `b17a784` CI y releases con GitHub Actions | `ci.yml` (tsc, expo-doctor, bundle Android en cada push); `release.yml` (APK con Gradle al crear etiqueta `v*`); `app.config.ts` y plugin `withReleaseSigning` para versión y firma. |
| 16:05 | `6ec487c` Ajustes de pestañas tras QA y matriz de pruebas | Etiqueta corta “Inscripciones” para que no se corte a 360 dp; barra más alta; matriz de 13 pruebas pasada en modo de datos de prueba. |
| 16:06 | `64a078b` Release: opción manual | Publicar release desde *Actions → Run workflow*. |
| 16:13 | `10e7e5a` Release: SDK de Android del runner | Se corrigió la compilación en CI usando el SDK preinstalado. **Etiqueta `v1.0.0`.** |

En esta fase Talleres (Equipo 3) aún no estaba desplegado, por eso la app tenía un modo mixto: Avisos e Inscripciones reales y Talleres con datos de prueba.

### Fase 4 — Sesión de alumno y servidor real (12 de noviembre)

| Hora (UTC) | Commit | Qué se hizo |
|---|---|---|
| 15:59 | `f40cc8a` Sesión, rutas protegidas y fin de los datos de prueba | Se eliminó `src/api/mock/`; nuevo `src/auth` (sesión en AsyncStorage, validación local temporal); pantallas `login.tsx` y `perfil.tsx`; `Stack.Protected` en `_layout.tsx`. |
| 16:01 | `5aab2ce` Docs, EAS y release sin modos de prueba | `.env.example`, `eas.json` y `release.yml` sin `USE_MOCKS`/`MOCK_SERVICES`; un solo APK. |
| 16:04 | `b4a01ae` Inscribirme, Mis inscripciones y Estado | Inscribirme usa el No. de control de la sesión; `TallerPicker` con búsqueda y talleres ya inscritos deshabilitados; Mis inscripciones carga sola; Estado con resumen y hora de revisión. |
| 16:04 | `9b140a6` Avisos, Talleres y detalle pulidos | Saludo con el nombre, avatar a Mi cuenta, búsqueda por número o nombre, insignia “Inscrito”, detalle con “Ya estás inscrito”. |
| 16:09 | `2645fe6` Login, Mi cuenta y captura de nombre | `NombreGate` (“¿Cómo te llamas?”), ESLint (`eslint.config.js`), parches del SDK 58 (`expo 58.0.24`, `expo-router 58.0.31`…), docs al día. |
| 16:09 | `daddb1d` CI: correr lint | `npx expo lint` en CI; script `typecheck`. |

### Fase 5 — Integración con el servidor (12 de noviembre)

| Hora (UTC) | Commit | Qué se hizo |
|---|---|---|
| 16:23 | `85ef808` Integración con el servidor real; v1.1.0 | Con la guía `docs/Integracion_App_Servidor.md`: validación antes de enviar (el servidor acepta campos vacíos), 1 s de espera antes de reintentar lecturas (Pods reiniciándose), texto “Registrando…”, primera tabla de evidencias. Versión **1.1.0**. |

### Fase 6 — Documentación de entrega (12 de noviembre)

- `docs/entrega/`: manual técnico, manual de usuario, esta bitácora, evidencias de pruebas, README y tres diagramas (arquitectura, flujo de la app y secuencia de inscripción) en `.mmd`, `.svg` y `.png`.
- Pruebas automatizadas de la capa de datos contra una réplica local del servidor (`pruebas_automatizadas/`).
- Verificación: `tsc` sin errores, `expo-doctor` 20/20, `expo lint` limpio, bundle de Android generado.

## Lecciones

- Separar la capa `api` detrás de una interfaz permitió trabajar con datos de prueba mientras Talleres no existía y cambiar al servidor real sin tocar pantallas.
- El cleartext HTTP solo falla en el APK release; hay que probar en el APK, no solo en Expo Go.
- Conviene subir commits más pequeños y frecuentes, y tomar capturas en cada fase para no depender de reconstrucciones como esta.
