// "+ إضافة" drawer — exposes specialized chip types (filetype, date-range,
// proximity, number-range) plus shortcuts to common operator keyword chips
// (site, intitle, etc.).
//
// Each item is a two-line + badge structure: a user-language Arabic label,
// a muted one-line description, and a trailing-edge mono badge with the
// technical operator name so users gradually learn the syntax.
//
// Beginner mode reorders by frequency-of-use and tucks proximity/number-range
// behind a "خيارات إضافية" disclosure. Advanced mode keeps the original
// two-section grouping (keyword operators, then specials) flat for fast
// scanning.
//
// The drawer renders as a popover anchored to its trigger button. Clicking
// outside or pressing Escape closes it.

// Item descriptors. `kind` controls how onClick wires up; `badge` is the
// LTR mono operator hint; `tier` (specials only) governs the Beginner
// "خيارات إضافية" disclosure.
const ITEMS = {
  site:          { kind: 'keyword', operator: 'site',     label: 'البحث في موقع محدد',      desc: 'يحصر النتائج بنطاق معين، مثل bbc.com',                    badge: 'site:' },
  intitle:       { kind: 'keyword', operator: 'intitle',  label: 'البحث في عنوان الصفحة',   desc: 'كلمة يجب أن تظهر في عنوان النتيجة',                       badge: 'intitle:' },
  inurl:         { kind: 'keyword', operator: 'inurl',    label: 'البحث في رابط الصفحة',    desc: 'كلمة يجب أن تظهر في رابط النتيجة',                        badge: 'inurl:' },
  intext:        { kind: 'keyword', operator: 'intext',   label: 'البحث في نص الصفحة',      desc: 'كلمة يجب أن تظهر في محتوى النتيجة',                       badge: 'intext:' },
  inanchor:      { kind: 'keyword', operator: 'inanchor', label: 'البحث في روابط واردة',    desc: 'كلمة من نص الروابط التي تشير للصفحة',                     badge: 'inanchor:' },
  filetype:      { kind: 'special', type: 'filetype',     label: 'نوع الملف',                desc: 'حصر النتائج في PDF أو Word أو غيرها',                     badge: 'filetype:',     tier: 'beginner' },
  'date-range':  { kind: 'special', type: 'date-range',   label: 'نطاق زمني',                desc: 'حصر النتائج بين تاريخين',                                  badge: 'before: / after:', tier: 'beginner' },
  proximity:     { kind: 'special', type: 'proximity',    label: 'كلمتان متقاربتان',         desc: 'كلمتان تظهران بقرب بعضهما، مفيد لربط شخصين',              badge: 'AROUND(N)',     tier: 'advanced' },
  'number-range':{ kind: 'special', type: 'number-range', label: 'نطاق عددي',                desc: 'أرقام بين قيمتين، مثل 100..500',                          badge: '..',            tier: 'advanced' },
};

// Beginner-mode flat order (frequency-of-use first), excluding tier:advanced
// items which appear inside the disclosure.
const BEGINNER_ORDER = [
  'date-range',
  'filetype',
  'site',
  'intitle',
  'intext',
  'inurl',
  'inanchor',
];
const BEGINNER_MORE = ['proximity', 'number-range'];

