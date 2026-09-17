/* 상가 수익률 계산기 */
(function () {
  'use strict';
  var S = window.Site, $ = S.$;
  var DEFAULT_VACANCY = 5, DEFAULT_LOAN_RATE = 5.0;
  var PRESETS = {
    small: { price: 500000000,  cost: 10000000, deposit: 50000000,  rent: 2500000, vacancy: 5, opex: 3000000,  loan: 200000000, loanRate: 5.0 },
    mid:   { price: 1500000000, cost: 30000000, deposit: 100000000, rent: 7000000, vacancy: 8, opex: 10000000, loan: 700000000, loanRate: 5.2 }
  };
  function calc(i, vacancy) {
    var gross = i.rent * 12, vac = gross * vacancy / 100, noi = gross - vac - i.opex, invest = i.price + i.cost - i.deposit, equity = invest - i.loan, interest = i.loan * i.loanRate / 100, cf = noi - interest;
    return { gross: gross, vac: vac, noi: noi, invest: invest, equity: equity, interest: interest, cf: cf, cap: invest > 0 ? noi / invest * 100 : null, coc: equity > 0 ? cf / equity * 100 : null };
  }
  function readInput() {
    return { price: S.parseMoney($('price').value), cost: S.parseMoney($('cost').value), deposit: S.parseMoney($('deposit').value), rent: S.parseMoney($('rent').value),
      vacancy: Math.min(100, S.parseNonNegative($('vacancy').value)), opex: S.parseMoney($('opex').value), loan: S.parseMoney($('loan').value), loanRate: S.parseNonNegative($('loanRate').value) };
  }
  function pct(v) { return v === null ? '—' : S.fmtPct(v); }
  var last = null;
  function render(i) {
    var r = calc(i, i.vacancy);
    S.setText('out-coc', pct(r.coc)); S.setText('sticky-monthly', pct(r.coc)); S.setText('out-cap', pct(r.cap));
    S.setText('out-noi', S.fmtWon(r.noi)); S.setText('out-int', S.fmtWon(r.interest)); S.setText('out-cf', S.fmtWon(r.cf));
    var note;
    if (i.price <= 0) note = '매매가와 월세를 입력하면 바로 계산됩니다.';
    else if (r.invest <= 0) note = '보증금이 매매가와 부대비용 합계 이상이면 실투자금이 0 이하가 되어 수익률을 계산할 수 없습니다.';
    else if (r.equity <= 0) note = '대출이 실투자금 이상이면 자기자본이 0 이하가 되어 자기자본 수익률을 계산할 수 없습니다. 총투자 수익률만 참고하세요.';
    else note = '실투자금 ' + S.fmtKorean(r.invest) + ', 자기자본 ' + S.fmtKorean(r.equity) + ' 기준. 입력한 가정에 따른 결과이며 세금과 시세 변동은 반영하지 않습니다.';
    S.setText('out-note', note);
    S.setText('bd-gross', S.fmtWon(r.gross)); S.setText('bd-vac', S.fmtWon(r.vac)); S.setText('bd-vac-label', '(' + S.fmtRate(i.vacancy) + '%)');
    S.setText('bd-opex', S.fmtWon(i.opex)); S.setText('bd-noi', S.fmtWon(r.noi)); S.setText('bd-invest', S.fmtWon(r.invest)); S.setText('bd-equity', S.fmtWon(r.equity));
    var rows = [];
    [0, 5, 10, 15, 20, 30].forEach(function (v) {
      var x = calc(i, v);
      rows.push('<tr' + (v === Math.round(i.vacancy) ? ' class="total"' : '') + '><th scope="row">' + v + '%</th><td>' + S.fmtWon(x.noi) + '원</td><td>' + pct(x.cap) + '%</td><td>' + pct(x.coc) + '%</td></tr>');
    });
    $('sens-body').innerHTML = rows.join('');
    last = { i: i, r: r };
  }
  S.ready(function () {
    S.wireCalc({
      key: 'yield',
      recalc: function () { render(readInput()); },
      preset: function (name) {
        if (name === 'clear') { ['price', 'deposit', 'rent'].forEach(function (id) { $(id).value = ''; }); ['cost', 'opex', 'loan'].forEach(function (id) { $(id).value = '0'; }); $('vacancy').value = DEFAULT_VACANCY; $('loanRate').value = DEFAULT_LOAN_RATE.toFixed(1); return; }
        var p = PRESETS[name]; ['price', 'cost', 'deposit', 'rent', 'opex', 'loan'].forEach(function (id) { S.setMoney(id, p[id]); }); $('vacancy').value = p.vacancy; $('loanRate').value = p.loanRate.toFixed(1);
      },
      share: function () { var i = last.i, r = last.r; return { title: '상가 수익률 계산 결과', text: '[상가 수익률] 매매가 ' + S.fmtKorean(i.price) + ' · 월세 ' + S.fmtWon(i.rent) + '원 · 공실 ' + S.fmtRate(i.vacancy) + '%\n총투자 ' + pct(r.cap) + '% · 자기자본 ' + pct(r.coc) + '%' }; },
      card: function () {
        var i = last.i, r = last.r;
        return { file: 'yield-result', title: '상가 수익률 계산기', kicker: '자기자본 수익률 (연, 대출이자 차감 후)', big: pct(r.coc), unit: '%',
          rows: [['총투자 수익률', pct(r.cap) + '%'], ['연 순영업수익', S.fmtWon(r.noi) + '원'], ['연 대출이자', S.fmtWon(r.interest) + '원'], ['실투자금 / 자기자본', S.fmtKorean(r.invest) + ' / ' + S.fmtKorean(r.equity)]],
          note: '매매가 ' + S.fmtKorean(i.price) + ', 월세 ' + S.fmtWon(i.rent) + '원, 공실률 ' + S.fmtRate(i.vacancy) + '% 가정. 세금·감가상각·시세 변동 미반영.' };
      }
    });
  });
})();
