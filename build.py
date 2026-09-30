#!/usr/bin/env python3
"""Assemble les pages du site AUTO N°1 : src/pages/*.html + src/partials → site/.
Usage : python3 build.py
"""
import re, os, glob, datetime
ROOT = os.path.dirname(os.path.abspath(__file__))
SRC, OUT = os.path.join(ROOT, 'src'), os.path.join(ROOT, 'site')
partials = {n: open(os.path.join(SRC, 'partials', n + '.html'), encoding='utf8').read() for n in ('head', 'nav', 'footer')}
pages = sorted(glob.glob(os.path.join(SRC, 'pages', '*.html')))
urls = []
for p in pages:
    raw = open(p, encoding='utf8').read()
    m = re.match(r'\s*<!--meta(.*?)-->\s*(.*)', raw, flags=re.S)
    meta = dict(re.findall(r'^\s*([a-z]+):\s*(.*?)\s*$', m.group(1), flags=re.M)); body = m.group(2)
    path = meta['path']; depth = path.count('/'); root = '../' * depth
    scripts = ''
    if 'three' in meta.get('scripts', ''):
        scripts = f'<script src="{root}assets/vendor/three.min.js"></script>\n<script src="{root}assets/js/van3d.js"></script>'
    vars_ = {'ROOT': root, 'TITLE': meta['title'], 'DESC': meta['description'], 'CANONICAL': meta.get('canonical', path.replace('index.html', '')),
             'OGIMG': meta.get('ogimg', 'showroom-facade.jpg'), 'PAGE': meta.get('page', ''), 'BODYCLASS': meta.get('bodyclass', ''), 'SCRIPTS': scripts}
    html = partials['head'] + partials['nav'] + body + partials['footer']
    for k, v in vars_.items(): html = html.replace('{{' + k + '}}', v)
    out = os.path.join(OUT, path); os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, 'w', encoding='utf8').write(html)
    urls.append(vars_['CANONICAL']); print(f'  ✓ {path}')
today = datetime.date.today().isoformat()
open(os.path.join(OUT, 'sitemap.xml'), 'w').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(f'  <url><loc>https://www.auton1.net/{u}</loc><lastmod>{today}</lastmod></url>\n' for u in urls) + '</urlset>\n')
open(os.path.join(OUT, 'robots.txt'), 'w').write('User-agent: *\nAllow: /\nSitemap: https://www.auton1.net/sitemap.xml\n')
print(f'{len(pages)} pages générées dans site/')
