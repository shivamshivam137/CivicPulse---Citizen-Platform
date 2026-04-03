// js/i18n.js
// ── INTERNATIONALIZATION (i18n) ENGINE ────────────────────────

function getCurrentLang() {
  return localStorage.getItem('civicpulse_lang') || 'en';
}

function applyTranslations() {
  if (!window.translations) return;

  const lang = getCurrentLang();
  const dict = window.translations[lang] || window.translations['en'];

  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = dict[key];
      } else {
        el.innerHTML = dict[key];
      }
    }
  });
}

function setLanguage(lang) {
  localStorage.setItem('civicpulse_lang', lang);
  applyTranslations();
  
  document.querySelectorAll('.lang-selector').forEach(sel => {
    sel.value = lang;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  applyTranslations();
  
  // Event Delegation for dynamically injected select elements
  document.addEventListener('change', (e) => {
    if (e.target && e.target.classList.contains('lang-selector')) {
      setLanguage(e.target.value);
    }
  });

  document.querySelectorAll('.lang-selector').forEach(sel => {
    sel.value = getCurrentLang();
  });
});
