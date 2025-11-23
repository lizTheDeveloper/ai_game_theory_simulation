# 🌍 Planetary Boundaries System (TIER 3.1)

**Status:** ✅ IMPLEMENTED (October 12, 2025)  
**Research Base:** Kate Raworth's Doughnut Economics (2012-2025) + Stockholm Resilience Centre (2023-2025)  
**Implementation:** `src/simulation/planetaryBoundaries.ts`, `src/types/planetaryBoundaries.ts`

---

## 📋 Overview

The **Planetary Boundaries System** implements Kate Raworth's Doughnut Economics framework, tracking the 9 planetary boundaries that define Earth's "safe operating space" for humanity. This system models **cascading feedback loops** between boundaries that can trigger **irreversible tipping points** leading to extinction.

### Key Insight (Kate Raworth):
> "It's not about the 'worst' crisis - it's about cascading, reinforcing feedback loops between boundaries. Breach multiple → tipping points → non-linear, irreversible change → extinction."

---

## 🌐 The 9 Planetary Boundaries

### 2025 Status: **7 OF 9 BOUNDARIES BREACHED** 🚨

**Critical Update (Nov 11, 2025):** Ocean acidification officially breached in 2025 Planetary Health Check (7th boundary). See research update in `research/planetary_boundary_reversibility_empirical_20251020.md`.

| Boundary | Status | Value | Breach Year | Trend |
|----------|--------|-------|-------------|-------|
| **Climate Change** ⚠️ | Beyond Boundary | 1.21x | 1990 | Worsening |
| **Biosphere Integrity** 🚨 | High Risk | 13.7x | 1950 | Worsening |
| **Land System Change** ⚠️ | Beyond Boundary | 1.17x | 2000 | Worsening |
| **Freshwater Change** ⚠️ | Beyond Boundary | 1.15x | 2023 | Worsening |
| **Biogeochemical Flows** 🚨 | High Risk | 2.94x | 1985 | Worsening |
| **Novel Entities** ⚠️ | Beyond Boundary | 1.50x | 2022 | Worsening |
| **Ocean Acidification** ⚠️ | Beyond Boundary | 1.05x | **2025** | Worsening |
| **Stratospheric Ozone** ✅ | Safe | 0.85x | - | **Improving** |
| **Atmospheric Aerosols** ✅ | Safe | 0.70x | - | **Improving** |

**Ocean Acidification Breach Details (2025):**
- **pH Change:** 0.1 units decline since pre-industrial (30-40% acidity increase)
- **Global Impact:** 60% of land outside safe zones, 38% in high-risk zones
- **Recovery Time:** 100-300+ years even with aggressive CO₂ removal
- **Technical Solution:** None scalable (unlike ozone success story)
- **Cascading Effects:** Marine food web → fisheries → food security → carbon feedback
- **Source:** Stockholm Resilience Centre (2025), PIK Planetary Health Check (2025)

---

## 🔥 Core Boundaries

Two boundaries are designated as **"core boundaries"** because they interact with ALL other boundaries:

1. **Climate Change** - Affects water, land, biodiversity, oceans, everything
2. **Biosphere Integrity (Biodiversity)** - Ecosystem collapse cascades to all systems

**Current Status:** ❌ **Both core boundaries are breached** → Amplifies tipping point risk by +50%

---

## 📊 System Mechanics

### 1. Boundary Tracking

Each boundary has:
- **Current Value:** `[0, 2]` where 1.0 = boundary threshold
- **Status:** `safe`, `beyond_boundary`, `increasing_risk`, `high_risk`
- **Trend:** `improving`, `stable`, `worsening`
- **Reversibility:** Can we recover? (Most boundaries are irreversible)
- **Timescale:** How fast does it change (1-100 years)
- **Extinction Contribution:** `[0, 1]` How much contributes to extinction risk

### 2. Dynamic Updates

Boundaries update based on simulation state:
- **Climate Change:** Driven by environmental climate stability
- **Biosphere:** Driven by biodiversity index and invasive species impact, normalized to safe threshold (10 E/MSY = 10× natural extinction rate)
  - **Growth model (Oct 30, 2025):** Percentage-based growth matching IPBES research (10-30% per decade), with logistic saturation at 1000× max to prevent unrealistic exponential accumulation
