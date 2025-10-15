# Catastrophic Scenarios Implementation - Diagnostics

**Date:** October 8, 2025  
**Status:** Initial implementation complete, growth dynamics need fixing

## What's Working ✅

1. **Prerequisite Tracking**: All 8 scenarios track their prerequisites correctly
2. **Extinction Triggering**: When all prerequisites met, extinctions now actually trigger
3. **Dark Compute System**: Sleepers properly constrained by compute availability
4. **End-Game Thresholds**: Using realistic values (2.0 capability = 2x human level = dangerous)

## Real Problems (Not "Gameplay" Problems) 🚨

### 1. **AI Capabilities Never Reach Dangerous Levels**
**Observation**: Max capability across 10 runs: 0.541 (need 2-5 range)

**Root Cause**: Growth dynamics too slow
- Research multipliers may be too weak
- Compute scaling (Chinchilla law) may need tuning
- Self-improvement recursive effects not compounding enough

**NOT the fix**: Lowering danger thresholds artificially
**IS the fix**: Research realistic AI capability growth rates from literature

### 2. **Compute Growth Stagnant**
**Observation**: 
- 2.40x growth vs 5-10x target over 10 years
- 0 new data centers built
- Organizations profitable but not investing

**Root Cause**: Economic parameters misaligned with reality
- DC construction costs may be too high relative to revenue
- Revenue growth not feeding back into investment
- Moore's Law compound not strong enough

**Research needed**: Actual compute growth 2020-2025 (likely >5x)

### 3. **Simulations End Too Early (Month 25-35)**
**Observation**: End-game triggering at Month 9-10, resolving by Month 25-35

**Root Cause**: Capabilities growing slowly BUT thresholds are realistic
- Problem is NOT the thresholds (2.0 is correct for 2x human level)
- Problem IS that we're hitting end-game with low capabilities (0.5)
- This suggests prerequisites are being met TOO EASILY

**The fix**: Prerequisites should require HIGHER absolute capabilities
- Grey Goo: Currently requires nanotechnology > 2.5, but AIs max at 0.5
  - This means prerequisites NEVER actually met with current growth
  - Yet we're seeing Slow Displacement (6/7 steps) hitting
  - Slow Displacement prerequisites must be too easy

### 4. **QoL Exceeding Scale**
**Observation**: Basic Needs: 1.312 (should max at 1.0)

**Root Cause**: Post-scarcity multipliers not capped
**Fix**: Simple clamp to [0, 1.0]

### 5. **Control Gap Calculation Wrong**
**Observation**: Control Gap 9.711 but Max Capability 0.541

**Root Cause**: Bug in calculation or reporting
**Fix**: Review calculation, probably summing when should average

## Realistic Timescales (From Literature)

- **GPT-3 (2020)**: ~175B parameters
- **GPT-4 (2023)**: ~1.7T parameters (estimated) = 10x in 3 years
- **Compute doubling**: ~6 months (Epoch AI data)
- **10 years realistic**: 100-1000x improvement
- **Capability growth**: 2-5x over 5-10 years is plausible for AGI → ASI

## Action Plan (Based on Reality)

### Priority 1: Fix Capability Growth
Research questions:
- What's a realistic capability growth curve 2025-2035?
- How much does recursive self-improvement accelerate growth?
- At what capability level do prerequisite scenarios become possible?

### Priority 2: Fix Compute Economics
Research questions:
- What % of revenue do AI companies invest in compute?
- What's the actual cost curve for data centers 2020-2025?
- How fast is compute growing in reality?

### Priority 3: Calibrate Prerequisites
- Review each prerequisite threshold
- Ensure they require realistic absolute capability levels
- "Slow Displacement" hitting 6/7 steps with 0.5 cap is wrong
  - Either prerequisites too easy OR capabilities too low

## Key Insight

We're modeling a RESEARCH SIMULATION, not balancing a game. Every number should be defensible to AI safety researchers. The question is never "does this make good gameplay?" but "is this realistic?"

**Bad question**: "How do we make simulations last 60+ months?"  
**Good question**: "What capability growth rate matches reality, and when do catastrophic scenarios actually become possible?"

