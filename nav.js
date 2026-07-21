/* ===== 쟈쟈서버 공통 메뉴 =====
   메뉴 추가/수정/삭제는 이 배열 하나만 고치면 index.html, pokedex.html 등
   nav.js를 불러오는 모든 페이지에 자동으로 반영됩니다.
   icon: 이모지, label: 메뉴 이름, href: 이동할 파일명
*/
const SA_NAV_ITEMS = [
  { href: "index.html",   icon: "🎲", label: "계산기" },
  { href: "pokedex.html", icon: "🐾", label: "도감" },
  { href: "item.html", icon: "🗡️", label: "아이템도감" },
  { href: "simulator.html", icon: "🎰", label: "시뮬레이터" },
  { href: "quiz.html", icon: "🧠", label: "퀴즈마스터" },
  { href: "maps.html", icon: "🗺️", label: "지도정보" },
  { href: "expcalc.html", icon: "📈", label: "경험치 계산기" },
  { href: "sellcalc.html", icon: "💰", label: "판매 계산기" },
  // 새 메뉴를 추가하려면 아래처럼 한 줄만 더 넣으면 됩니다:
  // { href: "새파일명.html", icon: "✨", label: "메뉴이름" },
];

(function renderSaNav(){
  const nav = document.getElementById("sbNav");
  if(!nav) return;
  const current = (location.pathname.split("/").pop() || "index.html");
  const currentItem = SA_NAV_ITEMS.find(i => i.href === current) || SA_NAV_ITEMS[0];

  const listHTML = SA_NAV_ITEMS.map(item => {
    const isOn = item.href === current;
    return `<a href="${item.href}"${isOn ? ' class="on"' : ''}>${item.icon} ${item.label}</a>`;
  }).join("");

  /* sbNav 엘리먼트에 data-expanded="true"가 있으면 토글 버튼 없이 항상 전체 메뉴를 보여줍니다. */
  if(nav.dataset.expanded === "true"){
    nav.innerHTML = `<div class="sb-nav-list open">${listHTML}</div>`;
    return;
  }

  nav.innerHTML =
    `<button type="button" class="sb-nav-toggle" id="sbNavToggle">` +
      `<span>${currentItem.icon}</span>` +
      `<span class="sb-nav-toggle-label">${currentItem.label}</span>` +
      `<span class="sb-nav-toggle-chevron">▾</span>` +
    `</button>` +
    `<div class="sb-nav-list" id="sbNavList">${listHTML}</div>`;

  const toggleBtn = document.getElementById("sbNavToggle");
  const list = document.getElementById("sbNavList");
  toggleBtn.addEventListener("click", () => {
    list.classList.toggle("open");
    toggleBtn.classList.toggle("open");
  });
})();