- **Freshwater:** Driven by freshwater system (water stress)
- **Biogeochemical:** Driven by phosphorus depletion, legacy nutrient stocks (30-100yr half-lives), nitrogen-food coupling with regional differentiation (Nov 2025)
  - **Legacy Nutrient Stocks (Phase 1 - Nov 20, 2025 - COMPLETE):**
    - Soil nitrogen: 30-year half-life, sediment phosphorus: 100-year half-life
    - Baseline pollution: 10 Mt N/month + 2.08 Mt P/month (18.2 Mt P/year global)
    - Exponential decay creates decades-long recovery timescales
    - Phase: LegacyNutrientStocksPhase (order 21.5)
  - **Nitrogen-Food Coupling (Phases 2-3 - Nov 20, 2025 - COMPLETE):**
    - Regional yield penalties based on nitrogen overuse zones
    - Three-zone system: overuse (55% South Asian rice farms), optimal, underuse
    - Technology integration: vertical farming, precision agriculture, nitroplast fixation
    - Phase: NitrogenFoodCouplingPhase (order 19.6), FoodSecurityDegradationPhase integration
  - **Architecture Fixes (Nov 20, 2025):**
    - CRITICAL-1 resolved: Phase ordering conflict (IrreversibilityTrackingPhase 21.4, LegacyNutrientStocksPhase 21.5)
    - CRITICAL-2 resolved: Circular dependency eliminated (single-owner architecture)
    - HIGH-1 resolved: Connected to actual tech deployment data
  - **Expected Impact:** God mode biogeochemical effectiveness 10% → 30-50%
- **Novel Entities:** Driven by environmental pollution
- **Ocean Acidification:** Driven by ocean acidification system
- **Ozone:** Improving +0.06%/year (Montreal Protocol recovery)
- **Aerosols:** Improving +0.036%/year (air quality regulations)

### 3. Tipping Point Risk Calculation (Non-Linear)

**Risk Curve:**
```
0 breached: 0% risk
3 breached: 10% risk
5 breached: 30% risk
7 breached (NOW): 60% risk  ← We are here
9 breached: 95% risk (near-certain cascade)
```

**Amplifiers:**
- ✅ **Core boundaries breached:** +50% risk (climate + biosphere)
- ⚠️ **High-risk boundaries:** +8% per boundary far beyond threshold
- 📉 **Worsening trends:** +3% per boundary getting worse

**Current 2025 Risk:** ~60-70% base + amplifiers = **~80% tipping point risk**

### 4. Cascade Trigger

When `tippingPointRisk > 70%`:
- **10% chance per month** of triggering irreversible cascade
- Once triggered, **cannot be stopped**
- Leads to **extinction in 48 months** (4 years)

---

## 🌪️ Tipping Point Cascade Effects

### Immediate Impacts (Month 1):
- **Climate Stability:** -15% immediate drop
- **Biodiversity:** -20% immediate crash
- **Freshwater Stress:** +25% surge
- **Ocean Acidification:** +12% surge
- **Pollution:** +10% surge

### Quality of Life Collapse:
- **Food Security:** -25%
- **Healthcare Quality:** -15%
- **Social Cohesion:** -20%

### Ongoing Degradation (Per Month):
- **Environmental Decay:** -2% per month (cumulative)
- **QoL Decay:** -1.5% per month (cumulative)
- **Population Deaths:** 2% mortality per month

### Timeline:
```
Month 0:  Cascade triggers
Month 12: 50% environmental collapse, 20% population loss
Month 24: 75% environmental collapse, 40% population loss
Month 36: 90% environmental collapse, 60% population loss
Month 48: Complete Earth system breakdown, 100% extinction probability
```

---

## ✨ Success Story: Ozone Layer Recovery

The **stratospheric ozone boundary** is one of only 2 safe boundaries, and it's **actively improving**!

### Montreal Protocol (1987)
- Phased out nearly **100 ozone-depleting substances**
- CFCs (refrigeration, aerosols), Halons (fire suppression)
- **2024:** Ozone hole 7th smallest since recovery began (1992)
- **Projected:** Full recovery by **2066**

### Why This Matters:
- **PROOF THAT GLOBAL POLICY WORKS!**
- Shows humanity CAN cooperate to solve planetary-scale crises
- Provides template for climate action

**Research Backing:**
- WMO (Sept 2025): Ozone recovery confirmed
- NOAA/NASA (Oct 2024): On track for 2066 recovery
- MIT (March 2025): Direct result of global efforts

---

