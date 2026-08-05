"""
Scraper Mercado Libre Inmuebles — Avellaneda / GBA Sur.

Usa Playwright (headless Chromium) para evitar bloqueos básicos.
Extrae listados y normaliza al schema unificado.
"""

from __future__ import annotations

import asyncio
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin, urlparse, parse_qs

# allow running from scrapers/ root
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from common.schema import (
    Property, Price, Surface, Address, Geo, Publisher,
    normalize_operation, normalize_property_type,
    parse_price, parse_int, parse_float, save_properties,
)

# URLs base
BASE_URL = "https://inmuebles.mercadolibre.com.ar"

URL_VENTA_AVELLANEDA = (
    "https://inmuebles.mercadolibre.com.ar/venta/bsas-gba-sur/avellaneda/_NoIndex_True"
)
URL_ALQUILER_AVELLANEDA = (
    "https://inmuebles.mercadolibre.com.ar/alquiler/bsas-gba-sur/avellaneda/_NoIndex_True"
)
URL_VENTA_LANUS = (
    "https://inmuebles.mercadolibre.com.ar/venta/bsas-gba-sur/lanus/_NoIndex_True"
)
# Combinado + orden precio DESC (útil para high-ticket / validación)
URL_AVELLANEDA_PRICE_DESC = (
    "https://inmuebles.mercadolibre.com.ar/bsas-gba-sur/avellaneda/"
    "_OrderId_PRICE*DESC_NoIndex_True"
)

START_URLS = [URL_VENTA_AVELLANEDA, URL_ALQUILER_AVELLANEDA, URL_VENTA_LANUS]

# Perfiles de proceso periódico
# daily  → pocas páginas, solo Avellaneda (detectar altas recientes)
# weekly → más profundidad + Lanús
# monthly → full práctico (~42 págs × URL, límite ML)
PROFILES = {
    "daily": {
        "pages": 2,
        "urls": [URL_VENTA_AVELLANEDA, URL_ALQUILER_AVELLANEDA],
        "label": "daily",
    },
    "weekly": {
        "pages": 8,
        "urls": [URL_VENTA_AVELLANEDA, URL_ALQUILER_AVELLANEDA, URL_VENTA_LANUS],
        "label": "weekly",
    },
    "monthly": {
        "pages": 42,
        "urls": [URL_VENTA_AVELLANEDA, URL_ALQUILER_AVELLANEDA],
        "label": "monthly",
    },
}

MAX_PAGES = 5          # default CLI si no hay profile
HEADLESS = True
OUTPUT_DIR = Path(__file__).resolve().parents[1] / "output"


def extract_id_from_url(url: str) -> str:
    """Extrae MLA-xxx del URL."""
    m = re.search(r"(MLA-?\d+)", url, re.I)
    if m:
        return m.group(1).replace("MLA", "MLA-").replace("MLA--", "MLA-")
    # fallback: hash del path
    return "MLA-" + str(abs(hash(urlparse(url).path)))[:10]


