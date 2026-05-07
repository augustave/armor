# 02 — Concept and Scenario Package

**Artifact id:** WSA-OUT-02-CSP
**Skill:** warfighter-systems-architect v1.0.0
**Owner role:** Operational Analysis Lead
**Phase:** imagine → scenario-design
**Mission threads:** MT-01, MT-02, MT-03
**Classification:** UNCLASSIFIED // FOR PUBLIC RELEASE
**Status:** draft
**Inputs consumed:** `01_mission_analysis_brief.md`, all four input docs

## 1. Concept options (≥3, screened before convergence)

Per the skill's `imagine` phase, the analyst must generate multiple concept options and apply trade criteria before converging on a recommendation. Five options were generated; three survive the first screen.

### CO-A — "Continuous picket" (BASELINE — survives)

Four Voyager-class USVs, ~18 nm apart, station-kept along an approach lane. Each USV runs radar + EO/IR + classifier. Detections fused on-platform, alerts pushed to sector watch floor. Comms LOS-primary, SATCOM-backup. **This is the concept implied by the existing site and SD-2014 webapp.**

| Trade criterion | Score (1–5) | Note |
|---|---|---|
| Mission relevance | 5 | Direct map to operator pain. |
| Operator burden | 4 | Calibrated alerts; binding test deferred to 04. |
| Technical plausibility | 4 | All three sensor classes are mature; fusion is the open risk. |
| Survivability | 3 | Loss of one ARM-site degrades coverage by ~25%. |
| Cost / sortie-hour | 4 | Likely better than crewed; needs trade. |
| Variant fit | 5 | Clean USCG-first, USN/Allied-second sequencing. |

### CO-B — "Sparse-and-mobile picket" (survives)

Two Voyager-class USVs, ~36 nm apart, but each with a higher cruise speed and a roving patrol pattern rather than station-keeping. Trades coverage for unpredictability (adversary cannot route around static stations).

| Trade criterion | Score | Note |
|---|---|---|
| Mission relevance | 4 | Solves the same problem differently. |
| Operator burden | 3 | Mobile picket complicates the alert-context UX. |
| Technical plausibility | 4 | Same sensor stack. |
| Survivability | 4 | Unpredictability raises adversary's targeting cost. |
| Cost / sortie-hour | 5 | Half the platforms. |
| Variant fit | 3 | Less obvious story for USCG vs. USN. |

### CO-C — "Tethered watcher + cued investigators" (survives)

One persistently-on-station Voyager-class watcher per approach (the radar/EO-IR sensor node). On detection, **separately-launched smaller, faster, expendable USVs** are dispatched to investigate / classify / hold the contact. Two-tier system.

| Trade criterion | Score | Note |
|---|---|---|
| Mission relevance | 4 | Partitions the detection / investigation problem cleanly. |
| Operator burden | 3 | Two assets to reason about per detection. |
| Technical plausibility | 3 | Adds a second platform program; adds launch authority complexity. |
| Survivability | 5 | Watcher rarely leaves safe water; investigator is the loss-tolerant edge. |
| Cost / sortie-hour | 3 | Two-tier fleet to fund. |
| Variant fit | 4 | Distinguishable USCG (interceptor) and USN (multi-domain) profiles. |

### CO-D — "Air-deployed sonobuoy-style transient picket" (REJECTED)

Air-dropped expendable surface sensors, each lasting hours, refreshed by aircraft sortie. Rejected because aviation-sortie cost dominates and the concept reverts to the very problem ARMOR is trying to solve.

### CO-E — "Crewed-cutter-as-mothership USV swarm" (REJECTED)

Cutter-deployed dozens-of-small-USVs swarm. Rejected because (a) the operator-burden surface is unmanageable at concept stage, (b) the COLREGS / authorities review for a swarm in U.S. coastal water is a gating risk this concept run cannot solve, and (c) it presupposes a cutter, which removes the "without expanding crew exposure" benefit.

### Convergence statement

**CO-A (continuous picket)** is the recommended baseline. **CO-B** and **CO-C** are kept alive as alternates in 03's sensitivity analysis and in 05's variant matrix discussion. CO-D and CO-E are dropped.

