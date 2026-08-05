/**
 * ============================================================
 * ECOSISTEMA INMOBILIARIO — Schema unificado de entidades
 * ============================================================
 *
 * Objetivo: una sola forma de representar personas/empresas
 * sin importar la fuente (padrón colegial, portal, GMaps, alta manual).
 *
 * Tipos de ente (type):
 *   - INMOBILIARIA  → organización / razón social
 *   - PROFESIONAL   → matriculado, corredor, martillero, tasador, etc.
 *   - COLABORADOR   → empleado, partner, asistente (sin matrícula propia)
 *
 * Relación típica:
 *   INMOBILIARIA
 *     └── PROFESIONAL (responsable / titular)
 *           └── COLABORADOR[]
 *
 * Escalabilidad geográfica:
 *   address.pais → address.provincia → address.dto_judicial → address.ciudad → address.barrio → calle
 *
 * Multi-fuente:
 *   sources[] guarda de dónde vino cada dato (padron, mercadolibre, etc.)
 *   El merge se hace por: matricula + source, o email normalizado, o phone E.164
 */

// -------------------- Tipos --------------------
export const ENTITY_TYPES = {
  INMOBILIARIA: 'INMOBILIARIA',
  PROFESIONAL: 'PROFESIONAL',
  COLABORADOR: 'COLABORADOR'
};

export const CONTACT_CHANNELS = [
  'email',
  'phone',
  'whatsapp',
  'instagram',
  'linkedin',
  'x',          // Twitter/X
  'facebook',
  'website',
  'youtube'
];

/**
 * @typedef {Object} Address
 * @property {string|null} pais            - País (ISO o nombre, default AR)
 * @property {string|null} provincia
 * @property {string|null} dto_judicial    - Dpto. judicial / colegio
 * @property {string|null} ciudad          - Ciudad / localidad
 * @property {string|null} barrio          - Barrio / paraje
 * @property {string|null} partido         - Partido / departamento municipal
 * @property {string|null} street          - Calle
 * @property {string|null} number          - Número
 * @property {string|null} floor           - Piso
 * @property {string|null} unit            - Depto / oficina
 * @property {string|null} cp              - Código postal
 * @property {string|null} full            - Línea completa legible
 * @property {number|null} lat
 * @property {number|null} lng
 * @property {'exact'|'street'|'city'|'approx'|null} geo_precision
 */

/**
 * @typedef {Object} Contacts
 * @property {string|null} email
 * @property {string|null} phone           - Preferir E.164 (+54911...)
 * @property {string|null} whatsapp        - E.164 o solo dígitos país
 * @property {string|null} instagram       - handle sin @
 * @property {string|null} linkedin        - URL o slug
 * @property {string|null} x               - handle sin @
 * @property {string|null} facebook
 * @property {string|null} website
 * @property {string|null} youtube
 */

/**
 * @typedef {Object} SourceRef
 * @property {string} source               - padron_cpmcal | mercadolibre | zonaprop | google_maps | manual | ...
 * @property {string|null} external_id     - ID en esa fuente
 * @property {string|null} url
 * @property {string|null} scraped_at      - ISO date
 * @property {Object|null} raw_fields      - campos originales no mapeados
 */

/**
 * Entidad unificada (persona u organización)
 * @typedef {Object} Entity
 * @property {string} id                   - ID interno estable (uuid o prefijo+clave)
 * @property {'INMOBILIARIA'|'PROFESIONAL'|'COLABORADOR'} type
 * @property {string} name                 - Nombre display
 * @property {string|null} legal_name      - Razón social
 * @property {string|null} slug
 * @property {string|null} bio
 * @property {string|null} avatar
 * @property {string|null} logo            - Solo INMOBILIARIA
 *
 * @property {Contacts} contacts
 * @property {Address} address
 *
 * @property {string|null} matricula       - Nº matrícula colegio
 * @property {string|null} colegio         - Nombre del colegio / CPMCAL
 * @property {string|null} estado_matricula - Activa | Licencia | Baja | null
 * @property {string[]} specialties        - Corredor, Martillero, venta, alquiler...
 * @property {string[]} roles_labels       - etiquetas legibles
 *
 * @property {string|null} parent_id       - INMOBILIARIA a la que pertenece (PROF/COLAB)
 * @property {string|null} responsible_id  - PROFESIONAL a cargo (INMOBILIARIA)
 * @property {string[]} collaborator_ids   - COLABORADORES (INMOBILIARIA o PROF)
 *
 * @property {boolean} verified
 * @property {boolean} enabled
 * @property {boolean} is_admin            - admin de su inmobiliaria en la plataforma
 *
 * @property {SourceRef[]} sources
 * @property {string|null} created_at
 * @property {string|null} updated_at
 */

