# ARMOR — Warfighter Systems Architect Package

**Owner:** ARMOR program (concept)
**Skill:** `warfighter-systems-architect` v1.0.0
**Run date:** 2026-05-06
**Classification:** UNCLASSIFIED // FOR PUBLIC RELEASE
**Run mode:** concept-stage, single-pass

This package is the backstage program-engineering record behind the ARMOR concept site (`/index.html`) and the SD-2014 mission webapp (`/ops/`). It exists so reviewers — capture leads, customer engineers, qualification leads — can audit the concept's coherence from operator problem to fielding readiness without reverse-engineering it from marketing copy.

## How to read this package

```
WSA/
├── README.md                   ← you are here
├── inputs/                     ← required skill inputs, synthesized from project content
│   ├── mission_problem_statement.md
│   ├── threat_and_operational_context.md
│   ├── software_and_system_baseline.md
│   └── hardware_and_platform_baseline.md
└── outputs/                    ← the eight skill deliverables
    ├── 01_mission_analysis_brief.md
    ├── 02_concept_and_scenario_package.md
    ├── 03_simulation_and_trade_study_evidence_pack.md
    ├── 04_mission_software_c2_architecture_definition.md
    ├── 05_hardware_integration_and_productization_plan.md
    ├── 06_qualification_and_deployment_readiness_package.md
    ├── 07_executive_and_customer_briefing_pack.md
    └── 08_reusable_experiment_and_decision_infrastructure.md
```

**Recommended read order for first-time reviewers:** 01 → 02 → 07 → drill into 03/04/05/06 as needed → 08 last.

## Mission threads (cross-reference IDs)

Every output references one or more mission threads:

| ID | Thread | Lead artifacts |
|---|---|---|
| **MT-01** | Persistent littoral picket against small-vessel illicit traffic (San Diego baseline) | 01, 02, 03, 04, 05 |
| **MT-02** | Distributed surveillance handoff under degraded comms / contested EW | 02, 03, 04, 06 |
| **MT-03** | Multi-service force aggregation (USCG primary, USN/Allied variants) | 02, 05, 06, 07 |

## Gate status (this run)

| Gate | Status | Note |
|---|---|---|
| mission-relevance | **PASS (provisional)** | Backed by referenced operator pain points; needs primary-source operator interviews. |
| operational-realism | **CONDITIONAL** | Scenarios are plausible at concept stage; lack adversary-COA depth. |
| technical-plausibility | **CONDITIONAL** | Saildrone-Voyager-class baseline is a real platform; sensor-fusion / autonomy claims carry assumption tags. |
| operator-trust-and-burden | **CONDITIONAL** | Architecture defines override paths; no operator testing yet. |
| qualification-readiness | **OPEN** | Qual matrix scoped (06); no test events run. |
| deployment-readiness | **OPEN** | Path identified (06, 07); funding / authorities not in place. |
| decision-readiness | **CONDITIONAL** | Sufficient for capture / pre-RFP positioning; not for milestone-A commitment. |

## Failure-prevention checklist (skill-level)

- [x] All 8 required outputs present
- [x] Software (04) and hardware (05) recommendations share one mission thread (MT-01 primary)
- [x] No concepts survive without explicit scenario logic (every concept in 02 maps to ≥1 scenario)
- [x] Trade studies and simulation document limitations and assumptions (03 §"Validation Gaps")
- [x] Qualification and deployment blockers are **named, not deferred** (06 §"Named Blockers")
- [x] Executive briefing does **not** claim certainty beyond evidence (07 evidence-tag column)
- [x] At least one reusable scenario or decision template extracted for next cycle (08)

## Update log

- **2026-05-06 — initial run** — full 8-artifact authoring pass against ARMOR concept site + SD-2014 webapp baseline. No primary-source operator data; assumption ledger surfaces every gap-fill. Next cycle should incorporate (a) ≥3 operator interviews, (b) at-sea data from any partner Voyager deployment, (c) export-controls review.

## Limitations of this package

This is a **concept-stage**, **public-release** authoring of the skill. Real program execution would require:

- Source documents the public site does not contain (program PRD, customer technical specifications, ICDs).
- Classified threat / sensor / link-budget data not appropriate to this artifact class.
- Operator-in-the-loop testing for the trust-and-burden gate.
- A government program manager and contracting authority for the deployment-readiness gate.

The package is honest about every one of these gaps. Treat the gate statuses above as the authoritative read; do not infer more confidence than the evidence supports.
