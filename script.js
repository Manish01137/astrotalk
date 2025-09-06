 // script.js
document.addEventListener("DOMContentLoaded", () => {
  // --- footer year ---
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // --- smooth scroll for same-page anchors (only internal) ---
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    const href = a.getAttribute('href');
    // ignore links that are just "#"
    if (!href || href === "#") return;
    a.addEventListener('click', (e) => {
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // --- hero CTAs ---
  const learnBtn = document.getElementById("learnBtn");
  if (learnBtn) {
    learnBtn.addEventListener("click", () => {
      const features = document.getElementById("features");
      if (features) features.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  // --- contact form demo ---
  const form = document.getElementById("contactForm");
  const statusEl = document.getElementById("formStatus");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!statusEl) return;
      statusEl.textContent = "";
      const name = (form.name?.value || "").trim();
      const email = (form.email?.value || "").trim();
      const message = (form.message?.value || "").trim();
      if (!name || !email || !message) {
        statusEl.textContent = "Please fill in all fields.";
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        statusEl.textContent = "Please enter a valid email.";
        return;
      }
      const submitBtn = form.querySelector('button[type="submit"]');
      const prior = submitBtn ? submitBtn.textContent : null;
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Sending..."; }
      setTimeout(() => {
        statusEl.textContent = "Thank you — your message has been sent (demo).";
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = prior; }
        form.reset();
        setTimeout(() => statusEl.textContent = "", 6000);
      }, 800);
    });
  }

  // --- Likes: localStorage-backed, optimistic UI ---
  const STORAGE_KEY = "astrotalk_features_v1";
  let store;
  try {
    store = JSON.parse(localStorage.getItem(STORAGE_KEY)) || { counts: {}, liked: {} };
  } catch (err) {
    store = { counts: {}, liked: {} };
  }

  const features = document.querySelectorAll(".feature");
  features.forEach(feature => {
    const id = feature.getAttribute("data-id") || feature.id || String(Math.random()).slice(2,8);
    const btn = feature.querySelector(".like-btn");
    const countSpan = feature.querySelector(".count");
    const heart = feature.querySelector(".heart");

    if (!btn || !countSpan || !heart) return;

    const initialCount = Number(store.counts[id] || 0);
    const initialLiked = !!store.liked[id];

    countSpan.textContent = String(initialCount);
    btn.setAttribute("aria-pressed", initialLiked ? "true" : "false");
    heart.textContent = initialLiked ? "♥" : "♡";

    btn.addEventListener("click", () => {
      const isLiked = btn.getAttribute("aria-pressed") === "true";
      const newLiked = !isLiked;
      btn.setAttribute("aria-pressed", newLiked ? "true" : "false");
      heart.textContent = newLiked ? "♥" : "♡";

      let current = parseInt(countSpan.textContent || "0", 10);
      current = newLiked ? current + 1 : Math.max(0, current - 1);
      countSpan.textContent = String(current);

      store.counts[id] = current;
      store.liked[id] = newLiked;
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch (e) { console.warn("Could not persist likes", e); }

      // small pulse
      try {
        btn.animate([{ transform: "scale(1)" }, { transform: "scale(1.06)" }, { transform: "scale(1)" }], { duration: 220, easing: "cubic-bezier(.2,.9,.2,1)" });
      } catch (_) {}
    });
  });
});
