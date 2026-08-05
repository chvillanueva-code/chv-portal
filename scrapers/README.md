# Scrapers Inmobiliarios — ML + ZonaProp

Pipeline de scraping periódico para alimentar el **Marketplace Inmobiliario**.

## Fuentes

| Fuente | URL base | Notas |
|--------|----------|-------|
| Mercado Libre | `inmuebles.mercadolibre.com.ar` | Playwright, selectors `ui-search-*` |
| ZonaProp | `zonaprop.com.ar` | Playwright + JSON embebido + HTML fallback |

Zona: **Avellaneda / Lanús** (GBA Sur).

## Schema unificado

Ver `common/schema.py`. Campos principales:

```
source, external_id, url, title, operation, property_type,
price {amount, currency, expenses},
surface {total, covered},
rooms, bedrooms, bathrooms,
address {street, neighborhood, city, province, full},
geo {lat, lng},
images[], publisher {name, type, phone},
published_at, scraped_at, raw
```

## Setup

```bash
cd scrapers
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
playwright install chromium
```

## Uso

```bash
# Solo Mercado Libre (3 páginas por búsqueda)
python run.py ml --pages 3

# Solo ZonaProp
python run.py zonaprop --pages 2

# Ambos + merge
python run.py all --pages 2

# Deduplicar outputs existentes
python run.py merge

# Exportar al frontend del marketplace
python run.py export-marketplace

# Estado de archivos
python run.py status

# Debug con browser visible
python run.py ml --pages 1 --headed
```

## Frecuencias recomendadas

| Job | Script | Páginas | Cuándo |
|-----|--------|---------|--------|
| Diario | `schedules/run_daily.sh` | 2 | 06:30 |
| Semanal | `schedules/run_weekly.sh` | 8 | Lunes 03:00 |
| Mensual | `schedules/run_monthly.sh` | 15 | Día 1, 02:00 |

Crontab de ejemplo: `schedules/crontab.example`

```bash
chmod +x schedules/*.sh
# editar rutas en crontab.example e instalar
```

## Output

```
output/
├── ml_YYYYMMDD_HHMMSS.json
├── ml_latest.json
├── zonaprop_YYYYMMDD_HHMMSS.json
├── zonaprop_latest.json
├── unified_latest.json          # merge + dedupe
├── archive/unified_YYYYMM.json  # histórico mensual
└── logs/
```

`export-marketplace` escribe:

- `marketplace-inmobiliario/data/scraped_properties.json`
- `marketplace-inmobiliario/data/scraped_properties.js` (drop-in)

## Homogeneización

`common/normalize.py`:

1. Dedup exacto por fingerprint (`source|external_id`)
2. Dedup blando por título + precio + dirección + m² + ambientes
3. Prioridad de fuente configurable
4. Conversión al formato del frontend (`to_marketplace_format`)

## Limitaciones conocidas

- **ZonaProp** puede devolver 403 / challenge Cloudflare. Si falla, reintentar con `--headed` o proxies residenciales.
- **Mercado Libre** cambia clases CSS con frecuencia; los selectores están duplicados como fallback.
- Rate limiting: hay delays entre páginas (1.5–2 s). No bajar de eso.
- Geocoding: las coords solo vienen si el sitio las expone; el resto se puede enriquecer después con Google Geocoding API.

## Próximos pasos

1. Proxies rotativos / residential para ZonaProp
2. Scraper de detalle (descripción completa, amenities, geo preciso)
3. Argenprop + Properati
4. Geocoding batch de direcciones sin lat/lng
5. Webhook / API para que el marketplace consuma `unified_latest.json` en vivo
