// Warns when more than 4 operator-restricted fields are filled simultaneously.

/**
 * @param {import('../core/ctx.js').Ctx} ctx
 * @param {{ previewBox: HTMLElement }} [deps]
 * @returns {void | { onRender: () => void }}
 */
export function register(ctx, deps) {
  const restrictedSlugs = [
    'site', 'intitle', 'inurl', 'intext', 'inanchor',
    'filetype', 'date-range', 'proximity', 'number-range',
  ];
  function onRender() {
    let activeRestrictions = 0;
    restrictedSlugs.forEach(slug => {
      const wrapper = document.querySelector('.field-' + slug);
      if (!wrapper) return;
      const inputs = wrapper.querySelectorAll('input:not([type="checkbox"]), select');
      const hasValue = Array.from(inputs).some(el => el.value && String(el.value).trim());
      if (hasValue) activeRestrictions++;
    });
    if (activeRestrictions > 4) {
      ctx.addWarning('over-restricted',
        '⚠️ فعّلت ' + activeRestrictions + ' قيود بحث في نفس الوقت. الاستعلامات المقيدة جداً غالباً لا تُعيد نتائج. ابدأ بقيود أقل وأضف المزيد إذا كانت النتائج واسعة.');
    } else {
      ctx.removeWarning('over-restricted');
    }
  }
  return { onRender };
}
