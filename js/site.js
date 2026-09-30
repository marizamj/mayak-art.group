// Split layout: keep the text column in view while the media scrolls.
// If the text is taller than the screen, it scrolls with the page until its
// end is visible, then stays put. Without this script the column just scrolls
// normally, so nothing breaks.
(function () {
  var info = document.querySelector('.layout-split .project-info');
  if (!info) return;
  var wide = window.matchMedia('(min-width: 801px)');

  function update() {
    if (!wide.matches) { info.style.position = ''; info.style.top = ''; return; }
    info.style.position = 'sticky';
    info.style.top = Math.min(0, window.innerHeight - info.offsetHeight) + 'px';
  }

  update();
  window.addEventListener('resize', update);
  wide.addEventListener('change', update);
})();

// Homepage beam: follows the cursor with a delay.
// The beam's angle is a Gaussian-weighted average of where it was asked to
// point over the last moments (centred DELAY ms in the past, spread SIGMA),
// so it trails the cursor smoothly. When the cursor is idle or away, it goes
// back to a slow sweep. Only for mouse/trackpad users who haven't asked for
// reduced motion; everyone else keeps the CSS sweep.
(function () {
  var beam = document.querySelector('.hero .beam');
  if (!beam || !window.requestAnimationFrame) return;
  var canFollow = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  if (!canFollow.matches) return;

  var DELAY = 250;          // ms the beam lags behind the cursor
  var SIGMA = 110;          // ms spread of the Gaussian smoothing
  var IDLE_AFTER = 2500;    // ms without movement before the sweep resumes
  var BEAM_CENTRE = 84;     // deg: brightest line of the cone at rotate(0) (conic 'from' + peak stop in style.css)
  var MIN = -55, MAX = 40;  // deg: keep the beam within the header

  var hero = beam.parentElement;
  var samples = [];         // { t, angle }
  var mouse = null, lastMove = -Infinity, running = false, visible = true;

  // Slow back-and-forth sweep, same range and pace as the CSS animation.
  function sweep(t) {
    return -8 - 30 * Math.cos(t / 14000 * Math.PI);
  }

  function cursorAngle() {
    // The cone's origin: the beam's left edge, halfway down (from its layout
    // position, which ignores the rotation; may be off-screen).
    var r = hero.getBoundingClientRect();
    var ox = r.left + beam.offsetLeft, oy = r.top + beam.offsetTop + beam.offsetHeight / 2;
    var dx = mouse.x - ox, dy = mouse.y - oy;
    var a = Math.atan2(dx, -dy) * 180 / Math.PI - BEAM_CENTRE; // clockwise from up
    return Math.max(MIN, Math.min(MAX, a));
  }

  function frame(now) {
    if (!running) return;
    var active = mouse && now - lastMove < IDLE_AFTER;
    samples.push({ t: now, angle: active ? cursorAngle() : sweep(now) });
    var cutoff = now - DELAY - 3 * SIGMA;
    while (samples.length > 2 && samples[0].t < cutoff) samples.shift();

    var centre = now - DELAY, sum = 0, weights = 0;
    for (var i = 0; i < samples.length; i++) {
      var d = samples[i].t - centre;
      var w = Math.exp(-(d * d) / (2 * SIGMA * SIGMA));
      sum += w * samples[i].angle;
      weights += w;
    }
    var angle = weights > 1e-6 ? sum / weights : samples[samples.length - 1].angle;
    beam.style.transform = 'rotate(' + angle.toFixed(2) + 'deg)';
    requestAnimationFrame(frame);
  }

  function start() {
    if (running || !visible) return;
    running = true;
    samples = [];
    requestAnimationFrame(frame);
  }
  function stop() { running = false; }

  beam.classList.add('beam-follow');   // turns off the CSS sweep
  window.addEventListener('mousemove', function (e) {
    mouse = { x: e.clientX, y: e.clientY };
    lastMove = performance.now();
  }, { passive: true });
  document.documentElement.addEventListener('mouseleave', function () { lastMove = -Infinity; });

  // Only animate while the header is on screen.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      visible ? start() : stop();
    }).observe(hero);
  }
  start();
})();
