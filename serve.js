// Nova local dev server — run with: node serve.js
const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.swf':  'application/x-shockwave-flash',
};

http.createServer((req, res) => {
  // default to home.html
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/home.html';

  const filePath = path.join(ROOT, decodeURIComponent(urlPath));

  // basic path traversal guard
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found: ' + urlPath);
      return;
    }
    const ext  = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': mime,
      // allow iframes on the same origin
      'X-Frame-Options': 'SAMEORIGIN',
    });
    res.end(data);
  });
}).listen(PORT, () => {
  console.log(`Nova running at http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop.');
});
