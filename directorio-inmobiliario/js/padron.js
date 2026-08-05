// Directorio público PBA — Leaflet + MarkerCluster + base unificada (activos)
const DTO_DEFAULT = 'Buenos Aires';
const CITY_BOUNDS = {
  'Avellaneda':{lat:-34.6627,lng:-58.3653,span:0.028},'Lanús':{lat:-34.7082,lng:-58.3910,span:0.032},
  'Wilde':{lat:-34.6970,lng:-58.3190,span:0.018},'Remedios de Escalada':{lat:-34.7250,lng:-58.4030,span:0.016},
  'Valentín Alsina':{lat:-34.6720,lng:-58.4150,span:0.012},'Dock Sud':{lat:-34.6550,lng:-58.3450,span:0.012},
  'Sarandí':{lat:-34.6800,lng:-58.3450,span:0.014},'Villa Domínico':{lat:-34.6900,lng:-58.3300,span:0.012},
  'Monte Chingolo':{lat:-34.7350,lng:-58.4500,span:0.012},'La Plata':{lat:-34.9205,lng:-57.9536,span:0.05},
  'Mar del Plata':{lat:-38.0055,lng:-57.5426,span:0.06},'Morón':{lat:-34.6534,lng:-58.6198,span:0.03},
  'La Matanza':{lat:-34.7600,lng:-58.6250,span:0.05},'Quilmes':{lat:-34.7290,lng:-58.2630,span:0.03},
  'San Isidro':{lat:-34.4730,lng:-58.5100,span:0.03},'San Martín':{lat:-34.5760,lng:-58.5370,span:0.03},
  'Lomas de Zamora':{lat:-34.7580,lng:-58.4050,span:0.03},'Bahía Blanca':{lat:-38.7183,lng:-62.2663,span:0.05},
  'Azul':{lat:-36.7780,lng:-59.8580,span:0.03},'San Nicolás':{lat:-33.3330,lng:-60.2150,span:0.03},
  'Tigre':{lat:-34.4260,lng:-58.5800,span:0.03},'Pilar':{lat:-34.4580,lng:-58.9140,span:0.04},
  'Merlo':{lat:-34.6680,lng:-58.7280,span:0.03},'Moreno':{lat:-34.6500,lng:-58.7900,span:0.03}
};
const DEFAULT_CENTER = { lat: -34.75, lng: -58.40 };
const BARRIO_KEYWORDS = ['Centro','Crucesita','Piñeyro','Gerli','Villa Corina','Villa Domínico','Sarandí','Dock Sud','Wilde','Lanús Este','Lanús Oeste','Villa Jardín','Villa Caraza','Villa Maipú','Remedios','Alsina','Monte Chingolo'];

let map = null, clusterGroup = null, markerById = {}, showMap = true, records = [];

function hash01(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i) | 0;
  return (Math.abs(h) % 10000) / 10000;
}

function addressText(u) {
  const d = u.direccion || {};
  const p = [d.calle, d.numero].filter(Boolean);
  if (d.piso) p.push('Piso ' + d.piso);
  const st = p.join(' ');
  const c = d.localidad || u.location || u.ciudad || '';
  if (d.full) return d.full;
  return st ? (st + (c ? ', ' + c : '')) : (c || '—');
}

function enrichRecord(u) {
  const d = u.direccion || {};
  let ciudad = (d.localidad || u.ciudad || u.location || '').replace(/\s*\/\s*/, ' / ').trim() || 'Sin ciudad';
  let barrio = d.barrio || u.barrio || '';
  if (!barrio) {
    const full = ((d.full || '') + ' ' + (d.calle || '') + ' ' + ciudad).toLowerCase();
    for (const b of BARRIO_KEYWORDS) {
      if (full.includes(b.toLowerCase())) { barrio = b; break; }
    }
  }
  if (!barrio) barrio = 'Sin barrio';
  const dto = u.dto_judicial || DTO_DEFAULT;
  let lat = typeof u.lat === 'number' ? u.lat : null;
  let lng = typeof u.lng === 'number' ? u.lng : null;
  if (lat == null || lng == null) {
    const key = Object.keys(CITY_BOUNDS).find(k =>
      ciudad.toLowerCase().includes(k.toLowerCase()) ||
      k.toLowerCase().includes(ciudad.toLowerCase().split('/')[0].trim())
    );
    const box = key ? CITY_BOUNDS[key] : { lat: DEFAULT_CENTER.lat, lng: DEFAULT_CENTER.lng, span: 0.08 };
    const sk = (d.calle || '') + '|' + (d.numero || '') + '|' + u.id;
    lat = box.lat + (hash01(sk) - 0.5) * box.span;
    lng = box.lng + (hash01(sk + 'x') - 0.5) * box.span;
  }
  const avatar = u.avatar || ('https://ui-avatars.com/api/?name=' + encodeURIComponent(String(u.name || '?').slice(0, 40)) + '&background=0284c7&color=fff&size=96');
  return { ...u, avatar, dto_judicial: dto, ciudad, barrio, lat, lng, _address: addressText(u) };
}

