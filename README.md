# ✈️ TravelIn — Live Flight & Hotel Search Platform

> A full-stack travel web application that lets users search real-time flights and hotels, powered by live APIs.

![TravelIn Banner](https://travel-in-taupe.vercel.app/deckchairs-355596_1280.jpeg)

---

## 🌐 Live Demo

**[travel-in-taupe.vercel.app](https://travel-in-taupe.vercel.app)**

---

## 📋 Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [APIs Used](#apis-used)
- [How It Works](#how-it-works)
- [Pages](#pages)
- [Lighthouse Scores](#lighthouse-scores)
- [Known Limitations](#known-limitations)
- [Future Improvements](#future-improvements)
- [Project Info](#project-info)

---

## 🧭 About the Project

**TravelIn** is a travel discovery platform where users can:
- Search flights between any two cities
- View live hotel listings at the destination
- See real-time weather at the destination
- Get an estimated total trip cost (flight + hotel combined)

Built as a **micro project for 2nd semester** at **Madhav Institute of Technology & Science (MITS), Gwalior** — but designed and developed to production-level standards.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 **Live Flight Search** | Real-time flights via Google Flights data through SerpAPI |
| 🏨 **Hotel Discovery** | Live hotel listings with ratings, reviews & pricing |
| 🌤️ **Destination Weather** | Current weather shown for the destination city |
| 💰 **Trip Cost Estimator** | Auto-calculates cheapest flight + avg hotel/night |
| 🌙 **Dark Mode** | Toggle between light and dark themes |
| 💱 **Currency Display** | Prices displayed in INR (₹) |
| 📤 **Share Trip** | Share your search results via a link |
| ↩️ **One-way & Round-trip** | Supports both trip types |
| 🖼️ **Destination Hero** | Dynamic destination photo pulled from Unsplash |

---

## 🛠️ Tech Stack

```
Frontend        →  HTML5, CSS3, Vanilla JavaScript
Deployment      →  Vercel
APIs            →  SerpAPI, OpenWeatherMap, Unsplash
Data Flow       →  URL Query Parameters (client-side routing)
```

**No frameworks. No backend server. No database.**
Everything runs client-side — pure HTML, CSS, and JavaScript.

---

## 🔌 APIs Used

### 1. SerpAPI — Google Flights & Hotels
- Fetches live flight results from **Google Flights**
- Fetches live hotel listings from **Google Hotels**
- Returns structured JSON with prices, airlines, durations, ratings
- **Endpoint used:** `GET /search?engine=google_flights` and `engine=google_hotels`

### 2. OpenWeatherMap API
- Fetches **current weather** at the destination city
- Displays temperature and condition in the destination hero banner

### 3. Unsplash API
- Fetches a **high-quality destination photo** based on the city name
- Used as the dynamic hero background on the results page

---

## ⚙️ How It Works

```
User fills search form (home.html)
        ↓
Search params passed via URL query string
        ↓
api.html reads URL params using URLSearchParams
        ↓
Parallel API calls fired:
  ├── SerpAPI → Google Flights  (flight cards)
  ├── SerpAPI → Google Hotels   (hotel cards)
  ├── OpenWeatherMap            (weather badge)
  └── Unsplash                  (hero image)
        ↓
Results rendered dynamically into the DOM
```

### URL Structure
```
/api.html
  ?origin=DXB
  &originName=Dubai
  &dest=DEL
  &destName=New+Delhi
  &date=2026-04-17
  &originSkyId=DXB
  &originEntityId=95673643
  &destSkyId=DEL
  &destEntityId=95673567
  &destHotelEntityId=27536952
  &tripType=one-way
  &passengers=1
```

---

## 📄 Pages

### `index.html` — Landing Page
- Full-screen hero with tagline *"Take Off — Your journey starts here"*
- Single CTA button → navigates to home.html

### `home.html` — Search Page
- Navbar with embedded flight search form
- One-way / Round-trip toggle
- Origin & destination city autocomplete (SerpAPI airport search)
- Date picker + passenger count
- Destination discovery section, features, and about us

### `api.html` — Results Page
- Dynamic destination hero image + weather
- Trip cost summary bar (cheapest flight + avg hotel/night + total)
- Flight cards: airline, times, duration, price, Book button
- Hotel cards: photo, name, rating, reviews, price/night, View Rooms button
- Flights / Hotels tab switcher
- Currency selector + Share button

---

## 📊 Lighthouse Scores

Tested on `home.html` via Chrome DevTools Lighthouse:

| Category | Score |
|---|---|
| ⚡ Performance | **96 / 100** |
| ♿ Accessibility | **91 / 100** |
| ✅ Best Practices | **77 / 100** |
| 🔍 SEO | **100 / 100** |

> SEO score of 100 means all meta tags, headings, and page structure are perfectly optimized.

---

## ⚠️ Known Limitations

| Issue | Reason |
|---|---|
| Hotel images are generic | Unsplash returns destination/airport photos, not property-specific images (hotel image API requires paid tier) |
| Hotels shown are mostly airport hotels | SerpAPI Google Hotels query uses airport entity ID — city-center hotels need a different entity ID |
| Currency symbol flicker | Race condition between API response and currency state initialization — fix: initialize INR symbol before fetch resolves |
| No flight sorting/filtering | Not implemented in this version |
| Privacy Policy page is placeholder | Linked in footer but not yet created |

---

## 🚀 Future Improvements

- [ ] Fix currency symbol race condition
- [ ] Add hotel city-center search (non-airport entity IDs)
- [ ] Implement flight sorting (by price / duration / departure)
- [ ] Add round-trip flight results support
- [ ] Add multi-passenger pricing
- [ ] Cookie consent banner (GDPR compliance)
- [ ] Mobile responsive improvements for navbar search bar
- [ ] Skeleton loading states for API cards

---

## 👨‍💻 Project Info

| Field | Detail |
|---|---|
| **Project Type** | Micro Project |
| **Semester** | 2nd Semester |
| **Institute** | Madhav Institute of Technology & Science (MITS), Gwalior |
| **Deployment** | Vercel |
| **Year** | 2026 |

---

## 📁 File Structure

```
TravelIn/
├── index.html          # Landing page
├── home.html           # Search page with navbar form
├── api.html            # Results page (flights + hotels)
├── style.css           # Global styles (dark theme)
├── home.css            # Home page specific styles
├── api.css             # Results page specific styles
├── home.js             # Search logic, autocomplete
├── api.js              # API calls, DOM rendering
└── deckchairs-355596_1280.jpeg   # Hero image asset
```

---

## 📜 Credits

- Flight & Hotel data — [SerpAPI](https://serpapi.com) (Google Flights/Hotels)
- Weather data — [OpenWeatherMap](https://openweathermap.org)
- Destination photos — [Unsplash](https://unsplash.com)
- Hosted on — [Vercel](https://vercel.com)

---

> *"Built for learning. Deployed like production."*
