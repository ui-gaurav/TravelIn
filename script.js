let cheapestFlight = 0;
let averageHotel = 0;

// 1. TOKEN FETCHING — delegates to the shared AmadeusToken manager in config.js
// AmadeusToken caches and auto-refreshes the token every ~29 minutes.
async function getAccessToken() {
  return AmadeusToken.get();
}

// 2. HELPER TO GET URL DATA
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// 3. PAGE INITIALIZATION
window.onload = async function () {
  const origin = getQueryParam("origin");
  const dest = getQueryParam("dest");
  const date = getQueryParam("date");
  // destCity is the Amadeus city code (e.g. LON for LHR, NYC for JFK)
  // Falls back to dest (airport code) if not provided
  const destCity = getQueryParam("destCity") || dest;

  // Update page titles to show the route
  if (origin && dest) {
    const flightTitle = document.getElementById("flight-section");
    const hotelTitle = document.getElementById("hotel-section");
    if (flightTitle) flightTitle.textContent = `✈️ Flights: ${origin} → ${dest}`;
    if (hotelTitle) hotelTitle.textContent = `🏨 Stays in ${dest} (${destCity})`;
  }

  if (origin && dest && date) {
    fetchFlightData(origin, dest, date);
    fetchHotels(destCity);
  } else {
    const fc = document.getElementById("flight-results-container");
    const hc = document.getElementById("hotel-results-container");
    if (fc) fc.innerHTML = `<div class="no-results"><p>No search parameters found. <a href="home.html">← Go back</a></p></div>`;
    if (hc) hc.innerHTML = "";
  }
};

// 4. TOTAL CALCULATOR LOGIC
// 1. Define an exchange rate (Current approx: 1 USD = 83 INR)
const USD_TO_INR = 90.58;

function updateTripTotal() {
  const summaryBar = document.getElementById("trip-summary");
  const currency = document.getElementById("currency-choice").value;

  // Calculate based on the rate
  const rate = currency === "INR" ? USD_TO_INR : 1;
  const symbol = currency === "INR" ? "₹" : "$";

  const convertedFlight = cheapestFlight * rate;
  const convertedHotel = averageHotel * rate;
  const total = convertedFlight + convertedHotel;

  if (cheapestFlight > 0) {
    summaryBar.style.display = "flex";
    document.getElementById("min-flight-price").innerText =
      `${symbol}${convertedFlight.toFixed(2)}`;
    document.getElementById("avg-hotel-price").innerText =
      averageHotel > 0 ? `${symbol}${convertedHotel.toFixed(2)}` : "N/A";
    document.getElementById("total-trip-cost").innerText =
      `${symbol}${total.toFixed(2)}`;
  }
}

