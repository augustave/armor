document.documentElement.classList.add("js-enabled");

const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const reducedMotion = reducedMotionQuery.matches;

const revealTargets = document.querySelectorAll(".reveal, .scan-panel");
const parallaxFrames = document.querySelectorAll(".parallax-frame img");
const scanZones = document.querySelectorAll(".scan-zone");
const scanSections = document.querySelectorAll(".scan-section");
const hero = document.querySelector(".hero");
const statusItems = document.querySelectorAll(".hero-status span");

document.body.classList.add("is-booted");

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
);

revealTargets.forEach((item) => revealObserver.observe(item));

const updateScrollMotion = () => {
  const viewportHeight = window.innerHeight;
  const viewportMid = viewportHeight / 2;

  parallaxFrames.forEach((image) => {
    const frame = image.parentElement;
    const rect = frame.getBoundingClientRect();
    const frameMid = rect.top + rect.height / 2;
    const offset = (frameMid - viewportMid) * -0.035;
    image.style.transform = `translate3d(0, ${offset}px, 0)`;
  });

  scanZones.forEach((zone) => {
    const rect = zone.getBoundingClientRect();
    const progress = clamp((viewportHeight - rect.top) / (viewportHeight + rect.height), 0, 1);
    zone.style.setProperty("--scan-y", `${Math.round(progress * 100)}%`);
  });

  scanSections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const progress = clamp((viewportHeight - rect.top) / (viewportHeight + rect.height), 0, 1);
    section.style.setProperty("--section-scan-y", `${Math.round(progress * 100)}%`);
  });
};

if (!reducedMotion) {
  updateScrollMotion();
  window.addEventListener("scroll", updateScrollMotion, { passive: true });
  window.addEventListener("resize", updateScrollMotion);
}

if (!reducedMotion && hero) {
  hero.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType === "touch") return;

      const rect = hero.getBoundingClientRect();
      const x = clamp(((event.clientX - rect.left) / rect.width) * 100, 18, 82);
      const y = clamp(((event.clientY - rect.top) / rect.height) * 100, 22, 78);

      hero.style.setProperty("--focus-x", `${x.toFixed(2)}%`);
      hero.style.setProperty("--focus-y", `${y.toFixed(2)}%`);
    },
    { passive: true }
  );
}

if (!reducedMotion && statusItems.length > 1) {
  let activeStatus = 0;
  statusItems[activeStatus].classList.add("is-active");

  window.setInterval(() => {
    statusItems[activeStatus].classList.remove("is-active");
    activeStatus = (activeStatus + 1) % statusItems.length;
    statusItems[activeStatus].classList.add("is-active");
  }, 1600);
}

// Click-to-launch for the SD-2014 ops embed.
// Keeps the heavy Canvas 2D animation off the main thread until the
// visitor opts in, fixing scroll jank on the rest of the page.
document.querySelectorAll("[data-ops-launch]").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const wrap = trigger.closest("[data-ops-embed]");
    if (!wrap) return;
    const src = wrap.getAttribute("data-src");
    if (!src) return;
    const iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.title = "ARMOR Mission Webapp — interactive simulation";
    iframe.loading = "eager";
    iframe.setAttribute("allow", "fullscreen");
    trigger.replaceWith(iframe);
    iframe.addEventListener("load", () => { try { iframe.focus(); } catch (_) {} }, { once: true });

    // Pause the simulation when the iframe scrolls out of view. The webapp
    // burns RAF frames continuously; this is what keeps the rest of the
    // page smooth while you're reading other sections.
    const post = (action) => {
      try { iframe.contentWindow.postMessage({ source: "armor-ops", action }, "*"); } catch (_) {}
    };
    let isVisible = true;
    const visibilityObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const nowVisible = entry.isIntersecting;
        if (nowVisible === isVisible) return;
        isVisible = nowVisible;
        post(nowVisible ? "resume" : "pause");
      });
    }, { rootMargin: "200px 0px", threshold: 0 });
    visibilityObserver.observe(iframe);
  });
});
