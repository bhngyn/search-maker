// Bootstrap for the Arabic Boolean Query Builder.
//
// Phase 3: every field, warning, and tip lives in its own module. This file
// just wires DOM refs into core systems, builds `ctx`, and iterates the
// registries. Adding a new field/warning/tip means writing one new file and
// adding one import line in the corresponding _registry.js.

import './styles/tokens.css';
import './styles/base.css';
import './styles/fields.css';

import { createNormalizer } from './core/normalize.js';
import { createAssembler } from './core/assemble.js';
import { createWarnings } from './core/warnings.js';
import { createTips } from './core/tips.js';
import { createModeController } from './core/mode.js';
import { createPreview } from './core/preview.js';
import { createCtx } from './core/ctx.js';

import { wireWelcomePanel } from './ui/welcome.js';
import { wireMoreOptions } from './ui/disclosure.js';
import { wireTemplates } from './ui/templates.js';
import { wireNormalizeToggle } from './ui/normalize-toggle.js';

import { fields } from './fields/_registry.js';
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
const fieldRegistry = new Map();

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

// `postRenderHooks` is captured by reference; cross-field warnings push
// onto it after registration so their checks run on every preview update.
const postRenderHooks = [];
const preview = createPreview({
  previewBox, copyBtn, searchBtn, resetBtn, toastEl,
  assembleQuery, fieldRegistry, warnings, tips,
  postRenderHooks,
});

const ctx = createCtx({
  segments, fieldRegistry, normalize,
  requestUpdate: preview.render,
  warnings, tips, mode,
});

// ===== UI wiring =====
wireWelcomePanel();
const disclosure = wireMoreOptions();
wireTemplates({
  ctx,
  setAdvancedRevealed: disclosure ? disclosure.setRevealed : null,
});
wireNormalizeToggle({
  normalizeInput,
  infoBtn: normalizeInfoBtn,
  infoPanel: normalizeInfoPanel,
  onChange: preview.render,
});

// ===== Field registrations =====
fields.forEach(mod => {
  if (typeof mod.register === 'function') {
    try { mod.register(ctx); } catch (e) { console.error('field register failed', e); }
  }
});

// ===== Warnings + tips =====
// Each module's register() may return { onRender } if it needs to recompute
// after every preview update (e.g. query-too-long, over-restricted).
[...warningModules, ...tipModules].forEach(mod => {
  if (typeof mod.register !== 'function') return;
  try {
    const out = mod.register(ctx, { previewBox });
    if (out && typeof out.onRender === 'function') {
      postRenderHooks.push(out.onRender);
    }
  } catch (e) {
    console.error('warning/tip register failed', e);
  }
});

// Initial render — empty state, but wires up disabled buttons + placeholder.
preview.render();
