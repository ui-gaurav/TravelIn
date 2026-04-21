
let cheapestFlight = 0;
let averageHotel   = 0;

function getQueryParam(p) {
  return new URLSearchParams(window.location.search).get(p);
}

const RATES   = { USD: 1, INR: 90.58, EUR: 0.93, GBP: 0.79 };
const SYMBOLS = { USD: "$", INR: "₹", EUR: "€", GBP: "£" };

function updateTripTotal() {
  const currencyEl = document.getElementById("currency-choice");
  const summaryBar = document.getElementById("trip-summary");
  if (!currencyEl || !summaryBar) return;

  const currency = currencyEl.value;
  const rate     = RATES[currency]   || 1;
  const symbol   = SYMBOLS[currency] || "$";

  if (cheapestFlight > 0 && summaryBar) {
    const fAmt     = cheapestFlight * rate;
    const hAmt     = averageHotel   * rate;
    summaryBar.style.display = "flex";
    document.getElementById("min-flight-price").innerText = `${symbol}${fAmt.toFixed(0)}`;
    document.getElementById("avg-hotel-price").innerText  = averageHotel > 0 ? `${symbol}${hAmt.toFixed(0)}` : "N/A";
    document.getElementById("total-trip-cost").innerText  = `${symbol}${(fAmt + hAmt).toFixed(0)}`;
  }

  document.querySelectorAll('.price-tag').forEach(tag => {
     const usd = tag.getAttribute('data-usd');
     if (usd && parseFloat(usd) > 0) {
       const converted = (parseFloat(usd) * rate).toFixed(0);
       const sub = tag.innerHTML.includes('/night') ? '<sub>/night</sub>' : '<sub>/person</sub>';
       tag.innerHTML = `${symbol}${converted}${sub}`;
     }
  });

  document.querySelectorAll('.cal-price').forEach(tag => {
     const usd = tag.getAttribute('data-usd');
     if (usd) tag.innerHTML = `${symbol}${(parseFloat(usd) * rate).toFixed(0)}`;
  });
}

function shareTrip() {
  const url = window.location.href;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => showResultToast("🔗 Link copied!"));
  } else {
    prompt("Copy this link:", url);
  }
}

function showResultToast(msg) {
  const t = document.createElement("div");
  t.textContent = msg;
  Object.assign(t.style, {
    position:"fixed", bottom:"30px", left:"50%", transform:"translateX(-50%)",
    background:"#003580", color:"#fff", padding:"12px 28px", borderRadius:"30px",
    fontFamily:"'Poppins',sans-serif", fontWeight:"600", fontSize:"0.9rem",
    zIndex:"99999", boxShadow:"0 8px 24px rgba(0,0,0,0.25)"
  });
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

function renderSkeletons(containerId, count = 3) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `<div class="loading-container">${
    Array(count).fill(`<div class="skeleton skeleton-card-full"></div>`).join("")
  }</div>`;
}

async function resolveEntityId(query) {
  try {
    const res  = await skyScrapper("/api/v1/flights/searchAirport", { query, locale: "en-US" });
    const json = await res.json();
    if (json.status && json.data?.length > 0) {
      const item = json.data[0];
      return {
        skyId:         item.navigation?.relevantFlightParams?.skyId    || item.skyId,
        entityId:      item.navigation?.relevantFlightParams?.entityId || item.entityId,
        hotelEntityId: item.navigation?.relevantHotelParams?.entityId  || item.entityId,
      };
    }
  } catch (e) {
    console.warn("[resolveEntityId] failed:", e.message);
  }
  return { skyId: query, entityId: null, hotelEntityId: null };
}