/** Factory: entidad vacía tipada */
export function createEntity(type = 'PROFESIONAL') {
  return {
    id: null,
    type,
    name: '',
    legal_name: null,
    slug: null,
    bio: null,
    avatar: null,
    logo: null,
    contacts: {
      email: null,
      phone: null,
      whatsapp: null,
      instagram: null,
      linkedin: null,
      x: null,
      facebook: null,
      website: null,
      youtube: null
    },
    address: {
      pais: 'AR',
      provincia: null,
      dto_judicial: null,
      ciudad: null,
      barrio: null,
      partido: null,
      street: null,
      number: null,
      floor: null,
      unit: null,
      cp: null,
      full: null,
      lat: null,
      lng: null,
      geo_precision: null
    },
    matricula: null,
    colegio: null,
    estado_matricula: null,
    specialties: [],
    roles_labels: [],
    parent_id: null,
    responsible_id: null,
    collaborator_ids: [],
    verified: false,
    enabled: true,
    is_admin: false,
    sources: [],
    created_at: null,
    updated_at: null
  };
}

/**
 * Normaliza teléfono AR a dígitos (sin +).
 * Ej: "+54 9 11 5555-1001" → "5491155551001"
 */
export function normalizePhone(raw) {
  if (!raw) return null;
  let d = String(raw).replace(/\D/g, '');
  if (d.startsWith('54') === false && d.length <= 10) {
    // asume AR móvil con 15
    if (d.startsWith('15')) d = '11' + d.slice(2); // frágil; preferir E.164 en ingest
    d = '54' + d;
  }
  return d || null;
}

/** Clave de dedupe sugerida */
export function dedupeKeys(entity) {
  const keys = [];
  if (entity.matricula && entity.colegio) {
    keys.push(`mat:${entity.colegio}:${entity.matricula}`);
  } else if (entity.matricula) {
    keys.push(`mat:${entity.matricula}`);
  }
  const email = (entity.contacts?.email || '').trim().toLowerCase();
  if (email) keys.push(`email:${email}`);
  const wa = normalizePhone(entity.contacts?.whatsapp || entity.contacts?.phone);
  if (wa) keys.push(`phone:${wa}`);
  if (entity.sources?.length) {
    entity.sources.forEach(s => {
      if (s.source && s.external_id) keys.push(`src:${s.source}:${s.external_id}`);
    });
  }
  return keys;
}

/**
 * Merge superficial: llena nulls de `base` con `incoming`.
 * sources se concatenan; specialties se unen.
 */
export function mergeEntities(base, incoming) {
  const out = { ...base, contacts: { ...base.contacts }, address: { ...base.address } };
  for (const k of Object.keys(incoming)) {
    if (k === 'contacts' || k === 'address' || k === 'sources' || k === 'specialties' || k === 'collaborator_ids') continue;
    if (out[k] == null || out[k] === '') out[k] = incoming[k];
  }
  for (const k of Object.keys(incoming.contacts || {})) {
    if (out.contacts[k] == null || out.contacts[k] === '') out.contacts[k] = incoming.contacts[k];
  }
  for (const k of Object.keys(incoming.address || {})) {
    if (out.address[k] == null || out.address[k] === '') out.address[k] = incoming.address[k];
  }
  const specs = new Set([...(out.specialties || []), ...(incoming.specialties || [])]);
  out.specialties = [...specs];
  const cols = new Set([...(out.collaborator_ids || []), ...(incoming.collaborator_ids || [])]);
  out.collaborator_ids = [...cols];
  const srcMap = new Map();
  [...(out.sources || []), ...(incoming.sources || [])].forEach(s => {
    srcMap.set(`${s.source}|${s.external_id || ''}`, s);
  });
  out.sources = [...srcMap.values()];
  out.updated_at = new Date().toISOString();
  return out;
}

