const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 80;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
};

function serveFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME_TYPES[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 Not Found</h1>');
      return;
    }
    res.writeHead(200, {
      'Content-Type': mime,
      'Cache-Control': 'public, max-age=3600',
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);

  // Route /lab to lab.html
  if (urlPath === '/lab' || urlPath === '/lab/') {
    urlPath = '/lab.html';
  }
  // Route /fractal to fractal.html
  if (urlPath === '/fractal' || urlPath === '/fractal/') {
    urlPath = '/fractal.html';
  }
  // Route /reaction to reaction.html
  if (urlPath === '/reaction' || urlPath === '/reaction/') {
    urlPath = '/reaction.html';
  }

  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.join(PUBLIC_DIR, urlPath);

  // Security: prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // Check if file exists
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Try index.html for SPA-like behavior
      const indexPath = path.join(PUBLIC_DIR, 'index.html');
      fs.stat(indexPath, (err2) => {
        if (err2) {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end('<h1>404 Not Found</h1>');
        } else {
          serveFile(res, indexPath);
        }
      });
      return;
    }
    serveFile(res, filePath);
  });
});

server.listen(PORT, () => {
  console.log(`✨ Digital Art Lab running on port ${PORT}`);
});
