# CampusConectado — especificación resumida (fuente de verdad para el equipo)

App Android (Expo + RN + TS + Expo Router) para alumnos del TecNM Campus Reynosa: ven **avisos**, consultan **talleres**, se **inscriben** y revisan **mis inscripciones**. Hecha por Ravyn Studio. Datos ficticios, sin login.

## Backend real (probado 2026-11-06)
HTTP plano, IP `2.24.29.189`, sin auth.
| Servicio | Puerto | Estado | Rutas |
|---|---|---|---|
| Avisos | 30001 | ✅ | `GET /salud` → `{"estado":"ok"}`, `GET /avisos` → `[{id,titulo,mensaje}]` (no existe `/avisos/{id}`) |
| Talleres | 30002 | ❌ no desplegado | esperado `GET /talleres`, `GET /talleres/{id}` (200/404). Formato por definir → se sigue usando mock |
| Inscripciones | 30003 | ✅ | `POST /inscripciones` → 201 `{id,matricula,nombre,taller_id}` · 400/404/409/503 con `{"error":"..."}`; `GET /inscripciones?matricula=X` → `[]` o lista; sin matricula → 400 |
Hoy inscribirse contra el real siempre da 503 (Talleres no existe).

## Mensajes por código (§2.3)
| Caso | Título | Texto |
|---|---|---|
| 400 | Faltan datos | Revisa tu matrícula, tu nombre y el taller, y vuelve a intentarlo. |
| 404 (taller) | Ese taller no existe | Revisa el número del taller o elige uno de la lista. |
| 409 | Ya estás inscrito | Ya tienes lugar en este taller. Lo ves en *Mis inscripciones*. |
| 503 | Talleres no responde | Algo no salió de nuestro lado. Intenta de nuevo en un momento. |
| Red/timeout (status 0) | Sin conexión con el campus | No pudimos llegar al servidor. Revisa tu internet e intenta de nuevo. |
| Otro 5xx | Algo no salió | Ya lo estamos revisando; intenta de nuevo en un momento. |
| Otro (4xx genérico) | Algo no salió | Intenta de nuevo en un momento. |
| 201 | ¡Listo, ya estás inscrito! | Te esperamos en **{nombre del taller}**, {horario}. |
Si el servidor manda `error`/`mensaje`, mostrarlo como texto secundario (`detalle`) debajo.

## Pantallas
- **Avisos (inicio):** header grande: kicker con saludo ("¡HOLA, {nombre}!" si hay perfil, si no "HOLA") + título "Avisos del campus" (display). Logo/marca pequeña "CampusConectado" arriba (long-press → Estado) + botón ícono `Activity` → Estado. Lista de tarjetas: `titulo` (h3) y `mensaje`. Primer aviso destacado (Card highlight Rosa, título marfil grande ≥19px bold, mensaje marfil 16+ bold-ish — solo texto grande sobre rosa). Pull-to-refresh. Estados: skeleton de 3 tarjetas, vacío "Por ahora no hay avisos. Vuelve más tarde.", error con Reintentar. Pie "Hecho por Ravyn Studio".
- **Talleres:** título "Talleres". Campo "Buscar por número de taller" (teclado numérico) + botón "Buscar taller" (secundario). Al enviar usa `api.taller(id)` (o `queryClient.fetchQuery`): 200 → `router.push('/taller/ID')`; 404 → texto inline "Ese taller no existe" bajo el campo (no alerta); otros errores → Banner. Debajo lista de `useTalleres()`: tarjeta con Chip `#id`, nombre (h3), horario con ícono `Clock`, `ChevronRight`. Tocar → detalle. Pull-to-refresh, estados.
- **Detalle `taller/[id]`:** Chip grande `#id`, nombre (h2/display), horario con `Clock`. Botón Rosa "Inscribirme aquí" con flecha → `router.navigate({pathname:'/inscribirme', params:{taller:String(id)}})`. 404 → StateView error "Ese taller no existe" con botón "Ver todos los talleres" → `/talleres`.
- **Inscribirme:** Matrícula (`autoCapitalize="characters"`, `autoCorrect={false}`, trim+mayúsculas), Nombre (trim), Taller (TallerPicker o escribir el número). Botón Rosa "Inscribirme" deshabilitado hasta tener los 3; spinner al enviar. Param `taller` precarga el taller (escuchar cambios del param). Matrícula y nombre precargados desde AsyncStorage; se guardan al enviar. Éxito 201: tarjeta/pantalla con `CircleCheck` color hoja, mensaje §2.3, anotación Caveat "¡nos vemos ahí!", botones "Ver mis inscripciones" (primario) e "Inscribirme a otro" (secundario, limpia taller). Háptico de éxito (`expo-haptics`). Error: Banner con mensaje §2.3 dentro del formulario, sin perder lo escrito. En modo mock, un enlace ghost pequeño "Enviar sin validar (prueba)" que fuerza el envío aunque falten campos, para demostrar el 400.
- **Mis inscripciones:** campo matrícula precargado + botón "Consultar" (secundario). Lista: nombre del taller y horario (cruzar `taller_id` con caché de talleres; si no, "Taller #{id}"), folio `#{id}` de inscripción. Vacío: "Aún no tienes inscripciones con esta matrícula. ¿Buscamos un taller?" + botón a Talleres. Pull-to-refresh. Antes de consultar: estado neutro invitando a escribir la matrícula.
- **Estado del servidor `estado`:** 3 servicios con puerto, URL, StatusDot "En línea"/"Sin respuesta", ms, etiqueta "Datos de prueba" si ese servicio es mock. Config: host, modo "Datos de prueba" / "Servidor real" (y cuáles siguen en prueba). Botón "Volver a revisar". Solo para servicios mock: switches `fail503` ("Talleres no responde (503) al inscribirte"), `offline` ("Sin red"), `slow` ("Latencia alta, 3 s"). Pie Ravyn Studio. Aquí sí se permite decir "servidor".

## Estilo
- Colores en `@/theme`. Marfil fondo; tarjetas blancas radio 22 sombra suave; secundarias hueso. Sin bordes laterales de color ni degradados.
- Contraste: texto pequeño nunca rosa ni sobre rosa (usar rosaProfundo); marfil sobre rosa solo ≥19px bold. Nunca rosa sobre sol.
- **Un solo botón Rosa (primary) por pantalla.** Secundarios: contorno tinta o fondo hueso.
- Botón principal: píldora, alto 52, Funnel Sans 700 16, texto marfil, flecha `→` opcional.
- Íconos Lucide `strokeWidth={2}`, 20–24, tinta por defecto, marfil dentro de botones rosa.
- Textos: de tú, cortos, con siguiente paso. Nunca "API", "endpoint", "servidor" al alumno (salvo Estado). Prohibido "solución integral", "ecosistema", "premium".
- Margen lateral 20, separación entre tarjetas 12, padding tarjeta 16–20. Texto mínimo 14.
- Accesibilidad: `accessibilityLabel`/`accessibilityRole` en botones e inputs.
