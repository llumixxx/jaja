/* ===== 쟈쟈서버 공통 메뉴 =====
   메뉴 추가/수정/삭제는 이 배열 하나만 고치면 index.html, pokedex.html 등
   nav.js를 불러오는 모든 페이지에 자동으로 반영됩니다.

   icon  : 이모지
   label : 메뉴 이름
   href  : 이동할 파일명
   group : 묶일 카테고리 이름 (같은 값끼리 한 덩어리로 묶임, 생략 가능)
   match : 이 페이지들에 있을 때도 해당 메뉴가 선택된 것으로 표시 (하위 페이지용)

   메뉴가 길어져 아래쪽이 잘리던 문제 때문에 세로 목록 → 2열 그리드로 바꿨습니다.
   그래도 넘칠 만큼 늘어나면 메뉴 영역 안에서 스크롤됩니다.
*/
const SA_NAV_ITEMS = [
  { href: "index.html",     icon: "🎲", label: "계산기",       group: "계산기" },
  { href: "statcalc.html",  icon: "⚔️", label: "능력치 계산기", group: "계산기" },
  { href: "expcalc.html",   icon: "📈", label: "경험치 계산기", group: "계산기" },
  { href: "sellcalc.html",  icon: "💰", label: "판매 계산기",   group: "계산기" },
  { href: "simulator.html", icon: "🎰", label: "시뮬레이터",    group: "계산기" },

  { href: "pokedex.html",   icon: "🐾", label: "도감",         group: "도감" },
  { href: "item.html",      icon: "🗡️", label: "아이템도감",    group: "도감" },
  { href: "maps.html",      icon: "🗺️", label: "지도정보",      group: "도감" },

  { href: "quiz.html",      icon: "🧠", label: "퀴즈마스터",    group: "놀거리" },
  { href: "minigame.html",  icon: "🎮", label: "미니게임",      group: "놀거리",
    match: ["jyajyarogue.html", "petsurvival.html"] },

  // 새 메뉴를 추가하려면 아래처럼 한 줄만 더 넣으면 됩니다:
  // { href: "새파일명.html", icon: "✨", label: "메뉴이름", group: "계산기" },
];

/* 하단 제작자 표기 (모든 페이지 공통 노출) */
const SA_NAV_CREDIT =
  `<div class="sb-nav-credit" style="margin-top:9px;padding:6px 10px;border-radius:11px;` +
  `background:var(--s1,rgba(125,150,180,.10));border:1.5px solid var(--border,rgba(125,150,180,.22));` +
  `text-align:center;font-size:11px;font-weight:800;letter-spacing:.2px;` +
  `color:var(--t2,#4c6a8c);font-family:'Nunito',sans-serif;">` +
  `🌱 만든이 : 야채부락리 족장 애호박</div>`;

/* ===== 메뉴 스타일 =====
   각 페이지의 <style>을 일일이 고치지 않아도 되도록 nav.js가 직접 주입합니다.
   기존 .sb-nav-list 규칙보다 뒤에 붙으므로 같은 우선순위면 이쪽이 이깁니다. */
(function injectSaNavStyle(){
  if (document.getElementById("sa-nav-style")) return;
  const css = `
.sb-nav{flex-shrink:0;}
.sb-nav-list{max-height:0;overflow:hidden;
  transition:max-height .38s cubic-bezier(.33,1,.68,1);}
.sb-nav-list.open{max-height:min(58vh,720px);overflow-y:auto;margin-top:6px;padding-top:2px;}
.sb-nav-list::-webkit-scrollbar{width:4px;}
.sb-nav-list::-webkit-scrollbar-thumb{background:var(--border2,rgba(125,150,180,.35));border-radius:4px;}

.sb-nav-sec{font-size:9.5px;font-weight:800;letter-spacing:1px;
  color:var(--t3,#8aa3bd);padding:9px 4px 5px;font-family:'Nunito',sans-serif;}
.sb-nav-sec:first-child{padding-top:1px;}

.sb-nav-grid{display:grid;grid-template-columns:1fr 1fr;gap:5px;}
.sb-nav-grid a{display:flex;align-items:center;gap:6px;min-width:0;
  padding:9px;border-radius:10px;text-decoration:none;
  font-size:11.5px;font-weight:700;color:var(--t2,#4c6a8c);
  background:var(--s1,rgba(125,150,180,.10));border:1px solid transparent;
  transition:background .15s,color .15s,border-color .15s;}
.sb-nav-grid a .sb-i{font-size:14px;line-height:1;flex-shrink:0;}
.sb-nav-grid a .sb-t{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.sb-nav-grid a:hover{background:var(--s2,rgba(125,150,180,.18));color:var(--a1,#2f7fd6);}
.sb-nav-grid a.on{background:rgba(47,127,214,.12);color:var(--a1,#2f7fd6);
  font-weight:800;border-color:rgba(47,127,214,.28);}
[data-theme="dark"] .sb-nav-grid a.on{background:rgba(90,168,234,.16);border-color:rgba(90,168,234,.32);}

@media(max-width:360px){ .sb-nav-grid{grid-template-columns:1fr;} }
@media(prefers-reduced-motion:reduce){ .sb-nav-list{transition:none;} }

/* 사이드바(#sbNav)가 없는 페이지 — 미니게임처럼 화면을 꽉 쓰는 곳 — 은
   상단 가로 바로 대신 그립니다. 페이지가 #global-nav 를 따로 꾸며놨다면
   그쪽 !important 규칙이 이깁니다. */
#global-nav{position:sticky;top:0;z-index:60;display:flex;gap:6px;align-items:center;
  padding:8px 12px;overflow-x:auto;-webkit-overflow-scrolling:touch;
  background:var(--white,#fff);border-bottom:1px solid var(--border,rgba(125,150,180,.22));
  font-family:'Noto Sans KR',sans-serif;}
#global-nav::-webkit-scrollbar{height:0;}
#global-nav a{flex:0 0 auto;display:flex;align-items:center;gap:5px;white-space:nowrap;
  padding:7px 12px;border-radius:999px;text-decoration:none;
  font-size:12px;font-weight:700;color:var(--t2,#4c6a8c);
  background:var(--s1,rgba(125,150,180,.10));border:1px solid transparent;
  transition:background .15s,color .15s,border-color .15s;}
#global-nav a:hover{background:var(--s2,rgba(125,150,180,.18));color:var(--a1,#2f7fd6);}
#global-nav a.nav-active{background:rgba(47,127,214,.12);color:var(--a1,#2f7fd6);
  font-weight:800;border-color:rgba(47,127,214,.28);}
`;
  const el = document.createElement("style");
  el.id = "sa-nav-style";
  el.textContent = css;
  document.head.appendChild(el);
})();