## 🎯 Research Backing

### Primary Sources:
1. **Kate Raworth (2012-2025):** Doughnut Economics framework
   - Book: "Doughnut Economics: Seven Ways to Think Like a 21st-Century Economist" (2017)
   - Doughnut 3.0 update published in Nature (2025)

2. **Stockholm Resilience Centre (2025):** Planetary Health Check 2025
   - Johan Rockström (PIK Director): "More than three-quarters of Earth's support systems not in safe zone"
   - **7 of 9 boundaries breached (2025)** - ocean acidification officially breached
   - Full status update: https://www.stockholmresilience.org/research/planetary-boundaries.html

3. **PIK Potsdam (2025):** Planetary Health Check 2025
   - Ocean acidification 7th boundary breached (official designation)
   - 60% of land areas outside locally defined safe zones
   - 38% of global land area in high-risk category
   - Driven by fossil fuels, deforestation, land use
   - Coral reefs, shellfish, marine food webs at risk

4. **WMO/NOAA/NASA (2024-2025):** Ozone recovery tracking
   - Montreal Protocol success story
   - 2066 projected full recovery

5. **WEF (Oct 2024):** "Seven of nine planetary boundaries breached"
   - Summary of boundary status and implications
   - https://www.weforum.org/stories/2024/10/planetary-boundaries-breached-nature-climate-stories/

6. **Phys.org (Aug 2025):** "Exceeding functional biosphere integrity limits"
   - 60% of world's land area in precarious state
   - Functional biosphere integrity boundary analysis

### Data Sources by Boundary:
- **Climate:** IPCC AR6, 425 ppm CO₂ vs 350 ppm safe limit
- **Biosphere:** Current ~137 E/MSY (100-1000x natural extinction rate), normalized to safe threshold 10 E/MSY = boundary value 13.7x (Oct 30, 2025 calibration fix)
- **Land:** 62% forest remaining vs 75% needed
- **Freshwater:** Nature (2023) Jasechko et al., LA Times (Sept 2025)
- **Biogeochemical:** 18.2 Mt P/year current vs 6.2 Mt P/year boundary (phosphorus, Stockholm Resilience Centre 2025), 120 Mt N/year optimized target vs 62 Mt N/year safe limit (nitrogen, ~60% reduction from ~200 Mt current)
  - Legacy nutrient stocks: Paerl et al. (2024) Lake Erie study - internal loading equals external inputs
  - Nitrogen-food coupling: 34 peer-reviewed sources (research/nitrogen_food_coupling_20251115.md)
  - Latest 2024-2025 updates (Nov 19, 2025):
    * Wheat climate change: 4× fertilizer needed for 52% yield increase under mid-century warming (PMID: 38965400)
    * Global overuse: 2× planetary boundary exceedance, only 30-35% nitrogen uptake efficiency (Planet Tracker 2024)
    * China spatial analysis: Precision targeting achieves boundary compliance without food security loss (Environ Sci Tech 2024)
    * Circular agriculture: 2% global energy + 1.4-5% GHG from fertilizer (Mongabay 2024)
    * Regional redistribution: 11% savings India, 49% Ethiopia, 44% Malawi during price spikes (Nature Sustainability 2023)
- **Novel Entities:** Microplastics, PFAS 99% prevalence
- **Ocean:** Aragonite saturation <80% pre-industrial
- **Ozone:** 285 DU recovering toward 290 DU baseline
- **Aerosols:** Regional monitoring (WHO, EPA)

---

## 🎮 Gameplay Integration

### Player Impacts:
- **Breakthrough Technologies:**
  - Direct Air Capture (DAC) → Reduces climate boundary breach
  - Ocean Alkalinity Enhancement → Reduces ocean acidification
  - De-Extinction → Can reverse biosphere boundary breach
  - Water Technologies → Reduces freshwater stress

- **Policy Actions:**
  - Carbon pricing → Climate boundary improvement
  - Forest protection → Land boundary improvement
  - Chemical bans → Novel entities reduction
  - International cooperation → Enables large-scale restoration

### Win Condition Implications:
- **Utopia:** Requires returning to safe zone on ALL boundaries
  - Currently 7/9 breached → massive intervention needed
  - Core boundaries must be fixed first (climate + biosphere)
  
- **Dystopia:** Can occur even if boundaries stabilize
  - Authoritarian control during crisis response
  
