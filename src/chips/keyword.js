// Keyword chip — the default chip type. Carries free-text Arabic or Latin
// content with optional NOT prefix and optional exact-phrase quoting.
//
// Phase 4: this is the only term-chip type. Phase 5 introduces specialized
// types (site, intitle, etc.) that look similar but emit different query
// fragments and may have different content directionality.

export const type = 'keyword';

/** Arabic display label for the chip drawer / pickers. */
export const label = 'كلمة';

export function defaultProps() {
  return { text: '', negate: false, quoted: false };
}

/**
 * @param {{ id: string, type: string, props: { text: string, negate: boolean, quoted: boolean } }} chip
 * @param {import('../core/ctx.js').Ctx} ctx
 */
export function assemble(chip, ctx) {
  const text = (chip.props.text || '').trim();
  if (!text) return '';
  let s = ctx.normalize(text);
  if (chip.props.quoted) s = '"' + s + '"';
  if (chip.props.negate) s = '-' + s;
  return s;
}

/**
 * Render a keyword chip as a DOM element. The chip area calls this for
 * every keyword chip whenever the store changes.
 *
 * @param {{ id: string, type: string, props: { text: string, negate: boolean, quoted: boolean } }} chip
 * @param {{ onDelete: () => void, onToggleNegate: () => void, onToggleQuoted: () => void }} handlers
 * @returns {HTMLElement}
 */
export function render(chip, handlers) {
  const el = document.createElement('span');
  el.className = 'chip chip-keyword';
  if (chip.props.negate) el.classList.add('chip-negate');
  if (chip.props.quoted) el.classList.add('chip-quoted');
  el.dataset.chipId = chip.id;

  // Content rendering: NOT prefix · quoted text · type indicator.
  const contentDir = detectDir(chip.props.text);
  const inner = document.createElement('span');
  inner.className = 'chip-text';
  inner.dir = contentDir;
  const display = chip.props.quoted
    ? '"' + (chip.props.text || '') + '"'
    : (chip.props.text || '');
  inner.textContent = (chip.props.negate ? '− ' : '') + display;

  // Delete button (×). Min touch 36px in Beginner mode via CSS.
  const del = document.createElement('button');
  del.type = 'button';
  del.className = 'chip-delete-btn';
  del.setAttribute('aria-label', 'حذف الكلمة');
  del.textContent = '×';
  del.addEventListener('click', (e) => {
    e.stopPropagation();
    handlers.onDelete();
  });

  // Quick-toggle area: tap chip body to cycle quoted state; long-press / Shift-click to toggle NOT.
  // For Phase 4 simplicity, just expose a tiny inline tools row.
  const tools = document.createElement('span');
  tools.className = 'chip-tools';

  const negBtn = document.createElement('button');
  negBtn.type = 'button';
  negBtn.className = 'chip-tool-btn';
  negBtn.setAttribute('aria-label', chip.props.negate ? 'إلغاء النفي' : 'جعلها نفياً (-)');
  negBtn.setAttribute('aria-pressed', chip.props.negate ? 'true' : 'false');
  negBtn.textContent = chip.props.negate ? '−' : '−';
  negBtn.title = chip.props.negate ? 'إلغاء النفي' : 'نفي (-)';
  negBtn.addEventListener('click', (e) => { e.stopPropagation(); handlers.onToggleNegate(); });

  const quoteBtn = document.createElement('button');
  quoteBtn.type = 'button';
  quoteBtn.className = 'chip-tool-btn';
  quoteBtn.setAttribute('aria-label', chip.props.quoted ? 'إلغاء الاقتباس' : 'اقتباس حرفي');
  quoteBtn.setAttribute('aria-pressed', chip.props.quoted ? 'true' : 'false');
  quoteBtn.textContent = '"';
  quoteBtn.title = chip.props.quoted ? 'إلغاء الاقتباس' : 'اقتباس حرفي';
  quoteBtn.addEventListener('click', (e) => { e.stopPropagation(); handlers.onToggleQuoted(); });

  tools.appendChild(quoteBtn);
  tools.appendChild(negBtn);

  el.appendChild(del);
  el.appendChild(inner);
  el.appendChild(tools);
  return el;
}

/**
 * Detect whether a string is predominantly Arabic (RTL) or Latin (LTR).
 * Simple heuristic — count Arabic-block characters.
 */
function detectDir(text) {
  if (!text) return 'auto';
  const arabicChars = (text.match(/[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/g) || []).length;
  const latinChars = (text.match(/[A-Za-z]/g) || []).length;
  if (arabicChars > latinChars) return 'rtl';
  if (latinChars > arabicChars) return 'ltr';
  return 'auto';
}
