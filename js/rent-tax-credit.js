/* 월세 세액공제 계산기 */
(function () {
  'use strict';
  var S = window.Site, $ = S.$;

  // ---- 상수 (귀속연도 기준. 매년 세법 개정 확인 후 갱신) ----
  var TAX_YEAR_LABEL = '2026년 귀속(2027년 초 연말정산) 기준 — 2024년 귀속부터 같은 요건 (2026년 9월 확인)';
  var INCOME_CAP = 80000000;        // 총급여 8,000만원 이하 (종합소득금액 7,000만원 이하)
  var INCOME_HIGH_RATE = 55000000;  // 총급여 5,500만원 이하면 높은 공제율
  var RATE_HIGH = 17, RATE_LOW = 15; // 공제율 (%)
  var RENT_CAP = 10000000;          // 연간 월세액 한도

  function readInput() {
    return { income: S.parseMoney($('income').value), rent: S.parseMoney($('rent').value), months: Math.min(12, Math.floor(S.parseNonNegative($('months').value)) || 0),
      homeless: $('homeless').checked, housing: $('housing').checked, moved: $('moved').checked };
  }
  var last = null;
  function render(i) {
    var annual = i.rent * i.months, eligible = Math.min(annual, RENT_CAP);
    var rate = i.income <= INCOME_HIGH_RATE ? RATE_HIGH : RATE_LOW;
    var reasons = [];
    if (i.income > INCOME_CAP) reasons.push('총급여가 ' + S.fmtKorean(INCOME_CAP) + '를 넘습니다');
    if (!i.homeless) reasons.push('무주택 세대주(또는 세대원) 요건 미확인');
    if (!i.housing) reasons.push('주택 요건(전용 85㎡ 이하 또는 기준시가 4억 이하) 미확인');
    if (!i.moved) reasons.push('임대차계약서 주소지로 전입신고 미확인');
    var ok = reasons.length === 0 && annual > 0;
    var credit = ok ? eligible * rate / 100 : 0;
    S.setText('out-credit', S.fmtWon(credit)); S.setText('sticky-monthly', S.fmtWon(credit) + '원');
    S.setText('out-annual', S.fmtWon(annual)); S.setText('out-eligible', S.fmtWon(eligible)); S.setText('out-rate', rate); S.setText('out-over', S.fmtWon(Math.max(0, annual - RENT_CAP)));
    S.setText('out-note', ok ? '연 월세 ' + S.fmtKorean(annual) + ' 중 한도 ' + S.fmtKorean(RENT_CAP) + ' 이내 ' + S.fmtKorean(eligible) + '에 공제율 ' + rate + '%를 적용했습니다. 실제 환급액은 산출세액 범위 안에서 결정되며, 이미 낸 세금이 적으면 공제액 전부를 돌려받지 못할 수 있습니다.'
      : (annual > 0 ? '공제 대상이 아니거나 요건 확인이 필요합니다: ' + reasons.join(', ') + '.' : '총급여와 월세를 입력하세요.'));
    S.setText('tax-year', TAX_YEAR_LABEL);
    last = { i: i, annual: annual, eligible: eligible, rate: rate, credit: credit, ok: ok };
  }
  S.ready(function () {
    S.wireCalc({
      key: 'rent-tax-credit',
      recalc: function () { render(readInput()); },
      share: function () { return { title: '월세 세액공제 계산 결과', text: '[월세 세액공제] 연 월세 ' + S.fmtWon(last.annual) + '원 · 공제율 ' + last.rate + '% → 예상 세액공제 ' + S.fmtWon(last.credit) + '원' }; },
      card: function () {
        return { file: 'rent-tax-credit-result', title: '월세 세액공제 계산기', kicker: '예상 세액공제액', big: S.fmtWon(last.credit), unit: '원',
          rows: [['총급여', S.fmtWon(last.i.income) + '원'], ['연 월세 납부액', S.fmtWon(last.annual) + '원'], ['공제 대상 월세 (한도 ' + S.fmtKorean(RENT_CAP) + ')', S.fmtWon(last.eligible) + '원'], ['공제율', last.rate + '%']],
          note: TAX_YEAR_LABEL + '. 산출세액 범위 내에서 공제되며 실제 환급액과 다를 수 있습니다.' };
      }
    });
  });
})();
