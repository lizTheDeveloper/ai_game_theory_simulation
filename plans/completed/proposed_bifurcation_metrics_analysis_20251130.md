# Bifurcation Metrics Analysis

**Status:** PROPOSED (Nov 30, 2025)
**Priority:** HIGH
**Estimated Effort:** 4-6 hours
**Rationale:** First utopia achieved but unexplainable - need divergence tracking to understand WHEN and WHY bifurcation occurs

## Problem Statement

Run 42007 achieved utopia (22.4% mortality) vs baseline 88-99% dystopia. We know:
- Technology bifurcation threshold crossed (60% deployment)
- Regime feedback loops operational (1.5× climate/social, 0.7× tech)
- Outcome: UTOPIA instead of PYRRHIC_DYSTOPIA

**What we DON'T know:**
- WHEN did the divergence happen? (which month? which phase?)
- WHICH mechanics drove it? (tech deployment? regime multipliers? crisis avoidance?)
- WHY this run? (what was different from the 9 dystopias?)

Cannot improve what we cannot measure.

## Proposed Solution

**Phase 1: Divergence Point Detection** (1-2h)
- Add `bifurcationMetrics` to GameState
- Track month-by-month deltas vs baseline trajectory
- Detect divergence point (first month with >10% deviation)
- Log critical metrics at divergence (tech deployed, regime, boundaries)

**Phase 2: Critical Path Analysis** (1-2h)
- Instrument key decision points:
  - Tech deployment rate (order 1.6)
  - Regime shift triggers (order 4.5)
  - Crisis cascade breakpoints (various phases)
- Log decision tree: "Why tech X deployed at month Y?"
- Track counterfactual: "What if regime didn't shift?"

**Phase 3: Outcome Attribution** (1-2h)
- Decompose mortality reduction:
  - Tech effectiveness: -X%
  - Regime multipliers: -Y%
  - Crisis avoidance: -Z%
- Calculate Shapley values for major mechanics
- Answer: "Which systems contributed most to utopia?"

**Phase 4: Validation** (1h)
- Run N=10 with divergence tracking
- Compare divergence points across runs
- Identify common patterns in utopia paths
- Save to `reviews/bifurcation_divergence_analysis_YYYYMMDD.md`

## Implementation Details

**GameState additions:**
```typescript
bifurcationMetrics: {
  baselineTrajectory: number[];  // Reference dystopia mortality curve
  currentDeviation: number;       // % deviation from baseline
  divergenceMonth: number | null; // First month with >10% deviation
  divergencePhase: string | null; // Which phase triggered divergence
  criticalPath: {
    month: number;
    phase: string;
    decision: string;
    impact: number;
  }[];
}
```

**Logging pattern:**
```typescript
// In BifurcationLogicPhase
if (Math.abs(deviation) > 0.1 && !state.bifurcationMetrics.divergenceMonth) {
  state.bifurcationMetrics.divergenceMonth = state.currentMonth;
  state.bifurcationMetrics.divergencePhase = 'BifurcationLogicPhase';
  console.log(`🎯 DIVERGENCE DETECTED: Month ${state.currentMonth}, deviation ${deviation.toFixed(2)}`);
}
```

## Expected Outcomes

1. **Explainability:** Can answer "Why utopia?" with data
2. **Reproducibility:** Can engineer utopia paths deliberately
3. **Debugging:** Can identify broken mechanics (no divergence when expected)
4. **Research validation:** Can compare to real-world intervention timing

## Research Foundation

- Scheffer et al. (2009): Critical transitions early warning signals
- Lenton et al. (2008): Tipping point detection methods
- Complex systems attribution (Pearl causality framework)

## Success Criteria

- [ ] Divergence point detection operational
- [ ] Critical path logging integrated
- [ ] Shapley value attribution calculated
- [ ] N=10 validation shows consistent patterns
- [ ] Report: `reviews/bifurcation_divergence_analysis_YYYYMMDD.md`

## Dependencies

- BifurcationLogicPhase operational (✅)
- Regime multipliers integrated (✅)
- Monte Carlo determinism (✅)

## Risks

- **State bloat:** Tracking full trajectory = memory overhead
- **Performance:** Shapley calculation = exponential combinations
- **Interpretation:** Attribution ≠ causation

## Mitigation

- Sample trajectory at key checkpoints only (not every month)
- Approximate Shapley with Monte Carlo sampling
- Document assumptions, validate with domain experts
