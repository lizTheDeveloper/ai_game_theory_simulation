# State Validation Framework Implementation
**Task Type:** WEEK 3 Item 7 - State Validation Framework (ARCH-CRITICAL-3)
**Priority:** MEDIUM (4-week critical path)
**Timeline:** 3 days

## Context from Architecture Review

**Current Status:**
- 590 state mutations in codebase
- Only 410 assertions (180 gap = 30% unvalidated)
- This creates risk of silent state corruption
- Oct 2025 ecology NaN bug was hidden for months by defensive fallbacks

**Risk Assessment:**
- State corruption without validation
- Invalid simulation results
- Hard-to-debug cascading failures
- Loss of research validity

## Deliverables

### Day 1: State Mutation Audit Report
**File:** `/reviews/state_mutation_audit_20251106.md`

**Requirements:**
1. Identify all 180 unvalidated mutation sites
2. Prioritize by criticality:
   - CRITICAL: Mortality phases (death calculations, population changes)
   - CRITICAL: Climate phases (temperature, tipping points, planetary boundaries)
   - CRITICAL: AI capability phases (capability progression, alignment drift)
   - HIGH: Breakthrough technology phases
   - MEDIUM: Other phases
3. Document current coverage gaps by phase
4. Create prioritized list for implementation

**Methodology:**
```bash
# Find all state mutations
grep -r "state\.[a-zA-Z]*\.[a-zA-Z]* =" src/simulation --include="*.ts" > /tmp/mutations.txt

# Find all assertions
grep -r "assert" src/simulation --include="*.ts" > /tmp/assertions.txt

# Analyze the gap
# For each mutation site, check if there's a nearby assertion
```

### Day 1-2: Assertion Utilities Expansion
**File:** `/src/simulation/utils/assertions.ts`

**New utilities needed:**
1. **Domain-specific validators:**
   - `assertMortalityRate(value, context)` - Validate [0, 1] + mortality-specific checks
   - `assertTemperatureDelta(value, context)` - Validate reasonable temperature changes
   - `assertCapabilityScore(value, context)` - Validate AI capability ranges
   - `assertPlanetaryBoundary(value, context)` - Validate boundary thresholds
   - `assertPopulation(value, context)` - Validate population numbers (non-negative, reasonable bounds)

2. **Enhanced context reporting:**
   - Add `phaseName` to context (know which phase caused error)
   - Add `previousValue` tracking (show before/after)
   - Add `relatedFields` (show full state snapshot for debugging)

3. **Range validators with research-backed bounds:**
   - Document bounds with JSDoc citations
   - Reference peer-reviewed sources where available
   - Follow existing assertion utility patterns

**Example:**
```typescript
/**
 * Assert mortality rate is valid [0, 1]
 * 
 * Mortality rates are probabilities (0% to 100% of population).
 * Values outside [0,1] indicate calculation bugs.
 * 
 * @param value - Mortality rate to validate
 * @param context - Validation context
 * @throws Error if value is not a valid mortality rate
 * 
 * @see Xia et al. 2022 (Nature Food) - Historical max: 90% (Toba supervolcano)
 * @see Lancet 2025 - Gradual collapse: 30-50% mortality with interventions
 */
export function assertMortalityRate(
  value: number,
  context: {
    location: string;
    valueName: string;
    month?: number;
    cause?: string;  // e.g., "famine", "climate", "disease"
  }
): number {
  assertFinite(value, context);
  
  if (value < 0 || value > 1) {
    throw new Error([
      `❌ Invalid mortality rate in ${context.location}`,
      `   ${context.valueName} = ${value}`,
      `   Valid range: [0, 1] (0% to 100%)`,
      context.cause ? `   Cause: ${context.cause}` : '',
      context.month !== undefined ? `   Month: ${context.month}` : '',
      '',
      '   Research bounds:',
      '   - Historical max: 0.90 (90%, Toba supervolcano)',
      '   - Gradual collapse: 0.30-0.50 (30-50%, with interventions)',
    ].filter(Boolean).join('\n'));
  }
  
  return value;
}
```

### Day 2-3: Critical Path Coverage (100% assertions in top 20 phases)

**Top 20 Critical Phases (from architecture review):**

**Mortality Phases (CRITICAL - 8 phases):**
1. MortalityStabilizersPhase
2. ClimateImpactCascadePhase
3. FamineImpactPhase
4. DiseaseSpreadPhase
5. BayesianMortalityResolutionPhase
6. RegionalPopulationUpdatePhase
7. PopulationDynamicsPhase
8. ClimateHealthImpactPhase

**Climate Phases (CRITICAL - 6 phases):**
9. ClimateTrajectoryPhase
10. TippingPointPhase
11. PlanetaryBoundariesPhase
12. NuclearWinterPhase
13. OceanHealthPhase
14. BiodiversityPhase

**AI Phases (CRITICAL - 4 phases):**
15. AICapabilityProgressionPhase
16. AlignmentDriftPhase
17. AIAgentLifecyclePhase
18. AIAgentActionsPhase

**Breakthrough Phases (HIGH - 2 phases):**
19. TechProgressionPhase
20. DiffusionPhase

**Implementation Pattern:**
For each phase:
1. Identify all state mutations (look for `state.x.y = value`)
2. Add assertion BEFORE each mutation
3. Use appropriate domain-specific validator
4. Remove any defensive fallbacks (replace with assertions)
5. Document changes in commit message

**Example (before/after):**

