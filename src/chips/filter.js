import { renderWarningGlyph } from '../ui/chip-popover.js';

// Filter chip — wraps Twitter's `filter:<flag>` family in a single
// dropdown chip with a built-in negate toggle.
//
// Most filter values support negation via `-filter:<flag>`. Two exceptions:
//   - `filter:follows` is non-negatable per CLAUDE-X.md (cannot be flipped
//     in the UI; the negate toggle is hidden when this value is selected).
//   - `nativeretweets` flips between `filter:nativeretweets` (only
//     retweets) and `include:nativeretweets` (retweets in addition to
//     other tweets) per twitter_operators.md lines 52-53. The negate
//     toggle on this value emits the include: form rather than -filter:.

export const type = 'filter';
export const label = 'تصفية';

export const FILTERS = [
  { value: '',               label: 'بدون تحديد',                    negatable: false },
  { value: 'media',          label: 'وسائط (صور أو فيديو)',          negatable: true },
  { value: 'images',         label: 'صور فقط',                        negatable: true },
  { value: 'videos',         label: 'فيديو فقط',                      negatable: true },
  { value: 'native_video',   label: 'فيديو تويتر الأصلي',             negatable: true },
  { value: 'spaces',         label: 'تويتر سبيسز',                    negatable: true },
  { value: 'links',          label: 'يحتوي رابط',                     negatable: true },
  { value: 'mentions',       label: 'يذكر حساباً',                    negatable: true },
  { value: 'hashtags',       label: 'يحتوي هاشتاج',                   negatable: true },
  { value: 'replies',        label: 'ردود على تغريدات',               negatable: true },
  { value: 'quote',          label: 'اقتباسات',                       negatable: true },
  { value: 'nativeretweets', label: 'إعادات تغريد أصلية',             negatable: true, includeForm: true },
  { value: 'retweets',       label: 'إعادات تغريد قديمة (RT)',        negatable: true },
  { value: 'verified',       label: 'حسابات موثّقة (قديمة)',          negatable: true },
  { value: 'blue_verified',  label: 'حسابات Twitter Blue',            negatable: true },
  { value: 'follows',        label: 'حسابات أتابعها',                 negatable: false },
  { value: 'has_engagement', label: 'لديها تفاعل',                    negatable: true },
];

function findFilter(value) {
  return FILTERS.find(f => f.value === value);
}

export function defaultProps() {
  return { value: 'media', negate: false };
}

export function assemble(chip) {
  const v = (chip.props.value || '').trim();
  if (!v) return '';
  const f = findFilter(v);
  if (!f) return '';
  // Non-negatable filter forced negative — defensive: emit positive form.
  if (chip.props.negate && !f.negatable) return 'filter:' + v;
  // nativeretweets uses include: rather than -filter: when negated.
  if (chip.props.negate && f.includeForm) return 'include:' + v;
  if (chip.props.negate) return '-filter:' + v;
  return 'filter:' + v;
}

/**
 * @param {{ props: { value: string, negate: boolean } }} chip
 */
export function validate(chip) {
  const issues = [];
  const f = findFilter(chip.props.value);
  if (chip.props.negate && f && !f.negatable) {
    issues.push({
      severity: 'warning',
      message: 'هذا النوع من التصفية لا يمكن نفيه. أزل النفي أو اختر نوعاً آخر.',
      fix: { label: 'إلغاء النفي', apply: () => ({ negate: false }) },
    });
  }
  return issues;
}

export function render(chip, handlers) {
  const el = document.createElement('span');
  el.className = 'chip chip-filter chip-wide';
  if (chip.props.negate) el.classList.add('chip-negate');
  el.dataset.chipId = chip.id;

  const del = document.createElement('button');
  del.type = 'button';
  del.className = 'chip-delete-btn';
  del.setAttribute('aria-label', 'حذف التصفية');
  del.textContent = '×';
  del.addEventListener('click', (e) => { e.stopPropagation(); handlers.onDelete(); });

  const opBadge = document.createElement('span');
  opBadge.className = 'chip-op-badge';
  opBadge.dir = 'ltr';
  opBadge.textContent = 'filter:';

  const select = document.createElement('select');
  select.className = 'chip-wide-select';
  select.setAttribute('aria-label', 'اختر نوع التصفية');
  FILTERS.forEach(({ value, label }) => {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = label;
    if (value === chip.props.value) opt.selected = true;
    select.appendChild(opt);
  });
  select.addEventListener('change', (e) => {
    if (handlers.onChangeProps) handlers.onChangeProps({ value: e.target.value });
  });
  select.addEventListener('click', (e) => e.stopPropagation());

  // NOT toggle — hidden when the selected filter cannot be negated.
  const f = findFilter(chip.props.value);
  let negBtn = null;
  if (f && f.negatable) {
    negBtn = document.createElement('button');
    negBtn.type = 'button';
    negBtn.className = 'chip-tool-btn';
    negBtn.setAttribute('aria-pressed', chip.props.negate ? 'true' : 'false');
    negBtn.setAttribute('aria-label', chip.props.negate ? 'إلغاء النفي' : 'نفي (-)');
    negBtn.title = chip.props.negate ? 'إلغاء النفي' : 'نفي (-)';
    negBtn.textContent = '−';
    negBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (handlers.onChangeProps) handlers.onChangeProps({ negate: !chip.props.negate });
    });
  }

  const glyph = renderWarningGlyph(chip, validate(chip), handlers);

  el.appendChild(del);
  el.appendChild(opBadge);
  if (glyph) el.appendChild(glyph);
  el.appendChild(select);
  if (negBtn) el.appendChild(negBtn);
  return el;
}
