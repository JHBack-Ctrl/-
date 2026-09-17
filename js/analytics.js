/* 방문 통계 — ID를 비우면 그 도구는 아무것도 로드하지 않는다.
   GA4: analytics.google.com 의 측정 ID (G-로 시작)
   네이버 애널리틱스: analytics.naver.com 사이트정보의 발급ID
   ID를 바꾸거나 도구를 더하면 privacy.html 6-1 항목도 함께 갱신할 것. */
(function () {
  var GA_ID = 'G-H6LHC9GYQH';
  var NAVER_ID = '1c5c9c6d95dc2d0';
  if (location.protocol === 'file:') return;   // 로컬에서 열었을 때는 집계하지 않는다
  if (GA_ID) {
    var s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID; document.head.appendChild(s);
    window.dataLayer = window.dataLayer || []; function gtag() { dataLayer.push(arguments); } window.gtag = gtag;
    gtag('js', new Date()); gtag('config', GA_ID, { anonymize_ip: true });
  }
  if (NAVER_ID) {
    // 네이버가 발급한 스니펫과 같은 형태 (wcs.pstatic.net, wcs_add.wa 설정 후 wcs_do)
    window.wcs_add = window.wcs_add || {};
    window.wcs_add.wa = NAVER_ID;
    var n = document.createElement('script'); n.async = true; n.src = 'https://wcs.pstatic.net/wcslog.js';
    n.onload = function () { if (window.wcs_do) window.wcs_do(); };
    document.head.appendChild(n);
  }
})();
