# 01 — Mission Analysis Brief

**Artifact id:** WSA-OUT-01-MAB
**Skill:** warfighter-systems-architect v1.0.0
**Owner role:** Warfighter Research Lead → Operational Analysis Lead
**Phase:** orient → frame
**Mission threads:** MT-01 (primary), MT-02, MT-03
**Classification:** UNCLASSIFIED // FOR PUBLIC RELEASE
**Status:** draft
**Inputs consumed:** `inputs/mission_problem_statement.md`, `inputs/threat_and_operational_context.md`

## 1. One-paragraph framing

ARMOR is a concept for a **distributed, persistently-on-station, autonomous surface-vessel layer** that augments crewed maritime patrol with continuous detection coverage of small-vessel approaches in coastal/littoral water. Its primary user is a USCG District-11-class **sector watch officer** who today cannot keep eyes on every approach lane every hour. ARMOR's intended effect is to **convert detection-sparsity into responder-vectoring**: every approach gets continuous, calibrated awareness, and crewed assets only sortie when sortie is warranted. The success measure is not "more detections" but **fewer wasted sorties + fewer missed runs**, with **no increase in operator burden.**

## 2. Decision targets (re-stated from input, with current bias)

| ID | Decision | Bias from this analysis | Confidence |
|---|---|---|---|
| DT-01 | Justify a sponsored experiment with a USCG District? | **Yes** — concept passes mission-relevance and is internally coherent. | Medium-High |
| DT-02 | Which sensor package wins the integration slot first? | **Fusion (radar + EO/IR + classifier)**, deferring classifier maturity. | Medium |
| DT-03 | Multi-service variant strategy sound or distraction? | **Sound but sequenced** — USCG-first, USN second, Allied third. | Medium |
| DT-04 | Minimum viable picket count and spacing? | **4 platforms / 18 nm baseline**, sweep in 03. | Low (concept-stage) |
| DT-05 | Is Voyager-class the right platform? | **Voyager-class yes; sole-source Saildrone undecided.** | Medium |

## 3. Stakeholder map

| Stakeholder | Interest | Influence | Action item |
|---|---|---|---|
| USCG District watch officer | Direct user | High | 3 named-officer interviews before next cycle |
| USCG sector tasking authority | Consumer of vectored alerts | High | Brief on calibrated-alert UX (see 04) |
| USCG aviation operations | Affected (cued sorties) | Medium | Confirm vectoring latency budget |
| USN Surface Development Squadron / NSWC littoral | Variant sponsor | Medium-High | Hold variant talks until USCG demonstrator runs |
| Saildrone (or vendor B / C) | Platform supplier | Medium | Confirm availability + lead time (DT-05) |
| DHS / CBP / Air & Marine Operations | Adjacent capability | Medium | Coordination, not integration, at this stage |
| Civil port authorities | Co-existence in coastal traffic | Low | COLREGS / authorities review (06) |
| Allied / FMS sponsor | Eventual customer | Low | Defer until USCG + USN traction proven |

## 4. Mission threads (with handoff statements)

### MT-01 — Persistent littoral picket against small-vessel illicit traffic (San Diego baseline)

A 4-platform, ~18 nm picket along a USCG District 11 approach lane provides continuous detection coverage. Detections are fused (radar + EO/IR + classifier) on-platform, calibrated, and surfaced to the sector watch officer as alerts with confidence and behavior summary. Watch officer vectors a responder; ARMOR maintains the track until handoff. Pattern-of-life data is logged for retrospective analysis.

**Handoff to architecture:** the architectural lanes of MT-01 are owned by 04 (software/C2) and 05 (hardware/platform). Validation (03) covers the picket-geometry / sensor-package sensitivity.

### MT-02 — Distributed surveillance handoff under degraded comms / contested EW

When the link budget closes only intermittently (or is denied), ARMOR continues station-keeping, continues to detect, and **buffers** detections + tracks + classifier outputs. When comms recover, ARMOR sends a **prioritized, time-tagged alert backlog** with confidence preserved. The watch officer's UX surfaces "stale-but-buffered" cleanly so it isn't mistaken for live.

**Handoff to architecture:** owned primarily by 04 (autonomy boundary, C2 store-and-forward). Hardware envelope (compute, datalink) is owned by 05.

