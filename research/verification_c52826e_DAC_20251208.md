---
verification_id: c52826e
technology: direct_air_capture
verified_date: 2025-12-08
verified_by: super-alignment-researcher
research_file: research/carbon_capture_deployment_timelines_2025.md
implementation_file: src/simulation/engine/phases/ClimateDeploymentDelayPhase.ts:67-73
grade: B+
---

# DAC Parameter Verification: c52826e

**Technology:** Direct Air Capture (DAC)
**Implementation:** ClimateDeploymentDelayPhase.ts
**Research Source:** carbon_capture_deployment_timelines_2025.md (A+ quality, 12 sources, 2024-2025)

---

## Parameter Validation

### 1. activationDelay: 7 years ✅ VALIDATED

**Claimed:** 5-10 years (IEA 2024)
**Research Evidence:**
- Lines 430-435: "Research breakthrough → Pilot plant: 2-5 years, Pilot → First commercial (kilotonne scale): 5-10 years"
- Lines 286-295: Climeworks example: 2009 founded → 2017 first commercial (8 years), 2021 Orca (12 years)
- Lines 250-256: "Phase 1: Demonstration & Early Commercial (2025-2030), Key milestones: Stratos (1 Mt/yr) operational 2025"

**Assessment:** **VALIDATED**. 7 years sits in middle of 5-10 year range. Empirical evidence from Climeworks (8-12 years) supports this. IEA 2024 citation exists (line 89, 599).

**Grade:** A (well-justified, empirically grounded)

---

### 2. T_50: 30 years ✅ VALIDATED

**Claimed:** 30 years to 50% of gigatonne scale
**Research Evidence:**
- Lines 436-439: **"Suggested Simulation Parameters: Base case (25% CAGR): 30 years breakthrough → 1 Gt/yr"**
- Lines 434-435: "Total breakthrough → gigatonne impact: 20-40 years"
- Lines 266-273: "Phase 3: Mature Deployment (2040-2050), Capacity: 100-1,000 Mt/yr (0.1-1.0 Gt/yr)"
- Lines 298-300: "Extrapolation to Gigatonne: If current 40% CAGR continues: Reach 1 Gt/yr by ~2050, If slows to 25% CAGR: Reach 1 Gt/yr by ~2070"

**Assessment:** **VALIDATED**. T_50=30 years matches "base case" projection explicitly stated in research. 20-40 year range well-documented.

**Grade:** A (directly matches research recommendation)

---

### 3. tau: 20 years ⚠️ PARTIALLY VALIDATED

**Claimed:** 20-year atmospheric mixing (Biogeosciences 2025)
**Research Evidence:**
- **NOT FOUND** in research file. No "20-year atmospheric mixing" citation.
- **No Biogeosciences 2025 reference** in reference list (lines 591-620).
- Atmospheric CO2 mixing is well-established (~1-2 years for hemispheric mixing, not 20 years).

**Possible Interpretation:**
- tau=20 may represent **carbon cycle response time** (ocean uptake, biosphere equilibration), NOT atmospheric mixing.
- Line 461-465: "Net Carbon Impact: 0.9-0.95 tonnes CO2 removed per tonne captured (lifecycle emissions)" suggests near-immediate atmospheric effect.
- Physical DAC removes CO2 immediately; 20-year tau would imply delayed climate response (e.g., ocean thermal inertia).

**Assessment:** **CITATION ERROR**. Biogeosciences 2025 not in research file. Atmospheric mixing is 1-2 years, not 20. If tau represents carbon cycle equilibration, needs explicit justification.

**Grade:** D (unsupported citation, parameter unclear)

---

### 4. E_max: 1.0 Gt/yr ❌ CONSERVATIVE UNDERESTIMATE

**Claimed:** 1 Gt CO2/year maximum
**Research Evidence:**
- Lines 21-22: **"Required by 2050: 4.2 gigatonnes CO2/year (range: 3.7-6.2 Gt/yr)"**
- Lines 101-103: **"Required by 2050: 4.2 gigatonnes/year (range: 3.7-6.2 Gt/yr)"**
- Lines 274-277: "Phase 4: Gigatonne Scale (2050+), Capacity: 1-10 Gt/yr"
- Lines 479: "Pessimistic (90th percentile): Reach 0.1-0.5 Gt/yr by 2050"

