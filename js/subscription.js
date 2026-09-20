/* 청약 가점 계산기 (84점 만점) */
(function () {
  'use strict';
  var S = window.Site, $ = S.$;

  // ---- 가점표 (주택공급에 관한 규칙 별표1 기준) ----
  var MAX_HOMELESS = 32, MAX_DEPENDENT = 35, MAX_ACCOUNT = 17, TOTAL = 84;
  var HOMELESS_AGE = 30; // 무주택기간은 만 30세부터 (30세 전 혼인 시 혼인신고일부터)

  function homelessPoints(years, started) {
    if (!started) return 0;               // 만 30세 미만 미혼: 산정 시작 전
    if (years < 1) return 2;
    return Math.min(MAX_HOMELESS, 2 + 2 * Math.floor(years));
  }
  function dependentPoints(n) { return 5 + 5 * Math.min(6, Math.max(0, n)); }
  function accountPoints(months) {
    if (months <= 0) return 0;
    if (months < 6) return 1;
    if (months < 12) return 2;
    return Math.min(MAX_ACCOUNT, 2 + Math.floor(months / 12));
  }

  function readInput() {
    return { birth: S.parseDate($('birth').value), married: $('married').checked, marriage: S.parseDate($('marriage').value),
      ownedBefore: $('ownedBefore').checked, lastSale: S.parseDate($('lastSale').value), owner: $('owner').checked,
      dependents: Math.floor(S.parseNonNegative($('dependents').value)), account: S.parseDate($('account').value),
      notice: S.parseDate($('notice').value) };
  }
  var last = null;
  function render(i) {
    $('marriage-field').hidden = !i.married; $('lastSale-field').hidden = !i.ownedBefore;
    // 기준일: 공고일이 있으면 그날, 없으면 오늘. 실제 가점은 입주자모집공고일까지 센다
    var t = i.notice || S.today(), basis = i.notice ? '공고일 ' + S.fmtDate(i.notice) + ' 기준' : '오늘 기준';
    var hp = 0, hYears = 0, hStart = null, hNote = '';
    if (i.owner) { hp = 0; hNote = '현재 주택을 소유하고 있어 무주택기간 점수는 0점입니다.'; }
    else if (!i.birth) { hNote = '생년월일을 입력하세요.'; }
    else {
      var b30 = new Date(i.birth.getFullYear() + HOMELESS_AGE, i.birth.getMonth(), i.birth.getDate());
      hStart = b30; var why = '만 30세가 된';
      if (i.married && i.marriage && i.marriage < b30) { hStart = i.marriage; why = '만 30세 전 혼인이라 혼인신고일인'; }
      if (i.ownedBefore && i.lastSale && i.lastSale > hStart) { hStart = i.lastSale; why = '마지막 주택 처분일인'; }
      if (hStart > t) { hp = 0; hNote = (why === '만 30세가 된' ? '만 30세가 되는 ' : why + ' ') + S.fmtDate(hStart) + '부터 산정이 시작됩니다. 그 전이라 0점입니다 (' + basis + ').'; }
      else {
        var hm = S.monthsBetween(hStart, t); hYears = hm / 12; hp = homelessPoints(hYears, true);
        hNote = why + ' ' + S.fmtDate(hStart) + '부터 ' + Math.floor(hYears) + '년 ' + (hm % 12) + '개월 (' + basis + ').' + (why === '만 30세가 된' ? ' 30세 전 기간은 포함되지 않습니다.' : '');
      }
    }
    var dp = dependentPoints(i.dependents);
    var aMonths = i.account ? S.monthsBetween(i.account, t) : 0, ap = accountPoints(aMonths);
    var total = hp + dp + ap;
    S.setText('out-total', total); S.setText('sticky-monthly', total + '점');
    S.setText('out-homeless', hp); S.setText('out-dependent', dp); S.setText('out-account', ap);
    S.setText('note-homeless', hNote);
    S.setText('note-dependent', '본인 제외 ' + i.dependents + '명. 배우자, 직계존속(3년 이상 동일 등본), 미혼 자녀 기준.');
    S.setText('note-account', i.account ? '가입 ' + Math.floor(aMonths / 12) + '년 ' + (aMonths % 12) + '개월 (' + basis + ').' : '청약통장 가입일을 입력하세요.');
    $('sb-h').style.width = (hp / TOTAL * 100) + '%'; $('sb-d').style.width = (dp / TOTAL * 100) + '%'; $('sb-a').style.width = (ap / TOTAL * 100) + '%';
    S.setText('out-note', total > 0 ? '84점 만점 중 ' + total + '점 (' + basis + '). 무주택기간 ' + hp + ' / 부양가족 ' + dp + ' / 통장기간 ' + ap + '. 실제 청약 시 청약홈에서 산정한 점수가 기준이며, 잘못 계산해 당첨되면 취소될 수 있습니다.' : '항목을 입력하면 점수가 계산됩니다.');
    last = { i: i, hp: hp, dp: dp, ap: ap, total: total, hYears: hYears, aMonths: aMonths, basis: basis };
  }
  S.ready(function () {
    S.wireCalc({
      key: 'subscription',
      recalc: function () { render(readInput()); },
      share: function () { return { title: '청약 가점 계산 결과', text: '[청약 가점] 총 ' + last.total + '점 / 84점 (무주택 ' + last.hp + ' · 부양가족 ' + last.dp + ' · 통장 ' + last.ap + ')' }; },
      card: function () {
        return { file: 'subscription-result', title: '청약 가점 계산기', kicker: '예상 청약 가점 (84점 만점)', big: String(last.total), unit: '점',
          rows: [['무주택기간 (최대 32)', last.hp + '점'], ['부양가족 (최대 35)', last.dp + '점'], ['청약통장 가입기간 (최대 17)', last.ap + '점'], ['기준일', last.basis]],
          note: '참고용 계산입니다. 실제 점수는 청약홈 산정 결과를 따르며, 오기재로 당첨 시 취소될 수 있습니다.' };
      }
    });
  });
})();
