# NaN Fallback Audit Report - October 24, 2025

## Executive Summary

Systematic audit of the codebase for dangerous NaN/undefined fallback patterns that mask bugs instead of revealing them.

**Total Issues Found:**
- **57** `isNaN(x) ? fallback : x` patterns
- **311** `?? defaultValue` patterns (many in calculations)
- **7** geometric mean calculations (4 in `MultiParadigmDUIUpdatePhase.ts` need review)

**Risk Level:** HIGH - Silent fallbacks are hiding bugs and making simulation results unreliable.

## 1. isNaN Fallback Patterns (57 occurrences)

### Critical Issues in Core Calculations

These are in HOT PATHS that run every simulation step and can cascade NaN bugs:

#### `/src/simulation/environmental.ts` (4 occurrences)
```typescript
// Line 111 - Resource reserves
const currentReserves = isNaN(env.resourceReserves) ? 1.0 : env.resourceReserves;

// Line 152 - Pollution level
const currentPollution = isNaN(env.pollutionLevel) ? 0.0 : env.pollutionLevel;

// Line 194 - Climate stability
const currentClimate = isNaN(env.climateStability) ? 1.0 : env.climateStability;

// Line 226 - Biodiversity
const currentBiodiversity = isNaN(env.biodiversityIndex) ? 1.0 : env.biodiversityIndex;
```

**Status:** ✅ PARTIALLY FIXED (Oct 24, 2025)
- Changed from `Math.max(0, ...)` to `Math.max(MIN_FLOOR, ...)`
- Still has fallback but now throws warning log if NaN detected
- **Recommendation:** Add explicit error detection and throw instead of silent fallback

#### `/src/simulation/capabilities.ts` (5 occurrences)
```typescript
// Lines 159, 194, 203, 217 - AI capability aggregation
const safeValue = (val: number) => (isNaN(val) || val === undefined) ? 0 : val;
return isNaN(total) ? 0 : total;
```

**Status:** ❌ DANGEROUS
- Capability calculations are critical for AI decision-making
- Silent 0 fallback means broken AI could appear as "no capability"
- **Recommendation:** Throw error if NaN detected, add validation at source

#### `/src/simulation/utils/ai.ts` (8 occurrences)
```typescript
// Lines 20, 24, 36, 40, 94, 98, 110, 114 - AI metrics
const cap = isNaN(ai.capability) ? 0 : ai.capability;
return isNaN(avg) ? 0 : avg;
const align = isNaN(ai.alignment) ? 0.5 : ai.alignment;
return isNaN(avg) ? 0.5 : avg;
```

**Status:** ❌ VERY DANGEROUS
- Alignment fallback to 0.5 (neutral) masks misaligned AIs
- Capability fallback to 0 masks capability growth bugs
- These run every step for 20 AI agents
- **Recommendation:** Remove fallbacks, add validation in AI initialization

#### `/src/simulation/socialCohesion.ts` (3 occurrences)
```typescript
// Line 121 - Meaning crisis
const currentMeaningCrisis = isNaN(social.meaningCrisisLevel) ? 0.0 : social.meaningCrisisLevel;

// Line 159 - Institutional legitimacy
const currentLegitimacy = isNaN(social.institutionalLegitimacy) ? 0.7 : social.institutionalLegitimacy;

// Line 271 - Cultural adaptation
const currentAdaptation = isNaN(social.culturalAdaptation) ? 0.2 : social.culturalAdaptation;
```

**Status:** ❌ DANGEROUS
- Social metrics affect dystopia/utopia detection
- Silent fallbacks mask social system bugs
- **Recommendation:** Add validation, remove fallbacks

#### `/src/simulation/technologicalRisk.ts` (3 occurrences)
```typescript
// Line 53 - Misalignment risk
const currentMisalignmentRisk = isNaN(risk.misalignmentRisk) ? 0.1 : risk.misalignmentRisk;

// Line 71 - Safety debt
const currentSafetyDebt = isNaN(risk.safetyDebt) ? 0.05 : risk.safetyDebt;

// Line 77 - Concentration risk
const currentConcentrationRisk = isNaN(risk.concentrationRisk) ? marketConcentration : risk.concentrationRisk;
```

