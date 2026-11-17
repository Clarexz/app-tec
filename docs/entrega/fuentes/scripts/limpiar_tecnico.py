import re, sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
R = [
 # encabezado y portada
 ('integración · v1.1', 'integración · v1.0'),
 ('<td>Ravyn Studio · Dirección de proyecto · Equipo 1 (App e integración)</td>', '<td>Ravyn Studio · Dirección de proyecto</td>'),
 ('<td>1.1 — incorpora la aplicación móvil (capítulo 7) y los resultados de la integración</td>', '<td>1.0</td>'),
 ('<td>Servidor: 13 de 13 pruebas funcionales aprobadas contra producción (12/11/2026).<br>Aplicación: 20 de 20 verificaciones automáticas aprobadas (16/11/2026); pruebas en el celular según la sección 8.2.</td>',
  '<td>13 de 13 pruebas funcionales aprobadas contra el servidor de producción (12/11/2026). Revisiones estáticas y pruebas automatizadas de la aplicación aprobadas (16/11/2026).</td>'),
 # 1.1 y 1.2
 ('<b>CampusConectado</b> —Avisos, Talleres e Inscripciones— y establece', '<b>CampusConectado</b> (Avisos, Talleres e Inscripciones) y establece'),
 ('<p>La <b>versión 1.1</b> agrega el capítulo 7, con la documentación técnica de la aplicación móvil desarrollada por el Equipo 1 (tecnologías, arquitectura, configuración, manejo de errores, compilación del APK y decisiones técnicas), actualiza las secciones 2.4, 4, 5, 6 y 8 con el estado real de la integración e incorpora los anexos C y D.</p>',
  '<p>El capítulo 7 documenta la aplicación móvil desarrollada por el Equipo 1: tecnologías, arquitectura, configuración, manejo de errores, inicio de sesión, compilación del APK y decisiones técnicas. Los anexos C y D registran los cambios hechos en la aplicación durante la integración y la bitácora de su desarrollo.</p>'),
 ('    <tr><td><span class="nuevo" style="margin-left:0">NUEVO 1.1</span></td><td>Secciones agregadas o actualizadas en la versión 1.1.</td></tr>\n', ''),
 # 2.4
 ('<div class="callout nota"><b>Nota.</b> En la versión 1.0 de la aplicación existía la variable <code>EXPO_PUBLIC_USE_MOCKS</code> para trabajar con datos de prueba locales mientras Talleres no estaba desplegado. Con los tres servicios en línea, el equipo eliminó ese modo en la versión 1.1: la aplicación siempre consume el servidor real. Los detalles están en la sección 7.4.</div>',
  '<div class="callout nota"><b>Nota.</b> La aplicación siempre consume el servidor real; no incluye un modo de datos de prueba. Los detalles están en la sección 7.4.</div>'),
 # 3.4
 ('propio framework —rutas inexistentes (<code>404</code>) o métodos no permitidos (<code>405</code>)— se devuelven en <b>HTML</b>',
  'propio framework, como rutas inexistentes (<code>404</code>) o métodos no permitidos (<code>405</code>), se devuelven en <b>HTML</b>'),
 # 4
 ('; la última columna indica dónde quedó implementado cada tratamiento en la versión 1.1.', '; la última columna indica dónde quedó implementado cada tratamiento.'),
 ('<td>El catálogo se lee siempre del servidor; ya no hay datos de prueba que mantener sincronizados.</td>', '<td>El catálogo se lee siempre del servidor; la aplicación no usa datos de prueba.</td>'),
 # 5
 ('<p class="small">En la versión 1.1 el texto del 400 dice «número de control» en lugar de «matrícula», porque así se identifica al alumno en la aplicación (sección 7.6).</p>',
  '<p class="small">El mensaje del 400 dice «número de control» en lugar de «matrícula» porque así se identifica al alumno en la aplicación (sección 7.6).</p>'),
 # 6.2
 ('<td>No aplica: por decisión del equipo se eliminaron los datos de prueba en la v1.1 (Anexo C).</td>', '<td>No aplica: la aplicación no usa datos de prueba; consume siempre el servidor real (Anexo C).</td>'),
 ('<td>APK <code>CampusConectado-1.1.0-android.apk</code> compilado con GitHub Actions (12/11/2026). Pruebas en el APK por registrar.</td>',
  '<td>APK <code>CampusConectado-1.2.0-android.apk</code> compilado con GitHub Actions (16/11/2026). Pruebas en el APK por registrar.</td>'),
 # 7
 ('<tr><td>Versión</td><td>1.1.0 (<code>app.json</code>)</td></tr>', '<tr><td>Versión</td><td>1.2.0 (<code>app.json</code>)</td></tr>'),
 ('├── auth/           Sesión del alumno (contexto + AsyncStorage) y validación de acceso',
  '├── auth/           Sesión del alumno, padrón de alumnos y cálculo de la contraseña (CURP)'),
 ('<li><b>Capa api.</b> Implementa la interfaz <code>CampusApi</code>. En la v1.0 permitía elegir entre datos de prueba y servidor real por servicio; en la v1.1 siempre usa el servidor real. La interfaz se conserva para poder sustituir la implementación en pruebas.</li>',
  '<li><b>Capa api.</b> Implementa la interfaz <code>CampusApi</code> y usa siempre el servidor real. La interfaz permite sustituir la implementación en pruebas automatizadas.</li>'),
 ('<li>Eliminación de los datos de prueba en la v1.1, una vez desplegados los tres servicios.</li>', '<li>Sin datos de prueba: la aplicación consume siempre el servidor real.</li>'),
 ('<li>Inicio de sesión local temporal; sin cancelación de inscripciones ni detalle de avisos, porque el servidor no los ofrece.</li>',
  '<li>Inicio de sesión contra un padrón de alumnos local mientras no exista el servicio escolar (sección 7.6); sin cancelación de inscripciones ni detalle de avisos, porque el servidor no los ofrece.</li>'),
 # 8
 ('En la versión 1.1 la matrícula se toma del número de control de la sesión, por lo que se utiliza una cuenta de prueba cuyo número de control no tenga inscripciones previas, para que el primer registro devuelva <code>201</code>.',
  'La matrícula se toma del número de control de la sesión, por lo que se utiliza una cuenta del padrón de alumnos sin inscripciones previas, para que el primer registro devuelva <code>201</code>.'),
 ('<td>«Número de control o contraseña incorrectos»; con los datos correctos pide el nombre y abre Avisos.</td>', '<td>«Número de control o contraseña incorrectos»; con los datos correctos abre Avisos con el nombre del alumno.</td>'),
 ('<div class="callout nota"><b>Nota.</b> El caso <code>503</code> fue verificado del lado del servidor sin detener Talleres. En la versión 1.1 la aplicación ya no tiene modo de datos de prueba; su manejo se verificó con las pruebas automatizadas de la sección 7.10.</div>',
  '<div class="callout nota"><b>Nota.</b> El caso <code>503</code> fue verificado del lado del servidor sin detener Talleres. En la aplicación, su manejo se verificó con las pruebas automatizadas de la sección 7.10.</div>'),
 # 10
 ('<td>GitHub · Releases v1.1.0 (<code>CampusConectado-1.1.0-android.apk</code>) o EAS, perfil <code>preview</code></td>', '<td>GitHub · Releases v1.2.0 (<code>CampusConectado-1.2.0-android.apk</code>) o EAS, perfil <code>preview</code></td>'),
 ('<td><i>Manual de usuario</i> v1.1, capítulo 3 (marcadores con el nombre de cada archivo)</td>', '<td><i>Manual de usuario</i>, capítulo 3 (marcadores con el nombre de cada archivo)</td>'),
 ('<li><b>Datos de prueba:</b> la versión 1.0 de este manual pedía conservar el modo de datos de prueba (paso 3 de la sección 6.2); el equipo decidió eliminarlo en la v1.1.</li>',
  '<li><b>Datos de prueba:</b> el procedimiento contemplaba conservar un modo de datos de prueba (paso 3 de la sección 6.2); el equipo lo eliminó al quedar desplegados los tres servicios.</li>'),
 # glosario
 ('Datos de prueba locales que imitan las respuestas del servidor (eliminados de la aplicación en la v1.1).', 'Datos de prueba locales que imitan las respuestas del servidor (la aplicación no los utiliza).'),
 ('<tr><td>Número de control</td><td>Identificador del alumno en la aplicación; se envía al servidor como <code>matricula</code>.</td></tr>',
  '<tr><td>Número de control</td><td>Identificador del alumno en la aplicación; se envía al servidor como <code>matricula</code>.</td></tr>\n    <tr><td>Padrón de alumnos</td><td>Lista de alumnos (número de control, nombres y apellidos) contra la que se valida el inicio de sesión.</td></tr>'),
 # anexo C y D
 ('<p>Cambios de la versión 1.0 (6/11/2026) a la 1.1 (12/11/2026) y ajustes posteriores, con su motivo.</p>', '<p>Cambios realizados en la aplicación durante la integración con el servidor, con su motivo.</p>'),
 ('<tr><td><code>src/auth/*</code>, <code>src/app/login.tsx</code>, <code>src/app/perfil.tsx</code>, <code>src/components/NombreGate.tsx</code></td><td>Inicio de sesión, captura del nombre, Mi cuenta y cierre de sesión.</td><td>Identificar al alumno sin escribir la matrícula en cada inscripción.</td></tr>',
  '<tr><td><code>src/auth/*</code>, <code>src/app/login.tsx</code>, <code>src/app/perfil.tsx</code>, <code>src/components/NombreGate.tsx</code></td><td>Inicio de sesión, captura del nombre, Mi cuenta y cierre de sesión.</td><td>Identificar al alumno sin escribir la matrícula en cada inscripción.</td></tr>\n    <tr><td><code>src/auth/padron.ts</code>, <code>src/auth/curp.ts</code>, <code>src/auth/cuentas.ts</code></td><td>Padrón de alumnos y contraseña calculada con las 4 primeras letras de la CURP; el nombre llega del padrón.</td><td>Dar acceso a varios alumnos sin capturar contraseñas una por una.</td></tr>'),
 ('<td>Ajustes de la sección 4, APK y versión <b>v1.1.0</b>.</td>', '<td>Ajustes de la sección 4, APK y versión <b>v1.1.0</b>.</td>'),
 ('<tr><td>6. Documentación de entrega</td><td>12–16/11/2026</td><td>Manuales, diagramas, evidencias, pruebas automatizadas, verificación de conectividad en CI y Expo 58.0.25.</td></tr>',
  '<tr><td>6. Documentación de entrega</td><td>12 al 16/11/2026</td><td>Manuales, diagramas, evidencias, pruebas automatizadas, verificación de conectividad en CI y Expo 58.0.25.</td></tr>\n    <tr><td>7. Padrón de alumnos</td><td>16/11/2026</td><td>Inicio de sesión con padrón y contraseña calculada de la CURP; versión <b>v1.2.0</b>.</td></tr>'),
 # celdas vacías con guion largo
 ('<td>—</td>', '<td>No aplica</td>'),
]
for a, b in R:
    n = s.count(a)
    if n == 0:
        sys.exit(f'NO ENCONTRADO: {a[:90]}')
    s = s.replace(a, b)
s = re.sub(r'\s*<span class="nuevo">NUEVO 1\.1</span>', '', s)
open(p, 'w', encoding='utf-8').write(s)
print('ok')
