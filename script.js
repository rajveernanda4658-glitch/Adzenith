const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const navPanel = document.querySelector("[data-nav-panel]");
const form = document.querySelector("[data-contact-form]");
const note = document.querySelector("[data-form-note]");
const revealEls = Array.from(document.querySelectorAll("[data-reveal]"));

function setYear() {
  const el = document.querySelector("[data-year]");
  if (el) el.textContent = String(new Date().getFullYear());
}

function closeNav() {
  if (!navPanel) return;
  navPanel.classList.remove("is-open");
  navToggle?.setAttribute("aria-label", "Open menu");
}

function toggleNav() {
  if (!navPanel) return;
  const next = !navPanel.classList.contains("is-open");
  navPanel.classList.toggle("is-open", next);
  navToggle?.setAttribute("aria-label", next ? "Close menu" : "Open menu");
}

function bindNav() {
  navToggle?.addEventListener("click", toggleNav);

  document.addEventListener("click", (e) => {
    if (!navPanel || !navToggle) return;
    const t = e.target;
    if (!(t instanceof Element)) return;
    const insidePanel = navPanel.contains(t);
    const insideToggle = navToggle.contains(t);
    if (!insidePanel && !insideToggle) closeNav();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNav();
  });

  navPanel?.querySelectorAll("a[href^='#']").forEach((a) => {
    a.addEventListener("click", () => closeNav());
  });
}

function bindHeaderShadow() {
  if (!header) return;
  const onScroll = () => {
    const scrolled = window.scrollY > 6;
    header.style.boxShadow = scrolled ? "0 10px 30px rgba(0,0,0,.25)" : "none";
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function bindTilt() {
  const tiltEl = document.querySelector("[data-tilt]");
  if (!tiltEl) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  const max = 10; // degrees
  let raf = 0;

  function onMove(e) {
    const rect = tiltEl.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0..1
    const y = (e.clientY - rect.top) / rect.height; // 0..1
    const rx = clamp((0.5 - y) * (max * 2), -max, max);
    const ry = clamp((x - 0.5) * (max * 2), -max, max);

    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      tiltEl.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
    });
  }

  function reset() {
    cancelAnimationFrame(raf);
    tiltEl.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)";
  }

  tiltEl.addEventListener("mousemove", onMove);
  tiltEl.addEventListener("mouseleave", reset);
  tiltEl.addEventListener("blur", reset);
}

function bindForm() {
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());

    if (note) {
      note.textContent =
        "Thanks! This demo form doesn’t send email yet. Replace this with your backend (or use Formspree/Netlify Forms).";
    }

    try {
      // Useful while wiring up a backend later.
      console.log("AdZenith contact form submission:", payload);
    } catch {
      // no-op
    }

    form.reset();
  });
}

function bindReveal() {
  if (revealEls.length === 0) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) {
    revealEls.forEach((el) => el.classList.add("is-in"));
    return;
  }

  if (!("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-in"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    },
    { root: null, threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
  );

  revealEls.forEach((el, i) => {
    // stagger a little for a "reference-site" feel
    el.style.transitionDelay = `${Math.min(i * 35, 220)}ms`;
    io.observe(el);
  });
}

setYear();
bindNav();
bindHeaderShadow();
bindTilt();
bindForm();
bindReveal();