function esc(s) {
  return String(s ?? '').replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"');
}

function fillSelect(id, values, ph) {
  const el = document.getElementById(id);
  if (!el) return;
  const cur = el.value;
  el.innerHTML = '<option value="">' + ph + '</option>' + values.map(v => '<option value="' + esc(v) + '">' + esc(v) + '</option>').join('');
  if (cur && values.includes(cur)) el.value = cur;
}

function buildFilterOptions() {
  const dtos = new Set(), ciudades = new Set(), barrios = new Set();
  records.forEach(r => {
    if (r.dto_judicial) dtos.add(r.dto_judicial);
    if (r.ciudad && r.ciudad !== 'Sin ciudad') ciudades.add(r.ciudad);
    if (r.barrio && r.barrio !== 'Sin barrio') barrios.add(r.barrio);
  });
  fillSelect('f-dto', [...dtos].sort(), 'Dto. Judicial');
  fillSelect('f-ciudad', [...ciudades].sort(), 'Ciudad');
  fillSelect('f-barrio', [...barrios].sort(), 'Barrio');
}

function getFiltered() {
  const search = (document.getElementById('f-search')?.value || '').toLowerCase().trim();
  const dto = document.getElementById('f-dto')?.value || '';
  const ciudad = document.getElementById('f-ciudad')?.value || '';
  const barrio = document.getElementById('f-barrio')?.value || '';
  let list = [...records];
  if (search) {
    list = list.filter(u =>
      [u.name, u.apellido, u.nombre, u.razon_social, u.matricula, u.ciudad, u.barrio, u.dto_judicial, u.email, u.phone, u._address, u.colegio, ...(u.specialties || [])]
        .filter(Boolean).join(' ').toLowerCase().includes(search)
    );
  }
  if (dto) list = list.filter(u => u.dto_judicial === dto);
  if (ciudad) list = list.filter(u => u.ciudad === ciudad);
  if (barrio) list = list.filter(u => u.barrio === barrio);
  return list;
}

function statusBadge(estado) {
  if (estado === 'Licencia') {
    return '<span class="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">Licencia</span>';
  }
  return '<span class="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-medium">Activa</span>';
}

function renderList(list) {
  const container = document.getElementById('dir-list');
  const empty = document.getElementById('empty');
  const stats = document.getElementById('stats');
  if (stats) stats.textContent = 'Mostrando ' + list.length.toLocaleString('es-AR') + ' de ' + records.length.toLocaleString('es-AR') + ' profesionales (activos / licencia)';
  if (!list.length) {
    container.innerHTML = '';
    empty?.classList.remove('hidden');
    return;
  }
  empty?.classList.add('hidden');
  const MAX = 200;
  const slice = list.slice(0, MAX);
  const more = list.length > MAX ? '<p class="text-xs text-slate-400 text-center py-3">Mostrando los primeros ' + MAX + ' de ' + list.length.toLocaleString('es-AR') + '. Usá filtros o búsqueda para acotar.</p>' : '';
  container.innerHTML = slice.map(u => {
    const phone = u.phone || u.whatsapp;
    const badge = statusBadge(u.estado);
    return '<article class="bg-white rounded-xl border border-slate-200 p-3.5 hover:shadow-md transition cursor-pointer" data-id="' + u.id + '" onclick="openDetail(\'' + u.id + '\')">' +
      '<div class="flex items-start gap-3">' +
        '<img src="' + u.avatar + '" class="w-11 h-11 rounded-full avatar flex-shrink-0 bg-slate-100" alt="" loading="lazy"/>' +
        '<div class="flex-1 min-w-0">' +
          '<div class="flex items-center gap-2 flex-wrap">' +
            '<h3 class="font-semibold text-sm text-slate-900 truncate">' + esc(u.name) + '</h3>' +
            (u.verified ? '<i class="fas fa-check-circle text-emerald-500 text-xs"></i>' : '') +
            badge +
          '</div>' +
          '<p class="text-xs text-slate-500 mt-0.5">' + esc(u.roleLabel || 'Profesional') + (u.matricula ? ' · Mat. ' + esc(u.matricula) : '') + '</p>' +
          (u.razon_social ? '<p class="text-xs text-brand-600 mt-0.5 truncate">' + esc(u.razon_social) + '</p>' : '') +
          '<p class="text-xs text-slate-400 mt-1"><i class="fas fa-map-marker-alt mr-1"></i>' + esc(u._address) + '</p>' +
          '<p class="text-[11px] text-slate-400 mt-0.5">' + esc(u.ciudad) + (u.barrio && u.barrio !== 'Sin barrio' ? ' · ' + esc(u.barrio) : '') + (u.dto_judicial ? ' · ' + esc(u.dto_judicial) : '') + '</p>' +
        '</div>' +
      '</div>' +
      '<div class="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-slate-100 flex-wrap">' +
        (phone ? '<a href="tel:' + String(phone).replace(/\s/g, '') + '" onclick="event.stopPropagation()" class="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-lg"><i class="fas fa-phone"></i></a>' : '') +
        (phone ? '<a href="https://wa.me/54' + String(phone).replace(/\D/g, '') + '" target="_blank" onclick="event.stopPropagation()" class="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg"><i class="fab fa-whatsapp"></i></a>' : '') +
        (u.email ? '<a href="mailto:' + u.email + '" onclick="event.stopPropagation()" class="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-lg"><i class="fas fa-envelope"></i></a>' : '') +
        '<button onclick="event.stopPropagation();focusOnMap(\'' + u.id + '\')" class="text-xs text-brand-600 hover:underline ml-auto">Mapa</button>' +
      '</div>' +
    '</article>';
  }).join('') + more;
}

