// Proximity field — AROUND(N) builder with two terms and distance.

/**
 * @param {import('../core/ctx.js').Ctx} ctx
 */
export function register(ctx) {
  var term1Input = document.getElementById('field-proximity-term1');
  var distanceInput = document.getElementById('field-proximity-distance');
  var term2Input = document.getElementById('field-proximity-term2');
  var clearBtn = document.getElementById('field-proximity-clear');

  function getTerm1() { return term1Input.value.trim(); }
  function getDistance() { return distanceInput.value.trim() || '5'; }
  function getTerm2() { return term2Input.value.trim(); }

  function isFilled() { return getTerm1().length > 0 && getTerm2().length > 0; }

  function updateClearBtn() {
    if (getTerm1().length > 0 || getTerm2().length > 0 || distanceInput.value !== '5') {
      clearBtn.removeAttribute('hidden');
    } else {
      clearBtn.setAttribute('hidden', '');
    }
  }

  function checkTip() {
    if (isFilled()) {
      ctx.addTip('proximity-usage', {
        priority: 60,
        messageHtml: '💡 تلميح: بحث القرب من أقوى أدوات OSINT لإيجاد شخصين أو كيانين يُذكران معاً. المسافات الصغيرة (3–5) تجد الذكر المباشر، بينما المسافات الأكبر (10–20) تجد أي علاقة سياقية.'
      });
    } else {
      ctx.removeTip('proximity-usage');
    }
  }

  ctx.registerField('proximity', {
    setValue: function(v) {
      if (!v || v === '') {
        term1Input.value = '';
        distanceInput.value = '5';
        term2Input.value = '';
      } else {
        if (v.term1 !== undefined) term1Input.value = v.term1;
        if (v.distance !== undefined) distanceInput.value = v.distance;
        if (v.term2 !== undefined) term2Input.value = v.term2;
      }
      updateClearBtn();
      checkTip();
      ctx.requestUpdate();
    }
  });

  ctx.registerSegment(12, function() {
    var t1 = getTerm1();
    var t2 = getTerm2();
    var n = parseInt(getDistance(), 10);
    if (!t1 || !t2) return '';
    if (isNaN(n) || n < 1) n = 5;
    if (n > 50) n = 50;
    var n1 = ctx.normalize(t1);
    var n2 = ctx.normalize(t2);
    return '"' + n1 + '" AROUND(' + n + ') "' + n2 + '"';
  });

  function handleInput() {
    updateClearBtn();
    checkTip();
    ctx.requestUpdate();
  }

  term1Input.addEventListener('input', handleInput);
  distanceInput.addEventListener('input', handleInput);
  term2Input.addEventListener('input', handleInput);

  clearBtn.addEventListener('click', function() {
    term1Input.value = '';
    distanceInput.value = '5';
    term2Input.value = '';
    updateClearBtn();
    checkTip();
    ctx.requestUpdate();
    term1Input.focus();
  });
}