// 5. FETCH FLIGHT DATA
async function fetchFlightData(origin, dest, date) {
  const container = document.getElementById("flight-results-container");
  container.innerHTML = `<div class="loading-container"><div class="spinner"></div><p>Finding flights to ${dest}...</p></div>`;

  try {
    const token = await getAccessToken();
    const url = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${dest}&departureDate=${date}&adults=1&max=10`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const jsonData = await response.json();

    // Check for API-level errors (e.g. invalid airport code)
    if (jsonData.errors) {
      const errMsg = jsonData.errors[0]?.detail || "Invalid request parameters.";
      throw new Error(errMsg);
    }

    if (!jsonData.data || jsonData.data.length === 0) {
      container.innerHTML = `
        <div class="no-results">
          <h3>✈️ No flights found for this route.</h3>
          <p style="color:#777;font-size:0.9rem;">Try a different date or check the airport codes are valid (e.g. DEL, LHR, JFK).</p>
          <a href="home.html">← Change Search</a>
        </div>`;
      return;
    }

    // Sort and Capture Cheapest Flight
    const sortedData = jsonData.data.sort(
      (a, b) => parseFloat(a.price.total) - parseFloat(b.price.total),
    );
    cheapestFlight = parseFloat(sortedData[0].price.total);
    updateTripTotal();

    renderFlightCards(sortedData, jsonData.dictionaries.carriers);
  } catch (error) {
    console.error("Flight fetch error:", error);
    // On auth errors, clear the token so next request will re-authenticate
    if (error.message && error.message.includes("401")) AmadeusToken.clear();
    container.innerHTML = `
      <div class="no-results" style="text-align:center;padding:40px;">
        <h3 style="color:#e74c3c;">⚠️ Flight search failed</h3>
        <p style="color:#777;font-size:0.9rem;">${error.message}</p>
        <a href="home.html" style="color:#ff7f00;font-weight:600;">← Try again</a>
      </div>`;
  }
}

// 6. FETCH HOTEL DATA
async function fetchHotels(cityCode) {
  const container = document.getElementById("hotel-results-container");
  container.innerHTML = `<div class="loading-container"><div class="spinner"></div><p>Searching for stays in ${cityCode}...</p></div>`;

  try {
    const token = await getAccessToken();
    // Use city IATA code (e.g. LON for London, NYC for New York)
    const url = `https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city?cityCode=${cityCode}&radius=5&radiusUnit=KM&hotelSource=ALL`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData.errors?.[0]?.detail || `HTTP ${response.status}`;
      throw new Error(errMsg);
    }

    const jsonData = await response.json();

    if (!jsonData.data || jsonData.data.length === 0) {
      container.innerHTML = `
        <div class="no-results" style="text-align:center;padding:40px;">
          <p style="font-size:1rem;color:#555;">No hotels found for city code <b>${cityCode}</b>.</p>
          <p style="font-size:0.85rem;color:#999;">Try a major city like NYC, LON, PAR or DXB.</p>
        </div>`;
      return;
    }

    // Amadeus test API doesn't return live prices for city-wide listing
    // Use a simulated average price for the trip calculator
    averageHotel = 150.0;
    updateTripTotal();

    renderHotelCards(jsonData.data);
  } catch (error) {
    console.error("Hotel fetch error:", error);
    container.innerHTML = `
      <div class="no-results" style="text-align:center;padding:40px;">
        <h3 style="color:#e74c3c;">⚠️ Hotel data unavailable</h3>
        <p style="color:#777;font-size:0.9rem;">${error.message}</p>
        <p style="color:#999;font-size:0.8rem;">The Amadeus test environment has limited city coverage.<br>Try major city codes: NYC, LON, PAR, DXB, SIN.</p>
      </div>`;
  }
}

// 7. RENDER FUNCTIONS
function renderFlightCards(data, carriers) {
  const container = document.getElementById("flight-results-container");
  container.innerHTML = data
    .map((flight) => {
      const airlineCode = flight.validatingAirlineCodes[0];
      const airlineName = carriers[airlineCode] || "Airline";
      const itinerary = flight.itineraries[0];
      const depTime = new Date(
        itinerary.segments[0].departure.at,
      ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      return `
      <div class="flight-card">
        <div class="card-body">
          <h3 class="airline-name">${airlineName}</h3>
          <p class="route-subtitle">${itinerary.segments[0].departure.iataCode} ✈️ ${itinerary.segments[itinerary.segments.length - 1].arrival.iataCode}</p>
          <div class="flight-info-row">
            <span>Departure: <b>${depTime}</b></span>
            <span class="duration-pill">⏱ ${itinerary.duration.replace("PT", "").toLowerCase()}</span>
          </div>
          <div class="card-footer-row">
            <span class="price-tag">$${flight.price.total}</span>
            <button class="action-btn">Select Flight</button>
          </div>
        </div>
      </div>`;
    })
    .join("");
}

function renderHotelCards(hotels) {
  const container = document.getElementById("hotel-results-container");
  container.innerHTML = hotels
    .slice(0, 6)
    .map(
      (hotel) => `
    <div class="flight-card">
      <div class="card-body">
        <h3 class="airline-name">🏨 ${hotel.name}</h3>
        <p class="route-subtitle">ID: ${hotel.hotelId}</p>
        <div class="flight-info-row">
          <span>Cleanliness: <b>High</b></span>
          <span class="duration-pill">Verified</span>
        </div>
        <div class="card-footer-row">
          <span class="price-tag">Best Rate</span>
<button class="action-btn" onclick="fetchHotelOffers('${hotel.hotelId}')">View Rooms</button>
        </div>
      </div>
    </div>`,
    )
    .join("");
}

// Function to fetch specific room offers and prices
async function fetchHotelOffers(hotelId) {
  const container = document.getElementById("hotel-results-container");
  container.innerHTML = `<div class="loading-container"><div class="spinner"></div><p>Fetching real-time prices for ${hotelId}...</p></div>`;

  try {
    const token = await getAccessToken();
    // The v3 endpoint for specific hotel pricing
    const url = `https://test.api.amadeus.com/v3/shopping/hotel-offers?hotelIds=${hotelId}&adults=1&bestRateOnly=true`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const jsonData = await response.json();

    // Check for API-level error response
    if (jsonData.errors) {
      const errMsg = jsonData.errors[0]?.detail || "This hotel has no available offers.";
      throw new Error(errMsg);
    }

    if (!jsonData.data || jsonData.data.length === 0) {
      container.innerHTML = `
        <div class="no-results" style="text-align:center;padding:40px;">
          <h3>🏨 No rooms available right now</h3>
          <p style="color:#777;font-size:0.9rem;">This hotel has no live offers in the test environment.<br>Try another hotel from the list.</p>
          <button class="action-btn" onclick="fetchHotels(getQueryParam('destCity') || getQueryParam('dest'))" style="margin-top:15px;">← Back to Hotels</button>
        </div>`;
      return;
    }

    renderOfferCards(jsonData.data[0]); // Amadeus returns offers inside a hotel object
  } catch (error) {
    console.error("Offer Error:", error);
    container.innerHTML = `
      <div class="no-results" style="text-align:center;padding:40px;">
        <h3 style="color:#e74c3c;">⚠️ Room pricing unavailable</h3>
        <p style="color:#777;font-size:0.9rem;">${error.message}</p>
        <button class="action-btn" onclick="fetchHotels(getQueryParam('destCity') || getQueryParam('dest'))" style="margin-top:15px;">← Back to Hotels</button>
      </div>`;
  }
}

