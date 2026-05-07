const canvas = document.getElementById("map");
const ctx = canvas.getContext("2d", { alpha: false });

const stage = document.querySelector(".stage");
const playPauseButton = document.getElementById("playPause");
const restartButton = document.getElementById("restart");
const speedButton = document.getElementById("speed");
const graphPanel = document.getElementById("missionGraph");
const graphCount = document.getElementById("graphCount");
const graphSvg = document.getElementById("graphSvg");
const modeButtons = Array.from(document.querySelectorAll(".mode-button"));
const layerInputs = Array.from(document.querySelectorAll("[data-layer]"));
const inspectorTitle = document.getElementById("inspectorTitle");
const inspectorBody = document.getElementById("inspectorBody");
const inspectorMeta = document.getElementById("inspectorMeta");
const modelPanel = document.getElementById("modelPanel");
const timeScrubber = document.getElementById("timeScrubber");
const timeReadout = document.getElementById("timeReadout");
const droneCountInput = document.getElementById("droneCount");
const picketSpacingInput = document.getElementById("picketSpacing");
const rangeMultiplierInput = document.getElementById("rangeMultiplier");
const falsePositiveRateInput = document.getElementById("falsePositiveRate");
const vesselDensityInput = document.getElementById("vesselDensity");
const sensorPackageInput = document.getElementById("sensorPackage");
const generateScenarioButton = document.getElementById("generateScenario");
const scenarioMetrics = document.getElementById("scenarioMetrics");
const params = new URLSearchParams(window.location.search);

const BASE_WIDTH = 1600;
const BASE_HEIGHT = 900;
const LOOP_SECONDS = 28;
const TWO_PI = Math.PI * 2;

const COLORS = {
  gold: "#ffd700",
  goldSoft: "rgba(255, 215, 0, 0.34)",
  blue: "#00ff00",
  markerBlue: "#ffffff",
  red: "#d23b30",
  magenta: "#d946ef",
  white: "rgba(255, 255, 255, 0.84)",
  label: "rgba(245, 249, 255, 0.94)",
};

const animationState = {
  playing: params.get("paused") !== "1",
  time: Number(params.get("t") || 0) % LOOP_SECONDS,
  lastFrame: performance.now(),
  speed: 1,
  speedIndex: 0,
};

const speedSteps = [1, 1.5, 0.6];

const appState = {
  mode: "observe",
  selectedGraphNode: null,
  selectedMarker: null,
  layerState: {
    bathymetry: true,
    tracks: true,
    detections: true,
    markers: true,
    graph: true,
    scenario: true,
  },
};

const scenarioState = {
  config: {
    droneCount: 4,
    picketSpacing: 18,
    rangeMultiplier: 1.6,
    falsePositiveRate: 10,
    vesselDensity: 45,
    sensorPackage: "fusion",
  },
  result: null,
};

const missionGraph = {
  nodes: [
    { id: "DHS", type: "Org", label: "DHS", x: 90, y: 86 },
    { id: "CBP", type: "Org", label: "CBP", x: 250, y: 86 },
    { id: "USCG", type: "Org", label: "USCG", x: 250, y: 182 },
    { id: "SD", type: "Org", label: "Saildrone", x: 430, y: 132 },
    { id: "SV", type: "Tech", label: "Voyager", x: 575, y: 282 },
    { id: "ML", type: "Tech", label: "ML software", x: 760, y: 155 },
    { id: "Radar", type: "Tech", label: "Radar algorithms", x: 902, y: 250 },
    { id: "CAM", type: "Tech", label: "EO/IR cameras", x: 760, y: 350 },
    { id: "MDA", type: "Concept", label: "MDA", x: 430, y: 446 },
    { id: "DT", type: "Threat", label: "Drug traffic", x: 158, y: 404 },
    { id: "HS", type: "Threat", label: "Smuggling", x: 162, y: 522 },
    { id: "Pangas", type: "Threat", label: "Small vessels", x: 430, y: 570 },
    { id: "Refine", type: "Process", label: "User refinement", x: 902, y: 62 },
    { id: "Range", type: "Metric", label: "Detection range", x: 1062, y: 90 },
    { id: "FalsePos", type: "Metric", label: "False positives", x: 1062, y: 172 },
    { id: "Picket", type: "Tactic", label: "4-drone picket", x: 730, y: 520 },
  ],
  edges: [
    { source: "DHS", target: "CBP", label: "oversees" },
    { source: "CBP", target: "SD", label: "collaborates" },
    { source: "USCG", target: "SD", label: "explores tech" },
    { source: "SD", target: "SV", label: "deploys", core: true },
    { source: "SV", target: "ML", label: "equipped" },
    { source: "SV", target: "CAM", label: "equipped" },
    { source: "SV", target: "Radar", label: "utilizes", core: true },
    { source: "SV", target: "MDA", label: "enhances", core: true },
    { source: "MDA", target: "DT", label: "counters" },
    { source: "MDA", target: "HS", label: "counters" },
    { source: "MDA", target: "Pangas", label: "detects" },
    { source: "SV", target: "Pangas", label: "tracks", core: true },
    { source: "ML", target: "Refine", label: "improved by" },
    { source: "Refine", target: "Range", label: "doubled" },
    { source: "ML", target: "FalsePos", label: "reduced" },
    { source: "Radar", target: "Pangas", label: "classifies" },
    { source: "Picket", target: "SV", label: "mission tactic" },
  ],
};

const graphColors = {
  Org: "#ffffff",
  Tech: "#ffffff",
  Concept: "#ffd700",
  Threat: "#d23b30",
  Process: "#a98cff",
  Metric: "#dce9ff",
  Tactic: "#00ff00",
};

function mulberry32(seed) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = mulberry32(2014);

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - clamp(t, 0, 1), 3);
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function mixColor(a, b, t) {
  return [
    Math.round(lerp(a[0], b[0], t)),
    Math.round(lerp(a[1], b[1], t)),
    Math.round(lerp(a[2], b[2], t)),
    255,
  ];
}

