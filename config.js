
const RAPIDAPI_KEY  = "7e90256250msh042bf6cc04c7646p1f9e26jsn811955505bf4";
const RAPIDAPI_HOST = "sky-scrapper.p.rapidapi.com";

const SERPAPI_KEY = "25973e21c3c7592cfa8389199020cc93e6e9da80a165bd3ae45f67c99687eeac";

async function serpApiFetch(engine, params = {}) {
  const qs = new URLSearchParams({ engine, api_key: SERPAPI_KEY, ...params }).toString();
  const targetUrl = `https://serpapi.com/search.json?${qs}`;

  const isLocal = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
  const proxyEndpoint = isLocal ? "http://127.0.0.1:8080/?url=" : "/api/serp?url=";

  const res = await fetch(proxyEndpoint + encodeURIComponent(targetUrl));
  if (!res.ok) throw new Error("API Proxy Server Failed");

  return res;
}

const OPENWEATHER_API_KEY = "d5b577bd59fd079350e6dcce3e6b2a47";

async function fetchWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${OPENWEATHER_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather fetch failed");
  return res.json();
}

const UNSPLASH_ACCESS_KEY = "4MCGUy1Vbigt-uPHnGcQ4B6n4HzkTDVtANdN74ieq2I";

const _unsplashCache = new Map();

async function getDestinationPhoto(query, width = 800) {
  const cacheKey = `${query}_${width}`;
  if (_unsplashCache.has(cacheKey)) return _unsplashCache.get(cacheKey);

  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query + " travel")}&per_page=1&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`;
    const res  = await fetch(url);
    if (res.ok) {
      const json  = await res.json();
      const photo = json.results?.[0];
      if (photo) {
        const imageUrl = `${photo.urls.raw}&w=${width}&q=80&fit=crop&auto=format`;
        _unsplashCache.set(cacheKey, imageUrl);
        return imageUrl;
      }
    }
  } catch (err) {

    console.info("[Unsplash] API blocked (likely localhost), using source.unsplash.com");
  }

  const fallbackUrl = "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1400&auto=format&fit=crop";
  _unsplashCache.set(cacheKey, fallbackUrl);
  return fallbackUrl;
}

function skyScrapper(endpoint, params = {}) {
  const qs  = new URLSearchParams(params).toString();
  const url = `https://${RAPIDAPI_HOST}${endpoint}${qs ? "?" + qs : ""}`;
  return fetch(url, {
    headers: {
      "X-RapidAPI-Key":  RAPIDAPI_KEY,
      "X-RapidAPI-Host": RAPIDAPI_HOST,
    },
  });
}

const EXCHANGE_RATES = { USD: 1, INR: 90.58, EUR: 0.93, GBP: 0.79 };
function convertCurrency(amountUSD, toCurrency) {
  return amountUSD * (EXCHANGE_RATES[toCurrency] || 1);
}