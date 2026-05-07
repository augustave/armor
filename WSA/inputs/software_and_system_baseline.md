# Software and System Baseline

**Artifact:** input/software_and_system_baseline
**Skill:** warfighter-systems-architect v1.0.0
**Owner role:** Mission Software Lead
**Mission threads:** MT-01, MT-02
**Classification:** UNCLASSIFIED // FOR PUBLIC RELEASE
**Status:** draft

This document captures the software baseline that **demonstrably exists** in the ARMOR project today — the SD-2014 mission webapp (`/ops/`) — and describes what that baseline is, is not, and where the gaps to a fielded mission stack lie.

## 1. The actual artifact

`SD-2014` is a self-contained Canvas-2D mission webapp that ships at `/ops/index.html` + `/ops/styles.css` + `/ops/main.js`. It is the visible software surface of the ARMOR concept. It is:

- A **single-page client application**. No backend, no auth, no networking.
- A **simulation surface**, not a tasking surface. Everything it shows is procedurally generated from a deterministic `mulberry32` PRNG seed.
- A **demonstrator**, not the autonomy stack. It does not contain a real fusion algorithm, a real autonomy planner, or a real C2 message transport.

> Treat this as the **operator-facing UI envelope only**. The autonomy stack, fusion stack, and C2 transport are notional and will need to be authored separately when ARMOR moves past concept stage.

## 2. Operator surface (what the user sees)

### Modes (three)

| Mode | Purpose | Source |
|---|---|---|
| **Observe** | Continuous map view: bathymetry, tracks, detections, ARM-site markers. Default mode. | `ops/index.html` line 33 |
| **Model** | Scenario-builder view: scenario knobs and computed metrics. | `ops/index.html` line 34 |
| **Graph** | Mission entity graph: 16 nodes, 17 edges, organizations / tech / threats / metrics / tactics. | `ops/index.html` line 35 |

### Layers (six toggleable)

| Layer | Purpose |
|---|---|
| Bathymetry | Procedural depth field |
| Tracks | Continuous polyline tracks (154 baseline) |
| Detections | Pulsing point detections (162 baseline; 28 red ARM-1A, 32 red ARM-3C, 86 blue tracks, 16 blue ARM-2B) |
| ARM markers | Four named picket sites |
| Entity graph | The mission graph layer |
| Scenario | Generated scenario overlay (red detections + new tracks) |

### Timeline controls

- **Play / Pause** (button)
- **Restart** (resets to t=0, plays)
- **Speed**: 1.0× / 1.5× / 0.6× (toggle)
- **Scrubber**: 0.0–28.0 seconds, 0.1s precision, pauses on input

### URL state

- `?t=N` — seek to time N (also implemented for screenshot capture).
- `?paused=1` — start paused.

### Inspector / detail panels

- Click a marker → inspector populates with marker title and a body description (e.g., `[ARM-2B]` shows "Central focus marker — strongest pulse").
- Click a graph node → inspector populates with node label, type, related-edges summary.

## 3. Scenario builder (the closest thing to a model)

`ops/main.js` exposes six scenario knobs and computes four output metrics:

| Knob | Range | Default | Units |
|---|---|---|---|
| `droneCount` | 2 – 8 | 4 | discrete |
| `picketSpacing` | 8 – 40 | 18 | nautical miles |
| `rangeMultiplier` | 0.8 – 2.4 | 1.6 | ratio (× baseline sensor range) |
| `falsePositiveRate` | 2 – 28 | 10 | percent |
| `vesselDensity` | 10 – 90 | 45 | unitless density score |
| `sensorPackage` | radar / eo_ir / fusion | fusion | enum |

Computed outputs (formulas in `ops/main.js` ~lines 660–740):

```
sensorWeight  = (fusion: 900, eo_ir: 500, radar: 100)
coverage_pct  = clamp(0..100,
                  droneCount * 11 +
                  rangeMultiplier * 24 +
                  picketSpacing * 0.7 +
                  sensorWeight * 0.04)
estimated_detections = vesselDensity * rangeMultiplier *
                       (1 + (sensorPackage == fusion ? 0.4 : 0))
false_positives      = vesselDensity * (falsePositiveRate / 100)
confidence_pct       = clamp(0..100,
                       coverage_pct * 0.62 +
                       (100 - falsePositiveRate) * 0.28 +
                       rangeMultiplier * 8)
```

> **Assumption A-SB-01.** These formulas are **illustrative**, not validated. They are present so the scenario builder feels responsive; they have no direct mapping to a real sensor model. Output 03 must NOT cite them as evidence — it cites them as a placeholder evidence path that is awaiting a real model.

## 4. Mission entity graph (16 nodes, 17 edges)

Node types (six):

