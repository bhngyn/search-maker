// Bootstrap for the chip-based query builder.
//
// Phase 5: the form is gone. The entire input UI is chip-based:
//   - chip-state.js       holds the canonical chip array and registers ONE
//                         segment with ctx that produces the assembled query
//   - chips/<type>.js     renders and assembles each chip type
//   - composer + drawer   commit chips from typed text or operator menus
//   - chip-area           subscribes to chip-state and renders the chip list
//
// Phase 6: i18n. Every Arabic literal lives in src/i18n/messages.js keyed
// by stable ID; the lang controller flips between Arabic and English and
// notifies every UI module that subscribes. Refresh resets to Arabic.

import './styles/tokens.css';
import './styles/base.css';
import './styles/chips.css';
import './styles/facebook.css';

import { createNormalizer } from './core/normalize.js';
import { createAssembler } from './core/assemble.js';
import { createWarnings } from './core/warnings.js';
import { createTips } from './core/tips.js';
import { createModeController } from './core/mode.js';
import { createLangController } from './core/lang.js';
import { createPreview } from './core/preview.js';
import { createCtx } from './core/ctx.js';
import { createChipState } from './core/chip-state.js';
import { createEngineController } from './core/engine.js';
import { t } from './i18n/messages.js';

import googleEngine from './engines/google.js';
import xEngine from './engines/x.js';
import facebookEngine from './engines/facebook.js';

import { wireWelcomePanel } from './ui/welcome.js';
import { wireTemplates } from './ui/templates.js';
import { wireNormalizeToggle } from './ui/normalize-toggle.js';
import { wireComposer } from './ui/composer.js';
import { wireChipArea, createChipSelection } from './ui/chip-area.js';
import { wireChipToolbar } from './ui/chip-toolbar.js';
import { wireDrawer } from './ui/drawer.js';
import { wireFacebookForm } from './ui/facebook-form.js';

import { warnings as warningModules } from './warnings/_registry.js';
import { tips as tipModules } from './tips/_registry.js';

// ===== DOM refs =====
const warningRegion = document.getElementById('warnings-region');
const tipRegion = document.getElementById('tips-region');
const previewBox = document.getElementById('preview-box');
const copyBtn = document.getElementById('copy-btn');
const searchBtn = document.getElementById('search-btn');
const resetBtn = document.getElementById('reset-btn');
const normalizeInput = document.getElementById('normalize-toggle-input');
const normalizeInfoBtn = document.getElementById('normalize-info-btn');
const normalizeInfoPanel = document.getElementById('normalize-info-panel');
const modeBtnBeginner = document.getElementById('mode-btn-beginner');
const modeBtnAdvanced = document.getElementById('mode-btn-advanced');
const engineBtnGoogle = document.getElementById('engine-btn-google');
const engineBtnX = document.getElementById('engine-btn-x');
const engineBtnFacebook = document.getElementById('engine-btn-facebook');
const langBtnAr = document.getElementById('lang-btn-ar');
const langBtnEn = document.getElementById('lang-btn-en');
const facebookFormHost = document.getElementById('facebook-form');
const subtitleEl = document.getElementById('app-subtitle');
const toastEl = document.getElementById('toast');

// Static-shell IDs (re-painted on every language change).
const titleEl = document.getElementById('app-title');
const titleMetaEl = document.getElementById('app-title-meta');
const engineGroup = document.getElementById('engine-toggle-group');
const modeGroup = document.getElementById('mode-toggle-group');
const langGroup = document.getElementById('lang-toggle-group');
const engineBtnXLabel = document.getElementById('engine-btn-x');
const normalizeLabelText = document.getElementById('normalize-label-text');
const welcomeBlurb = document.getElementById('welcome-blurb');
const welcomeCloseBtn = document.getElementById('welcome-close-btn');
const welcomeReopenBtn = document.getElementById('welcome-reopen-btn');
const chipSectionHeading = document.getElementById('chip-section-heading');
const previewHeading = document.getElementById('preview-heading');
const fbFormHeading = document.getElementById('facebook-form-heading');

// ===== Core state =====
const segments = [];

