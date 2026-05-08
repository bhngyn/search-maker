// Cross-field coaching warnings + the PDF strategy tip.
//
// Phase 3 will split each of these into its own file under warnings/ or tips/.
// For now, they live together because they all read multiple fields.

/**
 * @param {object} args
 * @param {{ addWarning: Function, removeWarning: Function, addTip: Function, removeTip: Function }} args.ctx
 * @param {HTMLElement} args.previewBox
 */
export function wireCrossFieldWarnings({ ctx, previewBox }) {
  // ----- Multi-word values in intitle/intext/inanchor without quoting -----
  // Silently binds only the first word to the operator — the most common surprise.
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

  // ----- PDF + suggest-site-restriction tip -----
  const filetypeSelect = document.getElementById('field-filetype-select');
  if (filetypeSelect) {
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

  // ----- Query-length warning (>32 words) and over-restricted warning (>4 ops) -----
  const restrictedSlugs = [
    'site', 'intitle', 'inurl', 'intext', 'inanchor',
    'filetype', 'date-range', 'proximity', 'number-range',
  ];

  function globalChecks() {
    const q = previewBox.textContent.trim();
    const wordCount = q && !previewBox.classList.contains('empty')
      ? q.split(/\s+/).filter(Boolean).length
      : 0;
    if (wordCount > 32) {
      ctx.addWarning('query-too-long',
        '⚠️ الاستعلام طويل (' + wordCount + ' كلمة). جوجل قد يُعيد نتائج قليلة أو لا شيء عند تجاوز نحو 32 كلمة. حاول تبسيط البحث.');
    } else {
      ctx.removeWarning('query-too-long');
    }
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

  return { globalChecks };
}
