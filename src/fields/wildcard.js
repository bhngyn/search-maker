// Wildcard field — Arabic input using * as a placeholder for any word, with optional quoting.

/**
 * @param {import('../core/ctx.js').Ctx} ctx
 */
export function register(ctx) {
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
