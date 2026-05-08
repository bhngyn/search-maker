// Chip composer — the input + commit buttons that turn typed text into
// keyword chips. Phase 4 supports three commit paths:
//
//   Enter / "أضف (و)"           ⇒ append a keyword chip (implicit AND)
//   Shift+Enter / "أو"           ⇒ if previous chip is a term, append an
//                                   OR-connector then the new keyword chip
//   "ليس (−)"                    ⇒ append a keyword chip with negate=true
//   Leading "-" + space          ⇒ same as ليس; convenience shortcut
//
// Space alone does NOT auto-commit because Arabic phrases contain spaces.
// Empty Enter is a no-op. Buttons disable when the input is empty.

/**
 * @param {object} args
 * @param {HTMLElement} args.host - container element to mount the composer into
 * @param {{ add: Function, last: Function }} args.chipState
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
      />
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
    </div>
    <p class="composer-hint">اضغط Enter لإضافة كلمة. Shift+Enter يضيفها كبديل (أو) للكلمة السابقة.</p>
  `;

  const input = host.querySelector('#composer-input');
  const btnAnd = host.querySelector('#composer-btn-and');
  const btnOr = host.querySelector('#composer-btn-or');
  const btnNot = host.querySelector('#composer-btn-not');

  function commit(mode) {
    let raw = input.value.trim();
    if (!raw) return;

    let negate = false;
    // Leading "-" shortcut.
    if (raw.startsWith('-') && raw.length > 1) {
      negate = true;
      raw = raw.slice(1).trim();
    }
    if (mode === 'not') negate = true;

    // For the OR commit path: insert an OR-connector before the new chip,
    // but only if the previous chip is a term chip. Otherwise just append.
    if (mode === 'or') {
      const prev = chipState.last();
      if (prev && prev.type !== 'or-connector') {
        chipState.add('or-connector', {});
      }
    }

    chipState.add('keyword', { text: raw, negate, quoted: false });

    input.value = '';
    refreshButtons();
    input.focus();
  }

  function refreshButtons() {
    const has = input.value.trim().length > 0;
    btnAnd.disabled = !has;
    btnOr.disabled = !has;
    btnNot.disabled = !has;
  }

  input.addEventListener('input', refreshButtons);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commit(e.shiftKey ? 'or' : 'and');
    }
  });

  btnAnd.addEventListener('click', () => commit('and'));
  btnOr.addEventListener('click', () => commit('or'));
  btnNot.addEventListener('click', () => commit('not'));

  refreshButtons();

  return {
    focus() { input.focus(); },
    clear() { input.value = ''; refreshButtons(); },
  };
}
