# Mission Problem Statement

**Artifact:** input/mission_problem_statement
**Skill:** warfighter-systems-architect v1.0.0
**Owner role:** Warfighter Research Lead
**Mission threads:** MT-01, MT-02, MT-03
**Classification:** UNCLASSIFIED // FOR PUBLIC RELEASE
**Status:** draft

## 1. Source-quoted voice (verbatim, with citations)

The following strings are taken directly from the ARMOR concept site to preserve the programmatic voice. They are the raw mission language the program is currently using publicly.

| Quote | Source |
|---|---|
| "Persistent maritime presence without expanding crew exposure." | `index.html` §mission, line 114 |
| "ARMOR turns patrol, reconnaissance, and screening work into a distributed autonomous layer that can hold water, relay awareness, and move as a coordinated surface fleet." | `index.html` §mission, line 116–119 |
| "Designed for handoff from shore, cutter, or expeditionary deck." | `index.html` §split, line 126 |
| "Watch, screen, relay" | `index.html` §metrics, line 134 |
| "Single craft or mesh fleet" | `index.html` §metrics, line 138 |
| "Low-signature maritime coverage" | `index.html` §metrics, line 142 |
| "Hold assigned lanes and surface contacts while keeping operators outside the first line of exposure." | `index.html` §capability-01, line 169–171 |
| "Extend visual and electronic watch over harbor mouths, island chains, and gray-zone approaches." | `index.html` §capability-02, line 177–179 |
| "Built to scale from a single watch point to a distributed patrol line." | `index.html` §fleet, line 213 |

## 2. Operator and decision frame

### Primary user
**Watch officer** standing a multi-hour shift on a USCG District 11 sector command floor (San Diego) — or an equivalent USN/Allied small-vessel watch billet. The watch officer's job is to maintain awareness of small-vessel traffic across a coastal box that is too large to keep crewed assets in continuously, and to **vector responders only when responders are actually needed.**

Secondary users:
- Cutter captain receiving a tasking handoff (consumer of vectored alerts)
- Sector intelligence analyst (consumer of pattern-of-life data)
- Maintenance / launch-and-recovery crew at the supporting shore facility (operator burden tail)

### What the user is trying to decide
1. **Is there something out there worth waking a cutter / RHIB / aircrew for?** (real-time decision, latency-sensitive)
2. **Where is the signal coming from in the last 24 / 72 hours?** (pattern-of-life decision, latency-tolerant)
3. **Can I trust what the autonomous layer is telling me right now?** (trust-calibration decision, continuously running)

### Why the current crewed-only force structure isn't enough
The current force does not have enough crewed asset-hours to keep continuous watch on the entirety of a sector approach. Today the gap is filled by a combination of cued sorties, ad-hoc air taskings, and hope. The result is **detection holes the adversary can exploit** — small fast craft running close to shore at times of day when crewed assets are not on station.

> **Assumption A-MP-01.** This problem statement is grounded in publicly-known sector challenges in maritime drug interdiction. It has **not** been validated through primary-source watch-officer interviews. A primary-source pass is required before this document leaves the concept stage.

## 3. Desired mission effect

The user-visible effect of fielding ARMOR is:

1. **Coverage**: at least one autonomous track is on station in every named approach lane during every watch, every day, with no additional crewed asset-hours.
2. **Vectoring**: when something is detected, the watch officer receives a calibrated alert (with confidence, position, and behavior summary) inside an actionable response window for the named responding asset.
3. **Pattern-of-life**: the sector accumulates a queryable record of small-vessel behavior over the box, usable for retrospective analysis and adversary-COA discovery.
4. **Operator burden parity or better**: the watch officer's cognitive load with ARMOR fielded is **not greater** than today's, even though coverage is significantly higher. (This is a hard constraint, not a goal.)

## 4. Decision targets (what this concept is asked to inform)

| Target | Decision | Horizon |
|---|---|---|
| DT-01 | Does ARMOR justify a sponsored experiment with a USCG District? | Q3 2026 |
| DT-02 | Which sensor package (radar / EO-IR / fusion) earns the integration slot first? | concept-architect handoff |
| DT-03 | Is the multi-service variant strategy (USCG-primary, USN/Allied) sound or a distraction? | post-experiment |
| DT-04 | What is the minimum viable picket count and spacing for a single approach? | sim + experiment |
| DT-05 | Is a Saildrone-Voyager-class baseline the right platform, or does a different commercial USV win? | platform trade |

## 5. Scope (in / out)

**In scope.** Persistent, multi-vehicle, autonomous surface-vessel awareness in coastal/littoral waters; sensor fusion of radar + EO-IR + ML classifier; operator-facing C2 surface; multi-service variant productization; fielding sequence to a first-of-class deployment.

**Out of scope (for this concept run).** Lethal effects, sub-surface ASW, blue-water / deep-ocean operations, full-up multi-domain C2 integration, classified payloads, foreign military sales pricing.

## 6. No-go conditions

The concept fails outright if any of these is true at the next-cycle decision point:

- **NG-01**: Operator burden testing shows the watch officer's load increases with ARMOR fielded.
- **NG-02**: Sensor performance under realistic littoral sea state and clutter falls below 0.5× the lab-quoted detection range.
- **NG-03**: COLREGS / authorities review concludes the autonomy posture cannot be safely exercised in a U.S. coastal box without crewed escort.
- **NG-04**: Comms link budget for the picket geometry cannot close at usable duty cycle.
- **NG-05**: A platform availability / cost analysis shows the per-track-hour cost is greater than the existing crewed alternative.

## 7. Assumptions Ledger

| ID | Assumption | Risk if wrong | Source / rationale |
|---|---|---|---|
| A-MP-01 | The watch-officer pain point is primarily detection coverage, not classification accuracy. | High — concept reframes around an irrelevant problem. | Inferred from public reporting on USCG District 11 small-vessel interdiction; no primary-source confirmation. |
| A-MP-02 | The operator-burden constraint can be met with a "calibrated alert" UX (confidence + behavior summary), not raw track lists. | Medium — drives major UX choices in 04. | Industry experience with maritime ATC/ATM; needs operator-test confirmation. |
| A-MP-03 | The multi-service variant story is real (USCG, USN, Allied) and not just sales aspiration. | Medium — drives 05 productization choices. | Implied by capability copy in `index.html` (USN-marked + USCG-marked imagery) but no signed multi-service interest. |
| A-MP-04 | A Saildrone-Voyager-class platform is the right point of departure. | Medium — drives 05 baseline. | Voyager appears in `ops/main.js` mission graph as the deployed platform. |
| A-MP-05 | "Coastal" / "littoral" is the correct theater scope; blue-water is out. | Low — bounded explicitly. | `index.html` capability-02 names "harbor mouths, island chains, gray-zone approaches." |

## 8. Open questions for next cycle

- OQ-MP-01: Who is the named program sponsor? (No name on record yet.)
- OQ-MP-02: What is the funded experiment vehicle? (BAA, OTA, CRADA, sponsored CRADA?)
- OQ-MP-03: Is there a partner Voyager deployment whose at-sea data we can mine?
- OQ-MP-04: What classification regime do real operator interviews need to land in?
- OQ-MP-05: What are the closest-comparable crewed alternatives' true sortie costs?

## 9. Next actions

1. Schedule 3 watch-officer interviews (USCG D11 priority).
2. Execute a public-domain crewed-alternative cost comparison (sortie hours / detection).
3. Confirm Voyager-class platform-availability assumption with a vendor conversation.
4. Decide DT-01 sponsor by Q3 2026.
