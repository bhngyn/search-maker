// InAnchor field — Arabic input, finds pages linked to by the specified anchor text.

/**
 * @param {import('../core/ctx.js').Ctx} ctx
 */
export function register(ctx) {
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
