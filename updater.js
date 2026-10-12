/* ════════════════════════════════════════════════════════════════
   쟈쟈 데이터 갱신기 (수동)
   - 공홈(sa000001.com) 페이지를 연 상태에서 북마크를 누르면 실행돼요
   - 브라우저가 공홈 데이터를 받아서 깃허브(llumixxx/jaja)에 커밋 1번으로 저장
   - 저장 대상: pet_data.json · pet_skin.csv · itemset6.txt · magic.txt · pet_ranking_data.json · sprites/*.gif(새 펫만)
   ════════════════════════════════════════════════════════════════ */
(async () => {
  const OWNER = "llumixxx", REPO = "jaja", BRANCH = "main";
  const API = `https://api.github.com/repos/${OWNER}/${REPO}`;
  const TOKEN_KEY = "jaja_gh_token";
  const SA = location.origin;

  if (!/sa000001\.com$/.test(location.hostname)) {
    alert("공홈(sa000001.com) 페이지를 연 상태에서 눌러주세요!\n예: https://sa000001.com/sa2/info/");
    return;
  }
  if (document.getElementById("jajaUpd")) { document.getElementById("jajaUpd").remove(); }

  // ── 화면 ──
  const box = document.createElement("div");
  box.id = "jajaUpd";
  box.style.cssText = "position:fixed;top:16px;right:16px;z-index:2147483647;width:340px;background:#14161f;color:#eee;" +
    "font:13px/1.5 'Noto Sans KR',sans-serif;border:2px solid #ffc83c;border-radius:14px;padding:14px;box-shadow:0 8px 30px #0008";
  box.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <b style="font-size:15px;color:#ffc83c">🔄 쟈쟈 데이터 갱신</b>
      <span id="juX" style="cursor:pointer;opacity:.7">✕</span></div>
    <label style="display:block"><input type="checkbox" id="juPet" checked> 펫 데이터</label>
    <label style="display:block"><input type="checkbox" id="juItem" checked> 아이템 데이터</label>
    <label style="display:block"><input type="checkbox" id="juImg" checked> 새 펫 이미지</label>
    <label style="display:block"><input type="checkbox" id="juRank"> 펫 랭킹 <span style="opacity:.6">(3~5분 걸림)</span></label>
    <button id="juGo" style="margin-top:10px;width:100%;padding:9px;border:0;border-radius:9px;background:#ffc83c;font-weight:700;cursor:pointer">갱신 시작</button>
    <div id="juBar" style="height:6px;background:#2a2d3a;border-radius:4px;margin-top:10px;overflow:hidden"><div id="juFill" style="height:100%;width:0;background:#4caf50"></div></div>
    <div id="juLog" style="margin-top:8px;max-height:220px;overflow:auto;font-size:12px;white-space:pre-wrap"></div>
    <div style="margin-top:8px;font-size:11px;opacity:.6;cursor:pointer" id="juTok">🔑 토큰 다시 입력</div>`;
  document.body.appendChild(box);
  const $ = (id) => box.querySelector("#" + id);
  const log = (t) => { $("juLog").textContent += t + "\n"; $("juLog").scrollTop = 1e9; };
  const bar = (p) => { $("juFill").style.width = Math.round(p * 100) + "%"; };
  $("juX").onclick = () => box.remove();

  // ── 깃허브 토큰 ──
  function getToken(force) {
    let t = !force && localStorage.getItem(TOKEN_KEY);
    if (!t) {
      t = prompt("깃허브 토큰을 붙여넣어 주세요 (처음 한 번만)\n\n" +
                 "만드는 곳: github.com → Settings → Developer settings → Fine-grained tokens\n" +
                 "· Repository access: llumixxx/jaja 만\n· Permissions → Contents: Read and write");
      if (t) localStorage.setItem(TOKEN_KEY, t.trim());
    }
    return t && t.trim();
  }
  $("juTok").onclick = () => { getToken(true); log("🔑 토큰 저장됨"); };

  const gh = async (path, opt = {}) => {
    const r = await fetch(API + path, { ...opt, headers: { "Authorization": "Bearer " + getToken(),
      "Accept": "application/vnd.github+json", "Content-Type": "application/json", ...(opt.headers || {}) } });
    if (!r.ok) throw new Error(`깃허브 ${r.status}: ${(await r.text()).slice(0, 150)}`);
    return r.status === 204 ? null : r.json();
  };

  // ── 바이트 ↔ base64, 깃 blob 해시 ──
  const b64 = (u8) => { let s = ""; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
  const gitSha = async (u8) => {
    const head = new TextEncoder().encode(`blob ${u8.length}\0`);
    const all = new Uint8Array(head.length + u8.length); all.set(head); all.set(u8, head.length);
    return [...new Uint8Array(await crypto.subtle.digest("SHA-1", all))].map(b => b.toString(16).padStart(2, "0")).join("");
  };
  const getBytes = async (url) => {
    const r = await fetch(url, { cache: "no-store", credentials: "include" });
    if (!r.ok) throw new Error(`${r.status} ${url}`);
    return new Uint8Array(await r.arrayBuffer());
  };
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  $("juGo").onclick = async () => {
    if (!getToken()) { log("❌ 토큰이 없어요"); return; }
    $("juGo").disabled = true; $("juGo").textContent = "갱신 중…";
    const files = {};             // path → Uint8Array
    try {
      // 1) 레포 현재 상태
      log("📂 깃허브 상태 확인…");
      const ref = await gh(`/git/ref/heads/${BRANCH}`);
      const baseCommit = await gh(`/git/commits/${ref.object.sha}`);
      const tree = await gh(`/git/trees/${baseCommit.tree.sha}?recursive=1`);
      const shaOf = {}; tree.tree.forEach(t => shaOf[t.path] = t.sha);

      // 2) 펫 데이터
      let pets = null;
      if ($("juPet").checked || $("juImg").checked || $("juRank").checked) {
        const pd = await getBytes(`${SA}/sa2/info/api/pet_data.php`);
        const json = JSON.parse(new TextDecoder().decode(pd));
        pets = Array.isArray(json) ? json : (json.rows || []);
        if (pets.length < 50) throw new Error("펫 데이터가 너무 적어요 (공홈 응답 이상)");
        if ($("juPet").checked) {
          files["pet_data.json"] = pd;
          try { files["pet_skin.csv"] = await getBytes(`${SA}/sa2/info/data/SA_PET_IMAGE.csv`); } catch (e) { }
          log(`🐾 펫 데이터 ${pets.length}마리`);
        }
      }
      // 3) 아이템
      if ($("juItem").checked) {
        files["itemset6.txt"] = await getBytes(`${SA}/sa2/info/data/itemset6.txt`);
        files["magic.txt"] = await getBytes(`${SA}/sa2/info/data/magic.txt`);
        log(`🗡️ 아이템 데이터 ${(files["itemset6.txt"].length / 1024).toFixed(0)}KB`);
      }
      // 4) 새 펫 이미지
      if ($("juImg").checked) {
        const codes = [...new Set(pets.map(p => String(p.imageCode || "").trim()).filter(Boolean))];
        const missing = codes.filter(c => !shaOf[`sprites/${c}.gif`]);
        log(`🖼️ 새 펫 이미지 ${missing.length}개` + (missing.length > 60 ? " (처음엔 좀 걸려요)" : ""));
        let n = 0;
        for (const c of missing) {
          try { files[`sprites/${c}.gif`] = await getBytes(`${SA}/sa2/info/img/${c}.gif`); } catch (e) { log(`  ! ${c} 실패`); }
          n++; bar(n / missing.length * 0.3); await sleep(120);
        }
      }
      // 5) 랭킹
      if ($("juRank").checked) {
        const list = []; const seen = new Set();
        pets.forEach(p => { const how = String(p.how || "").replace(/\s/g, ""); if (how === "미출시" || p.id == null || seen.has(p.id)) return;
          seen.add(p.id); list.push({ id: p.id, name: String(p.name || "").replace(/^\uFEFF/, "") }); });
        log(`🏆 랭킹 ${list.length}마리 조회 (천천히)…`);
        const out = []; let filled = 0;
        for (let i = 0; i < list.length; i++) {
          let rows = [];
          try {
            const r = await fetch(`${SA}/sa2/info/api/pet_rank.php?enemybase_id=${list[i].id}`, { cache: "no-store", credentials: "include" });
            const d = await r.json(); rows = d.ok ? (d.rows || []) : [];
          } catch (e) { }
          if (rows.length) filled++;
          out.push({ ...list[i], rows });
          bar(0.3 + (i + 1) / list.length * 0.6);
          if (i % 50 === 49) log(`  ${i + 1}/${list.length}…`);
          await sleep(250);                                 // 공홈 부담 줄이기
        }
        if (filled === 0) log("⚠️ 랭킹이 하나도 안 받아져서 저장 안 함 (기존 파일 유지)");
        else {
          files["pet_ranking_data.json"] = new TextEncoder().encode(JSON.stringify(
            { timestamp: new Date().toISOString(), total_pets: out.length, pets: out }, null, 2));
          log(`🏆 랭킹 있는 펫 ${filled}/${out.length}`);
        }
      }
      // 6) 바뀐 것만 골라서 커밋 1번
      const changed = [];
      for (const [path, u8] of Object.entries(files)) {
        if (shaOf[path] && shaOf[path] === await gitSha(u8)) continue;
        changed.push(path);
      }
      if (!changed.length) { bar(1); log("✅ 바뀐 게 없어요. 이미 최신!"); return; }
      log(`⬆️ 깃허브에 ${changed.length}개 파일 저장 중…`);
      const entries = [];
      for (const path of changed) {
        const blob = await gh(`/git/blobs`, { method: "POST", body: JSON.stringify({ content: b64(files[path]), encoding: "base64" }) });
        entries.push({ path, mode: "100644", type: "blob", sha: blob.sha });
      }
      const newTree = await gh(`/git/trees`, { method: "POST", body: JSON.stringify({ base_tree: baseCommit.tree.sha, tree: entries }) });
      const stamp = new Date().toLocaleString("ko-KR");
      const commit = await gh(`/git/commits`, { method: "POST", body: JSON.stringify({
        message: `수동 데이터 갱신 ${stamp} (${changed.length}개)`, tree: newTree.sha, parents: [ref.object.sha] }) });
      await gh(`/git/refs/heads/${BRANCH}`, { method: "PATCH", body: JSON.stringify({ sha: commit.sha }) });
      bar(1);
      log(`✅ 완료! ${changed.map(p => p.startsWith("sprites/") ? null : p).filter(Boolean).join(", ")}` +
          (changed.some(p => p.startsWith("sprites/")) ? ` + 이미지 ${changed.filter(p => p.startsWith("sprites/")).length}개` : ""));
      log("1~2분 뒤 사이트에 반영되고, 디코 봇은 30분 안에 알아서 새 데이터를 가져가요 🎉");
    } catch (e) {
      log("❌ " + e.message);
      if (/401|403/.test(e.message)) log("토큰이 틀렸거나 권한이 없어요 → 아래 🔑 토큰 다시 입력");
    } finally {
      $("juGo").disabled = false; $("juGo").textContent = "갱신 시작";
    }
  };
})();
