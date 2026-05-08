// Hover/focus popover for idiom recipe panel cards.
//
// Usage:
//   import { attachIdiomPopover } from './idiom-popover.js';
//   attachIdiomPopover(document.getElementById('idiom-panel'));
//
// Each `.idiom-panel-card` element must carry:
//   data-pattern     — the operator pattern string shown in LTR mono
//   data-description — the Arabic description sentence
//
// The popover is suppressed when the panel has data-descriptions="visible"
// because the user is already reading inline descriptions.

/** @type {HTMLElement|null} */
let pop = null;

/** @type {number|null} */
let showTimer = null;

/** @type {boolean} */
let isVisible = false;

// ── Lifecycle helpers ────────────────────────────────────────────────────────

function ensurePopover() {
  if (pop) return pop;
  pop = document.createElement('div');
  pop.className = 'idiom-popover';
  pop.setAttribute('role', 'tooltip');

  const patternEl = document.createElement('div');
  patternEl.className = 'idiom-popover-pattern';
  patternEl.setAttribute('dir', 'ltr');
  pop.appendChild(patternEl);

  const descEl = document.createElement('div');
  descEl.className = 'idiom-popover-desc';
  pop.appendChild(descEl);

  return pop;
}

function hidePopover() {
  if (showTimer !== null) {
    clearTimeout(showTimer);
    showTimer = null;
  }
  if (!isVisible || !pop) return;
  pop.remove();
  isVisible = false;
  pop.classList.remove('idiom-popover-above');
}

/**
 * Populate and position the popover anchored to `card`.
 * @param {HTMLElement} card
 * @param {string} pattern
 * @param {string} description
 */
function showPopover(card, pattern, description) {
  const el = ensurePopover();

  // Populate content.
  el.querySelector('.idiom-popover-pattern').textContent = pattern;
  el.querySelector('.idiom-popover-desc').textContent = description;
  el.classList.remove('idiom-popover-above');

  const rect = card.getBoundingClientRect();
  const margin = 8;

  // Initial placement: below the card, leading edge aligned with the card.
  // The page is RTL; `rect.left` is the physical left regardless of direction,
  // so we position by `left` in fixed px and clamp both edges explicitly.
  el.style.position = 'fixed';
  el.style.zIndex = '1000';
  el.style.top = (rect.bottom + 6) + 'px';
  el.style.left = rect.left + 'px';

  // Append to body first so the browser gives us a real bounding box.
  if (!isVisible) {
    document.body.appendChild(el);
    isVisible = true;
  }

  // Vertical flip: if the popover would overflow the viewport bottom, flip above.
  const popRect = el.getBoundingClientRect();
  if (popRect.bottom > window.innerHeight - margin) {
    el.style.top = (rect.top - popRect.height - 6) + 'px';
    el.classList.add('idiom-popover-above');
  }

  // Horizontal clamp: keep both edges inside the viewport.
  // Works for RTL pages: we drive `left` (the physical CSS property) directly.
  const desiredLeft = rect.left;
  const maxLeft = window.innerWidth - popRect.width - margin;
  const clampedLeft = Math.max(margin, Math.min(desiredLeft, maxLeft));
  el.style.left = clampedLeft + 'px';
}

// ── Event handlers ───────────────────────────────────────────────────────────

/**
 * Find the nearest `.idiom-panel-card` ancestor (or self) of `target`.
 * @param {EventTarget|null} target
 * @returns {HTMLElement|null}
 */
function findCard(target) {
  if (!(target instanceof Element)) return null;
  return target.closest('.idiom-panel-card');
}

/**
 * @param {HTMLElement} panelRoot
 * @param {HTMLElement} card
 */
function scheduleShow(panelRoot, card) {
  if (showTimer !== null) clearTimeout(showTimer);
  showTimer = setTimeout(() => {
    showTimer = null;
    // Suppress if descriptions are already shown inline.
    if (panelRoot.dataset.descriptions === 'visible') return;
    const pattern = card.dataset.pattern ?? '';
    const description = card.dataset.description ?? '';
    if (!pattern && !description) return;
    showPopover(card, pattern, description);
  }, 200);
}

/**
 * Show immediately (for keyboard focus — no delay).
 * @param {HTMLElement} panelRoot
 * @param {HTMLElement} card
 */
function showNow(panelRoot, card) {
  if (showTimer !== null) {
    clearTimeout(showTimer);
    showTimer = null;
  }
  if (panelRoot.dataset.descriptions === 'visible') return;
  const pattern = card.dataset.pattern ?? '';
  const description = card.dataset.description ?? '';
  if (!pattern && !description) return;
  showPopover(card, pattern, description);
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Attach hover/focus popover behaviour to all `.idiom-panel-card` elements
 * inside `panelRoot`. Uses event delegation so cards added after the initial
 * render are also covered.
 *
 * @param {HTMLElement} panelRoot - The `<section id="idiom-panel">` element.
 */
export function attachIdiomPopover(panelRoot) {
  if (!panelRoot) return;

  // ── Delegated pointer events ─────────────────────────────────────────────

  panelRoot.addEventListener('mouseenter', (e) => {
    const card = findCard(e.target);
    if (!card) return;
    scheduleShow(panelRoot, card);
  }, true /* capture — fires before any stopPropagation inside the card */);

  panelRoot.addEventListener('mouseleave', (e) => {
    const card = findCard(e.target);
    if (!card) return;
    // Only hide when leaving the card itself, not when moving inside it.
    if (card.contains(/** @type {Node} */ (e.relatedTarget))) return;
    hidePopover();
  }, true);

  // ── Delegated focus events ───────────────────────────────────────────────

  panelRoot.addEventListener('focusin', (e) => {
    const card = findCard(e.target);
    if (!card) return;
    showNow(panelRoot, card);
  });

  panelRoot.addEventListener('focusout', (e) => {
    const card = findCard(e.target);
    if (!card) return;
    // Only hide when focus leaves the card entirely.
    if (card.contains(/** @type {Node} */ (e.relatedTarget))) return;
    hidePopover();
  });

  // ── Keyboard: Escape ─────────────────────────────────────────────────────

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isVisible) hidePopover();
  });

  // ── Resize: hide rather than reflow ─────────────────────────────────────

  window.addEventListener('resize', () => {
    if (isVisible) hidePopover();
  });

  // ── Outside click ────────────────────────────────────────────────────────

  document.addEventListener('click', (e) => {
    if (!isVisible || !pop) return;
    if (pop.contains(/** @type {Node} */ (e.target))) return;
    if (panelRoot.contains(/** @type {Node} */ (e.target))) return;
    hidePopover();
  }, true);
}
