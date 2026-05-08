// UI language controller. Mirrors src/core/mode.js — singleton state +
// listener fan-out + body-class flip. The active language drives every
// label, placeholder, validation message, and tip in the app.
//
// State is in-memory only (refresh resets to Arabic, the original audience).
// Switching language preserves chip state and form state — only the
// presentation changes.

let activeLang = 'ar';
const listeners = [];

/**
 * @param {object} args
 * @param {HTMLButtonElement} args.btnAr
 * @param {HTMLButtonElement} args.btnEn
 * @param {HTMLElement} args.body
 * @param {HTMLElement} [args.html]
 * @param {'ar' | 'en'} [args.initial='ar']
 */
export function createLangController({ btnAr, btnEn, body, html, initial = 'ar' }) {
  const htmlEl = html || document.documentElement;
  activeLang = initial;
  applyDom();

  function applyDom() {
    if (htmlEl) {
      htmlEl.lang = activeLang;
      htmlEl.dir = activeLang === 'ar' ? 'rtl' : 'ltr';
    }
    if (body) {
      body.classList.toggle('lang-ar', activeLang === 'ar');
      body.classList.toggle('lang-en', activeLang === 'en');
    }
    if (btnAr) btnAr.setAttribute('aria-pressed', activeLang === 'ar' ? 'true' : 'false');
    if (btnEn) btnEn.setAttribute('aria-pressed', activeLang === 'en' ? 'true' : 'false');
  }

  function set(lang) {
    if (lang !== 'ar' && lang !== 'en') return;
    if (lang === activeLang) return;
    activeLang = lang;
    applyDom();
    listeners.forEach(cb => { try { cb(activeLang); } catch (e) { console.warn('lang listener failed', e); } });
  }

  function get() { return activeLang; }
  function on(cb) { if (typeof cb === 'function') listeners.push(cb); }

  if (btnAr) btnAr.addEventListener('click', () => set('ar'));
  if (btnEn) btnEn.addEventListener('click', () => set('en'));

  return { get, set, on };
}

// Module-level accessor so i18n.js (and any consumer that doesn't receive
// ctx) can read the active language. Until createLangController runs we
// return 'ar' so first-paint strings come out as the original Arabic.
export function getActiveLang() {
  return activeLang;
}