def parse_card(card_html: str, page_url: str) -> Property | None:
    """Parsea una card de resultado de ML (layout poly-card 2026 + fallback legacy)."""
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(card_html, "lxml")

    # Link + título (nuevo layout poly-component)
    link = soup.select_one("a.poly-component__title")
    if not link:
        link = soup.select_one(
            "a.ui-search-link, a.ui-search-result__content, "
            "a[href*='/MLA'], a[href*='mercadolibre.com.ar/MLA']"
        )
    if not link or not link.get("href"):
        return None

    href = link["href"]
    if href.startswith("/"):
        href = urljoin(BASE_URL, href)
    href = href.split("#")[0]

    external_id = extract_id_from_url(href)

    title = link.get_text(strip=True)
    if not title:
        title_el = soup.select_one(
            "h2.ui-search-item-title__title, h2.ui-search-item-title, "
            ".ui-search-item__title, h2, h3"
        )
        title = title_el.get_text(strip=True) if title_el else ""
    if not title:
        return None

    # Precio
    price_el = soup.select_one(
        ".andes-money-amount__fraction, "
        ".price-tag-fraction, "
        ".ui-search-price__part"
    )
    currency_el = soup.select_one(
        ".andes-money-amount__currency-symbol, "
        ".andes-money-amount__currency, "
        ".price-tag-symbol"
    )
    price_text = ""
    if currency_el:
        price_text += currency_el.get_text(strip=True) + " "
    if price_el:
        price_text += price_el.get_text(strip=True)
    # aria-label del monto a veces es más limpio: "79500 dólares"
    amount_wrap = soup.select_one("[data-andes-money-amount='true'], .andes-money-amount")
    if amount_wrap and amount_wrap.get("aria-label") and not price_el:
        price_text = amount_wrap["aria-label"]
    price = parse_price(price_text)

    # Atributos: poly-attributes_list__item + legacy
    attrs = soup.select(
        "li.poly-attributes_list__item, "
        ".ui-search-card-attributes__attribute, "
        "li.ui-search-card-attributes__attribute, "
        ".ui-search-item__group__element"
    )
    rooms = bedrooms = bathrooms = None
    covered = total = None
    for a in attrs:
        txt = a.get_text(" ", strip=True).lower()
        if "amb" in txt:
            rooms = parse_int(txt)
        elif "dorm" in txt or "habitacion" in txt:
            bedrooms = parse_int(txt)
        elif "baño" in txt or "bano" in txt:
            bathrooms = parse_int(txt)
        elif "m²" in txt or "m2" in txt:
            val = parse_float(txt)
            if "cub" in txt or "cubiert" in txt:
                covered = val
            else:
                total = total or val

    # Ubicación
    loc_el = soup.select_one(
        ".poly-component__location, "
        ".ui-search-item__location, "
        ".ui-search-item__group__element--location, "
        "span.ui-search-item__location"
    )
    location = loc_el.get_text(strip=True) if loc_el else ""
    neighborhood = city = None
    if location:
        parts = [x.strip() for x in location.split(",")]
        # ej: "BAHIA BLANCA 208, Wilde, Avellaneda, Bs.As. G.B.A. Sur"
        if len(parts) >= 3:
            neighborhood, city = parts[-3], parts[-2]
        elif len(parts) >= 2:
            neighborhood, city = parts[0], parts[1]
        elif parts:
            city = parts[0]

    # Imagen principal (primera poly-component__picture del portada)
    images = []
    for img_el in soup.select("img.poly-component__picture, img"):
        src = img_el.get("data-src") or img_el.get("src") or ""
        if src and not src.startswith("data:") and "vis-accounts" not in src:
            images.append(src)
            break

    # Operación: headline o URL
    headline = soup.select_one(".poly-component__headline")
    headline_txt = headline.get_text(strip=True).lower() if headline else ""
    operation = "venta"
    if "alquil" in headline_txt or "/alquiler" in page_url or "/alquiler" in href:
        operation = "alquiler"

    # Tipo desde headline o título
    ptype = normalize_property_type(headline_txt or title)

    # Seller — varios selectores + fallback avatar de tienda
    seller_name = None
    seller_source = None
    for sel in (
        ".poly-component__seller",
        ".poly-component__seller-name",
        ".ui-search-official-store-label",
        ".ui-search-item__group__element--store",
    ):
        seller_el = soup.select_one(sel)
        if seller_el:
            seller_name = re.sub(r"\s+", " ", seller_el.get_text(" ", strip=True)).strip()
            if seller_name:
                seller_source = f"card:{sel}"
                break

    # Fallback: alt del logo de cuenta (vis-accounts) — nickname ML
    if not seller_name:
        for img_el in soup.select("img"):
            src = img_el.get("src") or img_el.get("data-src") or ""
            alt = (img_el.get("alt") or "").strip()
            if "vis-accounts" in src and alt and alt.lower() != title.lower():
                # filtrar alts basura
                if len(alt) >= 3 and "m²" not in alt and not alt.startswith("http"):
                    seller_name = alt
                    seller_source = "card:vis-accounts-alt"
                    break

    return Property(
        source="mercadolibre",
        external_id=external_id,
        url=href,
        title=title,
        operation=operation,
        property_type=ptype,
        price=price,
        surface=Surface(total=total, covered=covered),
        rooms=rooms,
        bedrooms=bedrooms,
        bathrooms=bathrooms,
        address=Address(
            neighborhood=neighborhood,
            city=city or "Avellaneda",
            province="Buenos Aires",
            full=location or None,
        ),
        images=images,
        publisher=Publisher(
            name=seller_name,
            type="inmobiliaria" if seller_name else "particular",
        ),
        scraped_at=datetime.now(timezone.utc).isoformat(),
        raw={
            "list_url": page_url,
            "headline": headline_txt or None,
            "seller_source": seller_source,
        },
    )


