# 06 — Qualification and Deployment Readiness Package

**Artifact id:** WSA-OUT-06-QUAL
**Skill:** warfighter-systems-architect v1.0.0
**Owner role:** Qualification Lead
**Phase:** qualify → field
**Mission threads:** MT-01, MT-02, MT-03
**Classification:** UNCLASSIFIED // FOR PUBLIC RELEASE
**Status:** draft
**Inputs consumed:** `01`, `02`, `03`, `04`, `05`

## 1. Qualification matrix

The matrix maps each major architectural / hardware claim to the qualification activity, evidence type, and gate it informs.

| ID | Claim | Activity | Evidence | Gate |
|---|---|---|---|---|
| Q-01 | Sensor mast survives MIL-STD-810 environmental envelope | MIL-STD-810 chamber test (vibration, salt fog, temp, humidity, ingress) | Test report | technical-plausibility, deployment-readiness |
| Q-02 | Sensor mast meets MIL-STD-461 EMI/EMC | MIL-STD-461 emissions/susceptibility test | Test report | technical-plausibility |
| Q-03 | On-platform compute meets continuous-load envelope at sea state 4 | Sea trial, 7-day, instrumented power log | Power telemetry, environmental log | technical-plausibility |
| Q-04 | Comms link-budget closes for 4×18 nm picket within named theater | RF + SATCOM bench measurement, then sea trial | Link-budget report, sea trial logs | technical-plausibility |
| Q-05 | Track lifecycle (04 §5) executes correctly through degraded-comms transitions | Software-in-the-loop test, then sea trial | Test report, integration log | technical-plausibility |
| Q-06 | Sensor fusion (04 §6) outputs calibrated probabilities (Brier ≤ 0.15) | Holdout dataset evaluation, then sea trial | Calibration report | operator-trust-and-burden |
| Q-07 | Mimicry classifier (04 §7) flags COA-4 cases at ≥ TBD recall | Holdout adversarial dataset | Classifier report | operator-trust-and-burden |
| Q-08 | Operator-burden delta ≤ 0 (M-3 from 02 §4) | Human-in-the-loop watch-floor test | HITL test report | operator-trust-and-burden, mission-relevance |
| Q-09 | COLREGS compliance under autonomy-on-the-edge | Authorities review + closed-water trial | Authorities letter, trial report | qualification-readiness, deployment-readiness |
| Q-10 | Cyber baseline meets sponsor framework (RMF / CMMC L3 placeholder) | Cyber test event with red-team | ATO / IATT package | deployment-readiness |
| Q-11 | Cryptographic baseline (transport, key management, audit) meets sponsor policy | Crypto review, FIPS-validated module survey | Compliance memo | deployment-readiness |
| Q-12 | Pattern-of-life store retention policy meets sponsor data policy | Data-policy review | Memo + sponsor sign-off | deployment-readiness |
| Q-13 | Multi-platform mesh deconflicts station-keeping under loss of N/4 platforms | Sea trial with simulated platform loss | Trial report | technical-plausibility |
| Q-14 | Platform survives storm-recovery cycle without damage | Storm-tracking exercise | Recovery log | qualification-readiness |
| Q-15 | Variant matrix (V-USCG / V-USN / V-FMS) executes without redesign | Per-variant integration test | Variant test reports | deployment-readiness |
| Q-16 | Audit trail meets accountability standard (04 §10) | Audit-event review | Audit-trace samples | deployment-readiness |
| Q-17 | Export control posture documented (ITAR/EAR per component) | Export-control review | Memo | deployment-readiness |
| Q-18 | Operator override paths (04 §3) function under all autonomy modes | HITL + sea trial | Test report | operator-trust-and-burden |
| Q-19 | Endurance at on-station mode meets ≥ 30 days continuous (05 §6) | Endurance trial | Trial report | technical-plausibility |
| Q-20 | Loss-tolerance commitment: picket survives 1 ARM-site/year loss | Sustainment / cost analysis | Analysis memo | deployment-readiness |

## 2. Named blockers (not deferred)

| Blocker | Description | Resolves at |
|---|---|---|
| **B-01: COLREGS / authorities for autonomy in U.S. coastal water (Q-09)** | The autonomy posture of 04 §2 has not been authorities-cleared. Without a clear letter, ARMOR cannot operate unescorted in U.S. coastal water. | Authorities review + sponsor letter, before first unescorted sea trial. |
| **B-02: Real sensor model (resolves GAP-EP-02 from 03)** | Without real radar / EO-IR detection-probability curves, no claim in 03 is sizing-grade. | Vendor data + closed-area test before architect-phase commitment. |
| **B-03: Operator-burden HITL test rig (Q-08)** | M-3 cannot be measured without a paper / HITL prototype + watch-officer participants. | Stand up partner relationship (USCG R&D Center?) before architect-phase exit. |
| **B-04: Sponsor-set cyber framework (Q-10, Q-11)** | RMF / CMMC level / specific NIST control overlay is sponsor-defined; cannot finalize ATO path without it. | Sponsor conversation. |
| **B-05: Sponsor-set data retention policy (Q-12)** | Pattern-of-life retention drives storage and privacy posture. | Sponsor conversation. |
| **B-06: Sponsor-set classification regime for V-USN data (Q-15)** | Classified-handling design depends on a real classification regime. | Sponsor conversation. |
| **B-07: First Voyager-class sea-trial slot (Q-03, Q-04, Q-13, Q-14, Q-19)** | A real platform on a real day is the gating event for half the matrix. | Vendor / sponsor scheduling. |
| **B-08: Export-control review for fusion / classifier (Q-17)** | Probable ITAR; cannot ship V-FMS without it. | Counsel / SME review before V-FMS work begins. |

**Every blocker has a named resolution path.** None are deferred indefinitely.

