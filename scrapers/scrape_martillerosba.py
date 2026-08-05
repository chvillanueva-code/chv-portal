#!/usr/bin/env python3
"""Scraper padrón provincial Martilleros BA (martillerosba.org.ar).

Fuente pública: POST legacy.martillerosba.org.ar/site/Site/ListaColegiadosPorColegio/
Campos: nombreCompleto, colegio, domicilio (+ id interno).

Uso:
  python scrape_martillerosba.py
"""
import csv, json, time, urllib.request
from pathlib import Path

COLEGIOS = {
    "AL": "COLEGIO DTAL DE AVELLANEDA-LANUS",
    "AZ": "COLEGIO DTAL DE AZUL",
    "BB": "COLEGIO DTAL DE BAHIA BLANCA",
    "DO": "COLEGIO DTAL DE DOLORES",
    "JU": "COLEGIO DTAL DE JUNIN",
    "LM": "COLEGIO DTAL DE LA MATANZA",
    "LP": "COLEGIO DTAL DE LA PLATA",
    "LZ": "COLEGIO DTAL DE LOMAS DE ZAMORA",
    "ME": "COLEGIO DTAL DE MERCEDES",
    "MO": "COLEGIO DTAL DE MORON",
    "MP": "COLEGIO DTAL DE MAR DEL PLATA",
    "MR": "COLEGIO DTAL DE MORENO-GRAL. RODRIGUEZ",
    "NC": "COLEGIO DTAL DE NECOCHEA",
    "PG": "COLEGIO DTAL DE PERGAMINO",
    "QL": "COLEGIO DTAL DE QUILMES",
    "SI": "COLEGIO DTAL DE SAN ISIDRO",
    "SM": "COLEGIO DTAL DE SAN MARTIN",
    "SN": "COLEGIO DTAL DE SAN NICOLAS",
    "TL": "COLEGIO DTAL DE TRENQUE LAUQUEN",
    "ZC": "COLEGIO DTAL DE ZARATE-CAMPANA",
}
URL = "https://legacy.martillerosba.org.ar/site/Site/ListaColegiadosPorColegio/"
OUT = Path(__file__).resolve().parent / "data"

def fetch_colegio(code: str) -> list:
    data = f"Colegio={code}&txtApellidoNombre=&tipoBusqueda=1".encode()
    req = urllib.request.Request(
        URL,
        data=data,
        headers={
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0 (compatible; CHV-Ecosistema/1.0)",
            "Origin": "https://www.martillerosba.org.ar",
            "Referer": "https://www.martillerosba.org.ar/padron-de-martilleros-y-corredores-publicos/",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        body = json.loads(resp.read().decode("utf-8"))
    return body.get("objeto") or []

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    rows, counts = [], {}
    for code, name in COLEGIOS.items():
        items = fetch_colegio(code)
        counts[code] = len(items)
        for r in items:
            rows.append({
                "external_id": r.get("id"),
                "nombre_completo": (r.get("nombreCompleto") or "").strip(),
                "colegio_code": code,
                "colegio": (r.get("colegio") or name).strip(),
                "domicilio": (r.get("domicilio") or "").strip(),
            })
        print(f"{code}: {len(items)}")
        time.sleep(0.4)

    seen, unique = set(), []
    for r in rows:
        if r["external_id"] in seen:
            continue
        seen.add(r["external_id"])
        unique.append(r)

    payload = {
        "source": "martillerosba.org.ar",
        "api": URL,
        "scraped_at": time.strftime("%Y-%m-%dT%H:%M:%S-03:00"),
        "provincia": "Buenos Aires",
        "pais": "AR",
        "counts_by_colegio": counts,
        "total_unique": len(unique),
        "records": unique,
    }
    (OUT / "padron_pba_martillerosba.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    with open(OUT / "padron_pba_martillerosba.csv", "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["external_id", "nombre_completo", "colegio_code", "colegio", "domicilio"])
        w.writeheader()
        w.writerows(unique)
    print("TOTAL", len(unique))

if __name__ == "__main__":
    main()
