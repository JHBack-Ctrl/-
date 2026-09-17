/* 전세 사기 위험 신호 체크 — 전세가율과 위험 신호 항목을 점수로 합산 */
(function () {
  'use strict';
  var S = window.Site, $ = S.$, $$ = S.$$;
  var RATIO_WARN = 70, RATIO_DANGER = 80;   // 전세가율 (보증금+선순위)/시세 %
  var LEVELS = [[0, '낮음'], [30, '주의'], [60, '높음']]; // 점수 구간

  function readInput() {
    return { price: S.parseMoney($('price').value), deposit: S.parseMoney($('deposit').value), senior: S.parseMoney($('senior').value) };
  }
  var last = null;

  function render(i) {
    var score = 0, signals = [];
    var ratio = i.price > 0 ? (i.deposit + i.senior) / i.price * 100 : 0;
    if (i.price > 0 && i.deposit > 0) {
      if (ratio >= RATIO_DANGER) { score += 35; signals.push('전세가율 ' + S.fmtPct(ratio) + '% — 집값이 조금만 내려도 보증금을 다 돌려받기 어렵습니다'); }
      else if (ratio >= RATIO_WARN) { score += 15; signals.push('전세가율 ' + S.fmtPct(ratio) + '% — 보증보험 가입 가능 여부를 꼭 확인하세요'); }
    }
    $$('.risk-item input[type="checkbox"]').forEach(function (b) {
      if (b.checked) { score += parseInt(b.getAttribute('data-weight'), 10) || 0; signals.push(b.closest('label').querySelector('.t').textContent.trim()); }
    });
    var level = LEVELS[0][1];
    LEVELS.forEach(function (l) { if (score >= l[0]) level = l[1]; });
    S.setText('out-big', level); S.setText('sticky-monthly', '위험도 ' + level + ' · ' + score + '점');
    S.setText('out-score', String(score)); S.setText('out-ratio', i.price > 0 ? S.fmtPct(ratio) : '0.00'); S.setText('out-count', String(signals.length));
    var ul = $('signal-list'); ul.innerHTML = '';
    if (!signals.length) ul.innerHTML = '<li><p class="d">해당하는 신호가 없습니다. 시세·보증금을 넣고 아래 항목을 확인하세요.</p></li>';
    signals.forEach(function (s) { var li = document.createElement('li'); li.innerHTML = '<p class="d">• ' + s + '</p>'; ul.appendChild(li); });
    S.setText('out-note', score >= 60 ? '위험 신호가 여러 개입니다. 계약을 서두르지 말고 보증보험 가입 가능 여부와 등기부·건축물대장을 다시 확인하세요.' : (score >= 30 ? '주의 신호가 있습니다. 특약으로 보완할 수 있는지, 보증보험 가입이 되는지 확인하세요.' : '큰 위험 신호는 없습니다. 그래도 잔금일에 등기부를 다시 떼고 전입신고·확정일자는 당일에 하세요.'));
    last = { score: score, level: level, ratio: ratio, signals: signals };
  }

  S.ready(function () {
    S.wireCalc({
      key: 'jeonse-fraud-check',
      recalc: function () { render(readInput()); },
      preset: function (name) {
        if (name === 'clear') { ['price', 'deposit', 'senior'].forEach(function (k) { S.setMoney(k, 0); }); $$('.risk-item input').forEach(function (b) { b.checked = false; }); return; }
        S.setMoney('price', 300000000); S.setMoney('deposit', name === 'risky' ? 270000000 : 180000000); S.setMoney('senior', name === 'risky' ? 30000000 : 0);
      },
      share: function () { return { title: '전세 사기 위험 신호 체크', text: '[전세 위험 체크] 위험도 ' + last.level + ' (' + last.score + '점) · 전세가율 ' + S.fmtPct(last.ratio) + '% · 신호 ' + last.signals.length + '개' }; },
      card: function () {
        return { file: 'jeonse-risk-result', title: '전세 사기 위험 신호 체크', kicker: '위험도 (참고)', big: last.level, unit: '',
          rows: [['위험 점수', last.score + '점'], ['전세가율 (보증금+선순위 ÷ 시세)', S.fmtPct(last.ratio) + '%'], ['해당 신호', last.signals.length + '개']].concat(last.signals.slice(0, 3).map(function (s) { return ['·', s.slice(0, 28)]; })),
          note: '점수는 참고용 가중치입니다. 계약 전 등기부·건축물대장·임대인 세금 체납 여부를 직접 확인하세요.' };
      }
    });
  });
})();
