import re, sys, json, subprocess, html
src, out_html, out_pdf, pags_json = sys.argv[1:5]
pags = json.load(open(pags_json)) if pags_json != '-' else {}
s = open(src, encoding='utf-8').read()
toc = []
for m in re.finditer(r'<h([12]) id="([^"]+)"[^>]*>(.*?)</h\1>', s):
    lvl, hid, txt = m.groups()
    txt = html.unescape(re.sub(r'<span class="nuevo">.*?</span>', '', txt)).strip()
    toc.append((lvl, hid, txt))
lines = ''.join(f'<div class="l{l}"><a href="#{i}">{html.escape(t)}</a><span class="fill"></span><span>{pags.get(t, 0)}</span></div>' for l, i, t in toc)
open(out_html, 'w', encoding='utf-8').write(s.replace('<!--TOC-->', lines))
subprocess.run(['node', 'scripts/pdf.js', out_html, out_pdf], check=True)
n = int(re.search(r'Pages:\s+(\d+)', subprocess.run(['pdfinfo', out_pdf], capture_output=True, text=True).stdout).group(1))
res = {}
for p in range(3, n + 1):
    t = subprocess.run(['pdftotext', '-f', str(p), '-l', str(p), '-layout', out_pdf, '-'], capture_output=True, text=True).stdout
    for l in t.splitlines():
        l = re.sub(r'\s+NUEVO 1\.1\s*$', '', l.strip())
        for _, _, txt in toc:
            if txt not in res and l == txt:
                res[txt] = p
faltan = [t for _, _, t in toc if t not in res]
json.dump(res, open('paginas_tecnico.json', 'w'), ensure_ascii=False)
print('paginas', n, 'encontrados', len(res), 'de', len(toc), 'faltan', faltan, 'cambio' if res != pags else 'estable')
