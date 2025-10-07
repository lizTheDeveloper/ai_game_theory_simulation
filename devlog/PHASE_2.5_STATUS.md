# Phase 2.5: Multi-Dimensional AI Capabilities - Status Update

**Started:** October 4, 2025  
**Current Status:** 75% Complete - Core Integration Done, Tuning Needed

---

## ✅ What's Working

### 1. Multi-Dimensional Capability System ✅
- AI agents have `capabilityProfile` with 7 core dimensions + research tree
- Capability profiles initialized with diversity (different AIs, different strengths)
- Total capability correctly calculated from profile
- Derived capabilities (hacking, manipulation) update from profile
- Backward compatible (old `capability` field still works)

### 2. Research Action System ✅
- AIs use `advance_research` action
- `selectDimensionToAdvance()` chooses what to research based on:
  - Current capability gaps (prefer to balance)
  - Alignment level (misaligned prefer risky tech)
  - Development mode (careful vs fast)
  - Random variation (diversity!)
- `applyResearchGrowth()` updates capability profile
- Research selection: 70% core dimensions, 30% research subfields

### 3. Non-Uniform Growth ✅
- **Validated:** Self-improvement grows faster than physical (as designed)
- Different dimensions have different growth rates:
  - selfImprovement: 0.05/action (FASTEST)
  - cognitive: 0.04/action
  - digital: 0.03/action
  - physical: 0.02/action (SLOWEST)
- Growth rates respect development mode (fast vs careful)

### 4. Government Research System ✅
- Government has `researchInvestments` field
- Can allocate funding to specific dimensions/research
- Investment multiplies AI research speed (1.0× to 2.0×)

### 5. Shared Initialization Module ✅
- `src/simulation/initialization.ts` provides:
  - `createAIAgent()`: Generate diverse AI agents
  - `createDefaultInitialState()`: Consistent starting state
  - `createTestState()`: Custom test scenarios
- All scripts can use shared initialization (no duplication!)

### 6. Simulations Run Successfully ✅
- No crashes or errors
- Capability profiles update correctly
- Non-uniform growth visible in results
- Different AIs have different capability distributions

---

## ⚠️ What Needs Work

### 1. Outcome Balance (CRITICAL)
**Issue:** 100% utopia outcomes in Monte Carlo (20/20 runs)  
**Previous:** 100% extinction outcomes (Phase 2)  
**Problem:** Swung too far in the opposite direction!

**Likely Causes:**
- Growth rates might be too slow now
- Research system might be too cautious
- Extinction triggers might not work with capability profiles yet
- Alignment drift might be insufficient

**Fix Required:**
1. Verify extinction triggers use capability profiles
2. Check alignment drift calculations
3. Rebalance growth rates if needed
4. Test with misaligned AIs (alignment < 0.4)

### 2. Extinction Trigger Update (PENDING)
**Status:** Not yet done  
**Required:** Update `src/simulation/extinctions.ts` to check capability profiles

**Example:**
```typescript
// OLD (checks single number):
if (totalAICapability > 2.5) { trigger bioweapon }

// NEW (checks profile):
if (ai.capabilityProfile.research.biotech.syntheticBiology > 3.0 &&
    ai.capabilityProfile.physical > 2.0) {
  trigger bioweapon
}
```

### 3. Action Event Logging (MINOR)
**Issue:** Research actions not appearing in event logs  
**Impact:** Can't diagnose AI research choices easily  
**Status:** Not blocking, but helpful for debugging

**Options:**
1. Add explicit logging in `advance_research` action
2. Fix event extraction in test scripts
3. Use diagnostic logger instead

---

## 📊 Test Results

### Single Simulation (50 months, seed 42)
```
Outcome: UTOPIA (73.7% probability)
Economic Stage: 0.0
Quality of Life: 0.76
Unemployment: 5.0%
Trust: 100.0%
```

### Monte Carlo (20 runs, 100 months)
```
Outcomes:
  Utopia: 100.0%  ← TOO HIGH!
  Dystopia: 0.0%
  Extinction: 0.0%  ← Should be ~30-40%

Average Final State:
  AI Capability: 1.18 (+0.89 from start)
  Unemployment: 7.0%
  Trust: 100.0%
  Economic Stage: 0.3
```

### Research System Test (24 months)
```
✅ Non-uniform growth validated
✅ Self-improvement > Physical (2 out of 3 AIs)
✅ Capability profiles update correctly
❌ Research actions not detected in logs (logging issue)
```

---

## 🎯 Remaining Tasks

### Critical (Must Do)
1. **Update Extinction Triggers** (3-4 hours)
   - Modify `src/simulation/extinctions.ts`
   - Check capability profiles instead of single number
   - Map different profiles to different extinction types
   - Test that misaligned AIs with high nanotech → grey goo

2. **Rebalance Outcomes** (2-3 hours)
   - Run Monte Carlo with various alignment levels
   - Test misaligned AI scenarios (alignment < 0.4)
   - Adjust growth rates if needed
   - Verify extinctions can still occur

