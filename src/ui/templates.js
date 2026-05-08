// Beginner-mode template buttons. Each pre-fills chips and focuses the
// composer. Clicking a template doesn't auto-submit a search — it just
// scaffolds the chip state so the user can continue typing.

/**
 * @param {object} args
 * @param {{ add: Function }} args.chipState
 * @param {() => void} [args.focusComposer]
 */
export function wireTemplates({ chipState, focusComposer }) {
  function focusAfterApply() {
    if (focusComposer) setTimeout(focusComposer, 100);
  }

  const siteBtn = document.getElementById('template-site');
  const docsBtn = document.getElementById('template-docs');
  const dateRangeBtn = document.getElementById('template-daterange');

  if (siteBtn) {
    siteBtn.addEventListener('click', () => {
      // Seed a site-restricted chip; user types the domain into the chip.
      chipState.add('keyword', { operator: 'site', text: '' });
      focusAfterApply();
    });
  }
  if (docsBtn) {
    docsBtn.addEventListener('click', () => {
      // Filetype chip preset to PDF (the most common investigation case).
      chipState.add('filetype', { value: 'pdf' });
      focusAfterApply();
    });
  }
  if (dateRangeBtn) {
    dateRangeBtn.addEventListener('click', () => {
      const today = new Date();
      const lastYear = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
      const fmt = (d) => d.toISOString().slice(0, 10);
      chipState.add('date-range', { after: fmt(lastYear), before: fmt(today) });
      focusAfterApply();
    });
  }
}