```typescript
// ❌ BEFORE - Unvalidated mutation with defensive fallback
const mortalityRate = calculateMortality(state);
state.humanPopulationSystem.monthlyExcessDeaths = (mortalityRate ?? 0) * state.humanPopulationSystem.population;

// ✅ AFTER - Validated mutation, fail-loudly
const mortalityRate = assertMortalityRate(
  calculateMortality(state),
  {
    location: 'FamineImpactPhase',
    valueName: 'famineMortalityRate',
    month: state.currentMonth,
    cause: 'famine'
  }
);
state.humanPopulationSystem.monthlyExcessDeaths = mortalityRate * state.humanPopulationSystem.population;
```

### Day 3: Integration Tests
**File:** `/src/simulation/__tests__/stateValidation.test.ts`

**Test Coverage:**
1. **Assertions trigger on invalid data:**
   - NaN values
   - Infinity values
   - Out-of-range values
   - Negative populations
   - Mortality rates > 1
2. **Assertions preserve valid data:**
   - Valid ranges pass through
   - No false positives
3. **Context reporting:**
   - Error messages include phase name
   - Error messages include month
   - Error messages include previous values

**Example:**
```typescript
describe('State Validation Framework', () => {
  describe('assertMortalityRate', () => {
    it('should accept valid mortality rates', () => {
      expect(assertMortalityRate(0.5, { location: 'test', valueName: 'rate' })).toBe(0.5);
      expect(assertMortalityRate(0, { location: 'test', valueName: 'rate' })).toBe(0);
      expect(assertMortalityRate(1, { location: 'test', valueName: 'rate' })).toBe(1);
    });
    
    it('should reject NaN', () => {
      expect(() => assertMortalityRate(NaN, { location: 'test', valueName: 'rate' }))
        .toThrow('Non-finite value');
    });
    
    it('should reject out-of-range values', () => {
      expect(() => assertMortalityRate(1.5, { location: 'test', valueName: 'rate' }))
        .toThrow('Invalid mortality rate');
      expect(() => assertMortalityRate(-0.1, { location: 'test', valueName: 'rate' }))
        .toThrow('Invalid mortality rate');
    });
  });
});
```

### Day 3: Monte Carlo Validation (N=3)
**Verification:**
1. Run N=3 Monte Carlo simulations
2. Verify no new NaN errors
3. Verify no assertion failures (unless bugs found)
4. Measure performance overhead (<5% target)
5. Save results to `/logs/state_validation_mc_20251106.log`

**Command:**
```bash
npx tsx scripts/monteCarloSimulation.ts --runs 3 --seed 12345 > logs/state_validation_mc_20251106.log 2>&1 &
```

## Success Criteria

### Technical Metrics:
- ✅ State mutation audit complete (180 sites documented)
- ✅ Critical path assertion coverage: 69% → 100% (top 20 phases)
- ✅ Domain-specific validators implemented (5+ new utilities)
- ✅ Integration tests pass (100% coverage of critical validators)
- ✅ Monte Carlo N=3: No performance regression (<5% slowdown)
- ✅ No new NaN errors introduced

### Architecture Constraints:
- **Fail-loudly philosophy:** NO silent fallbacks (use assertions)
- **Research simulation rigor:** Invalid values = bugs to fix, not hide
- **Determinism:** No changes to RNG consumption order
- **Performance:** Target <5% overhead for assertions

### Code Quality:
- All new assertions use existing utility patterns
- JSDoc citations for validation ranges
- Clear error messages with full context
- No defensive fallbacks in critical paths

## Notes

**From CLAUDE.md:**
- This is a research simulation, not a production app
- Invalid values indicate bugs that must be fixed, not hidden
- Never use silent fallback values for NaN/undefined in simulation calculations
- Oct 2025 ecology NaN bug was hidden for months by `?? 50` fallback
- Assertion utilities are in `/src/simulation/utils/assertions.ts`

**Existing Assertion Utilities:**
- assertFinite(value, context) - Rejects NaN/Infinity
- assertDefined(value, context) - Rejects undefined/null
- assertInRange(value, min, max, context) - Validates numeric ranges
- assertProbability(value, context) - Validates [0, 1] range
- assertStateProperty(obj, 'path', context) - Replaces ?? fallback patterns
- assertNonEmpty(array, context) - Validates array has elements
- assertRegionalConsistency(state) - Validates regional/global coherence
- assertPhaseDependency(context, requiredPhaseId, info) - Phase ordering
- assertPhaseNotExecuted(context, prohibitedPhaseId, info) - Phase conflicts
- assertStateFieldNotModified(current, expected, info) - Detect overwrites

**Priority Order:**
1. Day 1: Audit + Utility expansion (foundation)
2. Day 2: Critical path implementation (mortality → climate → AI)
3. Day 3: Tests + Monte Carlo validation (verification)

**Commit Strategy:**
- Commit after audit report (Day 1)
- Commit after utility expansion (Day 1-2)
- Commit after each critical phase batch (Day 2-3)
- Commit after tests (Day 3)
- Final commit after Monte Carlo validation (Day 3)

**Log Everything:**
- Save audit results to `/reviews/state_mutation_audit_20251106.md`
- Save implementation notes to `/logs/state_validation_implementation_20251106.log`
- Save Monte Carlo results to `/logs/state_validation_mc_20251106.log`

## Implementation Approach

Follow simulation-maintainer best practices:
1. Read existing assertion utilities first
2. Understand fail-loudly philosophy
3. Never add silent fallbacks
4. Document all changes with JSDoc
5. Test incrementally (don't break existing functionality)
6. Run type checking after each batch: `npx tsc --noEmit`
7. Run unit tests after each batch: `npm test`

**Start with audit, then utilities, then implementation.**
