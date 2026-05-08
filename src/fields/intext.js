// InText field — Arabic input, requires term in page body, with optional exact-phrase quoting.

/**
 * @param {import('../core/ctx.js').Ctx} ctx
 */
export function register(ctx) {
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
