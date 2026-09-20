# 양도소득세 계산기 본문
from site_core import *
from pages_new import money, num, date, check, form_open, form_close, hero, result_hero, layout, AD_SIDE

def select(id_, label, opts, help_=None):
    o = "".join(f'<option value="{v}">{t}</option>' for v, t in opts)
    h = f'\n                <p class="field-help">{help_}</p>' if help_ else ""
    return f'''              <div class="field">
                <label for="{id_}">{label}</label>
                <select id="{id_}">{o}</select>{h}
              </div>'''

def capital_gains_tax_page():
    path = "capital-gains-tax.html"
    faq = [
        ("1세대 1주택 비과세는 어떤 조건인가요?", ["세대 전체가 주택 하나만 가지고 있고, 2년 이상 보유했으면 양도가액 12억원까지 비과세입니다. 2017년 8월 3일 이후 조정대상지역에서 취득한 주택은 2년 이상 거주도 해야 합니다.", "12억을 넘는 고가주택은 초과분 비율만큼만 과세하고, 그 부분에 보유·거주 기간별로 최대 80%의 장기보유특별공제를 적용합니다."]),
        ("다주택 중과는 지금 적용되나요?", ["조정대상지역에서 2주택자는 기본세율에 20%p, 3주택 이상은 30%p를 더하고 장기보유특별공제를 배제하는 제도입니다. 2022년 5월 10일부터 한시적으로 배제(유예)되다가 <strong>2026년 5월 9일로 유예가 종료</strong>되어, 5월 10일 이후 양도분에는 원칙적으로 중과가 적용됩니다.", "예외로 2026년 5월 9일까지 매매계약을 체결하고 계약금을 받은 사실이 증빙되면 배제될 수 있습니다. 이 경우 스위치를 직접 켜세요. 정부 2026년 세제개편안에는 2027년 +5/+10%p, 2028년 +10/+15%p로 낮추는 완화안이 있지만 국회 통과 전이라 이 계산기에는 반영하지 않았습니다 (2026년 9월 확인)."]),
        ("이월과세가 뭔가요?", ["배우자나 부모·자녀에게 증여받은 부동산을 10년 안에 팔면, 증여받은 가액이 아니라 증여한 사람이 원래 산 가액을 취득가액으로 봅니다. 증여로 취득가를 올려 양도세를 줄이는 것을 막는 제도입니다. 2022년 이전 증여분은 5년입니다.", "대신 낸 증여세는 필요경비로 인정되고 보유기간도 증여자 기준으로 셉니다. 계산기에서 취득 원인을 증여로 고르고 증여자 정보를 넣으면 자동으로 판정합니다."]),
        ("보유기간 1년이 안 됐는데 세율이 70%인가요?", ["주택·입주권·분양권은 1년 미만 70%, 1~2년 미만 60%(분양권은 1년 이상 모두 60%)의 단기 세율이 적용됩니다. 토지·상가는 1년 미만 50%, 2년 미만 40%입니다.", "단기 세율과 다주택 중과가 동시에 해당하면 각각 계산해 세액이 큰 쪽을 냅니다. 계산기가 자동으로 비교합니다."]),
        ("필요경비에는 무엇이 들어가나요?", ["취득할 때 낸 취득세·법무사 비용·중개보수, 보유 중 자산 가치를 올린 자본적 지출(발코니 확장, 새시 교체, 보일러 교체 등), 양도할 때 낸 중개보수와 세무 신고 비용입니다.", "도배·장판·싱크대 교체 같은 수리비는 필요경비가 아닙니다. 영수증과 계좌이체 내역이 있어야 인정됩니다. 취득가를 모르면 기준시가로 환산하되 이때는 실제 경비 대신 개산공제 3%만 인정됩니다."]),
        ("여기 결과로 신고해도 되나요?", ["아닙니다. 참고용 추정입니다. 최종 확인은 홈택스 양도소득세 모의계산과 세무사 상담을 기준으로 하세요. 세대 주택 수 판정, 특례 요건, 중과 유예 연장 여부는 개인 상황과 시점에 따라 달라집니다.", "세율표와 공제표, 유예 기한은 스크립트 상단 상수에 있고 화면에 기준일을 표시합니다. 개정 후 갱신 전에는 결과가 다를 수 있습니다."]),
    ]
    guide = prose_section("양도소득세 계산 순서", [
        "<h3>1. 양도차익</h3>",
        "<p>양도가액에서 취득가액과 필요경비를 뺍니다. 상속·증여로 취득했으면 그때 평가액이 취득가액이고, 배우자·직계존비속에게 증여받아 10년 안에 팔면 이월과세로 증여자의 취득가액을 씁니다. 부담부증여는 인수한 채무액만큼을 양도로 보고 취득가와 경비를 그 비율로 안분합니다.</p>",
        "<h3>2. 비과세 판정</h3>",
        "<p>1세대 1주택이고 2년 이상 보유(조정대상지역 취득은 2년 거주 포함)하면 12억까지 비과세입니다. 12억 초과 고가주택은 초과분 비율만 과세합니다. 일시적 2주택, 상속·혼인·동거봉양 합가, 거주주택 특례는 요건을 갖추면 1주택으로 봅니다. 미등기 양도와 비거주자는 비과세가 없습니다.</p>",
        "<h3>3. 장기보유특별공제</h3>",
        "<p>3년 이상 보유하면 일반표(연 2%, 최대 30%)를, 비과세 대상 1세대 1주택의 과세분에는 보유 연 4%와 거주 연 4%를 합쳐 최대 80%인 표2를 적용합니다. 분양권, 국외 자산, 미등기, 중과 대상은 공제가 없습니다. 입주권은 관리처분인가 전 주택 보유분 차익에만 적용합니다.</p>",
        "<h3>4. 과세표준과 세율</h3>",
        "<p>양도소득금액에서 기본공제 250만원을 빼면 과세표준입니다. 기본세율은 6%에서 45%까지 8단계 누진이고, 보유 2년 미만은 단기 세율, 조정대상지역 다주택은 중과 가산, 비사업용 토지는 10%p 가산, 미등기는 70%입니다. 둘 이상 해당하면 세액이 큰 쪽을 냅니다.</p>",
        "<h3>5. 감면과 부가세</h3>",
        "<p>8년 자경농지는 100%, 공익사업 수용은 10~40%를 감면하되 연 1억원 한도입니다. 감면세액의 20%는 농어촌특별세로 붙습니다(자경농지 감면은 제외). 결정세액의 10%가 지방소득세입니다.</p>",
        "<h3>신고와 납부</h3>",
        "<p>양도일이 속한 달의 말일부터 2개월 안에 예정신고와 납부를 합니다. 부담부증여는 3개월입니다. 같은 해에 두 건 이상 양도했으면 이듬해 5월 확정신고로 합산합니다. 비과세라도 고가주택 등은 신고해야 하는 경우가 있습니다.</p>",
        "<h3>이 계산기가 다루지 않는 것</h3>",
        "<ul><li>세대 주택 수 산정 세부(분양권·입주권·주거용 오피스텔·상속주택 포함 여부)는 사용자가 판단해 입력</li><li>같은 해 다른 양도와의 합산(확정신고), 이월결손금</li><li>국외 자산의 외국납부세액공제</li><li>주식·파생상품 등 부동산 외 자산</li><li>조정대상지역 지정·해제 이력에 따른 시점별 판정</li></ul>",
    ])
    kind_opts = [("house", "주택"), ("right_assoc", "조합원입주권"), ("right_sale", "분양권"), ("land", "토지"), ("building", "상가·건물 (주택 외)"), ("overseas", "국외 부동산")]
    left = form_open() + '''            <fieldset>
              <legend>물건과 양도 유형</legend>
''' + select("kind", "물건 종류", kind_opts) + select("dealType", "양도 유형", [("sale", "매매·교환"), ("gift_debt", "부담부증여 (채무 인수분)")]) + '''              <div id="giftdebt-fields" hidden>
                <div class="grid-2">
''' + money("giftValue", "증여재산가액", "1,000,000,000") + money("debt", "수증자가 인수한 채무액", "400,000,000") + '''                </div>
              </div>
              <div id="land-fields" hidden>
''' + check("nonbusiness", "비사업용 토지", "기본세율에 10%p 가산") + '''              </div>
''' + check("unregistered", "미등기 양도", "70% 단일세율, 비과세·공제 없음") + check("nonresident", "비거주자", "1세대 1주택 비과세와 표2 공제를 받을 수 없습니다") + '''            </fieldset>
            <fieldset>
              <legend>취득</legend>
''' + select("acqCause", "취득 원인", [("buy", "매매·신축·분양"), ("inherit", "상속"), ("gift", "증여")]) + '''              <div class="grid-2">
''' + date("acqDate", "취득일 (상속·증여는 그 개시일)") + money("acqPrice", "취득가액 (상속·증여는 당시 평가액)", "500,000,000") + '''              </div>
              <div id="inherit-fields" hidden>
''' + date("decedentDate", "피상속인의 취득일", "세율 판정 보유기간에만 쓰입니다") + check("sameHousehold", "피상속인과 동일세대였음", "비과세 보유·거주기간을 합산합니다") + '''              </div>
              <div id="gift-fields" hidden>
''' + select("donorRel", "증여자와의 관계", [("spouse_lineal", "배우자·직계존비속"), ("other", "그 외")], "배우자·직계존비속이면 10년 내 양도 시 이월과세") + '''                <div class="grid-2">
''' + date("donorDate", "증여자의 원래 취득일") + money("donorPrice", "증여자의 원래 취득가액", "300,000,000") + '''                </div>
''' + money("giftTax", "납부한 증여세", "0", val="0", help_="이월과세 적용 시 필요경비로 인정") + '''              </div>
''' + check("useEstimated", "취득가액을 몰라 기준시가로 환산", "환산취득가액 = 양도가액 × 취득당시 기준시가 ÷ 양도당시 기준시가") + '''              <div id="estimated-fields" hidden>
                <div class="grid-2">
''' + money("stdAcq", "취득 당시 기준시가", "200,000,000") + money("stdSale", "양도 당시 기준시가", "600,000,000") + '''                </div>
              </div>
            </fieldset>
            <fieldset>
              <legend>양도</legend>
              <div class="grid-2">
''' + date("saleDate", "양도일 (잔금일과 등기일 중 빠른 날)") + money("salePrice", "양도가액", "1,200,000,000") + '''              </div>
            </fieldset>
            <fieldset>
              <legend>필요경비</legend>
''' + money("acqCost", "취득 부대비용", "0", val="0", help_="취득세·법무사·취득 중개보수") + '''              <div class="grid-2">
''' + money("capex", "자본적 지출", "0", val="0", help_="확장·새시·보일러 등") + money("saleCost", "양도 비용", "0", val="0", help_="양도 중개보수·신고 비용") + '''              </div>
            </fieldset>
            <div id="house-fields">
            <fieldset>
              <legend>주택 요건</legend>
''' + select("homes", "양도 시점 세대 주택 수 (양도 주택 포함)", [("1", "1주택"), ("2", "2주택"), ("3", "3주택 이상")], "분양권·입주권·주거용 오피스텔 포함 여부는 규정을 확인해 넣으세요") + '''              <div class="grid-2">
''' + num("resMonths", "이 주택 거주 기간", "0", "개월", "1", help_="전입~전출 실제 거주") + select("special", "1주택 특례", [("none", "해당 없음"), ("temp2", "일시적 2주택"), ("inherit", "상속주택 보유"), ("marriage", "혼인 합가"), ("care", "동거봉양 합가"), ("rental", "거주주택 특례(임대주택 보유)")]) + '''              </div>
              <div id="newhome-field" hidden>
''' + date("newHomeDate", "신주택 취득일", "종전주택 취득 1년 후 취득, 신주택 취득 후 3년 내 양도") + '''              </div>
''' + check("adjArea", "양도 시점에 조정대상지역", "다주택 중과 판정에 사용") + check("adjAcquired", "2017년 8월 3일 이후 조정대상지역에서 취득", "비과세에 2년 거주 요건 추가") + check("heavySuspended", "다주택 중과 한시 배제(유예) 적용", "유예는 <span id=\"suspend-date\"></span>에 종료됐습니다. 그 이후 양도분은 기본값이 꺼짐(중과 적용)입니다. 2026년 5월 9일까지 계약 체결·계약금 지급이 증빙되는 경우에만 켜세요.") + check("heavyExcluded", "중과 배제 대상 주택", "수도권·광역시·세종 외 3억 이하 주택, 장기임대주택 등") + '''            </fieldset>
            <div id="assoc-fields" hidden>
            <fieldset>
              <legend>조합원입주권</legend>
              <div class="grid-2">
''' + date("mpDate", "관리처분인가일") + money("mpValue", "인가일 당시 평가액 (권리가액)", "700,000,000") + '''              </div>
              <p class="field-help">인가 전 주택 보유분 차익에만 장기보유특별공제를 적용합니다.</p>
            </fieldset>
            </div>
            </div>
            <fieldset>
              <legend>공제와 감면</legend>
''' + check("basicUsed", "올해 다른 양도로 기본공제 250만원을 이미 사용") + select("reduction", "감면", [("none", "없음"), ("farmland", "8년 자경농지·축사용지 (100%)"), ("exp_cash", "공익사업 수용 · 현금 (10%)"), ("exp_bond", "공익사업 수용 · 채권 (15%)"), ("exp_bond3", "수용 · 채권 3년 만기보유 (30%)"), ("exp_bond5", "수용 · 채권 5년 만기보유 (40%)"), ("custom", "직접 입력")], "연 1억원 한도. 감면세액의 20%는 농어촌특별세(자경농지 제외)") + '''              <div id="custom-reduction" hidden>
''' + num("reductionPct", "감면율", "0", "%", "1", max_="100") + '''              </div>
            </fieldset>
''' + form_close("양도세 계산하기")
    right = result_hero("예상 총 납부세액 (양도세 + 지방소득세 + 농특세)", "out-total", "원", [("결정 양도소득세", "out-tax", "원"), ("지방소득세", "out-local", "원"), ("양도차익", "out-gain", "원"), ("과세표준", "out-base", "원")]) + '''
        <div class="cta-box" style="margin:14px 0">
          <p>최종 확인은 여기서</p>
          <a id="hometax-link" class="btn btn-primary" href="https://www.hometax.go.kr" target="_blank" rel="noopener" style="width:auto">홈택스 양도소득세 모의계산 열기 ↗</a>
          <p class="hint" style="margin:8px 0 0;font-weight:400">홈택스 로그인 후 세금모의계산 → 양도소득세에서 같은 값을 넣어 비교하세요. 세무사 상담도 권합니다.</p>
        </div>
        <section class="card">
          <h2>판정 근거</h2>
          <ul class="ref-list" id="judge-list"></ul>
        </section>
        <section class="card">
          <h2>계산 내역</h2>
          <table class="tbl"><tbody id="detail-body"></tbody></table>
          <p class="result-note"><span id="rules-date"></span>. 참고용 추정입니다.</p>
        </section>
        <section class="card">
          <h2>세율표</h2>
          <div class="table-wrap"><table class="tbl ref-table nowrap-head">
            <thead><tr><th scope="col">과세표준</th><th scope="col">세율</th><th scope="col">누진공제</th></tr></thead>
            <tbody>
              <tr><th scope="row">1,400만 이하</th><td>6%</td><td>—</td></tr>
              <tr><th scope="row">5,000만 이하</th><td>15%</td><td>126만</td></tr>
              <tr><th scope="row">8,800만 이하</th><td>24%</td><td>576만</td></tr>
              <tr><th scope="row">1.5억 이하</th><td>35%</td><td>1,544만</td></tr>
              <tr><th scope="row">3억 이하</th><td>38%</td><td>1,994만</td></tr>
              <tr><th scope="row">5억 이하</th><td>40%</td><td>2,594만</td></tr>
              <tr><th scope="row">10억 이하</th><td>42%</td><td>3,594만</td></tr>
              <tr><th scope="row">10억 초과</th><td>45%</td><td>6,594만</td></tr>
            </tbody></table></div>
          <div class="table-wrap" style="margin-top:10px"><table class="tbl ref-table nowrap-head">
            <thead><tr><th scope="col">구분</th><th scope="col">세율·가산</th></tr></thead>
            <tbody>
              <tr><th scope="row">주택·입주권 1년 미만 / 2년 미만</th><td>70% / 60%</td></tr>
              <tr><th scope="row">분양권 1년 미만 / 1년 이상</th><td>70% / 60%</td></tr>
              <tr><th scope="row">토지·건물 1년 미만 / 2년 미만</th><td>50% / 40%</td></tr>
              <tr><th scope="row">조정지역 2주택 / 3주택↑ 중과</th><td>+20%p / +30%p (2026-05-09까지 유예, 이후 적용)</td></tr>
              <tr><th scope="row">비사업용 토지</th><td>+10%p</td></tr>
              <tr><th scope="row">미등기</th><td>70%</td></tr>
              <tr><th scope="row">장특공제 표1 / 표2</th><td>연 2%, 최대 30% / 보유·거주 각 연 4%, 최대 80%</td></tr>
            </tbody></table></div>
        </section>'''
    main = hero("Tax · Capital Gains", "양도소득세 계산기", "비과세·장기보유특별공제·중과·이월과세까지 반영한 참고용 추정", "주택, 입주권, 분양권, 토지, 상가, 국외 부동산의 양도차익에 1세대 1주택 비과세와 고가주택 안분, 장기보유특별공제 두 표, 단기·다주택 중과, 상속·증여 취득과 이월과세, 부담부증여, 감면을 반영해 양도세와 지방소득세를 계산합니다. 세율과 유예 기한은 상수로 두고 기준일을 표시하며, 최종 확인은 홈택스 모의계산을 기준으로 하세요.") + layout(left, right) + INLINE_AD + guide + faq_section(faq) + related(path)
    return main, app_ld("양도소득세 계산기", desc_of(path), path) + faq_ld(faq) + breadcrumb_ld("양도소득세", path)

CGT_PAGES = { "capital-gains-tax.html": (capital_gains_tax_page, "js/capital-gains-tax.js", "예상 총 납부세액") }
