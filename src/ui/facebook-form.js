import { t } from '../i18n/messages.js';

// Facebook search form — the entire input UI when the Facebook engine is
// active. Replaces the chip composer + chip area + drawer surface (which
// the bootstrap hides on engine switch).
//
// State:
//   {
//     category: 'top' | 'posts' | 'people' | 'photos' | 'videos' | 'pages',
//     keyword:  string,
//     sections: { [sectionId]: { optionId: string, idValue?: string } },
//     toggles:  { [sectionId]: boolean },
//     ids:      { [sectionId]: string },
//     date:     null | { startYear, startMonth, startDay, endYear, endMonth, endDay },
//   }
//
// State changes are funneled through `set()` which:
//   1. Mutates the in-memory state.
//   2. Calls the bootstrap-supplied `onChange()` so the preview re-renders.
//
// The form registers a single segment with ctx (like chip-state) that emits
// the full Facebook URL as the assembled query. The preview shows that URL
// directly; the engine's `searchUrl` is identity so the search button opens
// the URL verbatim.

const CATEGORY_LABELS_BY_ID = {};

/**
 * @param {object} args
 * @param {HTMLElement} args.host - the form mount point
 * @param {object} args.engine - the Facebook engine descriptor
 * @param {{ requestUpdate: () => void }} args.ctx
 * @returns {{ getState: () => object, reset: () => void, refresh: () => void }}
 */
