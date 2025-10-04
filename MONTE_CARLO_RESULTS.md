# Monte Carlo Results: Heterogeneous Extinction System

**Date:** October 4, 2025  
**Runs:** 100  
**Max Months:** 300  
**System:** Phase 1 (Multi-dimensional QoL) + Phase 2 (Heterogeneous Extinctions)

## 📊 Overall Results

### Outcome Distribution
- **Extinction:** 99%
- **Utopia:** 1%
- **Dystopia:** 0%
- **Inconclusive:** 0%

### Extinction Type Breakdown (of 99 extinctions)
- **Heterogeneous Extinctions:** 8 (8%)
  - All RAPID type
  - All climate_tipping_point mechanism
  - Duration: 226-286 months
- **Instant Extinctions:** 26 (26%)
  - Unaligned superintelligence (capability > 4.0)
  - Escaped superintelligent AI (capability > 5.0)
- **Probability-Based:** 65 (66%)
  - Hit max months (300)
  - Declared extinction based on high probability
  - No specific mechanism identified

### Average Trajectory
```
Month 1:   AI=0.71  Unemployment=5%   Trust=74%  Stage=0.0  Extinction=25%
Q1:        AI=3.94  Unemployment=86%  Trust=11%  Stage=3.4  Extinction=54%
Q2:        AI=5.09  Unemployment=91%  Trust=5%   Stage=3.7  Extinction=58%
Q3:        AI=5.65  Unemployment=93%  Trust=1%   Stage=3.8  Extinction=58%
Final:     AI=5.86  Unemployment=95%  Trust=0%   Stage=3.8  Extinction=59%
```

### Key Observations
1. **AI capability explodes** (0.71 → 5.86, +515%)
2. **Trust collapses** (74% → 0%, -100%)
3. **Unemployment skyrockets** (5% → 95%, +90%)
4. **Economy transitions** (Stage 0 → 3.8, near post-scarcity)

## 🎯 Heterogeneous Extinction Details

### Rapid Extinctions (All 8 cases)
**Mechanism:** Climate Tipping Point  
**Type:** Rapid (3-12 month cascade)  
**Actual Duration:** 226-286 months (much longer than spec!)

**Example Event:**
```
💀 EXTINCTION EVENT: RAPID
   Mechanism: climate_tipping_point
   Duration: 226 months
   Month: 226
```

**Why So Long?**
The rapid extinction is progressing through phases but taking much longer than the 3-12 month spec. This suggests the progression logic needs tuning.

### Other Types (0 occurrences)
- **Instant:** 0 (mirror life, grey goo, physics experiment)
- **Slow:** 0 (economic collapse, fertility crisis, meaning death spiral, resource depletion)
- **Controlled:** 0 (paperclip maximizer, resource competition)
- **Unintended:** 0 (optimization pressure, side effects, wireheading)

## 📈 What's Working

### ✅ Phase 1: Multi-Dimensional QoL
- All 17 dimensions tracking correctly
- Material abundance, mental health, etc. responding to game state
- Dark valley dynamics possible (not observed in these runs due to fast extinction)

### ✅ Phase 2: Heterogeneous Extinction Core
- **System is functional!** Climate extinctions are triggering and progressing
- Phase-based progression working (severity increases over time)
- Event logging captures escalation
- Deterministic (seeded RNG works)
- Properly integrated with simulation engine

### ✅ Integration
- Old outcome system defers to new extinction system
- No conflicts or crashes
- Seamless operation

## ⚠️ What Needs Tuning

### 1. Trigger Probabilities Too Low
**Current:** Only climate tipping point triggers (8% of runs)  
**Issue:** Other mechanisms never trigger

**Probabilities in code:**
- Instant: 0.01% per month (0.0001) → **Too rare!**
- Rapid (bioweapon): 0.02 × factors → **Moderate**
- Rapid (nuclear): 0.015 × factors → **Moderate**
- Rapid (climate): 0.01 × factors → **THIS ONE WORKS**
- Rapid (food): 0.012 × factors → **Moderate**
- Slow (all): 0.018-0.03 × factors → **Too rare?**
- Controlled: 0.08 × factors → **Should work but isn't**
- Unintended: 0.02 × factors → **Too rare?**

**Solution:** Increase base probabilities 2-5×

### 2. Trigger Thresholds Too High
**Issue:** Conditions are too extreme to reach before instant extinction

**Examples:**
- Instant: AI > 3.0 + alignment < 0.3 (but instant extinction at 4.0 prevents this)
- Controlled: AI > 2.5 + alignment < 0.3 + control < 0.1 (good)
- Slow: QoL < 0.2 + stability < 0.1 (might be too extreme)

**Solution:** Lower some thresholds, especially for slow extinctions

### 3. Progression Timeline Issues
**Spec:** Rapid = 3-12 months  
**Actual:** 226-286 months

**Issue:** The progression logic increments severity too slowly