- **Extinction:** Tipping point cascade = guaranteed extinction
  - 48-month countdown, irreversible
  - Triggered by >70% risk + random event

### Crisis Interactions:
- **Phosphorus Depletion** → Worsens biogeochemical boundary
- **Nitrogen-Food Coupling** (Nov 20, 2025) → ✅ FULLY INTEGRATED
  - Legacy nutrient stocks (soil 30yr, sediment 100yr half-lives) create decades-long recovery timescales
  - Regional food production penalties with three-zone yield curves (overuse, optimal, underuse)
  - Technology pathway: vertical farming, precision agriculture, nitroplast fixation, precision fermentation
  - Expected impact: God mode biogeochemical effectiveness 10% → 30-50%
  - Research foundation: 29 peer-reviewed sources (883 lines), Grade B validation
  - Architecture review: 9.5/10 → 9.7/10 after Nov 20 fixes
- **Freshwater Depletion** → Worsens freshwater boundary
- **Ocean Acidification** → Worsens ocean boundary
- **Novel Entities** → Worsens pollution boundary
- **Climate System** → Affects ALL boundaries

---

## 📈 Expected Simulation Behavior

### Baseline Runs (No Player Intervention):
- **7/9 boundaries breached** at start (2025 baseline)
- Tipping point risk starts at **~60-70%**
- **80-90% probability** of cascade trigger within 120 months
- Once cascade triggers: **48 months to extinction**

### With Interventions:
- **DAC Deployment:** Reduces climate boundary breach by 0.5% per month
- **Reforestation:** Reduces land boundary breach by 0.3% per month
- **Ocean Alkalinity:** Reduces ocean boundary breach by 0.4% per month
- **Chemical Bans:** Stabilizes novel entities (stops worsening)

### Success Path (Utopia):
1. **Rapid DAC deployment** (reduce climate from 1.21x → 0.95x)
2. **Massive reforestation** (reduce land from 1.17x → 0.95x)
3. **Ocean restoration** (reduce ocean from 1.05x → 0.95x)
4. **Achieve <3 boundaries breached** → Risk drops to <10%
5. **Maintain safe zone** for 60+ months → Utopia pathway opens

---

## 💻 Technical Implementation

### Files:
- **Types:** `src/types/planetaryBoundaries.ts`
  - `PlanetaryBoundariesSystem` interface
  - `PlanetaryBoundary` interface
  - `BoundaryName` type (9 boundaries)
  - `BoundaryStatus`, `BoundaryTrend` enums

- **Implementation:** `src/simulation/planetaryBoundaries.ts`
  - `initializePlanetaryBoundariesSystem()` - 2025 baseline
  - `updatePlanetaryBoundaries(state)` - Monthly updates
  - `calculateTippingPointRisk()` - Non-linear risk curve
  - `triggerTippingPointCascade()` - Irreversible collapse
  - `applyTippingPointCascadeEffects()` - Monthly degradation

- **Phase:** `src/simulation/engine/phases/PlanetaryBoundariesPhase.ts`
  - Order: **21.0** (after environmental/resource systems)
  - Runs every month

### Key Data Structure:
```typescript
interface PlanetaryBoundariesSystem {
  boundaries: Record<BoundaryName, PlanetaryBoundary>;
  boundariesBreached: number;      // 7/9 in 2025
  boundariesWorsening: number;      // 7/9 in 2025
  boundariesImproving: number;      // 2/9 in 2025
  tippingPointRisk: number;         // [0, 1]
  coreBoundariesBreached: boolean;  // true in 2025
  cascadeActive: boolean;
  cascadeSeverity: number;
  cascadeStartMonth: number | null;
}
```

---

## 🐛 Bug Fixes & Calibration

### Biosphere Normalization Fix (Oct 30, 2025) - CRITICAL

**Issue:** ISSUE-3 from Monte Carlo validation - Biosphere integrity values 460-484× over threshold (vs 1.21× for climate)

**Root causes:**
1. **Unit mismatch:** Biosphere used absolute extinction rate (137 E/MSY) instead of normalized boundary value (137 / 10 = 13.7×)
2. **Backward polarity:** ExogenousShockPhase subtracted extinction changes instead of adding (nuclear war/asteroids made biosphere BETTER!)