> **Assumption A-CSP-01.** This screen reflects 1 analyst's evaluation, not a sponsor's preferences. The convergence is **provisional**; sponsor can re-rank.

## 2. Scenario seeds (baseline + 2 stress)

### S-1 — BASELINE: "Routine dawn watch"

| Variable | Value |
|---|---|
| Theater | San Diego coastal approach (PSS-1.0 reference grid) |
| Sea state | Beaufort 2 |
| Visibility | 8 nm |
| Daylight | dawn transition (low light) |
| Comms | LOS continuous |
| GNSS | nominal |
| Adversary COA | COA-1 (single panga, hug-coast route) |
| Picket geometry | 4 platforms, 18 nm spacing, 1.6× range, fusion sensor |
| Vessel density | 45 (medium) |
| False-positive rate (sim) | 10% |
| Civil traffic | recreational + fishing |

**Expected outcome:** ARMOR detects, classifies, alerts inside 90 s of detection threshold; watch officer vectors a HC-144 sortie; classifier confidence ≥ 0.75 sustained for 4 minutes.

### S-2 — STRESS: "Mimicked fishing pattern + clutter"

| Variable | Value |
|---|---|
| Adversary COA | COA-4 (spoofed AIS, mimicked fishing-vessel pattern) + clutter-hugging |
| Civil traffic | very high (port-approach window) |
| Vessel density | 75 |
| Other knobs | as S-1 |

**Expected outcome:** ARMOR's classifier flags a behavior-pattern mismatch with confidence 0.55–0.65 — **below the calibrated alert threshold**. Pattern-of-life store accumulates the track for retrospective analysis. Watch officer is **not** auto-alerted; pattern is surfaced on the next intel-analyst pass. Demonstrates ARMOR's **non-overclaim** posture.

### S-3 — STRESS: "Comms denial + multi-craft swarm"

| Variable | Value |
|---|---|
| Adversary COA | COA-2 (decoy + real run) and COA-6 (jamming) |
| Comms | RF link-budget closes 25% duty cycle (jamming); SATCOM closes 60% |
| Sea state | Beaufort 4 |
| Other knobs | as S-1 |

**Expected outcome:** ARMOR's autonomy-on-the-edge fallback engages: each platform continues classification independently; alerts buffer with timestamps; when comms recover, prioritized backlog flushes to watch floor in ≤ 10 s. Watch officer sees "stale-but-buffered" markers; one decoy vector and one real vector. Demonstrates MT-02.

> **Assumption A-CSP-02.** S-3's "buffer-and-flush" behavior is a design intent. Output 04 §"C2 Message Flow" carries the implementation. No simulation evidence yet.

## 3. Red / Blue / White-cell logic

### Blue (ARMOR + sector watch)

- ARMOR: detect, fuse, classify, alert, persist.
- Watch officer: triage alerts, vector responder, mark false / escalate / suppress.
- Responder (cutter / aviation / RHIB): per existing sector tasking.

### Red (adversary)

- Default: COA-1 (predictable run).
- Stress: COA-2 (decoy), COA-4 (mimicry), COA-6 (jamming).
- Out of scope: COA-5 (kinetic against ARM-site), COA-3 details (handled by sensor model).

### White-cell (rules / referees)

- COLREGS apply at all times to ARMOR (concept commitment).
- ARMOR may not engage. Detection only.
- ARMOR's classifier must be calibrated; over-alerting is a recorded fault.
- Operator-burden delta is measured per scenario and reported as a primary metric.

## 4. Measures (primary + secondary)

### Primary (the gating success criteria)

| ID | Measure | Direction | Threshold |
|---|---|---|---|
| M-1 | **Useful-detection rate** = correct-classification alerts / true positives in scenario window | maximize | ≥ 0.80 baseline; ≥ 0.55 stress |
| M-2 | **Wasted-sortie rate** = false-positive alerts × (sortie cost) | minimize | ≤ 0.50× crewed-alternative baseline |
| M-3 | **Operator-burden delta** = composite cognitive-load measure vs. today | minimize | **≤ 0** (parity is the floor) |
| M-4 | **Time-to-actionable-alert** = detection threshold to watch-officer alert | minimize | ≤ 90 s baseline; ≤ 5 min comms-stressed |

