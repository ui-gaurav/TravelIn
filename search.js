// ============================================================
// TravelIn - Search & Autocomplete Module  (Sky Scrapper API)
// ============================================================
// Supports: One-way & Round-trip, Passengers, Swap button,
// Live Unsplash photos on discover cards, Popular route chips
// ============================================================

// ── Local fallback airport database ──────────────────────────
const LOCAL_AIRPORTS = [
  // India
  { skyId: "DEL", entityId: "95673567", hotelEntityId: "27536952", name: "Indira Gandhi International", cityName: "New Delhi",   countryName: "India" },
  { skyId: "BOM", entityId: "95673330", hotelEntityId: "27537118", name: "Chhatrapati Shivaji International", cityName: "Mumbai", countryName: "India" },
  { skyId: "MAA", entityId: "95673625", hotelEntityId: "27537045", name: "Chennai International",          cityName: "Chennai",   countryName: "India" },
  { skyId: "BLR", entityId: "95673329", hotelEntityId: "27537117", name: "Kempegowda International",       cityName: "Bengaluru", countryName: "India" },
  { skyId: "HYD", entityId: "95673485", hotelEntityId: "27537039", name: "Rajiv Gandhi International",     cityName: "Hyderabad", countryName: "India" },
  { skyId: "CCU", entityId: "95673345", hotelEntityId: "27537186", name: "Netaji Subhas Chandra Bose Intl",cityName: "Kolkata",   countryName: "India" },
  { skyId: "GOI", entityId: "95673433", hotelEntityId: "27536882", name: "Goa International",              cityName: "Goa",       countryName: "India" },
  { skyId: "AMD", entityId: "95673311", hotelEntityId: "27536789", name: "Sardar Vallabhbhai Patel Intl",  cityName: "Ahmedabad", countryName: "India" },
  { skyId: "COK", entityId: "95673360", hotelEntityId: "27537213", name: "Cochin International",           cityName: "Kochi",     countryName: "India" },
  { skyId: "PNQ", entityId: "95673619", hotelEntityId: "27537212", name: "Pune Airport",                   cityName: "Pune",      countryName: "India" },
  { skyId: "JAI", entityId: "95673497", hotelEntityId: "27537057", name: "Jaipur International",           cityName: "Jaipur",    countryName: "India" },
  { skyId: "LKO", entityId: "95673540", hotelEntityId: "27537202", name: "Chaudhary Charan Singh Intl",   cityName: "Lucknow",   countryName: "India" },
  // Middle East
  { skyId: "DXB", entityId: "95673643", hotelEntityId: "27537102", name: "Dubai International",            cityName: "Dubai",     countryName: "UAE" },
  { skyId: "AUH", entityId: "95673318", hotelEntityId: "27536788", name: "Abu Dhabi International",        cityName: "Abu Dhabi", countryName: "UAE" },
  { skyId: "DOH", entityId: "95673388", hotelEntityId: "27536915", name: "Hamad International",            cityName: "Doha",      countryName: "Qatar" },
  // Europe
  { skyId: "LHR", entityId: "95565050", hotelEntityId: "27544008", name: "London Heathrow",                cityName: "London",    countryName: "United Kingdom" },
  { skyId: "CDG", entityId: "95565041", hotelEntityId: "27539733", name: "Charles de Gaulle",              cityName: "Paris",     countryName: "France" },
  { skyId: "FRA", entityId: "95565049", hotelEntityId: "27537456", name: "Frankfurt Airport",              cityName: "Frankfurt", countryName: "Germany" },
  { skyId: "AMS", entityId: "95565051", hotelEntityId: "27537459", name: "Amsterdam Schiphol",             cityName: "Amsterdam", countryName: "Netherlands" },
  { skyId: "MAD", entityId: "95565062", hotelEntityId: "27537458", name: "Madrid Barajas",                 cityName: "Madrid",    countryName: "Spain" },
  { skyId: "BCN", entityId: "95565042", hotelEntityId: "27537454", name: "Barcelona El Prat",              cityName: "Barcelona", countryName: "Spain" },
  { skyId: "FCO", entityId: "95565048", hotelEntityId: "27537455", name: "Leonardo da Vinci International",cityName: "Rome",      countryName: "Italy" },
  { skyId: "IST", entityId: "95565063", hotelEntityId: "27537462", name: "Istanbul Airport",               cityName: "Istanbul",  countryName: "Turkey" },
  { skyId: "ATH", entityId: "95565040", hotelEntityId: "27537453", name: "Athens International",           cityName: "Athens",    countryName: "Greece" },
  // Asia-Pacific
  { skyId: "SIN", entityId: "95673768", hotelEntityId: "27537192", name: "Singapore Changi",               cityName: "Singapore", countryName: "Singapore" },
  { skyId: "BKK", entityId: "95673326", hotelEntityId: "27537116", name: "Suvarnabhumi Airport",           cityName: "Bangkok",   countryName: "Thailand" },
  { skyId: "KUL", entityId: "95673527", hotelEntityId: "27537067", name: "Kuala Lumpur International",     cityName: "Kuala Lumpur", countryName: "Malaysia" },
  { skyId: "NRT", entityId: "95673660", hotelEntityId: "27537187", name: "Narita International",           cityName: "Tokyo",     countryName: "Japan" },
  { skyId: "ICN", entityId: "95673488", hotelEntityId: "27537042", name: "Incheon International",          cityName: "Seoul",     countryName: "South Korea" },
  { skyId: "HKG", entityId: "95673463", hotelEntityId: "27537046", name: "Hong Kong International",        cityName: "Hong Kong", countryName: "Hong Kong" },
  { skyId: "SYD", entityId: "95673783", hotelEntityId: "27537194", name: "Sydney Airport",                 cityName: "Sydney",    countryName: "Australia" },
  { skyId: "MEL", entityId: "95673577", hotelEntityId: "27537139", name: "Melbourne Airport",              cityName: "Melbourne", countryName: "Australia" },
  { skyId: "MLE", entityId: "95673586", hotelEntityId: "27537145", name: "Velana International",           cityName: "Malé",      countryName: "Maldives" },
  { skyId: "CMB", entityId: "95673352", hotelEntityId: "27537161", name: "Bandaranaike International",     cityName: "Colombo",   countryName: "Sri Lanka" },
  // Americas
  { skyId: "JFK", entityId: "95565058", hotelEntityId: "27537457", name: "John F. Kennedy International",  cityName: "New York",  countryName: "United States" },
  { skyId: "LAX", entityId: "95565060", hotelEntityId: "27537460", name: "Los Angeles International",      cityName: "Los Angeles", countryName: "United States" },
  { skyId: "ORD", entityId: "95565066", hotelEntityId: "27537461", name: "O'Hare International",           cityName: "Chicago",   countryName: "United States" },
  { skyId: "SFO", entityId: "95565069", hotelEntityId: "27537463", name: "San Francisco International",    cityName: "San Francisco", countryName: "United States" },
  { skyId: "MIA", entityId: "95565064", hotelEntityId: "27537464", name: "Miami International",            cityName: "Miami",     countryName: "United States" },
  // Africa
  { skyId: "CAI", entityId: "95673344", hotelEntityId: "27536953", name: "Cairo International",            cityName: "Cairo",     countryName: "Egypt" },
  { skyId: "JNB", entityId: "95673503", hotelEntityId: "27537061", name: "O.R. Tambo International",       cityName: "Johannesburg", countryName: "South Africa" },
];

