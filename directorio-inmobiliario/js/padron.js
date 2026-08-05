// Directorio público PBA — Leaflet + MarkerCluster + base unificada (activos)
const DTO_DEFAULT = 'Buenos Aires';
const CITY_BOUNDS = {
  '25 de Mayo':{lat:-35.428,lng:-60.173,span:0.02},
  'Adrogue':{lat:-34.8,lng:-58.385,span:0.015},
  'Adrogué':{lat:-34.8,lng:-58.385,span:0.015},
  'Almirante Brown':{lat:-34.82,lng:-58.38,span:0.03},
  'Avellaneda':{lat:-34.6627,lng:-58.3653,span:0.028},
  'Ayacucho':{lat:-37.153,lng:-58.488,span:0.02},
  'Azul':{lat:-36.778,lng:-59.858,span:0.03},
  'Bahia Blanca':{lat:-38.7183,lng:-62.2663,span:0.05},
  'Bahía Blanca':{lat:-38.7183,lng:-62.2663,span:0.05},
  'Balcarce':{lat:-37.846,lng:-58.255,span:0.02},
  'Banfield':{lat:-34.743,lng:-58.392,span:0.02},
  'Beccar':{lat:-34.463,lng:-58.534,span:0.012},
  'Berazategui':{lat:-34.763,lng:-58.211,span:0.025},
  'Bolivar':{lat:-36.23,lng:-61.114,span:0.02},
  'Bolívar':{lat:-36.23,lng:-61.114,span:0.02},
  'Bragado':{lat:-35.119,lng:-60.49,span:0.02},
  'Burzaco':{lat:-34.825,lng:-58.39,span:0.02},
  'Campana':{lat:-34.168,lng:-58.959,span:0.025},
  'Canning':{lat:-34.877,lng:-58.507,span:0.02},
  'Canuelas':{lat:-35.052,lng:-58.761,span:0.025},
  'Caseros':{lat:-34.606,lng:-58.564,span:0.015},
  'Castelar':{lat:-34.655,lng:-58.641,span:0.018},
  'Cañuelas':{lat:-35.052,lng:-58.761,span:0.025},
  'Chascomus':{lat:-35.575,lng:-58.009,span:0.02},
  'Chascomús':{lat:-35.575,lng:-58.009,span:0.02},
  'Chivilcoy':{lat:-34.8969,lng:-60.0165,span:0.02},
  'Coronel Suarez':{lat:-37.459,lng:-61.918,span:0.02},
  'Coronel Suárez':{lat:-37.459,lng:-61.918,span:0.02},
  'Dock Sud':{lat:-34.655,lng:-58.345,span:0.012},
  'Dolores':{lat:-36.313,lng:-57.679,span:0.02},
  'Escobar':{lat:-34.349,lng:-58.795,span:0.03},
  'Ezeiza':{lat:-34.854,lng:-58.523,span:0.025},
  'Florencio Varela':{lat:-34.821,lng:-58.276,span:0.025},
  'Florida':{lat:-34.532,lng:-58.49,span:0.012},
  'General Rodriguez':{lat:-34.608,lng:-58.95,span:0.025},
  'General Rodríguez':{lat:-34.608,lng:-58.95,span:0.025},
  'Gerli':{lat:-34.685,lng:-58.382,span:0.01},
  'Haedo':{lat:-34.644,lng:-58.596,span:0.015},
  'Hurlingham':{lat:-34.59,lng:-58.639,span:0.02},
  'Ituzaingo':{lat:-34.658,lng:-58.667,span:0.02},
  'Ituzaingó':{lat:-34.658,lng:-58.667,span:0.02},
  'José C. Paz':{lat:-34.517,lng:-58.768,span:0.025},
  'Junin':{lat:-34.5838,lng:-60.9444,span:0.025},
  'Junín':{lat:-34.5838,lng:-60.9444,span:0.025},
  'La Matanza':{lat:-34.76,lng:-58.625,span:0.05},
  'La Plata':{lat:-34.9205,lng:-57.9536,span:0.05},
  'Lanus':{lat:-34.7082,lng:-58.391,span:0.032},
  'Lanus Este':{lat:-34.7082,lng:-58.37,span:0.015},
  'Lanus Oeste':{lat:-34.7082,lng:-58.41,span:0.015},
  'Lanús':{lat:-34.7082,lng:-58.391,span:0.032},
  'Lanús Este':{lat:-34.7082,lng:-58.37,span:0.015},
  'Lanús Oeste':{lat:-34.7082,lng:-58.41,span:0.015},
  'Lincoln':{lat:-34.868,lng:-61.53,span:0.02},
  'Lobos':{lat:-35.185,lng:-59.096,span:0.02},
  'Lomas De Zamora':{lat:-34.758,lng:-58.405,span:0.03},
  'Lomas de Zamora':{lat:-34.758,lng:-58.405,span:0.03},
  'Longchamps':{lat:-34.859,lng:-58.387,span:0.015},
  'Lujan':{lat:-34.5703,lng:-59.105,span:0.025},
  'Luján':{lat:-34.5703,lng:-59.105,span:0.025},
  'Malvinas Argentinas':{lat:-34.5,lng:-58.7,span:0.03},
  'Mar Del Plata':{lat:-38.0055,lng:-57.5426,span:0.06},
  'Mar del Plata':{lat:-38.0055,lng:-57.5426,span:0.06},
  'Martinez':{lat:-34.488,lng:-58.503,span:0.015},
  'Martínez':{lat:-34.488,lng:-58.503,span:0.015},
  'Mercedes':{lat:-34.6514,lng:-59.4307,span:0.02},
  'Merlo':{lat:-34.668,lng:-58.728,span:0.03},
  'Miramar':{lat:-38.27,lng:-57.839,span:0.02},
  'Monte Chingolo':{lat:-34.735,lng:-58.45,span:0.012},
  'Monte Grande':{lat:-34.819,lng:-58.466,span:0.02},
  'Moreno':{lat:-34.65,lng:-58.79,span:0.03},
  'Moron':{lat:-34.6534,lng:-58.6198,span:0.03},
  'Morón':{lat:-34.6534,lng:-58.6198,span:0.03},
  'Navarro':{lat:-35.003,lng:-59.268,span:0.02},
  'Necochea':{lat:-38.5545,lng:-58.7396,span:0.03},
  'Nordelta':{lat:-34.412,lng:-58.645,span:0.025},
  'Nueve De Julio':{lat:-35.444,lng:-60.883,span:0.02},
  'Nueve de Julio':{lat:-35.444,lng:-60.883,span:0.02},
  'Olavarria':{lat:-36.8927,lng:-60.3225,span:0.03},
  'Olavarría':{lat:-36.8927,lng:-60.3225,span:0.03},
  'Olivos':{lat:-34.508,lng:-58.49,span:0.015},
  'Pehuajo':{lat:-35.811,lng:-61.899,span:0.02},
  'Pehuajó':{lat:-35.811,lng:-61.899,span:0.02},
  'Pergamino':{lat:-33.891,lng:-60.5736,span:0.025},
  'Pigue':{lat:-37.605,lng:-62.402,span:0.02},
  'Pigüé':{lat:-37.605,lng:-62.402,span:0.02},
  'Pilar':{lat:-34.458,lng:-58.914,span:0.04},
  'Pinamar':{lat:-37.109,lng:-56.861,span:0.02},
  'Pineyro':{lat:-34.668,lng:-58.39,span:0.01},
  'Piñeyro':{lat:-34.668,lng:-58.39,span:0.01},
  'Quilmes':{lat:-34.729,lng:-58.263,span:0.03},
  'Ramos Mejia':{lat:-34.642,lng:-58.565,span:0.018},
  'Ramos Mejía':{lat:-34.642,lng:-58.565,span:0.018},
  'Rauch':{lat:-36.775,lng:-59.089,span:0.015},
  'Remedios de Escalada':{lat:-34.725,lng:-58.403,span:0.016},
  'Saladillo':{lat:-35.637,lng:-59.779,span:0.02},
  'San Bernardo':{lat:-36.687,lng:-56.679,span:0.015},
  'San Fernando':{lat:-34.441,lng:-58.558,span:0.02},
  'San Isidro':{lat:-34.473,lng:-58.51,span:0.03},
  'San Justo':{lat:-34.682,lng:-58.561,span:0.02},
  'San Martin':{lat:-34.576,lng:-58.537,span:0.03},
  'San Martín':{lat:-34.576,lng:-58.537,span:0.03},
  'San Miguel':{lat:-34.543,lng:-58.712,span:0.025},
  'San Nicolas':{lat:-33.333,lng:-60.215,span:0.03},
  'San Nicolás':{lat:-33.333,lng:-60.215,span:0.03},
  'Santa Teresita':{lat:-36.542,lng:-56.7,span:0.015},
  'Sarandi':{lat:-34.68,lng:-58.345,span:0.014},
  'Sarandí':{lat:-34.68,lng:-58.345,span:0.014},
  'Tandil':{lat:-37.3217,lng:-59.1332,span:0.03},
  'Temperley':{lat:-34.768,lng:-58.394,span:0.015},
  'Tigre':{lat:-34.426,lng:-58.58,span:0.03},
  'Trenque Lauquen':{lat:-35.97,lng:-62.733,span:0.025},
  'Tres Arroyos':{lat:-38.3739,lng:-60.2798,span:0.025},
  'Tres de Febrero':{lat:-34.6,lng:-58.56,span:0.03},
  'Valentin Alsina':{lat:-34.672,lng:-58.415,span:0.012},
  'Valentín Alsina':{lat:-34.672,lng:-58.415,span:0.012},
  'Veinticinco de Mayo':{lat:-35.428,lng:-60.173,span:0.02},
  'Vicente Lopez':{lat:-34.526,lng:-58.475,span:0.02},
  'Vicente López':{lat:-34.526,lng:-58.475,span:0.02},
  'Villa Ballester':{lat:-34.545,lng:-58.557,span:0.015},
  'Villa Dominico':{lat:-34.69,lng:-58.33,span:0.012},
  'Villa Domínico':{lat:-34.69,lng:-58.33,span:0.012},
  'Villa Gesell':{lat:-37.2635,lng:-56.973,span:0.02},
  'Wilde':{lat:-34.697,lng:-58.319,span:0.018},
  'Zarate':{lat:-34.098,lng:-59.028,span:0.025},
  'Zárate':{lat:-34.098,lng:-59.028,span:0.025},
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
    const norm = (s) => String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
    const cn = norm(ciudad);
    const key = Object.keys(CITY_BOUNDS).find(k => {
      const kn = norm(k);
      return cn === kn || cn.includes(kn) || kn.includes(cn.split('/')[0].trim());
    });
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
