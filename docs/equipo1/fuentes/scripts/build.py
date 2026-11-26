"""Genera el PDF de la documentación del Equipo 1 a partir del HTML.

Uso (desde docs/equipo1/fuentes/, con Chromium, Playwright, poppler-utils, pypdf y reportlab):
    python3 scripts/build.py documentacion_equipo1.html ../Documentacion_Equipo1_App_CampusConectado.pdf

Hace dos pasadas: la primera calcula en qué página cae cada título para llenar el índice,
la segunda genera el PDF definitivo. Al final estampa el logo en el encabezado.
"""
import html, json, os, re, subprocess, sys, tempfile

src, salida = sys.argv[1:3]
aqui = os.path.dirname(os.path.abspath(src))
base = open(src, encoding='utf-8').read()
toc = []
for m in re.finditer(r'<h([12]) id="([^"]+)"[^>]*>(.*?)</h\1>', base):
    lvl, hid, txt = m.groups()
    toc.append((lvl, hid, html.unescape(re.sub(r'<[^>]+>', '', txt)).strip()))

tmp = tempfile.mkdtemp()
tmp_html = os.path.join(aqui, '_build.html')  # junto a las imágenes para que carguen
tmp_pdf = os.path.join(tmp, 'doc.pdf')


def render(pags):
    lineas = ''.join(
        f'<div class="l{l}"><a href="#{i}">{html.escape(t)}</a><span class="fill"></span><span>{pags.get(t, 0)}</span></div>'
        for l, i, t in toc)
    open(tmp_html, 'w', encoding='utf-8').write(base.replace('<!--TOC-->', lineas))
    subprocess.run(['node', os.path.join(os.path.dirname(__file__), 'pdf.js'), tmp_html, tmp_pdf], check=True)
    n = int(re.search(r'Pages:\s+(\d+)', subprocess.run(['pdfinfo', tmp_pdf], capture_output=True, text=True).stdout).group(1))
    res = {}
    for p in range(3, n + 1):
        t = subprocess.run(['pdftotext', '-f', str(p), '-l', str(p), '-layout', tmp_pdf, '-'], capture_output=True, text=True).stdout
        for linea in t.splitlines():
            linea = re.sub(r'\s+', ' ', linea.strip())
            for _, _, txt in toc:
                if txt not in res and linea == re.sub(r'\s+', ' ', txt):
                    res[txt] = p
    return n, res


pags = {}
for _ in range(3):
    n, nuevas = render(pags)
    if nuevas == pags:
        break
    pags = nuevas
faltan = [t for _, _, t in toc if t not in pags]
print('páginas:', n, '· títulos ubicados:', len(pags), 'de', len(toc), '· faltan:', faltan)
os.remove(tmp_html)

# Logo en el encabezado (todas las páginas menos la portada)
from pypdf import PdfReader, PdfWriter
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas

sello = os.path.join(tmp, 'sello.pdf')
c = canvas.Canvas(sello, pagesize=letter)
w = 24 * mm
c.drawImage(os.path.join(aqui, 'img', 'logo.png'), 18 * mm, letter[1] - 21 * mm, width=w, height=w * 237 / 1024, mask='auto')
c.save()
marca = PdfReader(sello).pages[0]
r = PdfReader(tmp_pdf)
wr = PdfWriter()
for i, p in enumerate(r.pages):
    if i > 0:
        p.merge_page(marca)
    wr.add_page(p)
wr.add_metadata({'/Title': 'Documentación del Equipo 1: cómo construimos la app CampusConectado',
                 '/Author': 'Ravyn Studio · Equipo 1', '/Subject': 'CampusConectado'})
wr.write(salida)
print('listo:', salida)
