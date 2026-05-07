# 04 — Mission Software and C2 Architecture Definition

**Artifact id:** WSA-OUT-04-SWA
**Skill:** warfighter-systems-architect v1.0.0
**Owner role:** Mission Software Lead
**Phase:** architect
**Mission threads:** MT-01 (primary), MT-02
**Classification:** UNCLASSIFIED // FOR PUBLIC RELEASE
**Status:** draft
**Inputs consumed:** `01`, `02`, `03`, `inputs/software_and_system_baseline.md`

> This document specifies what a real ARMOR software stack must do. It distinguishes the **operator-facing UI envelope** (which exists in SD-2014) from the **autonomy / fusion / C2 stack** (which is a clean spec). It binds the operator-burden hypothesis from 01 §5.

## 1. Top-level architecture

```
                     ┌────────────────────────────────────┐
                     │     Sector Watch Floor (Tier-3)    │
                     │   - calibrated alerts              │
                     │   - pattern-of-life query          │
                     │   - override / suppress / escalate │
                     └────────────────┬───────────────────┘
                                      │ (alert API, query API)
                                      ▼
                     ┌────────────────────────────────────┐
                     │       Mission C2 (Tier-2)          │
                     │  - alert calibration & dispatch    │
                     │  - track lifecycle (cross-platform)│
                     │  - pattern-of-life store           │
                     │  - audit trail                     │
                     └────────────────┬───────────────────┘
                                      │ (mesh + SATCOM + LOS)
                                      ▼
              ┌───────────────────────┴────────────────────────┐
              │                                                │
   ┌──────────▼─────────┐                          ┌───────────▼────────┐
   │   ARM-site N       │   ◄─── inter-platform ──►│   ARM-site M       │
   │ (Voyager-class)    │           mesh           │ (Voyager-class)    │
   │  Tier-1 on-edge:   │                          │  Tier-1 on-edge:   │
   │   sensor → fusion  │                          │   sensor → fusion  │
   │   classifier       │                          │   classifier       │
   │   autonomy planner │                          │   autonomy planner │
   │   buffer / store-and-forward                  │                    │
   └────────────────────┘                          └────────────────────┘
```

Three tiers:

- **Tier-1 (on-platform).** Sensor → fusion → classifier → autonomy → buffer. Latency-critical. Must function autonomously when comms denied.
- **Tier-2 (Mission C2).** Cross-platform track management, pattern-of-life store, alert calibration, audit. Shore-resident or cutter-resident.
- **Tier-3 (Watch Floor).** The operator surface. Calibrated alerts in, override/escalate out.

## 2. Autonomy boundaries

The single most important architectural decision in this concept.

### Authorities posture (concept-level commitment)

| Action | Who decides | Notes |
|---|---|---|
| Detect | Platform | Sensor / fusion / classifier — unattended |
| Classify | Platform | Confidence-graded; below-threshold suppressed |
| Alert | Platform → Mission C2 → Watch | Calibration applied at Tier-2 |
| **Vector responder** | **Watch officer (human)** | ARMOR may not |
| Move ARM-site (station-keeping deviation) | Platform within bounded geofence; Tier-2 for outside | |
| Engage / interact with target | **Never** ARMOR | Outside concept scope |
| Move outside geofence under jamming | Platform on pre-tasked recovery path | Pre-authorized at mission start |
| Self-destruct / scuttle on capture risk | **Watch officer or Tier-2 only** | Out for concept stage |

> **A-SWA-01.** Authorities posture is "ARMOR observes; humans task and act." This is **non-negotiable** in this concept run; relaxing it changes the qualification path (06) and the customer story (07) dramatically.

### Autonomy modes

| Mode | When | Behavior |
|---|---|---|
| **Linked** | Comms LOS or SATCOM closing | Real-time alert flow; Tier-2 in the loop continuously. |
| **Coasting** | Intermittent comms (≤ 60% duty cycle) | Local autonomy; alerts buffered; flush on link recovery. |
| **Denied** | Comms < 25% duty cycle for > 30 s | Pre-tasked station / recovery; full local classification; buffered alerts; **no alert dispatch until comms recover.** |
| **Recovery** | Predictably degraded link expected | Pre-mission tasking includes return-to-host coordinates; platform navigates without prompt. |

Mode transitions are observable on the watch surface so the operator always knows what posture each platform is in.

## 3. Operator control surface (the M-3 binding section)

### Alert format (calibrated, not raw)

```
[ALERT — small-vessel-running-illicit-pattern]
Confidence:   0.81  ┃▰▰▰▰▰▰▰▱▱▱
Position:     32.6740, -117.2812  (5.4 nm SSW Pt. Loma)
Last seen:    03 min ago, ARM-2B
Behavior:     hug-coast track; speed 28 kt; no AIS; no nav lights
Suggested:    vector closest interceptor
[Mark False] [Suppress 1 hr] [Escalate]   [Open track]
```

Properties:

