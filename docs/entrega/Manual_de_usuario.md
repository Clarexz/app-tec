# Manual de usuario — CampusConectado

**Para alumnos del TecNM Campus Reynosa** · Versión de la app 1.1.0

Con CampusConectado puedes ver los avisos del campus, conocer los talleres, inscribirte desde tu celular y revisar en qué talleres ya estás inscrito. No necesitas saber nada de computación: solo tu número de control.

> Los nombres, números de control y datos que aparecen en este manual son de ejemplo.

---

## 1. Antes de empezar

Necesitas:

- Un celular Android con internet (datos o wifi).
- La app **CampusConectado** instalada (te la comparte tu profesor o el equipo como archivo `.apk`).
- Tu **número de control** (8 dígitos) y tu **contraseña**: las **4 primeras letras de tu CURP**.

### Instalar la app

1. Abre el archivo `CampusConectado-….apk` que te enviaron.
2. Si el celular dice que no permite instalar apps de origen desconocido, toca **Configuración**, activa **Permitir de esta fuente** y regresa.
3. Toca **Instalar** y después **Abrir**.

![Instalación](capturas/01_instalacion.png)

---

## 2. Abrir la app e iniciar sesión

1. Abre **CampusConectado**. Verás la pantalla **Inicia sesión**.
2. En **No. de control** escribe tus 8 dígitos (por ejemplo, `21580001`).
3. En **Contraseña** escribe las 4 primeras letras de tu CURP (por ejemplo, `PERL`). Con el ícono del ojo puedes mostrarla u ocultarla.
4. Toca **Iniciar sesión**. El botón se activa cuando ya escribiste los dos datos completos.

![Inicio de sesión](capturas/02_login.png)

Si algún dato está mal, aparece el aviso **“Número de control o contraseña incorrectos”**. Revisa y vuelve a intentar.

![Error al iniciar sesión](capturas/03_login_error.png)

### La primera vez: tu nombre

La primera vez que entras, la app te pregunta **“¿Cómo te llamas?”**. Escribe tu **nombre y al menos un apellido** (por ejemplo, `Luis Pérez Gómez`) y toca **Continuar**. Lo usamos para inscribirte a los talleres. Si no eres tú, toca **No soy yo, cerrar sesión**.

![Captura de nombre](capturas/04_nombre.png)

La app recuerda tu sesión: la próxima vez que la abras entrarás directo a los avisos.

---

## 3. Moverte por la app

Abajo hay una barra con cuatro pestañas:

| Pestaña | Para qué sirve |
|---|---|
| 🔔 **Avisos** | Noticias del campus |
| 📖 **Talleres** | Lista de talleres y buscador |
| ➕ **Inscribirme** | Apartar tu lugar en un taller |
| 📋 **Inscripciones** | Los talleres donde ya estás inscrito |

---

## 4. Consultar avisos

Es la primera pantalla. Arriba dice **“¡Hola, {tu nombre}!”** y **Avisos del campus**.

- El aviso más reciente aparece destacado en color rosa.
- Los demás aparecen en tarjetas blancas debajo.
- Para **actualizar**, desliza la lista hacia abajo y suelta.

![Avisos](capturas/05_avisos.png)

Si no hay avisos verás **“Por ahora no hay avisos. Vuelve más tarde.”**

---

## 5. Ver talleres y buscar por número

