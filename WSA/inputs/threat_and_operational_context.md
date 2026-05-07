# Threat and Operational Context

**Artifact:** input/threat_and_operational_context
**Skill:** warfighter-systems-architect v1.0.0
**Owner role:** Operational Analysis Lead
**Mission threads:** MT-01, MT-02
**Classification:** UNCLASSIFIED // FOR PUBLIC RELEASE
**Status:** draft

## 1. Theater and reference geometry

**Reference theater.** San Diego coastal approaches, U.S.–Mexico maritime border, USCG District 11 area of responsibility.

**Reference grid.** `LAT 32.7157 / LON -117.1611 / GRID PSS-1.0`. (Source: `ops/index.html` line 18; this is a project canonical anchor, not a real ops grid.)

**Reference loop.** A 28-second canonical observation loop, four named ARM-site markers (`[ARM-1A]`, `[ARM-2B]`, `[ARM-3C]`, `[ARM-4D]`), placed in a notional picket geometry that survives in the SD-2014 mission webapp as the working reference scenario. (Source: `ops/main.js`.)

**Sea-state envelope.** Beaufort 0–5 nominal; degraded performance expected at 6+. Surge / coastal squall conditions are explicitly within the envelope.

> **Assumption A-TC-01.** The "San Diego synthesis" theater is a stand-in chosen for being publicly defensible. A real run of this skill would be theater-specific (SOUTHCOM littoral, INDOPACOM gray-zone, OSCE Black Sea, etc.) with materially different threat models.

## 2. Threat catalog

The ARMOR concept's mission graph (`ops/main.js`) names the following threat / threat-actor types:

| Threat ID | Description | Source citation |
|---|---|---|
| TH-01 | **Small-vessel illicit traffic** ("pangas" — small fast open-hull craft) | mission graph node `concept-pangas`, lines 95–98 |
| TH-02 | **Drug trafficking** (sea-route) | mission graph node `threat-drug-traffic`, line 99 |
| TH-03 | **Smuggling** (broad: human, goods, CBRN-precursor) | mission graph node `threat-smuggling`, line 99 |

### Threat behavior model (TH-01 / TH-02 / TH-03 — combined small-vessel adversary)

| Dimension | Baseline | Stress |
|---|---|---|
| Speed | 15–35 kt | up to 45 kt for short bursts |
| Cross-section | very small radar return; small EO/IR signature | active emission control, hugging shoreline / coastal clutter |
| Formation | typically single craft; occasional pair/cluster | multi-craft swarm at narrow time window |
| Time of day | dawn / dusk / night preferred | midday opportunistic |
| Counter-measure posture | passive (avoid detection) | active (jamming, spoofed AIS, decoy launches) — concept stage, not baseline |
| Fueling / staging | shore points on adversary side; opportunistic mid-route refueling | at-sea logistics support |

### What the threat is NOT (in this run)

- Not state-grade naval combatants. ARMOR is not designed to be a force-on-force USV against a peer.
- Not submarine / sub-surface threats. Out of scope (see mission_problem_statement.md §5).
- Not lethal-effects threats from the autonomous layer. ARMOR observes; it does not engage.

## 3. Adversary courses of action (COA)

| COA | Description | ARMOR's intended behavior | Risk to ARMOR |
|---|---|---|---|
| COA-1 (baseline) | Single panga, dawn run, hug-coast route | Detect, classify, alert, vector responder, persist track | Low — the high-confidence case |
| COA-2 | Decoy + real run (one craft draws the responder, second runs the lane) | Maintain coverage on multiple tracks; surface ambiguity to operator | **Medium** — picket count and spacing matter |
| COA-3 | Active emission-control + clutter-hugging | Multi-modal fusion (radar + EO/IR + behavioral) recovers the track | **Medium-High** — sensor performance assumption is binding |
| COA-4 | Spoofed AIS / mimicked fishing-vessel pattern | Behavior classifier flags the pattern mismatch | **High** — depends on ML maturity |
| COA-5 | Direct kinetic / harassment of an ARM-site asset | Loss tolerance of the picket; graceful degradation; survivability margins | **High** — drives platform survivability decisions in 05 |
| COA-6 | EW jamming of the picket's command / data link | Autonomy-on-the-edge fallback; pre-tasked station-keeping; operator notified of comms loss | **Critical** — drives autonomy-boundary decisions in 04 |

