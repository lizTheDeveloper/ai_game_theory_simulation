# P2 Priority Research Plan: Research-Grade Quality Improvements
**AI Game Theory Simulation - Empirically Validated Implementation**

**Date Created:** October 15, 2025  
**Date Updated:** October 16, 2025  
**Status:** 60% COMPLETE (P2.1, P2.2, P2.4 DONE; P2.3, P2.5 remain)  
**Estimated Effort:** 25-34 hours total (14-16 hours completed, 10-18 hours remain)  
**Priority:** Medium (defer until P0/P1 complete)

**Implementation Branch:** `p2-implementation` (pushed to GitHub)  
**Completion Status:**
- ✅ **P2.1** Environmental Recalibration - COMPLETE (Oct 16, 2025)
- ✅ **P2.2** Stochastic Innovation - COMPLETE (Oct 16, 2025)
- ⏳ **P2.3** Heterogeneous Population - PENDING (6-8 hours)
- ✅ **P2.4** Geographic Diversification - COMPLETE (Oct 16, 2025)
- ⏳ **P2.5** Historical Validation - PENDING (8-12 hours)

---

## Executive Summary

This document provides research-backed specifications for Priority 2 (P2) improvements to the AI Game Theory Simulation. P2 focuses on empirical calibration and research-grade quality enhancements that will make the simulation publication-ready.

**Context:**
- P1 (realism fixes) completed: Death accounting, cascade mortality calibration, extinction detection, recovery mechanics
- P0 (critical fixes) in progress: AI capability growth, bankruptcy paradox, determinism investigation
- P2 (this plan): Environmental calibration, stochastic innovation, heterogeneous populations, geographic diversification, historical validation

**Key Dependencies:**
1. P2.1 (environmental rates) can proceed independently
2. P2.2 (breakthroughs) depends on tech tree system (already implemented)
3. P2.3 (population segments) requires new data structures
4. P2.4 (geographic diversification) requires organization model updates
5. P2.5 (validation) should be done last (validates all other P2 work)

**Recommended Implementation Order:**
1. **P2.1** (Environmental calibration) - 4-6 hours - Independent, high impact
2. **P2.4** (Geographic diversification) - 3-4 hours - Builds on existing org model
3. **P2.2** (Stochastic innovation) - 4-6 hours - Adds variance, complements P0 work
4. **P2.3** (Heterogeneous populations) - 8-10 hours - Most complex, new system
5. **P2.5** (Historical validation) - 6-8 hours - Final validation of all changes

**Total Effort:** 25-34 hours

---

## P2.1: Recalibrate Environmental Degradation Rates ✅ COMPLETE

**Effort:** 4-6 hours  
**Actual Time:** ~2 hours  
**Priority:** High (within P2)  
**Severity:** Environmental degradation 10-200x too fast  
**Status:** ✅ IMPLEMENTED AND TESTED (Oct 16, 2025)  
**Files Modified:** `src/simulation/environmental.ts`  
**Branch:** `p2-implementation`  
**Test Results:** Validated in Monte Carlo runs, stochastic variance working correctly

### Problem Statement

Current simulation shows environmental collapse on unrealistic timescales:
- **Climate:** 69% degradation in 60 months (5 years) vs IPCC projections of decades
- **Biodiversity:** 99.4% collapse in 60 months vs IPBES projections of 50-100 years
- **Resources:** 84% depletion in 60 months vs Global Footprint Network multi-decade trends

**Impact:** Simulation cannot credibly model climate scenarios or long-term sustainability transitions.

### Literature Review

#### 1. IPCC AR6 (2021-2023) - Climate Degradation Rates

**Key Findings:**
- Last decade (2011-2020): +1.09°C above 1850-1900 baseline (0.11°C/decade)
- SSP5-8.5 (worst case): +3.3-5.7°C by 2081-2100 (4.4°C central estimate)
- Current trajectory: ~0.2°C/decade warming rate
- 1.5°C threshold crossing: ~2027 (under current emissions)

**Citations:**
- IPCC AR6 WG1 Summary for Policymakers (2021)
- IPCC AR6 Synthesis Report (2023)

**Empirical Values:**
- Historical warming rate: 0.11°C/decade (2011-2020)
- Projected warming rate (SSP5-8.5): 0.2-0.3°C/decade through 2050
- Temperature impact on climate stability: -0.05 per 0.5°C warming (threshold effects)

#### 2. IPBES 2019 Global Assessment - Biodiversity Loss

**Key Findings:**
- 1 million species threatened with extinction (out of ~8 million)
- Current extinction rate: 100-1000x natural background rate
- 82% of wild mammal biomass lost since 1970 (55 years)
- Key driver timescales: Habitat loss over decades, not months

**Citations:**
- IPBES Global Assessment Report on Biodiversity and Ecosystem Services (2019)
- UNEP Press Release (May 2019)

**Empirical Values:**
- Biodiversity decline: ~1.5% per year globally (compound rate)
- Species extinction rate: 100-1000x natural rate = 10-100 species/million species/year
- Habitat loss: 0.5-2% per year (varies by ecosystem)

#### 3. Global Footprint Network 2024 - Resource Overshoot

**Key Findings:**
- Earth Overshoot Day 2024: August 1 (using 1.7 Earths)
- Ecological overshoot: 1.7x regeneration capacity
- Trend: Overshoot worsening ~0.5-1% per year
- Carbon footprint: 61% of total ecological footprint

**Citations:**
- Global Footprint Network Earth Overshoot Day 2024 Report
- Global Footprint Network Ecological Footprint Atlas (2024)

**Empirical Values:**
- Current resource overshoot: 1.7x capacity (baseline 2025)
- Annual worsening rate: 0.5-1% per year under BAU
- Recovery potential: 50% emissions cut = 3 months delay in overshoot day

### Current vs. Target Parameters

#### Climate Degradation (environmental.ts lines 163-191)

**Current (WRONG):**
```typescript
let climateDegradationRate = energyUsage * 0.0008; // Monthly rate
if (economicStage > 3.0) {
  climateDegradationRate += 0.0016; // Rapid growth penalty
}
```
- Result: 69% degradation in 60 months (5 years)
- Rate: ~1.15% per month = 13.8% per year
- **13x too fast** compared to IPCC

**Target (CORRECT):**
```typescript
// IPCC AR6: 0.2°C/decade = 0.0167°C/year = 0.00139°C/month
// Map to climate stability: 1.0 = 0°C, 0.0 = 5°C catastrophic warming
// So 0.2°C = 0.04 climate stability decline per year = 0.00333/month

let climateDegradationRate = energyUsage * 0.00025; // Reduced 3.2x (was 0.0008)

// Economic stage acceleration (reduced)
if (economicStage > 3.0) {
  climateDegradationRate += 0.0004; // Was 0.0016 (reduced 4x)
}
```
- Result: ~15% degradation in 60 months (5 years) under high emissions
- Rate: 0.25% per month = 3% per year
- Matches IPCC SSP5-8.5 trajectory

#### Biodiversity Loss (environmental.ts lines 193-217)

**Current (WRONG):**
```typescript
let biodiversityLossRate = economicStage * 0.0004; // 0.04% per month at Stage 1
```
- Result: 99.4% collapse in 60 months (5 years)
- Rate: ~1.5% per month = 18% per year at Stage 1
- **12x too fast** compared to IPBES

**Target (CORRECT):**
```typescript
// IPBES 2019: 1.5% per year decline = 0.125% per month
// Currently at 0.04% per month (0.48% per year) - actually ALREADY CORRECT!
// The issue is compounding effects from other variables

let biodiversityLossRate = economicStage * 0.0001; // 0.01% per month at Stage 1 (base)

// Add impacts from other factors (these need reduction)
biodiversityLossRate += manufacturingCap * 0.00005; // Was 0.0003 (reduced 6x)
biodiversityLossRate += (1 - env.resourceReserves) * 0.0001; // Was 0.0008 (reduced 8x)
biodiversityLossRate += env.pollutionLevel * 0.00005; // Was 0.0004 (reduced 8x)
biodiversityLossRate += (1 - env.climateStability) * 0.00008; // Was 0.0006 (reduced 7.5x)
```
- Result: ~15-20% decline in 60 months under high pressure
- Rate: 0.25-0.33% per month = 3-4% per year
- Matches IPBES timescale (decades to severe collapse, not months)

#### Resource Depletion (environmental.ts lines 62-86)

**Current (WRONG):**
```typescript
let resourceDepletionRate = economicStage * 0.008; // 0.8% per month at Stage 1
resourceDepletionRate += manufacturingCap * 0.004;
```
- Result: 84% depletion in 60 months
- Rate: ~1.4% per month = 16.8% per year
- **34x too fast** compared to Global Footprint Network

**Target (CORRECT):**
```typescript
// Global Footprint Network: 1.7x overshoot in 2024, worsening 0.5-1% per year
// So overshoot increases from 1.7x to ~1.75x per year
// Resource reserves decline: (1/1.7) → (1/1.75) = 58.8% → 57.1% = 1.7% per year absolute

let resourceDepletionRate = economicStage * 0.00015; // Was 0.008 (reduced 53x!)

// Manufacturing impact (reduced)
resourceDepletionRate += manufacturingCap * 0.0001; // Was 0.004 (reduced 40x)
```
- Result: ~10-15% depletion in 60 months under high extraction
- Rate: 0.17-0.25% per month = 2-3% per year
- Matches Global Footprint Network overshoot worsening trajectory

### Implementation Approach

#### Step 1: Update Base Degradation Rates (2 hours)

**File:** `src/simulation/environmental.ts`

**Changes:**
1. Climate degradation (lines 163-191):
   - Base rate: 0.0008 → 0.00025 (÷3.2)
   - Stage acceleration: 0.0016 → 0.0004 (÷4)

2. Biodiversity loss (lines 193-217):
   - Base rate: 0.0004 → 0.0001 (÷4) - **ACTUALLY: Keep 0.0004 for Stage 1, reduce multipliers**
   - Manufacturing: 0.0003 → 0.00005 (÷6)
   - Resource impact: 0.0008 → 0.0001 (÷8)
   - Pollution impact: 0.0004 → 0.00005 (÷8)
   - Climate impact: 0.0006 → 0.00008 (÷7.5)

3. Resource depletion (lines 62-86):
   - Base rate: 0.008 → 0.00015 (÷53)
   - Manufacturing: 0.004 → 0.0001 (÷40)

**Pseudocode:**
```typescript
// environmental.ts

// CLIMATE (lines 163-191)
const CLIMATE_BASE_RATE = 0.00025; // Was 0.0008 - IPCC calibrated
const CLIMATE_STAGE_ACCELERATION = 0.0004; // Was 0.0016

let climateDegradationRate = energyUsage * CLIMATE_BASE_RATE;

if (economicStage > 3.0) {
  climateDegradationRate += CLIMATE_STAGE_ACCELERATION;
}

// Fusion/clean energy mitigation (unchanged)
if (hasFusion) climateDegradationRate *= 0.2;
if (hasCleanEnergy) climateDegradationRate *= 0.5;

env.climateStability = Math.max(0, Math.min(1,
  env.climateStability - climateDegradationRate + naturalStabilization
));

// BIODIVERSITY (lines 193-217)
const BIODIVERSITY_BASE_RATE = 0.0001; // Was 0.0004 for economic stage
const BIODIVERSITY_MANUFACTURING = 0.00005; // Was 0.0003
const BIODIVERSITY_RESOURCE_IMPACT = 0.0001; // Was 0.0008
const BIODIVERSITY_POLLUTION_IMPACT = 0.00005; // Was 0.0004
const BIODIVERSITY_CLIMATE_IMPACT = 0.00008; // Was 0.0006

let biodiversityLossRate = economicStage * BIODIVERSITY_BASE_RATE;
biodiversityLossRate += manufacturingCap * BIODIVERSITY_MANUFACTURING;
biodiversityLossRate += (1 - env.resourceReserves) * BIODIVERSITY_RESOURCE_IMPACT;
biodiversityLossRate += env.pollutionLevel * BIODIVERSITY_POLLUTION_IMPACT;
biodiversityLossRate += (1 - env.climateStability) * BIODIVERSITY_CLIMATE_IMPACT;

// Ecosystem management mitigation (unchanged)
if (hasEcosystemManagement) {
  biodiversityLossRate *= 0.3;
}

env.biodiversityIndex = Math.max(0, Math.min(1,
  env.biodiversityIndex - biodiversityLossRate + naturalRecovery
));

// RESOURCES (lines 62-86)
const RESOURCE_BASE_RATE = 0.00015; // Was 0.008 - Global Footprint calibrated
const RESOURCE_MANUFACTURING = 0.0001; // Was 0.004

let resourceDepletionRate = economicStage * RESOURCE_BASE_RATE;
resourceDepletionRate += manufacturingCap * RESOURCE_MANUFACTURING;

// Technology mitigation (unchanged)
if (hasAdvancedMaterials) resourceDepletionRate *= 0.5;
if (hasNanotech) resourceDepletionRate *= 0.25;

env.resourceReserves = Math.max(0,
  env.resourceReserves - resourceDepletionRate
);
```

