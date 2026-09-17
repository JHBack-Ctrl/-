/* 중도상환수수료 계산기 */
(function () {
  'use strict';
  var S = window.Site, $ = S.$;
  var DEFAULT_FEE_RATE = 1.2, DEFAULT_PERIOD = 36; // 수수료율 예시(%), 부과 기간(개월)

  function readInput() {
    return { amount: S.parseMoney($('amount').value), feeRate: S.parseNonNegative($('feeRate').value), start: S.parseDate($('start').value), pay: S.parseDate($('pay').value),
      period: Math.floor(S.parseNonNegative($('period').value)) || 0 };
  }
  var last = null;
  function render(i) {
    var fee = 0, remain = 0, total = 0, exempt = null, note = '';
    if (i.start && i.period > 0) {
      exempt = S.addMonths(i.start, i.period);
      total = S.daysBetween(i.start, exempt);
      var pay = i.pay || S.today();
      remain = Math.max(0, S.daysBetween(pay, exempt));
      if (pay < i.start) { remain = total; note = '상환일이 대출 실행일보다 앞섭니다. 날짜를 확인하세요.'; }
      fee = total > 0 ? i.amount * i.feeRate / 100 * remain / total : 0;
    }
    S.setText('out-fee', S.fmtWon(fee)); S.setText('sticky-monthly', S.fmtWon(fee) + '원');
    S.setText('out-remain', remain + '일'); S.setText('out-total', total + '일'); S.setText('out-ratio', total > 0 ? S.fmtPct(remain / total * 100) : '0.00');
    S.setText('out-exempt', exempt ? S.fmtDate(exempt) : '—');
    S.setText('out-formula', i.amount > 0 && total > 0 ? S.fmtWon(i.amount) + '원 × ' + S.fmtRate(i.feeRate) + '% × (' + remain + '일 ÷ ' + total + '일)' : '');
    S.setText('out-note', note || (i.amount > 0 && i.start ? (remain === 0 ? '부과 기간이 지나 중도상환수수료가 없습니다. 면제일 ' + S.fmtDate(exempt) + '.' : '면제일 ' + S.fmtDate(exempt) + '까지 ' + remain + '일 남았습니다. 약정서의 수수료율과 부과 기간이 다르면 그 값을 넣으세요.') : '상환금액, 수수료율, 대출 실행일을 입력하세요.'));
    last = { i: i, fee: fee, remain: remain, total: total, exempt: exempt };
  }
  S.ready(function () {
    $('feeRate').value = DEFAULT_FEE_RATE.toFixed(1); $('period').value = DEFAULT_PERIOD; $('pay').value = S.fmtDate(S.today());
    S.wireCalc({
      key: 'prepayment',
      recalc: function () { render(readInput()); },
      share: function () { return { title: '중도상환수수료 계산 결과', text: '[중도상환수수료] ' + S.fmtWon(last.i.amount) + '원 상환 · 수수료율 ' + S.fmtRate(last.i.feeRate) + '% · 잔여 ' + last.remain + '일 → ' + S.fmtWon(last.fee) + '원' }; },
      card: function () {
        return { file: 'prepayment-result', title: '중도상환수수료 계산기', kicker: '예상 중도상환수수료', big: S.fmtWon(last.fee), unit: '원',
          rows: [['상환금액', S.fmtWon(last.i.amount) + '원'], ['수수료율', S.fmtRate(last.i.feeRate) + '%'], ['잔여일수 / 부과기간', last.remain + '일 / ' + last.total + '일'], ['수수료 면제일', last.exempt ? S.fmtDate(last.exempt) : '—']],
          note: '수수료 = 상환금액 × 수수료율 × 잔여일수 ÷ 부과기간 일수. 약정서 조건이 우선합니다.' };
      }
    });
  });
})();
