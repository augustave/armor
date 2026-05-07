# Hardware and Platform Baseline

**Artifact:** input/hardware_and_platform_baseline
**Skill:** warfighter-systems-architect v1.0.0
**Owner role:** Hardware Lead
**Mission threads:** MT-01, MT-03
**Classification:** UNCLASSIFIED // FOR PUBLIC RELEASE
**Status:** draft

This document captures the platform and hardware baseline that the ARMOR concept is anchored to. It distinguishes between **what the concept claims publicly**, **what is realistically implied**, and **what is missing**.

## 1. Reference platform

The concept's mission graph (`ops/main.js`) names **Saildrone Voyager** as the deployed platform. Voyager is a real, commercially-available USV in the **uncrewed surface vessel** class, ~10 m, wind/solar-augmented diesel-electric, designed for persistent at-sea operation in coastal-to-blue-water environments.

> **Assumption A-HB-01.** ARMOR's baseline platform is **Voyager-class**, meaning a 10–15 m monohull USV with a sensor mast and persistent endurance. This is shorthand; the concept does not technically commit to Saildrone as the sole vendor. A platform trade study (DT-05) is part of this run's open decisions.

### Platform claims grounded in the concept site

| Claim | Source | Notes |
|---|---|---|
| "Persistent sensor mast and low-profile hull geometry" | `index.html` line 254 | Generally consistent with Voyager-class. |
| "Heavy-water endurance for forward patrol zones" | `index.html` line 283 | Aspirational; Voyager is rated to coastal/littoral, not "heavy water" combat conditions. |
| "Coast Guard markings" / "Navy marked" variants | `index.html` lines 252, 282 | Implies a multi-service variant strategy (MT-03). |
| "Service-specific payloads and mission markings" | `index.html` line 276 | Implies a payload-modularity claim that needs validation. |
| "Single craft or mesh fleet" | `index.html` line 138 | Implies multi-vehicle coordination (drives 04, 05). |

## 2. Sensor baseline

The mission graph lists three sensor categories:

| Sensor | Tech-node | Implied capability |
|---|---|---|
| **Radar** | `tech-radar` | Surface search, small-target detection in moderate sea state |
| **EO / IR cameras** | `tech-eo-ir` | Visual confirmation, behavioral observation, classifier input |
| **ML software** | `tech-ml` | Fusion, classification, false-positive reduction |

The mission graph **also** encodes a meaningful relationship: ML software is "improved by" user refinement, which "enhances" range and "reduces" false positives. This is the only place in the project where there is a **closed feedback loop** from operator to platform.

> **Assumption A-HB-02.** Radar + EO/IR + classifier is the right baseline sensor mix for the small-vessel detection problem. SAR / passive RF / hyperspectral are out for the baseline; revisit at trade study.

## 3. Compute, networking, power (gaps)

The project has **no public claims** about:

- On-platform compute (CPU / GPU / FPGA, watt-class, thermal envelope)
- Networking (RF datalink, SATCOM, mesh between USVs, link budget)
- Power generation and storage (solar / wind / battery / fuel)
- Propulsion (sail / motor / hybrid; cruise speed; sprint speed)
- Endurance (days at sea; refuel cadence)

| Gap | Owner-of-resolution |
|---|---|
| GAP-HW-01 — On-platform compute envelope | 05 §"Compute Envelope" |
| GAP-HW-02 — Datalink / comms architecture | 05 §"Comms Architecture" |
| GAP-HW-03 — Power budget | 05 §"Power Budget" |
| GAP-HW-04 — Propulsion / endurance | 05 §"Endurance Envelope" |
| GAP-HW-05 — Survivability / loss tolerance | 05 §"Survivability Margin" |
| GAP-HW-06 — Maintenance / launch-and-recovery cycle | 05 §"Sustainment Tail" |
| GAP-HW-07 — Variant matrix (USCG / USN / Allied physical differences) | 05 §"Variant Matrix" |
| GAP-HW-08 — Manufacturing readiness (vendor, MRL, dual-source) | 05 §"Manufacturing Readiness" |

## 4. Reference geometry (concept-stage)

From `ops/main.js` defaults, the concept's working picket geometry is:

