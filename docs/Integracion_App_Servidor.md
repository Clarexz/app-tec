# CampusConectado — Guía de integración app ↔ servidor

> **Para Claude Code (repo de la app).** Este documento complementa `CampusConectado_App_Spec.md` y **tiene prioridad sobre él** en todo lo relacionado con la API. Todo lo de aquí se verificó contra el servidor real el **12 de noviembre de 2026**: 13 de 13 pruebas pasaron. Tu objetivo es conectar la app al servidor real, ajustar lo que no coincida, verificar cada flujo y dejar un APK funcional. **No modifiques nada del servidor:** si algo del servidor está mal, documéntalo y avísame.

---

## 1. Datos de conexión

| Servicio | Equipo | Base URL | Namespace K8s |
|---|---|---|---|
| Avisos | 2 | `http://2.24.29.189:30001` | `equipo2` |
| Talleres | 3 | `http://2.24.29.189:30002` | `equipo3` |
| Inscripciones | 4 | `http://2.24.29.189:30003` | `equipo4` |

`.env` para el modo real:

```bash
EXPO_PUBLIC_USE_MOCKS=false
EXPO_PUBLIC_API_HOST=http://2.24.29.189
EXPO_PUBLIC_PORT_AVISOS=30001
EXPO_PUBLIC_PORT_TALLERES=30002
EXPO_PUBLIC_PORT_INSCRIPCIONES=30003
```

Características del servidor:
- 3 servicios Flask (Python 3.12) en contenedores Docker, orquestados con K3s (un solo nodo) en un VPS Hostinger con Ubuntu 24.04.
- **HTTP sin cifrar, sin autenticación y sin CORS.**
- Todas las respuestas válidas son JSON con `Content-Type: application/json`.
- El firewall del VPS permite los puertos 30001–30003 desde Internet.

---

## 2. Contrato real de la API

### 2.1 Avisos (`:30001`)

| Método | Ruta | Respuesta |
|---|---|---|
| GET | `/salud` | `200 {"estado":"ok"}` |
| GET | `/avisos` | `200` arreglo de avisos |

Respuesta real de `GET /avisos`:

```json
[
  {"id": 1, "titulo": "Bienvenida", "mensaje": "Bienvenidos a CampusConectado."},
  {"id": 2, "titulo": "Inicio de talleres", "mensaje": "Consulta los horarios de los talleres disponibles."},
  {"id": 3, "titulo": "Inscripciones", "mensaje": "Ya puedes consultar la informacion de los talleres."}
]
```

- `id` es un número. No existe `GET /avisos/{id}`: Flask responde 404 con **HTML**, no JSON.
- Los avisos son una lista fija en el código del servidor (siempre son estos 3).

### 2.2 Talleres (`:30002`)

| Método | Ruta | Respuesta |
|---|---|---|
| GET | `/salud` | `200 {"estado":"ok"}` |
| GET | `/talleres` | `200` arreglo de talleres |
| GET | `/talleres/{id}` | `200` taller · `404` JSON si no existe |

Catálogo real (fijo en el código, **solo 3 talleres, ids 1 a 3**):

```json
[
  {"id": 1, "nombre": "Programación en Python", "horario": "Lunes y Miércoles 10:00 - 12:00"},
  {"id": 2, "nombre": "Diseño UI/UX Móvil", "horario": "Martes y Jueves 14:00 - 16:00"},
  {"id": 3, "nombre": "Fundamentos de Kubernetes y DevOps", "horario": "Viernes 08:00 - 12:00"}
]
```

`GET /talleres/999` → `404`:

```json
{"error": "Taller no encontrado", "id_solicitado": 999}
```

Si el id no es entero (por ejemplo `/talleres/abc`), Flask responde 404 con **HTML**. La app debe enviar siempre un entero válido; valida antes de llamar.

### 2.3 Inscripciones (`:30003`)

| Método | Ruta | Respuesta |
|---|---|---|
| GET | `/salud` | `200 {"estado":"ok"}` |
| POST | `/inscripciones` | `201` / `400` / `404` / `409` / `503` |
| GET | `/inscripciones?matricula=XXX` | `200` arreglo (`[]` si no hay) · `400` sin parámetro |

**POST `/inscripciones`.** Requiere el header `Content-Type: application/json`; sin él, el servidor no lee el cuerpo y responde 400. Body:

```json
{"matricula": "B003", "nombre": "Ana", "taller_id": 1}
```

