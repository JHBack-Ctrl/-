# 서식 페이지 3개 — 월세 영수증, 통지문 예시, 특약 문구 모음
from site_core import *

def form_page(idx, eyebrow, sub, body, related_paths, scripts=("js/forms.js",)):
    f, name, title, desc, short = FORMS[idx]
    rel = "".join(f'<a class="tool-card" href="{p}"><p class="t">{n}</p><p class="d">{d}</p></a>' for (p, n, _t, _d, _c, d) in [t for t in TOOLS if t[0] in related_paths])
    main = f'''    <section class="hero">
      <p class="eyebrow">{eyebrow}</p>
      <h1>{name}</h1>
      <p class="hero-sub">{sub}</p>
    </section>
{body}{INLINE_AD}
    <section class="card related" aria-labelledby="rel-title">
      <h2 id="rel-title">함께 쓰는 계산기</h2>
      <div class="tool-grid">{rel}</div>
    </section>'''
    return page(title, desc, f, main, extra_head=breadcrumb_ld(name, f), scripts=list(scripts), disclaimer="본 서식과 문구는 참고용 예시이며 법률 자문이 아닙니다. 구체적인 사안은 전문가와 상의하세요.")

def doc_block(bid, title, text, note=None):
    n = f'<p class="hint">{note}</p>' if note else ""
    return f'''
    <section class="card">
      <div class="card-head"><h2>{title}</h2><button type="button" class="btn btn-ghost btn-sm" data-copy="{bid}">복사</button></div>
      <div class="doc-text" id="{bid}">{text}</div>
      {n}
    </section>'''

# ---------------- 월세 영수증 ----------------
def rent_receipt():
    body = '''
    <div class="layout">
      <div>
        <section class="card" id="form-inputs">
          <h2>내용 입력</h2>
          <p class="hint">입력값은 이 화면에만 쓰이고 저장되지 않습니다.</p>
          <div class="field"><label for="payee">임대인 (받는 사람)</label><input id="payee" type="text" placeholder="홍길동"></div>
          <div class="field"><label for="payer">임차인 (내는 사람)</label><input id="payer" type="text" placeholder="김철수"></div>
          <div class="field"><label for="address">임차 주소</label><input id="address" type="text" placeholder="서울시 ○○구 ○○로 12, 101동 202호"></div>
          <div class="field"><label for="amount">월세 금액</label><div class="input-wrap"><input id="amount" type="text" inputmode="numeric" placeholder="600,000" data-money><span class="suffix">원</span></div></div>
          <div class="field"><label for="period">해당 기간</label><input id="period" type="text" placeholder="2026년 9월분 (9/1 ~ 9/30)"></div>
          <div class="field"><label for="date">영수일</label><input id="date" type="date"></div>
          <div class="field"><label for="method">지급 방법</label><select id="method"><option>계좌이체</option><option>현금</option><option>기타</option></select></div>
          <div class="btn-row"><button type="button" class="btn btn-primary" data-print>인쇄 · PDF 저장</button></div>
        </section>
      </div>
      <div>
        <section class="card">
          <div class="receipt" id="receipt">
            <h2>영 수 증</h2>
            <table>
              <tr><th>금액</th><td><strong data-from="amount" data-blank="________원"></strong> <span id="amount-korean"></span></td></tr>
              <tr><th>내역</th><td>월세 <span data-from="period" data-blank="____년 __월분"></span></td></tr>
              <tr><th>임차 주소</th><td data-from="address"></td></tr>
              <tr><th>임차인</th><td data-from="payer"></td></tr>
              <tr><th>지급 방법</th><td data-from="method"></td></tr>
            </table>
            <p class="receipt-line">위 금액을 월세로 정히 영수합니다.</p>
            <p class="receipt-date" data-from="date"></p>
            <p class="receipt-sign">임대인 <span data-from="payee" data-blank="__________"></span> (인)</p>
          </div>
        </section>
      </div>
    </div>
    <section class="card">
      <h2>영수증, 꼭 필요한가</h2>
      <div class="prose">
        <p><strong>월세 세액공제</strong>에는 영수증이 필요 없습니다. 계약서 사본, 주민등록등본, 계좌이체 내역이면 됩니다. 현금으로 냈다면 이 영수증이라도 받아두어야 하지만, 공제를 생각하면 계좌이체가 훨씬 안전합니다. <a href="rent-tax-credit.html">월세 세액공제 계산기</a></p>
        <p><strong>현금영수증</strong>은 임대인이 발급을 거부해도 임차인이 홈택스에서 '주택임차료 현금영수증 발급 신청'을 하면 됩니다. 계약서와 이체 내역을 첨부하며, 임대인 동의는 필요 없습니다.</p>
        <p><strong>임대인 입장</strong>에서는 영수증을 써주는 것이 임대소득 신고와 무관하게 분쟁을 줄이는 방법입니다. 받은 금액과 기간을 정확히 적으세요.</p>
      </div>
    </section>'''
    return form_page(0, "Form · Rent Receipt", "입력하면 완성되고 바로 인쇄할 수 있는 월세 영수증", body, ["rent-tax-credit.html", "rent.html", "renewal.html", "conversion.html"])

