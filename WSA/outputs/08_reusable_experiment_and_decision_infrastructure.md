# 08 — Reusable Experiment and Decision Infrastructure

**Artifact id:** WSA-OUT-08-REUSE
**Skill:** warfighter-systems-architect v1.0.0
**Owner role:** All roles (curated by Operational Analysis Lead)
**Phase:** field → next-cycle
**Mission threads:** all
**Classification:** UNCLASSIFIED // FOR PUBLIC RELEASE
**Status:** draft
**Inputs consumed:** all upstream artifacts

> **Purpose.** Extract from this run the patterns, scenarios, measures, and decision templates that should outlive ARMOR's first cycle and accelerate the next. This is what gets re-used in the second sponsor capture, the second variant trade, the second operator test.

## 1. Reusable scenarios

### Scenario template (S-template)

```yaml
scenario_id: S-<n>
class: <baseline | stress-mimicry | stress-comms | stress-loss | stress-civil-traffic>
theater: <coastal-littoral | island-chain | gray-zone-approach>
sea_state: Beaufort <0..6>
visibility: <range_nm>
daylight: <dawn | day | dusk | night>
comms:
  los: <duty_cycle_pct>
  satcom: <duty_cycle_pct>
gnss: <nominal | jammed | spoofed>
adversary_coa: [<COA-ids>]
picket:
  drone_count: <int>
  picket_spacing_nm: <int>
  range_multiplier: <float>
  sensor_package: <radar|eo_ir|fusion>
civil_traffic_density: <low | medium | high | very-high>
expected_outcome: <prose>
gate: <which gate this scenario informs>
```

### The three scenarios from this cycle (S-1, S-2, S-3)

Already documented in `02 §2`. They are reusable for any small-vessel coastal-surveillance concept in any analogous theater. Replace `theater` and `adversary_coa` to retarget.

### Adversary COA library (extracted from this cycle)

| COA | Description | Where used |
|---|---|---|
| COA-1 | Single-craft predictable run | S-1 baseline |
| COA-2 | Decoy + real run | S-3 |
| COA-3 | Active emission control + clutter-hugging | sensor sensitivity |
| COA-4 | Spoofed AIS / mimicked fishing | S-2 |
| COA-5 | Direct kinetic against ARM-site | survivability trade |
| COA-6 | EW jamming of picket | S-3 + autonomy posture |

This library is **theater-agnostic** for small-vessel illicit-traffic surveillance. Reuse directly; extend per-theater as classified intel allows.

## 2. Reusable measures

The four-measure primary set from `02 §4` is portable to any concept where a human operator is calibrating responses to autonomous detections:

| ID | Measure | Direction | Reuse-context |
|---|---|---|---|
| M-1 | Useful-detection rate (correct-class alerts / true positives) | maximize | Any detection-calibration problem |
| M-2 | Wasted-sortie rate (FP × responder cost) | minimize | Any cued-response system |
| M-3 | Operator-burden delta vs. baseline | minimize ≤ 0 | **Any** human-in-the-loop autonomy concept |
| M-4 | Time-to-actionable-alert | minimize | Any time-sensitive detection workflow |

> **Reuse rule.** M-3 ≤ 0 is **the** binding constraint for human-in-the-loop autonomy concepts. Carry this forward. Any concept that doesn't enforce it is making a different (and harder) bet.

## 3. Reusable decision templates

### DT-template — concept-stage decision card

```yaml
decision_id: DT-<n>
question: <prose>
horizon: <quarter / event>
inputs_required:
  - <list of artifacts>
options:
  - id: O-1
    description: <prose>
    pros: [...]
    cons: [...]
  - id: O-2
    ...
trade_criteria:
  - mission_relevance
  - operator_burden
  - technical_plausibility
  - survivability
  - cost
  - variant_fit
recommendation: <O-id with rationale>
status: <open | recommended | decided>
```

### NG-template — no-go condition card

```yaml
ng_id: NG-<n>
condition: <prose>
gate(s): [<list>]
evidence_required_to_clear: <prose>
disposition_if_unclear: stop-the-concept | re-architect | de-scope
```

### Trade-study template (see TS-01..TS-03 in `03 §3`)

```yaml
ts_id: TS-<n>
question: <prose>
options: [<list>]
criteria: [<list>]
results_table: <tabular>
recommendation: <prose>
limitations: <prose>
```

## 4. Reusable model patterns

### The "scenario builder + computed metrics" pattern (the SD-2014 mini-model)

The SD-2014 webapp's structure is **a reusable concept-stage instrument**: six knobs map to four metrics by closed-form formula. The pattern is reusable for any concept where a sponsor wants to feel coverage / confidence / cost-of-error tradeoffs **before** a real sensor model exists.

