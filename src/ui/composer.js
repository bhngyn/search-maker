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

// Flow-state ergonomics (Phase 6):
//   - Ghost-chip preview that mirrors what would commit on Enter, sitting
//     below the input. Crucial for low-literacy users — makes the chip
//     metaphor concrete the first time they type.
//   - Backspace on an empty input removes the most recent chip (with no
//     undo, intentionally — fast typists expect this and the chip itself
//     remains in DOM until they Backspace again).
//   - Space alone never auto-commits (Arabic phrases contain spaces).
//   - Empty Enter is a no-op. Buttons disable when the input is empty.

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

/**
 * @param {object} args
 * @param {HTMLElement} args.host
 * @param {{ add: Function, last: Function, remove: Function, removeMany: Function, getAll: Function }} args.chipState
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
      <div class="composer-quote-row" id="composer-quote-row">
        <button
          type="button"
          class="composer-quote-toggle"
          id="composer-quote-toggle"
          aria-pressed="false"
          aria-label="اقتباس حرفي"
          title='اقتباس حرفي — يطابق العبارة كما هي. اختصار: اكتب "العبارة" بين علامتي اقتباس.'
        >
          <span class="composer-quote-toggle-glyph" dir="ltr">"&nbsp;"</span>
          <span class="composer-quote-toggle-label">اقتباس حرفي</span>
        </button>
        <p class="composer-quote-hint">يطابق العبارة بالضبط. اختصار: اكتب "كلمة" أو "عبارة" بين علامتَي اقتباس.</p>
      </div>
      <p class="composer-ghost-paste-hint" id="composer-ghost-paste-hint" aria-live="polite">سيُضاف ككلمة واحدة. اضغط Enter لتأكيد، أو الصق نصاً مع علامات اقتباس للحصول على شظايا منفصلة.</p>
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
  const quoteToggle = host.querySelector('#composer-quote-toggle');

  // Pre-commit operator selection. Lives only here — chip-state never sees
  // it until commit() builds the keyword chip's props.
  let chosenOp = 'none';
  // Pre-commit literal-quote selection. Orthogonal to chosenOp. Resets
  // after each commit so quoting stays explicit per chip.
  let chosenQuoted = false;

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
    syncQuoteToggleEnabled();
  }

  // The quote toggle is meaningful only when the chosen operator is
  // quotable (site:, inurl: are not). When the user picks a non-quotable
  // operator we disable the toggle; the on-state survives the disable
  // (so flipping back to a quotable op restores the previous intent).
  function syncQuoteToggleEnabled() {
    if (!quoteToggle) return;
    const op = OPERATORS[chosenOp] || OPERATORS.none;
    quoteToggle.disabled = !op.quotable;
  }
  function syncQuoteTogglePressed() {
    if (!quoteToggle) return;
    quoteToggle.setAttribute('aria-pressed', chosenQuoted ? 'true' : 'false');
  }

  /**
   * Detect the leading-and-trailing `"` shortcut. Mirrors the leading-`-`
   * shortcut for negate. Returns { stripped, quoted } where `stripped` is
   * the inner text (or the original input if no shortcut was detected).
   */
  function applyQuoteShortcut(raw) {
    if (raw.length >= 2 && raw.startsWith('"') && raw.endsWith('"')) {
      return { stripped: raw.slice(1, -1).trim(), quoted: true };
    }
    return { stripped: raw, quoted: false };
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

    // Leading-and-trailing `"` shortcut → strip and treat as quoted. Only
    // emits a quoted chip when the chosen operator allows quoting; for
    // non-quotable ops (site:, inurl:) the quotes are still stripped so
    // the chip text isn't littered with them, but `quoted` stays false.
    const { stripped, quoted: shortcutQuoted } = applyQuoteShortcut(raw);
    raw = stripped;
    if (!raw) return;

    if (mode === 'or') {
      const prev = chipState.last();
      if (prev && prev.type !== 'or-connector') {
        chipState.add('or-connector', {});
      }
    }

    const op = OPERATORS[chosenOp] || OPERATORS.none;
    const quoted = (chosenQuoted || shortcutQuoted) && op.quotable;

    chipState.add('keyword', { text: raw, operator: chosenOp, negate, quoted });

    input.value = '';
    chosenOp = 'none';
    chosenQuoted = false;
    syncPillsPressed();
    syncQuoteTogglePressed();
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
    // Apply the leading-and-trailing `"` shortcut to the preview so the
    // ghost chip already reads as quoted before the user presses Enter.
    const { stripped, quoted: shortcutQuoted } = applyQuoteShortcut(raw);
    raw = stripped;
    if (!raw) {
      ghostRow.classList.remove('visible');
      ghostChip.textContent = '';
      return;
    }
    // Render a faded preview chip mirroring keyword chip shape, including
    // the operator prefix when one is chosen so the user sees exactly what
    // will commit.
    const op = OPERATORS[chosenOp] || OPERATORS.none;
    const willQuote = (chosenQuoted || shortcutQuoted) && op.quotable;
    ghostChip.className = 'composer-ghost-chip'
      + (negate ? ' composer-ghost-chip-negate' : '')
      + (willQuote ? ' composer-ghost-chip-quoted' : '');
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
    term.textContent = willQuote ? '"' + raw + '"' : raw;
    ghostChip.appendChild(term);
    ghostRow.classList.add('visible');
  }

  function refresh() {
    const has = input.value.trim().length > 0;
    btnAnd.disabled = !has;
    ghostPreview();
  }

  // Shared toast element (the same #toast used by the copy-confirmation in
  // core/preview.js). We construct DOM directly because the toast carries
  // an interactive button — preview.showToast only handles plain text.
  const toastEl = document.getElementById('toast');
  let toastTimer = null;

  function clearToast() {
    if (toastTimer) { clearTimeout(toastTimer); toastTimer = null; }
    if (!toastEl) return;
    toastEl.classList.remove('visible');
    toastEl.classList.remove('toast-with-action');
    toastEl.innerHTML = '';
  }

  function showPasteUndoToast(addedIds) {
    if (!toastEl) return;
    clearToast();
    toastEl.classList.add('toast-with-action');
    const msg = document.createElement('span');
    msg.textContent = 'أُضيفت ' + addedIds.length + ' كلمة من اللصق — ';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'toast-undo-btn';
    btn.textContent = 'تراجع';
    btn.addEventListener('click', () => {
      chipState.removeMany(addedIds);
      clearToast();
    });
    toastEl.appendChild(msg);
    toastEl.appendChild(btn);
    toastEl.classList.add('visible');
    toastTimer = setTimeout(clearToast, 1500);
  }

  // Plain-paste hint sits inside the ghost-row so the existing
  // mode-advanced display:none rule already keeps it Beginner-only. Auto-
  // fades after 4 seconds via class transitions.
  let pasteHintTimer = null;
  let pasteHintFadeTimer = null;
  function showPasteHint() {
    clearTimeout(pasteHintTimer);
    clearTimeout(pasteHintFadeTimer);
    ghostRow.classList.add('composer-ghost-row-paste-hint');
    ghostRow.classList.remove('composer-ghost-row-paste-hint-fading');
    // The ghost-row collapses to height:0 when input is empty; nudge it
    // visible so the hint is actually shown until the input is filled by
    // the default paste handler.
    ghostRow.classList.add('visible');
    pasteHintTimer = setTimeout(() => {
      ghostRow.classList.add('composer-ghost-row-paste-hint-fading');
      pasteHintFadeTimer = setTimeout(() => {
        ghostRow.classList.remove('composer-ghost-row-paste-hint');
        ghostRow.classList.remove('composer-ghost-row-paste-hint-fading');
      }, 350);
    }, 4000);
  }

  input.addEventListener('input', refresh);
  input.addEventListener('paste', (e) => {
    // Try to parse the pasted text as a Google-style query. If it parses
    // into one or more chip descriptors, insert them and clear the input.
    // If parseQuery returns null (the paste looks like plain text), fall
    // through to the browser's default paste, but show a one-shot hint so
    // the user knows their paste became a single chip on purpose.
    const cd = e.clipboardData || window.clipboardData;
    if (!cd) return;
    const pasted = cd.getData('text');
    if (!pasted) return;
    const descriptors = parseQuery(pasted);
    if (descriptors == null) {
      showPasteHint();
      return;
    }
    e.preventDefault();
    if (descriptors.length === 0) return; // empty / whitespace → no-op
    const addedIds = [];
    for (const d of descriptors) {
      const id = chipState.add(d.type, d.props);
      if (id) addedIds.push(id);
    }
    input.value = '';
    refresh();
    if (addedIds.length > 0) showPasteUndoToast(addedIds);
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

  if (quoteToggle) {
    quoteToggle.addEventListener('click', (e) => {
      e.preventDefault();
      if (quoteToggle.disabled) return;
      chosenQuoted = !chosenQuoted;
      syncQuoteTogglePressed();
      ghostPreview();
      input.focus();
    });
  }

  buildPills();
  syncQuoteToggleEnabled();

  // React to chip state changes (e.g. so the input refocuses smoothly when
  // chips are deleted via Backspace and the user is mid-typing).
  refresh();

  return {
    focus() { input.focus(); },
    clear() { input.value = ''; refresh(); },
    drawerTrigger: host.querySelector('#composer-btn-add'),
  };
}
