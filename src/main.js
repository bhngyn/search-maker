// Bootstrap for the Arabic Boolean Query Builder.
//
// Phase 2: extracted core/ infrastructure into ES modules. The 14 field
// register* functions still live inline in this file — Phase 3 will move
// each into its own file under fields/.
//
// The integration seam is `ctx`, defined in core/ctx.js. Every register*
// function consumes ctx exclusively (no globals, no top-level state) and
// the bootstrap calls each function once after DOMContentLoaded — Vite
// schedules the module after DOM ready when the script tag is `defer`-loaded
// via `type="module"`.

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
import { wireCrossFieldWarnings } from './ui/cross-field-warnings.js';

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

// `postRenderHooks` is mutated below to register the cross-field check.
// createPreview captures the array by reference, so post-construction pushes
// take effect on subsequent renders.
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
// Phase 3 will extract each of these into its own file under fields/<slug>.js.
// They are reproduced verbatim from the pre-refactor index.html so behavior
// is byte-equivalent.

function registerFieldKeywords(ctx) {
  var input = document.getElementById('field-keywords-input');
  var quoteToggle = document.getElementById('field-keywords-quote');
  var clearBtn = document.getElementById('field-keywords-clear');

  function getValue() { return input.value.trim(); }

  function updateClearBtn() {
    if (input.value.length > 0) {
      clearBtn.removeAttribute('hidden');
    } else {
      clearBtn.setAttribute('hidden', '');
    }
  }

  function checkTips() {
    var v = getValue();
    if (v && quoteToggle.checked && /\s/.test(v)) {
      ctx.addTip('keywords-name-variants', {
        priority: 50,
        messageHtml: '💡 تلميح: الأسماء العربية لها كثير من التهجئات المختلفة (أ، إ، آ). يمكنك تفعيل «توحيد الأحرف العربية» في الأعلى ليشمل البحث هذه الاختلافات تلقائياً.'
      });
    } else {
      ctx.removeTip('keywords-name-variants');
    }

    if (v && !quoteToggle.checked) {
      ctx.addTip('keywords-no-restrictions', {
        priority: 20,
        messageHtml: '💡 تلميح: الكلمات الرئيسية وحدها قد تُعيد نتائج كثيرة جداً. فكّر في إضافة تقييد للموقع أو نطاق زمني لتضييق النتائج.'
      });
    } else {
      ctx.removeTip('keywords-no-restrictions');
    }
  }

  function checkSingleWordQuote() {
    var v = getValue();
    if (quoteToggle.checked && v && !(/\s/.test(v))) {
      ctx.addWarning('keywords-single-word-quote', '⚠️ تقييد كلمة واحدة بالاقتباس يُعطّل تصحيح التهجئة والمرادفات في Google. هذا مقصود أحياناً (للأسماء الخاصة أو المصطلحات التقنية)، لكنه غالباً غير ضروري.');
    } else {
      ctx.removeWarning('keywords-single-word-quote');
    }
  }

  ctx.registerField('keywords', {
    setValue: function(v) {
      input.value = v;
      updateClearBtn();
      ctx.requestUpdate();
    }
  });

  ctx.registerSegment(1, function() {
    var v = getValue();
    if (!v) return '';
    var normalized = ctx.normalize(v);
    return quoteToggle.checked ? ('"' + normalized + '"') : normalized;
  });

  input.addEventListener('input', function() {
    updateClearBtn();
    checkTips();
    checkSingleWordQuote();
    ctx.requestUpdate();
  });

  quoteToggle.addEventListener('change', function() {
    checkTips();
    checkSingleWordQuote();
    ctx.requestUpdate();
  });

  clearBtn.addEventListener('click', function() {
    input.value = '';
    quoteToggle.checked = false;
    updateClearBtn();
    checkTips();
    checkSingleWordQuote();
    ctx.requestUpdate();
    input.focus();
  });
}