**Status:** ❌ CRITICAL
- Misalignment risk fallback masks AI safety bugs
- These directly affect extinction scenarios
- **Recommendation:** MUST throw error if NaN, this is existential risk calculation

### Medium Priority (Regional/Population)

#### `/src/simulation/regionalPopulations.ts` (9 occurrences)
```typescript
// Lines 320-498 - Regional population calculations
const foodStock = isNaN(state.resourceEconomy.food.reserves) ? 1.0 : state.resourceEconomy.food.reserves;
const waterStock = isNaN(state.resourceEconomy.water.reserves) ? 1.0 : state.resourceEconomy.water.reserves;
const climateStability = isNaN(state.environmentalAccumulation.climateStability) ? 0.5 : state.environmentalAccumulation.climateStability;
const pollutionLevel = isNaN(state.environmentalAccumulation.pollutionLevel) ? 0 : state.environmentalAccumulation.pollutionLevel;
const biodiversity = isNaN(env.biodiversityIndex) ? 0.35 : env.biodiversityIndex;
const economicStage = isNaN(state.globalMetrics.economicTransitionStage) ? 0 : state.globalMetrics.economicTransitionStage;
const growthRate = isNaN(region.netGrowthRate) ? 0 : region.netGrowthRate;
const fertility = isNaN(region.fertilityRate) ? 0 : region.fertilityRate;
```

**Status:** ⚠️ MEDIUM RISK
- Regional calculations are isolated from core metrics
- But population dynamics affect mortality/crisis cascades
- **Recommendation:** Add source validation, consider removing fallbacks

#### `/src/simulation/populationDynamics.ts` (6 occurrences)
Similar patterns to regionalPopulations.ts

**Status:** ⚠️ MEDIUM RISK

### Lower Priority (UI/Display/Initialization)

#### `/src/simulation/qualityOfLife/*` (11 occurrences)
- Most are in display/aggregation layers
- Some in dimension calculations that feed into main metrics
- **Recommendation:** Audit which are in calculation paths vs display

#### `/src/simulation/planetaryBoundaryRecovery.ts` (2 occurrences)
```typescript
const annualEmissions = (rawEmissions !== undefined && !isNaN(rawEmissions)) ? rawEmissions : 40; // GtCO₂
```

**Status:** ✓ ACCEPTABLE
- Explicit check with clear default and unit comment
- Not in hot path
- Could still improve with validation

## 2. Nullish Coalescing (??) Patterns (311 occurrences)

### Critical Issues

Many `?? defaultValue` patterns are in **calculation hot paths** where they mask bugs:

#### High-Risk Examples:

**Government Action Selection:**
```typescript
// government/core/governmentCore.ts
if ((gov.resources ?? 0) < resourceCost) {
```
- Fallback to 0 means "no resources" when value is undefined
- Could allow actions that shouldn't be possible

**AI Alignment Checks:**
```typescript
// government/core/governmentCore.ts:391
(ai.trueAlignment ?? ai.alignment) < 0.3
```
- Falling back to revealed alignment when trueAlignment is undefined
- This is CORRECT usage (intentional cascade)

**Social Trust Calculations:**
```typescript
// freshwaterDepletion.ts:191
state.society.trust = (state.society.trust ?? 0.5) - 0.04;
```
- Fallback to 0.5 (neutral) if trust is undefined
- Masks initialization bugs

### Acceptable Uses:

**LLM Integration Display:**
```typescript
// llm/integration.ts
alignment: agent.trueAlignment ?? agent.alignment,
trustInAI: state.society?.trustInAI ?? 0.5,
```
- These are for LLM prompts (display layer)
- Acceptable to have fallbacks for robustness

**Optional Feature Checks:**
```typescript
// computeInfrastructure.ts:527
const globalPrecautionaryCost = state.consciousnessGovernanceReadiness?.precautionaryCosts?.global ?? 0;
```
- Feature might not exist yet
- Fallback to 0 (no cost) is semantically correct