function initMap() {
  if (map) return;
  map = L.map('dir-map', { scrollWheelZoom: true }).setView([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], 10);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OSM', maxZoom: 18 }).addTo(map);
  clusterGroup = L.markerClusterGroup({
    showCoverageOnHover: false,
    maxClusterRadius: 60,
    spiderfyOnMaxZoom: true,
    disableClusteringAtZoom: 15
  });
  map.addLayer(clusterGroup);
}

function renderMap(list) {
  if (!map || !clusterGroup) return;
  clusterGroup.clearLayers();
  markerById = {};
  const bounds = [];
  // Todos los registros en el cluster: zoom lejos = grupos por zona/ciudad, zoom cerca = cada uno
  list.forEach(u => {
    bounds.push([u.lat, u.lng]);
    const icon = L.divIcon({
      className: '',
      html: '<div style="width:26px;height:26px;background:#0284c7;border:2px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:700;">' + String(u.matricula || '·').slice(0, 3) + '</div>',
      iconSize: [26, 26],
      iconAnchor: [13, 13],
      popupAnchor: [0, -12]
    });
    const popup = '<div class="text-sm"><p class="font-semibold">' + esc(u.name) + '</p><p class="text-xs text-slate-500">' + esc(u.razon_social || u.roleLabel || '') + '</p><p class="text-xs text-slate-400 mt-1">' + esc(u._address) + '</p><button onclick="openDetail(\'' + u.id + '\')" class="text-xs text-sky-600 mt-2 font-medium">Ver ficha →</button></div>';
    const m = L.marker([u.lat, u.lng], { icon }).bindPopup(popup);
    clusterGroup.addLayer(m);
    markerById[u.id] = m;
  });
  const mc = document.getElementById('map-count');
  if (mc) mc.textContent = list.length.toLocaleString('es-AR') + ' en mapa';
  if (bounds.length) {
    try { map.fitBounds(bounds, { padding: [24, 24], maxZoom: 12 }); } catch (e) {}
  }
}

function focusOnMap(id) {
  if (!showMap) {
    showMap = true;
    document.getElementById('map-panel')?.classList.remove('hidden');
    document.getElementById('list-panel')?.classList.remove('lg:col-span-12');
    document.getElementById('list-panel')?.classList.add('lg:col-span-5');
    const l = document.getElementById('view-label');
    if (l) l.textContent = 'Solo lista';
    setTimeout(() => { map?.invalidateSize(); renderMap(getFiltered()); doFocus(id); }, 150);
    return;
  }
  doFocus(id);
}

function doFocus(id) {
  const m = markerById[id];
  if (m && map) {
    map.setView(m.getLatLng(), 15, { animate: true });
    clusterGroup.zoomToShowLayer(m, function () { m.openPopup(); });
  }
}