// ── DISCOVER card data ────────────────────────────────────────
const DISCOVER_DESTINATIONS = [
  { skyId: "DXB", entityId: "95673643", hotelEntityId: "27537102", cityName: "Dubai",     countryName: "UAE",          price: "$240", query: "Dubai skyline" },
  { skyId: "ATH", entityId: "95565040", hotelEntityId: "27537453", cityName: "Athens",    countryName: "Greece",       price: "$310", query: "Athens Acropolis" },
  { skyId: "BKK", entityId: "95673326", hotelEntityId: "27537116", cityName: "Bangkok",   countryName: "Thailand",     price: "$300", query: "Bangkok temple" },
  { skyId: "KUL", entityId: "95673527", hotelEntityId: "27537067", cityName: "Kuala Lumpur", countryName: "Malaysia",  price: "$285", query: "Kuala Lumpur Petronas" },
  { skyId: "SIN", entityId: "95673768", hotelEntityId: "27537192", cityName: "Singapore", countryName: "Singapore",    price: "$320", query: "Singapore Marina Bay" },
  { skyId: "NRT", entityId: "95673660", hotelEntityId: "27537187", cityName: "Tokyo",     countryName: "Japan",        price: "$450", query: "Tokyo cityscape" },
  { skyId: "MLE", entityId: "95673586", hotelEntityId: "27537145", cityName: "Malé",      countryName: "Maldives",     price: "$550", query: "Maldives overwater bungalow" },
  { skyId: "FCO", entityId: "95565048", hotelEntityId: "27537455", cityName: "Rome",      countryName: "Italy",        price: "$360", query: "Rome Colosseum" },
];