function shelfMetric(x, y) {
  const wave = Math.sin(x * 10.5 + 0.8) * 0.026 + Math.sin(x * 21.0) * 0.012;
  const boundary = 0.71 - x * 0.34 + wave;
  const lowerLeftBank = y - boundary;
  const lowerMiddleRise = y - (0.86 - x * 0.08 + Math.sin(x * 17) * 0.018);
  const rightEdgeShelf = y - (0.79 - (x - 0.72) * 0.74 + Math.sin(x * 18) * 0.014);
  return Math.max(lowerLeftBank, lowerMiddleRise * 0.7, rightEdgeShelf * 0.42);
}

function depthNoise(x, y) {
  return (
    Math.sin(x * 18.0 + y * 6.0) * 0.45 +
    Math.sin(x * 46.0 - y * 25.0) * 0.2 +
    Math.sin((x + y) * 74.0) * 0.08
  );
}

function makeBackground() {
  const bg = document.createElement("canvas");
  bg.width = BASE_WIDTH;
  bg.height = BASE_HEIGHT;
  const bgCtx = bg.getContext("2d");
  const image = bgCtx.createImageData(BASE_WIDTH, BASE_HEIGHT);
  const deepA = [10, 25, 47];
  const deepB = [13, 38, 76];
  const shelfA = [42, 35, 67];
  const shelfB = [94, 42, 102];

  for (let y = 0; y < BASE_HEIGHT; y += 1) {
    for (let x = 0; x < BASE_WIDTH; x += 1) {
      const nx = x / BASE_WIDTH;
      const ny = y / BASE_HEIGHT;
      const metric = shelfMetric(nx, ny);
      const depth = clamp(0.18 + ny * 0.42 + depthNoise(nx, ny) * 0.08, 0, 1);
      let color = mixColor(deepA, deepB, depth);

      if (metric > -0.025) {
        const shelfBlend = clamp((metric + 0.025) / 0.18, 0, 1);
        const shelfColor = mixColor(shelfA, shelfB, clamp(0.36 + depthNoise(nx + 3, ny) * 0.18, 0, 1));
        color = mixColor(color, shelfColor, shelfBlend * 0.84);
      }

      const vignette = clamp(Math.hypot(nx - 0.5, ny - 0.5) * 0.44, 0, 0.24);
      const i = (y * BASE_WIDTH + x) * 4;
      image.data[i] = Math.max(0, color[0] - vignette * 34);
      image.data[i + 1] = Math.max(0, color[1] - vignette * 36);
      image.data[i + 2] = Math.max(0, color[2] - vignette * 42);
      image.data[i + 3] = 255;
    }
  }

  bgCtx.putImageData(image, 0, 0);
  bgCtx.globalCompositeOperation = "screen";
  for (let i = 0; i < 28; i += 1) {
    const y = (0.1 + i * 0.035) * BASE_HEIGHT;
    bgCtx.beginPath();
    bgCtx.moveTo(0, y);
    for (let x = 0; x <= BASE_WIDTH; x += 32) {
      const nx = x / BASE_WIDTH;
      const contour = y + Math.sin(nx * 18 + i * 0.8) * 9 + Math.sin(nx * 41) * 4;
      bgCtx.lineTo(x, contour);
    }
    bgCtx.strokeStyle = `rgba(180, 215, 244, ${i % 3 === 0 ? 0.075 : 0.035})`;
    bgCtx.lineWidth = i % 3 === 0 ? 1.2 : 0.8;
    bgCtx.stroke();
  }

  bgCtx.globalCompositeOperation = "source-over";
  drawShelfBoundary(bgCtx);
  return bg;
}

function drawShelfBoundary(targetCtx) {
  targetCtx.save();
  targetCtx.lineWidth = 1.3;
  targetCtx.strokeStyle = "rgba(235, 220, 190, 0.28)";
  targetCtx.beginPath();
  for (let i = 0; i <= 180; i += 1) {
    const x = i / 180;
    const y = 0.71 - x * 0.34 + Math.sin(x * 10.5 + 0.8) * 0.026 + Math.sin(x * 21.0) * 0.012;
    const px = x * BASE_WIDTH;
    const py = y * BASE_HEIGHT;
    if (i === 0) {
      targetCtx.moveTo(px, py);
    } else {
      targetCtx.lineTo(px, py);
    }
  }
  targetCtx.stroke();

  targetCtx.strokeStyle = "rgba(255, 180, 120, 0.12)";
  targetCtx.lineWidth = 5;
  targetCtx.stroke();
  targetCtx.restore();
}

const backgroundCanvas = makeBackground();

const missionMarkers = [
  { label: "[ARM-1A]", x: 0.255, y: 0.225, reveal: 3.8, focus: 0.9 },
  { label: "[ARM-2B]", x: 0.485, y: 0.485, reveal: 1.7, focus: 1.35 },
  { label: "[ARM-3C]", x: 0.745, y: 0.425, reveal: 5.7, focus: 0.95 },
  { label: "[ARM-4D]", x: 0.905, y: 0.505, reveal: 7.4, focus: 0.85 },
];

function markerByLabel(label) {
  return missionMarkers.find((marker) => marker.label === label);
}

function makeTrackAround(cx, cy, index, spread) {
  const angle = 0.62 + (random() - 0.5) * 0.34;
  const length = 0.42 + random() * 0.52;
  const offset = (random() - 0.5) * spread;
  const normalX = Math.cos(angle + Math.PI / 2);
  const normalY = Math.sin(angle + Math.PI / 2);
  const centerX = cx + normalX * offset + (random() - 0.5) * 0.06;
  const centerY = cy + normalY * offset + (random() - 0.5) * 0.06;
  const startX = centerX - Math.cos(angle) * length * (0.46 + random() * 0.22);
  const startY = centerY - Math.sin(angle) * length * (0.46 + random() * 0.22);
  const points = [];
  const bends = 7 + Math.floor(random() * 4);

  for (let i = 0; i < bends; i += 1) {
    const t = i / (bends - 1);
    const curve = Math.sin(t * Math.PI) * (random() - 0.5) * 0.05;
    points.push({
      x: clamp(startX + Math.cos(angle) * length * t + normalX * curve, -0.05, 1.08),
      y: clamp(startY + Math.sin(angle) * length * t + normalY * curve, -0.06, 1.06),
    });
  }

  return {
    points,
    color: index % 5 === 0 ? COLORS.magenta : COLORS.gold,
    alpha: 0.64 + random() * 0.34,
    width: 1.05 + random() * 0.9,
    dashed: false,
    reveal: 0.7 + index * 0.025 + random() * 1.2,
    duration: 5.8 + random() * 4.2,
  };
}

