// Chip area — renders the committed chips. Subscribes to chip-state and
// re-renders on every change. Each chip type renders itself; this module
// just wires delete/toggle handlers, stitches chips into the DOM in order,
// and (in Advanced mode) wires HTML5 drag-and-drop for reordering.
//
// RTL note: the chip area uses `dir="rtl"` from the document. Newest chips
// appear on the LEADING edge in RTL flow (i.e. visually on the left when
// reading right-to-left).

import { chipTypes } from '../chips/_registry.js';

/**
 * @param {object} args
 * @param {HTMLElement} args.host
 * @param {{ subscribe: Function, getAll: Function, remove: Function, update: Function, clear: Function, reorder?: Function }} args.chipState
 * @param {{ get: () => 'beginner' | 'advanced', on?: (cb: (mode: string) => void) => void }} [args.mode]
 */
export function wireChipArea({ host, chipState, mode }) {
  host.classList.add('chip-area');
  host.setAttribute('aria-live', 'polite');
  host.setAttribute('aria-relevant', 'additions removals');

  function isAdvanced() {
    return mode && mode.get && mode.get() === 'advanced';
  }

  let draggedChipId = null;

  function render() {
    const chips = chipState.getAll();
    if (chips.length === 0) {
      host.innerHTML = '<p class="chip-area-empty">لم تُضف أي كلمات بعد. اكتب كلمة في الأسفل واضغط Enter.</p>';
      host.classList.remove('chip-area-draggable');
      return;
    }
    host.classList.toggle('chip-area-draggable', isAdvanced());
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
      if (isAdvanced() && chipState.reorder) {
        wireDrag(el, chip.id);
      }
      host.appendChild(el);
    });
  }

  function wireDrag(el, chipId) {
    el.draggable = true;
    el.classList.add('chip-draggable');
    el.addEventListener('dragstart', (e) => {
      // Don't start a drag if the user is editing the chip's text
      // (contenteditable elements set draggable internally).
      const target = e.target;
      if (target && target.matches && target.matches('[contenteditable], input, select, textarea, button')) {
        // Browsers will still fire dragstart on chip-level handlers when
        // the inner target is contenteditable; suppress it.
        e.preventDefault();
        return;
      }
      draggedChipId = chipId;
      el.classList.add('chip-dragging');
      e.dataTransfer.effectAllowed = 'move';
      // Some browsers require setData to actually start the drag.
      try { e.dataTransfer.setData('text/plain', chipId); } catch (_) {}
    });
    el.addEventListener('dragend', () => {
      el.classList.remove('chip-dragging');
      clearDropIndicator();
      draggedChipId = null;
    });
  }

  function clearDropIndicator() {
    host.querySelectorAll('.chip-drop-target-before, .chip-drop-target-after').forEach(c => {
      c.classList.remove('chip-drop-target-before', 'chip-drop-target-after');
    });
  }

  /**
   * Compute the target index in the post-removal chip array given a cursor
   * position. Walks the visible chip elements (excluding the dragged one)
   * and decides "insert at i" by comparing the cursor to each chip's
   * horizontal midpoint, accounting for RTL where chip[0] has the highest
   * client x.
   *
   * Returns also the closest element + a `placement` ('before' | 'after')
   * so the caller can paint a drop indicator.
   */
  function computeInsertIndex(clientX, clientY) {
    const visible = Array.from(host.querySelectorAll('.chip:not(.chip-dragging)'));
    if (visible.length === 0) return { index: 0, placement: null, anchor: null };

    // Find the closest chip in 2D. Manhattan-ish distance to chip center.
    let closest = null;
    let closestDist = Infinity;
    let closestIdx = -1;
    visible.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const d = Math.hypot(clientX - cx, clientY - cy);
      if (d < closestDist) {
        closestDist = d;
        closest = el;
        closestIdx = i;
      }
    });

    if (!closest) return { index: visible.length, placement: null, anchor: null };

    const r = closest.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    // In RTL, "before in array order" = "to the right visually" (higher x).
    // If cursor.x > chip.midpoint, insert BEFORE the chip; otherwise insert AFTER.
    const before = clientX > cx;
    const index = before ? closestIdx : closestIdx + 1;
    return {
      index,
      placement: before ? 'before' : 'after',
      anchor: closest,
    };
  }

  function paintDropIndicator(anchor, placement) {
    clearDropIndicator();
    if (!anchor) return;
    if (placement === 'before') anchor.classList.add('chip-drop-target-before');
    else if (placement === 'after') anchor.classList.add('chip-drop-target-after');
  }

  host.addEventListener('dragover', (e) => {
    if (!draggedChipId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const { anchor, placement } = computeInsertIndex(e.clientX, e.clientY);
    paintDropIndicator(anchor, placement);
  });

  host.addEventListener('dragleave', (e) => {
    // Only clear if leaving the host entirely (not transitioning between
    // children). Use relatedTarget heuristic.
    if (e.relatedTarget && host.contains(e.relatedTarget)) return;
    clearDropIndicator();
  });

  host.addEventListener('drop', (e) => {
    if (!draggedChipId) return;
    e.preventDefault();
    const { index } = computeInsertIndex(e.clientX, e.clientY);
    chipState.reorder(draggedChipId, index);
    clearDropIndicator();
    draggedChipId = null;
  });

  chipState.subscribe(() => render());
  if (mode && mode.on) mode.on(() => render());
  render();
}