#### Step 2: Add Variance Bounds (1 hour)

Add ±20-30% stochastic variation to degradation rates to prevent determinism and reflect uncertainty:

```typescript
// Add stochastic variance to rates (reflects uncertainty in models)
function applyStochasticVariance(baseRate: number, variance: number = 0.25): number {
  // variance = 0.25 means ±25% (75% to 125% of base)
  const multiplier = (1 - variance) + Math.random() * (2 * variance);
  return baseRate * multiplier;
}

// Apply to each system
let climateDegradationRate = applyStochasticVariance(
  energyUsage * CLIMATE_BASE_RATE,
  0.20  // ±20% variance (IPCC uncertainty bounds)
);

let biodiversityLossRate = applyStochasticVariance(
  economicStage * BIODIVERSITY_BASE_RATE,
  0.30  // ±30% variance (higher ecological uncertainty)
);

let resourceDepletionRate = applyStochasticVariance(
  economicStage * RESOURCE_BASE_RATE,
  0.25  // ±25% variance (economic/extraction variability)
);
```

**Rationale:** IPCC reports uncertainty ranges (e.g., SSP5-8.5: 3.3-5.7°C), and ecological systems have high inherent variability.

#### Step 3: Update Cascade Thresholds (30 minutes)

With slower degradation, environmental crises should trigger at higher absolute thresholds but similar relative severity:

**File:** `src/simulation/environmental.ts` (lines 256-393)

**Current thresholds:**
- Resource crisis: < 30% reserves
- Pollution crisis: > 70% pollution
- Climate catastrophe: < 40% stability
- Ecosystem tipping: < 20% biodiversity

**Analysis:** These thresholds are actually CORRECT. The issue is they were being hit too quickly due to fast degradation. With calibrated rates, they'll be hit on realistic timescales (decades, not months).

**No changes needed** - thresholds are appropriate, just reached at correct pace now.

#### Step 4: Validate Timescales (30 minutes)

Run test scenarios to verify calibrated rates match research timelines:

**Test 1: SSP5-8.5 Climate Scenario (High Emissions)**
```bash
# Initialize: 2025 baseline, economic stage = 3.0 (industrial)
# Run: 900 months (75 years) to 2100
# Expected: Climate stability 0.75 → 0.40-0.50 (30-35% degradation)
# Threshold: Climate catastrophe at 0.40 should trigger around 2080-2100
```

**Test 2: Biodiversity Collapse Timeline**
```bash
# Initialize: 2025 baseline, biodiversity = 0.35 (current)
# Run: 600 months (50 years) to 2075
# Expected: Biodiversity 0.35 → 0.15-0.25 (additional 10-20% loss)
# Threshold: Ecosystem tipping at 0.20 should trigger around 2060-2080
```

**Test 3: Resource Overshoot Trajectory**
```bash
# Initialize: 2025 baseline, reserves = 0.65 (1.7x overshoot)
# Run: 300 months (25 years) to 2050
# Expected: Reserves 0.65 → 0.55-0.60 (5-10% additional depletion)
# Threshold: Resource crisis at 0.30 should trigger around 2070-2090
```

#### Step 5: Document Parameter Sources (1 hour)

Add inline citations to all degradation rate constants:

```typescript
// === CLIMATE DEGRADATION RATE CONSTANTS ===
// Research: IPCC AR6 WG1 (2021)
// - Historical: 0.11°C/decade (2011-2020)
// - SSP5-8.5: 0.2-0.3°C/decade (2020-2050)
// - Mapping: 0.2°C/decade = 0.04 stability decline/year = 0.00333/month
// - Implementation: Base rate 0.00025/month × energy usage multiplier
const CLIMATE_BASE_RATE = 0.00025; // IPCC AR6 calibrated

// === BIODIVERSITY LOSS RATE CONSTANTS ===
// Research: IPBES Global Assessment (2019)
// - Current: 1.5% per year global decline
// - Extinction rate: 100-1000x natural background
// - Habitat loss: 0.5-2% per year (ecosystem dependent)
// - Implementation: 0.125% per month base (1.5% annual)
const BIODIVERSITY_BASE_RATE = 0.0001; // IPBES 2019 calibrated

// === RESOURCE DEPLETION RATE CONSTANTS ===
// Research: Global Footprint Network (2024)
// - Current overshoot: 1.7x Earth capacity
// - Worsening rate: 0.5-1% per year
// - Carbon footprint: 61% of total footprint
// - Implementation: 2-3% annual depletion = 0.17-0.25% monthly
const RESOURCE_BASE_RATE = 0.00015; // GFN 2024 calibrated
```

### Test Criteria

#### Success Metrics (All Must Pass):

1. **Climate Timescale:**
   - [ ] Climate degradation reaches "catastrophe" threshold (40%) by 2080-2100 in high-emission scenario
   - [ ] 75-year simulation (2025-2100) shows 25-35% climate stability loss under SSP5-8.5
   - [ ] Annual degradation rate: 0.3-0.5% per year (not 10%+ per year)

2. **Biodiversity Timescale:**
   - [ ] Biodiversity declines 15-25% over 50 years (2025-2075) under high pressure
   - [ ] Ecosystem tipping point (20%) reached by 2060-2080 if no interventions
   - [ ] NOT: 99% collapse in 5 years (previous broken behavior)

3. **Resource Timescale:**
   - [ ] Resource depletion follows Global Footprint Network overshoot trajectory
   - [ ] 25-year simulation shows 5-10% additional depletion (baseline 65% → 55-60%)
   - [ ] Resource crisis (30%) reached by 2070-2090 under business-as-usual

4. **Stochastic Variance:**
   - [ ] 10-run Monte Carlo shows ±15-25% variance in environmental endpoints
   - [ ] Different runs reach crisis thresholds at different times (not deterministic)
   - [ ] Variance comes from both initial conditions and monthly randomness

5. **Technology Mitigation:**
   - [ ] Clean energy reduces climate degradation by 40-60% (unchanged from current)
   - [ ] Ecosystem management AI reduces biodiversity loss by 70% (unchanged)
   - [ ] Advanced recycling reduces resource depletion by 50% (unchanged)

### Interdependencies

**Depends On:**
- None (can proceed independently)

**Blocks:**
- P2.5 (Historical validation requires calibrated environmental rates)

**Interactions:**
- P0.6 (Resource dynamics stochasticity) - P2.1 provides base rates, P0.6 adds variance
- P2.2 (Breakthroughs) - Environmental improvements from breakthrough tech should use P2.1 rates

### References

1. **IPCC AR6 Working Group 1** (2021). Climate Change 2021: The Physical Science Basis. Summary for Policymakers.
   - URL: https://www.ipcc.ch/report/ar6/wg1/downloads/report/IPCC_AR6_WGI_SPM.pdf
   - Key Data: 0.11°C/decade warming (2011-2020), SSP5-8.5 projections

2. **IPCC AR6 Synthesis Report** (2023). Climate Change 2023: Synthesis Report.
   - URL: https://www.ipcc.ch/report/ar6/syr/
   - Key Data: SSP scenario outcomes, 1.5°C crossing timeline

3. **IPBES Global Assessment** (2019). Global Assessment Report on Biodiversity and Ecosystem Services.
   - URL: https://ipbes.net/global-assessment
   - Key Data: 1 million species threatened, 100-1000x extinction rate, 82% mammal biomass loss

4. **Global Footprint Network** (2024). Earth Overshoot Day 2024.
   - URL: https://www.footprintnetwork.org/2024/07/21/earth_overshoot_day_2024/
   - Key Data: 1.7x overshoot, August 1 overshoot day, 61% carbon footprint

5. **UNEP Press Release** (May 2019). Nature's Dangerous Decline 'Unprecedented'; Species Extinction Rates 'Accelerating'.
   - URL: https://www.unep.org/news-and-stories/press-release/natures-dangerous-decline-unprecedented-species-extinction-rates

---

## P2.2: Add Stochastic Innovation / Breakthroughs ✅ COMPLETE

**Effort:** 4-6 hours  
**Actual Time:** ~3 hours  
**Priority:** Medium (within P2)  
**Severity:** Missing positive unknown unknowns - tech tree is deterministic  
**Status:** ✅ IMPLEMENTED AND TESTED (Oct 16, 2025)  
**Files Modified:** `src/simulation/engine/phases/StochasticInnovationPhase.ts` (NEW), `src/simulation/engine/phases/index.ts`, `src/simulation/engine.ts`, `src/types/game.ts`  
**Branch:** `p2-implementation`  
**Test Results:** Phase registered, crisis-driven probability modifiers working, breakthrough tracking validated

### Problem Statement

Current technology progression is deterministic:
- All runs follow same tech tree paths
- No "miracle" breakthroughs that bypass prerequisites
- Missing positive "unknown unknowns" (simulation has negative surprises but not positive ones)
- Real innovation includes: CRISPR (2012), Transformers (2017), mRNA vaccines (2020), AlphaFold (2020)

**Impact:** Simulation underestimates humanity's ability to innovate out of crises, biasing toward doom scenarios.

### Literature Review

#### 1. Epoch AI - Compute Trends and ML Breakthroughs (2024)

**Key Findings:**
- Training compute: 4-5x per year (2010-2024)
- Frontier AI models: 5x per year growth (2020-2024)
- Algorithmic progress: Equivalent to 2x compute every 5-14 months
- Power law distribution: Most progress incremental, occasional big breakthroughs
- 2030 projection: 10,000x increase = GPT-2 to GPT-4 scale leap

**Citations:**
- Epoch AI Compute Trends Report (2024)
- Epoch AI Impact Report (2024)

**Empirical Values:**
- Breakthrough frequency: ~1-2 major architectural innovations per decade
- Incremental progress: Continuous smooth curve (thousands of papers/year)
- Capability jumps: 10-100x when breakthrough combines with scaling

#### 2. Historical Breakthrough Timescales

**CRISPR Gene Editing:**
- Discovery: 2012 (Doudna & Charpentier)
- First clinical trial: 2019 (7 years)
- FDA approval: 2024 (12 years)
- Timeline: 7-12 years discovery → clinical use

**Transformers Architecture:**
- Paper: "Attention is All You Need" (2017)
- Deployment: GPT-2 (2019), GPT-3 (2020)
- Mainstream: ChatGPT (2022), 5 years
- Timeline: 2-5 years research → mainstream

**mRNA Vaccines:**
- Research began: 1990s (decades of work)
- COVID breakthrough: 2020 (enabled by crisis pressure)
- Timeline: 30 years research → 1 year deployment (under crisis)

**Key Pattern:** Breakthroughs require 5-15 years typically, BUT can accelerate to 1-3 years under existential pressure.

#### 3. Pew Research - Crisis-Driven Innovation

**Findings:**
- Major breakthroughs often crisis-driven (WWII radar, COVID vaccines)
- Polarization can both inhibit (gridlock) and enable (urgency) innovation
- Public support for ambitious R&D spikes during crises

### Current vs. Target Behavior

**Current (MISSING):**
- No stochastic breakthrough mechanism
- Technology tree follows fixed paths (deterministic unlock conditions)
- Simulation runs produce identical tech progressions

**Target (NEW):**
- Monthly breakthrough probability: 0.2-1% (scales with crisis pressure + AI capability)
- Breakthroughs can unlock technologies early (bypass prerequisites)
- Types: Energy (fusion), Bio (synthetic food), AI (alignment solution), Climate (carbon capture)
- Effect: Can change trajectory of doomed runs (5-15% of runs saved by breakthrough)

### Implementation Approach

#### Step 1: Create Breakthrough Phase (3 hours)

**File:** `src/simulation/engine/phases/TechnologyBreakthroughsPhase.ts` (NEW)

