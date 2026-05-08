// Warns when a Latin-only operator chip (site, inurl) contains Arabic text.
// Google won't match Arabic characters in URLs or domain names.

const LATIN_ONLY_OPS = ['site', 'inurl'];
const ARABIC_RE = /[؀-ۿ]/;
const OP_LABELS = { site: 'الموقع', inurl: 'الرابط' };

/**
 * @param {import('../core/ctx.js').Ctx} ctx
 * @param {{ chipState: { getAll: () => any[] } }} [deps]
 */
export function register(ctx, deps) {
  const chipState = deps && deps.chipState;
  if (!chipState) return;

  function onRender() {
    const offending = chipState.getAll().filter(c =>
      c.type === 'keyword' &&
      LATIN_ONLY_OPS.includes(c.props.operator) &&
      ARABIC_RE.test(c.props.text || '')
    );
    if (offending.length) {
      const labels = [...new Set(offending.map(c => OP_LABELS[c.props.operator]))].join('، ');
      ctx.addWarning('operator-arabic-chars',
        '⚠️ تحتوي حقول (' + labels + ') على أحرف عربية. هذه الحقول تتوقع نطاقات أو أجزاء من URL بالأحرف اللاتينية، ولن يتطابق Google مع النص العربي فيها.');
    } else {
      ctx.removeWarning('operator-arabic-chars');
    }
  }
  return { onRender };
}
