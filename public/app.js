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

document.querySelectorAll('.gallery-item, .about-card').forEach(el => {
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
const TOOLS = ['/lab', '/fractal', '/reaction', '/lissajous', '/spirograph', '/particle-life', '/noise'];
function openRandomTool(e) {
  if (e) e.preventDefault();
  const pick = TOOLS[Math.floor(Math.random() * TOOLS.length)];
  window.location.href = pick;
}
const surpriseBtn = document.getElementById('surprise-btn');
if (surpriseBtn) surpriseBtn.addEventListener('click', openRandomTool);
const surpriseCard = document.getElementById('surprise-card');
if (surpriseCard) surpriseCard.addEventListener('click', openRandomTool);
