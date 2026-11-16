import sys, json, subprocess, docx, re
doc, pdf, out = sys.argv[1:4]
d = docx.Document(doc)
heads = [p.text for p in d.paragraphs if p.style.name in ('Heading 1', 'Heading 2')]
n = int(re.search(r'Pages:\s+(\d+)', subprocess.run(['pdfinfo', pdf], capture_output=True, text=True).stdout).group(1))
pags = [subprocess.run(['pdftotext', '-f', str(i), '-l', str(i), '-layout', pdf, '-'], capture_output=True, text=True).stdout for i in range(1, n + 1)]
res = {}
for h in heads:
    for i, t in enumerate(pags):
        if i < 2: continue  # portada e índice
        if any(l.strip() == h for l in t.splitlines()):
            res[h] = i + 1; break
    else:
        print('SIN PAGINA:', h)
json.dump(res, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print(len(res), 'de', len(heads))
