// script.js
// Complete JS for Astro Talk — Guruji Bengali site
// Place this file next to your index.html and include with: <script src="script.js" defer></script>

(function () {
  'use strict';

  /* ---------------------------
     Configuration
     --------------------------- */
  // International phone number digits-only (example: 919058111595)
  const PHONE = "919058111595";

  // localStorage key for likes
  const LIKE_KEY = 'astrotalk_likes_v1';

  // Debounce helper for resize events
  function debounce(fn, wait = 120) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  /* ---------------------------
     DOM helpers
     --------------------------- */
  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => Array.from((ctx || document).querySelectorAll(sel));

  // Safe JSON parse
  function safeJSONParse(str, fallback = null) {
    try {
      return JSON.parse(str);
    } catch (e) {
      return fallback;
    }
  }

  /* ---------------------------
     WhatsApp opener
     --------------------------- */
  function openWhatsApp(msg = "") {
    if (!PHONE || PHONE.length < 5) {
      console.warn('script.js: PHONE is not configured correctly. Update PHONE at top of script.js.');
      // open generic WhatsApp home if phone missing
      const fallback = `https://api.whatsapp.com/`;
      return window.open(fallback, '_blank', 'noopener');
    }
    const text = encodeURIComponent(msg || "Hello Guruji, I would like to know more about your services.");
    const url = `https://api.whatsapp.com/send?phone=${PHONE}&text=${text}`;
    window.open(url, '_blank', 'noopener');
  }

  /* ---------------------------
     Year injection
     --------------------------- */
  function injectYear() {
    const yearEl = qs('#year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  /* ---------------------------
     Smooth internal anchor scrolling
     --------------------------- */
  function wireSmoothScroll() {
    qsa('a[href^="#"]').forEach(a => {
      // Skip links that are only '#'
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      a.addEventListener('click', (ev) => {
        const target = document.querySelector(href);
        if (target) {
          ev.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // update focus for accessibility
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
          setTimeout(() => target.removeAttribute('tabindex'), 1500);
        }
      });
    });
  }

  /* ---------------------------
     CTA (learn more) handler
     --------------------------- */
  function wireCTAs() {
    const learnBtn = qs('#learnBtn');
    if (learnBtn) {
      learnBtn.addEventListener('click', () => {
        const features = qs('#features');
        if (features) features.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }

  /* ---------------------------
     Likes (per-feature) with localStorage
     - toggles like/unlike and persists counts + pressed state
     --------------------------- */
  function LikesManager() {
    let state = { counts: {}, pressed: {} };

    function load() {
      try {
        const raw = localStorage.getItem(LIKE_KEY);
        const parsed = safeJSONParse(raw, null);
        if (parsed && typeof parsed === 'object') state = parsed;
      } catch (e) {
        // ignore
      }
    }

    function save() {
      try {
        localStorage.setItem(LIKE_KEY, JSON.stringify(state));
      } catch (e) {
        // ignore quota errors
        console.warn('Could not save likes to localStorage.');
      }
    }

    function init() {
      load();
      qsa('.feature').forEach(feature => {
        const id = feature.dataset.id || feature.getAttribute('data-id') || null;
        const btn = qs('.like-btn', feature);
        const countEl = qs('.count', feature);

        if (!id || !btn || !countEl) return;

        // initial render - fallback to dataset or 0
        const initialCount = Number(state.counts && state.counts[id]) || Number(countEl.textContent) || 0;
        countEl.textContent = initialCount;
        const pressed = Boolean(state.pressed && state.pressed[id]);
        btn.setAttribute('aria-pressed', pressed ? 'true' : 'false');

        // accessibility attrs
        if (!btn.hasAttribute('aria-label')) {
          const name = (qs('h3', feature) && qs('h3', feature).textContent.trim()) || id;
          btn.setAttribute('aria-label', `Like ${name}`);
        }
        btn.setAttribute('role', 'button');

        btn.addEventListener('click', () => {
          const isPressed = btn.getAttribute('aria-pressed') === 'true';
          if (!state.counts) state.counts = {};
          if (!state.pressed) state.pressed = {};

          if (isPressed) {
            state.counts[id] = Math.max(0, (state.counts[id] || initialCount) - 1);
            state.pressed[id] = false;
            btn.setAttribute('aria-pressed', 'false');
          } else {
            state.counts[id] = (state.counts[id] || initialCount) + 1;
            state.pressed[id] = true;
            btn.setAttribute('aria-pressed', 'true');
          }

          countEl.textContent = state.counts[id];
          save();
        });
      });
    }

    return { init };
  }

  /* ---------------------------
     Inline WhatsApp card (Contact section)
     --------------------------- */
  function wireInlineWhatsApp() {
    const waOpen = qs('#waOpen');
    const waTemplatesBtn = qs('#waTemplatesBtn');
    const waTemplatesBox = qs('#waTemplates');

    if (waOpen) {
      waOpen.addEventListener('click', () => openWhatsApp());
    }

    if (waTemplatesBtn && waTemplatesBox) {
      // toggle
      waTemplatesBtn.addEventListener('click', (e) => {
        const expanded = waTemplatesBtn.getAttribute('aria-expanded') === 'true';
        waTemplatesBtn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        waTemplatesBox.hidden = expanded;
      });

      // click templates (event delegation)
      waTemplatesBox.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-msg]');
        if (!btn) return;
        const msg = btn.getAttribute('data-msg') || '';
        openWhatsApp(msg);
      });

      // close when click outside
      document.addEventListener('click', (e) => {
        if (!waTemplatesBox || !waTemplatesBtn) return;
        if (waTemplatesBox.hidden) return;
        if (!waTemplatesBox.contains(e.target) && !waTemplatesBtn.contains(e.target)) {
          waTemplatesBox.hidden = true;
          waTemplatesBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }

  /* ---------------------------
     Floating WhatsApp widget (desktop & mobile behaviors)
     --------------------------- */
  function wireFloatingWhatsApp() {
    const floatBtn = qs('#waFloatBtn');
    const floatPop = qs('#waPop');
    const floatTmpls = qsa('.wa-tmpl');
    const floatOpenDirect = qs('#waOpenDirect');
    const waBottom = qs('#waBottom');
    const bottomOpen = qs('#waBottomOpen');

    // direct open link
    if (floatOpenDirect) {
      floatOpenDirect.addEventListener('click', (e) => {
        e.preventDefault();
        openWhatsApp();
      });
    }

    if (floatBtn && floatPop) {
      floatBtn.addEventListener('click', () => {
        const hidden = !!floatPop.hidden;
        floatPop.hidden = !hidden;
        floatBtn.setAttribute('aria-expanded', String(!hidden));
      });

      // template clicks
      floatTmpls.forEach(b => {
        b.addEventListener('click', () => {
          const msg = b.getAttribute('data-msg') || '';
          openWhatsApp(msg);
        });
      });

      // close when clicking outside
      document.addEventListener('click', (e) => {
        if (!floatPop || !floatBtn) return;
        if (floatPop.hidden) return;
        if (!floatPop.contains(e.target) && !floatBtn.contains(e.target)) {
          floatPop.hidden = true;
          floatBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // mobile bottom bar "Start Chat"
    if (bottomOpen) {
      bottomOpen.addEventListener('click', () => openWhatsApp());
    }

    // responsive display toggling
    function updateDisplay() {
      const isMobile = window.matchMedia('(max-width:680px)').matches;
      if (isMobile) {
        if (waBottom) waBottom.hidden = false;
        if (floatPop) floatPop.hidden = true;
        if (floatBtn) floatBtn.style.display = 'none';
      } else {
        if (waBottom) waBottom.hidden = true;
        if (floatBtn) floatBtn.style.display = '';
      }
    }

    updateDisplay();
    window.addEventListener('resize', debounce(updateDisplay, 120));
  }

  /* ---------------------------
     Nav toggle (mobile)
     - toggles body.nav-open, closes on outside click or Escape
     --------------------------- */
  function wireNavToggle() {
    const navToggle = qs('#navToggle');
    const mainNav = qs('.main-nav');
    if (!navToggle || !mainNav) return;

    function setNavOpen(open) {
      document.body.classList.toggle('nav-open', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    navToggle.addEventListener('click', (e) => {
      const isOpen = document.body.classList.contains('nav-open');
      setNavOpen(!isOpen);
    });

    // close when click outside
    document.addEventListener('click', (e) => {
      if (!document.body.classList.contains('nav-open')) return;
      const insideNav = mainNav.contains(e.target) || navToggle.contains(e.target);
      if (!insideNav) setNavOpen(false);
    });

    // close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setNavOpen(false);
    });

    // ensure nav is hidden when resizing to desktop
    function onResize() {
      const isDesktop = window.matchMedia('(min-width:981px)').matches;
      if (isDesktop) setNavOpen(false);
    }
    window.addEventListener('resize', debounce(onResize, 120));
  }

  /* ---------------------------
     Accessibility helpers
     --------------------------- */
  function ensureA11y() {
    qsa('.like-btn').forEach((b, idx) => {
      if (!b.hasAttribute('aria-label')) b.setAttribute('aria-label', `Like feature ${idx + 1}`);
      b.setAttribute('role', 'button');
      if (!b.hasAttribute('aria-pressed')) b.setAttribute('aria-pressed', 'false');
    });
  }

  /* ---------------------------
     Initialization
     --------------------------- */
  function init() {
    injectYear();
    wireSmoothScroll();
    wireCTAs();

    const likes = LikesManager();
    likes.init();

    wireInlineWhatsApp();
    wireFloatingWhatsApp();
    wireNavToggle();
    ensureA11y();
  }

  // run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ---------------------------
     Optional debug helpers on window (comment out in production)
     --------------------------- */
  // window.AstroTalk = { openWhatsApp }; // uncomment to expose for console debugging

})();