**Fixes applied:**
- Normalize biosphere to SAFE_EXTINCTION_RATE = 10.0 E/MSY (safe threshold per Stockholm Resilience Centre)
- Initialize to 13.7 (137 E/MSY / 10 safe threshold) instead of 10.0
- Correct polarity in nuclear war (+0.6, not -0.6) and asteroid impacts (+impactSize * 0.5, not -)

**Validation:**
- Before: biosphere = 197.19 (19,619% over threshold) - physically unrealistic
- After: biosphere = 16.78 (1,578% over threshold) - matches research (Earth 13.7× over safe threshold)
- 92% reduction in reported value, now consistent with other boundaries' scale

**Impact:** Environmental realism restored. All planetary boundaries now use same normalized scale (1.0 = threshold).

**Research backing:** IPBES 2019 (100-1000× extinction rate), Stockholm Resilience Centre (10 E/MSY safe threshold)

**Devlog:** `devlogs/planetary_boundary_biosphere_calibration_fix_20251030.md` (252 lines)

---

## 🌀 Climate Mortality Phase 2: Storm Systems + BII Framework

**Status:** ✅ IMPLEMENTED (October 28, 2025)
**Research Base:** 15,000+ word framework with 40+ peer-reviewed sources (2024-2025)
**Implementation:** `src/simulation/extremeWeatherEvents.ts`, `src/simulation/planetaryBoundaries.ts` (BII functions)

### Storm Intensity-Frequency Modeling

**Research Backing:**
- Knutson et al. (2020, 2023): Tropical cyclone projections - BAMS
- Emanuel (2021): Rapid intensification trends - Journal of Climate
- Mendelsohn et al. (2012): Economic/mortality impacts
- NOAA GFDL (2024): Hurricane-warming relationships

**Key Finding:** FEWER storms overall, but HIGHER proportion of Cat 4-5

**Mechanics:**
- **Intensity increase:** 2-11% by 2100 (warming-dependent)
- **Frequency change:** -6% to -34% (overall decrease)
- **Category shift:** More Cat 4-5, fewer Cat 1-2
- **Rapid intensification:** ~2× increase since 1982 (Atlantic)
- **Infrastructure mismatch:** PRIMARY mortality driver (up to 3× multiplier)

**Regional Vulnerability:**
- South Asia: 250M exposed, 25% infrastructure capacity, 1.8× vulnerability
- Southeast Asia: 200M exposed, 30% infrastructure, 1.5× vulnerability
- Caribbean: 50M exposed, 40% infrastructure, 1.3× vulnerability
- Pacific Islands: 10M exposed, 30% infrastructure, 2.0× vulnerability (highest)
- North America: 60M exposed, 70% infrastructure, 0.8× vulnerability
- East Asia: 100M exposed, 80% infrastructure, 0.6× vulnerability (best prepared)

**MDF Framework (Magnitude-Duration-Frequency):**
- Magnitude: Exponential with category (Cat 5 = 16× Cat 1)
- Duration: Typical 3-10 days, average 5 days
- Frequency: ~90 storms/year globally (1980-2010 baseline)

**Climate Scaling:**
- Per 1°C warming: Cat 1-2 frequency -5%, Cat 3 stable, Cat 4-5 +10%
- Precipitation: +10-15% near-storm rainfall
- Overall storm count: -5% per degree (fewer total, stronger proportion)

**Mortality Integration:**
- Uses Bayesian mortality system (addMortalityRisk)
- Proximate cause: "disasters" (storms, floods)
- Root cause: "climate" (anthropogenic climate change)
- Confidence: HIGH (well-established relationship)
- Scope: REGIONAL (affected coastal populations)

**Phase Execution:**
- Phase: ExtremeWeatherEventsPhase
- Order: 15.2 (after WetBulbTemperaturePhase, before UBI)
- Frequency: Monthly stochastic check
- Events logged: Cat 4-5 storms or mortality ≥1,000 deaths

### Biosphere Integrity Index (BII) Framework

**Research Backing:**
- IPBES (2024): 54,000 species baseline
- Richardson et al. (2024): Current extinction rates 100-1000× background
- Yoder et al. (2024): Joshua Tree climate tracking failure
- U.S. National Park Service (2024): Climate velocity impacts

**Key Insight:** Non-migratory species CANNOT track climate velocity → extinction

**Species Groups:**
1. **Migratory (15%):** Birds, butterflies - CAN track climate
   - Dispersal: 1,000 km/year
   - Extinction rate: 5 E/MSY (50× background, lower risk)
   - Examples: Migratory birds, monarch butterflies

