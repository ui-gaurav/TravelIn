# ✈️ TravelIn — Live Flight & Hotel Search Platform

> A travel web app that searches real-time flights and hotels, shows live destination weather, and estimates your total trip cost — all powered by live APIs, zero frameworks.

![TravelIn Hero](https://travel-in-taupe.vercel.app/travelinhero.avif)

---

## 🌐 Live Demo

**🔗 [travel-in-taupe.vercel.app](https://travel-in-taupe.vercel.app)**

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [File Structure](#file-structure)
- [APIs Used](#apis-used)
- [How It Works](#how-it-works)
- [Pages](#pages)
- [Lighthouse Scores](#lighthouse-scores)
- [Known Limitations](#known-limitations)
- [Future Improvements](#future-improvements)
- [Project Info](#project-info)

---

## 🧭 About

**TravelIn** is a client-side travel discovery platform. Users can:

- 🔍 Search flights between any two cities with live prices
- 🏨 Browse hotel listings at their destination
- 🌤️ See real-time weather at the destination
- 💰 Get an instant trip cost estimate (cheapest flight + avg hotel/night)

Built as a **2nd semester micro project** at **MITS Gwalior** — but engineered to production-level standards with live APIs, a Lighthouse performance score of **96**, and a perfect SEO score of **100**.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 **Live Flight Search** | Real-time Google Flights data via SerpAPI |
| 🏨 **Hotel Discovery** | Live Google Hotels listings with ratings, reviews & nightly pricing |
| 🌤️ **Destination Weather** | Current weather badge pulled from OpenWeatherMap |
| 💰 **Trip Cost Estimator** | Auto-calculates cheapest flight + avg hotel cost |
| 🏙️ **Dynamic Destination Hero** | City photo from Unsplash based on destination name |
| 🌙 **Dark / Light Mode** | Theme toggle with smooth transition |
| 💱 **Currency Display** | Prices in INR (₹) with selector |
| 📤 **Share Trip** | Shareable results link |
| ✈️ **One-way & Round-trip** | Supports both trip types |
| 🔎 **Airport Autocomplete** | City/airport search powered by SerpAPI |

---

## 🛠️ Tech Stack

```
Frontend     →  HTML5, CSS3, Vanilla JavaScript
Deployment   →  Vercel
APIs         →  SerpAPI · OpenWeatherMap · Unsplash
Routing      →  URL Query Parameters (URLSearchParams)
Proxy        →  /api/ serverless functions (Vercel)
```

> **No frameworks. No build tools. No database.**
> Pure HTML + CSS + JS, deployed as a static site with Vercel serverless API routes for secure key handling.

---

## 📁 File Structure

```
TravelIn/
│
├── index.html                   # Landing page — hero + CTA
├── home.html                    # Search page — navbar form, discover section
├── api.html                     # Results page — flights, hotels, weather
│
├── style.css                    # Landing page styles
├── home.css                     # Home/search page styles
├── api.css                      # Results page styles
│
├── script.js                    # Landing page interactions
├── search.js                    # Autocomplete & search form logic
├── config.js                    # API config / constants
├── proxy.js                     # Client-side proxy helper
│
├── api/                         # Vercel serverless functions (API proxy)
│   └── ...                      # Secure API key handlers
│
├── travelinhero.avif            # Hero image (landing page)
├── traveliniconplane.svg        # Plane icon (branding)
├── deckchairs-355596_1280.jpeg  # Beach hero image
│
├── .gitignore
├── .gitattributes
└── desktop.ini
```

> **Why the `/api` folder?**
> API keys are never exposed in client-side JS. Vercel serverless functions in `/api` act as a secure proxy — the browser calls `/api/flights`, which then calls SerpAPI server-side with the key hidden.

---

## 🔌 APIs Used

### 1. 🔍 SerpAPI — Google Flights & Hotels
- Queries **Google Flights** for real-time flight prices, airlines, durations
- Queries **Google Hotels** for listings with ratings, reviews, and nightly rates
- Accessed securely through Vercel `/api` serverless proxy

### 2. 🌤️ OpenWeatherMap
- Fetches **current weather** for the destination city
- Displayed as a badge on the results hero (e.g. *"40°C, Clouds"*)

### 3. 🖼️ Unsplash
- Fetches a **high-quality city photo** based on destination name
- Used as the dynamic background on the results page hero

---

## ⚙️ How It Works

```
User fills search form on home.html
            ↓
Form data encoded into URL query string
            ↓
api.html reads params via URLSearchParams
            ↓
Parallel fetch calls fired to /api/* serverless routes
  ├── /api → SerpAPI Google Flights   →  Flight cards
  ├── /api → SerpAPI Google Hotels    →  Hotel cards
  ├── OpenWeatherMap API              →  Weather badge
  └── Unsplash API                    →  Hero image
            ↓
DOM updated dynamically with real results
```

### Example URL
```
/api.html
  ?origin=DXB&originName=Dubai
  &dest=DEL&destName=New+Delhi
  &date=2026-04-17
  &originSkyId=DXB&originEntityId=95673643
  &destSkyId=DEL&destEntityId=95673567
  &destHotelEntityId=27536952
  &tripType=one-way&passengers=1
```

---

## 📄 Pages

### `index.html` — Landing
- Full-screen AVIF hero with animated tagline
- Single *"Explore Now"* CTA → `home.html`

### `home.html` — Search
- Persistent navbar with embedded flight search form
- One-way / Round-trip toggle
- Airport autocomplete (SerpAPI)
- Date picker + passenger counter
- Popular routes, features section, about section

### `api.html` — Results
- Destination hero with Unsplash photo + live weather
- **Trip summary bar** — cheapest flight · avg hotel/night · total trip cost
- Flight cards — airline logo, times, duration, direct badge, price, Book CTA
- Hotel cards — photo, name, star rating, review score + count, price/night, View Rooms CTA
- Flights ↔ Hotels tab switcher
- Currency selector · Share button · Back button

---

## 📊 Lighthouse Scores

> Tested on `home.html` — Chrome DevTools Lighthouse

| Category | Score | |
|---|---|---|
| ⚡ Performance | **96 / 100** | 🟢 |
| ♿ Accessibility | **91 / 100** | 🟢 |
| ✅ Best Practices | **77 / 100** | 🟠 |
| 🔍 SEO | **100 / 100** | 🟢 |

---

## ⚠️ Known Limitations

| Issue | Details |
|---|---|
| Generic hotel images | Unsplash returns city/airport photos — property images need a paid hotel image API |
| Airport-area hotels | Google Hotels entity ID is airport-based — needs city-center entity ID for broader results |
| Currency symbol flicker | Race condition: INR symbol sometimes renders as `$` before state initializes |
| No sorting / filtering | Flights can't be sorted by price or duration yet |
| Privacy Policy | Footer link is a placeholder — page not yet created |

---

## 🚀 Future Improvements

- [ ] Fix currency symbol race condition (initialize `₹` before fetch)
- [ ] Use city-center hotel entity IDs for broader hotel results
- [ ] Flight sorting — by price · duration · departure time
- [ ] Round-trip results rendering
- [ ] Skeleton loading cards during API fetch
- [ ] Cookie consent banner
- [ ] Mobile-optimized navbar search bar

---

## 👨‍💻 Project Info

| | |
|---|---|
| **Type** | Micro Project |
| **Semester** | 2nd Semester |
| **Institute** | Madhav Institute of Technology & Science (MITS), Gwalior |
| **Deployed on** | Vercel |
| **Languages** | JavaScript 49% · CSS 35% · HTML 16% |
| **Year** | 2026 |

---

## 📜 Credits

| Service | Usage |
|---|---|
| [SerpAPI](https://serpapi.com) | Google Flights & Hotels data |
| [OpenWeatherMap](https://openweathermap.org) | Live destination weather |
| [Unsplash](https://unsplash.com) | Destination photography |
| [Vercel](https://vercel.com) | Hosting + serverless API proxy |

---

<div align="center">

**[🌐 Live Demo](https://travel-in-taupe.vercel.app)** · **[📂 Repository](https://github.com/ui-gaurav/TravelIn)**

*"Built for learning. Deployed like production."*

</div>
