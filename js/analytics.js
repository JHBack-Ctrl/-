/* 방문 통계 — 측정 ID를 넣기 전까지는 아무것도 하지 않는다.
   GA4: GA_ID = 'G-XXXXXXXXXX'   /  네이버 애널리틱스: NAVER_ID = '발급받은 ID'
   ID를 넣으면 privacy.html 6번 항목을 실제 도입 내용으로 갱신할 것. */
(function () {
  var GA_ID = '';
  var NAVER_ID = '';
  if (location.protocol === 'file:') return;
  if (GA_ID) {
    var s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID; document.head.appendChild(s);
    window.dataLayer = window.dataLayer || []; function gtag() { dataLayer.push(arguments); } window.gtag = gtag;
    gtag('js', new Date()); gtag('config', GA_ID, { anonymize_ip: true });
  }
  if (NAVER_ID) {
    var n = document.createElement('script'); n.async = true; n.src = 'https://wcs.naver.net/wcslog.js';
    n.onload = function () { if (window.wcs) { window.wcs_add = window.wcs_add || {}; window.wcs_add.wa = NAVER_ID; window.wcs.inflow(); window.wcs_do(); } };
    document.head.appendChild(n);
  }
})();