| Código | Cuándo | Cuerpo real |
|---|---|---|
| 201 | Creada | `{"id":5,"matricula":"B003","nombre":"Ana","taller_id":1}` |
| 400 | Falta alguna llave o el cuerpo no es JSON | `{"error":"Faltan campos obligatorios"}` |
| 404 | El taller no existe (Inscripciones se lo pregunta a Talleres) | `{"error":"El taller especificado no existe"}` |
| 409 | Ya existe esa matrícula en ese taller (UNIQUE) | `{"error":"El alumno ya se encuentra inscrito en este taller"}` |
| 503 | Talleres no responde en 3 s | `{"error":"El servicio de talleres no está disponible"}` |
| 503 | Talleres responde algo distinto de 200 o 404 | `{"error":"Error al comunicarse con el servicio de talleres"}` |

**GET `/inscripciones?matricula=B003`** → 200:

```json
[{"id": 5, "matricula": "B003", "nombre": "Ana", "taller_id": 1}]
```

- Sin el parámetro → `400 {"error":"Se requiere el parámetro matricula"}`.
- La respuesta **no incluye el nombre ni el horario del taller**, solo `taller_id`. La app debe cruzarlo con `GET /talleres`.

### 2.4 Formato de error (confirmado)

Todos los errores de la API son `{"error": "<mensaje>"}`. El 404 de Talleres trae además `id_solicitado`. Los errores de **ruta inexistente o método incorrecto (404/405)** son HTML de Flask, así que el wrapper HTTP no debe romperse si el cuerpo no es JSON.

---

## 3. Comportamientos del servidor que la app debe compensar

| # | Comportamiento real | Qué debe hacer la app |
|---|---|---|
| 1 | El servidor **solo revisa que existan las llaves**; acepta `""` y espacios. Un `{"matricula":"","nombre":"","taller_id":1}` se guardaría. | Validar en la app: `trim()`, no vacío, y matrícula en mayúsculas. No enviar si no pasa. |
| 2 | La matrícula distingue mayúsculas: `a001` ≠ `A001`. | Normalizar a mayúsculas, tanto al inscribir como al consultar. |
| 3 | `taller_id` debe ser numérico; un texto termina en 404 o en 503. | Enviar un `number` entero (`Number.parseInt`) y validarlo antes de enviar. |
| 4 | Solo existen los talleres 1, 2 y 3. | Los mocks deben reflejar los 3 talleres reales (§2.2) para que la demo en ambos modos se vea igual. |
| 5 | Mis inscripciones solo trae `taller_id`. | Unir con la caché de `/talleres`; si no se encuentra, mostrar "Taller #id". |
| 6 | Errores 404/405 de rutas vienen en HTML. | `http.ts` intenta `JSON.parse` y, si falla, usa el mensaje por código. |
| 7 | No hay `readinessProbe`: si se borra un Pod (prueba de la demo), el servicio puede rechazar conexiones 1–3 s. | `retry: 1` en los GET con 1 s de espera; el botón Reintentar siempre visible en los errores. |
| 8 | Inscripciones tarda hasta ~3 s en dar 503 si Talleres no responde. | El timeout de la app (8 s) es suficiente; mantener el spinner con texto "Registrando…". |
| 9 | Sin CORS: `expo start --web` **no** podrá llamar al servidor desde el navegador. | Probar en Expo Go o en el APK, no en la web. No intentes "arreglar" CORS. |
| 10 | HTTP plano. | `expo-build-properties` con `android.usesCleartextTraffic: true` (ya en la spec). Sin esto, el APK release falla aunque Expo Go funcione. |
| 11 | La base de datos ya tiene registros de prueba (`A001`, `B002`, `B003`). | Para la demo, usar una matrícula nueva (por ejemplo `C010`) o mostrar las existentes. |
| 12 | No hay forma de cancelar inscripciones. | No agregar esa función. |

---

## 4. Mensajes al usuario (actualizados al servidor real)

| Caso | Título | Texto |
|---|---|---|
| 201 | ¡Listo, ya estás inscrito! | Te esperamos en **{nombre del taller}**, {horario}. |
| 400 | Faltan datos | Revisa tu matrícula, tu nombre y el taller, y vuelve a intentarlo. |
| 404 al inscribir / al buscar taller | Ese taller no existe | Revisa el número del taller o elige uno de la lista. |
| 409 | Ya estás inscrito | Ya tienes lugar en este taller. Lo ves en *Mis inscripciones*. |
| 503 | Talleres no responde | Algo no salió de nuestro lado. Intenta de nuevo en un momento. |
| Red / timeout (status 0) | Sin conexión con el campus | No pudimos llegar al servidor. Revisa tu internet e intenta de nuevo. |
| Otro 5xx | Algo no salió | Ya lo estamos revisando; intenta de nuevo en un momento. |

Debajo del texto amigable, muestra en letra pequeña el campo `error` que manda el servidor (útil para explicar en la demo).

---

## 5. Tareas de integración (en orden)