function registerFieldExactPhrase(ctx) {
  var input = document.getElementById('field-exact-phrase-input');
  var clearBtn = document.getElementById('field-exact-phrase-clear');

  function getValue() { return input.value.trim(); }

  function updateClearBtn() {
    if (input.value.length > 0) {
      clearBtn.removeAttribute('hidden');
    } else {
      clearBtn.setAttribute('hidden', '');
    }
  }

  ctx.registerField('exact-phrase', {
    setValue: function(v) {
      input.value = v;
      updateClearBtn();
      ctx.requestUpdate();
    }
  });

  ctx.registerSegment(2, function() {
    var v = getValue();
    if (!v) return '';
    return '"' + ctx.normalize(v) + '"';
  });

  input.addEventListener('input', function() {
    updateClearBtn();
    ctx.requestUpdate();
  });

  clearBtn.addEventListener('click', function() {
    input.value = '';
    updateClearBtn();
    ctx.requestUpdate();
    input.focus();
  });
}

function registerFieldExcluded(ctx) {
  var input = document.getElementById('field-excluded-input');
  var clearBtn = document.getElementById('field-excluded-clear');

  function getValue() { return input.value.trim(); }

  function updateClearBtn() {
    if (input.value.length > 0) {
      clearBtn.removeAttribute('hidden');
    } else {
      clearBtn.setAttribute('hidden', '');
    }
  }

  ctx.registerField('excluded', {
    setValue: function(v) {
      input.value = v;
      updateClearBtn();
      ctx.requestUpdate();
    }
  });

  ctx.registerSegment(3, function() {
    var v = getValue();
    if (!v) return '';
    var tokens = v.split(/\s+/).filter(function(t) { return t.length > 0; });
    if (!tokens.length) return '';
    return tokens.map(function(t) { return '-' + ctx.normalize(t); }).join(' ');
  });

  input.addEventListener('input', function() {
    updateClearBtn();
    ctx.requestUpdate();
  });

  clearBtn.addEventListener('click', function() {
    input.value = '';
    updateClearBtn();
    ctx.requestUpdate();
    input.focus();
  });
}

function registerFieldSite(ctx) {
  var input = document.getElementById('field-site-input');
  var clearBtn = document.getElementById('field-site-clear');

  function getValue() { return input.value.trim(); }

  function updateClearBtn() {
    if (input.value.length > 0) {
      clearBtn.removeAttribute('hidden');
    } else {
      clearBtn.setAttribute('hidden', '');
    }
  }

  function checkArabicWarning() {
    var v = getValue();
    if (v && /[؀-ۿ]/.test(v)) {
      ctx.addWarning('site-arabic-chars', '⚠️ هذا الحقل يتوقع اسم نطاق أو عنوان URL بالأحرف اللاتينية. لن يتطابق Google مع النص العربي في عناوين المواقع.');
    } else {
      ctx.removeWarning('site-arabic-chars');
    }
  }

  ctx.registerField('site', {
    setValue: function(v) {
      input.value = v;
      updateClearBtn();
      checkArabicWarning();
      ctx.requestUpdate();
    }
  });

  ctx.registerSegment(4, function() {
    var v = getValue();
    if (!v) return '';
    return 'site:' + v;
  });

  input.addEventListener('input', function() {
    updateClearBtn();
    checkArabicWarning();
    ctx.requestUpdate();
  });

  clearBtn.addEventListener('click', function() {
    input.value = '';
    updateClearBtn();
    checkArabicWarning();
    ctx.requestUpdate();
    input.focus();
  });
}

function registerFieldIntitle(ctx) {
  var input = document.getElementById('field-intitle-input');
  var quoteToggle = document.getElementById('field-intitle-quote');
  var clearBtn = document.getElementById('field-intitle-clear');

  function getValue() { return input.value.trim(); }

  function updateClearBtn() {
    if (input.value.length > 0) {
      clearBtn.removeAttribute('hidden');
    } else {
      clearBtn.setAttribute('hidden', '');
    }
  }

  ctx.registerField('intitle', {
    setValue: function(v) {
      input.value = v;
      updateClearBtn();
      ctx.requestUpdate();
    }
  });

  ctx.registerSegment(5, function() {
    var v = getValue();
    if (!v) return '';
    var normalized = ctx.normalize(v);
    var wrapped = quoteToggle.checked ? ('"' + normalized + '"') : normalized;
    return 'intitle:' + wrapped;
  });

  input.addEventListener('input', function() {
    updateClearBtn();
    ctx.requestUpdate();
  });

  quoteToggle.addEventListener('change', function() {
    ctx.requestUpdate();
  });

  clearBtn.addEventListener('click', function() {
    input.value = '';
    quoteToggle.checked = false;
    updateClearBtn();
    ctx.requestUpdate();
    input.focus();
  });
}