/**
 * Mapeo desde registro actual del padrón CPMCAL (matriculados.js)
 */
export function fromPadronMatriculado(m) {
  const e = createEntity('PROFESIONAL');
  const d = m.direccion || {};
  e.id = m.id;
  e.name = m.name || [m.nombre, m.apellido].filter(Boolean).join(' ');
  e.legal_name = m.razon_social || null;
  e.slug = m.slug || null;
  e.bio = m.bio || null;
  e.avatar = m.avatar || null;
  e.contacts.email = m.email || null;
  e.contacts.phone = m.phone || null;
  e.contacts.whatsapp = m.whatsapp || m.phone || null;
  e.address.street = d.calle || null;
  e.address.number = d.numero || null;
  e.address.floor = d.piso || null;
  e.address.unit = d.dpto || null;
  e.address.ciudad = d.localidad || m.location || null;
  e.address.barrio = d.barrio || null;
  e.address.provincia = d.provincia || 'Buenos Aires';
  e.address.cp = d.cp || null;
  e.address.full = d.full || null;
  e.address.dto_judicial = m.dto_judicial || 'Avellaneda y Lanús';
  e.address.pais = 'AR';
  e.matricula = m.matricula || null;
  e.colegio = 'CPMCAL';
  e.estado_matricula = m.estado || null;
  e.specialties = m.specialties || [];
  if (m.es_corredor) e.specialties = [...new Set([...e.specialties, 'Corredor'])];
  if (m.es_martillero) e.specialties = [...new Set([...e.specialties, 'Martillero'])];
  e.verified = !!m.verified;
  e.enabled = m.enabled !== false;
  e.parent_id = m.companyId || null;
  e.sources = [{
    source: 'padron_cpmcal',
    external_id: m.matricula || m.id,
    url: null,
    scraped_at: m.createdAt || '2017-08-24',
    raw_fields: null
  }];
  e.created_at = m.createdAt || null;
  e.updated_at = null;
  return e;
}

/**
 * Mapeo desde agencia marketplace actual
 */
export function fromAgenciaMarketplace(a) {
  const e = createEntity('INMOBILIARIA');
  e.id = a.id;
  e.name = a.display_name || a.name;
  e.legal_name = a.name || null;
  e.slug = a.slug || null;
  e.bio = a.bio || null;
  e.avatar = a.avatar || null;
  e.logo = a.logo || a.avatar || null;
  e.contacts.email = a.email || null;
  e.contacts.phone = a.phone || null;
  e.contacts.whatsapp = a.whatsapp || a.phone || null;
  e.contacts.instagram = a.instagram || null;
  e.contacts.website = a.website || null;
  e.address.full = a.address || null;
  e.address.ciudad = a.location || null;
  e.address.dto_judicial = 'Avellaneda y Lanús';
  e.address.provincia = 'Buenos Aires';
  e.address.pais = 'AR';
  e.matricula = a.matricula || null;
  e.colegio = a.matricula ? 'CPMCAL' : null;
  e.responsible_id = a.professional_id || a.responsible?.id || null;
  e.collaborator_ids = (a.collaborators || []).map(c => c.id).filter(Boolean);
  e.verified = !!a.verified;
  e.enabled = true;
  e.sources = [{
    source: a.source || 'marketplace',
    external_id: a.id,
    url: null,
    scraped_at: null,
    raw_fields: { property_count: a.property_count, team_count: a.team_count }
  }];
  return e;
}

// Uso en frontend (sin modules): copiar createEntity / fromPadron* a un data/normalize.js
// o cargar este archivo como type=module cuando migren a bundler.