1. **Revisar el estado actual.** Lee el código y compara `types/api.ts`, `api/real.ts`, `api/errors.ts`, `api/http.ts` y los mocks contra §2–§4. Haz una lista de diferencias antes de cambiar nada.
2. **Verificar la conectividad desde esta máquina:**
   ```bash
   curl -i -m 10 http://2.24.29.189:30001/salud
   curl -i -m 10 http://2.24.29.189:30002/talleres
   curl -i -m 10 http://2.24.29.189:30003/salud
   ```
   Si algo falla aquí, es la red o el servidor, no la app: detente y avísame.
3. **Ajustar tipos y servicios** (`types/api.ts`, `real.ts`, `errors.ts`, `http.ts`) a lo que se describe aquí. Las pantallas no deberían necesitar cambios. Si los necesitan, anótalo en `DECISIONES.md`.
4. **Ajustar los mocks**: los mismos 3 avisos y 3 talleres reales, y los mismos mensajes de error del servidor, para que ambos modos se comporten igual.
5. **Validación en el formulario**: §3 filas 1–3.
6. **Configurar `.env`** con §1, `EXPO_PUBLIC_USE_MOCKS=false`, y revisar la pantalla **Estado del servidor**: los 3 servicios deben aparecer en verde con su tiempo de respuesta.
7. **Probar de punta a punta en un celular** con Expo Go (§6).
8. **Build del APK**: perfil `preview` con `EXPO_PUBLIC_USE_MOCKS=false` y el host real (en `eas.json` → `env`, o en las variables de EAS). Instálalo y repite §6 en el APK; es la prueba que cuenta para la entrega.
9. **Documentar**: actualiza el README (cómo cambiar entre modo real y modo de prueba) y `DECISIONES.md`, y genera `docs/entrega/Evidencias_pruebas_App.md` con la tabla de §6 llena.
10. `npx tsc --noEmit` y `npx expo-doctor` sin errores.

---

## 6. Pruebas de aceptación (desde la app, contra el servidor real)

Usa una matrícula nueva, por ejemplo `C010`, para que la primera inscripción dé 201.

| # | Acción en la app | Esperado |
|---|---|---|
| 1 | Abrir la app → Avisos | Los 3 avisos reales (Bienvenida, Inicio de talleres, Inscripciones) |
| 2 | Talleres | Los 3 talleres reales con su horario |
| 3 | Buscar taller **1** | Abre el detalle de "Programación en Python" |
| 4 | Buscar taller **999** | "Ese taller no existe" |
| 5 | Inscribir **C010 · Luis · taller 2** | Pantalla de éxito con "Diseño UI/UX Móvil", Martes y Jueves 14:00 - 16:00 |
| 6 | Repetir la misma inscripción | "Ya estás inscrito" (409) |
| 7 | Inscribirse a un taller inexistente (escribiendo el número 999) | "Ese taller no existe" (404 desde Inscripciones) |
| 8 | Intentar enviar con campos vacíos | La app lo bloquea antes de enviar (botón deshabilitado o error en el campo) |
| 9 | Mis inscripciones → **c010** (en minúsculas) | Muestra la inscripción del taller 2 con nombre y horario, porque la app normaliza a mayúsculas |
| 10 | Mis inscripciones → **Z999** | Estado vacío con botón a Talleres |
| 11 | Modo avión → Avisos → Reintentar | "Sin conexión con el campus" y, al reconectar, Reintentar carga los datos |
| 12 | Estado del servidor | Los 3 servicios en verde con ms |
| 13 | Persistencia (lo hace el equipo del servidor borrando el Pod de inscripciones) → Mis inscripciones C010 | La inscripción sigue apareciendo |
| 14 | Recuperación (borran el Pod de avisos) → Avisos → Reintentar | Vuelve a cargar en pocos segundos |

Para el 503 no hace falta tumbar Talleres: ya está probado del lado del servidor. En la app basta con el modo mock y su interruptor de simulación.

Registra para cada prueba: datos usados, esperado, obtenido, ✅/❌ y nombre de la captura (`capturas/NN_descripcion.png`). Las capturas las toma una persona desde el celular.

---

## 7. Fuera de alcance de esta integración

- Cambiar el servidor, los YAML o los datos de la base de datos.
- Agregar autenticación, HTTPS o CORS.
- Cancelar inscripciones o controlar el cupo.
- Versión web o iOS.

---

## 8. Entregable esperado

Al terminar, dame:

1. Lista de cambios hechos (archivos y motivo).
2. Tabla §6 con resultados.
3. Ruta del APK o link de EAS.
4. Diferencias encontradas entre este documento y el servidor real (si hubo).
5. Lista de capturas que hay que tomar para el manual de usuario.
