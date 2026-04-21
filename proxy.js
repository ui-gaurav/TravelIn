const http = require('http');
const https = require('https');

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const searchParams = new URL(req.url, `http://${req.headers.host}`).searchParams;
  const targetUrlStr = searchParams.get('url');

  if (!targetUrlStr) {
    res.writeHead(400);
    res.end('Missing url param');
    return;
  }

  https.get(targetUrlStr, { headers: { 'User-Agent': 'TravelIn-Local-Proxy/1.0' } }, (apiRes) => {

    delete apiRes.headers['access-control-allow-origin'];
    delete apiRes.headers['content-security-policy'];
    delete apiRes.headers['x-frame-options'];

    Object.keys(apiRes.headers).forEach(key => {
      res.setHeader(key, apiRes.headers[key]);
    });
    res.writeHead(apiRes.statusCode);
    apiRes.pipe(res);
  }).on('error', (err) => {
    res.writeHead(500);
    res.end(err.message);
  });
}).listen(8080, () => {
  console.log('TravelIn local CORS proxy running on http://127.0.0.1:8080');
});
