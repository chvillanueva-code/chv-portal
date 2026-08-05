// ============================================================
// Google Maps configuration
// ============================================================
// 1. Create a project in Google Cloud Console
// 2. Enable "Maps JavaScript API"
// 3. Create an API key (restrict by HTTP referrer in production)
// 4. Paste the key below

const GOOGLE_MAPS_API_KEY = ""; // ← pegá tu API key acá

// Default center: Avellaneda, Buenos Aires
const MAP_DEFAULT_CENTER = { lat: -34.662, lng: -58.365 };
const MAP_DEFAULT_ZOOM = 12;

// Marker colors by operation
const MAP_MARKER_COLORS = {
  Venta: "#0284c7",      // brand blue
  Alquiler: "#00A650"    // green
};
