// Marketplace Inmobiliario — App (mapa OSM + lista)

let currentFilters = {
  operation: null,
  type: null,
  city: null,
  neighborhood: null,
  source: null,
  rooms: null,
  location: null,
  query: "",
  agency: null
};

let currentSort = "relevance";
let map = null;
let markersLayer = null;
let markerById = {};

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get("agency")) currentFilters.agency = params.get("agency");
  if (params.get("q")) {
    currentFilters.query = params.get("q");
    const si = document.getElementById("search-input");
    if (si) si.value = currentFilters.query;
  }

  initMap();
  renderAgencyBanner();
  applyFiltersAndRender();
  setupEventListeners();
});

function setupEventListeners() {
  const searchForm = document.getElementById("search-form");
  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      currentFilters.query = document.getElementById("search-input").value.trim();
      applyFiltersAndRender();
    });
  }
  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      currentSort = e.target.value;
      applyFiltersAndRender();
    });
  }
}

function onDropdownFilter(key, value) {
  currentFilters[key] = value || null;
  applyFiltersAndRender();
}

function setFilter(key, value) {
  if (currentFilters[key] === value) currentFilters[key] = null;
  else currentFilters[key] = value;
  // sync dropdowns
  const sel = document.getElementById(`filter-${key}`);
  if (sel) sel.value = currentFilters[key] || "";
  applyFiltersAndRender();
}

function clearFilters() {
  currentFilters = {
    operation: null, type: null, city: null, neighborhood: null,
    source: null, rooms: null, location: null, query: "", agency: null
  };
  const si = document.getElementById("search-input");
  if (si) si.value = "";
  ["operation", "type", "city", "neighborhood", "source"].forEach(k => {
    const el = document.getElementById(`filter-${k}`);
    if (el) el.value = "";
  });
  const url = new URL(window.location);
  url.searchParams.delete("agency");
  url.searchParams.delete("q");
  history.replaceState(null, "", url);
  renderAgencyBanner();
  applyFiltersAndRender();
}

function getAllProperties() {
  if (typeof SCRAPED_PROPERTIES !== "undefined" && Array.isArray(SCRAPED_PROPERTIES) && SCRAPED_PROPERTIES.length) {
    return [...SCRAPED_PROPERTIES];
  }
  return [...PROPERTIES];
}

function normalizeSource(src) {
  if (!src) return "Otros";
  const s = String(src).toLowerCase();
  if (s.includes("zona") || s === "zonaprop") return "ZonaProp";
  if (s.includes("mercado") || s.includes("meli") || s === "ml") return "Mercado Libre";
  if (s.includes("argen")) return "Argenprop";
  if (s.includes("properati")) return "Properati";
  return "Otros";
}

function getFilteredProperties() {
  let list = getAllProperties();

  if (currentFilters.agency) {
    list = list.filter(p => p.agency_id === currentFilters.agency);
  }

  if (currentFilters.query) {
    const q = currentFilters.query.toLowerCase();
    list = list.filter(p =>
      (p.title || "").toLowerCase().includes(q) ||
      (p.location || "").toLowerCase().includes(q) ||
      (p.neighborhood || "").toLowerCase().includes(q) ||
      (p.city || "").toLowerCase().includes(q) ||
      (p.type || "").toLowerCase().includes(q) ||
      ((p.agency && p.agency.name) || "").toLowerCase().includes(q) ||
      (p.seller || "").toLowerCase().includes(q)
    );
  }

  if (currentFilters.operation) {
    list = list.filter(p => p.operation === currentFilters.operation);
  }
  if (currentFilters.type) {
    list = list.filter(p => p.type === currentFilters.type);
  }
  if (currentFilters.city) {
    list = list.filter(p =>
      (p.city || "").toLowerCase() === currentFilters.city.toLowerCase() ||
      (p.location || "").toLowerCase().includes(currentFilters.city.toLowerCase())
    );
  }
  if (currentFilters.neighborhood) {
    list = list.filter(p =>
      (p.neighborhood || "").toLowerCase().includes(currentFilters.neighborhood.toLowerCase())
    );
  }
  if (currentFilters.source) {
    list = list.filter(p => normalizeSource(p.source) === currentFilters.source);
  }
  if (currentFilters.rooms) {
    list = list.filter(p => p.rooms != null && p.rooms >= currentFilters.rooms);
  }
  if (currentFilters.location) {
    list = list.filter(p =>
      (p.location || "").toLowerCase().includes(currentFilters.location.toLowerCase()) ||
      (p.city || "").toLowerCase().includes(currentFilters.location.toLowerCase())
    );
  }

  switch (currentSort) {
    case "price_asc":
      list.sort((a, b) => priceUSD(a) - priceUSD(b));
      break;
    case "price_desc":
      list.sort((a, b) => priceUSD(b) - priceUSD(a));
      break;
    case "newest":
      list.sort((a, b) => new Date(b.published || 0) - new Date(a.published || 0));
      break;
    default:
      list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }
  return list;
}

