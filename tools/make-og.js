/* 공유 카드 이미지(og.png, 1200×630) 생성
   실행: node tools/make-og.js
   Playwright가 필요합니다. 브랜드 이름이나 문구를 바꾸면 다시 실행해 og.png를 갱신하세요. */
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright');

const BRAND = '전국부동산계산기';
const HEADLINE = ['월세 실부담부터', '양도세·연봉까지'];
const SUB = '부동산 계산기 21개, 세율표와 용어 사전까지';
const CHIPS = ['월세 실부담', '양도소득세', '취득세', '연봉 실수령액'];

const html = `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { width:1200px; height:630px; background:#f6f4ee; font-family:Pretendard,-apple-system,"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",sans-serif;
         padding:76px 84px; display:flex; flex-direction:column; justify-content:center;
         background-image:radial-gradient(1000px 420px at 88% -12%, #e6efe9 0%, rgba(246,244,238,0) 62%); }
  .brand { display:flex; align-items:center; gap:14px; margin-bottom:34px; }
  .mark { width:46px; height:46px; border-radius:15px; background:#0e6b52; position:relative; flex:none; }
  .mark::after { content:""; position:absolute; left:12.5px; top:12.5px; width:21px; height:21px;
                 border:4px solid #fff; border-radius:6px; border-top-color:transparent; transform:rotate(45deg); }
  .brand span { font-size:31px; font-weight:700; color:#17191c; letter-spacing:-.02em; }
  h1 { font-size:76px; line-height:1.17; font-weight:800; color:#17191c; letter-spacing:-.035em; }
  .sub { margin-top:26px; font-size:29px; color:#4a4f57; letter-spacing:-.02em; }
  .chips { margin-top:40px; display:flex; gap:14px; }
  .chip { background:#e6efe9; color:#0e6b52; font-size:23px; font-weight:600; padding:13px 24px; border-radius:999px; letter-spacing:-.02em; }
</style></head><body>
  <div class="brand"><div class="mark"></div><span>${BRAND}</span></div>
  <h1>${HEADLINE.join('<br>')}</h1>
  <p class="sub">${SUB}</p>
  <div class="chips">${CHIPS.map(c => `<div class="chip">${c}</div>`).join('')}</div>
</body></html>`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'load' });
  await page.waitForTimeout(300);
  const out = path.join(__dirname, '..', 'og.png');
  await page.screenshot({ path: out });
  await browser.close();
  console.log('wrote', out);
})();