function makeDashedTrack(index) {
  const origin = missionMarkers[Math.floor(random() * missionMarkers.length)];
  const angle = 0.58 + (random() - 0.5) * 0.54;
  const length = 0.12 + random() * 0.18;
  const offset = (random() - 0.5) * 0.22;
  const normalX = Math.cos(angle + Math.PI / 2);
  const normalY = Math.sin(angle + Math.PI / 2);
  const start = {
    x: clamp(origin.x + normalX * offset + (random() - 0.5) * 0.1, 0.05, 0.96),
    y: clamp(origin.y + normalY * offset + (random() - 0.5) * 0.12, 0.08, 0.9),
  };

  return {
    points: [
      start,
      {
        x: clamp(start.x + Math.cos(angle) * length, 0.02, 1.02),
        y: clamp(start.y + Math.sin(angle) * length, 0.02, 0.98),
      },
    ],
    color: COLORS.white,
    alpha: 0.54,
    width: 1.1,
    dashed: true,
    reveal: 4.2 + index * 0.18,
    duration: 4.5,
  };
}

function generateTracks() {
  const tracks = [];
  const center = markerByLabel("[ARM-2B]");
  const left = markerByLabel("[ARM-1A]");
  const right = markerByLabel("[ARM-3C]");

  for (let i = 0; i < 92; i += 1) {
    tracks.push(makeTrackAround(center.x, center.y, i, 0.33));
  }

  for (let i = 0; i < 34; i += 1) {
    const origin = i % 2 === 0 ? left : right;
    tracks.push(makeTrackAround(origin.x, origin.y, i + 92, 0.22));
  }

  for (let i = 0; i < 28; i += 1) {
    tracks.push(makeDashedTrack(i));
  }

  return tracks;
}

const baseTracks = generateTracks();

function pointNear(cx, cy, spreadX, spreadY, color, revealBase) {
  const angle = random() * TWO_PI;
  const distance = Math.pow(random(), 0.55);
  return {
    x: clamp(cx + Math.cos(angle) * distance * spreadX, 0.02, 0.98),
    y: clamp(cy + Math.sin(angle) * distance * spreadY, 0.02, 0.96),
    color,
    radius: color === COLORS.red ? 4.2 + random() * 2.1 : 2.8 + random() * 1.5,
    reveal: revealBase + random() * 4.8,
    phase: random() * TWO_PI,
  };
}

function generatePoints() {
  const points = [];
  const arm1a = markerByLabel("[ARM-1A]");
  const arm3c = markerByLabel("[ARM-3C]");
  const arm2b = markerByLabel("[ARM-2B]");

  for (let i = 0; i < 28; i += 1) {
    points.push(pointNear(arm1a.x - 0.025, arm1a.y + 0.03, 0.08, 0.08, COLORS.red, 5.0));
  }

  for (let i = 0; i < 32; i += 1) {
    points.push(pointNear(arm3c.x + 0.02, arm3c.y + 0.035, 0.09, 0.075, COLORS.red, 6.2));
  }

  for (let i = 0; i < 86; i += 1) {
    const track = baseTracks[Math.floor(random() * 92)];
    const segment = track.points[Math.floor(random() * (track.points.length - 1))];
    points.push(pointNear(segment.x, segment.y, 0.014, 0.014, COLORS.blue, 4.0));
  }

  for (let i = 0; i < 16; i += 1) {
    points.push(pointNear(arm2b.x, arm2b.y, 0.12, 0.11, COLORS.blue, 2.4));
  }

  return points;
}

const baseDetections = generatePoints();

function svgElement(name, attributes = {}) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", name);
  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value);
  }
  return element;
}

function renderMissionGraph() {
  const nodesById = new Map(missionGraph.nodes.map((node) => [node.id, node]));
  graphCount.textContent = `${missionGraph.nodes.length} nodes`;
  graphSvg.replaceChildren();
  graphSvg.setAttribute("viewBox", "0 0 1120 640");

  const defs = svgElement("defs");
  const marker = svgElement("marker", {
    id: "graphArrow",
    markerWidth: "12",
    markerHeight: "12",
    refX: "10",
    refY: "6",
    orient: "auto",
    markerUnits: "strokeWidth",
  });
  marker.appendChild(svgElement("path", { d: "M2,2 L10,6 L2,10 Z", fill: "rgba(224, 235, 255, 0.62)" }));
  defs.appendChild(marker);
  graphSvg.appendChild(defs);

  for (const edge of missionGraph.edges) {
    const source = nodesById.get(edge.source);
    const target = nodesById.get(edge.target);
    if (!source || !target) continue;

    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const length = Math.hypot(dx, dy) || 1;
    const startX = source.x + (dx / length) * 26;
    const startY = source.y + (dy / length) * 26;
    const endX = target.x - (dx / length) * 30;
    const endY = target.y - (dy / length) * 30;
    const curve = edge.core ? 0 : Math.sign(dx || 1) * 18;
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    const path = svgElement("path", {
      class: edge.core ? "graph-edge core" : "graph-edge",
      d: `M${startX},${startY} Q${midX},${midY + curve} ${endX},${endY}`,
      "marker-end": "url(#graphArrow)",
      "data-source": edge.source,
      "data-target": edge.target,
    });
    graphSvg.appendChild(path);

    if (edge.core || edge.label.length < 10) {
      const label = svgElement("text", {
        class: "graph-edge-label",
        x: String(midX),
        y: String(midY + curve - 7),
        "text-anchor": "middle",
      });
      label.textContent = edge.label;
      graphSvg.appendChild(label);
    }
  }

  for (const node of missionGraph.nodes) {
    const group = svgElement("g", {
      class: "graph-node",
      transform: `translate(${node.x} ${node.y})`,
      tabindex: "0",
      role: "button",
      "data-node-id": node.id,
      "aria-label": `${node.label} ${node.type}`,
    });
    group.appendChild(svgElement("circle", { r: "20", fill: graphColors[node.type] || "#dce9ff" }));

    const alignRight = node.x > 720;
    const label = svgElement("text", {
      x: alignRight ? "-30" : "30",
      y: "-3",
      "text-anchor": alignRight ? "end" : "start",
    });
    label.textContent = node.label;

    const type = svgElement("text", {
      class: "type",
      x: alignRight ? "-30" : "30",
      y: "17",
      "text-anchor": alignRight ? "end" : "start",
    });
    type.textContent = node.type;

    group.append(label, type);
    group.addEventListener("click", () => selectGraphNode(node.id));
    group.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectGraphNode(node.id);
      }
    });
    graphSvg.appendChild(group);
  }
}

