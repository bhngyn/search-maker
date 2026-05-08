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
    // Build a per-index map of OR-group containers. We walk chips and group
    // any contiguous run of [keyword, or-connector, keyword, ...] into a
    // single .chip-or-group span. Non-grouped chips render directly into
    // host. The grouping is render-only — chip-state stays flat.
    const groupRanges = computeOrGroupRanges(chips);
    let cursor = 0;
    while (cursor < chips.length) {
      const groupEnd = groupRanges.get(cursor);
      if (typeof groupEnd === 'number') {
        // [cursor .. groupEnd] is one OR group (inclusive on both ends).
        const groupEl = document.createElement('span');
        groupEl.className = 'chip-or-group';
        groupEl.setAttribute('role', 'group');
        groupEl.setAttribute('aria-label', 'مجموعة "أو"');
        for (let i = cursor; i <= groupEnd; i++) {
          appendChipEl(groupEl, chips[i]);
        }
        host.appendChild(groupEl);
        cursor = groupEnd + 1;
      } else {
        appendChipEl(host, chips[cursor]);
        cursor++;
      }
    }
  }

  /**
   * Returns a Map of startIndex → endIndex (inclusive) describing every
   * contiguous OR run of [term, OR, term, OR, term, ...]. A run requires
   * at least one connector, so a single keyword chip is never "in a group."
   */
  function computeOrGroupRanges(chips) {
    const ranges = new Map();
    let i = 0;
    while (i < chips.length) {
      const c = chips[i];
      if (!c || c.type === 'or-connector') { i++; continue; }
      // Walk forward across [term, OR, term, ...] pairs.
      let end = i;
      while (
        end + 2 < chips.length &&
        chips[end + 1] && chips[end + 1].type === 'or-connector' &&
        chips[end + 2] && chips[end + 2].type !== 'or-connector'
      ) {
        end += 2;
      }
      if (end > i) ranges.set(i, end);
      i = end + 1;
    }
    return ranges;
  }

  function appendChipEl(parent, chip) {
    const mod = chipTypes[chip.type];
    if (!mod || typeof mod.render !== 'function') return;
    const el = mod.render(chip, {
      onDelete: () => chipState.remove(chip.id),
      onToggleNegate: () => chipState.update(chip.id, { negate: !chip.props.negate }),
      onToggleQuoted: () => chipState.update(chip.id, { quoted: !chip.props.quoted }),
      onChangeOperator: (op) => chipState.update(chip.id, { operator: op }),
      onChangeText: (text) => chipState.update(chip.id, { text }),
      onChangeProps: (patch) => chipState.update(chip.id, patch),
      onAddOrBranch: () => addOrBranch(chip.id),
    });
    if (selection && selection.has(chip.id)) el.classList.add('chip-selected');
    if (selection && isAdvanced()) wireSelectionClick(el, chip.id);
    if (isAdvanced() && chipState.reorder) {
      wireDrag(el, chip.id);
    }
    parent.appendChild(el);
  }

  /**
   * Splice an or-connector + fresh empty keyword chip after the LAST
   * member of the OR run that contains `chipId`. If `chipId` isn't already
   * in a run, this just appends after the chip itself, which still creates
   * a valid run because the new keyword chip is also a term.
   */
  function addOrBranch(chipId) {
    if (!chipState.addAfter) return;
    const all = chipState.getAll();
    let idx = all.findIndex(c => c.id === chipId);
    if (idx < 0) return;
    // Walk forward through any [OR, term] pairs to find the end of the run.
    while (
      idx + 2 < all.length &&
      all[idx + 1] && all[idx + 1].type === 'or-connector' &&
      all[idx + 2] && all[idx + 2].type !== 'or-connector'
    ) {
      idx += 2;
    }
    const anchorId = all[idx].id;
    const connectorId = chipState.addAfter(anchorId, 'or-connector', {});
    if (!connectorId) return;
    const newChipId = chipState.addAfter(connectorId, 'keyword', { text: '', operator: 'none' });
    if (!newChipId) return;
    // After re-render, focus the new chip's editable text.
    requestAnimationFrame(() => {
      const newEl = host.querySelector('[data-chip-id="' + newChipId + '"] .chip-text');
      if (newEl && typeof newEl.focus === 'function') newEl.focus();
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
