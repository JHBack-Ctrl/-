/* 평수 변환기: 평 ↔ ㎡, 평당·㎡당 가격 */
(function () {
  'use strict';
  var S = window.Site, $ = S.$;
  var PYEONG = 3.305785; // 1평 = 3.305785㎡ (1평 = 400/121 ㎡)

  function readInput() {
    var unit = document.querySelector('input[name="priceUnit"]:checked');
    return { pyeong: S.parseNonNegative($('pyeong').value), sqm: S.parseNonNegative($('sqm').value),
      price: S.parseMoney($('price').value), area: S.parseNonNegative($('area').value), priceUnit: unit ? unit.value : 'pyeong' };
  }
  var last = null;
  function render(i) {
    S.setText('out-sqm', S.fmtNum(i.pyeong * PYEONG, 2)); S.setText('out-pyeong', S.fmtNum(i.sqm / PYEONG, 2));
    S.setText('sticky-monthly', S.fmtNum(i.pyeong * PYEONG, 1) + '㎡');
    // 가격 환산
    var areaP = i.priceUnit === 'pyeong' ? i.area : i.area / PYEONG, areaS = i.priceUnit === 'pyeong' ? i.area * PYEONG : i.area;
    var perP = areaP > 0 ? i.price / areaP : 0, perS = areaS > 0 ? i.price / areaS : 0;
    S.setText('out-per-pyeong', S.fmtWon(perP)); S.setText('out-per-sqm', S.fmtWon(perS));
    S.setText('out-area-both', areaP > 0 ? S.fmtNum(areaP, 2) + '평 = ' + S.fmtNum(areaS, 2) + '㎡' : '면적을 입력하세요');
    S.setText('out-note', i.price > 0 && i.area > 0 ? '총액 ' + S.fmtKorean(i.price) + ' ÷ ' + S.fmtNum(areaP, 2) + '평 = 평당 ' + S.fmtKorean(perP) : '총액과 면적을 넣으면 단가가 나옵니다.');
    last = { i: i, perP: perP, perS: perS };
  }
  S.ready(function () {
    // 참고표 10~60평
    var rows = [];
    for (var p = 10; p <= 60; p += 5) rows.push('<tr><td>' + p + '평</td><td>' + S.fmtNum(p * PYEONG, 2) + '㎡</td><td>' + S.fmtNum(p * PYEONG * 0.75, 1) + '~' + S.fmtNum(p * PYEONG * 0.85, 1) + '㎡</td></tr>');
    $('ref-body').innerHTML = rows.join('');
    S.wireCalc({
      key: 'area',
      recalc: function () { render(readInput()); },
      share: function () { var i = last.i; return { title: '평수 변환 결과', text: S.fmtNum(i.pyeong, 2) + '평 = ' + S.fmtNum(i.pyeong * PYEONG, 2) + '㎡ · ' + S.fmtNum(i.sqm, 2) + '㎡ = ' + S.fmtNum(i.sqm / PYEONG, 2) + '평' }; },
      card: function () {
        var i = last.i;
        return { file: 'area-result', title: '평수 변환기', kicker: S.fmtNum(i.pyeong, 2) + '평은', big: S.fmtNum(i.pyeong * PYEONG, 2), unit: '㎡',
          rows: [[S.fmtNum(i.sqm, 2) + '㎡는', S.fmtNum(i.sqm / PYEONG, 2) + '평'], ['평당 가격', i.price > 0 ? S.fmtWon(last.perP) + '원' : '—'], ['㎡당 가격', i.price > 0 ? S.fmtWon(last.perS) + '원' : '—']],
          note: '1평 = 3.305785㎡. 아파트 분양 평수는 공급면적, 등기와 세금은 전용면적 기준입니다.' };
      }
    });
  });
})();
