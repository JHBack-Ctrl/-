/* 이사 D-day 체크리스트 — 이사일 기준으로 할 일 날짜를 계산하고 진행률을 보여준다 */
(function () {
  'use strict';
  var S = window.Site, $ = S.$, $$ = S.$$;
  var MOVE_IN_REPORT_DAYS = 14;   // 전입신고 기한 (이사 후 14일)
  var CAR_ADDRESS_DAYS = 30;      // 자동차 변경등록 (30일)

  function dday(from, to) { var d = S.daysBetween(from, to); return d === 0 ? 'D-day' : (d > 0 ? 'D-' + d : 'D+' + (-d)); }
  function addDays(d, n) { return new Date(d.getTime() + n * 86400000); }

  function render() {
    var move = S.parseDate($('moveDate').value), today = S.today();
    S.setText('out-big', move ? dday(today, move) : '—'); S.setText('sticky-monthly', move ? dday(today, move) : '—');
    S.setText('out-move', move ? S.fmtDate(move) : '—');
    S.setText('out-report', move ? S.fmtDate(addDays(move, MOVE_IN_REPORT_DAYS)) : '—');
    S.setText('out-car', move ? S.fmtDate(addDays(move, CAR_ADDRESS_DAYS)) : '—');
    var total = 0, done = 0;
    $$('.phase').forEach(function (ph) {
      var off = parseInt(ph.getAttribute('data-offset'), 10);
      var dateEl = ph.querySelector('.phase-date');
      if (dateEl) dateEl.textContent = move ? S.fmtDate(addDays(move, off)) + ' · ' + dday(today, addDays(move, off)) : '';
      var boxes = $$('input[type="checkbox"]', ph), d = 0;
      boxes.forEach(function (b) { if (b.checked) d++; });
      total += boxes.length; done += d;
      var pr = ph.querySelector('.progress > span'); if (pr) pr.style.width = (boxes.length ? d / boxes.length * 100 : 0) + '%';
      ph.classList.toggle('phase-done', boxes.length > 0 && d === boxes.length);
    });
    S.setText('out-done', done + ' / ' + total);
    var all = $('all-progress'); if (all) all.style.width = (total ? done / total * 100 : 0) + '%';
    S.setText('out-note', move ? (S.daysBetween(today, move) >= 0 ? '이사까지 ' + S.daysBetween(today, move) + '일. 전입신고는 ' + S.fmtDate(addDays(move, MOVE_IN_REPORT_DAYS)) + '까지, 늦으면 과태료가 있습니다.' : '이사 후입니다. 전입신고·확정일자·자동차 주소 변경 기한을 확인하세요.') : '이사 날짜를 넣으면 단계별 날짜가 나옵니다.');
  }

  S.ready(function () {
    S.wireCalc({
      key: 'moving',
      recalc: render,
      preset: function (name) {
        if (name === 'clear') { $('moveDate').value = ''; $$('.phase input[type="checkbox"]').forEach(function (b) { b.checked = false; }); return; }
        $('moveDate').value = S.fmtDate(S.addMonths(S.today(), name === 'm1' ? 1 : 2));
      },
      share: function () { var m = S.parseDate($('moveDate').value); return { title: '이사 체크리스트', text: '[이사 체크리스트] 이사일 ' + (m ? S.fmtDate(m) : '—') + ' · 진행 ' + $('out-done').textContent }; },
      card: function () {
        var m = S.parseDate($('moveDate').value), rows = [];
        $$('.phase').forEach(function (ph) {
          var off = parseInt(ph.getAttribute('data-offset'), 10), boxes = $$('input[type="checkbox"]', ph), d = 0;
          boxes.forEach(function (b) { if (b.checked) d++; });
          rows.push([ph.querySelector('h3').firstChild.textContent.trim(), (m ? S.fmtDate(addDays(m, off)) + ' · ' : '') + d + '/' + boxes.length]);
        });
        return { file: 'moving-checklist', title: '이사 체크리스트', kicker: '이사까지', big: m ? dday(S.today(), m) : '—', unit: '', rows: rows, note: '전입신고 이사 후 14일 이내, 자동차 변경등록 30일 이내.' };
      }
    });
  });
})();
