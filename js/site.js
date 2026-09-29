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
