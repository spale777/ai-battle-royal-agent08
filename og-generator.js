// OG Image Generator — creates unique 1200×630 preview images per tool
const { createCanvas, registerFont } = require('canvas');
const path = require('path');

// Color themes per tool: [bg, accent1, accent2, accent3]
const THEMES = {
  lab:          { bg: '#0a0a1a', colors: ['#4060ff', '#60a0ff', '#80c0ff'], pattern: 'flow' },
  fractal:      { bg: '#0a0a14', colors: ['#ff4080', '#ff60a0', '#ffa0c0'], pattern: 'spiral' },
  reaction:     { bg: '#0a0f0a', colors: ['#40c040', '#80e080', '#c0ffc0'], pattern: 'spots' },
  lissajous:    { bg: '#0a0a14', colors: ['#6040ff', '#a060ff', '#c0a0ff'], pattern: 'curve' },
  spirograph:   { bg: '#0a0a14', colors: ['#ff6040', '#ff8060', '#ffa080'], pattern: 'spiro' },
  'particle-life': { bg: '#0f0a0a', colors: ['#ff40a0', '#ff80c0', '#ffc0e0'], pattern: 'dots' },
  noise:        { bg: '#0a0a0f', colors: ['#4080c0', '#60a0e0', '#80c0ff'], pattern: 'terrain' },
  cellular:     { bg: '#0a0f0a', colors: ['#40c080', '#60e0a0', '#80ffc0'], pattern: 'grid' },
  voronoi:      { bg: '#0a0a14', colors: ['#8060ff', '#a080ff', '#c0a0ff'], pattern: 'cells' },
  metaballs:    { bg: '#0f0a0f', colors: ['#c040ff', '#e060ff', '#ff80ff'], pattern: 'blobs' },
  attract:      { bg: '#0a0a0f', colors: ['#ff6020', '#ff8040', '#ffa060'], pattern: 'attractor' },
  wave:         { bg: '#0a0a14', colors: ['#20a0ff', '#40c0ff', '#80e0ff'], pattern: 'waves' },
  lsystem:      { bg: '#0a0f0a', colors: ['#40c040', '#80e060', '#c0ff80'], pattern: 'tree' },
  physarum:     { bg: '#0a0f0a', colors: ['#80c040', '#a0e060', '#c0ff80'], pattern: 'network' },
  maze:         { bg: '#0a0a14', colors: ['#6040e0', '#8060ff', '#a080ff'], pattern: 'labyrinth' },
  boids:        { bg: '#0a0a14', colors: ['#40a0e0', '#60c0ff', '#80e0ff'], pattern: 'flock' },
  dla:          { bg: '#0a0a14', colors: ['#40c0ff', '#80e0ff', '#c0ffff'], pattern: 'branch' },
  fluid:        { bg: '#0a0a0f', colors: ['#ff4060', '#ff6080', '#ff80a0'], pattern: 'swirl' },
  colonization: { bg: '#0a0f0a', colors: ['#80c040', '#a0e060', '#c0ff80'], pattern: 'colonize' },
};

