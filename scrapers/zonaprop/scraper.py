"""
Scraper ZonaProp — Avellaneda.

ZonaProp tiene protecciones anti-bot más agresivas (Cloudflare / 403).
Este scraper usa Playwright con stealth básico.
Si falla el listado HTML, intenta extraer del JSON embebido (__NEXT_DATA__ / preloaded state).
"""

from __future__ import annotations

import asyncio
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from common.schema import (
    Property, Price, Surface, Address, Geo, Publisher,
    normalize_operation, normalize_property_type,
    parse_price, parse_int, parse_float, save_properties,
)

BASE_URL = "https://www.zonaprop.com.ar"
START_URLS = [
    "https://www.zonaprop.com.ar/inmuebles-avellaneda.html",
    "https://www.zonaprop.com.ar/departamentos-venta-avellaneda.html",
    "https://www.zonaprop.com.ar/departamentos-alquiler-avellaneda.html",
    "https://www.zonaprop.com.ar/casas-venta-avellaneda.html",
    "https://www.zonaprop.com.ar/inmuebles-lanus.html",
]

MAX_PAGES = 4
HEADLESS = True
OUTPUT_DIR = Path(__file__).resolve().parents[1] / "output"


def extract_id(url: str) -> str:
    m = re.search(r"-(\d+)\.html", url)
    if m:
        return f"ZP-{m.group(1)}"
    m = re.search(r"/(\d{6,})", url)
    if m:
        return f"ZP-{m.group(1)}"
    return "ZP-" + str(abs(hash(url)))[:10]


def prop_from_json_item(item: dict, list_url: str) -> Property | None:
    """Parsea un item del JSON embebido de ZonaProp (estructura variable)."""
    if not item:
        return None

    # campos posibles según versiones del site
    url = item.get("url") or item.get("link") or item.get("permalink") or ""
    if url and not url.startswith("http"):
        url = urljoin(BASE_URL, url)
    if not url:
        return None

    title = item.get("title") or item.get("nombre") or item.get("postingTitle") or ""
    if not title:
        return None

    external_id = str(item.get("id") or item.get("postingId") or extract_id(url))
    if not external_id.startswith("ZP-"):
        external_id = f"ZP-{external_id}"

    # precio
    price_data = item.get("price") or item.get("precio") or {}
    if isinstance(price_data, dict):
        amount = price_data.get("amount") or price_data.get("valor")
        currency = price_data.get("currency") or price_data.get("moneda") or "ARS"
        if currency in ("U$S", "US$", "Dolar", "Dólar"):
            currency = "USD"
        price = Price(amount=float(amount) if amount else None, currency=currency)
        expenses = price_data.get("expenses") or price_data.get("expensas")
        if expenses:
            price.expenses = float(expenses)
    else:
        price = parse_price(str(price_data) if price_data else None)

    # superficie / ambientes
    features = item.get("features") or item.get("mainFeatures") or item.get("caracteristicas") or {}
    if isinstance(features, list):
        feat_map = {}
        for f in features:
            if isinstance(f, dict):
                k = (f.get("label") or f.get("name") or "").lower()
                v = f.get("value") or f.get("valor")
                feat_map[k] = v
        features = feat_map

    rooms = parse_int(str(features.get("ambientes") or features.get("rooms") or item.get("rooms") or ""))
    bedrooms = parse_int(str(features.get("dormitorios") or features.get("bedrooms") or ""))
    bathrooms = parse_int(str(features.get("baños") or features.get("banos") or features.get("bathrooms") or ""))
    covered = parse_float(str(features.get("m2_cubiertos") or features.get("covered") or features.get("superficieCubierta") or ""))
    total = parse_float(str(features.get("m2_totales") or features.get("total") or features.get("superficieTotal") or ""))

    # ubicación
    loc = item.get("location") or item.get("ubicacion") or {}
    if isinstance(loc, str):
        address = Address(full=loc, city="Avellaneda", province="Buenos Aires")
    else:
        address = Address(
            street=loc.get("street") or loc.get("address"),
            neighborhood=loc.get("neighborhood") or loc.get("barrio"),
            city=loc.get("city") or loc.get("ciudad") or "Avellaneda",
            province=loc.get("province") or "Buenos Aires",
            full=loc.get("full") or loc.get("label"),
        )

    # geo
    geo_data = item.get("geo") or item.get("coordinates") or item.get("coordenadas") or {}
    geo = Geo(
        lat=geo_data.get("lat") or geo_data.get("latitude"),
        lng=geo_data.get("lng") or geo_data.get("lon") or geo_data.get("longitude"),
    )

    # imágenes
    imgs = item.get("images") or item.get("fotos") or item.get("pictures") or []
    images = []
    for im in imgs[:10]:
        if isinstance(im, str):
            images.append(im)
        elif isinstance(im, dict):
            src = im.get("url") or im.get("src") or im.get("resizeUrl1200x1200")
            if src:
                images.append(src)

    # operación / tipo
    op_raw = item.get("operation") or item.get("operacion") or item.get("operationType") or list_url
    operation = normalize_operation(str(op_raw))
    ptype = normalize_property_type(
        str(item.get("realEstateType") or item.get("tipo") or item.get("propertyType") or title)
    )

    publisher_data = item.get("publisher") or item.get("advertiser") or item.get("inmobiliaria") or {}
    if isinstance(publisher_data, str):
        publisher = Publisher(name=publisher_data, type="inmobiliaria")
    else:
        publisher = Publisher(
            name=publisher_data.get("name") or publisher_data.get("nombre"),
            type="inmobiliaria" if publisher_data else "particular",
            phone=publisher_data.get("phone") or publisher_data.get("telefono"),
        )

    return Property(
        source="zonaprop",
        external_id=external_id,
        url=url,
        title=title,
        operation=operation,
        property_type=ptype,
        price=price,
        surface=Surface(total=total, covered=covered),
        rooms=rooms,
        bedrooms=bedrooms,
        bathrooms=bathrooms,
        address=address,
        geo=geo,
        images=images,
        publisher=publisher,
        description=item.get("description") or item.get("descripcion"),
        scraped_at=datetime.now(timezone.utc).isoformat(),
        raw={"list_url": list_url},
    )


