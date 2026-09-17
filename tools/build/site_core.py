# 집계산기 사이트 빌더 — 공통 틀(헤더·메뉴·레일·푸터)과 페이지 등록부
import json, re, os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
BASE = "https://jhback-ctrl.github.io/-/"
TODAY = "2026-09-17"

# ---------------- 페이지 등록부 ----------------
# (파일, 짧은 이름, 제목, description, 카테고리, 한 줄 설명)
TOOLS = [
    ("rent.html", "월세 실부담", "월세 실부담 계산기 — 관리비·보증금까지",
     "월세 실부담 계산기. 월세·관리비·기타 고정비에 보증금 기회비용까지 더해 진짜 매달 나가는 돈을 계산하고, 전세 월세 환산 비교표와 두 매물 비교를 확인하세요. 모든 계산은 브라우저에서만 처리되며 저장되지 않습니다.",
     "임대", "관리비와 보증금 기회비용까지 더한 진짜 월 지출"),
    ("conversion.html", "전월세 전환율", "전월세 전환율 계산기 — 법정 전환율로 전세·월세 환산",
     "전월세 전환율 계산기. 한국은행 기준금리에 2%p를 더한 법정 전환율로 전세를 월세로, 월세를 전세로 환산합니다. 시장 전환율과 나란히 비교하고 계약 갱신 시 상한을 확인하세요.",
     "임대", "법정 전환율로 전세를 월세로, 월세를 전세로"),
    ("rent-tax-credit.html", "월세 세액공제", "월세 세액공제 계산기 — 연말정산 환급액 추정",
     "월세 세액공제 계산기. 총급여와 월세를 넣으면 공제율 15% 또는 17%와 연 1,000만원 한도를 적용해 연말정산에서 돌려받을 수 있는 세액공제액을 추정합니다.",
     "임대", "연말정산에서 돌려받는 월세 세액공제액"),
    ("fee.html", "중개보수", "중개보수(복비) 계산기 — 법정 상한 기준",
     "부동산 중개보수(복비) 계산기. 주택·오피스텔·상가의 매매, 전세, 월세 거래금액을 넣으면 법정 상한 요율 기준 예상 최대 중개보수와 부가세를 계산합니다.",
     "임대", "법정 상한 요율 기준 예상 최대 중개보수"),
    ("loan.html", "대출이자", "대출이자 계산기 — 원리금균등·원금균등·만기일시",
     "대출이자 계산기. 대출금액·연금리·기간을 넣으면 원리금균등, 원금균등, 만기일시 상환 방식별 월 상환액과 총 이자, 회차별 상환표를 계산합니다.",
     "대출", "상환 방식별 월 상환액과 회차별 상환표"),
    ("dsr.html", "DSR·LTV 한도", "DSR·LTV 대출 한도 계산기 — 주택담보대출 가능 금액",
     "DSR·LTV 대출 한도 계산기. 연소득, 담보 시세, 기존 대출 상환액, 스트레스 금리를 넣으면 LTV 한도와 DSR 한도 중 낮은 값으로 주택담보대출 가능 금액을 추정합니다.",
     "대출", "연소득과 담보로 보는 대출 가능 금액"),
    ("prepayment.html", "중도상환수수료", "중도상환수수료 계산기 — 잔여일수 기준",
     "중도상환수수료 계산기. 상환금액, 수수료율, 대출 실행일과 상환일을 넣으면 잔여일수 비율로 중도상환수수료와 면제일을 계산합니다.",
     "대출", "잔여일수 비율로 계산한 수수료와 면제일"),
    ("acquisition-tax.html", "취득세", "취득세 계산기 — 주택·상가 취득세와 지방교육세·농특세",
     "취득세 계산기. 취득가액, 주택 수와 조정대상지역 여부, 전용면적을 넣으면 취득세와 지방교육세, 농어촌특별세를 합한 예상 세금을 참고용으로 추정합니다.",
     "매매·투자", "취득세·지방교육세·농특세 참고용 추정"),
    ("yield.html", "상가 수익률", "상가 수익률 계산기 — 공실·대출 반영",
     "상가 수익률 계산기. 매매가·보증금·월세·운영비·공실률·대출 조건을 넣으면 연 순영업수익, 총투자 수익률과 자기자본 수익률을 계산합니다.",
     "매매·투자", "공실과 대출을 반영한 총투자·자기자본 수익률"),
    ("subscription.html", "청약 가점", "청약 가점 계산기 — 무주택기간·부양가족·통장기간 84점",
     "청약 가점 계산기. 생년월일, 혼인일, 부양가족 수, 청약통장 가입일을 넣으면 무주택기간 32점, 부양가족 35점, 가입기간 17점을 합한 청약 가점을 계산합니다.",
     "매매·투자", "무주택기간·부양가족·통장기간 84점 만점"),
    ("area.html", "평수 변환", "평수 변환기 — 평 ㎡ 변환과 평당 가격",
     "평수 변환기. 평을 제곱미터로, 제곱미터를 평으로 바꾸고 총액과 면적으로 평당·㎡당 가격을 계산합니다. 전용면적과 공급면적 차이도 설명합니다.",
     "매매·투자", "평 ↔ ㎡ 변환과 평당 가격"),
]
REFS = [
    ("checklist.html", "양도·취득 체크리스트", "양도·취득 체크리스트 — 확인 항목과 서류",
     "부동산 취득과 양도 전에 확인할 항목과 준비 서류 체크리스트. 세액 계산이나 법령 해석은 하지 않으며, 세무사·법무사 상담 전 정리용입니다.", "참고", "계약 전후 확인 항목과 준비 서류"),
    ("policy.html", "세제·정책 참고", "세제·정책 참고 — 공식 확인처 모음",
     "부동산 세금과 정책을 확인할 때 참고할 공식 기관과 확인 포인트 모음. 세율이나 법령을 해석하지 않으며 어디서 무엇을 확인해야 하는지 안내합니다.", "참고", "세금별 확인 포인트와 공식 기관 링크"),
    ("guides.html", "안내 글", "안내 글 — 부동산 숫자 읽는 법",
     "월세, 대출, 전월세 전환, 중개보수를 이해하는 데 필요한 개념을 설명하는 안내 글 모음입니다.", "참고", "개념 설명과 계산 방법"),
]
GUIDES = [
    ("guide-repayment.html", "원리금균등과 원금균등, 무엇이 다른가", "원리금균등과 원금균등 차이 — 어떤 상환 방식을 골라야 하나",
     "원리금균등, 원금균등, 만기일시 상환 방식의 차이를 숫자로 비교합니다. 총 이자와 월 부담이 어떻게 달라지는지, 어떤 상황에 어떤 방식이 맞는지 설명합니다."),
    ("guide-brokerage.html", "복비, 얼마까지 내야 하나", "복비(중개보수) 계산 방법 — 요율표 읽는 법과 협의 요령",
     "부동산 중개보수 요율표를 읽는 법, 월세 거래금액 환산, 한도액, 부가세, 협의 요령을 설명합니다."),
    ("guide-conversion.html", "전월세 전환율, 어디에 쓰는 숫자인가", "전월세 전환율이란 — 법정 전환율과 시장 전환율의 차이",
     "전월세 전환율의 뜻, 법정 전환율이 적용되는 경우와 아닌 경우, 시장 전환율과의 차이, 전세와 월세 중 무엇이 나은지 판단하는 기준을 설명합니다."),
    ("guide-jeonse-vs-monthly.html", "전세와 월세, 숫자로 비교하는 법", "전세 vs 월세 비교 — 보증금 기회비용으로 같은 기준 만들기",
     "전세와 월세를 같은 기준으로 비교하려면 보증금 기회비용을 넣어야 합니다. 계산 순서와 흔한 착각, 금액 외에 봐야 할 것을 정리합니다."),
]
DOCS = [
    ("about.html", "사이트 소개"), ("privacy.html", "개인정보처리방침"), ("terms.html", "이용약관"),
]
CATS = ["임대", "대출", "매매·투자", "참고"]

