// Electric Sheep: the pixel sheep from the installation's info screen and
// dashboard (same sprites, colours and behaviour).
// - Credits: a small sheep lives on each name's line (added automatically).
// - Optional pasture with the whole flock: put
//   <div class="pasture" aria-hidden="true"><canvas></canvas></div> in the page.
// Both pause when off screen; with reduced motion the sheep stand still.
(function () {
  var box = document.querySelector('.pasture');
  var cv = box && box.querySelector('canvas'), ctx = cv && cv.getContext && cv.getContext('2d');

  // The flock, as named on the page. Dolly wears the headphones.
  var FLOCK = [
    { name: 'dolly', phones: true }, { name: 'nyx' }, { name: 'hypnos' }, { name: 'morpheus' },
    { name: 'oneiros' }, { name: 'phobetor' }, { name: 'lethe' }
  ];
  var STILL = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Info screen palette
  var C = { O: '#3a2a63', E: '#7dffb0', H: '#ffffff', D: '#1b1826', A: '#ffb547', R: '#ff5c7a', T: '#a77bff', Z: '#7dffb0' };
  var SW = 20, SH = 14, TOP = 5;
  var BODY = [
    '...OOO.OOOO....',
    '.OOWWWOWWWWOO..',
    'OWWHHWWWWWWWWO.',
    'OWHHWWWWWWWWWWO',
    'OWWWWWWWWWWWWWO',
    'OWWWWWWWWWWWWSO',
    '.OSWWWWWWWWWSO.',
    '.OSSWWWSSWSSSO.',
    '..OOSSOOSSOOO..',
    '....OO..OO.....'
  ];
  var HEAD = [
    '..OOO...',
    '.OWWWOO.',
    'OOFFFFFO',
    'OFOFFeFO',
    '.OOFFFFO',
    '...OFFFO',
    '....OOO.'
  ];
  var TUFT = [[2, -1, 'O'], [3, -1, 'W'], [4, -1, 'O'], [3, -2, 'O']];
  var PHONES = [[1, -1, 'T'], [2, -1, 'T'], [3, -1, 'T'], [4, -1, 'T'], [5, -1, 'T'], [0, 0, 'T'],
                [0, 1, 'T'], [0, 2, 'A'], [1, 2, 'A'], [0, 3, 'A'], [1, 3, 'A'], [0, 4, 'A'], [1, 4, 'A']];
  var BELL = [[13, 7, 'A'], [13, 8, 'A']];
  var LEGS = [[3, 5, 9, 11], [2, 6, 8, 12]];
  var Z = ['ZZZ', '..Z', '.Z.', 'Z..', 'ZZZ'];
  var WOOL = ['#eeeaf8', '#e6dcff', '#f4e6f6', '#e2efea', '#f6f1e6'];
  var FACE = ['#a77bff', '#8a5cf0', '#c08cff', '#6f5bd6', '#d07be8'];

  var S = 4, W = 0, Hh = 0, cols = 0, rows = 0, dpr = 1, last = 0, drawn = 0, tufts = [];
  var herd = [], running = false, visible = true;

  function hash(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619); return h >>> 0; }
  function rng(seed) {
    return function () {
      seed = (seed + 0x6D2B79F5) | 0; var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function mix(a, b, t) {
    var p = function (x) { return [1, 3, 5].map(function (i) { return parseInt(x.slice(i, i + 2), 16); }); };
    var x = p(a), y = p(b);
    return '#' + x.map(function (c, i) { return Math.round(c + (y[i] - c) * t).toString(16).padStart(2, '0'); }).join('');
  }
  function pickR(r, list) { return list[Math.floor(r() * list.length)]; }

  function make(s, i) {
    var r = rng(hash('electric-sheep-' + s.name));
    var wool = pickR(r, WOOL), face = pickR(r, FACE);
    return {
      name: s.name, wool: wool, face: face, phones: !!s.phones,
      shade: mix(wool, C.T, 0.32), legs: mix(face, '#000000', 0.35),
      extra: pickR(r, [null, null, 'tuft', 'bell']),
      speed: 4 + r() * 5, lazy: 0.25 + r() * 0.5, lane: Math.floor(r() * 3),
      xf: (i + Math.random()) / FLOCK.length, x: 0, dir: Math.random() < 0.5 ? -1 : 1,
      mode: 'idle', t: 0, until: 0, blinkAt: performance.now() + 1000 + Math.random() * 4000, blink: 0,
      zPhase: Math.random() * 3, mood: 'roam', moodUntil: 0
    };
  }

  function resize() {
    dpr = window.devicePixelRatio || 1;
    W = cv.offsetWidth; Hh = cv.offsetHeight;
    S = W < 500 ? 3 : 4;
    cv.width = Math.round(W * dpr); cv.height = Math.round(Hh * dpr);
    var oldMax = Math.max(1, cols - SW);
    cols = Math.floor(W / S); rows = Math.floor(Hh / S);
    var max = Math.max(0, cols - SW);
    herd.forEach(function (sh) {
      sh.x = sh.xf !== undefined ? max * sh.xf : Math.min(max, sh.x * max / oldMax);
      delete sh.xf;
    });
    tufts = makeGrass(cols, 7);
    draw();
  }

  // Everyone grazes; now and then one sheep falls asleep for a while.
  function moods() {
    var now = Date.now();
    herd.forEach(function (sh) {
      if (now < sh.moodUntil) return;
      var asleep = herd.filter(function (x) { return x.mood === 'sleep'; }).length;
      var next;
      if (sh.mood === 'sleep' || asleep || Math.random() > 0.08) { next = 'roam'; sh.moodUntil = now + 20000 + Math.random() * 40000; }
      else { next = 'sleep'; sh.moodUntil = now + 15000 + Math.random() * 20000; }
      if (next !== sh.mood) { sh.mood = next; sh.until = 0; }
    });
  }

  function decide(sh, now) {
    var r = Math.random;
    if (sh.mood === 'sleep') { sh.mode = 'sleep'; sh.until = Infinity; }
    else if (STILL) { sh.mode = 'idle'; sh.until = Infinity; }
    else {
      var x = r();
      if (x < 0.5 - sh.lazy * 0.4) {
        sh.mode = 'walk';
        var edge = sh.x < 4 ? 1 : sh.x > cols - SW - 4 ? -1 : 0;
        sh.dir = edge || (r() < 0.4 ? -sh.dir : sh.dir);
        sh.until = now + 1500 + r() * 4500;
      } else if (x < 0.85) { sh.mode = 'graze'; sh.until = now + 2000 + r() * 5000; }
      else { sh.mode = 'idle'; sh.until = now + 800 + r() * 2200; }
    }
    sh.t = 0;
  }

  function step(sh, now, dt) {
    if (now >= sh.until) decide(sh, now);
    sh.t += dt;
    if (sh.mode === 'walk') {
      sh.x += sh.dir * sh.speed * dt;
      var max = Math.max(0, cols - SW);
      if (sh.x < 0) { sh.x = 0; sh.dir = 1; }
      if (sh.x > max) { sh.x = max; sh.dir = -1; }
    }
    if (sh.mode !== 'sleep' && now >= sh.blinkAt) { sh.blink = now + 140; sh.blinkAt = now + 2000 + Math.random() * 5000; }
    sh.zPhase += dt;
  }

  // c: canvas context, S: screen px per sheep px, rows: canvas height in sheep px
  function drawSheep(c, S, rows, sh, now) {
    var oy = Math.max(Math.min(TOP, rows - SH), rows - SH - (2 - sh.lane));
    var ox = Math.round(sh.x);
    var flip = sh.dir < 0;
    function put(x, y, col, mirror) {
      if (mirror === undefined) mirror = flip;
      var X = mirror ? SW - 1 - x : x;
      c.fillStyle = col;
      c.fillRect((ox + X) * S, (oy + y) * S, S, S);
    }
    function col(ch) { return ch === 'W' ? sh.wool : ch === 'S' ? sh.shade : ch === 'F' ? sh.face : C[ch]; }
    function sprite(rowsArr, dx, dy) {
      rowsArr.forEach(function (row, y) {
        for (var x = 0; x < row.length; x++) {
          var ch = row[x];
          if (ch === '.') continue;
          if (ch === 'e') put(dx + x, dy + y, now < sh.blink || sh.mode === 'sleep' ? C.O : C.E);
          else put(dx + x, dy + y, col(ch));
        }
      });
    }
    var asleep = sh.mode === 'sleep';
    var f = sh.mode === 'walk' ? Math.floor(sh.t * 6) % 2 : 0;
    var bob = asleep ? 2 : f;
    var chew = sh.mode === 'graze' ? Math.floor(sh.t * 3) % 2 : 0;
    var head = asleep ? [12, 4] : sh.mode === 'graze' ? [13, 5 + chew] : [12, bob];
    for (var x = 1; x < 15; x++) put(x, SH - 1, C.D);
    if (!asleep) LEGS[f].forEach(function (lx) { for (var y = 10 + bob; y < SH; y++) put(lx, y, sh.legs); });
    sprite(BODY, 0, 2 + bob);
    if (sh.extra === 'bell' && !asleep) BELL.forEach(function (b) { put(b[0], b[1] + 2 + bob, C[b[2]]); });
    sprite(HEAD, head[0], head[1]);
    if (sh.phones) PHONES.forEach(function (p) { put(head[0] + p[0], head[1] + p[1], C[p[2]]); });
    else if (sh.extra === 'tuft') TUFT.forEach(function (p) { put(head[0] + p[0], head[1] + p[1], col(p[2])); });
    if (asleep && !STILL) {
      for (var i = 0; i < 2; i++) {
        var k = ((sh.zPhase / 2.4) + i / 2) % 1;
        c.globalAlpha = k < 0.15 ? k / 0.15 : 1 - (k - 0.15) / 0.85;
        var hx = flip ? SW - 1 - (head[0] + 6) : head[0] + 4;
        Z.forEach(function (row, y) {
          for (var zx = 0; zx < row.length; zx++) {
            if (row[zx] === 'Z') put(hx + zx + Math.round(k * 3), head[1] - 4 - Math.round(k * 5) + y, C.Z, false);
          }
        });
        c.globalAlpha = 1;
      }
    }
  }

  // Pixel grass along the bottom, in the info screen's grass colour.
  var GRASS = [C.D];
  function makeGrass(cols, seed) {
    var r = rng(seed), list = [];
    for (var x = 0; x < cols; x += 1 + Math.floor(r() * 3)) {
      var tall = 1 + Math.floor(r() * r() * 5);           // mostly short, now and then tall
      list.push([x, tall, GRASS[Math.floor(r() * GRASS.length)], r() < 0.5 ? -1 : 1]);
    }
    return list;
  }
  function drawGrass(c, S, rows, list) {
    var base = rows - 1;
    list.forEach(function (g) {
      var x = g[0], h = g[1], lean = g[3];
      c.fillStyle = g[2];
      c.fillRect(x * S, (base - h + 1) * S, S, h * S);               // middle blade
      if (h > 1) c.fillRect((x + lean) * S, (base - h + 2) * S, S, (h - 1) * S);  // a shorter one beside it
      c.fillRect((x - lean) * S, base * S, S, S);                    // a stub on the other side
    });
  }

  function draw(now) {
    if (now === undefined) now = performance.now();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, Hh);
    drawGrass(ctx, S, rows, tufts);
    herd.slice().sort(function (a, b) { return a.lane - b.lane || a.x - b.x; })
      .forEach(function (sh) { drawSheep(ctx, S, rows, sh, now); });
  }

  function frame(now) {
    if (!running) return;
    var dt = Math.min(0.25, last ? (now - last) / 1000 : 0);
    last = now;
    herd.forEach(function (sh) { step(sh, now, dt); });
    if (now - drawn >= 66) { drawn = now; draw(now); }   // ~15 fps, like the original
    requestAnimationFrame(frame);
  }
  function start() {
    if (running || STILL || !visible) return;
    running = true; last = 0;
    requestAnimationFrame(frame);
  }
  function stop() { running = false; }

  // A small sheep after each name in the credits, living on the rest of its
  // line like the flock in the pasture: it wanders, grazes, blinks and now and
  // then falls asleep.
  var credits = [].slice.call(document.querySelectorAll('.block-credits dd')).map(function (dd) {
    var cs = 2, crows = SH + 7;   // room above for the z's
    var name = document.createElement('span');
    while (dd.firstChild) name.appendChild(dd.firstChild);
    dd.appendChild(name);
    dd.classList.add('with-sheep');
    var c = document.createElement('canvas');
    c.className = 'credit-sheep';
    c.setAttribute('aria-hidden', 'true');
    c.style.height = crows * cs + 'px';
    dd.appendChild(c);
    var sh = make({ name: name.textContent.trim().toLowerCase() }, 0);
    sh.lane = 2; sh.x = 0; delete sh.xf;
    return { el: c, ctx: c.getContext('2d'), cs: cs, rows: crows, w: 0, r: 1, max: 0, sh: sh, first: true,
             seed: hash(name.textContent), grass: [] };
  });
  function sizeCredits() {
    credits.forEach(function (k) {
      k.r = window.devicePixelRatio || 1;
      k.w = k.el.offsetWidth;
      k.el.width = Math.round(k.w * k.r); k.el.height = Math.round(k.rows * k.cs * k.r);
      var max = Math.max(0, Math.floor(k.w / k.cs) - SW);
      k.sh.x = k.first ? Math.random() * max : Math.min(k.sh.x, max);
      k.max = max; k.first = false;
      k.grass = makeGrass(Math.floor(k.w / k.cs), k.seed);
    });
  }
  function stepCredit(k, now, dt) {
    var sh = k.sh, r = Math.random;
    if (now >= sh.until) {
      var x = r();
      if (sh.mood === 'sleep') { sh.mode = 'sleep'; sh.until = Infinity; }
      else if (STILL) { sh.mode = 'idle'; sh.until = Infinity; }
      else if (x < 0.5 - sh.lazy * 0.4 && k.max > 0) {
        sh.mode = 'walk';
        var edge = sh.x < 2 ? 1 : sh.x > k.max - 2 ? -1 : 0;
        sh.dir = edge || (r() < 0.4 ? -sh.dir : sh.dir);
        sh.until = now + 1500 + r() * 4500;
      } else if (x < 0.85) { sh.mode = 'graze'; sh.until = now + 2000 + r() * 5000; }
      else { sh.mode = 'idle'; sh.until = now + 800 + r() * 2200; }
      sh.t = 0;
    }
    sh.t += dt;
    if (sh.mode === 'walk') {
      sh.x += sh.dir * sh.speed * dt;
      if (sh.x < 0) { sh.x = 0; sh.dir = 1; }
      if (sh.x > k.max) { sh.x = k.max; sh.dir = -1; }
    }
    if (!STILL && sh.mode !== 'sleep' && now >= sh.blinkAt) { sh.blink = now + 140; sh.blinkAt = now + 2000 + Math.random() * 5000; }
    sh.zPhase += dt;
  }
  // Now and then one of them falls asleep for a while (never two at once).
  function creditMoods() {
    var now = Date.now();
    credits.forEach(function (k) {
      var sh = k.sh;
      if (now < sh.moodUntil) return;
      var asleep = credits.filter(function (o) { return o.sh.mood === 'sleep'; }).length;
      var next;
      if (sh.mood === 'sleep' || asleep || Math.random() > 0.08) { next = 'roam'; sh.moodUntil = now + 20000 + Math.random() * 40000; }
      else { next = 'sleep'; sh.moodUntil = now + 15000 + Math.random() * 20000; }
      if (next !== sh.mood) { sh.mood = next; sh.until = 0; }
    });
  }
  var creditsLast = 0;
  function drawCredits(now) {
    var dt = Math.min(0.25, creditsLast ? (now - creditsLast) / 1000 : 0);
    creditsLast = now;
    credits.forEach(function (k) {
      stepCredit(k, now, dt);
      k.ctx.setTransform(k.r, 0, 0, k.r, 0, 0);
      k.ctx.clearRect(0, 0, k.w, k.rows * k.cs);
      drawGrass(k.ctx, k.cs, k.rows, k.grass);
      drawSheep(k.ctx, k.cs, k.rows, k.sh, now);
    });
  }
  if (credits.length) {
    sizeCredits();
    drawCredits(performance.now());
    window.addEventListener('resize', function () { sizeCredits(); drawCredits(performance.now()); });
    if (!STILL) {
      var creditsOn = true;
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) { creditsOn = entries[0].isIntersecting; })
          .observe(document.querySelector('.block-credits'));
      }
      setInterval(function () { if (creditsOn) drawCredits(performance.now()); else creditsLast = 0; }, 66);
      creditMoods();
      setInterval(creditMoods, 2000);
    }
  }

  if (!ctx) return;
  herd = FLOCK.map(make);
  resize();
  herd.forEach(function (sh) { decide(sh, performance.now()); });
  draw();
  window.addEventListener('resize', resize);

  if (!STILL) {
    moods();
    setInterval(moods, 2000);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        visible ? start() : stop();
      }).observe(box);
    }
    start();
  }
})();
