// OR connector — a non-term chip that sits between two term chips and
// turns them (and any further chained OR connectors) into an OR group.
//
// The connector itself produces no query output; chip-state's assembler
// detects it and joins the adjacent term chips with " OR " inside parens.

export const type = 'or-connector';

export const label = 'أو';

export function defaultProps() {
  return {};
}

/**
 * Connectors never emit query text by themselves — chip-state walks runs
 * of [term, OR, term, OR, term] and outputs "(a OR b OR c)" itself.
 */
export function assemble() {
  return '';
}

/**
 * @param {{ id: string, type: string, props: object }} chip
 * @param {{ onDelete: () => void }} handlers
 */
export function render(chip, handlers) {
  const el = document.createElement('span');
  el.className = 'chip chip-or-connector';
  el.dataset.chipId = chip.id;
  el.setAttribute('role', 'group');
  el.setAttribute('aria-label', 'موصل: أو');

  const text = document.createElement('span');
  text.className = 'chip-or-text';
  text.textContent = 'أو';
  el.appendChild(text);

  const del = document.createElement('button');
  del.type = 'button';
  del.className = 'chip-delete-btn chip-delete-btn-small';
  del.setAttribute('aria-label', 'حذف موصل OR');
  del.textContent = '×';
  del.addEventListener('click', (e) => {
    e.stopPropagation();
    handlers.onDelete();
  });
  el.appendChild(del);

  return el;
}