function renderOfferCards(hotelData) {
  const container = document.getElementById("hotel-results-container");
  const offers = hotelData.offers || [];
  const hotelName = hotelData.hotel?.name || "Hotel";

  container.innerHTML =
    `<h2 style="padding-left:5%;color:#333;">🏨 Available Rooms at ${hotelName}</h2>` +
    (offers.length === 0
      ? `<div class="no-results"><h3>No offers currently available for this hotel.</h3></div>`
      : offers.map((offer) => {
          const roomCategory = offer.room?.typeEstimated?.category?.replace(/_/g, " ") || "Standard Room";
          const roomDesc = offer.room?.description?.text || "A comfortable room for your stay.";
          const cancelType = offer.policies?.cancellation?.type || offer.policies?.cancellation?.amount ? "Non-refundable" : "Free Cancellation";
          const boardType = offer.boardType || "Room Only";
          return `
          <div class="flight-card">
              <div class="card-body">
                  <h3 class="airline-name">🛏️ ${roomCategory}</h3>
                  <p class="route-subtitle">${roomDesc}</p>
                  
                  <div class="flight-info-row">
                      <span>Cancellation: <b>${cancelType}</b></span>
                      <span class="duration-pill">${boardType}</span>
                  </div>

                  <div class="card-footer-row">
                      <span class="price-tag">${offer.price.total} ${offer.price.currency}</span>
                      <button class="action-btn" onclick="alert('Offer ID: ${offer.id}\\nRoom: ${roomCategory}\\nPrice: ${offer.price.total} ${offer.price.currency}')">Book Now</button>
                  </div>
              </div>
          </div>`;
        }).join(""));
}