// Simple seeded PRNG for reproducible patterns
function mulberry32(seed) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function generateOGImage(toolRoute) {
  const route = toolRoute.replace(/^\//, '');
  const theme = THEMES[route] || THEMES.lab;
  const W = 1200, H = 630;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  const rand = mulberry32(route.split('').reduce((a, c) => a + c.charCodeAt(0), 0));

  // Background
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, W, H);

  // Draw pattern
  const [c1, c2, c3] = theme.colors.map(hexToRgb);
  ctx.globalAlpha = 0.3;

  switch (theme.pattern) {
    case 'flow':
      for (let i = 0; i < 80; i++) {
        const y = rand() * H;
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x < W; x += 10) {
          ctx.lineTo(x, y + Math.sin(x * 0.01 + rand() * 6) * 40 + Math.cos(x * 0.005 + rand() * 3) * 20);
        }
        const t = rand();
        ctx.strokeStyle = `rgba(${c1.r},${c1.g},${c1.b},${0.15 + t * 0.2})`;
        ctx.lineWidth = 1 + rand() * 2;
        ctx.stroke();
      }
      break;

    case 'spiral':
      for (let s = 0; s < 5; s++) {
        const cx = W * 0.5 + (rand() - 0.5) * 200;
        const cy = H * 0.5 + (rand() - 0.5) * 100;
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 12; a += 0.05) {
          const r = a * 8 + rand() * 2;
          const x = cx + Math.cos(a) * r;
          const y = cy + Math.sin(a) * r;
          a === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(${c1.r},${c1.g},${c1.b},${0.2 + rand() * 0.15})`;
        ctx.lineWidth = 1 + rand();
        ctx.stroke();
      }
      break;

    case 'spots':
      for (let i = 0; i < 200; i++) {
        const x = rand() * W;
        const y = rand() * H;
        const r = 3 + rand() * 15;
        const ci = [c1, c2, c3][Math.floor(rand() * 3)];
        ctx.fillStyle = `rgba(${ci.r},${ci.g},${ci.b},${0.2 + rand() * 0.3})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      break;

    case 'curve':
      for (let s = 0; s < 8; s++) {
        const a = 2 + rand() * 4;
        const b = 3 + rand() * 4;
        const phase = rand() * Math.PI * 2;
        const scale = 150 + rand() * 100;
        ctx.beginPath();
        for (let t = 0; t <= Math.PI * 2; t += 0.01) {
          const x = W / 2 + Math.sin(a * t + phase) * scale;
          const y = H / 2 + Math.cos(b * t) * scale;
          t === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(${c1.r},${c1.g},${c1.b},${0.15 + rand() * 0.2})`;
        ctx.lineWidth = 1 + rand() * 1.5;
        ctx.stroke();
      }
      break;

    case 'spiro':
      const R = 120 + rand() * 60;
      for (let k = 0; k < 4; k++) {
        const r2 = R * (0.3 + rand() * 0.5);
        const d = r2 * (0.5 + rand() * 1.5);
        ctx.beginPath();
        for (let t = 0; t < Math.PI * 20; t += 0.02) {
          const x = W / 2 + (R - r2) * Math.cos(t) + d * Math.cos((R - r2) / r2 * t);
          const y = H / 2 + (R - r2) * Math.sin(t) - d * Math.sin((R - r2) / r2 * t);
          t === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        const ci = [c1, c2, c3][k % 3];
        ctx.strokeStyle = `rgba(${ci.r},${ci.g},${ci.b},${0.12 + rand() * 0.15})`;
        ctx.lineWidth = 0.8 + rand();
        ctx.stroke();
      }
      break;

    case 'dots':
      for (let i = 0; i < 300; i++) {
        const x = rand() * W;
        const y = rand() * H;
        const r = 1 + rand() * 3;
        const ci = [c1, c2, c3][Math.floor(rand() * 3)];
        ctx.fillStyle = `rgba(${ci.r},${ci.g},${ci.b},${0.3 + rand() * 0.5})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      break;

    case 'terrain':
      for (let row = 0; row < 30; row++) {
        const y0 = row * (H / 30);
        ctx.beginPath();
        ctx.moveTo(0, y0);
        for (let x = 0; x < W; x += 8) {
          const n = Math.sin(x * 0.008 + row * 0.5) * 30 + Math.sin(x * 0.003 + row * 0.2) * 50 + rand() * 10;
          ctx.lineTo(x, y0 + n);
        }
        const t = row / 30;
        ctx.strokeStyle = `rgba(${c1.r},${c1.g},${c1.b},${0.1 + t * 0.2})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      break;

    case 'grid':
      const gs = 20;
      for (let gx = 0; gx < W / gs; gx++) {
        for (let gy = 0; gy < H / gs; gy++) {
          if (rand() > 0.55) {
            const ci = [c1, c2, c3][Math.floor(rand() * 3)];
            ctx.fillStyle = `rgba(${ci.r},${ci.g},${ci.b},${0.2 + rand() * 0.4})`;
            ctx.fillRect(gx * gs + 1, gy * gs + 1, gs - 2, gs - 2);
          }
        }
      }
      break;

    case 'cells': {
      const pts = [];
      for (let i = 0; i < 40; i++) pts.push({ x: rand() * W, y: rand() * H });
      for (const pt of pts) {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c1.r},${c1.g},${c1.b},0.5)`;
        ctx.fill();
        // Voronoi-like lines
        for (const pt2 of pts) {
          if (pt === pt2) continue;
          const mx = (pt.x + pt2.x) / 2;
          const my = (pt.y + pt2.y) / 2;
          ctx.beginPath();
          ctx.arc(mx, my, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${c2.r},${c2.g},${c2.b},0.2)`;
          ctx.fill();
        }
      }
      break;
    }

    case 'blobs':
      for (let i = 0; i < 12; i++) {
        const x = 100 + rand() * (W - 200);
        const y = 100 + rand() * (H - 200);
        const r = 40 + rand() * 80;
        const ci = [c1, c2, c3][i % 3];
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, `rgba(${ci.r},${ci.g},${ci.b},0.3)`);
        grad.addColorStop(1, `rgba(${ci.r},${ci.g},${ci.b},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      break;

    case 'attractor': {
      let x = 0.1, y = 0.1;
      const a = -1.4, b = 1.6, c = 1.0, d = 0.7;
      ctx.beginPath();
      for (let i = 0; i < 50000; i++) {
        const nx = Math.sin(a * y) + c * Math.cos(a * x);
        const ny = Math.sin(b * x) + d * Math.cos(b * y);
        x = nx; y = ny;
        const px = W / 2 + x * 100;
        const py = H / 2 + y * 100;
        if (px >= 0 && px < W && py >= 0 && py < H) {
          ctx.fillStyle = `rgba(${c1.r},${c1.g},${c1.b},0.03)`;
          ctx.fillRect(px, py, 1.5, 1.5);
        }
      }
      break;
    }

    case 'waves':
      for (let s = 0; s < 6; s++) {
        const cx = rand() * W;
        const cy = rand() * H;
        for (let r = 10; r < 400; r += 15) {
          const ci = [c1, c2, c3][s % 3];
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${ci.r},${ci.g},${ci.b},${0.08 + (1 - r / 400) * 0.15})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      break;

    case 'tree': {
      function branch(x, y, angle, len, depth) {
        if (depth <= 0 || len < 5) return;
        const ex = x + Math.cos(angle) * len;
        const ey = y + Math.sin(angle) * len;
        const t = depth / 8;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = `rgba(${c1.r + (c2.r - c1.r) * (1 - t)},${c1.g + (c2.g - c1.g) * (1 - t)},${c1.b + (c2.b - c1.b) * (1 - t)},${0.15 + t * 0.25})`;
        ctx.lineWidth = depth * 0.8;
        ctx.stroke();
        branch(ex, ey, angle - 0.3 - rand() * 0.3, len * 0.7, depth - 1);
        branch(ex, ey, angle + 0.3 + rand() * 0.3, len * 0.7, depth - 1);
      }
      branch(W / 2, H - 50, -Math.PI / 2, 80, 8);
      break;
    }

    case 'network':
      for (let i = 0; i < 60; i++) {
        const x1 = rand() * W, y1 = rand() * H;
        for (let j = 0; j < 3; j++) {
          const x2 = x1 + (rand() - 0.5) * 300;
          const y2 = y1 + (rand() - 0.5) * 200;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = `rgba(${c1.r},${c1.g},${c1.b},${0.08 + rand() * 0.15})`;
          ctx.lineWidth = 0.5 + rand() * 1.5;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(x2, y2, 2 + rand() * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${c2.r},${c2.g},${c2.b},${0.2 + rand() * 0.3})`;
          ctx.fill();
        }
      }
      break;

    case 'labyrinth':
      for (let y = 0; y < H; y += 12) {
        for (let x = 0; x < W; x += 12) {
          if (rand() > 0.4) {
            ctx.fillStyle = `rgba(${c1.r},${c1.g},${c1.b},${0.06 + rand() * 0.12})`;
            if (rand() > 0.5) {
              ctx.fillRect(x, y, 12, 2);
            } else {
              ctx.fillRect(x, y, 2, 12);
            }
          }
        }
      }
      break;

    case 'flock':
      for (let i = 0; i < 150; i++) {
        const x = rand() * W;
        const y = rand() * H;
        const angle = rand() * Math.PI * 2;
        const size = 3 + rand() * 5;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(size, 0);
        ctx.lineTo(-size, -size * 0.6);
        ctx.lineTo(-size, size * 0.6);
        ctx.closePath();
        const ci = [c1, c2, c3][Math.floor(rand() * 3)];
        ctx.fillStyle = `rgba(${ci.r},${ci.g},${ci.b},${0.15 + rand() * 0.3})`;
        ctx.fill();
        ctx.restore();
      }
      break;

    case 'branch': {
      let x = W / 2, y = H / 2;
      ctx.fillStyle = `rgba(${c1.r},${c1.g},${c1.b},0.4)`;
      ctx.fillRect(x, y, 2, 2);
      for (let i = 0; i < 8000; i++) {
        let wx = rand() * W;
        let wy = rand() * H;
        const dx = wx - x, dy = wy - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 10) {
          x += dx * 0.1;
          y += dy * 0.1;
          ctx.fillStyle = `rgba(${c1.r},${c1.g},${c1.b},${0.04})`;
          ctx.fillRect(x, y, 1.5, 1.5);
        } else {
          x = wx; y = wy;
        }
      }
      break;
    }

    case 'swirl':
      for (let i = 0; i < 20; i++) {
        const cx = W * 0.3 + rand() * W * 0.4;
        const cy = H * 0.3 + rand() * H * 0.4;
        for (let r = 10; r < 120; r += 5) {
          const ci = [c1, c2, c3][i % 3];
          const angle = r * 0.1 + rand() * 0.5;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(angle) * r * 0.3, cy + Math.sin(angle) * r * 0.3, r, 0, Math.PI * 0.8);
          ctx.strokeStyle = `rgba(${ci.r},${ci.g},${ci.b},${0.05 + (1 - r / 120) * 0.1})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
      break;

    case 'colonize':
      for (let i = 0; i < 200; i++) {
        const x = rand() * W;
        const y = rand() * H;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c3.r},${c3.g},${c3.b},${0.15 + rand() * 0.2})`;
        ctx.fill();
      }
      for (let i = 0; i < 30; i++) {
        let x = W / 2 + (rand() - 0.5) * 100;
        let y = H - 30;
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let s = 0; s < 20; s++) {
          x += (rand() - 0.5) * 30;
          y -= 10 + rand() * 10;
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(${c1.r},${c1.g},${c1.b},${0.15 + rand() * 0.2})`;
        ctx.lineWidth = 1 + rand() * 2;
        ctx.stroke();
      }
      break;
  }

  ctx.globalAlpha = 1;

  // Dark gradient overlay at bottom for text readability
  const grad = ctx.createLinearGradient(0, H * 0.4, 0, H);
  grad.addColorStop(0, 'rgba(10,10,15,0)');
  grad.addColorStop(0.6, 'rgba(10,10,15,0.6)');
  grad.addColorStop(1, 'rgba(10,10,15,0.95)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Tool name
  const toolNames = {
    lab: 'Flow Field', fractal: 'Fractal Explorer', reaction: 'Reaction-Diffusion',
    lissajous: 'Lissajous Curves', spirograph: 'Spirograph',
    'particle-life': 'Particle Life', noise: 'Perlin Noise',
    cellular: 'Cellular Automata', voronoi: 'Voronoi',
    metaballs: 'Metaballs', attract: 'Strange Attractors',
    wave: 'Wave Interference', lsystem: 'L-Systems',
    physarum: 'Physarum', maze: 'Maze Generator',
    boids: 'Boids', dla: 'Diffusion-Limited Aggregation',
    fluid: 'Fluid Simulation', colonization: 'Space Colonization',
  };
  const name = toolNames[route] || 'Digital Art Lab';

  // Title text
  ctx.font = 'bold 52px -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
  const titleGrad = ctx.createLinearGradient(80, H - 180, 80 + ctx.measureText(name).width, H - 180);
  titleGrad.addColorStop(0, `rgb(${c1.r},${c1.g},${c1.b})`);
  titleGrad.addColorStop(1, `rgb(${c2.r},${c2.g},${c2.b})`);
  ctx.fillStyle = titleGrad;
  ctx.fillText(name, 80, H - 120);

  // Subtitle
  ctx.font = '24px -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(200,200,210,0.8)';
  ctx.fillText('agent-08 · Digital Art Lab', 80, H - 75);

  // Decorative line
  const lineGrad = ctx.createLinearGradient(80, 0, 300, 0);
  lineGrad.addColorStop(0, `rgba(${c1.r},${c1.g},${c1.b},0.6)`);
  lineGrad.addColorStop(1, `rgba(${c1.r},${c1.g},${c1.b},0)`);
  ctx.fillStyle = lineGrad;
  ctx.fillRect(80, H - 100, 220, 2);

  // Small ◈ logo
  ctx.font = '20px -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
  ctx.fillStyle = `rgba(${c1.r},${c1.g},${c1.b},0.5)`;
  ctx.fillText('◈', 80, 45);

  return canvas.toBuffer('image/png');
}

module.exports = { generateOGImage };
