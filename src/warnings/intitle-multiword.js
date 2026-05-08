// Multi-word values in intitle/intext/inanchor without quoting silently bind
// only the first word to the operator — the most common surprise in this tool.
// In the chip model, this fires when a keyword chip with one of those
// operators contains spaces but isn't quoted.

const TARGET_OPS = ['intitle', 'intext', 'inanchor'];
const OP_LABELS = {
  intitle: 'في عنوان الصفحة',
  intext: 'في نص الصفحة',
  inanchor: 'في نص الروابط الواردة',
};

/**
 * @param {import('../core/ctx.js').Ctx} ctx
 * @param {{ chipState: { getAll: () => any[] } }} [deps]
 */
export function register(ctx, deps) {
  const chipState = deps && deps.chipState;
  if (!chipState) return;

  function onRender() {
    const offending = [];
    chipState.getAll().forEach(chip => {
      if (chip.type !== 'keyword') return;
      if (!TARGET_OPS.includes(chip.props.operator)) return;
      const v = (chip.props.text || '').trim();
      if (v && /\s/.test(v) && !chip.props.quoted) {
        offending.push({ op: chip.props.operator, text: v });
      }
    });
    if (offending.length) {
      const lines = offending.map(({ op, text }) =>
        '«' + OP_LABELS[op] + '» (<code>' + op + ':</code>) — «' + escapeHtml(text) + '»'
      ).join('<br>');
      ctx.addWarning('intitle-multiword',
        '⚠️ كلمات متعددة بدون اقتباس في عوامل تحتاج اقتباساً:<br>' + lines +
        '<br>سيقتصر جوجل على ربط الكلمة الأولى فقط بالعامل. فعّل «اقتباس حرفي» على كل كلمة، أو استخدم كلمة واحدة.');
    } else {
      ctx.removeWarning('intitle-multiword');
    }
  }
  return { onRender };
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
