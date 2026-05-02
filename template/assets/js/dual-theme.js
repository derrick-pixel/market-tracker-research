/* dual-theme.js — Editorial ↔ Modern SaaS theme switcher for Elitez Vantage.
 * Persists choice via localStorage; default = editorial.
 * Drop into any page that includes /showcase/assets/dual-theme.css
 * plus a .theme-switch element with two buttons (data-theme="editorial"
 * and data-theme="saas").
 */
(function () {
  'use strict';
  var STORAGE_KEY = 'elitez-vantage-theme';
  var VALID_THEMES = ['editorial', 'saas'];

  function applyTheme(theme) {
    if (VALID_THEMES.indexOf(theme) === -1) theme = 'editorial';
    var body = document.body;
    body.classList.remove('theme-editorial', 'theme-saas');
    body.classList.add('theme-' + theme);
    var buttons = document.querySelectorAll('.theme-switch button');
    for (var i = 0; i < buttons.length; i++) {
      var b = buttons[i];
      var match = b.dataset.theme === theme;
      b.classList.toggle('active', match);
      b.setAttribute('aria-pressed', match ? 'true' : 'false');
    }
  }

  function init() {
    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    applyTheme(saved && VALID_THEMES.indexOf(saved) !== -1 ? saved : 'editorial');

    var buttons = document.querySelectorAll('.theme-switch button');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function (ev) {
        var theme = ev.currentTarget.dataset.theme;
        applyTheme(theme);
        try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) {}
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