PAGE_SIZE = 48  # resultados por página en ML Inmuebles


def build_page_url(base_url: str, page_num: int) -> str:
    """
    ML ya no expone href en la paginación (JS).
    Usamos el offset oficial: _Desde_{N}
    page 1 → sin Desde, page 2 → _Desde_49, page 3 → _Desde_97, ...
    """
    if page_num <= 1:
        return base_url
    offset = (page_num - 1) * PAGE_SIZE + 1
    # Insertar _Desde_N antes de _NoIndex o al final
    if "_NoIndex" in base_url:
        return base_url.replace("_NoIndex", f"_Desde_{offset}_NoIndex")
    if base_url.endswith(".html"):
        return base_url.replace(".html", f"_Desde_{offset}.html")
    sep = "" if base_url.endswith("/") else "/"
    return f"{base_url}{sep}_Desde_{offset}"


async def scrape_list_page(page, url: str) -> list[Property]:
    """Scrape una página de listado."""
    await page.goto(url, wait_until="domcontentloaded", timeout=60000)
    await page.wait_for_timeout(1800)

    for _ in range(3):
        await page.evaluate("window.scrollBy(0, window.innerHeight)")
        await page.wait_for_timeout(500)

    cards = await page.query_selector_all(
        "li.ui-search-layout__item, "
        "div.ui-search-result, "
        "div.poly-card, "
        "ol.ui-search-layout > li"
    )

    props: list[Property] = []
    seen_in_page: set[str] = set()
    for card in cards:
        try:
            html = await card.inner_html()
            prop = parse_card(html, url)
            if prop and prop.external_id not in seen_in_page:
                seen_in_page.add(prop.external_id)
                props.append(prop)
        except Exception:
            continue

    return props


def summarize_props(props: list[Property]) -> dict:
    """Stats rápidas de un batch scrapeado."""
    ops: dict[str, int] = {}
    types: dict[str, int] = {}
    sellers: dict[str, int] = {}
    with_price = 0
    with_image = 0
    with_seller = 0
    for p in props:
        ops[p.operation] = ops.get(p.operation, 0) + 1
        types[p.property_type] = types.get(p.property_type, 0) + 1
        if p.price and p.price.amount:
            with_price += 1
        if p.images:
            with_image += 1
        name = (p.publisher.name if p.publisher else None) or "Particular"
        sellers[name] = sellers.get(name, 0) + 1
        if p.publisher and p.publisher.name:
            with_seller += 1
    top_sellers = sorted(sellers.items(), key=lambda x: -x[1])[:8]
    return {
        "total": len(props),
        "operations": ops,
        "types": dict(sorted(types.items(), key=lambda x: -x[1])),
        "with_price": with_price,
        "with_image": with_image,
        "with_seller": with_seller,
        "top_sellers": top_sellers,
    }


async def run(
    start_urls: list[str] | None = None,
    max_pages: int = MAX_PAGES,
    headless: bool = HEADLESS,
    profile: str | None = None,
) -> list[Property]:
    from playwright.async_api import async_playwright

    if profile:
        if profile not in PROFILES:
            raise ValueError(f"Profile desconocido: {profile}. Usá: {list(PROFILES)}")
        cfg = PROFILES[profile]
        start_urls = cfg["urls"]
        max_pages = cfg["pages"]
        print(f"[ML] profile={profile} pages={max_pages} urls={len(start_urls)}")
    else:
        start_urls = start_urls or START_URLS

    all_props: list[Property] = []
    seen_ids: set[str] = set()

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=headless)
        context = await browser.new_context(
            locale="es-AR",
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/122.0.0.0 Safari/537.36"
            ),
            viewport={"width": 1366, "height": 900},
        )
        page = await context.new_page()

        for start in start_urls:
            consecutive_empty = 0
            # etiqueta corta para logs
            label = "venta" if "/venta/" in start else ("alquiler" if "/alquiler/" in start else "mix")
            if "lanus" in start:
                label += "/lanus"
            elif "avellaneda" in start:
                label += "/avellaneda"

            for page_num in range(1, max_pages + 1):
                url = build_page_url(start, page_num)
                print(f"[ML] {label} p{page_num}")
                try:
                    props = await scrape_list_page(page, url)
                except Exception as e:
                    print(f"[ML] Error en {url}: {e}")
                    consecutive_empty += 1
                    if consecutive_empty >= 2:
                        break
                    continue

                new = 0
                for p in props:
                    if p.external_id not in seen_ids:
                        seen_ids.add(p.external_id)
                        all_props.append(p)
                        new += 1
                print(f"[ML]   → {len(props)} cards, {new} nuevas (total {len(all_props)})")

                if new == 0:
                    consecutive_empty += 1
                    if consecutive_empty >= 2:
                        print(f"[ML] Sin resultados nuevos ×2 → fin de {label}")
                        break
                else:
                    consecutive_empty = 0

                await page.wait_for_timeout(1000)

        await browser.close()

    stats = summarize_props(all_props)
    print(
        f"[ML] RESUMEN total={stats['total']} "
        f"ops={stats['operations']} "
        f"price={stats['with_price']} img={stats['with_image']} seller={stats['with_seller']}"
    )
    return all_props


