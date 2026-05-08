// Beginner/Advanced mode controller. Default is 'beginner'.
// Switching toggles body.mode-beginner / body.mode-advanced classes;
// listeners are notified after the class flip.

/**
 * @param {object} args
 * @param {HTMLButtonElement} args.btnBeginner
 * @param {HTMLButtonElement} args.btnAdvanced
 * @param {HTMLElement} args.body
 */
export function createModeController({ btnBeginner, btnAdvanced, body }) {
  let currentMode = 'beginner';
  const listeners = [];

  function set(mode) {
    if (mode === currentMode) return;
    currentMode = mode;
    body.classList.toggle('mode-beginner', mode === 'beginner');
    body.classList.toggle('mode-advanced', mode === 'advanced');
    btnBeginner.setAttribute('aria-pressed', mode === 'beginner' ? 'true' : 'false');
    btnAdvanced.setAttribute('aria-pressed', mode === 'advanced' ? 'true' : 'false');
    listeners.forEach(cb => { try { cb(mode); } catch (e) { console.warn(e); } });
  }

  function get() { return currentMode; }

  function on(cb) {
    if (typeof cb === 'function') listeners.push(cb);
  }

  btnBeginner.addEventListener('click', () => set('beginner'));
  btnAdvanced.addEventListener('click', () => set('advanced'));

  return { get, set, on };
}
