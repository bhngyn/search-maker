import { renderWarningGlyph } from '../ui/chip-popover.js';

// Date-range chip — wraps Google's `before:` and `after:` operators in a
// single chip with two date inputs. Either or both may be empty; only the
// non-empty operators are emitted.

export const type = 'date-range';
export const label = 'نطاق زمني';

export function defaultProps() {
  return { after: '', before: '' };
}

export function assemble(chip) {
  const after = (chip.props.after || '').trim();
  const before = (chip.props.before || '').trim();
  const parts = [];
  if (after) parts.push('after:' + after);
  if (before) parts.push('before:' + before);
  return parts.join(' ');
}

/**
 * @param {{ props: { after: string, before: string } }} chip
 */
export function validate(chip) {
  const issues = [];
  const after = chip.props.after;
  const before = chip.props.before;
  if (after && before && after > before) {
    issues.push({
      severity: 'warning',
      message: 'النطاق الزمني مقلوب — تاريخ "بعد" أحدث من "قبل"، لن تكون هناك نتائج.',
      fix: { label: 'بدّل التاريخين', apply: () => ({ after: before, before: after }) },
    });
  }
  return issues;
}

export function render(chip, handlers) {
  const el = document.createElement('span');
  el.className = 'chip chip-date-range chip-wide';
  el.dataset.chipId = chip.id;

  const del = document.createElement('button');
  del.type = 'button';
  del.className = 'chip-delete-btn';
  del.setAttribute('aria-label', 'حذف النطاق الزمني');
  del.textContent = '×';
  del.addEventListener('click', (e) => { e.stopPropagation(); handlers.onDelete(); });

  const opBadge = document.createElement('span');
  opBadge.className = 'chip-op-badge';
  opBadge.dir = 'ltr';
  opBadge.textContent = '📅';

  // Inputs: after / before. Native date pickers so users get the OS picker.
  const inputs = document.createElement('span');
  inputs.className = 'chip-wide-inputs';
  inputs.dir = 'ltr';

  const afterLabel = document.createElement('span');
  afterLabel.className = 'chip-wide-input-label';
  afterLabel.textContent = 'بعد:';
  const afterInput = document.createElement('input');
  afterInput.type = 'date';
  afterInput.className = 'chip-wide-input chip-wide-input-date';
  afterInput.setAttribute('aria-label', 'بعد تاريخ');
  afterInput.value = chip.props.after || '';
  afterInput.addEventListener('input', () => {
    if (handlers.onChangeProps) handlers.onChangeProps({ after: afterInput.value });
  });
  afterInput.addEventListener('click', (e) => e.stopPropagation());

  const beforeLabel = document.createElement('span');
  beforeLabel.className = 'chip-wide-input-label';
  beforeLabel.textContent = 'قبل:';
  const beforeInput = document.createElement('input');
  beforeInput.type = 'date';
  beforeInput.className = 'chip-wide-input chip-wide-input-date';
  beforeInput.setAttribute('aria-label', 'قبل تاريخ');
  beforeInput.value = chip.props.before || '';
  beforeInput.addEventListener('input', () => {
    if (handlers.onChangeProps) handlers.onChangeProps({ before: beforeInput.value });
  });
  beforeInput.addEventListener('click', (e) => e.stopPropagation());

  inputs.appendChild(afterLabel);
  inputs.appendChild(afterInput);
  inputs.appendChild(beforeLabel);
  inputs.appendChild(beforeInput);

  const glyph = renderWarningGlyph(chip, validate(chip), handlers);

  el.appendChild(del);
  el.appendChild(opBadge);
  if (glyph) el.appendChild(glyph);
  el.appendChild(inputs);
  return el;
}
