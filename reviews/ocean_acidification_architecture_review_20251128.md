# Ocean Acidification Architecture Review - November 28, 2025

**Reviewer:** Architecture Skeptic
**Feature:** Ocean Acidification Cascades Implementation (RD-2)
**Implementation By:** Roy (Simulation Maintainer)
**Status:** ⚠️ **CONDITIONAL APPROVAL** - Critical calibration issues found

## Executive Summary

The ocean acidification implementation is architecturally sound with excellent research backing and defensive coding practices. However, it causes **population extinction at month 388** due to overly aggressive cascade effects. The population drops to ~990,000 people (below the 1M threshold), triggering an assertion failure.

**Verdict:** The architecture is correct, but parameter calibration is causing unrealistic mortality. This needs immediate adjustment before merge.

### Issue Severity Breakdown

- **CRITICAL:** 1 issue (population extinction by month 388)
- **HIGH:** 2 issues (cascade triggers too early, compound effects too strong)
- **MEDIUM:** 3 issues (state duplication, fisheries power law, regional impact)
- **LOW:** 2 issues (documentation, future extensibility)

## Critical Issues (Immediate Attention Required)

### CRITICAL-1: Population Extinction at Month 388

**Problem:** Total human population drops to ~990,000 people, triggering assertion failure.

**Root Cause Analysis:**
1. **pH decline too aggressive** - Starting at 7.9 (already at threshold), declining at SSP5-8.5 rate (-0.00043/month)
2. **Cascade triggers immediately** - pH 7.9 is the trigger threshold, so cascade starts at month 0
3. **Compound mortality stacking** - Ocean impacts combine with other mortality sources
4. **No recovery mechanisms** - Once coral health drops, no way to recover

**Evidence:**
```
Error: Out-of-range value in aggregateGlobalPopulation
   totalPopulationBillions = 0.0009900243916650747
   Valid range: [0.001, 100]
   Month: 388
```

**Impact:** Simulation crashes, unrealistic extinction timeline (32 years vs centuries)

**Recommendation:**
1. Start pH at 7.95 (just above threshold) to delay cascade activation
2. Reduce SSP5-8.5 decline rate by 50% (-0.00022/month instead of -0.00043)
3. Add recovery floor at 10% population to prevent total extinction

## High Priority Issues

### HIGH-1: Cascade Triggers Too Early

**Problem:** Ocean cascade activates at month 0 because initial pH (7.9) equals trigger threshold.

**Code Location:** `src/simulation/oceanAcidification.ts:229-232`
```typescript
if (oa.pH < 7.9 && !oa.cascadeActive) {
    oa.cascadeActive = true;
}
```

**Impact:** No buffer period for technology development or adaptation

**Recommendation:**
- Initialize pH to 7.95 (2025 average per research)
- OR change trigger threshold to 7.85
- This provides 10-20 years before cascade activation

### HIGH-2: Compound Effects Too Strong

**Problem:** Multiple mortality multipliers stack multiplicatively:
1. Ocean acidification → materialAbundance reduction
2. Food security degradation → additional materialAbundance reduction
3. Low materialAbundance → population mortality
4. Climate impacts → additional mortality
5. Species sensitivity (0.8-1.2x) × warming synergy (2-3x) × climate stress (up to 1.5x)

**Analysis:**
- Shellfish collapse: -4% materialAbundance instantly (line 355)
- Fish-dependent impact: up to -3%/month (line 416)
- Coral decline: Up to -15%/month with all multipliers
- Power law fisheries: (coralHealth/100)^1.5 is too harsh

**Impact:** Death spiral with no escape once cascades begin

**Recommendation:**
1. Cap total multiplier effects at 3x (not unlimited stacking)
2. Make impacts additive, not multiplicative
3. Add diminishing returns on sequential impacts

## Medium Priority Issues

### MEDIUM-1: State Duplication Conflict

**Problem:** Two ocean health representations exist:
- `oceanAcidificationSystem` (implemented, comprehensive)
- `oceanHealth?` (optional field in GameState, NOT implemented)

**Impact:** Confusion about which system to use, potential for divergent state

**Recommendation:**
- Remove the optional `oceanHealth?` field from GameState
- OR document it as reserved for future simplified API
- Add comment explaining the distinction

### MEDIUM-2: Fisheries Power Law Too Aggressive

**Problem:** Fisheries yield = (coralHealth/100)^1.5

**Analysis:**
- At 50% coral health → 35% yield (65% loss)
- At 20% coral health → 9% yield (91% loss)
- Real-world shows more resilience through species substitution

