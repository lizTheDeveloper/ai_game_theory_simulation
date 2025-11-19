# Novel Entities Zero-Effectiveness - Implementation Handoff

**Date:** 2025-11-13 19:05
**From:** Orchestrator
**To:** Feature Implementer (or direct implementation)
**Priority:** TIER 1 CRITICAL
**Status:** Quality Gate 1 PASSED (Grade B+) → Ready for Implementation

---

## Workflow Status

✅ **Research Phase:** COMPLETE (742 lines, 16 sources)
✅ **Design Phase:** COMPLETE (276 lines, 4 root causes identified)
✅ **Quality Gate 1 (Validation):** PASSED (Grade B+)
⏭️ **Implementation Phase:** READY TO START
⏭️ **Quality Gate 2 (Architecture Review):** After implementation
⏭️ **Documentation:** After Quality Gate 2
⏭️ **Archival:** After documentation

---

## Context

**Problem:** God mode testing shows 0% effectiveness for Novel Entities boundary despite 7 pollution technologies deployed.

**Root Cause (Research-Validated):** This is NOT a bug - it's thermodynamically and economically accurate. Four validated mechanisms:
1. **Energy trap:** Cleanup costs 0.2-66× global GDP annually (Ling et al. 2024)
2. **Concentration problem:** 10^6-10^9× dilution (lab mg/L vs environment pg/L)
3. **Irreversibility:** 90% of contamination is irreversible (atmospheric distribution + covalent binding)
4. **Prevention >> Remediation:** Montreal Protocol 10:1 to 20:1 ratio (production ban >> bank cleanup)

**Solution:** Model redesign with prevention-first architecture (3 new TIER 0-1 technologies + gated remediation)

---

## Key Documents

**Research:**
- `research/novel_entities_zero_effectiveness_20251113.md` (742 lines, 16 peer-reviewed sources)

**Design:**
- `plans/novel_entities_model_redesign_20251113.md` (276 lines, implementation plan)

**Validation:**
- `reviews/novel_entities_verification_20251113.md` (just created, Grade B+ decision)

**Verification Spec:**
- `research/verification_7ac8b8f_20251113.md` (citation checklist)

---

## Implementation Plan Summary

### Phase 1: Add 3 Prevention Technologies (TIER 0-1)

**New Tech 1: PFAS Production Ban (TIER 0)**
```typescript
{
  id: "pfas_production_ban",
  name: "Global PFAS Production Ban",
  tier: 0,
  type: "regulatory",
  effectiveness: { novelEntities: 0.45 }, // 45% by stopping flow
  timeline: "10-20 years",
  analog: "Montreal Protocol CFC phase-out"
}
```

**New Tech 2: Plastic Production Phase-Out (TIER 1)**
```typescript
{
  id: "plastic_production_phaseout",
  name: "Plastic Production Phase-Out 80%",
  tier: 1,
  type: "regulatory + industrial",
  effectiveness: { novelEntities: 0.35 }, // 35% flow reduction
  timeline: "20-30 years",
  analog: "Lead/asbestos phase-outs"
}
```

**New Tech 3: Chemical Substitution Acceleration (TIER 1)**
```typescript
{
  id: "chemical_substitution_acceleration",
  name: "Chemical Substitution Acceleration",
  tier: 1,
  type: "R&D + regulatory",
  effectiveness: { novelEntities: 0.20 }, // 20% via substitution
  timeline: "5-15 years per class"
}
```

### Phase 2: Modify Existing Remediation Tech Effectiveness

**Current remediation techs (7 existing):**
- Electrochemical PFAS destruction
- Microplastic filtration
- Ocean cleanup arrays
- Nanoplastic removal
- Chemical remediation
- Soil decontamination
- Water treatment

**New effectiveness calculation:**
```typescript
const baseEffectiveness = tech.effectiveness.novelEntities || 0;

// Gating factors (multiply together):
const regulationMultiplier = calculateRegulationLevel(state); // 0.01 to 1.0
const concentrationMultiplier = tech.worksOnDiluteStreams ? 0.001 : 1.0;
const energyMultiplier = calculateEnergyAvailable(state); // 0 to 1.0
const timeLagFactor = calculateTimeLag(tech, state); // 0 to 1.0 over 30 years
const reboundFactor = 0.7; // 30% offset by increased production

const netEffectiveness = baseEffectiveness
  * regulationMultiplier
  * concentrationMultiplier
  * energyMultiplier
  * timeLagFactor
  * reboundFactor;
```

### Phase 3: Add Irreversible Floor Mechanic

**Asymptotic approach to irreversible fraction:**
```typescript
// Track peak contamination
if (state.planetaryBoundaries.novelEntities > state.planetaryBoundaries.novelEntitiesPeak) {
  state.planetaryBoundaries.novelEntitiesPeak = state.planetaryBoundaries.novelEntities;
}

// Calculate irreversible floor (90% of peak)
const irreversibleFraction = 0.90;
const irreversibleFloor = state.planetaryBoundaries.novelEntitiesPeak * irreversibleFraction;

// Can't clean below floor
state.planetaryBoundaries.novelEntities = Math.max(
  state.planetaryBoundaries.novelEntities - cleanup,
  irreversibleFloor
);
```

### Phase 4: Add Regulation Level Calculation

**Prevention tech unlocks remediation:**
```typescript
function calculateRegulationLevel(state: GameState): number {
  const preventionTechs = [
    "pfas_production_ban",
    "plastic_production_phaseout",
    "chemical_substitution_acceleration"
  ];

  const deployedCount = preventionTechs.filter(id =>
    state.technologyStatus[id]?.deployed
  ).length;

  // 0 prevention techs → 1% remediation effectiveness (point sources only)
  // 1-3 prevention techs → scales to 100% remediation effectiveness
  return 0.01 + (deployedCount / preventionTechs.length) * 0.99;
}
```