def parse_html_cards(html: str, list_url: str) -> list[Property]:
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(html, "lxml")
    props = []

    # cards típicas ZonaProp / Navent
    cards = soup.select(
        "[data-qa='POSTING_CARD_CONTAINER'], "
        "div.postingCard, "
        "div.postingsList-module__card-container, "
        "div[class*='PostingCard'], "
        "div[data-id]"
    )
    if not cards:
        # fallback: links a detalle
        for a in soup.select("a[href*='.html']"):
            href = a.get("href") or ""
            if not re.search(r"-\d+\.html", href):
                continue
            title = a.get_text(strip=True)
            if len(title) < 10:
                continue
            url = urljoin(BASE_URL, href)
            props.append(Property(
                source="zonaprop",
                external_id=extract_id(url),
                url=url,
                title=title,
                operation=normalize_operation(list_url),
                property_type=normalize_property_type(title),
                address=Address(city="Avellaneda", province="Buenos Aires"),
                scraped_at=datetime.now(timezone.utc).isoformat(),
                raw={"list_url": list_url, "partial": True},
            ))
        return props

    for card in cards:
        try:
            link = card.select_one("a[href*='.html']")
            if not link:
                continue
            href = urljoin(BASE_URL, link["href"])
            title_el = card.select_one("h2, h3, [data-qa='POSTING_CARD_DESCRIPTION'], .postingCardTitle")
            title = title_el.get_text(strip=True) if title_el else link.get_text(strip=True)
            if not title or len(title) < 5:
                continue

            price_el = card.select_one(
                "[data-qa='POSTING_CARD_PRICE'], .postingCardPrice, .price"
            )
            price = parse_price(price_el.get_text(strip=True) if price_el else None)

            loc_el = card.select_one(
                "[data-qa='POSTING_CARD_LOCATION'], .postingCardLocation, .location"
            )
            location = loc_el.get_text(strip=True) if loc_el else ""

            img = card.select_one("img")
            images = []
            if img:
                src = img.get("data-src") or img.get("src") or ""
                if src and not src.startswith("data:"):
                    images.append(src)

            # features text
            feat_text = " ".join(
                el.get_text(" ", strip=True)
                for el in card.select("[data-qa='POSTING_CARD_FEATURES'] span, .postingCardFeatures span, li")
            ).lower()
            rooms = parse_int(feat_text) if "amb" in feat_text else None

            props.append(Property(
                source="zonaprop",
                external_id=extract_id(href),
                url=href,
                title=title,
                operation=normalize_operation(list_url + " " + title),
                property_type=normalize_property_type(title),
                price=price,
                rooms=rooms,
                address=Address(
                    full=location or None,
                    city="Avellaneda",
                    province="Buenos Aires",
                ),
                images=images,
                scraped_at=datetime.now(timezone.utc).isoformat(),
                raw={"list_url": list_url},
            ))
        except Exception:
            continue
    return props