function priceUSD(p) {
  if (!p || p.price == null) return 0;
  return p.currency === "USD" ? p.price : p.price / 1200;
}

function applyFiltersAndRender() {
  const list = getFilteredProperties();
  renderResults(list);
  renderResultsCount(list.length);
  updateMap(list);
}

function renderResultsCount(count) {
  const el = document.getElementById("results-count");
  if (!el) return;
  const total = getAllProperties().length;
  el.textContent = `${count} resultado${count !== 1 ? "s" : ""} · ${total} en total`;
}

function formatPrice(price, currency) {
  if (price == null) return "—";
  if (currency === "USD") return `US$ ${Number(price).toLocaleString("es-AR")}`;
  return `$ ${Number(price).toLocaleString("es-AR")}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  const now = new Date();
  const diff = Math.floor((now - d) / 86400000);
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Ayer";
  if (diff < 7) return `Hace ${diff} días`;
  return d.toLocaleDateString("es-AR");
}

function renderResults(list) {
  const container = document.getElementById("results-list");
  const empty = document.getElementById("empty-state");
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = "";
    empty?.classList.remove("hidden");
    return;
  }
  empty?.classList.add("hidden");

  container.innerHTML = list.map(p => {
    const src = normalizeSource(p.source);
    const m2 = p.covered_m2 || p.total_m2;
    const m2Label = p.covered_m2 ? `${p.covered_m2} m² cub.` : (p.total_m2 ? `${p.total_m2} m²` : null);
    const seller = (p.agency && p.agency.name) || p.seller || "Particular";

    return `
    <article class="list-card group" data-id="${p.id}"
             onmouseenter="highlightMarker('${p.id}')"
             onmouseleave="unhighlightMarker('${p.id}')"
             onclick="goToProperty('${p.id}')">
      <div class="list-card-img shrink-0">
        <img src="${p.image || ''}" alt="" loading="lazy"
             onerror="this.src='https://via.placeholder.com/200x150?text=Sin+imagen'" />
        <span class="source-pill absolute top-2 left-2">${src}</span>
      </div>
      <div class="list-card-body min-w-0 flex-1">
        <div class="flex items-start justify-between gap-2">
          <div>
            <div class="price">${formatPrice(p.price, p.currency)}</div>
            ${p.operation === "Alquiler" && p.expenses
              ? `<div class="text-xs text-gray-500">+ $${Number(p.expenses).toLocaleString("es-AR")} expensas</div>`
              : ""}
          </div>
          <span class="operation-tag shrink-0">${p.operation || ""}</span>
        </div>

        <div class="specs-row">
          ${p.rooms ? `<span><i class="fas fa-door-open"></i>${p.rooms} amb</span>` : ""}
          ${p.bedrooms ? `<span><i class="fas fa-bed"></i>${p.bedrooms}</span>` : ""}
          ${p.bathrooms ? `<span><i class="fas fa-bath"></i>${p.bathrooms}</span>` : ""}
          ${m2Label ? `<span><i class="fas fa-ruler-combined"></i>${m2Label}</span>` : ""}
          ${p.garage ? `<span><i class="fas fa-car"></i>Coch.</span>` : ""}
        </div>

        <h3 class="text-[13.5px] font-medium text-gray-800 mt-1.5 line-clamp-2 leading-snug">${p.title || ""}</h3>
        <p class="location text-xs mt-1">
          <i class="fas fa-map-marker-alt text-gray-400 mr-1"></i>${p.location || p.neighborhood || p.city || ""}
        </p>

        <div class="card-footer">
          <span class="truncate max-w-[55%]">${seller}</span>
          <span class="flex items-center gap-2">
            ${p.featured ? '<span class="badge-super text-[9px]">Destacado</span>' : ""}
            <span>${formatDate(p.published)}</span>
          </span>
        </div>
      </div>
    </article>`;
  }).join("");
}

// ---------- OpenStreetMap (Leaflet) ----------
function initMap() {
  const el = document.getElementById("map");
  if (!el || typeof L === "undefined") return;

  map = L.map("map", {
    center: [-34.6037, -58.3816],
    zoom: 11,
    zoomControl: true
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);

  // Fix size after layout
  setTimeout(() => map.invalidateSize(), 100);
  window.addEventListener("resize", () => map && map.invalidateSize());
}

function markerColor(operation) {
  return operation === "Alquiler" ? "#10b981" : "#0284c7";
}

function updateMap(list) {
  if (!map || !markersLayer) return;
  markersLayer.clearLayers();
  markerById = {};

  const bounds = [];
  list.forEach(p => {
    if (typeof p.lat !== "number" || typeof p.lng !== "number") return;
    const color = markerColor(p.operation);
    const icon = L.divIcon({
      className: "",
      html: `<div style="
        width:14px;height:14px;border-radius:50%;
        background:${color};border:2px solid #fff;
        box-shadow:0 1px 4px rgba(0,0,0,.35);
      "></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });

    const m = L.marker([p.lat, p.lng], { icon });
    const price = formatPrice(p.price, p.currency);
    m.bindPopup(`
      <div style="min-width:180px;font-family:system-ui,sans-serif">
        <div style="font-weight:700;font-size:15px">${price}</div>
        <div style="font-size:12px;color:#444;margin:4px 0;line-height:1.3">${(p.title || "").slice(0, 80)}</div>
        <div style="font-size:11px;color:#888">${p.location || ""}</div>
        <a href="property.html?id=${p.id}" style="display:inline-block;margin-top:6px;color:#0284c7;font-size:12px;font-weight:600">Ver detalle →</a>
      </div>
    `);
    m.on("click", () => {
      scrollToCard(p.id);
    });
    m.addTo(markersLayer);
    markerById[p.id] = m;
    bounds.push([p.lat, p.lng]);
  });

  if (bounds.length === 1) {
    map.setView(bounds[0], 15);
  } else if (bounds.length > 1) {
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }
}

