# Evidencias de pruebas — App CampusConectado

**Equipo 1 · App e integración** · Versión 1.1.0 · 12 de noviembre de 2026

Matriz de pruebas de aceptación de la app (`docs/Integracion_App_Servidor.md` §6, que sustituye a la sección de pruebas de la especificación original en lo relacionado con el servidor), adaptada al inicio de sesión: la matrícula ya no se escribe, es el **número de control** de la sesión.

> Datos ficticios: `21580001` (cuenta con inscripciones) y `21580099` (cuenta sin inscripciones) son números de control de ejemplo; usa las cuentas de prueba que te dé el equipo. No escribas contraseñas en este documento.

Cómo llenar: **Obtenido** = lo que se vio en el celular (con ✅ o ❌ al inicio). **Captura** = archivo en `docs/entrega/capturas/`. Las capturas compartidas con el manual de usuario llevan el mismo nombre.

## A. Pruebas en el celular contra el servidor real (las llena el equipo)

Requieren el **APK** instalado y el servidor real; desde el entorno donde se escribió este documento no hay salida al VPS, así que **Obtenido** queda vacío.

| # | Prueba | Datos | Esperado | Obtenido | Captura |
|---|---|---|---|---|---|
| 0 | Abrir la app sin sesión | — | Pantalla “Inicia sesión” | | `02_login.png` |
| 0b | Entrar con contraseña incorrecta | No. de control válido + contraseña equivocada | Aviso “Número de control o contraseña incorrectos” y vibración | | `03_login_error.png` |
| 0c | Entrar con la cuenta de prueba (primera vez) | Cuenta de prueba del equipo | Pide “¿Cómo te llamas?” y luego abre Avisos | | `04_nombre.png` |
| 1 | Abrir Avisos | — | Los 3 avisos del servidor (Bienvenida, Inicio de talleres, Inscripciones); el primero destacado | | `05_avisos.png` |
| 2 | Abrir Talleres | — | Los 3 talleres con su horario | | `06_talleres.png` |
| 3 | Buscar taller **1** | Buscador: `1` → “Ver taller #1” | Detalle de “Programación en Python” | | `p03_detalle_taller_1.png` |
| 4 | Buscar taller **999** | Buscador: `999` → “Ver taller #999” | “Ese taller no existe” bajo el campo | | `08_taller_no_existe.png` |
| 5 | Inscribirme al taller 2 | Sesión `21580001`, taller 2 | “¡Listo, ya estás inscrito!” con “Diseño UI/UX Móvil”, Martes y Jueves 14:00 - 16:00, y folio | | `13_inscripcion_exito.png` |
| 6 | Repetir la inscripción | Taller 2 otra vez | El detalle muestra “Ya estás inscrito” y en Inscribirme aparece “Ya inscrito” (no deja enviar). Si llega a enviarse: Banner “Ya estás inscrito” (409) | | `19_ya_inscrito.png` |
| 7 | Taller inexistente al inscribir | Abrir `campusconectado://inscribirme?taller=999` | “No encontramos el taller #999. Elige otro de la lista.” y no deja enviar | | `p07_taller_inexistente.png` |
| 8 | Enviar sin elegir taller | Inscribirme sin taller | Botón “Inscribirme” deshabilitado | | `p08_boton_deshabilitado.png` |
| 9 | Mis inscripciones | Sesión `21580001` | Inscripción del taller 2 con nombre, horario y folio | | `14_mis_inscripciones.png` |
| 10 | Mis inscripciones vacía | Sesión `21580099` (sin inscripciones) | “Aún no tienes inscripciones. ¿Buscamos un taller?” con botón a Talleres | | `15_sin_inscripciones.png` |
| 11 | Sin red | Modo avión → Avisos → deslizar para recargar → quitar modo avión → Reintentar | “Sin conexión con el campus” con Reintentar; al reconectar carga los avisos | | `18_sin_conexion.png`, `p11_reconexion.png` |
| 12 | Estado del servidor | Mi cuenta → Estado del servidor | Los 3 servicios “En línea” con ms | | `17_estado_servidor.png` |
| 13 | Persistencia | El equipo del servidor borra el Pod de inscripciones → Mis inscripciones → recargar | La inscripción del taller 2 sigue apareciendo | | `p13_persistencia.png` |
| 14 | Recuperación | Borran el Pod de avisos → Avisos → Reintentar | Vuelve a cargar en pocos segundos | | `p14_recuperacion.png` |
| 15 | Cleartext en el APK | Probar 1, 2 y 5 en el **APK** (no en Expo Go) | Cargan igual que en Expo Go | | — |
| 16 | Cerrar sesión | Mi cuenta → Cerrar sesión → confirmar | Regresa a “Inicia sesión” | | `p15_cerrar_sesion.png` |

