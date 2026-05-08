// Bootstrap for the Arabic Boolean Query Builder.
//
// Phase 5: the form is gone. The entire input UI is chip-based:
//   - chip-state.js       holds the canonical chip array and registers ONE
//                         segment with ctx that produces the assembled query
//   - chips/<type>.js     renders and assembles each chip type
//   - composer + drawer   commit chips from typed text or operator menus
//   - chip-area           subscribes to chip-state and renders the chip list
//
// Warnings and tips read from chip state via deps. Each module that needs
// to recompute on every preview update returns { onRender } and the
// bootstrap pushes that callback into postRenderHooks.

import './styles/tokens.css';
import './styles/base.css';
import './styles/chips.css';
import './styles/facebook.css';

import { createNormalizer } from './core/normalize.js';
import { createAssembler } from './core/assemble.js';
import { createWarnings } from './core/warnings.js';
import { createTips } from './core/tips.js';
import { createModeController } from './core/mode.js';
import { createPreview } from './core/preview.js';
import { createCtx } from './core/ctx.js';
import { createChipState } from './core/chip-state.js';
import { createEngineController } from './core/engine.js';

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
const facebookFormHost = document.getElementById('facebook-form');
const subtitleEl = document.getElementById('app-subtitle');
const toastEl = document.getElementById('toast');

// ===== Core state =====
const segments = [];

// ===== Core systems =====
// The engine controller is constructed first so every downstream consumer
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
// after createPreview can still push into it. `onResetHooks` is similar
// — chip-state pushes its `clear` callback after construction.
// `getQueryFragmentsRef` lets preview call into chip-state's fragment
// emitter once chip-state has been constructed (chip-state needs ctx,
// ctx needs preview, preview is constructed first — wire via a thunk).
const postRenderHooks = [];
const onResetHooks = [];
let chipStateRef = null;
let facebookFormHandle = null;
const preview = createPreview({
  previewBox, copyBtn, searchBtn, resetBtn, toastEl,
  assembleQuery, warnings, tips,
  postRenderHooks, onResetHooks,
  // Chip fragments only make sense for chip-based engines. For Facebook,
  // returning [] makes preview.js fall back to plain text rendering.
  getQueryFragments: () => {
    if (engine.getActive().id === 'facebook') return [];
    return chipStateRef ? chipStateRef.getQueryFragments() : [];
  },
  getSearchUrl: q => engine.getActive().searchUrl(q),
});

const ctx = createCtx({
  segments, normalize,
  requestUpdate: preview.render,
  warnings, tips, mode,
});

// ===== Chip state (the only segment producer in chip-only mode) =====
// Order=1 keeps the segment registry tidy; with no other producers, the
// number doesn't matter functionally but a low number is conventionally
// the "main content" slot.
const chipState = createChipState({ ctx, segmentOrder: 1 });
chipStateRef = chipState;

// Wire chip clearing into the global reset (second-tap branch).
onResetHooks.push(() => chipState.clear());

// ===== UI wiring =====
wireWelcomePanel();

// Selection store for multi-select (Advanced mode).
const chipSelection = createChipSelection();

let composerHandle = null;
const chipAreaHost = document.getElementById('chip-area');
const composerHost = document.getElementById('composer');
const chipToolbarHost = document.getElementById('chip-toolbar');
// chip-area is wired before the composer exists — pass a thunk that
// resolves the composer's focus method lazily so empty-state template
// cards can move focus to the composer once it's mounted.
if (chipAreaHost) wireChipArea({
  host: chipAreaHost,
  chipState,
  mode,
  selection: chipSelection,
  focusComposer: () => { if (composerHandle && composerHandle.focus) composerHandle.focus(); },
  onChipHighlight: id => preview.highlightChip(id),
  engine,
});
if (chipToolbarHost) wireChipToolbar({ host: chipToolbarHost, chipState, selection: chipSelection, mode });
if (composerHost) {
  composerHandle = wireComposer({ host: composerHost, chipState, engine });
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
  facebookFormHandle = wireFacebookForm({ host: facebookFormHost, engine: facebookEngine, ctx });
  // Reset hook clears the form state when the user taps "مسح الكل" twice.
  onResetHooks.push(() => facebookFormHandle.reset());
}

// ===== Engine-driven DOM strings =====
// Subtitle, search-button label, and empty-preview placeholder all live on
// the active engine descriptor. We push them into the static DOM here on
// boot, and re-push on every engine switch.
function applyEngineLabels() {
  const active = engine.getActive();
  if (subtitleEl && active.labels && active.labels.subtitle) {
    subtitleEl.textContent = active.labels.subtitle;
  }
  if (searchBtn && active.labels && active.labels.searchBtnLabel) {
    searchBtn.textContent = active.labels.searchBtnLabel;
  }
  // Toggle a body class so CSS can swap chip section ↔ Facebook form.
  ['google', 'x', 'facebook'].forEach(id => {
    document.body.classList.toggle('engine-' + id, active.id === id);
  });
  // Empty-preview placeholder lives on the engine; preview.js reads its
  // emptyMessage at construction time, so we push it onto preview each switch.
  if (preview && typeof preview.setEmptyMessage === 'function' && active.labels && active.labels.emptyPreview) {
    preview.setEmptyMessage(active.labels.emptyPreview);
  }
}
applyEngineLabels();

// On engine switch: re-apply DOM labels and re-render the preview so the
// assembled string reflects the new engine. chip-area, composer, and
// drawer each subscribe to engine.on() themselves to refresh their own
// surfaces.
engine.on(() => {
  applyEngineLabels();
  preview.render();
});

// Initial render — empty state shows muted placeholder; buttons disabled.
preview.render();