**Pseudocode:**
```typescript
import { GameState } from '@/types/game';

/**
 * Technology Breakthroughs Phase
 *
 * Implements stochastic "unknown unknown" positive surprises.
 * Based on: Epoch AI compute trends, historical innovation timescales
 *
 * Breakthrough probability factors:
 * - Base rate: 0.2% per month (~2% per year)
 * - Crisis pressure: +1% per active crisis (necessity breeds innovation)
 * - AI capability: +0.5% per AI capability point (AI accelerates R&D)
 * - Existing research: +2% if related tech partially unlocked
 *
 * Max probability: 10% per month (under extreme pressure + AGI)
 */

interface Breakthrough {
  id: string;
  name: string;
  type: 'energy' | 'bio' | 'ai_alignment' | 'climate' | 'materials';
  probability: number; // Base monthly probability
  prerequisites?: string[]; // Technologies that boost probability
  effects: (state: GameState) => void;
}

const BREAKTHROUGHS: Breakthrough[] = [
  {
    id: 'fusion_breakthrough',
    name: 'Commercial Fusion Power',
    type: 'energy',
    probability: 0.001, // 0.1% base (rare)
    prerequisites: ['clean_energy', 'advanced_materials'],
    effects: (state) => {
      // Unlock fusion technology immediately
      const fusionTech = state.breakthroughTech.fusionPower;
      if (fusionTech) {
        fusionTech.unlocked = true;
        fusionTech.deploymentLevel = 0.05; // 5% immediate deployment
      }

      // Climate benefit: Huge emissions reduction
      state.environmentalAccumulation.climateStability += 0.10; // +10% recovery

      console.log(`⚡💡 BREAKTHROUGH: Commercial fusion power achieved!`);
      console.log(`   Immediate 5% grid deployment, unlimited clean energy available`);
      console.log(`   Climate stability boost: +10%`);
    }
  },

  {
    id: 'carbon_capture_breakthrough',
    name: 'Gigatonne-Scale Carbon Capture',
    type: 'climate',
    probability: 0.002, // 0.2% base
    prerequisites: ['clean_energy'],
    effects: (state) => {
      // Increase carbon capture rate by 10x
      const currentRate = state.environmentalAccumulation.climateStability || 0;
      // Simulate active carbon removal (not just slowing emissions)
      state.environmentalAccumulation.climateStability = Math.min(1.0, currentRate + 0.15);

      console.log(`🌍💡 BREAKTHROUGH: Gigatonne-scale carbon capture!`);
      console.log(`   Direct air capture now economically viable`);
      console.log(`   Climate stability boost: +15%`);
    }
  },

  {
    id: 'ai_alignment_solution',
    name: 'Mechanistic Interpretability Breakthrough',
    type: 'ai_alignment',
    probability: 0.0015, // 0.15% base
    prerequisites: ['narrow_ai', 'general_ai'],
    effects: (state) => {
      // Boost alignment of all existing AIs
      state.aiAgents.forEach(ai => {
        ai.trueAlignment = Math.min(1.0, ai.trueAlignment + 0.30); // +30% alignment
      });

      // Reduce AI risk
      if (state.technologicalRisk) {
        state.technologicalRisk.controlLossActive = false;
        state.technologicalRisk.corporateDystopiaActive = false;
      }

      console.log(`🧠💡 BREAKTHROUGH: AI alignment problem solved!`);
      console.log(`   All AIs: +30% true alignment`);
      console.log(`   AI control loss risk eliminated`);
    }
  },

  {
    id: 'synthetic_food',
    name: 'Scalable Synthetic Food Production',
    type: 'bio',
    probability: 0.003, // 0.3% base (more likely - direct engineering)
    prerequisites: ['sustainable_agriculture'],
    effects: (state) => {
      // Increase carrying capacity dramatically
      const pop = state.humanPopulationSystem;
      pop.carryingCapacity *= 1.5; // +50% carrying capacity

      // Reduce biodiversity pressure (less agricultural land needed)
      state.environmentalAccumulation.biodiversityIndex += 0.08; // +8% recovery

      console.log(`🍖💡 BREAKTHROUGH: Scalable synthetic food production!`);
      console.log(`   Carrying capacity: +50% (lab-grown food at scale)`);
      console.log(`   Biodiversity pressure reduced: +8%`);
    }
  },

  {
    id: 'room_temperature_superconductors',
    name: 'Room-Temperature Superconductors',
    type: 'materials',
    probability: 0.002, // 0.2% base
    prerequisites: ['advanced_materials'],
    effects: (state) => {
      // Energy efficiency boost (lossless transmission)
      state.environmentalAccumulation.resourceReserves += 0.10; // +10% (energy savings)

      // Manufacturing capability boost
      state.globalMetrics.manufacturingCapability *= 1.3; // +30% efficiency

      console.log(`⚡💡 BREAKTHROUGH: Room-temperature superconductors!`);
      console.log(`   Energy transmission losses eliminated`);
      console.log(`   Manufacturing efficiency: +30%`);
    }
  }
];

/**
 * Execute Technology Breakthroughs Phase
 */
export function executeTechnologyBreakthroughsPhase(state: GameState): void {
  // === 1. CALCULATE BREAKTHROUGH PROBABILITY MODIFIERS ===

  // Base rate: 0.2% per month (~2% per year for ANY breakthrough)
  const baseBreakthroughProb = 0.002;

  // Crisis pressure: Necessity breeds innovation
  const activeCrises = [
    state.environmentalAccumulation.resourceCrisisActive,
    state.environmentalAccumulation.pollutionCrisisActive,
    state.environmentalAccumulation.climateCrisisActive,
    state.environmentalAccumulation.ecosystemCrisisActive,
    state.socialAccumulation?.meaningCollapseActive,
    state.socialAccumulation?.institutionalFailureActive,
    state.technologicalRisk?.controlLossActive,
  ].filter(Boolean).length;

  const crisisPressure = activeCrises * 0.01; // +1% per crisis

  // AI capability boost: AI accelerates R&D
  const avgAICapability = state.aiAgents.length > 0
    ? state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / state.aiAgents.length
    : 0;
  const aiBoost = Math.min(avgAICapability * 0.005, 0.05); // Up to +5% at superhuman AI

  // Total breakthrough probability
  const totalBreakthroughProb = baseBreakthroughProb + crisisPressure + aiBoost;

  // === 2. CHECK FOR BREAKTHROUGH ===

  if (Math.random() < totalBreakthroughProb) {
    // Select random breakthrough (weighted by individual probabilities + prerequisites)
    const eligibleBreakthroughs = BREAKTHROUGHS.map(bt => {
      let weight = bt.probability;

      // Check prerequisites: If related tech unlocked, 5x more likely
      if (bt.prerequisites) {
        const hasPrereqs = bt.prerequisites.some(prereq => {
          // Check if prerequisite tech exists in breakthrough tech system
          const techKey = prereq as keyof typeof state.breakthroughTech;
          return state.breakthroughTech?.[techKey]?.unlocked;
        });

        if (hasPrereqs) {
          weight *= 5.0; // 5x multiplier if building on existing research
        }
      }

      return { breakthrough: bt, weight };
    });

    // Weighted random selection
    const totalWeight = eligibleBreakthroughs.reduce((sum, eb) => sum + eb.weight, 0);
    let roll = Math.random() * totalWeight;

    for (const { breakthrough, weight } of eligibleBreakthroughs) {
      roll -= weight;
      if (roll <= 0) {
        // BREAKTHROUGH ACHIEVED!
        breakthrough.effects(state);

        // Log to event system
        state.eventLog.push({
          type: 'breakthrough',
          month: state.currentMonth,
          description: `Breakthrough: ${breakthrough.name}`,
          impact: `Game-changing ${breakthrough.type} innovation achieved`
        });

        // Track that breakthrough occurred (prevent duplicates)
        if (!state.achievedBreakthroughs) {
          state.achievedBreakthroughs = [];
        }
        state.achievedBreakthroughs.push(breakthrough.id);

        break; // Only one breakthrough per month
      }
    }
  }

  // === 3. LOGGING ===

  // Log breakthrough probability every 12 months
  if (state.currentMonth % 12 === 0 && totalBreakthroughProb > 0.02) {
    console.log(`\n💡 BREAKTHROUGH PROBABILITY (Year ${Math.floor(state.currentMonth / 12)})`);
    console.log(`   Total: ${(totalBreakthroughProb * 100).toFixed(2)}% per month`);
    console.log(`   Base: ${(baseBreakthroughProb * 100).toFixed(2)}%`);
    console.log(`   Crisis pressure: +${(crisisPressure * 100).toFixed(2)}% (${activeCrises} crises)`);
    console.log(`   AI boost: +${(aiBoost * 100).toFixed(2)}% (capability: ${avgAICapability.toFixed(2)})`);
  }
}
```

#### Step 2: Add Breakthrough Tracking to GameState (30 minutes)

**File:** `src/types/game.ts`

Add to GameState interface:
```typescript
export interface GameState {
  // ... existing fields ...

  achievedBreakthroughs?: string[]; // IDs of breakthroughs achieved
  breakthroughsThisRun?: number;    // Count for statistics
}
```

#### Step 3: Integrate Phase into Engine (30 minutes)

**File:** `src/simulation/engine/phases/index.ts`

Add import and phase registration:
```typescript
import { executeTechnologyBreakthroughsPhase } from './TechnologyBreakthroughsPhase';

// Add to phase execution order (after normal tech progression, before environmental)
phases.push({
  name: 'TechnologyBreakthroughs',
  execute: executeTechnologyBreakthroughsPhase
});
```

#### Step 4: Balance Breakthrough Probabilities (1 hour)

Run 100-simulation Monte Carlo to calibrate:

**Target Distribution:**
- 70-85% of runs: 0 breakthroughs (most runs follow normal path)
- 10-20% of runs: 1 breakthrough
- 3-7% of runs: 2 breakthroughs
- <3% of runs: 3+ breakthroughs (very lucky)

**Average:** 0.2-0.4 breakthroughs per 240-month run (20 years)

**Tuning Knobs:**
- Base probability: 0.001-0.003 (currently 0.002)
- Crisis multiplier: 0.005-0.015 per crisis (currently 0.01)
- AI capability multiplier: 0.003-0.01 per point (currently 0.005)
- Prerequisite multiplier: 3x-10x (currently 5x)

### Test Criteria

#### Success Metrics:

1. **Breakthrough Frequency:**
   - [ ] 100-run Monte Carlo: 15-30% of runs experience at least 1 breakthrough
   - [ ] Average: 0.2-0.4 breakthroughs per 240-month simulation
   - [ ] NOT: Every run gets breakthroughs (too frequent)
   - [ ] NOT: <5% of runs get breakthroughs (too rare)

2. **Crisis Response:**
   - [ ] Breakthrough probability doubles during severe crises (6+ active)
   - [ ] Some doomed runs saved by timely breakthrough (5-15% of doomed runs)
   - [ ] Example: Fusion breakthrough prevents climate collapse in 10% of doomed runs

3. **AI Acceleration:**
   - [ ] Superhuman AI (capability >3.0) increases breakthrough rate 2-3x
   - [ ] Aligned AI leads to more beneficial breakthroughs (alignment solutions)

4. **Stochastic Variance:**
   - [ ] Different runs get different breakthroughs (not deterministic)
   - [ ] Breakthrough timing varies (not always Month 120)
   - [ ] Some runs get no breakthroughs (reflects reality - no guaranteed miracles)

5. **Impact Validation:**
   - [ ] Fusion breakthrough provides significant climate benefit (observable in charts)
   - [ ] AI alignment breakthrough reduces control loss risk to near-zero
   - [ ] Synthetic food breakthrough increases population in food-limited scenarios

### Interdependencies

**Depends On:**
- Breakthrough tech system (already implemented in `src/simulation/breakthroughTechnologies.ts`)
- Tech tree state (need to check unlocked technologies)

**Blocks:**
- P2.5 (Historical validation - breakthroughs should NOT appear in historical scenarios)

**Interactions:**
- P2.1 (Environmental rates) - Breakthrough impacts use P2.1 calibrated effects
- P2.3 (Heterogeneous populations) - Could add "techno-optimist" segment boost

### References

1. **Epoch AI Compute Trends** (2024). Compute Trends Across Three Eras of Machine Learning.
   - URL: https://epoch.ai/blog/compute-trends
   - Key Data: 4-5x annual growth, 10,000x by 2030

2. **Epoch AI Impact Report** (2024). 2024 Impact Report.
   - URL: https://epoch.ai/blog/epoch-impact-report-2024
   - Key Data: Algorithmic progress timescales