def _clean_publisher_name(name: str | None) -> str | None:
    if not name:
        return None
    n = re.sub(r"\s+", " ", str(name)).strip()
    n = re.sub(
        r"^(publicado por|vendedor|inmobiliaria)\s+",
        "",
        n,
        flags=re.I,
    ).strip()
    n = re.sub(r"\s+responde sus consultas.*$", "", n, flags=re.I).strip()
    n = re.sub(r"\s+con identidad verificada.*$", "", n, flags=re.I).strip()
    # descartar basura de scripts / JSON embebido
    if len(n) < 2 or len(n) > 80:
        return None
    if any(x in n for x in ("{", "}", "function", '"action"', "font_size", ".js", "_n.ctx")):
        return None
    if n.count(" ") > 10:
        return None
    if n.lower() in ("tiendas oficiales", "ver tienda", "mercadolibre", "particular"):
        return None
    return n


async def extract_publisher_from_detail(page, url: str) -> str | None:
    """Entra a la ficha y busca 'Publicado por X' / tienda oficial."""
    try:
        await page.goto(url, wait_until="domcontentloaded", timeout=45000)
        await page.wait_for_timeout(1800)
        html = await page.content()
    except Exception as e:
        print(f"[ML] detail error {url[:60]}: {e}")
        return None

    from bs4 import BeautifulSoup
    soup = BeautifulSoup(html, "lxml")

    # sacar scripts para no matchear JS
    for tag in soup(["script", "style", "noscript"]):
        tag.decompose()

    # 1) Bloques cortos "Publicado por X" (más confiable)
    for el in soup.find_all(["div", "span", "p", "h2", "h3", "a", "button"]):
        txt = el.get_text(" ", strip=True)
        if not txt or len(txt) > 120:
            continue
        if not re.search(r"publicado por", txt, re.I):
            continue
        m = re.search(r"publicado por\s+(.+)", txt, re.I)
        if m:
            name = _clean_publisher_name(m.group(1))
            if name:
                return name

    # 2) Link a tienda oficial
    for a in soup.select("a[href*='/tienda/']"):
        name = _clean_publisher_name(a.get_text(" ", strip=True))
        if name:
            return name

    # 3) Texto suelto en nodos (evitar script ya removido)
    for el in soup.find_all(string=re.compile(r"Publicado por\s+\S", re.I)):
        parent = el.parent
        if not parent:
            continue
        txt = parent.get_text(" ", strip=True)
        if len(txt) > 120:
            continue
        m = re.search(r"Publicado por\s+(.+)", txt, re.I)
        if m:
            name = _clean_publisher_name(m.group(1))
            if name:
                return name

    return None