renderMissionGraph();

function formatTime(seconds) {
  return `${seconds.toFixed(1).padStart(4, "0")}s`;
}

function setInspector(title, body, meta = []) {
  inspectorTitle.textContent = title;
  inspectorBody.textContent = body;
  inspectorMeta.replaceChildren(
    ...meta.map(([key, value]) => {
      const row = document.createElement("div");
      const dt = document.createElement("dt");
      const dd = document.createElement("dd");
      dt.textContent = key;
      dd.textContent = value;
      row.append(dt, dd);
      return row;
    }),
  );
}

function markerRole(marker) {
  if (marker.label === "[ARM-2B]") return "Primary orbital command focus and densest synthetic track convergence.";
  if (marker.label === "[ARM-1A]") return "Western comparison node with drafting-red detection cluster.";
  if (marker.label === "[ARM-3C]") return "Eastern comparison node near concentrated small-vessel detections.";
  return "Outer mission reference point near the right-side patrol boundary.";
}

function selectMarker(marker) {
  appState.selectedMarker = marker.label;
  appState.selectedGraphNode = null;
  updateGraphSelection();
  setInspector(marker.label, markerRole(marker), [
    ["Type", "Mission site"],
    ["Layer", "ARM markers"],
    ["Data", "Synthetic"],
  ]);
}

function graphRelations(nodeId) {
  return missionGraph.edges.filter((edge) => edge.source === nodeId || edge.target === nodeId);
}

function selectGraphNode(nodeId) {
  const node = missionGraph.nodes.find((item) => item.id === nodeId);
  if (!node) return;
  appState.selectedGraphNode = nodeId;
  appState.selectedMarker = null;
  updateGraphSelection();
  const relations = graphRelations(nodeId);
  const relationText = relations
    .slice(0, 4)
    .map((edge) => `${edge.source === nodeId ? "to" : "from"} ${edge.source === nodeId ? edge.target : edge.source}: ${edge.label}`)
    .join("; ");
  setInspector(node.label, relationText || "No direct relationships in the current graph.", [
    ["Type", node.type],
    ["Edges", String(relations.length)],
    ["Mode", appState.mode[0].toUpperCase() + appState.mode.slice(1)],
  ]);
}

function updateGraphSelection() {
  const selected = appState.selectedGraphNode;
  const linkedIds = new Set([selected]);
  for (const edge of missionGraph.edges) {
    if (edge.source === selected || edge.target === selected) {
      linkedIds.add(edge.source);
      linkedIds.add(edge.target);
    }
  }

  graphSvg.querySelectorAll(".graph-node").forEach((nodeElement) => {
    const id = nodeElement.getAttribute("data-node-id");
    nodeElement.classList.toggle("is-active", id === selected);
    nodeElement.classList.toggle("is-muted", Boolean(selected) && !linkedIds.has(id));
  });

  graphSvg.querySelectorAll(".graph-edge").forEach((edgeElement) => {
    const source = edgeElement.getAttribute("data-source");
    const target = edgeElement.getAttribute("data-target");
    const active = Boolean(selected) && (source === selected || target === selected);
    edgeElement.classList.toggle("is-active", active);
    edgeElement.classList.toggle("is-muted", Boolean(selected) && !active);
  });
}

function updateLayerVisibility() {
  const showGraph = appState.layerState.graph && appState.mode !== "model";
  graphPanel.classList.toggle("is-hidden", !showGraph);
}