function registerFieldInurl(ctx) {
  var input = document.getElementById('field-inurl-input');
  var clearBtn = document.getElementById('field-inurl-clear');

  function getValue() { return input.value.trim(); }

  function updateClearBtn() {
    if (input.value.length > 0) {
      clearBtn.removeAttribute('hidden');
    } else {
      clearBtn.setAttribute('hidden', '');
    }
  }

  function checkArabicWarning() {
    var v = getValue();
    if (v && /[؀-ۿ]/.test(v)) {
      ctx.addWarning('inurl-arabic-chars', '⚠️ هذا الحقل يتوقع جزءاً من عنوان URL بالأحرف اللاتينية. لن يتطابق Google مع النص العربي في عناوين الروابط.');
    } else {
      ctx.removeWarning('inurl-arabic-chars');
    }
  }

  ctx.registerField('inurl', {
    setValue: function(v) {
      input.value = v;
      updateClearBtn();
      checkArabicWarning();
      ctx.requestUpdate();
    }
  });

  ctx.registerSegment(6, function() {
    var v = getValue();
    if (!v) return '';
    return 'inurl:' + v;
  });

  input.addEventListener('input', function() {
    updateClearBtn();
    checkArabicWarning();
    ctx.requestUpdate();
  });

  clearBtn.addEventListener('click', function() {
    input.value = '';
    updateClearBtn();
    checkArabicWarning();
    ctx.requestUpdate();
    input.focus();
  });
}

function registerFieldIntext(ctx) {
  var input = document.getElementById('field-intext-input');
  var quoteToggle = document.getElementById('field-intext-quote');
  var clearBtn = document.getElementById('field-intext-clear');

  function getValue() { return input.value.trim(); }

  function updateClearBtn() {
    if (input.value.length > 0) {
      clearBtn.removeAttribute('hidden');
    } else {
      clearBtn.setAttribute('hidden', '');
    }
  }

  ctx.registerField('intext', {
    setValue: function(v) {
      input.value = v;
      updateClearBtn();
      ctx.requestUpdate();
    }
  });

  ctx.registerSegment(7, function() {
    var v = getValue();
    if (!v) return '';
    var normalized = ctx.normalize(v);
    return quoteToggle.checked ? ('intext:"' + normalized + '"') : ('intext:' + normalized);
  });

  input.addEventListener('input', function() {
    updateClearBtn();
    ctx.requestUpdate();
  });

  quoteToggle.addEventListener('change', function() {
    ctx.requestUpdate();
  });

  clearBtn.addEventListener('click', function() {
    input.value = '';
    quoteToggle.checked = false;
    updateClearBtn();
    ctx.requestUpdate();
    input.focus();
  });
}

function registerFieldInanchor(ctx) {
  var input = document.getElementById('field-inanchor-input');
  var quoteToggle = document.getElementById('field-inanchor-quote');
  var clearBtn = document.getElementById('field-inanchor-clear');

  function getValue() { return input.value.trim(); }

  function updateClearBtn() {
    if (input.value.length > 0) {
      clearBtn.removeAttribute('hidden');
    } else {
      clearBtn.setAttribute('hidden', '');
    }
  }

  ctx.registerField('inanchor', {
    setValue: function(v) {
      input.value = v;
      updateClearBtn();
      ctx.requestUpdate();
    }
  });

  ctx.registerSegment(8, function() {
    var v = getValue();
    if (!v) return '';
    var normalized = ctx.normalize(v);
    return quoteToggle.checked ? ('inanchor:"' + normalized + '"') : ('inanchor:' + normalized);
  });

  input.addEventListener('input', function() {
    updateClearBtn();
    ctx.requestUpdate();
  });

  quoteToggle.addEventListener('change', function() {
    ctx.requestUpdate();
  });

  clearBtn.addEventListener('click', function() {
    input.value = '';
    quoteToggle.checked = false;
    updateClearBtn();
    ctx.requestUpdate();
    input.focus();
  });
}