async def enrich_publishers(
    props: list[Property],
    headless: bool = True,
    limit: int | None = None,
    delay_ms: int = 900,
) -> list[Property]:
    """
    Para props sin publisher.name, visita la ficha y completa 'Publicado por'.
    limit=None → todas las que falten; en daily conviene limit=80.
    """
    from playwright.async_api import async_playwright

    missing = [p for p in props if not (p.publisher and p.publisher.name)]
    if limit is not None:
        missing = missing[:limit]
    if not missing:
        print("[ML] enrich: nada que completar")
        return props

    print(f"[ML] enrich: {len(missing)} fichas sin seller (de {len(props)})")
    filled = 0

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=headless)
        context = await browser.new_context(
            locale="es-AR",
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/122.0.0.0 Safari/537.36"
            ),
            viewport={"width": 1280, "height": 800},
        )
        page = await context.new_page()

        for i, p in enumerate(missing, 1):
            name = await extract_publisher_from_detail(page, p.url)
            if name:
                p.publisher = Publisher(name=name, type="inmobiliaria")
                p.raw = dict(p.raw or {})
                p.raw["seller_source"] = "detail:publicado_por"
                filled += 1
            if i % 10 == 0 or i == len(missing):
                print(f"[ML] enrich {i}/{len(missing)} — filled={filled}")
            await page.wait_for_timeout(delay_ms)

        await browser.close()

    stats = summarize_props(props)
    print(f"[ML] enrich DONE filled={filled} seller_coverage={stats['with_seller']}/{stats['total']}")
    return props


def match_publishers_to_padron(
    props: list[Property],
    padron_path: str | Path | None = None,
) -> dict:
    """
    Coteja publisher.name contra razon_social / nombre_fantasia / nombre del padrón.
    Anota en p.raw['padron_match'].
    """
    import unicodedata

    if padron_path is None:
        padron_path = (
            Path(__file__).resolve().parents[2]
            / "directorio-inmobiliario"
            / "data"
            / "profesionales.json"
        )
    padron_path = Path(padron_path)
    if not padron_path.exists():
        print(f"[ML] padron no encontrado: {padron_path}")
        return {"matched": 0, "unmatched": 0}

    with open(padron_path, encoding="utf-8") as f:
        mats = json.load(f)

    def norm(s: str) -> str:
        s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode("ascii")
        s = s.lower()
        s = re.sub(
            r"\b(inmobiliaria|propiedades|propiedad|gestion|bienes|raices|"
            r"real|estate|grupo|studio|estudio|asoc|asociados)\b",
            " ",
            s,
        )
        s = re.sub(r"[^\w\s]", " ", s)
        return re.sub(r"\s+", " ", s).strip()

    index: list[tuple[str, dict]] = []
    for m in mats:
        for field in ("razon_social", "nombre_fantasia", "nombre_completo", "apellido"):
            v = m.get(field)
            if v:
                index.append((norm(str(v)), m))

    matched = 0
    unmatched_names: dict[str, int] = {}

    for p in props:
        name = p.publisher.name if p.publisher else None
        if not name:
            continue
        ns = norm(name)
        hit = None
        # exact / containment
        for key, m in index:
            if not key or len(key) < 3:
                continue
            if ns == key or ns in key or key in ns:
                hit = m
                break
        if not hit:
            # token overlap
            t1 = set(ns.split())
            best_score = 0.0
            for key, m in index:
                t2 = set(key.split())
                if not t1 or not t2:
                    continue
                score = len(t1 & t2) / max(len(t1), len(t2))
                if score >= 0.7 and score > best_score:
                    best_score = score
                    hit = m

        p.raw = dict(p.raw or {})
        if hit:
            matched += 1
            p.raw["padron_match"] = {
                "matricula": hit.get("matricula"),
                "nombre_completo": hit.get("nombre_completo"),
                "razon_social": hit.get("razon_social"),
                "id": hit.get("id"),
            }
        else:
            unmatched_names[name] = unmatched_names.get(name, 0) + 1
            p.raw["padron_match"] = None

    top_unmatched = sorted(unmatched_names.items(), key=lambda x: -x[1])[:15]
    print(f"[ML] padron match: {matched} props vinculadas")
    if top_unmatched:
        print("[ML] top sellers sin padrón:")
        for n, c in top_unmatched:
            print(f"    {c:4}  {n}")
    return {
        "matched": matched,
        "unmatched_names": top_unmatched,
        "with_publisher": sum(1 for p in props if p.publisher and p.publisher.name),
    }


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Scraper Mercado Libre Inmuebles")
    parser.add_argument("--pages", type=int, default=MAX_PAGES)
    parser.add_argument("--headed", action="store_true", help="Mostrar browser")
    parser.add_argument("--out", type=str, default=None)
    args = parser.parse_args()

    props = asyncio.run(run(max_pages=args.pages, headless=not args.headed))

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    out = Path(args.out) if args.out else OUTPUT_DIR / f"ml_{ts}.json"
    save_properties(props, str(out))
    print(f"[ML] Guardado {len(props)} propiedades → {out}")


if __name__ == "__main__":
    main()
