# Marketplace Inmobiliario — Clon Mercado Libre (Frontend)

Frontend tipo **Mercado Libre** orientado exclusivamente a propiedades (venta / alquiler).

Diseñado para servir como capa de presentación de un metabuscador de inmuebles de múltiples fuentes.

## Stack actual (MVP)

- HTML5 + Tailwind CSS (CDN)
- Vanilla JS
- Datos mock en `js/data.js` (12 props + coordenadas)
- **Google Maps** (vista mapa en listado + mapa en detalle)
- Sin backend todavía (todo client-side)

## Google Maps

1. Creá un proyecto en [Google Cloud Console](https://console.cloud.google.com/)
2. Habilitá **Maps JavaScript API**
3. Generá una API key
4. Pegala en `js/maps-config.js`:

```js
const GOOGLE_MAPS_API_KEY = "TU_API_KEY_AQUI";
```

Sin la key, el listado funciona igual y el mapa muestra un mensaje de configuración.

### Funcionalidades de mapa

- Toggle **Grilla / Mapa** en el listado
- Markers coloreados: azul = Venta, verde = Alquiler
- InfoWindow al click + panel lateral con datos
- Mapa de ubicación en la página de detalle (`property.html`)

## Cómo verlo

1. Abrí `index.html` en el navegador
2. Listo. No necesita servidor.

## Estructura

```
marketplace-inmobiliario/
├── index.html          → Home + listado + mapa
├── property.html       → Detalle + mapa de ubicación
├── css/
│   └── custom.css
├── js/
│   ├── maps-config.js  → API key de Google Maps
│   ├── data.js         → Mock de propiedades (con lat/lng)
│   └── app.js
└── data/               → (futuro: JSON reales de scrapers)
```

## Próximos pasos

1. Conectar con scrapers (ZonaProp, Argenprop, Mercado Libre Inmuebles, Properati)
2. Backend + base de datos unificada
3. Filtros avanzados + geocoding real
4. Auth + favoritos + alertas
5. Integración con el Directorio Inmobiliario