function registerFieldFiletype(ctx) {
  var select = document.getElementById('field-filetype-select');
  var clearBtn = document.getElementById('field-filetype-clear');

  function updateClearVisibility() {
    if (select.value !== '') {
      clearBtn.removeAttribute('hidden');
    } else {
      clearBtn.setAttribute('hidden', '');
    }
  }

  ctx.registerField('filetype', {
    setValue: function(v) {
      select.value = v || '';
      updateClearVisibility();
      ctx.requestUpdate();
    }
  });

  ctx.registerSegment(9, function() {
    var v = select.value;
    return v ? ('filetype:' + v) : '';
  });

  select.addEventListener('change', function() {
    updateClearVisibility();
    ctx.requestUpdate();
  });

  clearBtn.addEventListener('click', function() {
    select.value = '';
    updateClearVisibility();
    ctx.requestUpdate();
  });
}

function registerFieldDateRange(ctx) {
  var afterInput = document.getElementById('field-date-range-after');
  var beforeInput = document.getElementById('field-date-range-before');
  var clearBtn = document.getElementById('field-date-range-clear');

  function updateClearVisibility() {
    if (afterInput.value || beforeInput.value) {
      clearBtn.removeAttribute('hidden');
    } else {
      clearBtn.setAttribute('hidden', '');
    }
  }

  function checkDateWarning() {
    var after = afterInput.value;
    var before = beforeInput.value;
    if (after && before && after > before) {
      ctx.addWarning('date-range-reversed', 'النطاق الزمني مقلوب: تاريخ "بعد" أحدث من تاريخ "قبل"، مما يعني أن البحث لن يُعيد أي نتائج. يُرجى تصحيح الترتيب.');
    } else {
      ctx.removeWarning('date-range-reversed');
    }
  }

  function checkDateTip() {
    var after = afterInput.value;
    var before = beforeInput.value;
    if (after && before) {
      ctx.addTip('date-range-both', { priority: 60, messageHtml: '💡 النطاقات الزمنية الضيقة مع قيود الموقع فعّالة جداً للعثور على تغطية أحداث بعينها. جرّب دمج هذا النطاق مع حقل "عنوان الصفحة" للعثور على مقالات تتعلق بحدث محدد.' });
    } else {
      ctx.removeTip('date-range-both');
    }
  }

  ctx.registerField('date-range', {
    setValue: function(v) {
      if (!v || v === '') {
        afterInput.value = '';
        beforeInput.value = '';
      } else {
        if (v.after !== undefined) afterInput.value = v.after || '';
        if (v.before !== undefined) beforeInput.value = v.before || '';
      }
      updateClearVisibility();
      checkDateWarning();
      checkDateTip();
      ctx.requestUpdate();
    }
  });

  ctx.registerSegment(10, function() {
    var v = beforeInput.value;
    return v ? ('before:' + v) : '';
  });

  ctx.registerSegment(11, function() {
    var v = afterInput.value;
    return v ? ('after:' + v) : '';
  });

  function onInput() {
    updateClearVisibility();
    checkDateWarning();
    checkDateTip();
    ctx.requestUpdate();
  }

  afterInput.addEventListener('input', onInput);
  afterInput.addEventListener('change', onInput);
  beforeInput.addEventListener('input', onInput);
  beforeInput.addEventListener('change', onInput);

  clearBtn.addEventListener('click', function() {
    afterInput.value = '';
    beforeInput.value = '';
    updateClearVisibility();
    checkDateWarning();
    checkDateTip();
    ctx.requestUpdate();
  });
}

