# Implementation Plan: Novel Entities Irreversibility Framework

**Date:** 2025-11-16
**Status:** Phase 2 - Implementation Planning
**Research:** `research/novel_entities_irreversibility_20251116.md` (Grade: B+)
**Validation:** `reviews/novel_entities_irreversibility_critique_20251116.md` (CONDITIONAL PASS ✅⚠️)

## Executive Summary

**Objective:** Fix 0% Novel Entities effectiveness by implementing:
1. Energy-constrained cleanup model
2. Slow decay (practically irreversible) stock model
3. Rebound effect mechanics with uncertainty
4. 3 prevention technologies (TIER 0-1)

**Expected Impact:** 0% → 25-55% effectiveness (prevention-dominated)

**Critical Corrections Applied:**
- CRITICAL-1: Flag energy trap as theoretical bound (awaiting empirical data)
- CRITICAL-2: Separate concentration gaps by contamination type
- CRITICAL-3: Add uncertainty range [0.05, 0.50] to rebound coefficient

---

## Phase 2A: Critical Corrections (MUST COMPLETE FIRST)

### CRITICAL-1 FIX: Energy Trap Documentation

**Issue:** "4-40% of global energy" lacks primary source for contamination mass.

**Resolution:**
```typescript
// In technology definitions, add explicit uncertainty flag
{
  energyRequirement: 75, // GJ/ton (median of EPA range 50-100)
  energyConstraintNote: "THEORETICAL UPPER BOUND: Assumes 1-10M tons accumulated PFAS. Awaiting peer-reviewed global contamination inventory. IEA 2024 baseline: ~600 EJ/year. 4-40% range assumes 24-240 EJ for cleanup.",
  uncertaintyLevel: "HIGH" // Empirical validation needed
}
```

**Code Comment Required:**
```typescript
// ⚠️ RESEARCH GAP: Global PFAS contamination mass estimate needed
// Current calculation: 1-10M tons * 75 GJ/ton = 75-750 EJ
// As % of global energy (600 EJ/year): 12-125% (multi-year project)
// Conservative bound: Assume 10-year project → 1.2-12.5% annual energy
```

### CRITICAL-2 FIX: Concentration Gap by Type

**Issue:** "6-9 orders of magnitude" conflates rainwater (pg/L) with groundwater (ng/L-μg/L).

**Resolution:**
```typescript
const CONTAMINATION_LEVELS = {
  rainwater: {
    typical: 55e-12, // kg/L (55 pg/L, Tibetan Plateau minimum)
    gap: 1.8e10, // 1000 mg/L / 55 pg/L = 9 orders of magnitude
    cleanupFeasibility: "IMPOSSIBLE" // Too dilute, atmospheric transport
  },
  surfaceWater: {
    typical: 100e-9, // kg/L (100 ng/L median)
    gap: 1e7, // 7 orders of magnitude
    cleanupFeasibility: "VERY_LOW" // Energy prohibitive
  },
  groundwater: {
    typical: 500e-9, // kg/L (500 ng/L median, range 10-2305 ng/L)
    high: 2305e-9, // kg/L (upper range)
    gap: 2e6, // 6 orders of magnitude (median), 4.3e5 (high end)
    cleanupFeasibility: "LOW" // Expensive but technically possible
  },
  concentratedWaste: {
    typical: 1.0, // kg/L (1000 mg/L, tech demonstration level)
    gap: 1, // No gap
    cleanupFeasibility: "HIGH" // Demonstrated >99.9% DRE
  }
};
```

### CRITICAL-3 FIX: Rebound Coefficient Uncertainty

**Issue:** 10% rebound coefficient unjustified.

