const THEME_KEY = 'snapshoot-theme';
const THEMES = ['retro', 'funky'];

function readStoredTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return THEMES.indexOf(saved) > -1 ? saved : null;
  } catch (e) {
    return null;
  }
}

function getTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  return THEMES.indexOf(current) > -1 ? current : 'funky';
}

function setTheme(theme) {
  const next = THEMES.indexOf(theme) > -1 ? theme : 'funky';
  document.documentElement.setAttribute('data-theme', next);
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch (e) {}
  document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: next } }));
  return next;
}

function initTheme() {
  setThemeToggleState(readStoredTheme() || getTheme());
  document.querySelectorAll('[data-theme-set]').forEach(function (button) {
    button.addEventListener('click', function () {
      setThemeToggleState(setTheme(button.getAttribute('data-theme-set')));
    });
  });
}

function setThemeToggleState(theme) {
  document.querySelectorAll('[data-theme-set]').forEach(function (button) {
    const active = button.getAttribute('data-theme-set') === theme;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}
