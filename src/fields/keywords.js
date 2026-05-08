// Keywords field — main free-text Arabic search input.

/**
 * @param {import('../core/ctx.js').Ctx} ctx
 */
export function register(ctx) {
  var input = document.getElementById('field-keywords-input');
  var quoteToggle = document.getElementById('field-keywords-quote');
  var clearBtn = document.getElementById('field-keywords-clear');

  function getValue() { return input.value.trim(); }

  function updateClearBtn() {
    if (input.value.length > 0) {
      clearBtn.removeAttribute('hidden');
    } else {
      clearBtn.setAttribute('hidden', '');
    }
  }

  function checkTips() {
    var v = getValue();
    if (v && quoteToggle.checked && /\s/.test(v)) {
      ctx.addTip('keywords-name-variants', {
        priority: 50,
        messageHtml: '💡 تلميح: الأسماء العربية لها كثير من التهجئات المختلفة (أ، إ، آ). يمكنك تفعيل «توحيد الأحرف العربية» في الأعلى ليشمل البحث هذه الاختلافات تلقائياً.'
      });
    } else {
      ctx.removeTip('keywords-name-variants');
    }

    if (v && !quoteToggle.checked) {
      ctx.addTip('keywords-no-restrictions', {
        priority: 20,
        messageHtml: '💡 تلميح: الكلمات الرئيسية وحدها قد تُعيد نتائج كثيرة جداً. فكّر في إضافة تقييد للموقع أو نطاق زمني لتضييق النتائج.'
      });
    } else {
      ctx.removeTip('keywords-no-restrictions');
    }
  }

  function checkSingleWordQuote() {
    var v = getValue();
    if (quoteToggle.checked && v && !(/\s/.test(v))) {
      ctx.addWarning('keywords-single-word-quote', '⚠️ تقييد كلمة واحدة بالاقتباس يُعطّل تصحيح التهجئة والمرادفات في Google. هذا مقصود أحياناً (للأسماء الخاصة أو المصطلحات التقنية)، لكنه غالباً غير ضروري.');
    } else {
      ctx.removeWarning('keywords-single-word-quote');
    }
  }

  ctx.registerField('keywords', {
    setValue: function(v) {
      input.value = v;
      updateClearBtn();
      ctx.requestUpdate();
    }
  });

  ctx.registerSegment(1, function() {
    var v = getValue();
    if (!v) return '';
    var normalized = ctx.normalize(v);
    return quoteToggle.checked ? ('"' + normalized + '"') : normalized;
  });

  input.addEventListener('input', function() {
    updateClearBtn();
    checkTips();
    checkSingleWordQuote();
    ctx.requestUpdate();
  });

  quoteToggle.addEventListener('change', function() {
    checkTips();
    checkSingleWordQuote();
    ctx.requestUpdate();
  });

  clearBtn.addEventListener('click', function() {
    input.value = '';
    quoteToggle.checked = false;
    updateClearBtn();
    checkTips();
    checkSingleWordQuote();
    ctx.requestUpdate();
    input.focus();
  });
}