### MT-03 — Multi-service force aggregation (USCG primary; USN / Allied variants)

ARMOR's variant strategy converges the **platform** baseline across services and varies the **payload/livery/authorities-integration kit**. A single platform line, three operational-stack profiles. This is the productization claim.

**Handoff:** owned by 05 (variant matrix, manufacturing readiness) and 06 (per-variant qualification scope).

## 5. Operator burden hypothesis (the gating UX claim)

> The watch officer's cognitive load with ARMOR fielded is **less than or equal to** today's load, while detection coverage is materially higher.

This is achieved because:

1. ARMOR surfaces **calibrated alerts**, not raw track lists. The classifier carries the burden of "is this worth waking someone for."
2. ARMOR's UI is **subordinate to** the existing watch-floor surface, not a replacement.
3. ARMOR's confidence model is **legible** ("0.81 small-vessel-running-illicit-pattern, last seen 8 nm WSW of Pt. Loma, 03 min ago") — not a black-box probability.
4. ARMOR's override path is **always one click** ("Mark false / Suppress / Escalate").

**This hypothesis is the binding constraint.** If operator-test fails it, the concept fails (NG-01). Output 04 §"Operator Control Surface" is where this gets concretized.

## 6. No-go conditions (re-stated from input, gate-mapped)

| Condition | Mapped gate(s) |
|---|---|
| NG-01: Operator burden increases | operator-trust-and-burden |
| NG-02: Sensor performance < 0.5× lab quote in real conditions | technical-plausibility, operational-realism |
| NG-03: COLREGS / authorities gate the autonomy posture | qualification-readiness, deployment-readiness |
| NG-04: Comms link budget cannot close | technical-plausibility |
| NG-05: Per-track-hour cost > crewed alternative | deployment-readiness |

Any one **fail** → concept fails.

## 7. Gates (this artifact)

| Gate | Status | Notes |
|---|---|---|
| mission-relevance | **PASS (provisional)** | Bound to A-MP-01: needs primary-source operator interviews. |
| operational-realism | **CONDITIONAL** | COA-2/4/6 are credible adversary moves; not yet sponsor-validated. |
| operator-trust-and-burden | **DEFERRED** | The binding test belongs to 04 + an operator experiment, not this brief. |

## 8. Assumptions Ledger

| ID | Assumption | Risk |
|---|---|---|
| A-MAB-01 | "Fewer wasted sorties + fewer missed runs" is the right success metric pair. | High if measure is wrong; medium otherwise. |
| A-MAB-02 | The watch officer is the right primary user. (Versus, e.g., the cutter captain.) | Medium. Validated by interviews. |
| A-MAB-03 | The variant strategy can be sequenced, not parallel. | Medium. If parallel demand exists, 05 capacity assumptions break. |
| A-MAB-04 | Operator burden parity is a hard constraint. | High — drops the concept if relaxed. |

(Also inherits all assumptions from inputs.)

## 9. Evidence

| Source | Type | Strength |
|---|---|---|
| `index.html` mission copy | concept-internal voice | Low (self-reference) |
| `ops/main.js` mission graph | concept-internal model | Medium (operational logic encoded) |
| Public reporting on USCG D11 small-vessel interdiction | external | Medium |
| (placeholder) operator interviews | external | None yet |
| (placeholder) crewed-alternative cost | external | None yet |

## 10. Open questions

(Inherited from inputs plus this brief's own.)

- OQ-MAB-01: Is the binding metric "fewer wasted sorties" or "fewer missed runs"? Both? They have different sensor implications.
- OQ-MAB-02: At what cumulative operator-burden delta does the concept fail? +5%? +10%? (Today: undefined.)
- OQ-MAB-03: Is the variant strategy fund-able as one program, or does each variant need its own program of record?

## 11. Dependencies (downstream)

- 02 takes MT-01/02/03 forward into concept generation.
- 04 must absorb the operator-burden hypothesis as a binding constraint.
- 06 must qualification-map NG-03 (COLREGS / authorities).

## 12. Next actions

1. Schedule 3 operator interviews (USCG D11 priority).
2. Author 02 immediately; do not let mission framing drift before concepts are screened.
3. Confirm DT-05 (platform) before 05 commits to a Voyager-class mass / power envelope.
