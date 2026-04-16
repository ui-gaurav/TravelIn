// ============================================================
// TravelIn - Search & Autocomplete Module
// ============================================================
// Tries Amadeus API for city suggestions, falls back to
// a local airport database if the API returns an error.
// ============================================================

// — Local Airport / City Database (Fallback) —
const LOCAL_AIRPORTS = [
  // India
  { iataCode: "DEL", name: "Indira Gandhi International", cityCode: "DEL", cityName: "New Delhi", countryName: "India" },
  { iataCode: "BOM", name: "Chhatrapati Shivaji Maharaj International", cityCode: "BOM", cityName: "Mumbai", countryName: "India" },
  { iataCode: "MAA", name: "Chennai International", cityCode: "MAA", cityName: "Chennai", countryName: "India" },
  { iataCode: "BLR", name: "Kempegowda International", cityCode: "BLR", cityName: "Bengaluru", countryName: "India" },
  { iataCode: "HYD", name: "Rajiv Gandhi International", cityCode: "HYD", cityName: "Hyderabad", countryName: "India" },
  { iataCode: "CCU", name: "Netaji Subhas Chandra Bose International", cityCode: "CCU", cityName: "Kolkata", countryName: "India" },
  { iataCode: "GOI", name: "Dabolim Airport", cityCode: "GOI", cityName: "Goa", countryName: "India" },
  { iataCode: "AMD", name: "Sardar Vallabhbhai Patel International", cityCode: "AMD", cityName: "Ahmedabad", countryName: "India" },
  { iataCode: "COK", name: "Cochin International", cityCode: "COK", cityName: "Kochi", countryName: "India" },
  { iataCode: "PNQ", name: "Pune Airport", cityCode: "PNQ", cityName: "Pune", countryName: "India" },
  { iataCode: "LKO", name: "Chaudhary Charan Singh International", cityCode: "LKO", cityName: "Lucknow", countryName: "India" },
  { iataCode: "JAI", name: "Jaipur International", cityCode: "JAI", cityName: "Jaipur", countryName: "India" },
  { iataCode: "ATQ", name: "Sri Guru Ram Dass Jee International", cityCode: "ATQ", cityName: "Amritsar", countryName: "India" },
  { iataCode: "SXR", name: "Sheikh ul Alam International", cityCode: "SXR", cityName: "Srinagar", countryName: "India" },
  { iataCode: "GAU", name: "Lokpriya Gopinath Bordoloi International", cityCode: "GAU", cityName: "Guwahati", countryName: "India" },
  { iataCode: "BBI", name: "Biju Patnaik International", cityCode: "BBI", cityName: "Bhubaneswar", countryName: "India" },
  { iataCode: "TRV", name: "Trivandrum International", cityCode: "TRV", cityName: "Thiruvananthapuram", countryName: "India" },
  { iataCode: "NAG", name: "Dr. Babasaheb Ambedkar International", cityCode: "NAG", cityName: "Nagpur", countryName: "India" },
  { iataCode: "IXC", name: "Chandigarh International", cityCode: "IXC", cityName: "Chandigarh", countryName: "India" },
  { iataCode: "VNS", name: "Lal Bahadur Shastri Airport", cityCode: "VNS", cityName: "Varanasi", countryName: "India" },
  // Middle East
  { iataCode: "DXB", name: "Dubai International", cityCode: "DXB", cityName: "Dubai", countryName: "United Arab Emirates" },
  { iataCode: "AUH", name: "Abu Dhabi International", cityCode: "AUH", cityName: "Abu Dhabi", countryName: "United Arab Emirates" },
  { iataCode: "DOH", name: "Hamad International", cityCode: "DOH", cityName: "Doha", countryName: "Qatar" },
  { iataCode: "RUH", name: "King Khalid International", cityCode: "RUH", cityName: "Riyadh", countryName: "Saudi Arabia" },
  { iataCode: "JED", name: "King Abdulaziz International", cityCode: "JED", cityName: "Jeddah", countryName: "Saudi Arabia" },
  // Europe
  { iataCode: "LHR", name: "London Heathrow", cityCode: "LON", cityName: "London", countryName: "United Kingdom" },
  { iataCode: "LGW", name: "London Gatwick", cityCode: "LON", cityName: "London", countryName: "United Kingdom" },
  { iataCode: "STN", name: "London Stansted", cityCode: "LON", cityName: "London", countryName: "United Kingdom" },
  { iataCode: "CDG", name: "Charles de Gaulle International", cityCode: "PAR", cityName: "Paris", countryName: "France" },
  { iataCode: "ORY", name: "Orly Airport", cityCode: "PAR", cityName: "Paris", countryName: "France" },
  { iataCode: "FRA", name: "Frankfurt Airport", cityCode: "FRA", cityName: "Frankfurt", countryName: "Germany" },
  { iataCode: "MUC", name: "Munich Airport", cityCode: "MUC", cityName: "Munich", countryName: "Germany" },
  { iataCode: "AMS", name: "Amsterdam Airport Schiphol", cityCode: "AMS", cityName: "Amsterdam", countryName: "Netherlands" },
  { iataCode: "MAD", name: "Adolfo Suárez Madrid-Barajas", cityCode: "MAD", cityName: "Madrid", countryName: "Spain" },
  { iataCode: "BCN", name: "Barcelona El Prat", cityCode: "BCN", cityName: "Barcelona", countryName: "Spain" },
  { iataCode: "FCO", name: "Leonardo da Vinci International", cityCode: "ROM", cityName: "Rome", countryName: "Italy" },
  { iataCode: "MXP", name: "Milan Malpensa International", cityCode: "MIL", cityName: "Milan", countryName: "Italy" },
  { iataCode: "ZRH", name: "Zurich Airport", cityCode: "ZRH", cityName: "Zurich", countryName: "Switzerland" },
  { iataCode: "VIE", name: "Vienna International", cityCode: "VIE", cityName: "Vienna", countryName: "Austria" },
  { iataCode: "BRU", name: "Brussels Airport", cityCode: "BRU", cityName: "Brussels", countryName: "Belgium" },
  { iataCode: "CPH", name: "Copenhagen Airport", cityCode: "CPH", cityName: "Copenhagen", countryName: "Denmark" },
  { iataCode: "ARN", name: "Stockholm Arlanda", cityCode: "STO", cityName: "Stockholm", countryName: "Sweden" },
  { iataCode: "IST", name: "Istanbul Airport", cityCode: "IST", cityName: "Istanbul", countryName: "Turkey" },
  { iataCode: "ATH", name: "Athens International", cityCode: "ATH", cityName: "Athens", countryName: "Greece" },
  // Asia-Pacific
  { iataCode: "SIN", name: "Singapore Changi", cityCode: "SIN", cityName: "Singapore", countryName: "Singapore" },
  { iataCode: "BKK", name: "Suvarnabhumi Airport", cityCode: "BKK", cityName: "Bangkok", countryName: "Thailand" },
  { iataCode: "KUL", name: "Kuala Lumpur International", cityCode: "KUL", cityName: "Kuala Lumpur", countryName: "Malaysia" },
  { iataCode: "NRT", name: "Narita International", cityCode: "TYO", cityName: "Tokyo", countryName: "Japan" },
  { iataCode: "HND", name: "Tokyo Haneda", cityCode: "TYO", cityName: "Tokyo", countryName: "Japan" },
  { iataCode: "ICN", name: "Incheon International", cityCode: "SEL", cityName: "Seoul", countryName: "South Korea" },
  { iataCode: "PEK", name: "Beijing Capital International", cityCode: "BJS", cityName: "Beijing", countryName: "China" },
  { iataCode: "PVG", name: "Shanghai Pudong International", cityCode: "SHA", cityName: "Shanghai", countryName: "China" },
  { iataCode: "HKG", name: "Hong Kong International", cityCode: "HKG", cityName: "Hong Kong", countryName: "Hong Kong" },
  { iataCode: "MNL", name: "Ninoy Aquino International", cityCode: "MNL", cityName: "Manila", countryName: "Philippines" },
  { iataCode: "CGK", name: "Soekarno-Hatta International", cityCode: "JKT", cityName: "Jakarta", countryName: "Indonesia" },
  { iataCode: "SYD", name: "Sydney Airport", cityCode: "SYD", cityName: "Sydney", countryName: "Australia" },
  { iataCode: "MEL", name: "Melbourne Airport", cityCode: "MEL", cityName: "Melbourne", countryName: "Australia" },
  { iataCode: "AKL", name: "Auckland Airport", cityCode: "AKL", cityName: "Auckland", countryName: "New Zealand" },
  { iataCode: "MLE", name: "Velana International", cityCode: "MLE", cityName: "Malé", countryName: "Maldives" },
  { iataCode: "CMB", name: "Bandaranaike International", cityCode: "CMB", cityName: "Colombo", countryName: "Sri Lanka" },
  { iataCode: "KTM", name: "Tribhuvan International", cityCode: "KTM", cityName: "Kathmandu", countryName: "Nepal" },
  { iataCode: "DAC", name: "Hazrat Shahjalal International", cityCode: "DAC", cityName: "Dhaka", countryName: "Bangladesh" },
  { iataCode: "ISB", name: "New Islamabad International", cityCode: "ISB", cityName: "Islamabad", countryName: "Pakistan" },
  { iataCode: "KHI", name: "Jinnah International", cityCode: "KHI", cityName: "Karachi", countryName: "Pakistan" },
  // Americas
  { iataCode: "JFK", name: "John F. Kennedy International", cityCode: "NYC", cityName: "New York", countryName: "United States" },
  { iataCode: "LGA", name: "LaGuardia Airport", cityCode: "NYC", cityName: "New York", countryName: "United States" },
  { iataCode: "EWR", name: "Newark Liberty International", cityCode: "NYC", cityName: "New York", countryName: "United States" },
  { iataCode: "LAX", name: "Los Angeles International", cityCode: "LAX", cityName: "Los Angeles", countryName: "United States" },
  { iataCode: "ORD", name: "O'Hare International", cityCode: "CHI", cityName: "Chicago", countryName: "United States" },
  { iataCode: "ATL", name: "Hartsfield-Jackson Atlanta International", cityCode: "ATL", cityName: "Atlanta", countryName: "United States" },
  { iataCode: "SFO", name: "San Francisco International", cityCode: "SFO", cityName: "San Francisco", countryName: "United States" },
  { iataCode: "MIA", name: "Miami International", cityCode: "MIA", cityName: "Miami", countryName: "United States" },
  { iataCode: "BOS", name: "Logan International", cityCode: "BOS", cityName: "Boston", countryName: "United States" },
  { iataCode: "SEA", name: "Seattle-Tacoma International", cityCode: "SEA", cityName: "Seattle", countryName: "United States" },
  { iataCode: "YYZ", name: "Toronto Pearson International", cityCode: "YTO", cityName: "Toronto", countryName: "Canada" },
  { iataCode: "YVR", name: "Vancouver International", cityCode: "YVR", cityName: "Vancouver", countryName: "Canada" },
  { iataCode: "GRU", name: "São Paulo/Guarulhos International", cityCode: "SAO", cityName: "São Paulo", countryName: "Brazil" },
  { iataCode: "MEX", name: "Mexico City International", cityCode: "MEX", cityName: "Mexico City", countryName: "Mexico" },
  // Africa
  { iataCode: "CAI", name: "Cairo International", cityCode: "CAI", cityName: "Cairo", countryName: "Egypt" },
  { iataCode: "JNB", name: "O.R. Tambo International", cityCode: "JNB", cityName: "Johannesburg", countryName: "South Africa" },
  { iataCode: "NBO", name: "Jomo Kenyatta International", cityCode: "NBO", cityName: "Nairobi", countryName: "Kenya" },
];

