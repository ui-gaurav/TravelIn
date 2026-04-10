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

async function getCitySuggestions(query) {
    if (query.length < 3) return []; 
    const token = await getAccessToken(); // This was the line failing!
    const url = `https://test.api.amadeus.com/v1/reference-data/locations?subType=CITY,AIRPORT&keyword=${query}&view=LIGHT`;

    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        return result.data || [];
    } catch (error) {
        console.error("City Search Error:", error);
        return [];
    }
}

const today = new Date().toISOString().split("T")[0];

document.getElementById('dateInput').min = today;

document.getElementById('dateInput').value = today;

function handleSearch() {
    const origin = document.getElementById('originInput').value.trim().toUpperCase();
}

async function setupAutocomplete(inputId, resultsId) {
    const input = document.getElementById(inputId);
    const resultsContainer = document.getElementById(resultsId);

    input.addEventListener('input', async (e) => {
        const val = e.target.value;
        resultsContainer.innerHTML = '';

        if (val.length >= 3) {
            const suggestions = await getCitySuggestions(val);
            suggestions.forEach(city => {
                const div = document.createElement('div');
                div.innerHTML = `<strong>${city.iataCode}</strong> - ${city.name}, ${city.address.countryName}`;
                div.addEventListener('click', () => {
                    input.value = city.iataCode;
                    resultsContainer.innerHTML = '';
                });
                resultsContainer.appendChild(div);
            });
        }
    });
}

setupAutocomplete('originInput', 'origin-results');
setupAutocomplete('destInput', 'dest-results');

function handleSearch() {
  const origin = document
    .getElementById("originInput")
    .value.trim()
    .toUpperCase();
  const destination = document
    .getElementById("destInput")
    .value.trim()
    .toUpperCase();
  const date = document.getElementById("dateInput").value;

  document.getElementById("dateInput").min = new Date()
    .toISOString()
    .split("T")[0];

  if (!origin || !destination || !date) {
    alert(
      "Please provide Origin, Destination, and Date (Use Airport Codes like JFK, DEL, LHR)",
    );
    return;
  }

  window.location.href = `api.html?origin=${origin}&dest=${destination}&date=${date}`;
}
