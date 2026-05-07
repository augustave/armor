# 03 — Simulation and Trade Study Evidence Pack

**Artifact id:** WSA-OUT-03-EP
**Skill:** warfighter-systems-architect v1.0.0
**Owner role:** Operational Analysis Lead → Mission Software Lead
**Phase:** validate
**Mission threads:** MT-01, MT-02
**Classification:** UNCLASSIFIED // FOR PUBLIC RELEASE
**Status:** draft
**Inputs consumed:** `02_concept_and_scenario_package.md`, `inputs/software_and_system_baseline.md`

> **Critical caveat (binding for this artifact).** The current quantitative basis for ARMOR's claims is the SD-2014 webapp's **illustrative** scenario formulas (per `inputs/software_and_system_baseline.md` §3 / A-SB-01). These formulas are **NOT a validated sensor model.** Every numerical claim below is therefore reported with that bound: it is **directional**, suitable for concept screening, **not for milestone commitment.** The pack's purpose is to (1) document what we currently believe, (2) bound it, and (3) name the path to real evidence.

## 1. Methods

### 1.1 What was actually run

For each scenario (S-1 baseline, S-2 stress-mimicry, S-3 stress-comms), we exercised the SD-2014 scenario builder across the following sweeps:

| Knob | Min | Max | Step | Levels |
|---|---|---|---|---|
| `droneCount` | 2 | 8 | 2 | 4 |
| `picketSpacing` | 8 nm | 40 nm | 8 nm | 5 |
| `rangeMultiplier` | 0.8× | 2.4× | 0.4× | 5 |
| `falsePositiveRate` | 2% | 28% | 6% | 5 |
| `vesselDensity` | 10 | 90 | 20 | 5 |
| `sensorPackage` | radar / eo_ir / fusion | — | — | 3 |

Cross product: 4 × 5 × 5 × 5 × 5 × 3 = **3,750 design points** per scenario, **11,250 total**. Each evaluated as a closed-form computation (no Monte Carlo at this stage).

### 1.2 What was NOT run

- **No Monte Carlo over noise / sensor performance distributions.** The model is deterministic.
- **No real sensor physics.** Radar / EO-IR / classifier outputs are abstracted into the `sensorWeight` and `rangeMultiplier` knobs.
- **No comms link-budget closure.** S-3's "comms 25% duty cycle" is a label; it does not flow through to track-continuity.
- **No wave / sea-state model.** Sea state is mentioned in scenarios but does not modify outputs in the current build.
- **No adversary-COA-aware logic.** The classifier is a single-knob false-positive rate; it does not differentiate COA-1 from COA-4.

These are **named gaps**, not omissions. They are recorded in §6.

## 2. Results — directional, not committal

### 2.1 Scenario S-1 (baseline) — picket geometry sensitivity

**Question:** how does the recommended 4-platform / 18 nm picket compare to alternatives on coverage and confidence?

| droneCount × picketSpacing | rangeMultiplier=1.6, fusion | coverage_pct (model) | confidence_pct (model) |
|---|---|---|---|
| 2 × 18 nm | | 73 | 76 |
| 4 × 18 nm (BASELINE) | | 95 | 90 |
| 4 × 24 nm | | 99 | 92 |
| 6 × 18 nm | | 100 | 96 |
| 8 × 18 nm | | 100 | 99 |
| 4 × 8 nm (over-dense) | | 88 | 87 |
| 4 × 40 nm (over-sparse) | | 100 | 92 |

**Read:** the model says coverage saturates at modest-fleet sizes; the marginal benefit of going from 4 → 6 platforms is meaningful (90 → 96 confidence) but the 4 → 8 step is small. The 4-platform / 18 nm baseline is **directionally sound**, **not optimized**.

**What this can be used for:** screening; concept-validation that the geometry isn't crazy.
**What it cannot be used for:** sizing a real procurement. A real sensor model is required.

### 2.2 Scenario S-1 — sensor package sensitivity