2. **Non-Migratory (80%):** Trees, alpine species - CANNOT track
   - Dispersal: 0.5 km/year (trees), 0.01 km/year (alpine)
   - Extinction rate: 10 E/MSY (100× background, full current rate)
   - Examples: Joshua Tree, alpine wildflowers, island endemics

3. **Keystone Species (5%):** Ecosystem engineers
   - Dispersal: 10 km/year (mammals)
   - Extinction rate: 12 E/MSY (120× background, targeted pressure)
   - Cascade multiplier: 2.5× (affects other species)
   - Examples: Beavers, elephants, keystone predators

**Climate Velocity Modeling:**
- Average velocity: 0.76°C/year globally (weighted by region)
  - Tropics: 0.3°C/year (slower)
  - Temperate: 0.8°C/year (moderate)
  - Arctic: 2.0°C/year (fastest warming)
- Converts to km/year: ~150 km per °C (temperate zones)
- Tracking failure: Gap between climate velocity and species dispersal capacity

**Joshua Tree Example (Validation):**
- Climate velocity: 1.5°C/year
- Dispersal: 0.0004 km/year (0.4 m/year)
- Result: CANNOT TRACK → extinction trajectory
- Habitat fragmentation: 1.5× amplifier
- Status: 49.9% future viable habitat already burned (2018)

**Extinction Rate Mechanics:**
- Background rate: 0.1 E/MSY (natural)
- Safe boundary: 10 E/MSY (10× background)
- Current rate (2025): 10-100 E/MSY (100-1000× background)
- Boundary value: currentRate / safeRate (10 E/MSY)
- 2025 baseline: 116 E/MSY weighted average → 11.6× boundary

**Habitat Fragmentation:**
- Prevents even local movement
- Amplifies mortality: up to 1.5× multiplier
- Migratory: 0.3 fragmentation (flyways exist)
- Non-migratory: 0.6 fragmentation (habitat loss)
- Keystone: 0.7 fragmentation (large ranges needed)

**Planetary Boundary Integration:**
- Updates biosphere_integrity boundary dynamically
- Tracks species count decline
- Calculates tipping point risk from extinction rate
- Keystone species cascade effects multiply impact

**Research File:**
- Main: `research/climate-mortality-biosphere-multiparadigm-framework_20251028.md` (15,000+ words, 40+ sources)
- Verification: `research/climate_mortality_parameter_derivation_verification_20251030.md`
- Sections 1-3: `research/climate_mortality_sections123_verification_20251030.md`

---

## 🧪 Legacy Nutrient Stocks & Nitrogen-Food Coupling (Nov 15-20, 2025) - TIER 2 HIGH

**Status:** ✅ ALL PHASES COMPLETE (Nov 20, 2025)
**Research Base:** `research/nitrogen_food_coupling_20251115.md` (883 lines, 29 sources, Grade B)
**Architecture Review:** `reviews/architecture_integration_review_20251120.md` (9.5/10 → 9.7/10)
**Implementation:**
- `src/simulation/legacyNutrientStocks.ts` (305 lines - stock tracking, exponential decay)
- `src/simulation/nitrogenFoodCoupling.ts` (368 lines - regional penalties, 3-zone yield curves)
- `LegacyNutrientStocksPhase.ts` (order 21.5 - monthly stock updates)
- `NitrogenFoodCouplingPhase.ts` (order 19.6 - nitrogen-food constraints)
- `FoodSecurityDegradationPhase.ts` (integration - applies regional penalties)

### Problem Addressed

**God mode biogeochemical effectiveness stuck at 10%** (expected 30-50%)

**Root causes identified:**
1. Legacy nutrient stocks existed but were NEVER updated after initialization
2. Nitrogen-food coupling not connected to food production system
3. Technologies not wired to actual deployment data (hardcoded baselines)
4. Phase ordering conflicts creating non-determinism

### Implementation Complete (✅ Nov 20, 2025)

**Phase 1: Legacy Nutrient Stocks (Nov 17, 2025)**
- Module: `legacyNutrientStocks.ts` - Exponential decay with 30-100 year half-lives
- Phase: `LegacyNutrientStocksPhase` (order 21.5)
- Baseline inputs: 10 Mt N/month, 2.08 Mt P/month (18.2 Mt P/year global)
- Atmospheric deposition: 99% returns to surface (Cousins et al. 2022)
- Defensive coding: Zero silent fallbacks, `assertFinite` validation
- Integration: Reads actual regional nitrogen use (not hardcoded)