// — Search local DB —
function searchLocalAirports(query) {
  const q = query.toLowerCase();
  return LOCAL_AIRPORTS.filter(a =>
    a.iataCode.toLowerCase().startsWith(q) ||
    a.cityName.toLowerCase().includes(q) ||
    a.name.toLowerCase().includes(q) ||
    a.countryName.toLowerCase().includes(q)
  ).slice(0, 6);
}

// — Amadeus token cache —
let cachedToken = null;
let tokenExpiry = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;
  const url = "https://test.api.amadeus.com/v1/security/oauth2/token";
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=client_credentials&client_id=${API_KEY}&client_secret=${API_SECRET}`,
  });
  const data = await response.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000; // expire 60s early
  return cachedToken;
}

// — Get city suggestions (Amadeus first, local fallback) —
async function getCitySuggestions(query) {
  if (query.length < 2) return [];

  // Try Amadeus API
  try {
    const token = await getAccessToken();
    const url = `https://test.api.amadeus.com/v1/reference-data/locations?subType=CITY,AIRPORT&keyword=${encodeURIComponent(query)}&view=LIGHT&page[limit]=6`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const result = await response.json();
    if (result.data && result.data.length > 0) {
      // Normalize Amadeus response to local format
      return result.data.map(item => ({
        iataCode: item.iataCode,
        name: item.name,
        cityCode: item.address?.cityCode || item.iataCode,
        cityName: item.address?.cityName || item.name,
        countryName: item.address?.countryName || ""
      }));
    }
  } catch (err) {
    console.warn("Amadeus location API unavailable, using local database:", err.message);
  }

  // Fallback to local database
  return searchLocalAirports(query);
}