**Resolution:**
```typescript
const REBOUND_EFFECTS = {
  enabled: true,
  coefficient: 0.15, // Mid-range estimate (10-20% median)
  uncertaintyRange: [0.05, 0.50], // Wide range for sensitivity testing
  empiricalBasis: "WEAK", // AI e-waste analogy only, no PFAS-specific data
  note: "Jevons paradox observed in AI e-waste. PFAS-specific elasticity unknown. Use Monte Carlo over uncertainty range."
};

// In simulation phase:
function applyReboundEffect(cleanupRate: number, rng: () => number): number {
  if (!REBOUND_EFFECTS.enabled) return 0;

  // Sample from uncertainty range
  const coefficient = REBOUND_EFFECTS.uncertaintyRange[0] +
    rng() * (REBOUND_EFFECTS.uncertaintyRange[1] - REBOUND_EFFECTS.uncertaintyRange[0]);

  return cleanupRate * coefficient; // Production increase
}
```

---

## Phase 2B: Core Implementation

### 1. Energy-Constrained Cleanup Model

**File:** `src/simulation/phases/planetaryBoundaries/applyBreakthroughTechEffects.ts` (or new file)

**Additions to GameState:**
```typescript
// In src/types/game.ts
export interface BreakthroughTechnology {
  // ... existing fields ...

  // NEW: Energy constraint properties
  energyRequirement?: number; // GJ/ton of contaminant removed
  minimumConcentration?: number; // mg/L - tech only works above this
  concentrationType?: 'rainwater' | 'surfaceWater' | 'groundwater' | 'concentratedWaste';

  // NEW: Rebound effect properties
  reboundCoefficient?: number; // Production increase per unit cleanup
  reboundUncertaintyRange?: [number, number]; // Min/max for Monte Carlo
  avoidsRebound?: boolean; // True for production bans
}

export interface PlanetaryBoundary {
  // ... existing fields ...

  // NEW: Irreversibility properties
  practicallyIrreversible?: boolean; // Very slow decay (centuries)
  decayHalfLife?: number; // years (for slow decay model)
  atmosphericTransport?: boolean; // Local cleanup futile
}
```

**Implementation Function:**
```typescript
function applyEnergyConstrainedCleanup(
  state: GameState,
  tech: BreakthroughTechnology,
  boundary: PlanetaryBoundary,
  rng: () => number
): number {
  // CRITICAL: Validate RNG (CRITICAL-3 regression fix from Nov 7)
  assertFinite(rng(), {
    location: 'applyEnergyConstrainedCleanup',
    valueName: 'rng',
    month: state.currentMonth
  });

  // 1. Check if tech has energy requirement
  if (!tech.energyRequirement || !tech.minimumConcentration) {
    // Legacy cleanup tech without energy model
    return tech.planetaryBoundaryEffects?.novelEntitiesReduction ?? 0;
  }

  // 2. Calculate concentration factor
  const contaminationLevel = CONTAMINATION_LEVELS[tech.concentrationType ?? 'groundwater'];
  const concentrationGap = tech.minimumConcentration / (contaminationLevel.typical * 1e6); // Convert kg/L to mg/L
  const concentrationFactor = Math.pow(1 / concentrationGap, 0.5); // Power law scaling

  // 3. Calculate energy factor
  const renewableSurplus = state.energySystem.renewableCapacity - state.energySystem.demand;
  const requiredEnergy = boundary.value * tech.energyRequirement; // EJ (boundary value in arbitrary units, scale appropriately)
  const energyFactor = Math.min(1, renewableSurplus / requiredEnergy);

  // 4. Base effectiveness
  const baseEffectiveness = tech.planetaryBoundaryEffects?.novelEntitiesReduction ?? 0;

  // 5. Apply constraints
  const constrainedEffectiveness = baseEffectiveness * concentrationFactor * energyFactor;

  // 6. Apply rebound effect (if applicable)
  let rebound = 0;
  if (tech.reboundCoefficient !== undefined && !tech.avoidsRebound) {
    const coefficient = tech.reboundUncertaintyRange
      ? tech.reboundUncertaintyRange[0] + rng() * (tech.reboundUncertaintyRange[1] - tech.reboundUncertaintyRange[0])
      : tech.reboundCoefficient;

    rebound = constrainedEffectiveness * coefficient;
  }

  const netEffectiveness = constrainedEffectiveness - rebound;

  // 7. Logging
  console.log(`  🧪 ${tech.name}:`);
  console.log(`    Concentration Factor: ${(concentrationFactor * 100).toFixed(2)}% (${tech.concentrationType})`);
  console.log(`    Energy Factor: ${(energyFactor * 100).toFixed(2)}% (${renewableSurplus.toFixed(1)} / ${requiredEnergy.toFixed(1)} EJ)`);
  console.log(`    Base → Constrained: ${(baseEffectiveness * 100).toFixed(1)}% → ${(constrainedEffectiveness * 100).toFixed(2)}%`);
  if (rebound > 0) {
    console.log(`    ⚠️ Rebound Effect: -${(rebound * 100).toFixed(2)}% (coefficient: ${coefficient.toFixed(2)})`);
  }
  console.log(`    Net Effectiveness: ${(netEffectiveness * 100).toFixed(2)}%`);

  return netEffectiveness;
}
```

