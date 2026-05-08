// Tip surfaced when the user has a quoted multi-word keyword chip — Arabic
// names often have multiple valid spellings, and the global normalize toggle
// can broaden the search across variants.

/**
 * @param {import('../core/ctx.js').Ctx} ctx
 * @param {{ chipState: { getAll: () => any[] } }} [deps]
 */
export function register(ctx, deps) {
  const chipState = deps && deps.chipState;
  if (!chipState) return;

  function onRender() {
    const trigger = chipState.getAll().some(c =>
      c.type === 'keyword' &&
      c.props.operator === 'none' &&
      c.props.quoted &&
      c.props.text &&
      /\s/.test(c.props.text.trim())
    );
    if (trigger) {
      ctx.addTip('keyword-name-variants', {
        priority: 50,
        messageHtml: '💡 تلميح: الأسماء العربية لها كثير من التهجئات المختلفة (أ، إ، آ). يمكنك تفعيل «توحيد الأحرف العربية» في الأعلى ليشمل البحث هذه الاختلافات تلقائياً.',
      });
    } else {
      ctx.removeTip('keyword-name-variants');
    }
  }
  return { onRender };
}
