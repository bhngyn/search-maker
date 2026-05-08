// Warns when intitle/intext/inanchor have multi-word values without exact-phrase quoting.

/**
 * @param {import('../core/ctx.js').Ctx} ctx
 * @param {{ previewBox: HTMLElement }} [deps]
 * @returns {void | { onRender: () => void }}
 */
export function register(ctx, deps) {
  ['intitle', 'intext', 'inanchor'].forEach(slug => {
    const input = document.getElementById('field-' + slug + '-input');
    const quote = document.getElementById('field-' + slug + '-quote');
    if (!input || !quote) return;
    const labels = {
      intitle: 'في عنوان الصفحة',
      intext: 'في نص الصفحة',
      inanchor: 'في نص الروابط الواردة',
    };
    const opLabel = labels[slug];
    function check() {
      const v = input.value.trim();
      if (v && /\s/.test(v) && !quote.checked) {
        ctx.addWarning(slug + '-multiword',
          '⚠️ في حقل «' + opLabel + '» (<code>' + slug + ':</code>): يحتوي على كلمات متعددة بدون اقتباس. سيقتصر جوجل على ربط الكلمة الأولى فقط بالعامل. فعّل «اقتباس حرفي» أو انقل الكلمات الإضافية إلى حقل الكلمات الرئيسية.');
      } else {
        ctx.removeWarning(slug + '-multiword');
      }
    }
    input.addEventListener('input', check);
    quote.addEventListener('change', check);
  });
}
