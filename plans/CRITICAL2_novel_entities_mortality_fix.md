# CRITICAL-2 Handoff to Roy (Simulation Maintainer)

## Bug Summary

**Problem:** Novel entities crises (reproductive, bioaccumulation, chronic disease) add mortality risk ONCE when triggered, then never again. This makes chemical pollution have negligible long-term impact.

**Root Cause:** Lines 145-173, 187-213, 226-255 in `src/simulation/novelEntities.ts`
```typescript
if (ne.reproductiveHealthDecline > 0.50 && !ne.reproductiveCrisisActive) {
    ne.reproductiveCrisisActive = true;
    // ...adds 0.08% mortality risk ONCE...
    addMortalityRisk(pop, { baseRisk: 0.0008, ... });
}
```

After the first trigger, `reproductiveCrisisActive = true`, so the condition fails and no more risks are added.

**Expected Behavior:** Ongoing crises should add mortality risk EVERY month (like climate-driven famine does).

## Evidence

Test run (`scripts/testNovelEntitiesMortalityIntegration.ts`):
- Reproductive crisis triggers Month 0 ✅
- But mortality summaries show ZERO pollution risks for entire 120-month run ❌
- Only "famine (climate)" risks appear
- 49% total mortality (all from ecosystem/climate collapse, none from chemicals)

## Fix Required

**Primary Fix:** Change one-time crisis triggers to ongoing monthly risks

**Option A (Recommended):** Separate trigger logic from risk accumulation
```typescript
// TRIGGER (one-time event announcement)
if (ne.reproductiveHealthDecline > 0.50 && !ne.reproductiveCrisisActive) {
    ne.reproductiveCrisisActive = true;
    console.log(`🚨 REPRODUCTIVE CRISIS: Widespread fertility decline`);
}

// ONGOING MORTALITY (every month while active)
if (ne.reproductiveCrisisActive) {
    addMortalityRisk(pop, {
        type: 'pollution',
        baseRisk: 0.0008,  // 0.08%/month
        // ... rest of risk object
    });
}
```

**Option B:** Add risks based on contamination levels (not just crisis flags)
```typescript
// Reproductive mortality scales with contamination
if (ne.reproductiveHealthDecline > 0.50) {
    const mortalityRate = (ne.reproductiveHealthDecline - 0.50) * 0.002;  // 0-0.1% depending on severity
    addMortalityRisk(pop, {
        type: 'pollution',
        baseRisk: mortalityRate,
        // ...
    });
}
```

**Secondary Fix:** Add missing phase dependency
- File: `src/simulation/engine/phases/BayesianMortalityResolutionPhase.ts`
- Line 44: Add `'resource-soil'` to dependencies array
- Reason: Documents that mortality resolution depends on novel entities running first

## Research Validation

Existing code already has research-backed values:
- Reproductive crisis: 0.08% monthly (lines 164-173)
- Bioaccumulation collapse: 0.15% monthly (lines 204-213) 
- Chronic disease epidemic: 0.4% monthly (lines 246-255)

These rates are reasonable for ongoing chemical pollution mortality. The bug is just that they're applied once instead of every month.

**Optional:** Spawn super-alignment-researcher to find recent papers on ongoing PFAS/microplastic mortality rates to validate/refine these numbers.

## Integration Tests

Add test to `tests/integration/`:
```typescript
// Test: Ongoing pollution mortality (not one-time)
test('Novel entities add mortality risk every month', () => {
    // Setup: Severe chemical pollution
    state.novelEntitiesSystem.reproductiveHealthDecline = 0.55;
    
    // Run 12 months
    for (let i = 0; i < 12; i++) {
        engine.step();
        const risks = state.humanPopulationSystem.mortalityRisks;
        const pollutionRisks = risks.filter(r => r.type === 'pollution');
        
        // Should have pollution risk EVERY month, not just month 0
        expect(pollutionRisks.length).toBeGreaterThan(0);
    }
});
```

## Expected Outcome

After fix:
- Mortality summaries show "pollution (pollution): X%" every month
- High chemical load (70%+) causes 5-15% population loss over 120 months
- Integration test prevents regression

## Files to Modify

1. **`src/simulation/novelEntities.ts`** (primary fix)
   - Lines 145-175: Reproductive crisis
   - Lines 187-215: Bioaccumulation collapse
   - Lines 226-258: Chronic disease epidemic

2. **`src/simulation/engine/phases/BayesianMortalityResolutionPhase.ts`** (dependency fix)
   - Line 44: Add `'resource-soil'` to dependencies

3. **`tests/integration/novel-entities-mortality.test.ts`** (new file)
   - Add ongoing mortality test

## Timeline

- Implementation: 1-2 hours
- Testing: 1 hour
- **Total: 2-3 hours**

## Diagnostic Scripts

Already exist:
- `scripts/testNovelEntitiesMortalityIntegration.ts` - Quick integration check
- `scripts/diagnosticNovelEntitiesMortality.ts` - Detailed comparison baseline vs high pollution

Run after fix to verify pollution risks appear in summaries.