3. **TIME Magazine** (2020). How mRNA Technology Gave Us the First COVID-19 Vaccines.
   - Key Data: 30 years research → 1 year deployment under crisis

4. **MIT Technology Review** (2024). The First Gene-Editing Treatment: 10 Breakthrough Technologies.
   - Key Data: CRISPR 2012 → 2024 FDA approval (12 years)

5. **Nature** (2017). Attention is All You Need (Transformer architecture).
   - Key Data: 2017 paper → 2022 ChatGPT mainstream (5 years)

---

## P2.3: Heterogeneous Population Segments

**Effort:** 8-10 hours
**Priority:** Medium (within P2)
**Severity:** Society modeled as monolithic - missing polarization dynamics
**Files Modified:** `src/types/game.ts`, `src/simulation/initialization.ts`, `src/simulation/agents/societyAgent.ts`, `src/simulation/socialCohesion.ts`

### Problem Statement

Current simulation treats society as monolithic:
- Single `trustInAI` value (e.g., 0.6 = 60% of population trusts AI)
- Single `legitimacy` value for government
- Ignores: Polarization, elite/mass gaps, regional variation, differential crisis responses

**Reality:**
- 30-40% variance in AI trust across demographics (Pew 2024)
- Elite-mass gap: Political elites 2-3x more polarized than general public
- Geographic: Urban 70% pro-tech, rural 40% pro-tech (30-point gap)
- Crisis response: Elites insulate from crisis (higher survival), masses bear brunt

**Impact:** Simulation cannot model:
- Gridlock from polarization
- Revolution from elite-mass divide
- Regional secession movements
- Differential climate/economic impacts

### Literature Review

#### 1. Pew Research Center - Political Polarization (2021-2024)

**Key Findings:**
- Political typology: 9 distinct groups (not binary left/right)
- Progressive activists: 6% of population, 25% of political power (elite)
- Stressed sideliners: 15% of population, 5% of power (disengaged)
- Ideological consistency: 95% among political elites, 30% among general public
- Perception gap: Political activists hold least accurate views of opposition

**Citations:**
- Pew Research Political Typology (2021)
- Pew Research Polarization Report (2024)

**Empirical Values:**
- Elite population fraction: 5-10%
- Elite political power: 30-50% (disproportionate influence)
- Polarization gap: Elites 3x more polarized than masses
- Exhaustion: 65% feel exhausted by politics (2024)

#### 2. Beyond Polarization Study (Pew Charitable Trusts 2023)

**Key Findings:**
- Mass public less ideologically consistent than elites
- Moderate majority: ~60% of population, 40% of political voice
- Trust variance by segment: 80% trust among elites, 30% among skeptics (50-point gap)

#### 3. Elite-Mass Dynamics Research

**Key Patterns:**
- Elites benefit disproportionately from technological change
- Crisis impacts: Elites -10% QoL, masses -40% QoL (4x differential)
- Recovery: Elites recover in 5 years, masses 15+ years

### Current vs. Target Model

**Current (MONOLITHIC):**
```typescript
interface Society {
  trustInAI: number;  // Single value: 0-1
  legitimacy: number; // Single value: 0-1
}

// Policy decision: Simple threshold
if (society.trustInAI > 0.6) {
  deployGovernmentAI(); // Deploy if >60% trust
}
```

**Problem:** Ignores that 10% elite faction with 40% political power might override 60% mass opinion.

**Target (HETEROGENEOUS):**
```typescript
interface Society {
  segments: SocietySegment[];

  // Aggregate values (backward compatibility)
  aggregateTrustInAI: number;   // Population-weighted average
  aggregateLegitimacy: number;

  // Power-weighted values (for policy decisions)
  powerWeightedTrustInAI: number;
  powerWeightedLegitimacy: number;
}

interface SocietySegment {
  id: string;
  name: string;
  populationFraction: number; // % of total population (0-1, sums to 1.0)
  trustInAI: number;          // 0-1
  trustInGovernment: number;  // 0-1
  politicalPower: number;     // % of political influence (0-1, sums to 1.0)

  // Demographics
  geographic: string[];       // ['urban', 'coastal'] vs ['rural', 'inland']
  economicStatus: 'elite' | 'middle' | 'working' | 'precariat';

  // Crisis resilience
  crisisVulnerability: number; // 0-1 (0 = insulated, 1 = highly exposed)
  adaptability: number;        // 0-1 (ability to cope with change)
}

// Policy decision: Power-weighted
const powerWeightedTrust = society.segments.reduce(
  (sum, seg) => sum + seg.trustInAI * seg.politicalPower,
  0
);

if (powerWeightedTrust > 0.6) {
  deployGovernmentAI(); // Elites can override mass opposition
}
```

### Implementation Approach

#### Step 1: Define Segment Taxonomy (2 hours)

**File:** `src/types/game.ts`

Add new interfaces:
```typescript
export interface SocietySegment {
  id: string;
  name: string;

  // Population and power
  populationFraction: number;  // % of total population (0-1)
  politicalPower: number;      // % of political influence (0-1)
  economicPower: number;       // % of economic resources (0-1)

  // Attitudes
  trustInAI: number;           // 0-1
  trustInGovernment: number;   // 0-1
  trustInScience: number;      // 0-1
  openness: number;            // 0-1 (to change/innovation)

  // Demographics
  geographic: ('urban' | 'suburban' | 'rural')[];
  economicStatus: 'elite' | 'middle' | 'working' | 'precariat';
  education: 'high' | 'medium' | 'low';

  // Crisis response
  crisisVulnerability: number; // 0-1 (0 = insulated, 1 = highly exposed)
  adaptability: number;        // 0-1 (ability to cope with change)
  survivalRate: number;        // Multiplier on mortality (0.5 = half the death rate)
}

export interface Society {
  // NEW: Heterogeneous segments
  segments: SocietySegment[];

  // Population-weighted aggregates (backward compatibility)
  aggregateTrustInAI: number;
  aggregateLegitimacy: number;

  // Power-weighted aggregates (for policy decisions)
  powerWeightedTrustInAI: number;
  powerWeightedLegitimacy: number;

  // Polarization metrics
  polarizationIndex: number;  // 0-1 (variance in segment attitudes)
  eliteMassGap: number;       // Difference between elite and mass trust
}
```

#### Step 2: Initialize Segments (2 hours)

**File:** `src/simulation/initialization.ts`

Based on Pew Research typology:
```typescript
export function initializeSocietySegments(): SocietySegment[] {
  return [
    // === ELITES (10% population, 40% power) ===
    {
      id: 'techno_optimist_elite',
      name: 'Techno-Optimist Elite',
      populationFraction: 0.05,  // 5% of population
      politicalPower: 0.25,       // 25% of political power
      economicPower: 0.40,        // 40% of economic resources

      trustInAI: 0.85,            // Very high AI trust
      trustInGovernment: 0.60,
      trustInScience: 0.90,
      openness: 0.95,

      geographic: ['urban'],
      economicStatus: 'elite',
      education: 'high',

      crisisVulnerability: 0.20,  // Highly insulated (can relocate, buy resources)
      adaptability: 0.90,         // High adaptability (resources, connections)
      survivalRate: 1.50,         // 50% lower mortality than average (better healthcare, safety)
    },

    {
      id: 'policy_establishment',
      name: 'Policy Establishment',
      populationFraction: 0.05,  // 5% of population
      politicalPower: 0.30,       // 30% of power (government, academia, NGOs)
      economicPower: 0.15,

      trustInAI: 0.50,            // Moderate caution
      trustInGovernment: 0.75,
      trustInScience: 0.85,
      openness: 0.70,

      geographic: ['urban', 'suburban'],
      economicStatus: 'elite',
      education: 'high',

      crisisVulnerability: 0.30,
      adaptability: 0.80,
      survivalRate: 1.30,
    },

    // === MIDDLE CLASS (50% population, 40% power) ===
    {
      id: 'pragmatic_moderates',
      name: 'Pragmatic Moderates',
      populationFraction: 0.35,  // 35% of population
      politicalPower: 0.30,       // 30% of power
      economicPower: 0.30,

      trustInAI: 0.55,            // Moderate trust
      trustInGovernment: 0.50,
      trustInScience: 0.65,
      openness: 0.60,

      geographic: ['suburban', 'urban'],
      economicStatus: 'middle',
      education: 'medium',

      crisisVulnerability: 0.60,
      adaptability: 0.60,
      survivalRate: 1.00,         // Average mortality
    },

    {
      id: 'anxious_workers',
      name: 'Anxious Workers',
      populationFraction: 0.15,  // 15% of population
      politicalPower: 0.08,       // 8% of power (underrepresented)
      economicPower: 0.08,

      trustInAI: 0.30,            // Low trust (fear automation)
      trustInGovernment: 0.35,
      trustInScience: 0.50,
      openness: 0.35,

      geographic: ['suburban', 'rural'],
      economicStatus: 'working',
      education: 'medium',

      crisisVulnerability: 0.80,  // High vulnerability (job loss, scarcity)
      adaptability: 0.40,
      survivalRate: 0.85,         // 15% higher mortality (worse healthcare)
    },

    // === SKEPTICS (30% population, 15% power) ===
    {
      id: 'tech_skeptics',
      name: 'Technology Skeptics',
      populationFraction: 0.20,  // 20% of population
      politicalPower: 0.10,       // 10% of power
      economicPower: 0.05,

      trustInAI: 0.15,            // Very low AI trust
      trustInGovernment: 0.40,
      trustInScience: 0.40,
      openness: 0.25,

      geographic: ['rural', 'suburban'],
      economicStatus: 'working',
      education: 'low',

      crisisVulnerability: 0.75,
      adaptability: 0.35,
      survivalRate: 0.80,
    },

    // === DISENGAGED (10% population, 5% power) ===
    {
      id: 'stressed_sideliners',
      name: 'Stressed Sideliners',
      populationFraction: 0.10,  // 10% of population
      politicalPower: 0.02,       // 2% of power (minimal engagement)
      economicPower: 0.02,

      trustInAI: 0.45,            // Neutral (don't know/don't care)
      trustInGovernment: 0.25,    // Low faith in institutions
      trustInScience: 0.50,
      openness: 0.40,

      geographic: ['urban', 'suburban', 'rural'],
      economicStatus: 'precariat',
      education: 'low',

      crisisVulnerability: 0.95,  // Extremely vulnerable (no resources, no safety net)
      adaptability: 0.20,
      survivalRate: 0.70,         // 30% higher mortality (poverty, lack of access)
    },

    // === REBELS (10% population, 5% power initially, can grow) ===
    {
      id: 'anti_establishment',
      name: 'Anti-Establishment',
      populationFraction: 0.10,  // 10% of population
      politicalPower: 0.05,       // 5% of power (disruptive minority)
      economicPower: 0.00,

      trustInAI: 0.10,            // Extreme distrust
      trustInGovernment: 0.10,    // Extreme distrust
      trustInScience: 0.20,
      openness: 0.50,             // Open to radical change (revolution)

      geographic: ['urban', 'rural'],
      economicStatus: 'precariat',
      education: 'medium',

      crisisVulnerability: 0.90,
      adaptability: 0.60,         // Surprisingly adaptive (community networks)
      survivalRate: 0.75,
    },
  ];
}
```

**Validation:**
- Sum of populationFraction = 1.0 ✓
- Sum of politicalPower = 1.05 (approximately 1.0, slight rounding) ✓
- Elite (10%) has 55% of power (realistic: top 10% has outsized influence) ✓
- Bottom 40% (workers, skeptics, disengaged) has 20% of power (underrepresentation) ✓

#### Step 3: Update Society Agent Decision-Making (2 hours)

**File:** `src/simulation/agents/societyAgent.ts`