(function renderSaNav(){
  const current = (location.pathname.split("/").pop() || "index.html");
  const isCurrent = i => i.href === current || (i.match && i.match.indexOf(current) !== -1);
  const currentItem = SA_NAV_ITEMS.find(isCurrent) || SA_NAV_ITEMS[0];

  const nav = document.getElementById("sbNav");

  /* 사이드바가 없는 페이지(미니게임 등)는 상단 가로 바로 그립니다.
     원본 윈드 nav.js 가 #global-nav 를 만들어 쓰던 방식과 같습니다. */
  if(!nav){
    let bar = document.getElementById("global-nav");
    if(!bar){
      bar = document.createElement("div");
      bar.id = "global-nav";
      document.body.insertBefore(bar, document.body.firstChild);
    }
    bar.innerHTML = SA_NAV_ITEMS.map(item =>
      `<a href="${item.href}"${isCurrent(item) ? ' class="nav-active"' : ''}>` +
        `<span>${item.icon}</span><span>${item.label}</span>` +
      `</a>`
    ).join("");
    const on = bar.querySelector("a.nav-active");
    if(on) on.scrollIntoView({ block: "nearest", inline: "center" });
    return;
  }

  /* 정의된 순서대로 그룹 묶기 */
  const groups = [];
  SA_NAV_ITEMS.forEach(item => {
    const name = item.group || "메뉴";
    let g = groups.find(x => x.name === name);
    if(!g){ g = { name: name, items: [] }; groups.push(g); }
    g.items.push(item);
  });

  const listHTML = groups.map(g =>
    `<div class="sb-nav-sec">${g.name}</div>` +
    `<div class="sb-nav-grid">` +
      g.items.map(item =>
        `<a href="${item.href}"${isCurrent(item) ? ' class="on"' : ''}>` +
          `<span class="sb-i">${item.icon}</span>` +
          `<span class="sb-t">${item.label}</span>` +
        `</a>`
      ).join("") +
    `</div>`
  ).join("");

  /* sbNav 엘리먼트에 data-expanded="true"가 있으면 토글 없이 항상 전체 메뉴를 보여줍니다. */
  if(nav.dataset.expanded === "true"){
    nav.innerHTML = `<div class="sb-nav-list open">${listHTML}</div>` + SA_NAV_CREDIT;
    return;
  }

  nav.innerHTML =
    `<button type="button" class="sb-nav-toggle" id="sbNavToggle">` +
      `<span>${currentItem.icon}</span>` +
      `<span class="sb-nav-toggle-label">${currentItem.label}</span>` +
      `<span class="sb-nav-toggle-chevron">▾</span>` +
    `</button>` +
    `<div class="sb-nav-list" id="sbNavList">${listHTML}</div>` +
    SA_NAV_CREDIT;

  const toggleBtn = document.getElementById("sbNavToggle");
  const list = document.getElementById("sbNavList");
  toggleBtn.addEventListener("click", () => {
    list.classList.toggle("open");
    toggleBtn.classList.toggle("open");
    /* 열었을 때 현재 메뉴가 스크롤 밖에 있으면 보이게 당겨줍니다. */
    if(list.classList.contains("open")){
      const on = list.querySelector("a.on");
      if(on) setTimeout(function(){ on.scrollIntoView({ block: "nearest" }); }, 420);
    }
  });
})();