async function renderDestHero(cityName, origin, dest, date, passengers, tripType) {
  const hero    = document.getElementById("dest-hero");
  const content = document.getElementById("dest-hero-content");
  const badge   = document.getElementById("route-badge");
  if (!hero || !content) return;

  const paxLabel = passengers > 1 ? `${passengers} Pax` : "1 Pax";
  const rtLabel  = tripType === "round-trip" ? "Round-trip" : "One-way";
  if (badge) badge.textContent = `${origin} → ${dest} · ${formatDisplayDate(date)} · ${paxLabel} · ${rtLabel}`;

  content.innerHTML = `
    <h2>${cityName}</h2>
    <p>✈️ ${origin} → ${dest} &nbsp;|&nbsp; 📅 ${formatDisplayDate(date)} &nbsp;|&nbsp; 👤 ${paxLabel}</p>
    <div id="weather-badge" style="margin-top:12px; font-weight:500; font-size:0.95rem; display:inline-flex; align-items:center; gap:6px; padding:6px 14px; background:rgba(0,0,0,0.6); border-radius:30px; backdrop-filter:blur(6px); color:#fff; border:1px solid rgba(255,255,255,0.2);">Fetching weather... ⛅</div>
  `;

  fetchWeather(cityName).then(data => {
    const targetDate = new Date(date).toISOString().split('T')[0];
    const forecasts = data.list || [];

    let matched = forecasts.find(f => f.dt_txt.startsWith(targetDate) && f.dt_txt.includes("12:00"));
    if (!matched) matched = forecasts.find(f => f.dt_txt.startsWith(targetDate));

    if (!matched) matched = forecasts[0];

    if (matched) {
       const icon = matched.weather[0].icon;
       const condition = matched.weather[0].main;
       const temp = Math.round(matched.main.temp);
       const isExactDate = matched.dt_txt.startsWith(targetDate);
       const datePrefix = isExactDate ? "" : "Current: ";

       document.getElementById("weather-badge").innerHTML = `
         <img src="https://openweathermap.org/img/wn/${icon}.png" style="width:24px;height:24px;margin-left:-6px;" alt="${condition}">
         <span>${datePrefix}${temp}°C, ${condition}</span>
       `;
    }
  }).catch(e => {
     document.getElementById("weather-badge").style.display = "none";
     console.error("Weather error:", e);
  });

  const photoUrl = await getDestinationPhoto(`${cityName} travel landmark`, 1400);
  if (photoUrl) {
    const img    = document.createElement("img");
    img.src      = photoUrl;
    img.alt      = cityName;
    img.className = "dest-bg";
    img.loading  = "lazy";
    img.onload   = () => img.classList.add("loaded");
    hero.prepend(img);
  }
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"2-digit" });
}

async function renderPriceCalendar(originSkyId, originEntityId, destSkyId, destEntityId, activeDate) {
  const section = document.getElementById("price-calendar-section");
  const strip   = document.getElementById("price-calendar-strip");
  if (!section || !strip) return;

  try {
    const res = await skyScrapper("/api/v1/flights/getPriceCalendar", {
      originSkyId, destinationSkyId: destSkyId,
      originEntityId, destinationEntityId: destEntityId,
      currency: "USD",
    });
    if (!res.ok) return;
    const json = await res.json();
    const days = json.data?.flights?.days;
    if (!days || days.length === 0) return;

    const activeDateObj  = new Date(activeDate);
    const nearbyDays     = days
      .filter(d => {
        const diff = Math.abs(new Date(d.day) - activeDateObj) / 86400000;
        return diff <= 7;
      })
      .sort((a, b) => new Date(a.day) - new Date(b.day))
      .slice(0, 10);

    if (!nearbyDays.length) return;

    const minPrice = Math.min(...nearbyDays.map(d => d.price));

    strip.innerHTML = nearbyDays.map(d => {
      const isActive   = d.day === activeDate;
      const isCheapest = d.price === minPrice;
      const label      = new Date(d.day + "T00:00:00")
        .toLocaleDateString("en-GB", { weekday:"short", day:"numeric", month:"short" });
      return `
        <div class="cal-day${isActive ? " active" : ""}" onclick="navigateToDate('${d.day}')">
          <span class="cal-date">${label}</span>
          <span class="cal-price${isCheapest ? " cheapest" : ""}" data-usd="${Math.round(d.price)}">$${Math.round(d.price)}</span>
        </div>`;
    }).join("");

    section.style.display = "block";
  } catch (e) {
    console.warn("[price-calendar] failed:", e.message);
  }
}

function navigateToDate(newDate) {
  const params = new URLSearchParams(window.location.search);
  params.set("date", newDate);
  window.location.search = params.toString();
}