// ── POPULAR ROUTES ────────────────────────────────────────────
const POPULAR_ROUTES = [
  { from: "DEL", fromName: "Delhi",     fromEntityId: "95673567", fromHotelEntityId: "27536952",
    to:   "DXB", toName:   "Dubai",     toEntityId:   "95673643", toHotelEntityId:   "27537102", price: "$240" },
  { from: "BOM", fromName: "Mumbai",    fromEntityId: "95673330", fromHotelEntityId: "27537118",
    to:   "SIN", toName:   "Singapore", toEntityId:   "95673768", toHotelEntityId:   "27537192", price: "$310" },
  { from: "DEL", fromName: "Delhi",     fromEntityId: "95673567", fromHotelEntityId: "27536952",
    to:   "LHR", toName:   "London",    toEntityId:   "95565050", toHotelEntityId:   "27544008", price: "$620" },
  { from: "BLR", fromName: "Bengaluru", fromEntityId: "95673329", fromHotelEntityId: "27537117",
    to:   "BKK", toName:   "Bangkok",   toEntityId:   "95673326", toHotelEntityId:   "27537116", price: "$285" },
  { from: "DEL", fromName: "Delhi",     fromEntityId: "95673567", fromHotelEntityId: "27536952",
    to:   "NRT", toName:   "Tokyo",     toEntityId:   "95673660", toHotelEntityId:   "27537187", price: "$450" },
  { from: "DEL", fromName: "Delhi",     fromEntityId: "95673567", fromHotelEntityId: "27536952",
    to:   "CDG", toName:   "Paris",     toEntityId:   "95565041", toHotelEntityId:   "27539733", price: "$580" },
];

// ── Trip-type State ───────────────────────────────────────────
let currentTripType = "one-way";

function setTripType(type) {
  currentTripType = type;
  const btnOW   = document.getElementById("btn-oneway");
  const btnRT   = document.getElementById("btn-round");
  const rtGroup = document.getElementById("returnDateGroup");
  if (type === "one-way") {
    btnOW.classList.add("active");
    btnRT.classList.remove("active");
    if (rtGroup) rtGroup.style.display = "none";
  } else {
    btnRT.classList.add("active");
    btnOW.classList.remove("active");
    if (rtGroup) rtGroup.style.display = "flex";
  }
}

// ── Swap origin <-> destination ───────────────────────────────
function swapLocations() {
  const originInput = document.getElementById("originInput");
  const destInput   = document.getElementById("destInput");
  const oSkyId      = document.getElementById("originSkyId");
  const oEntityId   = document.getElementById("originEntityId");
  const oHotelId    = document.getElementById("originHotelEntityId");
  const dSkyId      = document.getElementById("destSkyId");
  const dEntityId   = document.getElementById("destEntityId");
  const dHotelId    = document.getElementById("destHotelEntityId");

  // Swap visible text
  [originInput.value, destInput.value] = [destInput.value, originInput.value];
  // Swap hidden IDs
  [oSkyId.value,    dSkyId.value]    = [dSkyId.value,    oSkyId.value];
  [oEntityId.value, dEntityId.value] = [dEntityId.value, oEntityId.value];
  [oHotelId.value,  dHotelId.value]  = [dHotelId.value,  oHotelId.value];
}

// ── Local airport search fallback ─────────────────────────────
function searchLocalAirports(query) {
  const q = query.toLowerCase();
  return LOCAL_AIRPORTS.filter(a =>
    a.skyId.toLowerCase().startsWith(q) ||
    a.cityName.toLowerCase().includes(q) ||
    a.name.toLowerCase().includes(q) ||
    a.countryName.toLowerCase().includes(q)
  ).slice(0, 6);
}

// ── Live city/airport suggestions via Sky Scrapper ────────────
async function getCitySuggestions(query) {
  if (query.length < 2) return [];
  try {
    const res  = await skyScrapper("/api/v1/flights/searchAirport", { query, locale: "en-US" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.status && json.data?.length > 0) {
      return json.data.map(item => ({
        skyId:         item.skyId,
        entityId:      item.navigation?.relevantFlightParams?.entityId || item.entityId,
        hotelEntityId: item.navigation?.relevantHotelParams?.entityId  || item.entityId,
        name:          item.presentation?.suggestionTitle || item.skyId,
        cityName:      item.presentation?.title          || item.skyId,
        countryName:   item.presentation?.subtitle       || "",
      }));
    }
  } catch (err) {
    console.warn("[search] Falling back to local DB:", err.message);
  }
  return searchLocalAirports(query);
}

// ── Date setup ────────────────────────────────────────────────
const today = new Date().toISOString().split("T")[0];
const dateInput = document.getElementById("dateInput");
const returnDateInput = document.getElementById("returnDateInput");
if (dateInput) { dateInput.min = today; dateInput.value = today; }
if (returnDateInput) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  returnDateInput.min = today;
  returnDateInput.value = tomorrow.toISOString().split("T")[0];
}

