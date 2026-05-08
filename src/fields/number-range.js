// Number-range field — LOW..HIGH with optional unit prefix.

/**
 * @param {import('../core/ctx.js').Ctx} ctx
 */
export function register(ctx) {
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