## 3. Evidence chain

For each gate, the evidence chain that must close:

### mission-relevance
- 01 framing (PASS provisional)
- Operator interviews (≥ 3) — open
- Crewed-alternative cost analysis — open
- Q-08 HITL — open

### operational-realism
- 02 scenarios + COA logic (CONDITIONAL)
- Sponsor-confirmed adversary-COA depth — open
- Sea-trial data for S-1 / S-2 / S-3 — open

### technical-plausibility
- 03 sensitivity (CONDITIONAL)
- Q-01, Q-02, Q-03, Q-04, Q-05, Q-19 — open
- B-02 (sensor model) — blocker

### operator-trust-and-burden
- 04 §3 + §11 commitments
- Q-06, Q-07, Q-08, Q-18 — open
- B-03 (HITL rig) — blocker

### qualification-readiness
- This artifact (06) — partial; matrix scoped, no events run
- Q-09, Q-14 — open
- B-01 (COLREGS / authorities) — blocker

### deployment-readiness
- 05 + this artifact (CONDITIONAL)
- Q-10, Q-11, Q-12, Q-15, Q-16, Q-17, Q-20 — open
- B-04, B-05, B-06, B-08 — blockers

### decision-readiness (capture / pre-RFP positioning only)
- This run, with all blockers and gaps named — **PASS provisional** for capture / pre-RFP. **NOT** for milestone-A commitment.

## 4. Readiness gates (sequenced)

Sequenced fielding readiness — what must be true before each step:

| Step | Required passes |
|---|---|
| **Tier-1 prototype** (lab + closed-water) | Q-01 partial, Q-05, Q-06, Q-08 paper-prototype |
| **First sea trial** (controlled water, with escort) | Q-01, Q-02, Q-03, Q-04 partial, Q-05, Q-13, B-01 partial |
| **First sponsored experiment** (sector-resident) | Q-04 full, Q-08 HITL pass, Q-09 letter, Q-18 |
| **First operational deployment** (V-USCG) | All except Q-15 / B-06 |
| **V-USN deployment** | All including Q-15 |
| **V-FMS deployment** | All including Q-17 / B-08 |

## 5. Test events (concept stage; placeholder)

| Event | Cadence | Owner |
|---|---|---|
| Lab integration | continuous from architect phase | Mission Software Lead |
| Closed-water demo | quarterly | Hardware Lead |
| Sea trial (instrumented) | semi-annual after first prototype | Hardware Lead + Operational Analysis Lead |
| HITL operator test | bi-annual after rig stands up | UX + Mission Software Lead |
| Authorities review touchpoint | quarterly | Qualification Lead |

## 6. Deployment sequence

1. Capture / pre-RFP positioning (now → Q3 2026)
2. Sponsored experiment (Q3 2026 → Q1 2027) — Tier-1 prototype + first sea trial
3. V-USCG limited deployment (Q1 2028 estimated, sponsor-dependent)
4. V-USN limited deployment (Q3 2028 estimated, sponsor-dependent)
5. V-FMS first partner case (Q1 2029 estimated, sponsor-dependent)

> **A-QUAL-01.** Dates are illustrative for sequencing logic. Real schedule is sponsor- and contract-action dependent.

## 7. Operator impact summary

(For 07's executive narrative.)

- Coverage rises from "best-effort sortie" to "continuous calibrated awareness."
- Operator load **shall not increase** (M-3 hard floor).
- Cutter / aviation sortie efficiency rises (lower wasted-sortie rate).
- Sector retains a queryable pattern-of-life record never previously available.
- Override authority remains entirely with humans; no autonomous action against targets.

## 8. Gates (this artifact)

| Gate | Status |
|---|---|
| qualification-readiness | **OPEN** — matrix scoped (Q-01..Q-20); no events run; 8 blockers named with resolution paths. |
| deployment-readiness | **OPEN** — sequenced; sponsor-dependent. |
| decision-readiness | **CONDITIONAL** — sufficient for capture / pre-RFP. |

## 9. Assumptions Ledger

| ID | Assumption | Risk |
|---|---|---|
| A-QUAL-01 | Sequence dates above are sponsor-dependent placeholders. | Low — illustrative only. |
| A-QUAL-02 | ITAR is probable for fusion/classifier (Q-17). | High — gates V-FMS schedule. |
| A-QUAL-03 | RMF is the relevant cyber framework for V-USCG and V-USN. | Medium — sponsor confirms. |
| A-QUAL-04 | Authorities review (B-01) can be cleared with a credible safety case. | Medium — could escalate if any incident occurs. |
| A-QUAL-05 | Voyager-class qualification heritage carries over (not the program's lift). | Medium — may not be transferrable across customers. |

## 10. Evidence

This artifact is **planning evidence**, not test evidence. Test evidence accrues per §1 / §5 schedule.

## 11. Open questions

- OQ-QUAL-01: What cyber framework does the sponsor require?
- OQ-QUAL-02: Is there a partner USCG / USN program we can stack qualification under?
- OQ-QUAL-03: Authorities pre-clearance — local sector or HQ-level?
- OQ-QUAL-04: Storm-recovery cadence — cutter-deployable or shore-only?
- OQ-QUAL-05: Loss-tolerance budget per fielded year — sponsor-set or program-set?

## 12. Dependencies

- All prior artifacts feed this one.
- 07 must not claim certainty beyond §3 evidence chain status.

## 13. Next actions

1. Schedule a B-01 (COLREGS / authorities) sponsor-side pre-conversation.
2. Stand up B-03 (HITL operator-burden rig) — partner lead at USCG R&D Center (target).
3. Open dialogue with Voyager-class platform vendor on B-07 (sea-trial slot).
4. Write counsel-led memo on Q-17 (export control) before V-FMS work commits.
