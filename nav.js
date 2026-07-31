/* ===== 쟈쟈서버 공통 메뉴 =====
   메뉴 추가/수정/삭제는 이 배열 하나만 고치면 index.html, pokedex.html 등
   nav.js를 불러오는 모든 페이지에 자동으로 반영됩니다.

   icon  : 이모지
   label : 메뉴 이름
   href  : 이동할 파일명
   match : 이 페이지들에 있을 때도 해당 메뉴가 선택된 것으로 표시 (하위 페이지용)
*/
const SA_NAV_ITEMS = [
  { href: "index.html",   icon: "🎲", label: "계산기" },
  { href: "pokedex.html", icon: "🐾", label: "도감" },
  { href: "item.html", icon: "🗡️", label: "아이템도감" },
  { href: "statcalc.html", icon: "⚔️", label: "능력치 계산기" },
  { href: "simulator.html", icon: "🎰", label: "시뮬레이터" },
  { href: "quiz.html", icon: "🧠", label: "퀴즈마스터" },
  { href: "maps.html", icon: "🗺️", label: "지도정보" },
  { href: "expcalc.html", icon: "📈", label: "경험치 계산기" },
  { href: "sellcalc.html", icon: "💰", label: "판매 계산기" },
  // match: 이 페이지들에 있을 때도 메뉴에서 '미니게임'이 선택된 것으로 표시됩니다.
  { href: "minigame.html", icon: "🎮", label: "미니게임",
    match: ["jajarogue.html", "petsurvival.html"] },
  // 새 메뉴를 추가하려면 아래처럼 한 줄만 더 넣으면 됩니다:
  // { href: "새파일명.html", icon: "✨", label: "메뉴이름" },
];

/* 하단 제작자 표기 (모든 페이지 공통 노출) */
const SA_NAV_CREDIT =
  `<div class="sb-nav-credit" style="margin-top:9px;padding:6px 10px;border-radius:11px;` +
  `background:var(--s1,rgba(125,150,180,.10));border:1.5px solid var(--border,rgba(125,150,180,.22));` +
  `text-align:center;font-size:11px;font-weight:800;letter-spacing:.2px;` +
  `color:var(--t2,#4c6a8c);font-family:'Nunito',sans-serif;">` +
  `🌱 만든이 : 야채부락리 족장 애호박</div>`;

/* ===== 메뉴 잘림 방지 =====
   사이드바는 height:100vh 플렉스 컬럼인데 .sb-nav 에 flex 지정이 없어서,
   메뉴가 길어지면 .sb-nav 가 눌리고 .sb-nav-list 의 overflow:hidden 에
   아래쪽 항목(미니게임)이 잘려 나갔습니다. 그래서
     · .sb-nav 는 줄어들지 않게 하고
     · 목록이 화면보다 길어지면 목록 안에서 스크롤되게
   두 가지만 잡아줍니다. 생김새는 기존 그대로입니다.

   각 페이지의 <style> 을 일일이 고치지 않아도 되도록 nav.js 가 직접 주입합니다.
   페이지 CSS 보다 뒤에 붙으므로 같은 우선순위면 이쪽이 이깁니다. */
(function injectSaNavStyle(){
  if (document.getElementById("sa-nav-style")) return;
  const css = `
.sb-nav{flex-shrink:0;}
/* 230px = 사이드바 헤더 + 토글 버튼 + 하단 푸터가 쓰는 고정 높이.
   화면이 짧아도 푸터가 밀려나지 않도록 남는 만큼만 목록에 줍니다. */
.sb-nav-list.open{max-height:min(760px,calc(100vh - 230px));
  overflow-y:auto;overscroll-behavior:contain;}
.sb-nav-list::-webkit-scrollbar{width:4px;}
.sb-nav-list::-webkit-scrollbar-thumb{background:var(--border2,rgba(125,150,180,.35));border-radius:4px;}

/* 원래 CSS 에는 펼침 애니메이션 딜레이가 10번째까지만 있어서, 메뉴가 더 늘어나도
   자연스럽게 이어지도록 뒤쪽을 채워둡니다. */
.sb-nav-list.open a:nth-child(11){transition-delay:.52s;}
.sb-nav-list.open a:nth-child(12){transition-delay:.57s;}
.sb-nav-list.open a:nth-child(13){transition-delay:.62s;}
.sb-nav-list.open a:nth-child(14){transition-delay:.67s;}
.sb-nav-list.open a:nth-child(15){transition-delay:.72s;}
.sb-nav-list.open a:nth-child(16){transition-delay:.77s;}

/* 사이드바(#sbNav)가 없는 페이지 — 화면을 꽉 쓰는 미니게임 같은 곳 — 은
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

  /* 사이드바가 없는 페이지(쟈쟈로그 등)는 상단 가로 바로 그립니다.
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

  const listHTML = SA_NAV_ITEMS.map(item => {
    const isOn = isCurrent(item);
    return `<a href="${item.href}"${isOn ? ' class="on"' : ''}>${item.icon} ${item.label}</a>`;
  }).join("");

  /* sbNav 엘리먼트에 data-expanded="true"가 있으면 토글 버튼 없이 항상 전체 메뉴를 보여줍니다. */
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
    /* 화면이 짧아 목록이 스크롤될 때, 현재 메뉴가 보이도록 당겨줍니다. */
    if(list.classList.contains("open")){
      const on = list.querySelector("a.on");
      if(on) setTimeout(function(){ on.scrollIntoView({ block: "nearest" }); }, 460);
    }
  });
})();