function setMode(mode) {
  appState.mode = mode;
  stage.classList.remove("mode-observe", "mode-model", "mode-graph");
  stage.classList.add(`mode-${mode}`);
  modeButtons.forEach((button) => {
    const isActive = button.dataset.mode === mode;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  modelPanel.classList.toggle("is-hidden", mode !== "model");
  updateLayerVisibility();

  if (mode === "observe") {
    setInspector("Mission overview", "Observe baseline synthetic tracks, detections, ARM mission markers, and entity relationships.", [
      ["Mode", "Observe"],
      ["Tracks", String(baseTracks.length)],
      ["Detections", String(baseDetections.length)],
    ]);
  } else if (mode === "model") {
    renderScenarioMetrics();
    setInspector("Scenario builder", "Adjust synthetic patrol assumptions, generate a scenario, and compare outputs against the baseline map.", [
      ["Mode", "Model"],
      ["Output", scenarioState.result ? "Generated" : "Pending"],
      ["Data", "Synthetic"],
    ]);
  } else {
    setInspector("Entity graph", "Select graph nodes to inspect relationships between organizations, technologies, concepts, threats, tactics, and metrics.", [
      ["Mode", "Graph"],
      ["Nodes", String(missionGraph.nodes.length)],
      ["Edges", String(missionGraph.edges.length)],
    ]);
  }
}

function updateTimeUI() {
  timeScrubber.value = animationState.time.toFixed(1);
  timeReadout.textContent = formatTime(animationState.time);
}

function updateModelValueLabels() {
  document.getElementById("droneCountValue").textContent = droneCountInput.value;
  document.getElementById("picketSpacingValue").textContent = `${picketSpacingInput.value} nm`;
  document.getElementById("rangeMultiplierValue").textContent = `${Number(rangeMultiplierInput.value).toFixed(1)}x`;
  document.getElementById("falsePositiveRateValue").textContent = `${falsePositiveRateInput.value}%`;
  document.getElementById("vesselDensityValue").textContent = vesselDensityInput.value;
}

function readScenarioConfig() {
  scenarioState.config = {
    droneCount: Number(droneCountInput.value),
    picketSpacing: Number(picketSpacingInput.value),
    rangeMultiplier: Number(rangeMultiplierInput.value),
    falsePositiveRate: Number(falsePositiveRateInput.value),
    vesselDensity: Number(vesselDensityInput.value),
    sensorPackage: sensorPackageInput.value,
  };
  updateModelValueLabels();
  return scenarioState.config;
}

function scenarioSeed(config) {
  const sensorWeight = config.sensorPackage === "fusion" ? 900 : config.sensorPackage === "eo_ir" ? 500 : 100;
  return 201400 + config.droneCount * 91 + config.picketSpacing * 17 + Math.round(config.rangeMultiplier * 100) + config.falsePositiveRate * 13 + config.vesselDensity * 7 + sensorWeight;
}

function makeScenarioTrack(cx, cy, rand, index, config) {
  const angle = 0.58 + (rand() - 0.5) * 0.5;
  const length = (0.18 + config.rangeMultiplier * 0.12 + rand() * 0.18) * (0.88 + config.droneCount * 0.035);
  const offset = (index - (config.droneCount - 1) / 2) * (config.picketSpacing / 900);
  const normalX = Math.cos(angle + Math.PI / 2);
  const normalY = Math.sin(angle + Math.PI / 2);
  const start = {
    x: clamp(cx + normalX * offset - Math.cos(angle) * length * 0.5, -0.05, 1.08),
    y: clamp(cy + normalY * offset - Math.sin(angle) * length * 0.5, -0.05, 1.05),
  };
  return {
    points: [
      start,
      { x: clamp(start.x + Math.cos(angle) * length * 0.45, -0.05, 1.08), y: clamp(start.y + Math.sin(angle) * length * 0.45, -0.05, 1.05) },
      { x: clamp(start.x + Math.cos(angle) * length, -0.05, 1.08), y: clamp(start.y + Math.sin(angle) * length, -0.05, 1.05) },
    ],
    color: "#67d28d",
    alpha: 0.84,
    width: 2.1,
    dashed: false,
    reveal: 0.6 + index * 0.24,
    duration: 5.2,
  };
}

function generateScenario() {
  const config = readScenarioConfig();
  const rand = mulberry32(scenarioSeed(config));
  const center = markerByLabel("[ARM-2B]");
  const tracks = [];
  const detections = [];
  const falsePositives = Math.round(config.vesselDensity * (config.falsePositiveRate / 100));
  const estimatedDetections = Math.round(config.vesselDensity * config.rangeMultiplier * (config.sensorPackage === "fusion" ? 1.18 : config.sensorPackage === "eo_ir" ? 1.05 : 0.92));

  for (let i = 0; i < config.droneCount; i += 1) {
    tracks.push(makeScenarioTrack(center.x + 0.09, center.y - 0.03, rand, i, config));
  }

  for (let i = 0; i < estimatedDetections; i += 1) {
    const track = tracks[Math.floor(rand() * tracks.length)];
    const point = track.points[Math.floor(rand() * track.points.length)];
    detections.push({
      x: clamp(point.x + (rand() - 0.5) * 0.16, 0.02, 0.98),
      y: clamp(point.y + (rand() - 0.5) * 0.13, 0.02, 0.96),
      color: "#67d28d",
      radius: 3.2 + rand() * 1.8,
      reveal: 2.0 + rand() * 6.0,
      phase: rand() * TWO_PI,
    });
  }

  for (let i = 0; i < falsePositives; i += 1) {
    detections.push({
      x: clamp(center.x + 0.08 + (rand() - 0.5) * 0.52, 0.02, 0.98),
      y: clamp(center.y + (rand() - 0.5) * 0.42, 0.02, 0.96),
      color: "#f08b4f",
      radius: 2.8 + rand() * 1.5,
      reveal: 2.4 + rand() * 6.0,
      phase: rand() * TWO_PI,
    });
  }

  const coverage = clamp(Math.round((config.droneCount * 11 + config.rangeMultiplier * 24 + config.picketSpacing * 0.7) * (config.sensorPackage === "fusion" ? 1.08 : 1)), 0, 100);
  const confidence = clamp(Math.round(coverage * 0.62 + (100 - config.falsePositiveRate) * 0.28 + config.rangeMultiplier * 8), 0, 99);
  scenarioState.result = {
    tracks,
    detections,
    metrics: {
      coverage,
      estimatedDetections,
      falsePositives,
      range: `${config.rangeMultiplier.toFixed(1)}x`,
      confidence,
    },
  };
  renderScenarioMetrics();
  setInspector("Scenario generated", `Coverage ${coverage}%, detections ${estimatedDetections}, false positives ${falsePositives}, range ${config.rangeMultiplier.toFixed(1)}x, confidence ${confidence}%. Synthetic output is layered over the baseline Observe tracks.`, [
    ["Coverage", `${coverage}%`],
    ["Detections", String(estimatedDetections)],
    ["Confidence", `${confidence}%`],
  ]);
}

function renderScenarioMetrics() {
  if (!scenarioState.result) {
    scenarioMetrics.innerHTML = "<div class=\"metric\"><strong>--</strong><span>Generate</span></div>";
    return;
  }

  const { coverage, estimatedDetections, falsePositives, range, confidence } = scenarioState.result.metrics;
  const metrics = [
    ["Coverage", `${coverage}%`],
    ["Detections", estimatedDetections],
    ["False pos.", falsePositives],
    ["Range", range],
    ["Confidence", `${confidence}%`],
  ];
  scenarioMetrics.replaceChildren(
    ...metrics.map(([label, value]) => {
      const metric = document.createElement("div");
      metric.className = "metric";
      const strong = document.createElement("strong");
      const span = document.createElement("span");
      strong.textContent = value;
      span.textContent = label;
      metric.append(strong, span);
      return metric;
    }),
  );
}

function drawScenario(transform, time) {
  if (!scenarioState.result) return;
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.shadowColor = "rgba(103, 210, 141, 0.4)";
  ctx.shadowBlur = 7 * transform.scale;
  for (const track of scenarioState.result.tracks) {
    const progress = clamp((time - track.reveal) / track.duration, 0, 1);
    drawFullPath(track, transform, 0.26, 0.85);
    if (progress > 0) {
      drawPartialPath(track, transform, easeInOut(progress));
    }
  }
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  for (const point of scenarioState.result.detections) {
    const reveal = easeOutCubic((time - point.reveal) / 1.8);
    if (reveal <= 0) continue;
    const p = project(point, transform);
    const pulse = 0.72 + Math.sin(time * 2.4 + point.phase) * 0.28;
    const radius = point.radius * transform.scale;
    ctx.globalAlpha = 0.2 * reveal * pulse;
    ctx.fillStyle = point.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius * 3.2, 0, TWO_PI);
    ctx.fill();
    ctx.globalAlpha = 0.92 * reveal;
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, TWO_PI);
    ctx.fill();
  }
  ctx.restore();
}

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const width = Math.floor(window.innerWidth);
  const height = Math.floor(window.innerHeight);
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

