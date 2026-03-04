/* ============================================================
   1. CAR DRIVE / DRIFT LOADER
============================================================ */
(function initCarLoader() {
  var canvas = document.getElementById('carCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  /* ---------- resize ---------- */
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    buildBuildings();
  }
  window.addEventListener('resize', resize);
  resize();

  /* ---------- stars ---------- */
  var stars = [];
  for (var i = 0; i < 160; i++) {
    stars.push({
      x: Math.random(),
      y: Math.random() * 0.55,
      r: Math.random() * 1.4 + 0.3,
      a: Math.random()
    });
  }

  /* ---------- buildings ---------- */
  var buildings = [];
  function buildBuildings() {
    buildings = [];
    var W = canvas.width, H = canvas.height;
    var skyH = H * 0.55;
    var x = 0;
    while (x < W + 80) {
      var w = 30 + Math.random() * 80;
      var h = 40 + Math.random() * (skyH * 0.7);
      var floors = Math.floor(h / 14);
      var wins = [];
      for (var f = 0; f < floors; f++) {
        var cols = Math.floor(w / 16);
        for (var c = 0; c < cols; c++) {
          wins.push({ lit: Math.random() > 0.4 });
        }
      }
      buildings.push({ x: x, w: w, h: h, wins: wins, floors: floors });
      x += w + 2 + Math.random() * 8;
    }
  }

  /* ---------- smoke ---------- */
  var smokes = [];
  function spawnSmoke(px, py) {
    for (var k = 0; k < 4; k++) {
      smokes.push({
        x: px + (Math.random() - 0.5) * 14,
        y: py + (Math.random() - 0.5) * 6,
        vx: -1.5 - Math.random() * 2.5,
        vy: -0.8 - Math.random() * 1.4,
        r: 10 + Math.random() * 18,
        a: 0.55 + Math.random() * 0.3,
        life: 0
      });
    }
  }
  function updateSmoke(dt) {
    for (var i = smokes.length - 1; i >= 0; i--) {
      var s = smokes[i];
      s.x += s.vx * dt * 0.06;
      s.y += s.vy * dt * 0.06;
      s.r += dt * 0.025;
      s.a -= dt * 0.0014;
      s.life += dt;
      if (s.a <= 0) smokes.splice(i, 1);
    }
  }
  function drawSmoke() {
    for (var i = 0; i < smokes.length; i++) {
      var s = smokes[i];
      ctx.save();
      ctx.globalAlpha = Math.max(0, s.a);
      var g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r);
      g.addColorStop(0, 'rgba(220,220,220,0.7)');
      g.addColorStop(1, 'rgba(180,180,180,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /* ---------- skid marks ---------- */
  var skids = [];
  function addSkid(x, y, w) {
    if (skids.length > 0) {
      var last = skids[skids.length - 1];
      last.x2 = x; last.y2 = y;
    }
    skids.push({ x1: x, y1: y, x2: x, y2: y, w: w, a: 0.55 });
  }
  function drawSkids() {
    for (var i = 0; i < skids.length; i++) {
      var s = skids[i];
      ctx.save();
      ctx.globalAlpha = Math.min(s.a, 0.55);
      ctx.strokeStyle = '#111';
      ctx.lineWidth = s.w;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(s.x1, s.y1);
      ctx.lineTo(s.x2, s.y2);
      ctx.stroke();
      ctx.restore();
    }
  }

  /* ---------- rounded rect helper (no ctx.roundRect needed) ---------- */
  function rrect(x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y,     x + w, y + r,     r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x,     y + h, x,     y + h - r, r);
    ctx.lineTo(x,     y + r);
    ctx.arcTo(x,     y,     x + r, y,         r);
    ctx.closePath();
  }

  /* ---------- draw BMW M4 GT3 ---------- */
  function drawCar(carCX, roadY, rotAngle, rearLift, rearSpinAngle, frontSpinAngle, scale) {
    scale = scale || 1;
    ctx.save();
    ctx.translate(carCX, roadY);
    ctx.rotate(rotAngle);
    ctx.scale(scale, scale);

    var W = canvas.width;
    var bodyW = Math.round(W * 0.22);
    var bodyH = Math.round(bodyW * 0.28);
    var wR    = Math.round(bodyW * 0.14);
    var bx    = -bodyW / 2;
    var by    = -bodyH - wR * 0.55;

    /* -- underbody shadow -- */
    ctx.save();
    ctx.globalAlpha = 0.22;
    rrect(bx + 6, by + bodyH - 4, bodyW - 12, 14, 6);
    ctx.fillStyle = '#000';
    ctx.fill();
    ctx.restore();

    /* -- diffuser -- */
    ctx.save();
    var dg = ctx.createLinearGradient(bx, by + bodyH - 8, bx, by + bodyH + 4);
    dg.addColorStop(0, '#222');
    dg.addColorStop(1, '#111');
    ctx.fillStyle = dg;
    rrect(bx + bodyW * 0.15, by + bodyH - 4, bodyW * 0.7, 10, 3);
    ctx.fill();
    ctx.restore();

    /* -- side skirts -- */
    ctx.save();
    ctx.fillStyle = '#1a1a1a';
    rrect(bx, by + bodyH - 6, bodyW, 8, 2);
    ctx.fill();
    ctx.restore();

    /* -- main body -- */
    ctx.save();
    var bg = ctx.createLinearGradient(bx, by, bx, by + bodyH);
    bg.addColorStop(0,   '#f5f5f5');
    bg.addColorStop(0.5, '#e8e8e8');
    bg.addColorStop(1,   '#c8c8c8');
    ctx.fillStyle = bg;
    rrect(bx, by, bodyW, bodyH, bodyH * 0.18);
    ctx.fill();
    /* body border */
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    ctx.lineWidth = 1;
    rrect(bx, by, bodyW, bodyH, bodyH * 0.18);
    ctx.stroke();
    ctx.restore();

    /* -- M-sport stripe -- */
    ctx.save();
    ctx.save();
    rrect(bx, by, bodyW, bodyH, bodyH * 0.18);
    ctx.clip();
    var sx0 = bx + bodyW * 0.35;
    var stripW = bodyW * 0.22;
    ctx.fillStyle = '#1c4eb8';
    ctx.fillRect(sx0, by, stripW * 0.35, bodyH);
    ctx.fillStyle = '#d40000';
    ctx.fillRect(sx0 + stripW * 0.35, by, stripW * 0.30, bodyH);
    ctx.fillStyle = '#1c4eb8';
    ctx.fillRect(sx0 + stripW * 0.65, by, stripW * 0.35, bodyH);
    ctx.restore();
    ctx.restore();

    /* -- carbon hood -- */
    ctx.save();
    var hg = ctx.createLinearGradient(bx + bodyW * 0.5, by - bodyH * 0.12, bx + bodyW * 0.5, by);
    hg.addColorStop(0, '#1a1a1a');
    hg.addColorStop(1, '#333');
    ctx.fillStyle = hg;
    rrect(bx + bodyW * 0.5, by - bodyH * 0.12, bodyW * 0.5, bodyH * 0.22, 4);
    ctx.fill();
    ctx.restore();

    /* -- windscreen -- */
    ctx.save();
    var wg = ctx.createLinearGradient(bx + bodyW * 0.48, by - bodyH * 0.1, bx + bodyW * 0.48, by + bodyH * 0.12);
    wg.addColorStop(0, 'rgba(120,200,255,0.55)');
    wg.addColorStop(1, 'rgba(80,160,220,0.25)');
    ctx.fillStyle = wg;
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(bx + bodyW * 0.48, by + 2);
    ctx.lineTo(bx + bodyW * 0.78, by + 2);
    ctx.lineTo(bx + bodyW * 0.82, by + bodyH * 0.28);
    ctx.lineTo(bx + bodyW * 0.44, by + bodyH * 0.28);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    /* -- rear window -- */
    ctx.save();
    var rwg = ctx.createLinearGradient(bx + bodyW * 0.12, by, bx + bodyW * 0.12, by + bodyH * 0.25);
    rwg.addColorStop(0, 'rgba(100,180,240,0.45)');
    rwg.addColorStop(1, 'rgba(60,120,200,0.2)');
    ctx.fillStyle = rwg;
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(bx + bodyW * 0.12, by + 2);
    ctx.lineTo(bx + bodyW * 0.44, by + 2);
    ctx.lineTo(bx + bodyW * 0.42, by + bodyH * 0.26);
    ctx.lineTo(bx + bodyW * 0.14, by + bodyH * 0.26);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    /* -- LED headlights -- */
    ctx.save();
    var hlX = bx + bodyW - 6;
    /* upper strip */
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#aaeeff';
    ctx.shadowBlur = 8;
    ctx.fillRect(hlX, by + bodyH * 0.08, 6, 4);
    /* L-shape lower */
    ctx.fillRect(hlX, by + bodyH * 0.18, 6, bodyH * 0.28);
    ctx.fillRect(hlX - 10, by + bodyH * 0.38, 10, 4);
    ctx.restore();

    /* -- tail lights -- */
    ctx.save();
    ctx.fillStyle = '#cc0000';
    ctx.shadowColor = '#ff3300';
    ctx.shadowBlur = 10;
    ctx.fillRect(bx, by + bodyH * 0.1, 5, 4);
    ctx.fillRect(bx, by + bodyH * 0.2, 5, bodyH * 0.32);
    ctx.fillRect(bx + 5, by + bodyH * 0.44, 10, 4);
    ctx.restore();

    /* -- GT3 rear wing -- */
    ctx.save();
    var wingX = bx + 5;
    var wingY = by - bodyH * 0.28;
    /* endplates */
    ctx.fillStyle = '#111';
    ctx.fillRect(wingX, wingY, 5, bodyH * 0.32);
    ctx.fillRect(wingX + bodyW * 0.12 - 5, wingY, 5, bodyH * 0.32);
    /* main plane */
    var wg2 = ctx.createLinearGradient(wingX, wingY, wingX, wingY + 10);
    wg2.addColorStop(0, '#f0f0f0');
    wg2.addColorStop(1, '#c0c0c0');
    ctx.fillStyle = wg2;
    ctx.fillRect(wingX, wingY, bodyW * 0.12, 10);
    /* gurney flap */
    ctx.fillStyle = '#222';
    ctx.fillRect(wingX, wingY + 10, bodyW * 0.12, 4);
    ctx.restore();

    /* -- exhaust tips -- */
    ctx.save();
    for (var ei = 0; ei < 2; ei++) {
      var ex = bx + 8 + ei * 12;
      var ey = by + bodyH - 1;
      var eg = ctx.createRadialGradient(ex, ey, 0, ex, ey, 5);
      eg.addColorStop(0, '#ff8800');
      eg.addColorStop(0.5, '#cc4400');
      eg.addColorStop(1, '#333');
      ctx.fillStyle = eg;
      ctx.beginPath();
      ctx.ellipse(ex, ey, 4, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    /* -- front wheel -- */
    var fwCX = bodyW * 0.38;
    var fwCY = wR * 0.55;
    ctx.save();
    ctx.translate(fwCX, fwCY);
    ctx.rotate(frontSpinAngle);
    drawWheel(wR);
    ctx.restore();

    /* -- rear wheel (lifted during drift) -- */
    var rwCX = -bodyW * 0.34;
    var rwCY = wR * 0.55 - rearLift;
    ctx.save();
    ctx.translate(rwCX, rwCY);
    ctx.rotate(rearSpinAngle);
    drawWheel(wR);
    ctx.restore();

    ctx.restore(); /* end car transform */

    /* return world-space rear wheel pos for smoke */
    return {
      smokeX: carCX + (-bodyW / 2 * scale) + (-bodyW * 0.34 * scale),
      smokeY: roadY + (wR * 0.55 * scale) - rearLift
    };
  }

  function drawWheel(wR) {
    /* tyre */
    var tg = ctx.createRadialGradient(0, 0, wR * 0.55, 0, 0, wR);
    tg.addColorStop(0, '#444');
    tg.addColorStop(1, '#111');
    ctx.fillStyle = tg;
    ctx.beginPath();
    ctx.arc(0, 0, wR, 0, Math.PI * 2);
    ctx.fill();

    /* rim */
    var rg = ctx.createRadialGradient(0, 0, 0, 0, 0, wR * 0.72);
    rg.addColorStop(0,   '#b0b0b0');
    rg.addColorStop(0.5, '#888');
    rg.addColorStop(1,   '#555');
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(0, 0, wR * 0.72, 0, Math.PI * 2);
    ctx.fill();

    /* 10 spokes */
    ctx.save();
    for (var sp = 0; sp < 10; sp++) {
      ctx.rotate(Math.PI * 2 / 10);
      ctx.fillStyle = '#333';
      ctx.fillRect(-2, wR * 0.12, 4, wR * 0.52);
    }
    ctx.restore();

    /* brake caliper */
    ctx.save();
    ctx.fillStyle = '#cc0000';
    rrect(-wR * 0.22, -wR * 0.32, wR * 0.44, wR * 0.22, 3);
    ctx.fill();
    ctx.restore();

    /* hub */
    var hg = ctx.createRadialGradient(0, 0, 0, 0, 0, wR * 0.2);
    hg.addColorStop(0, '#ccc');
    hg.addColorStop(1, '#777');
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.arc(0, 0, wR * 0.18, 0, Math.PI * 2);
    ctx.fill();

    /* tyre sidewall ring */
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, wR * 0.88, 0, Math.PI * 2);
    ctx.stroke();
  }

  /* ---------- draw background ---------- */
  function drawBg() {
    var W = canvas.width, H = canvas.height;
    var skyH = H * 0.55;

    /* sky gradient */
    var sg = ctx.createLinearGradient(0, 0, 0, skyH);
    sg.addColorStop(0,   '#07091a');
    sg.addColorStop(0.6, '#0d1a3a');
    sg.addColorStop(1,   '#1a2a50');
    ctx.fillStyle = sg;
    ctx.fillRect(0, 0, W, skyH);

    /* stars */
    for (var i = 0; i < stars.length; i++) {
      var st = stars[i];
      ctx.save();
      ctx.globalAlpha = st.a * 0.9;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(st.x * W, st.y * H, st.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    /* city buildings */
    for (var b = 0; b < buildings.length; b++) {
      var bl = buildings[b];
      var bTop = skyH - bl.h;
      var bg2 = ctx.createLinearGradient(0, bTop, 0, skyH);
      bg2.addColorStop(0, '#1a2244');
      bg2.addColorStop(1, '#111928');
      ctx.fillStyle = bg2;
      ctx.fillRect(bl.x, bTop, bl.w, bl.h);

      /* windows */
      var cols = Math.floor(bl.w / 16);
      for (var f = 0; f < bl.floors; f++) {
        for (var c = 0; c < cols; c++) {
          var wi = f * cols + c;
          if (!bl.wins[wi]) continue;
          var lit = bl.wins[wi].lit;
          var wxp = bl.x + 4 + c * 16;
          var wyp = bTop + 5 + f * 14;
          ctx.fillStyle = lit ? 'rgba(255,240,160,0.85)' : 'rgba(40,60,100,0.5)';
          ctx.fillRect(wxp, wyp, 9, 8);
        }
      }
      /* edge lines */
      ctx.strokeStyle = 'rgba(60,80,140,0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(bl.x, bTop, bl.w, bl.h);
    }

    /* road */
    var roadY = H * 0.68;
    var rg2 = ctx.createLinearGradient(0, roadY - 10, 0, H);
    rg2.addColorStop(0, '#1a1a2a');
    rg2.addColorStop(0.3, '#111118');
    rg2.addColorStop(1, '#0a0a10');
    ctx.fillStyle = rg2;
    ctx.fillRect(0, roadY - 10, W, H - roadY + 10);

    /* road edge line */
    ctx.strokeStyle = 'rgba(100,120,200,0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, roadY + 2);
    ctx.lineTo(W, roadY + 2);
    ctx.stroke();

    /* centre dashes */
    ctx.strokeStyle = 'rgba(255,220,50,0.5)';
    ctx.lineWidth = 3;
    ctx.setLineDash([40, 36]);
    ctx.beginPath();
    ctx.moveTo(0, roadY + 22);
    ctx.lineTo(W, roadY + 22);
    ctx.stroke();
    ctx.setLineDash([]);

    /* ground glow */
    var gg = ctx.createLinearGradient(0, roadY - 10, 0, roadY + 40);
    gg.addColorStop(0, 'rgba(40,80,180,0.18)');
    gg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gg;
    ctx.fillRect(0, roadY - 10, W, 50);

    return roadY;
  }

  /* ---------- finish ---------- */
  function finishLoader() {
    var loader = document.getElementById('loader');
    if (!loader) return;
    loader.style.transition = 'opacity 0.7s ease';
    loader.style.opacity = '0';
    setTimeout(function () {
      loader.style.display = 'none';
      if (typeof startHeroAnimations === 'function') startHeroAnimations();
    }, 750);
  }

  /* ---------- state ---------- */
  var phase       = 'drive'; /* drive | drift | zoom | done */
  var progress    = 0;       /* 0 - 100 */
  var driftT      = 0;       /* 0 - 1 */
  var carX        = -0.18;   /* fraction of W */
  var carSpeedX   = 0.00022;
  var lastTs      = 0;
  var rearLift    = 0;
  var rearSpin    = 0;
  var frontSpin   = 0;
  var driftAngle  = 0;
  var zoomV       = 0;
  var skidTimer   = 0;
  var carScale    = 1;

  /* ---------- percentage display ---------- */
  var pctEl = document.getElementById('sgPctNum');
  function setProgress(v) {
    progress = Math.min(100, Math.max(0, v));
    if (pctEl) {
      var s = Math.round(progress).toString();
      while (s.length < 3) s = '0' + s;
      pctEl.textContent = s;
    }
  }

  /* ---------- speed lines ---------- */
  var speedLines = [];
  for (var sl = 0; sl < 18; sl++) {
    speedLines.push({
      y:   Math.random(),
      len: 60 + Math.random() * 120,
      spd: 0.5 + Math.random() * 0.8,
      a:   0.15 + Math.random() * 0.25
    });
  }
  function drawSpeedLines(W, H, alpha) {
    for (var i = 0; i < speedLines.length; i++) {
      var sl2 = speedLines[i];
      sl2.x = (sl2.x === undefined) ? Math.random() : sl2.x;
      sl2.x -= sl2.spd * 3;
      if (sl2.x < -sl2.len) { sl2.x = W + 20; sl2.y = Math.random(); }
      ctx.save();
      ctx.globalAlpha = sl2.a * alpha;
      ctx.strokeStyle = 'rgba(180,200,255,0.8)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sl2.x, sl2.y * H);
      ctx.lineTo(sl2.x + sl2.len, sl2.y * H);
      ctx.stroke();
      ctx.restore();
    }
  }

  /* ---------- main frame loop ---------- */
  function frame(ts) {
    if (phase === 'done') return;
    var dt = lastTs ? Math.min(ts - lastTs, 50) : 16;
    lastTs = ts;

    var W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    var roadY = drawBg();
    drawSkids();
    drawSpeedLines(W, H, phase === 'zoom' ? 1 : 0.4);

    if (phase === 'drive') {
      carX    += carSpeedX * dt;
      var pct  = (carX + 0.18) / 0.65 * 60;
      setProgress(Math.min(60, pct));
      frontSpin += dt * 0.012;
      rearSpin  += dt * 0.012;
      if (carX >= 0.47) { phase = 'drift'; }
    }

    if (phase === 'drift') {
      driftT += dt / 2200;
      if (driftT > 1) driftT = 1;

      /* ease function: ease in-out */
      var eio = driftT < 0.5 ? 2 * driftT * driftT : -1 + (4 - 2 * driftT) * driftT;
      setProgress(60 + eio * 40);

      rearLift   = eio * 28;
      var rsm    = 1 + eio * 16;   /* rear spin multiplier up to 17x */
      rearSpin  += dt * 0.012 * rsm;
      frontSpin += dt * 0.012;
      driftAngle = eio * 0.30;     /* body tilts ~17 deg */

      /* skid marks at rear wheel */
      skidTimer += dt;
      if (skidTimer > 55) {
        skidTimer = 0;
        var bodyW   = W * 0.22;
        var wR      = bodyW * 0.14;
        var skidX   = carX * W + (-bodyW / 2) + (-bodyW * 0.34);
        var skidY   = roadY + wR * 0.55 - rearLift;
        addSkid(skidX, skidY, 7);
      }

      if (driftT >= 1) {
        phase = 'zoom';
        zoomV = carSpeedX * 1.2;
      }
    }

    if (phase === 'zoom') {
      zoomV   += dt * 0.00004;
      carX    += zoomV * dt;
      driftAngle *= 0.92;
      rearLift   *= 0.88;
      frontSpin  += dt * 0.022;
      rearSpin   += dt * 0.022 * 4;

      /* red blur streaks */
      ctx.save();
      ctx.globalAlpha = 0.18;
      for (var rs = 0; rs < 5; rs++) {
        ctx.fillStyle = 'rgba(200,0,0,0.15)';
        ctx.fillRect(0, roadY - 30 + rs * 14, carX * W - 30, 6);
      }
      ctx.restore();

      if (carX > 1.3) { phase = 'done'; finishLoader(); return; }
    }

    /* smoke during drift */
    if (phase === 'drift' || phase === 'zoom') {
      var bodyWsm = W * 0.22;
      var wRsm    = bodyWsm * 0.14;
      var sX      = carX * W + (-bodyWsm / 2) + (-bodyWsm * 0.34);
      var sY      = roadY + wRsm * 0.55 - rearLift;
      if (Math.random() < 0.5) spawnSmoke(sX, sY);
    }
    updateSmoke(dt);
    drawSmoke();

    drawCar(carX * W, roadY, driftAngle, rearLift, rearSpin, frontSpin, carScale);

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();


/* ============================================================
   2. THREE.JS PARTICLE BACKGROUND
============================================================ */
(function initThreeJS() {
  if (typeof THREE === 'undefined') return;
  var canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  var scene  = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  /* particle geometry */
  var count = 3000;
  var positions = new Float32Array(count * 3);
  for (var i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 20;
  }
  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  var mat = new THREE.PointsMaterial({
    size: 0.018,
    color: 0x6c63ff,
    transparent: true,
    opacity: 0.7,
    sizeAttenuation: true
  });

  var particles = new THREE.Points(geo, mat);
  scene.add(particles);

  /* resize */
  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* mouse parallax */
  var mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', function (e) {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 0.4;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 0.4;
  });

  var clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    var t = clock.getElapsedTime();
    particles.rotation.y = t * 0.04 + mouseX;
    particles.rotation.x = t * 0.02 + mouseY;
    renderer.render(scene, camera);
  }
  animate();
})();

/* ============================================================
   3. HERO ANIMATIONS  (called after loader finishes)
============================================================ */
function startHeroAnimations() {

  /* --- typed text --- */
  var words   = ['Web Platforms', 'Scalable APIs', 'IoT Systems', 'Secure Applications', 'AI Tools'];
  var wordIdx = 0, charIdx = 0, deleting = false;
  var typedEl = document.getElementById('typed-text');
  function typeLoop() {
    if (!typedEl) return;
    var word = words[wordIdx];
    if (deleting) {
      charIdx--;
      typedEl.textContent = word.substring(0, charIdx);
      if (charIdx === 0) { deleting = false; wordIdx = (wordIdx + 1) % words.length; }
      setTimeout(typeLoop, 70);
    } else {
      charIdx++;
      typedEl.textContent = word.substring(0, charIdx);
      if (charIdx === word.length) { deleting = true; setTimeout(typeLoop, 1600); }
      else { setTimeout(typeLoop, 110); }
    }
  }
  typeLoop();

  /* --- counter animation --- */
  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var start  = 0;
    var dur    = 1800;
    var t0     = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(start + (target - start) * ease);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* --- intersection observer for scroll reveals --- */
  var revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        var el  = e.target;
        var del = parseInt(el.getAttribute('data-delay') || '0', 10);
        setTimeout(function () { el.classList.add('visible'); }, del);
        revealObs.unobserve(el);

        /* skill bars */
        el.querySelectorAll('.skill-fill').forEach(function (bar) {
          setTimeout(function () {
            bar.style.width = (bar.getAttribute('data-width') || '0') + '%';
            /* shimmer sweep after bar fills (~1.2s transition) */
            setTimeout(function () {
              bar.classList.remove('sk-shimmer');
              void bar.offsetWidth; /* force reflow */
              bar.classList.add('sk-shimmer');
            }, 1250);
          }, del + 300);
        });

        /* stat counters */
        el.querySelectorAll('.stat-num').forEach(function (c) {
          setTimeout(function () { animateCounter(c); }, del + 200);
        });
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(function (el) {
    revealObs.observe(el);
  });

  /* immediately reveal hero elements */
  document.querySelectorAll('.hero .reveal-up').forEach(function (el, i) {
    setTimeout(function () { el.classList.add('visible'); }, i * 120);
  });

  /* stat counters in hero (without observer) */
  document.querySelectorAll('.hero .stat-num').forEach(function (el) {
    setTimeout(function () { animateCounter(el); }, 600);
  });

  /* --- hero 3D card tilt --- */
  var heroCard = document.getElementById('heroCard');
  if (heroCard) {
    heroCard.addEventListener('mousemove', function (e) {
      var rect = heroCard.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width  - 0.5;
      var y = (e.clientY - rect.top)  / rect.height - 0.5;
      heroCard.style.transform = 'rotateY(' + (x * 22) + 'deg) rotateX(' + (-y * 18) + 'deg)';
    });
    heroCard.addEventListener('mouseleave', function () {
      heroCard.style.transform = 'rotateY(0deg) rotateX(0deg)';
    });
  }
}

/* ============================================================
   4. NAVIGATION
============================================================ */
(function initNav() {
  var navbar    = document.getElementById('navbar');
  var hamburger = document.getElementById('hamburger');
  var navLinks  = document.getElementById('navLinks');
  var links     = document.querySelectorAll('.nav-link');

  /* scroll: shrink + active link */
  window.addEventListener('scroll', function () {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 60);

    var scrollPos = window.scrollY + 90;
    links.forEach(function (link) {
      var sec = document.querySelector(link.getAttribute('href'));
      if (sec && sec.offsetTop <= scrollPos && sec.offsetTop + sec.offsetHeight > scrollPos) {
        links.forEach(function (l) { l.classList.remove('active'); });
        link.classList.add('active');
      }
    });

    /* back-to-top */
    var btn = document.getElementById('backToTop');
    if (btn) btn.classList.toggle('visible', window.scrollY > 400);
  });

  /* hamburger toggle */
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }

  /* back to top */
  var bttBtn = document.getElementById('backToTop');
  if (bttBtn) {
    bttBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();

/* ============================================================
   5. CUSTOM CURSOR
============================================================ */
(function initCursor() {
  var cursor   = document.getElementById('cursor');
  var follower = document.getElementById('cursorFollower');
  if (!cursor || !follower) return;

  var cx = 0, cy = 0, fx = 0, fy = 0;
  document.addEventListener('mousemove', function (e) { cx = e.clientX; cy = e.clientY; });

  function loop() {
    fx += (cx - fx) * 0.14;
    fy += (cy - fy) * 0.14;
    cursor.style.transform   = 'translate(' + cx + 'px,' + cy + 'px) translate(-50%,-50%)';
    follower.style.transform = 'translate(' + fx + 'px,' + fy + 'px) translate(-50%,-50%)';
    requestAnimationFrame(loop);
  }
  loop();

  document.querySelectorAll('a, button, .skill-card, .project-card').forEach(function (el) {
    el.addEventListener('mouseenter', function () {
      cursor.classList.add('hover');
      follower.classList.add('hover');
    });
    el.addEventListener('mouseleave', function () {
      cursor.classList.remove('hover');
      follower.classList.remove('hover');
    });
  });
})();

/* ============================================================
   6. SKILLS TABS
============================================================ */
(function initSkillsTabs() {
  var tabs   = document.querySelectorAll('.tab-btn');
  var panels = document.querySelectorAll('.skills-panel');
  tabs.forEach(function (btn) {
    btn.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('active'); });
      panels.forEach(function (p) { p.classList.remove('active'); });
      btn.classList.add('active');
      var panel = document.getElementById('tab-' + btn.getAttribute('data-tab'));
      if (panel) {
        panel.classList.add('active');

        /* premium stagger card entrance on tab switch */
        panel.querySelectorAll('.skill-card').forEach(function (card, i) {
          card.style.setProperty('--sk-delay', (i * 55) + 'ms');
          card.classList.remove('sk-tab-enter');
          void card.offsetWidth; /* force reflow to restart animation */
          card.classList.add('sk-tab-enter');
        });

        /* re-animate skill bars */
        panel.querySelectorAll('.skill-fill').forEach(function (bar, i) {
          bar.classList.remove('sk-shimmer');
          bar.style.width = '0';
          setTimeout(function () {
            bar.style.width = (bar.getAttribute('data-width') || '0') + '%';
            /* shimmer sweep after bar fills */
            setTimeout(function () {
              void bar.offsetWidth;
              bar.classList.add('sk-shimmer');
            }, 1250);
          }, 60 + i * 55);
        });
      }
    });
  });
})();

/* ============================================================
   7. PROJECTS FILTER
============================================================ */
(function initProjectsFilter() {
  var filterBtns = document.querySelectorAll('.filter-btn');
  var cards      = document.querySelectorAll('.project-card');
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var filter = btn.getAttribute('data-filter');
      cards.forEach(function (card) {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.style.display = '';
          setTimeout(function () { card.style.opacity = '1'; card.style.transform = ''; }, 10);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.9)';
          setTimeout(function () { card.style.display = 'none'; }, 300);
        }
      });
    });
  });
})();

