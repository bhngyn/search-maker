// Engagement chip — Twitter's `min_faves:`, `min_replies:`, `min_retweets:`
// family. Direction toggle picks between minimum (e.g. `min_faves:100`)
// and maximum (e.g. `-min_faves:100`, which Twitter parses as a strict
// upper bound — see twitter_operators.md lines 67-69).

export const type = 'engagement';
export const label = 'حد التفاعل';

export const METRICS = [
  { value: 'min_faves',    label: 'إعجابات' },
  { value: 'min_replies',  label: 'ردود' },
  { value: 'min_retweets', label: 'إعادات تغريد' },
];

export function defaultProps() {
  return { metric: 'min_faves', direction: 'min', value: 100 };
}

export function assemble(chip) {
  const n = parseInt(chip.props.value, 10);
  if (isNaN(n) || n < 0) return '';
  const op = chip.props.metric || 'min_faves';
  const prefix = chip.props.direction === 'max' ? '-' : '';
  return prefix + op + ':' + n;
}

export function render(chip, handlers) {
  const el = document.createElement('span');
  el.className = 'chip chip-engagement chip-wide';
  el.dataset.chipId = chip.id;

  const del = document.createElement('button');
  del.type = 'button';
  del.className = 'chip-delete-btn';
  del.setAttribute('aria-label', 'حذف حد التفاعل');
  del.textContent = '×';
  del.addEventListener('click', (e) => { e.stopPropagation(); handlers.onDelete(); });

  const opBadge = document.createElement('span');
  opBadge.className = 'chip-op-badge';
  opBadge.dir = 'ltr';
  opBadge.textContent = 'min:';

  const inputs = document.createElement('span');
  inputs.className = 'chip-wide-inputs';

  // Metric select.
  const metricSelect = document.createElement('select');
  metricSelect.className = 'chip-wide-select';
  metricSelect.setAttribute('aria-label', 'اختر مقياس التفاعل');
  METRICS.forEach(({ value, label }) => {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = label;
    if (value === chip.props.metric) opt.selected = true;
    metricSelect.appendChild(opt);
  });
  metricSelect.addEventListener('change', (e) => {
    if (handlers.onChangeProps) handlers.onChangeProps({ metric: e.target.value });
  });
  metricSelect.addEventListener('click', (e) => e.stopPropagation());

  // Direction toggle — single button that flips between min/max.
  const isMax = chip.props.direction === 'max';
  const dirBtn = document.createElement('button');
  dirBtn.type = 'button';
  dirBtn.className = 'chip-tool-btn chip-engagement-dir';
  if (isMax) dirBtn.classList.add('is-max');
  dirBtn.setAttribute('aria-pressed', isMax ? 'true' : 'false');
  dirBtn.setAttribute('aria-label', isMax ? 'حد أقصى' : 'حد أدنى');
  dirBtn.textContent = isMax ? 'حد أقصى ≤' : 'حد أدنى ≥';
  dirBtn.title = isMax ? 'حد أقصى' : 'حد أدنى';
  dirBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (handlers.onChangeProps) {
      handlers.onChangeProps({ direction: isMax ? 'min' : 'max' });
    }
  });

  // Numeric input.
  const numInput = document.createElement('input');
  numInput.type = 'number';
  numInput.min = '0';
  numInput.className = 'chip-wide-input';
  numInput.dir = 'ltr';
  numInput.setAttribute('aria-label', 'القيمة العددية');
  numInput.value = chip.props.value != null ? String(chip.props.value) : '';
  numInput.addEventListener('input', () => {
    if (handlers.onChangeProps) handlers.onChangeProps({ value: numInput.value });
  });
  numInput.addEventListener('click', (e) => e.stopPropagation());

  inputs.appendChild(metricSelect);
  inputs.appendChild(dirBtn);
  inputs.appendChild(numInput);

  el.appendChild(del);
  el.appendChild(opBadge);
  el.appendChild(inputs);
  return el;
}