window.onload = async function () {
  const origin     = getQueryParam("origin");
  const dest       = getQueryParam("dest");
  const date       = getQueryParam("date");
  const returnDate = getQueryParam("returnDate") || "";
  const passengers = parseInt(getQueryParam("passengers") || "1", 10);
  const tripType   = getQueryParam("tripType") || "one-way";

  const originName = getQueryParam("originName") || origin;
  const destName   = getQueryParam("destName") || dest;

  let originSkyId       = getQueryParam("originSkyId")       || origin;
  let originEntityId    = getQueryParam("originEntityId")     || "";
  let destSkyId         = getQueryParam("destSkyId")         || dest;
  let destEntityId      = getQueryParam("destEntityId")       || "";
  let destHotelEntityId = getQueryParam("destHotelEntityId") || "";

  const flightTitle = document.getElementById("flight-section");
  const hotelTitle  = document.getElementById("hotel-section");
  if (flightTitle) flightTitle.textContent = `✈️ Flights: ${originName} → ${destName}`;
  if (hotelTitle)  hotelTitle.textContent  = `🏨 Hotels in ${destName}`;

  const cityName = destName;

  renderDestHero(cityName, origin, dest, date, passengers, tripType);

  if (!origin || !dest || !date) {
    document.getElementById("flight-results-container").innerHTML =
      `<div class="no-results"><p>No search parameters. <a href="home.html">← Go back</a></p></div>`;
    return;
  }

  renderSkeletons("flight-results-container", 3);
  renderSkeletons("hotel-results-container", 3);

  if (!originEntityId || !destEntityId) {
    const [oData, dData] = await Promise.all([
      !originEntityId ? resolveEntityId(origin) : Promise.resolve({ skyId: originSkyId, entityId: originEntityId }),
      !destEntityId   ? resolveEntityId(dest)   : Promise.resolve({ skyId: destSkyId, entityId: destEntityId, hotelEntityId: destHotelEntityId }),
    ]);
    if (!originEntityId) { originSkyId = oData.skyId; originEntityId = oData.entityId; }
    if (!destEntityId)   { destSkyId   = dData.skyId; destEntityId   = dData.entityId; destHotelEntityId = dData.hotelEntityId || dData.entityId; }
  }

  renderPriceCalendar(originSkyId, originEntityId, destSkyId, destEntityId, date);

  if (tripType === "round-trip" && returnDate) {
    const returnSection = document.getElementById("return-flight-section");
    if (returnSection) {
      returnSection.style.display = "block";
      const rTitle = returnSection.querySelector("h2");
      if (rTitle) rTitle.textContent = `↩️ Return Flights: ${dest} → ${origin}`;
      renderSkeletons("return-flight-results-container", 3);
    }
  }

  const fetches = [
    fetchFlightData(originSkyId, originEntityId, destSkyId, destEntityId, date, passengers),
    fetchHotels(destHotelEntityId || destEntityId, dest, date, cityName),
  ];

  if (tripType === "round-trip" && returnDate) {
    fetches.push(
      fetchFlightData(destSkyId, destEntityId, originSkyId, originEntityId, returnDate, passengers, true)
    );
  }

  await Promise.all(fetches);
};