**Recommendation:**
- Change exponent to 1.2 (less aggressive)
- Add minimum yield floor of 20% (subsistence fishing continues)
- Consider logistic curve instead of power law

### MEDIUM-3: Regional Differentiation Not Propagating

**Problem:** Regional coral health and impacts calculated but not affecting regional populations differently.

**Code:** Regional fields populated (lines 55-89) but impacts applied globally (lines 355, 416)

**Impact:** Pacific Islands should be more affected than inland regions

**Recommendation:**
- Apply fisheries impact proportional to regional dependence
- Use regional vulnerability modifiers in mortality calculations

## Low Priority Issues

### LOW-1: Missing Recovery Mechanisms

**Problem:** No way to recover once cascades begin (only mitigation, no restoration).

**Recommendation:**
- Add coral transplantation effectiveness
- Model ecosystem adaptation over decades
- Include artificial reef programs

### LOW-2: Incomplete Technology Integration

**Problem:** Tech tree integration mentioned but not fully implemented.

**Recommendation:** Document which technologies affect ocean parameters.

## Performance & State Propagation

### Performance Analysis

✅ **No significant bottlenecks found**
- Linear time complexity O(n) for all operations
- No deep cloning or expensive operations
- Efficient state mutations

### State Propagation

✅ **State updates correctly**
- pH and coral health properly tracked month-to-month
- History arrays maintained for trend analysis
- No circular dependencies detected

### Defensive Coding

✅ **Excellent defensive practices**
- 47 assertions added
- No silent fallbacks
- Clear error messages with context
- Proper NaN/Infinity handling

## Architecture Recommendations

### Immediate Fixes (Before Merge)

1. **Adjust Initial Conditions**
   ```typescript
   pH: 7.95,  // Above trigger threshold
   coralReefHealth: 75,  // Slightly better baseline
   ```

2. **Reduce Decline Rates by 30-50%**
   ```typescript
   const pH_DECLINE_RATE_PER_MONTH = {
     SSP5_8_5: -0.00022,  // Half of current -0.00043
   };
   coralDeclineRate *= 0.7;  // Reduce all decline rates
   ```

3. **Add Population Floor**
   ```typescript
   // Prevent total extinction (subsistence survival)
   const minPopulation = 0.01;  // 10M minimum
   pop.population = Math.max(minPopulation, newPopulation);
   ```

4. **Cap Compound Effects**
   ```typescript
   const totalMultiplier = Math.min(3.0,
     speciesSensitivity * warmingSynergy * climateStress);
   ```

### Medium-Term Improvements

1. **Implement Regional Impacts**
   - Apply ocean impacts based on regional coastal dependence
   - Inland regions less affected than island nations

2. **Add Recovery Pathways**
   - Coral adaptation mechanisms
   - Technology-driven restoration
   - Ecosystem regime shifts (not just collapse)

3. **Smooth Power Laws**
   - Use logistic curves instead of pure power laws
   - Add resilience factors for human adaptation

## Code Quality Assessment

### Strengths
- ✅ Comprehensive research backing (21 sources)
- ✅ Excellent defensive coding (47 assertions)
- ✅ Clear cascade progression logic
- ✅ Good separation of concerns
- ✅ Detailed comments and documentation

### Areas for Improvement
- ⚠️ Parameter calibration needs validation
- ⚠️ Regional system partially implemented
- ⚠️ Missing integration tests for extreme scenarios

## Decision

**⚠️ CONDITIONAL APPROVAL**

The implementation is architecturally sound but **MUST** address the population extinction issue before merge. The cascade parameters are too aggressive for realistic simulation.

### Required Before Merge

1. **Fix population extinction** - Adjust parameters per recommendations
2. **Add population floor** - Prevent total extinction
3. **Run Monte Carlo validation** - Verify no extinctions before year 30
4. **Document parameter choices** - Justify the adjustments made

### Follow-up Tasks

1. Implement regional impact differentiation
2. Add recovery mechanisms for post-2050 scenarios
3. Create integration tests for cascade interactions
4. Consider expanding the pH threshold range (7.85-7.95 for cascade stages)

## Summary

Roy has created a well-architected, research-backed implementation with excellent defensive coding practices. The core logic is sound, but the parameters create an unrealistic doomsday scenario where humanity goes extinct in 32 years purely from ocean acidification. This is **NOT** supported by the research, which suggests centuries-long decline, not decades.

The fix is straightforward: reduce decline rates, add population floors, and cap compound effects. With these calibration adjustments, this implementation will be ready for production.

**Next Steps:** Roy should apply the parameter adjustments and re-run Monte Carlo validation to ensure realistic outcomes before merge.