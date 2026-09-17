(function () {
  'use strict';

  // ---- 상수 (수정 쉽게 한곳에 모아둠) -------------------------------------
  var DEFAULT_DEPOSIT_RATE = 3.0;   // 예금금리 모드 기본 연금리 (%)
  var DEFAULT_LOAN_RATE = 4.5;      // 대출금리 모드 기본 연금리 (%)
  var DEFAULT_JEONSE_RATE = 3.0;    // 전세 기회비용 기본 연금리 (%)
  var DEFAULT_MONTHS = 24;          // 계약기간 기본값 (개월)
  var MONTHS_PER_YEAR = 12;

  // ---- 유틸 -----------------------------------------------------------------
  function $(id) { return document.getElementById(id); }

  // 금액 입력: 숫자 이외 제거(음수 부호 포함), 0 이상 정수
  function parseMoney(str) {
    var digits = String(str || '').replace(/[^\d]/g, '');
    if (!digits) return 0;
    var n = parseInt(digits, 10);
    return isFinite(n) ? n : 0;
  }

  // 금리/개월 입력: 빈값·NaN·음수 → 0
  function parseNonNegative(str) {
    var n = parseFloat(String(str || '').replace(/,/g, ''));
    if (!isFinite(n) || n < 0) return 0;
    return n;
  }

  function formatWon(n) {
    return Math.round(n).toLocaleString('ko-KR');
  }

  function formatRate(r) {
    return (Math.round(r * 100) / 100).toString();
  }

  // ---- 계산 (공식 그대로) ----------------------------------------------------
  function calculate(input) {
    var monthlyRateFactor = input.rate / MONTHS_PER_YEAR / 100;          // 연금리%/12/100
    var jeonseRateFactor = input.jeonseRate / MONTHS_PER_YEAR / 100;

    var fixedMonthly = input.rent + input.maint + input.extra;           // 월고정
    var depositOpp = input.deposit * monthlyRateFactor;                  // 보증금월기회비용
    var realMonthly = fixedMonthly + depositOpp;                         // 실부담월
    var realYearly = realMonthly * MONTHS_PER_YEAR;                      // 실부담연

    var jeonseAsRent = input.jeonse * jeonseRateFactor;                  // 전세→월세상당
    var jeonseOpp = jeonseAsRent;                                        // 전세 조건의 보증금 기회비용(월)
    var jeonseFixed = input.maint + input.extra;
    var jeonseTotal = jeonseFixed + jeonseOpp;

    // 월세→필요전세감 = max(0, (실부담월 − 관리비 − 기타) ÷ (연금리%/12/100)), 분모 0 가드
    var neededJeonse = null;
    if (jeonseRateFactor > 0) {
      neededJeonse = Math.max(0, (realMonthly - input.maint - input.extra) / jeonseRateFactor);
    }

    return {
      fixedMonthly: fixedMonthly,
      depositOpp: depositOpp,
      realMonthly: realMonthly,
      realYearly: realYearly,
      jeonseAsRent: jeonseAsRent,
      jeonseOpp: jeonseOpp,
      jeonseFixed: jeonseFixed,
      jeonseTotal: jeonseTotal,
      neededJeonse: neededJeonse
    };
  }

  // ---- 입력 읽기 -------------------------------------------------------------
  function readInput() {
    var modeEl = document.querySelector('input[name="mode"]:checked');
    return {
      rent: parseMoney($('rent').value),
      maint: parseMoney($('maint').value),
      extra: parseMoney($('extra').value),
      deposit: parseMoney($('deposit').value),
      mode: modeEl ? modeEl.value : 'deposit',
      rate: parseNonNegative($('rate').value),
      jeonse: parseMoney($('jeonse').value),
      jeonseRate: parseNonNegative($('jeonseRate').value),
      months: Math.floor(parseNonNegative($('months').value)) || DEFAULT_MONTHS
    };
  }

  // ---- 렌더 -----------------------------------------------------------------
  function render(input, r) {
    $('out-monthly').textContent = formatWon(r.realMonthly);
    $('out-yearly').textContent = formatWon(r.realYearly);
    $('out-term-note').textContent =
      '계약기간 ' + input.months + '개월 기준 누적 실부담 약 ' + formatWon(r.realMonthly * input.months) + '원 (참고용)';

    $('bd-rent').textContent = formatWon(input.rent);
    $('bd-maint').textContent = formatWon(input.maint);
    $('bd-extra').textContent = formatWon(input.extra);
    $('bd-opp').textContent = formatWon(r.depositOpp);
    $('bd-total').textContent = formatWon(r.realMonthly);
    $('bd-rate-label').textContent =
      '(' + (input.mode === 'loan' ? '대출금리' : '예금금리') + ' ' + formatRate(input.rate) + '%)';

    $('cv-rent-deposit').textContent = formatWon(input.deposit);
    $('cv-jeonse-deposit').textContent = formatWon(input.jeonse);
    $('cv-rent-rent').textContent = formatWon(input.rent);
    $('cv-rent-opp').textContent = formatWon(r.depositOpp);
    $('cv-jeonse-opp').textContent = formatWon(r.jeonseOpp);
    $('cv-rent-fixed').textContent = formatWon(input.maint + input.extra);
    $('cv-jeonse-fixed').textContent = formatWon(r.jeonseFixed);
    $('cv-rent-total').textContent = formatWon(r.realMonthly);
    $('cv-jeonse-total').textContent = formatWon(r.jeonseTotal);

    $('cv-jeonse-as-rent').textContent = formatWon(r.jeonseAsRent);

    var neededWrap = $('cv-needed-jeonse-wrap');
    if (r.neededJeonse === null) {
      neededWrap.innerHTML = '<span id="cv-needed-jeonse">—</span>';
      neededWrap.classList.add('na');
      $('cv-note').textContent = '전세 기회비용 연금리가 0이면 필요 전세금을 환산할 수 없습니다. 금리를 입력하세요.';
    } else {
      neededWrap.innerHTML = '<span id="cv-needed-jeonse">' + formatWon(r.neededJeonse) + '</span>원';
      neededWrap.classList.remove('na');
      $('cv-note').textContent =
        '월세 조건 기회비용은 ' + (input.mode === 'loan' ? '대출금리' : '예금금리') + ' ' + formatRate(input.rate) +
        '%, 전세 조건 환산은 전세 기회비용 연금리 ' + formatRate(input.jeonseRate) + '%를 사용했습니다.';
    }
  }

  function recalc() {
    var input = readInput();
    render(input, calculate(input));
  }

  // ---- 금액 입력 콤마 포맷 ---------------------------------------------------
  function formatMoneyField(el) {
    var raw = el.value;
    if (raw === '') return;
    var n = parseMoney(raw);
    var formatted = n.toLocaleString('ko-KR');
    if (el.value !== formatted) {
      el.value = formatted;
      try { el.setSelectionRange(formatted.length, formatted.length); } catch (e) { /* 일부 브라우저 미지원 */ }
    }
  }

  // ---- 토스트 -----------------------------------------------------------------
  var toastTimer = null;
  function showToast(msg) {
    var t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2200);
  }

  // ---- 이벤트 바인딩 ----------------------------------------------------------
  function init() {
    var form = $('calc-form');

    Array.prototype.forEach.call(document.querySelectorAll('input[data-money]'), function (el) {
      el.addEventListener('input', function () {
        formatMoneyField(el);
        recalc();
      });
      el.addEventListener('blur', function () {
        if (el.value === '') return;
        formatMoneyField(el);
      });
    });

    Array.prototype.forEach.call(form.querySelectorAll('input[type="number"]'), function (el) {
      el.addEventListener('input', recalc);
    });

    Array.prototype.forEach.call(form.querySelectorAll('input[name="mode"]'), function (el) {
      el.addEventListener('change', function () {
        $('rate').value = el.value === 'loan' ? DEFAULT_LOAN_RATE.toFixed(1) : DEFAULT_DEPOSIT_RATE.toFixed(1);
        recalc();
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      recalc();
      var result = $('result');
      if (result && result.scrollIntoView) {
        result.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-soon]'), function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        showToast(el.getAttribute('data-soon') + ' — 준비 중');
      });
    });

    var navToggle = document.querySelector('.nav-toggle');
    var navList = $('nav-list');
    if (navToggle && navList) {
      navToggle.addEventListener('click', function () {
        var open = navList.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      Array.prototype.forEach.call(navList.querySelectorAll('a'), function (a) {
        a.addEventListener('click', function () {
          navList.classList.remove('open');
          navToggle.setAttribute('aria-expanded', 'false');
        });
      });
    }

    // 초기값 세팅 후 첫 계산
    $('rate').value = DEFAULT_DEPOSIT_RATE.toFixed(1);
    $('jeonseRate').value = DEFAULT_JEONSE_RATE.toFixed(1);
    $('months').value = DEFAULT_MONTHS;
    recalc();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