---

## Implementation Requirements

### Code Changes Required:

1. **Add 3 new technologies to tech tree** (TIER 0-1)
   - File: `src/simulation/data/technologies.ts` (or equivalent)
   - Action: Add prevention tech definitions

2. **Modify Novel Entities calculation phase**
   - File: `src/simulation/phases/planetaryBoundaries/novelEntities.ts` (or equivalent)
   - Action: Add regulation gating, energy constraints, concentration multipliers, time lag, rebound

3. **Add peak tracking to GameState**
   - File: `src/types/game.ts`
   - Action: Add `novelEntitiesPeak: number` to planetary boundaries

4. **Add irreversible floor mechanic**
   - File: Novel Entities phase
   - Action: Clamp cleanup to irreversible floor

5. **Create regulation level helper**
   - File: Novel Entities phase or utility
   - Action: Calculate regulation level from prevention tech deployment

### Testing Requirements:

1. **Unit tests:**
   - Regulation level calculation (0/1/2/3 prevention techs)
   - Irreversible floor clamping (can't go below 90% of peak)
   - Effectiveness multipliers (regulation × concentration × energy × time × rebound)

2. **Integration tests:**
   - God mode scenario: Should still show 0% effectiveness WITHOUT prevention tech
   - Prevention-first scenario: Should show >0% effectiveness WITH prevention tech
   - Peak tracking: Should record maximum contamination
   - Asymptotic approach: Should approach but never cross irreversible floor

3. **Monte Carlo validation (N≥10 runs):**
   - Deterministic: Same seed → same results
   - Effectiveness distributions: Prevention tech shifts outcomes toward better results
   - Coefficient of variation: CV < 0.01% (Priya's standard)

---

## Model Assumptions (MUST Document)

These are DERIVED estimates, not explicit research findings. Document clearly in code comments:

1. **90% Irreversible Fraction**
   ```typescript
   // MODEL ASSUMPTION (derived from research):
   // - Cousins 2022: Global atmospheric PFAS distribution
   // - Kane 2022: Multi-century microplastic persistence
   // - Derivation: Atmospheric distribution + covalent binding + ocean persistence
   //   → <10% reversible → 90% irreversible floor
   const irreversibleFraction = 0.90;
   ```

2. **Rebound Factor = 0.7**
   ```typescript
   // MODEL ASSUMPTION (based on Jevons paradox analogs):
   // - UNEP 2024: Waste +81% (2023-2050) despite technology
   // - Sorrell 2025: AI efficiency → increased use (Jevons paradox)
   // - Conservative estimate: 30% offset by increased production
   const reboundFactor = 0.7;
   ```

3. **Concentration Multiplier = 0.001**
   ```typescript
   // MODEL ASSUMPTION (derived from cost scaling):
   // - Li et al. 2024: Cost scaling 12-47× for dilute streams
   // - Assumption: Cost scales → effectiveness drops
   // - Conservative: 0.1% effectiveness at environmental dilution
   const concentrationMultiplier = tech.worksOnDiluteStreams ? 0.001 : 1.0;
   ```

---

## Parameters Requiring Quantification During Implementation

These need research-backed values:

1. **Energy Requirements (TWh/year per technology)**
   - Basis: Electrochemical 5-7 kWh/m³ (Li 2024)
   - Action: Calculate planetary-scale energy needs

2. **Time Lag Differentiation**
   - Prevention tech: 10-20 years (Montreal Protocol analog)
   - Remediation tech: 30 years (infrastructure scale-up)
   - Action: Different timeLagFactor by tech type

3. **Prevention Tech Effectiveness (45%, 35%, 20%)**
   - Status: Placeholder values, need dedicated research
   - Action: Phase 2 research sprint after implementation

---

## Success Criteria

**Implementation complete when:**
- ✅ 3 new prevention technologies added to tech tree
- ✅ Regulation level gating implemented
- ✅ Irreversible floor mechanic working
- ✅ All multipliers (regulation × concentration × energy × time × rebound) applied
- ✅ God mode validation: Still shows 0% without prevention tech
- ✅ Prevention validation: Shows >0% with prevention tech
- ✅ Unit tests pass
- ✅ Integration tests pass
- ✅ Code compiles (TypeScript strict mode)

**Ready for Quality Gate 2 when:**
- ✅ Implementation complete
- ✅ Tests passing
- ✅ Monte Carlo runs complete (N≥10)
- ✅ Model assumptions documented in code
- ✅ Effectiveness metrics logged for review

---

## Next Steps

1. **Implement Phase 1-4** (prevention tech + regulation gating + irreversible floor)
2. **Write tests** (unit + integration)
3. **Run Monte Carlo validation** (N≥10, deterministic)
4. **Document model assumptions** in code comments
5. **Signal ready for Quality Gate 2** (architecture review)

---

## Handoff Complete

**From:** Orchestrator
**To:** Feature Implementer (or simulation-maintainer)
**Priority:** TIER 1 CRITICAL
**Estimated Effort:** 6-8 hours (implementation + testing)
**Blockers:** None - all research validated, design complete, validation passed

**Questions?** See:
- Design doc: `plans/novel_entities_model_redesign_20251113.md`
- Research: `research/novel_entities_zero_effectiveness_20251113.md`
- Validation: `reviews/novel_entities_verification_20251113.md`
