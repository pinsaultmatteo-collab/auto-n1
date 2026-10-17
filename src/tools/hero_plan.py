#!/usr/bin/env python3
"""Génère le plan isométrique du fourgon (SVG inline) du hero et l'injecte dans src/pages/index.html
entre <!-- PLAN:START --> et <!-- PLAN:END -->. Projection isométrique : X = (x - z)·cos30, Y = (x + z)·sin30 - y."""
import math, re, os
C, S = math.cos(math.radians(30)), math.sin(math.radians(30))
SC = 104.0            # px par mètre
OX, OY = 262.0, 262.0 # origine
def P(x, y, z):
    return (OX + (x - z) * C * SC, OY + (x + z) * S * SC - y * SC)
def f(v): return f"{v:.1f}"
def path(pts3, close=False):
    d = " ".join(("M" if i == 0 else "L") + f(px) + " " + f(py) for i, (px, py) in enumerate(P(*p) for p in pts3))
    return d + (" Z" if close else "")
def line(a, b): return path([a, b])

W = 1.95   # largeur
L = 5.45   # longueur L2
# Profil latéral (x, y) de l'arrière vers l'avant, puis toit
prof = [(0.0, 0.36), (5.0, 0.36), (5.36, 0.52), (5.45, 0.88), (5.38, 1.04), (5.12, 1.13), (4.55, 1.22), (3.92, 1.93), (3.7, 1.99), (0.16, 1.99), (0.0, 1.88)]
near = [(x, y, W) for x, y in prof]
far = [(x, y, 0.0) for x, y in prof]

out = []
def add(cls, d, extra=""): out.append(f'<path class="{cls}" d="{d}"{extra}/>')

# ---- Empreinte au sol (pointillés) ----
add("ln ghost", path([(0, 0, 0), (L, 0, 0), (L, 0, W), (0, 0, W)], True))
# ---- Lignes cachées : flanc éloigné + arêtes arrière ----
add("ln hidden", path(far, True))
add("ln hidden", line((0, 0.36, 0), (0, 0.36, W)))
# ---- Face avant : arêtes transversales visibles ----
for i in range(1, 9):
    x, y = prof[i]
    add("ln body", line((x, y, 0), (x, y, W)))
# ---- Toit : arêtes transversales ----
for i in (8, 9, 10):
    x, y = prof[i]
    add("ln body", line((x, y, 0), (x, y, W)))
# ---- Flanc proche ----
add("ln body main", path(near, True))
# ---- Pare-brise ----
add("fill glass", path([(4.55, 1.22, 0.12), (4.55, 1.22, W - 0.12), (3.92, 1.93, W - 0.12), (3.92, 1.93, 0.12)], True))
# ---- Vitres latérales (flanc proche) ----
z = W + 0.004
for pts in ([(4.42, 1.3), (3.5, 1.3), (3.5, 1.88), (3.95, 1.88)], [(3.34, 1.32), (2.12, 1.32), (2.12, 1.88), (3.34, 1.88)], [(1.96, 1.32), (0.72, 1.32), (0.72, 1.88), (1.96, 1.88)]):
    add("fill glass", path([(x, y, z) for x, y in pts], True))
# ---- Joints de portes, bas de caisse, liseré ----
add("ln seam", line((3.42, 0.46, z), (3.42, 1.92, z)))
add("ln seam", line((2.04, 0.46, z), (2.04, 1.3, z)))
add("ln red-line", line((0.25, 0.68, z + 0.002), (4.8, 0.68, z + 0.002)))
# ---- Optiques avant & plaque ----
add("fill lamp", path([(5.4, 0.96, 0.1), (5.4, 0.96, 0.55), (5.4, 1.06, 0.55), (5.4, 1.06, 0.1)], True))
add("fill lamp", path([(5.4, 0.96, W - 0.1), (5.4, 0.96, W - 0.55), (5.4, 1.06, W - 0.55), (5.4, 1.06, W - 0.1)], True))
add("ln seam", path([(5.44, 0.58, 0.7), (5.44, 0.58, 1.25), (5.44, 0.72, 1.25), (5.44, 0.72, 0.7)], True))
# ---- Roues (cercles dans le plan x-y) ----
def circle(cx, cy, r, zc, n=40):
    return path([(cx + r * math.cos(2 * math.pi * k / n), cy + r * math.sin(2 * math.pi * k / n), zc) for k in range(n)], True)