def extract_embedded_json(html: str) -> list[dict]:
    """Intenta sacar listados del state de React/Next embebido."""
    items = []

    # __NEXT_DATA__
    m = re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', html, re.DOTALL)
    if m:
        try:
            data = json.loads(m.group(1))
            # buscar arrays de postings en profundidad
            stack = [data]
            while stack:
                node = stack.pop()
                if isinstance(node, dict):
                    for k, v in node.items():
                        if k in ("postings", "listPostings", "results", "items", "props") and isinstance(v, list):
                            for it in v:
                                if isinstance(it, dict) and (it.get("url") or it.get("id") or it.get("title")):
                                    items.append(it)
                        else:
                            stack.append(v)
                elif isinstance(node, list):
                    stack.extend(node[:50])
        except json.JSONDecodeError:
            pass

    # preloaded state genérico
    for pattern in [
        r"window\.__PRELOADED_STATE__\s*=\s*(\{.*?\});\s*</script>",
        r"window\.dataLayer\s*=\s*(\[.*?\]);",
    ]:
        m = re.search(pattern, html, re.DOTALL)
        if m:
            try:
                data = json.loads(m.group(1))
                if isinstance(data, list):
                    items.extend([x for x in data if isinstance(x, dict)])
            except Exception:
                pass

    return items


async def scrape_list_page(page, url: str) -> tuple[list[Property], str | None]:
    await page.goto(url, wait_until="domcontentloaded", timeout=60000)
    await page.wait_for_timeout(3000)

    for _ in range(4):
        await page.evaluate("window.scrollBy(0, window.innerHeight)")
        await page.wait_for_timeout(700)

    html = await page.content()
    props: list[Property] = []

    # 1) JSON embebido
    embedded = extract_embedded_json(html)
    for item in embedded:
        p = prop_from_json_item(item, url)
        if p:
            props.append(p)

    # 2) HTML cards si no hubo JSON suficiente
    if len(props) < 5:
        html_props = parse_html_cards(html, url)
        seen = {p.external_id for p in props}
        for p in html_props:
            if p.external_id not in seen:
                props.append(p)
                seen.add(p.external_id)

    # next
    next_url = None
    next_btn = await page.query_selector(
        "a[data-qa='PAGING_NEXT'], "
        "a.paging-next, "
        "a[aria-label='Siguiente'], "
        "a[title='Siguiente']"
    )
    if next_btn:
        href = await next_btn.get_attribute("href")
        if href:
            next_url = urljoin(BASE_URL, href)

    return props, next_url


async def run(
    start_urls: list[str] | None = None,
    max_pages: int = MAX_PAGES,
    headless: bool = HEADLESS,
) -> list[Property]:
    from playwright.async_api import async_playwright

    start_urls = start_urls or START_URLS
    all_props: list[Property] = []
    seen: set[str] = set()

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
        # bloquear recursos pesados
        await context.route(
            re.compile(r"\.(png|jpg|jpeg|gif|svg|woff2?|css)(\?|$)"),
            lambda route: route.abort(),
        )
        page = await context.new_page()

        for start in start_urls:
            url = start
            for page_num in range(1, max_pages + 1):
                print(f"[ZP] {start[:55]}... p{page_num}")
                try:
                    props, next_url = await scrape_list_page(page, url)
                except Exception as e:
                    print(f"[ZP] Error: {e}")
                    break

                new = 0
                for p in props:
                    if p.external_id not in seen:
                        seen.add(p.external_id)
                        all_props.append(p)
                        new += 1
                print(f"[ZP]   → {len(props)} items, {new} nuevas (total {len(all_props)})")

                if not next_url or new == 0:
                    break
                url = next_url
                await page.wait_for_timeout(2000)

        await browser.close()

    return all_props


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Scraper ZonaProp")
    parser.add_argument("--pages", type=int, default=MAX_PAGES)
    parser.add_argument("--headed", action="store_true")
    parser.add_argument("--out", type=str, default=None)
    args = parser.parse_args()

    props = asyncio.run(run(max_pages=args.pages, headless=not args.headed))

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    out = Path(args.out) if args.out else OUTPUT_DIR / f"zonaprop_{ts}.json"
    save_properties(props, str(out))
    print(f"[ZP] Guardado {len(props)} propiedades → {out}")


if __name__ == "__main__":
    main()
