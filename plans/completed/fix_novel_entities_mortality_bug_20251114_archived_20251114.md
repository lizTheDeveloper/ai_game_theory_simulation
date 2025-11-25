# Fix Novel Entities Mortality Risk Propagation Bug

**CRITICAL-2 from architecture review (Nov 13, 2025)**
**Orchestrator investigation: Nov 14, 2025**

## Bug Confirmed

Test script (`scripts/testNovelEntitiesMortalityIntegration.ts`) proves the bug exists:

```
Population:
  Initial: 0.000B ← PROBLEM #1: Population not initializing
  Final: 0.000B
  Deaths: 0.0M (0.00%)

Novel Entities Events:
  Reproductive crisis: ✅ TRIGGERED
  Bioaccumulation collapse: ❌ NOT TRIGGERED
  Chronic disease epidemic: ❌ NOT TRIGGERED

RESULT: 0% mortality despite chemical pollution crisis
```

## Root Causes Identified

### Problem #1: Population Not Initializing (CRITICAL)
- `createDefaultInitialState()` returns 0 population
- Test never actually runs with humans in the simulation
- This is why mortality is 0% - no one to die!

**Action:** Check `src/simulation/initialization.ts` - ensure population system initializes correctly

### Problem #2: Risk Type Field Mismatch (Hypothesis)
From `novelEntities.ts` lines 164-173, 204-213, 246-255:
```typescript
addMortalityRisk(pop, {
  type: 'pollution',  // ← Does this match demographic vulnerabilities?
  baseRisk: 0.0008,
  proximate: 'pollution',
  root: 'pollution',
  ...
});
```

From `bayesianMortality.ts` lines 58-136, demographic vulnerabilities are defined for types:
- `famine`, `disease`, `disaster`, `war`, `pollution`, `ecosystem`, `cascade`, `other`

**The 'pollution' type exists**, so this should work. But let's verify it's correctly applied in `resolveMortality()` line 336:
```typescript
const vulnerability = demo.vulnerability[risk.type];
```

**Action:** Add logging to confirm vulnerabilities are being looked up correctly

### Problem #3: Mortality Stabilizers Over-correcting (Possible)
Lines 368-396 in `bayesianMortality.ts` apply mortality stabilizers that can reduce death probability by up to 90%+.

With reproductive crisis baseRisk = 0.0008 (0.08%), stabilizers could reduce this to effectively zero.

**Action:** Check if stabilizers are being applied even when no adaptation infrastructure exists

## Fix Plan

### Phase 1: Fix Population Initialization (BLOCKER)
1. Debug `createDefaultInitialState()` - why is population 0?
2. Ensure `humanPopulationSystem.population` initializes to ~8B
3. Re-run test to confirm population exists

### Phase 2: Add Diagnostic Logging
Add instrumentation to track risk propagation:

1. **In `novelEntities.ts`** (lines 164, 204, 246):
   ```typescript
   console.log(`💀 NOVEL ENTITIES: Adding mortality risk`);
   console.log(`   Type: ${risk.type}, BaseRisk: ${risk.baseRisk}`);
   console.log(`   Description: ${risk.description}`);
   ```

2. **In `bayesianMortality.ts` `resolveMortality()`** (after line 336):
   ```typescript
   if (isNaN(vulnerability)) {
     console.warn(`⚠️ No vulnerability for risk type '${risk.type}' in demographic '${demo.name}'`);
     console.warn(`   Available types: ${Object.keys(demo.vulnerability).join(', ')}`);
   }
   ```

3. **Show stabilizer impact** (around line 393):
   ```typescript
   if (deathProbBefore > 0.001) {
     console.log(`🛡️ Stabilizers: ${demo.name} ${(deathProbBefore*100).toFixed(3)}% → ${(deathProb*100).toFixed(3)}% (${(avgReduction*100).toFixed(1)}% reduction)`);
   }
   ```

### Phase 3: Verify Fix
1. Re-run `scripts/testNovelEntitiesMortalityIntegration.ts`
2. Expected result: 5-30% mortality over 120 months with severe pollution
3. Check logs show:
   - Population starts at ~8B
   - Risks are added when crises trigger
   - Vulnerabilities are correctly looked up
   - Stabilizers apply reasonable reductions (not 100%)

### Phase 4: Integration Tests
Create `tests/integration/novelEntitiesMortality.test.ts`:
- Test that reproductive crisis adds mortality risk
- Test that bioaccumulation collapse adds mortality risk
- Test that chronic disease epidemic adds mortality risk
- Test that risks have correct 'type' field
- Test that demographic vulnerabilities include 'pollution' type
- Test end-to-end: severe pollution → mortality increase

## Success Criteria

✅ Test shows population initializes correctly (8B)
✅ Chemical pollution crises trigger (reproductive/bioaccumulation/disease)
✅ Mortality increases by 5-30% over 120 months
✅ Logs show risks being added and processed
✅ Integration tests pass

## Files to Modify

1. **src/simulation/initialization.ts** - Fix population initialization
2. **src/simulation/bayesianMortality.ts** - Add diagnostic logging
3. **src/simulation/novelEntities.ts** - Add diagnostic logging (optional)
4. **tests/integration/novelEntitiesMortality.test.ts** - New integration test

## Research Context

**Expected mortality from chemical pollution crises:**
- Reproductive crisis: 0.08% monthly (0.0008 baseRisk) × 100 months × Bayesian compounding = 5-10% total
- Bioaccumulation collapse: 0.15% monthly (0.0015 baseRisk) = additional 10-15%
- Chronic disease epidemic: 0.4% monthly (0.004 baseRisk) = additional 30-40%
- **Combined (Bayesian):** P(death) = 1 - (1-0.0008)^100 × (1-0.0015)^100 × (1-0.004)^100 ≈ 40-50%
- **With stabilizers (40-60% reduction):** 15-30% final mortality

Current observed: 0% (BUG)

## References

- Architecture review: `reviews/architecture_review_20251113.md` (CRITICAL-2)
- Test script: `scripts/testNovelEntitiesMortalityIntegration.ts`
- Test log: `logs/test_novel_entities_mortality_20251114.log`
- Novel entities system: `src/simulation/novelEntities.ts`
- Bayesian mortality: `src/simulation/bayesianMortality.ts`