// ── Hidden entity-ID fields ───────────────────────────────────
function ensureHiddenInputs() {
  ["originSkyId","originEntityId","originHotelEntityId","destSkyId","destEntityId","destHotelEntityId"]
    .forEach(id => {
      if (!document.getElementById(id)) {
        const inp = document.createElement("input");
        inp.type = "hidden"; inp.id = id;
        document.body.appendChild(inp);
      }
    });
}
ensureHiddenInputs();

// ── Autocomplete factory ──────────────────────────────────────
function setupAutocomplete(inputId, resultsId, skyIdField, entityIdField, hotelEntityIdField) {
  const input    = document.getElementById(inputId);
  const dropdown = document.getElementById(resultsId);
  if (!input || !dropdown) return;
  let debounce;

  input.addEventListener("input", e => {
    clearTimeout(debounce);
    const val = e.target.value.trim();
    dropdown.innerHTML = "";
    if (val.length < 2) return;
    dropdown.innerHTML = `<div style="padding:10px;color:#999;font-size:13px;">Searching…</div>`;
    debounce = setTimeout(async () => {
      const results = await getCitySuggestions(val);
      dropdown.innerHTML = "";
      if (!results.length) {
        dropdown.innerHTML = `<div style="padding:10px;color:#999;font-size:13px;">No results found</div>`;
        return;
      }
      results.forEach(place => {
        const div = document.createElement("div");
        div.innerHTML = `<strong>${place.skyId}</strong> &ndash; ${place.cityName}, ${place.countryName}`;
        div.addEventListener("click", () => {
          input.value = `${place.skyId} — ${place.cityName}`;
          document.getElementById(skyIdField).value         = place.skyId;
          document.getElementById(entityIdField).value      = place.entityId;
          document.getElementById(hotelEntityIdField).value = place.hotelEntityId;
          dropdown.innerHTML = "";
        });
        dropdown.appendChild(div);
      });
    }, 300);
  });

  document.addEventListener("click", e => {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.innerHTML = "";
    }
  });
}

setupAutocomplete("originInput", "origin-results", "originSkyId", "originEntityId", "originHotelEntityId");
setupAutocomplete("destInput", "dest-results", "destSkyId", "destEntityId", "destHotelEntityId");

