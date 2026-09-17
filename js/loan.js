/* 대출이자 계산기: 원리금균등 / 원금균등 / 만기일시 */
(function () {
  'use strict';
  var S = window.Site;
  var $ = S.$;

  var DEFAULT_RATE = 4.5;
  var DEFAULT_MONTHS = 24;
  var PRESETS = {
    deposit: { principal: 50000000, rate: 4.5, months: 24, grace: 0 },
    jeonse:  { principal: 200000000, rate: 3.8, months: 24, grace: 24 }
  };

  // 상환표 생성. 반환: { rows:[{n, pay, principal, interest, balance}], totalInterest, totalPay }
  function schedule(P, annualRate, n, grace, method) {
    var r = annualRate / 12 / 100;
    var rows = [], bal = P, totalInt = 0, totalPay = 0;
    if (P <= 0 || n <= 0) return { rows: rows, totalInterest: 0, totalPay: 0 };
    grace = method === 'bullet' ? 0 : Math.min(Math.max(0, grace), n - 1);
    var amortN = n - grace;

    var annuityPay = 0;
    if (method === 'annuity') {
      annuityPay = r > 0 ? P * r * Math.pow(1 + r, amortN) / (Math.pow(1 + r, amortN) - 1) : P / amortN;
    }

    for (var k = 1; k <= n; k++) {
      var interest = bal * r;
      var principal = 0;
      if (k <= grace) {
        principal = 0;
      } else if (method === 'annuity') {
        principal = annuityPay - interest;
      } else if (method === 'principal') {
        principal = P / amortN;
      } else { // bullet
        principal = k === n ? bal : 0;
      }
      if (k === n) principal = bal; // 마지막 회차 잔액 정리(반올림 오차)
      bal = Math.max(0, bal - principal);
      var pay = principal + interest;
      totalInt += interest; totalPay += pay;
      rows.push({ n: k, pay: pay, principal: principal, interest: interest, balance: bal });
    }
    return { rows: rows, totalInterest: totalInt, totalPay: totalPay };
  }

  function readInput() {
    var m = document.querySelector('input[name="method"]:checked');
    return {
      principal: S.parseMoney($('principal').value),
      rate: S.parseNonNegative($('rate').value),
      months: Math.floor(S.parseNonNegative($('months').value)) || 0,
      grace: Math.floor(S.parseNonNegative($('grace').value)) || 0,
      method: m ? m.value : 'annuity'
    };
  }

  var METHOD_NAME = { annuity: '원리금균등', principal: '원금균등', bullet: '만기일시' };

  function render(i) {
    var s = schedule(i.principal, i.rate, i.months, i.grace, i.method);
    var first = s.rows.length ? s.rows[0].pay : 0;
    var n = s.rows.length || 1;

    S.setText('out-kicker', METHOD_NAME[i.method] + ' · 첫 달 상환액');
    S.setText('out-first', S.fmtWon(first));
    S.setText('sticky-monthly', S.fmtWon(first));
    S.setText('out-interest', S.fmtWon(s.totalInterest));
    S.setText('out-total', S.fmtWon(s.totalPay));
    S.setText('out-avg-int', S.fmtWon(s.totalInterest / n));
    S.setText('out-avg-pay', S.fmtWon(s.totalPay / n));
    S.setText('out-note', i.principal > 0
      ? '대출 ' + S.fmtKorean(i.principal) + ', 연 ' + S.fmtRate(i.rate) + '%, ' + i.months + '개월' + (i.grace && i.method !== 'bullet' ? ', 거치 ' + Math.min(i.grace, i.months - 1) + '개월' : '') + '. 총 이자 ' + S.fmtKorean(s.totalInterest) + '.'
      : '대출금액을 입력하면 바로 계산됩니다.');

    // 방식 비교
    ['annuity', 'principal', 'bullet'].forEach(function (m) {
      var x = schedule(i.principal, i.rate, i.months, i.grace, m);
      var key = { annuity: 'an', principal: 'pr', bullet: 'bu' }[m];
      S.setText('c-' + key + '-first', S.fmtWon(x.rows.length ? x.rows[0].pay : 0));
      S.setText('c-' + key + '-last', S.fmtWon(x.rows.length ? x.rows[x.rows.length - 1].pay : 0));
      S.setText('c-' + key + '-int', S.fmtWon(x.totalInterest));
    });

    // 상환표
    var tbody = $('schedule').querySelector('tbody');
    var html = [];
    s.rows.forEach(function (row) {
      html.push('<tr' + (row.n % 12 === 0 ? ' class="year"' : '') + '><td>' + row.n + '</td><td>' + S.fmtWon(row.pay) + '</td><td>' + S.fmtWon(row.principal) + '</td><td>' + S.fmtWon(row.interest) + '</td><td>' + S.fmtWon(row.balance) + '</td></tr>');
    });
    tbody.innerHTML = html.join('') || '<tr><td colspan="5" class="na">대출금액과 기간을 입력하세요.</td></tr>';
  }

  function recalc() { render(readInput()); }

  function applyPreset(name) {
    if (name === 'clear') { $('principal').value = ''; $('rate').value = DEFAULT_RATE; $('months').value = DEFAULT_MONTHS; $('grace').value = 0; }
    else { var p = PRESETS[name]; S.setMoney('principal', p.principal); $('rate').value = p.rate; $('months').value = p.months; $('grace').value = p.grace; }
    S.$$('.chip').forEach(function (c) { c.classList.toggle('active', c.getAttribute('data-preset') === name && name !== 'clear'); });
    recalc();
  }

  function applyQuery() {
    var q = S.readQuery();
    if (!Object.keys(q).length) return;
    if (q.p != null) S.setMoney('principal', S.parseMoney(q.p));
    if (q.rate != null) $('rate').value = S.parseNonNegative(q.rate);
    if (q.n != null) $('months').value = Math.floor(S.parseNonNegative(q.n)) || DEFAULT_MONTHS;
    if (q.g != null) $('grace').value = Math.floor(S.parseNonNegative(q.g));
    var m = document.querySelector('input[name="method"][value="' + (METHOD_NAME[q.method] ? q.method : 'annuity') + '"]');
    if (m) m.checked = true;
  }

  S.ready(function () {
    S.bindMoneyInputs(document, recalc);
    S.$$('input[type="number"]').forEach(function (el) { el.addEventListener('input', recalc); });
    S.$$('input[name="method"]').forEach(function (el) { el.addEventListener('change', recalc); });
    $('calc-form').addEventListener('submit', function (e) {
      e.preventDefault(); recalc();
      var r = $('result'); if (r && r.scrollIntoView) r.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    S.$$('.chip').forEach(function (c) { c.addEventListener('click', function () { applyPreset(c.getAttribute('data-preset')); }); });
    S.bindShareButton('share-btn', function () {
      var i = readInput();
      return { p: i.principal, rate: i.rate, n: i.months, g: i.grace, method: i.method };
    });
    S.$$('[data-soon]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); S.toast(el.getAttribute('data-soon') + ' — 준비 중'); });
    });
    applyQuery();
    recalc();
    S.bindStickySummary('result');
  });
})();
