/* 중개보수(복비) 계산기 — 법정 상한 요율 기준 "예상 최대치"만 계산 */
(function () {
  'use strict';
  var S = window.Site, $ = S.$;

  // ---- 상한 요율표 (상수. 개정 시 이 표만 수정) ----
  // 근거: 공인중개사법 시행규칙 [별표 1], 2021-10-19 개정 시행 기준. 지역 조례로 달라질 수 있음.
  var RATE_TABLE_DATE = '2021년 10월 19일 개정 기준';
  var HOUSE_SALE = [[50000000, 0.6, 250000], [200000000, 0.5, 800000], [900000000, 0.4, null], [1200000000, 0.5, null], [1500000000, 0.6, null], [Infinity, 0.7, null]];
  var HOUSE_LEASE = [[50000000, 0.5, 200000], [100000000, 0.4, 300000], [600000000, 0.3, null], [1200000000, 0.4, null], [1500000000, 0.5, null], [Infinity, 0.6, null]];
  var OFFICETEL_SALE = 0.5, OFFICETEL_LEASE = 0.4, OTHER_MAX = 0.9, VAT = 10;
  var MONTHLY_MULT = 100, MONTHLY_MULT_SMALL = 70, SMALL_THRESHOLD = 50000000;

  function lookup(table, amount) { for (var k = 0; k < table.length; k++) if (amount < table[k][0]) return { rate: table[k][1], cap: table[k][2] }; return { rate: table[table.length - 1][1], cap: null }; }
  function calc(i) {
    var base, note = '';
    if (i.deal === 'monthly') {
      base = i.deposit + i.rent * MONTHLY_MULT;
      if (base < SMALL_THRESHOLD) { base = i.deposit + i.rent * MONTHLY_MULT_SMALL; note = '환산 거래금액이 5천만원 미만이라 월세 × 70을 적용했습니다.'; }
      else note = '월세 거래금액 = 보증금 + 월세 × 100';
    } else base = i.price;
    var rate, cap = null, basis = '', isSale = i.deal === 'sale';
    if (i.kind === 'house') { var r = lookup(isSale ? HOUSE_SALE : HOUSE_LEASE, base); rate = r.rate; cap = r.cap; basis = '주택 ' + (isSale ? '매매·교환' : '임대차') + ' 상한 요율'; }
    else if (i.kind === 'officetel') { rate = isSale ? OFFICETEL_SALE : OFFICETEL_LEASE; basis = '주거용 오피스텔 ' + (isSale ? '매매' : '임대차') + ' 상한 요율'; }
    else { rate = OTHER_MAX; basis = '토지·상가·기타 오피스텔은 0.9% 이내에서 협의'; }
    var fee = base * rate / 100, capped = false;
    if (cap !== null && fee > cap) { fee = cap; capped = true; }
    var vat = fee * VAT / 100;
    return { base: base, rate: rate, cap: cap, capped: capped, fee: fee, vat: vat, total: fee + vat, basis: basis, note: note };
  }
  function readInput() {
    var k = document.querySelector('input[name="kind"]:checked'), d = document.querySelector('input[name="deal"]:checked');
    return { kind: k ? k.value : 'house', deal: d ? d.value : 'sale', price: S.parseMoney($('price').value), deposit: S.parseMoney($('deposit').value), rent: S.parseMoney($('rent').value), vat: $('vat-toggle').checked };
  }
  var last = null;
  function render(i) {
    var r = calc(i);
    $('sale-fields').hidden = i.deal === 'monthly'; $('monthly-fields').hidden = i.deal !== 'monthly';
    var shown = i.vat ? r.total : r.fee;
    S.setText('out-fee', S.fmtWon(shown)); S.setText('sticky-monthly', S.fmtWon(shown));
    S.setText('out-kicker', '예상 최대 중개보수' + (i.vat ? ' (부가세 포함)' : ' (부가세 별도)'));
    S.setText('out-base', S.fmtWon(r.base)); S.setText('out-rate', S.fmtRate(r.rate)); S.setText('out-vat', S.fmtWon(r.vat)); S.setText('out-each', S.fmtWon(shown));
    var lines = [r.basis + ' ' + S.fmtRate(r.rate) + '%'];
    if (r.cap !== null) lines.push('한도액 ' + S.fmtWon(r.cap) + '원' + (r.capped ? ' 적용됨' : ''));
    if (r.note) lines.push(r.note);
    if (i.kind === 'other') lines.push('상한 0.9%는 협의 상한이며 실제 요율은 중개업소와 합의로 정합니다.');
    lines.push('임대인·임차인(매도인·매수인) 각자 이 금액을 상한으로 부담합니다.');
    S.setText('out-note', lines.join(' · '));
    S.setText('out-basis', RATE_TABLE_DATE + '. 지역 조례에 따라 다를 수 있으며, 상한 이내에서 협의로 정합니다.');
    last = { i: i, r: r, shown: shown };
  }
  S.ready(function () {
    S.wireCalc({
      key: 'fee',
      recalc: function () { render(readInput()); },
      share: function () { var i = last.i, r = last.r; return { title: '중개보수 계산 결과', text: '[중개보수] 거래금액 ' + S.fmtKorean(r.base) + ' · 상한 요율 ' + S.fmtRate(r.rate) + '%\n예상 최대 ' + S.fmtWon(last.shown) + '원' + (i.vat ? ' (부가세 포함)' : ' (부가세 별도)') }; },
      card: function () {
        var i = last.i, r = last.r;
        return { file: 'fee-result', title: '중개보수 계산기', kicker: '예상 최대 중개보수' + (i.vat ? ' (부가세 포함)' : ' (부가세 별도)'), big: S.fmtWon(last.shown), unit: '원',
          rows: [['적용 거래금액', S.fmtWon(r.base) + '원'], ['적용 상한 요율', S.fmtRate(r.rate) + '%' + (r.capped ? ' (한도 적용)' : '')], ['부가세 10%', S.fmtWon(r.vat) + '원']],
          note: r.basis + '. 상한이며 실제 보수는 협의로 정합니다. ' + RATE_TABLE_DATE + '.' };
      }
    });
  });
})();
