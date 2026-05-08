// Chip composer — the input + commit button that turns typed text into
// keyword chips.
//
// Commit paths:
//   Enter / "أضف"          ⇒ append a keyword chip (implicit AND)
//   Shift+Enter            ⇒ append an OR-connector then a keyword chip,
//                            forming/extending an OR group (still in the
//                            keydown handler — the standalone OR button was
//                            removed in favor of per-chip OR affordances)
//   Leading "-" + space    ⇒ append a keyword chip with negate=true. The
//                            standalone NOT button was removed; this shortcut
//                            and the per-chip "−" tool remain the entry points.
//   Paste                  ⇒ if the pasted text looks like a Google query
//                            (has operators, quotes, OR, etc.), parse it
//                            into chips. Plain-text pastes fall through.

import { parseQuery } from '../core/parse-query.js';
import { OPERATORS } from '../chips/keyword.js';

// Beginner-mode "convert to" pills shown under the ghost preview while the
// user is typing. Picking one re-renders the ghost so the user sees the
// operator prefix before commit; Enter then commits with that operator
// pre-set on the new keyword chip. Selection is local to the composer —
// it never touches chip-state until commit, and it resets to 'none' after
// each commit so the next keyword starts as a plain term.
const OPERATOR_PILLS = [
  { op: 'none',     label: 'كلمة عادية' },
  { op: 'site',     label: 'في الموقع' },
  { op: 'intitle',  label: 'في عنوان الصفحة' },
  { op: 'inurl',    label: 'في رابط الصفحة' },
  { op: 'intext',   label: 'في نص الصفحة' },
  { op: 'inanchor', label: 'في الروابط الواردة' },
];
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
      <div class="composer-ghost-line">
        <span class="composer-ghost-label">سيُضاف:</span>
        <span class="composer-ghost-chip" id="composer-ghost-chip"></span>
      </div>
      <div class="composer-op-pills" id="composer-op-pills" role="group" aria-label="نوع الإضافة"></div>
    </div>
    <div class="composer-commit-row" role="group" aria-label="إضافة الكلمة">
      <button type="button" class="composer-btn composer-btn-and" id="composer-btn-and" disabled>
        أضف
      </button>
      <button type="button" class="composer-btn composer-btn-add" id="composer-btn-add" aria-label="إضافة عامل خاص">
        + إضافة
      </button>
    </div>
    <p class="composer-hint" id="composer-ghost-hint">اكتب كلمة واضغط Enter. ستظهر كـ«كلمة بحث» — اضغطها بعد ذلك لتعديلها.</p>
  `;

  const input = host.querySelector('#composer-input');
  const btnAnd = host.querySelector('#composer-btn-and');
  const ghostRow = host.querySelector('#composer-ghost-row');
  const ghostChip = host.querySelector('#composer-ghost-chip');
  const pillsRow = host.querySelector('#composer-op-pills');

  // Pre-commit operator selection. Lives only here — chip-state never sees
  // it until commit() builds the keyword chip's props.
  let chosenOp = 'none';

  function buildPills() {
    pillsRow.innerHTML = '';
    OPERATOR_PILLS.forEach(({ op, label }) => {
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = 'composer-op-pill';
      pill.dataset.op = op;
      pill.setAttribute('aria-pressed', op === chosenOp ? 'true' : 'false');
      const opName = OPERATORS[op].opName;
      const badgeText = opName ? opName + ':' : '—';
      pill.innerHTML = `
        <span class="composer-op-pill-label">${label}</span>
        <span class="composer-op-pill-badge" dir="ltr">${badgeText}</span>
      `;
      pill.addEventListener('click', (e) => {
        e.preventDefault();
        chosenOp = op;
        syncPillsPressed();
        ghostPreview();
        input.focus();
      });
      pillsRow.appendChild(pill);
    });
  }

  function syncPillsPressed() {
    pillsRow.querySelectorAll('.composer-op-pill').forEach(p => {
      p.setAttribute('aria-pressed', p.dataset.op === chosenOp ? 'true' : 'false');
    });
  }

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

    chipState.add('keyword', { text: raw, operator: chosenOp, negate, quoted: false });

    input.value = '';
    chosenOp = 'none';
    syncPillsPressed();
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
    // Render a faded preview chip mirroring keyword chip shape, including
    // the operator prefix when one is chosen so the user sees exactly what
    // will commit.
    const op = OPERATORS[chosenOp] || OPERATORS.none;
    ghostChip.className = 'composer-ghost-chip' + (negate ? ' composer-ghost-chip-negate' : '');
    ghostChip.innerHTML = '';
    if (negate) {
      const neg = document.createElement('span');
      neg.className = 'composer-ghost-neg';
      neg.textContent = '− ';
      ghostChip.appendChild(neg);
    }
    if (op.opName) {
      const badge = document.createElement('span');
      badge.className = 'composer-ghost-op-badge';
      badge.dir = 'ltr';
      badge.textContent = op.opName + ':';
      ghostChip.appendChild(badge);
      ghostChip.appendChild(document.createTextNode(' '));
    }
    const term = document.createElement('span');
    term.dir = op.dir;
    term.textContent = raw;
    ghostChip.appendChild(term);
    ghostRow.classList.add('visible');
  }

  function refresh() {
    const has = input.value.trim().length > 0;
    btnAnd.disabled = !has;
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

  buildPills();

  // React to chip state changes (e.g. so the input refocuses smoothly when
  // chips are deleted via Backspace and the user is mid-typing).
  refresh();

  return {
    focus() { input.focus(); },
    clear() { input.value = ''; refresh(); },
    drawerTrigger: host.querySelector('#composer-btn-add'),
  };
}
