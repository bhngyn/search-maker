// Filetype field — dropdown selecting a file extension to restrict results.

/**
 * @param {import('../core/ctx.js').Ctx} ctx
 */
export function register(ctx) {
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
