 // script.js
// Put this file in the same folder and include with: <script src="script.js" defer></script>

document.addEventListener('DOMContentLoaded', () => {
  /* ---------- Config ---------- */
  // Use international format digits-only (e.g. 919058111595). Replace with your number.
  const PHONE = "919058111595";

  /* ---------- Utilities ---------- */
  const qs = (s, ctx = document) => ctx.querySelector(s);
  const qsa = (s, ctx = document) => Array.from((ctx || document).querySelectorAll(s));

  function openWhatsApp(msg = "") {
    const text = encodeURIComponent(msg || "Hello Guruji, I would like to know more about your services.");
    const url = `https://api.whatsapp.com/send?phone=${PHONE}&text=${text}`;
    window.open(url, "_blank", "noopener");
  }

  /* ---------- Year ---------- */
  const yearEl = qs('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Smooth scroll for internal anchors ---------- */
  qsa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ---------- CTA handlers ---------- */
  const learnBtn = qs('#learnBtn');
  if (learnBtn) {
    learnBtn.addEventListener('click', () => {
      const features = qs('#features');
      if (features) features.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* ---------- Like buttons (toggle + localStorage) ---------- */
  const LIKE_KEY = 'astrotalk_likes_v1'; // localStorage key
  let likeState = { counts: {}, pressed: {} };
  try {
    const raw = localStorage.getItem(LIKE_KEY);
    if (raw) likeState = JSON.parse(raw);
  } catch (e) { /* ignore parse errors */ }

  function saveLikes() {
    try {
      localStorage.setItem(LIKE_KEY, JSON.stringify(likeState));
    } catch (e) { /* ignore storage errors */ }
  }

  qsa('.feature').forEach(feature => {
    const id = feature.dataset.id || feature.getAttribute('data-id') || null;
    const btn = qs('.like-btn', feature);
    const countEl = qs('.count', feature);
    if (!id || !btn || !countEl) return;

    const initial = (likeState.counts && likeState.counts[id]) ? likeState.counts[id] : 0;
    countEl.textContent = initial;

    const pressed = likeState.pressed && likeState.pressed[id];
    btn.setAttribute('aria-pressed', pressed ? "true" : "false");

    btn.addEventListener('click', () => {
      const isPressed = btn.getAttribute('aria-pressed') === 'true';
      if (!likeState.counts) likeState.counts = {};
      if (!likeState.pressed) likeState.pressed = {};

      if (isPressed) {
        likeState.counts[id] = Math.max(0, (likeState.counts[id] || initial) - 1);
        likeState.pressed[id] = false;
        btn.setAttribute('aria-pressed', "false");
      } else {
        likeState.counts[id] = (likeState.counts[id] || initial) + 1;
        likeState.pressed[id] = true;
        btn.setAttribute('aria-pressed', "true");
      }

      countEl.textContent = likeState.counts[id];
      saveLikes();
    });
  });

  /* ---------- WhatsApp contact card (inline in Contact section) ---------- */
  const waOpenBtn = qs('#waOpen');
  const waTemplatesBtn = qs('#waTemplatesBtn');
  const waTemplatesBox = qs('#waTemplates');

  if (waOpenBtn) {
    waOpenBtn.addEventListener('click', () => openWhatsApp());
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

    // click outside to close
    document.addEventListener('click', (e) => {
      if (!waTemplatesBox || !waTemplatesBtn) return;
      if (waTemplatesBox.hidden) return;
      if (!waTemplatesBox.contains(e.target) && !waTemplatesBtn.contains(e.target)) {
        waTemplatesBox.hidden = true;
        waTemplatesBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Floating WhatsApp widget ---------- */
  const floatBtn = qs('#waFloatBtn');
  const floatPop = qs('#waPop');
  const floatTmpls = qsa('.wa-tmpl');
  const floatOpenDirect = qs('#waOpenDirect');
  const waBottom = qs('#waBottom');
  const waBottomOpen = qs('#waBottomOpen');

  // Setup the Open-direct link
  if (floatOpenDirect) {
    floatOpenDirect.addEventListener('click', (e) => {
      e.preventDefault();
      openWhatsApp();
    });
  }

  if (floatBtn && floatPop) {
    floatBtn.addEventListener('click', (e) => {
      const currentlyHidden = floatPop.hidden;
      // toggle
      floatPop.hidden = !currentlyHidden;
      floatBtn.setAttribute('aria-expanded', String(!currentlyHidden));
    });

    floatTmpls.forEach(b => {
      b.addEventListener('click', () => {
        const msg = b.getAttribute('data-msg') || '';
        openWhatsApp(msg);
      });
    });

    if (floatOpenDirect) {
      floatOpenDirect.addEventListener('click', (e) => {
        e.preventDefault();
        openWhatsApp();
      });
    }

    // close when clicking outside (desktop)
    document.addEventListener('click', (e) => {
      if (!floatPop || !floatBtn) return;
      if (floatPop.hidden) return;
      if (!floatPop.contains(e.target) && !floatBtn.contains(e.target)) {
        floatPop.hidden = true;
        floatBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // bottom bar behavior for small screens
  const bottomBtn = qs('#waBottomOpen');
  if (bottomBtn) {
    bottomBtn.addEventListener('click', () => openWhatsApp());
  }

  // wire up template buttons in the floating popover
  qsa('.wa-tmpl').forEach(b => {
    b.addEventListener('click', (e) => {
      const msg = b.getAttribute('data-msg') || '';
      openWhatsApp(msg);
    });
  });

  // hide popover by default on small screens (handled by CSS) and show bottom bar
  function updateFloatDisplay() {
    const mql = window.matchMedia('(max-width:680px)');
    const isMobile = mql.matches;
    // when mobile, we show bottom bar and hide desktop float button/pop
    if (isMobile) {
      if (waBottom) waBottom.hidden = false;
      if (floatPop) floatPop.hidden = true;
      if (floatBtn) floatBtn.style.display = 'none';
    } else {
      if (waBottom) waBottom.hidden = true;
      if (floatBtn) floatBtn.style.display = '';
    }
  }
  updateFloatDisplay();
  window.addEventListener('resize', updateFloatDisplay);

  /* ---------- Accessibility & small safety checks ---------- */
  qsa('.like-btn').forEach((b, idx) => {
    if (!b.hasAttribute('aria-label')) b.setAttribute('aria-label', `Like feature ${idx+1}`);
    b.setAttribute('role', 'button');
    if (!b.hasAttribute('aria-pressed')) b.setAttribute('aria-pressed', 'false');
  });

  if (!PHONE || PHONE.length < 6) {
    console.warn('script.js: PHONE is not configured (replace PHONE variable with your international number).');
  }
});
