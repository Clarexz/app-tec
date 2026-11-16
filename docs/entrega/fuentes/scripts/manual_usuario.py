"""Agrega a Manual_de_usuario.docx (v1.0) el capítulo de la aplicación móvil (Equipo 1) -> v1.1.

Uso: python3 -I manual_usuario.py ENTRADA.docx CARPETA_PLACEHOLDERS SALIDA.docx [paginas.json]
paginas.json (opcional): {"texto del encabezado": pagina} para llenar el índice.
"""
import copy, json, re, sys
from xml.sax.saxutils import escape
import docx
from docx.oxml import parse_xml
from docx.shared import Inches
from docx.text.paragraph import Paragraph
from docx.table import Table

ENT, PH, SAL = sys.argv[1], sys.argv[2], sys.argv[3]
PAGINAS = json.load(open(sys.argv[4], encoding='utf-8')) if len(sys.argv) > 4 else {}

W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"'
d = docx.Document(ENT)
body = d.element.body
els = list(body.iterchildren())

# ---------- utilidades XML con el mismo formato del documento ----------
MONO = '<w:rFonts w:ascii="Courier New" w:cs="Courier New" w:eastAsia="Courier New" w:hAnsi="Courier New"/><w:color w:val="A8055E"/>'

def runs(segs, size=None, extra=''):
    """segs: str o lista de str | ('b', t) | ('m', t) | ('i', t)."""
    if isinstance(segs, str):
        segs = [segs]
    out = []
    sz = f'<w:sz w:val="{size}"/><w:szCs w:val="{size}"/>' if size else ''
    for s in segs:
        kind, t = ('', s) if isinstance(s, str) else s
        rpr = extra
        if kind == 'b':
            rpr += '<w:b/><w:bCs/>'
        if kind == 'i':
            rpr += '<w:i/><w:iCs/>'
        if kind == 'm':
            rpr += MONO
            szm = int(size) if size else 19
            rpr += f'<w:sz w:val="{szm}"/><w:szCs w:val="{szm}"/>'
        else:
            rpr += sz
        out.append(f'<w:r><w:rPr>{rpr}</w:rPr><w:t xml:space="preserve">{escape(t)}</w:t></w:r>')
    return ''.join(out)

def P(xml):
    return parse_xml(xml)

def para(segs):
    return P(f'<w:p {W}><w:pPr><w:spacing w:after="120" w:line="276"/><w:jc w:val="both"/></w:pPr>{runs(segs)}</w:p>')

def espacio():
    return P(f'<w:p {W}><w:pPr><w:spacing w:after="160" w:line="120"/></w:pPr></w:p>')

BM = [2000]
def heading(level, text, anchor):
    BM[0] += 1
    return P(f'<w:p {W}><w:pPr><w:pStyle w:val="Heading{level}"/></w:pPr>'
             f'<w:bookmarkStart w:name="{anchor}" w:id="{BM[0]}"/>'
             f'<w:r><w:t xml:space="preserve">{escape(text)}</w:t></w:r><w:bookmarkEnd w:id="{BM[0]}"/></w:p>')

# numeración: un <w:num> nuevo por lista, con reinicio en 1
num_part = d.part.numbering_part.element
NEXT_NUM = [max(int(n.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}numId'))
                for n in num_part.findall('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}num')) + 1]

def nueva_lista(abstract):
    nid = NEXT_NUM[0]; NEXT_NUM[0] += 1
    num_part.append(P(f'<w:num {W} w:numId="{nid}"><w:abstractNumId w:val="{abstract}"/>'
                      f'<w:lvlOverride w:ilvl="0"><w:startOverride w:val="1"/></w:lvlOverride></w:num>'))
    return nid

def lista(items, numerada=True):
    nid = nueva_lista(11 if numerada else 2)
    after = 80 if numerada else 70
    return [P(f'<w:p {W}><w:pPr><w:pStyle w:val="ListParagraph"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="{nid}"/></w:numPr>'
              f'<w:spacing w:after="{after}" w:line="268"/><w:jc w:val="both"/></w:pPr>{runs(it)}</w:p>') for it in items]

