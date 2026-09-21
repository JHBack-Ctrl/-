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
  // 공유 카드·요약 바는 사용자가 실제로 입력한 쪽을 주인공으로 삼는다.
  // 늘 평→㎡로 고정하면 ㎡만 넣은 사람에게 "0㎡"가 찍힌다.
  function lead(i) {
    var fromSqm = !(i.pyeong > 0) && i.sqm > 0;
    if (fromSqm) return { kicker: S.fmtNum(i.sqm, 2) + '㎡는', big: S.fmtNum(i.sqm / PYEONG, 2), unit: '평',
      sticky: S.fmtNum(i.sqm / PYEONG, 1) + '평', text: S.fmtNum(i.sqm, 2) + '㎡ = ' + S.fmtNum(i.sqm / PYEONG, 2) + '평',
      other: i.pyeong > 0 ? [S.fmtNum(i.pyeong, 2) + '평은', S.fmtNum(i.pyeong * PYEONG, 2) + '㎡'] : null };
    return { kicker: S.fmtNum(i.pyeong, 2) + '평은', big: S.fmtNum(i.pyeong * PYEONG, 2), unit: '㎡',
      sticky: S.fmtNum(i.pyeong * PYEONG, 1) + '㎡', text: S.fmtNum(i.pyeong, 2) + '평 = ' + S.fmtNum(i.pyeong * PYEONG, 2) + '㎡',
      other: i.sqm > 0 ? [S.fmtNum(i.sqm, 2) + '㎡는', S.fmtNum(i.sqm / PYEONG, 2) + '평'] : null };
  }
  function render(i) {
    S.setText('out-sqm', S.fmtNum(i.pyeong * PYEONG, 2)); S.setText('out-pyeong', S.fmtNum(i.sqm / PYEONG, 2));
    S.setText('sticky-monthly', lead(i).sticky);
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
      share: function () { var L = lead(last.i); return { title: '평수 변환 결과', text: L.text + (L.other ? ' · ' + L.other[0] + ' ' + L.other[1] : '') }; },
      card: function () {
        var i = last.i, L = lead(i);
        var rows = (L.other ? [L.other] : []);
        if (i.price > 0) rows.push(['평당 가격', S.fmtWon(last.perP) + '원'], ['㎡당 가격', S.fmtWon(last.perS) + '원']);
        return { file: 'area-result', title: '평수 변환기', kicker: L.kicker, big: L.big, unit: L.unit, rows: rows,
          note: '1평 = 3.305785㎡. 아파트 분양 평수는 공급면적, 등기와 세금은 전용면적 기준입니다.' };
      }
    });
  });
})();