# ---------------- 통지문 예시 ----------------
def notice_forms():
    renew = """임대인 ○○○ 귀하

임차인 ○○○입니다. 아래 임대차계약에 대하여 주택임대차보호법 제6조의3에 따라 계약갱신을 요구합니다.

- 임차 주소: 서울시 ○○구 ○○로 12, 101동 202호
- 계약 기간: 2025년 ○월 ○일 ~ 2027년 ○월 ○일
- 현재 조건: 보증금 ○○○원, 월세 ○○○원

갱신 조건은 현재 계약과 동일하게 하되, 임대료 조정이 필요하다면 같은 법 제7조에 따른 5% 범위 안에서 협의하기를 바랍니다. 회신을 부탁드립니다.

2026년 ○월 ○일
임차인 ○○○ (연락처 010-0000-0000)"""
    end = """임대인 ○○○ 귀하

임차인 ○○○입니다. 아래 임대차계약을 만기일에 종료하고 이사할 예정임을 알려드립니다.

- 임차 주소: 서울시 ○○구 ○○로 12, 101동 202호
- 계약 만기일: 2027년 ○월 ○일

만기일에 보증금 ○○○원을 아래 계좌로 반환해 주시기 바랍니다. 이사 일정과 집 상태 확인 시간은 협의하여 정하겠습니다.

- 반환 계좌: ○○은행 000-0000-0000 (예금주 ○○○)

2026년 ○월 ○일
임차인 ○○○ (연락처 010-0000-0000)"""
    landlord = """임차인 ○○○ 귀하

임대인 ○○○입니다. 아래 임대차계약에 대하여 만기일에 계약을 종료(갱신 거절)하고자 함을 알려드립니다.

- 임차 주소: 서울시 ○○구 ○○로 12, 101동 202호
- 계약 만기일: 2027년 ○월 ○일
- 갱신 거절 사유: 임대인 본인의 실제 거주 (주택임대차보호법 제6조의3 제1항 제8호)

보증금은 만기일에 임차인이 지정하는 계좌로 반환하겠습니다. 이사 일정은 협의하여 정하겠습니다.

2026년 ○월 ○일
임대인 ○○○ (연락처 010-0000-0000)"""
    demand = """내 용 증 명

수신인: ○○○ (임대인) / 주소: ○○○
발신인: ○○○ (임차인) / 주소: ○○○

제목: 임대차보증금 반환 청구

1. 발신인은 수신인과 아래 주택에 관하여 임대차계약을 체결하고 거주하였습니다.
   - 주소: 서울시 ○○구 ○○로 12, 101동 202호
   - 계약 기간: 2024년 ○월 ○일 ~ 2026년 ○월 ○일
   - 보증금: ○○○원

2. 위 계약은 2026년 ○월 ○일 만기로 종료되었고, 발신인은 만기 전 계약 종료 의사를 통지하였습니다. 그러나 수신인은 현재까지 보증금을 반환하지 않고 있습니다.

3. 이에 본 내용증명 수령일부터 7일 이내에 보증금 ○○○원을 아래 계좌로 반환할 것을 청구합니다.
   - ○○은행 000-0000-0000 (예금주 ○○○)

4. 기한 내 반환이 없을 경우 임차권등기명령 신청, 지급명령 및 보증금반환청구 소송 등 법적 절차를 진행할 것이며, 지연이자와 소송 비용을 함께 청구할 예정임을 알려드립니다.

2026년 ○월 ○일
발신인 ○○○ (인)"""
    body = '''
    <section class="card">
      <h2>언제, 어떻게 보내나</h2>
      <div class="prose">
        <ul>
          <li><strong>갱신 요구</strong>는 만기 6개월 전부터 2개월 전 사이에 임대인에게 <em>도달</em>해야 합니다. <a href="renewal.html">갱신 청구권 계산기</a>로 날짜를 확인하세요.</li>
          <li><strong>종료 통지</strong>도 같은 기간 안에 해야 묵시적 갱신을 막습니다. 임대인의 갱신 거절은 법정 사유가 있을 때만 유효합니다.</li>
          <li><strong>방법</strong>: 문자·카카오톡은 읽음 표시와 답장을 보관하세요. 다툼이 예상되면 우체국 내용증명(3부 작성, 발신인·수신인·우체국 보관)이 확실합니다. 인터넷우체국에서 온라인으로도 보낼 수 있습니다.</li>
          <li><strong>보증금 반환 청구</strong> 내용증명은 만기 후 보증금을 못 받았을 때 보냅니다. 이사를 나가야 한다면 <em>임차권등기명령</em>을 먼저 받아 대항력을 유지하세요.</li>
        </ul>
      </div>
    </section>''' + doc_block("doc-renew", "1. 계약 갱신 요구 (임차인 → 임대인)", renew, "문자로 보낼 때는 첫 줄과 계약 정보, 갱신 요구 문장만 있어도 됩니다.") + \
        doc_block("doc-end", "2. 계약 종료 통지 (임차인 → 임대인)", end) + \
        doc_block("doc-landlord", "3. 갱신 거절 통지 (임대인 → 임차인)", landlord, "실거주 사유로 거절한 뒤 2년 안에 제3자에게 임대하면 손해배상 책임이 생길 수 있습니다.") + \
        doc_block("doc-demand", "4. 보증금 반환 청구 내용증명", demand, "○○○ 부분을 실제 내용으로 바꾸고, 계약서 사본을 함께 보관하세요.")
    return form_page(1, "Form · Notices", "갱신 요구 · 계약 종료 · 갱신 거절 · 보증금 반환 청구 문구", body, ["renewal.html", "jeonse-insurance.html", "jeonse-fraud-check.html", "moving.html"])