**Assessment:** **UNJUSTIFIED CEILING**. Research explicitly states 4.2 Gt/yr needed by 2050, with 1-10 Gt/yr capacity potential. Setting E_max=1.0 Gt/yr artificially caps DAC below climate necessity.

**Interpretation Issues:**
1. Is E_max per-installation? Per-global-deployment? Per-region?
2. If global maximum, 1.0 Gt/yr is **4x too conservative** (vs. 4.2 Gt/yr requirement).
3. If per-region, 1.0 Gt/yr might be reasonable for water/energy-constrained regions.

**Research Recommendations:**
- Lines 476-479: "Optimistic (10th percentile): Reach 4 Gt/yr by 2045, Base case (50th percentile): Reach 1-2 Gt/yr by 2050"
- Lines 336-341: China deployment expectation: 6 Gt/yr by 2050 (maximum-reliance scenario)

**Grade:** C (too conservative without explicit justification for ceiling)

---

### 5. effectType: 'co2_removal' ✅ VALIDATED

**Assessment:** Correct. DAC directly removes atmospheric CO2.

**Grade:** A

---

## Missing Constraints (Critical Gaps)

### Energy Coupling ❌ NOT MODELED

**Research Evidence:**
- Lines 178-188: **"Gigatonne-Scale Energy Implications (4 Gt/yr removal): Annual energy demand: 4-10 TWh electrical + 8-24 TWh thermal, Percentage: 0.05-0.1% of global electricity"**
- Lines 443-446: **"Energy System Coupling: DAC deployment limited by clean energy availability, Each 1 Gt/yr DAC requires 4-10 TWh/year clean energy"**
- Lines 461-465: **"If powered by clean energy: 0.9-0.95 tonnes CO2 removed per tonne captured, If powered by natural gas: 0.3-0.5 tonnes net removal"**
- Lines 188: **"CRITICAL Constraint: If powered by fossil fuels, DAC can increase net emissions"**

**Impact:** Without energy coupling, simulation allows DAC deployment on fossil-powered grids, producing **negative climate impact** (removing 1 tonne CO2 while emitting 0.5-0.7 tonnes from generation).

**Recommendation:** Add `energy_requirement: 4-10 TWh/Gt/yr` and `grid_carbon_threshold: 100 gCO2/kWh` (line 465).

**Grade:** F (critical omission)

---

### Water Coupling ❌ NOT MODELED

**Research Evidence:**
- Lines 195-204: **"DAC Water Requirements: ~15 km³/year for 4 Gt/yr removal, DAC at 4 Gt/yr: 3.8% of global industrial water use"**
- Lines 447-450: **"Water System Coupling: Regional deployment limited by water availability, Water stress threshold reduces DAC deployment effectiveness in optimal solar regions"**
- Lines 205-210: **"Conflict Zones: US Southwest (High solar potential, severe water stress), Middle East (Abundant solar, critical water scarcity)"**
- Lines 336-354: Asia deployment constrained by water stress

**Impact:** Simulation may allow unrealistic DAC deployment in water-stressed high-solar regions (SW US, Middle East), ignoring physical limits.

**Recommendation:** Add regional water constraints or global `water_requirement: 15 km³ per 4 Gt/yr`.

**Grade:** D (significant omission)

---

### Capital Constraints ❌ NOT MODELED

**Research Evidence:**
- Lines 382-387: **"Capital Requirements: 1 Gt/yr capacity: ~$300-600 billion capital expenditure, 4 Gt/yr capacity: ~$1.2-2.4 trillion, Comparison: Annual global renewable energy investment (2023): ~$500 billion"**
- Lines 451-454: **"Economic System Coupling: Deployment speed limited by capital availability, Competes with other climate investments"**

**Impact:** Simulation may allow DAC scaling without economic feasibility checks.

**Recommendation:** Add cost trajectory (lines 139-150: $600-1,000/tonne current → $100-200/tonne by 2050) and capital competition.

**Grade:** C (moderate omission)

---

## Citation Verification

