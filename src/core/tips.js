// Strategy tips system. Beginner-only, single-tip-at-a-time, priority-ordered.
// Higher priority wins ties. Dismissing a tip hides it for the rest of the session.

/**
 * @param {HTMLElement} tipRegion
 * @param {() => 'beginner' | 'advanced'} getMode
 */
export function createTips(tipRegion, getMode) {
  const active = new Map(); // slug -> { slug, priority, messageHtml, dismissed }

  function reflow() {
    tipRegion.innerHTML = '';
    if (getMode() !== 'beginner') return;
    const tips = Array.from(active.values()).filter(t => !t.dismissed);
    if (!tips.length) return;
    tips.sort((a, b) => b.priority - a.priority);
    const t = tips[0];
    const el = document.createElement('div');
    el.className = 'tip tip-' + t.slug;
    el.id = 'tip-' + t.slug;
    el.innerHTML = t.messageHtml + ' <button type="button" class="tip-dismiss-btn" aria-label="إخفاء الاقتراح">×</button>';
    el.querySelector('.tip-dismiss-btn').addEventListener('click', () => {
      t.dismissed = true;
      reflow();
    });
    tipRegion.appendChild(el);
  }

  function add(slug, opts) {
    const existing = active.get(slug);
    if (existing && existing.dismissed) return; // session-dismissed
    active.set(slug, {
      slug,
      priority: opts.priority || 0,
      messageHtml: opts.messageHtml,
      dismissed: existing ? existing.dismissed : false,
    });
    reflow();
  }

  function remove(slug) {
    active.delete(slug);
    reflow();
  }

  function clearAll() {
    active.clear();
    reflow();
  }

  return { add, remove, reflow, clearAll };
}