### 2. Slow Decay (Practically Irreversible) Model

**File:** `src/simulation/phases/planetaryBoundaries/updateNovelEntitiesBoundary.ts`

**Implementation:**
```typescript
function updateNovelEntitiesBoundary(state: GameState, rng: () => number): void {
  const boundary = state.planetaryBoundaries.novelEntities;

  // 1. Production flow (increases contamination)
  const productionRate = calculateNovelEntitiesProduction(state);

  // 2. Cleanup effectiveness (sum of all deployed techs)
  let totalCleanup = 0;
  for (const tech of state.breakthroughTechnologies) {
    if (tech.deployed && tech.planetaryBoundaryEffects?.novelEntitiesReduction) {
      totalCleanup += applyEnergyConstrainedCleanup(state, tech, boundary, rng);
    }
  }

  // 3. Natural decay (VERY slow for practically irreversible)
  let decayRate = 0;
  if (boundary.practicallyIrreversible && boundary.decayHalfLife) {
    // Exponential decay: dN/dt = -λN, where λ = ln(2) / half-life
    const lambda = Math.log(2) / boundary.decayHalfLife;
    decayRate = boundary.value * lambda * (1/12); // Per month
  }

  // 4. Atmospheric redeposition (counteracts local cleanup)
  let redepositionRate = 0;
  if (boundary.atmosphericTransport) {
    // 99% of cleanup rains back down (Cousins et al. 2022 - global cycling)
    redepositionRate = totalCleanup * 0.99;
    totalCleanup *= 0.01; // Only 1% stays removed
  }

  // 5. Update boundary value
  const previousValue = boundary.value;
  boundary.value += productionRate - totalCleanup - decayRate + redepositionRate;
  boundary.value = Math.max(0, Math.min(1, boundary.value)); // Clamp [0, 1]

  // 6. Logging
  console.log(`\n🌍 Novel Entities Boundary Update:`);
  console.log(`  Production: +${(productionRate * 100).toFixed(2)}%`);
  console.log(`  Cleanup (gross): -${(totalCleanup * 0.01 * 100).toFixed(4)}%`); // Before redeposition
  if (redepositionRate > 0) {
    console.log(`  ☔ Atmospheric Redeposition: +${(redepositionRate * 100).toFixed(4)}% (99% rains back)`);
    console.log(`  Cleanup (net): -${(totalCleanup * 100).toFixed(4)}%`); // After redeposition
  }
  console.log(`  Natural Decay: -${(decayRate * 100).toFixed(4)}% (half-life: ${boundary.decayHalfLife} years)`);
  console.log(`  Net Change: ${previousValue.toFixed(4)} → ${boundary.value.toFixed(4)} (Δ${((boundary.value - previousValue) * 100).toFixed(4)}%)`);
}
```

### 3. Add Prevention Technologies to Tech Tree

