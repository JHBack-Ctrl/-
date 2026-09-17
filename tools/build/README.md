# 사이트 빌더

헤더·메뉴·푸터·메타 태그를 모든 페이지에 같은 틀로 씌우고, 새 계산기·안내 글·홈을 생성합니다.

```
python3 tools/build/build.py
```

- `site_core.py` — 페이지 등록부(TOOLS, REFS, GUIDES, DOCS)와 공통 틀. 메뉴나 sitemap을 바꾸려면 등록부만 고칩니다
- `pages_new.py` — 계산기 7개의 본문(폼·결과·설명·FAQ)
- `pages_guides.py` — 안내 글 4편, 안내 글 목록, 홈
- `build.py` — 기존 페이지는 `<main>` 본문만 추출해 새 틀로 재포장하고, 나머지는 생성합니다. `manifest.json`, `sw.js`, `sitemap.xml`도 함께 씁니다

주의: `rent.html`, `loan.html`, `yield.html`, `fee.html`, 참고·문서 페이지는 현재 파일의 `<main>` 내용을 그대로 씁니다.
본문을 고칠 때는 HTML을 직접 고친 뒤 빌더를 돌리면 틀만 새로 씌워집니다.
