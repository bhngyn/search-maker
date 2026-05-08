// Recipe-library panel: a collapsible idiom catalogue that sits above the
// chip composer and seeds chips when the user clicks a recipe card.
//
// Three states, driven by data attributes on the host <section>:
//
//   data-state="closed"          → pill visible, header + body hidden
//   data-state="open"            → header + body visible, pill hidden
//
// Within the "open" state a second axis controls card density:
//
//   data-descriptions="hidden"   → compact cards (icon + title only)
//   data-descriptions="visible"  → expanded cards (icon + title + pattern + desc)
//
// The body is rendered lazily on first open and re-rendered on every engine
// swap. On engine swap the panel also collapses back to "closed" so the user
// never sees a stale Google grid while viewing X recipes (or vice-versa).
//
// Accessibility contract:
//   - Pill is <button aria-expanded> that controls aria-controls="idiom-panel-body"
//   - Body has role="region" aria-label="…" and the hidden attribute when closed
//   - Descriptions toggle is <button aria-pressed>
//   - Section headings are real <h4> elements
//   - Each card is <button aria-label="{title} — {description}">
//   - Esc while focus is anywhere inside the panel closes the panel and
//     returns focus to the pill

import { getActiveEngine } from '../core/engine.js';
import { t } from '../i18n/messages.js';

// ---------------------------------------------------------------------------
// Public export
// ---------------------------------------------------------------------------

/**
 * Wire the idiom panel to the page.
 *
 * @param {object} args
 * @param {object} args.chipState  — the canonical chip-state object
 * @param {() => void} [args.focusComposer]  — focus the composer input
 * @param {object} [args.ctx]  — shared ctx (unused directly; engine is read
 *   via the module-level `getActiveEngine()` accessor)
 */
