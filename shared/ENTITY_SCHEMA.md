# Schema de entidades — Ecosistema Inmobiliario

## Tipos

| type | Descripción | Ejemplo |
|------|-------------|---------|
| `INMOBILIARIA` | Organización / razón social | Fera y Asoc, CHV Inmobiliaria |
| `PROFESIONAL` | Persona con o sin matrícula | Corredor, martillero, tasador |
| `COLABORADOR` | Persona del equipo sin ser titular | Asistente, partner comercial |

```
INMOBILIARIA
  └── responsible_id → PROFESIONAL
  └── collaborator_ids[] → COLABORADOR | PROFESIONAL
```

## Contactos (comunes a los 3)

```
contacts: {
  email, phone, whatsapp,
  instagram, linkedin, x, facebook, website, youtube
}
```

- `phone` / `whatsapp`: ideal E.164 (`+54911...`)
- Redes: handle sin `@` o URL completa

## Dirección (común)

```
address: {
  pais, provincia, dto_judicial,
  ciudad, barrio, partido,
  street, number, floor, unit,
  cp, full, lat, lng, geo_precision
}
```

Orden geográfico (filtros y escala):

1. `pais`
2. `provincia`
3. `dto_judicial` (colegio / dpto. judicial)
4. `ciudad` / localidad
5. `barrio`
6. calle + número → geocoding

## Multi-fuente

```
sources: [{
  source: "padron_cpmcal" | "mercadolibre" | "zonaprop" | "google_maps" | "manual",
  external_id,
  url,
  scraped_at,
  raw_fields
}]
```

**Dedupe** (prioridad):

1. `colegio + matricula`
2. `email` normalizado
3. `phone` E.164
4. `source + external_id`

**Merge**: completar nulls; unir `specialties` y `sources`.

## Archivo

Implementación JS: `shared/entity-schema.js`

- `createEntity(type)`
- `fromPadronMatriculado(m)`
- `fromAgenciaMarketplace(a)`
- `mergeEntities(base, incoming)`
- `dedupeKeys(entity)`