### Recommendations by Category:

1. **Calculation hot paths:** Remove `??`, add validation
2. **Feature checks:** Keep `??`, but document WHY default is correct
3. **Display/UI:** Keep `??`, clearly separate from calculations
4. **Initialization:** Keep `??`, but only in initialization code

## 3. Geometric Mean Calculations (7 occurrences)

### Properly Protected (Using MIN_FLOOR):

✅ `/src/simulation/utils/geometricMean.ts`
- Has explicit `MIN_FLOOR = 0.1` constant
- Well-documented
- Includes test cases
- **Status:** GOOD EXAMPLE to follow

### Needs Review:

#### `/src/simulation/engine/phases/MultiParadigmDUIUpdatePhase.ts` (4 geometric means)

**Line 181 - Western Liberal:**
```typescript
const indicators = [electoralDemocracy, civilLiberties, ruleOfLaw, economicFreedom];
const product = indicators.reduce((acc, val) => {
  const floored = Math.max(val ?? 50, MIN_FLOOR);
  return acc * (floored / 100);
}, 1);
const result = Math.pow(product, 1 / indicators.length) * 100;
return isNaN(result) ? 50 : result;
```

**Issues:**
- ✅ Has MIN_FLOOR (0.1)
- ❌ Has `?? 50` fallback BEFORE min-floor (should error instead)
- ❌ Has `isNaN(result) ? 50` fallback at end
- **Recommendation:** Remove both fallbacks, throw if NaN

**Line 225 - Development:**
Same pattern as Western Liberal

**Line 311 - Ecological:**
```typescript
const indicators = [boundariesScore, resourceScore, climateScore, pollutionScore];
const product = indicators.reduce((acc, val) => {
  const floored = Math.max(val ?? 50, MIN_FLOOR);
  return acc * (floored / 100);
}, 1);
const result = Math.pow(product, 1 / indicators.length) * 100;
return isNaN(result) ? 50 : result;
```

**THIS IS THE BUG WE JUST FIXED!**
- ✅ Has MIN_FLOOR (0.1)
- ❌ Has `?? 50` fallback
- ❌ Has final `isNaN(result) ? 50` that masked the NaN bug for months
- **Status:** Bug fixed but fallbacks still present

**Line 352 - Indigenous:**
Same pattern as others

#### Recommended Fix for All 4:

```typescript
// BEFORE (dangerous):
const floored = Math.max(val ?? 50, MIN_FLOOR);
// ...
return isNaN(result) ? 50 : result;

// AFTER (safe):
if (isNaN(val)) {
  console.error(`❌ NaN in ${paradigmName} indicator at month ${state.currentMonth}`);
  console.error(`   Indicators: [${indicators.join(', ')}]`);
  throw new Error(`Invalid ${paradigmName} paradigm calculation`);
}
const floored = Math.max(val, MIN_FLOOR);
// ...
if (isNaN(result)) {
  console.error(`❌ NaN result in ${paradigmName} at month ${state.currentMonth}`);
  throw new Error(`Invalid ${paradigmName} geometric mean`);
}
return result;
```

**Line 211 - Survival Fundamentals:**
```typescript
survivalScore = Math.pow(food * water * thermal * shelter, 1/4) * 100;
```

**Issues:**
- ❌ No MIN_FLOOR protection!
- ❌ No NaN check!
- If any survival metric is exactly 0, entire score becomes 0
- **Recommendation:** Add MIN_FLOOR to each component

## 4. Circular Dependency Patterns

### Found and Fixed:

✅ `/src/simulation/engine/phases/EnvironmentalFeedbackPhase.ts`
- Read `pollutionLevel` → multiply by 100 → divide by 100 → write back
- **Fixed:** Added NaN protection on read and write

### Potential Issues:

Need to audit for similar patterns:
- Any phase that reads from state, transforms, and writes back to same field
- Especially in aggregation/sync phases

