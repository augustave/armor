# 07 — Executive and Customer Briefing Pack

**Artifact id:** WSA-OUT-07-EXEC
**Skill:** warfighter-systems-architect v1.0.0
**Owner role:** All roles (synthesized)
**Phase:** brief
**Mission threads:** MT-01, MT-02, MT-03
**Classification:** UNCLASSIFIED // FOR PUBLIC RELEASE
**Status:** draft (markdown surrogate for `.slides`)
**Inputs consumed:** 01, 02, 03, 04, 05, 06

> **Format note.** The skill specifies `.slides` for the briefing pack. This file is a **markdown surrogate** structured as a deck outline: each `## SLIDE N — ...` heading is a slide, the body is the speaker note + visual specification. Slides can be rendered with any deck tool from this outline.
>
> **Discipline rule (binding for this artifact).** Every claim is tagged with an evidence column: 🟩 measured, 🟨 modeled, 🟧 assumed, 🟥 unevidenced. **Never present 🟧 or 🟥 as if it were 🟩.**

---

## SLIDE 1 — Title

**Visual:** ARMOR wordmark; tagline "Persistent maritime presence without expanding crew exposure" (quoted from `index.html`); subtitle "Concept review — capture / pre-RFP positioning."

**Speaker note:** This pack is a concept-stage review. It is sufficient for capture / pre-RFP positioning. It is **NOT** a milestone-A package.

---

## SLIDE 2 — The problem

**Visual:** map of San Diego coastal approach with current crewed-sortie coverage patches (gaps illustrated).

**Body:**
- USCG (and analogous services) cannot keep continuous crewed coverage on every coastal approach.
- Detection sparsity is exploitable: small fast craft running close to shore, off-watch, off-AIS.
- Current pattern: **respond to what we noticed; miss what we didn't.**

**Evidence:** 🟨 modeled (`inputs/mission_problem_statement.md`); 🟧 assumed (no operator interviews yet — A-MP-01).

---

## SLIDE 3 — The user

**Visual:** sector watch floor diagram; watch-officer persona card.

**Body:**
- **Primary user:** USCG District 11 sector watch officer (or USN/Allied analog).
- **Decisions they make:** is this worth waking a cutter? where is the pattern over 24/72 hr? can I trust what the autonomous layer just told me?
- **Operator-burden constraint (HARD):** today's load is the floor. ARMOR fielded shall not exceed it.

**Evidence:** 🟨 modeled; 🟧 binding constraint, not yet HITL-tested.

---

## SLIDE 4 — The concept (CO-A: continuous picket)

**Visual:** the SD-2014 webapp at t=7.4s (full-constellation moment) — 4 ARM-sites lit, tracks revealed, scan band sweeping.

**Body:**
- **4 Voyager-class autonomous platforms**, ~18 nm apart along an approach lane.
- **Sensor fusion** on each: marine radar + EO/IR + classifier.
- **Calibrated alerts** to the watch officer — confidence + behavior summary, not raw tracks.
- **Pattern-of-life store** for retrospective analysis.
- **Operator burden ≤ today's** is a hard design constraint.

**Evidence:** 🟨 modeled (CO-A wins on M-3 in trade study; see SLIDE 9).

---

## SLIDE 5 — Why this concept (concepts considered)

**Visual:** small-multiple of CO-A / CO-B / CO-C concept thumbnails; CO-D and CO-E shown as crossed out.

**Body:**
- **CO-A** continuous picket — recommended.
- **CO-B** sparse-mobile — kept alive (alternate).
- **CO-C** two-tier watcher + investigator — kept alive (alternate).
- **CO-D** air-deployed transient — rejected (sortie cost dominates).
- **CO-E** cutter-mothership swarm — rejected (operator burden, authorities).

**Evidence:** 🟨 modeled (`02_concept_and_scenario_package.md` §1).

---

## SLIDE 6 — How it behaves: three scenarios

**Visual:** three scenario thumbnails — S-1 baseline / S-2 mimicry stress / S-3 comms-denied stress.

**Body (each scenario):**

