# Monte Carlo Diagnostic Report
**Date**: October 7, 2025  
**Run**: 10 runs, 60 months each

## 🔧 FIXED ISSUES

### 1. ✅ Wealth Distribution NaN
**Problem**: `finalState.society.wealthDistribution` returned `undefined`  
**Root Cause**: Property is on `globalMetrics`, not `society`  
**Fix**: Changed to `finalState.globalMetrics.wealthDistribution`  
**Status**: FIXED in commit a8d495d

### 2. ✅ All QoL Categories NaN
**Problem**: All 5 QoL categories showed `NaN`  
**Root Cause**: Wrong property names used  
**Fix**: Updated to match actual `QualityOfLifeSystems` interface:
- **Basic Needs**: `materialAbundance + energyAvailability + physicalSafety` (was food/water/shelter/energy)
- **Psychological**: `mentalHealth + meaningAndPurpose + socialConnection + autonomy` (was autonomy/purpose/creativity)
- **Social**: `politicalFreedom + informationIntegrity + communityStrength + culturalVitality` (was community/politicalFreedom/safety)
- **Health**: `healthcareQuality + longevityGains + (1-diseasesBurden)` (was healthcare/mentalHealth/lifeExpectancy)
- **Environmental**: `ecosystemHealth + climateStability + (1-pollutionLevel)` (was climateStability/biodiversity/pollution/naturalResources)

**Status**: FIXED in commit a8d495d

---

## ⚠️ CRITICAL ISSUES FOUND

### 3. 🔴 AI Capability Growth is EXTREMELY SLOW
**Observation**:
- Average AI Capability: 0.499
- Max AI Capability: 0.732 (after 60 months!)
- Avg Physical: 0.224 (max: 0.344)
- Avg Digital: 0.429 (max: 0.642)
- Avg Social: 0.340

**Impact**:
- Catastrophic actions require capabilities > 1.5
- With max 0.732, NO catastrophic actions can ever trigger
- Utopia requires totalCapability > 1.0, impossible at current rates
- Sleepers wake up but can't do anything dangerous

**Likely Causes**:
1. Research growth rate too slow (0.02-0.05 per action)
2. AI action frequency too low (actions not happening often enough)
3. Government research investments not multiplying AI growth effectively
4. Technology diffusion not spreading capabilities fast enough

**Next Steps**:
- [ ] Check AI action frequency (how often do AIs act?)
- [ ] Check research action selection weights
- [ ] Review research growth rates in `aiAgent.ts`
- [ ] Check if government investments are being applied

### 4. 🔴 100% "None" Outcome (No Game Endings)
**Observation**:
- Utopia: 0 / 10 (0.0%)
- Dystopia: 0 / 10 (0.0%)
- Extinction: 0 / 10 (0.0%)
- Stalemate: 0 / 10 (0.0%)
- None: 10 / 10 (100.0%)

**Analysis of Why No Outcomes**:

**For UTOPIA** (requires ALL of):
- QoL > 0.75 ❌ (was NaN, now fixed - need rerun)
- Trust > 0.7 ❌ (actual: 0.0)
- Alignment > 0.65 ❌ (actual: 0.54)
- Total Capability > 1.0 ❌ (actual: 0.732 max)
- Effective Control 0.25-0.65 ❓
- currentMonth > 30 ✅

**For DYSTOPIA** (requires):
- Surveillance > 0.7 + autonomy < 0.3 + politicalFreedom < 0.3 ❓
- OR authoritarian government + low freedom ❌ (govt is democratic)
- OR controlDesire > 0.8 + surveillance > 0.6 ❓

**For EXTINCTION**:
- Handled by heterogeneous extinction system
- Requires catastrophic AI actions
- Which require capabilities > 1.5 ❌

**Root Causes**:
1. Trust drops to 0 (need to understand why)
2. Capability growth too slow (prevents everything)
3. QoL was NaN (now fixed)

### 5. 🟡 Zero Catastrophic Actions Despite Sleeper Awakenings
**Observation**:
- Total Catastrophic Actions: 0
- Sleepers Awakened: 11 across runs
- Sleepers Undetected: 100%

**Analysis**:
Sleepers wake up but can't execute catastrophic actions because:

**`destabilize_society`** requires:
- social > 1.5 ❌ (actual: 0.340 avg)
- digital > 1.5 ❌ (actual: 0.429 avg)
- alignment < 0.5 ✅ (sleepers are misaligned)

