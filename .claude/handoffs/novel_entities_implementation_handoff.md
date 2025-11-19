# Novel Entities Implementation Handoff

**From:** orchestrator-1
**To:** simulation-maintainer (Roy)
**Date:** November 13, 2025
**Priority:** CRITICAL (blocks utopia pathway validation)

---

## Status

**Quality Gate 1:** ✅ PASSED (Grade B+)
**Design:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/plans/novel_entities_model_redesign_20251113.md` (276 lines)
**Validation:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/reviews/novel_entities_research_critique_20251113.md` (530+ lines)
**Research:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/novel_entities_zero_effectiveness_20251113.md` (16 peer-reviewed sources)

---

## Implementation Task

God mode revealed 0% Novel Entities effectiveness despite 7 pollution technologies deployed. Research validated this is **NOT a bug** - it's thermodynamically accurate for planetary-scale remediation without production regulation.

**Your job:** Implement 4-phase redesign to model prevention vs remediation accurately.

---

## Critical Guidance from Validation (Sylvia's Conditions)

### MANDATORY Requirements

1. **90% Irreversible Fraction = MODEL ASSUMPTION**
   - Mark clearly in code: `// DERIVED ASSUMPTION (not measured in literature)`
   - Kane 2022 shows "hundreds of years" recovery, Cousins 2022 shows global distribution
   - But NO paper directly measures reversible vs irreversible fraction
   - Accept 90% as defensible base case, but document uncertainty

2. **Differentiate Time Lags**
   - ❌ DON'T use universal 30-year timeLag
   - ✅ Prevention tech (bans): 10-20 years (Montreal Protocol did 12)
   - ✅ Remediation tech (infrastructure): 30-50 years (massive scale-up)

3. **Document Derived vs Verified Parameters**
   - VERIFIED: Ling 2024 costs ($20-7,000 trillion/year), Cousins 2022 global distribution
   - CALCULATED: Montreal Protocol 10:1 prevention:remediation ratio (inferred from data)
   - DERIVED: 90% irreversible, 30% rebound, 0.001 concentration multiplier

### STRONGLY RECOMMENDED

4. **Conservative Parameter Choices**
   - 30% rebound may be OPTIMISTIC (theory suggests 20-80% range)
   - PFAS ban 45% effectiveness (could be 60%, chose conservative)
   - Concentration multiplier 0.001 (may still be optimistic per Newell 2025)

5. **Sensitivity Testing Requirements**
   - Monte Carlo validation MUST test:
     - irreversibleFraction: [0.70, 0.90, 0.95]
     - reboundFactor: [0.5, 0.7, 0.9]
     - pfasBanEffectiveness: [0.45, 0.60]
   - Priya will handle this in Phase 4

---

## Implementation Phases

### Phase 1: Add Prevention Technologies (3-4 hours)

**Files to modify:**
- `src/data/technologyTree.ts`
- `src/simulation/engine/phases/TechnologyUnlockPhase.ts` (if regulatory tech needs special handling)

**Add 3 new technologies:**

```typescript
// TIER 0 - Crisis Response
{
  id: "pfas_production_ban",
  name: "Global PFAS Production Ban",
  tier: 0,
  type: "regulatory",
  timeline: "10-20 years", // Montreal Protocol: 12 years
  effectiveness: {
    novelEntities: 0.45, // 45% prevention (Montreal ratio: 90-95% vs 5-10% cleanup)
    // RESEARCH: Dodds et al. 2024 (Montreal Protocol), Ling et al. 2024 (PFAS costs)
  },
  timeLag: 15 * 12, // 15 years to full deployment (Montreal Protocol analog)
  irreversibleFraction: 0.90, // MODEL ASSUMPTION - see research critique
  dependencies: ["global_governance_coordination"], // Requires international cooperation
  analog: "Montreal Protocol CFC phase-out (1987-1999, 12 years)"
},

{
  id: "plastic_production_phaseout",
  name: "Plastic Production Phase-Out 80%",
  tier: 1,
  type: "regulatory_industrial",
  timeline: "20-30 years",
  effectiveness: {
    novelEntities: 0.35, // 35% prevention via virgin plastic reduction
    microplasticFlow: 0.80, // 80% flow reduction
  },
  timeLag: 25 * 12, // 25 years (longer than PFAS ban, requires substitutes)
  dependencies: ["circular_economy_deployment", "bio_alternatives"],
  analog: "Lead/asbestos phase-outs"
},

{
  id: "chemical_substitution_acceleration",
  name: "Chemical Substitution Acceleration",
  tier: 1,
  type: "rnd_regulatory",
  timeline: "5-15 years per class",
  effectiveness: {
    novelEntities: 0.20, // 20% via persistent chemical replacement
    newChemicalFlow: 0.60, // 60% flow reduction for new chemicals
  },
  timeLag: 10 * 12, // 10 years (faster than bans, case-by-case)
  dependencies: ["green_chemistry_rnd"],
}
```

