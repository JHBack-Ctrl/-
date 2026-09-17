/* 대출이자 계산기: 원리금균등 / 원금균등 / 만기일시 */
(function () {
  'use strict';
  var S = window.Site, $ = S.$;
  var DEFAULT_RATE = 4.5, DEFAULT_MONTHS = 24;
  var PRESETS = { deposit: { principal: 50000000, rate: 4.5, months: 24, grace: 0 }, jeonse: { principal: 200000000, rate: 3.8, months: 24, grace: 24 } };
  var METHOD_NAME = { annuity: '원리금균등', principal: '원금균등', bullet: '만기일시' };

  function schedule(P, annualRate, n, grace, method) {
    var r = annualRate / 12 / 100, rows = [], bal = P, totalInt = 0, totalPay = 0;
    if (P <= 0 || n <= 0) return { rows: rows, totalInterest: 0, totalPay: 0 };
    grace = method === 'bullet' ? 0 : Math.min(Math.max(0, grace), n - 1);
    var amortN = n - grace, annuityPay = 0;
    if (method === 'annuity') annuityPay = r > 0 ? P * r * Math.pow(1 + r, amortN) / (Math.pow(1 + r, amortN) - 1) : P / amortN;
    for (var k = 1; k <= n; k++) {
      var interest = bal * r, principal = 0;
      if (k <= grace) principal = 0;
      else if (method === 'annuity') principal = annuityPay - interest;
      else if (method === 'principal') principal = P / amortN;
      else principal = k === n ? bal : 0;
      if (k === n) principal = bal;
      bal = Math.max(0, bal - principal);
      var pay = principal + interest; totalInt += interest; totalPay += pay;
      rows.push({ n: k, pay: pay, principal: principal, interest: interest, balance: bal });
    }
    return { rows: rows, totalInterest: totalInt, totalPay: totalPay };
  }
  window.LoanSchedule = schedule; // 다른 계산기(DSR)에서 재사용

  function readInput() {
    var m = document.querySelector('input[name="method"]:checked');
    return { principal: S.parseMoney($('principal').value), rate: S.parseNonNegative($('rate').value),
      months: Math.floor(S.parseNonNegative($('months').value)) || 0, grace: Math.floor(S.parseNonNegative($('grace').value)) || 0, method: m ? m.value : 'annuity' };
  }
  var last = null;
  function render(i) {
    var s = schedule(i.principal, i.rate, i.months, i.grace, i.method), first = s.rows.length ? s.rows[0].pay : 0, n = s.rows.length || 1;
    S.setText('out-kicker', METHOD_NAME[i.method] + ' · 첫 달 상환액');
    S.setText('out-first', S.fmtWon(first)); S.setText('sticky-monthly', S.fmtWon(first));
    S.setText('out-interest', S.fmtWon(s.totalInterest)); S.setText('out-total', S.fmtWon(s.totalPay));
    S.setText('out-avg-int', S.fmtWon(s.totalInterest / n)); S.setText('out-avg-pay', S.fmtWon(s.totalPay / n));
    S.setText('out-note', i.principal > 0
      ? '대출 ' + S.fmtKorean(i.principal) + ', 연 ' + S.fmtRate(i.rate) + '%, ' + i.months + '개월' + (i.grace && i.method !== 'bullet' ? ', 거치 ' + Math.min(i.grace, i.months - 1) + '개월' : '') + '. 총 이자 ' + S.fmtKorean(s.totalInterest) + '.'
      : '대출금액을 입력하면 바로 계산됩니다.');
    ['annuity', 'principal', 'bullet'].forEach(function (m) {
      var x = schedule(i.principal, i.rate, i.months, i.grace, m), key = { annuity: 'an', principal: 'pr', bullet: 'bu' }[m];
      S.setText('c-' + key + '-first', S.fmtWon(x.rows.length ? x.rows[0].pay : 0));
      S.setText('c-' + key + '-last', S.fmtWon(x.rows.length ? x.rows[x.rows.length - 1].pay : 0));
      S.setText('c-' + key + '-int', S.fmtWon(x.totalInterest));
    });
    var html = [];
    s.rows.forEach(function (row) {
      html.push('<tr' + (row.n % 12 === 0 ? ' class="year"' : '') + '><td>' + row.n + '</td><td>' + S.fmtWon(row.pay) + '</td><td>' + S.fmtWon(row.principal) + '</td><td>' + S.fmtWon(row.interest) + '</td><td>' + S.fmtWon(row.balance) + '</td></tr>');
    });
    $('schedule').querySelector('tbody').innerHTML = html.join('') || '<tr><td colspan="5" class="na">대출금액과 기간을 입력하세요.</td></tr>';
    last = { i: i, s: s, first: first };
  }

  S.ready(function () {
    S.wireCalc({
      key: 'loan',
      recalc: function () { render(readInput()); },
      preset: function (name) {
        if (name === 'clear') { $('principal').value = ''; $('rate').value = DEFAULT_RATE; $('months').value = DEFAULT_MONTHS; $('grace').value = 0; return; }
        var p = PRESETS[name]; S.setMoney('principal', p.principal); $('rate').value = p.rate; $('months').value = p.months; $('grace').value = p.grace;
      },
      share: function () {
        var i = last.i, s = last.s;
        return { title: '대출이자 계산 결과', text: '[대출이자 계산] ' + S.fmtKorean(i.principal) + ' · 연 ' + S.fmtRate(i.rate) + '% · ' + i.months + '개월 · ' + METHOD_NAME[i.method] + '\n첫 달 ' + S.fmtWon(last.first) + '원 · 총 이자 ' + S.fmtWon(s.totalInterest) + '원' };
      },
      card: function () {
        var i = last.i, s = last.s;
        return { file: 'loan-result', title: '대출이자 계산기', kicker: METHOD_NAME[i.method] + ' · 첫 달 상환액', big: S.fmtWon(last.first), unit: '원',
          rows: [['대출금액', S.fmtWon(i.principal) + '원'], ['연금리 / 기간', S.fmtRate(i.rate) + '% / ' + i.months + '개월'], ['총 이자', S.fmtWon(s.totalInterest) + '원'], ['총 상환액', S.fmtWon(s.totalPay) + '원']],
          note: '월 단위 단리 계산. 중도상환수수료·보증료·변동금리는 반영하지 않습니다.' };
      }
    });
  });
})();