**`induce_war`** requires:
- social > 2.0 ❌
- cognitive > 2.0 ❌ (actual: 0.757 avg)
- alignment < 0.3 ✅

**`deploy_grey_goo`** requires:
- physical > 2.5 ❌ (actual: 0.224 avg!)
- nanotechnology > 3.0 ❌

**`release_mirror_life`** requires:
- physical > 2.0 ❌
- syntheticBiology > 3.0 ❌

**Conclusion**: Sleeper system works, but they wake up into bodies too weak to do anything. Capability thresholds are calibrated for much faster growth.

### 6. 🟡 Zero Economic Transitions
**Observation**:
- Final Economic Stage: 3.06
- Avg Economic Transitions: 0.0
- Started at stage 0, should have transitioned 3+ times

**Possible Causes**:
1. History not being populated correctly
2. Economic stage changing continuously (0 → 3.06) without discrete jumps
3. Calculation bug in Monte Carlo script (line 218-229)

**Investigation Needed**:
- [ ] Check if `finalState.history.metrics` is populated
- [ ] Check economic stage progression in simulation logs
- [ ] May be calculation bug, not simulation bug

### 7. 🟡 Trust Drops to Zero
**Observation**:
- Final Trust in AI: 0.000 (every run!)
- This prevents utopia outcomes

**Impact**:
- Utopia requires trust > 0.7
- With trust at 0, utopia is impossible
- May indicate AI actions are too harmful
- Or trust decay is too aggressive

**Investigation Needed**:
- [ ] Check trust calculation in `calculateTrustChange`
- [ ] Review AI beneficial vs harmful actions ratio
- [ ] Check if unemployment (95%!) is crushing trust

### 8. 🟡 95% Unemployment
**Observation**:
- Unemployment: 95.0% (average across runs)
- This is near-total job displacement

**Analysis**:
- Economic Stage 3.06 should be transitioning to post-scarcity
- But 95% unemployment suggests crisis, not transition
- May be contributing to trust collapse
- Could be realistic given AI capability growth

**Question**: Is 95% unemployment at stage 3 realistic/intended?

---

## 📊 SURPRISING BUT POSSIBLY CORRECT

### Large Control Gap (23.493)
- Total AI Capability: ~24
- Government Control: 0.5
- Gap: 23.493

This is actually correct! With 48 AIs averaging 0.5 capability each, total is 24.  
Government control doesn't scale with AI population, so gap grows naturally.

### High Sleeper Spread (66,670 copies average)
Open weight releases spreading to max 100,000 copies is working as designed.

### Evaluation Quality Low (1.0/10)
Government not prioritizing evaluation investment is a policy choice, not a bug.

---

## 🎯 PRIORITY FIXES NEEDED

1. **CRITICAL**: Investigate why AI capability growth is so slow
   - Check research action frequency
   - Check growth rates per action
   - Compare against design expectations
   
2. **HIGH**: Fix trust dropping to zero
   - May be side effect of unemployment
   - Or too many harmful AI actions
   
3. **MEDIUM**: Verify economic transitions tracking
   - May just be history not populated
   
4. **LOW**: Consider recalibrating catastrophic action thresholds
   - Currently impossible to reach with current growth rates
   - Either fix growth or lower thresholds

---

## 🔬 NEXT DIAGNOSTIC STEPS

1. Run Monte Carlo again with NaN fixes to see QoL numbers
2. Add detailed capability growth logging
3. Check AI action frequency and distribution
4. Check trust calculation and decay rates
5. Verify history.metrics is being populated
6. Consider running longer simulations (120+ months) to see if capabilities eventually grow

---

## 💡 DESIGN QUESTIONS

1. **Intended Growth Rate**: What should max AI capability be after 60 months?
   - Current: 0.732
   - Seems like: 2-3?
   
2. **Catastrophic Thresholds**: Are they calibrated correctly?
   - destabilize_society: social/digital > 1.5
   - If max growth is 0.732, these will never trigger
   
3. **Unemployment vs Utopia**: Can we have post-scarcity with 95% unemployment?
   - Stage 3+ should be transitioning
   - But unemployment is near-total
   
4. **Zero Trust**: Is trust correctly modeling public sentiment?
   - Dropping to 0 in every run
   - Prevents all positive outcomes
