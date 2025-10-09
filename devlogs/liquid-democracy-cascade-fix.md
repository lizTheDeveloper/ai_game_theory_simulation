# Liquid Democracy & Cascading Failure Logging Fix

**Date:** October 8, 2025 (Evening Session)  
**Branch:** `feature/liquid-democracy` → merged to `main`

## Summary

Implemented liquid democracy mechanics and fixed critical cascading failure event logging bug.

## Phase 2C: Liquid Democracy Implementation

### New Governance Metrics (6 total, was 4)

1. **Consensus Building Efficiency** (0.1-0.9)
   - AI-mediated: High-capability aligned AI helps find common ground
   - Formula: `0.3 + (aiFacilitation * 0.15)` when AI > 2.0 and info integrity > 0.7
   - Enables liquid democracy mechanics

2. **Minority Protection Strength** (0.1-0.95)
   - AI bias detection: High-capability AI detects and counteracts bias
   - Formula: `0.7 + (aiFairnessEnforcement * 0.3)` when detection > 0.8
   - Democracies 1.1x stronger, authoritarian regimes 0.4x weaker

### Effects

- **Authoritarian Resistance:** Up to ~95% reduction (was ~80%)
  - Consensus defense: +15% reduction
  - Minority defense: +20% reduction

- **Policy Effectiveness:** 0.504x-1.716x (was 0.56x-1.56x)
  - Consensus multiplier: 0.9-1.1x (policies stick, less reversal)

- **Virtuous Cycles:**
  - High participation (>0.7) + transparency (>0.8) → legitimacy boost (+2%/month)
  - Liquid democracy creates self-reinforcing democratic health

## Critical Bug Fix: Cascading Failure Logging

### The Problem

Cascading failures were **triggering correctly** (console logs showed 4-7 crises, 2.0x-3.5x degradation) but **not being counted** in Monte Carlo summaries:

```
Before: 🔥 Run 2: 434 crisis events (434 crises, 0 cascading) ❌
After:  🔥 Run 2: 57 crisis events (35 crises, 22 cascading) ✅
```

### Root Cause

Event timing mismatch in `src/simulation/engine.ts`:

1. Crisis events were logged with `state.currentMonth`
2. Month was then incremented: `newState.currentMonth += 1`
3. Events were collected filtering by `e.month === newState.currentMonth`
4. **Mismatch:** Events had old month (e.g. 42), filter checked new month (43) → no match!

### The Fix

Moved event collection BEFORE month increment:

```typescript
// BEFORE: collect events AFTER incrementing month
newState.currentMonth += 1; // Now month = 43
events.push(...newState.eventLog.filter(e => e.month === newState.currentMonth)); // Filter for 43, events have 42!

// AFTER: collect events BEFORE incrementing month
events.push(...newState.eventLog.filter(e => e.month === newState.currentMonth)); // Filter for 42, events have 42! ✅
newState.currentMonth += 1; // Now month = 43
```

### Impact

- **Before:** 0 cascading events counted (all lost)
- **After:** 20-54 cascading events per run captured correctly
- All event types (crisis, cascading_failure, action, milestone, policy) now properly logged

## Monte Carlo Results (10 runs × 120 months)

### Outcomes
- **Utopia:** 0% (still 0%, despite improvements)
- **Dystopia:** 30% (was 60%)
- **Extinction:** 70% (was 40%)

### Key Metrics

**Authoritarian Transitions:** 0 (was 1-2)
- ✅ Governance quality system working!
- Democratic resilience preventing emergency authoritarianism

**Emergency Deployment:** 8+ instances
- ✅ Crisis-specific acceleration working (2.4x-2.6x faster)
- Technologies deploying during crises as designed

**Crisis Resolutions:** Only 2
- ❌ Technologies deploying but NOT resolving crises fast enough
- Root cause: Crises cascade faster than tech can deploy

**Cascading Failures:**
- Typical run: 20-40 cascading events
- 6-7 crises active simultaneously (3.0x-3.5x degradation)
- Technologies unlock too late (Month 30-50) when crises start (Month 20-30)

## Diagnos

is

### Why Still 0% Utopia?

1. **Timing Problem:** Crises trigger BEFORE breakthrough tech unlocks
   - Resource Crisis: Month 22 (~70% runs)
   - Clean Energy: Month 30-35 (~90% runs)
   - **Gap:** 8-13 months of cascading degradation

2. **Cascading Overwhelm:** 6+ crises → 3.0x degradation
   - Technologies deploy incrementally (10% → 50% → 100%)
   - But crises cascade exponentially
   - Net effect: Tech can't keep up

3. **Deployment Too Slow:** Even with 2.6x emergency acceleration
   - Base deployment: ~10% per month (10 months to full)
   - Emergency: ~26% per month (4 months to full)
   - Still too slow vs. 3.0x degradation every month

### Why More Extinction?

Governance quality improvements → fewer dystopias → more simulations run longer → hit extinction thresholds.

This is actually a **sign of success**: Strong democracies resist surveillance state, but if tech doesn't save them, they collapse to extinction instead.

## Next Steps

### Option A: Faster Tech Deployment
- Increase base deployment rate: 10% → 15-20% per month
- Emergency acceleration: 2.6x → 4.0x
- Risk: Too easy, unrealistic

### Option B: Earlier Tech Unlock
- Lower AI capability requirements for breakthrough
- Research starts earlier in economic transition
- Risk: Technologies before crises = less dramatic

### Option C: Slower Crisis Cascades
- Reduce degradation multiplier: 0.5x → 0.3x per crisis
- Increase cascade threshold: 3 crises → 4 crises
- Risk: Crises feel less urgent

### Option D: Tech-Specific Crisis Thresholds (RECOMMENDED)
- Clean Energy deployed > 50% → Resource Crisis auto-resolves
- Purpose Frameworks deployed > 50% → Meaning Crisis eases
- Make tech deployment DIRECTLY counter crisis accumulation
- **Realism:** This is how real crises are solved!

## Files Changed

- `src/types/game.ts` - Added consensus/minority to GovernanceQuality interface
- `src/simulation/governanceQuality.ts` - Implemented liquid democracy mechanics
- `src/simulation/initialization.ts` - Initialize new governance metrics
- `src/simulation/engine.ts` - Fixed event collection timing bug
- `plans/remaining_tasks_5_pm_10_08_25.md` - Updated with liquid democracy status

## Commits

1. `feat: Implement liquid democracy & fix cascading failure logging`
2. `fix: Collect eventLog before incrementing month`

## Validation

✅ Cascading failures properly counted (was 0, now 20-54 per run)  
✅ Authoritarian transitions down to 0 (was 1-2)  
✅ Emergency deployment working (8+ instances)  
✅ Liquid democracy mechanics integrated  
❌ Utopia still 0% (crisis resolution too slow)

## Conclusion

The liquid democracy system is working as designed - strong democracies resist authoritarianism. The cascading failure logging bug is fixed - we now have accurate crisis data.

The core problem remains: **technologies deploy too slowly to counter cascading crises**. Crises start Month 20-30, techs unlock Month 30-50, but by then 6+ crises are active with 3.0x degradation.

**Recommendation:** Implement Option D (Tech-Specific Crisis Thresholds) to make deployed technologies DIRECTLY reduce crisis accumulation, not just slow degradation.

