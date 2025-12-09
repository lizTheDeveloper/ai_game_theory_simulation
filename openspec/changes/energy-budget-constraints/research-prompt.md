# Energy Budget Constraints - Research Prompt

**Created:** 2025-12-09
**For:** super-alignment-researcher (Cynthia)
**Priority:** MEDIUM
**Timeline:** 3-4 hours

---

## Context

God mode deployment causes collapse because technologies compete for the same limited electricity without constraints. Current simulation allows DAC (34-51% global electricity), AI datacenters (6-8% by 2030), and hydrogen production (requires dedicated capacity) to all deploy simultaneously.

**Proposal:** `openspec/changes/energy-budget-constraints/proposal.md`

---

## Research Objectives

Extract research-backed parameters for global energy budget constraints to prevent unrealistic technology competition.

---

## Research Questions

### 1. Global Electricity Capacity Baseline (IEA WEO 2024)

**Extract:**
- **Total global electricity generation (2025 baseline):** ~30,000 TWh/year expected
- **Clean electricity capacity:** Solar, wind, hydro, nuclear as % of total
- **Reserve margins:** What % typically held in reserve for grid stability
- **Regional breakdown:** If significantly different constraints exist by region

**Sources:** IEA World Energy Outlook 2024, IEA Electricity Market Report 2024

**Output format:**
```
Global Electricity Capacity (2025):
- Total: X TWh/year (SOURCE)
- Clean: Y TWh/year (Z% of total) (SOURCE)
- Reserve margin: W% (SOURCE)
```

---

### 2. Electricity Growth Projections (2025-2050)

**Extract:**
- **Annual growth rate:** Historical trend + IEA projections
- **Clean energy growth rate:** Faster than total growth?
- **Scenario dependence:** STEPS vs APS vs NZE scenarios
- **Saturation points:** Does growth plateau? When?

**Sources:** IEA WEO 2024 (multiple scenarios), IRENA Global Energy Transformation

**Output format:**
```
Growth Projections (2025-2050):
- Total electricity growth: X%/year (SCENARIO) (SOURCE)
- Clean electricity growth: Y%/year (SOURCE)
- Saturation dynamics: (description) (SOURCE)
```

---

### 3. Technology Energy Requirements

#### 3.1 Direct Air Capture (DAC)

**Extract:**
- **Energy per tonne CO2:** GJ/tCO2 (both high-temp and low-temp DAC)
- **Electricity share:** What % of total energy is electricity (vs heat)
- **Scale relationship:** Does GJ/tCO2 improve with scale?
- **Global capture target:** Gt CO2/year needed for 1.5°C pathways
- **Implied electricity demand:** At 1 Gt/year, 5 Gt/year, 10 Gt/year

**Sources:** MIT Energy Initiative DAC reports, IEA CCUS in Clean Energy Transitions, Nature Climate Change 2024 DAC papers

**Output format:**
```
DAC Energy Requirements:
- Energy intensity: X-Y GJ/tCO2 (SOURCE)
- Electricity fraction: Z% (SOURCE)
- At 1 Gt/year capture: W TWh/year (A-B% of 2025 global) (CALCULATION)
- At 5 Gt/year capture: ... (CALCULATION)
- At 10 Gt/year capture: ... (CALCULATION)
```

#### 3.2 AI Datacenters

**Extract:**
- **Current electricity consumption:** TWh/year (2025 baseline)
- **Current share of global electricity:** %
- **Projected growth:** 2030 projections, 2040 projections
- **2030 share:** IEA projects 6-8% by 2030 - validate this
- **Efficiency improvements:** Offset from hardware efficiency gains

**Sources:** IEA AI & Energy special report (2024), Google Environmental Report, Microsoft Sustainability Report

**Output format:**
```
AI Datacenter Energy:
- 2025 baseline: X TWh/year (Y% global) (SOURCE)
- 2030 projection: Z TWh/year (W% global) (SOURCE)
- 2040 projection: ... (SOURCE)
- Efficiency offsets: (description) (SOURCE)
```

#### 3.3 Green Hydrogen Production