def arc(cx, cy, r, zc, a0, a1, n=20):
    return path([(cx + r * math.cos(math.radians(a0 + (a1 - a0) * k / n)), cy + r * math.sin(math.radians(a0 + (a1 - a0) * k / n)), zc) for k in range(n + 1)])
for cx in (4.3, 0.98):
    add("ln hidden", circle(cx, 0.36, 0.36, -0.03))
for cx in (4.3, 0.98):
    add("ln body", arc(cx, 0.36, 0.5, z, 0, 180))                   # passage de roue
    add("fill tire", circle(cx, 0.36, 0.36, W + 0.06))
    add("ln body", circle(cx, 0.36, 0.36, W + 0.06))
    add("ln rim wheel", circle(cx, 0.36, 0.21, W + 0.09))
    add("ln hub", circle(cx, 0.36, 0.06, W + 0.1))
# ---- Intérieur : plancher, cloison, sièges, table ----
FL = 0.56
interior = []
def box(x0, x1, y0, y1, z0, z1, cls=""):
    top = path([(x0, y1, z0), (x1, y1, z0), (x1, y1, z1), (x0, y1, z1)], True)
    front = path([(x1, y0, z0), (x1, y1, z0), (x1, y1, z1), (x1, y0, z1)], True)
    side = path([(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)], True)
    return f'<path class="f-side {cls}" d="{side}"/><path class="f-front {cls}" d="{front}"/><path class="f-top {cls}" d="{top}"/>'
def seat(x, zc, i):
    base = box(x - 0.25, x + 0.25, FL + 0.08, FL + 0.2, zc - 0.25, zc + 0.25)
    back = box(x - 0.3, x - 0.2, FL + 0.2, FL + 0.78, zc - 0.25, zc + 0.25)
    return f'<g class="seat" data-i="{i}">{base}{back}</g>'
out.append('<g class="layer interior" id="plan-interior">')
out.append(f'<path class="ln floor" d="{path([(0.1, FL, 0.1), (L - 0.9, FL, 0.1), (L - 0.9, FL, W - 0.1), (0.1, FL, W - 0.1)], True)}"/>')
out.append(f'<path class="ln rail" d="{line((0.4, FL + 0.02, 0.55), (3.6, FL + 0.02, 0.55))}"/><path class="ln rail" d="{line((0.4, FL + 0.02, 1.4), (3.6, FL + 0.02, 1.4))}"/>')
out.append(f'<path class="fill wall" d="{path([(1.55, FL, 0.12), (1.55, FL, W - 0.12), (1.55, 1.9, W - 0.12), (1.55, 1.9, 0.12)], True)}"/>')
seats = [(3.95, 0.45), (3.95, 1.5), (2.95, 0.38), (2.95, 0.975), (2.95, 1.57), (2.05, 0.5), (2.05, 1.45)]
for i, (sx, sz) in enumerate(seats): out.append(seat(sx, sz, i))
out.append(f'<g class="table">{box(3.25, 3.7, FL + 0.74, FL + 0.78, 0.65, 1.3)}<path class="ln rim" d="{line((3.47, FL, 0.97), (3.47, FL + 0.74, 0.97))}"/></g>')
out.append('</g>')
# ---- Toit relevable : fermé / ouvert ----
out.append(f'<g class="layer pop pop-closed" id="pop-closed"><path class="ln body" d="{path([(0.55, 2.02, 0.16), (3.45, 2.02, 0.16), (3.45, 2.02, W - 0.16), (0.55, 2.02, W - 0.16)], True)}"/></g>')
open_pts = [(0.55, 2.02, 0.16), (3.45, 2.95, 0.16), (3.45, 2.95, W - 0.16), (0.55, 2.02, W - 0.16)]
out.append('<g class="layer pop pop-open" id="pop-open">')
out.append(f'<path class="fill bellows" d="{path([(0.55, 2.02, W - 0.16), (3.45, 2.02, W - 0.16), (3.45, 2.95, W - 0.16)], True)}"/>')
out.append(f'<path class="fill bellows" d="{path([(0.55, 2.02, 0.16), (3.45, 2.02, 0.16), (3.45, 2.95, 0.16)], True)}"/>')
out.append(f'<path class="fill panel" d="{path(open_pts, True)}"/>')
out.append(f'<path class="ln body" d="{path(open_pts, True)}"/>')
out.append(f'<path class="ln body" d="{line((3.45, 2.02, 0.16), (3.45, 2.95, 0.16))}"/><path class="ln body" d="{line((3.45, 2.02, W - 0.16), (3.45, 2.95, W - 0.16))}"/>')
out.append(f'<path class="fill bed" d="{path([(0.9, 2.3, 0.3), (3.0, 2.3, 0.3), (3.0, 2.3, W - 0.3), (0.9, 2.3, W - 0.3)], True)}"/>')
out.append('</g>')
# ---- Cotes ----
def dim(a, b, label, cls="", dx=0, dy=0, anchor="middle"):
    (ax, ay), (bx, by) = P(*a), P(*b)
    mx, my = (ax + bx) / 2 + dx, (ay + by) / 2 + dy
    return (f'<g class="dim {cls}"><path class="ln dimline" d="M{f(ax)} {f(ay)} L{f(bx)} {f(by)}"/>'
            f'<path class="ln dimline" d="M{f(ax)} {f(ay-7)} L{f(ax)} {f(ay+7)} M{f(bx)} {f(by-7)} L{f(bx)} {f(by+7)}"/>'
            f'<text class="dimtxt" x="{f(mx)}" y="{f(my)}" text-anchor="{anchor}">{label}</text></g>')
