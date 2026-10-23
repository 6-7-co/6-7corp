// Apply the theme before first paint to avoid a flash of the wrong theme.
// This runs as a render-blocking external script (referenced from <head>), so
// it executes before the body paints. Kept in public/ so Vite ships it as-is.
(function () {
  try {
    var t = localStorage.getItem('corp_theme');
    if (t !== 'light' && t !== 'dark') {
      t = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    document.documentElement.setAttribute('data-theme', t);
  } catch (e) {}
})();