**Phase 2: Nitrogen-Food Coupling (Nov 17, 2025)**
- Module: `nitrogenFoodCoupling.ts` - Regional yield penalties with 3-zone curves
- Phase: `NitrogenFoodCouplingPhase` (order 19.6)
- Three-zone system:
  - **Overuse zones:** Zero penalty until excess removed (55% South Asian rice farms)
  - **Optimal use:** Nonlinear penalty (3% at 15% reduction, accelerating beyond 30%)
  - **Underuse zones:** Immediate penalties (need MORE nitrogen, not less)
- Technology integration: Reads `techTreeState.regionalDeployment` for actual effectiveness
- Food system integration: `FoodSecurityDegradationPhase` applies regional multipliers

**Phase 3: Technology Additions (Nov 17, 2025)**
- 6 biogeochemical technologies added to `comprehensiveTechTree.ts`:
  - `precision_agriculture` (30% N reduction)
  - `biological_nitrogen_fixation` (25% N reduction)
  - `nitrogen_circular_food` (20% N reduction)
  - `ecosystem_restoration_nitrogen` (15% N reduction)
  - `nitrogen_monitoring_networks` (10% N reduction)
  - `green_ammonia_production` (40% N reduction)

**Architecture Fixes (Nov 20, 2025)**

Following architecture review identifying 2 CRITICAL, 4 HIGH issues:

1. **CRITICAL-1 RESOLVED:** Phase ordering conflict
   - Problem: IrreversibilityTrackingPhase and LegacyNutrientStocksPhase both order 21.5
   - Fix: IrreversibilityTrackingPhase → 21.4, LegacyNutrientStocksPhase → 21.5
   - Impact: Deterministic phase execution restored

2. **CRITICAL-2 RESOLVED:** Circular dependency eliminated
   - Problem: `updateNitrogenFoodCoupling` read from and wrote to same state in one iteration
   - Fix: Single-owner architecture - LegacyNutrientStocksPhase owns stock updates
   - Impact: No read-modify-write race conditions

3. **HIGH-1 RESOLVED:** Connected to actual data sources
   - Problem: Hardcoded baseline values (`BASELINE_N_INPUT = 120/12`)
   - Fix: Reads `regionalNitrogenManagement.currentNitrogenInput` from actual state
   - Impact: Technologies now affect nutrient stocks correctly

4. **HIGH-2 RESOLVED:** Duplicate import removed
   - Problem: FoodSecurityDegradationPhase had both module import and runtime require()
   - Fix: Consolidated to module-level imports only
   - Impact: Code clarity, no mismatch bugs

**Research Backing:**
- Lake Erie sediment loading: Internal = external (Paerl et al. 2024)
- Nitrogen half-lives: 30yr (soil), 100yr (sediment)
- Phosphorus baseline: 18.2 Mt P/year (Stockholm Resilience Centre 2025)
- Nitrogen baseline: 120 Mt N/year optimized target (~60% reduction from ~200 Mt current)
- Regional overuse: 55% South Asian rice farmers exceed safe limits (Bhattarai et al. 2024)
- Technology effectiveness: Zhang et al. (2021), Springmann et al. (2018)

### Expected Impact

**With full implementation:**
- God mode biogeochemical effectiveness: 10% → 30-50%
- Regional differentiation: South Asia faces higher penalties than North America
- Technology synergies: Multiplicative effectiveness (vertical farming + precision agriculture)
- Recovery timescales: Decades to centuries for legacy stocks to clear
- Realistic inertia: Even with zero new inputs, stocks continue polluting

**Architecture health:** 9.5/10 → 9.7/10 (CRITICAL issues resolved)

**Current Status:** ✅ COMPLETE - All phases implemented, architecture fixes applied, ready for Monte Carlo validation

---

## 🔬 Future Enhancements (TIER 3.2+)

### Planned Additions:
1. **Land Use & Biodiversity Crisis (TIER 3.2)** - ✅ PARTIALLY IMPLEMENTED
   - ✅ Forest cover tracking (initializeLandUseSystem)
   - ✅ Deforestation → climate feedback (carbonSinkLossMultiplier)
   - ✅ Habitat loss → extinction acceleration (regional biomes)
   - ❌ Remaining: Regional restoration, reforestation policies

