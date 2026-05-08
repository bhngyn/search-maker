// Exact-phrase field — always-quoted Arabic phrase input.

/**
 * @param {import('../core/ctx.js').Ctx} ctx
 */
export function register(ctx) {
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
