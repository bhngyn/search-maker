// Chip area — renders the committed chips. Subscribes to chip-state and
// re-renders on every change. Each chip type renders itself; this module
// just wires delete/toggle handlers, stitches chips into the DOM in order,
// and (in Advanced mode) wires HTML5 drag-and-drop for reordering plus
// Shift-click multi-select.
//
// RTL note: the chip area uses `dir="rtl"` from the document. Newest chips
// appear on the LEADING edge in RTL flow (i.e. visually on the left when
// reading right-to-left).

import { chipTypes } from '../chips/_registry.js';

/**
 * Selection observable shared with the bulk-actions toolbar. A simple
 * Set-of-ids store with subscribe + notify.
 */
export function createChipSelection() {
  const ids = new Set();
  const subscribers = [];
  function notify() { subscribers.forEach(cb => { try { cb(new Set(ids)); } catch (e) { console.warn(e); } }); }
  return {
    get() { return ids; },
    has(id) { return ids.has(id); },
    add(id) { if (!ids.has(id)) { ids.add(id); notify(); } },
    remove(id) { if (ids.has(id)) { ids.delete(id); notify(); } },
    toggle(id) { if (ids.has(id)) ids.delete(id); else ids.add(id); notify(); },
    clear() { if (ids.size > 0) { ids.clear(); notify(); } },
    subscribe(cb) { subscribers.push(cb); return () => { const i = subscribers.indexOf(cb); if (i >= 0) subscribers.splice(i, 1); }; },
  };
}

/**
 * @param {object} args
 * @param {HTMLElement} args.host
 * @param {{ subscribe: Function, getAll: Function, remove: Function, update: Function, clear: Function, reorder?: Function }} args.chipState
 * @param {{ get: () => 'beginner' | 'advanced', on?: (cb: (mode: string) => void) => void }} [args.mode]
 * @param {ReturnType<typeof createChipSelection>} [args.selection]
 */
export function wireChipArea({ host, chipState, mode, selection }) {
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
      if (selection && selection.has(chip.id)) el.classList.add('chip-selected');
      if (selection && isAdvanced()) wireSelectionClick(el, chip.id);
      if (isAdvanced() && chipState.reorder) {
        wireDrag(el, chip.id);
      }
      host.appendChild(el);
    });
  }

  function wireSelectionClick(el, chipId) {
    el.addEventListener('click', (e) => {
      // Don't intercept clicks on inner editable / interactive widgets.
      if (e.target && e.target.closest && e.target.closest('button, select, input, textarea, [contenteditable]')) return;
      if (e.shiftKey) {
        e.preventDefault();
        selection.toggle(chipId);
      } else if (selection.get().size > 0) {
        // Plain click with an active selection clears it.
        selection.clear();
      }
    });
  }

  function wireDrag(el, chipId) {
    el.draggable = true;
    el.classList.add('chip-draggable');
    el.addEventListener('dragstart', (e) => {
      const target = e.target;
      if (target && target.matches && target.matches('[contenteditable], input, select, textarea, button')) {
        e.preventDefault();
        return;
      }
      draggedChipId = chipId;
      el.classList.add('chip-dragging');
      e.dataTransfer.effectAllowed = 'move';
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

  function computeInsertIndex(clientX, clientY) {
    const visible = Array.from(host.querySelectorAll('.chip:not(.chip-dragging)'));
    if (visible.length === 0) return { index: 0, placement: null, anchor: null };

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
    // RTL: "before in array order" = "to the right visually" (higher x).
    const before = clientX > cx;
    return {
      index: before ? closestIdx : closestIdx + 1,
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

  // Esc clears selection.
  if (selection) {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && selection.get().size > 0) selection.clear();
    });
  }

  chipState.subscribe(() => render());
  if (selection) selection.subscribe(() => render());
  if (mode && mode.on) mode.on(() => render());
  render();
}