// Advanced-mode grouping: keyword operators, then specials, all flat.
const ADVANCED_KEYWORDS = ['site', 'intitle', 'inurl', 'intext', 'inanchor'];
const ADVANCED_SPECIALS = ['filetype', 'date-range', 'proximity', 'number-range'];

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
    window.removeEventListener('resize', onResize);
  }

  function onOutsideClick(e) {
    if (!panel) return;
    if (panel.contains(e.target) || trigger.contains(e.target)) return;
    close();
  }

  function onKey(e) {
    if (e.key === 'Escape') close();
  }

  function clickFor(item) {
    if (item.kind === 'keyword') {
      return () => chipState.add('keyword', { operator: item.operator });
    }
    return () => chipState.add(item.type, {});
  }

  function buildItem(key) {
    const item = ITEMS[key];
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'drawer-item';
    // The badge is a Latin operator name; keep it explicitly LTR so it
    // renders correctly inside the RTL panel.
    btn.innerHTML = `
      <span class="drawer-item-text">
        <span class="drawer-item-label">${item.label}</span>
        <span class="drawer-item-desc">${item.desc}</span>
      </span>
      <span class="drawer-item-badge" dir="ltr">${item.badge}</span>
    `;
    const onClick = clickFor(item);
    btn.addEventListener('click', () => { onClick(); close(); });
    return btn;
  }

  function buildSection(headingText) {
    const section = document.createElement('div');
    section.className = 'drawer-section';
    if (headingText) {
      const heading = document.createElement('div');
      heading.className = 'drawer-section-heading';
      heading.textContent = headingText;
      section.appendChild(heading);
    }
    return section;
  }

  function buildPanel() {
    const isBeginner = mode.get() === 'beginner';
    const root = document.createElement('div');
    root.className = 'drawer-panel';
    root.setAttribute('role', 'menu');

    if (isBeginner) {
      // Single flat list ordered by frequency-of-use; advanced specials
      // hidden behind a disclosure.
      const section = buildSection(null);
      BEGINNER_ORDER.forEach(key => section.appendChild(buildItem(key)));

      const more = document.createElement('details');
      more.className = 'drawer-more';
      const summary = document.createElement('summary');
      summary.textContent = 'خيارات إضافية';
      more.appendChild(summary);
      BEGINNER_MORE.forEach(key => more.appendChild(buildItem(key)));
      section.appendChild(more);

      root.appendChild(section);
    } else {
      // Advanced: predictable two-section grouping.
      const opsSection = buildSection('البحث داخل عناصر الصفحة');
      ADVANCED_KEYWORDS.forEach(key => opsSection.appendChild(buildItem(key)));
      root.appendChild(opsSection);

      const specialsSection = buildSection('قيود إضافية');
      ADVANCED_SPECIALS.forEach(key => specialsSection.appendChild(buildItem(key)));
      root.appendChild(specialsSection);
    }

    return root;
  }

  // Place the panel so all items are reachable. Default is below the
  // trigger; if there isn't room below, flip above. Either way clamp
  // max-height to the actually-available space so internal scroll is
  // reachable rather than relying on a fixed 60vh that may overflow the
  // viewport bottom (the original bug).
  function position() {
    if (!panel) return;
    const VGAP = 6;          // gap between trigger and panel
    const VEDGE = 8;          // breathing room at viewport edges
    const HEDGE = 8;          // breathing room left/right
    const triggerRect = trigger.getBoundingClientRect();
    const vpH = window.innerHeight;
    const vpW = window.innerWidth;

    const spaceBelow = vpH - triggerRect.bottom - VGAP - VEDGE;
    const spaceAbove = triggerRect.top - VGAP - VEDGE;

    // Measure natural content height (cap at 70vh as an upper bound).
    panel.style.maxHeight = 'none';
    const contentH = panel.scrollHeight;
    const upperBound = Math.min(Math.round(vpH * 0.7), 600);

    const flipAbove = spaceBelow < Math.min(contentH, 280) && spaceAbove > spaceBelow;
    const avail = flipAbove ? spaceAbove : spaceBelow;
    const targetH = Math.min(contentH, avail, upperBound);

    panel.style.position = 'fixed';
    panel.style.maxHeight = targetH + 'px';

    if (flipAbove) {
      panel.style.top = Math.max(VEDGE, triggerRect.top - VGAP - targetH) + 'px';
    } else {
      panel.style.top = (triggerRect.bottom + VGAP) + 'px';
    }

    // Horizontal: anchor to trigger's inline-start edge in RTL, then clamp
    // so the panel stays inside the viewport on narrow widths.
    const panelW = panel.offsetWidth;
    let left = triggerRect.left;
    if (left + panelW > vpW - HEDGE) left = vpW - panelW - HEDGE;
    if (left < HEDGE) left = HEDGE;
    panel.style.insetInlineStart = 'auto';
    panel.style.left = left + 'px';
  }

  function onResize() { position(); }

  function open() {
    if (panel) { close(); return; }
    panel = buildPanel();
    document.body.appendChild(panel);
    position();
    trigger.setAttribute('aria-expanded', 'true');
    window.addEventListener('resize', onResize);
    // Re-position when the disclosure inside the panel toggles, since
    // expanding/collapsing changes scrollHeight and may now fit/overflow.
    panel.addEventListener('toggle', position, true);
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