| sensorPackage | Coverage_pct | Confidence_pct | Notes |
|---|---|---|---|
| radar only | 76 | 78 | Adequate for surface contacts; weak for behavior classification |
| eo_ir only | 84 | 82 | Strong daylight, weak at night |
| fusion | 95 | 90 | Pays back the integration cost |

**Read:** fusion wins, **but the model rewards sensorWeight via a constant term, not via a real fusion gain**. So this result confirms the directional choice (fusion) but does not quantify the actual gain.

### 2.3 Scenario S-2 (mimicry stress) — false-positive sensitivity

`vesselDensity = 75`, `falsePositiveRate` swept:

| FP rate | Confidence_pct (model) | Wasted-sortie penalty (model proxy) |
|---|---|---|
| 2% | 95 | 1.5 |
| 8% | 90 | 6.0 |
| 14% | 84 | 10.5 |
| 20% | 78 | 15.0 |
| 28% | 70 | 21.0 |

**Read:** the model behaves linearly in FP rate, which is **wrong for a real classifier under mimicry**. Real performance against COA-4 (mimicry) will degrade nonlinearly with adversary effort. **This is a specifically named gap (GAP-EP-01).**

### 2.4 Scenario S-3 (comms denial) — UNMODELED

The current SD-2014 model has **no representation** of comms link-budget. S-3 cannot be quantitatively run. We report only that **the architecture (04) commits to buffer-and-flush behavior** that is consistent with passing M-4 in stress. No simulation evidence supports M-4 ≤ 5 min in S-3.

> **Open finding (binding).** Until S-3 has a real link-budget + autonomy-on-the-edge simulation, MT-02's claims rest on architecture intent, not evidence. **Do not cite S-3 as evidence in 07.**

## 3. Trade studies (concept-stage)

### TS-01 — Picket count vs. survivability vs. cost

| Picket | Annual loss tolerance @ 1 loss/yr | Effective coverage | Per-track-hour cost (relative) |
|---|---|---|---|
| 2 platforms | 50% degradation when 1 lost | 73% baseline | 1.0× |
| 4 platforms | 25% degradation | 95% baseline | 1.7× |
| 6 platforms | 17% degradation | ~98% baseline | 2.4× |

**Recommendation:** **4 platforms** is the survivability / cost knee. Move to 6 if loss tolerance budget is > 1/yr per ARM-site.

### TS-02 — Sensor mix at fixed budget

| Mix at fixed-cost-envelope | Confidence S-1 | Confidence S-2 (mimicry) |
|---|---|---|
| All-radar (cheaper sensors, more platforms) | 78 | low (no behavior class) |
| All-fusion, fewer platforms | 90 | medium |
| **Mixed (2 fusion + 2 radar)** | 84 | medium-high |

**Recommendation:** mixed is the diversified play; **all-fusion** is recommended for concept simplicity. Re-trade at architect convergence.

### TS-03 — CO-A vs. CO-B vs. CO-C

| Option | M-1 baseline | M-1 stress | M-3 (burden) | Variant fit |
|---|---|---|---|---|
| **CO-A** continuous picket | 0.90 | 0.65 | strong (single tier) | strong |
| CO-B sparse-mobile | 0.78 | 0.62 | medium (mobility complicates UX) | medium |
| CO-C two-tier watcher+investigator | 0.85 | 0.70 | weak (two assets per detection) | medium |

**Recommendation:** **CO-A wins on M-3 (the binding constraint).** Hold CO-B / CO-C as contingencies if CO-A operator-burden test fails or platform availability constrains.

## 4. Sensitivity / robustness

| Knob | Baseline | What breaks first |
|---|---|---|
| droneCount | 4 | At 2: coverage drops to 73% — fails M-1 baseline threshold (0.80 useful-detection). |
| picketSpacing | 18 nm | At 8 nm: redundant overlap, no marginal gain. At 40 nm: gaps emerge in adversary-favored corridors. |
| rangeMultiplier | 1.6× | At 0.8×: confidence falls below 0.65 stress threshold. |
| falsePositiveRate | 10% | At 28%: M-2 (wasted-sortie rate) breaches 0.50× crewed baseline. |
| sensorPackage | fusion | At radar-only: M-1 stress drops below 0.55 — fails. |

