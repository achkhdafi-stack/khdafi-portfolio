'use strict';

/* ==========================================================
   EFFECTS.JS
   Custom cursor, aurora/spotlight glow, floating particles,
   scroll-reveal, navbar active indicator, preloader, and
   project card tilt (VanillaTilt).

   Every feature here checks for its DOM hooks before running,
   and the heavier visual effects are skipped automatically on
   touch devices and for people with "reduce motion" turned on
   in their OS — so nothing breaks the site if a CDN script
   fails to load or the visitor has motion preferences set.
   ========================================================== */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasFinePointer       = window.matchMedia('(pointer: fine)').matches;


/* ==========================================================
   1. PRELOADER
   ========================================================== */

(function preloader() {
  const pre = document.getElementById('preloader');
  if (!pre) return;

  const MIN_VISIBLE_MS = 700; // keep it on screen long enough to read, not feel laggy
  const startedAt = Date.now();

  const hide = () => {
    const elapsed = Date.now() - startedAt;
    const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
    setTimeout(() => {
      pre.classList.add('loaded');
      setTimeout(() => pre.remove(), 600);
    }, wait);
  };

  if (document.readyState === 'complete') {
    hide();
  } else {
    window.addEventListener('load', hide);
  }
})();


/* ==========================================================
   2. CUSTOM CURSOR
   ========================================================== */

(function customCursor() {
  if (!hasFinePointer || prefersReducedMotion) return;

  const dot     = document.getElementById('cursorDot');
  const outline = document.getElementById('cursorOutline');
  if (!dot || !outline) return;

  document.body.classList.add('has-custom-cursor');

  window.addEventListener('mousemove', (e) => {
    dot.style.left = e.clientX + 'px';
    dot.style.top  = e.clientY + 'px';
    outline.style.left = e.clientX + 'px';
    outline.style.top  = e.clientY + 'px';
  });

  document.addEventListener('mousedown', () => outline.style.transform = 'translate(-50%, -50%) scale(0.85)');
  document.addEventListener('mouseup',   () => outline.style.transform = 'translate(-50%, -50%) scale(1)');

  // hide while the pointer leaves the window
  document.documentElement.addEventListener('mouseleave', () => {
    dot.classList.add('cursor-hide');
    outline.classList.add('cursor-hide');
  });
  document.documentElement.addEventListener('mouseenter', () => {
    dot.classList.remove('cursor-hide');
    outline.classList.remove('cursor-hide');
  });

  // cards → outline grows + tints green
  const cardSelector = '.service-item, .project-item, .testimonials-item, .tool-item, .tools-item, .cert-card';
  document.querySelectorAll(cardSelector).forEach((el) => {
    el.addEventListener('mouseenter', () => outline.classList.add('cursor-hover-card'));
    el.addEventListener('mouseleave', () => outline.classList.remove('cursor-hover-card'));
  });

  // links / buttons → outline becomes a soft square
  const linkSelector = 'a, button';
  document.querySelectorAll(linkSelector).forEach((el) => {
    el.addEventListener('mouseenter', () => outline.classList.add('cursor-hover-link'));
    el.addEventListener('mouseleave', () => outline.classList.remove('cursor-hover-link'));
  });
})();


/* ==========================================================
   3. MOUSE SPOTLIGHT
   ========================================================== */

(function spotlight() {
  if (!hasFinePointer || prefersReducedMotion) return;

  const spot = document.getElementById('spotlight');
  if (!spot) return;

  let ticking = false;

  window.addEventListener('mousemove', (e) => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      spot.style.setProperty('--spot-x', e.clientX + 'px');
      spot.style.setProperty('--spot-y', e.clientY + 'px');
      spot.classList.add('is-active');
      ticking = false;
    });
  });

  document.documentElement.addEventListener('mouseleave', () => spot.classList.remove('is-active'));
})();


/* ==========================================================
   4. FLOATING PARTICLES (lightweight, no external library)
   ========================================================== */

(function floatingParticles() {
  if (prefersReducedMotion) return;

  const container = document.createElement('div');
  container.className = 'particles';
  container.setAttribute('aria-hidden', 'true');
  document.body.appendChild(container);

  const count = window.innerWidth < 600 ? 10 : 18; // keep it subtle

  for (let i = 0; i < count; i++) {
    const p = document.createElement('span');
    p.className = 'particle';
    const size = (Math.random() * 2.5 + 2).toFixed(1);
    p.style.left = Math.random() * 100 + '%';
    p.style.width  = size + 'px';
    p.style.height = size + 'px';
    p.style.animationDuration = (Math.random() * 12 + 12).toFixed(1) + 's';
    p.style.animationDelay    = (Math.random() * 14).toFixed(1) + 's';
    container.appendChild(p);
  }
})();


/* ==========================================================
   5. SCROLL REVEAL (fade-up on scroll into view)
   No external library: if this script never runs, [data-reveal]
   elements are never hidden in the first place (see style.css —
   the opacity:0 rule only applies once html.reveal-ready is set).
   ========================================================== */

(function scrollReveal() {
  const targets = document.querySelectorAll('[data-reveal]');
  if (!targets.length || prefersReducedMotion || !('IntersectionObserver' in window)) return;

  document.documentElement.classList.add('reveal-ready');

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const delay = Number(entry.target.dataset.revealDelay) || 0;
      setTimeout(() => entry.target.classList.add('reveal-in'), delay);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

  targets.forEach((el) => io.observe(el));

  // The site swaps whole "pages" (about/resume/portfolio/...) via a CSS
  // class rather than real navigation, so a panel's contents only become
  // visible — and only get real layout — the moment its <article> becomes
  // active. Re-observe anything not yet revealed right after a nav click.
  document.querySelectorAll('[data-nav-link]').forEach((link) => {
    link.addEventListener('click', () => {
      setTimeout(() => {
        document.querySelectorAll('[data-reveal]:not(.reveal-in)').forEach((el) => io.observe(el));
      }, 80);
    });
  });
})();


/* ==========================================================
   6. NAVBAR ACTIVE INDICATOR
   ========================================================== */

(function navIndicator() {
  const list      = document.querySelector('.navbar-list');
  const indicator = document.getElementById('navIndicator');
  if (!list || !indicator) return;

  function moveIndicator() {
    const active = list.querySelector('.navbar-link.active');
    if (!active) return;
    const listRect   = list.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    indicator.style.width = activeRect.width + 'px';
    indicator.style.left  = (activeRect.left - listRect.left) + 'px';
  }

  // wait a tick so layout (fonts, breakpoint switch) has settled
  requestAnimationFrame(moveIndicator);
  window.addEventListener('resize', moveIndicator);

  list.querySelectorAll('[data-nav-link]').forEach((link) => {
    link.addEventListener('click', () => requestAnimationFrame(moveIndicator));
  });
})();


/* ==========================================================
   7. PROJECT CARD TILT (VanillaTilt)
   ========================================================== */

(function projectTilt() {
  if (typeof VanillaTilt === 'undefined' || !hasFinePointer || prefersReducedMotion) return;

  const targets = document.querySelectorAll('.project-item > a');
  if (!targets.length) return;

  VanillaTilt.init(targets, {
    max: 10,
    speed: 400,
    scale: 1.02,
    perspective: 900,
    glare: true,
    'max-glare': 0.12,
  });
})();