**When to use it.** Concept-stage screening, sponsor sandbox, pre-RFP ask.

**When NOT to use it.** Anything sizing-grade. Always include the A-SB-01-style caveat ("illustrative, not validated").

**Re-implement at:** `<project>/ops/`. Reuse the URL-param pattern (`?t=N&paused=1`) for embedding and capture.

### The "calibrated alert with confidence band + behavior summary + one-click override" UX pattern (from `04 §3`)

Reusable in any operator-assistance concept where the binding constraint is operator burden. **Mandatory** when the concept wants to claim M-3 ≤ 0.

### The "three autonomy modes (Linked / Coasting / Denied / Recovery)" pattern (from `04 §2`)

Reusable in any autonomous-platform concept exposed to contested comms. Maps cleanly to MT-02-style threads.

### The "single platform line, multiple operational profiles (variants)" pattern (from `05 §9`)

Reusable productization story for any program that wants to address USCG + USN + Allied with one platform program. Sequence: domestic primary first, military secondary, FMS third.

## 5. Reusable infrastructure (carry over to next cycle)

| Asset | Where it lives | Re-usability |
|---|---|---|
| **SD-2014 mini-model** | `/ops/main.js` | Scenarios + knobs + computed metrics. Keep formulas; replace knob set per concept. |
| **WSA package layout** | `/WSA/inputs/` + `/WSA/outputs/` + `README.md` | Use as boilerplate for next concept. |
| **Mission entity graph schema** | `ops/main.js` lines 80–119 | Reusable for any concept with org/threat/tech/concept/metric/tactic relations. |
| **Three-tier C2 architecture diagram** | `04 §1` | Reusable for any platform-mission C2-watch design. |
| **Trust-calibration UX hard rule** | `04 §11` | Mandatory for any HITL-autonomy concept. |
| **Gate status table** | `WSA/README.md` | Reusable accountability mechanism. |
| **Evidence-tag color code (🟩/🟨/🟧/🟥)** | `07` | Mandatory for any executive briefing. |

## 6. Decision templates filled out (this cycle's open decisions)

(So the next cycle starts with these already structured.)

| ID | Question | Status this cycle | Carry-over action |
|---|---|---|---|
| DT-01 | Sponsored experiment with a USCG District? | Recommended (provisional) | Sponsor conversation |
| DT-02 | Sensor package winning first integration slot? | Fusion (concept-stage) | Re-trade at architect convergence |
| DT-03 | Multi-service variant strategy? | Sound, sequenced | Hold V-USN until USCG demo runs |
| DT-04 | Picket count and spacing? | 4×18 nm baseline | Re-evaluate after first sea trial |
| DT-05 | Voyager-class platform — sole-source or candidate? | Voyager-class (open) | Stand up trade study |

## 7. Lessons from this run (record for next-cycle improvement)

| Lesson | Implication |
|---|---|
| The hardest single thing was distinguishing concept-marketing-voice from program-grade-claim. | Next concept: build the input docs **before** the marketing site. |
| The SD-2014 mini-model worked for screening but is a liability if cited as evidence. | Next concept: bake the A-SB-01 caveat into the model UI itself ("illustrative; not validated"). |
| Operator-burden M-3 is binding everywhere but unevidenced everywhere. | Next concept: stand up a HITL test rig partnership at week one. |
| Comms link-budget was unmodeled and that broke S-3. | Next concept: any contested-comms claim must have at least a placeholder link-budget model. |
| Authorities / COLREGS for autonomy was deferred and resurfaced as a blocker. | Next concept: open the authorities conversation in week one, not at qualification. |

## 8. Gates

| Gate | Status |
|---|---|
| (skill check) "At least one reusable scenario or decision template extracted for next cycle" | **YES** — §1, §2, §3, §6. |

## 9. Assumptions Ledger

| ID | Assumption | Risk |
|---|---|---|
| A-REUSE-01 | The patterns extracted here generalize across small-vessel surveillance concepts. | Low — they are canonical structures, not ARMOR-specific. |
| A-REUSE-02 | The lessons in §7 will be applied next cycle. | Low — depends on team continuity. |

## 10. Open questions

- OQ-REUSE-01: Is the SD-2014 mini-model worth maintaining as a shared concept-screening instrument across the team's portfolio?
- OQ-REUSE-02: Should the WSA package layout become a team-standard?

## 11. Dependencies

- This artifact closes the cycle. No downstream dependencies.

## 12. Next actions

1. Maintain `WSA/` layout as the team's concept-stage authoring template.
2. Pre-populate the next concept's WSA package using the templates here.
3. Stand up the HITL operator-burden partnership immediately, regardless of which concept comes next.