| Type | Examples |
|---|---|
| `org` | DHS, CBP, USCG, Saildrone (SD) |
| `tech` | Saildrone Voyager, Radar algorithms, EO/IR cameras, ML software |
| `concept` | Small-vessel surveillance (SV), Pangas, MDA |
| `threat` | Drug trafficking, Smuggling |
| `process` | User refinement |
| `metric` | Range improvement, False-positive reduction |
| `tactic` | Picket formation |

Marked **core edges** (graph `coreEdge: true`):

1. SD → Voyager — "deploys"
2. Voyager → Radar — "uses"
3. Voyager → MDA — "enhances"
4. Voyager → Pangas — "tracks"
5. Picket → SV — "mission tactic"

These five edges encode the operational claim of the concept: **a Saildrone-deployed Voyager-class platform, equipped with radar (and other sensors), enhances Multi-Domain Awareness by tracking small-vessel illicit traffic in a picket formation.**

## 5. What the SD-2014 webapp is NOT (the stack gap)

The following are **explicit gaps** between the demonstrator and a real mission software baseline. Each one becomes a section in `04_mission_software_c2_architecture_definition.md`.

| Gap | What's missing | Owner-of-resolution |
|---|---|---|
| GAP-SW-01 | A real **sensor-fusion algorithm** (radar + EO/IR + classifier). | 04 §"Fusion Contract" |
| GAP-SW-02 | A real **autonomy planner** (mission, contingency, deconfliction). | 04 §"Autonomy Boundaries" |
| GAP-SW-03 | A real **C2 message transport** (link-budget-aware, store-and-forward, encryption). | 04 §"C2 Message Flow" |
| GAP-SW-04 | A real **target handoff protocol** to the responding asset. | 04 §"Target Handoff" |
| GAP-SW-05 | A real **trust-calibration UX** (confidence bands, behavior summary, override path). | 04 §"Operator Control Surface" |
| GAP-SW-06 | **Track-management** infrastructure (TMA, association, death). | 04 §"Track Lifecycle" |
| GAP-SW-07 | **Behavior classification** (legitimate fishing vs. mimicked-fishing pattern, etc.). | 04 §"Behavior Models" |
| GAP-SW-08 | **Persistence** of pattern-of-life data (storage, query, retention). | 04 §"Pattern-of-Life Store" |
| GAP-SW-09 | A real **failure-mode model** (sensor fail, comms loss, platform loss, classifier drift). | 04 §"Failure Modes" |
| GAP-SW-10 | **Audit / accountability** for watch-officer decisions cued by ARMOR. | 04 §"Audit Trail" |

## 6. Non-functional posture (claimed by site, mostly aspirational)

| Aspect | Public-site claim | Real status |
|---|---|---|
| Reliability | "Persistent maritime presence" | No reliability model at concept stage |
| Latency | (not stated) | No latency budget at concept stage |
| Security | "Black channel active" | Marketing copy; no TLS / crypto / key-mgmt design yet |
| Privacy | (not stated) | Track / pattern data needs a retention policy |
| Operational availability | "Watch, screen, relay" continuous | No A0/Ai numbers yet |

## 7. Build & deploy

The SD-2014 webapp is **plain HTML/CSS/JS**, served as static files. Currently deployed via GitHub Pages at `https://augustave.github.io/armor/ops/`. There is no backend.

This baseline is **fine for the demonstrator** and explicitly **insufficient for a fielded program**. Output 04 specifies the production stack; output 05 specifies the platform-resident stack.

## 8. Assumptions Ledger

| ID | Assumption | Risk if wrong |
|---|---|---|
| A-SB-01 | The SD-2014 scenario formulas are illustrative, not predictive. | High if ever cited as evidence — must remain bounded. |
| A-SB-02 | A static-page demonstrator is appropriate for the **concept** stage. | Low — explicitly noted as transitional. |
| A-SB-03 | The mission entity graph (16 nodes, 17 edges) accurately encodes the concept's operational claim. | Medium — primary authoring artifact, should be reviewed by sponsor before architecture. |
| A-SB-04 | The six scenario knobs are the right knobs. | Medium — knob set should be revisited at architect phase. |

## 9. Open questions

- OQ-SB-01: What real fusion algorithm is the program building toward? COTS, GFE, or custom?
- OQ-SB-02: What real autonomy stack is the program building toward? ROS2-based, custom, or vendor-provided?
- OQ-SB-03: What is the realistic latency budget for the alert path?
- OQ-SB-04: Where does the pattern-of-life store live (on-platform, sector-shore, both)?
- OQ-SB-05: What's the policy for when ARMOR's classifier disagrees with the watch officer?

## 10. Next actions

1. Replace the illustrative scenario formulas in 03 with a real sensor model when one is sourced.
2. Author 04 with explicit resolutions for GAP-SW-01 through GAP-SW-10.
3. Confirm the 16-node mission graph with the program's first identified sponsor.