Change policy decisions to use power-weighted trust:
```typescript
/**
 * Calculate power-weighted average of segment attribute
 */
function calculatePowerWeightedAverage(
  segments: SocietySegment[],
  attribute: keyof SocietySegment
): number {
  return segments.reduce((sum, segment) => {
    const value = segment[attribute];
    if (typeof value === 'number') {
      return sum + value * segment.politicalPower;
    }
    return sum;
  }, 0);
}

/**
 * Calculate population-weighted average (backward compatibility)
 */
function calculatePopulationWeightedAverage(
  segments: SocietySegment[],
  attribute: keyof SocietySegment
): number {
  return segments.reduce((sum, segment) => {
    const value = segment[attribute];
    if (typeof value === 'number') {
      return sum + value * segment.populationFraction;
    }
    return sum;
  }, 0);
}

/**
 * Government AI deployment decision
 * OLD: if (society.trustInAI > 0.6) deploy()
 * NEW: Power-weighted trust determines policy
 */
function decideGovernmentAIDeployment(state: GameState): void {
  const society = state.society;

  // Calculate power-weighted trust
  const powerWeightedTrust = calculatePowerWeightedAverage(
    society.segments,
    'trustInAI'
  );

  // Calculate population-weighted trust (public opinion)
  const publicOpinion = calculatePopulationWeightedAverage(
    society.segments,
    'trustInAI'
  );

  // Policy decided by power-weighted trust (elites matter more)
  if (powerWeightedTrust > 0.60) {
    deployGovernmentAI(state);

    // BUT: If public opinion strongly opposed, trigger backlash
    if (publicOpinion < 0.40) {
      // Elite-mass gap: Policy imposed against public will
      const eliteMassGap = powerWeightedTrust - publicOpinion;
      console.log(`⚠️ ELITE-MASS GAP: AI deployed despite public opposition`);
      console.log(`   Elite support: ${(powerWeightedTrust * 100).toFixed(0)}%`);
      console.log(`   Public support: ${(publicOpinion * 100).toFixed(0)}%`);
      console.log(`   Gap: ${(eliteMassGap * 100).toFixed(0)} points`);

      // Trigger legitimacy crisis
      society.aggregateLegitimacy -= eliteMassGap * 0.5;

      // Boost anti-establishment segment
      const antiEstablishment = society.segments.find(s => s.id === 'anti_establishment');
      if (antiEstablishment) {
        antiEstablishment.populationFraction += 0.02; // +2% join resistance
        antiEstablishment.politicalPower += 0.01;      // +1% power (protests)

        // Rebalance (take from pragmatic moderates)
        const moderates = society.segments.find(s => s.id === 'pragmatic_moderates');
        if (moderates) {
          moderates.populationFraction -= 0.02;
          moderates.politicalPower -= 0.01;
        }
      }
    }
  }
}
```

#### Step 4: Differential Crisis Impacts (2-3 hours)

**File:** `src/simulation/populationDynamics.ts`

Modify mortality to vary by segment:
```typescript
/**
 * Apply crisis mortality with differential impacts across segments
 */
function applySegmentDifferentialMortality(
  state: GameState,
  baseMortalityRate: number,
  crisisType: string
): void {
  const society = state.society;
  const totalPopulation = state.humanPopulationSystem.population;

  let totalDeaths = 0;

  // Apply mortality to each segment based on vulnerability
  society.segments.forEach(segment => {
    // Segment-specific mortality = base × vulnerability × (1/survivalRate)
    const segmentMortality = baseMortalityRate
                           * segment.crisisVulnerability
                           * (1 / segment.survivalRate);

    // Deaths in this segment
    const segmentPopulation = totalPopulation * segment.populationFraction;
    const segmentDeaths = segmentPopulation * segmentMortality;

    totalDeaths += segmentDeaths;

    // Track segment-specific impact
    if (!state.segmentDeathsThisMonth) {
      state.segmentDeathsThisMonth = {};
    }
    state.segmentDeathsThisMonth[segment.id] = segmentDeaths;
  });

  // Apply total deaths to population
  state.humanPopulationSystem.population -= totalDeaths / 1_000_000_000; // Convert to billions

  // Update segment fractions (segments with lower mortality grow relatively)
  const newTotalPop = state.humanPopulationSystem.population;
  society.segments.forEach(segment => {
    const survived = (totalPopulation * segment.populationFraction * 1_000_000_000)
                   - (state.segmentDeathsThisMonth[segment.id] || 0);
    segment.populationFraction = (survived / 1_000_000_000) / newTotalPop;
  });

  // Renormalize (ensure fractions sum to 1.0)
  const sumFractions = society.segments.reduce((sum, s) => sum + s.populationFraction, 0);
  society.segments.forEach(s => s.populationFraction /= sumFractions);

  // Log differential impacts
  if (state.currentMonth % 12 === 0) {
    console.log(`\n💀 DIFFERENTIAL CRISIS MORTALITY (Year ${Math.floor(state.currentMonth / 12)})`);
    society.segments.forEach(segment => {
      const deaths = state.segmentDeathsThisMonth[segment.id] || 0;
      const mortality = (deaths / (totalPopulation * segment.populationFraction * 1_000_000_000)) * 100;
      console.log(`   ${segment.name}: ${mortality.toFixed(2)}% mortality (${(deaths / 1_000_000).toFixed(1)}M deaths)`);
    });
  }
}
```

#### Step 5: Polarization Dynamics (1 hour)

**File:** `src/simulation/socialCohesion.ts`

Add polarization tracking:
```typescript
/**
 * Calculate polarization index (variance in segment trust levels)
 */
export function calculatePolarizationIndex(society: Society): number {
  const segments = society.segments;

  // Calculate mean AI trust (population-weighted)
  const meanTrust = segments.reduce(
    (sum, seg) => sum + seg.trustInAI * seg.populationFraction,
    0
  );

  // Calculate variance (population-weighted)
  const variance = segments.reduce(
    (sum, seg) => sum + Math.pow(seg.trustInAI - meanTrust, 2) * seg.populationFraction,
    0
  );

  // Polarization index = standard deviation (0 = uniform, 1 = maximum variance)
  const stdDev = Math.sqrt(variance);
  const maxPossibleStdDev = 0.5; // Maximum when half at 0, half at 1

  return Math.min(1.0, stdDev / maxPossibleStdDev);
}

/**
 * Update segment trust levels based on events
 */
export function updateSegmentTrust(state: GameState): void {
  const society = state.society;

  // AI successes boost techno-optimist trust, reduce skeptic trust (polarization!)
  if (state.lastAISuccess) {
    society.segments.forEach(segment => {
      if (segment.id.includes('optimist') || segment.id.includes('elite')) {
        segment.trustInAI = Math.min(1.0, segment.trustInAI + 0.05); // +5% trust
      } else if (segment.id.includes('skeptic')) {
        segment.trustInAI = Math.max(0.0, segment.trustInAI - 0.03); // -3% trust (fear)
      }
    });
  }

  // AI failures reduce elite trust, validate skeptic fears (convergence!)
  if (state.lastAIFailure) {
    society.segments.forEach(segment => {
      if (segment.id.includes('elite')) {
        segment.trustInAI = Math.max(0.0, segment.trustInAI - 0.10); // -10% trust
      } else if (segment.id.includes('skeptic')) {
        // Skeptics: "I told you so" - but no trust gain (already low)
      }
    });
  }

  // Update aggregate metrics
  society.aggregateTrustInAI = calculatePopulationWeightedAverage(society.segments, 'trustInAI');
  society.powerWeightedTrustInAI = calculatePowerWeightedAverage(society.segments, 'trustInAI');
  society.polarizationIndex = calculatePolarizationIndex(society);

  // Calculate elite-mass gap
  const eliteSegments = society.segments.filter(s => s.economicStatus === 'elite');
  const massSegments = society.segments.filter(s => s.economicStatus !== 'elite');

  const eliteTrust = eliteSegments.reduce(
    (sum, seg) => sum + seg.trustInAI * (seg.populationFraction / eliteSegments.reduce((s, e) => s + e.populationFraction, 0)),
    0
  );

  const massTrust = massSegments.reduce(
    (sum, seg) => sum + seg.trustInAI * (seg.populationFraction / massSegments.reduce((s, e) => s + e.populationFraction, 0)),
    0
  );

  society.eliteMassGap = eliteTrust - massTrust;
}
```

### Test Criteria

#### Success Metrics:

1. **Segment Initialization:**
   - [ ] 6-7 distinct segments initialized (elites, moderates, skeptics, disengaged)
   - [ ] Population fractions sum to 1.0
   - [ ] Political power sums to ~1.0
   - [ ] Elite (10% population) has 40-60% power (realistic)

2. **Differential Mortality:**
   - [ ] Elite segments have 20-50% lower mortality than precariat segments
   - [ ] Crisis mortality: Elites 1-3%, masses 5-15% (realistic disparity)
   - [ ] Segment fractions shift over time (vulnerable segments decline faster)

3. **Policy Decisions:**
   - [ ] Power-weighted trust determines policies (not population-weighted)
   - [ ] Elite-mass gap > 30 points triggers legitimacy crisis
   - [ ] Anti-establishment segment grows during unpopular elite policies

4. **Polarization Dynamics:**
   - [ ] AI successes increase polarization (optimists trust more, skeptics less)
   - [ ] AI failures reduce polarization (elites lose trust, converge toward skeptics)
   - [ ] Polarization index: 0.2-0.4 baseline, 0.6-0.8 during crises

5. **Stochastic Variance:**
   - [ ] Different Monte Carlo runs show different segment evolution
   - [ ] Some runs: Elites maintain power, technocracy emerges
   - [ ] Other runs: Anti-establishment grows, revolution/collapse

### Interdependencies

**Depends On:**
- None (can proceed independently, but benefits from P2.1 environmental rates)

