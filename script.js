const shell = document.querySelector(".archive-shell");
const viewport = document.querySelector(".schematic-viewport");
const world = document.querySelector("#schematicWorld");
const navNodes = document.querySelectorAll("[data-pan-target]");
const zoomNodes = document.querySelectorAll("[data-zoom]");
const corridors = document.querySelectorAll(".corridor");

let zoom = 1;
let pan = { x: 0, y: 0 };
let drag = null;

const targets = {
  origin: { x: 96, y: 152 },
  sector: { x: 936, y: 128 },
  deploy: { x: 210, y: 706 },
  swarm: { x: 1076, y: 724 },
  qa: { x: 1604, y: 608 },
  exit: { x: 2026, y: 124 },
};

const applyTransform = () => {
  world.style.setProperty("--pan-x", `${Math.round(pan.x)}px`);
  world.style.setProperty("--pan-y", `${Math.round(pan.y)}px`);
  world.style.setProperty("--zoom", zoom);
  shell.dataset.zoom = String(zoom);
};

const setActive = (targetName) => {
  document.querySelectorAll(".nav-node").forEach((node) => {
    node.classList.toggle("is-active", node.dataset.panTarget === targetName);
  });

  document.querySelectorAll(".node").forEach((node) => {
    node.classList.toggle("is-active", node.dataset.panTarget === targetName);
  });
};

const panTo = (targetName) => {
  const target = targets[targetName];
  if (!target) return;

  const marginX = window.innerWidth < 760 ? 26 : 120;
  const marginY = window.innerWidth < 760 ? 174 : 132;

  pan = {
    x: marginX - target.x * zoom,
    y: marginY - target.y * zoom,
  };

  setActive(targetName);
  applyTransform();
};

const lightCorridors = (targetName, enabled) => {
  corridors.forEach((line) => {
    const active = line.classList.contains(`c-${targetName}`);
    line.classList.toggle("is-lit", enabled && active);
  });
};

navNodes.forEach((node) => {
  const targetName = node.dataset.panTarget;

  node.addEventListener("click", () => panTo(targetName));
  node.addEventListener("mouseenter", () => lightCorridors(targetName, true));
  node.addEventListener("mouseleave", () => lightCorridors(targetName, false));
  node.addEventListener("focus", () => lightCorridors(targetName, true));
  node.addEventListener("blur", () => lightCorridors(targetName, false));
});

zoomNodes.forEach((node) => {
  node.addEventListener("click", () => {
    zoom = Number(node.dataset.zoom);
    zoomNodes.forEach((item) => item.classList.toggle("is-active", item === node));
    panTo(document.querySelector(".nav-node.is-active")?.dataset.panTarget || "origin");
  });
});

viewport.addEventListener("pointerdown", (event) => {
  if (event.target.closest("button, a")) return;
  drag = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    panX: pan.x,
    panY: pan.y,
  };
  viewport.setPointerCapture(event.pointerId);
  viewport.classList.add("is-dragging");
});

viewport.addEventListener("pointermove", (event) => {
  if (!drag || drag.pointerId !== event.pointerId) return;

  pan = {
    x: drag.panX + event.clientX - drag.startX,
    y: drag.panY + event.clientY - drag.startY,
  };

  applyTransform();
});

viewport.addEventListener("pointerup", (event) => {
  if (!drag || drag.pointerId !== event.pointerId) return;
  drag = null;
  viewport.classList.remove("is-dragging");
});

viewport.addEventListener("pointercancel", () => {
  drag = null;
  viewport.classList.remove("is-dragging");
});

window.addEventListener("resize", () => {
  const active = document.querySelector(".nav-node.is-active")?.dataset.panTarget || "origin";
  panTo(active);
});

window.addEventListener("load", () => {
  panTo("origin");
  window.setTimeout(() => {
    world.classList.add("has-plotted");
  }, 180);
});
