// Beginner-mode templates. Each pre-fills chips and focuses the composer.
// Clicking a template doesn't auto-submit a search — it just scaffolds the
// chip state so the user can continue typing.
//
// The template list is engine-driven: see `templates` on each engine
// descriptor in src/engines/<id>.js. chip-area's empty-state picker calls
// `getTemplates()` so the surface always matches the active engine.

import { getActiveEngine } from '../core/engine.js';

/**
 * @typedef {object} Template
 * @property {string} id              stable identifier
 * @property {string} title           Arabic heading line
 * @property {string} description     Arabic one-line description (muted)
 * @property {string} icon            single emoji shown next to the title
 * @property {(chipState: object) => void} apply  mutates chip-state to seed chips
 */

/** Active-engine template list. */
export function getTemplates() {
  const eng = getActiveEngine();
  return eng.templates || [];
}

/**
 * Apply a template by id and (optionally) move focus to the composer.
 * Returns true if the template was found and applied.
 *
 * @param {string} id
 * @param {{ chipState: object, focusComposer?: () => void }} deps
 */
export function applyTemplate(id, { chipState, focusComposer }) {
  const tpl = getTemplates().find(t => t.id === id);
  if (!tpl) return false;
  tpl.apply(chipState);
  if (focusComposer) setTimeout(focusComposer, 100);
  return true;
}

/**
 * Backwards-compatible wiring for any fixed-DOM mount points (template-site,
 * template-docs, template-daterange). In the current build the standalone
 * row was removed in favour of the empty-state render, so this is a no-op
 * unless an older shell is loaded.
 *
 * @param {object} args
 * @param {object} args.chipState
 * @param {() => void} [args.focusComposer]
 */
export function wireTemplates({ chipState, focusComposer }) {
  getTemplates().forEach(tpl => {
    const btn = document.getElementById('template-' + tpl.id);
    if (!btn) return;
    btn.addEventListener('click', () => applyTemplate(tpl.id, { chipState, focusComposer }));
  });
}