playPauseButton.textContent = animationState.playing ? "Pause" : "Play";
playPauseButton.setAttribute(
  "aria-label",
  animationState.playing ? "Pause animation" : "Play animation",
);

function mapTransform(time) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const targetAspect = BASE_WIDTH / BASE_HEIGHT;
  const viewportAspect = viewportWidth / viewportHeight;
  const baseScale = viewportAspect > targetAspect ? viewportWidth / BASE_WIDTH : viewportHeight / BASE_HEIGHT;
  const cycle = (time % LOOP_SECONDS) / LOOP_SECONDS;
  const breath = Math.sin(cycle * TWO_PI);
  const zoom = 1.035 + breath * 0.022;
  const panX = Math.sin(cycle * TWO_PI * 0.72 + 0.4) * 22;
  const panY = Math.cos(cycle * TWO_PI * 0.58 + 0.1) * 18;
  const width = BASE_WIDTH * baseScale * zoom;
  const height = BASE_HEIGHT * baseScale * zoom;
  const x = (viewportWidth - width) / 2 + panX * baseScale;
  const y = (viewportHeight - height) / 2 + panY * baseScale;
  return { x, y, scale: baseScale * zoom };
}

function project(point, transform) {
  return {
    x: transform.x + point.x * BASE_WIDTH * transform.scale,
    y: transform.y + point.y * BASE_HEIGHT * transform.scale,
  };
}

function markerAtCanvasPosition(clientX, clientY) {
  const transform = mapTransform(animationState.time);
  for (const marker of missionMarkers) {
    const p = project(marker, transform);
    const radius = Math.max(24, 34 * transform.scale * marker.focus);
    if (Math.hypot(clientX - p.x, clientY - p.y) <= radius) {
      return marker;
    }
  }
  return null;
}

function drawBackground(transform, time) {
  const shimmerX = Math.sin(time * 0.07) * 10;
  const shimmerY = Math.cos(time * 0.05) * 7;
  ctx.drawImage(
    backgroundCanvas,
    transform.x + shimmerX,
    transform.y + shimmerY,
    BASE_WIDTH * transform.scale,
    BASE_HEIGHT * transform.scale,
  );

  const gradient = ctx.createRadialGradient(
    window.innerWidth * 0.52,
    window.innerHeight * 0.46,
    window.innerWidth * 0.12,
    window.innerWidth * 0.52,
    window.innerHeight * 0.46,
    window.innerWidth * 0.7,
  );
  gradient.addColorStop(0, "rgba(7, 28, 70, 0)");
  gradient.addColorStop(0.72, "rgba(1, 6, 18, 0.16)");
  gradient.addColorStop(1, "rgba(0, 3, 12, 0.54)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
}

function pathLength(points) {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    total += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }
  return total;
}

function drawPartialPath(track, transform, progress) {
  const pointsOnScreen = track.points.map((point) => project(point, transform));
  const total = pathLength(pointsOnScreen);
  const target = total * progress;
  let drawn = 0;

  ctx.beginPath();
  ctx.moveTo(pointsOnScreen[0].x, pointsOnScreen[0].y);

  for (let i = 1; i < pointsOnScreen.length; i += 1) {
    const previous = pointsOnScreen[i - 1];
    const current = pointsOnScreen[i];
    const segment = Math.hypot(current.x - previous.x, current.y - previous.y);

    if (drawn + segment <= target) {
      ctx.lineTo(current.x, current.y);
      drawn += segment;
      continue;
    }

    const remaining = clamp((target - drawn) / segment, 0, 1);
    ctx.lineTo(lerp(previous.x, current.x, remaining), lerp(previous.y, current.y, remaining));
    break;
  }

  if (track.dashed) {
    ctx.setLineDash([10 * transform.scale, 9 * transform.scale]);
  } else {
    ctx.setLineDash([]);
  }

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = track.color;
  ctx.globalAlpha = track.alpha * easeOutCubic(progress);
  ctx.lineWidth = track.width * transform.scale;
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.setLineDash([]);
}

