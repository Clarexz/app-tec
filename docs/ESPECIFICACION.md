# CampusConectado — especificación resumida (fuente de verdad para el equipo)

App Android (Expo + RN + TS + Expo Router) para alumnos del TecNM Campus Reynosa: ven **avisos**, consultan **talleres**, se **inscriben** y revisan **mis inscripciones**. Hecha por Ravyn Studio. Cada alumno inicia sesión con su número de control y contraseña.

## Backend real
HTTP plano, IP `2.24.29.189`. Los tres servicios están desplegados y la app ya no usa datos de prueba.
| Servicio | Puerto | Rutas |
|---|---|---|
| Avisos | 30001 | `GET /salud` → `{"estado":"ok"}`, `GET /avisos` → `[{id,titulo,mensaje}]` (no existe `/avisos/{id}`) |
| Talleres | 30002 | `GET /talleres` → `[{id,nombre,horario}]`, `GET /talleres/{id}` (200/404) |
| Inscripciones | 30003 | `POST /inscripciones` → 201 `{id,matricula,nombre,taller_id}` · 400/404/409/503 con `{"error":"..."}`; `GET /inscripciones?matricula=X` → `[]` o lista |

## Sesión
- Login con **No. de control** (8 dígitos; el servidor lo llama `matricula`) y **contraseña** = 4 primeras letras de la CURP.
- Temporal: no hay servicio de login; se valida en `src/auth/cuentas.ts` (cuenta `22580076` / `MACB`).
- Rutas protegidas con `Stack.Protected`: sin sesión solo existen `login` y `estado`.
- La primera vez se pide el nombre completo (se usa en las inscripciones). *Mi cuenta* (`/perfil`) permite cambiarlo y cerrar sesión.

## Mensajes por código (§2.3)
| Caso | Título | Texto |
|---|---|---|
| 400 | Faltan datos | Revisa tu número de control, tu nombre y el taller, y vuelve a intentarlo. |
| 404 (taller) | Ese taller no existe | Revisa el número del taller o elige uno de la lista. |
| 409 | Ya estás inscrito | Ya tienes lugar en este taller. Lo ves en *Mis inscripciones*. |
| 503 | Talleres no responde | Algo no salió de nuestro lado. Intenta de nuevo en un momento. |
| Red/timeout (status 0) | Sin conexión con el campus | No pudimos llegar al servidor. Revisa tu internet e intenta de nuevo. |
| Otro 5xx | Algo no salió | Ya lo estamos revisando; intenta de nuevo en un momento. |
| Otro (4xx genérico) | Algo no salió | Intenta de nuevo en un momento. |
| 201 | ¡Listo, ya estás inscrito! | Te esperamos en **{nombre del taller}**, {horario}. |
Si el servidor manda `error`/`mensaje`, mostrarlo como texto secundario (`detalle`) debajo.

## Pantallas
- **Login:** marca CampusConectado + "TecNM Campus Reynosa", "Inicia sesión", campos No. de control (numérico, 8) y Contraseña (4 letras, mostrar/ocultar), un botón Rosa "Iniciar sesión" deshabilitado hasta que sea válido. Error en Banner "Número de control o contraseña incorrectos" con háptico. Long-press en el logo → Estado.
- **Nombre (primer inicio):** modal "¿Cómo te llamas?" con "Nombre completo" (nombre y al menos un apellido) y "Continuar". Enlace "No soy yo, cerrar sesión".
- **Avisos (inicio):** marca arriba (long-press → Estado) y avatar con iniciales → Mi cuenta. Kicker "¡Hola, {primer nombre}!" + "Avisos del campus". Primer aviso destacado en Rosa, resto en tarjetas blancas, animación ligera de entrada. Pull-to-refresh, skeleton, vacío, error con Reintentar, pie.
- **Talleres:** un campo "Busca por número o nombre": número → "Ver taller #N" (404 inline "Ese taller no existe"); texto → filtra la lista. Tarjetas con Chip `#id`, nombre, horario (`Clock`) e insignia verde "Inscrito" si ya está inscrito. Pull-to-refresh y estados.
- **Detalle `taller/[id]`:** Chip grande, nombre, horario. Si ya está inscrito: tarjeta "Ya estás inscrito" + "Ver mis inscripciones"; si no, botón Rosa "Inscribirme aquí". 404 → "Ese taller no existe" + "Ver todos los talleres".
- **Inscribirme:** tarjeta "Te inscribes como {nombre} · No. de control" ("¿No eres tú?" → Mi cuenta), TallerPicker con búsqueda y talleres ya inscritos deshabilitados, `?taller=ID` lo preselecciona. Botón Rosa "Inscribirme". Error en Banner (mensajes §2.3) sin perder la selección. Éxito: `CircleCheck` hoja, mensaje §2.3, folio, Caveat "¡nos vemos ahí!", háptico, "Ver mis inscripciones" / "Inscribirme a otro".
- **Mis inscripciones:** carga sola con el No. de control de la sesión; contador; tarjetas con taller, horario y folio (tocar → detalle). Vacío: "Aún no tienes inscripciones. ¿Buscamos un taller?" → Talleres.
- **Mi cuenta `perfil`:** avatar, nombre, No. de control, editar nombre, enlace a Estado, versión, "Cerrar sesión" con confirmación.
- **Estado del servidor `estado`:** host, resumen general, los 3 servicios con puerto, URL, StatusDot "En línea"/"Sin respuesta", ms y hora de la última revisión. "Volver a revisar". Aquí sí se permite decir "servidor".

## Estilo
- Colores en `@/theme`. Marfil fondo; tarjetas blancas radio 22 sombra suave; secundarias hueso. Sin bordes laterales de color ni degradados.
- Contraste: texto pequeño nunca rosa ni sobre rosa (usar rosaProfundo); marfil sobre rosa solo ≥19px bold. Nunca rosa sobre sol.
- **Un solo botón Rosa (primary) por pantalla.** Secundarios: contorno tinta o fondo hueso.
- Botón principal: píldora, alto 52, Funnel Sans 700 16, texto marfil, flecha `→` opcional.
- Íconos Lucide `strokeWidth={2}`, 20–24, tinta por defecto, marfil dentro de botones rosa.
- Textos: de tú, cortos, con siguiente paso. Nunca "API", "endpoint", "servidor" al alumno (salvo Estado). Prohibido "solución integral", "ecosistema", "premium".
- Margen lateral 20, separación entre tarjetas 12, padding tarjeta 16–20. Texto mínimo 14.
- Accesibilidad: `accessibilityLabel`/`accessibilityRole` en botones e inputs.
