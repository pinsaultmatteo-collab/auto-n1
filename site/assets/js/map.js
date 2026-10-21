/* =====================================================================
   AUTO N°1 — Carte « Livrés partout en France »
   Fond : assets/data/france.js (FRANCE_DEPTS, projection équirectangulaire
   de la carte INDRA). Clients : assets/data/clients.js (AUTON1_CLIENTS,
   positions relevées sur la carte Le Bon Coin fournie par le client).
   Relief : deux couches décalées sous les départements + inclinaison 3D
   qui suit le pointeur. Points qui clignotent, trajets de livraison
   animés depuis Wimereux, info-bulle par département.
   ===================================================================== */
(function () {
  'use strict';
  const wrap = document.querySelector('[data-france-map]');
  const depts = window.FRANCE_DEPTS || [], clients = window.AUTON1_CLIENTS || [];
  if (!wrap || !depts.length) return;
  const NS = 'http://www.w3.org/2000/svg';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const K = Math.cos(46.5 * Math.PI / 180), proj = (lng, lat) => [(lng + 5.5) * K * 60, (51.3 - lat) * 60];
  const SITES = [
    { n: 'Wimereux', sub: 'Showroom & atelier · sur rendez-vous', lat: 50.7697, lng: 1.6125, main: true },
    { n: 'Paris', sub: 'Rendez-vous sur demande', lat: 48.8566, lng: 2.3522 }
  ];
  const el = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const stage = wrap.querySelector('.fmap__float') || wrap;
  const svg = el('svg', { viewBox: '0 0 640 600', class: 'fmap__svg', role: 'img', 'aria-label': 'Carte de France : les véhicules livrés par AUTO N°1 et ses deux points de vente, Wimereux et Paris' });
  const gT2 = el('g', { class: 'fmap__thick fmap__thick--2', transform: 'translate(0 8)' }, svg);
  const gT1 = el('g', { class: 'fmap__thick', transform: 'translate(0 4)' }, svg);
  const gD = el('g', { class: 'fmap__depts' }, svg), gR = el('g', { class: 'fmap__routes' }, svg), gC = el('g', { class: 'fmap__clients' }, svg), gH = el('g', { class: 'fmap__halos' }, svg), gS = el('g', { class: 'fmap__sites' }, svg);
  const byCode = {}, names = {}, counts = {};
  clients.forEach(c => { counts[c[2]] = (counts[c[2]] || 0) + 1; });
  depts.forEach(d => {
    el('path', { d: d.d }, gT2); el('path', { d: d.d }, gT1);
    const p = el('path', { d: d.d, class: 'fmap__dept' + (counts[d.c] ? ' has-clients' : ''), 'data-code': d.c, tabindex: 0 }, gD);
    p.appendChild(document.createElementNS(NS, 'title')).textContent = `${d.n} (${d.c})`;
    byCode[d.c] = p; names[d.c] = d.n;
  });
  // Points clients : chacun clignote à son rythme
  const pts = clients.map((c, i) => {
    const p = el('circle', { cx: c[0], cy: c[1], r: 2.3, class: 'fmap__pt', 'data-d': c[2] }, gC);
    p.style.setProperty('--d', (2.2 + (i * 7919 % 100) / 100 * 2.6).toFixed(2) + 's');
    p.style.setProperty('--delay', '-' + ((i * 104729 % 100) / 100 * 4).toFixed(2) + 's');
    return { el: p, x: c[0], y: c[1], d: c[2] };
  });
  // Points de vente
  const sites = SITES.map(s => {
    const [x, y] = proj(s.lng, s.lat);
    const g = el('g', { class: 'fmap__site' + (s.main ? ' is-main' : ''), transform: `translate(${x.toFixed(1)} ${y.toFixed(1)})` }, gS);
    el('circle', { r: 9, class: 'fmap__ring' }, g); if (s.main) el('circle', { r: 9, class: 'fmap__ring fmap__ring--2' }, g);
    el('rect', { x: -5, y: -5, width: 10, height: 10, transform: 'rotate(45)', class: 'fmap__diamond' }, g);
    g.appendChild(document.createElementNS(NS, 'title')).textContent = `${s.n} — ${s.sub}`;
    return Object.assign({ x, y, g }, s);
  });
  stage.appendChild(svg);
  const hub = sites[0];

  // Étiquettes HTML des points de vente + info-bulle (dans le même calque 3D)
  const labels = sites.map(s => { const l = document.createElement('div'); l.className = 'fmap__label' + (s.main ? ' fmap__label--main' : ''); l.innerHTML = `<b>${s.n}</b><small>${s.sub}</small>`; stage.appendChild(l); return l; });
  const tip = document.createElement('div'); tip.className = 'fmap__tip'; stage.appendChild(tip);
  const place = () => { const W = svg.clientWidth || 640, H = svg.clientHeight || 600; sites.forEach((s, i) => { labels[i].style.left = (s.x / 640 * W) + 'px'; labels[i].style.top = (s.y / 600 * H) + 'px'; }); };
  place(); addEventListener('resize', place);

  // Info-bulle par département
  let hiCode = null;
  const showTip = code => {
    const p = byCode[code]; if (!p) return;
    const n = counts[code] || 0, b = p.getBBox(), W = svg.clientWidth || 640, H = svg.clientHeight || 600;
    tip.innerHTML = `<b>${names[code]} <em>${code}</em></b><span>${n ? `${n} véhicule${n > 1 ? 's' : ''} livré${n > 1 ? 's' : ''}` : 'Livraison dans votre entreprise, comme partout en France'}</span>`;
    tip.style.left = ((b.x + b.width / 2) / 640 * W) + 'px'; tip.style.top = ((b.y + b.height / 2) / 600 * H) + 'px';
    tip.classList.add('is-on');
    if (hiCode !== code) { if (hiCode && byCode[hiCode]) byCode[hiCode].classList.remove('is-hi'); p.classList.add('is-hi'); hiCode = code; pts.forEach(q => q.el.classList.toggle('is-hi', q.d === code)); }
  };
  const hideTip = () => { tip.classList.remove('is-on'); if (hiCode && byCode[hiCode]) byCode[hiCode].classList.remove('is-hi'); hiCode = null; pts.forEach(q => q.el.classList.remove('is-hi')); };
  gD.addEventListener('mouseover', e => { const t = e.target.closest('.fmap__dept'); if (t) showTip(t.dataset.code); });
  gD.addEventListener('mouseleave', hideTip);
  gD.addEventListener('focusin', e => { const t = e.target.closest('.fmap__dept'); if (t) showTip(t.dataset.code); });
  gD.addEventListener('focusout', hideTip);
  gD.addEventListener('click', e => { const t = e.target.closest('.fmap__dept'); if (!t) return; if (hiCode === t.dataset.code && tip.classList.contains('is-on') && !fine) hideTip(); else showTip(t.dataset.code); });

  // Inclinaison 3D qui suit le pointeur (lissée), repos légèrement incliné
  const tilt = wrap.querySelector('.fmap__stage') || stage;
  let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
  const tick = () => { cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08; tilt.style.setProperty('--ry', cx.toFixed(2) + 'deg'); tilt.style.setProperty('--rx', cy.toFixed(2) + 'deg'); raf = (Math.abs(tx - cx) > 0.02 || Math.abs(ty - cy) > 0.02) ? requestAnimationFrame(tick) : 0; };
  const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
  if (fine && !reduce) {
    wrap.addEventListener('pointermove', e => { const r = wrap.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height; tx = (px - 0.5) * 18; ty = (0.5 - py) * 10; kick(); });
    wrap.addEventListener('pointerleave', () => { tx = 0; ty = 0; kick(); });
  }

  // Trajets de livraison animés depuis Wimereux + halos sur les points
  let live = false, timer = 0;
  const route = () => {
    const q = pts[Math.floor(Math.random() * pts.length)]; if (!q) return;
    const mx = (hub.x + q.x) / 2 + (q.y - hub.y) * 0.18, my = (hub.y + q.y) / 2 - (q.x - hub.x) * 0.18;
    const path = el('path', { d: `M${hub.x.toFixed(1)} ${hub.y.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${q.x} ${q.y}`, class: 'fmap__route' }, gR);
    const L = path.getTotalLength(); path.style.strokeDasharray = L; path.style.strokeDashoffset = L;
    const dur = 900 + L * 4;
    path.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }], { duration: dur, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' });
    setTimeout(() => {
      const h = el('circle', { cx: q.x, cy: q.y, r: 3, class: 'fmap__halo' }, gH); q.el.classList.add('is-on');
      setTimeout(() => { h.remove(); q.el.classList.remove('is-on'); }, 1900);
      path.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 1200, delay: 500, fill: 'forwards' }).onfinish = () => path.remove();
    }, dur - 120);
  };
  const start = () => { if (live || reduce) return; live = true; route(); timer = setInterval(() => { if (document.visibilityState === 'visible') route(); }, 1400); };
  const stop = () => { live = false; clearInterval(timer); };
  const io = new IntersectionObserver(es => { es.forEach(e => { wrap.classList.toggle('is-in', e.isIntersecting || wrap.classList.contains('is-in')); if (e.isIntersecting) start(); else stop(); }); }, { threshold: 0.15 });
  io.observe(wrap);
})();