function drawFullPath(track, transform, alphaScale, widthScale) {
  const pointsOnScreen = track.points.map((point) => project(point, transform));

  ctx.beginPath();
  ctx.moveTo(pointsOnScreen[0].x, pointsOnScreen[0].y);
  for (let i = 1; i < pointsOnScreen.length; i += 1) {
    ctx.lineTo(pointsOnScreen[i].x, pointsOnScreen[i].y);
  }

  if (track.dashed) {
    ctx.setLineDash([10 * transform.scale, 9 * transform.scale]);
  } else {
    ctx.setLineDash([]);
  }

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = track.color;
  ctx.globalAlpha = track.alpha * alphaScale;
  ctx.lineWidth = Math.max(0.7, track.width * transform.scale * widthScale);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.setLineDash([]);
}

function drawTracks(transform, time) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  for (const track of baseTracks) {
    drawFullPath(track, transform, track.dashed ? 0.12 : 0.18, track.dashed ? 0.82 : 0.72);
  }

  ctx.shadowColor = "rgba(245, 200, 74, 0.32)";
  ctx.shadowBlur = 4 * transform.scale;
  for (const track of baseTracks) {
    const progress = clamp((time - track.reveal) / track.duration, 0, 1);
    if (progress <= 0) continue;
    drawPartialPath(track, transform, easeInOut(progress));
  }
  ctx.restore();
}

function drawPoints(transform, time) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  for (const point of baseDetections) {
    const reveal = easeOutCubic((time - point.reveal) / 2.2);
    if (reveal <= 0) continue;
    const p = project(point, transform);
    const pulse = 0.72 + Math.sin(time * 2.3 + point.phase) * 0.28;
    const radius = point.radius * transform.scale * (0.72 + reveal * 0.28);

    ctx.globalAlpha = 0.16 * reveal * pulse;
    ctx.fillStyle = point.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius * 2.8, 0, TWO_PI);
    ctx.fill();

    ctx.globalAlpha = 0.9 * reveal;
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, TWO_PI);
    ctx.fill();
  }
  ctx.restore();
}

function drawMarker(marker, transform, time) {
  const reveal = easeOutCubic((time - marker.reveal) / 1.8);
  if (reveal <= 0) return;

  const p = project(marker, transform);
  const baseRadius = 30 * transform.scale * marker.focus;
  const focusPulse = marker.label === "[ARM-2B]" ? 1 + Math.sin(time * 1.55) * 0.08 : 1;
  const radius = baseRadius * reveal * focusPulse;
  const haloRadius = radius * (1.45 + Math.sin(time * 1.1 + marker.x * 8) * 0.06);

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = 0.22 * reveal;
  ctx.fillStyle = COLORS.gold;
  ctx.beginPath();
  ctx.arc(p.x, p.y, haloRadius, 0, TWO_PI);
  ctx.fill();

  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  ctx.lineWidth = Math.max(2, 3 * transform.scale);
  ctx.fillStyle = "rgba(255, 215, 0, 0.72)";
  ctx.strokeStyle = COLORS.markerBlue;
  ctx.beginPath();
  ctx.arc(p.x, p.y, radius, 0, TWO_PI);
  ctx.fill();
  ctx.stroke();

  ctx.setLineDash([8 * transform.scale, 5 * transform.scale]);
  ctx.lineWidth = Math.max(1, 1.15 * transform.scale);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.86)";
  ctx.beginPath();
  ctx.arc(p.x, p.y, radius * 1.28, 0, TWO_PI);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.lineWidth = Math.max(1, 1.25 * transform.scale);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.74)";
  ctx.beginPath();
  ctx.arc(p.x, p.y, radius * 0.73, 0, TWO_PI);
  ctx.stroke();

  const tick = 12 * transform.scale;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.68)";
  ctx.beginPath();
  ctx.moveTo(p.x - radius - tick, p.y);
  ctx.lineTo(p.x - radius * 0.68, p.y);
  ctx.moveTo(p.x + radius * 0.68, p.y);
  ctx.lineTo(p.x + radius + tick, p.y);
  ctx.moveTo(p.x, p.y - radius - tick);
  ctx.lineTo(p.x, p.y - radius * 0.68);
  ctx.moveTo(p.x, p.y + radius * 0.68);
  ctx.lineTo(p.x, p.y + radius + tick);
  ctx.stroke();

  const labelOffsetX = marker.label === "[ARM-4D]" ? -132 : 48;
  const labelOffsetY = marker.label === "[ARM-1A]" ? -48 : -40;
  let labelX = p.x + labelOffsetX * transform.scale;
  let labelY = p.y + labelOffsetY * transform.scale;
  const fontSize = clamp(16 * transform.scale, 13, 24);

  ctx.font = `700 ${fontSize}px "Courier New", monospace`;
  ctx.textBaseline = "middle";
  const alignRight = marker.label === "[ARM-4D]";
  const measuredWidth = ctx.measureText(marker.label).width;
  labelY = clamp(labelY, 20, window.innerHeight - 96);
  labelX = alignRight
    ? clamp(labelX, measuredWidth + 12, window.innerWidth - 12)
    : clamp(labelX, 12, window.innerWidth - measuredWidth - 12);
  ctx.textAlign = alignRight ? "right" : "left";
  ctx.lineWidth = 5;
  ctx.strokeStyle = "rgba(2, 8, 18, 0.64)";
  ctx.strokeText(marker.label, labelX, labelY);
  ctx.fillStyle = COLORS.label;
  ctx.fillText(marker.label, labelX, labelY);
  ctx.restore();
}

function drawMarkers(transform, time) {
  for (const marker of missionMarkers) {
    drawMarker(marker, transform, time);
  }
}

