// Chip state — the single source of truth for the chip-based query model.
//
// The store is an ordered array of chips. Each chip is
//   { id: string, type: string, props: object }
// where `type` matches a key in chips/_registry.js and `props` is whatever
// that chip type cares about (e.g. { text, negate, quoted } for keyword).
//
// Mutations go through this module's API. Subscribers (the chip-area UI)
// receive the new chip list on every change. The store also registers a
// single segment with ctx.registerSegment(100, ...) that produces the
// chip-assembled query string. The form's existing segments at orders 1–15
// run BEFORE the chip output, so during Phase 4 (when both UIs coexist)
// the visualizer shows form output first, then chip output.
//
// Boolean grammar:
//   adjacent term chips ⇒ implicit AND
//   chip type 'or-connector' between two term chips ⇒ OR group
//   the assembler walks runs of [term, OR, term, OR, term] into "(a OR b OR c)"

import { chipTypes } from '../chips/_registry.js';

let nextId = 1;
function makeId() {
  return 'chip-' + (nextId++) + '-' + Math.random().toString(36).slice(2, 8);
}

/**
 * @param {object} args
 * @param {import('./ctx.js').Ctx} args.ctx
 * @param {number} [args.segmentOrder]
 */
export function createChipState({ ctx, segmentOrder = 100 }) {
  /** @type {Array<{ id: string, type: string, props: object }>} */
  const chips = [];
  /** @type {Array<(chips: Array, change: { kind: string, chip?: any, id?: string }) => void>} */
  const subscribers = [];

  function notify(change) {
    const snapshot = chips.map(c => ({ ...c, props: { ...c.props } }));
    subscribers.forEach(cb => {
      try { cb(snapshot, change); } catch (e) { console.warn('chip subscriber failed', e); }
    });
  }

  function defaultPropsFor(type) {
    const mod = chipTypes[type];
    if (!mod || typeof mod.defaultProps !== 'function') return {};
    return mod.defaultProps();
  }

  /**
   * Append a chip at the end of the list. `props` is merged on top of the
   * type's defaultProps(). Returns the new chip's id.
   */
  function add(type, props = {}, options = {}) {
    if (!chipTypes[type]) {
      console.warn('unknown chip type', type);
      return null;
    }
    const chip = {
      id: makeId(),
      type,
      props: { ...defaultPropsFor(type), ...props },
    };
    if (typeof options.insertAt === 'number') {
      chips.splice(options.insertAt, 0, chip);
    } else {
      chips.push(chip);
    }
    notify({ kind: 'add', chip });
    ctx.requestUpdate();
    return chip.id;
  }

  function remove(id) {
    const idx = chips.findIndex(c => c.id === id);
    if (idx < 0) return false;
    const [removed] = chips.splice(idx, 1);
    // If removing a term chip leaves two adjacent or-connectors (or trailing),
    // clean those up so the boolean grammar stays valid.
    cleanupConnectors();
    notify({ kind: 'remove', chip: removed });
    ctx.requestUpdate();
    return true;
  }

  function update(id, propsPatch) {
    const c = chips.find(c => c.id === id);
    if (!c) return false;
    c.props = { ...c.props, ...propsPatch };
    notify({ kind: 'update', chip: c });
    ctx.requestUpdate();
    return true;
  }

  function clear() {
    chips.length = 0;
    notify({ kind: 'clear' });
    ctx.requestUpdate();
  }

  /**
   * Move a chip to a new index. `targetIndex` is the position in the
   * post-removal array — i.e. clamped to [0, chips.length - 1] after the
   * dragged chip has been spliced out. Drag-and-drop in chip-area passes
   * an index computed from the visible chip elements (which exclude the
   * one being dragged), so the indices align directly.
   */
  function reorder(id, targetIndex) {
    const oldIdx = chips.findIndex(c => c.id === id);
    if (oldIdx < 0) return false;
    const [chip] = chips.splice(oldIdx, 1);
    if (targetIndex < 0) targetIndex = 0;
    if (targetIndex > chips.length) targetIndex = chips.length;
    chips.splice(targetIndex, 0, chip);
    cleanupConnectors();
    notify({ kind: 'reorder', chip });
    ctx.requestUpdate();
    return true;
  }

  function getAll() {
    return chips.map(c => ({ ...c, props: { ...c.props } }));
  }

  function isTerm(chip) {
    return chip && chip.type !== 'or-connector';
  }

  /**
   * Drop OR connectors that no longer sit between two term chips.
   * Called after every removal so the chip array stays well-formed.
   */
  function cleanupConnectors() {
    for (let i = chips.length - 1; i >= 0; i--) {
      if (chips[i].type !== 'or-connector') continue;
      const prev = chips[i - 1];
      const next = chips[i + 1];
      if (!isTerm(prev) || !isTerm(next)) {
        chips.splice(i, 1);
      }
    }
  }

  function subscribe(cb) {
    subscribers.push(cb);
    return () => {
      const idx = subscribers.indexOf(cb);
      if (idx >= 0) subscribers.splice(idx, 1);
    };
  }

  // ===== Query assembly =====
  ctx.registerSegment(segmentOrder, () => assembleChips(chips, ctx));

  return {
    add, remove, update, reorder, clear, getAll, subscribe,
    /** Last chip in the list, or null. */
    last() { return chips.length ? chips[chips.length - 1] : null; },
  };
}

/**
 * Walk the chip array and produce the assembled query.
 * Uses each chip type's `assemble(chip, ctx)` function. Handles OR runs
 * as `(a OR b OR c)`. Ignores leading/trailing/duplicate or-connectors.
 *
 * @param {Array<{ id: string, type: string, props: object }>} chips
 * @param {import('./ctx.js').Ctx} ctx
 */
function assembleChips(chips, ctx) {
  const parts = [];
  let i = 0;
  while (i < chips.length) {
    const chip = chips[i];
    if (chip.type === 'or-connector') {
      i++;
      continue;
    }
    // Build an OR run starting at this chip.
    const run = [chip];
    while (
      i + 2 < chips.length &&
      chips[i + 1].type === 'or-connector' &&
      chips[i + 2].type !== 'or-connector'
    ) {
      run.push(chips[i + 2]);
      i += 2;
    }
    const rendered = run.map(c => chipAssemble(c, ctx)).filter(s => s && s.trim());
    if (rendered.length >= 2) {
      parts.push('(' + rendered.join(' OR ') + ')');
    } else if (rendered.length === 1) {
      parts.push(rendered[0]);
    }
    i++;
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

function chipAssemble(chip, ctx) {
  const mod = chipTypes[chip.type];
  if (!mod || typeof mod.assemble !== 'function') return '';
  try {
    return mod.assemble(chip, ctx) || '';
  } catch (e) {
    console.warn('chip assemble failed', chip, e);
    return '';
  }
}
