// Beginner-mode templates. Each pre-fills chips and focuses the composer.
// Clicking a template doesn't auto-submit a search — it just scaffolds the
// chip state so the user can continue typing.
//
// As of A5 (chip-UX redesign): the standalone templates row is gone. The
// only render path is the chip-area's empty state, which imports TEMPLATES
// directly. The legacy wireTemplates() entry point still exists so older
// fixed-DOM mounts (none in production today) wouldn't silently break.

/**
 * @typedef {object} Template
 * @property {string} id              stable identifier
 * @property {string} title           Arabic heading line
 * @property {string} description     Arabic one-line description (muted)
 * @property {string} icon            single emoji shown next to the title
 * @property {(chipState: object) => void} apply  mutates chip-state to seed chips
 */

/** @type {Template[]} */
export const TEMPLATES = [
  {
    id: 'site',
    title: 'بحث في موقع محدد',
    description: 'حصر النتائج بنطاق معين مثل bbc.com',
    icon: '🌐',
    apply(chipState) {
      chipState.add('keyword', { operator: 'site', text: '' });
    },
  },
  {
    id: 'docs',
    title: 'بحث في الوثائق',
    description: 'العثور على ملفات PDF أو Word',
    icon: '📄',
    apply(chipState) {
      chipState.add('filetype', { value: 'pdf' });
    },
  },
  {
    id: 'daterange',
    title: 'بحث في نطاق زمني',
    description: 'حصر النتائج بين تاريخين',
    icon: '📅',
    apply(chipState) {
      const today = new Date();
      const lastYear = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
      const fmt = (d) => d.toISOString().slice(0, 10);
      chipState.add('date-range', { after: fmt(lastYear), before: fmt(today) });
    },
  },
];

/**
 * Apply a template by id and (optionally) move focus to the composer.
 * Returns true if the template was found and applied.
 *
 * @param {string} id
 * @param {{ chipState: object, focusComposer?: () => void }} deps
 */
export function applyTemplate(id, { chipState, focusComposer }) {
  const tpl = TEMPLATES.find(t => t.id === id);
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
  TEMPLATES.forEach(tpl => {
    const btn = document.getElementById('template-' + tpl.id);
    if (!btn) return;
    btn.addEventListener('click', () => applyTemplate(tpl.id, { chipState, focusComposer }));
  });
}