function drawAttribution(transform) {
  ctx.save();
  ctx.font = "11px Inter, system-ui, sans-serif";
  ctx.fillStyle = "rgba(230, 238, 255, 0.36)";
  ctx.textBaseline = "alphabetic";
  const labels = [
    { x: 0.18, y: 0.64 },
    { x: 0.46, y: 0.81 },
    { x: 0.72, y: 0.67 },
    { x: 0.82, y: 0.28 },
  ];

  for (const label of labels) {
    const p = project(label, transform);
    ctx.fillText("Parametric synthesis data 2026", p.x, p.y);
  }

  ctx.restore();
}

function drawRhythmBands(time) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  const bands = [
    { y: 0.22, color: "rgba(255, 255, 255, 0.52)", phase: 0 },
    { y: 0.29, color: "rgba(0, 255, 0, 0.42)", phase: 9 },
    { y: 0.77, color: "rgba(217, 70, 239, 0.38)", phase: 18 },
  ];

  for (const band of bands) {
    const y = window.innerHeight * band.y + Math.sin(time * 0.8 + band.phase) * 4;
    ctx.fillStyle = band.color;
    for (let x = -30 + ((time * 18 + band.phase) % 44); x < window.innerWidth + 30; x += 44) {
      const size = band.y > 0.7 ? 5 : 4;
      ctx.fillRect(x, y, size, size);
    }
  }
  ctx.restore();
}

function drawScanline(time) {
  const y = ((time * 42) % (window.innerHeight + 180)) - 90;
  const gradient = ctx.createLinearGradient(0, y - 38, 0, y + 38);
  gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
  gradient.addColorStop(0.5, "rgba(180, 226, 255, 0.035)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, y - 38, window.innerWidth, 76);
}

function drawFrame(now) {
  const delta = Math.min((now - animationState.lastFrame) / 1000, 0.08);
  animationState.lastFrame = now;

  if (animationState.playing) {
    animationState.time = (animationState.time + delta * animationState.speed) % LOOP_SECONDS;
  }

  const transform = mapTransform(animationState.time);
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  if (appState.layerState.bathymetry) {
    drawBackground(transform, animationState.time);
  } else {
    ctx.fillStyle = "#0a192f";
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
  }
  if (appState.layerState.tracks) {
    drawTracks(transform, animationState.time);
  }
  if (appState.layerState.detections) {
    drawPoints(transform, animationState.time);
  }
  if (appState.layerState.scenario) {
    drawScenario(transform, animationState.time);
  }
  if (appState.layerState.markers) {
    drawMarkers(transform, animationState.time);
  }
  drawRhythmBands(animationState.time);
  drawAttribution(transform);
  drawScanline(animationState.time);
  updateTimeUI();

  if (loopRunning && shouldLoop()) {
    rafHandle = requestAnimationFrame(drawFrame);
  } else {
    loopRunning = false;
    rafHandle = 0;
  }
}

// Loop gating — only burn frames when the simulation is actually visible
// AND playing. Stops the rAF chain entirely when paused, off-screen, or
// the tab is hidden. This is what keeps scroll smooth on the parent page.
let rafHandle = 0;
let loopRunning = false;
let externallyPaused = false; // set by parent via postMessage when iframe is offscreen

function shouldLoop() {
  return animationState.playing && !externallyPaused && !document.hidden;
}

function startLoop() {
  if (loopRunning || !shouldLoop()) return;
  loopRunning = true;
  animationState.lastFrame = performance.now();
  rafHandle = requestAnimationFrame(drawFrame);
}

function stopLoop() {
  loopRunning = false;
  if (rafHandle) cancelAnimationFrame(rafHandle);
  rafHandle = 0;
}

function redrawOnce() {
  if (loopRunning) return;
  // One-shot frame for paused-state updates (scrubber, layer toggles, mode change).
  requestAnimationFrame(drawFrame);
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopLoop(); else startLoop();
});

window.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || typeof data !== "object" || data.source !== "armor-ops") return;
  if (data.action === "pause") {
    externallyPaused = true;
    stopLoop();
  } else if (data.action === "resume") {
    externallyPaused = false;
    startLoop();
  }
});

playPauseButton.addEventListener("click", () => {
  animationState.playing = !animationState.playing;
  playPauseButton.textContent = animationState.playing ? "Pause" : "Play";
  playPauseButton.setAttribute(
    "aria-label",
    animationState.playing ? "Pause animation" : "Play animation",
  );
  if (animationState.playing) startLoop(); else stopLoop();
});

restartButton.addEventListener("click", () => {
  animationState.time = 0;
  animationState.playing = true;
  playPauseButton.textContent = "Pause";
  updateTimeUI();
  startLoop();
});

speedButton.addEventListener("click", () => {
  animationState.speedIndex = (animationState.speedIndex + 1) % speedSteps.length;
  animationState.speed = speedSteps[animationState.speedIndex];
  speedButton.textContent = `${animationState.speed}x`;
});

timeScrubber.addEventListener("input", () => {
  animationState.time = Number(timeScrubber.value);
  animationState.playing = false;
  playPauseButton.textContent = "Play";
  updateTimeUI();
  stopLoop();
  redrawOnce();
});

modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

layerInputs.forEach((input) => {
  input.addEventListener("change", () => {
    appState.layerState[input.dataset.layer] = input.checked;
    updateLayerVisibility();
  });
});

[droneCountInput, picketSpacingInput, rangeMultiplierInput, falsePositiveRateInput, vesselDensityInput, sensorPackageInput].forEach((input) => {
  input.addEventListener("input", readScenarioConfig);
  input.addEventListener("change", readScenarioConfig);
});

generateScenarioButton.addEventListener("click", generateScenario);

canvas.addEventListener("click", (event) => {
  if (!appState.layerState.markers) return;
  const marker = markerAtCanvasPosition(event.clientX, event.clientY);
  if (marker) {
    selectMarker(marker);
  }
});

stage.classList.add("mode-observe");
updateModelValueLabels();
renderScenarioMetrics();
updateLayerVisibility();
updateTimeUI();
setMode("observe");
startLoop();
// Render at least one frame even if the loop is gated (paused via URL param,
// off-screen on first paint, etc.) so the canvas isn't blank.
if (!loopRunning) redrawOnce();