function highlightMarker(id) {
  const m = markerById[id];
  if (!m || !map) return;
  m.setZIndexOffset(1000);
  const el = m.getElement();
  if (el) {
    const dot = el.querySelector("div");
    if (dot) {
      dot.style.transform = "scale(1.5)";
      dot.style.boxShadow = "0 0 0 3px rgba(2,132,199,.35)";
    }
  }
}

function unhighlightMarker(id) {
  const m = markerById[id];
  if (!m) return;
  m.setZIndexOffset(0);
  const el = m.getElement();
  if (el) {
    const dot = el.querySelector("div");
    if (dot) {
      dot.style.transform = "";
      dot.style.boxShadow = "0 1px 4px rgba(0,0,0,.35)";
    }
  }
}

function scrollToCard(id) {
  const card = document.querySelector(`.list-card[data-id="${id}"]`);
  if (!card) return;
  card.scrollIntoView({ behavior: "smooth", block: "center" });
  card.classList.add("ring-2", "ring-brand-500");
  setTimeout(() => card.classList.remove("ring-2", "ring-brand-500"), 1500);
}

function goToProperty(id) {
  const list = getAllProperties();
  const p = list.find(x => x.id === id);
  if (p) sessionStorage.setItem("currentProperty", JSON.stringify(p));
  window.location.href = `property.html?id=${id}`;
}

function getAgencyById(id) {
  if (typeof AGENCIES !== "undefined" && Array.isArray(AGENCIES)) {
    return AGENCIES.find(a => a.id === id);
  }
  return null;
}

function renderAgencyBanner() {
  const banner = document.getElementById("agency-filter-banner");
  const label = document.getElementById("agency-filter-label");
  if (!banner) return;
  if (!currentFilters.agency) {
    banner.classList.add("hidden");
    return;
  }
  const ag = getAgencyById(currentFilters.agency);
  const name = ag ? (ag.display_name || ag.name) : currentFilters.agency;
  if (label) label.textContent = `Propiedades de: ${name}`;
  banner.classList.remove("hidden");
}

function clearAgencyFilter() {
  currentFilters.agency = null;
  const url = new URL(window.location);
  url.searchParams.delete("agency");
  history.replaceState(null, "", url);
  renderAgencyBanner();
  applyFiltersAndRender();
}

// Expose
window.setFilter = setFilter;
window.onDropdownFilter = onDropdownFilter;
window.clearFilters = clearFilters;
window.clearAgencyFilter = clearAgencyFilter;
window.goToProperty = goToProperty;
window.highlightMarker = highlightMarker;
window.unhighlightMarker = unhighlightMarker;