BORDE = '<w:tcBorders><w:top w:val="single" w:color="D9CDB4" w:sz="4"/><w:left w:val="single" w:color="D9CDB4" w:sz="4"/><w:bottom w:val="single" w:color="D9CDB4" w:sz="4"/><w:right w:val="single" w:color="D9CDB4" w:sz="4"/></w:tcBorders>'
MAR = '<w:tcMar><w:top w:type="dxa" w:w="70"/><w:left w:type="dxa" w:w="110"/><w:bottom w:type="dxa" w:w="70"/><w:right w:type="dxa" w:w="110"/></w:tcMar>'
TBLPR = ('<w:tblPr><w:tblW w:type="dxa" w:w="10224"/><w:tblBorders><w:top w:val="single" w:color="auto" w:sz="4"/>'
         '<w:left w:val="single" w:color="auto" w:sz="4"/><w:bottom w:val="single" w:color="auto" w:sz="4"/>'
         '<w:right w:val="single" w:color="auto" w:sz="4"/><w:insideH w:val="single" w:color="auto" w:sz="4"/>'
         '<w:insideV w:val="single" w:color="auto" w:sz="4"/></w:tblBorders><w:tblLayout w:type="fixed"/></w:tblPr>')

def celda(w, fill, segs, header=False):
    extra = '<w:color w:val="FFFFFF"/>' if header else ''
    if header:
        segs = [('b', s) if isinstance(s, str) else s for s in ([segs] if isinstance(segs, str) else segs)]
    return (f'<w:tc><w:tcPr><w:tcW w:type="dxa" w:w="{w}"/>{BORDE}<w:shd w:fill="{fill}" w:color="auto" w:val="clear"/>{MAR}'
            f'<w:vAlign w:val="center"/></w:tcPr><w:p><w:pPr><w:spacing w:after="0" w:line="252"/><w:jc w:val="left"/></w:pPr>'
            f'{runs(segs, 18, extra)}</w:p></w:tc>')

def tabla(anchos, encabezado, filas):
    grid = ''.join(f'<w:gridCol w:w="{a}"/>' for a in anchos)
    xml = f'<w:tbl {W}>{TBLPR}<w:tblGrid>{grid}</w:tblGrid>'
    xml += '<w:tr><w:trPr><w:tblHeader/></w:trPr>' + ''.join(celda(a, '141414', h, True) for a, h in zip(anchos, encabezado)) + '</w:tr>'
    for i, f in enumerate(filas):
        fill = 'FFFFFF' if i % 2 == 0 else 'FBF6EC'
        xml += '<w:tr><w:trPr><w:cantSplit/></w:trPr>' + ''.join(celda(a, fill, c) for a, c in zip(anchos, f)) + '</w:tr>'
    return [P(xml + '</w:tbl>'), espacio()]

def recuadro(titulo, segs, fill='FDEBF4', borde='E5097F'):
    b = ''.join(f'<w:{s} w:val="single" w:color="{borde}" w:sz="6"/>' for s in ('top', 'left', 'bottom', 'right'))
    xml = (f'<w:tbl {W}>{TBLPR}<w:tblGrid><w:gridCol w:w="10224"/></w:tblGrid><w:tr><w:trPr><w:cantSplit/></w:trPr><w:tc><w:tcPr>'
           f'<w:tcW w:type="dxa" w:w="10224"/><w:tcBorders>{b}</w:tcBorders><w:shd w:fill="{fill}" w:color="auto" w:val="clear"/>'
           '<w:tcMar><w:top w:type="dxa" w:w="110"/><w:left w:type="dxa" w:w="180"/><w:bottom w:type="dxa" w:w="110"/><w:right w:type="dxa" w:w="180"/></w:tcMar></w:tcPr>'
           '<w:p><w:pPr><w:spacing w:after="40" w:line="264"/><w:jc w:val="both"/></w:pPr>'
           f'{runs([("b", titulo + "  ")], 19, "<w:color w:val=\"141414\"/>")}{runs(segs, 19)}</w:p></w:tc></w:tr></w:tbl>')
    return [P(xml), espacio()]

