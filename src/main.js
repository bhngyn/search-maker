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

import { createNormalizer } from './core/normalize.js';
import { createAssembler } from './core/assemble.js';
import { createWarnings } from './core/warnings.js';
import { createTips } from './core/tips.js';
import { createModeController } from './core/mode.js';
import { createPreview } from './core/preview.js';
import { createCtx } from './core/ctx.js';
import { createChipState } from './core/chip-state.js';

import { wireWelcomePanel } from './ui/welcome.js';
import { wireTemplates } from './ui/templates.js';
import { wireNormalizeToggle } from './ui/normalize-toggle.js';
import { wireComposer } from './ui/composer.js';
import { wireChipArea, createChipSelection } from './ui/chip-area.js';
import { wireChipToolbar } from './ui/chip-toolbar.js';
import { wireDrawer } from './ui/drawer.js';

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
const toastEl = document.getElementById('toast');

// ===== Core state =====
const segments = [];
const fieldRegistry = new Map(); // empty in chip-only mode; reset still iterates it (a no-op).

// ===== Core systems =====
const normalize = createNormalizer(() => normalizeInput.checked);
const assembleQuery = createAssembler(segments);
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
const postRenderHooks = [];
const onResetHooks = [];
const preview = createPreview({
  previewBox, copyBtn, searchBtn, resetBtn, toastEl,
  assembleQuery, fieldRegistry, warnings, tips,
  postRenderHooks, onResetHooks,
});

const ctx = createCtx({
  segments, fieldRegistry, normalize,
  requestUpdate: preview.render,
  warnings, tips, mode,
});

// ===== Chip state (the only segment producer in chip-only mode) =====
// Order=1 keeps the segment registry tidy; with no other producers, the
// number doesn't matter functionally but a low number is conventionally
// the "main content" slot.
const chipState = createChipState({ ctx, segmentOrder: 1 });

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
});
if (chipToolbarHost) wireChipToolbar({ host: chipToolbarHost, chipState, selection: chipSelection, mode });
if (composerHost) {
  composerHandle = wireComposer({ host: composerHost, chipState });
  if (composerHandle.drawerTrigger) {
    wireDrawer({ trigger: composerHandle.drawerTrigger, chipState, mode });
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

// Initial render — empty state shows muted placeholder; buttons disabled.
preview.render();