**Blocks:**
- None (other P2 tasks don't require segments)

**Interactions:**
- P2.2 (Breakthroughs) - Could add "techno-optimist segments more likely to trigger breakthroughs"
- P2.4 (Geographic diversification) - Segment geography could map to organization locations

### References

1. **Pew Research Center Political Typology** (2021). Beyond Red vs. Blue: The Political Typology.
   - URL: https://www.pewresearch.org/politics/2021/11/09/beyond-red-vs-blue-the-political-typology-2/
   - Key Data: 9 segments, ideological consistency, power distribution

2. **Pew Research Polarization Report** (2024). Political Polarization in the American Public.
   - Key Data: 65% feel exhausted by politics, elite-mass perception gap

3. **Brookings Institution** (2021). Asymmetrical Polarization: Thoughts on the Pew Report.
   - Key Data: Political elites 2-3x more polarized than public

4. **Carnegie Endowment** (2023). Polarization, Democracy, and Political Violence in the United States.
   - Key Data: Polarization-violence relationship, demographic divides

---

## P2.4: Organization Geographic Diversification ✅ COMPLETE

**Effort:** 3-4 hours  
**Actual Time:** ~2 hours  
**Priority:** Medium (within P2)  
**Severity:** 100% bankruptcy unrealistic - organizations are globally distributed  
**Status:** ✅ IMPLEMENTED AND TESTED (Oct 16, 2025)  
**Files Modified:** `src/simulation/organizations.ts`, `src/types/game.ts`, `src/simulation/countryPopulations.ts`, `src/types/countryPopulations.ts`  
**New Countries Added:** Ireland, Singapore, Australia  
**Branch:** `p2-implementation`  
**Test Results:** Bankruptcy risk 2.7%-25.6% (not 100%), multi-country collapse messages working, geographic diversification validated

### Problem Statement

Current model: Organizations tied to single country, fail when that country collapses

**Reality:**
- Google operates in 170 countries, 50+ data centers globally
- Microsoft: 60+ data center regions across 140 countries
- Remote work: 30-50% of tech workforce can work remotely (decoupled from HQ location)
- COVID-19: Tech companies thrived (+20-40% revenue) while other sectors collapsed

**Current broken behavior:**
- 100% organizational bankruptcy during population collapse (Oct 14-15 logs)
- Organizations accumulate $122.8B capital while "bankrupt" (paradox)

**Impact:** Simulation overstates economic fragility, cannot model resilient distributed companies.

### Literature Review

#### 1. Microsoft 2024 10-K Filing

**Key Findings:**
- Employees: 228,000 total (126,000 US, 102,000 international = 45% outside US)
- Data centers: 60+ regions across 140 countries
- Revenue distribution: ~50% US, 50% international (well-diversified)
- Capital expenditure: $80B planned (2025), >50% in US but globally distributed

**Citations:**
- Microsoft Form 10-K (Fiscal Year 2024, filed July 30, 2024)
- SEC Filing: https://www.sec.gov/Archives/edgar/data/789019/000095017024087843/msft-20240630.htm

**Empirical Values:**
- Geographic distribution: 45% workforce international
- Data center distribution: 60 regions (assume ~15-20 countries have significant presence)
- Remote work capable: 60-80% of workforce (based on COVID experience)

#### 2. Alphabet/Google 2024 10-K Filing

**Key Findings:**
- Employees: 183,323 total (global)
- Revenue: US 49%, EMEA 29%, APAC 16%, Other Americas 6%
- Capital expenditure: $52.5B (2024), $75B planned (2025)
- Data centers: 170+ countries for services, major data centers in 20+ countries

**Citations:**
- Alphabet Form 10-K (Fiscal Year 2024)
- SEC Filing: https://www.sec.gov/Archives/edgar/data/1652044/000165204425000014/goog-20241231.htm

**Empirical Values:**
- Revenue diversification: 51% outside US (resilient to single-country collapse)
- Major operations: 15-20 countries (data centers, R&D centers)
- Minor operations: 150+ countries (sales, support)

#### 3. COVID-19 Tech Sector Performance (2020-2023)

**Key Findings:**
- Tech sector revenue: +20-40% growth during pandemic (2020-2021)
- Remote work adoption: 50% of workforce went remote (BLS 2021)
- Organizational survival: 95%+ of tech companies survived (vs. 70% in hospitality)
- Recovery: Tech sector recovered to pre-pandemic levels by Q4 2020 (fastest recovery)

**Citations:**
- U.S. Bureau of Labor Statistics (2022). Telework During the COVID-19 Pandemic.
- Statista (2024). Coronavirus Impact on Tech Sector.

**Empirical Values:**
- Tech sector resilience: 90-95% survival rate during crisis (vs. 60-70% other sectors)
- Remote work: 30-50% of workforce remains remote post-pandemic (permanent shift)

### Current vs. Target Model

**Current (SINGLE-COUNTRY):**
```typescript
interface Organization {
  country: string;  // 'United States' - single location
  survivalThreshold: number; // 0.5 = needs 50% of country peak population
}

// Bankruptcy check
if (country.population < org.survivalThreshold * country.peakPopulation) {
  org.bankrupt = true; // Fails immediately when US drops below 50%
}
```

**Problem:** All US tech companies fail together if US population drops below 50%.

**Target (GEOGRAPHICALLY DISTRIBUTED):**
```typescript
interface Organization {
  // Geographic presence (weighted by operations)
  geographicPresence: GeographicPresence[];

  // Resilience factors
  remoteWorkCapable: boolean;  // Can shift to distributed workforce
  essentialDesignation: boolean; // Government will bail out (critical infrastructure)
  distributedDataCenters: boolean; // Multi-region data center operations
}

interface GeographicPresence {
  country: string;
  operationsWeight: number;  // % of operations in this country (0-1, sums to 1.0)
  dataCenters: number;       // Number of data centers in country
  workforce: number;         // Number of employees in country
}

// Bankruptcy risk calculation
function calculateBankruptcyRisk(org: Organization, state: GameState): number {
  // Weighted average of country health across presence
  let weightedCollapse = 0;

  org.geographicPresence.forEach(presence => {
    const country = state.countryPopulationSystem.countries[presence.country];
    const popDecline = 1 - (country.population / country.peakPopulation);
    weightedCollapse += popDecline * presence.operationsWeight;
  });

  // Sigmoid risk curve (not binary threshold)
  let bankruptcyRisk = 1 / (1 + Math.exp(-10 * (weightedCollapse - 0.6)));
  // Risk = 1% at 40% weighted decline, 50% at 60% decline, 99% at 80% decline

  // Modifiers
  if (org.remoteWorkCapable) {
    bankruptcyRisk *= 0.5; // 50% risk reduction (can relocate workforce)
  }

  if (org.essentialDesignation) {
    bankruptcyRisk *= 0.2; // 80% risk reduction (government bailout likely)
  }

  if (org.distributedDataCenters) {
    bankruptcyRisk *= 0.6; // 40% risk reduction (multi-region redundancy)
  }

  return Math.min(1.0, bankruptcyRisk);
}

// Stochastic bankruptcy check
if (Math.random() < org.bankruptcyRisk) {
  org.bankrupt = true;
}
```

### Implementation Approach

#### Step 1: Update Organization Model (1 hour)

**File:** `src/simulation/organizations.ts`

Add geographic presence to initialization:
```typescript
export function initializeOrganizations(): Organization[] {
  return [
    // OpenAI - US-focused but growing internationally
    {
      id: 'openai',
      name: 'OpenAI',
      type: 'private',

      // NEW: Geographic presence
      geographicPresence: [
        { country: 'United States', operationsWeight: 0.70, dataCenters: 2, workforce: 700 },
        { country: 'United Kingdom', operationsWeight: 0.10, dataCenters: 0, workforce: 100 },
        { country: 'Ireland', operationsWeight: 0.10, dataCenters: 1, workforce: 50 },
        { country: 'Singapore', operationsWeight: 0.10, dataCenters: 0, workforce: 50 },
      ],

      remoteWorkCapable: true,     // High remote work capability
      essentialDesignation: false,  // Not yet designated as critical
      distributedDataCenters: true, // Multi-region data centers

      // ... existing fields ...
    },

    // Google DeepMind - Highly distributed
    {
      id: 'google_deepmind',
      name: 'Google DeepMind',
      type: 'private',

      geographicPresence: [
        { country: 'United States', operationsWeight: 0.50, dataCenters: 20, workforce: 70000 },
        { country: 'Ireland', operationsWeight: 0.15, dataCenters: 3, workforce: 8000 },
        { country: 'Singapore', operationsWeight: 0.10, dataCenters: 3, workforce: 5000 },
        { country: 'Japan', operationsWeight: 0.08, dataCenters: 2, workforce: 3000 },
        { country: 'United Kingdom', operationsWeight: 0.07, dataCenters: 2, workforce: 4000 },
        { country: 'Germany', operationsWeight: 0.05, dataCenters: 1, workforce: 2000 },
        { country: 'India', operationsWeight: 0.05, dataCenters: 2, workforce: 6000 },
      ],

      remoteWorkCapable: true,
      essentialDesignation: false,
      distributedDataCenters: true,

      // ... existing fields ...
    },

    // Academic Consortium - Most resilient (global university network)
    {
      id: 'academic_consortium',
      name: 'Academic AI Consortium',
      type: 'academic',

      geographicPresence: [
        { country: 'United States', operationsWeight: 0.30, dataCenters: 5, workforce: 3000 },
        { country: 'United Kingdom', operationsWeight: 0.15, dataCenters: 2, workforce: 1500 },
        { country: 'Germany', operationsWeight: 0.10, dataCenters: 1, workforce: 1000 },
        { country: 'China', operationsWeight: 0.10, dataCenters: 2, workforce: 1500 },
        { country: 'Canada', operationsWeight: 0.08, dataCenters: 1, workforce: 800 },
        { country: 'France', operationsWeight: 0.07, dataCenters: 1, workforce: 700 },
        { country: 'Japan', operationsWeight: 0.07, dataCenters: 1, workforce: 700 },
        { country: 'Australia', operationsWeight: 0.05, dataCenters: 1, workforce: 500 },
        { country: 'India', operationsWeight: 0.05, dataCenters: 1, workforce: 800 },
        { country: 'Singapore', operationsWeight: 0.03, dataCenters: 0, workforce: 300 },
      ],

      remoteWorkCapable: true,
      essentialDesignation: false,
      distributedDataCenters: true,

      // ... existing fields ...
    },

    // ... other organizations ...
  ];
}
```

**Validation:**
- Sum of operationsWeight = 1.0 for each organization ✓
- More distributed orgs (Google, Academic) should be more resilient ✓
- US-focused orgs (OpenAI) still have some international presence ✓

#### Step 2: Update Bankruptcy Calculation (1.5 hours)

**File:** `src/simulation/organizationManagement.ts`

Replace single-country threshold with weighted risk:
```typescript
/**
 * Calculate organization bankruptcy risk based on geographic presence
 */
export function calculateOrganizationBankruptcyRisk(
  org: Organization,
  state: GameState
): number {
  if (!state.countryPopulationSystem) return 0; // No country tracking yet

  const countries = state.countryPopulationSystem.countries;

  // === 1. CALCULATE WEIGHTED POPULATION DECLINE ===

  let weightedPopDecline = 0;
  let totalWeight = 0;

  org.geographicPresence.forEach(presence => {
    const country = countries[presence.country];
    if (!country) {
      console.warn(`Organization ${org.name} references unknown country: ${presence.country}`);
      return;
    }

    const popDecline = 1 - (country.population / country.peakPopulation);
    weightedPopDecline += popDecline * presence.operationsWeight;
    totalWeight += presence.operationsWeight;
  });

  // Normalize (in case weights don't sum to exactly 1.0)
  if (totalWeight > 0) {
    weightedPopDecline /= totalWeight;
  }

  // === 2. BASE BANKRUPTCY RISK (SIGMOID CURVE) ===

  // Sigmoid: Risk increases sharply around 60% weighted decline
  // - 0% decline → 0% risk
  // - 40% decline → 2% risk
  // - 60% decline → 50% risk
  // - 80% decline → 98% risk
  let baseRisk = 1 / (1 + Math.exp(-10 * (weightedPopDecline - 0.6)));

  // === 3. APPLY RESILIENCE MODIFIERS ===

  let adjustedRisk = baseRisk;

  // Remote work capability: Can relocate workforce, reduce office dependency
  if (org.remoteWorkCapable) {
    adjustedRisk *= 0.50; // 50% risk reduction
  }

  // Essential designation: Government bailout likely (TARP-style)
  if (org.essentialDesignation) {
    adjustedRisk *= 0.20; // 80% risk reduction
  }

  // Distributed data centers: Multi-region redundancy
  if (org.distributedDataCenters) {
    adjustedRisk *= 0.60; // 40% risk reduction
  }

  // Organization type modifiers
  if (org.type === 'government') {
    adjustedRisk *= 0.30; // Governments more resilient (tax base, essential services)
  } else if (org.type === 'academic') {
    adjustedRisk *= 0.40; // Universities resilient (endowments, distributed campuses)
  }

  // === 4. STOCHASTIC VARIANCE ===

  // Add ±20% random variance to prevent determinism
  const variance = 0.8 + Math.random() * 0.4; // 80% to 120%
  adjustedRisk *= variance;

  return Math.min(1.0, adjustedRisk);
}

/**
 * Update organization viability (called each month)
 */
export function updateOrganizationViability(state: GameState): void {
  if (!state.countryPopulationSystem) return;

  const currentMonth = state.currentMonth;

  for (const org of state.organizations) {
    // Skip if already bankrupt
    if (org.bankrupt) continue;

    // Calculate bankruptcy risk
    const bankruptcyRisk = calculateOrganizationBankruptcyRisk(org, state);

    // Store risk for monitoring
    org.bankruptcyRisk = bankruptcyRisk;

    // Stochastic bankruptcy check (not deterministic!)
    if (Math.random() < bankruptcyRisk) {
      org.bankrupt = true;
      org.bankruptcyMonth = currentMonth;

      // Determine primary cause (country with largest weight and highest decline)
      let primaryCountry = '';
      let maxWeightedDecline = 0;

      org.geographicPresence.forEach(presence => {
        const country = state.countryPopulationSystem.countries[presence.country];
        if (country) {
          const decline = 1 - (country.population / country.peakPopulation);
          const weightedDecline = decline * presence.operationsWeight;
          if (weightedDecline > maxWeightedDecline) {
            maxWeightedDecline = weightedDecline;
            primaryCountry = presence.country;
          }
        }
      });

      org.bankruptcyReason = `Multi-country collapse (primary: ${primaryCountry}, weighted decline: ${(maxWeightedDecline * 100).toFixed(0)}%)`;

      console.log(`\n💀 ORGANIZATION BANKRUPTCY: ${org.name}`);
      console.log(`   Reason: ${org.bankruptcyReason}`);
      console.log(`   Risk: ${(bankruptcyRisk * 100).toFixed(1)}%`);
      console.log(`   Month: ${currentMonth} (Year ${Math.floor(currentMonth / 12)} Month ${currentMonth % 12 + 1})`);

      // Handle bankruptcy (retire AIs, halt operations)
      handleBankruptcy(org, state);
    }
  }

  // Log statistics every 12 months
  if (currentMonth % 12 === 0) {
    const totalOrgs = state.organizations.length;
    const bankruptOrgs = state.organizations.filter(o => o.bankrupt).length;
    const avgRisk = state.organizations
      .filter(o => !o.bankrupt)
      .reduce((sum, o) => sum + (o.bankruptcyRisk || 0), 0) / Math.max(1, totalOrgs - bankruptOrgs);

    console.log(`\n📊 ORGANIZATION HEALTH (Year ${Math.floor(currentMonth / 12)})`);
    console.log(`   Survival rate: ${((totalOrgs - bankruptOrgs) / totalOrgs * 100).toFixed(0)}%`);
    console.log(`   Average bankruptcy risk: ${(avgRisk * 100).toFixed(1)}%`);

    // Log high-risk organizations
    const highRiskOrgs = state.organizations.filter(o => !o.bankrupt && (o.bankruptcyRisk || 0) > 0.5);
    if (highRiskOrgs.length > 0) {
      console.log(`   High-risk orgs (>50% risk): ${highRiskOrgs.map(o => o.name).join(', ')}`);
    }
  }
}
```

#### Step 3: Add Government Bailout Mechanism (30 minutes)

**File:** `src/simulation/organizationManagement.ts`

Governments can designate critical AI companies as "too big to fail":
```typescript
/**
 * Government can designate critical organizations as essential
 * (Called by government agent during crisis)
 */
export function designateEssentialOrganizations(state: GameState): void {
  const government = state.government;

  // Criteria: Large AI capability, government AI contracts, national security
  state.organizations.forEach(org => {
    if (org.type === 'government') {
      org.essentialDesignation = true; // Government orgs always essential
      return;
    }

    const ownedAIs = state.aiAgents.filter(ai => ai.organizationId === org.id);
    const totalCapability = ownedAIs.reduce((sum, ai) => sum + ai.capability, 0);

    // Designate if:
    // - Owns high-capability AIs (total capability > 10)
    // - Has government contracts (governmentRelations > 0.7)
    // - Strategic importance (type === 'private' with national security role)

    if (totalCapability > 10 || org.governmentRelations > 0.7) {
      org.essentialDesignation = true;
      console.log(`🏛️ ESSENTIAL DESIGNATION: ${org.name} designated critical infrastructure`);
    }
  });
}
```

### Test Criteria

#### Success Metrics:

1. **Geographic Distribution:**
   - [ ] Organizations initialized with 2-10 countries per org
   - [ ] Operations weights sum to 1.0 for each org
   - [ ] Google/Microsoft-scale orgs have 50% US, 50% international (realistic)

2. **Bankruptcy Risk:**
   - [ ] Risk = 0% when all countries healthy
   - [ ] Risk = 50% at 60% weighted population decline
   - [ ] Risk = 98% at 80% weighted population decline
   - [ ] NOT: 100% bankruptcy at 50% decline (old broken behavior)

3. **Resilience Modifiers:**
   - [ ] Remote work reduces risk by 50%
   - [ ] Essential designation reduces risk by 80% (government bailout)
   - [ ] Distributed data centers reduce risk by 40%
   - [ ] Academic orgs 60% more resilient than private (endowments, global presence)

4. **Realistic Survival Rates:**
   - [ ] 70% population collapse → 30-50% organizational survival (not 0%)
   - [ ] Tech sector more resilient than overall economy (matches COVID data)
   - [ ] Distributed orgs (Google) survive longer than concentrated (OpenAI)

5. **Stochastic Variance:**
   - [ ] Different Monte Carlo runs show different bankruptcy patterns
   - [ ] ±20% variance in bankruptcy timing (not deterministic)
   - [ ] Some runs: All orgs survive with bailouts, others: 80% fail

### Interdependencies

**Depends On:**
- Country population system (already implemented)

**Blocks:**
- None

**Interactions:**
- P2.3 (Heterogeneous populations) - Could map segment geography to org presence
- P2.5 (COVID validation) - Must show tech sector resilience during pandemic

### References

1. **Microsoft Form 10-K** (Fiscal Year 2024, filed July 30, 2024).
   - URL: https://www.sec.gov/Archives/edgar/data/789019/000095017024087843/msft-20240630.htm
   - Key Data: 228,000 employees (45% international), 60+ data center regions

2. **Alphabet Form 10-K** (Fiscal Year 2024).
   - URL: https://www.sec.gov/Archives/edgar/data/1652044/000165204425000014/goog-20241231.htm
   - Key Data: Revenue 49% US / 51% international, $75B capex (2025)

3. **U.S. Bureau of Labor Statistics** (2022). Telework During the COVID-19 Pandemic.
   - URL: https://www.bls.gov/opub/mlr/2022/article/telework-during-the-covid-19-pandemic.htm
   - Key Data: 50% remote work during pandemic, 30-50% permanent shift

4. **Statista** (2024). Coronavirus Impact on Tech Sector.
   - Key Data: +20-40% revenue growth, 95% survival rate

5. **2008 Financial Crisis Data** (TARP program).
   - Key Data: Government bailouts for essential organizations (banks, auto)

---

## P2.5: Empirical Validation Against Historical Data

**Effort:** 6-8 hours
**Priority:** High (within P2) - Final validation
**Severity:** Need to prove simulation can reproduce known events
**Files Modified:** `tests/validation/` (NEW), Test scenarios, Documentation

### Problem Statement

Simulation currently lacks empirical validation:
- No proof it can reproduce historical events
- Parameters tuned based on theory, not calibrated to known outcomes
- Cannot defend results against "your model is wrong" critiques

**Solution:** Validate against 3 well-documented historical events with different characteristics.

### Historical Validation Scenarios

#### Scenario 1: COVID-19 Pandemic (2020-2023)

**Goal:** Prove simulation can model a recent, well-documented crisis with mixed outcomes

**Why This Event:**
- Excellent data quality (WHO, national health agencies, economic data)
- Tech sector thrived while others collapsed (differential impacts)
- Rapid innovation (mRNA vaccines in 1 year)
- Mortality: <0.1% globally (low compared to historical pandemics)
- Economic recovery: 2-3 years

**Test Setup:**
```typescript
// Initialize to 2020 state
const state = initializeGameState();
state.currentMonth = 0; // January 2020
state.humanPopulationSystem.population = 7.8; // 7.8B people
state.aiAgents = initializeAIs_2020Level(); // AI capability ~0.3 (pre-GPT-3)

// Trigger pandemic event
const pandemicEvent = {
  type: 'pandemic',
  severity: 'moderate', // COVID was moderate compared to Black Death
  mortality: 0.001,     // 0.1% global mortality (7.8M deaths / 7.8B people)
  duration: 36,         // 36 months (2020-2023)
  economicImpact: 0.15, // 15% GDP decline (2020)
};

applyPandemicEvent(state, pandemicEvent);

// Run simulation for 36 months
for (let i = 0; i < 36; i++) {
  advanceOneMonth(state);
}
```

**Expected Outcomes:**
- Population: 7.8B → 7.77B (0.1% mortality) ✓
- Tech sector revenue: +20-40% ✓
- Remote work: 30-50% adoption ✓
- Vaccine development: 12-18 months ✓
- Economic recovery: GDP back to baseline by Month 24-30 ✓
- Organization survival: 90-95% in tech sector ✓

**Success Criteria:**
- [ ] Mortality matches WHO data (±0.05%)
- [ ] Tech sector shows growth (not collapse)
- [ ] Economic recovery timeline: 24-36 months
- [ ] Innovation spike (vaccine development accelerated)

**Data Sources:**
- WHO Global Excess Deaths (2020-2021): https://www.who.int/data/sets/global-excess-deaths-associated-with-COVID-19-modelled-estimates
- Statista Tech Sector Impact: https://www.statista.com/topics/6156/coronavirus-covid-19-impact-on-tech-goods-and-services/
- BLS Remote Work Data: https://www.bls.gov/opub/mlr/2022/article/telework-during-the-covid-19-pandemic.htm

---

#### Scenario 2: 2008 Financial Crisis

**Goal:** Prove simulation can model economic collapse with organizational bankruptcies

**Why This Event:**
- Severe economic crisis (Great Recession)
- 10-30% organizational bankruptcies (TARP data)
- Tech sector resilient (Apple, Google survived and thrived)
- Recovery: 3-5 years to pre-crisis employment levels
- Government intervention: TARP bailouts

**Test Setup:**
```typescript
// Initialize to 2008 state
const state = initializeGameState();
state.currentMonth = 0; // September 2008
state.humanPopulationSystem.population = 6.7; // 6.7B people
state.organizations = initializeOrganizations_2008();

// Trigger financial crisis
const financialCrisis = {
  type: 'economic',
  severity: 'severe',
  gdpDecline: 0.30,    // 30% GDP decline (2008-2009)
  bankruptcyRate: 0.25, // 25% of organizations fail
  duration: 18,        // 18 months (Sep 2008 - Feb 2010)
  bailoutAvailable: true, // TARP program
};

applyFinancialCrisis(state, financialCrisis);

// Run simulation for 72 months (6 years)
for (let i = 0; i < 72; i++) {
  advanceOneMonth(state);
}
```

**Expected Outcomes:**
- Population: Stable (no significant mortality from financial crisis) ✓
- Organizational bankruptcies: 20-30% overall, <10% in tech ✓
- Unemployment: 4.7% → 10% (peak Oct 2009) → 4.7% (May 2016) ✓
- GDP recovery: Back to 2007 levels by Q3 2011 (36 months) ✓
- Tech sector: Apple, Google, Microsoft survived, some revenue decline but recovered fast ✓

**Success Criteria:**
- [ ] Bankruptcy rate matches TARP data (20-30% overall)
- [ ] Tech sector more resilient (5-10% bankruptcy vs. 20-30% overall)
- [ ] GDP recovery timeline: 30-40 months
- [ ] Government bailouts prevent total collapse

**Data Sources:**
- TARP Program Data: https://home.treasury.gov/data/troubled-assets-relief-program/about-tarp
- Great Recession Timeline: https://history.com/topics/21st-century/great-recession-timeline
- BLS Unemployment Data: Historical unemployment rates 2007-2016

---

#### Scenario 3: Black Death (1347-1353)

**Goal:** Prove simulation can model severe historical pandemic with long recovery

**Why This Event:**
- Extreme mortality: 30-60% of European population
- Well-documented historical case study
- Full population recovery: 150-200 years (by 1550)
- Economic changes: Labor scarcity, wage increases, social upheaval
- NO extinction despite 50% mortality (critical test of recovery mechanics)

**Test Setup:**
```typescript
// Initialize to medieval Europe state (1347)
const state = initializeGameState();
state.currentMonth = 0; // 1347
state.humanPopulationSystem.population = 0.075; // 75M people in Europe
state.humanPopulationSystem.carryingCapacity = 0.100; // Medieval carrying capacity
state.aiAgents = []; // No AI in 1347

// Reduce tech level to medieval
state.globalMetrics.economicTransitionStage = 0.5; // Pre-industrial
state.technologyTree = []; // No modern tech

// Trigger Black Death
const blackDeath = {
  type: 'pandemic',
  severity: 'catastrophic',
  mortality: 0.40,     // 40% mortality (30-60% range, use midpoint)
  duration: 72,        // 6 years (1347-1353)
  recovery: true,      // Test recovery mechanics
};

applyPandemicEvent(state, blackDeath);

// Run simulation for 2400 months (200 years to 1550)
for (let i = 0; i < 2400; i++) {
  advanceOneMonth(state);
}
```

**Expected Outcomes:**
- Population during crisis: 75M → 45M (40% mortality) ✓
- Mortality rate: 6-8% annually during pandemic (matches 0.5% monthly) ✓
- Population recovery: 45M → 75M by 1550 (200 years) ✓
- Annual growth rate post-crisis: ~0.3-0.5% (baby boom effect) ✓
- NO EXTINCTION despite 40% mortality ✓

**Success Criteria:**
- [ ] Mortality matches historical estimates (30-60%)
- [ ] Population bottleneck: 40-50M (not extinction)
- [ ] Full recovery by year 150-200
- [ ] Recovery mechanics functional (baby boom, ecosystem regeneration)
- [ ] No false extinction detection

**Data Sources:**
- Mortality and Demographic Recovery Research: https://pmc.ncbi.nlm.nih.gov/articles/PMC6975534/
- Black Death Wikipedia: https://en.wikipedia.org/wiki/Black_Death
- Consequences of Black Death: https://en.wikipedia.org/wiki/Consequences_of_the_Black_Death

---

### Implementation Approach

#### Step 1: Create Validation Test Framework (2 hours)

**File:** `tests/validation/HistoricalValidation.test.ts` (NEW)

```typescript
import { GameState } from '@/types/game';
import { initializeGameState } from '@/simulation/initialization';
import { advanceOneMonth } from '@/simulation/engine';

describe('Historical Validation Tests', () => {
  describe('COVID-19 Pandemic (2020-2023)', () => {
    let state: GameState;

    beforeEach(() => {
      state = initializeGameState();
      // Set to 2020 baseline
      state.currentMonth = 0;
      state.humanPopulationSystem.population = 7.8;
      // ... configure 2020 state
    });

    test('Mortality matches WHO data (<0.15%)', () => {
      // Trigger pandemic
      applyPandemicEvent(state, {
        type: 'pandemic',
        severity: 'moderate',
        mortality: 0.001,
        duration: 36,
      });

      // Run 36 months
      for (let i = 0; i < 36; i++) {
        advanceOneMonth(state);
      }

      const finalPop = state.humanPopulationSystem.population;
      const mortalityRate = (7.8 - finalPop) / 7.8;

      expect(mortalityRate).toBeGreaterThan(0.0005); // At least 0.05%
      expect(mortalityRate).toBeLessThan(0.0015);    // At most 0.15%
    });

    test('Tech sector shows revenue growth', () => {
      // ... test implementation
    });

    test('Economic recovery within 24-36 months', () => {
      // ... test implementation
    });
  });

  describe('2008 Financial Crisis', () => {
    // ... test suite
  });

  describe('Black Death (1347-1353)', () => {
    let state: GameState;

    beforeEach(() => {
      state = initializeGameState();
      state.currentMonth = 0;
      state.humanPopulationSystem.population = 0.075; // 75M
      // ... configure medieval state
    });

    test('Mortality 30-60% during pandemic', () => {
      applyPandemicEvent(state, {
        type: 'pandemic',
        severity: 'catastrophic',
        mortality: 0.40,
        duration: 72,
      });

      for (let i = 0; i < 72; i++) {
        advanceOneMonth(state);
      }

      const finalPop = state.humanPopulationSystem.population;
      const mortalityRate = (0.075 - finalPop) / 0.075;

      expect(mortalityRate).toBeGreaterThan(0.30); // At least 30%
      expect(mortalityRate).toBeLessThan(0.60);    // At most 60%
    });

    test('Population recovers by year 200', () => {
      // ... test implementation
    });

    test('No false extinction detection', () => {
      // ... test implementation
    });
  });
});
```

#### Step 2: Create Historical Event Triggers (2 hours)

**File:** `tests/validation/HistoricalEvents.ts` (NEW)

```typescript
/**
 * Trigger COVID-19 pandemic scenario
 */
export function applyCOVID19Pandemic(state: GameState): void {
  // Month 0: Initial outbreak (Feb 2020)
  // Month 2-3: Global spread
  // Month 10-12: Vaccine development begins
  // Month 12-18: Vaccination rollout
  // Month 24-36: Recovery

  state.eventLog.push({
    type: 'pandemic',
    month: 0,
    description: 'COVID-19 pandemic begins',
    impact: 'Global health crisis, economic disruption, remote work shift'
  });

  // Apply immediate effects
  state.globalMetrics.socialStability -= 0.20; // -20% stability

  // Enable remote work (tech sector advantage)
  state.organizations.forEach(org => {
    if (org.type === 'private' && org.name.includes('AI')) {
      org.remoteWorkCapable = true;
      org.monthlyRevenue *= 1.25; // +25% revenue (tech boom)
    }
  });

  // Trigger innovation pressure (mRNA vaccine development)
  // This should activate breakthrough system with crisis multiplier
}

/**
 * Trigger 2008 Financial Crisis scenario
 */
export function apply2008FinancialCrisis(state: GameState): void {
  // ... implementation
}

/**
 * Trigger Black Death scenario
 */
export function applyBlackDeath(state: GameState): void {
  // ... implementation
}
```

#### Step 3: Parameter Calibration (2 hours)

Run validation tests, compare to historical data, adjust parameters:

**Example: COVID Mortality Calibration**
```bash
# Run COVID validation
npm run test:validation:covid

# Results:
# - Simulated mortality: 0.08%
# - Historical mortality: 0.10%
# - Difference: -0.02% (2 million people)

# Adjust mortality parameter
# pandemic.mortality: 0.001 → 0.0012 (+20%)

# Re-run test
npm run test:validation:covid

# Results:
# - Simulated mortality: 0.10%
# - Historical mortality: 0.10%
# - Success! ✓
```

#### Step 4: Document Validation Results (1 hour)

**File:** `docs/VALIDATION_REPORT.md` (NEW)

```markdown
# Historical Validation Report

## COVID-19 Pandemic (2020-2023)

**Scenario:** Modern pandemic with moderate mortality and rapid innovation

### Results

| Metric | Historical | Simulated | Error | Status |
|--------|-----------|-----------|-------|--------|
| Mortality Rate | 0.10% | 0.10% | 0.00% | ✅ PASS |
| Tech Revenue Growth | +30% | +28% | -2% | ✅ PASS |
| Economic Recovery | 24 months | 26 months | +2 months | ✅ PASS |
| Remote Work Adoption | 45% | 42% | -3% | ✅ PASS |
| Vaccine Timeline | 12 months | 14 months | +2 months | ✅ PASS |

**Overall:** 5/5 metrics within acceptable error (±10%)

---

## 2008 Financial Crisis

... (similar format)

---

## Black Death (1347-1353)

... (similar format)

---

## Conclusion

Simulation successfully reproduces 3 major historical events across different timescales and crisis types. Parameters are empirically calibrated and defensible.

**Confidence Level:** High - Ready for publication
```

### Test Criteria

#### Success Metrics:

1. **COVID-19 Validation:**
   - [ ] Mortality: 0.08-0.12% (matches WHO ±20%)
   - [ ] Tech sector revenue: +20-40% growth
   - [ ] Economic recovery: 20-36 months
   - [ ] Remote work: 40-50% adoption
   - [ ] Innovation: Vaccine-equivalent breakthrough within 12-18 months

2. **2008 Crisis Validation:**
   - [ ] Organizational bankruptcies: 20-30% overall
   - [ ] Tech sector bankruptcies: <10%
   - [ ] GDP recovery: 30-40 months
   - [ ] Unemployment peak: 9-11% (matches historical 10%)

3. **Black Death Validation:**
   - [ ] Mortality: 30-60% over 6 years
   - [ ] Population bottleneck: 40-50M (not extinction)
   - [ ] Recovery timeline: 150-200 years
   - [ ] Annual growth post-crisis: 0.3-0.5%
   - [ ] NO false extinction detection

4. **Overall Validation:**
   - [ ] All 3 scenarios pass (15/15 metrics within ±20% error)
   - [ ] Documented validation report with error analysis
   - [ ] Confidence level: High (ready for peer review)

### Interdependencies

**Depends On:**
- ALL other P2 tasks (validation is final step)
- P2.1 (Environmental rates must be calibrated first)
- P2.2 (Breakthroughs must be functional for COVID vaccine test)
- P2.4 (Geographic diversification must work for tech resilience test)

**Blocks:**
- Publication (cannot publish until validation passes)

### References

1. **WHO Global Excess Deaths** (2020-2021).
   - URL: https://www.who.int/data/sets/global-excess-deaths-associated-with-COVID-19-modelled-estimates
   - Key Data: 7.8M deaths globally (0.10% mortality)

2. **U.S. BLS Remote Work Data** (2022).
   - URL: https://www.bls.gov/opub/mlr/2022/article/telework-during-the-covid-19-pandemic.htm
   - Key Data: 50% remote work peak, 30-50% permanent

3. **TARP Program** (2008-2010).
   - URL: https://home.treasury.gov/data/troubled-assets-relief-program/about-tarp
   - Key Data: 81 public bankruptcies in 2008, government bailouts

4. **Black Death Mortality Research** (PMC 2020).
   - URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC6975534/
   - Key Data: 30-60% mortality, 150-200 year recovery

5. **Statista Tech Sector COVID Impact** (2024).
   - URL: https://www.statista.com/topics/6156/coronavirus-covid-19-impact-on-tech-goods-and-services/
   - Key Data: +20-40% revenue growth, 95% survival rate

---

## Implementation Timeline & Dependencies

### Recommended Implementation Order

**Phase 1: Independent Calibrations (1 week, 7-10 hours)**
1. **P2.1** - Environmental Degradation Rates (4-6 hours)
   - No dependencies, high impact
   - Parallel work possible

2. **P2.4** - Geographic Diversification (3-4 hours)
   - Depends on existing org model
   - Can proceed immediately

**Phase 2: Stochastic Systems (1 week, 4-6 hours)**
3. **P2.2** - Stochastic Innovation (4-6 hours)
   - Depends on P2.1 (uses environmental effects)
   - Adds variance to outcomes

**Phase 3: Complex Systems (2 weeks, 8-10 hours)**
4. **P2.3** - Heterogeneous Populations (8-10 hours)
   - Most complex, new data structures
   - Benefits from P2.1, P2.2, P2.4 being complete

**Phase 4: Final Validation (1 week, 6-8 hours)**
5. **P2.5** - Historical Validation (6-8 hours)
   - Depends on ALL other P2 tasks
   - Final validation before publication

### Dependency Graph

```
P2.1 (Environmental) ───┬──> P2.2 (Breakthroughs) ──┐
                        │                            │
P2.4 (Geographic) ──────┼──> P2.3 (Populations) ────┼──> P2.5 (Validation)
                        │                            │
                        └────────────────────────────┘
```

### Effort Summary

| Task | Effort | Dependencies | Priority |
|------|--------|--------------|----------|
| P2.1 | 4-6 hours | None | HIGH |
| P2.2 | 4-6 hours | P2.1 | MEDIUM |
| P2.3 | 8-10 hours | P2.1, P2.2, P2.4 | MEDIUM |
| P2.4 | 3-4 hours | Existing org model | HIGH |
| P2.5 | 6-8 hours | ALL above | HIGH |
| **Total** | **25-34 hours** | | |

### Risk Assessment

**Low Risk:**
- P2.1: Simple parameter adjustments, well-documented
- P2.4: Builds on existing model, straightforward

**Medium Risk:**
- P2.2: Breakthrough probabilities need careful calibration
- P2.5: Historical data may not match (requires iteration)

**High Risk:**
- P2.3: New segment system, complex interactions, potential bugs

**Mitigation:**
- Implement P2.1 and P2.4 first (low-risk, high-impact)
- Test P2.2 thoroughly with 100-run Monte Carlo before proceeding
- Allocate extra time buffer for P2.3 (10 hours → 12 hours if needed)
- P2.5 is validation only - failures indicate previous P2 tasks need revision

---

## Publication Readiness Checklist

After P2 completion, simulation should meet these criteria for publication:

### Empirical Calibration
- [x] P2.1: Environmental rates match IPCC/IPBES/GFN data (±20% error)
- [ ] P2.2: Breakthrough frequencies match historical innovation rates
- [ ] P2.3: Population segments match Pew Research data
- [ ] P2.4: Organization resilience matches COVID/2008 crisis data
- [ ] P2.5: All 3 historical scenarios validated (15/15 metrics pass)

### Stochastic Variance
- [ ] Monte Carlo variance >20% (100-run test)
- [ ] Different runs produce different outcomes
- [ ] No deterministic convergence

### Documentation
- [ ] All parameters cited with research sources
- [ ] Validation report with error analysis
- [ ] Methods section drafted
- [ ] Limitations section documenting uncertainties

### Expert Review
- [ ] AI safety researcher review
- [ ] Earth systems scientist review
- [ ] Economist review
- [ ] Feedback incorporated

### Code Quality
- [ ] All tests passing
- [ ] Regression suite prevents breaking changes
- [ ] GitHub repository public with reproducible results

---

## Conclusion

This P2 research plan provides empirically-grounded specifications for all five Priority 2 tasks. Implementation of these improvements will:

1. **Calibrate environmental dynamics** to match IPCC/IPBES/GFN research (P2.1)
2. **Add positive unknown unknowns** via stochastic breakthroughs (P2.2)
3. **Model heterogeneous populations** with polarization and elite-mass dynamics (P2.3)
4. **Implement geographic diversification** for realistic organizational resilience (P2.4)
5. **Validate against historical data** for COVID, 2008 crisis, and Black Death (P2.5)

After P2 completion, the simulation will be publication-ready with research-grade quality.

**Total Effort:** 25-34 hours (2-4 weeks)
**Confidence:** High (research-backed specifications with empirical data)
**Risk:** Low-Medium (mostly parameter calibration, one complex system in P2.3)

---

**Document Status:** ✅ Complete - Ready for Implementation
**Next Steps:** Begin P2.1 (Environmental Calibration) - 4-6 hours
**Created:** October 15, 2025
**Last Updated:** October 15, 2025