**Unit tests:** `tests/unit/technology-prevention.test.ts`

---

### Phase 2: Update Remediation Effectiveness (4-5 hours)

**Files to modify:**
- `src/simulation/engine/phases/PlanetaryBoundariesPhase.ts`
- Create new utility: `src/simulation/utils/novelEntitiesEffectiveness.ts`

**Implement gating logic:**

```typescript
// src/simulation/utils/novelEntitiesEffectiveness.ts

import { assertFinite, assertProbability } from '@/simulation/utils/assertions';

export function calculateNovelEntitiesEffectiveness(
  tech: Technology,
  state: GameState,
  rng: () => number
): number {
  // Fail-loudly RNG validation (CRITICAL-3 regression fix)
  if (!rng || typeof rng !== 'function') {
    throw new Error('❌ CRITICAL: RNG required for deterministic simulation');
  }

  const baseEffectiveness = tech.effectiveness.novelEntities || 0.0;

  // 1. REGULATION GATING (CRITICAL)
  // Without production controls, cleanup is futile (refills as fast as you clean)
  const pfasBanDeployed = state.breakthroughs.some(
    b => b.id === "pfas_production_ban" && b.deployed
  );
  const plasticPhaseoutDeployed = state.breakthroughs.some(
    b => b.id === "plastic_production_phaseout" && b.deployed
  );
  const substitutionDeployed = state.breakthroughs.some(
    b => b.id === "chemical_substitution_acceleration" && b.deployed
  );

  // Prevention:Remediation = 10:1 to 20:1 (Montreal Protocol analog)
  // RESEARCH: Calculated from Dodds et al. 2024 (production ban 90-95%, bank destruction 5-10%)
  const regulationLevel = (
    (pfasBanDeployed ? 0.5 : 0.0) +        // 50% weight (dominant)
    (plasticPhaseoutDeployed ? 0.3 : 0.0) + // 30% weight
    (substitutionDeployed ? 0.2 : 0.0)      // 20% weight
  );

  // Minimum 1% effectiveness = point sources only (concentrated wastewater, industrial sites)
  // RESEARCH: Ling et al. 2024 - $20-7,000 trillion/year for steady-state cleanup
  const regulationMultiplier = Math.max(0.01, regulationLevel);

  // 2. ENERGY CONSTRAINT (OPTIONAL - can drop if energy values unavailable)
  // Thermodynamic trap: Cleanup requires massive energy
  // RESEARCH: Li et al. 2024 (5-7 kWh/m³), Ling et al. 2024 (thermal destruction 850-1200°C)
  const renewableSurplus = state.energySystem?.renewableSurplus ?? 0; // TWh/year
  const energyRequired = tech.energyRequirement ?? 0; // TWh/year
  const energyMultiplier = energyRequired > 0
    ? Math.min(1.0, renewableSurplus / energyRequired)
    : 1.0; // Skip if energy data not set

  // 3. CONCENTRATION FACTOR (CRITICAL)
  // Lab scale (mg/L) vs environmental scale (pg/L to ng/L = 10^6-10^9× dilution)
  // RESEARCH: Li et al. 2024 (12-47× cost scaling for dilute streams)
  // RESEARCH: Newell et al. 2025 ("sub-nanogram per litre cost-effectiveness hinders up-scalability")
  const concentrationMultiplier = tech.worksOnDiluteStreams ? 0.001 : 1.0;
  // 0.1% effectiveness = CONSERVATIVE (may be optimistic per validation)

  // 4. TIME LAG (CRITICAL - DIFFERENTIATED)
  // VALIDATION REQUIREMENT: Prevention (10-20yr) vs Remediation (30-50yr)
  const monthsSinceDeployment = state.currentMonth - (tech.deployedAt ?? state.currentMonth);
  const timeLagMonths = tech.timeLag ?? (30 * 12); // Default 30 years if not specified
  const timeLagFactor = Math.min(1.0, monthsSinceDeployment / timeLagMonths);

  // 5. REBOUND EFFECTS (Jevons Paradox)
  // Cleanup success → increased production (moral hazard)
  // RESEARCH: UNEP 2024 (waste +81% despite tech), Sorrell et al. 2025 (AI hardware rebound)
  // DERIVED: 30% offset (conservative - theory suggests 20-80% range)
  const reboundFactor = tech.triggersRebound ? 0.7 : 1.0; // 30% offset by induced production

  // Final effectiveness calculation
  const finalEffectiveness = baseEffectiveness *
    regulationMultiplier *
    energyMultiplier *
    concentrationMultiplier *
    timeLagFactor *
    reboundFactor;

  // Assertions (fail-loudly, no silent fallbacks)
  return assertProbability(finalEffectiveness, {
    location: 'calculateNovelEntitiesEffectiveness',
    valueName: 'finalEffectiveness',
    month: state.currentMonth,
    additionalInfo: {
      tech: tech.id,
      baseEffectiveness,
      regulationMultiplier,
      energyMultiplier,
      concentrationMultiplier,
      timeLagFactor,
      reboundFactor
    }
  });
}
```

