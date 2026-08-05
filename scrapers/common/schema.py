"""
Schema unificado de propiedades.
Todos los scrapers deben normalizar a este formato.
"""

from __future__ import annotations

from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from typing import Any, Optional
import hashlib
import json
import re


OPERATIONS = {"venta", "alquiler", "alquiler_temporario"}
PROPERTY_TYPES = {
    "departamento", "casa", "ph", "local", "oficina",
    "terreno", "cochera", "galpon", "campo", "otro",
}


@dataclass
class Geo:
    lat: Optional[float] = None
    lng: Optional[float] = None


@dataclass
class Address:
    street: Optional[str] = None
    neighborhood: Optional[str] = None
    city: Optional[str] = None
    province: Optional[str] = None
    full: Optional[str] = None


@dataclass
class Price:
    amount: Optional[float] = None
    currency: Optional[str] = None  # USD | ARS
    expenses: Optional[float] = None


@dataclass
class Surface:
    total: Optional[float] = None
    covered: Optional[float] = None


@dataclass
class Publisher:
    name: Optional[str] = None
    type: Optional[str] = None  # inmobiliaria | particular
    phone: Optional[str] = None


@dataclass
class Property:
    source: str                          # mercadolibre | zonaprop
    external_id: str
    url: str
    title: str
    operation: str                       # venta | alquiler | ...
    property_type: str
    price: Price = field(default_factory=Price)
    surface: Surface = field(default_factory=Surface)
    rooms: Optional[int] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    address: Address = field(default_factory=Address)
    geo: Geo = field(default_factory=Geo)
    description: Optional[str] = None
    images: list[str] = field(default_factory=list)
    publisher: Publisher = field(default_factory=Publisher)
    published_at: Optional[str] = None   # ISO
    scraped_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    raw: dict[str, Any] = field(default_factory=dict)

    def fingerprint(self) -> str:
        """ID estable para deduplicación cross-source."""
        base = f"{self.source}|{self.external_id}|{self.url}"
        return hashlib.sha1(base.encode()).hexdigest()[:16]

    def to_dict(self) -> dict:
        d = asdict(self)
        d["id"] = self.fingerprint()
        return d


def normalize_operation(text: str | None) -> str:
    if not text:
        return "venta"
    t = text.lower().strip()
    if "alquil" in t and "tempor" in t:
        return "alquiler_temporario"
    if "alquil" in t:
        return "alquiler"
    return "venta"


def normalize_property_type(text: str | None) -> str:
    if not text:
        return "otro"
    t = text.lower().strip()
    mapping = {
        "departamento": "departamento",
        "depto": "departamento",
        "apto": "departamento",
        "casa": "casa",
        "ph": "ph",
        "local": "local",
        "oficina": "oficina",
        "terreno": "terreno",
        "lote": "terreno",
        "cochera": "cochera",
        "garage": "cochera",
        "galpon": "galpon",
        "galpón": "galpon",
        "campo": "campo",
    }
    for k, v in mapping.items():
        if k in t:
            return v
    return "otro"


def parse_price(text: str | None) -> Price:
    """Parsea strings tipo 'USD 185.000' o '$ 1.200.000' o '1200000'."""
    if not text:
        return Price()
    t = str(text).strip().replace("\xa0", " ")
    currency = "ARS"
    if re.search(r"\bUSD\b|U\$S|US\$", t, re.I):
        currency = "USD"
    # quitar todo excepto dígitos
    digits = re.sub(r"[^\d]", "", t)
    amount = float(digits) if digits else None
    return Price(amount=amount, currency=currency)


def parse_int(text: str | None) -> Optional[int]:
    if text is None:
        return None
    m = re.search(r"\d+", str(text))
    return int(m.group()) if m else None


def parse_float(text: str | None) -> Optional[float]:
    if text is None:
        return None
    t = str(text).replace(",", ".")
    m = re.search(r"[\d.]+", t)
    return float(m.group()) if m else None


def save_properties(props: list[Property], path: str) -> None:
    data = [p.to_dict() for p in props]
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def load_properties(path: str) -> list[dict]:
    with open(path, encoding="utf-8") as f:
        return json.load(f)
