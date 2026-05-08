// Site field — Latin-only domain restriction (site:VALUE).

/**
 * @param {import('../core/ctx.js').Ctx} ctx
 */
export function register(ctx) {
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
