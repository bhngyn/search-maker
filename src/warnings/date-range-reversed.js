// Warns when a date-range chip has after > before — the range is reversed
// and Google will return no results.

/**
 * @param {import('../core/ctx.js').Ctx} ctx
 * @param {{ chipState: { getAll: () => any[] } }} [deps]
 */
export function register(ctx, deps) {
  const chipState = deps && deps.chipState;
  if (!chipState) return;

  function onRender() {
    const reversed = chipState.getAll().some(c =>
      c.type === 'date-range' &&
      c.props.after && c.props.before &&
      c.props.after > c.props.before
    );
    if (reversed) {
      ctx.addWarning('date-range-reversed',
        '⚠️ النطاق الزمني مقلوب: تاريخ "بعد" أحدث من تاريخ "قبل"، مما يعني أن البحث لن يُعيد أي نتائج. يُرجى تصحيح الترتيب.');
    } else {
      ctx.removeWarning('date-range-reversed');
    }
  }
  return { onRender };
}