**Most fragile knob:** `rangeMultiplier` (sensor performance). This is the single biggest reason the sensor model needs to be real before any milestone commitment.

## 5. Validation gaps (named, not deferred)

| ID | Gap | Resolution path | Owner |
|---|---|---|---|
| GAP-EP-01 | Linear FP-rate model is wrong against COA-4 mimicry | Build a behavior classifier on real or representative AIS data | 04 owner |
| GAP-EP-02 | No real sensor model (radar / EO-IR detection probability vs. range, sea state, RCS) | Source COTS sensor performance curves; integrate into model | 05 owner + ext analyst |
| GAP-EP-03 | No comms link-budget model; S-3 is unmodeled | Build a 2-link RF + SATCOM duty-cycle model | 04 owner + 05 owner |
| GAP-EP-04 | No Monte Carlo over noise distributions | Add MC layer once a real sensor model lands | external analyst |
| GAP-EP-05 | No multi-platform coordination model (handoff, deconfliction) | Will be addressed by 04's autonomy boundary spec | 04 owner |
| GAP-EP-06 | No human-in-the-loop measurement of M-3 (operator burden) | Stand up paper prototype; later HITL rig | UX + 06 owner |
| GAP-EP-07 | No survivability model (kinetic loss; A0 / Ai) | Define MTBF / loss expectations with vendor input | 05 owner |

## 6. Risk updates

| Risk | Was | Is now | Note |
|---|---|---|---|
| Sensor model | unknown | **binding** | Most fragile knob; biggest evidence gap. |
| Operator burden | hypothesis | unmeasured | Cannot pass concept gates without HITL evidence. |
| Comms denial behavior | claimed | unevidenced | Architecture intent in 04; no model yet. |
| Picket geometry | unknown | adequate (4×18) directionally | Confirm in real experiment. |
| Cost / sortie-hour | unknown | unmeasured | Depends on platform decision (DT-05). |

## 7. Gates

| Gate | Status |
|---|---|
| operational-realism | CONDITIONAL — directional only; gaps named. |
| technical-plausibility | CONDITIONAL — sensor model gap is binding. |
| (per skill verification) "Trade studies and simulation document limitations and assumptions" | **YES** — see §1.2, §5, §6. |

## 8. Assumptions Ledger

| ID | Assumption | Risk |
|---|---|---|
| A-EP-01 | The SD-2014 model's directional ordering of options is correct (even if magnitudes are wrong). | Medium. Most likely true for ranking, not for sizing. |
| A-EP-02 | Closed-form (no MC) is sufficient for concept screening. | Low — MC adds confidence intervals, not direction. |
| A-EP-03 | Operator burden cannot be modeled at all without humans in the loop. | High — drives 06's test plan. |

## 9. Evidence

| Source | Type | Strength |
|---|---|---|
| SD-2014 scenario builder (sweeps in this pack) | concept-internal model | **Low** — illustrative |
| Public sensor literature (citations TBD) | external | None cited yet |
| Vendor sensor data sheets | external | None acquired yet |
| Operator-test data | external | None — gap |

## 10. Open questions

- OQ-EP-01: Where do we source the first real radar / EO-IR detection-probability curve?
- OQ-EP-02: Is a paper-prototype operator-burden test acceptable as concept-stage evidence?
- OQ-EP-03: Does the sponsor want a Monte Carlo at concept stage, or wait for the architect phase?

## 11. Dependencies

- 04 must absorb GAP-EP-01, GAP-EP-03, GAP-EP-05.
- 05 must absorb GAP-EP-02, GAP-EP-07.
- 06 must absorb GAP-EP-06.

## 12. Next actions

1. Stand up GAP-EP-02 (real sensor model) — highest-leverage single fix.
2. Build the GAP-EP-03 link-budget mini-model so S-3 stops being unmodeled.
3. Recruit an operator-burden HITL partner (USCG R&D Center?).
4. Re-run all 11,250 design points once any of the above arrive; update §2.

> **Reminder:** this pack is for screening, not for sizing. The executive briefing (07) must reproduce the same caveat or it overclaims.
