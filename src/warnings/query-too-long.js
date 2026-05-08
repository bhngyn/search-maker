// Warns when the assembled query exceeds 32 words (Google's effective length limit).

/**
 * @param {import('../core/ctx.js').Ctx} ctx
 * @param {{ previewBox: HTMLElement }} [deps]
 * @returns {void | { onRender: () => void }}
 */
export function register(ctx, deps) {
  const previewBox = deps && deps.previewBox;
  function onRender() {
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
  }
  return { onRender };
}