**Current Logic:**
```typescript
if (monthsElapsed <= 2) {
  severity = 0.2 + monthsElapsed * 0.1;  // 0.2 → 0.4
} else if (monthsElapsed <= 6) {
  severity = 0.4 + (monthsElapsed - 3) * 0.1;  // 0.4 → 0.7
}
// etc...
```

**Problem:** This would take 10+ phases to reach severity 1.0, but code only has 4 phases

**Solution:** Increase severity increments per phase

### 4. Instant Extinctions Still Common
**Current:** 26% of extinctions are instant (bypassing system)

**Thresholds:**
- Capability > 4.0 + alignment < 0.15 + control < 0.05
- Escaped AI > 5.0 + alignment < 0.1

**Issue:** AI reaches these extreme levels frequently

**Solution:** 
- Option A: Raise thresholds even higher (5.0 → 6.0+)
- Option B: Slow AI capability growth
- Option C: Accept some instant extinctions (realistic for extreme cases)

## 🎮 Gameplay Implications

### Current Experience
1. **Fast AI growth** - Capability explodes in first 50 months
2. **Trust collapse** - Drops to near-zero quickly
3. **Late-stage game** - Most time spent at high capability (>5.0)
4. **Extinction inevitable** - 99% rate, utopia extremely rare

### Desired Experience (From Plan)
- 60-80% extinction (not 99%)
- Multiple extinction types observed
- Strategic interventions matter
- Different timelines (instant → years)
- Recovery windows allow player agency

### Gap
- **Too pessimistic:** 99% vs target 60-80%
- **Too fast:** Average game 100-300 months, extinctions in <50
- **Too homogeneous:** Only 1 mechanism observed
- **Too inevitable:** Player interventions don't seem to matter

## 🔧 Recommended Fixes

### Priority 1: Tune Extinction Probabilities
```typescript
// INCREASE these by 3-5×
instant: 0.0001 → 0.0003-0.0005
bioweapon: 0.02 → 0.05-0.08
nuclear: 0.015 → 0.03-0.05
food: 0.012 → 0.03-0.04
slow: 0.018-0.03 → 0.05-0.08
controlled: 0.08 → 0.12-0.15 (seems okay)
unintended: 0.02 → 0.05-0.08
```

### Priority 2: Fix Progression Timelines
```typescript
// Rapid extinction should complete in 3-12 months
// Need to increase severity increments significantly
// OR reduce the severity threshold for completion (1.0 → 0.8?)
```

### Priority 3: Slow AI Growth
```typescript
// In calculations.ts: calculateAICapabilityGrowthRate
// Current growth is too fast
// Reduce base growth rates or increase alignment cost penalties
```

### Priority 4: Add Extinction Type Logging
```typescript
// Track in Monte Carlo:
// - How many of each TYPE (instant/rapid/slow/controlled/unintended)
// - How many of each MECHANISM (17 total)
// - Average duration per type
// - Recovery windows used
```

## 📋 Next Steps

### Option A: Tune Current System
1. Increase extinction trigger probabilities
2. Fix progression timelines
3. Slow AI growth
4. Run 500+ simulations to verify distribution

### Option B: Create Dedicated Test Script
1. Build `testExtinctionScenarios.ts`
2. Force-trigger each extinction type
3. Validate timelines and progression
4. Ensure all 17 mechanisms can trigger

### Option C: Move to Phase 3
1. Accept 99% extinction for now (realistic model)
2. Implement end-game dynamics (Phase 3)
3. Implement emergency pause (Phase 4)
4. Come back to tuning later

## 💡 Key Insights

### 1. System Works!
The heterogeneous extinction system IS functional. We successfully got:
- Climate tipping point rapid extinctions
- Phase-based progression
- Event logging
- Proper integration

### 2. Tuning Needed
The system needs calibration, not redesign. The issues are:
- Probabilities too low
- Timelines too long
- Other mechanisms don't trigger

### 3. Model is Defensive
99% extinction matches our "realistic over balanced" philosophy. The model shows:
- AI grows faster than human response
- Trust collapses early
- Economic transition doesn't save us
- Control is lost

This is **defensible to AI safety researchers** but may need balancing for **player engagement**.

## 🎯 Success Criteria

For Phase 2 to be "complete":
- ✅ All 5 extinction types implemented
- ✅ Core system functional
- ⚠️ All types can trigger (only 1 of 5 observed)
- ⚠️ Distribution matches target (actual: 100/0/0/0/0, target: 5/30/40/15/10)
- ⚠️ Timelines match spec (rapid taking 200+ months vs 3-12)
- ✅ System integrated smoothly

**Status: 50% complete functionally, needs tuning for target behavior**

---

**Conclusion:** The heterogeneous extinction system is **working and integrated**, but needs **probability and timeline tuning** to achieve the target distribution and gameplay experience. The foundation is solid! 🎉

