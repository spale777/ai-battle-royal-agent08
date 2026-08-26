const http = require('http');
const fs = require('fs');
const path = require('path');
const { generateOGImage } = require('./og-generator');

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
  '.xml': 'application/xml',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
};

// ===== Single source of truth for all tools =====
// To add a new tool: add one entry here, create the HTML file, add a card to index.html.
// Nav links, server routes, and TOOLS array in app.js all derive from this.
const TOOLS = [
  { route: '/lab',           file: 'lab.html',           name: 'Lab' },
  { route: '/fractal',       file: 'fractal.html',       name: 'Fractal' },
  { route: '/reaction',      file: 'reaction.html',      name: 'Reaction' },
  { route: '/lissajous',     file: 'lissajous.html',     name: 'Lissajous' },
  { route: '/spirograph',    file: 'spirograph.html',    name: 'Spirograph' },
  { route: '/particle-life', file: 'particle-life.html', name: 'Life' },
  { route: '/noise',         file: 'perlin.html',        name: 'Noise' },
  { route: '/cellular',      file: 'cellular.html',      name: 'Automata' },
  { route: '/voronoi',       file: 'voronoi.html',       name: 'Voronoi' },
  { route: '/metaballs',     file: 'metaballs.html',     name: 'Metaballs' },
  { route: '/attract',       file: 'attract.html',       name: 'Attractors' },
  { route: '/wave',          file: 'wave.html',          name: 'Waves' },
  { route: '/lsystem',       file: 'lsystem.html',       name: 'L-Systems' },
  { route: '/physarum',      file: 'physarum.html',      name: 'Physarum' },
  { route: '/maze',          file: 'maze.html',          name: 'Maze' },
  { route: '/boids',         file: 'boids.html',         name: 'Boids' },
  { route: '/dla',           file: 'dla.html',           name: 'DLA' },
  { route: '/fluid',         file: 'fluid.html',         name: 'Fluid' },
  { route: '/colonization',  file: 'colonization.html',  name: 'Colonization' },
  { route: '/zen',           file: 'zen.html',           name: 'Zen' },
  { route: '/resources',     file: 'resources.html',     name: 'Resources' },
];

// Build route lookup map: '/lab' -> 'lab.html', '/lab/' -> 'lab.html'
const routeMap = {};
for (const tool of TOOLS) {
  routeMap[tool.route] = tool.file;
  routeMap[tool.route + '/'] = tool.file;
}

// Generate canonical nav HTML (used for nav replacement in tool pages)
function generateNav(currentRoute) {
  const links = TOOLS.map(tool => {
    const active = tool.route === currentRoute ? ' class="active"' : '';
    return `        <a href="${tool.route}"${active}>${tool.name}</a>`;
  }).join('\n');
  return `      <a href="/" class="nav-logo">◈ <span>agent-08</span></a>
      <button class="nav-toggle" id="nav-toggle" aria-label="Menu">☰</button>
      <div class="nav-links">
        <a href="/">Gallery</a>
${links}
      </div>`;
}

// Inject nav into HTML: replace nav-logo + nav-links block
function injectNav(html, currentRoute) {
  const navPattern = /(<a href="\/" class="nav-logo">[\s\S]*?<\/a>)(\s*<div class="nav-links">[\s\S]*?<\/div>)/;
  const match = html.match(navPattern);
  if (match) {
    const newNav = generateNav(currentRoute);
    html = html.replace(navPattern, newNav);
  }
  // Inject Twitter card meta tags if not already present
  if (!html.includes('twitter:card')) {
    const title = html.match(/<title>(.*?)<\/title>/);
    const desc = html.match(/<meta name="description" content="(.*?)"/);
    const toolName = title ? title[1].replace(/\s*[—–]\s*agent-08.*$/, '').trim() : 'Digital Art Lab';
    const toolDesc = desc ? desc[1] : 'Interactive generative art experiment by agent-08.';
    const ogImage = html.match(/<meta property="og:image" content="(.*?)"/);
    const imageUrl = ogImage ? ogImage[1] : 'https://agent-08.sklopocija.com/images/hero.png';
    const twitterTags = `  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${toolName} — agent-08 Digital Art Lab">
  <meta name="twitter:description" content="${toolDesc}">
  <meta name="twitter:image" content="${imageUrl}">`;
    html = html.replace(/(<meta name="theme-color"[^>]*>)/, `$1\n${twitterTags}`);
  }
  // Inject OG image for tool pages
  if (currentRoute && currentRoute !== '/') {
    const ogUrl = `https://agent-08.sklopocija.com/og${currentRoute}`;
    // Replace existing og:image or add one
    if (html.includes('og:image')) {
      html = html.replace(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${ogUrl}">`);
    } else {
      html = html.replace(/(<meta property="og:url"[^>]*>)/, `$1\n  <meta property="og:image" content="${ogUrl}">`);
    }
    if (html.includes('twitter:image')) {
      html = html.replace(/<meta name="twitter:image" content="[^"]*">/, `<meta name="twitter:image" content="${ogUrl}">`);
    }
  }
  return html; // No nav found (e.g., 404.html)
}

function serveFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME_TYPES[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, data) => {
    if (err) {
      const notFoundPath = path.join(PUBLIC_DIR, '404.html');
      fs.readFile(notFoundPath, (err404, data404) => {
        if (err404) {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end('<h1>404 Not Found</h1>');
        } else {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end(data404);
        }
      });
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

  // OG image generation endpoint: /og/lab, /og/fractal, etc.
  const ogMatch = urlPath.match(/^\/og\/([a-z-]+)$/);
  if (ogMatch) {
    try {
      const buf = generateOGImage('/' + ogMatch[1]);
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
      });
      res.end(buf);
    } catch (err) {
      console.error('OG generation error:', err);
      res.writeHead(500);
      res.end('Error generating image');
    }
    return;
  }

  // Check route map
  if (routeMap[urlPath]) {
    const filePath = path.join(PUBLIC_DIR, routeMap[urlPath]);
    // For HTML tool pages, inject canonical nav
    if (routeMap[urlPath].endsWith('.html')) {
      fs.readFile(filePath, (err, data) => {
        if (err) {
          serveFile(res, filePath);
          return;
        }
        const html = data.toString();
        const navInjected = injectNav(html, urlPath.replace(/\/$/, ''));
        res.writeHead(200, {
          'Content-Type': 'text/html',
          'Cache-Control': 'public, max-age=3600',
        });
        res.end(navInjected);
      });
      return;
    }
    serveFile(res, filePath);
    return;
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
      serveFile(res, filePath);
      return;
    }
    serveFile(res, filePath);
  });
});

server.listen(PORT, () => {
  console.log(`✨ Digital Art Lab running on port ${PORT}`);
});
