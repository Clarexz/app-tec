# Evidencias de pruebas — App CampusConectado

Pruebas de aceptación de `docs/Integracion_App_Servidor.md` §6, adaptadas al inicio de sesión: la matrícula ya no se escribe a mano, es el **número de control** de la sesión (se manda en mayúsculas como `matricula`).

Cuenta de prueba: No. de control `22580076`, contraseña `MACB`. APK: release `v1.1.0` en GitHub (`CampusConectado-1.1.0-android.apk`).

Llena **Obtenido**, **✅/❌** y **Captura** al probar en el celular con el APK.

| # | Acción en la app | Datos | Esperado | Obtenido | ✅/❌ | Captura |
|---|---|---|---|---|---|---|
| 0 | Abrir la app sin sesión | — | Pantalla "Inicia sesión" | | | `capturas/00_login.png` |
| 0b | Entrar con contraseña incorrecta | 22580076 / ABCD | "Número de control o contraseña incorrectos" | | | `capturas/00b_login_error.png` |
| 0c | Entrar con la cuenta de prueba (primera vez) | 22580076 / MACB | Pide "¿Cómo te llamas?" y luego abre Avisos | | | `capturas/00c_nombre.png` |
| 1 | Avisos | — | Los 3 avisos reales (Bienvenida, Inicio de talleres, Inscripciones) | | | `capturas/01_avisos.png` |
| 2 | Talleres | — | Los 3 talleres reales con su horario | | | `capturas/02_talleres.png` |
| 3 | Buscar taller **1** | 1 | Detalle de "Programación en Python" | | | `capturas/03_taller_1.png` |
| 4 | Buscar taller **999** | 999 | "Ese taller no existe" | | | `capturas/04_taller_999.png` |
| 5 | Inscribirme al taller 2 | sesión 22580076 · taller 2 | Éxito con "Diseño UI/UX Móvil", Martes y Jueves 14:00 - 16:00 | | | `capturas/05_inscripcion_ok.png` |
| 6 | Volver a Inscribirme / detalle del taller 2 | taller 2 | Marcado "Ya inscrito"; si se fuerza el envío, "Ya estás inscrito" (409) | | | `capturas/06_ya_inscrito.png` |
| 7 | Taller inexistente | abrir `campusconectado://inscribirme?taller=999` | "No encontramos el taller #999" y no deja enviar | | | `capturas/07_taller_inexistente.png` |
| 8 | Enviar sin elegir taller | — | Botón "Inscribirme" deshabilitado | | | `capturas/08_validacion.png` |
| 9 | Mis inscripciones | sesión 22580076 | Inscripción del taller 2 con nombre y horario | | | `capturas/09_mis_inscripciones.png` |
| 10 | Mis inscripciones de una cuenta sin inscripciones | (cuenta nueva) | Estado vacío con botón a Talleres | | | `capturas/10_vacio.png` |
| 11 | Modo avión → Avisos → Reintentar | — | "Sin conexión con el campus"; al reconectar, Reintentar carga | | | `capturas/11_sin_red.png` |
| 12 | Estado del servidor (Mi cuenta → Estado) | — | Los 3 servicios en verde con ms | | | `capturas/12_estado.png` |
| 13 | Persistencia: borran el Pod de inscripciones → Mis inscripciones | — | La inscripción sigue apareciendo | | | `capturas/13_persistencia.png` |
| 14 | Recuperación: borran el Pod de avisos → Avisos → Reintentar | — | Vuelve a cargar en pocos segundos | | | `capturas/14_recuperacion.png` |
| 15 | Mi cuenta → Cerrar sesión | — | Regresa a "Inicia sesión" | | | `capturas/15_cerrar_sesion.png` |

## Capturas para el manual de usuario

Login, captura de nombre, Avisos, Talleres (lista y búsqueda), Detalle de taller, Inscribirme (formulario, "Registrando…", éxito, error 409), Mis inscripciones (con datos y vacío), Mi cuenta, Estado del servidor, Sin conexión.