# capturas: fila de 1 a 3 imágenes con pie, en una tabla sin bordes
def capturas(items):
    n = len(items)
    ancho = 10224 // n
    sinborde = ''.join(f'<w:{s} w:val="none" w:color="FFFFFF" w:sz="0"/>' for s in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'))
    tbl = P(f'<w:tbl {W}><w:tblPr><w:tblW w:type="dxa" w:w="10224"/><w:jc w:val="center"/><w:tblBorders>{sinborde}</w:tblBorders>'
            f'<w:tblLayout w:type="fixed"/></w:tblPr><w:tblGrid>' + ''.join(f'<w:gridCol w:w="{ancho}"/>' for _ in items) +
            '</w:tblGrid><w:tr><w:trPr><w:cantSplit/></w:trPr>' +
            ''.join(f'<w:tc><w:tcPr><w:tcW w:type="dxa" w:w="{ancho}"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="40"/></w:pPr></w:p>'
                    f'<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="60"/></w:pPr>'
                    f'{runs([("i", pie)], 16, "<w:color w:val=\"6B6B6B\"/>")}</w:p></w:tc>' for _, pie in items) +
            '</w:tr></w:tbl>')
    t = Table(tbl, d._body)
    for i, (arch, _) in enumerate(items):
        p = t.rows[0].cells[i].paragraphs[0]
        r = p.add_run()
        r.add_picture(f'{PH}/{arch}', width=Inches(1.4))
        docpr = r._r.find('.//{http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing}docPr')
        docpr.set('descr', f'Captura pendiente: capturas/{arch}')
        docpr.set('name', arch)
    return [tbl, espacio()]

# ---------- 1. Cambios en el contenido existente ----------
def texto_p(el):
    return ''.join(t.text or '' for t in el.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t'))

def reemplazar_en(el, viejo, nuevo):
    for t in el.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t'):
        if t.text and viejo in t.text:
            t.text = t.text.replace(viejo, nuevo)
            return True
    return False

def buscar(pred):
    for e in body.iterchildren():
        if pred(texto_p(e)):
            return e
    raise SystemExit('no encontrado')

WNS = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'


def set_fila(tr, textos):
    for tc, txt in zip(tr.findall(WNS + 'tc'), textos):
        ts = list(tc.iter(WNS + 't'))
        for t in ts:
            t.text = ''
        ts[0].text = txt

# Renumerar capítulos 3..11 -> 4..12 (encabezados) y referencias "sección N"
for e in list(body.iterchildren()):
    if e.tag == WNS + 'p':
        ps = e.find(WNS + 'pPr/' + WNS + 'pStyle')
        estilo = ps.get(WNS + 'val') if ps is not None else ''
        if estilo in ('Heading1', 'Heading2'):
            t0 = next(e.iter(WNS + 't'))
            m = re.match(r'^(\d+)(\.\d+)?(\.? )', t0.text)
            if m and int(m.group(1)) >= 3:
                t0.text = f'{int(m.group(1)) + 1}{m.group(2) or ""}{m.group(3)}' + t0.text[m.end():]
    for t in e.iter(WNS + 't'):
        if t.text and 'sección' in t.text:
            t.text = re.sub(r'sección (\d+)', lambda m: f'sección {int(m.group(1)) + 1 if int(m.group(1)) >= 3 else m.group(1)}', t.text)

# Portada
reemplazar_en(els[3], 'Consulta de avisos y talleres, registro de inscripciones y consulta de inscripciones',
              'Aplicación móvil para alumnos y consulta de los servicios: avisos, talleres e inscripciones')
cover = els[4]
for tc in cover.iter(WNS + 't'):
    if tc.text == '1.0':
        tc.text = '1.1'
    elif tc.text == '12 de noviembre de 2026':
        tc.text = '16 de noviembre de 2026'
hdr = d.sections[0].header
for p in hdr.paragraphs:
    for r in p.runs:
        r.text = r.text.replace('v1.0', 'v1.1')

# 1.1: mención de la app
p11 = buscar(lambda s: s.startswith('El sistema funciona las 24 horas'))
p11.addnext(para(['Los alumnos utilizan el sistema desde la ', ('b', 'aplicación móvil CampusConectado'),
                  ' para Android: inician sesión con su número de control, consultan avisos y talleres, se inscriben y revisan sus '
                  'inscripciones desde el celular (capítulo 3). El personal del campus también puede consultar los servicios desde un '
                  'navegador o una terminal (capítulos 4 a 8).']))

# 1.2: fila de la app al inicio de la tabla
t12 = Table(els[38], d._body)
fila_tpl = copy.deepcopy(t12.rows[1]._tr)
t12.rows[0]._tr.addnext(fila_tpl)
set_fila(fila_tpl, ['Usar la aplicación móvil', 'Desde el celular: iniciar sesión, ver avisos y talleres, inscribirse y consultar las propias inscripciones (alumnos).'])
# reajustar el sombreado alterno
for i, tr in enumerate(t12.rows[1:]):
    for shd in tr._tr.iter(WNS + 'shd'):
        shd.set(WNS + 'fill', 'FFFFFF' if i % 2 == 0 else 'FBF6EC')

# 1.3 audiencia
p13 = buscar(lambda s: s.startswith('Este manual está dirigido al personal'))
for t in p13.iter(WNS + 't'):
    t.text = ''
next(p13.iter(WNS + 't')).text = ('Este manual está dirigido a dos públicos. Los alumnos encontrarán en el capítulo 3 cómo usar la '
                                   'aplicación móvil. El personal del campus que consulta la información o registra inscripciones '
                                   'sin la aplicación encontrará los capítulos 4 a 8. No se requieren conocimientos técnicos: cada '
                                   'tarea se explica paso a paso y se muestra lo que el sistema responde.')

# 1.4 viñeta de capturas
ult14 = buscar(lambda s: s.startswith('Los recuadros de color destacan'))
nueva = copy.deepcopy(ult14)
for t in nueva.iter(WNS + 't'):
    t.text = ''
next(nueva.iter(WNS + 't')).text = 'Las imágenes del capítulo 3 muestran las pantallas de la aplicación tal como se ven en el celular.'
ult14.addnext(nueva)

# 2.1 requisitos: fila de la app
t21 = Table(els[48], d._body)
f21 = copy.deepcopy(t21.rows[1]._tr)
t21.rows[0]._tr.addnext(f21)
set_fila(f21, ['Usar la aplicación móvil (alumnos)', 'Un celular Android con Internet (datos móviles o wifi), el archivo de instalación de CampusConectado (.apk) que entrega el equipo, el número de control y la contraseña del alumno.'])
for i, tr in enumerate(t21.rows[1:]):
    for shd in tr._tr.iter(WNS + 'shd'):
        shd.set(WNS + 'fill', 'FFFFFF' if i % 2 == 0 else 'FBF6EC')

# 2.2 nota: la app ya trae las direcciones
p22 = buscar(lambda s: s.startswith('Cada servicio tiene su propia dirección'))
reemplazar_en(p22, 'Conviene guardarlas en los marcadores del navegador:',
              'La aplicación móvil ya las tiene configuradas; para consultarlas desde el navegador conviene guardarlas en los marcadores:')

# 2.3: matrícula = número de control en la app
t23 = els[58]
t23.addnext(para(['En la aplicación móvil la ', ('b', 'matrícula es el número de control'),
                  ' del alumno (8 dígitos). La aplicación la toma de la sesión iniciada y la envía siempre en mayúsculas, por lo que el alumno no '
                  'necesita escribirla al inscribirse.']))

# ---------- 2. Capítulo 3: aplicación móvil ----------
A = 0
def anc():
    global A
    A += 1
    return f'_Ref_app{A}'

cap = []
add = cap.extend
cap.append(heading(1, '3. Usar la aplicación móvil', anc()))
cap.append(para(['La aplicación ', ('b', 'CampusConectado'), ' permite a cada alumno consultar los avisos del campus, ver los talleres, '
                 'inscribirse y revisar sus inscripciones desde su celular. Se conecta a los mismos tres servicios que se describen en el '
                 'resto del manual, por lo que la información es la misma en la aplicación y en el navegador.']))

cap.append(heading(2, '3.1 Instalar la aplicación', anc()))
add(lista([['Copie en el celular el archivo ', ('m', 'CampusConectado-1.1.0-android.apk'), ' que entrega el equipo y ábralo.'],
           ['Si el celular indica que no permite instalar aplicaciones de origen desconocido, toque ', ('b', 'Configuración'),
            ', active ', ('b', 'Permitir de esta fuente'), ' y regrese.'],
           ['Toque ', ('b', 'Instalar'), ' y, al terminar, ', ('b', 'Abrir'), '.']]))
add(capturas([('01_instalacion.png', 'Instalación del archivo .apk')]))

cap.append(heading(2, '3.2 Iniciar sesión', anc()))
add(lista([['Abra ', ('b', 'CampusConectado'), '. Aparece la pantalla ', ('b', 'Inicia sesión'), '.'],
           ['En ', ('b', 'No. de control'), ' escriba los 8 dígitos del número de control (por ejemplo, ', ('m', '21580001'), ').'],
           ['En ', ('b', 'Contraseña'), ' escriba las ', ('b', '4 primeras letras de la CURP'),
            '. El ícono del ojo muestra u oculta lo escrito.'],
           ['Toque ', ('b', 'Iniciar sesión'), '. El botón se activa cuando los dos datos están completos.']]))
add(capturas([('02_login.png', 'Inicio de sesión'), ('03_login_error.png', 'Datos incorrectos')]))
cap.append(para(['Si algún dato no coincide, la aplicación muestra el aviso ', ('b', '«Número de control o contraseña incorrectos»'),
                 '. Revise los datos y vuelva a intentarlo.']))
cap.append(heading(3, 'La primera vez: el nombre del alumno', anc()))
cap.append(para(['La primera vez que se inicia sesión, la aplicación pregunta ', ('b', '«¿Cómo te llamas?»'), '. Escriba el ',
                 ('b', 'nombre y al menos un apellido'), ' (por ejemplo, ', ('m', 'Luis Pérez Gómez'), ') y toque ', ('b', 'Continuar'),
                 '. Este nombre se usa en las inscripciones. Si la sesión no es del alumno, toque ', ('b', 'No soy yo, cerrar sesión'), '.']))
add(capturas([('04_nombre.png', 'Captura del nombre')]))
add(recuadro('Nota.', ['La aplicación recuerda la sesión: la próxima vez que se abra entrará directamente a los avisos, hasta que se cierre la sesión (sección 3.8).']))

cap.append(heading(2, '3.3 Moverse por la aplicación', anc()))
cap.append(para('En la parte inferior de la pantalla hay una barra con cuatro pestañas:'))
add(tabla([3067, 7157], ['Pestaña', 'Para qué sirve'], [
    ['Avisos', 'Avisos vigentes del campus. Es la pantalla de inicio.'],
    ['Talleres', 'Catálogo de talleres con su horario y buscador por número o nombre.'],
    ['Inscribirme', 'Formulario para apartar un lugar en un taller.'],
    ['Inscripciones', 'Talleres en los que el alumno ya está inscrito («Mis inscripciones»).'],
]))

cap.append(heading(2, '3.4 Consultar los avisos', anc()))
add(lista([['Toque la pestaña ', ('b', 'Avisos'), '. Arriba aparece el saludo con el nombre del alumno y el título ', ('b', 'Avisos del campus'), '.'],
           'El primer aviso aparece destacado en color rosa; los demás, en tarjetas blancas.',
           'Para actualizar la lista, deslícela hacia abajo y suéltela.']))
add(capturas([('05_avisos.png', 'Avisos del campus')]))
cap.append(para(['Si no hay avisos se muestra ', ('b', '«Por ahora no hay avisos. Vuelve más tarde.»')]))

cap.append(heading(2, '3.5 Ver y buscar talleres', anc()))
add(lista([['Toque la pestaña ', ('b', 'Talleres'), '. Cada taller muestra su número (por ejemplo, ', ('b', '#1'), '), su nombre y su horario. '
            'Los talleres en los que el alumno ya está inscrito llevan la insignia verde ', ('b', 'Inscrito'), '.'],
           ['Para buscar, escriba en el campo ', ('b', 'Busca por número o nombre'), ': con un número (por ejemplo, ', ('m', '1'),
            ') toque ', ('b', 'Ver taller #1'), '; con una palabra (por ejemplo, ', ('m', 'Python'), ') la lista se filtra sola.'],
           ['Toque un taller para ver su detalle: número, nombre y horario. Si el alumno ya está inscrito, el detalle lo indica con ',
            ('b', '«Ya estás inscrito»'), '.']]))
add(capturas([('06_talleres.png', 'Lista de talleres'), ('07_buscar_taller.png', 'Búsqueda por número'), ('09_detalle_taller.png', 'Detalle del taller')]))
cap.append(para(['Si el número no corresponde a ningún taller (por ejemplo, ', ('m', '999'), '), debajo del campo aparece ',
                 ('b', '«Ese taller no existe»'), '. Revise el número o elija un taller de la lista.']))
add(capturas([('08_taller_no_existe.png', 'Taller inexistente')]))

cap.append(heading(2, '3.6 Inscribirse en un taller', anc()))
cap.append(para('Hay dos formas de llegar al formulario de inscripción:'))
add(lista([['Desde el detalle del taller, toque ', ('b', 'Inscribirme aquí'), ': el taller queda elegido.'],
           ['Desde la pestaña ', ('b', 'Inscribirme'), ', toque ', ('b', 'Elige un taller'), ' y seleccione uno de la lista. '
            'Los talleres en los que el alumno ya está inscrito aparecen como ', ('b', 'Ya inscrito'), ' y no se pueden elegir.']], numerada=False))
cap.append(para(['En la parte superior aparece ', ('b', '«Te inscribes como {nombre} · {número de control}»'),
                 '. Si los datos no son del alumno, toque ', ('b', '¿No eres tú?'), ' para ir a Mi cuenta.']))
add(capturas([('10_inscribirme.png', 'Formulario de inscripción'), ('11_elegir_taller.png', 'Elegir un taller')]))
add(lista([['Toque ', ('b', 'Inscribirme'), '. Mientras se registra, el botón muestra ', ('b', 'Registrando…'), '; espere unos segundos.'],
           ['Si el registro fue exitoso aparece ', ('b', '«¡Listo, ya estás inscrito!»'), ' con el nombre y el horario del taller, '
            'el número de folio y la nota «¡nos vemos ahí!». El celular vibra para confirmarlo.'],
           ['Desde ahí puede tocar ', ('b', 'Ver mis inscripciones'), ' o ', ('b', 'Inscribirme a otro'), '.']]))
add(capturas([('12_registrando.png', 'Registrando…'), ('13_inscripcion_exito.png', 'Inscripción registrada')]))
add(recuadro('Importante.', ['Si aparece un mensaje de error, los datos elegidos no se pierden: corrija lo que indica el mensaje y toque ',
                             ('b', 'Inscribirme'), ' de nuevo. Los mensajes se explican en la sección 3.10.']))

cap.append(heading(2, '3.7 Consultar mis inscripciones', anc()))
add(lista([['Toque la pestaña ', ('b', 'Inscripciones'), '. La aplicación consulta sola las inscripciones del número de control de la sesión.'],
           'Cada tarjeta muestra el taller, su horario y el folio de la inscripción. Toque una tarjeta para ver el detalle del taller.',
           'Para actualizar, deslice la lista hacia abajo.']))
add(capturas([('14_mis_inscripciones.png', 'Mis inscripciones'), ('15_sin_inscripciones.png', 'Sin inscripciones')]))
cap.append(para(['Si el alumno todavía no tiene inscripciones, aparece ', ('b', '«Aún no tienes inscripciones. ¿Buscamos un taller?»'),
                 ' con un botón que lleva a Talleres.']))

cap.append(heading(2, '3.8 Mi cuenta y cierre de sesión', anc()))
cap.append(para(['En la pantalla Avisos, toque el círculo con las iniciales del alumno (arriba a la derecha) para abrir ', ('b', 'Mi cuenta'), '. Ahí puede:']))
add(lista(['Ver el nombre y el número de control de la sesión.',
           ['Cambiar el nombre y tocar ', ('b', 'Guardar'), '.'],
           ['Abrir ', ('b', 'Estado del servidor'), ' (sección 3.9).'],
           ['Tocar ', ('b', 'Cerrar sesión'), ' y confirmar. Después habrá que volver a escribir el número de control y la contraseña.']], numerada=False))
add(capturas([('16_mi_cuenta.png', 'Mi cuenta')]))

cap.append(heading(2, '3.9 Estado del servidor', anc()))
cap.append(para(['Esta pantalla indica si la aplicación puede comunicarse con el sistema. Se abre desde ', ('b', 'Mi cuenta → Estado del servidor'),
                 ' o manteniendo presionado el logotipo de CampusConectado en Avisos o en Inicia sesión. Muestra los tres servicios '
                 '(Avisos, Talleres e Inscripciones) con un indicador ', ('b', 'En línea'), ' o ', ('b', 'Sin respuesta'),
                 ', el tiempo de respuesta y la hora de la última revisión. El botón ', ('b', 'Volver a revisar'), ' repite la prueba.']))
add(capturas([('17_estado_servidor.png', 'Estado del servidor')]))

cap.append(heading(2, '3.10 Mensajes de la aplicación y cómo resolverlos', anc()))
cap.append(para('Debajo de algunos mensajes aparece un texto pequeño con el detalle que envió el sistema; es útil al reportar un problema a soporte.'))
add(tabla([2900, 3300, 4024], ['Mensaje en la aplicación', 'Qué significa', 'Qué hacer'], [
    ['Número de control o contraseña incorrectos', 'Alguno de los dos datos no coincide.', 'Revise los 8 dígitos y las 4 primeras letras de la CURP.'],
    ['Ese taller no existe / No encontramos el taller #N', 'El número de taller no está en el catálogo.', 'Revise el número o elija un taller de la lista.'],
    ['Faltan datos', 'Falta el número de control, el nombre o el taller.', 'Elija un taller y revise que el nombre esté capturado en Mi cuenta.'],
    ['Ya estás inscrito', 'El alumno ya tiene lugar en ese taller.', 'No se requiere ninguna acción. Puede verlo en Mis inscripciones.'],
    ['Talleres no responde', 'El sistema no pudo confirmar el taller en ese momento.', 'Espere un momento y toque Inscribirme otra vez.'],
    ['Sin conexión con el campus', 'El celular no tiene Internet o el sistema no respondió a tiempo.',
     'Revise los datos móviles o el wifi (y que no esté activo el modo avión) y toque Reintentar. Si persiste, revise Estado del servidor.'],
    ['Algo no salió', 'Ocurrió un error inesperado.', 'Intente de nuevo en un momento; si persiste, contacte a soporte (capítulo 12).'],
]))
add(capturas([('18_sin_conexion.png', 'Sin conexión con el campus'), ('19_ya_inscrito.png', 'Ya estás inscrito')]))

# insertar antes del antiguo capítulo 3 (ahora 4)
cap4 = buscar(lambda s: s.startswith('4. Verificar que el sistema'))
for el in cap:
    cap4.addprevious(el)

# ---------- 3. Ajustes en capítulos finales ----------
c9 = buscar(lambda s: s.startswith('9. Mensajes del sistema'))
c9.addnext(para(['Esta tabla describe las respuestas de los servicios al consultarlos desde el navegador o la terminal. '
                 'Los mensajes que muestra la aplicación móvil se explican en la sección 3.10.']))

bp = buscar(lambda s: s.startswith('Escriba siempre las matrículas en'))
nb = copy.deepcopy(bp)
for t in nb.iter(WNS + 't'):
    t.text = ''
next(nb.iter(WNS + 't')).text = ('Siempre que sea posible, pida a los alumnos que se inscriban desde la aplicación móvil: valida los datos '
                                 'y envía la matrícula en mayúsculas automáticamente.')
bp.addprevious(nb)

# FAQ nuevas al final de Preguntas frecuentes
c12 = buscar(lambda s: s.startswith('12. Soporte'))
faq = [
    ('¿La aplicación funciona en iPhone?', 'No. En esta versión la aplicación está disponible solo para celulares Android.'),
    ('¿Qué hago si no recuerdo la contraseña de la aplicación?', 'La contraseña son las 4 primeras letras de la CURP del alumno, en mayúsculas o minúsculas.'),
    ('La aplicación dice «Sin conexión con el campus», pero el celular tiene Internet. ¿Qué pasa?',
     'Abra Estado del servidor (sección 3.9). Si los servicios aparecen «Sin respuesta», el problema está en el sistema y no en el celular: '
     'espere unos minutos y, si continúa, contacte a soporte.'),
    ('¿Las inscripciones hechas en la aplicación se ven en el navegador?',
     'Sí. La aplicación y el navegador consultan los mismos servicios. En el navegador, use el número de control como matrícula (capítulo 8).'),
]
for q, a in faq:
    c12.addprevious(heading(3, q, anc()))
    c12.addprevious(para(a))

sop = buscar(lambda s: s.startswith('Al reportar un problema, indique'))
sop.addnext(para('Si el problema ocurre en la aplicación móvil, incluya además una captura de la pantalla Estado del servidor.'))

# ---------- 4. Índice regenerado ----------
idx_ini = buscar(lambda s: s == 'Índice')
viejos = []
e = idx_ini.getnext()
while texto_p(e) != '' or e.find('.//' + WNS + 'br') is None:
    viejos.append(e)
    e = e.getnext()
nivel1_tpl, nivel2_tpl = viejos[0], viejos[1]
for v in viejos:
    v.getparent().remove(v)

def linea_indice(tpl, texto, anchor, pag):
    n = copy.deepcopy(tpl)
    n.find('.//' + WNS + 'hyperlink').set(WNS + 'anchor', anchor)
    ts = list(n.iter(WNS + 't'))
    ts[0].text = texto
    ts[1].text = '\t' + str(pag)
    return n

ancla = idx_ini
for el in body.iterchildren():
    if el.tag != WNS + 'p':
        continue
    ps = el.find(WNS + 'pPr/' + WNS + 'pStyle')
    est = ps.get(WNS + 'val') if ps is not None else ''
    if est not in ('Heading1', 'Heading2'):
        continue
    bm = el.find(WNS + 'bookmarkStart')
    txt = texto_p(el)
    nl = linea_indice(nivel1_tpl if est == 'Heading1' else nivel2_tpl, txt, bm.get(WNS + 'name'), PAGINAS.get(txt, 0))
    ancla.addnext(nl)
    ancla = nl

d.save(SAL)
print('ok', SAL)
