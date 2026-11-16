import sys
from PIL import Image, ImageDraw, ImageFont
out = sys.argv[1]
items = [l.split('|') for l in sys.argv[2:]]
fb = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'
fr = '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'
fm = '/usr/share/fonts/truetype/liberation/LiberationMono-Regular.ttf'
W, H = 540, 1100
for name, label in items:
    im = Image.new('RGB', (W, H), '#FFFFFF')
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([6, 6, W-7, H-7], radius=48, outline='#141414', width=6, fill='#FFF6E6')
    d.rounded_rectangle([W//2-60, 26, W//2+60, 40], radius=7, fill='#141414')
    d.rounded_rectangle([40, 120, W-40, H-160], radius=22, outline='#E5097F', width=4)
    def c(y, t, f, size, col):
        font = ImageFont.truetype(f, size)
        lines = []
        for para in t.split('\n'):
            cur = ''
            for w in para.split(' '):
                tr = (cur + ' ' + w).strip()
                if d.textlength(tr, font=font) > W-120 and cur:
                    lines.append(cur); cur = w
                else: cur = tr
            lines.append(cur)
        for ln in lines:
            d.text(((W - d.textlength(ln, font=font))/2, y), ln, font=font, fill=col); y += size*1.3
        return y
    y = c(H//2-170, 'CAPTURA PENDIENTE', fb, 30, '#A8055E')
    y = c(y+30, label, fr, 34, '#141414')
    c(y+40, 'capturas/' + name, fm, 19, '#555555')
    c(H-120, 'Reemplazar por la captura del celular', fr, 22, '#777777')
    im.save(f'{out}/{name}')
