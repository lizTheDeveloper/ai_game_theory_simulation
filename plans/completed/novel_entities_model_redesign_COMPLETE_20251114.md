# Novel Entities Model Redesign - Implementation Plan

**Date:** November 13, 2025
**Completion Date:** November 14, 2025
**Priority:** CRITICAL (TIER 1 research roadmap)
**Status:** ✅ COMPLETE - All phases implemented, quality gates passed, validation complete

---

## COMPLETION SUMMARY (Nov 14, 2025)

**✅ ALL DELIVERABLES COMPLETE:**
- ✅ Phase 1: Prevention technologies (3 new TIER 0-1 techs)
- ✅ Phase 2: Gating function implementation (`calculateNovelEntitiesRemediationEffectiveness`)
- ✅ Phase 3: Irreversibility floor (90% asymptotic limit)
- ✅ Quality Gate 1: Research validation (Grade B+)
- ✅ Quality Gate 2: Architecture review (Grade B - APPROVE WITH CONDITIONS)
- ✅ Monte Carlo validation: N=30 sensitivity analysis, CV=0.00000%
- ✅ Documentation: Wiki systems documentation updated (205 lines)

**Implementation Commits:** 5c9e773, 2f05087, 805d064, 9fc6fdc, b6ec2b9

**Outstanding Issues:**
- 1 HIGH priority performance optimization: Renewable capacity caching in gating function (non-blocking)

**Key Documents:**
- Research: `research/novel_entities_zero_effectiveness_20251113.md` (742 lines, 16 sources)
- Architecture Review: `reviews/novel_entities_architecture_review_20251114.md`
- Sensitivity Analysis: `reviews/novel_entities_sensitivity_analysis_20251114.md`
- Wiki Documentation: `docs/wiki/systems/novel-entities.md`

---

## ORIGINAL PLAN (Nov 13, 2025)

## Context

God mode testing revealed 0% effectiveness for Novel Entities boundary despite 7 pollution technologies deployed. Research validated this is **NOT a bug** but an accurate representation of thermodynamic and economic reality.

**Research:** `research/novel_entities_zero_effectiveness_20251113.md` (16 peer-reviewed sources, 2024-2025)
**Validation Quality Gate 1:** `reviews/novel_entities_research_critique_20251113.md` (Grade B+, PASSED)
**Validation Quality Gate 2:** `reviews/novel_entities_research_critique_20251113_validation.md` (Grade B, CONDITIONAL PASS)

**Quality Gate 2 Requirements (MUST FIX before proceeding):**
1. Monte Carlo sensitivity analysis on derived parameters (irreversible fraction, rebound effect, time lag)
2. Code comments flagging HIGH UNCERTAINTY parameters
3. Justify 30-year time lag or use range (10-30 years) - ADDRESSED via sensitivity analysis

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
  // ⚠️ HIGH UNCERTAINTY: 30-year timelag not directly cited. Montreal Protocol achieved CFC phase-out
  //    in 12 years, but PFAS embedded in 1000+ applications (vs CFCs in ~10). Research-skeptic
  //    flagged for sensitivity analysis. Sensitivity range: 10-30 years. See Quality Gate 2 review.
  const monthsSinceDeployment = state.currentMonth - (tech.deployedAt || state.currentMonth);
  const timeLagFactor = Math.min(1.0, monthsSinceDeployment / (30 * 12)); // 30 years to full scale (CONSERVATIVE estimate)

  // Rebound effect: Cleanup increases production (Jevons paradox)
  // Net effectiveness = cleanup - induced production
  // ⚠️ HIGH UNCERTAINTY: reboundFactor based on analogous systems (AI hardware, waste generation)
  //    not direct pollution-remediation data. Research-skeptic flagged for sensitivity analysis.
  //    Sensitivity range: 0.5 (50% rebound) to 0.9 (10% rebound). See Quality Gate 2 review.
  const reboundFactor = tech.triggersRebound ? 0.7 : 1.0; // 30% offset by increased production (MODERATE estimate)

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
  // ⚠️ HIGH UNCERTAINTY: irreversibleFraction DERIVED from mechanism descriptions, not measured.
  //    Research-skeptic flagged for sensitivity analysis. Cousins 2022 shows global distribution,
  //    Kane 2022 shows century-scale persistence, but specific reversible fraction not quantified.
  //    Sensitivity range: 0.80 (20% reversible) to 0.95 (5% reversible). See Quality Gate 2 review.
  const irreversibleFraction = 0.90; // MODERATE estimate (10% reversible)
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
- N=30 validation runs (increased from N=10 for statistical power on sensitivity analysis)
- Compare baseline (no prevention) vs regulated (prevention + remediation)
- **CRITICAL: Sensitivity analysis on HIGH UNCERTAINTY parameters (Quality Gate 2 requirement)**

**Parameter Sensitivity Ranges:**
1. **irreversibleFraction:** Test 0.80 (20% reversible), 0.90 (10% reversible), 0.95 (5% reversible)
   - Rationale: DERIVED parameter from mechanism descriptions, not measured (Sylvia critique)
   - Expected impact: Higher reversibility → better long-term outcomes
2. **reboundFactor:** Test 0.5 (50% offset), 0.7 (30% offset), 0.9 (10% offset)
   - Rationale: Based on analogous systems (AI hardware, waste), not direct pollution-remediation data (Sylvia critique)
   - Expected impact: Higher rebound → lower net effectiveness
3. **timelagYears:** Test 10 years (Montreal Protocol pace), 20 years (midpoint), 30 years (conservative)
   - Rationale: Design doc assumes 30 years without specific citation (Sylvia critique)
   - Expected impact: Faster deployment → earlier effectiveness

**Monte Carlo Test Matrix:**
- 3 irreversible × 3 rebound × 3 timelag = 27 parameter combinations
- N=30 runs per combination = 810 total runs
- **OR** reduced matrix: Baseline (0.90, 0.7, 30) + 6 one-at-a-time variations = 7 combinations × 30 = 210 runs

**Expected results:**
- Baseline: 0-2% effectiveness (point sources only)
- Regulated (pessimistic: 0.95 irreversible, 0.5 rebound, 30yr lag): 3-15% effectiveness
- Regulated (moderate: 0.90 irreversible, 0.7 rebound, 20yr lag): 5-30% effectiveness
- Regulated (optimistic: 0.80 irreversible, 0.9 rebound, 10yr lag): 10-50% effectiveness
- Maximum recovery: 5-20% depending on irreversible fraction

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
