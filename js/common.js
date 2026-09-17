/* 공통 유틸: 숫자 파싱/포맷, 금액 입력 콤마, 토스트, 공유 링크, 내비 */
(function (global) {
  'use strict';

  function $(id) { return document.getElementById(id); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  // 금액: 숫자 이외 제거(음수 부호 포함), 0 이상 정수
  function parseMoney(str) {
    var digits = String(str == null ? '' : str).replace(/[^\d]/g, '');
    if (!digits) return 0;
    var n = parseInt(digits, 10);
    return isFinite(n) ? n : 0;
  }

  // 비율/개월: 빈값·NaN·음수 → 0
  function parseNonNegative(str) {
    var n = parseFloat(String(str == null ? '' : str).replace(/,/g, ''));
    if (!isFinite(n) || n < 0) return 0;
    return n;
  }

  function fmtWon(n) { return Math.round(n || 0).toLocaleString('ko-KR'); }
  function fmtRate(r) { return (Math.round((r || 0) * 100) / 100).toString(); }
  function fmtPct(r) { return (Math.round((r || 0) * 100) / 100).toFixed(2); }

  // 큰 금액을 "1억 2,000만원" 식으로 (보조 표기용)
  function fmtKorean(n) {
    n = Math.round(n || 0);
    if (n < 10000) return fmtWon(n) + '원';
    var eok = Math.floor(n / 100000000);
    var man = Math.floor((n % 100000000) / 10000);
    var won = n % 10000;
    var parts = [];
    if (eok) parts.push(fmtWon(eok) + '억');
    if (man) parts.push(fmtWon(man) + '만');
    if (won && !eok) parts.push(fmtWon(won));
    return parts.join(' ') + '원';
  }

  function setText(id, text) { var el = $(id); if (el) el.textContent = text; }

  // ---- 금액 입력 콤마 포맷 ----
  function formatMoneyField(el) {
    var raw = el.value;
    if (raw === '') return;
    var n = parseMoney(raw);
    var formatted = n.toLocaleString('ko-KR');
    if (el.value !== formatted) {
      el.value = formatted;
      try { el.setSelectionRange(formatted.length, formatted.length); } catch (e) { /* 미지원 */ }
    }
  }
  function bindMoneyInputs(root, onChange) {
    $$('input[data-money]', root).forEach(function (el) {
      el.addEventListener('input', function () { formatMoneyField(el); if (onChange) onChange(); });
      el.addEventListener('blur', function () { if (el.value !== '') formatMoneyField(el); });
    });
  }
  function setMoney(id, n) { var el = $(id); if (el) el.value = n ? Number(n).toLocaleString('ko-KR') : (n === 0 ? '0' : ''); }

  // ---- 토스트 ----
  var toastTimer = null;
  function toast(msg) {
    var t = $('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2200);
  }

  // ---- 클립보드 ----
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', '');
      ta.style.position = 'fixed'; ta.style.left = '-9999px';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); resolve(); } catch (e) { reject(e); }
      document.body.removeChild(ta);
    });
  }

  // ---- 공유 링크 (입력값을 URL 쿼리에 담음. 저장 없음) ----
  function buildShareUrl(params) {
    var q = [];
    Object.keys(params).forEach(function (k) {
      var v = params[k];
      if (v === '' || v == null) return;
      q.push(encodeURIComponent(k) + '=' + encodeURIComponent(v));
    });
    return location.origin + location.pathname + (q.length ? '?' + q.join('&') : '');
  }
  function readQuery() {
    var out = {};
    var s = location.search.replace(/^\?/, '');
    if (!s) return out;
    s.split('&').forEach(function (kv) {
      var i = kv.indexOf('=');
      var k = decodeURIComponent(i < 0 ? kv : kv.slice(0, i));
      var v = decodeURIComponent(i < 0 ? '' : kv.slice(i + 1));
      out[k] = v;
    });
    return out;
  }
  function bindShareButton(btnId, getParams) {
    var btn = $(btnId);
    if (!btn) return;
    btn.addEventListener('click', function () {
      var url = buildShareUrl(getParams());
      copyText(url).then(function () { toast('결과 링크를 복사했습니다'); })
        .catch(function () { toast('복사에 실패했습니다. 주소창을 복사해 주세요'); });
      try { history.replaceState(null, '', url); } catch (e) { /* 무시 */ }
    });
  }

  // ---- 내비: 현재 페이지 표시 ----
  function markCurrentNav() {
    var here = location.pathname.split('/').pop() || 'index.html';
    $$('.tool-nav a, .footer-links a').forEach(function (a) {
      var href = (a.getAttribute('href') || '').split('?')[0];
      if (href === here || (here === 'index.html' && (href === './' || href === '.' || href === ''))) {
        a.setAttribute('aria-current', 'page');
      }
    });
  }

  // ---- 모바일 하단 요약 바 ----
  function bindStickySummary(targetId) {
    var bar = $('sticky-summary');
    var target = $(targetId);
    if (!bar || !target || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { bar.classList.toggle('show', !en.isIntersecting && en.boundingClientRect.top > 0); });
    }, { threshold: 0.2 });
    io.observe(target);
  }

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn();
  }

  global.Site = {
    $: $, $$: $$, parseMoney: parseMoney, parseNonNegative: parseNonNegative,
    fmtWon: fmtWon, fmtRate: fmtRate, fmtPct: fmtPct, fmtKorean: fmtKorean, setText: setText,
    bindMoneyInputs: bindMoneyInputs, setMoney: setMoney, formatMoneyField: formatMoneyField,
    toast: toast, copyText: copyText, buildShareUrl: buildShareUrl, readQuery: readQuery, bindShareButton: bindShareButton,
    bindStickySummary: bindStickySummary, ready: ready
  };

  ready(markCurrentNav);
})(window);
