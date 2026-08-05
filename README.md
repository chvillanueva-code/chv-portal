# CHV Portal

Marketplace Inmobiliario + Directorio de Profesionales (Buenos Aires).

**Producción:** https://chv-portal.ch-villanueva.workers.dev/

## Estructura

- `/` — Bienvenida
- `/marketplace-inmobiliario/` — Listado + detalle + mapa
- `/directorio-inmobiliario/padron.html` — Padrón PBA unificado (activos)
- `/scrapers/` — Scrapers ML + padrones
- `/shared/` — Header y schema

## Datos

- Marketplace: props Mercado Libre (Avellaneda)
- Directorio: ~11.480 profesionales PBA (solo Activa + Licencia)

Push a `main` → Cloudflare redeploy automático.
