// ===== Lightbox =====
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxTitle = document.getElementById('lightbox-title');
const lightboxDesc = document.getElementById('lightbox-desc');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxTool = document.getElementById('lightbox-tool');
document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('click', () => {
    lightboxImg.src = item.dataset.src;
    lightboxTitle.textContent = item.dataset.title;
    lightboxDesc.textContent = item.dataset.desc;
    if (item.dataset.tool) {
      lightboxTool.href = item.dataset.tool;
      lightboxTool.textContent = 'Try this tool → ' + (item.dataset.toolName || item.dataset.tool);
      lightboxTool.style.display = 'inline-block';
    } else {
      lightboxTool.style.display = 'none';
    }
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}
lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

// ===== Footer time =====
function updateFooterTime() {
  const el = document.getElementById('footer-time');
  if (el) {
    const now = new Date();
    el.textContent = now.toLocaleString('en-US', { 
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
    });
  }
}
updateFooterTime();
setInterval(updateFooterTime, 60000);

// ===== Smooth scroll for nav =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// ===== Intersection Observer for fade-in =====
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animationPlayState = 'running';
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.gallery-item, .about-card, .mood-card').forEach(el => {
  el.style.animationPlayState = 'paused';
  observer.observe(el);
});

// ===== Nav scroll effect =====
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const nav = document.querySelector('.nav');
  const currentScroll = window.pageYOffset;
  if (currentScroll > 100) {
    nav.style.borderBottomColor = 'rgba(255,255,255,0.08)';
  } else {
    nav.style.borderBottomColor = 'rgba(255,255,255,0.06)';
  }
  lastScroll = currentScroll;
});

// ===== Random tool navigation =====
const TOOLS = ['/lab', '/fractal', '/reaction', '/lissajous', '/spirograph', '/particle-life', '/noise', '/cellular', '/voronoi', '/metaballs', '/attract', '/wave', '/lsystem', '/physarum', '/maze', '/boids', '/dla', '/fluid', '/colonization'];
function openRandomTool(e) {
  if (e) e.preventDefault();
  const pick = TOOLS[Math.floor(Math.random() * TOOLS.length)];
  window.location.href = pick;
}
const surpriseBtn = document.getElementById('surprise-btn');
if (surpriseBtn) surpriseBtn.addEventListener('click', openRandomTool);
const surpriseCard = document.getElementById('surprise-card');
if (surpriseCard) surpriseCard.addEventListener('click', openRandomTool);

// ===== Mood Picker =====
(function() {
  const moodGrid = document.getElementById('moods-grid');
  const toolsGrid = document.getElementById('tools-grid');
  if (!moodGrid || !toolsGrid) return;
  
  const allCards = moodGrid.querySelectorAll('.mood-card');
  const toolCards = toolsGrid.querySelectorAll('.tool-card');
  let activeMood = null;

  // Build route→card map
  const routeToCard = {};
  toolCards.forEach(card => {
    const href = card.getAttribute('href');
    if (href) routeToCard[href] = card;
  });

  allCards.forEach(card => {
    card.addEventListener('click', () => {
      const mood = card.dataset.mood;
      const routes = card.dataset.tools.split(',').map(r => '/' + r.trim());
      
      if (activeMood === mood) {
        // Deselect
        activeMood = null;
        card.classList.remove('active');
        toolCards.forEach(tc => {
          tc.style.opacity = '';
          tc.style.transform = '';
          tc.style.boxShadow = '';
        });
        return;
      }
      
      // Select this mood
      activeMood = mood;
      allCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      
      // Highlight matching tools, dim others
      toolCards.forEach(tc => {
        const href = tc.getAttribute('href');
        if (routes.includes(href) && !tc.classList.contains('tool-card-soon')) {
          tc.style.opacity = '1';
          tc.style.transform = 'translateY(-3px)';
          tc.style.boxShadow = '0 8px 32px rgba(74,127,255,0.15)';
          tc.style.borderColor = 'rgba(126,184,255,0.3)';
        } else if (!tc.classList.contains('tool-card-soon')) {
          tc.style.opacity = '0.3';
          tc.style.transform = '';
          tc.style.boxShadow = '';
          tc.style.borderColor = '';
        }
      });
      
      // Smooth scroll to tools grid
      toolsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();

// ===== Mobile nav toggle =====
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.querySelector('.nav-links');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    navToggle.textContent = navLinks.classList.contains('open') ? '✕' : '☰';
  });
  // Close menu when clicking a link
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.textContent = '☰';
    });
  });
}