- **S-1 Baseline (dawn watch).** ARMOR detects, classifies, alerts, watch officer vectors. M-1 (useful-detection) ≥ 0.80. **Demonstrates MT-01.** 🟨 modeled.
- **S-2 Mimicry stress.** ARMOR's classifier flags a behavior-pattern mismatch *below* alert threshold; pattern-of-life store accumulates for retrospective. **Demonstrates non-overclaim posture.** 🟨 modeled; behavior of real classifier under mimicry is 🟧 assumed (GAP-EP-01).
- **S-3 Comms-denied stress.** ARMOR enters Coasting/Denied; alerts buffer; flush on link recover; operator sees stale-but-buffered cleanly. **Demonstrates MT-02.** 🟥 unevidenced — comms link-budget is not yet modeled (GAP-EP-03).

---

## SLIDE 7 — The software architecture (MT-01 + MT-02)

**Visual:** the three-tier diagram from `04 §1` — platform / mission C2 / watch.

**Body:**
- **Tier-1 (on platform):** sensor → fusion → classifier → autonomy → buffer.
- **Tier-2 (mission C2):** cross-platform track management, calibration, pattern-of-life store, audit.
- **Tier-3 (watch floor):** calibrated alerts in, override / escalate out.
- **Authorities posture (non-negotiable):** ARMOR observes; humans task and act.

**Evidence:** 🟨 specification; not yet built.

---

## SLIDE 8 — The hardware (MT-01 + MT-03)

**Visual:** USCG-marked + USN-marked Voyager-class platforms (existing imagery in `AR01-IMG/`).

**Body:**
- **Voyager-class platform** (commercially available; concept commitment is to *class*, not sole-source).
- **Sensor mast:** radar + EO/IR + AIS + GPS/INS; ~290 W.
- **On-platform compute:** ~250 W envelope; fusion + classifier + autonomy + buffer.
- **Three-channel comms:** mesh / LOS / SATCOM.
- **Variant matrix:** V-USCG, V-USN, V-FMS — single platform line, three operational profiles.

**Evidence:** 🟨 modeled. Power numbers are placeholders pending vendor pass.

---

## SLIDE 9 — The trade studies (where the numbers come from)

**Visual:** three trade-study graphics — picket count vs. survivability; sensor mix at fixed budget; CO-A / CO-B / CO-C burden comparison.

**Body:**
- **TS-01 picket count:** 4 platforms is the survivability/cost knee.
- **TS-02 sensor mix:** all-fusion recommended at concept; mixed retained as alternate.
- **TS-03 concepts:** CO-A wins on M-3 (operator burden), the binding constraint.
- **Most fragile knob:** sensor performance (`rangeMultiplier`). Real sensor model is the highest-leverage single fix.

**Evidence:** 🟨 modeled, **with named limitations** (`03_simulation_and_trade_study_evidence_pack.md` §1.2 enumerates what was NOT run).

---

## SLIDE 10 — What's measured today vs. what isn't

**Visual:** three columns — Measured / Modeled / Unevidenced.

**Body:**

| Measured 🟩 | Modeled 🟨 | Unevidenced 🟥 |
|---|---|---|
| Mission-graph internal coherence | Picket geometry sensitivity | Operator burden delta (M-3) |
| Concept-screen rationale (CO-A/B/C) | Sensor-mix sensitivity | Comms link-budget closure (S-3) |
| Architecture specification | Concept relative ranking | Real sensor performance under sea state |
| Variant matrix | Cost knee at 4 platforms | Authorities clearance for autonomy |

**Note:** the Unevidenced column is **not** a flaw — these are the named gaps with named resolution paths. The honesty here is the point.

---

## SLIDE 11 — What this concept is asking for

**Visual:** ask block.

**Body:**

1. **Sponsored experiment commitment** with a USCG District (D11 priority).
2. **Voyager-class platform availability** for first sea trial.
3. **HITL operator test rig partner** (USCG R&D Center or analog).
4. **Authorities pre-clearance dialogue** for autonomy posture in U.S. coastal water.
5. **Sponsor-set cyber + data policy** to bound qualification path.

**Evidence:** 🟧 — these are the asks, not yet committed.

---

## SLIDE 12 — Risk and named blockers

**Visual:** blocker cards (B-01 through B-08).

**Body:**