function openDetail(id) {
  const u = records.find(r => r.id === id);
  if (!u) return;
  const phone = u.phone || u.whatsapp;
  document.getElementById('detail-body').innerHTML =
    '<div class="flex items-start gap-4">' +
      '<img src="' + u.avatar + '" class="w-16 h-16 rounded-full avatar bg-slate-100"/>' +
      '<div class="flex-1">' +
        '<h2 class="text-lg font-bold">' + esc(u.name) + '</h2>' +
        '<p class="text-sm text-slate-500">' + esc(u.roleLabel || 'Profesional') + (u.matricula ? ' · Mat. ' + esc(u.matricula) : '') + '</p>' +
        (u.razon_social ? '<p class="text-sm text-brand-600 mt-1">' + esc(u.razon_social) + '</p>' : '') +
        '<div class="mt-1">' + statusBadge(u.estado) + '</div>' +
      '</div>' +
    '</div>' +
    '<div class="mt-5 space-y-3 text-sm">' +
      '<div class="grid grid-cols-3 gap-2 text-xs">' +
        '<div class="bg-slate-50 rounded-lg p-2"><p class="text-slate-400">Dto. Judicial</p><p class="font-medium">' + esc(u.dto_judicial) + '</p></div>' +
        '<div class="bg-slate-50 rounded-lg p-2"><p class="text-slate-400">Ciudad</p><p class="font-medium">' + esc(u.ciudad) + '</p></div>' +
        '<div class="bg-slate-50 rounded-lg p-2"><p class="text-slate-400">Barrio</p><p class="font-medium">' + esc(u.barrio) + '</p></div>' +
      '</div>' +
      '<p><i class="fas fa-map-marker-alt text-slate-400 w-5"></i> ' + esc(u._address) + '</p>' +
      (phone ? '<p><i class="fas fa-phone text-slate-400 w-5"></i> ' + esc(phone) + '</p>' : '') +
      (u.email ? '<p><i class="fas fa-envelope text-slate-400 w-5"></i> ' + esc(u.email) + '</p>' : '') +
      (u.colegio ? '<p><i class="fas fa-university text-slate-400 w-5"></i> ' + esc(u.colegio) + '</p>' : '') +
    '</div>' +
    '<div class="mt-5 flex flex-wrap gap-2">' +
      (phone ? '<a href="https://wa.me/54' + String(phone).replace(/\D/g, '') + '" target="_blank" class="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg"><i class="fab fa-whatsapp mr-1"></i>WhatsApp</a>' : '') +
      (phone ? '<a href="tel:' + String(phone).replace(/\s/g, '') + '" class="px-4 py-2 bg-slate-100 text-sm rounded-lg">Llamar</a>' : '') +
      '<button onclick="focusOnMap(\'' + u.id + '\');closeDetail();" class="px-4 py-2 border border-brand-200 text-brand-700 text-sm rounded-lg">En mapa</button>' +
    '</div>' +
    '<p class="mt-4 text-[11px] text-slate-400">Fuente: padrón PBA unificado · Activos / Licencia · Coords estimadas por ciudad</p>';
  const modal = document.getElementById('detail-modal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeDetail() {
  const m = document.getElementById('detail-modal');
  m.classList.add('hidden');
  m.classList.remove('flex');
}

function refresh() {
  const list = getFiltered();
  renderList(list);
  if (showMap) renderMap(list);
}

function toggleView() {
  showMap = !showMap;
  const panel = document.getElementById('map-panel');
  const listPanel = document.getElementById('list-panel');
  const label = document.getElementById('view-label');
  if (showMap) {
    panel?.classList.remove('hidden');
    listPanel?.classList.remove('lg:col-span-12');
    listPanel?.classList.add('lg:col-span-5');
    if (label) label.textContent = 'Solo lista';
    setTimeout(() => { map?.invalidateSize(); refresh(); }, 100);
  } else {
    panel?.classList.add('hidden');
    listPanel?.classList.remove('lg:col-span-5');
    listPanel?.classList.add('lg:col-span-12');
    if (label) label.textContent = 'Ver mapa';
  }
}

function init() {
  const source = (typeof ENTITIES_PBA_MERGED !== 'undefined' && Array.isArray(ENTITIES_PBA_MERGED) && ENTITIES_PBA_MERGED.length)
    ? ENTITIES_PBA_MERGED
    : (typeof MATRICULADOS !== 'undefined' ? MATRICULADOS : null);
  if (!source) {
    document.getElementById('stats').textContent = 'Error: no se cargó data/entities_pba_merged.js';
    return;
  }
  records = source.map(enrichRecord);
  buildFilterOptions();
  initMap();
  refresh();
  ['f-search', 'f-dto', 'f-ciudad', 'f-barrio'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener(id === 'f-search' ? 'input' : 'change', refresh);
  });
  document.getElementById('btn-toggle-view')?.addEventListener('click', toggleView);
  document.getElementById('detail-modal')?.addEventListener('click', function (e) {
    if (e.target === this) closeDetail();
  });
  setTimeout(() => map?.invalidateSize(), 200);
}

window.openDetail = openDetail;
window.closeDetail = closeDetail;
window.focusOnMap = focusOnMap;
document.addEventListener('DOMContentLoaded', init);