### Secondary

| ID | Measure | Use |
|---|---|---|
| M-5 | Coverage-area minutes per ARM-site per day | platform / picket sizing |
| M-6 | Track-continuity (mean time-on-track before death/handoff) | fusion / autonomy quality |
| M-7 | Classifier calibration error (Brier or ECE) | trust-calibration UX |
| M-8 | Comms-link-budget utilization | platform / variant tuning |
| M-9 | Per-platform availability (A0 / Ai) | sustainment / loss-tolerance |

## 5. Decision thresholds (where measures translate to gate calls)

| Gate | Trigger |
|---|---|
| Continue concept → architect | M-1 ≥ 0.75, M-3 ≤ 0 in baseline scenario; sensitivity-stable |
| Continue → sponsored experiment | M-1 ≥ 0.65 in S-2; M-4 ≤ 5 min in S-3 |
| Stop concept (NG-02) | Real sensor performance < 0.5× lab quote in any scenario |
| Stop concept (NG-01) | M-3 > 0 with statistical significance |

## 6. Interface inventory (preview for 04)

| Interface | Lane(s) | Owner |
|---|---|---|
| ARMOR → sector watch (alert) | software | 04 |
| Watch officer → ARMOR (override / suppress / mark) | software | 04 |
| Inter-platform mesh (track sharing) | software / hardware | 04 + 05 |
| Platform → SATCOM | hardware | 05 |
| Platform → on-platform compute (sensor → fusion → classifier) | software / hardware | 04 + 05 |
| Pattern-of-life store ↔ analyst client | software | 04 |
| Maintenance / launch-and-recovery | hardware / process | 05 + 06 |

## 7. Gates

| Gate | Status |
|---|---|
| mission-relevance | PASS |
| operational-realism | CONDITIONAL — S-2 / S-3 plausible; sponsor can re-rank |
| concept-screen | PASS — 3 of 5 concepts retained, with rationale |

## 8. Assumptions Ledger

| ID | Assumption | Risk |
|---|---|---|
| A-CSP-01 | Single-analyst convergence on CO-A. | Medium — sponsor can override. |
| A-CSP-02 | Buffer-and-flush is the right comms-denial behavior. | Medium — alternative is "graceful coast-shore handoff via aviation relay." |
| A-CSP-03 | Three scenarios (S-1, S-2, S-3) are sufficient for concept stage. | Low — adequate for screening; expand for experiment. |
| A-CSP-04 | M-3 (operator-burden delta) is measurable in concept-stage tests. | Medium — needs an operator-test rig that doesn't yet exist. |

## 9. Evidence

| Source | Use | Strength |
|---|---|---|
| Public-domain USCG D11 sortie pattern | grounds S-1 | Medium |
| `ops/main.js` scenario formulas | populates baseline expected outcomes | Low (illustrative; per A-SB-01) |
| Generic small-vessel detection literature | grounds COA-1 / COA-3 | Medium |
| (placeholder) operator interviews | grounds operator-burden hypothesis | None yet |

## 10. Open questions

- OQ-CSP-01: Is M-3 (operator burden) the right name, or does the sponsor measure it differently?
- OQ-CSP-02: Does CO-C (two-tier watcher + investigator) deserve a parallel concept track, or stay as alternate?
- OQ-CSP-03: Should S-2 / S-3 be split further (mimicry vs. jamming as separate scenarios)?

## 11. Dependencies

- 03 will validate the picket-geometry and sensor sensitivity (M-1, M-2, M-5).
- 04 must implement the calibrated-alert UX that lets M-3 stay ≤ 0.
- 05 must size the platform / comms / power so M-4 is achievable.
- 06 will translate M-3 into a qualification test rig.

## 12. Next actions

1. Author 03 with sensitivity sweep over the SD-2014 scenario knobs.
2. Stand up an M-3 operator-burden test approach (paper prototype) in parallel.
3. Confirm CO-A / CO-B / CO-C ranking with one external reviewer before architecture.