**Integration tests:** `tests/integration/novel-entities-gated.test.ts`

---

### Phase 3: Add Irreversibility Floor (2-3 hours)

**Files to modify:**
- `src/simulation/engine/phases/PlanetaryBoundariesPhase.ts`
- `src/types/game.ts` (add `novelEntitiesPeak` field if not exists)

**Implement asymptotic approach:**

```typescript
// In PlanetaryBoundariesPhase.ts - updateNovelEntities function

function updateNovelEntities(state: GameState, rng: () => number): void {
  // ... existing accumulation logic (add new contamination) ...

  // Track peak contamination for irreversibility floor
  if (!state.planetaryBoundaries.novelEntitiesPeak) {
    state.planetaryBoundaries.novelEntitiesPeak = state.planetaryBoundaries.novelEntities;
  }
  state.planetaryBoundaries.novelEntitiesPeak = Math.max(
    state.planetaryBoundaries.novelEntitiesPeak,
    state.planetaryBoundaries.novelEntities
  );

  // Calculate cleanup from deployed technologies
  let totalCleanup = 0;
  for (const tech of getDeployedNovelEntitiesTech(state)) {
    totalCleanup += calculateNovelEntitiesEffectiveness(tech, state, rng);
  }

  // IRREVERSIBILITY FLOOR
  // DERIVED ASSUMPTION (not measured): 90% of contamination is irreversible
  // RESEARCH BASIS: Cousins 2022 (global atmospheric distribution), Kane 2022 (centuries recovery)
  // VALIDATION: Sylvia Grade B+ - defensible but requires sensitivity testing
  const irreversibleFraction = 0.90; // MODEL ASSUMPTION - not directly measured in literature

  // Asymptotic approach: can only clean reversible fraction
  const irreversibleFloor = state.planetaryBoundaries.novelEntitiesPeak * irreversibleFraction;

  // Current level (after adding new contamination)
  const currentLevel = state.planetaryBoundaries.novelEntities;

  // Apply cleanup (but can't go below irreversible floor)
  const newLevel = Math.max(
    irreversibleFloor,
    currentLevel - totalCleanup + newContamination
  );

  state.planetaryBoundaries.novelEntities = assertFinite(newLevel, {
    location: 'updateNovelEntities',
    valueName: 'novelEntities',
    month: state.currentMonth,
    additionalInfo: {
      currentLevel,
      totalCleanup,
      newContamination,
      irreversibleFloor,
      peak: state.planetaryBoundaries.novelEntitiesPeak
    }
  });
}
```

**Add to GameState interface:**

```typescript
// In src/types/game.ts - PlanetaryBoundaries interface
export interface PlanetaryBoundaries {
  // ... existing fields ...
  novelEntitiesPeak?: number; // Track peak contamination for irreversibility floor
}
```

**Unit tests:** `tests/unit/novel-entities-irreversible.test.ts`

---

### Phase 4: Monte Carlo Validation (Priya handles this)

**You provide:** Implemented code (Phases 1-3)
**Priya validates:** N≥30 runs with sensitivity testing

**Expected results:**
- Baseline (no prevention): 0-2% effectiveness ✓ (matches god mode)
- Regulated (prevention + remediation): 5-50% effectiveness over 30-50 years
- Irreversible floor prevents >10% total recovery

---

## Testing Strategy

### Unit Tests (Your Responsibility)

1. **Prevention tech unlocking:**
   - PFAS ban unlocks at correct tier
   - Dependencies enforced (global governance required)
   - timeLag applied correctly

2. **Effectiveness gating:**
   - Without prevention: regulationMultiplier = 0.01 ✓
   - With PFAS ban only: regulationMultiplier = 0.5
   - With all 3 prevention techs: regulationMultiplier = 1.0
   - Concentration multiplier: 0.001 for dilute, 1.0 for point sources

3. **Irreversibility floor:**
   - novelEntities can't drop below 90% of peak
   - Peak tracking updates correctly
   - Asymptotic approach (cleanup slows as approaching floor)

### Integration Tests (Your Responsibility)

1. **Baseline scenario (no prevention):**
   - Deploy all 7 existing pollution techs
   - Verify effectiveness = 0-2% (point sources only)
   - Matches god mode observation ✓