// ===== Core systems =====
// Engine controller is constructed first so every downstream consumer
// (keyword chip, composer pills, drawer items, preview search-URL, paste
// parser) can read the active engine descriptor lazily on every call.
const engine = createEngineController({
  btnGoogle: engineBtnGoogle,
  btnX: engineBtnX,
  btnFacebook: engineBtnFacebook,
  googleEngine,
  xEngine,
  facebookEngine,
});

// Language controller — singleton + listener fan-out, mirrors mode.js.
// Default 'ar' preserves the existing UX; English is opt-in per session.
const lang = createLangController({
  btnAr: langBtnAr,
  btnEn: langBtnEn,
  body: document.body,
  html: document.documentElement,
  initial: 'ar',
});

const normalize = createNormalizer(() => normalizeInput.checked);
const assembleSegments = createAssembler(segments);
// Engine-aware assembler: when Facebook is active, the form owns the URL and
// chip-state's segment is skipped (chips are hidden anyway). For Google/X
// the normal segment-joining path runs.
const assembleQuery = () => {
  const active = engine.getActive();
  if (active.id === 'facebook' && facebookFormHandle && typeof active.buildUrl === 'function') {
    return active.buildUrl(facebookFormHandle.getState());
  }
  return assembleSegments();
};
const warnings = createWarnings(warningRegion);

const mode = createModeController({
  btnBeginner: modeBtnBeginner,
  btnAdvanced: modeBtnAdvanced,
  body: document.body,
});

const tips = createTips(tipRegion, mode.get);
mode.on(() => tips.reflow());

// `postRenderHooks` is captured by reference so warnings/tips registered
// after createPreview can still push into it. `onResetHooks` is similar.
const postRenderHooks = [];
const onResetHooks = [];
let chipStateRef = null;
let facebookFormHandle = null;
const preview = createPreview({
  previewBox, copyBtn, searchBtn, resetBtn, toastEl,
  assembleQuery, warnings, tips,
  postRenderHooks, onResetHooks,
  getQueryFragments: () => {
    if (engine.getActive().id === 'facebook') return [];
    return chipStateRef ? chipStateRef.getQueryFragments() : [];
  },
  getSearchUrl: q => engine.getActive().searchUrl(q),
});

const ctx = createCtx({
  segments, normalize,
  requestUpdate: preview.render,
  warnings, tips, mode, lang,
});

// ===== Chip state (the only segment producer in chip-only mode) =====
const chipState = createChipState({ ctx, segmentOrder: 1 });
chipStateRef = chipState;

onResetHooks.push(() => chipState.clear());

// ===== UI wiring =====
wireWelcomePanel();

const chipSelection = createChipSelection();

let composerHandle = null;
const chipAreaHost = document.getElementById('chip-area');
const composerHost = document.getElementById('composer');
const chipToolbarHost = document.getElementById('chip-toolbar');
if (chipAreaHost) wireChipArea({
  host: chipAreaHost,
  chipState,
  mode,
  selection: chipSelection,
  focusComposer: () => { if (composerHandle && composerHandle.focus) composerHandle.focus(); },
  onChipHighlight: id => preview.highlightChip(id),
  engine,
  lang,
});
if (chipToolbarHost) wireChipToolbar({ host: chipToolbarHost, chipState, selection: chipSelection, mode, lang });
if (composerHost) {
  composerHandle = wireComposer({ host: composerHost, chipState, engine, lang });
  if (composerHandle.drawerTrigger) {
    wireDrawer({ trigger: composerHandle.drawerTrigger, chipState, mode, engine });
  }
}

wireTemplates({
  chipState,
  focusComposer: composerHandle ? composerHandle.focus : null,
});

wireNormalizeToggle({
  normalizeInput,
  infoBtn: normalizeInfoBtn,
  infoPanel: normalizeInfoPanel,
  onChange: preview.render,
});

// ===== Warnings + tips =====
[...warningModules, ...tipModules].forEach(mod => {
  if (typeof mod.register !== 'function') return;
  try {
    const out = mod.register(ctx, { previewBox, chipState });
    if (out && typeof out.onRender === 'function') {
      postRenderHooks.push(out.onRender);
    }
  } catch (e) {
    console.error('warning/tip register failed', e);
  }
});

