# Novel Entities Model Redesign - Implementation Plan

**Date:** November 13, 2025
**Priority:** CRITICAL (TIER 1 research roadmap)
**Status:** Design phase (research + validation complete, Grade B+)

## Context

God mode testing revealed 0% effectiveness for Novel Entities boundary despite 7 pollution technologies deployed. Research validated this is **NOT a bug** but an accurate representation of thermodynamic and economic reality.

**Research:** `research/novel_entities_zero_effectiveness_20251113.md` (16 peer-reviewed sources, 2024-2025)
**Validation:** `reviews/novel_entities_research_critique_20251113.md` (Grade B+, Quality Gate 1 PASSED)

## Key Research Findings

### 1. Thermodynamic Energy Trap (CONFIRMED)
- Ling et al. 2024: Removing PFAS at current emission rate costs $20-7,000 trillion/year (0.2-66× global GDP)
- Thermal destruction requires 850-1200°C at $1,000-2,000/tonne
- Even advanced electrochemical methods can't overcome planetary scale

### 2. Concentration Problem (CONFIRMED)
- Technologies demonstrated at mg/L (labs), environment is pg/L to ng/L (10^6-10^9× dilution)
- Tibetan Plateau rainwater: 55 pg/L PFOA (14× EPA limit in most remote region)
- Cost scaling: 12-47× increase for dilute-stream treatment

### 3. Irreversibility (CONFIRMED)
- Cousins 2022: PFAS in rainwater globally including Antarctica
- Kane et al. 2022: Microplastic ocean recovery takes hundreds of years even if input stopped
- Derived estimate: <10% reversible fraction due to atmospheric distribution + covalent soil binding

### 4. Montreal Protocol Lesson (CRITICAL)
- Production ban: 90-95% of ozone recovery
- Bank destruction (cleanup): 5-10%
- Prevention:Remediation ratio = 10:1 to 20:1

### 5. Rebound Effects (DOCUMENTED IN ANALOGS)
- Jevons paradox: NVIDIA +1M GPUs (2023→2024) despite efficiency gains
- UNEP 2024: Waste generation grows 81% (2023-2050) despite technology

## Current Model Issue

**Current assumption:** Technology deployment → immediate effectiveness
**Reality:** Remediation requires BOTH technology AND production regulation

**Result:** 0% effectiveness is scientifically accurate for unregulated scenario

## Proposed Model Redesign

### Phase 1: Add Production Regulation System (TIER 0 - NEW TECHNOLOGY)

Add **prevention technologies** to tech tree (missing from current 73):

```typescript
// NEW: TIER 0 Prevention Technologies
{
  id: "pfas_production_ban",
  name: "Global PFAS Production Ban",
  tier: 0,
  type: "regulatory",
  timeline: "10-20 years",
  effectiveness: {
    novelEntities: 0.45, // 45% by stopping flow
    irreversibleFraction: 0.90 // 90% of problem is irreversible
  },
  dependencies: ["global_governance", "chemical_substitution_ready"],
  analog: "Montreal Protocol CFC phase-out (12 years)",
  research: ["Montreal Protocol effectiveness study"]
}

{
  id: "plastic_production_phaseout",
  name: "Plastic Production Phase-Out 80%",
  tier: 1,
  type: "regulatory + industrial",
  timeline: "20-30 years",
  effectiveness: {
    novelEntities: 0.35, // 35% by reducing virgin plastic
    microplasticFlow: 0.80 // 80% flow reduction
  },
  dependencies: ["circular_economy", "bio_alternatives"],
  analog: "Lead/asbestos phase-outs",
  research: ["Historical phase-out timelines"]
}

{
  id: "chemical_substitution_acceleration",
  name: "Chemical Substitution Acceleration",
  tier: 1,
  type: "R&D + regulatory",
  timeline: "5-15 years per class",
  effectiveness: {
    novelEntities: 0.20, // 20% by replacing persistent chemicals
    newChemicalFlow: 0.60 // 60% flow reduction for new chemicals
  },
  dependencies: ["green_chemistry_rnd", "regulatory_push"],
  research: ["Substitution success rates"]
}
```

### Phase 2: Modify Existing Remediation Tech Effectiveness

Update existing 7 pollution techs to require production regulation:

```typescript
// EXISTING: Remediation technologies (PFAS, microplastic cleanup)
// BEFORE: effectiveness: 0.15 (unconditional)
// AFTER: effectiveness gated by regulation

function calculateNovelEntitiesEffectiveness(
  tech: Technology,
  state: GameState,
  rng: () => number
): number {
  const baseEffectiveness = tech.effectiveness.novelEntities || 0.0;

  // Check if production regulation technologies deployed
  const pfasBanDeployed = state.breakthroughs.some(b => b.id === "pfas_production_ban" && b.deployed);
  const plasticPhaseoutDeployed = state.breakthroughs.some(b => b.id === "plastic_production_phaseout" && b.deployed);
  const substitutionDeployed = state.breakthroughs.some(b => b.id === "chemical_substitution_acceleration" && b.deployed);

  // Regulation multiplier: 0.01 without regulation, 1.0 with regulation
  const regulationLevel = (
    (pfasBanDeployed ? 0.5 : 0.0) +
    (plasticPhaseoutDeployed ? 0.3 : 0.0) +
    (substitutionDeployed ? 0.2 : 0.0)
  );

  // Minimum 1% effectiveness (point sources only) without regulation
  const regulationMultiplier = Math.max(0.01, regulationLevel);

  // Energy constraint: Cleanup gated by renewable energy surplus
  const renewableSurplus = calculateRenewableSurplus(state);
  const energyRequired = tech.energyRequirement || 0; // TWh/year
  const energyMultiplier = Math.min(1.0, renewableSurplus / energyRequired);

  // Concentration factor: Dilute environmental contamination vs concentrated point sources
  // Environmental: pg/L to ng/L (10^-6 effectiveness)
  // Point sources: mg/L (1.0 effectiveness)
  const concentrationMultiplier = tech.worksOnDiluteStreams ? 0.001 : 1.0;

  // Time lag: Decades to deploy at scale
  const monthsSinceDeployment = state.currentMonth - (tech.deployedAt || state.currentMonth);
  const timeLagFactor = Math.min(1.0, monthsSinceDeployment / (30 * 12)); // 30 years to full scale

  // Rebound effect: Cleanup increases production (Jevons paradox)
  // Net effectiveness = cleanup - induced production
  const reboundFactor = tech.triggersRebound ? 0.7 : 1.0; // 30% offset by increased production

  // Final effectiveness
  return baseEffectiveness *
    regulationMultiplier *
    energyMultiplier *
    concentrationMultiplier *
    timeLagFactor *
    reboundFactor;
}
```

