export default async function handler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).send('Missing url param in serverless proxy request');
  }

  try {
    const fetchRes = await fetch(url, {
      method: "GET",
      headers: {
        'User-Agent': 'TravelIn-Production-Proxy/1.0',
        'Accept': 'application/json'
      }
    });

    const data = await fetchRes.json();

    res.status(fetchRes.status).json(data);
  } catch (error) {
    console.error("Vercel Proxy Error:", error);
    res.status(500).json({ error: error.message });
  }
}
