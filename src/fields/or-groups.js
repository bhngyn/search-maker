// OR-groups field — comma/أو-separated alternatives joined as (a OR b OR c).

/**
 * @param {import('../core/ctx.js').Ctx} ctx
 */
export function register(ctx) {
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
