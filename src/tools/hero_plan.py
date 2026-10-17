#!/usr/bin/env python3
"""Plans isométriques du fourgon (SVG inline) : hero, section Lundi→Dimanche, configurateur.
Projection isométrique : X = (x - z)·cos30, Y = (x + z)·sin30 - y. Les plans sont injectés entre
<!-- PLAN:START --> … <!-- PLAN:END -->, <!-- PLAN2:START --> … et <!-- PLAN3:START --> … dans les pages."""
import math, re, os
C, S = math.cos(math.radians(30)), math.sin(math.radians(30))
SC = 104.0
OX, OY = 262.0, 262.0
def P(x, y, z): return (OX + (x - z) * C * SC, OY + (x + z) * S * SC - y * SC)
def f(v): return f"{v:.1f}"
def path(pts3, close=False):
    d = " ".join(("M" if i == 0 else "L") + f(px) + " " + f(py) for i, (px, py) in enumerate(P(*p) for p in pts3))
    return d + (" Z" if close else "")
def line(a, b): return path([a, b])
W, L, FL = 1.95, 5.45, 0.56
prof = [(0.0, 0.36), (5.0, 0.36), (5.36, 0.52), (5.45, 0.88), (5.38, 1.04), (5.12, 1.13), (4.55, 1.22), (3.92, 1.93), (3.7, 1.99), (0.16, 1.99), (0.0, 1.88)]
near = [(x, y, W) for x, y in prof]; far = [(x, y, 0.0) for x, y in prof]
def circle(cx, cy, r, zc, n=40): return path([(cx + r * math.cos(2 * math.pi * k / n), cy + r * math.sin(2 * math.pi * k / n), zc) for k in range(n)], True)
def arc(cx, cy, r, zc, a0, a1, n=20): return path([(cx + r * math.cos(math.radians(a0 + (a1 - a0) * k / n)), cy + r * math.sin(math.radians(a0 + (a1 - a0) * k / n)), zc) for k in range(n + 1)])
def box(x0, x1, y0, y1, z0, z1, cls=""):
    top = path([(x0, y1, z0), (x1, y1, z0), (x1, y1, z1), (x0, y1, z1)], True)
    front = path([(x1, y0, z0), (x1, y1, z0), (x1, y1, z1), (x1, y0, z1)], True)
    side = path([(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)], True)
    return f'<path class="f-side {cls}" d="{side}"/><path class="f-front {cls}" d="{front}"/><path class="f-top {cls}" d="{top}"/>'
def seat(x, zc, i):
    return f'<g class="seat" data-i="{i}">{box(x - 0.25, x + 0.25, FL + 0.08, FL + 0.2, zc - 0.25, zc + 0.25)}{box(x - 0.3, x - 0.2, FL + 0.2, FL + 0.78, zc - 0.25, zc + 0.25)}</g>'
SEATS = [(3.95, 0.45), (3.95, 1.5), (2.95, 0.38), (2.95, 0.975), (2.95, 1.57), (2.05, 0.5), (2.05, 1.45)]

