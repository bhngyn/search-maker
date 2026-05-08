// Date-range field — before:/after: pair with reversed-range warning.

/**
 * @param {import('../core/ctx.js').Ctx} ctx
 */
export function register(ctx) {
  var afterInput = document.getElementById('field-date-range-after');
  var beforeInput = document.getElementById('field-date-range-before');
  var clearBtn = document.getElementById('field-date-range-clear');

  function updateClearVisibility() {
    if (afterInput.value || beforeInput.value) {
      clearBtn.removeAttribute('hidden');
    } else {
      clearBtn.setAttribute('hidden', '');
    }
  }

  function checkDateWarning() {
    var after = afterInput.value;
    var before = beforeInput.value;
    if (after && before && after > before) {
      ctx.addWarning('date-range-reversed', 'النطاق الزمني مقلوب: تاريخ "بعد" أحدث من تاريخ "قبل"، مما يعني أن البحث لن يُعيد أي نتائج. يُرجى تصحيح الترتيب.');
    } else {
      ctx.removeWarning('date-range-reversed');
    }
  }

  function checkDateTip() {
    var after = afterInput.value;
    var before = beforeInput.value;
    if (after && before) {
      ctx.addTip('date-range-both', { priority: 60, messageHtml: '💡 النطاقات الزمنية الضيقة مع قيود الموقع فعّالة جداً للعثور على تغطية أحداث بعينها. جرّب دمج هذا النطاق مع حقل "عنوان الصفحة" للعثور على مقالات تتعلق بحدث محدد.' });
    } else {
      ctx.removeTip('date-range-both');
    }
  }

  ctx.registerField('date-range', {
    setValue: function(v) {
      if (!v || v === '') {
        afterInput.value = '';
        beforeInput.value = '';
      } else {
        if (v.after !== undefined) afterInput.value = v.after || '';
        if (v.before !== undefined) beforeInput.value = v.before || '';
      }
      updateClearVisibility();
      checkDateWarning();
      checkDateTip();
      ctx.requestUpdate();
    }
  });

  ctx.registerSegment(10, function() {
    var v = beforeInput.value;
    return v ? ('before:' + v) : '';
  });

  ctx.registerSegment(11, function() {
    var v = afterInput.value;
    return v ? ('after:' + v) : '';
  });

  function onInput() {
    updateClearVisibility();
    checkDateWarning();
    checkDateTip();
    ctx.requestUpdate();
  }

  afterInput.addEventListener('input', onInput);
  afterInput.addEventListener('change', onInput);
  beforeInput.addEventListener('input', onInput);
  beforeInput.addEventListener('change', onInput);

  clearBtn.addEventListener('click', function() {
    afterInput.value = '';
    beforeInput.value = '';
    updateClearVisibility();
    checkDateWarning();
    checkDateTip();
    ctx.requestUpdate();
  });
}