- **Confidence is graded**, never asserted as truth.
- **Behavior summary is qualitative**, generated by the classifier, **not** raw sensor data.
- **Override is one click.**
- **Audit:** every operator action is logged with timestamp + user + reason.

### Pattern-of-life surface

A separate, latency-tolerant query surface for the analyst persona. Default: 24-hour rolling, queryable by lane / time / classification / behavior. Retention policy: see GAP-SW-08 resolution below.

### Mode badges on the watch surface

Every ARM-site icon displays its autonomy-mode badge: **Linked / Coasting / Denied / Recovery**. Operator can hover for last-link-time and buffer-depth.

### Override and escalation

- "Mark False" → record + retrain classifier in next cycle.
- "Suppress 1 hr" → mute alerts on this track / lane for 1 hr; surface as suppressed in audit.
- "Escalate" → re-route to next-level command; preserves track.

## 4. C2 message flow (tier-1 ↔ tier-2 ↔ tier-3)

### Message classes

| Class | Direction | Latency target | QoS |
|---|---|---|---|
| `track.update` | tier-1 → tier-2 | < 2 s linked, buffered when not | reliable, ordered |
| `alert.dispatch` | tier-2 → tier-3 | < 5 s end-to-end | reliable, prioritized |
| `operator.action` | tier-3 → tier-2 → tier-1 | < 2 s | reliable |
| `mode.transition` | tier-1 → tier-2 → tier-3 | < 2 s linked, immediate locally | reliable |
| `pattern.write` | tier-1 → tier-2 | latency-tolerant | best-effort |
| `pattern.query` | tier-3 → tier-2 | < 2 s | reliable |

### Buffer / store-and-forward (resolves GAP-SW-09 in part)

When comms degrade, every message class except `pattern.write` (which is already best-effort) is buffered with timestamps, prioritized on flush. **Operator surface displays buffered-but-not-flushed counts** so the operator knows what they're not seeing.

### Wire format

JSON over TLS for the on-shore link (LOS to sector); CBOR over an authenticated UDP-style protocol for the platform-mesh and SATCOM (link-budget-aware). Schemas versioned via `protocolVersion` field. Field-naming follows the existing SD-2014 vocabulary where possible (mission-graph node names, ARM-site IDs).

## 5. Track lifecycle (resolves GAP-SW-06)

```
   detected ──► associated ──► held ──► classified ──► alerted ──► handed-off ──► died
```

| State | Trigger | Owner |
|---|---|---|
| detected | sensor threshold | tier-1 |
| associated | spatial-temporal match to existing | tier-1 |
| held | continuity ≥ N seconds | tier-1 |
| classified | classifier confidence ≥ alert threshold | tier-1 |
| alerted | tier-2 calibration passed | tier-2 |
| handed-off | responder accepted target handoff | tier-2 |
| died | track lost or operator-suppressed or handoff complete | tier-2 |

State transitions are logged; track lineage is queryable.

## 6. Sensor fusion contract (resolves GAP-SW-01)

Inputs:

| Source | Update rate | Notes |
|---|---|---|
| Radar | 1 Hz typical | Surface-search, range/bearing |
| EO/IR | 5 Hz daylight, 1 Hz IR | Aspect, signature class |
| AIS | event-driven | Cross-check / spoof detection |
| Ownship state (GPS+INS) | 10 Hz | For absolute-fix |
| Inter-platform mesh | event-driven | Cross-platform association |

Outputs:

| Output | Update rate | Consumed by |
|---|---|---|
| Fused-track update | 1 Hz | Tier-1 classifier, Tier-2 |
| Fusion confidence vector | with track | Calibration |
| Anomaly flag | event-driven | Mimicry detection |

Implementation choice (concept-stage): **EKF/UKF for track state; Bayesian network for class assignment; rule-based mimicry detector overlaid on classifier.** The implementation is **open**; the contract is binding.

## 7. Behavior models (resolves GAP-SW-07)

### Classes the classifier must distinguish

- Legitimate fishing (commercial, recreational)
- Legitimate transit (cargo, tourism)
- Anomalous transit (no-AIS, no-nav-lights, off-route)
- Pattern-of-illicit (running-pattern, course-of-evasion, time-of-day, route-anchor)
- **Mimicry** (looks like fishing pattern but key features off — speed envelope, course-stability, AIS metadata mismatch)

### Calibration

Classifier outputs must be **calibrated probabilities** (Brier ≤ 0.15 on holdout). Tier-2 applies a calibration curve before alert dispatch so the **0.81 displayed to the operator is real**.

### Mimicry detection

Pre-trained detector for AIS-mimicry and behavior-mimicry (COA-4 from 02). Below detection threshold → no alert, but **track is logged to pattern-of-life with mimicry flag** for retrospective analysis.

## 8. Pattern-of-life store (resolves GAP-SW-08)

| Property | Decision |
|---|---|
| Where | Tier-2 (sector-shore primary; cutter-resident replica for forward operations) |
| What | Track lineages, classification timeline, operator actions, anomaly flags |
| Retention | 90 days hot; 1 year warm; 7 years archive (placeholder; needs sponsor confirmation) |
| Query | By lane, time window, class, behavior, ARM-site, operator |
| Privacy | Civil traffic IDs hashed; release-controlled by sponsor's data policy |