def tools_by_cat(cat):
    return [t for t in TOOLS + REFS if t[4] == cat]

# ---------------- 공통 조각 ----------------
ICON_SUN = '<svg class="sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>'
ICON_MOON = '<svg class="moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>'
ICON_MENU = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'

QUICK_NAV = [("index.html", "홈"), ("rent.html", "월세"), ("loan.html", "대출이자"), ("acquisition-tax.html", "취득세"), ("area.html", "평수"), ("subscription.html", "청약"), ("guides.html", "안내 글")]

def menu_panel():
    groups = []
    for cat in CATS:
        items = "".join(f'<li><a href="{f}">{name}<small>{desc}</small></a></li>' for (f, name, _t, _d, _c, desc) in tools_by_cat(cat))
        groups.append(f'<div class="menu-group"><h3>{cat}</h3><ul>{items}</ul></div>')
    docs = "".join(f'<li><a href="{f}">{n}</a></li>' for f, n in DOCS)
    return f'''      <div id="menu-panel" class="menu-panel" hidden>
        <div class="container">
          <div class="menu-groups">
            {"".join(groups)}
          </div>
          <ul class="footer-links" style="margin:14px 0 0">{docs}</ul>
        </div>
      </div>'''

def header():
    quick = "".join(f'<li><a href="{f}">{n}</a></li>' for f, n in QUICK_NAV)
    return f'''  <header class="site-header">
    <div class="container">
      <div class="header-row">
        <a class="brand" href="./" aria-label="집계산기 홈"><span class="brand-mark" aria-hidden="true"></span>집계산기</a>
        <div class="header-actions">
          <button type="button" id="theme-toggle" class="icon-btn" aria-pressed="false" aria-label="어두운 화면으로 전환">{ICON_SUN}{ICON_MOON}</button>
          <button type="button" id="menu-toggle" class="icon-btn" aria-expanded="false" aria-controls="menu-panel">{ICON_MENU}전체 계산기</button>
        </div>
      </div>
      <nav aria-label="빠른 메뉴">
        <ul class="tool-nav">{quick}</ul>
      </nav>
    </div>
{menu_panel()}
  </header>'''

