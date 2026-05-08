// Chip area — renders the committed chips. Subscribes to chip-state and
// re-renders on every change. Each chip type renders itself; this module
// just wires delete/toggle handlers and stitches chips into the DOM in order.
//
// RTL note: the chip area uses `dir="rtl"` from the document. Newest chips
// appear on the LEADING edge in RTL flow (i.e. visually on the left when
// reading right-to-left). Test with the screenshot before declaring victory.

import { chipTypes } from '../chips/_registry.js';

/**
 * @param {object} args
 * @param {HTMLElement} args.host
 * @param {{ subscribe: Function, getAll: Function, remove: Function, update: Function, clear: Function }} args.chipState
 */
export function wireChipArea({ host, chipState }) {
  host.classList.add('chip-area');
  host.setAttribute('aria-live', 'polite');
  host.setAttribute('aria-relevant', 'additions removals');

  function render() {
    const chips = chipState.getAll();
    if (chips.length === 0) {
      host.innerHTML = '<p class="chip-area-empty">لم تُضف أي كلمات بعد. اكتب كلمة في الأسفل واضغط Enter.</p>';
      return;
    }
    host.innerHTML = '';
    chips.forEach(chip => {
      const mod = chipTypes[chip.type];
      if (!mod || typeof mod.render !== 'function') return;
      const el = mod.render(chip, {
        onDelete: () => chipState.remove(chip.id),
        onToggleNegate: () => chipState.update(chip.id, { negate: !chip.props.negate }),
        onToggleQuoted: () => chipState.update(chip.id, { quoted: !chip.props.quoted }),
        onChangeOperator: (op) => chipState.update(chip.id, { operator: op }),
        onChangeText: (text) => chipState.update(chip.id, { text }),
        onChangeProps: (patch) => chipState.update(chip.id, patch),
      });
      host.appendChild(el);
    });
  }

  chipState.subscribe(() => render());
  render();
}