**File:** `src/data/breakthroughTechnologies.ts`

**Technology 1: Global PFAS Production Ban (TIER 0)**
```typescript
{
  id: 'global-pfas-production-ban',
  name: 'Global PFAS Production Ban',
  tier: 0,
  category: 'governance',
  description: 'Montreal Protocol-style international treaty banning production of per- and polyfluoroalkyl substances (PFAS). Proven most effective approach from CFC phase-out (98% reduction in 10-20 years).',
  requiredCapabilities: {
    governance: 85, // Requires strong international cooperation
    research: 75    // Substitute materials needed
  },
  dependencies: ['chemical-substitution-acceleration'], // Need alternatives before ban
  cost: 500,
  researchCost: 200,
  timeToImplement: 15 * 12, // 15 years (median of 10-20 range, months)
  uncertaintyRange: [10 * 12, 30 * 12], // May take longer than CFCs (12,000+ chemicals vs. 8)

  planetaryBoundaryEffects: {
    novelEntitiesReduction: 0.98 // Production flow reduction (Montreal Protocol empirical)
  },

  // Energy constraint properties (N/A for prevention)
  avoidsRebound: true, // Production ban eliminates moral hazard

  climateCobenefits: {
    emissionsReduction: 2.5 // Gt CO₂-eq/year (avoid GHG-intensive PFAS production)
  },

  flavor: '🏛️🚫 "The Montreal Protocol proved humanity can phase out persistent pollutants. PFAS is next." - Cousins et al. 2022'
},
```

**Technology 2: Plastic Production Phase-Out 80% (TIER 1)**
```typescript
{
  id: 'plastic-production-phaseout',
  name: 'Plastic Production Phase-Out 80%',
  tier: 1,
  category: 'environmental',
  description: 'Circular economy transition: 80% reduction in virgin plastic production, shift to bio-based alternatives (PHA, PLA) and recycling. Based on lead/asbestos phase-out timelines (30-40 years).',
  requiredCapabilities: {
    governance: 75,
    research: 80,
    physical: 70 // Material science for substitutes
  },
  dependencies: ['chemical-substitution-acceleration'],
  cost: 800,
  researchCost: 300,
  timeToImplement: 25 * 12, // 25 years (circular economy transition, months)
  uncertaintyRange: [20 * 12, 40 * 12], // Historical phase-out range

  planetaryBoundaryEffects: {
    novelEntitiesReduction: 0.40 // 80% of plastic's 50% contribution to novel entities
  },

  avoidsRebound: true, // Regulatory phase-out

  economicEffects: {
    industrialTransitionCost: 1200 // Billion USD over 25 years
  },

  flavor: '♻️🌱 "Virgin plastic production is the 20th century. Circular bio-economy is the 21st."'
},
```

**Technology 3: Chemical Substitution Acceleration (TIER 1)**
```typescript
{
  id: 'chemical-substitution-acceleration',
  name: 'Chemical Substitution Acceleration',
  tier: 1,
  category: 'research',
  description: 'Green chemistry R&D + regulatory push to replace persistent chemicals with biodegradable alternatives. 5-15 years per chemical class (e.g., PFAS → biodegradable surfactants).',
  requiredCapabilities: {
    research: 80,
    governance: 70
  },
  cost: 400,
  researchCost: 250,
  timeToImplement: 10 * 12, // 10 years per class (median, months)

  planetaryBoundaryEffects: {
    novelEntitiesReduction: 0.30 // Enable other prevention tech (dependency)
  },

  avoidsRebound: true,

  flavor: '🔬🌿 "Green chemistry: Design chemicals that degrade, not accumulate."'
},
```

---

## Phase 2C: Testing & Validation

### Monte Carlo Validation (N≥10)

**Command:**
```bash
npx tsx scripts/monteCarloSimulation.ts --runs 10 --seed 12345 > logs/mc_novel_entities_20251116.log 2>&1 &
```

