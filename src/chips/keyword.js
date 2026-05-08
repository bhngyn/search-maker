import { renderWarningGlyph } from '../ui/chip-popover.js';

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
 * Per-chip validation issues — surfaced as a glyph + popover on the chip.
 *
 * @param {{ props: { text: string, operator: string, negate: boolean, quoted: boolean } }} chip
 * @returns {Array<{ severity: 'warning' | 'tip', message: string, fix?: { label: string, apply: () => object } }>}
 */
export function validate(chip) {
  const issues = [];
  const text = (chip.props.text || '').trim();
  const opKey = OPERATORS[chip.props.operator] ? chip.props.operator : 'none';
  const op = OPERATORS[opKey];

  // Multi-word value in intitle/intext/inanchor without quoting silently
  // binds only the first word to the operator.
  if (['intitle', 'intext', 'inanchor'].includes(opKey) && text && /\s/.test(text) && !chip.props.quoted) {
    issues.push({
      severity: 'warning',
      message: 'كلمات متعددة بدون اقتباس — Google سيربط الكلمة الأولى فقط بالعامل. فعّل الاقتباس.',
      fix: { label: 'فعّل الاقتباس', apply: () => ({ quoted: true }) },
    });
  }

  // Latin-only operator with Arabic chars.
  if (['site', 'inurl'].includes(opKey) && /[؀-ۿ]/.test(text)) {
    issues.push({
      severity: 'warning',
      message: 'هذا الحقل يتوقع نصاً لاتينياً (نطاق أو جزء من URL). لن يطابق Google النص العربي هنا.',
    });
  }

  // Quoting a single word disables Google's spell correction and synonyms.
  if (chip.props.quoted && op.quotable && text && !/\s/.test(text)) {
    issues.push({
      severity: 'tip',
      message: 'اقتباس كلمة واحدة يُعطّل تصحيح التهجئة والمرادفات في Google. غالباً غير ضروري.',
      fix: { label: 'إلغاء الاقتباس', apply: () => ({ quoted: false }) },
    });
  }

  return issues;
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
 * @param {{ onDelete: () => void, onToggleNegate: () => void, onToggleQuoted: () => void, onChangeOperator?: (op: string) => void, onChangeText?: (text: string) => void, onAddOrBranch?: () => void }} handlers
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

  // "+أو" branch handle — leading-edge button that extends this chip into
  // an OR group (or appends a new alternative to an existing group). The
  // chip-area handler walks the chip array forward to find the end of the
  // contiguous OR run before splicing in the connector + new keyword.
  let orHandle = null;
  if (handlers.onAddOrBranch) {
    orHandle = document.createElement('button');
    orHandle.type = 'button';
    orHandle.className = 'chip-or-handle';
    orHandle.setAttribute('aria-label', 'إضافة بديل بـ "أو"');
    orHandle.title = 'إضافة بديل بـ "أو"';
    orHandle.textContent = '+ أو';
    orHandle.addEventListener('click', (e) => {
      e.stopPropagation();
      handlers.onAddOrBranch();
    });
  }

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

  // Per-chip warning/tip glyph (opens a popover with the issues + fix buttons).
  const glyph = renderWarningGlyph(chip, validate(chip), handlers);

  if (orHandle) el.appendChild(orHandle);
  el.appendChild(del);
  if (opBadge) el.appendChild(opBadge);
  if (glyph) el.appendChild(glyph);
  if (negPrefix) el.appendChild(negPrefix);
  el.appendChild(textEl);
  el.appendChild(tools);
  return el;
}
