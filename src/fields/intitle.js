// Intitle field — Arabic page-title restriction (intitle:VALUE).

/**
 * @param {import('../core/ctx.js').Ctx} ctx
 */
export function register(ctx) {
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
