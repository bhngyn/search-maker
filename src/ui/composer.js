// Chip composer — the input + commit buttons that turn typed text into
// keyword chips.
//
// Commit paths:
//   Enter / "أضف (و)"     ⇒ append a keyword chip (implicit AND)
//   Shift+Enter / "أو"     ⇒ append an OR-connector then a keyword chip,
//                            forming/extending an OR group
//   "ليس (−)"              ⇒ append a keyword chip with negate=true
//   Leading "-" + space    ⇒ same as ليس; convenience shortcut
//   Paste                  ⇒ if the pasted text looks like a Google query
//                            (has operators, quotes, OR, etc.), parse it
//                            into chips. Plain-text pastes fall through.

import { parseQuery } from '../core/parse-query.js';
//
// Flow-state ergonomics (Phase 6):
//   - Ghost-chip preview that mirrors what would commit on Enter, sitting
//     below the input. Crucial for low-literacy users — makes the chip
//     metaphor concrete the first time they type.
//   - Backspace on an empty input removes the most recent chip (with no
//     undo, intentionally — fast typists expect this and the chip itself
//     remains in DOM until they Backspace again).
//   - Space alone never auto-commits (Arabic phrases contain spaces).
//   - Empty Enter is a no-op. Buttons disable when the input is empty.

/**
 * @param {object} args
 * @param {HTMLElement} args.host
 * @param {{ add: Function, last: Function, remove: Function, getAll: Function }} args.chipState
 */
export function wireComposer({ host, chipState }) {
  host.classList.add('composer');
  host.innerHTML = `
    <div class="composer-input-row">
      <input
        type="text"
        class="composer-input"
        id="composer-input"
        placeholder="اكتب كلمة، ثم اضغط Enter لإضافتها"
        autocomplete="off"
        spellcheck="false"
        aria-label="إضافة كلمة بحث جديدة"
        aria-describedby="composer-ghost-hint"
      />
    </div>
    <div class="composer-ghost-row" id="composer-ghost-row" aria-hidden="true">
      <span class="composer-ghost-label">سيُضاف:</span>
      <span class="composer-ghost-chip" id="composer-ghost-chip"></span>
    </div>
    <div class="composer-commit-row" role="group" aria-label="إضافة الكلمة بعامل">
      <button type="button" class="composer-btn composer-btn-and" id="composer-btn-and" disabled>
        أضف <span class="composer-btn-hint">(و)</span>
      </button>
      <button type="button" class="composer-btn composer-btn-or" id="composer-btn-or" disabled>
        أو
      </button>
      <button type="button" class="composer-btn composer-btn-not" id="composer-btn-not" disabled>
        ليس <span class="composer-btn-hint">(−)</span>
      </button>
      <button type="button" class="composer-btn composer-btn-add" id="composer-btn-add" aria-label="إضافة عامل خاص">
        + إضافة
      </button>
    </div>
    <p class="composer-hint" id="composer-ghost-hint">اضغط Enter لإضافة كلمة. Shift+Enter يضيفها كبديل (أو) للكلمة السابقة. Backspace في حقل فارغ يحذف آخر قطعة.</p>
  `;

  const input = host.querySelector('#composer-input');
  const btnAnd = host.querySelector('#composer-btn-and');
  const btnOr = host.querySelector('#composer-btn-or');
  const btnNot = host.querySelector('#composer-btn-not');
  const ghostRow = host.querySelector('#composer-ghost-row');
  const ghostChip = host.querySelector('#composer-ghost-chip');

  function commit(mode) {
    let raw = input.value.trim();
    if (!raw) return;

    let negate = false;
    if (raw.startsWith('-') && raw.length > 1) {
      negate = true;
      raw = raw.slice(1).trim();
    }
    if (mode === 'not') negate = true;

    if (mode === 'or') {
      const prev = chipState.last();
      if (prev && prev.type !== 'or-connector') {
        chipState.add('or-connector', {});
      }
    }

    chipState.add('keyword', { text: raw, negate, quoted: false });

    input.value = '';
    refresh();
    input.focus();
  }

  function ghostPreview() {
    let raw = input.value.trim();
    if (!raw) {
      ghostRow.classList.remove('visible');
      ghostChip.textContent = '';
      return;
    }
    let negate = false;
    if (raw.startsWith('-') && raw.length > 1) {
      negate = true;
      raw = raw.slice(1).trim();
    }
    // Render a faded preview chip mirroring keyword chip shape.
    ghostChip.className = 'composer-ghost-chip' + (negate ? ' composer-ghost-chip-negate' : '');
    ghostChip.textContent = (negate ? '− ' : '') + raw;
    ghostRow.classList.add('visible');
  }

  function refresh() {
    const has = input.value.trim().length > 0;
    btnAnd.disabled = !has;
    btnOr.disabled = !has;
    btnNot.disabled = !has;
    ghostPreview();
  }

  input.addEventListener('input', refresh);
  input.addEventListener('paste', (e) => {
    // Try to parse the pasted text as a Google-style query. If it parses
    // into one or more chip descriptors, insert them and clear the input.
    // If parseQuery returns null (the paste looks like plain text), let the
    // browser's default paste behavior fill the input as usual.
    const cd = e.clipboardData || window.clipboardData;
    if (!cd) return;
    const pasted = cd.getData('text');
    if (!pasted) return;
    const descriptors = parseQuery(pasted);
    if (descriptors == null) return; // plain text → default paste
    e.preventDefault();
    if (descriptors.length === 0) return; // empty / whitespace → no-op
    for (const d of descriptors) {
      chipState.add(d.type, d.props);
    }
    input.value = '';
    refresh();
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commit(e.shiftKey ? 'or' : 'and');
      return;
    }
    if (e.key === 'Backspace' && input.value === '') {
      // Remove the last chip. No undo — the user can re-type. Skip if there
      // are no chips so this doesn't feel weirdly silent.
      const chips = chipState.getAll();
      if (chips.length > 0) {
        e.preventDefault();
        chipState.remove(chips[chips.length - 1].id);
      }
    }
  });

  btnAnd.addEventListener('click', () => commit('and'));
  btnOr.addEventListener('click', () => commit('or'));
  btnNot.addEventListener('click', () => commit('not'));

  // React to chip state changes (e.g. so the input refocuses smoothly when
  // chips are deleted via Backspace and the user is mid-typing).
  refresh();

  return {
    focus() { input.focus(); },
    clear() { input.value = ''; refresh(); },
    drawerTrigger: host.querySelector('#composer-btn-add'),
  };
}