# ---------------- 특약 문구 모음 ----------------
SPECIAL_TERMS = [
    ("전세 · 보증금 보호", [
        ("근저당 말소 조건", "임대인은 잔금일까지 본 부동산에 설정된 근저당권(채권최고액 ○○○원)을 전부 말소하고 그 등기부등본을 임차인에게 교부한다. 이를 이행하지 않을 경우 임차인은 계약을 해제할 수 있고 임대인은 계약금의 배액을 상환한다."),
        ("잔금 전 권리변동 금지", "임대인은 계약일부터 임차인의 전입신고 다음 날까지 본 부동산에 근저당권·전세권 설정, 소유권 이전 등 어떠한 권리변동도 하지 않는다. 위반 시 임차인은 계약을 해제하고 손해배상을 청구할 수 있다."),
        ("보증보험 가입 조건부", "본 계약은 임차인이 전세보증금반환보증(HUG·SGI·HF)에 가입할 수 있음을 조건으로 한다. 임대인의 사유로 가입이 거절될 경우 임차인은 계약을 해제할 수 있고 임대인은 지급받은 계약금 전액을 즉시 반환한다."),
        ("임대인 세금 체납 확인", "임대인은 계약일 현재 국세·지방세 체납이 없음을 확인하며, 임차인이 요청하면 납세증명서를 제공한다. 체납 사실이 확인되면 임차인은 계약을 해제할 수 있다."),
        ("대항력 유지 협조", "임대인은 임차인의 전입신고와 확정일자 취득에 협조하며, 이를 미루도록 요구하지 않는다."),
        ("다가구 선순위 고지", "임대인은 본 건물의 선순위 임차보증금 총액이 ○○○원임을 고지하였고, 실제와 다를 경우 임차인은 계약을 해제할 수 있다."),
        ("만기 시 보증금 반환", "임대인은 계약 만기일에 임차인에게 보증금 전액을 반환하며, 새 임차인 입주 여부와 관계없이 반환 의무가 있다. 지연 시 연 ○%의 지연이자를 지급한다."),
    ]),
    ("월세", [
        ("월세 납부일·계좌", "월세는 매월 ○일에 임대인 명의 계좌(○○은행 000-0000-0000)로 이체한다. 임차인의 세액공제·현금영수증 신청에 임대인은 이의를 제기하지 않는다."),
        ("관리비 내역", "관리비는 월 ○○○원이며 여기에는 ○○, ○○이 포함된다. 그 외 공과금은 사용량에 따라 임차인이 부담한다."),
        ("갱신 시 인상 상한", "계약 갱신 시 임대료 인상은 주택임대차보호법에 따라 5% 이내로 한다."),
        ("중도 해지", "임차인이 계약기간 중 해지할 경우 새 임차인이 입주하는 날 계약이 종료되며, 그때까지의 월세와 중개보수는 임차인이 부담한다."),
        ("원상복구 범위", "임차인은 통상적인 사용에 따른 마모(못 자국, 벽지 변색 등)에 대해 원상복구 의무를 지지 않는다. 입주 시 상태는 사진으로 기록하여 양측이 보관한다."),
        ("반려동물", "임차인은 반려동물 ○마리(종류 ○○)를 기를 수 있으며, 그로 인한 훼손은 임차인이 복구한다."),
    ]),
    ("매매", [
        ("잔금일 권리 상태", "매도인은 잔금일까지 근저당·가압류 등 모든 제한물권을 말소하고, 잔금일에 소유권이전에 필요한 서류를 교부한다."),
        ("임차인 승계", "본 부동산의 임차인(보증금 ○○○원, 만기 ○년 ○월 ○일) 계약은 매수인이 승계하며, 잔금에서 보증금을 공제한다."),
        ("하자 처리", "매도인은 계약 당시 알고 있는 하자(누수, 결로 등)를 고지하였으며, 잔금 후 ○개월 이내 발견된 중대한 하자는 매도인이 수리 비용을 부담한다."),
        ("관리비·공과금 정산", "관리비, 공과금, 장기수선충당금은 잔금일 기준으로 일할 정산한다."),
        ("대출 불가 시 해제", "매수인의 주택담보대출이 매수인 귀책 없이 승인되지 않을 경우 계약을 해제할 수 있고, 매도인은 계약금을 반환한다."),
        ("계약 해제 위약금", "일방이 계약을 위반하여 해제되는 경우 위약금은 매매대금의 ○%로 한다."),
    ]),
]
def special_terms():
    secs = ""
    k = 0
    for title, items in SPECIAL_TERMS:
        lis = ""
        for t, text in items:
            k += 1
            lis += f'''
        <li><div class="card-head"><p class="t">{t}</p><button type="button" class="btn btn-ghost btn-sm" data-copy="term-{k}">복사</button></div><p class="doc-text" id="term-{k}">{text}</p></li>'''
        secs += f'''
    <section class="card">
      <h2>{title}</h2>
      <ul class="ref-list term-list">{lis}
      </ul>
    </section>'''
    body = '''
    <section class="card">
      <h2>특약 쓸 때</h2>
      <div class="prose">
        <ul>
          <li>특약은 계약서 본문보다 우선합니다. 구두 약속은 반드시 특약에 적으세요.</li>
          <li>○○○ 부분은 실제 금액·날짜로 바꾸고, 양측이 서명·날인해야 효력이 있습니다.</li>
          <li>법에 어긋나는 특약(임차인에게 불리한 갱신 포기 등)은 무효입니다.</li>
          <li>중개사가 "관행상 안 넣는다"고 하더라도 넣을 수 있습니다. 거부하면 그 자체가 신호입니다.</li>
        </ul>
      </div>
    </section>''' + secs
    return form_page(2, "Form · Special Terms", "전세 · 월세 · 매매 계약서에 넣을 특약 문구, 복사해서 쓰기", body, ["jeonse-fraud-check.html", "jeonse-insurance.html", "renewal.html", "fee.html"])

FORM_PAGES = {"form-rent-receipt.html": rent_receipt, "form-notice.html": notice_forms, "form-special-terms.html": special_terms}