/* ============================================================
   8. TESTIMONIALS SLIDER
============================================================ */
(function initSlider() {
  var track    = document.getElementById('testimonialsTrack');
  var prevBtn  = document.getElementById('prevBtn');
  var nextBtn  = document.getElementById('nextBtn');
  var dotsWrap = document.getElementById('sliderDots');
  if (!track) return;

  var cards   = track.querySelectorAll('.testimonial-card');
  var total   = cards.length;
  var current = 0;

  /* build dots */
  if (dotsWrap) {
    for (var d = 0; d < total; d++) {
      var dot = document.createElement('span');
      dot.className = 'slider-dot' + (d === 0 ? ' active' : '');
      dot.setAttribute('data-index', d);
      dotsWrap.appendChild(dot);
    }
    dotsWrap.addEventListener('click', function (e) {
      if (e.target.classList.contains('slider-dot')) {
        goTo(parseInt(e.target.getAttribute('data-index'), 10));
      }
    });
  }

  function goTo(idx) {
    current = (idx + total) % total;
    track.style.transform = 'translateX(-' + (current * 100) + '%)';
    if (dotsWrap) {
      dotsWrap.querySelectorAll('.slider-dot').forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }
  }

  if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1); });

  /* auto-play */
  setInterval(function () { goTo(current + 1); }, 5000);
})();