async function fetchFlightData(originSkyId, originEntityId, destSkyId, destEntityId, date, passengers = 1, isReturn = false) {
  const containerId = isReturn ? "return-flight-results-container" : "flight-results-container";
  const container   = document.getElementById(containerId);
  if (!container) return;

  try {
    const res = await serpApiFetch("google_flights", {
      departure_id: originSkyId,
      arrival_id: destSkyId,
      outbound_date: date,
      type: "2",
      currency: "USD",
      hl: "en",
      adults: String(passengers)
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    const data = json.best_flights || json.other_flights;
    if (!data || data.length === 0) {
      container.innerHTML = `
        <div class="no-results">
          <h3>✈️ No flights found for this route.</h3>
          <p>Try a future date or different airport codes.</p>
          <a href="home.html">← Change Search</a>
        </div>`;
      return;
    }

    const itineraries = data.map(offer => {
      const flightLegs = offer.flights || [];
      const first = flightLegs[0] || {};
      const last = flightLegs[flightLegs.length - 1] || {};

      const priceRaw = offer.price || 0;

      return {
        price: { raw: priceRaw, formatted: `$${priceRaw}` },
        legs: [{
          carriers: { marketing: [{ name: offer.airline || first.airline || "Airline", logoUrl: offer.airline_logo }] },
          origin: { displayCode: first.departure_airport?.id || originSkyId },
          destination: { displayCode: last.arrival_airport?.id || destSkyId },
          stopCount: flightLegs.length > 0 ? flightLegs.length - 1 : 0,
          durationInMinutes: offer.total_duration || offer.duration || 0,
          departure: first.departure_airport?.time,
          arrival: last.arrival_airport?.time
        }]
      };
    });

    const sorted = itineraries.sort((a, b) => a.price.raw - b.price.raw);
    if (!isReturn) {
      cheapestFlight = sorted[0].price.raw;
      updateTripTotal();
    }

    renderFlightCards(sorted.slice(0, 10), containerId, destSkyId, destEntityId, originSkyId, originEntityId, date);

  } catch (err) {
    console.error("[flight] Error:", err);
    container.innerHTML = `
      <div class="no-results">
        <h3 style="color:#e74c3c;">⚠️ Flight search failed</h3>
        <p>${err.message}</p>
        <a href="home.html" style="color:#FF7300;font-weight:600;">← Try again</a>
        <br><button class="retry-btn" onclick="location.reload()">🔄 Retry</button>
      </div>`;
  }
}

async function fetchHotels(hotelEntityId, cityName, checkinDate, displayCity) {
  const container = document.getElementById("hotel-results-container");
  if (!container) return;

  const checkout = (() => {
    const d = new Date(checkinDate);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  })();

  const destCity = `${getQueryParam("dest")} Airport`;

  try {
    const res = await serpApiFetch("google_hotels", {
      q: destCity,
      check_in_date: checkinDate,
      check_out_date: checkout,
      currency: "USD",
      hl: "en",
      adults: "1"
    });

    if (!res.ok) throw new Error("Could not find hotels for this city.");

    const json = await res.json();
    const hotelList = json.properties || [];

    if (hotelList.length === 0) {
      container.innerHTML = `
        <div class="no-results">
          <p>No hotels found for <b>${destCity}</b>.</p>
          <p style="font-size:.85rem;color:#999;">Try a nearby major city.</p>
        </div>`;
      return;
    }

    const hotels = hotelList.slice(0, 9).map(h => {
       const amount = h.rate_per_night?.extracted_lowest || h.total_rate?.extracted_lowest || 0;
       const formatted = h.rate_per_night?.lowest || h.total_rate?.lowest || "Call for rates";
       return {
         name: h.name,
         stars: h.extracted_hotel_class || 4,
         price: { lead: { amount, formatted } },
         images: h.images?.map(img => img.original_image || img.thumbnail) || [],
         reviewScore: h.overall_rating ? h.overall_rating.toFixed(1) : undefined,
         reviewCount: h.reviews || 0
       };
    }).filter(h => h.price.lead.amount > 0);

    if (hotels.length) {
      const prices = hotels.map(h => h.price.lead.amount);
      averageHotel = prices.reduce((a, b) => a + b, 0) / prices.length;
      updateTripTotal();
    }

    renderHotelCards(hotels, destCity);

  } catch (err) {
    console.error("[hotels] Error:", err);
    container.innerHTML = `
      <div class="no-results">
        <h3 style="color:#e74c3c;">⚠️ Hotel data unavailable</h3>
        <p>${err.message}</p>
        <button class="retry-btn" onclick="location.reload()">🔄 Retry</button>
      </div>`;
  }
}

function renderFlightCards(itineraries, containerId, destSkyId, destEntityId, originSkyId, originEntityId, date) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = itineraries.map(flight => {
    const leg      = flight.legs?.[0];
    if (!leg) return "";

    const airline  = leg.carriers?.marketing?.[0]?.name    || "Airline";
    const logo     = leg.carriers?.marketing?.[0]?.logoUrl || "";
    const origin   = leg.origin?.displayCode               || "–";
    const dest     = leg.destination?.displayCode          || "–";
    const stopCount = leg.stopCount || 0;
    const stopsLabel = stopCount === 0 ? "Direct" : `${stopCount} stop${stopCount > 1 ? "s" : ""}`;
    const isDirect = stopCount === 0;

    const durMin   = leg.durationInMinutes || 0;
    const duration = `${Math.floor(durMin / 60)}h ${durMin % 60}m`;
    const depTime  = leg.departure ? new Date(leg.departure).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "–";
    const arrTime  = leg.arrival   ? new Date(leg.arrival).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "–";
    const price    = flight.price?.formatted || `$${(flight.price?.raw || 0).toFixed(0)}`;
    const priceRaw = flight.price?.raw || 0;

    const gFlightsUrl = `https://www.google.com/travel/flights/search?tfs=CBwQAhoeEgoyMDI2LTA0LTE2agwIAhIIL20vMDJtNzNyDAgCEggvbS8wMm03Mw`;

    return `
    <div class="flight-card">
      <div class="card-body">
        <div class="airline-logo-row">
          ${logo ? `<img src="${logo}" alt="${airline}" class="airline-logo">` : ""}
          <h3 class="airline-name">${airline}</h3>
          <span class="stops-badge${isDirect ? " direct" : ""}">${stopsLabel}</span>
        </div>

        <div class="flight-timeline">
          <div class="time-block">
            <span class="time">${depTime}</span>
            <span class="code">${origin}</span>
          </div>
          <div class="timeline-line">
            <span class="duration-label">${duration}</span>
            <div class="timeline-track"></div>
            <span class="stops-label">${stopsLabel}</span>
          </div>
          <div class="time-block">
            <span class="time">${arrTime}</span>
            <span class="code">${dest}</span>
          </div>
        </div>
      </div>

      <div class="card-footer-row">
        <span class="price-tag" data-usd="${priceRaw}">${price}<sub>/person</sub></span>
        <a class="action-btn" href="${gFlightsUrl}" target="_blank" rel="noopener">Book Flight ↗</a>
      </div>
    </div>`;
  }).join("");
}

async function renderHotelCards(hotels, cityName) {
  const container = document.getElementById("hotel-results-container");
  if (!container) return;

  const hotelImages = await Promise.all(hotels.map(async (hotel) => {
    const apiImg = hotel.images?.[0]?.url;
    if (apiImg) return apiImg;
    return await getDestinationPhoto(`${hotel.name} ${cityName} hotel`, 600);
  }));

  container.innerHTML = hotels.map((hotel, i) => {
    const name      = hotel.name    || "Hotel";
    const starCount = Math.min(hotel.stars || 0, 5);
    const stars     = "★".repeat(starCount) + "☆".repeat(5 - starCount);
    const score     = hotel.reviewScore ? `${hotel.reviewScore}/10` : "";
    const reviews   = hotel.reviewCount ? `(${hotel.reviewCount.toLocaleString()} reviews)` : "";
    const price     = hotel.price?.lead?.formatted
                   || (hotel.price?.lead?.amount ? `$${hotel.price.lead.amount.toFixed(0)}` : "Call for rates");
    const imgUrl    = hotelImages[i] || "";

    return `
    <div class="hotel-card">
      <div class="hotel-img-wrapper">
        ${imgUrl
          ? `<img src="${imgUrl}" alt="${name}" loading="lazy">`
          : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#003580,#0055bb);display:flex;align-items:center;justify-content:center;color:#fff;font-size:2.5rem;">🏨</div>`
        }
        ${score ? `<div class="hotel-rating-badge">⭐ ${score}</div>` : ""}
      </div>
      <div class="card-body">
        <h3 class="airline-name">${name}</h3>
        <div class="hotel-stars">${stars}</div>
        ${reviews ? `<p class="hotel-reviews">${reviews}</p>` : ""}
        <div class="card-footer-row">
          <span class="price-tag" data-usd="${hotel.price?.lead?.amount || 0}">${price}<sub>/night</sub></span>
          <button class="action-btn" onclick="alert('${name.replace(/'/g, "\\'")} — ${price}/night\\n\\nBook directly on the hotel website or via your preferred travel agent.')">View Rooms</button>
        </div>
      </div>
    </div>`;
  }).join("");
}
