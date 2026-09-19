// 홈 타일 검색. 입력한 말이 들어간 타일만 남기고, 빈 묶음은 통째로 숨긴다.
(function () {
  'use strict';
  var q = document.getElementById('q');
  var empty = document.getElementById('tile-empty');
  if (!q) return;

  var groups = [].slice.call(document.querySelectorAll('[data-group]')).map(function (g) {
    return {
      sec: g.closest('.sec'),
      tiles: [].slice.call(g.querySelectorAll('.tile')).map(function (t) {
        var label = t.querySelector('.t');
        return { el: t, key: ((t.getAttribute('data-k') || '') + ' ' + (label ? label.textContent : '')).toLowerCase() };
      })
    };
  });

  function apply() {
    var v = q.value.trim().toLowerCase();
    var any = false;
    for (var i = 0; i < groups.length; i++) {
      var g = groups[i], shown = 0;
      for (var j = 0; j < g.tiles.length; j++) {
        var hit = !v || g.tiles[j].key.indexOf(v) !== -1;
        g.tiles[j].el.hidden = !hit;
        if (hit) shown++;
      }
      if (g.sec) g.sec.hidden = !shown;
      if (shown) any = true;
    }
    if (empty) empty.hidden = any;
  }

  q.addEventListener('input', apply);
  // 검색창에서 엔터를 치면 첫 결과로 이동
  q.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    var first = document.querySelector('.tile:not([hidden])');
    if (first) { e.preventDefault(); location.href = first.getAttribute('href'); }
  });
})();