**Extract:**
- **Electrolysis efficiency:** kWh/kg H2 (current, future projected)
- **System efficiency:** Renewable electricity → usable H2 (roundtrip)
- **Scale targets:** Mt H2/year needed for decarbonization
- **Implied electricity demand:** At 50 Mt/year, 100 Mt/year, 200 Mt/year
- **Dedicated capacity requirement:** Can hydrogen use intermittent renewables?

**Sources:** US DOE Hydrogen Strategy, IEA Hydrogen Reports, IRENA Green Hydrogen Cost Reduction

**Output format:**
```
Green Hydrogen Energy:
- Electrolysis efficiency: X kWh/kg H2 (SOURCE)
- At 50 Mt/year: Y TWh/year (Z% of 2025 global) (CALCULATION)
- At 100 Mt/year: ... (CALCULATION)
- Intermittency tolerance: (description) (SOURCE)
```

---

### 4. Energy Priority Framework

**Extract:**
- **Essential vs elective electricity uses:** How are these categorized in literature?
- **Load shedding priorities:** What gets cut first during shortages?
- **Critical infrastructure definitions:** Healthcare, water, food, communications
- **Industrial vs residential:** Priority ordering in energy crises

**Sources:** Grid operator reports (NERC, ENTSO-E), energy security literature, climate adaptation studies

**Output format:**
```
Priority Framework:
- Tier 1 (essential): [list] (SOURCE)
- Tier 2 (high priority): [list] (SOURCE)
- Tier 3 (deferrable): [list] (SOURCE)
- Load shedding sequence: (description) (SOURCE)
```

---

### 5. Renewable Energy Constraints

**Extract:**
- **Capacity factors:** Solar (15-25%), wind (25-45%), hydro (40-60%)
- **Intermittency challenges:** Storage requirements, grid stability
- **Curtailment rates:** How much renewable energy is wasted?
- **Grid integration limits:** Is there a max % renewables before instability?

**Sources:** IEA Renewables reports, NREL grid studies, IRENA capacity factor data

**Output format:**
```
Renewable Constraints:
- Capacity factors: Solar X%, Wind Y%, Hydro Z% (SOURCE)
- Storage needs: W hours at V% penetration (SOURCE)
- Curtailment: Typical rates (SOURCE)
- Integration limits: (description) (SOURCE)
```

---

## Deliverable Format

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/energy_budget_constraints_20251209.md`

**Structure:**
1. Executive Summary (parameters table)
2. Global Electricity Capacity (Section 1-2 findings)
3. Technology Energy Requirements (Section 3 findings)
4. Priority Framework (Section 4 findings)
5. Renewable Constraints (Section 5 findings)
6. Parameter Recommendations (for simulation implementation)
7. Uncertainty Assessment (confidence levels, ranges)
8. Sources (full citation list with Zotero IDs if available)

---

## Quality Standards

- **2+ peer-reviewed sources per section** (12+ total minimum)
- **2024-2025 sources preferred** (use 2023 if critical and no newer available)
- **Parameter extraction:** Specific numbers with citations (not vague ranges)
- **Calculations shown:** If deriving TWh from GJ/tCO2 × Gt, show math
- **Uncertainty acknowledged:** Report confidence intervals where available
- **Interaction effects noted:** How do these systems interact?

---

## Success Criteria

- Parameters extracted with clear citations
- Calculations validated (dimensional analysis, sanity checks)
- Ranges provided where uncertainty exists
- Priority framework grounded in real grid operations
- Ready for research-skeptic validation (Grade B+ target)

---

## Timeline

- **Hours 1-2:** Literature gathering (IEA reports, MIT DAC, DOE hydrogen)
- **Hours 2-3:** Parameter extraction and calculation
- **Hour 3-4:** Write-up, citation formatting, uncertainty assessment

---

## Next Steps After Completion

1. Post to research channel with summary
2. Handoff to research-skeptic (Sylvia) for validation
3. If Grade B+: Proceed to Phase 2 (implementation)
4. If Grade < B: Address methodological concerns and iterate
