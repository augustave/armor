# 05 — Hardware Integration and Productization Plan

**Artifact id:** WSA-OUT-05-HW
**Skill:** warfighter-systems-architect v1.0.0
**Owner role:** Hardware Lead
**Phase:** architect → field
**Mission threads:** MT-01 (primary), MT-03
**Classification:** UNCLASSIFIED // FOR PUBLIC RELEASE
**Status:** draft
**Inputs consumed:** `01`, `02`, `03`, `04`, `inputs/hardware_and_platform_baseline.md`

## 1. Reference platform and where it bends

**Baseline:** Voyager-class USV (10–15 m monohull, wind/solar-augmented diesel-electric, persistent endurance). The platform is **borrowed**, not built. ARMOR's hardware lane is primarily **sensor-mast integration + on-platform compute + comms + ruggedization**, not platform design.

| Platform property | Voyager baseline | ARMOR commitment |
|---|---|---|
| Length | ~10 m | Keep |
| Endurance | weeks-to-months | Keep; ARMOR power budget must fit within Voyager's generation envelope |
| Hull | wave-piercing monohull | Keep; sensor mast height drives any modifications |
| Propulsion | wind + solar + diesel-electric | Keep; ARMOR does not change |
| Comms | vendor LOS + SATCOM | **Replace or augment** (see §3) |

> **A-HW-01.** Voyager is the point of departure but not the only candidate. DT-05 (platform trade) runs in parallel; concept commitment is to "Voyager-class," not to Saildrone as sole-source.

## 2. Sensor-mast integration

### Sensor kit (concept-stage baseline)

| Sensor | Role | Power (placeholder) | Notes |
|---|---|---|---|
| Marine surface-search radar (X-band, solid-state) | primary surface detection | ~150 W | COTS class |
| EO/IR camera (long-wave + short-wave) | classification, behavior observation | ~120 W | Stabilized turret |
| AIS receiver | cross-check, mimicry detection | ~5 W | Standard COTS |
| Acoustic / passive RF (optional) | adversary-emission detection | ~30 W | Variant-specific (USN); not USCG baseline |
| GPS + INS | nav, time, georef | ~15 W | Multi-constellation; dead-reckon under denial |

### Mast integration

- Sensor mast must clear maximum sea state without compromising radar return aspect.
- EO/IR turret on a stabilized mount; line-of-sight obstruction window ≤ 5° aft.
- AIS antenna co-located with comms antenna (separate channel).

### What's NOT on the platform

- No active sonar / sub-surface sensing (out of scope per 01 §5).
- No weapons (out of concept by 04 §2 / A-SWA-01).
- No high-cost specialty sensors (SAR, hyperspectral) at baseline. Variant options.

## 3. Comms architecture (resolves GAP-HW-02 / GAP-EP-03)

### Three-channel design

| Channel | Use | When closes |
|---|---|---|
| Inter-platform RF mesh (UHF or L-band) | track sharing, mode coordination, formation maintenance | LOS between platforms (10–20 nm) |
| LOS-to-shore (broadband, X- or Ku-band terminal) | linked mode primary; high data rate | When platform within line-of-sight of shore terminal |
| SATCOM (LEO / commercial) | linked mode backup; coasting fallback | Most of the time, with constellation-dependent gaps |

### Link budget (placeholder; needs real numbers)

For the 4×18 nm baseline picket within ~30–80 nm of shore, the LOS-to-shore channel closes most of the time at low-to-moderate data rate. SATCOM closes nearly always at lower rate. Inter-platform mesh closes within the picket. **Real numbers come from a vendor link-budget pass; this is an architectural placeholder.**

### Comms-denied behavior

Per 04 §2, when comms duty cycle drops below 25 %, platforms enter **Denied** mode: pre-tasked station-keeping, full local classification, buffered alerts. This is a hardware-supported behavior but **defined in software**; the hardware lane provides the channels and degrades them gracefully.

## 4. Compute envelope (resolves GAP-HW-01)