def rail():
    return '''  <aside class="rail" aria-label="광고">
    <div class="card slot">
      <span class="slot-label">광고</span>
      <div class="ad-placeholder">애드센스 세로 슬롯 자리<br>(플레이스홀더)</div>
    </div>
  </aside>'''

def footer(disclaimer="본 계산기는 참고용이며 금융·세무·법률 자문이 아닙니다.", privacy="입력값은 서버로 전송되거나 저장되지 않습니다. 최근 계산 기억 기능을 켜면 이 기기 브라우저에만 저장됩니다."):
    cols = []
    for cat in CATS:
        items = "".join(f'<li><a href="{f}">{n}</a></li>' for (f, n, *_r) in tools_by_cat(cat))
        cols.append(f'<div class="menu-group"><h3>{cat}</h3><ul>{items}</ul></div>')
    docs = "".join(f'<li><a href="{f}">{n}</a></li>' for f, n in DOCS)
    return f'''  <footer class="site-footer">
    <div class="container">
      <div class="menu-groups" style="margin-bottom:18px">{"".join(cols)}</div>
      <ul class="footer-links">{docs}</ul>
      <p class="disclaimer">{disclaimer}</p>
      <p class="privacy">{privacy}</p>
    </div>
  </footer>'''

def head(title, desc, path, extra="", noindex=False, og_type="website"):
    url = BASE + ("" if path == "index.html" else path)
    return f'''<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <meta name="description" content="{desc}">
  <meta name="theme-color" content="#f6f4ee">
{'  <meta name="robots" content="noindex, follow">' + chr(10) if noindex else ''}  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
  <link rel="stylesheet" href="css/site.css">
  <link rel="canonical" href="{url}">
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="apple-touch-icon.png">
  <link rel="manifest" href="manifest.json">
  <meta property="og:type" content="{og_type}">
  <meta property="og:site_name" content="집계산기">
  <meta property="og:locale" content="ko_KR">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{desc}">
  <meta property="og:url" content="{url}">
  <meta property="og:image" content="{BASE}og.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{title}">
  <meta name="twitter:description" content="{desc}">
  <meta name="twitter:image" content="{BASE}og.png">
{extra}</head>
<body>
  <a class="skip-link" href="#main">본문으로 건너뛰기</a>
'''

def page(title, desc, path, main_html, extra_head="", scripts=(), noindex=False, sticky=None, with_rails=True, disclaimer=None, og_type="website"):
    sc = "".join(f'\n  <script src="{s}"></script>' for s in scripts)
    sticky_html = f'''
  <div id="sticky-summary" class="sticky-summary" aria-hidden="true">
    <div><p class="k">{sticky}</p><p class="v"><span id="sticky-monthly">0</span></p></div>
    <a href="#result">결과 보기</a>
  </div>''' if sticky else ""
    shell_open = '<div class="page-shell">\n' + rail() + '\n' if with_rails else ''
    shell_close = '\n' + rail() + '\n</div>' if with_rails else ''
    foot = footer(disclaimer) if disclaimer else footer()
    return (head(title, desc, path, extra_head, noindex, og_type) + "\n" + header() + "\n\n" + shell_open
            + '  <main id="main" class="container">\n' + main_html + '\n  </main>' + shell_close + "\n\n" + foot + sticky_html
            + '\n\n  <div id="toast" class="toast" role="status" aria-live="polite"></div>\n  <script src="js/common.js"></script>\n  <script src="js/analytics.js"></script>' + sc + '\n</body>\n</html>\n')

def jsonld(data):
    return '  <script type="application/ld+json">\n' + json.dumps(data, ensure_ascii=False, indent=2) + "\n  </script>\n"

def app_ld(name, desc, path):
    return jsonld({"@context": "https://schema.org", "@type": "WebApplication", "name": name, "url": BASE + path, "description": desc,
                   "applicationCategory": "FinanceApplication", "operatingSystem": "All", "inLanguage": "ko-KR", "isAccessibleForFree": True,
                   "offers": {"@type": "Offer", "price": "0", "priceCurrency": "KRW"}, "publisher": {"@type": "Organization", "name": "집계산기", "url": BASE}})