function registerFieldProximity(ctx) {
  var term1Input = document.getElementById('field-proximity-term1');
  var distanceInput = document.getElementById('field-proximity-distance');
  var term2Input = document.getElementById('field-proximity-term2');
  var clearBtn = document.getElementById('field-proximity-clear');

  function getTerm1() { return term1Input.value.trim(); }
  function getDistance() { return distanceInput.value.trim() || '5'; }
  function getTerm2() { return term2Input.value.trim(); }

  function isFilled() { return getTerm1().length > 0 && getTerm2().length > 0; }

  function updateClearBtn() {
    if (getTerm1().length > 0 || getTerm2().length > 0 || distanceInput.value !== '5') {
      clearBtn.removeAttribute('hidden');
    } else {
      clearBtn.setAttribute('hidden', '');
    }
  }

  function checkTip() {
    if (isFilled()) {
      ctx.addTip('proximity-usage', {
        priority: 60,
        messageHtml: '💡 تلميح: بحث القرب من أقوى أدوات OSINT لإيجاد شخصين أو كيانين يُذكران معاً. المسافات الصغيرة (3–5) تجد الذكر المباشر، بينما المسافات الأكبر (10–20) تجد أي علاقة سياقية.'
      });
    } else {
      ctx.removeTip('proximity-usage');
    }
  }

  ctx.registerField('proximity', {
    setValue: function(v) {
      if (!v || v === '') {
        term1Input.value = '';
        distanceInput.value = '5';
        term2Input.value = '';
      } else {
        if (v.term1 !== undefined) term1Input.value = v.term1;
        if (v.distance !== undefined) distanceInput.value = v.distance;
        if (v.term2 !== undefined) term2Input.value = v.term2;
      }
      updateClearBtn();
      checkTip();
      ctx.requestUpdate();
    }
  });

  ctx.registerSegment(12, function() {
    var t1 = getTerm1();
    var t2 = getTerm2();
    var n = parseInt(getDistance(), 10);
    if (!t1 || !t2) return '';
    if (isNaN(n) || n < 1) n = 5;
    if (n > 50) n = 50;
    var n1 = ctx.normalize(t1);
    var n2 = ctx.normalize(t2);
    return '"' + n1 + '" AROUND(' + n + ') "' + n2 + '"';
  });

  function handleInput() {
    updateClearBtn();
    checkTip();
    ctx.requestUpdate();
  }

  term1Input.addEventListener('input', handleInput);
  distanceInput.addEventListener('input', handleInput);
  term2Input.addEventListener('input', handleInput);

  clearBtn.addEventListener('click', function() {
    term1Input.value = '';
    distanceInput.value = '5';
    term2Input.value = '';
    updateClearBtn();
    checkTip();
    ctx.requestUpdate();
    term1Input.focus();
  });
}

function registerFieldWildcard(ctx) {
  var input = document.getElementById('field-wildcard-input');
  var quoteToggle = document.getElementById('field-wildcard-quote');
  var clearBtn = document.getElementById('field-wildcard-clear');

  function getValue() { return input.value.trim(); }

  function updateClearBtn() {
    if (input.value.length > 0) {
      clearBtn.removeAttribute('hidden');
    } else {
      clearBtn.setAttribute('hidden', '');
    }
  }

  function checkSingleWordQuote() {
    var v = getValue();
    if (quoteToggle.checked && v && !(/\s/.test(v))) {
      ctx.addWarning('wildcard-single-word-quote', '⚠️ تقييد كلمة واحدة بالاقتباس يُعطّل تصحيح التهجئة والمرادفات في Google. هذا مقصود أحياناً لكنه غالباً غير ضروري.');
    } else {
      ctx.removeWarning('wildcard-single-word-quote');
    }
  }

  ctx.registerField('wildcard', {
    setValue: function(v) {
      input.value = v || '';
      updateClearBtn();
      checkSingleWordQuote();
      ctx.requestUpdate();
    }
  });

  ctx.registerSegment(13, function() {
    var v = getValue();
    if (!v) return '';
    var normalized = ctx.normalize(v);
    return quoteToggle.checked ? ('"' + normalized + '"') : normalized;
  });

  input.addEventListener('input', function() {
    updateClearBtn();
    checkSingleWordQuote();
    ctx.requestUpdate();
  });

  quoteToggle.addEventListener('change', function() {
    checkSingleWordQuote();
    ctx.requestUpdate();
  });

  clearBtn.addEventListener('click', function() {
    input.value = '';
    quoteToggle.checked = false;
    updateClearBtn();
    checkSingleWordQuote();
    ctx.requestUpdate();
    input.focus();
  });
}

