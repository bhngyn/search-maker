// Excluded-words field — space-separated tokens prefixed with minus.

/**
 * @param {import('../core/ctx.js').Ctx} ctx
 */
export function register(ctx) {
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