**Success Criteria:**
1. **No NaN errors:** All phases complete without invalid values
2. **Novel Entities improvement:** Effectiveness 0% → 25-55% across runs
3. **Coefficient of Variation (CV) < 0.01%:** Deterministic with same seed
4. **Energy constraint visible:** Cleanup effectiveness scales with renewable surplus
5. **Prevention dominates:** Production ban techs contribute 20-40%, cleanup 5-15%

### God Mode Test (Single Run)

**Command:**
```bash
npx tsx scripts/godModeValidation.ts --deploy-all-tech --log-verbose > logs/god_mode_novel_entities_20251116.log 2>&1
```

**Expected Output:**
```
🌍 Planetary Boundaries (Month 600):
  Novel Entities: 0.25-0.45 (YELLOW, previously 0.85+ RED)

  Tech Contributions:
    - Global PFAS Production Ban: -0.35 (35% reduction, no rebound)
    - Plastic Phase-Out 80%: -0.15 (15% reduction)
    - Chemical Substitution: -0.10 (10% reduction via dependencies)
    - PFAS Remediation Tech: -0.02 (2% after energy/concentration/rebound constraints)
    - Microplastic Capture: -0.01 (1% after constraints)

  Net Effectiveness: 63% (previous: 0%)
```

---

## Phase 3: Architecture Review Preparation

**Pre-Review Checklist:**
- [ ] All assertion utilities used (no silent fallbacks)
- [ ] RNG required (not optional)
- [ ] No circular dependencies (read → transform → write)
- [ ] Logging uses consistent emoji conventions
- [ ] Type safety (strict TypeScript)
- [ ] Comments explain "why" not "what"
- [ ] Energy constraint tested across renewable surplus range [0, 100 EJ]
- [ ] Rebound effect toggled on/off (verify doesn't break simulation)

**Expected CRITICAL Issues:**
- None (preventive measures in place)

**Expected HIGH Issues:**
- Possible: O(n) complexity for tech loop (acceptable for n≈100 techs)

---

## Phase 4: Documentation & Archival

**Wiki Updates:**
- Add "Energy-Constrained Cleanup" section to `docs/wiki/README.md`
- Update "Novel Entities" boundary documentation
- Add "Prevention vs. Cleanup Effectiveness" comparison table

**Roadmap:**
- Move `plans/novel_entities_irreversibility_implementation_plan.md` → `plans/completed/`
- Update `plans/MASTER_IMPLEMENTATION_ROADMAP.md` Progress Summary
- Mark TIER 1 CRITICAL as COMPLETED

---

## Risk Assessment

**HIGH RISK:**
- Rebound coefficient uncertainty may dominate results → **MITIGATION:** Wide MC range, sensitivity testing

**MEDIUM RISK:**
- Energy trap calculation may be too pessimistic → **MITIGATION:** Flagged as theoretical, awaiting empirical data

**LOW RISK:**
- Implementation bugs (NaN, type errors) → **MITIGATION:** Assertion utilities, strict TypeScript, MC validation

---

## Timeline Estimate

- **Phase 2A (Corrections):** 30 min
- **Phase 2B (Implementation):** 2-3 hours
- **Phase 2C (Testing):** 1 hour (MC runs in background)
- **Phase 3 (Architecture Review):** 1 hour
- **Phase 4 (Documentation):** 30 min

**Total:** 4-6 hours

---

## Success Criteria

✅ **Quality Gate 1:** Research validation PASSED (B+ grade)
✅ **Critical Corrections:** All 3 CRITICAL issues addressed
🔲 **Quality Gate 2:** Architecture review MUST address CRITICAL/HIGH issues
🔲 **Monte Carlo:** N≥10, CV < 0.01%, no NaN
🔲 **God Mode:** Novel Entities 0% → 25-55% effectiveness
🔲 **Documentation:** Wiki updated, plan archived

**Final Deliverable:** Simulation correctly models energy-constrained cleanup with prevention technologies dominating effectiveness.