function registerFieldNumberRange(ctx) {
  var lowInput = document.getElementById('field-number-range-low');
  var highInput = document.getElementById('field-number-range-high');
  var prefixInput = document.getElementById('field-number-range-prefix');
  var clearBtn = document.getElementById('field-number-range-clear');

  function hasAnyValue() {
    return lowInput.value.trim() !== '' || highInput.value.trim() !== '' || prefixInput.value.trim() !== '';
  }

  function updateClearBtn() {
    if (hasAnyValue()) {
      clearBtn.removeAttribute('hidden');
    } else {
      clearBtn.setAttribute('hidden', '');
    }
  }

  ctx.registerField('number-range', {
    setValue: function(v) {
      if (!v || v === '') {
        lowInput.value = '';
        highInput.value = '';
        prefixInput.value = '';
      } else {
        lowInput.value = v.low !== undefined ? v.low : '';
        highInput.value = v.high !== undefined ? v.high : '';
        prefixInput.value = v.prefix !== undefined ? v.prefix : '';
      }
      updateClearBtn();
      ctx.requestUpdate();
    }
  });

  ctx.registerSegment(14, function() {
    var low = lowInput.value.trim();
    var high = highInput.value.trim();
    if (!low || !high) return '';
    var prefix = prefixInput.value.trim();
    if (prefix) {
      return prefix + low + '..' + prefix + high;
    }
    return low + '..' + high;
  });

  function onInput() {
    updateClearBtn();
    ctx.requestUpdate();
  }

  lowInput.addEventListener('input', onInput);
  highInput.addEventListener('input', onInput);
  prefixInput.addEventListener('input', onInput);

  clearBtn.addEventListener('click', function() {
    lowInput.value = '';
    highInput.value = '';
    prefixInput.value = '';
    updateClearBtn();
    ctx.requestUpdate();
  });
}

function registerFieldOrGroups(ctx) {
  var input = document.getElementById('field-or-groups-input');
  var clearBtn = document.getElementById('field-or-groups-clear');

  function tokenize(raw) {
    var parts = raw.split(/\s*(?:,|\bأو\b)\s*/);
    var seen = Object.create(null);
    var result = [];
    for (var i = 0; i < parts.length; i++) {
      var t = parts[i].trim();
      if (t && !seen[t]) {
        seen[t] = true;
        result.push(t);
      }
    }
    return result;
  }

  function updateClearBtn() {
    if (input.value.length > 0) {
      clearBtn.removeAttribute('hidden');
    } else {
      clearBtn.setAttribute('hidden', '');
    }
  }

  ctx.registerField('or-groups', {
    setValue: function(v) {
      input.value = v || '';
      updateClearBtn();
      ctx.requestUpdate();
    }
  });

  ctx.registerSegment(15, function() {
    var raw = input.value.trim();
    if (!raw) return '';
    var tokens = tokenize(raw);
    if (tokens.length < 2) return '';
    var normalized = [];
    for (var i = 0; i < tokens.length; i++) {
      normalized.push(ctx.normalize(tokens[i]));
    }
    return '(' + normalized.join(' OR ') + ')';
  });

  input.addEventListener('input', function() {
    updateClearBtn();
    ctx.requestUpdate();
  });

  clearBtn.addEventListener('click', function() {
    input.value = '';
    updateClearBtn();
    ctx.requestUpdate();
    input.focus();
  });
}

// ===== Bootstrap =====
const fieldRegistrations = [
  registerFieldKeywords,
  registerFieldExactPhrase,
  registerFieldExcluded,
  registerFieldSite,
  registerFieldIntitle,
  registerFieldInurl,
  registerFieldIntext,
  registerFieldInanchor,
  registerFieldFiletype,
  registerFieldDateRange,
  registerFieldProximity,
  registerFieldWildcard,
  registerFieldNumberRange,
  registerFieldOrGroups,
];

fieldRegistrations.forEach(fn => {
  try { fn(ctx); } catch (e) { console.error('register fn failed', fn.name, e); }
});

// Cross-field warnings + tips. Wired AFTER the field registrations so the
// per-field DOM ids exist. Pushes into postRenderHooks so globalChecks runs
// after every preview update.
const crossField = wireCrossFieldWarnings({ ctx, previewBox });
postRenderHooks.push(crossField.globalChecks);

// Initial render — empty state, but wires up disabled buttons + placeholder.
preview.render();