def faq_ld(items):
    return jsonld({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": " ".join(re.sub(r"<[^>]+>", "", a) for a in ans)}} for q, ans in items]})

def article_ld(title, desc, path):
    return jsonld({"@context": "https://schema.org", "@type": "Article", "headline": title, "description": desc, "url": BASE + path,
                   "datePublished": TODAY, "dateModified": TODAY, "inLanguage": "ko-KR",
                   "author": {"@type": "Organization", "name": "집계산기"}, "publisher": {"@type": "Organization", "name": "집계산기", "url": BASE}})

def breadcrumb_ld(name, path):
    return jsonld({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "집계산기", "item": BASE},
        {"@type": "ListItem", "position": 2, "name": name, "item": BASE + path}]})

def faq_section(items, intro="자주 나오는 질문을 모았습니다."):
    parts = [f'''
    <section class="card" aria-labelledby="faq-title">
      <h2 id="faq-title">자주 묻는 질문</h2>
      <p class="hint">{intro}</p>
      <div class="faq">''']
    for q, answers in items:
        body = "\n".join(f"          <p>{a}</p>" for a in answers)
        parts.append(f'''        <details>
          <summary>{q}</summary>
          <div class="a">
{body}
          </div>
        </details>''')
    parts.append("      </div>\n    </section>")
    return "\n".join(parts)

def prose_section(title, blocks, sid="guide-title"):
    return f'''
    <section class="card" aria-labelledby="{sid}">
      <h2 id="{sid}">{title}</h2>
      <div class="prose">
{chr(10).join(blocks)}
      </div>
    </section>'''

INLINE_AD = '''
    <aside class="card slot inline" aria-label="광고">
      <span class="slot-label">광고</span>
      <div class="ad-placeholder">애드센스 본문 슬롯 자리 (플레이스홀더)</div>
    </aside>'''

def action_buttons(extra=""):
    return f'''            <div class="btn-row">
              <button type="button" id="native-share-btn" class="btn btn-ghost btn-sm"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M12 16V3M7 8l5-5 5 5"/></svg>공유하기</button>
              <button type="button" id="share-btn" class="btn btn-ghost btn-sm">링크 복사</button>
              <button type="button" id="image-btn" class="btn btn-ghost btn-sm"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>이미지 저장</button>{extra}
            </div>'''

REMEMBER_TOGGLE = '''            <div class="field" style="margin-top:14px">
              <label class="toggle"><input type="checkbox" id="remember-toggle"><span class="knob" aria-hidden="true"></span>최근 계산 기억하기</label>
              <p class="field-help">이 기기의 브라우저에만 저장되며 서버로 보내지 않습니다. 끄면 저장한 값을 지웁니다.</p>
            </div>
'''

def related(cur):
    items = [t for t in TOOLS if t[0] != cur][:4]
    cards = "".join(f'<a class="tool-card" href="{f}"><p class="t">{n}</p><p class="d">{d}</p></a>' for (f, n, _t, _d, _c, d) in items)
    return f'''
    <section class="card related" aria-labelledby="rel-title">
      <h2 id="rel-title">함께 쓰는 계산기</h2>
      <div class="tool-grid">{cards}</div>
    </section>'''

def read(path): return open(os.path.join(ROOT, path), encoding="utf-8").read()
def write(path, s):
    open(os.path.join(ROOT, path), "w", encoding="utf-8").write(s); print("wrote", path)

def extract_main(html):
    m = re.search(r"<main[^>]*>(.*)</main>", html, re.S)
    return m.group(1).strip("\n")

def extract_ld(html):
    return "".join(re.findall(r"  <script type=\"application/ld\+json\">.*?</script>\n", html, re.S))

def patch_calc_main(main):
    """기존 계산기 본문에 액션 버튼·기억 토글·본문 광고를 넣는다. 여러 번 실행해도 중복되지 않는다."""
    if 'id="native-share-btn"' not in main:
        main = re.sub(r'            <div class="btn-row">.*?</div>', lambda m: action_buttons('\n              <button type="button" id="copy-btn" class="btn btn-ghost btn-sm">결과 텍스트 복사</button>' if 'copy-btn' in m.group(0) else ''), main, count=1, flags=re.S)
    if 'id="remember-toggle"' not in main:
        main = main.replace('            <button type="submit" class="btn btn-primary">', REMEMBER_TOGGLE + '            <button type="submit" class="btn btn-primary">', 1)
    if 'slot inline' not in main:
        main = main.replace('\n    <section class="card" aria-labelledby="faq-title">', INLINE_AD + '\n    <section class="card" aria-labelledby="faq-title">', 1)
    return main