def build(callouts=True, dims=True, fills=False, cargo=False, terrain=False, label="Plan isométrique d'un Ford Transit Custom aménagé cabine approfondie", extra_class=""):
    out = []
    def add(cls, d, extra=""): out.append(f'<path class="{cls}" d="{d}"{extra}/>')
    z = W + 0.004
    add("ln ghost", path([(0, 0, 0), (L, 0, 0), (L, 0, W), (0, 0, W)], True))
    if terrain:
        pts = [(-0.7, 0.02, W + 0.4), (0.5, 0.16, W + 0.4), (1.6, -0.04, W + 0.4), (2.8, 0.2, W + 0.4), (4.0, 0.02, W + 0.4), (5.2, 0.24, W + 0.4), (6.3, 0.08, W + 0.4)]
        add("ln terrain", path(pts))
        add("ln terrain", path([(x, y - 0.14, zz) for x, y, zz in pts]))
    add("ln hidden", path(far, True)); add("ln hidden", line((0, 0.36, 0), (0, 0.36, W)))
    for cx in (4.3, 0.98): add("ln hidden", circle(cx, 0.36, 0.36, -0.03))
    # ---- intérieur (sous les remplissages de carrosserie) ----
    out.append('<g class="layer interior">')
    out.append(f'<path class="ln floor" d="{path([(0.1, FL, 0.1), (L - 0.9, FL, 0.1), (L - 0.9, FL, W - 0.1), (0.1, FL, W - 0.1)], True)}"/>')
    out.append(f'<path class="ln rail" d="{line((0.4, FL + 0.02, 0.55), (3.6, FL + 0.02, 0.55))}"/><path class="ln rail" d="{line((0.4, FL + 0.02, 1.4), (3.6, FL + 0.02, 1.4))}"/>')
    if cargo:
        out.append(f'<g class="cargo">{box(0.35, 1.05, FL, FL + 0.62, 0.3, 1.0, "crate")}{box(1.1, 1.5, FL, FL + 0.46, 0.45, 1.05, "crate")}{box(0.45, 0.95, FL, FL + 0.4, 1.15, 1.72, "crate red")}<path class="ln rim" d="{line((0.3, FL + 0.9, 1.55), (3.4, FL + 0.9, 1.55))}"/></g>')
    out.append(f'<path class="fill wall" d="{path([(1.55, FL, 0.12), (1.55, FL, W - 0.12), (1.55, 1.9, W - 0.12), (1.55, 1.9, 0.12)], True)}"/>')
    for i, (sx, sz) in enumerate(SEATS): out.append(seat(sx, sz, i))
    out.append(f'<g class="table">{box(3.25, 3.7, FL + 0.74, FL + 0.78, 0.65, 1.3)}<path class="ln rim" d="{line((3.47, FL, 0.97), (3.47, FL + 0.74, 0.97))}"/></g>')
    out.append('</g>')
    # ---- carrosserie (remplissages optionnels) ----
    if fills:
        out.append('<g class="layer paint">')
        for i in range(1, 9):
            (x0, y0), (x1, y1) = prof[i], prof[i + 1]
            out.append(f'<path class="f-face" d="{path([(x0, y0, 0), (x0, y0, W), (x1, y1, W), (x1, y1, 0)], True)}"/>')
        out.append(f'<path class="f-roof" d="{path([(3.7, 1.99, 0), (3.7, 1.99, W), (0.16, 1.99, W), (0.16, 1.99, 0)], True)}"/>')
        out.append(f'<path class="f-flank" d="{path(near, True)}"/>')
        out.append('</g>')
    for i in range(1, 9):
        x, y = prof[i]; add("ln body", line((x, y, 0), (x, y, W)))
    for i in (8, 9, 10):
        x, y = prof[i]; add("ln body", line((x, y, 0), (x, y, W)))
    add("ln body main", path(near, True))
    add("fill glass", path([(4.55, 1.22, 0.12), (4.55, 1.22, W - 0.12), (3.92, 1.93, W - 0.12), (3.92, 1.93, 0.12)], True))
    for pts in ([(4.42, 1.3), (3.5, 1.3), (3.5, 1.88), (3.95, 1.88)], [(3.34, 1.32), (2.12, 1.32), (2.12, 1.88), (3.34, 1.88)], [(1.96, 1.32), (0.72, 1.32), (0.72, 1.88), (1.96, 1.88)]):
        add("fill glass", path([(x, y, z) for x, y in pts], True))
    add("ln seam", line((3.42, 0.46, z), (3.42, 1.92, z))); add("ln seam", line((2.04, 0.46, z), (2.04, 1.3, z)))
    add("ln red-line", line((0.25, 0.68, z + 0.002), (4.8, 0.68, z + 0.002)))
    add("fill lamp", path([(5.4, 0.96, 0.1), (5.4, 0.96, 0.55), (5.4, 1.06, 0.55), (5.4, 1.06, 0.1)], True))
    add("fill lamp", path([(5.4, 0.96, W - 0.1), (5.4, 0.96, W - 0.55), (5.4, 1.06, W - 0.55), (5.4, 1.06, W - 0.1)], True))
    add("ln seam plate", path([(5.44, 0.58, 0.7), (5.44, 0.58, 1.25), (5.44, 0.72, 1.25), (5.44, 0.72, 0.7)], True))
    for cx in (4.3, 0.98):
        add("ln body", arc(cx, 0.36, 0.5, z, 0, 180)); add("fill tire", circle(cx, 0.36, 0.36, W + 0.06))
        add("ln body wheel", circle(cx, 0.36, 0.36, W + 0.06)); add("ln rim wheel", circle(cx, 0.36, 0.21, W + 0.09)); add("ln hub wheel", circle(cx, 0.36, 0.06, W + 0.1))
    add("ln axle", line((4.3, 0.36, W - 0.2), (0.98, 0.36, W - 0.2)))
    # ---- toit relevable ----
    out.append(f'<g class="layer pop pop-closed"><path class="ln body" d="{path([(0.55, 2.02, 0.16), (3.45, 2.02, 0.16), (3.45, 2.02, W - 0.16), (0.55, 2.02, W - 0.16)], True)}"/></g>')
    op = [(0.55, 2.02, 0.16), (3.45, 2.95, 0.16), (3.45, 2.95, W - 0.16), (0.55, 2.02, W - 0.16)]
    out.append('<g class="layer pop pop-open">')
    out.append(f'<path class="fill bellows" d="{path([(0.55, 2.02, W - 0.16), (3.45, 2.02, W - 0.16), (3.45, 2.95, W - 0.16)], True)}"/>')
    out.append(f'<path class="fill bellows" d="{path([(0.55, 2.02, 0.16), (3.45, 2.02, 0.16), (3.45, 2.95, 0.16)], True)}"/>')
    out.append(f'<path class="fill panel" d="{path(op, True)}"/><path class="ln body" d="{path(op, True)}"/>')
    out.append(f'<path class="ln body" d="{line((3.45, 2.02, 0.16), (3.45, 2.95, 0.16))}"/><path class="ln body" d="{line((3.45, 2.02, W - 0.16), (3.45, 2.95, W - 0.16))}"/>')
    out.append(f'<path class="fill bed" d="{path([(0.9, 2.3, 0.3), (3.0, 2.3, 0.3), (3.0, 2.3, W - 0.3), (0.9, 2.3, W - 0.3)], True)}"/>')
    out.append('</g>')
    # ---- cotes ----
    if dims:
        def dim(a, b, lab, cls="", dx=0, dy=0, anchor="middle"):
            (ax, ay), (bx, by) = P(*a), P(*b); mx, my = (ax + bx) / 2 + dx, (ay + by) / 2 + dy
            return (f'<g class="dim {cls}"><path class="ln dimline" d="M{f(ax)} {f(ay)} L{f(bx)} {f(by)}"/><path class="ln dimline" d="M{f(ax)} {f(ay-7)} L{f(ax)} {f(ay+7)} M{f(bx)} {f(by-7)} L{f(bx)} {f(by+7)}"/>'
                    f'<text class="dimtxt" x="{f(mx)}" y="{f(my)}" text-anchor="{anchor}">{lab}</text></g>')
        out.append(dim((0, -0.22, W + 0.42), (L, -0.22, W + 0.42), "L2 · 5 450 mm", "dim-l", dx=-6, dy=22))
        out.append(dim((L + 0.5, 0.0, W + 0.05), (L + 0.5, 1.99, W + 0.05), "H1 · 1 990 mm", "dim-h", dx=16, dy=4, anchor="start"))
        out.append(dim((L + 0.3, -0.22, 0), (L + 0.3, -0.22, W), "2 000 mm", "dim-w", dx=28, dy=14, anchor="start"))
    # ---- repères ----
    if callouts:
        def callout(idx, anchor3, bx, by, title, value, w=300):
            ax, ay = P(*anchor3); tx = bx + 16
            return (f'<g class="callout" data-c="{idx}"><path class="ln leader" d="M{f(ax)} {f(ay)} L{f(bx + (0 if bx > ax else w))} {f(by + 32)}"/>'
                    f'<rect class="diamond" x="{f(ax-5)}" y="{f(ay-5)}" width="10" height="10" transform="rotate(45 {f(ax)} {f(ay)})"/>'
                    f'<g class="label"><rect x="{f(bx)}" y="{f(by)}" width="{w}" height="64" class="box"/><text class="ltitle" x="{f(tx)}" y="{f(by+24)}">{title}</text><text class="lvalue" x="{f(tx)}" y="{f(by+50)}">{value}</text></g></g>')
        out.append(callout(0, (2.05, FL + 0.8, 1.45), 10, 44, "CABINE SPECIPRO", "2 → 7 places en 3 minutes", 290))
        out.append(callout(1, (3.45, 2.95, 1.0), 548, 6, "TOIT RELEVABLE", "Lit intégré, grand débattement", 330))
        out.append(callout(2, (4.3, 0.36, W + 0.06), 580, 500, "4X4 · TRAIL, 4MOTION", "Motricité en toutes conditions", 310))
        out.append(callout(3, (0.0, 0.62, 1.0), 10, 470, "HOMOLOGUÉ DREAL", "100 % des véhicules · carte grise CTTE", 340))
    return (f'<svg class="plan {extra_class}" viewBox="0 0 900 600" fill="none" role="img" aria-label="{label}">\n' + "\n".join(out) + '\n</svg>')

here = os.path.dirname(os.path.abspath(__file__)); pages = os.path.join(here, '..', 'pages')
def inject(page, marker, svg):
    p = os.path.join(pages, page); s = open(p, encoding='utf8').read()
    new = re.sub(rf'<!-- {marker}:START -->.*?<!-- {marker}:END -->', f'<!-- {marker}:START -->\n{svg}\n<!-- {marker}:END -->', s, flags=re.S)
    assert f'<!-- {marker}:START -->' in s, f"marqueur {marker} introuvable dans {page}"
    open(p, 'w', encoding='utf8').write(new); print(f"{page} · {marker} : {len(svg)} octets")
inject('index.html', 'PLAN', build())
inject('index.html', 'PLAN2', build(callouts=False, dims=False, cargo=True, terrain=True, label="Plan isométrique du fourgon selon le moment de la semaine", extra_class="plan--states"))
inject('vehicules-ford-transit-custom-cabine-approfondie.html', 'PLAN3', build(callouts=False, dims=True, fills=True, label="Plan isométrique du Ford Transit Custom configuré", extra_class="plan--config"))