// ── Show toast notification ────────────────────────────────────
function showToast(msg, type = "warn") {
  const existing = document.getElementById("travelin-toast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.id = "travelin-toast";
  toast.textContent = msg;
  Object.assign(toast.style, {
    position: "fixed", bottom: "30px", left: "50%", transform: "translateX(-50%)",
    background: type === "warn" ? "#e07000" : "#003580",
    color: "#fff", padding: "12px 28px", borderRadius: "30px",
    fontFamily: "'Poppins', sans-serif", fontWeight: "600", fontSize: "0.9rem",
    zIndex: "99999", boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
    animation: "fadeInUp 0.3s ease"
  });
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ── Search handler ────────────────────────────────────────────
function handleSearch() {
  const originVal = document.getElementById("originInput").value.trim();
  const destVal   = document.getElementById("destInput").value.trim();
  const date      = document.getElementById("dateInput").value;
  const returnDate = document.getElementById("returnDateInput")?.value || "";
  const passengers = document.getElementById("passengersInput")?.value || "1";

  if (!originVal || !destVal || !date) {
    showToast("⚠️ Please fill in origin, destination, and date.");
    return;
  }

  // Extract just the sky ID from "DEL — New Delhi" format or plain text
  const originMatch = originVal.split(" ");
  const origin = (document.getElementById("originSkyId").value || originMatch[0]).toUpperCase();
  const originName = originVal.includes("—") ? originVal.split("—")[1].trim() : origin;

  const destMatch = destVal.split(" ");
  const dest   = (document.getElementById("destSkyId").value   || destMatch[0]).toUpperCase();
  const destName = destVal.includes("—") ? destVal.split("—")[1].trim() : dest;

  const originEntityId    = document.getElementById("originEntityId").value    || "";
  const originSkyId       = document.getElementById("originSkyId").value       || origin;
  const destEntityId      = document.getElementById("destEntityId").value      || "";
  const destSkyId         = document.getElementById("destSkyId").value         || dest;
  const destHotelEntityId = document.getElementById("destHotelEntityId").value || "";

  const params = new URLSearchParams({
    origin, originName, dest, destName, date,
    originSkyId, originEntityId,
    destSkyId,   destEntityId,
    destHotelEntityId,
    tripType: currentTripType,
    returnDate,
    passengers,
  });

  window.location.href = `api.html?${params.toString()}`;
}

// ── Pre-fill search from popular route chip ───────────────────
function quickSearch(route) {
  const originInput = document.getElementById("originInput");
  const destInput   = document.getElementById("destInput");
  originInput.value = `${route.from} — ${route.fromName}`;
  destInput.value   = `${route.to} — ${route.toName}`;
  document.getElementById("originSkyId").value         = route.from;
  document.getElementById("originEntityId").value      = route.fromEntityId;
  document.getElementById("originHotelEntityId").value = route.fromHotelEntityId;
  document.getElementById("destSkyId").value           = route.to;
  document.getElementById("destEntityId").value        = route.toEntityId;
  document.getElementById("destHotelEntityId").value   = route.toHotelEntityId;
  // Scroll to search
  document.getElementById("search-container")?.scrollIntoView({ behavior: "smooth" });
}

// ── Pre-fill search from discover card ───────────────────────
function quickSearchDest(dest) {
  const originSkyEl  = document.getElementById("originSkyId");
  const originEl     = document.getElementById("originInput");
  // Use whatever origin is currently set, or default to DEL
  const fromSkyId    = originSkyEl?.value || "DEL";
  const fromEntityId = document.getElementById("originEntityId")?.value || "95673567";
  const fromHotelId  = document.getElementById("originHotelEntityId")?.value || "27536952";

  document.getElementById("originInput").value = originEl?.value || "DEL — New Delhi";
  document.getElementById("destInput").value   = `${dest.skyId} — ${dest.cityName}`;
  document.getElementById("originSkyId").value         = fromSkyId;
  document.getElementById("originEntityId").value      = fromEntityId;
  document.getElementById("originHotelEntityId").value = fromHotelId;
  document.getElementById("destSkyId").value           = dest.skyId;
  document.getElementById("destEntityId").value        = dest.entityId;
  document.getElementById("destHotelEntityId").value   = dest.hotelEntityId;
  handleSearch();
}

// ── Render popular routes ─────────────────────────────────────
function renderPopularRoutes() {
  const row = document.getElementById("routes-row");
  if (!row) return;
  row.innerHTML = POPULAR_ROUTES.map(r => `
    <div class="route-chip" onclick='quickSearch(${JSON.stringify(r)})'>
      ✈️ ${r.fromName} → ${r.toName}
      <span class="chip-price">${r.price}</span>
    </div>
  `).join("");
}

// ── Render discover cards with Unsplash photos ────────────────
async function renderDiscoverCards() {
  const container = document.getElementById("discover-cards");
  if (!container) return;

  // Fetch all photos in parallel
  const photos = await Promise.all(
    DISCOVER_DESTINATIONS.map(d => getDestinationPhoto(d.query, 600))
  );

  container.innerHTML = DISCOVER_DESTINATIONS.map((d, i) => {
    const imgUrl = photos[i] || "";
    return `
    <div class="card" onclick='quickSearchDest(${JSON.stringify({ skyId: d.skyId, entityId: d.entityId, hotelEntityId: d.hotelEntityId, cityName: d.cityName, countryName: d.countryName })})'>
      <div class="card-img-wrapper">
        ${imgUrl
          ? `<img src="${imgUrl}" alt="${d.cityName}" loading="lazy">`
          : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#003580,#FF7300);display:flex;align-items:center;justify-content:center;color:#fff;font-size:2rem;">✈️</div>`
        }
        <div class="card-img-overlay"></div>
      </div>
      <div class="card-body">
        <h4>${d.cityName}</h4>
        <p>${d.countryName}</p>
      </div>
      <div class="card-footer">
        <span>from ${d.price}</span>
        <button>Explore →</button>
      </div>
    </div>`;
  }).join("");
}

// ── Init on page load ─────────────────────────────────────────
renderPopularRoutes();
renderDiscoverCards();
