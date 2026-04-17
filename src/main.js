
/* ── Scroll reveals ── */
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
  });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

/* ── Hero parallax on mousemove ── */
const heroBlob = document.querySelector('.hero-blob');
const heroBgWord = document.querySelector('.hero-bg-word');
document.addEventListener('mousemove', e => {
  const mx = (e.clientX / window.innerWidth - 0.5);
  const my = (e.clientY / window.innerHeight - 0.5);
  if (heroBlob) heroBlob.style.transform = `translate(${mx*20}px,${my*20}px)`;
  if (heroBgWord) heroBgWord.style.transform = `translate(${mx*-12}px,${my*-8}px)`;
});

/* ── Scroll handlers (merged into one listener) ── */
const nav = document.getElementById('nav');
const progressBar = document.getElementById('progress-bar');
const stickyBar = document.getElementById('sticky-bar');
let scrollTotal = document.body.scrollHeight - window.innerHeight;
new ResizeObserver(() => { scrollTotal = document.body.scrollHeight - window.innerHeight; }).observe(document.body);
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  nav.classList.toggle('scrolled', y > 60);
  progressBar.style.width = (y / scrollTotal * 100) + '%';
  stickyBar.classList.toggle('show', y > 600);
}, {passive: true});


/* ── Hero card step animation ── */
(function() {
  const steps = document.querySelectorAll('.card-step');
  if (!steps.length) return;
  steps.forEach((step, i) => {
    setTimeout(() => step.classList.add('visible'), 600 + i * 400);
  });
  // Loop — replay every 6s
  setInterval(() => {
    steps.forEach(s => s.classList.remove('visible'));
    setTimeout(() => {
      steps.forEach((step, i) => {
        setTimeout(() => step.classList.add('visible'), i * 400);
      });
    }, 300);
  }, 6000 + steps.length * 400);
})();

/* ── Hero reveals ── */
setTimeout(() => {
  document.querySelectorAll('#hero .reveal').forEach(el => el.classList.add('in'));
}, 150);

function scrollToEl(sel) {
  document.querySelector(sel)?.scrollIntoView({behavior:'smooth'});
}

/* ──────────────────────────────────────────
   SCROLL & INTERACTION ANIMATIONS
────────────────────────────────────────── */
gsap.registerPlugin(ScrollTrigger);





/* ── Focus trap utility ── */
function trapFocus(container, onEscape) {
  const focusable = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';
  function handler(e) {
    if (e.key === 'Escape') { onEscape(); return; }
    if (e.key !== 'Tab') return;
    const els = [...container.querySelectorAll(focusable)].filter(el => !el.closest('[hidden]'));
    if (!els.length) return;
    const first = els[0], last = els[els.length - 1];
    if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
      e.preventDefault();
      (e.shiftKey ? last : first).focus();
    }
  }
  document.addEventListener('keydown', handler);
  return () => document.removeEventListener('keydown', handler);
}

/* ── Mobile nav ── */
let _mobileNavTrapCleanup = null;
function toggleMobileNav() {
  const ham = document.getElementById('nav-ham');
  const mobileNav = document.getElementById('mobile-nav');
  ham.classList.toggle('open');
  mobileNav.classList.toggle('open');
  const isOpen = mobileNav.classList.contains('open');
  mobileNav.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
  document.body.style.overflow = isOpen ? 'hidden' : '';
  if (isOpen) {
    const firstLink = mobileNav.querySelector('a,button');
    if (firstLink) firstLink.focus();
    _mobileNavTrapCleanup = trapFocus(mobileNav, toggleMobileNav);
  } else {
    if (_mobileNavTrapCleanup) { _mobileNavTrapCleanup(); _mobileNavTrapCleanup = null; }
    document.getElementById('nav-ham').focus();
  }
}