### On-platform (Tier-1)

| Workload | Sizing |
|---|---|
| Sensor I/O + radar tracker | embedded class (1–2 cores) |
| Fusion (EKF/UKF + class assignment) | 2–4 cores |
| Classifier (rule-based at concept; ML at TRL-up) | 2–4 cores; GPU optional for ML |
| Autonomy planner | 1–2 cores |
| Comms / buffer / store-and-forward | 1 core |

**Concept-stage envelope:** **8-core x86 SBC, 32 GB RAM, optional small GPU (~50 W TDP)**. Total platform compute power budget ≤ **~250 W**.

### Tier-2 (Mission C2)

Off-platform; conventional service-oriented stack on customer compute. Out of platform power budget.

> **A-HW-02.** Compute envelope of ~250 W is achievable within Voyager's generation budget. Real validation in 06 power-test event.

## 5. Power budget (resolves GAP-HW-03)

| Subsystem | Continuous power (W, placeholder) |
|---|---|
| Sensor stack (radar + EO/IR + AIS + nav) | ~290 |
| Compute (Tier-1) | ~250 |
| Comms (LOS + SATCOM + mesh) | ~80 |
| Stabilization, mast actuators, etc. | ~40 |
| Reserves / margin | ~80 |
| **Total** | **~740 W continuous** |

**Voyager generation capacity (rough):** wind/solar variable, diesel backup; **typical surplus ~1 kW** when conditions are average. **Bound:** ARMOR's continuous draw must remain ≤ 75 % of Voyager's worst-case sustained generation, leaving margin for sea-state-dependent maneuvering and comms transmit peaks.

> **A-HW-03.** Power numbers above are placeholders. The first qualification event (see 06) is a continuous-operation power test.

## 6. Endurance envelope (resolves GAP-HW-04)

Voyager-class endurance is in the weeks-to-months range; ARMOR's continuous load reduces effective endurance by some factor. Concept commitment:

| Mode | Endurance target |
|---|---|
| On-station, watch-active | ≥ 30 days continuous |
| Transit | ≥ 7 days continuous |
| Refit cycle (shore) | ≤ 5 days |

These are concept-stage targets; real numbers require sea testing.

## 7. Survivability margin (resolves GAP-HW-05)

| Threat | Mitigation |
|---|---|
| Loss of single ARM-site (kinetic, mechanical, environmental) | Picket survives at 75 % coverage; mission C2 redistributes |
| Cyber takeover attempt | Cryptographic reject; secure-boot; minimal attack surface; audit |
| EW jamming | Comms-denied mode (04 §2); pre-tasked recovery |
| Capture / boarding (concept stage) | Out for this run; would require platform-resident anti-tamper not yet specified |
| Storm / sea state out of envelope | Pre-mission weather hold; recovery posture |

**Loss tolerance commitment:** picket designed for **1 ARM-site lost per fielded year** without mission failure. Cost trade in 03 §3 / TS-01.

## 8. Sustainment tail (resolves GAP-HW-06)

### Launch and recovery

Voyager-class is shore-launched and shore-recovered. Concept commitment:

- **Primary launch site:** sector-resident shore facility or USCG/USN base of operations.
- **Forward launch (concept):** cutter-deployed, where authorities and platform compatibility allow.
- **Crew:** L&R team of ≤ 4 per launch event.

### Maintenance cadence

| Maintenance type | Cadence |
|---|---|
| Preventive (sensors, hull, batteries) | every 30 days at refit |
| Corrective (sensor / compute board swap) | as-needed; field-replaceable units |
| Software update | over-the-air with dual-boot rollback |
| Cryptographic key rotation | sponsor policy |

### Logistics tail

- **Spares:** sensor heads, compute SBCs, comms terminals as line-replaceable.
- **Vendor support:** Voyager-class platform support comes from platform vendor; sensor / compute support from ARMOR program.
- **Deployment unit footprint:** modest — fits in standard ISO container per ARM-site.

## 9. Variant matrix (resolves GAP-HW-07; supports MT-03)