1. Toca la pestaña **Talleres**. Verás todos los talleres con su número (por ejemplo, **#1**), su nombre y su horario.

![Lista de talleres](capturas/06_talleres.png)

2. Para **buscar**, escribe en el campo **Busca por número o nombre**:
   - Si escribes un **número** (por ejemplo, `1`), toca **Ver taller #1** para abrirlo.
   - Si escribes una **palabra** (por ejemplo, `Python`), la lista se filtra sola.

![Buscar taller por número](capturas/07_buscar_taller.png)

3. Si el número no existe (por ejemplo, `999`), verás debajo del campo **“Ese taller no existe”**. Revisa el número o elige uno de la lista.

![Taller que no existe](capturas/08_taller_no_existe.png)

4. En la lista, los talleres donde ya estás inscrito llevan una insignia verde que dice **Inscrito**. Toca cualquier taller para ver su **detalle**: número, nombre y horario. Si ya estás inscrito, en lugar del botón para inscribirte verás **“Ya estás inscrito”**.

![Detalle del taller](capturas/09_detalle_taller.png)

---

## 6. Inscribirte a un taller

Hay dos caminos:

- **Desde el detalle del taller:** toca **Inscribirme aquí**. La app te lleva a *Inscribirme* con ese taller ya elegido.
- **Desde la pestaña Inscribirme:** toca **Elige un taller**, busca el que quieres y tócalo. Los talleres en los que ya estás inscrito aparecen marcados como **Ya inscrito** y no se pueden elegir.

![Formulario de inscripción](capturas/10_inscribirme.png)

![Elegir taller](capturas/11_elegir_taller.png)

Arriba verás **“Te inscribes como {tu nombre} · {tu número de control}”**. Si no eres tú, toca **¿No eres tú?**.

Toca **Inscribirme**. Mientras se guarda, el botón dice **Registrando…**; espera unos segundos.

![Registrando](capturas/12_registrando.png)

Si todo salió bien, verás **“¡Listo, ya estás inscrito!”**, el nombre y horario del taller, tu **folio** y el mensaje **“¡nos vemos ahí!”**. El celular vibra para confirmarlo.

![Inscripción lista](capturas/13_inscripcion_exito.png)

Desde ahí puedes tocar **Ver mis inscripciones** o **Inscribirme a otro**.

---

## 7. Consultar mis inscripciones

Toca la pestaña **Inscripciones**. La app busca sola las inscripciones de tu número de control y muestra cuántas tienes y, en cada tarjeta, el **taller**, su **horario** y tu **folio**. Toca una tarjeta para ver el detalle del taller. Desliza hacia abajo para actualizar.

![Mis inscripciones](capturas/14_mis_inscripciones.png)

Si todavía no tienes ninguna, verás **“Aún no tienes inscripciones. ¿Buscamos un taller?”** con un botón para ir a *Talleres*.

![Sin inscripciones](capturas/15_sin_inscripciones.png)

---

## 8. Mi cuenta y cerrar sesión

En *Avisos*, toca el círculo con tus iniciales (arriba a la derecha) para abrir **Mi cuenta**. Ahí puedes:

- Ver tu nombre y tu número de control.
- **Cambiar tu nombre** y tocar **Guardar**.
- Abrir **Estado del servidor** (ver la sección 9).
- **Cerrar sesión**: la app te pide confirmar. Después tendrás que volver a escribir tu número de control y contraseña.

![Mi cuenta](capturas/16_mi_cuenta.png)

---

## 9. Estado del servidor

Si algo no carga, esta pantalla te dice si la app puede hablar con el campus. Ábrela desde **Mi cuenta → Estado del servidor**, o manteniendo presionado el logo de *CampusConectado* en *Avisos* o en *Inicia sesión*.

Muestra los tres servicios (**Avisos**, **Talleres**, **Inscripciones**) con un punto **verde “En línea”** o **gris/rojo “Sin respuesta”**, el tiempo de respuesta y la hora de la última revisión. Toca **Volver a revisar** para probar otra vez.

![Estado del servidor](capturas/17_estado_servidor.png)

---

## 10. Qué significa cada mensaje y qué hacer

| Mensaje que ves | Qué pasó | Qué hacer |
|---|---|---|
| **Número de control o contraseña incorrectos** | Algún dato no coincide. | Revisa tus 8 dígitos y las 4 primeras letras de tu CURP. |
| **Ese taller no existe** | El número de taller que escribiste no está en la lista. | Revisa el número o elige un taller de la lista. |
| **Faltan datos** | Falta tu número de control, tu nombre o el taller. | Revisa que hayas elegido un taller y que tu nombre esté en *Mi cuenta*. |
| **Ya estás inscrito** | Ya tienes lugar en ese taller. | No necesitas hacer nada. Revísalo en *Mis inscripciones*. |
| **Talleres no responde** | El sistema de talleres del campus no contestó a tiempo. | Espera un momento y toca **Inscribirme** otra vez. Tus datos no se pierden. |
| **Sin conexión con el campus** | Tu celular no tiene internet o el campus no respondió. | Revisa que tengas datos o wifi (y que no esté el modo avión) y toca **Reintentar**. |
| **Algo no salió** | Un error inesperado. | Intenta de nuevo en un momento. Si sigue, avisa a tu profesor y abre *Estado del servidor*. |

![Sin conexión](capturas/18_sin_conexion.png)

![Ya estás inscrito](capturas/19_ya_inscrito.png)

Debajo de algunos mensajes aparece un texto pequeño con el detalle técnico; sirve para que el equipo de soporte sepa qué pasó.

---

## 11. Preguntas frecuentes

**¿Puedo cancelar una inscripción?** Por ahora no. Pídelo a la coordinación de talleres.

**¿Por qué no veo un taller nuevo?** Desliza la lista hacia abajo para actualizarla.

**¿Se guardan mis datos si cierro la app?** Sí. Tu sesión y tu nombre se quedan en el celular hasta que cierres sesión. Tus inscripciones se guardan en el campus.

---

## Capturas que hay que tomar (en orden)

Tómalas en el celular con el **APK** conectado al servidor real, con una cuenta de prueba de ejemplo. Guárdalas en `docs/entrega/capturas/` con exactamente estos nombres.

| # | Archivo | Qué debe verse | Cómo llegar |
|---|---|---|---|
| 1 | `01_instalacion.png` | Pantalla de instalación del APK | Abrir el `.apk` en el celular |
| 2 | `02_login.png` | “Inicia sesión” con el No. de control escrito | Abrir la app sin sesión |
| 3 | `03_login_error.png` | Aviso “Número de control o contraseña incorrectos” | Contraseña equivocada |
| 4 | `04_nombre.png` | “¿Cómo te llamas?” | Primer inicio de sesión de la cuenta |
| 5 | `05_avisos.png` | Avisos con el saludo y el aviso destacado | Pestaña Avisos |
| 6 | `06_talleres.png` | Lista de los talleres con horario | Pestaña Talleres |
| 7 | `07_buscar_taller.png` | Buscador con `1` y el botón “Ver taller #1” | Escribir `1` en el buscador |
| 8 | `08_taller_no_existe.png` | “Ese taller no existe” bajo el buscador | Escribir `999` y tocar “Ver taller #999” |
| 9 | `09_detalle_taller.png` | Detalle de un taller con “Inscribirme aquí” | Tocar un taller donde aún no estés inscrito |
| 10 | `10_inscribirme.png` | Formulario con “Te inscribes como…” y taller elegido | “Inscribirme aquí” desde el detalle |
| 11 | `11_elegir_taller.png` | Lista para elegir taller (con alguno “Ya inscrito”, si hay) | Tocar “Elige un taller” |
| 12 | `12_registrando.png` | Botón con “Registrando…” | Tocar “Inscribirme” y capturar rápido |
| 13 | `13_inscripcion_exito.png` | “¡Listo, ya estás inscrito!” con folio | Esperar la respuesta |
| 14 | `14_mis_inscripciones.png` | Lista con taller, horario y folio | Pestaña Inscripciones |
| 15 | `15_sin_inscripciones.png` | “Aún no tienes inscripciones…” | Con una cuenta sin inscripciones |
| 16 | `16_mi_cuenta.png` | Mi cuenta con nombre, No. de control y “Cerrar sesión” | Tocar el avatar en Avisos |
| 17 | `17_estado_servidor.png` | Los 3 servicios “En línea” con ms | Mi cuenta → Estado del servidor |
| 18 | `18_sin_conexion.png` | “Sin conexión con el campus” con “Reintentar” | Activar modo avión y deslizar Avisos hacia abajo |
| 19 | `19_ya_inscrito.png` | “Ya estás inscrito” en el detalle del taller | Abrir el detalle de un taller donde ya estás inscrito |
