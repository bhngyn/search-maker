// Tip: when filetype=PDF is selected, suggest combining with a site restriction.

/**
 * @param {import('../core/ctx.js').Ctx} ctx
 * @param {{ previewBox: HTMLElement }} [deps]
 * @returns {void | { onRender: () => void }}
 */
export function register(ctx, deps) {
  const filetypeSelect = document.getElementById('field-filetype-select');
  if (!filetypeSelect) return;
  filetypeSelect.addEventListener('change', () => {
    if (filetypeSelect.value === 'pdf') {
      ctx.addTip('filetype-pdf', {
        priority: 70,
        messageHtml: '💡 تلميح: ابحث عن PDF مع قيد موقع لاكتشاف وثائق محصورة. مثلاً، إضافة <code>site:.gov</code> أو <code>site:.edu</code> غالباً تكشف وثائق رسمية أو أكاديمية.',
      });
    } else {
      ctx.removeTip('filetype-pdf');
    }
  });
}