export function wireFacebookForm({ host, engine, ctx, lang }) {
  host.classList.add('fb-form');
  host.setAttribute('aria-label', t('ui.fbForm.ariaLabel'));

  const state = makeInitialState();

  function set(patch) {
    Object.assign(state, patch);
    ctx.requestUpdate();
  }

  function setSection(sectionId, optionId, idValue) {
    state.sections = { ...state.sections, [sectionId]: { optionId, idValue: idValue || '' } };
    ctx.requestUpdate();
  }
  function setToggle(sectionId, on) {
    state.toggles = { ...state.toggles, [sectionId]: !!on };
    ctx.requestUpdate();
  }
  function setIdOnly(sectionId, value) {
    state.ids = { ...state.ids, [sectionId]: value };
    ctx.requestUpdate();
  }
  function setDate(patch) {
    state.date = { ...(state.date || makeEmptyDate()), ...patch };
    ctx.requestUpdate();
  }
  function clearDate() {
    state.date = null;
    ctx.requestUpdate();
  }

  function reset() {
    const fresh = makeInitialState();
    Object.keys(state).forEach(k => delete state[k]);
    Object.assign(state, fresh);
    render();
    ctx.requestUpdate();
  }

  // ===== DOM rendering =====
  function render() {
    while (host.firstChild) host.removeChild(host.firstChild);
    host.appendChild(renderCategoryRow());
    host.appendChild(renderKeywordRow());
    host.appendChild(renderSections());
  }

  function renderCategoryRow() {
    const wrap = document.createElement('section');
    wrap.className = 'fb-form-section fb-form-categories';
    const legend = document.createElement('h3');
    legend.className = 'fb-form-legend';
    legend.textContent = t('ui.fbForm.categoryLegend');
    wrap.appendChild(legend);

    const grid = document.createElement('div');
    grid.className = 'fb-cat-grid';
    grid.setAttribute('role', 'radiogroup');
    grid.setAttribute('aria-label', t('ui.fbForm.categoryLegend'));

    engine.categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'fb-cat-btn';
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', cat.value === state.category ? 'true' : 'false');
      if (cat.value === state.category) btn.classList.add('is-active');
      btn.dataset.value = cat.value;
      btn.innerHTML = `<span class="fb-cat-label">${escapeHtml(t(cat.label))}</span><span class="fb-cat-hint">${escapeHtml(t(cat.hint))}</span>`;
      btn.addEventListener('click', () => {
        if (state.category === cat.value) return;
        state.category = cat.value;
        // Clear sections/toggles/ids/date when switching category — the
        // section list is different per category and stale state would leak
        // across (e.g. a 'pagesCategory' selection while on 'top').
        state.sections = {};
        state.toggles = {};
        state.ids = {};
        state.date = null;
        render();
        ctx.requestUpdate();
      });
      CATEGORY_LABELS_BY_ID[cat.value] = t(cat.label);
      grid.appendChild(btn);
    });

    wrap.appendChild(grid);
    return wrap;
  }

  function renderKeywordRow() {
    const wrap = document.createElement('section');
    wrap.className = 'fb-form-section fb-form-keyword';
    const legend = document.createElement('label');
    legend.className = 'fb-form-legend';
    legend.htmlFor = 'fb-keyword-input';
    legend.textContent = t('ui.fbForm.keywordLegend');
    const hint = document.createElement('p');
    hint.className = 'fb-form-hint';
    hint.textContent = t('ui.fbForm.keywordHint');

    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'fb-keyword-input';
    input.className = 'fb-keyword-input';
    input.dir = 'auto';
    input.value = state.keyword || '';
    input.placeholder = t('ui.fbForm.keywordPlaceholder');
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.addEventListener('input', (e) => set({ keyword: e.target.value }));

    wrap.appendChild(legend);
    wrap.appendChild(input);
    wrap.appendChild(hint);
    return wrap;
  }

  function renderSections() {
    const container = document.createElement('div');
    container.className = 'fb-form-sections';
    const sections = (engine.categorySections && engine.categorySections[state.category]) || [];
    if (!sections.length) {
      const note = document.createElement('p');
      note.className = 'fb-form-empty';
      note.textContent = t('ui.fbForm.noFilters');
      container.appendChild(note);
      return container;
    }
    sections.forEach(section => {
      container.appendChild(renderSection(section));
    });
    return container;
  }

  function renderSection(section) {
    if (section.kind === 'date')   return renderDateSection(section);
    if (section.kind === 'toggle') return renderToggleSection(section);
    if (section.kind === 'idOnly') return renderIdOnlySection(section);
    return renderRadioSection(section);
  }

  function renderRadioSection(section) {
    const wrap = document.createElement('section');
    wrap.className = 'fb-form-section';
    wrap.setAttribute('role', 'radiogroup');
    wrap.setAttribute('aria-label', t(section.legend));

    const legend = document.createElement('h3');
    legend.className = 'fb-form-legend';
    legend.textContent = t(section.legend);
    wrap.appendChild(legend);

    const list = document.createElement('div');
    list.className = 'fb-radio-list';

    const sel = state.sections[section.id] || { optionId: 'none', idValue: '' };

    section.options.forEach(opt => {
      const row = document.createElement('label');
      row.className = 'fb-radio-row';
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'fb-section-' + section.id;
      radio.value = opt.id;
      radio.checked = sel.optionId === opt.id;
      radio.addEventListener('change', () => {
        if (radio.checked) {
          setSection(section.id, opt.id, sel.idValue);
          // Re-render so id input visibility tracks the new selection.
          render();
        }
      });

      const labelText = document.createElement('span');
      labelText.className = 'fb-radio-label';
      labelText.textContent = t(opt.label);

      row.appendChild(radio);
      row.appendChild(labelText);

      // ID input shown only when this option is selected and needs an id.
      if (opt.idField && sel.optionId === opt.id) {
        const idInput = document.createElement('input');
        idInput.type = 'text';
        idInput.className = 'fb-id-input';
        idInput.dir = opt.idField.dir || 'ltr';
        idInput.placeholder = t(opt.idField.placeholder) || '';
        idInput.value = sel.idValue || '';
        idInput.autocomplete = 'off';
        idInput.spellcheck = false;
        idInput.addEventListener('input', () => {
          // Update without re-rendering so the input keeps focus.
          state.sections = {
            ...state.sections,
            [section.id]: { optionId: opt.id, idValue: idInput.value },
          };
          ctx.requestUpdate();
        });
        idInput.addEventListener('click', e => e.preventDefault === undefined ? null : null);
        row.appendChild(idInput);
        if (opt.idField.hint) {
          const hint = document.createElement('span');
          hint.className = 'fb-id-hint';
          hint.textContent = t(opt.idField.hint);
          row.appendChild(hint);
        }
      }

      list.appendChild(row);
    });

    wrap.appendChild(list);
    return wrap;
  }

  function renderToggleSection(section) {
    const wrap = document.createElement('section');
    wrap.className = 'fb-form-section';

    const legend = document.createElement('h3');
    legend.className = 'fb-form-legend';
    legend.textContent = t(section.legend);
    wrap.appendChild(legend);

    const row = document.createElement('label');
    row.className = 'fb-toggle-row';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = !!(state.toggles && state.toggles[section.id]);
    cb.addEventListener('change', () => setToggle(section.id, cb.checked));

    const labelText = document.createElement('span');
    labelText.className = 'fb-radio-label';
    labelText.textContent = section.toggleLabel ? t(section.toggleLabel) : t('ui.fbForm.toggleDefault');

    row.appendChild(cb);
    row.appendChild(labelText);
    wrap.appendChild(row);
    return wrap;
  }

  function renderIdOnlySection(section) {
    const wrap = document.createElement('section');
    wrap.className = 'fb-form-section';

    const legend = document.createElement('h3');
    legend.className = 'fb-form-legend';
    legend.textContent = t(section.legend);
    wrap.appendChild(legend);

    const row = document.createElement('div');
    row.className = 'fb-idonly-row';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'fb-id-input';
    input.dir = section.idField.dir || 'ltr';
    input.placeholder = t(section.idField.placeholder) || '';
    input.value = (state.ids && state.ids[section.id]) || '';
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.addEventListener('input', () => {
      state.ids = { ...state.ids, [section.id]: input.value };
      ctx.requestUpdate();
    });

    row.appendChild(input);
    if (section.idField.hint) {
      const hint = document.createElement('span');
      hint.className = 'fb-id-hint';
      hint.textContent = t(section.idField.hint);
      row.appendChild(hint);
    }
    wrap.appendChild(row);
    return wrap;
  }

  function renderDateSection(section) {
    const wrap = document.createElement('section');
    wrap.className = 'fb-form-section fb-form-date';

    const legend = document.createElement('h3');
    legend.className = 'fb-form-legend';
    legend.textContent = t(section.legend);
    wrap.appendChild(legend);

    const hint = document.createElement('p');
    hint.className = 'fb-form-hint';
    hint.textContent = t('engine.facebook.sec.datePosted.hint');
    wrap.appendChild(hint);

    const row = document.createElement('div');
    row.className = 'fb-date-row';

    const startLabel = document.createElement('label');
    startLabel.className = 'fb-date-label';
    startLabel.textContent = t('engine.facebook.sec.datePosted.from');
    const startInput = document.createElement('input');
    startInput.type = 'date';
    startInput.className = 'fb-date-input';
    startInput.dir = 'ltr';
    startInput.value = state.date && state.date.startDay ? state.date.startDay : '';
    startInput.addEventListener('input', () => {
      const v = startInput.value; // 'YYYY-MM-DD'
      const parsed = parseDateStr(v);
      if (!parsed) {
        // Cleared start — drop the start half but keep end if any
        const next = { ...(state.date || {}) };
        delete next.startDay; delete next.startMonth; delete next.startYear;
        if (Object.keys(next).length === 0) clearDate(); else setDate(next);
        return;
      }
      setDate({
        startYear: parsed.year,
        startMonth: parsed.year + '-' + parsed.monthRaw,
        startDay:   parsed.year + '-' + parsed.monthRaw + '-' + parsed.dayRaw,
      });
    });

    const endLabel = document.createElement('label');
    endLabel.className = 'fb-date-label';
    endLabel.textContent = t('engine.facebook.sec.datePosted.to');
    const endInput = document.createElement('input');
    endInput.type = 'date';
    endInput.className = 'fb-date-input';
    endInput.dir = 'ltr';
    endInput.value = state.date && state.date.endDay ? state.date.endDay : '';
    endInput.addEventListener('input', () => {
      const v = endInput.value;
      const parsed = parseDateStr(v);
      if (!parsed) {
        const next = { ...(state.date || {}) };
        delete next.endDay; delete next.endMonth; delete next.endYear;
        if (Object.keys(next).length === 0) clearDate(); else setDate(next);
        return;
      }
      setDate({
        endYear: parsed.year,
        endMonth: parsed.year + '-' + parsed.monthRaw,
        endDay:   parsed.year + '-' + parsed.monthRaw + '-' + parsed.dayRaw,
      });
    });

    row.appendChild(startLabel);
    row.appendChild(startInput);
    row.appendChild(endLabel);
    row.appendChild(endInput);
    wrap.appendChild(row);
    return wrap;
  }

  render();

  // Re-render whole form on language change so legends, options, hints,
  // placeholders all pick up the new language.
  if (lang && typeof lang.on === 'function') {
    lang.on(() => {
      host.setAttribute('aria-label', t('ui.fbForm.ariaLabel'));
      render();
    });
  }

  function refresh() { render(); }
  return { getState: () => state, reset, refresh };
}

function makeInitialState() {
  return {
    category: 'top',
    keyword: '',
    sections: {},
    toggles: {},
    ids: {},
    date: null,
  };
}

function makeEmptyDate() {
  return {};
}

// Parse 'YYYY-MM-DD' as the HTML5 date input emits it; return raw (un-padded)
// month and day strings to match Facebook's preferred form ('2019-1-1' rather
// than '2019-01-01').
function parseDateStr(s) {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const year = m[1];
  const monthRaw = String(parseInt(m[2], 10));
  const dayRaw   = String(parseInt(m[3], 10));
  return { year, monthRaw, dayRaw };
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c]);
}