## 5. Division by Zero Patterns

Quick scan for potential division by zero:

```bash
grep -r "/ (" src/simulation/ --include="*.ts" | grep -v ".bak" | wc -l
# Returns: 143 potential divisions
```

**Recommendation:** Audit all divisions for zero-denominator protection

## Priority Action Items

### Immediate (This Week):

1. **❌ CRITICAL: Remove NaN fallbacks from MultiParadigmDUIUpdatePhase.ts**
   - All 4 paradigm calculations
   - Replace with error detection and throw
   - Add detailed logging

2. **❌ CRITICAL: Fix AI metrics fallbacks**
   - `/src/simulation/utils/ai.ts` - alignment/capability
   - `/src/simulation/capabilities.ts` - aggregations
   - Add validation at source

3. **❌ CRITICAL: Fix risk calculation fallbacks**
   - `/src/simulation/technologicalRisk.ts`
   - Misalignment/safety debt must error on NaN

### High Priority (Next Sprint):

4. **⚠️ Remove fallbacks from social metrics**
   - `/src/simulation/socialCohesion.ts`
   - Add validation layer

5. **⚠️ Audit population dynamics fallbacks**
   - `/src/simulation/regionalPopulations.ts`
   - `/src/simulation/populationDynamics.ts`
   - Determine which need validation vs acceptable defaults

6. **⚠️ Add MIN_FLOOR to survival fundamentals**
   - Line 211 in MultiParadigmDUIUpdatePhase.ts

### Medium Priority:

7. **📊 Document acceptable ?? usage**
   - Create style guide: when fallbacks are OK
   - Tag all ?? with comments explaining WHY default is correct
   - Separate calculation code from display code

8. **🔍 Division by zero audit**
   - Scan all 143 division operations
   - Add protection where needed

### Low Priority:

9. **📚 Create validation layer**
   - Validate state at phase boundaries
   - Catch NaN/undefined before they propagate
   - Add integration tests for NaN scenarios

## Testing Strategy

**Add NaN corruption tests:**

```typescript
describe('NaN Detection', () => {
  it('should throw if ecology inputs are NaN', () => {
    const state = createTestState();
    state.environmentalAccumulation.pollutionLevel = NaN;

    expect(() => {
      engine.step(state);
    }).toThrow(/Invalid.*paradigm/);
  });

  it('should throw if AI capability is NaN', () => {
    const state = createTestState();
    state.aiAgents[0].capability = NaN;

    expect(() => {
      engine.step(state);
    }).toThrow(/Invalid AI capability/);
  });
});
```

## Metrics

**Current State:**
- 57 isNaN fallbacks (most dangerous)
- 311 ?? fallbacks (mixed risk)
- 7 geometric means (4 need fixes)
- **Estimated Risk:** ~30-40 HIGH RISK silent fallbacks in hot paths

**Goal State:**
- 0 silent fallbacks in calculation hot paths
- All NaN detection throws errors with diagnostic info
- Explicit validation at state boundaries
- Clear separation: calculations (no fallbacks) vs display (fallbacks OK)

## Lessons Learned from Oct 24 Ecology Bug

1. **Silent fallbacks are bugs:** The `isNaN(result) ? 50 : result` masked a critical bug for months
2. **Circular dependencies are dangerous:** Read → transform → write can create permanent NaN
3. **Test with NaN:** Need explicit NaN corruption tests in test suite
4. **MIN_FLOOR prevents collapse:** But only works if used consistently everywhere
5. **Geometric means are fragile:** Need both MIN_FLOOR AND NaN detection

## References

- CLAUDE.md: New "NaN and Invalid Value Handling" section added
- `/logs/ecology_nan_bug_fix_20251024.md`: Detailed bug analysis
- `/src/simulation/utils/geometricMean.ts`: Reference implementation with MIN_FLOOR

---

**Next Steps:** Start with immediate priority items (MultiParadigmDUIUpdatePhase, AI metrics, risk calculations). These are in hot paths and affect core simulation outcomes.
