#!/usr/bin/env python3
"""
CLI unificado de scrapers.

Ejemplos:
  python run.py ml --pages 3
  python run.py zonaprop --pages 2
  python run.py all --pages 2
  python run.py merge
  python run.py export-marketplace
"""

from __future__ import annotations

import asyncio
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import click

ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "output"
sys.path.insert(0, str(ROOT))

from common.normalize import merge_runs, to_marketplace_format, deduplicate
from common.schema import save_properties


@click.group()
def cli():
    """Scrapers inmobiliarios — Mercado Libre + ZonaProp → schema unificado."""
    OUTPUT.mkdir(parents=True, exist_ok=True)


@cli.command("ml")
@click.option("--pages", default=None, type=int, help="Páginas por URL (override del profile)")
@click.option(
    "--profile",
    type=click.Choice(["daily", "weekly", "monthly"], case_sensitive=False),
    default=None,
    help="Perfil periódico: daily=2p Avellaneda | weekly=8p +Lanús | monthly=42p full",
)
@click.option("--headed", is_flag=True, help="Mostrar browser (debug)")
@click.option(
    "--enrich-sellers",
    is_flag=True,
    help="Visitar fichas sin 'publicado por' para completar inmobiliaria",
)
@click.option(
    "--enrich-limit",
    default=80,
    show_default=True,
    help="Máx. fichas a enriquecer (None=todas vía --enrich-limit -1)",
)
@click.option(
    "--match-padron/--no-match-padron",
    default=True,
    show_default=True,
    help="Cotejar sellers contra padrón CPMCAL",
)
def cmd_ml(
    pages: int | None,
    profile: str | None,
    headed: bool,
    enrich_sellers: bool,
    enrich_limit: int,
    match_padron: bool,
):
    """Scrape Mercado Libre Inmuebles (Avellaneda / Lanús)."""
    from ml.scraper import (
        run as ml_run,
        summarize_props,
        enrich_publishers,
        match_publishers_to_padron,
    )

    kwargs = {"headless": not headed}
    if profile:
        kwargs["profile"] = profile.lower()
        tag = profile.lower()
    else:
        kwargs["max_pages"] = pages if pages is not None else 3
        tag = f"p{kwargs['max_pages']}"

    props = asyncio.run(ml_run(**kwargs))

    if enrich_sellers:
        lim = None if enrich_limit < 0 else enrich_limit
        props = asyncio.run(
            enrich_publishers(props, headless=not headed, limit=lim)
        )

    if match_padron:
        match_publishers_to_padron(props)

    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    out = OUTPUT / f"ml_{tag}_{ts}.json"
    save_properties(props, str(out))
    save_properties(props, str(OUTPUT / "ml_latest.json"))
    if profile:
        save_properties(props, str(OUTPUT / f"ml_{profile.lower()}_latest.json"))

    stats = summarize_props(props)
    click.echo(f"✓ ML [{tag}]: {len(props)} props → {out.name}")
    click.echo(f"  ops={stats['operations']} types={list(stats['types'].items())[:5]}")
    click.echo(f"  price={stats['with_price']} img={stats['with_image']} seller={stats['with_seller']}")
    click.echo(f"  top sellers: {stats['top_sellers'][:6]}")


@cli.command("zonaprop")
@click.option("--pages", default=2, show_default=True)
@click.option("--headed", is_flag=True)
def cmd_zp(pages: int, headed: bool):
    """Scrape ZonaProp (Avellaneda / Lanús)."""
    from zonaprop.scraper import run as zp_run
    props = asyncio.run(zp_run(max_pages=pages, headless=not headed))
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    out = OUTPUT / f"zonaprop_{ts}.json"
    save_properties(props, str(out))
    save_properties(props, str(OUTPUT / "zonaprop_latest.json"))
    click.echo(f"✓ ZonaProp: {len(props)} props → {out.name}")


@cli.command("all")
@click.option("--pages", default=2, show_default=True)
@click.option("--headed", is_flag=True)
def cmd_all(pages: int, headed: bool):
    """Corre ML + ZonaProp y mergea resultados."""
    ctx = click.get_current_context()
    ctx.invoke(cmd_ml, pages=pages, headed=headed)
    ctx.invoke(cmd_zp, pages=pages, headed=headed)
    ctx.invoke(cmd_merge)


@cli.command("merge")
def cmd_merge():
    """Deduplica outputs y genera unified_latest.json."""
    files = list(OUTPUT.glob("ml_*.json")) + list(OUTPUT.glob("zonaprop_*.json"))
    # prefer latest copies
    latest = [OUTPUT / "ml_latest.json", OUTPUT / "zonaprop_latest.json"]
    paths = [str(p) for p in latest if p.exists()] or [str(p) for p in files]
    if not paths:
        click.echo("No hay archivos para mergear en output/")
        return

    out = OUTPUT / "unified_latest.json"
    result = merge_runs(paths, str(out))
    click.echo(
        f"✓ Merge: {result['total_raw']} raw → {result['total_unique']} unique "
        f"| sources={result['sources']} → {out.name}"
    )


