// "+ إضافة" drawer — exposes specialized chip types (filetype, date-range,
// proximity, number-range) plus shortcuts to common operator keyword chips
// (site, intitle, etc.).
//
// Beginner mode shows the four most common entries top-level and tucks the
// rest behind a "خيارات إضافية" submenu. Advanced mode lists everything
// flat for fast scanning.
//
// The drawer renders as a popover anchored to its trigger button. Clicking
// outside or pressing Escape closes it.

const SPECIAL_TYPES = [
  { type: 'date-range',   label: 'نطاق زمني',          icon: '📅', tier: 'beginner' },
  { type: 'filetype',     label: 'نوع الملف',          icon: '📄', tier: 'beginner' },
  { type: 'proximity',    label: 'بحث بالقرب من',      icon: '⇄',  tier: 'advanced' },
  { type: 'number-range', label: 'نطاق رقمي',          icon: '#',  tier: 'advanced' },
];

const KEYWORD_OPS = [
  { operator: 'site',     label: 'موقع (site:)',           icon: '🌐' },
  { operator: 'intitle',  label: 'في العنوان (intitle:)',  icon: '📰' },
  { operator: 'intext',   label: 'في النص (intext:)',      icon: '¶' },
  { operator: 'inurl',    label: 'في الرابط (inurl:)',     icon: '🔗' },
  { operator: 'inanchor', label: 'في الروابط الواردة',     icon: '⤴' },
];

/**
 * @param {object} args
 * @param {HTMLElement} args.trigger - the button that opens the drawer
 * @param {{ add: Function }} args.chipState
 * @param {{ get: () => 'beginner' | 'advanced' }} args.mode
 */
export function wireDrawer({ trigger, chipState, mode }) {
  let panel = null;

  function close() {
    if (panel) { panel.remove(); panel = null; }
    trigger.setAttribute('aria-expanded', 'false');
    document.removeEventListener('click', onOutsideClick, true);
    document.removeEventListener('keydown', onKey);
  }

  function onOutsideClick(e) {
    if (!panel) return;
    if (panel.contains(e.target) || trigger.contains(e.target)) return;
    close();
  }

  function onKey(e) {
    if (e.key === 'Escape') close();
  }

  function buildButton({ icon, label, onClick }) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'drawer-item';
    btn.innerHTML = `<span class="drawer-item-icon">${icon}</span><span class="drawer-item-label">${label}</span>`;
    btn.addEventListener('click', () => { onClick(); close(); });
    return btn;
  }

  function buildPanel() {
    const isBeginner = mode.get() === 'beginner';
    const root = document.createElement('div');
    root.className = 'drawer-panel';
    root.setAttribute('role', 'menu');

    // Section: keyword operators (a chip already exists if we let the user
    // change a chip's operator, but the drawer also offers to seed one).
    const opsSection = document.createElement('div');
    opsSection.className = 'drawer-section';
    const opsHeading = document.createElement('div');
    opsHeading.className = 'drawer-section-heading';
    opsHeading.textContent = 'كلمة بعامل';
    opsSection.appendChild(opsHeading);
    KEYWORD_OPS.forEach(o => {
      opsSection.appendChild(buildButton({
        icon: o.icon, label: o.label,
        onClick: () => chipState.add('keyword', { operator: o.operator }),
      }));
    });
    root.appendChild(opsSection);

    // Section: specials (filetype, date-range, etc.)
    const specialSection = document.createElement('div');
    specialSection.className = 'drawer-section';
    const specialHeading = document.createElement('div');
    specialHeading.className = 'drawer-section-heading';
    specialHeading.textContent = 'عوامل خاصة';
    specialSection.appendChild(specialHeading);
    SPECIAL_TYPES.forEach(s => {
      if (!isBeginner || s.tier === 'beginner') {
        specialSection.appendChild(buildButton({
          icon: s.icon, label: s.label,
          onClick: () => chipState.add(s.type, {}),
        }));
      }
    });
    if (isBeginner) {
      // "More" disclosure for tier='advanced' specials.
      const more = document.createElement('details');
      more.className = 'drawer-more';
      const summary = document.createElement('summary');
      summary.textContent = 'خيارات إضافية';
      more.appendChild(summary);
      SPECIAL_TYPES.filter(s => s.tier === 'advanced').forEach(s => {
        more.appendChild(buildButton({
          icon: s.icon, label: s.label,
          onClick: () => chipState.add(s.type, {}),
        }));
      });
      specialSection.appendChild(more);
    }
    root.appendChild(specialSection);

    return root;
  }

  function open() {
    if (panel) { close(); return; }
    panel = buildPanel();
    // Position relative to trigger.
    const triggerRect = trigger.getBoundingClientRect();
    panel.style.position = 'fixed';
    // Anchor: drawer hangs below trigger, aligned to its inline-start edge in RTL.
    panel.style.top = (triggerRect.bottom + 6) + 'px';
    panel.style.insetInlineStart = (triggerRect.left) + 'px';
    panel.style.maxHeight = '60vh';
    document.body.appendChild(panel);
    trigger.setAttribute('aria-expanded', 'true');
    // Bind closers AFTER attachment so the opening click doesn't immediately close.
    setTimeout(() => {
      document.addEventListener('click', onOutsideClick, true);
      document.addEventListener('keydown', onKey);
    }, 0);
  }

  trigger.setAttribute('aria-haspopup', 'menu');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.addEventListener('click', () => {
    if (panel) close(); else open();
  });
}