## 9. Failure modes and graceful degradation (resolves GAP-SW-09)

| Failure | Behavior | Operator visible? |
|---|---|---|
| Sensor fail (single radar) | Fall back to remaining sensors; degrade confidence cap | Yes (badge on platform) |
| Sensor fail (all on platform) | Mark platform "blind"; tier-2 redistributes coverage | Yes |
| Classifier drift (Brier > threshold over 24 hr) | Auto-suppress alerts above margin; alert ops team | Yes (banner) |
| Comms loss (single platform) | Coasting / Denied modes per §2 | Yes |
| Comms loss (mission C2 ↔ watch) | Local degraded UI on watch floor | Yes |
| Compute fault (single platform) | Hard failover to safe-state station-keeping | Yes |
| Mission C2 fault | Tier-3 falls back to direct platform views; degraded UX | Yes |
| Adversary takeover attempt (cyber) | Cryptographic reject; cyber-incident audit | Yes |

## 10. Audit / accountability (resolves GAP-SW-10)

Every alert dispatch and every operator action is logged with: timestamp, user (or service principal), inputs, outputs, suppression / override reason. **No silent overrides.** Audit is queryable by sector chain of command.

## 11. Trust-calibration UX (revisits §3 with a hard rule)

> **Hard rule (drives all UX choices).** ARMOR shall never display a single uncalibrated probability as if it were truth. Confidence shall always be presented with a band, a behavior summary, and a one-click way to inspect what drove it.

This is the architectural contract that lets M-3 (operator burden) stay ≤ 0.

## 12. Tech stack (concept-stage, vendor-flexible)

| Lane | Choice (illustrative) | Constraint |
|---|---|---|
| Tier-1 OS | Linux on platform compute | RT-tolerance for fusion |
| Tier-1 framework | ROS2 or custom (TBD) | Real-time pub/sub |
| Tier-2 stack | service-oriented; Kubernetes-resident at sector-shore | High availability |
| Tier-3 client | Web (the SD-2014 webapp is the operator UI envelope today) | Browser-resident |
| Wire | TLS (shore), CBOR over authenticated UDP (mesh / SATCOM) | Crypto baseline TBD by sponsor |
| Storage | Time-series + relational (pattern-of-life) | Retention policy in 06 |
| Identity | Customer's existing IDP (CAC, etc.) | Tier-3 only |
| Observability | OpenTelemetry across tiers | Operator surface uses subset |

## 13. Gates

| Gate | Status |
|---|---|
| technical-plausibility | CONDITIONAL — fusion / classifier maturity is the open risk. |
| operator-trust-and-burden | CONDITIONAL — UX commitments are sound; HITL test pending. |
| (skill check) "Software and hardware share a coherent mission thread" | **YES** — MT-01/02 IDs cross 04 / 05. |

## 14. Assumptions Ledger

| ID | Assumption | Risk |
|---|---|---|
| A-SWA-01 | "Observe-only" authorities posture (§2). | Concept-defining. |
| A-SWA-02 | Three-tier topology (platform / mission C2 / watch) is correct. | Medium — could be flattened on cutter-only deployments. |
| A-SWA-03 | EKF/UKF + Bayesian network is sufficient for fusion at concept stage. | Medium — vendor will likely propose ML alternatives. |
| A-SWA-04 | Calibrated probability presentation reduces operator burden. | High — primary M-3 driver, needs HITL. |
| A-SWA-05 | Pattern-of-life retention 90/365/2555 days is approximately right. | Low — sponsor will set policy. |

## 15. Evidence

The architecture is **specification, not measurement**. Evidence will accrue at architect-phase prototyping. Cross-references:

- 03 §5 enumerates the validation gaps that pertain to 04 (GAP-EP-01, -03, -05).
- The trust-calibration rule (§11) is testable against the test rig 06 will scope.

## 16. Open questions

- OQ-SWA-01: Is the customer's identity provider known (CAC vs. PIV vs. local)?
- OQ-SWA-02: Cyber baseline — DoD RMF? CMMC L3? Specific to USCG?
- OQ-SWA-03: Is on-platform compute envelope generous enough for ML classification, or do we hold classification at tier-2?
- OQ-SWA-04: Pattern-of-life retention — what is the customer's data policy?
- OQ-SWA-05: Inter-platform mesh — vendor-provided or program-built?

## 17. Dependencies

- 05 must size compute / power / comms to meet §4 latency and §6 update-rate requirements.
- 06 must qualification-map §10 audit and §11 trust-calibration UX.

## 18. Next actions

1. Build a mini-prototype of the alert calibration UX and run a paper-prototype operator-burden test.
2. Pick a fusion stack vendor for first prototype.
3. Confirm A-SWA-01 with the first sponsor conversation; if relaxed, re-author this artifact.
