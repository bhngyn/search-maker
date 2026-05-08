// Keyword chip — the primary chip type. Carries free-text content plus an
// optional content operator (site, intitle, intext, inanchor, inurl). With
// `operator: 'none'` (default) the chip is a plain keyword.
//
// Per-chip toggles:
//   - negate (NOT prefix)
//   - quoted (exact-phrase wrapping)
//   - operator (cycles via inline dropdown)
//
// Phase 5: this single chip type covers all six text-based operators.
// Phase 5: wildcard (*) is just typed inside a regular keyword chip — no
// dedicated chip type needed because Google parses `*` literally inside
// text, including inside quoted phrases.

export const type = 'keyword';
export const label = 'كلمة';

/**
 * Operator catalogue for keyword chips. Each entry defines:
 *   - label: Arabic display name shown in the dropdown
 *   - opName: the literal Google operator (e.g. "site"); '' for plain keyword
 *   - dir: input directionality for editing ('rtl' for Arabic, 'ltr' for Latin)
 *   - normalizes: whether to apply Arabic normalization
 *   - quotable: whether the exact-phrase toggle does anything
 *   - acceptsArabic: false ⇒ surface a warning if Arabic chars appear
 */
export const OPERATORS = {
  none: {
    label: 'كلمة',
    opName: '',
    dir: 'rtl',
    normalizes: true,
    quotable: true,
    acceptsArabic: true,
  },
  site: {
    label: 'موقع (site:)',
    opName: 'site',
    dir: 'ltr',
    normalizes: false,
    quotable: false,
    acceptsArabic: false,
  },
  intitle: {
    label: 'في العنوان (intitle:)',
    opName: 'intitle',
    dir: 'rtl',
    normalizes: true,
    quotable: true,
    acceptsArabic: true,
  },
  intext: {
    label: 'في النص (intext:)',
    opName: 'intext',
    dir: 'rtl',
    normalizes: true,
    quotable: true,
    acceptsArabic: true,
  },
  inanchor: {
    label: 'في نص الروابط (inanchor:)',
    opName: 'inanchor',
    dir: 'rtl',
    normalizes: true,
    quotable: true,
    acceptsArabic: true,
  },
  inurl: {
    label: 'في الرابط (inurl:)',
    opName: 'inurl',
    dir: 'ltr',
    normalizes: false,
    quotable: false,
    acceptsArabic: false,
  },
};

export const OPERATOR_KEYS = Object.keys(OPERATORS);

export function defaultProps() {
  return { text: '', operator: 'none', negate: false, quoted: false };
}

/**
 * @param {{ id: string, type: string, props: { text: string, operator: string, negate: boolean, quoted: boolean } }} chip
 * @param {import('../core/ctx.js').Ctx} ctx
 */
export function assemble(chip, ctx) {
  const text = (chip.props.text || '').trim();
  if (!text) return '';
  const opKey = OPERATORS[chip.props.operator] ? chip.props.operator : 'none';
  const op = OPERATORS[opKey];
  const value = op.normalizes ? ctx.normalize(text) : text;
  const wrapped = (chip.props.quoted && op.quotable) ? '"' + value + '"' : value;
  let s = op.opName ? (op.opName + ':' + wrapped) : wrapped;
  if (chip.props.negate) s = '-' + s;
  return s;
}

/**
 * @param {{ id: string, type: string, props: object }} chip
 * @param {{ onDelete: () => void, onToggleNegate: () => void, onToggleQuoted: () => void, onChangeOperator?: (op: string) => void, onChangeText?: (text: string) => void }} handlers
 */
