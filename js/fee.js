/* 중개보수(복비) 계산기 — 법정 상한 요율 기준 "예상 최대치"만 계산 */
(function () {
  'use strict';
  var S = window.Site;
  var $ = S.$;

  // ---- 상한 요율표 (상수. 개정 시 이 표만 수정) ----
  // 근거: 공인중개사법 시행규칙 [별표 1], 2021-10-19 개정 시행 기준. 지역 조례로 달라질 수 있음.
  var RATE_TABLE_DATE = '2021년 10월 19일 개정 기준';
  var HOUSE_SALE = [ // 주택 매매·교환: [상한 거래금액(미만), 요율%, 한도액]
    [50000000, 0.6, 250000],
    [200000000, 0.5, 800000],
    [900000000, 0.4, null],
    [1200000000, 0.5, null],
    [1500000000, 0.6, null],
    [Infinity, 0.7, null]
  ];
  var HOUSE_LEASE = [ // 주택 임대차
    [50000000, 0.5, 200000],
    [100000000, 0.4, 300000],
    [600000000, 0.3, null],
    [1200000000, 0.4, null],
    [1500000000, 0.5, null],
    [Infinity, 0.6, null]
  ];
  var OFFICETEL_SALE = 0.5;   // 주거용 오피스텔(전용 85㎡ 이하, 주거시설 갖춤) 매매
  var OFFICETEL_LEASE = 0.4;  // 동 임대차
  var OTHER_MAX = 0.9;        // 그 외(토지·상가·일반 오피스텔): 0.9% 이내 협의
  var VAT = 10;               // 부가가치세 % (일반과세 중개업소)
  var MONTHLY_MULT = 100;     // 월세 거래금액 환산: 보증금 + 월세 × 100
  var MONTHLY_MULT_SMALL = 70;// 환산액 5천만 미만이면 보증금 + 월세 × 70
  var SMALL_THRESHOLD = 50000000;

  function lookup(table, amount) {
    for (var k = 0; k < table.length; k++) if (amount < table[k][0]) return { rate: table[k][1], cap: table[k][2] };
    return { rate: table[table.length - 1][1], cap: null };
  }

  function calc(i) {
    var base, note = '';
    if (i.deal === 'monthly') {
      base = i.deposit + i.rent * MONTHLY_MULT;
      if (base < SMALL_THRESHOLD) { base = i.deposit + i.rent * MONTHLY_MULT_SMALL; note = '환산 거래금액이 5천만원 미만이라 월세 × 70을 적용했습니다.'; }
      else note = '월세 거래금액 = 보증금 + 월세 × 100';
    } else {
      base = i.price;
    }

    var rate, cap = null, basis = '';
    var isSale = i.deal === 'sale';
    if (i.kind === 'house') {
      var r = lookup(isSale ? HOUSE_SALE : HOUSE_LEASE, base);
      rate = r.rate; cap = r.cap; basis = '주택 ' + (isSale ? '매매·교환' : '임대차') + ' 상한 요율';
    } else if (i.kind === 'officetel') {
      rate = isSale ? OFFICETEL_SALE : OFFICETEL_LEASE; basis = '주거용 오피스텔 ' + (isSale ? '매매' : '임대차') + ' 상한 요율';
    } else {
      rate = OTHER_MAX; basis = '토지·상가·기타 오피스텔은 0.9% 이내에서 협의';
    }

    var fee = base * rate / 100;
    var capped = false;
    if (cap !== null && fee > cap) { fee = cap; capped = true; }
    var vat = fee * VAT / 100;
    return { base: base, rate: rate, cap: cap, capped: capped, fee: fee, vat: vat, total: fee + vat, basis: basis, note: note };
  }

  function readInput() {
    var k = document.querySelector('input[name="kind"]:checked');
    var d = document.querySelector('input[name="deal"]:checked');
    return {
      kind: k ? k.value : 'house',
      deal: d ? d.value : 'sale',
      price: S.parseMoney($('price').value),
      deposit: S.parseMoney($('deposit').value),
      rent: S.parseMoney($('rent').value),
      vat: $('vat-toggle').checked
    };
  }

  function render(i) {
    var r = calc(i);
    $('sale-fields').hidden = i.deal === 'monthly';
    $('monthly-fields').hidden = i.deal !== 'monthly';

    var shown = i.vat ? r.total : r.fee;
    S.setText('out-fee', S.fmtWon(shown));
    S.setText('sticky-monthly', S.fmtWon(shown));
    S.setText('out-kicker', '예상 최대 중개보수' + (i.vat ? ' (부가세 포함)' : ' (부가세 별도)'));
    S.setText('out-base', S.fmtWon(r.base));
    S.setText('out-rate', S.fmtRate(r.rate));
    S.setText('out-vat', S.fmtWon(r.vat));
    S.setText('out-each', S.fmtWon(shown));

    var lines = [r.basis + ' ' + S.fmtRate(r.rate) + '%'];
    if (r.cap !== null) lines.push('한도액 ' + S.fmtWon(r.cap) + '원' + (r.capped ? ' 적용됨' : ''));
    if (r.note) lines.push(r.note);
    if (i.kind === 'other') lines.push('상한 0.9%는 협의 상한이며 실제 요율은 중개업소와 합의로 정합니다.');
    lines.push('임대인·임차인(매도인·매수인) 각자 이 금액을 상한으로 부담합니다.');
    S.setText('out-note', lines.join(' · '));
    S.setText('out-basis', RATE_TABLE_DATE + '. 지역 조례에 따라 다를 수 있으며, 상한 이내에서 협의로 정합니다.');
  }

  function recalc() { render(readInput()); }

  S.ready(function () {
    S.bindMoneyInputs(document, recalc);
    S.$$('input[name="kind"], input[name="deal"], #vat-toggle').forEach(function (el) { el.addEventListener('change', recalc); });
    $('calc-form').addEventListener('submit', function (e) {
      e.preventDefault(); recalc();
      var r = $('result'); if (r && r.scrollIntoView) r.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    S.bindShareButton('share-btn', function () { var i = readInput(); return { kind: i.kind, deal: i.deal, price: i.price, deposit: i.deposit, rent: i.rent, vat: i.vat ? 1 : 0 }; });
    var q = S.readQuery();
    if (Object.keys(q).length) {
      var k = document.querySelector('input[name="kind"][value="' + q.kind + '"]'); if (k) k.checked = true;
      var d = document.querySelector('input[name="deal"][value="' + q.deal + '"]'); if (d) d.checked = true;
      if (q.price != null) S.setMoney('price', S.parseMoney(q.price));
      if (q.deposit != null) S.setMoney('deposit', S.parseMoney(q.deposit));
      if (q.rent != null) S.setMoney('rent', S.parseMoney(q.rent));
      $('vat-toggle').checked = q.vat === '1';
    }
    S.$$('[data-soon]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); S.toast(el.getAttribute('data-soon') + ' — 준비 중'); });
    });
    recalc();
    S.bindStickySummary('result');
  });
})();
