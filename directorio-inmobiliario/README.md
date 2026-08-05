# Directorio Inmobiliario — Beta

Clon híbrido Facebook + LinkedIn orientado al mercado inmobiliario argentino (Zona Sur / Avellaneda-Lanús).

## Características

- **Padrón oficial**: 405 Martilleros y Corredores del Colegio de Avellaneda-Lanús (fuente: CPMCAL 24/08/2017).
- **Semi-cerrado**: la información de contacto solo se ve entre usuarios conectados o del mismo equipo (red social).
- **Admin por empresa**: el administrador de cada inmobiliaria puede invitar y habilitar/deshabilitar a su equipo.
- **Feed**: publicaciones de inmuebles, oportunidades, noticias y updates.
- **Directorio**: 
  - Tab **Padrón oficial** → matriculados reales (Activa + Licencia)
  - Tab **Mi red** → usuarios con cuenta en la plataforma
- **Perfiles**, **conexiones** y **mensajería** 1:1 (simulado con localStorage).

## Datos del padrón

| Archivo | Contenido |
|---------|-----------|
| `data/matriculados.js` | 405 profesionales listos para el frontend |
| `data/profesionales.json` | Mismo set en JSON limpio |
| `data/profesionales_full.json` | Los 429 registros originales (incluye bajas) |

**Campos principales**: matrícula, nombre, razón social, emails, teléfonos, dirección comercial, localidad, estado de matrícula, si es Martillero y/o Corredor.

## Cómo verla

1. Abrí `index.html` directamente en el navegador.
2. Login con cualquiera de los usuarios demo:

| Email              | Password | Rol                          |
|--------------------|----------|------------------------------|
| admin@chv.ar       | 123456   | Admin de CHV Inmobiliaria    |
| maria@chv.ar       | 123456   | Profesional (equipo CHV)     |
| juan@inmo.com      | 123456   | Admin de Inmo Norte          |
| ana@tasaciones.com | 123456   | Profesional independiente    |
| pedro@constructora.com | 123456 | Colaborador                  |

3. Andá a **Directorio** → tab "Padrón oficial" para ver los 405 matriculados.

## Resetear demo

En la consola del navegador:
```js
resetDemo()
```

## Próximos pasos

- Migrar a Next.js 15 + Tailwind + shadcn/ui
- Auth real
- Backend + PostgreSQL
- Permitir que matriculados reclamen su perfil
- Integración con el Marketplace de propiedades