export function wireIdiomPanel({ chipState, focusComposer, ctx, lang }) {
  const panel = document.getElementById('idiom-panel');
  if (!panel) {
    console.warn('wireIdiomPanel: #idiom-panel not found — panel wiring skipped');
    return;
  }

  function pickLocalized(v) {
    if (v == null) return '';
    if (typeof v === 'string') return v;
    const cur = lang ? lang.get() : 'ar';
    return v[cur] != null ? v[cur] : (v.ar != null ? v.ar : '');
  }

  // DOM refs (expected to already be in the HTML; see HTML contract in plan)
  const pill       = panel.querySelector('.idiom-panel-pill');
  const header     = panel.querySelector('.idiom-panel-header');
  const body       = panel.querySelector('.idiom-panel-body');
  const descToggle = panel.querySelector('.idiom-panel-descriptions-toggle');
  const closeBtn   = panel.querySelector('.idiom-panel-close');
  const pillCount  = panel.querySelector('.idiom-panel-pill-count');

  if (!pill || !header || !body) {
    console.warn('wireIdiomPanel: required child elements missing — panel wiring skipped');
    return;
  }

  // Preview region: a sticky band rendered after the body inside the panel.
  // Hovering or focusing a card populates it with that recipe's title +
  // pattern + description. Lives outside the card grid so it can never
  // overlap a card title (the original popover overlapped the row below).
  let preview = panel.querySelector('.idiom-panel-preview');
  if (!preview) {
    preview = document.createElement('div');
    preview.className = 'idiom-panel-preview';
    preview.setAttribute('aria-live', 'polite');
    preview.innerHTML = `
      <span class="idiom-panel-preview-hint"></span>
      <span class="idiom-panel-preview-title"></span>
      <span class="idiom-panel-preview-pattern" dir="ltr"></span>
      <span class="idiom-panel-preview-desc"></span>
    `;
    panel.appendChild(preview);
  }
  const previewHint    = preview.querySelector('.idiom-panel-preview-hint');
  const previewTitle   = preview.querySelector('.idiom-panel-preview-title');
  const previewPattern = preview.querySelector('.idiom-panel-preview-pattern');
  const previewDesc    = preview.querySelector('.idiom-panel-preview-desc');

  // Track whether the body has ever been rendered for the current engine
  let bodyRendered = false;
  let lastRenderedEngineId = null;

  // ---------------------------------------------------------------------------
  // State helpers
  // ---------------------------------------------------------------------------

  function isOpen() {
    return panel.dataset.state === 'open';
  }

  function setState(state) {
    panel.dataset.state = state;
    const open = state === 'open';

    // pill ↔ header visibility
    pill.hidden = open;
    pill.setAttribute('aria-expanded', open ? 'true' : 'false');
    header.hidden = !open;
    body.hidden = !open;
  }

  function setDescriptions(visible) {
    panel.dataset.descriptions = visible ? 'visible' : 'hidden';
    if (descToggle) {
      descToggle.setAttribute('aria-pressed', visible ? 'true' : 'false');
      descToggle.textContent = visible ? t('idiom.toggleHide') : t('idiom.toggleShow');
    }
  }

  // ---------------------------------------------------------------------------
  // Idiom data helpers
  // ---------------------------------------------------------------------------

  function getIdioms() {
    const eng = getActiveEngine();
    return {
      items: eng.idioms || eng.templates || [],
      order: eng.idiomGroupOrder || [],
      labels: eng.idiomGroupLabels || {},
    };
  }

  function updatePillCount() {
    if (!pillCount) return;
    const { items } = getIdioms();
    pillCount.textContent = t('idiom.pillCount', { n: items.length });
  }

  // ---------------------------------------------------------------------------
  // Preview region helpers
  // ---------------------------------------------------------------------------

  function setPreviewHint() {
    preview.classList.remove('idiom-panel-preview--filled');
    previewHint.textContent = t('idiom.previewHint');
    previewTitle.textContent = '';
    previewPattern.textContent = '';
    previewDesc.textContent = '';
  }

  function setPreviewIdiom(idiom) {
    if (!idiom) { setPreviewHint(); return; }
    preview.classList.add('idiom-panel-preview--filled');
    previewHint.textContent = '';
    previewTitle.textContent = pickLocalized(idiom.title);
    previewPattern.textContent = idiom.pattern || '';
    previewDesc.textContent = pickLocalized(idiom.description);
  }

  function findCardIdiom(target) {
    if (!(target instanceof Element)) return null;
    const card = target.closest('.idiom-panel-card');
    if (!card) return null;
    const id = card.dataset.idiomId;
    if (!id) return null;
    return getIdioms().items.find(i => i.id === id) || null;
  }

  // ---------------------------------------------------------------------------
  // XSS-safe HTML escaping
  // ---------------------------------------------------------------------------

  function escapeHtml(s) {
    if (typeof s !== 'string') return '';
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ---------------------------------------------------------------------------
  // Body rendering
  // ---------------------------------------------------------------------------

  function renderBody() {
    const eng = getActiveEngine();
    lastRenderedEngineId = eng.id;
    bodyRendered = true;

    const { items, order, labels } = getIdioms();

    // Clear existing content
    body.innerHTML = '';

    if (!items.length) {
      const empty = document.createElement('p');
      empty.className = 'idiom-panel-empty';
      empty.textContent = t('idiom.empty');
      body.appendChild(empty);
      return;
    }

    // Group items. If no GROUP_ORDER, render all ungrouped items in a single grid.
    if (!order.length) {
      const grid = buildGrid(items);
      body.appendChild(grid);
      return;
    }

    for (const groupSlug of order) {
      const groupItems = items.filter(i => i.group === groupSlug);
      if (!groupItems.length) continue;

      const h = document.createElement('h4');
      h.className = 'idiom-panel-section';
      h.textContent = pickLocalized(labels[groupSlug]) || groupSlug;
      body.appendChild(h);

      const grid = buildGrid(groupItems);
      body.appendChild(grid);
    }

    // Render any items whose group is missing from GROUP_ORDER at the end
    const covered = new Set(order);
    const orphans = items.filter(i => !covered.has(i.group));
    if (orphans.length) {
      const grid = buildGrid(orphans);
      body.appendChild(grid);
    }
  }

  function buildGrid(groupItems) {
    const grid = document.createElement('div');
    grid.className = 'idiom-panel-grid';
    grid.setAttribute('role', 'list');

    for (const idiom of groupItems) {
      const card = buildCard(idiom);
      grid.appendChild(card);
    }

    return grid;
  }

  function buildCard(idiom) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'idiom-panel-card';
    card.setAttribute('role', 'listitem');
    card.dataset.idiomId = idiom.id || '';
    const localTitle = pickLocalized(idiom.title);
    const localDesc = pickLocalized(idiom.description);
    card.setAttribute('aria-label', `${localTitle}${localDesc ? ' — ' + localDesc : ''}`);

    card.innerHTML = `
      <span class="idiom-panel-card-icon" aria-hidden="true">${escapeHtml(idiom.icon || '')}</span>
      <span class="idiom-panel-card-title">${escapeHtml(localTitle)}</span>
      <span class="idiom-panel-card-pattern" dir="ltr">${escapeHtml(idiom.pattern || '')}</span>
      <span class="idiom-panel-card-desc">${escapeHtml(localDesc)}</span>
    `;

    card.addEventListener('click', () => {
      // Apply the idiom: call the idiom's own apply() if available, otherwise
      // fall back to applyTemplate-style lookup on the engine's templates array.
      if (typeof idiom.apply === 'function') {
        try {
          idiom.apply(chipState);
        } catch (e) {
          console.warn('idiom apply() failed', idiom.id, e);
        }
      }

      // Focus the composer so the user can start typing immediately
      if (focusComposer) {
        setTimeout(focusComposer, 100);
      }

      // Subtle bridge flash: briefly outline the chip section so the user's
      // eye follows the newly seeded chips downward.
      const chipSection =
        document.querySelector('.chip-section') ||
        document.querySelector('#chip-area')?.closest('section');
      if (chipSection) {
        chipSection.classList.add('chip-section--just-seeded');
        setTimeout(() => chipSection.classList.remove('chip-section--just-seeded'), 450);
      }
    });

    return card;
  }

  // ---------------------------------------------------------------------------
  // Open / close
  // ---------------------------------------------------------------------------

  function open() {
    const eng = getActiveEngine();
    // Re-render if we haven't yet, or if the engine changed since last render
    if (!bodyRendered || lastRenderedEngineId !== eng.id) {
      renderBody();
    }
    setState('open');
  }

  function close() {
    setState('closed');
  }

  // ---------------------------------------------------------------------------
  // Event handlers
  // ---------------------------------------------------------------------------

  // Pill click → open
  pill.addEventListener('click', open);

  // Close button (▲ in header) → close
  if (closeBtn) {
    closeBtn.addEventListener('click', close);
  }

  // Hover / focus on a card → update the preview band. Use capture-phase
  // mouseenter so it fires before any stopPropagation. The preview is sticky
  // — once a card is hovered, its details remain shown until another card
  // (or focus) takes over. We don't clear on mouseleave from a single card
  // because the user may move the mouse to read the preview itself.
  body.addEventListener('mouseover', (e) => {
    const idiom = findCardIdiom(e.target);
    if (idiom) setPreviewIdiom(idiom);
  });
  body.addEventListener('focusin', (e) => {
    const idiom = findCardIdiom(e.target);
    if (idiom) setPreviewIdiom(idiom);
  });

  // Descriptions toggle
  if (descToggle) {
    descToggle.addEventListener('click', () => {
      const nowVisible = panel.dataset.descriptions !== 'visible';
      setDescriptions(nowVisible);
    });
  }

  // Esc while focus is anywhere inside the panel → close and return focus to pill
  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) {
      e.stopPropagation();
      close();
      pill.focus();
    }
  });

  // ---------------------------------------------------------------------------
  // Engine swap
  // ---------------------------------------------------------------------------

  // Import the engine controller lazily — the module-level `getActiveEngine()`
  // already tracks the active engine; we just need the `on()` subscription.
  // The engine controller is exported from engine.js; main.js constructs it
  // and we can reach it through ctx if needed, but the recommended approach
  // for modules that don't receive the controller directly is to re-import the
  // module and call its exported `on` function directly. However, engine.js
  // doesn't export a module-level `on()`; only the createEngineController
  // return value has it.
  //
  // ctx carries the engine controller via ctx.engine (if main.js passes it),
  // but the contract says ctx is "the same ctx passed to other UI wiring" and
  // engine.js docs say listeners are on the controller returned by
  // createEngineController. So we accept the controller via ctx if available,
  // or fall back to checking ctx.engine.
  //
  // The safe approach: accept an optional `engine` on the ctx object. If the
  // caller (main.js) passes `ctx` that has `engine`, we use it. Otherwise we
  // try to look it up on the global ctx object.

  let engineController = null;
  if (ctx && ctx.engine && typeof ctx.engine.on === 'function') {
    engineController = ctx.engine;
  }

  if (engineController) {
    engineController.on(() => {
      // On engine swap: collapse the panel and re-render lazily.
      // bodyRendered flag is NOT reset here — it's reset implicitly because
      // lastRenderedEngineId will differ from the new engine's id.
      setState('closed');
      // Reset descriptions state so next open starts compact
      setDescriptions(false);
      // Reset preview hint so the next engine's first hover starts from the
      // empty-state copy rather than the previous engine's last-hovered card.
      setPreviewHint();
      // Update pill count immediately (it's visible even when closed)
      updatePillCount();
      // Trigger a lazy re-render next time the panel opens by clearing the
      // last rendered engine id — done automatically by the mismatch check in open().
    });
  } else {
    // No engine controller on ctx — try to get engine subscription via dynamic
    // import resolution. This is a best-effort fallback.
    // The warning helps the caller fix the wiring.
    console.warn(
      'wireIdiomPanel: no ctx.engine.on() found — panel will NOT auto-refresh on engine swap. ' +
      'Pass the engine controller on ctx.engine or call wireIdiomPanel after createEngineController.'
    );
  }

  if (lang && typeof lang.on === 'function') {
    lang.on(() => {
      updatePillCount();
      setDescriptions(panel.dataset.descriptions === 'visible');
      if (bodyRendered) renderBody();
      // Re-paint preview in the new language (hint copy or last-shown idiom).
      if (preview.classList.contains('idiom-panel-preview--filled')) {
        // Re-resolve the last-shown idiom by id from the title element's
        // dataset — but we didn't store an id, so fall back to the hint.
        // Simpler: drop back to the hint on language flip; the user can
        // hover again to see the localized description.
        setPreviewHint();
      } else {
        setPreviewHint();
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Initial setup
  // ---------------------------------------------------------------------------

  // Set initial state (ensure HTML attributes match defaults)
  setState('closed');
  setDescriptions(false);
  setPreviewHint();
  updatePillCount();
}
