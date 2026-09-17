/* 서식 페이지 공용: 입력 → 미리보기, 복사, 인쇄. 저장하지 않는다. */
(function () {
  'use strict';
  var S = window.Site, $ = S.$, $$ = S.$$;
  function fill() {
    $$('[data-from]').forEach(function (el) {
      var src = $(el.getAttribute('data-from')); if (!src) return;
      var v = src.value;
      if (src.hasAttribute('data-money')) v = S.parseMoney(v) > 0 ? S.fmtWon(S.parseMoney(v)) + '원' : '';
      el.textContent = v || el.getAttribute('data-blank') || '______';
    });
    var amt = $('amount'), kor = $('amount-korean');
    if (amt && kor) { var n = S.parseMoney(amt.value); kor.textContent = n > 0 ? '(' + S.fmtKorean(n) + ')' : ''; }
  }
  S.ready(function () {
    if ($('form-inputs')) {
      S.bindMoneyInputs(document, fill);
      $$('#form-inputs input, #form-inputs select, #form-inputs textarea').forEach(function (el) { el.addEventListener('input', fill); el.addEventListener('change', fill); });
      var d = $('date'); if (d && !d.value) d.value = S.fmtDate(S.today());
      fill();
    }
    $$('[data-copy]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var t = $(btn.getAttribute('data-copy')); if (!t) return;
        S.copyText(t.innerText || t.textContent).then(function () { S.toast('복사했습니다'); }).catch(function () { S.toast('복사에 실패했습니다'); });
      });
    });
    $$('[data-print]').forEach(function (btn) { btn.addEventListener('click', function () { window.print(); }); });
  });
})();