// — Date setup —
const today = new Date().toISOString().split("T")[0];
document.getElementById("dateInput").min = today;
document.getElementById("dateInput").value = today;

// — Hidden city code fields (for hotel search) —
// These store the Amadeus city code (not airport IATA code) for origin/destination
function ensureHiddenCityInputs() {
  if (!document.getElementById("originCityCode")) {
    const inp = document.createElement("input");
    inp.type = "hidden";
    inp.id = "originCityCode";
    document.body.appendChild(inp);
  }
  if (!document.getElementById("destCityCode")) {
    const inp = document.createElement("input");
    inp.type = "hidden";
    inp.id = "destCityCode";
    document.body.appendChild(inp);
  }
}
ensureHiddenCityInputs();

// — Autocomplete setup —
async function setupAutocomplete(inputId, resultsId, cityCodeInputId) {
  const input = document.getElementById(inputId);
  const resultsContainer = document.getElementById(resultsId);
  let debounceTimer;

  input.addEventListener("input", (e) => {
    clearTimeout(debounceTimer);
    const val = e.target.value.trim();
    resultsContainer.innerHTML = "";

    if (val.length < 2) return;

    // Show loading indicator
    resultsContainer.innerHTML = `<div style="padding:10px;color:#999;font-size:13px;">Searching...</div>`;

    debounceTimer = setTimeout(async () => {
      const suggestions = await getCitySuggestions(val);
      resultsContainer.innerHTML = "";

      if (suggestions.length === 0) {
        resultsContainer.innerHTML = `<div style="padding:10px;color:#999;font-size:13px;">No results found</div>`;
        return;
      }

      suggestions.forEach(city => {
        const div = document.createElement("div");
        div.innerHTML = `<strong>${city.iataCode}</strong> &ndash; ${city.cityName}, ${city.countryName}`;
        div.addEventListener("click", () => {
          input.value = city.iataCode;
          // Store the city code for hotel search
          const cityInput = document.getElementById(cityCodeInputId);
          if (cityInput) cityInput.value = city.cityCode;
          resultsContainer.innerHTML = "";
        });
        resultsContainer.appendChild(div);
      });
    }, 300); // 300ms debounce
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!input.contains(e.target) && !resultsContainer.contains(e.target)) {
      resultsContainer.innerHTML = "";
    }
  });
}

setupAutocomplete("originInput", "origin-results", "originCityCode");
setupAutocomplete("destInput", "dest-results", "destCityCode");

// — Search handler —
function handleSearch() {
  const origin = document.getElementById("originInput").value.trim().toUpperCase();
  const destination = document.getElementById("destInput").value.trim().toUpperCase();
  const date = document.getElementById("dateInput").value;

  // Get city codes (fallback to IATA code if city code not set)
  const originCity = (document.getElementById("originCityCode").value || origin).toUpperCase();
  const destCity = (document.getElementById("destCityCode").value || destination).toUpperCase();

  if (!origin || !destination || !date) {
    alert("Please enter an origin, destination, and date.\nTip: Type a city or airport code (e.g. DEL, LHR, JFK) and select from the dropdown.");
    return;
  }

  window.location.href = `api.html?origin=${origin}&dest=${destination}&date=${date}&originCity=${originCity}&destCity=${destCity}`;
}
