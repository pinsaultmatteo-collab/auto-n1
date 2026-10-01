/* =====================================================================
   AUTO N°1 — Script principal
   Navigation, animations, compteurs, sections interactives, formulaires.
   ===================================================================== */
(function () {
  'use strict';
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;

  /* ---------- Préchargeur ---------- */
  const pre = $('.preloader');
  const ready = () => { document.body.classList.add('is-ready'); if (pre) pre.classList.add('done'); };
  if (pre) { let done = false; const go = () => { if (!done) { done = true; setTimeout(ready, 350); } }; window.addEventListener('load', go); setTimeout(go, 1600); }
  else requestAnimationFrame(() => setTimeout(ready, 60));

  /* ---------- Navigation ---------- */
  const nav = $('.nav');
  const onScroll = () => { if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 24); };
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  $$('.nav__item--has-mega').forEach(item => {
    const link = $('.nav__link', item);
    if (!isTouch) { item.addEventListener('mouseenter', () => item.classList.add('is-open')); item.addEventListener('mouseleave', () => item.classList.remove('is-open')); }
    link.addEventListener('click', e => { if (isTouch || window.innerWidth < 1000) { e.preventDefault(); const open = item.classList.contains('is-open'); $$('.nav__item--has-mega').forEach(i => i.classList.remove('is-open')); item.classList.toggle('is-open', !open); } });
  });
  document.addEventListener('click', e => { if (!e.target.closest('.nav__item--has-mega')) $$('.nav__item--has-mega').forEach(i => i.classList.remove('is-open')); });
  const burger = $('.burger'), mobile = $('.mobile-menu');
  if (burger && mobile) burger.addEventListener('click', () => { const open = !mobile.classList.contains('is-open'); mobile.classList.toggle('is-open', open); burger.classList.toggle('is-open', open); burger.setAttribute('aria-expanded', open); document.documentElement.classList.toggle('lock', open); });
  const page = document.body.dataset.page;
  if (page) $$('.nav__link[data-nav]').forEach(a => a.classList.toggle('is-active', a.dataset.nav === page));

  /* ---------- Révélations au scroll ---------- */
  const io = new IntersectionObserver(entries => { entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in-view'); io.unobserve(en.target); } }); }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal,.split-lines,.img-reveal,.draw,.pillar,[data-inview]').forEach(el => io.observe(el));

  /* ---------- Compteurs ---------- */
  const fmt = (n, d) => n.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const cio = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return; cio.unobserve(en.target);
      const el = en.target, end = parseFloat(el.dataset.count), d = parseInt(el.dataset.decimals || '0', 10), suf = el.dataset.suffix || '', dur = 1600, t0 = performance.now();
      const step = now => { const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = fmt(end * e, d) + suf; if (p < 1) requestAnimationFrame(step); };
      if (reduce) el.textContent = fmt(end, d) + suf; else requestAnimationFrame(step);
    });
  }, { threshold: 0.5 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* ---------- Défilement infini (marquee) ---------- */
  $$('.marquee__track').forEach(tr => { tr.innerHTML += tr.innerHTML; });

  /* ---------- Accordéon aménagements ---------- */
  $$('.acc').forEach(acc => {
    const items = $$('.acc__item', acc); let idx = 0, timer, userTouched = false;
    const open = i => { idx = i; items.forEach((it, j) => it.classList.toggle('is-open', j === i)); };
    items.forEach((it, i) => {
      it.addEventListener('mouseenter', () => { if (!isTouch) { userTouched = true; clearInterval(timer); open(i); } });
      it.addEventListener('click', e => { if (!it.classList.contains('is-open')) { e.preventDefault(); userTouched = true; clearInterval(timer); open(i); } });
    });
    open(0);
    if (!reduce) timer = setInterval(() => { if (!userTouched) open((idx + 1) % items.length); }, 4200);
  });

  /* ---------- Boutons magnétiques ---------- */
  if (!isTouch && !reduce) $$('.btn').forEach(b => {
    b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); const x = (e.clientX - r.left - r.width / 2) * 0.18, y = (e.clientY - r.top - r.height / 2) * 0.28; b.style.transform = `translate(${x}px,${y}px)`; });
    b.addEventListener('mouseleave', () => { b.style.transform = ''; });
  });

  /* ---------- 3D : hero ---------- */
  const heroCanvas = $('#hero-canvas');
  let heroVan = null;
  if (heroCanvas && window.AutoN1Van) {
    heroVan = AutoN1Van.create(heroCanvas, { preset: 'hero', color: '#464a52', mouseArea: $('.hero') });
    if (!heroVan) document.body.classList.add('no-webgl');
    else {
      // Petite chorégraphie d'accueil : la vue technique se dissipe et révèle la carrosserie
      heroVan.state.xray = 1; heroVan.state.seats = 7;
      setTimeout(() => { heroVan.set({ xray: 0 }, 2.2); }, 900);
      setTimeout(() => { heroVan.set({ seats: 2, cargo: 0 }, 1.4); }, 3400);
    }
  }

  /* ---------- 3D : section « transformation » ---------- */
  const tCanvas = $('#transform-canvas');
  if (tCanvas && window.AutoN1Van) {
    const van = AutoN1Van.create(tCanvas, { preset: 'cargo', color: '#464a52', xray: 1, seats: 2, cargo: 1, mouseArea: $('.transform__visual') });
    if (van) {
      const steps = $$('.step'), tabs = $$('.ttab'), tabsWrap = $('.transform__tabs'), day = $('.transform__day'), hudPlaces = $('#hud-places'), hudMode = $('#hud-mode'), hudTime = $('#hud-time');
      const mqMobile = window.matchMedia('(max-width: 1000px)');
      let current = 0, triggers = [], stepIo = null, timer = null;
      const activate = i => {
        current = i;
        steps.forEach((s, j) => s.classList.toggle('is-active', j === i));
        tabs.forEach((t, j) => { t.classList.toggle('is-active', j === i); t.setAttribute('aria-selected', j === i); });
        const s = steps[i]; if (!s) return;
        van.apply(s.dataset.preset);
        if (day) { day.style.opacity = 0; setTimeout(() => { day.textContent = s.dataset.day || ''; day.style.opacity = 1; }, 200); }
        if (hudPlaces) hudPlaces.innerHTML = s.dataset.places || '';
        if (hudMode) hudMode.textContent = s.dataset.mode || '';
        if (hudTime) hudTime.textContent = s.dataset.time || '';
      };
      // Desktop : la 3D reste épinglée, les étapes défilent
      const setupDesktop = () => {
        if (hasGsap) triggers = steps.map((s, i) => ScrollTrigger.create({ trigger: s, start: 'top 55%', end: 'bottom 45%', onEnter: () => activate(i), onEnterBack: () => activate(i) }));
        else { stepIo = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) activate(steps.indexOf(e.target)); }), { threshold: 0.5 }); steps.forEach(s => stepIo.observe(s)); }
        activate(0);
      };
      const teardownDesktop = () => { triggers.forEach(t => t.kill()); triggers = []; if (stepIo) { stepIo.disconnect(); stepIo = null; } };
      // Mobile : onglets, défilement automatique toutes les 5 s, balayage sur la 3D
      const stopAuto = () => { if (timer) clearInterval(timer); timer = null; };
      const startAuto = () => { stopAuto(); if (reduce) return; tabsWrap && tabsWrap.classList.remove('is-paused'); timer = setInterval(() => activate((current + 1) % steps.length), 5000); };
      const userPick = i => { stopAuto(); tabsWrap && tabsWrap.classList.add('is-paused'); activate((i + steps.length) % steps.length); };
      const setupMobile = () => { activate(0); startAuto(); };
      tabs.forEach((t, i) => t.addEventListener('click', () => userPick(i)));
      const swipeArea = $('.transform__visual'); let x0 = null;
      if (swipeArea) {
        swipeArea.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
        swipeArea.addEventListener('touchend', e => { if (x0 == null || !mqMobile.matches) return; const dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 40) userPick(current + (dx < 0 ? 1 : -1)); }, { passive: true });
      }
      const applyMode = () => { if (mqMobile.matches) { teardownDesktop(); setupMobile(); } else { stopAuto(); setupDesktop(); } };
      applyMode();
      mqMobile.addEventListener('change', applyMode);
    }
  }

  /* ---------- 3D : configurateur ---------- */
  const cCanvas = $('#config-canvas');
  if (cCanvas && window.AutoN1Van) {
    const van = AutoN1Van.create(cCanvas, { preset: 'config', color: '#464a52', seats: 5, cargo: 0, mouseArea: $('.config__visual') });
    const form = $('#configurator');
    if (van && form) {
      const base = parseFloat(form.dataset.base || '55900');
      const total = $('#cfg-total'), lines = $('#cfg-lines'), quote = $('#cfg-quote'), sub = $('#cfg-sub');
      $$('.swatch', form).forEach(sw => sw.addEventListener('click', () => { $$('.swatch', form).forEach(s => s.classList.remove('is-active')); sw.classList.add('is-active'); van.setColor(sw.dataset.color); compute(); }));
      $$('[data-view]', form).forEach(b => b.addEventListener('click', () => { $$('[data-view]', form).forEach(x => x.classList.remove('is-active')); b.classList.add('is-active'); const v = b.dataset.view; if (v === 'xray') van.set({ xray: 1 }); else van.set({ xray: 0 }); van.setPreset(v === 'xray' ? 'seats' : 'config'); }));
      const compute = () => {
        const fin = form.elements.finition, mot = form.elements.motorisation, places = form.elements.places;
        const onQuote = (fin && fin.selectedOptions[0].dataset.quote) || (mot && mot.selectedOptions[0].dataset.quote);
        let sum = base; const items = [];
        if (places && places.value === '7') { sum += 1090; items.push(['Version 7 sièges (3 rangs)', 1090]); van.set({ seats: 7 }); } else van.set({ seats: 5 });
        $$('input[type=checkbox]:checked', form).forEach(c => { const p = parseFloat(c.dataset.price || '0'); sum += p; items.push([c.dataset.label || c.value, p]); });
        if (lines) lines.innerHTML = [['Ford Transit Custom ' + (fin ? fin.selectedOptions[0].text : ''), base]].concat(items).map(([l, p]) => `<li><span>${l}</span><span>${onQuote ? '—' : fmt(p, 0) + ' € HT'}</span></li>`).join('');
        if (total) total.innerHTML = onQuote ? 'Sur devis <em>personnalisé</em>' : fmt(sum, 0) + ' € <em>HT</em>';
        if (sub) sub.textContent = onQuote ? 'Cette configuration fait l’objet d’un chiffrage sous 24 h par votre conseiller.' : 'Prix indicatif hors frais d’immatriculation. Disponibilité : sur stock ou arrivage.';
        if (quote) quote.textContent = onQuote ? 'Recevoir mon devis sous 24h' : 'Réserver cette configuration';
      };
      form.addEventListener('change', compute); compute();
    }
  }

  /* ---------- Processus (SVG dessiné au scroll) ---------- */
  const proc = $('#process-svg');
  if (proc) {
    const path = $('.process__line', proc), nodes = $$('.process__node', proc), steps = $$('.pstep');
    const len = path ? path.getTotalLength() : 0; if (path) { path.style.strokeDasharray = len; path.style.strokeDashoffset = len; }
    const setProgress = p => { if (path) path.style.strokeDashoffset = len * (1 - p); nodes.forEach((n, i) => n.classList.toggle('is-on', p >= (i + 0.5) / nodes.length)); steps.forEach((s, i) => s.classList.toggle('is-on', p >= (i + 0.5) / steps.length)); };
    if (hasGsap && !reduce) ScrollTrigger.create({ trigger: proc, start: 'top 80%', end: 'bottom 45%', scrub: 0.6, onUpdate: self => setProgress(self.progress) });
    else { const pio = new IntersectionObserver(es => { if (es[0].isIntersecting) { let p = 0; const t = setInterval(() => { p += 0.02; setProgress(Math.min(1, p)); if (p >= 1) clearInterval(t); }, 30); pio.disconnect(); } }, { threshold: 0.3 }); pio.observe(proc); }
  }

  /* ---------- Configurateur SVG cabine (2 / 5 / 7 places) ---------- */
  const seatSvg = $('#seat-config');
  if (seatSvg) {
    const btns = $$('[data-seats]'), cargoRect = $('#cargo-zone', seatSvg), cargoLen = $('#cargo-len'), kPlaces = $('#k-places'), kLen = $('#k-len'), kTime = $('#k-time');
    const conf = { 2: { len: 1970, w: 292, x: 60 }, 5: { len: 1400, w: 206, x: 60 }, 7: { len: 700, w: 104, x: 60 } };
    const set = n => {
      btns.forEach(b => b.classList.toggle('is-active', b.dataset.seats == n));
      $$('.svg-seat', seatSvg).forEach(s => { const on = n >= parseInt(s.dataset.min, 10); s.style.opacity = on ? 1 : 0.08; s.style.transform = on ? 'scale(1)' : 'scale(.6)'; });
      const c = conf[n]; if (cargoRect) { cargoRect.setAttribute('width', c.w); } const wallEl = $('#cargo-wall', seatSvg); if (wallEl) wallEl.setAttribute('x', 60 + c.w + 6); if (cargoLen) cargoLen.textContent = fmt(c.len, 0) + ' mm';
      if (kPlaces) kPlaces.textContent = n; if (kLen) kLen.textContent = fmt(c.len, 0) + ' mm'; if (kTime) kTime.textContent = n == 2 ? '0 min' : '3 min';
    };
    btns.forEach(b => b.addEventListener('click', () => set(parseInt(b.dataset.seats, 10))));
    set(5);
    if (!reduce) { let i = 0; const seq = [2, 5, 7]; const t = setInterval(() => { if (seatSvg.dataset.touched) return clearInterval(t); i = (i + 1) % seq.length; set(seq[i]); }, 2600); btns.forEach(b => b.addEventListener('click', () => seatSvg.dataset.touched = 1)); }
  }

  /* ---------- Toit relevable (coupe SVG) ---------- */
  const roof = $('#roof-svg');
  if (roof) {
    const panel = $('#roof-panel', roof), bellows = $('#roof-bellows', roof), bed = $('#roof-bed', roof), dim = $('#roof-dim'), range = $('#roof-range');
    const set = v => { const a = -18 * v; panel.setAttribute('transform', `rotate(${a} 100 150)`); bellows.setAttribute('transform', `translate(0 150) scale(1 ${Math.max(0.001, v)}) translate(0 -150)`); bellows.style.opacity = v > 0.02 ? 1 : 0; if (bed) bed.style.opacity = v > 0.5 ? 1 : 0; if (dim) dim.textContent = Math.round(1350 + 700 * v) + ' mm'; if (range) range.value = Math.round(v * 100); };
    if (range) range.addEventListener('input', () => set(range.value / 100));
    set(0);
    const rio = new IntersectionObserver(es => { if (es[0].isIntersecting) { let p = 0; const t = setInterval(() => { p += 0.015; set(Math.min(1, p)); if (p >= 1) clearInterval(t); }, 16); rio.disconnect(); } }, { threshold: 0.4 }); rio.observe(roof);
  }

  /* ---------- 4x4 : véhicule sur relief (SVG) ---------- */
  const trail = $('#trail-svg');
  if (trail) {
    const path = $('#trail-path', trail), car = $('#trail-van', trail), L = path.getTotalLength(); let p = 0, on = false, raf;
    const tick = () => { p = (p + 0.0012) % 1; const pt = path.getPointAtLength(p * L), pt2 = path.getPointAtLength(Math.min(L, p * L + 4)); const ang = Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180 / Math.PI; car.setAttribute('transform', `translate(${pt.x} ${pt.y}) rotate(${ang})`); if (on) raf = requestAnimationFrame(tick); };
    new IntersectionObserver(es => { on = es[0].isIntersecting; if (on) raf = requestAnimationFrame(tick); else cancelAnimationFrame(raf); }, { threshold: 0.2 }).observe(trail);
  }

  /* ---------- Plan technique : points chauds ---------- */
  $$('.hotspot').forEach(h => h.addEventListener('click', () => {
    const wrap = h.closest('.blueprint'); $$('.hotspot', wrap).forEach(x => x.classList.remove('is-active')); h.classList.add('is-active');
    const box = $('.blueprint__info', wrap); if (box) { box.querySelector('b').textContent = h.dataset.title; box.querySelector('p').textContent = h.dataset.text; box.classList.add('is-visible'); }
  }));

  /* ---------- Filtres stock ---------- */
  const stock = $('#stock');
  if (stock) {
    const cards = $$('.scard', stock), chips = $$('.chip[data-filter]'), empty = $('#stock-empty');
    const cur = { marque: 'all', amenagement: 'all' };
    const apply = () => { let n = 0; cards.forEach(c => { const ok = (cur.marque === 'all' || c.dataset.marque === cur.marque) && (cur.amenagement === 'all' || (c.dataset.amenagement || '').split(' ').includes(cur.amenagement)); c.style.display = ok ? '' : 'none'; if (ok) n++; }); if (empty) empty.style.display = n ? 'none' : ''; };
    chips.forEach(ch => ch.addEventListener('click', () => { const [k, v] = ch.dataset.filter.split(':'); cur[k] = v; chips.filter(c => c.dataset.filter.startsWith(k + ':')).forEach(c => c.classList.toggle('is-active', c === ch)); apply(); }));
  }

  /* ---------- FAQ : un seul ouvert ---------- */
  $$('.faq').forEach(f => $$('details', f).forEach(d => d.addEventListener('toggle', () => { if (d.open) $$('details', f).forEach(o => { if (o !== d) o.open = false; }); })));

  /* ---------- Formulaires (démo, sans envoi) ---------- */
  $$('form[data-demo]').forEach(f => f.addEventListener('submit', e => { e.preventDefault(); if (!f.checkValidity()) { f.reportValidity(); return; } f.classList.add('is-sent'); const ok = $('.form__ok', f); if (ok) ok.scrollIntoView({ behavior: 'smooth', block: 'center' }); }));

  /* ---------- Bandeau cookies ---------- */
  const ck = $('.cookie');
  if (ck) { try { if (!localStorage.getItem('an1-consent')) setTimeout(() => ck.classList.add('is-visible'), 1800); } catch (e) { }
    $$('[data-consent]', ck).forEach(b => b.addEventListener('click', () => { try { localStorage.setItem('an1-consent', b.dataset.consent); } catch (e) { } ck.classList.remove('is-visible'); })); }

  /* ---------- Année footer ---------- */
  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
})();
