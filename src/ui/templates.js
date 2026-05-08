// Wire the three Beginner-mode template buttons. Each pre-fills fields via
// ctx.setField(...) and scrolls the user to the keywords field.
//
// Template #2 ("بحث في الوثائق") and the date-range template populate fields
// that live in the Beginner-mode "more options" disclosure, so they pass
// `requiresAdvanced: true` to expand the disclosure first.

/**
 * @param {object} args
 * @param {{ setField: (slug: string, value: any) => void }} args.ctx
 * @param {((revealed: boolean) => void) | null} args.setAdvancedRevealed
 */
export function wireTemplates({ ctx, setAdvancedRevealed }) {
  function scrollToKeywords() {
    const el = document.getElementById('field-keywords-input');
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => el.focus(), 250);
  }

  function applyTemplate(fillers, requiresAdvanced) {
    Object.keys(fillers).forEach(slug => ctx.setField(slug, fillers[slug]));
    if (requiresAdvanced && setAdvancedRevealed) setAdvancedRevealed(true);
    scrollToKeywords();
  }

  const siteBtn = document.getElementById('template-site');
  const docsBtn = document.getElementById('template-docs');
  const dateRangeBtn = document.getElementById('template-daterange');

  if (siteBtn) {
    siteBtn.addEventListener('click', () => {
      applyTemplate({ site: 'example.com' }, false);
    });
  }
  if (docsBtn) {
    docsBtn.addEventListener('click', () => {
      applyTemplate({ filetype: 'pdf' }, true);
    });
  }
  if (dateRangeBtn) {
    dateRangeBtn.addEventListener('click', () => {
      const today = new Date();
      const lastYear = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
      const fmt = (d) => d.toISOString().slice(0, 10);
      applyTemplate({ 'date-range': { after: fmt(lastYear), before: fmt(today) } }, true);
    });
  }
}