@cli.command("export-marketplace")
@click.option(
    "--dest",
    default=str(ROOT.parent / "marketplace-inmobiliario" / "data" / "scraped_properties.json"),
    show_default=True,
)
def cmd_export(dest: str):
    """
    Exporta unified_latest al formato del frontend marketplace.
    También genera un data.js listo para drop-in (opcional).
    """
    unified = OUTPUT / "unified_latest.json"
    if not unified.exists():
        click.echo("Falta unified_latest.json — corré antes: python run.py merge")
        return

    with open(unified, encoding="utf-8") as f:
        data = json.load(f)

    marketplace = data.get("marketplace") or to_marketplace_format(data.get("properties") or [])
    dest_path = Path(dest)
    dest_path.parent.mkdir(parents=True, exist_ok=True)

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "count": len(marketplace),
        "properties": marketplace,
    }
    with open(dest_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    # también un JS drop-in
    js_path = dest_path.with_suffix(".js")
    with open(js_path, "w", encoding="utf-8") as f:
        f.write("// Auto-generado por scrapers — no editar a mano\n")
        f.write(f"const SCRAPED_PROPERTIES = {json.dumps(marketplace, ensure_ascii=False, indent=2)};\n")

    click.echo(f"✓ Export: {len(marketplace)} props → {dest_path}")
    click.echo(f"  JS drop-in → {js_path}")


def _load_prop_list(path: Path) -> list[dict]:
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        return data.get("properties") or data.get("marketplace") or []
    return []


def _prop_id(p: dict) -> str:
    return p.get("external_id") or p.get("id") or ""


def _price_amount(p: dict):
    price = p.get("price")
    if isinstance(price, dict):
        return price.get("amount"), price.get("currency")
    return p.get("price"), p.get("currency")


@cli.command("diff")
@click.option("--a", "path_a", required=True, type=click.Path(exists=True), help="Corrida base (vieja)")
@click.option("--b", "path_b", required=True, type=click.Path(exists=True), help="Corrida nueva")
@click.option("--out", "out_path", default=None, help="JSON con el delta (opcional)")
def cmd_diff(path_a: str, path_b: str, out_path: str | None):
    """Compara dos corridas ML: altas, bajas y cambios de precio."""
    a_list = _load_prop_list(Path(path_a))
    b_list = _load_prop_list(Path(path_b))
    by_a = {_prop_id(p): p for p in a_list if _prop_id(p)}
    by_b = {_prop_id(p): p for p in b_list if _prop_id(p)}
    ids_a, ids_b = set(by_a), set(by_b)

    added_ids = ids_b - ids_a
    removed_ids = ids_a - ids_b
    common = ids_a & ids_b

    price_changes = []
    for i in common:
        pa, ca = _price_amount(by_a[i])
        pb, cb = _price_amount(by_b[i])
        if pa != pb or ca != cb:
            price_changes.append({
                "id": i,
                "title": (by_b[i].get("title") or "")[:60],
                "old": {"amount": pa, "currency": ca},
                "new": {"amount": pb, "currency": cb},
            })

    added = [
        {
            "id": i,
            "title": (by_b[i].get("title") or "")[:60],
            "operation": by_b[i].get("operation"),
            "price": _price_amount(by_b[i]),
            "seller": (by_b[i].get("publisher") or {}).get("name") if isinstance(by_b[i].get("publisher"), dict) else by_b[i].get("seller"),
        }
        for i in sorted(added_ids)
    ]
    removed = [
        {
            "id": i,
            "title": (by_a[i].get("title") or "")[:60],
            "operation": by_a[i].get("operation"),
            "price": _price_amount(by_a[i]),
        }
        for i in sorted(removed_ids)
    ]

    delta = {
        "base": path_a,
        "new": path_b,
        "base_count": len(by_a),
        "new_count": len(by_b),
        "added_count": len(added),
        "removed_count": len(removed),
        "price_changes_count": len(price_changes),
        "added": added[:50],
        "removed": removed[:50],
        "price_changes": price_changes[:50],
    }

    click.echo(f"=== DIFF {Path(path_a).name} → {Path(path_b).name} ===")
    click.echo(f"  Base: {delta['base_count']}  |  Nueva: {delta['new_count']}")
    click.echo(f"  + Altas: {delta['added_count']}")
    click.echo(f"  - Bajas: {delta['removed_count']}")
    click.echo(f"  ~ Precio: {delta['price_changes_count']}")
    if added:
        click.echo("  Ej. altas:")
        for x in added[:5]:
            click.echo(f"    + {x['id']} | {x.get('operation')} | {x.get('price')} | {x['title']}")
    if price_changes:
        click.echo("  Ej. precios:")
        for x in price_changes[:5]:
            click.echo(f"    ~ {x['id']} {x['old']} → {x['new']} | {x['title']}")

    if out_path:
        Path(out_path).parent.mkdir(parents=True, exist_ok=True)
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(delta, f, ensure_ascii=False, indent=2)
        click.echo(f"  Δ guardado → {out_path}")


@cli.command("status")
def cmd_status():
    """Muestra archivos en output/ y conteos."""
    if not OUTPUT.exists():
        click.echo("output/ vacío")
        return
    for p in sorted(OUTPUT.glob("*.json")):
        try:
            with open(p, encoding="utf-8") as f:
                data = json.load(f)
            if isinstance(data, list):
                n = len(data)
            elif isinstance(data, dict):
                n = data.get("total_unique") or data.get("count") or len(data.get("properties") or [])
            else:
                n = "?"
            click.echo(f"  {p.name:40} {n}")
        except Exception as e:
            click.echo(f"  {p.name:40} error: {e}")


if __name__ == "__main__":
    cli()
