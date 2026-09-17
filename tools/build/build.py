# 전체 조립: 기존 페이지 재포장, 새 페이지 생성, 부속 파일
import os, re, json, sys
sys.path.insert(0, os.path.dirname(__file__))
from site_core import *
from pages_new import NEW_PAGES
from pages_cgt import CGT_PAGES
from pages_tools2 import TOOLS2_PAGES
NEW_PAGES.update(CGT_PAGES); NEW_PAGES.update(TOOLS2_PAGES)
from pages_guides import guide_repayment, guide_brokerage, guide_conversion, guide_jeonse_vs_monthly, guides_index, home
from pages_tables import TABLE_PAGES
from pages_forms import FORM_PAGES
from pages_glossary import TERMS, term_page, term_path, glossary_index

os.chdir(ROOT)

# ---------- 1) 기존 계산기 4개: 본문 추출 → 새 틀로 재포장 ----------
OLD_CALC = {  # 파일: (등록부 인덱스, 스크립트, 하단 요약 라벨)
    "rent.html": (0, "js/rent.js", "월 실부담"),
    "loan.html": (4, "js/loan.js", "첫 달 상환액"),
    "yield.html": (8, "js/yield.js", "자기자본 수익률"),
    "fee.html": (3, "js/fee.js", "예상 최대 중개보수"),
}
for src, (idx, script, sticky) in OLD_CALC.items():
    html = read(src)
    f, name, title, desc, cat, short = TOOLS[idx]
    main = extract_main(html)
    ld = extract_ld(html)
    assert 'id="calc-form"' in main, src + ": 계산기 본문이 아닙니다"
    main = patch_calc_main(main)
    if 'id="rel-title"' not in main: main += related(f)
    if 'BreadcrumbList' not in ld: ld += breadcrumb_ld(name, f)
    write(f, page(title, desc, f, main, extra_head=ld, scripts=[script], sticky=sticky))

# ---------- 2) 참고·문서 페이지: 본문만 유지하고 틀 교체 ----------
for (f, name, title, desc, cat, short) in REFS[:2]:
    html = read(f); main = extract_main(html)
    write(f, page(title, desc, f, main, extra_head=breadcrumb_ld(name, f), disclaimer="본 페이지는 참고용이며 금융·세무·법률 자문이 아닙니다."))
for f, name in DOCS:
    html = read(f); main = extract_main(html)
    t = re.search(r"<title>(.*?)</title>", html, re.S).group(1).strip()
    d = re.search(r'<meta name="description" content="(.*?)">', html).group(1)
    # 문서 페이지는 광고 레일 없이 담백하게
    write(f, page(t, d, f, main, with_rails=False, disclaimer="본 사이트는 참고용이며 금융·세무·법률 자문이 아닙니다."))
# 404
html = read("404.html"); main = extract_main(html)
main = main.replace('<a class="tool-card" href="index.html"><p class="t">월세 실부담 계산기</p>', '<a class="tool-card" href="rent.html"><p class="t">월세 실부담 계산기</p>')
write("404.html", page("페이지를 찾을 수 없습니다 — 집계산기", "요청하신 페이지가 없습니다. 집계산기의 계산기 목록에서 원하시는 도구를 찾아보세요.", "404.html", main, noindex=True, with_rails=False))

# ---------- 3) 새 계산기 7개 ----------
for f, (fn, script, sticky) in NEW_PAGES.items():
    main, extra = fn()
    t = [x for x in TOOLS if x[0] == f][0]
    write(f, page(t[2], t[3], f, main, extra_head=extra, scripts=[script], sticky=sticky))

# ---------- 4) 안내 글, 목록, 홈 ----------
write("guide-repayment.html", guide_repayment())
write("guide-brokerage.html", guide_brokerage())
write("guide-conversion.html", guide_conversion())
write("guide-jeonse-vs-monthly.html", guide_jeonse_vs_monthly())
write("guides.html", guides_index())
write("index.html", home())

