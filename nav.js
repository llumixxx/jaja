/* ===== 쟈쟈서버 공통 메뉴 =====
   메뉴 추가/수정/삭제는 이 배열 하나만 고치면 index.html, pokedex.html 등
   nav.js를 불러오는 모든 페이지에 자동으로 반영됩니다.
   icon: 이모지, label: 메뉴 이름, href: 이동할 파일명
*/
const SA_NAV_ITEMS = [
  { href: "index.html",   icon: "🎲", label: "계산기" },
  { href: "pokedex.html", icon: "🐾", label: "도감" },
  { href: "simulator.html", icon: "🎰", label: "시뮬레이터" },
  { href: "quiz.html", icon: "🧠", label: "퀴즈마스터" },
  // 새 메뉴를 추가하려면 아래처럼 한 줄만 더 넣으면 됩니다:
  // { href: "새파일명.html", icon: "✨", label: "메뉴이름" },
];

(function renderSaNav(){
  const nav = document.getElementById("sbNav");
  if(!nav) return;
  const current = (location.pathname.split("/").pop() || "index.html");
  nav.innerHTML = SA_NAV_ITEMS.map(item => {
    const isOn = item.href === current;
    return `<a href="${item.href}"${isOn ? ' class="on"' : ''}>${item.icon} ${item.label}</a>`;
  }).join("");
})();
