// script.js
// Cleaned JS for Astro Talk — likes/localStorage removed
(function () {
  'use strict';

  /* ---------------------------
     Configuration
     --------------------------- */
  // International phone number digits-only (example: 919058111595)
  const PHONE = "919058111595";

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

  /* ---------------------------
     WhatsApp opener
     --------------------------- */
  function openWhatsApp(msg = "") {
    if (!PHONE || PHONE.length < 5) {
      console.warn('script.js: PHONE is not configured correctly. Update PHONE at top of script.js.');
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
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      a.addEventListener('click', (ev) => {
        const target = document.querySelector(href);
        if (target) {
          ev.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      waTemplatesBtn.addEventListener('click', (e) => {
        const expanded = waTemplatesBtn.getAttribute('aria-expanded') === 'true';
        waTemplatesBtn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        waTemplatesBox.hidden = expanded;
      });

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

      floatTmpls.forEach(b => {
        b.addEventListener('click', () => {
          const msg = b.getAttribute('data-msg') || '';
          openWhatsApp(msg);
        });
      });

      document.addEventListener('click', (e) => {
        if (!floatPop || !floatBtn) return;
        if (floatPop.hidden) return;
        if (!floatPop.contains(e.target) && !floatBtn.contains(e.target)) {
          floatPop.hidden = true;
          floatBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    if (bottomOpen) {
      bottomOpen.addEventListener('click', () => openWhatsApp());
    }

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

    document.addEventListener('click', (e) => {
      if (!document.body.classList.contains('nav-open')) return;
      const insideNav = mainNav.contains(e.target) || navToggle.contains(e.target);
      if (!insideNav) setNavOpen(false);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setNavOpen(false);
    });

    function onResize() {
      const isDesktop = window.matchMedia('(min-width:981px)').matches;
      if (isDesktop) setNavOpen(false);
    }
    window.addEventListener('resize', debounce(onResize, 120));
  }

  /* ---------------------------
     Initialization
     --------------------------- */
  function init() {
    injectYear();
    wireSmoothScroll();
    wireCTAs();
    wireInlineWhatsApp();
    wireFloatingWhatsApp();
    wireNavToggle();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // window.AstroTalk = { openWhatsApp }; // uncomment to expose for console debugging

})();


