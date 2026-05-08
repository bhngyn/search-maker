// InURL field — Latin LTR input, finds terms in URLs.

/**
 * @param {import('../core/ctx.js').Ctx} ctx
 */
export function register(ctx) {
  var input = document.getElementById('field-inurl-input');
  var clearBtn = document.getElementById('field-inurl-clear');

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
      ctx.addWarning('inurl-arabic-chars', '⚠️ هذا الحقل يتوقع جزءاً من عنوان URL بالأحرف اللاتينية. لن يتطابق Google مع النص العربي في عناوين الروابط.');
    } else {
      ctx.removeWarning('inurl-arabic-chars');
    }
  }

  ctx.registerField('inurl', {
    setValue: function(v) {
      input.value = v;
      updateClearBtn();
      checkArabicWarning();
      ctx.requestUpdate();
    }
  });

  ctx.registerSegment(6, function() {
    var v = getValue();
    if (!v) return '';
    return 'inurl:' + v;
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