> **Assumption A-TC-02.** COA-4 (spoofed AIS / mimicry) and COA-6 (EW) are realistic for any near-peer adversary in any theater; they are listed because they materially shape architecture, not because intelligence reporting is included here.

## 4. Environmental and operational context

| Factor | Baseline | Stress |
|---|---|---|
| Sea state | Beaufort 2–4 | Beaufort 6+ |
| Visibility | 5–10 nm | 0.5 nm (fog) |
| Comms | LOS to shore terminal continuously available | partial / contested LOS, intermittent SATCOM |
| GPS / GNSS | nominal | jammed / spoofed (drives INS reliance) |
| Daylight | continuous diurnal cycle | extended-night operations |
| Coastal clutter | high (recreational, commercial, fishing traffic) | very high (port approach, harbor mouth) |
| Sea-room / collision-avoidance | continuous COLREGS-relevant | constrained channel, mandatory traffic separation |

## 5. Force-structure context (existing crewed assets ARMOR is augmenting)

- **USCG cutters** (medium-endurance, fast-response — varying by sector). Cued from sector tasking.
- **USCG aviation** (HC-144, MH-65, MH-60). Cued, expensive, fatigue-limited.
- **Sector watch floor** (the consumer of ARMOR's alerts).
- **Civil partners / state and local** (San Diego harbor, port authority, Customs and Border Protection Air and Marine Operations).
- **USN partners** (Surface Development Squadron / NSWC littoral teams; USN-marked imagery in `index.html` suggests notional Navy variant).

## 6. Operating relationships

```
Sector Command (watch floor)
        │
        ▼
   [ARMOR alerts]
        │
        ▼
Tasking authority (USCG sector, USN OTC, or Allied counterpart)
        │
        ▼
Responding asset (cutter / aviation / RHIB / interceptor)
```

> **Assumption A-TC-03.** ARMOR is an **awareness contributor**, not a tasking authority. It surfaces calibrated alerts; humans task the response. This bounds the trust-and-burden gate scope significantly.

## 7. Doctrine notes (placeholder)

A full run would cite specific doctrinal references (USCG OPLAN templates, USN small-vessel doctrine, NATO MARSEC framework, etc.). For this public-release concept run, the doctrinal posture is:

- **Domestic theater (USCG primary).** Authorities regime is Title 14 USC; ARMOR augments existing watch and patrol functions; no Title 10 authorities required.
- **Allied / overseas theater (USN or partner-led).** Authorities regime is theater-dependent; ARMOR is provided as a sensor-grid contributor under the local force commander.
- **No autonomous use of force.** Concept-level constraint, see §2.

> **Assumption A-TC-04.** A real run would have a doctrine-and-employment-context input doc. This run treats doctrine as bounded by `mission_problem_statement.md` §5 in/out scope.

## 8. Assumptions Ledger

| ID | Assumption | Risk if wrong |
|---|---|---|
| A-TC-01 | San Diego littoral is a representative reference theater. | Low — concept generalizes; specific scenarios would change. |
| A-TC-02 | EW + AIS-spoofing are within the realistic threat envelope. | Low if shared with sponsor; High if ARMOR is built without these in mind. |
| A-TC-03 | ARMOR is awareness-only, not tasking authority. | High — drives 04, 06. Removing this assumption changes the entire concept. |
| A-TC-04 | Doctrine handling is theater-dependent and out of scope for this run. | Medium — doctrine review is required before fielding. |
| A-TC-05 | Loss of an individual ARM-site asset is acceptable (graceful degradation). | Medium — drives 05 cost / survivability. |

## 9. Open questions

- OQ-TC-01: What sea state and visibility are *actually* the design corner for the sponsoring sector?
- OQ-TC-02: Is COA-6 (EW) the binding driver of autonomy posture, or is COA-4 (mimicry)?
- OQ-TC-03: What is the realistic loss tolerance per ARM-site per fielded year?
- OQ-TC-04: Is allied / partner data sharing in-scope at concept stage, or deferred?
- OQ-TC-05: Where on the SOUTHCOM / INDOPACOM / domestic spectrum will the first sponsored experiment land?

## 10. Next actions

1. Convert this generic threat catalog into a sponsor-specific theater pack at first sponsor contact.
2. Update with classified threat data once a classification regime exists for the program.
3. Confirm or remove COA-4 / COA-6 as architecture drivers via sponsor conversation.
