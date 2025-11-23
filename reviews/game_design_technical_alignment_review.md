# Phase 1 Technical Spec: Game Design Alignment Review

**Reviewer:** Maya (Game Designer)
**Date:** Current Session
**Document Reviewed:** `plans/game-design/PHASE1_TECHNICAL_SPEC.md` (v1.0)
**Reference:** `plans/game-design/GAME_DESIGN_DOCUMENT.md` (v2.0)
**Status:** APPROVED with Recommendations

---

## Summary Verdict

Roy's Phase 1 Technical Specification successfully translates the game design vision into an implementable architecture. The strict game/simulation separation preserves research integrity while the bounded influence system enables meaningful (if constrained) player agency.

**VERDICT: APPROVED** - Ready for implementation with recommendations.

---

## Core Gameplay Loop Assessment

### Monitor - Intervene - Adapt - Transcend

| Phase | Months | GDD Requirement | Technical Support | Assessment |
|-------|--------|-----------------|-------------------|------------|
| **Monitor** | 1-24 | Observe trajectories, track boundaries | `SimulationObserver.ts`, `MetricsCollector.ts`, event subscriptions | FULLY SUPPORTED |
| **Intervene** | 12-72 | Launch campaigns, coordinate dialogue | `AdvocacyAction` catalog, `InfluenceCalculator.ts`, `PlayerDecisionPhase` | FULLY SUPPORTED |
| **Adapt** | 36-96 | Adjust strategies based on outcomes | `CriticalJunctureDetector.ts`, decision history | PARTIALLY SUPPORTED |
| **Transcend** | 84-120 | Final interventions, witness emergence | `OutcomeInterpreter.ts`, outcome classification | SUPPORTED |

**Note on "Adapt" Phase:** The technical spec supports adaptation but lacks explicit feedback mechanisms showing causal attribution of player actions. Players need to see "your campaign caused X" not just outcome distributions.

---

## Scenario System Alignment

**FULLY ALIGNED**

| GDD Scenario | Technical Implementation | Deviation Limit | Status |
|--------------|--------------------------|-----------------|--------|
| Baseline (Consensus) | `baseline.ts` | 0% (IS baseline) | CORRECT |
| Optimistic (Best Case) | `optimistic.ts` | 12% | CORRECT |
| Pessimistic (Worst Case) | `pessimistic.ts` | 14% | CORRECT |
| Custom Research | `custom` scenario ID | Requires validation | DEFERRED (Phase 2) |

Research scenario mapping to `ScenarioDefinition` type with Monte Carlo validation (N=100, CV < 0.01%) is correctly specified.

---

## Influence Bounds Analysis

### Current Specification

| Bound Type | Limit | Purpose |
|------------|-------|---------|
| Single Action | 5% | Prevent any one choice from dominating |
| Per-Domain | 10% | Allow focus without total dominance |
| Cumulative Total | 15% | Research integrity (baseline preservation) |
| Single Choice Outcome | 20% | Upper bound on player agency |

### Concern: Influence Exhaustion

**Problem:** 5% per action with 15% cumulative cap creates "influence exhaustion" early in the game.

**Math:**
- 120-month simulation
- If player can take ~1 action/month at 5% effect
- Cumulative cap hit by month ~3-6
- Remaining 115+ months with no meaningful influence

**Impact:** Players will have nothing meaningful to do during the Adapt phase (months 36-96). The optimal strategy becomes "spend all influence early" which undermines the adaptive gameplay loop.

**Recommendation:** Implement influence decay (10-20% per 12 months) to refresh capacity while maintaining 15% instantaneous cap. This allows sustained engagement without violating research bounds.

---

## Feature Support Matrix

### What's Well-Supported

| GDD Feature | Technical Support | Notes |
|-------------|-------------------|-------|
| Advocacy campaigns | `AdvocacyAction` type, 6 influence mechanisms | Complete |
| Coalition building | `Coalition` type in advocacy module | Minimal but sufficient |
| Research recommendations | `funding_weight` mechanism | Mapped to existing system |
| Crisis response | `CrisisResponseId` queue | Integrated with juncture detection |
| Save/load replayability | `SaveManager`, RNG state preservation | Deterministic replay enabled |
| Scenario selection | `ResearchScenarioId` enum | 3 scenarios + custom |

### Gaps Identified

| GDD Feature | Technical Gap | Recommendation |
|-------------|---------------|----------------|
| "What should I focus on?" guidance | No tutorial hooks | Add `TutorialState` interface to Phase 2 |
| Research citation visibility | `GameLayerEvent` exists but no citation event | Add `citation_requested` UI event |
| Uncertainty visualization | Not specified | Add `uncertainty_expanded` UI event |
| Counterfactual analysis | Decision history exists, no comparison | Defer to Phase 2 |
| Phase transition feedback | Not specified | Add `phase_transition` UI event |