/* ── Hero particle canvas ── */
(function() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) { canvas.style.display = 'none'; return; }

  const ctx = canvas.getContext('2d');
  let particles = [];
  let W, H;
  let paused = false;

  function resize() {
    const hero = document.getElementById('hero');
    W = canvas.width = hero.offsetWidth;
    H = canvas.height = hero.offsetHeight;
  }
  resize();
  new ResizeObserver(resize).observe(document.getElementById('hero'));

  const count = window.innerWidth < 768 ? 40 : 90;
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.4 + 0.3,
      dx: (Math.random() - 0.5) * 0.25,
      dy: (Math.random() - 0.5) * 0.25,
      o: Math.random() * 0.45 + 0.08,
      hue: Math.random() > 0.5 ? '123,151,255' : '56,196,232'
    });
  }

  function draw() {
    if (paused) return;
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      const px = p.x * W, py = p.y * H;
      ctx.beginPath();
      ctx.arc(px, py, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.hue},${p.o})`;
      ctx.fill();
      p.x += p.dx / W; p.y += p.dy / H;
      if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0;
      if (p.y < 0) p.y = 1; if (p.y > 1) p.y = 0;
    });
    requestAnimationFrame(draw);
  }

  document.addEventListener('visibilitychange', () => {
    paused = document.hidden;
    if (!paused) draw();
  });

  draw();
})();

/* ── Count-up animation ── */
function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 2000;
  const start = performance.now();
  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const countObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting && !e.target.dataset.counted) {
      e.target.dataset.counted = '1';
      animateCount(e.target);
    }
  });
}, {threshold: 0.5});
document.querySelectorAll('[data-count]').forEach(el => countObs.observe(el));

function showToast(data) {
  const toastContainer = document.getElementById('toast-container');
  if (!toastContainer || !data) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<div class="toast-body"><div class="toast-name">${data.name}</div><div class="toast-action">${data.action}</div></div>`;
  toastContainer.appendChild(el);
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show')));
  setTimeout(() => {
    el.classList.add('hide');
    setTimeout(() => el.remove(), 700);
  }, 4500);
}

/* ── FAQ accordion ── */
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(i => {
    i.classList.remove('open');
    i.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
  });
  if (!isOpen) {
    item.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  }
}


/* ── Exit intent ── */
let exitShown = false;
let _exitTriggerEl = null;
let _exitTrapCleanup = null;

function openExit() {
  const modal = document.getElementById('exit-modal');
  modal.classList.add('show');
  _exitTriggerEl = document.activeElement;
  const firstFocusable = modal.querySelector('input,button');
  if (firstFocusable) firstFocusable.focus();
  _exitTrapCleanup = trapFocus(modal, closeExit);
}

document.addEventListener('mouseleave', e => {
  if (e.clientY <= 5 && !exitShown) {
    exitShown = true;
    openExit();
  }
});

function closeExit() {
  document.getElementById('exit-modal').classList.remove('show');
  if (_exitTrapCleanup) { _exitTrapCleanup(); _exitTrapCleanup = null; }
  if (_exitTriggerEl) { _exitTriggerEl.focus(); _exitTriggerEl = null; }
}

/* Replace with your Formspree form ID — sign up free at formspree.io, create a form, paste the ID here */
const FORMSPREE_ID = 'YOUR_FORM_ID';

async function submitExit() {
  const emailEl = document.getElementById('exit-email');
  const email = emailEl.value.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    emailEl.style.borderColor = 'rgba(255,80,80,.6)';
    return;
  }
  try {
    await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
      method: 'POST',
      body: JSON.stringify({ email, _source: 'exit-modal' }),
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
    });
  } catch {}
  closeExit();
}

/* ── Lead form submit ── */
async function submitLead(e) {
  e.preventDefault();
  const form = e.target;
  const inputs = form.querySelectorAll('.lead-input[required]');
  let valid = true;
  inputs.forEach(input => {
    const empty = !input.value.trim();
    const badEmail = input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
    if (empty || badEmail) {
      input.style.borderColor = 'rgba(255,80,80,.6)';
      valid = false;
    } else {
      input.style.borderColor = '';
    }
  });
  if (!valid) return;

  const btn = form.querySelector('button[type="submit"]');
  const originalText = btn.textContent;
  btn.textContent = 'Sending…';
  btn.disabled = true;

  try {
    const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      document.getElementById('lead-form-wrap').style.display = 'none';
      document.getElementById('form-success').style.display = 'block';
    } else {
      btn.textContent = 'Try again';
      btn.disabled = false;
    }
  } catch {
    btn.textContent = 'Try again';
    btn.disabled = false;
  }
}

/* ── Magnetic button effect ── */
document.querySelectorAll('.btn-fill, .btn-ghost, .nav-cta').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * 0.2;
    const y = (e.clientY - r.top - r.height / 2) * 0.2;
    btn.style.transform = `translate(${x}px, ${y}px) translateY(-2px)`;
  });
  btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
});


/* ── GSAP hero parallax on scroll ── */
gsap.to('.hero-left', {
  y: -60,
  ease: 'none',
  scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 }
});
gsap.to('.hero-right', {
  y: -30,
  ease: 'none',
  scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 }
});
gsap.to('.hero-bg-word', {
  y: 120,
  ease: 'none',
  scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1.5 }
});

/* ── Expose functions to global scope for inline onclick handlers ── */
window.scrollToEl = scrollToEl;
window.toggleMobileNav = toggleMobileNav;
window.toggleFaq = toggleFaq;
window.submitLead = submitLead;
window.closeExit = closeExit;
window.submitExit = submitExit;

