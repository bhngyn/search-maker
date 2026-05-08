// Tip surfaced when a date-range chip has BOTH `after` and `before` set —
// narrow date ranges combined with site restrictions are extremely
// effective for finding event-specific coverage.

/**
 * @param {import('../core/ctx.js').Ctx} ctx
 * @param {{ chipState: { getAll: () => any[] } }} [deps]
 */
export function register(ctx, deps) {
  const chipState = deps && deps.chipState;
  if (!chipState) return;

  function onRender() {
    const trigger = chipState.getAll().some(c =>
      c.type === 'date-range' && c.props.after && c.props.before
    );
    if (trigger) {
      ctx.addTip('date-range-both', {
        priority: 60,
        messageHtml: '💡 النطاقات الزمنية الضيقة مع قيود الموقع فعّالة جداً للعثور على تغطية أحداث بعينها. جرّب دمج هذا النطاق مع حقل «في عنوان الصفحة» (intitle:) للعثور على مقالات تتعلق بحدث محدد.',
      });
    } else {
      ctx.removeTip('date-range-both');
    }
  }
  return { onRender };
}