out.append(dim((0, -0.22, W + 0.42), (L, -0.22, W + 0.42), "L2 · 5 450 mm", "dim-l", dx=-6, dy=22))
out.append(dim((L + 0.5, 0.0, W + 0.05), (L + 0.5, 1.99, W + 0.05), "H1 · 1 990 mm", "dim-h", dx=16, dy=4, anchor="start"))
out.append(dim((L + 0.3, -0.22, 0), (L + 0.3, -0.22, W), "2 000 mm", "dim-w", dx=28, dy=14, anchor="start"))
# ---- Repères (callouts) ----
def callout(idx, anchor3, bx, by, title, value, w=300):
    ax, ay = P(*anchor3)
    tx = bx + 16
    return (f'<g class="callout" data-c="{idx}">'
            f'<path class="ln leader" d="M{f(ax)} {f(ay)} L{f(bx + (0 if bx > ax else w))} {f(by + 32)}"/>'
            f'<rect class="diamond" x="{f(ax-5)}" y="{f(ay-5)}" width="10" height="10" transform="rotate(45 {f(ax)} {f(ay)})"/>'
            f'<g class="label"><rect x="{f(bx)}" y="{f(by)}" width="{w}" height="64" class="box"/>'
            f'<text class="ltitle" x="{f(tx)}" y="{f(by+24)}">{title}</text><text class="lvalue" x="{f(tx)}" y="{f(by+50)}">{value}</text></g></g>')
out.append(callout(0, (2.05, FL + 0.8, 1.45), 10, 44, "CABINE SPECIPRO", "2 → 7 places en 3 minutes", 290))
out.append(callout(1, (3.45, 2.95, 1.0), 548, 6, "TOIT RELEVABLE", "Lit intégré, grand débattement", 330))
out.append(callout(2, (4.3, 0.36, W + 0.06), 580, 500, "4X4 · TRAIL, 4MOTION", "Motricité en toutes conditions", 310))
out.append(callout(3, (0.0, 0.62, 1.0), 10, 470, "HOMOLOGUÉ DREAL", "100 % des véhicules · carte grise CTTE", 340))

svg = ('<svg class="plan" viewBox="0 0 900 600" fill="none" role="img" aria-label="Plan isométrique d\'un Ford Transit Custom aménagé cabine approfondie">\n'
       + "\n".join(out) + '\n</svg>')
here = os.path.dirname(os.path.abspath(__file__)); page = os.path.join(here, '..', 'pages', 'index.html')
s = open(page, encoding='utf8').read()
new = re.sub(r'<!-- PLAN:START -->.*?<!-- PLAN:END -->', '<!-- PLAN:START -->\n' + svg + '\n<!-- PLAN:END -->', s, flags=re.S)
assert new != s or '<!-- PLAN:START -->' in s, "marqueurs PLAN introuvables"
open(page, 'w', encoding='utf8').write(new)
print("plan injecté :", len(out), "éléments,", len(svg), "octets")