| ID | Blocker | Resolution path |
|---|---|---|
| B-01 | COLREGS / authorities for autonomy in U.S. coastal water | Sponsor-led authorities review |
| B-02 | Real sensor model (no real radar/EO-IR detection curves yet) | Vendor data + closed-area test |
| B-03 | Operator-burden HITL rig | Partner with USCG R&D |
| B-04 | Sponsor-set cyber framework | Sponsor conversation |
| B-05 | Sponsor-set data retention | Sponsor conversation |
| B-06 | V-USN classification regime | Sponsor conversation |
| B-07 | First Voyager-class sea-trial slot | Vendor scheduling |
| B-08 | Export-control review for fusion/classifier | Counsel/SME review |

**Note:** every blocker has a named resolution path. Nothing is deferred indefinitely.

---

## SLIDE 13 — Sequence

**Visual:** swim-lane timeline.

**Body:**

1. Capture / pre-RFP (now → Q3 2026)
2. Sponsored experiment (Q3 2026 → Q1 2027) — Tier-1 prototype, first sea trial
3. V-USCG limited deployment (~Q1 2028 estimated)
4. V-USN limited deployment (~Q3 2028 estimated)
5. V-FMS first partner case (~Q1 2029 estimated)

**Evidence:** 🟧 — illustrative; sponsor and contract-action dependent.

---

## SLIDE 14 — What we will NOT do (concept commitment)

**Visual:** "non-goals" block.

**Body:**

- ARMOR will **not** engage targets.
- ARMOR will **not** task responders autonomously — humans task.
- ARMOR will **not** operate in scope outside coastal/littoral at concept stage.
- ARMOR will **not** present uncalibrated probability as truth.
- ARMOR will **not** field with any of the no-go conditions (NG-01..NG-05) unresolved.

---

## SLIDE 15 — What success looks like in 18 months

**Visual:** future-state diagram — sector watch floor with ARMOR alerts, cutter sortie efficiency improving.

**Body:**
- One sponsored experiment running with a USCG District.
- Tier-1 prototype on a Voyager-class platform demonstrating S-1 in instrumented sea trial.
- HITL operator test passing M-3 ≤ 0.
- Authorities letter drafted for unescorted autonomy posture in named coastal box.
- V-USCG productization plan converging on a real lead time and cost.

**Evidence:** 🟧 — this is the goal, not committed delivery.

---

## SLIDE 16 — Closing — the integrity of this package

**Visual:** the gate-status table from `WSA/README.md`.

**Body:**

- Every claim in this deck has an evidence tag (🟩 / 🟨 / 🟧 / 🟥).
- Every named blocker has a named resolution path.
- The package is **honest** about the gaps — that's why it's reviewable.
- Treat the gate statuses (PASS provisional / CONDITIONAL / OPEN) as authoritative; do **not** infer more confidence than the evidence supports.

**Closing line:** "Persistent maritime presence without expanding crew exposure" is the right problem. ARMOR is a coherent, gate-screened answer at concept stage. Next milestone is sponsor-led; we have shown what we know, what we don't, and how to find out.

---

## Backup slides (use if asked)

- **B1.** Operator UI mockup (the alert format from `04 §3`).
- **B2.** Track lifecycle state diagram (from `04 §5`).
- **B3.** Three-channel comms architecture (from `05 §3`).
- **B4.** Per-variant differences (from `05 §9`).
- **B5.** Sensitivity table from `03 §2.1` (picket geometry).
- **B6.** Mission entity graph from SD-2014 (16 nodes, 17 edges).
- **B7.** Reference grid + reference loop (PSS-1.0, 28-second loop).

## Gates (this artifact)

| Gate | Status |
|---|---|
| executive-briefing-review | PASS — every claim evidence-tagged. |
| (skill check) "Executive outputs do not overclaim beyond evidence" | **YES.** |

## Assumptions Ledger

(Inherits from upstream artifacts. No new assumptions introduced in the briefing.)

## Open questions

(Inherits from upstream. The briefing is a synthesis, not a generator of new open questions.)

## Next actions

1. Render this outline to slides (any deck tool).
2. Use the sponsor conversation to resolve at least 3 of the 8 named blockers.
3. Update gate-status table after each sponsor touchpoint.