- **4 platforms** (`droneCount = 4`)
- **18 nm spacing** between adjacent platforms (`picketSpacing = 18`)
- **1.6× baseline sensor range** (`rangeMultiplier = 1.6`)
- **One-leg** picket along an approach lane (assumed; not explicitly stated)

For this geometry, four ARM-site markers (`[ARM-1A]`, `[ARM-2B]`, `[ARM-3C]`, `[ARM-4D]`) are placed approximately 18 nm apart along the demonstration coastline.

> **Assumption A-HB-03.** A 4-platform, 18-nm picket is a reasonable concept-stage starting point but has no claim to being optimal. Output 03 sweeps this knob.

## 5. Ruggedization and qualification posture (gaps)

| Question | Status |
|---|---|
| MIL-STD-810 environmental envelope? | **Open.** |
| MIL-STD-461 EMI/EMC? | **Open.** |
| IPxx ingress rating for sensor mast electronics? | **Open.** |
| Cyber baseline (NIST 800-171 / CMMC level)? | **Open.** |
| Export control posture (ITAR / EAR)? | **Open — strongly probable ITAR for fusion/classifier code.** |
| COLREGS compliance for the autonomy posture? | **Open — gating for U.S. coastal operation.** |

These are surfaced in `06_qualification_and_deployment_readiness_package.md`.

## 6. Imagery on file (visual baseline)

Project repo holds:

- `AR01-IMG/Frame 1272638035.png` — three USVs in formation, open water
- `AR01-IMG/Frame 1272638036.png` — side profile, USCG marking, persistent mast
- `AR01-IMG/Frame 1272638037.png` — three USVs heavy water
- `AR01-IMG/Frame 1272638038.png` — USV cresting waves
- `AR01-IMG/Frame 1272638044.png` — two USCG-marked USVs
- `AR01-IMG/Frame 1272638046.png` — USN-marked USV
- `AR01-OPS/sd-2014-t{0_9, 3_8, 7_4, 14}.png` — operational-picture stills

These images are **concept renders / illustrations**, not photographs of fielded prototypes. They document the look-and-feel and the intended variant story, not the achieved hardware.

## 7. Multi-service variant story

The concept clearly implies three variants:

| Variant | Implied differences (concept-stage; not validated) |
|---|---|
| **USCG variant** | Service livery; tasking integration with USCG District watch floors; Title 14 authorities. |
| **USN variant** | Service livery; tasking integration with USN OTC; possibly different sensor / payload kit. |
| **Allied / partner variant** | Export-controlled subset; release-eligible classifier baseline; partner-comms compatibility. |

The differences across variants are **not yet defined** at the system level. Output 05 §"Variant Matrix" is where this gets bounded.

## 8. Assumptions Ledger

| ID | Assumption | Risk if wrong |
|---|---|---|
| A-HB-01 | Voyager-class is the right platform-of-departure. | Medium — drives entire 05 baseline; revisited at DT-05. |
| A-HB-02 | Radar + EO/IR + classifier is the right baseline sensor mix. | Medium — drives 04 fusion contract. |
| A-HB-03 | 4-platform / 18-nm picket is a reasonable starting point. | Low — sensitivity-swept in 03. |
| A-HB-04 | Multi-service variant strategy is real, not just sales narrative. | Medium — drives 05 productization. |
| A-HB-05 | "Heavy-water endurance" copy is aspirational, not a current capability. | Low — flagged honestly. |

## 9. Open questions

- OQ-HB-01: Is the platform decision **Voyager** or **Voyager-class** (i.e., is Saildrone the sole-source or a candidate)?
- OQ-HB-02: What is the on-platform compute envelope the program is willing to spend?
- OQ-HB-03: Datalink architecture: SATCOM-primary, RF-mesh, both, or new?
- OQ-HB-04: What is the realistic loss tolerance per ARM-site per fielded year (cost / survivability)?
- OQ-HB-05: Are USCG and USN variants funded as separate programs or one program of record with variants?

## 10. Next actions

1. Stand up a platform trade-study mini-pack (DT-05) with at least three candidates (Saildrone Voyager, vendor B, vendor C).
2. Pull a public-domain comms / link-budget reference for the picket geometry and ground GAP-HW-02.
3. Get a vendor quote on Voyager availability and lead time before any sponsor conversation that requires platform commitment.