### Phase 3: Add Irreversibility Cap

Novel Entities boundary should asymptotically approach but never reach zero:

```typescript
// Update PlanetaryBoundariesPhase.ts
function updateNovelEntities(state: GameState, rng: () => number): void {
  // ... existing accumulation logic ...

  // Irreversible floor: 90% of contamination is permanently distributed
  const irreversibleFraction = 0.90;
  const reversibleFraction = 1.0 - irreversibleFraction;

  // Current contamination level
  const currentLevel = state.planetaryBoundaries.novelEntities;

  // Maximum possible cleanup (only reversible fraction)
  const maxCleanup = currentLevel * reversibleFraction;

  // Apply cleanup from technologies (already gated by regulation)
  let cleanup = 0;
  for (const tech of getDeployedNovelEntitiesTech(state)) {
    cleanup += calculateNovelEntitiesEffectiveness(tech, state, rng);
  }

  // Asymptotic approach: can't clean below irreversible floor
  const irreversibleFloor = state.planetaryBoundaries.novelEntitiesPeak * irreversibleFraction;
  cleanup = Math.min(cleanup, maxCleanup);

  // Update level
  const newLevel = Math.max(
    irreversibleFloor,
    currentLevel - cleanup + newContamination
  );

  state.planetaryBoundaries.novelEntities = newLevel;
}
```

## Implementation Phases

### Phase 1: Add Prevention Technologies (3-4 hours)
**Files:**
- `src/data/technologyTree.ts` - Add 3 new TIER 0-1 techs
- `src/simulation/engine/phases/TechnologyUnlockPhase.ts` - Handle regulatory tech
- `tests/unit/technology-prevention.test.ts` - Unit tests

**Deliverables:**
- PFAS production ban (TIER 0)
- Plastic production phase-out (TIER 1)
- Chemical substitution acceleration (TIER 1)

### Phase 2: Update Remediation Effectiveness (4-5 hours)
**Files:**
- `src/simulation/engine/phases/PlanetaryBoundariesPhase.ts` - Add effectiveness gating
- `src/simulation/engine/phases/TechnologyEffectivenessPhase.ts` - Calculate multipliers
- `tests/integration/novel-entities-gated.test.ts` - Integration tests

**Deliverables:**
- Regulation multiplier (0.01 → 1.0 based on prevention tech)
- Energy constraint (gated by renewable surplus)
- Concentration factor (dilute vs point sources)
- Time lag (decades to scale)
- Rebound effects (Jevons paradox)

### Phase 3: Add Irreversibility Logic (2-3 hours)
**Files:**
- `src/simulation/engine/phases/PlanetaryBoundariesPhase.ts` - Asymptotic floor
- `src/types/game.ts` - Add irreversibleFraction field
- `tests/unit/novel-entities-irreversible.test.ts` - Unit tests

**Deliverables:**
- 90% irreversible floor
- Asymptotic approach (never reaches zero)

### Phase 4: Monte Carlo Validation (2-4 hours)
**Scripts:**
- N=30 validation runs
- Compare baseline (no prevention) vs regulated (prevention + remediation)

**Expected results:**
- Baseline: 0-2% effectiveness (point sources only)
- Regulated: 5-50% effectiveness over 30-50 years
- Maximum recovery: 10% (90% irreversible floor)

## Success Criteria

1. **Without prevention tech:** 0-2% effectiveness (matches god mode)
2. **With prevention tech:** 5-50% effectiveness over decades
3. **Irreversible floor:** Can't clean below 90% of peak contamination
4. **Energy constraint:** Cleanup blocked if insufficient renewable surplus
5. **Time lag:** 30 years to full scale deployment
6. **Research-backed:** All parameters justified by peer-reviewed sources

## Dependencies

**Blocked by:** None (research + validation complete)
**Blocks:** God mode retest, utopia pathway validation

## Research References

See `research/novel_entities_zero_effectiveness_20251113.md` for full citations:
- Ling et al. 2024 (energy requirements)
- Cousins 2022 (global contamination)
- Kane et al. 2022 (irreversibility)
- UNEP 2024 (rebound effects)
- Dodds et al. 2024 (Montreal Protocol lessons)
- 11 additional peer-reviewed sources

## Next Steps

1. **Architecture review:** Spawn architecture-skeptic for design review (Quality Gate 2)
2. **Implementation:** Spawn simulation-maintainer for Phase 1-3
3. **Testing:** Spawn priya for Monte Carlo validation
4. **Documentation:** Update wiki with new mechanics

**Estimated total effort:** 11-16 hours (3-4 days)
**Priority:** CRITICAL (blocks utopia pathway validation)
