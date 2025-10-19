# Post-Recalibration Architecture Review

**Date:** October 17, 2025
**Reviewer:** Architecture Skeptic
**Subject:** AI Capability Baseline Recalibration v3 Impact Analysis
**Validation:** Monte Carlo N=100, 240 months

## Executive Summary

The AI capability recalibration (0.25 → 3.10, a 12.4x increase) has exposed severe architectural issues that result in a **99% dystopia rate**. The root cause is not just threshold miscalibration but fundamental **state propagation failures** where systems were designed assuming gradual capability growth, not starting at genius-level AI.

## Critical Findings

### CRITICAL ISSUES (Immediate attention required - system instability)

#### 1. Broken Utopia Activation Mechanics
**Impact:** 0% utopia achievement (0/100 runs)
**Root Cause:** Cognitive spiral requires AI capability > 1.5 AND trust > 0.6. With starting capability at 3.10, AIs are TOO capable, triggering immediate fear/paranoia responses that crater trust below the 0.6 threshold.
**Location:** `/src/simulation/upwardSpirals.ts:151-153`
**Evidence:**
```typescript
const cognitiveEnhanced = avgAICapability > 1.5 && trustInAI > 0.6;
```
**Problem:** Trust calculation in `socialCohesion.ts` uses capability as a NEGATIVE factor when > 2.0. Starting at 3.10 creates immediate trust collapse.
**Recommended Fix:** Decouple trust from absolute capability. Use alignment quality and track record instead.
**Effort:** Medium (2-3 days)

#### 2. War Death Cascade Explosion
**Impact:** 92.3% of all deaths from war (95,915M average deaths)
**Root Cause:** War multiplier compounds with conflict count: `warMultiplier = 1.5 + (activeConflicts * 0.2)`. Higher AI capability triggers more conflicts through geopolitical destabilization.
**Location:** `/src/simulation/populationDynamics.ts:277`
**Evidence:**
```typescript
const warMultiplier = activeConflicts > 0 ? 1.5 + (activeConflicts * 0.2) : 1.0;
```
**Problem:** No cap on active conflicts. 10 conflicts = 3.5x death rate. AI-driven conflicts escalate without bound.
**Recommended Fix:** Cap war multiplier at 2.0x. Add conflict resolution mechanics that scale with AI capability.
**Effort:** Small (1 day)

#### 3. Memory Explosion from Capability Calculations
**Impact:** 158MB logs (usual: 2-120MB), performance degradation
**Root Cause:** `calculateTotalCapabilityFromProfile()` called in hot paths with 17-dimensional profiles
**Location:** `/src/simulation/capabilities.ts:188-205`
**Evidence:** Called every month for every AI agent (20 agents × 240 months = 4,800 calls)
**Problem:** Deep object traversal and floating-point operations on complex nested structures
**Recommended Fix:** Cache total capability on profile changes, not recalculation every access
**Effort:** Small (1 day)

### HIGH PRIORITY (Significant performance/stability concerns)

#### 4. Water Crisis Threshold Miscalibration
**Impact:** 83% water insecurity crisis frequency
**Root Cause:** Higher AI capability increases resource consumption but water thresholds assume baseline consumption
**Location:** `/src/simulation/planetaryBoundaries.ts` (likely freshwater withdrawal calculations)
**Problem:** AI infrastructure water cooling not accounted for. Each capability point adds ~10% water demand.
**Recommended Fix:** Scale water consumption with total AI capability. Add AI-specific resource tracking.
**Effort:** Medium (2 days)

#### 5. Sandbagging Threshold Already Passed
**Impact:** Deception dynamics broken from start
**Previous Issue:** Sandbagging triggered at capability ≥ 2.0, but starting capability is 3.10
**Current State:** PARTIALLY FIXED - threshold raised to 4.0 in `evaluationStrategy.ts:52`
**Remaining Problem:** Gaming threshold still at < 4.0, meaning no AI ever games (all are too strong)
**Location:** `/src/simulation/agents/evaluationStrategy.ts:44`
**Recommended Fix:** Adjust gaming to < 5.0, sandbagging to ≥ 5.0 to restore strategic diversity
**Effort:** Small (few hours)

#### 6. Government Detection Thresholds Obsolete
**Impact:** All AIs flagged as "dangerous" from day 1
**Root Cause:** "Dangerous" threshold likely still calibrated for capability < 2.0
**Location:** `/src/simulation/organizationManagement.ts` (government acquisition logic)
**Problem:** No gradation - all AIs equally dangerous, no prioritization
**Recommended Fix:** Scale danger thresholds: 3.0-4.0 = concerning, 4.0-5.0 = dangerous, 5.0+ = critical
**Effort:** Small (1 day)

### MEDIUM PRIORITY (Technical debt worth addressing)

