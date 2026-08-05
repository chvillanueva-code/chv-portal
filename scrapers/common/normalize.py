"""
Homogeneización y deduplicación de resultados multi-fuente.
"""

from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timezone
from typing import Any
import json
import re


def _norm_title(title: str) -> str:
    t = title.lower()
    t = re.sub(r"[^\w\s]", " ", t)
    t = re.sub(r"\s+", " ", t).strip()
    return t[:80]


def _price_key(p: dict) -> str:
    price = p.get("price") or {}
    amount = price.get("amount")
    currency = price.get("currency") or ""
    if amount is None:
        return ""
    return f"{currency}:{int(amount)}"


def _address_key(p: dict) -> str:
    addr = p.get("address") or {}
    parts = [
        (addr.get("neighborhood") or "").lower(),
        (addr.get("city") or "").lower(),
        (addr.get("street") or "").lower()[:30],
    ]
    return "|".join(parts)


def similarity_key(p: dict) -> str:
    """Clave blanda para detectar duplicados entre fuentes distintas."""
    return "|".join([
        _norm_title(p.get("title") or ""),
        _price_key(p),
        _address_key(p),
        str((p.get("surface") or {}).get("covered") or ""),
        str(p.get("rooms") or ""),
    ])


def deduplicate(properties: list[dict], prefer_sources: list[str] | None = None) -> list[dict]:
    """
    Elimina duplicados exactos (mismo fingerprint) y cercanos (similarity_key).
    Si hay prefer_sources, prioriza el orden dado.
    """
    prefer = prefer_sources or ["mercadolibre", "zonaprop"]
    by_fp: dict[str, dict] = {}
    by_sim: dict[str, dict] = {}

    def rank(src: str) -> int:
        try:
            return prefer.index(src)
        except ValueError:
            return 99

    for p in properties:
        fp = p.get("id") or p.get("fingerprint")
        if not fp:
            # regenerar simple
            fp = f"{p.get('source')}-{p.get('external_id')}"
            p["id"] = fp

        existing = by_fp.get(fp)
        if existing is None or rank(p.get("source", "")) < rank(existing.get("source", "")):
            by_fp[fp] = p

    # second pass: soft duplicates
    for p in by_fp.values():
        sk = similarity_key(p)
        if not sk or sk.count("|") < 2:
            by_sim[p["id"]] = p
            continue
        prev = by_sim.get(sk)
        if prev is None:
            by_sim[sk] = p
        else:
            # keep preferred source / more complete
            if rank(p.get("source", "")) < rank(prev.get("source", "")):
                by_sim[sk] = p
            elif _completeness(p) > _completeness(prev):
                by_sim[sk] = p

    # unique by id
    result = {p["id"]: p for p in by_sim.values()}
    return list(result.values())


def _completeness(p: dict) -> int:
    score = 0
    if (p.get("price") or {}).get("amount"):
        score += 2
    if (p.get("surface") or {}).get("covered") or (p.get("surface") or {}).get("total"):
        score += 2
    if p.get("rooms"):
        score += 1
    if p.get("images"):
        score += len(p["images"][:5])
    if p.get("description"):
        score += 1
    if (p.get("geo") or {}).get("lat"):
        score += 2
    if (p.get("publisher") or {}).get("name"):
        score += 1
    return score


def to_marketplace_format(props: list[dict]) -> list[dict]:
    """
    Convierte schema unificado → formato que consume marketplace-inmobiliario/js/data.js
    """
    out = []
    for p in props:
        price = p.get("price") or {}
        surface = p.get("surface") or {}
        addr = p.get("address") or {}
        geo = p.get("geo") or {}
        pub = p.get("publisher") or {}
        images = p.get("images") or []

        op = (p.get("operation") or "venta").capitalize()
        if op == "Alquiler_temporario":
            op = "Alquiler"
        ptype = (p.get("property_type") or "otro").capitalize()
        if ptype == "Ph":
            ptype = "PH"
        if ptype == "Departamento":
            ptype = "Departamento"

        location_parts = [addr.get("neighborhood"), addr.get("city"), addr.get("province")]
        location = ", ".join([x for x in location_parts if x]) or addr.get("full") or ""

        item = {
            "id": p.get("external_id") or p.get("id"),
            "title": p.get("title") or "",
            "price": price.get("amount") or 0,
            "currency": price.get("currency") or "ARS",
            "operation": op if op in ("Venta", "Alquiler") else "Venta",
            "type": ptype,
            "rooms": p.get("rooms"),
            "bedrooms": p.get("bedrooms"),
            "bathrooms": p.get("bathrooms"),
            "covered_m2": surface.get("covered"),
            "total_m2": surface.get("total"),
            "location": location,
            "neighborhood": addr.get("neighborhood") or "",
            "city": addr.get("city") or "",
            "province": addr.get("province") or "Buenos Aires",
            "lat": geo.get("lat"),
            "lng": geo.get("lng"),
            "image": images[0] if images else "",
            "images": images[:10],
            "description": p.get("description") or "",
            "seller": pub.get("name") or "Particular",
            "seller_type": (pub.get("type") or "particular").capitalize(),
            "source": {
                "mercadolibre": "Mercado Libre",
                "zonaprop": "ZonaProp",
            }.get(p.get("source", ""), p.get("source", "")),
            "published": (p.get("published_at") or p.get("scraped_at") or "")[:10],
            "featured": False,
            "new": True,
            "expenses": price.get("expenses") or 0,
            "year": None,
            "garage": False,
            "amenities": [],
            "url": p.get("url"),
            "scraped_at": p.get("scraped_at"),
        }
        out.append(item)
    return out


def merge_runs(file_paths: list[str], output_path: str) -> dict[str, Any]:
    """Carga varios JSON de scrapers, deduplica y guarda."""
    all_props: list[dict] = []
    for path in file_paths:
        try:
            with open(path, encoding="utf-8") as f:
                data = json.load(f)
            if isinstance(data, list):
                all_props.extend(data)
            elif isinstance(data, dict) and "properties" in data:
                all_props.extend(data["properties"])
        except FileNotFoundError:
            continue

    unique = deduplicate(all_props)
    marketplace = to_marketplace_format(unique)

    result = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total_raw": len(all_props),
        "total_unique": len(unique),
        "sources": _count_by(all_props, "source"),
        "properties": unique,
        "marketplace": marketplace,
    }

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    return result


def _count_by(items: list[dict], key: str) -> dict[str, int]:
    c: dict[str, int] = defaultdict(int)
    for it in items:
        c[str(it.get(key) or "unknown")] += 1
    return dict(c)