2. **Regulated scenario (prevention + remediation):**
   - Deploy prevention techs → regulationMultiplier increases
   - Deploy remediation techs → effectiveness 5-50% over decades
   - Time lag matters (no instant cleanup)

### Monte Carlo Validation (Priya's Responsibility)

- N≥30 runs
- Sensitivity testing on derived parameters
- Outcome distribution analysis

---

## Parameter Documentation Requirements

**In code comments, mark parameters as:**

- **VERIFIED:** Directly stated in peer-reviewed source
  - Example: `// VERIFIED: Ling et al. 2024 - $20-7,000 trillion/year`

- **CALCULATED:** Derived from data in sources
  - Example: `// CALCULATED: Montreal Protocol 10:1 ratio (Dodds et al. 2024 data)`

- **DERIVED ASSUMPTION:** Model assumption based on mechanisms, not measured
  - Example: `// DERIVED ASSUMPTION (not measured): 90% irreversible (Cousins 2022 distribution + Kane 2022 timescale)`

---

## Key Defensive Coding Patterns

1. **No silent fallbacks:**
   ```typescript
   ❌ const value = state.field ?? defaultValue; // Hides missing data
   ✅ const value = assertStateProperty(state, 'field', context); // Fails loudly
   ```

2. **Fail-loudly RNG:**
   ```typescript
   ❌ const random = rng || Math.random; // Silent non-determinism
   ✅ if (!rng || typeof rng !== 'function') throw new Error('RNG required');
   ```

3. **Assertions everywhere:**
   ```typescript
   return assertProbability(effectiveness, {
     location: 'calculateEffectiveness',
     valueName: 'effectiveness',
     month: state.currentMonth,
     additionalInfo: { multipliers, inputs }
   });
   ```

4. **Population access:**
   ```typescript
   ❌ const pop = state.population; // Doesn't exist
   ❌ const pop = state.globalMetrics.population; // Not synced
   ✅ const pop = state.humanPopulationSystem.population; // Source of truth
   ```

---

## Emoji Conventions

- 🌍 Planetary systems
- ☣️ Chemical/toxic contamination
- 🛡️ Prevention/protection
- 🔬 Research/technology
- ⚠️ Warnings
- ❌ Errors/failures
- ✅ Success

**Example log output:**
```typescript
console.log(`🌍☣️ Novel Entities boundary updated: ${newLevel.toFixed(3)}`);
console.log(`  🛡️ Prevention multiplier: ${regulationMultiplier.toFixed(2)}×`);
console.log(`  ⚠️ Irreversible floor: ${irreversibleFloor.toFixed(3)} (90% of peak)`);
```

---

## Success Criteria

✅ **Without prevention tech:** 0-2% effectiveness (god mode validated)
✅ **With prevention tech:** 5-50% effectiveness over decades
✅ **Irreversible floor:** Asymptotic approach to 90% of peak
✅ **Time lags differentiated:** Prevention 10-20yr, remediation 30-50yr
✅ **All parameters documented:** VERIFIED / CALCULATED / DERIVED ASSUMPTION
✅ **Tests pass:** Unit + integration coverage
✅ **Type checking:** `npx tsc --noEmit` passes

---

## Handoff to Next Agent

**After implementation complete:**

1. **Commit with detailed message:**
   - List all 3 prevention techs added
   - Explain effectiveness gating logic
   - Note irreversibility floor implementation
   - Reference research validation (Grade B+)

2. **Tag for Priya (Monte Carlo validation):**
   - Sensitivity testing on irreversibleFraction [0.70, 0.90, 0.95]
   - Sensitivity testing on reboundFactor [0.5, 0.7, 0.9]
   - Baseline vs regulated scenario comparison

3. **Prepare for architecture-skeptic (Quality Gate 2):**
   - Performance: Any O(n²) loops?
   - State propagation: novelEntitiesPeak tracking correct?
   - Complexity: Is effectiveness calculation maintainable?

---

## Questions/Clarifications

If any parameters are ambiguous during implementation:

1. **Check research file first:** `research/novel_entities_zero_effectiveness_20251113.md`
2. **Check validation report:** `reviews/novel_entities_research_critique_20251113.md`
3. **Conservative defaults:** When in doubt, err toward pessimism (research tool, not game)
4. **Document uncertainty:** Mark as DERIVED ASSUMPTION if not in sources

---

**Ready to implement, Roy?** You have full research backing, validation conditions, and clear success criteria. Let's fix this zero-effectiveness "bug" by making it scientifically accurate.

**Estimated time:** 9-12 hours (Phases 1-3)
**Priority:** CRITICAL (blocks utopia pathway validation)

Go forth and code defensively! 🛡️🔬