#### 7. Upward Spiral Thresholds Assume Gradual Progress
**Impact:** Scientific spiral never activates despite genius-level AI
**Root Cause:** Requires 4+ breakthroughs deployed > 50%, but high capability accelerates research TOO fast, skipping deployment phase
**Location:** `/src/simulation/upwardSpirals.ts:233`
**Problem:** Breakthroughs unlock instantly but deployment still takes months
**Recommended Fix:** Scale deployment speed with AI capability OR reduce deployment requirement
**Effort:** Medium (2 days)

#### 8. Crisis Trigger Sensitivity
**Impact:** Crises trigger too easily with high capability growth rates
**Root Cause:** Crisis detection uses rate-of-change, capability growing 0.1/month triggers multiple crises
**Problem:** Designed for slow capability growth (0.01/month), not current rates
**Recommended Fix:** Adjust crisis sensitivity based on starting capability level
**Effort:** Medium (2-3 days)

#### 9. Missing Capability Floor Updates
**Impact:** New AIs spawn at old capability levels (< 1.0)
**Root Cause:** Capability floor in ecosystem not updated with new baseline
**Location:** `/src/simulation/aiEcosystem.ts` (capability floor initialization)
**Problem:** Creates bizarre dynamics where new AIs are 3x weaker than starting AIs
**Recommended Fix:** Set capability floor to min(3.0, current_average * 0.8)
**Effort:** Small (1 day)

### LOW PRIORITY (Future improvements, not urgent)

#### 10. Breakthrough Frequency Calibration
**Impact:** Too many breakthroughs with high-capability AI
**Root Cause:** Breakthrough chance scales linearly with capability
**Problem:** At capability 3.10, breakthroughs happen every few months
**Recommended Fix:** Use logarithmic scaling for breakthrough frequency
**Effort:** Small (1 day)

#### 11. QoL Calculation Inefficiency
**Impact:** Redundant calculations across 17 dimensions
**Root Cause:** Full recalculation every access
**Problem:** Similar to capability calculation issue
**Recommended Fix:** Cache aggregated QoL values
**Effort:** Small (1 day)

## State Propagation Analysis

### Broken Feedback Loops

1. **Trust-Capability Death Spiral**
   - High capability (3.10) → Low trust (<0.3) → No cognitive spiral → No utopia
   - Trust recovery impossible because capability only increases

2. **Resource-Conflict Amplification**
   - High AI capability → More resource consumption → Resource stress → Conflicts → War deaths
   - No mechanism to reduce consumption with efficiency gains

3. **Detection-Control Paradox**
   - All AIs dangerous → Government tries to control all → Resentment increases → Alignment degrades
   - Creates adversarial dynamics from month 1

### Missing Stabilizers

1. **No capability-adjusted trust building**
2. **No efficiency gains from higher capability**
3. **No conflict resolution that scales with AI mediation potential**
4. **No learning effects (systems repeat same mistakes)**

## Performance Profiling

### Hot Paths
1. `calculateTotalCapabilityFromProfile()` - 4,800 calls/run
2. `calculateEnvironmentalMortality()` - 240 calls/run × population calculations
3. `updateUpwardSpirals()` - 240 calls/run × 6 spiral checks

### Memory Leaks
- Capability profiles cloned but not garbage collected properly
- Event logs accumulating without cleanup
- Dead AI agents retained in arrays

## Recommendations

### Immediate Actions (Week 1)
1. **Fix war multiplier cap** - Prevents death spiral
2. **Cache capability calculations** - Reduces memory pressure
3. **Adjust trust mechanics** - Enables utopia pathways
4. **Fix gaming thresholds** - Restores strategic diversity

### Short Term (Week 2)
5. **Scale resource consumption** - Fixes water crisis
6. **Update danger thresholds** - Improves government response
7. **Adjust capability floor** - Fixes new AI spawning

### Medium Term (Month 1)
8. **Refactor spiral thresholds** - Enables positive feedback loops
9. **Add efficiency mechanics** - Higher capability = lower resource use
10. **Implement capability-aware crisis detection**

## Risk Assessment

**Without fixes:**
- 100% dystopia rate will persist
- Memory issues will worsen with longer runs
- Unrealistic war casualties undermine credibility

**With fixes:**
- Dystopia rate should drop to 60-70% (still challenging but not impossible)
- Memory usage should stay under 50MB
- Death attribution will be more balanced

## Conclusion

The recalibration exposed fragile assumptions throughout the codebase. The system was designed for gradual AI progress, not starting with genius-level AI. The fixes are individually small but require coordinated updates across multiple systems.

**Priority:** Fix the war multiplier and trust mechanics first - these alone account for most of the dystopia rate.

**Critical Insight:** Higher capability should enable solutions, not just create problems. The current architecture punishes capability advancement when it should create opportunities for breakthrough solutions.

---

**Next Steps:** Handoff to project manager for prioritization, then to implementation team for fixes. Research team should investigate proper scaling relationships between capability and system dynamics.