/* ============================================================
   9. CONTACT FORM
============================================================ */
(function initContactForm() {
  var form    = document.getElementById('contactForm');
  var success = document.getElementById('formSuccess');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    /* simulate send */
    setTimeout(function () {
      if (success) {
        success.style.display = 'flex';
        setTimeout(function () { success.style.display = 'none'; }, 4000);
      }
      form.reset();
    }, 600);
  });
})();

/* ============================================================
   10. EXPERIENCE SECTION  (timeline + canvas particles)
============================================================ */
(function initExperience() {

  /* --- experience canvas particles --- */
  var expCanvas = document.getElementById('expCanvas');
  if (expCanvas) {
    var ec  = expCanvas.getContext('2d');
    var eW, eH;
    function resizeExpCanvas() {
      var sec = document.getElementById('experience');
      eW = expCanvas.width  = sec ? sec.offsetWidth  : window.innerWidth;
      eH = expCanvas.height = sec ? sec.offsetHeight : 600;
    }
    resizeExpCanvas();
    window.addEventListener('resize', resizeExpCanvas);

    /* particles */
    var eParts = [];
    for (var i = 0; i < 80; i++) {
      eParts.push({
        x:  Math.random(),
        y:  Math.random(),
        r:  1 + Math.random() * 2,
        vx: (Math.random() - 0.5) * 0.0003,
        vy: (Math.random() - 0.5) * 0.0003,
        a:  0.2 + Math.random() * 0.5
      });
    }

    function drawExpCanvas() {
      ec.clearRect(0, 0, eW, eH);
      for (var j = 0; j < eParts.length; j++) {
        var p = eParts[j];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = 1;
        if (p.x > 1) p.x = 0;
        if (p.y < 0) p.y = 1;
        if (p.y > 1) p.y = 0;
        ec.save();
        ec.globalAlpha = p.a;
        ec.fillStyle = '#6c63ff';
        ec.beginPath();
        ec.arc(p.x * eW, p.y * eH, p.r, 0, Math.PI * 2);
        ec.fill();
        ec.restore();
      }
      requestAnimationFrame(drawExpCanvas);
    }
    drawExpCanvas();
  }

  /* --- SVG timeline line draw --- */
  var tlFill = document.getElementById('tlLineFill');
  var tlSvg  = document.getElementById('tlLineSvg');
  var tlDrawn = false;
  if (tlFill && tlSvg) {
    var tlObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !tlDrawn) {
          tlDrawn = true;
          var h = tlSvg.getBoundingClientRect().height;
          var start = 0, dur = 1200, t0 = null;
          function animLine(ts) {
            if (!t0) t0 = ts;
            var p = Math.min((ts - t0) / dur, 1);
            var ease = 1 - Math.pow(1 - p, 2);
            tlFill.setAttribute('y2', (ease * h) + 'px');
            if (p < 1) requestAnimationFrame(animLine);
          }
          requestAnimationFrame(animLine);
        }
      });
    }, { threshold: 0.1 });
    tlObs.observe(tlSvg);
  }

  /* --- timeline item entrance animations --- */
  var tlItems = document.querySelectorAll('.tl-ani');
  var tlItemObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        var item = e.target;
        var idx  = parseInt(item.getAttribute('data-index') || '0', 10);
        setTimeout(function () {
          item.classList.add('tl-visible');

          /* dot burst */
          var dot = item.querySelector('.dot-core');
          if (dot) {
            dot.style.transform = 'scale(1.8)';
            setTimeout(function () { dot.style.transform = ''; }, 400);
          }

          /* metric counters */
          item.querySelectorAll('.tl-metric-num').forEach(function (mn) {
            var target = parseInt(mn.getAttribute('data-count') || '0', 10);
            var t0m = null, dur2 = 1200;
            function stepM(ts) {
              if (!t0m) t0m = ts;
              var p = Math.min((ts - t0m) / dur2, 1);
              var ease = 1 - Math.pow(1 - p, 3);
              mn.textContent = Math.round(target * ease);
              if (p < 1) requestAnimationFrame(stepM);
            }
            requestAnimationFrame(stepM);
          });
        }, idx * 200);
        tlItemObs.unobserve(item);
      }
    });
  }, { threshold: 0.2 });

  tlItems.forEach(function (item) { tlItemObs.observe(item); });

})();

/* ============================================================
   11. SMOOTH SCROLL  for anchor links
============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(function (a) {
  a.addEventListener('click', function (e) {
    var target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
