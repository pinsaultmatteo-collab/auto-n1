/* =====================================================================
   AUTO N°1 — Fourgon 3D procédural (Three.js r158, build UMD)
   Un seul modèle, plusieurs états : sièges 2/5/7, toit relevable,
   rayons X (vue technique), bascule 4x4, couleur carrosserie.
   ===================================================================== */
window.AutoN1Van = (function () {
  'use strict';
  if (typeof THREE === 'undefined') return { create: function () { return null; } };
  const T = THREE;

  /* ---------- Environnement HDR procédural (reflets) ---------- */
  function makeEnvironment(renderer) {
    const scene = new T.Scene();
    const box = new T.BoxGeometry();
    const room = new T.Mesh(new T.BoxGeometry(24, 14, 24), new T.MeshStandardMaterial({ side: T.BackSide, color: 0x15161a, roughness: 1, metalness: 0 }));
    room.position.y = 6; scene.add(room);
    const panel = (x, y, z, sx, sy, sz, i, c) => {
      const m = new T.Mesh(box, new T.MeshBasicMaterial({ color: c || 0xffffff }));
      m.material.color.multiplyScalar(i); m.position.set(x, y, z); m.scale.set(sx, sy, sz); scene.add(m);
    };
    panel(0, 13.5, 0, 10, .2, 3, 14);          // plafonnier long (reflet de toit)
    panel(0, 13.5, 6, 10, .2, 1.2, 5);
    panel(0, 13.5, -6, 10, .2, 1.2, 5);
    panel(-11.5, 5, 0, .2, 5, 12, 6);       // murs latéraux (flancs)
    panel(11.5, 5, 0, .2, 5, 12, 6);
    panel(0, 4.5, -11.5, 12, 4, .2, 2.5);
    panel(0, 4.5, 11.5, 12, 4, .2, 2);
    panel(-7, 1.2, 7, 4, .3, 4, 5, 0xffe3cf); // bandeau chaud bas
    panel(7, 3, -7, 2, 6, .2, 4, 0xff2a3a);   // panneau rouge (accent marque)
    const pmrem = new T.PMREMGenerator(renderer);
    const tex = pmrem.fromScene(scene, 0.04).texture;
    pmrem.dispose();
    return tex;
  }

  /* ---------- Géométrie : silhouette latérale extrudée ---------- */
  function bodyShape() {
    const s = new T.Shape();
    s.moveTo(-2.45, 0.34);
    s.lineTo(2.0, 0.34);
    s.quadraticCurveTo(2.5, 0.36, 2.52, 0.78);
    s.lineTo(2.5, 1.0);
    s.quadraticCurveTo(2.44, 1.1, 2.15, 1.14);
    s.lineTo(1.5, 1.22);
    s.quadraticCurveTo(1.3, 1.26, 1.16, 1.42);
    s.lineTo(0.74, 1.95);
    s.quadraticCurveTo(0.6, 2.08, 0.28, 2.08);
    s.lineTo(-2.28, 2.08);
    s.quadraticCurveTo(-2.45, 2.08, -2.46, 1.9);
    s.lineTo(-2.46, 0.52);
    s.quadraticCurveTo(-2.46, 0.34, -2.3, 0.34);
    s.closePath();
    return s;
  }
  function extrude(shape, depth, bevel) {
    const g = new T.ExtrudeGeometry(shape, { depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: 14 });
    g.translate(0, 0, -depth / 2);
    return g;
  }
  function shadowTexture() {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const x = c.getContext('2d');
    const g = x.createRadialGradient(128, 128, 10, 128, 128, 128);
    g.addColorStop(0, 'rgba(0,0,0,.85)'); g.addColorStop(.55, 'rgba(0,0,0,.35)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, 256, 256);
    const t = new T.CanvasTexture(c); return t;
  }

  /* ---------- Presets caméra ---------- */
  const PRESETS = {
    hero:    { pos: [9.6, 2.5, 7.8],  look: [0, 0.9, 0],  yaw: -0.15, shift: 1.4, auto: 0.10 },
    cargo:   { pos: [-6.2, 2.6, 6.2], look: [-0.4, 0.9, 0], yaw: 0.0, shift: 0, auto: 0 },
    seats:   { pos: [1.2, 3.6, 7.8],  look: [-0.4, 0.9, 0], yaw: 0.0, shift: 0, auto: 0 },
    poptop:  { pos: [6.8, 1.5, 6.4],  look: [0, 1.35, 0],   yaw: 0.0, shift: 0, auto: 0 },
    offroad: { pos: [7.2, 1.0, 4.6],  look: [0, 1.0, 0],    yaw: 0.0, shift: 0, auto: 0 },
    config:  { pos: [6.6, 2.0, 6.2],  look: [0, 0.9, 0],    yaw: -0.1, shift: 0, auto: 0.08 },
    studio:  { pos: [5.6, 1.6, 6.9],  look: [0, 0.95, 0],   yaw: 0.35, shift: 0, auto: 0.12 }
  };

  /* ---------- Construction ---------- */
  function create(canvas, opts) {
    opts = opts || {};
    let renderer;
    try {
      renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (e) { canvas.classList.add('is-hidden'); return null; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.maxDpr || 2));
    renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;

    const scene = new T.Scene();
    scene.fog = new T.FogExp2(0x0a0a0b, 0.042);
    scene.environment = makeEnvironment(renderer);

    const camera = new T.PerspectiveCamera(30, 1, 0.1, 80);

    // Lumières
    scene.add(new T.HemisphereLight(0xdfe6ff, 0x1a1a1f, 0.9));
    const key = new T.DirectionalLight(0xfff1e4, 3.2); key.position.set(6, 9, 4); key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048); key.shadow.camera.near = 1; key.shadow.camera.far = 30;
    key.shadow.camera.left = key.shadow.camera.bottom = -6; key.shadow.camera.right = key.shadow.camera.top = 6; key.shadow.bias = -0.0008; key.shadow.radius = 4;
    scene.add(key);
    const fill = new T.DirectionalLight(0xaac2ff, 1.1); fill.position.set(-6, 4, -5); scene.add(fill);
    const rim = new T.PointLight(0xff1a2e, 40, 18, 1.4); rim.position.set(-4.5, 1.4, -4.2); scene.add(rim);

    // Sol + grille technique + ombre de contact
    const floor = new T.Mesh(new T.CircleGeometry(16, 72), new T.MeshStandardMaterial({ color: 0x15161a, roughness: 0.3, metalness: 0.6 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    const grid = new T.GridHelper(40, 80, 0x3a3b42, 0x24252b); grid.position.y = 0.003; grid.material.transparent = true; grid.material.opacity = 0.42; scene.add(grid);
    const contact = new T.Mesh(new T.PlaneGeometry(6.4, 3.4), new T.MeshBasicMaterial({ map: shadowTexture(), transparent: true, opacity: 0.55, depthWrite: false }));
    contact.rotation.x = -Math.PI / 2; contact.position.y = 0.006; scene.add(contact);

    // Groupe véhicule
    const van = new T.Group(); scene.add(van);
    const shell = [];   // matériaux qui s'estompent en mode rayons X
    const glassMats = [];

    const bodyColor = new T.Color(opts.color || '#464a52');
    const paint = new T.MeshPhysicalMaterial({ color: bodyColor.clone(), metalness: 0.5, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 1.6 });
    const plastic = new T.MeshStandardMaterial({ color: 0x0c0c0e, roughness: 0.85, metalness: 0.1 });
    const chrome = new T.MeshStandardMaterial({ color: 0x8b8f98, roughness: 0.25, metalness: 1 });
    const glass = new T.MeshPhysicalMaterial({ color: 0x0a1119, metalness: 0.15, roughness: 0.04, clearcoat: 1, envMapIntensity: 1.8, transparent: true, opacity: 0.94 });
    const red = new T.MeshStandardMaterial({ color: 0xd10018, roughness: 0.4, metalness: 0.3 });
    shell.push(paint, plastic, chrome, red); glassMats.push(glass);

    const bodyGeo = extrude(bodyShape(), 1.9, 0.06);
    const body = new T.Mesh(bodyGeo, paint); body.castShadow = true; van.add(body);
    const edges = new T.LineSegments(new T.EdgesGeometry(bodyGeo, 28), new T.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 }));
    van.add(edges);

    const add = (geo, mat, x, y, z, cast) => { const m = new T.Mesh(geo, mat); m.position.set(x, y, z); if (cast !== false) m.castShadow = true; van.add(m); return m; };

    // Vitrages
    const wsGeo = new T.PlaneGeometry(1.74, 0.72); wsGeo.rotateY(Math.PI / 2); wsGeo.rotateZ(0.66);
    const ws = add(wsGeo, glass, 0.955 + 0.02, 1.685 + 0.015, 0, false);
    const winShape = (pts) => { const s = new T.Shape(); s.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]); s.closePath(); return s; };
    const frontWin = new T.ExtrudeGeometry(winShape([[0.02, 1.34], [1.1, 1.34], [0.72, 1.92], [0.02, 1.92]]), { depth: 0.02, bevelEnabled: false });
    const rearWin = new T.ExtrudeGeometry(winShape([[-0.12, 1.36], [-1.3, 1.36], [-1.3, 1.92], [-0.12, 1.92]]), { depth: 0.02, bevelEnabled: false });
    [1, -1].forEach(side => {
      const z = side * (0.95 + 0.06) - (side > 0 ? 0 : 0.02);
      add(frontWin, glass, 0, 0, z, false); add(rearWin, glass, 0, 0, z, false);
      // Vitre panneau arrière (custom vitré)
      const pw = new T.ExtrudeGeometry(winShape([[-1.42, 1.38], [-2.3, 1.38], [-2.3, 1.9], [-1.42, 1.9]]), { depth: 0.02, bevelEnabled: false });
      add(pw, glass, 0, 0, z, false);
      // Bas de caisse noir
      add(new T.BoxGeometry(4.5, 0.17, 0.03), plastic, -0.1, 0.44, side * 1.005, false);
      // Liseré rouge marque
      add(new T.BoxGeometry(4.3, 0.022, 0.012), red, -0.15, 0.64, side * 1.017, false);
      // Passage de roue (garniture)
      [1.62, -1.62].forEach(wx => { const ring = new T.Mesh(new T.RingGeometry(0.4, 0.52, 40), plastic); ring.position.set(wx, 0.4, side * 1.012); if (side < 0) ring.rotation.y = Math.PI; van.add(ring); });
      // Rétroviseur
      const mir = add(new T.BoxGeometry(0.14, 0.18, 0.1), paint, 1.28, 1.44, side * 1.08);
      add(new T.BoxGeometry(0.05, 0.03, 0.12), plastic, 1.3, 1.36, side * 1.02, false);
      // Rail de toit
      add(new T.BoxGeometry(2.4, 0.045, 0.05), plastic, -1.0, 2.13, side * 0.72);
      // Optiques
      const hl = new T.Mesh(new T.BoxGeometry(0.06, 0.13, 0.46), new T.MeshStandardMaterial({ color: 0xffffff, emissive: 0xdde9ff, emissiveIntensity: 1.8, roughness: .2 }));
      hl.position.set(2.5, 0.99, side * 0.7); hl.rotation.y = side * 0.35; van.add(hl); shell.push(hl.material);
      const tl = new T.Mesh(new T.BoxGeometry(0.04, 0.55, 0.13), new T.MeshStandardMaterial({ color: 0xff2a2a, emissive: 0xff1010, emissiveIntensity: 1.4 }));
      tl.position.set(-2.475, 1.0, side * 0.86); van.add(tl); shell.push(tl.material);
    });
    // Vitre arrière
    add(new T.BoxGeometry(0.02, 0.56, 1.5), glass, -2.48, 1.62, 0, false);
    // Calandre, pare-chocs, plaque, barre lumineuse
    add(new T.BoxGeometry(0.05, 0.26, 1.36), plastic, 2.5, 0.8, 0, false);
    add(new T.BoxGeometry(0.02, 0.02, 1.36), new T.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.2 }), 2.52, 1.02, 0, false);
    add(new T.BoxGeometry(0.02, 0.025, 0.7), red, 2.53, 0.9, 0, false);
    add(new T.BoxGeometry(0.28, 0.24, 1.96), plastic, 2.38, 0.46, 0);
    add(new T.BoxGeometry(0.14, 0.2, 1.96), plastic, -2.44, 0.45, 0);
    add(new T.BoxGeometry(0.012, 0.11, 0.52), new T.MeshStandardMaterial({ color: 0xf2f2f2, roughness: .6 }), 2.535, 0.62, 0, false);
    add(new T.BoxGeometry(0.012, 0.11, 0.52), new T.MeshStandardMaterial({ color: 0xf2f2f2, roughness: .6 }), -2.53, 0.66, 0, false);
    // Badge cube rouge (logo) à l'arrière
    add(new T.BoxGeometry(0.012, 0.1, 0.1), red, -2.53, 1.3, 0.62, false);

    // Roues
    const tireGeo = new T.CylinderGeometry(0.37, 0.37, 0.26, 40); tireGeo.rotateX(Math.PI / 2);
    const rimGeo = new T.CylinderGeometry(0.235, 0.235, 0.27, 28); rimGeo.rotateX(Math.PI / 2);
    const hubGeo = new T.CylinderGeometry(0.07, 0.07, 0.29, 16); hubGeo.rotateX(Math.PI / 2);
    const spokeGeo = new T.BoxGeometry(0.04, 0.36, 0.29);
    const rimMat = new T.MeshStandardMaterial({ color: 0x1f2024, roughness: 0.35, metalness: 0.9 });
    const wheels = [];
    [[1.62, 0.9], [1.62, -0.9], [-1.62, 0.9], [-1.62, -0.9]].forEach(([x, z]) => {
      const w = new T.Group(); w.position.set(x, 0.37, z);
      const tire = new T.Mesh(tireGeo, new T.MeshStandardMaterial({ color: 0x0d0d10, roughness: 0.95 })); tire.castShadow = true; w.add(tire);
      const rimDisc = new T.Mesh(new T.CylinderGeometry(0.235, 0.235, 0.02, 28), rimMat); rimDisc.rotation.x = Math.PI / 2; rimDisc.position.z = Math.sign(z) * 0.09; w.add(rimDisc);
      for (let i = 0; i < 5; i++) { const sp = new T.Mesh(spokeGeo, rimMat); sp.rotation.z = i * Math.PI * 2 / 5; w.add(sp); }
      w.add(new T.Mesh(hubGeo, chrome));
      const lip = new T.Mesh(new T.RingGeometry(0.225, 0.245, 40), red); lip.position.z = Math.sign(z) * 0.135; if (z < 0) lip.rotation.y = Math.PI; w.add(lip);
      van.add(w); wheels.push(w);
    });

    // Toit relevable : charnière arrière + panneau + soufflet
    const hinge = new T.Group(); hinge.position.set(-2.2, 2.1, 0); van.add(hinge);
    const roofPanel = new T.Mesh(new T.BoxGeometry(2.45, 0.08, 1.66), paint); roofPanel.position.set(1.225, 0.04, 0); roofPanel.castShadow = true; hinge.add(roofPanel);
    const bellowsShape = new T.Shape(); bellowsShape.moveTo(0, 0); bellowsShape.lineTo(2.45, 0); bellowsShape.lineTo(2.45, 1); bellowsShape.closePath();
    const bellows = new T.Mesh(extrude(bellowsShape, 1.6, 0), new T.MeshStandardMaterial({ color: 0xd9d8d0, roughness: 1, metalness: 0 }));
    bellows.position.set(-2.2, 2.1, 0); bellows.scale.set(1, 0.001, 1); bellows.castShadow = true; van.add(bellows);
    const bellowsStripe = new T.Mesh(new T.BoxGeometry(2.3, 0.02, 1.62), red); bellowsStripe.position.set(1.15, 0.001, 0); bellowsStripe.visible = false; hinge.add(bellowsStripe);
    shell.push(bellows.material);

    // Intérieur : sièges SPECIPRO, cloison R1, chargement
    const seatMat = new T.MeshStandardMaterial({ color: 0x2c2d33, roughness: 0.85 });
    const seatRed = new T.MeshStandardMaterial({ color: 0xd10018, roughness: 0.6 });
    function makeSeat() {
      const g = new T.Group();
      const base = new T.Mesh(new T.BoxGeometry(0.5, 0.12, 0.5), seatMat); base.position.y = 0.36; g.add(base);
      const back = new T.Mesh(new T.BoxGeometry(0.1, 0.62, 0.5), seatMat); back.position.set(-0.2, 0.72, 0); back.rotation.z = -0.12; g.add(back);
      const head = new T.Mesh(new T.BoxGeometry(0.08, 0.16, 0.28), seatMat); head.position.set(-0.26, 1.12, 0); g.add(head);
      const stitch = new T.Mesh(new T.BoxGeometry(0.102, 0.02, 0.5), seatRed); stitch.position.set(-0.2, 0.9, 0); stitch.rotation.z = -0.12; g.add(stitch);
      const rail = new T.Mesh(new T.BoxGeometry(0.5, 0.05, 0.08), plastic); rail.position.set(0, 0.27, 0.18); g.add(rail);
      const rail2 = rail.clone(); rail2.position.z = -0.18; g.add(rail2);
      return g;
    }
    const FLOOR_Y = 0.32;
    const seats = [];
    const seatDefs = [
      { x: 0.55, z: 0.55, min: 2 }, { x: 0.55, z: -0.55, min: 2 },
      { x: -0.45, z: 0.6, min: 5 }, { x: -0.45, z: 0, min: 5 }, { x: -0.45, z: -0.6, min: 5 },
      { x: -1.35, z: 0.45, min: 7 }, { x: -1.35, z: -0.45, min: 7 }
    ];
    seatDefs.forEach(d => { const s = makeSeat(); s.position.set(d.x, FLOOR_Y, d.z); s.userData = { min: d.min, k: d.min > 2 ? 0 : 1 }; if (d.min > 2) s.scale.setScalar(0.001); van.add(s); seats.push(s); });
    // Table amovible (config 5/7)
    const table = new T.Group();
    const top = new T.Mesh(new T.BoxGeometry(0.7, 0.03, 0.55), new T.MeshStandardMaterial({ color: 0x1a1a1d, roughness: .5, metalness: .3 })); top.position.y = 1.02; table.add(top);
    const leg = new T.Mesh(new T.CylinderGeometry(0.025, 0.025, 0.7, 12), chrome); leg.position.y = 0.67; table.add(leg);
    table.position.set(0.05, FLOOR_Y, 0.55); table.userData = { k: 0 }; table.scale.setScalar(0.001); van.add(table);
    // Cloison R1 + chargement (config 2)
    const wall = new T.Mesh(new T.BoxGeometry(0.04, 1.36, 1.72), new T.MeshStandardMaterial({ color: 0x7c7f86, roughness: .7, metalness: .4 })); wall.position.set(0.02, FLOOR_Y + 0.7, 0); wall.userData = { k: 1 }; van.add(wall);
    const cargo = new T.Group();
    const wood = new T.MeshStandardMaterial({ color: 0x8b6b48, roughness: .9 });
    const crate = (w, h, d, x, y, z, m) => { const c = new T.Mesh(new T.BoxGeometry(w, h, d), m || wood); c.position.set(x, FLOOR_Y + h / 2 + (y || 0), z); cargo.add(c); };
    crate(0.8, 0.5, 0.7, -0.9, 0, 0.45); crate(0.6, 0.45, 0.6, -1.7, 0, 0.5); crate(0.7, 0.35, 0.5, -1.6, 0, -0.5); crate(0.55, 0.28, 0.4, -0.9, 0, -0.55, red);
    const tube = new T.Mesh(new T.CylinderGeometry(0.05, 0.05, 2.4, 12), chrome); tube.rotation.z = Math.PI / 2; tube.position.set(-1.2, FLOOR_Y + 0.9, -0.2); cargo.add(tube);
    cargo.userData = { k: 1 }; van.add(cargo);
    // Lit du toit relevable (visible toit ouvert + rayons X)
    const bed = new T.Mesh(new T.BoxGeometry(1.9, 0.08, 1.3), new T.MeshStandardMaterial({ color: 0xc9c6bb, roughness: 1 })); bed.position.set(-1.1, 2.0, 0); bed.userData = { k: 0 }; bed.scale.setScalar(0.001); van.add(bed);

    /* ---------- État ---------- */
    const state = { seats: opts.seats || 2, popTop: opts.popTop || 0, xray: opts.xray || 0, tilt: opts.tilt || 0, cargo: opts.cargo == null ? 1 : opts.cargo, yaw: 0 };
    let preset = PRESETS[opts.preset || 'hero'];
    const targetColor = bodyColor.clone();
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    let hovering = false;
    const camPos = new T.Vector3().fromArray(preset.pos), camLook = new T.Vector3().fromArray(preset.look);
    const wantPos = camPos.clone(), wantLook = camLook.clone();
    let autoAngle = 0, running = false, visible = true, raf = 0, last = performance.now();
    const clock = { t: 0 };

    function applyPreset(p) {
      preset = PRESETS[p] || preset;
      const scaleDist = camera.aspect < 0.95 ? 1.45 : (camera.aspect < 1.4 ? 1.15 : 1);
      wantPos.fromArray(preset.pos).multiplyScalar(scaleDist);
      wantLook.fromArray(preset.look);
      const shift = camera.aspect < 0.95 ? 0 : preset.shift;
      if (shift) {
        const dir = new T.Vector3().subVectors(wantLook, wantPos).normalize();
        const right = new T.Vector3().crossVectors(dir, new T.Vector3(0, 1, 0)).normalize();
        wantPos.addScaledVector(right, -shift); wantLook.addScaledVector(right, -shift);
      }
    }
    function resize() {
      const w = canvas.clientWidth || canvas.parentElement.clientWidth || 800;
      const h = canvas.clientHeight || canvas.parentElement.clientHeight || 600;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
      applyPreset(Object.keys(PRESETS).find(k => PRESETS[k] === preset) || 'hero');
    }
    const lerp = (a, b, t) => a + (b - a) * t;

    function frame(now) {
      raf = 0;
      const dt = Math.min(0.05, (now - last) / 1000); last = now; clock.t += dt;
      const k = 1 - Math.pow(0.001, dt); // amortissement indépendant du framerate
      // Souris
      mouse.x = lerp(mouse.x, mouse.tx, k * 0.6); mouse.y = lerp(mouse.y, mouse.ty, k * 0.6);
      // Caméra
      camPos.lerp(wantPos, k * 0.55); camLook.lerp(wantLook, k * 0.55);
      camera.position.copy(camPos); camera.position.y += mouse.y * 0.25;
      camera.lookAt(camLook);
      // Rotation véhicule
      autoAngle = preset.auto ? Math.sin(clock.t * preset.auto * 3.2) * 0.32 : 0; // balancement lent au lieu d'une rotation complète
      van.rotation.y = preset.yaw + autoAngle + mouse.x * 0.28;
      // Bascule 4x4 (pitch autour de z, roulis autour de x)
      van.rotation.z = lerp(van.rotation.z, state.tilt * 0.07 + Math.sin(clock.t * 1.3) * 0.006 * state.tilt, k);
      van.rotation.x = lerp(van.rotation.x, state.tilt * 0.085, k);
      van.position.y = lerp(van.position.y, state.tilt * 0.09, k);
      // Toit relevable
      const a = 0.44 * state.popTop; hinge.rotation.z = a;
      bellows.scale.set(Math.cos(a), Math.max(0.001, 2.45 * Math.sin(a)), 1);
      bellows.visible = state.popTop > 0.005;
      // Rayons X
      const op = 1 - 0.9 * state.xray;
      shell.forEach(m => { m.opacity = op; m.transparent = op < 0.995; m.depthWrite = op > 0.5; });
      glassMats.forEach(m => { m.opacity = 0.94 - 0.85 * state.xray; m.depthWrite = false; });
      edges.material.opacity = 0.42 * state.xray;
      grid.material.opacity = 0.42 + 0.3 * state.xray;
      // Sièges / table / cloison / chargement
      const cargoOn = state.seats <= 2 ? state.cargo : 0;
      seats.forEach(s => { const want = state.seats >= s.userData.min ? 1 : 0; s.userData.k = lerp(s.userData.k, want, k * 0.8); const sc = Math.max(0.001, s.userData.k); s.scale.set(sc, sc, sc); });
      const tw = state.seats >= 5 ? 1 : 0; table.userData.k = lerp(table.userData.k, tw, k * 0.8); table.scale.setScalar(Math.max(0.001, table.userData.k));
      wall.userData.k = lerp(wall.userData.k, cargoOn, k * 0.8); wall.scale.set(1, Math.max(0.001, wall.userData.k), 1); wall.position.x = 0.02;
      cargo.userData.k = lerp(cargo.userData.k, cargoOn, k * 0.8); cargo.scale.setScalar(Math.max(0.001, cargo.userData.k));
      const bw = state.popTop > 0.5 ? 1 : 0; bed.userData.k = lerp(bed.userData.k, bw, k * 0.8); bed.scale.setScalar(Math.max(0.001, bed.userData.k));
      // Couleur
      paint.color.lerp(targetColor, k * 0.6);
      renderer.render(scene, camera);
      if (running && visible) raf = requestAnimationFrame(frame);
    }
    function start() { running = true; if (!raf && visible) { last = performance.now(); raf = requestAnimationFrame(frame); } }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }

    // Visibilité (perf) : ne rend que si le canvas est à l'écran
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible && running && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }, { rootMargin: '120px' }).observe(canvas);
    }
    document.addEventListener('visibilitychange', () => { if (!document.hidden && running && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); } });
    // Souris (parallaxe)
    const area = opts.mouseArea || canvas.parentElement || canvas;
    area.addEventListener('pointermove', e => { const r = area.getBoundingClientRect(); mouse.tx = ((e.clientX - r.left) / r.width - 0.5) * 2; mouse.ty = ((e.clientY - r.top) / r.height - 0.5) * -2; hovering = true; });
    area.addEventListener('pointerleave', () => { mouse.tx = 0; mouse.ty = 0; hovering = false; });
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas.parentElement || canvas); else window.addEventListener('resize', resize);

    resize();
    // Position initiale caméra (pas d'interpolation au premier rendu)
    camPos.copy(wantPos); camLook.copy(wantLook);
    if (opts.autoStart !== false) start();

    const api = {
      state, scene, camera, renderer, van,
      start, stop, resize,
      setPreset(name) { applyPreset(name); },
      setColor(hex) { targetColor.set(hex); },
      set(partial, duration) {
        if (window.gsap) { window.gsap.to(state, Object.assign({ duration: duration == null ? 1.1 : duration, ease: 'power2.inOut', overwrite: 'auto' }, partial)); }
        else Object.assign(state, partial);
      },
      apply(name) { // états métier prêts à l'emploi
        const s = { cargo: { seats: 2, popTop: 0, xray: 1, tilt: 0, cargo: 1 }, seats: { seats: 7, popTop: 0, xray: 1, tilt: 0, cargo: 0 }, poptop: { seats: 5, popTop: 1, xray: 0, tilt: 0 }, offroad: { seats: 5, popTop: 0, xray: 0, tilt: 1 }, hero: { seats: 2, popTop: 0, xray: 0, tilt: 0, cargo: 0 } }[name];
        if (s) { this.set(s); this.setPreset(name); }
      },
      dispose() { stop(); renderer.dispose(); }
    };
    create.instances.push(api);
    return api;
  }
  create.instances = [];
  return { create, PRESETS, get instances() { return create.instances; } };
})();