export function render(chip, handlers) {
  const op = OPERATORS[chip.props.operator] || OPERATORS.none;

  const el = document.createElement('span');
  el.className = 'chip chip-keyword';
  if (chip.props.negate) el.classList.add('chip-negate');
  if (chip.props.quoted && op.quotable) el.classList.add('chip-quoted');
  if (op.opName) el.classList.add('chip-has-op');
  el.dataset.chipId = chip.id;

  // Delete button (×).
  const del = document.createElement('button');
  del.type = 'button';
  del.className = 'chip-delete-btn';
  del.setAttribute('aria-label', 'حذف الكلمة');
  del.textContent = '×';
  del.addEventListener('click', (e) => {
    e.stopPropagation();
    handlers.onDelete();
  });

  // Operator badge (LTR mono prefix). Only rendered when an operator is set.
  let opBadge = null;
  if (op.opName) {
    opBadge = document.createElement('span');
    opBadge.className = 'chip-op-badge';
    opBadge.dir = 'ltr';
    opBadge.textContent = op.opName + ':';
  }

  // Editable text. Click chip body to edit inline. We use a contenteditable
  // span to keep RTL/LTR isolation per chip.
  const textEl = document.createElement('span');
  textEl.className = 'chip-text';
  textEl.dir = op.dir;
  textEl.setAttribute('contenteditable', 'plaintext-only');
  textEl.spellcheck = false;
  textEl.textContent = chip.props.quoted && op.quotable
    ? '"' + (chip.props.text || '') + '"'
    : (chip.props.text || '');
  // Strip surrounding quotes when committing — they're a visual hint, not part
  // of `text` storage.
  function commitText() {
    let v = textEl.textContent || '';
    if (chip.props.quoted && op.quotable) {
      v = v.replace(/^"+/, '').replace(/"+$/, '');
    }
    if (handlers.onChangeText) handlers.onChangeText(v);
  }
  textEl.addEventListener('blur', commitText);
  textEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      textEl.blur();
    }
  });

  // Negate prefix glyph. Visual-only; the prop drives query output.
  let negPrefix = null;
  if (chip.props.negate) {
    negPrefix = document.createElement('span');
    negPrefix.className = 'chip-neg-prefix';
    negPrefix.setAttribute('aria-hidden', 'true');
    negPrefix.textContent = '−';
  }

  // Tools row: operator dropdown, quote toggle, NOT toggle.
  const tools = document.createElement('span');
  tools.className = 'chip-tools';

  // Operator dropdown.
  if (handlers.onChangeOperator) {
    const select = document.createElement('select');
    select.className = 'chip-op-select';
    select.setAttribute('aria-label', 'اختر العامل');
    OPERATOR_KEYS.forEach(key => {
      const o = OPERATORS[key];
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = o.label;
      if (key === chip.props.operator) opt.selected = true;
      select.appendChild(opt);
    });
    select.addEventListener('change', (e) => {
      handlers.onChangeOperator(e.target.value);
    });
    select.addEventListener('click', (e) => e.stopPropagation());
    tools.appendChild(select);
  }

  // Quote toggle (only when the operator allows quoting).
  if (op.quotable) {
    const quoteBtn = document.createElement('button');
    quoteBtn.type = 'button';
    quoteBtn.className = 'chip-tool-btn';
    quoteBtn.setAttribute('aria-pressed', chip.props.quoted ? 'true' : 'false');
    quoteBtn.setAttribute('aria-label', chip.props.quoted ? 'إلغاء الاقتباس' : 'اقتباس حرفي');
    quoteBtn.textContent = '"';
    quoteBtn.title = chip.props.quoted ? 'إلغاء الاقتباس' : 'اقتباس حرفي';
    quoteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handlers.onToggleQuoted();
    });
    tools.appendChild(quoteBtn);
  }

  // NOT toggle.
  const negBtn = document.createElement('button');
  negBtn.type = 'button';
  negBtn.className = 'chip-tool-btn';
  negBtn.setAttribute('aria-pressed', chip.props.negate ? 'true' : 'false');
  negBtn.setAttribute('aria-label', chip.props.negate ? 'إلغاء النفي' : 'نفي (-)');
  negBtn.textContent = '−';
  negBtn.title = chip.props.negate ? 'إلغاء النفي' : 'نفي (-)';
  negBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    handlers.onToggleNegate();
  });
  tools.appendChild(negBtn);

  el.appendChild(del);
  if (opBadge) el.appendChild(opBadge);
  if (negPrefix) el.appendChild(negPrefix);
  el.appendChild(textEl);
  el.appendChild(tools);
  return el;
}