# ---------- 4b) 표·자료, 서식, 용어 사전 ----------
for f, fn in TABLE_PAGES.items(): write(f, fn())
for f, fn in FORM_PAGES.items(): write(f, fn())
for t in TERMS: write(term_path(t[0]), term_page(t))
write("glossary.html", glossary_index())

# ---------- 5) 부속 파일 ----------
manifest = {
    "name": "집계산기", "short_name": "집계산기", "description": "월세 실부담부터 양도세, 연봉 실수령액까지 계산기 모음",
    "start_url": "./", "scope": "./", "display": "standalone", "background_color": "#f6f4ee", "theme_color": "#0e6b52", "lang": "ko",
    "icons": [{"src": "icon-192.png", "sizes": "192x192", "type": "image/png"}, {"src": "icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable"}]
}
write("manifest.json", json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")

TERM_HTML = [term_path(t[0]) for t in TERMS]
ALL_HTML = [t[0] for t in TOOLS] + [r[0] for r in REFS] + [g[0] for g in GUIDES] + [d[0] for d in DOCS] + [x[0] for x in TABLES] + [x[0] for x in FORMS] + ["glossary.html", "index.html", "404.html"]
assets = ["css/site.css", "js/common.js", "js/analytics.js", "js/forms.js", "favicon.svg", "apple-touch-icon.png", "icon-192.png", "icon-512.png", "manifest.json"] + \
         [f"js/{n}.js" for n in ["rent", "loan", "yield", "fee", "area", "conversion", "subscription", "rent-tax-credit", "dsr", "prepayment", "acquisition-tax", "capital-gains-tax",
                                 "renewal", "tax-calendar", "moving", "rate-compare", "buy-vs-rent", "jeonse-insurance", "jeonse-fraud-check", "salary", "severance"]]
sw = """/* 집계산기 서비스 워커: 정적 자산은 캐시 우선, HTML은 네트워크 우선(오프라인 시 캐시) */
var VERSION = 'jipcalc-v5';
var ASSETS = %s;
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(ASSETS.map(function (a) { return new Request(a, { cache: 'reload' }); })).catch(function () {}); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) { return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  var isHTML = req.mode === 'navigate' || (req.headers.get('accept') || '').indexOf('text/html') !== -1;
  if (isHTML) {
    e.respondWith(fetch(req).then(function (res) { var copy = res.clone(); caches.open(VERSION).then(function (c) { c.put(req, copy); }); return res; })
      .catch(function () { return caches.match(req).then(function (r) { return r || caches.match('404.html'); }); }));
  } else {
    e.respondWith(caches.match(req).then(function (r) { return r || fetch(req).then(function (res) { var copy = res.clone(); caches.open(VERSION).then(function (c) { c.put(req, copy); }); return res; }); }));
  }
});
""" % json.dumps(assets + ALL_HTML, ensure_ascii=False)
write("sw.js", sw)

analytics = """/* 방문 통계 — 측정 ID를 넣기 전까지는 아무것도 하지 않는다.
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
"""
write("js/analytics.js", analytics)

# sitemap
def url(f, freq, pri):
    return f"  <url>\n    <loc>{BASE + ('' if f == 'index.html' else f)}</loc>\n    <lastmod>{TODAY}</lastmod>\n    <changefreq>{freq}</changefreq>\n    <priority>{pri}</priority>\n  </url>\n"
sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
sm += url("index.html", "weekly", "1.0")
for t in TOOLS: sm += url(t[0], "monthly", "0.9")
for r in REFS: sm += url(r[0], "monthly", "0.6")
for g in GUIDES: sm += url(g[0], "monthly", "0.7")
for x in TABLES: sm += url(x[0], "monthly", "0.8")
for x in FORMS: sm += url(x[0], "monthly", "0.7")
sm += url("glossary.html", "weekly", "0.8")
for f in TERM_HTML: sm += url(f, "monthly", "0.6")
for d in DOCS: sm += url(d[0], "yearly", "0.3")
sm += "</urlset>\n"
write("sitemap.xml", sm)
print("완료")