| Variant | Differences from baseline |
|---|---|
| **USCG variant (V-USCG)** | Service livery, USCG comms compatibility (DoD CAC variant), USCG sector-watch C2 integration, no acoustic/RF sensor at baseline |
| **USN variant (V-USN)** | Service livery, DoD CAC, USN OTC C2 integration, **adds** acoustic/RF sensor; **adds** classification handling for collected data |
| **Allied / partner variant (V-FMS)** | Release-controlled classifier baseline; partner-comms compatibility (NATO STANAG, theater-specific); export-controlled subset of fusion algorithms |

The platform line is **single**; the operational-stack profile differs. Sequencing: V-USCG first; V-USN second; V-FMS third (per 01 §2 / DT-03).

## 10. Manufacturing readiness (resolves GAP-HW-08)

- **Voyager-class platform:** vendor-provided. Lead time: weeks-to-months at concept stage.
- **Sensor heads:** COTS. 2 vendors per sensor class is target. Lead time: weeks.
- **Compute:** COTS SBC class. Multiple sources.
- **Comms terminals:** COTS. Multiple sources for LOS; SATCOM through commercial constellation.
- **Integration kit:** ARMOR program-built. Sole-source at concept; identify second source by end of architect phase.

> **A-HW-04.** All major non-integration components are COTS or COTS-class with multi-source. The integration kit is the program's IP.

## 11. SWaP-C summary

| Property | Estimate |
|---|---|
| Size | Within Voyager-class platform envelope |
| Weight | Sensor mast + compute + comms ≤ ~150 kg (TBD) |
| Power | ~740 W continuous (placeholder) |
| Cost (per platform, concept-stage rough order) | $X — vendor / sponsor specific; not in this artifact |

Cost is intentionally not estimated here — sponsor-conversation territory.

## 12. Gates

| Gate | Status |
|---|---|
| technical-plausibility | CONDITIONAL — power and link-budget placeholders need first vendor pass. |
| qualification-readiness | DEFERRED to 06. |
| (skill check) "Software and hardware share a coherent mission thread" | **YES.** |

## 13. Assumptions Ledger

| ID | Assumption | Risk |
|---|---|---|
| A-HW-01 | Voyager-class is the right point of departure. | Medium — DT-05 trade still open. |
| A-HW-02 | ~250 W compute envelope fits Voyager's generation. | Medium — needs first power test (06). |
| A-HW-03 | Continuous load ≤ 75 % of Voyager's sustained generation. | Medium — sea-state dependent. |
| A-HW-04 | Integration kit is the program's IP; rest is multi-source COTS. | Low — protects sustainment economics. |
| A-HW-05 | Single platform line, three operational profiles, is fundable. | Medium — variant strategy depends on multi-service interest. |

## 14. Evidence

| Source | Strength |
|---|---|
| Public Voyager-class spec sheets | Medium |
| COTS sensor / compute / comms data sheets | Medium |
| Vendor quotes for first sea trial | None yet |
| Real power / endurance from a partner deployment | None yet |

## 15. Open questions

- OQ-HW-01: Is Voyager sole-source or one of N candidates?
- OQ-HW-02: Customer-mandated comms terminals (e.g., a specific SATCOM constellation)?
- OQ-HW-03: USN-variant classified handling — what classification regime?
- OQ-HW-04: Cost target per platform — sponsor-set or program-set?
- OQ-HW-05: Field-launch from cutter — concept-acceptable or decision-deferred?

## 16. Dependencies

- 04 must size on-platform compute workloads to ≤ 250 W envelope.
- 06 power-test event closes A-HW-02.
- 07 must NOT cite per-platform cost numbers absent vendor-quoted basis.

## 17. Next actions

1. Get a first-call vendor link-budget pass on the 4×18 nm picket geometry.
2. Get a Voyager-class continuous-power-availability number, sea-state graded.
3. Stand up DT-05 platform trade study mini-pack.
4. Identify second source for integration kit.