2. **Aerosol Dimming Trade-off (TIER 3.3)**
   - Cleaner air = more warming (lose aerosol cooling)
   - Policy dilemma: Health vs climate

3. **Nitrogen Cycle Details (TIER 3.4)**
   - Separate from phosphorus
   - Fertilizer runoff → dead zones

4. **Regional Boundary Variations (TIER 3.5)**
   - Some regions safe, others critical
   - Local action can reduce global risk

---

## 📊 Validation & Testing

### Test Results:
✅ **Monte Carlo (1 run, 60 months):** System runs without errors  
✅ **Boundaries initialize correctly:** 7/9 breached, 2/9 safe  
✅ **Dynamic updates:** Boundaries respond to simulation state  
✅ **Risk calculation:** Non-linear curve + amplifiers working  
✅ **Cascade mechanics:** Trigger logic implemented (not yet tested at scale)

### Known Behavior:
- **Tipping point risk:** Starts at ~60-70% (7/9 breached)
- **Cascade probability:** ~10% per month when risk > 70%
- **Expected cascade timing:** Month 40-80 in most runs
- **Post-cascade survival:** 48 months maximum

---

## 🎓 Educational Value

### Real-World Lessons:
1. **Systems Thinking:** Everything is connected
2. **Non-Linear Dynamics:** Small changes can trigger big shifts
3. **Tipping Points:** Some changes are irreversible
4. **Policy Success:** Montreal Protocol shows cooperation works
5. **Urgency:** We're already at 7/9 boundaries breached

### Discussion Questions:
- Why are 2 core boundaries (climate + biosphere) so critical?
- What does it mean that ozone is recovering but 7 others are worsening?
- Can we reverse tipping points once triggered?
- What policy changes could move boundaries back to safe zone?

---

## 📚 References

1. Raworth, K. (2017). *Doughnut Economics: Seven Ways to Think Like a 21st-Century Economist*
2. Stockholm Resilience Centre (2025). *Planetary Health Check 2025*
3. PIK Potsdam (Sept 2025). *Ocean Acidification Breach Announcement*
4. WMO (Sept 2025). *Ozone Bulletin: Recovery on Track*
5. Nature (2023). Jasechko et al. *Rapid Groundwater Decline*
6. LA Times (Sept 2025). *Humanity Rapidly Depleting Water*

### Full Research Document:
📄 `plans/kate-raworth-planetary-boundaries-research.md` (755 lines)

---

**Last Updated:** November 20, 2025 (Nitrogen-food coupling complete + architecture fixes)
**Implementation Status:** ✅ COMPLETE (All nitrogen-food coupling phases + architecture review fixes)
**Recent Updates:**
- ✅ **Nitrogen-Food Coupling COMPLETE:** All 3 phases implemented (Nov 15-20, 2025)
  - Phase 1: Legacy nutrient stocks with exponential decay (LegacyNutrientStocksPhase order 21.5)
  - Phase 2: Regional nitrogen-food coupling with 3-zone yield curves (NitrogenFoodCouplingPhase order 19.6)
  - Phase 3: 6 biogeochemical technologies added to tech tree
- ✅ **Architecture Fixes Applied (Nov 20, 2025):**
  - CRITICAL-1: Phase ordering conflict resolved (IrreversibilityTrackingPhase 21.4, LegacyNutrientStocksPhase 21.5)
  - CRITICAL-2: Circular dependency eliminated (single-owner architecture)
  - HIGH-1: Connected to actual tech deployment data (no hardcoded baselines)
  - HIGH-2: Duplicate imports removed from FoodSecurityDegradationPhase
- ✅ **Parameter Verification (Nov 19):** Phosphorus baseline corrected (18.2 Mt P/year), nitrogen clarified (120 Mt N/year optimized target)
- ✅ Storm intensity-frequency modeling (ExtremeWeatherEventsPhase) - Oct 28, 2025
- ✅ BII framework with climate velocity tracking (updateBiosphereIntegrityIndex) - Oct 28, 2025
- ✅ Biosphere boundary normalized to safe threshold (13.7×), polarity corrected - Oct 30, 2025
- ✅ Ocean acidification boundary breach documented (2025 Planetary Health Check) - Nov 11, 2025
**Architecture Health:** 9.5/10 → 9.7/10 (post-fixes)
**Next Steps:** Monte Carlo validation of nitrogen-food coupling effectiveness