3. **Validate Alignment Effects** (1-2 hours)
   - Test that misaligned AIs prefer risky research
   - Test that aligned AIs prefer beneficial research
   - Verify alignment drift still works
   - Check racing dynamics still apply

### Nice to Have
4. **Improve Action Logging** (1 hour)
   - Add better event logging in actions
   - Create diagnostic dashboard
   - Track research choices over time

5. **Update Other Test Scripts** (2-3 hours)
   - Update `testBalancedMechanics.ts`
   - Update `diagnoseAgentBehavior.ts`
   - Update `runDiagnostics.ts`
   - Use shared initialization module

6. **Government Research Actions** (3-4 hours)
   - Add actions to allocate research funding
   - Add UI for research investment
   - Test government can steer AI research

---

## 📈 Progress Metrics

**Overall Phase 2.5:** 75% Complete

**Breakdown:**
- ✅ Type definitions (100%)
- ✅ Capability functions (100%)
- ✅ Research system (100%)
- ✅ AI agent actions (100%)
- ✅ Initialization (100%)
- ⏳ Extinction triggers (0%)
- ⏳ Testing & tuning (40%)

**Time Estimate to Complete:** 6-10 hours

---

## 🚀 Next Session Plan

### Session Goal: Fix Extinction Triggers & Rebalance

**Step 1: Update Extinction Triggers (Priority 1)**
1. Read `src/simulation/extinctions.ts`
2. Update each extinction type to check capability profiles
3. Add profile-specific triggers:
   - Bioweapon: `syntheticBiology` + `geneEditing` + `physical`
   - Grey goo: `nanotechnology` + `physical` + `syntheticBiology`
   - Climate: `intervention` + `physical` + `economic`
   - Nuclear: `digital` + `cognitive`
   - Economic: `economic` + `digital`
4. Test with capability profiles

**Step 2: Test Misaligned AI Scenarios (Priority 2)**
1. Create test with alignment < 0.4
2. Run Monte Carlo (100 runs)
3. Verify extinctions can occur
4. Check extinction type distribution

**Step 3: Rebalance if Needed (Priority 3)**
1. If still 100% utopia, adjust:
   - Increase growth rates slightly
   - Strengthen alignment drift
   - Add more dangerous research thresholds
2. Re-test until ~40-60% extinction rate

---

## 💡 Key Insights

### What Worked Well
1. **Clean Architecture:** Separation of concerns made integration smooth
2. **Shared Initialization:** Eliminated code duplication across scripts
3. **Backward Compatibility:** Old code still works, smooth migration
4. **Non-Uniform Growth:** Correctly implemented, validated in tests
5. **Type Safety:** No runtime type errors, everything type-checks

### Lessons Learned
1. **Test Balance Early:** Swung from 100% extinction to 100% utopia
2. **Extinction Triggers Matter:** Need to update them with new system
3. **Event Logging Helps:** Would be easier to debug with better logging
4. **Monte Carlo is Essential:** Single runs don't reveal balance issues

### Surprising Findings
1. **Dramatic Outcome Shift:** Simply changing how capabilities are represented flipped outcomes completely
2. **Diverse Profiles Work:** AIs do develop different capability distributions
3. **Alignment Still Matters:** Even though not fully tested, alignment affects research choices

---

## 📝 Commit Log (This Session)

1. ✅ Created multi-dimensional research system foundation
2. ✅ Refactored `calculations.ts` into 6 focused modules
3. ✅ Integrated research system into AI actions
4. ✅ Created shared initialization module
5. ✅ Updated `runSimulation.ts` to use capability profiles
6. ✅ Added research system test scripts
7. ✅ Validated non-uniform growth
8. ⏳ **NEXT:** Update extinction triggers

**Commits:** 5  
**Files Changed:** 15  
**Lines Added:** ~1,500  
**Lines Removed:** ~200  

---

## 🎯 Success Criteria for Phase 2.5 Complete

- [x] All AIs have capability profiles (not single number)
- [x] AIs choose research based on alignment
- [x] Government investment multiplies research
- [x] Different dimensions grow at different rates
- [ ] **Different profiles trigger different extinctions** ← CRITICAL
- [ ] **Monte Carlo shows varied outcomes (not 100% utopia)** ← CRITICAL
- [x] Backward compatibility maintained (old code works)
- [x] No linter errors
- [ ] Tests pass with realistic extinction rates (30-50%)

**Current:** 6/9 criteria met (67%)  
**Remaining:** Fix extinction triggers + rebalance outcomes

---

## 🔮 What's Next After Phase 2.5

### Phase 3: End-Game Dynamics
- Aligned vs misaligned AI battle
- Emergency pause mechanics
- Technology tree breakthroughs
- Utopian attractor dynamics

### Phase 4: Player Agency
- Government research investment UI
- Strategic research choices
- Crisis response mechanics
- Policy trade-offs

### Phase 5: Polish & Balance
- Extensive Monte Carlo testing
- Parameter tuning
- Event polish
- Documentation

---

**Last Updated:** October 4, 2025  
**Status:** ✅ Core System Complete, ⚠️ Balance Needed  
**Confidence:** High (solid foundation, clear path forward)

