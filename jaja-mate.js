/* 쟈쟈 메이트 공통 코드 — 환각 계산기 · 펫 도감 · 아이템 도감이 같이 써요.
   (사이드바 열고 닫기, 다크모드, 초성 검색, 즐겨찾기, 누르는 느낌) */
(function(){
"use strict";
const JM = window.JM = {};
JM.$ = id => document.getElementById(id);
JM.esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
JM.smooth = () => !(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);

/* ===== 다크모드 (예전 페이지들과 같은 sa2-theme 키) ===== */
try{ const t = localStorage.getItem("sa2-theme"); if(t) document.documentElement.setAttribute("data-theme", t); }catch(e){}
JM.toggleDark = function(){
  const h = document.documentElement;
  const n = h.getAttribute("data-theme") === "dark" ? "light" : "dark";
  h.setAttribute("data-theme", n);
  try{ localStorage.setItem("sa2-theme", n); }catch(e){}
};
window.toggleDark = JM.toggleDark;

/* ===== 사이드바 (오버레이 방식) ===== */
function bindSidebar(){
  const sb = JM.$("sidebar"), btn = JM.$("toggleBtn"), bd = JM.$("sbBackdrop");
  if(!sb || !btn) return;
  const set = open => {
    sb.classList.toggle("open", open);
    btn.classList.toggle("sb-open", open);
    if(bd) bd.classList.toggle("open", open);
    btn.textContent = open ? "✕" : "☰";
    btn.setAttribute("aria-expanded", String(open));
  };
  btn.addEventListener("click", () => set(!sb.classList.contains("open")));
  if(bd) bd.addEventListener("click", () => set(false));
  document.addEventListener("keydown", e => { if(e.key === "Escape" && sb.classList.contains("open")) set(false); });
  set(false);
  const dk = JM.$("darkBtn"); if(dk) dk.addEventListener("click", JM.toggleDark);
}
if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", bindSidebar); else bindSidebar();

/* ===== 초성 검색 ===== */
const CHO = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
JM.chosung = function(str){
  let out = "";
  for(const ch of String(str || "")){ const c = ch.charCodeAt(0) - 0xAC00; out += (c >= 0 && c <= 11171) ? CHO[Math.floor(c/588)] : ch; }
  return out;
};
const CLUSTER = { "ㄳ":"ㄱㅅ","ㄵ":"ㄴㅈ","ㄶ":"ㄴㅎ","ㄺ":"ㄹㄱ","ㄻ":"ㄹㅁ","ㄼ":"ㄹㅂ","ㄽ":"ㄹㅅ","ㄾ":"ㄹㅌ","ㄿ":"ㄹㅍ","ㅀ":"ㄹㅎ","ㅄ":"ㅂㅅ" };
JM.expandClusters = s => Array.from(String(s || "")).map(ch => CLUSTER[ch] || ch).join("");
/* 이름에 q가 들어있거나, 초성으로 맞으면 true */
JM.textMatch = function(text, q){
  text = String(text || ""); q = String(q || "").trim();
  if(!q) return true;
  const t = text.replace(/\s+/g, "").toLowerCase(), qq = q.replace(/\s+/g, "").toLowerCase();
  if(t.includes(qq)) return true;
  return JM.chosung(t).includes(JM.expandClusters(qq));
};

/* ===== 즐겨찾기 (이 브라우저에만 저장) ===== */
JM.favStore = function(key){
  let set = new Set();
  try{ set = new Set(JSON.parse(localStorage.getItem(key) || "[]")); }catch(e){}
  return {
    has: id => set.has(String(id)),
    toggle(id){ id = String(id); if(set.has(id)) set.delete(id); else set.add(id); try{ localStorage.setItem(key, JSON.stringify([...set])); }catch(e){} return set.has(id); }
  };
};

/* ===== 누르는 느낌 (물결, 진동, 숫자 올라가기) ===== */
JM.haptic = ms => { try{ if(navigator.vibrate) navigator.vibrate(ms); }catch(e){} };
document.addEventListener("pointerdown", e => {
  const b = e.target.closest ? e.target.closest(".btn,.sb,.chip,.f-seg button,.heart") : null;
  if(!b || b.disabled) return;
  JM.haptic(b.classList.contains("sb") ? 6 : 10);
  if(!JM.smooth() || !b.matches(".btn,.chip,.f-seg button,.sb")) return;
  const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height)*1.7;
  const s = document.createElement("span");
  s.className = "rip";
  s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d/2}px;top:${e.clientY - r.top - d/2}px`;
  b.appendChild(s);
  setTimeout(() => s.remove(), 650);
}, { passive:true });
JM.countUp = function(el, to, dec, ms){
  if(!el) return;
  if(!JM.smooth() || ms <= 0){ el.textContent = to.toFixed(dec); return; }
  const t0 = performance.now();
  const step = now => {
    const q = Math.min(1, (now - t0)/ms), e = 1 - Math.pow(1 - q, 3);
    el.textContent = (to*e).toFixed(dec);
    if(q < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};
})();
