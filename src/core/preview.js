// Live query preview, copy-to-clipboard, Google search redirect, and the
// two-tap inline reset confirmation.
//
// `postRenderHooks` is the hook list passed by reference; consumers may push
// callbacks onto it that run after every render() pass. Used by cross-field
// warnings that depend on the rendered query string.

/**
 * @param {object} args
 * @param {HTMLElement} args.previewBox
 * @param {HTMLButtonElement} args.copyBtn
 * @param {HTMLButtonElement} args.searchBtn
 * @param {HTMLButtonElement} args.resetBtn
 * @param {HTMLElement} args.toastEl
 * @param {() => string} args.assembleQuery
 * @param {Map<string, { setValue: (v: any) => void }>} args.fieldRegistry
 * @param {{ clearAll: () => void }} args.warnings
 * @param {{ clearAll: () => void }} args.tips
 * @param {string} [args.emptyMessage]
 * @param {Array<() => void>} [args.postRenderHooks]
 */
export function createPreview({
  previewBox, copyBtn, searchBtn, resetBtn, toastEl,
  assembleQuery, fieldRegistry, warnings, tips,
  emptyMessage = 'ابدأ بكتابة كلمات البحث',
  postRenderHooks = [],
}) {
  function render() {
    const q = assembleQuery();
    if (!q) {
      previewBox.textContent = emptyMessage;
      previewBox.classList.add('empty');
      copyBtn.disabled = true;
      searchBtn.disabled = true;
    } else {
      previewBox.textContent = q;
      previewBox.classList.remove('empty');
      copyBtn.disabled = false;
      searchBtn.disabled = false;
    }
    postRenderHooks.forEach(hook => {
      try { hook(); } catch (e) { console.warn('post-render hook failed', e); }
    });
  }

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('visible');
    setTimeout(() => toastEl.classList.remove('visible'), 1500);
  }

  copyBtn.addEventListener('click', async () => {
    const q = previewBox.textContent;
    let copied = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(q);
        copied = true;
      }
    } catch (e) { /* fallthrough */ }
    if (!copied) {
      try {
        const ta = document.createElement('textarea');
        ta.value = q;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        copied = document.execCommand('copy');
        document.body.removeChild(ta);
      } catch (e) { /* fallthrough */ }
    }
    if (copied) {
      const original = copyBtn.textContent;
      copyBtn.textContent = 'تم النسخ';
      setTimeout(() => { copyBtn.textContent = original; }, 1500);
    } else {
      showToast('تعذر النسخ — يرجى نسخ الاستعلام يدوياً');
    }
  });

  searchBtn.addEventListener('click', () => {
    const q = previewBox.textContent;
    if (!q) return;
    const url = 'https://www.google.com/search?q=' + encodeURIComponent(q);
    window.open(url, '_blank', 'noopener,noreferrer');
  });

  let resetArmed = false;
  let resetTimer = null;
  resetBtn.addEventListener('click', () => {
    if (!resetArmed) {
      resetArmed = true;
      resetBtn.textContent = 'تأكيد المسح';
      resetTimer = setTimeout(() => {
        resetArmed = false;
        resetBtn.textContent = 'مسح الكل';
      }, 3000);
    } else {
      clearTimeout(resetTimer);
      resetArmed = false;
      resetBtn.textContent = 'مسح الكل';
      // Clear every registered field by setting to empty value.
      fieldRegistry.forEach(api => { try { api.setValue(''); } catch (e) {} });
      // Clear all warnings and tips too.
      warnings.clearAll();
      tips.clearAll();
      render();
    }
  });

  return { render, showToast };
}