## B. Verificaciones automáticas (hechas al generar la documentación)

Se corrieron en el repositorio el 12 de noviembre de 2026. Las pruebas de la capa de datos usan el código real de `src/api` contra `pruebas_automatizadas/servidor-local.js`, una réplica en `localhost` del contrato del servidor (§2 de la guía) con datos ficticios. **No sustituyen la parte A**: no prueban la interfaz ni la red del celular.

| # | Prueba | Datos | Esperado | Obtenido | Captura |
|---|---|---|---|---|---|
| A1 | Tipos | `npx tsc --noEmit` | Sin errores | ✅ Código de salida 0, sin errores | — |
| A2 | Diagnóstico de Expo | `npx expo-doctor` | Sin problemas | ✅ `20/20 checks passed. No issues detected!` | — |
| A3 | Lint | `npx expo lint` | Sin errores | ✅ Sin errores ni advertencias | — |
| A4 | Bundle de Android | `npx expo export -p android` | Bundle generado | ✅ `entry-….hbc` (6.9 MB) | — |
| A5 | Avisos (P1) | `GET :30001/avisos` | 3 avisos | ✅ Bienvenida, Inicio de talleres, Inscripciones | `pruebas_automatizadas/resultado.txt` |
| A6 | Talleres (P2) | `GET :30002/talleres` | 3 talleres con horario | ✅ #1 Programación en Python, #2 Diseño UI/UX Móvil, #3 Fundamentos de Kubernetes y DevOps, cada uno con horario | ídem |
| A7 | Taller 1 (P3) | `GET :30002/talleres/1` | 200 | ✅ “Programación en Python” | ídem |
| A8 | Taller 999 (P4) | `GET :30002/talleres/999` | 404 → “Ese taller no existe” | ✅ status 404 → “Ese taller no existe”, detalle “Taller no encontrado” | ídem |
| A9 | Inscribir (P5) | `21580001`, Luis Pérez, taller 2 | 201 y mensaje de éxito | ✅ 201 `{id:1,…,taller_id:2}` → “Te esperamos en Diseño UI/UX Móvil, Martes y Jueves 14:00 - 16:00.” | ídem |
| A10 | Repetir (P6) | Mismos datos | 409 → “Ya estás inscrito” | ✅ status 409 → “Ya estás inscrito”, detalle “El alumno ya se encuentra inscrito en este taller” | ídem |
| A11 | Taller 999 al inscribir (P7) | taller 999 | 404 → “Ese taller no existe” | ✅ status 404 → “Ese taller no existe”, detalle “El taller especificado no existe” | ídem |
| A12 | Cuerpo sin llaves | `POST {}` | 400 → “Faltan datos” | ✅ status 400 → “Faltan datos”, detalle “Faltan campos obligatorios” | ídem |
| A13 | Mis inscripciones (P9) | `?matricula=21580001` | Lista con el taller 2 | ✅ `[{id:1, matricula:"21580001", taller_id:2}]` | ídem |
| A14 | Mis inscripciones vacía (P10) | `?matricula=99999999` | `[]` | ✅ `[]` | ídem |
| A15 | Salud (P12) | `GET /salud` ×3 | Los 3 en línea con ms | ✅ avisos, talleres e inscripciones “En línea” (1–2 ms en local) | ídem |
| A16 | Talleres caído | Se apaga Talleres y se intenta inscribir | 503 → “Talleres no responde” | ✅ status 503 → “Talleres no responde”, detalle “El servicio de talleres no está disponible”; Estado marca Talleres “Sin respuesta” | ídem |
| A17 | Ruta inexistente con HTML | `GET :30001/avisos/1` | No truena; mensaje genérico | ✅ status 404 → “Algo no salió” (sin detalle, el HTML se ignora) | ídem |
| A18 | Timeout | Servidor tarda 10 s | Corta a los 8 s → “Sin conexión con el campus” | ✅ status 0 a los 8002 ms → “Sin conexión con el campus” | ídem |
| A19 | Sin red | Puerto sin servicio | “Sin conexión con el campus” | ✅ status 0 → “Sin conexión con el campus” | ídem |
| A20 | Inicio de sesión local | Cuenta de prueba de `src/auth/cuentas.ts`, con espacios y en minúsculas / contraseña equivocada | Acepta la correcta normalizada; rechaza la equivocada | ✅ `{ok:true}` / `{ok:false, motivo:"credenciales"}` | — |

Resumen: **20 de 20** verificaciones automáticas como se esperaba. Pendientes: las **17** pruebas de la parte A en el celular.