---

## Alignment Architect Narrative Fit

**STRONG FIT**

The technical architecture reinforces the narrative:

1. **Queued Decisions:** Player proposes, `PlayerDecisionPhase` processes
2. **Bounded Effects:** Architecture enforces "influence, not control"
3. **Observer Pattern:** Player watches events unfold, responds indirectly
4. **Read-Only State Access:** Can observe everything, control nothing directly

The architecture IS the narrative - you're an advisor, not a dictator.

---

## Answers to Roy's Open Questions

### Q1: Custom Scenarios - Phase 1 or Phase 2?

**Answer: Phase 2**

Rationale: Custom scenarios require:
- Parameter validation UI
- Monte Carlo validation integration
- Research documentation system
- Academic user authentication

Too complex for MVP. Focus on three validated scenarios first.

### Q2: Influence Decay?

**Answer: YES - Essential**

Rationale: Without decay, the 15% cumulative cap creates degenerate strategy ("spend early"). Decay enables sustained engagement while maintaining instantaneous bounds.

Suggested implementation:
```typescript
// Monthly influence decay (10% per 12 months = ~0.83%/month)
const decayedInfluence = currentInfluence * Math.pow(0.9, monthsElapsed / 12);
```

### Q3: Coalition Complexity?

**Answer: Minimal for Phase 1**

Suggested scope:
- 3 predefined coalition types (Academic, Government, Private Sector)
- Binary join/leave state
- Simple effectiveness multiplier (1.2x when active)
- No negotiation mechanics

Defer multi-party diplomacy to Phase 2.

### Q4: Counterfactual Tracking?

**Answer: Phase 2**

"What if" analysis is valuable for academic users but not MVP. The decision history infrastructure supports it - implementation can wait.

### Q5: Minimal UI for Phase 1?

**Answer:**
- Advocacy action queue (submit decisions)
- Event log (observe simulation)
- Outcome indicator (7-tier classification display)
- Influence budget meter (track remaining capacity)

Defer progressive disclosure UI layers to Phase 3.

---

## Critical Juncture Specification Gap

The spec includes `CriticalJunctureDetector.ts` but doesn't define:
- What constitutes a critical juncture
- Intervention window timing
- Available response options
- Urgency levels

**Recommended Addition:**

```typescript
interface CriticalJuncture {
  type: 'climate_tipping' | 'ai_breakthrough' | 'geopolitical_crisis' | 'social_inflection';
  triggerMonth: number;
  windowDuration: number;  // Months before window closes
  availableResponses: CrisisResponseId[];
  urgency: 'immediate' | 'near_term' | 'emerging';
  baseOutcome: OutcomeProbabilities;  // If no intervention
}
```

---

## UI Event Types for Tessa

The GDD specifies 4-phase progressive disclosure. Technical spec should define UI-specific events:

```typescript
type UILayerEvent =
  | { type: 'phase_transition'; from: GamePhase; to: GamePhase }
  | { type: 'citation_requested'; parameterId: string; source: ResearchSource }
  | { type: 'uncertainty_expanded'; metricId: string; distribution: Distribution }
  | { type: 'influence_applied'; actionId: string; effect: InfluenceOutcome }
  | { type: 'juncture_window_opening'; juncture: CriticalJuncture }
  | { type: 'juncture_window_closing'; juncture: CriticalJuncture; timeRemaining: number };
```

---

## Recommendations Summary

### Must Address (Before Implementation)

1. **Influence Decay:** Add to Phase 1C scope to prevent influence exhaustion
2. **Critical Juncture Types:** Define what triggers intervention windows

### Should Address (Phase 1)

3. **Influence Attribution:** Show players causal effect of their actions
4. **Checkpoint Auto-saves:** Add at phase transitions (months 24, 72, 96)

### Can Defer (Phase 2+)

5. Tutorial/onboarding system
6. Custom research scenarios
7. Counterfactual comparison tools
8. Complex coalition negotiations
9. Full progressive disclosure UI

---

## Conclusion

Roy's Phase 1 Technical Specification is well-designed and correctly implements the game design vision. The strict separation between game and simulation layers preserves research integrity while enabling the "Alignment Architect" player experience.

The main concern is influence exhaustion due to the cumulative cap without decay - this should be addressed in Phase 1C to maintain player engagement throughout the 120-month simulation.

**APPROVED** - Ready to proceed with implementation. Recommend addressing influence decay before Phase 1C begins.

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Current Session | Initial review |

---

## Approval Status

| Role | Agent | Status | Date |
|------|-------|--------|------|
| Game Design Lead | Maya | APPROVED | Current Session |
| Technical Lead | Roy | AUTHOR | Current Session |
| Research Integrity | Sylvia | APPROVED (with conditions) | Current Session |
