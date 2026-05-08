// Gentle note when the user quotes a single word — quoting disables Google's
// spelling correction and synonym expansion. Sometimes that's intended (proper
// nouns, technical terms), but it's a frequent unintended footgun.

/**
 * @param {import('../core/ctx.js').Ctx} ctx
 * @param {{ chipState: { getAll: () => any[] } }} [deps]
 */
export function register(ctx, deps) {
  const chipState = deps && deps.chipState;
  if (!chipState) return;

  function onRender() {
    const offending = chipState.getAll().some(c =>
      c.type === 'keyword' &&
      c.props.quoted &&
      c.props.text &&
      !/\s/.test(c.props.text.trim())
    );
    if (offending) {
      ctx.addWarning('single-word-quote',
        'ℹ️ تقييد كلمة واحدة بالاقتباس يُعطّل تصحيح التهجئة والمرادفات في Google. هذا مقصود أحياناً (للأسماء الخاصة أو المصطلحات التقنية)، لكنه غالباً غير ضروري.');
    } else {
      ctx.removeWarning('single-word-quote');
    }
  }
  return { onRender };
}
