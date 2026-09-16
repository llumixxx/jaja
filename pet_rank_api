# -*- coding: utf-8 -*-
"""
쟈쟈서버 펫 랭킹 수집 (로그인 X, 공식 API 직접 호출)

- 펫 목록: 같은 레포에 있는 pet_data.json (update-pet-data.yml 이 이미 3시간마다 최신으로 유지)
- 랭킹 API: https://sa000001.com/sa2/info/api/pet_rank.php?enemybase_id=<id>
  (enemybase_id == pet_data.json 의 "id" 값과 동일)

결과는 pet_ranking_data.json 으로 저장:
{
  "timestamp": "2026-09-16T...",
  "total_pets": 524,
  "pets": [
    {"id": 91, "name": "리비노", "rows": [ {"name":"애호박","level":140,"hp":...,"atk":...,...}, ... ] },
    ...
  ]
}
"""
import json
import os
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime

import requests

RANK_URL = "https://sa000001.com/sa2/info/api/pet_rank.php"
PET_DATA_FILE = "pet_data.json"
SAVE_FILE = "pet_ranking_data.json"
WORKERS = 8       # 동시 요청 수 (서버 부담 고려해서 낮게)
RETRY = 3
TIMEOUT = 15

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    "Referer": "https://sa000001.com/sa2/info/pet.php",
    "Accept": "application/json, text/plain, */*",
}

session = requests.Session()
session.headers.update(HEADERS)


def load_pets():
    here = os.path.dirname(os.path.abspath(__file__))
    path = os.path.join(here, PET_DATA_FILE)
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    rows = data.get("rows", data) if isinstance(data, dict) else data

    pets, seen = [], set()
    for r in rows:
        how = str(r.get("how") or "").replace(" ", "").strip()
        if how == "미출시":
            continue
        pid = r.get("id")
        name = r.get("name")
        if pid is None or not name:
            continue
        if pid in seen:
            continue
        seen.add(pid)
        pets.append({"id": pid, "name": str(name).lstrip("\ufeff")})
    return pets


def fetch_rank(pid):
    last = None
    for attempt in range(RETRY):
        try:
            r = session.get(RANK_URL, params={"enemybase_id": pid}, timeout=TIMEOUT)
            r.raise_for_status()
            data = r.json()
            if not data.get("ok"):
                return []
            return data.get("rows") or []
        except Exception as e:
            last = e
            time.sleep(0.6 * (attempt + 1))
    print(f" ! id={pid} 실패: {last}")
    return []


def collect_one(pet):
    rows = fetch_rank(pet["id"])
    return {"id": pet["id"], "name": pet["name"], "rows": rows}


def save_data(data):
    here = os.path.dirname(os.path.abspath(__file__))
    path = os.path.join(here, SAVE_FILE)
    tmp = path + ".tmp"
    try:
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        with open(tmp, "r", encoding="utf-8") as f:
            json.load(f)  # 검증
        os.replace(tmp, path)
        print(f"저장 완료 -> {path}")
    except Exception as e:
        print(f"저장 실패: {e}")
        if os.path.exists(tmp):
            try:
                os.remove(tmp)
            except OSError:
                pass


def collect_all():
    print("펫 목록 로딩...")
    pets = load_pets()
    print(f"대상 펫: {len(pets)}마리\n")

    results = [None] * len(pets)
    done = 0
    t0 = time.time()
    with ThreadPoolExecutor(max_workers=WORKERS) as ex:
        futures = {ex.submit(collect_one, p): i for i, p in enumerate(pets)}
        for fut in as_completed(futures):
            idx = futures[fut]
            res = fut.result()
            results[idx] = res
            done += 1
            print(f"[{done:3d}/{len(pets)}] {res['name']:16s} 랭킹 {len(res['rows'])}명", flush=True)

    now = datetime.now()
    print(f"\n소요 {time.time()-t0:.1f}초")
    return {
        "timestamp": now.isoformat(),
        "total_pets": len(results),
        "pets": results,
    }


def main():
    print("=" * 60)
    print("쟈쟈서버 펫 랭킹 수집")
    print("=" * 60)
    data = collect_all()
    save_data(data)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n종료")
        sys.exit(0)