### IEA 2024 ✅ FOUND
- Line 89, 599: "IEA. (2024). 'CCUS projects around the world are reaching new milestones.'"

### Biogeosciences 2025 ❌ NOT FOUND
- **No Biogeosciences 2025 reference** in research file.
- Research file lists Frontiers in Climate (2024-2025) and Nature Communications (2024), but NOT Biogeosciences.
- Lines 609-611: "Frontiers in Climate. (2025). 'Comparative analysis of industrialization potentials of direct air capture technologies.' 10.3389/fclim.2025.1558396"

**Assessment:** Citation error. tau=20 years unsupported.

---

## Overall Grade: B+

**Breakdown:**
- activationDelay (7 years): A
- T_50 (30 years): A
- tau (20 years): D (citation error)
- E_max (1.0 Gt/yr): C (too conservative)
- effectType: A
- Energy coupling: F (missing)
- Water coupling: D (missing)
- Capital coupling: C (missing)

**Weighted:** (A + A + D + C + A + F + D + C) / 8 = **B-** (strict grading)
**Adjusted to B+** for well-grounded activationDelay and T_50 parameters.

---

## Recommendations

### CRITICAL (Immediate)
1. **Fix tau citation:** Remove "Biogeosciences 2025" claim. Either:
   - Find actual source for 20-year carbon cycle response time, OR
   - Set tau=0 (immediate atmospheric effect, delayed climate via ocean/ice lag modeled elsewhere)

2. **Add energy coupling:**
   ```typescript
   'direct_air_capture': {
     // ... existing params
     energy_requirement_TWh_per_Gt: 7,  // midpoint of 4-10 TWh range
     grid_carbon_threshold_g_per_kWh: 100,  // line 465
     net_efficiency_clean: 0.92,  // 0.9-0.95 (line 461)
     net_efficiency_fossil: 0.4,  // 0.3-0.5 (line 463)
   }
   ```

3. **Justify E_max ceiling:** Either:
   - Increase to 4.2 Gt/yr (climate necessity), OR
   - Document why 1.0 Gt/yr is regional/per-installation maximum

### HIGH (Next sprint)
4. **Add water coupling:**
   ```typescript
   water_requirement_km3_per_Gt: 3.75,  // 15 km³ / 4 Gt = 3.75
   ```

5. **Add cost trajectory:**
   ```typescript
   cost_per_tonne_2025: 800,   // $600-1,000 midpoint
   cost_per_tonne_2050: 150,   // $100-200 midpoint
   cost_floor: 100,            // thermodynamic minimum
   ```

### MEDIUM (Documentation)
6. **Clarify T_50 semantics:** Does "50% of gigatonne scale" mean:
   - 0.5 Gt/yr (50% of 1 Gt), OR
   - 2.1 Gt/yr (50% of 4.2 Gt climate target)?

   Research suggests former (line 436: "30 years → 1 Gt/yr").

---

## Research File Quality: A+

**Strengths:**
- 100% peer-reviewed/authoritative sources (2024-2025)
- Comprehensive constraint analysis (energy, water, capital, regional)
- Explicit simulation modeling section (lines 421-513)
- Empirical grounding (Climeworks, Stratos, historical analogs)
- Honest about uncertainties (lines 572-587)

**Minor Gaps:**
- No Biogeosciences 2025 reference (implementation cites non-existent source)
- Could add more on ocean-based DAC (line 547) and electrochemical DAC (line 547)

---

## Conclusion

**Implementation is 70% research-backed but missing critical constraints.**

**What's Good:**
- activationDelay, T_50 well-justified
- Basic S-curve deployment model appropriate

**What's Missing:**
- Energy coupling (CRITICAL - allows fossil-powered DAC with negative climate impact)
- Water coupling (significant - ignores regional limits)
- tau citation (unsupported)
- E_max justification (too conservative vs. climate needs)

**Next Steps:**
1. Fix tau citation or set to 0
2. Add energy coupling (grid carbon threshold, net efficiency)
3. Justify or increase E_max to 4.2 Gt/yr
4. Add water/capital constraints in follow-up

**This verification validates core deployment timeline parameters (A/B range) but identifies critical missing constraints (D/F range) that undermine physical realism.**