// ===== Facebook form (mounted but only visible when engine === facebook) =====
if (facebookFormHost) {
  facebookFormHandle = wireFacebookForm({ host: facebookFormHost, engine: facebookEngine, ctx, lang });
  onResetHooks.push(() => facebookFormHandle.reset());
}

// ===== Engine-driven DOM strings =====
function applyEngineLabels() {
  const active = engine.getActive();
  if (subtitleEl && active.labels && active.labels.subtitle) {
    subtitleEl.textContent = t(active.labels.subtitle);
  }
  if (searchBtn && active.labels && active.labels.searchBtnLabel) {
    searchBtn.textContent = t(active.labels.searchBtnLabel);
  }
  ['google', 'x', 'facebook'].forEach(id => {
    document.body.classList.toggle('engine-' + id, active.id === id);
  });
  if (preview && typeof preview.setEmptyMessage === 'function' && active.labels && active.labels.emptyPreview) {
    preview.setEmptyMessage(t(active.labels.emptyPreview));
  }
}

// ===== Lang-driven DOM strings =====
// Painted on first boot AND on every language switch. Engine-driven labels
// are folded in here so the cascade stays simple: lang change → repaint
// shell + repaint engine labels → trigger preview re-render.
function applyLangLabels() {
  if (titleEl) titleEl.textContent = t('app.title');
  if (titleMetaEl) titleMetaEl.textContent = t('app.title');
  if (engineGroup) engineGroup.setAttribute('aria-label', t('app.engineToggleLabel'));
  if (modeGroup) modeGroup.setAttribute('aria-label', t('app.modeToggleLabel'));
  if (langGroup) langGroup.setAttribute('aria-label', t('app.langToggleLabel'));
  if (langBtnAr) langBtnAr.textContent = t('app.langArabic');
  if (langBtnEn) langBtnEn.textContent = t('app.langEnglish');
  if (modeBtnBeginner) modeBtnBeginner.textContent = t('app.modeBeginner');
  if (modeBtnAdvanced) modeBtnAdvanced.textContent = t('app.modeAdvanced');
  if (engineBtnXLabel) engineBtnXLabel.textContent = t('engine.x.label');
  if (normalizeLabelText) normalizeLabelText.textContent = t('app.normalizeLabel');
  if (normalizeInfoBtn) normalizeInfoBtn.title = t('app.normalizeInfoTitle');
  if (normalizeInfoPanel) normalizeInfoPanel.textContent = t('app.normalizeInfoBody');
  if (welcomeBlurb) welcomeBlurb.innerHTML = t('app.welcomeBlurbHtml');
  if (welcomeCloseBtn) {
    welcomeCloseBtn.textContent = t('app.welcomeCloseText');
    welcomeCloseBtn.setAttribute('aria-label', t('app.welcomeCloseLabel'));
  }
  if (welcomeReopenBtn) welcomeReopenBtn.textContent = t('app.welcomeReopen');
  if (chipSectionHeading) chipSectionHeading.textContent = t('app.chipSectionHeading');
  if (previewHeading) previewHeading.textContent = t('app.previewHeading');
  if (fbFormHeading) fbFormHeading.textContent = t('app.fbFormHeading');
  if (copyBtn) copyBtn.textContent = t('app.copyBtn');
  if (resetBtn) resetBtn.textContent = t('app.resetBtn');
  // Engine labels overlap with lang (subtitle, search-btn label, empty-preview).
  // Always re-apply — the engine's strings are themselves i18n keys.
  applyEngineLabels();
}
applyLangLabels();

lang.on(() => {
  applyLangLabels();
  preview.render();
  // Warnings/tips are recomputed on every preview render via postRenderHooks,
  // so calling preview.render() above is sufficient to re-emit their messages
  // in the new language.
});

// On engine switch: re-apply engine-driven labels and re-render the preview.
// chip-area, composer, drawer, and facebook-form each subscribe to engine.on()
// themselves to refresh their own surfaces.
engine.on(() => {
  applyEngineLabels();
  preview.render();
});

// Initial render — empty state shows muted placeholder; buttons disabled.
preview.render();
