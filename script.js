const API_KEY = "meqzQmgAFjWToGYAlm3A9pXXYGAGEr6A";
const API_SECRET = "xdH503AeVoLYYMsD";

let cheapestFlight = 0;
let averageHotel = 0;

// 1. AUTOMATED TOKEN FETCHING
async function getAccessToken() {
  const url = "https://test.api.amadeus.com/v1/security/oauth2/token";
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=client_credentials&client_id=${API_KEY}&client_secret=${API_SECRET}`,
  });
  const data = await response.json();
  return data.access_token;
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

  if (origin && dest && date) {
    fetchFlightData(origin, dest, date);
    fetchHotels(dest);
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

    if (!jsonData.data || jsonData.data.length === 0) {
      container.innerHTML = `<div class="no-results"><h3>No flights found.</h3></div>`;
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
    console.error(error);
    container.innerHTML = "<h3>Error connecting to flight server.</h3>";
  }
}

// 6. FETCH HOTEL DATA
async function fetchHotels(cityCode) {
  const container = document.getElementById("hotel-results-container");
  container.innerHTML = `<div class="loading-container"><div class="spinner"></div><p>Searching for stays...</p></div>`;

  try {
    const token = await getAccessToken();
    const url = `https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city?cityCode=${cityCode}`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const jsonData = await response.json();

    if (!jsonData.data || jsonData.data.length === 0) {
      container.innerHTML = "<p>No hotels found in test database.</p>";
      return;
    }

    // Since Test API doesn't give real prices for city-wide hotel lists,
    // we simulate an average of $150 to show your calculator works.
    averageHotel = 150.0;
    updateTripTotal();

    renderHotelCards(jsonData.data);

    // Inside your fetchHotels try block
    if (!jsonData.data || jsonData.data.length === 0) {
      container.innerHTML = `
        <div class="no-results" style="text-align:center; padding:20px;">
            <p>No test offers found for this city.</p>
            <p style="font-size:0.8rem; color:#777;">Tip: Use <b>NYC</b> or <b>LON</b> to see live test prices.</p>
        </div>`;
      return;
    }
  } catch (error) {
    console.error(error);
    container.innerHTML = "<p>Error loading hotels.</p>";
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

    if (!jsonData.data || jsonData.data.length === 0) {
      container.innerHTML =
        "<h3>------- No specific offers available for this hotel right now.</h3>";
      return;
    }

    renderOfferCards(jsonData.data[0]); // Amadeus returns offers inside a hotel object
  } catch (error) {
    console.error("Offer Error:", error);
    container.innerHTML = "<h3>------- Error fetching room prices.</h3>";
  }
}

function renderOfferCards(hotelData) {
  const container = document.getElementById("hotel-results-container");
  const offers = hotelData.offers;

  container.innerHTML =
    `<h2>Available Rooms at ${hotelData.hotel.name}</h2>` +
    offers
      .map(
        (offer) => `
        <div class="flight-card">
            <div class="card-body">
                <h3 class="airline-name">🛏️ ${offer.room.typeEstimated.category.replace(/_/g, " ")}</h3>
                <p class="route-subtitle">${offer.room.description.text}</p>
                
                <div class="flight-info-row">
                    <span>Policy: <b>${offer.policies.cancellation.type || "Standard"}</b></span>
                    <span class="duration-pill">${offer.boardType || "Room Only"}</span>
                </div>

                <div class="card-footer-row">
                    <span class="price-tag">${offer.price.total} ${offer.price.currency}</span>
                    <button class="action-btn" onclick="alert('Offer ID: ${offer.id} selected!')">Book Now</button>
                </div>
            </div>
        </div>
    `,
      )
      .join("");
}
