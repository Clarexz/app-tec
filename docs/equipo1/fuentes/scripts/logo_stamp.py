import sys
from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.lib.pagesizes import letter
inp, logo, out, tmp = sys.argv[1:5]
c = canvas.Canvas(tmp, pagesize=letter)
w = 24 * mm; h = w * 237 / 1024
c.drawImage(logo, 18 * mm, letter[1] - 21 * mm, width=w, height=h, mask='auto')
c.save()
stamp = PdfReader(tmp).pages[0]
r = PdfReader(inp); wtr = PdfWriter()
for i, p in enumerate(r.pages):
    if i > 0:
        p.merge_page(stamp)
    wtr.add_page(p)
wtr.add_metadata({'/Title': 'Manual técnico de servicios e integración', '/Author': 'Ravyn Studio', '/Subject': 'CampusConectado'})
wtr.write(out)
