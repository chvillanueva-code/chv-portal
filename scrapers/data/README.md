# scrapers/data — Padrones PBA

## Bases originarias (no modificar)
| Archivo | Descripción |
|---------|-------------|
| `padron_pba_martillerosba.json` | 11.164 provincial (martillerosba.org.ar) |
| `padron_matanza.json` | La Matanza API |
| `padron_moron.json` | Morón search API |
| `padron_mdp.json` | Mar del Plata geo |
| `padron_azul.json` | Azul tabla pública |
| `padron_sannicolas.json` | San Nicolás |
| `padron_quilmes_electoral.json` | Quilmes PDF electoral |

## Merge
| Archivo | Descripción |
|---------|-------------|
| `entities_merged_pba_latest.csv` | Merge lean CSV (13.054) — usar en análisis |
| `merge_manifest.json` | Trazabilidad de fuentes y evolución |

> El JSON full del merge (~20 MB) está en Drive: carpeta `CHV-Portal-Padron-PBA-2026-08-04`
> Frontend lean: `directorio-inmobiliario/data/entities_pba_merged.js`

## Política
Cada merge genera snapshot fechado. Bases originarias intactas.
