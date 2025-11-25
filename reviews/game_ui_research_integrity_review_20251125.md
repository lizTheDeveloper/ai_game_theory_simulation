# Game UI Research Integrity Review - Phase 2 Checkpoint

**Reviewer:** Sylvia (Research Skeptic)
**Date:** November 25, 2025
**Review Type:** Quality Gate - Phase 2 to Phase 3 Transition
**Authority:** Veto power per GAME_DESIGN_DOCUMENT.md

---

## Executive Summary

**Overall Grade: B+**

The Game UI components demonstrate generally strong research integrity practices. The design philosophy correctly emphasizes uncertainty and probabilistic outcomes. However, I have identified **2 MEDIUM severity issues** and **4 LOW severity issues** that should be addressed. **No CRITICAL or HIGH severity issues** were found.

**VERDICT: CONDITIONALLY APPROVED FOR PHASE 3**

Phase 3 may proceed with the condition that MEDIUM issues are tracked and scheduled for remediation in Phase 3 or 4. LOW issues are recommendations.

---

## Review Methodology

Examined files:
- `src/components/dashboards/game/*.tsx` - All UI components
- `src/components/dashboards/game/stateMappers.ts` - State transformation logic
- `src/game/types/index.ts` - Type definitions
- `plans/game-design/GAME_DESIGN_DOCUMENT.md` - Design intent
- `plans/game-design/SCENARIO_SETUP_DESIGN.md` - Tutorial design intent

Checked for:
1. False causation claims
2. Uncertainty representation
3. Research misrepresentation
4. Pedagogical accuracy

---

## Findings by Category

### 1. FALSE CAUSATION

**Status:** MOSTLY CLEAN

The UI generally avoids making explicit causal claims. Key observations:

**POSITIVE:**
- `stateMappers.ts` correctly uses correlation-based language
- `mapOutcomes()` distributes probability based on state indicators without claiming deterministic causation
- `CascadeFlow.tsx` shows flows with descriptions that don't claim causation (line 91: `aria-label={flow.description}`)

**ISSUE M-1 (MEDIUM):** Trend indicators suggest false precision in causation

**File:** `src/components/dashboards/game/stateMappers.ts`, lines 62-84

```typescript
// Current implementation suggests trends are caused by simple threshold comparisons
trend: unlockedCount > 0 ? 5 : 0,
trendDirection: unlockedCount > 10 ? 'up' : 'neutral',
```

The trend direction is determined by hardcoded thresholds (e.g., `coordination > 0.6 ? 'up'`) without acknowledging that:
- The actual simulation may have different momentum
- Multiple factors contribute to trends
- The threshold is arbitrary, not research-backed

**Remediation:** Add a comment in the mapper explaining these are UI heuristics, not simulation-derived trends. Consider deriving trends from actual state history if available.

---

### 2. UNCERTAINTY REPRESENTATION

**Status:** PARTIALLY ADEQUATE

**POSITIVE:**
- `ChatMessage.tsx` includes uncertainty footer (line 123-125):
  ```
  "Each pathway shifts probability distributions differently.
   No option is guaranteed. What matters most to you?"
  ```
- `ScenarioSetup.tsx` explicitly states belief sliders don't affect simulation (line 449-452)
- Intervention options show `successProbability` as a percentage (line 342-349)
- Game Design Document correctly mandates "Uncertainty is explicit: Probability distributions, not point estimates"

**ISSUE M-2 (MEDIUM):** Outcome probabilities shown as point estimates without uncertainty bounds

**File:** `src/components/dashboards/game/CurrencyPanel.tsx`, lines 86-124

The outcome probabilities (utopia, alignment, struggle, collapse, extinction) are displayed as single percentages:
```typescript
{formatPercent(outcomes.utopia)}  // Shows "10%" not "8-12%"
```

The simulation has inherent uncertainty in these estimates. The UI shows false precision by displaying point estimates without confidence intervals.

**Research context:** Per GAME_DESIGN_DOCUMENT.md line 253: "Uncertainty is explicit: Probability distributions, not point estimates"

**Remediation:** Either:
a) Show probability ranges (e.g., "8-12%")
b) Add a visual indicator that these are estimates (e.g., blur/gradient effect)
c) Include a tooltip explaining the uncertainty in these estimates

---

### 3. RESEARCH MISREPRESENTATION

**Status:** GOOD

**POSITIVE:**
- The simulation correctly maps to research scenarios (consensus, favorable, challenging) as described
- No binary win/lose outcomes - uses 7-tier classification
- Player influence is correctly bounded (15% max per `INFLUENCE_BOUNDS`)
- The stateMappers don't invent relationships not in the simulation

**ISSUE L-1 (LOW):** Outcome calculation in `mapOutcomes()` uses ad-hoc distribution logic

**File:** `src/components/dashboards/game/stateMappers.ts`, lines 131-144

```typescript
// Calculate intermediate states from QoL and environmental factors
const qolScore = state.globalMetrics?.qualityOfLife ?? 0.5;
const envDebt = state.environmentalAccumulation?.pollutionLevel ?? 0;

// Distribute remaining probability based on state indicators
const remaining = Math.max(0, 1 - utopia - extinction);
const alignment = remaining * (qolScore > 0.6 ? 0.4 : 0.2);
const collapse = remaining * (envDebt > 50 ? 0.4 : 0.2);
```

This ad-hoc probability distribution (hardcoded 0.4/0.2 factors) is a UI heuristic, not derived from simulation outcome classification. While acceptable for Phase 2, it should be replaced with actual simulation-derived probabilities.

**Remediation:** Connect to `OutcomeInterpreter` from game layer for research-validated probability distribution.

**ISSUE L-2 (LOW):** AI Capability tier requirements are hardcoded display values

**File:** `src/components/dashboards/game/ResearchTree/ResearchTree.tsx`, lines 107-116

```typescript
const TIER_CONFIG = [
  { tier: 0, name: 'Tier 0', requirement: 'AI Cap: 0.0-0.5' },
  { tier: 1, name: 'Tier 1', requirement: 'AI Cap: 0.5-1.0' },
  // ...
```

These should be derived from the actual tech tree configuration, not hardcoded in the UI. If research updates the requirements, the UI would show stale data.

**Remediation:** Import tier requirements from `comprehensiveTechTree.ts` or tech tree types.

---

### 4. PEDAGOGICAL ACCURACY

**Status:** EXCELLENT

**POSITIVE:**
- `ScenarioSetup.tsx` correctly explains:
  - Player role as "Alignment Architect" with indirect influence (lines 158-174)
  - That choices "shift probabilities" not "guarantee outcomes" (lines 172-173)
  - Scenarios represent "different edges of scientific uncertainty" (lines 199-201)
  - Belief sliders are for research comparison, not simulation control (lines 447-452)

- The belief calibration questions are appropriately phrased:
  - "How likely is transformative AI within 10 years?" (reasonable framing)
  - "What probability would you assign to human extinction from AI by 2050?" (explicit probability)

**ISSUE L-3 (LOW):** Missing uncertainty qualifier on scenario descriptions

**File:** `src/components/dashboards/game/ScenarioSetup/ScenarioSetup.tsx`, lines 49-71

The scenario descriptions are clear but could benefit from explicit uncertainty ranges:
- "Consensus" - could note "median forecasts with typical 25-75% uncertainty range"
- "Favorable" - could note "optimistic end of peer-reviewed uncertainty ranges"
- "Challenging" - already notes "unfavorable edges of legitimate uncertainty" (good)

**Remediation:** Add brief uncertainty context to Consensus and Favorable scenario descriptions.

**ISSUE L-4 (LOW):** "Days remaining" for decisions is non-research terminology

**File:** `src/components/dashboards/game/PendingDecisions.tsx`, line 37-40

```typescript
const getUrgencyText = (urgency: Decision['urgency'], daysRemaining: number) => {
  const capitalizedUrgency = urgency.charAt(0).toUpperCase() + urgency.slice(1);
  return `${capitalizedUrgency} - ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`;
```

The simulation runs in months, but UI shows "days remaining." This temporal mismatch could confuse players about the simulation's time resolution.

**Remediation:** Either convert to "months remaining" or add clarifying tooltip about the relationship between game-days and simulation-months.

---

## Issues Summary Table

| ID | Severity | Component | Issue | Blocks Phase 3? |
|----|----------|-----------|-------|-----------------|
| M-1 | MEDIUM | stateMappers.ts | Trend indicators use hardcoded thresholds, not simulation-derived | No |
| M-2 | MEDIUM | CurrencyPanel.tsx | Outcome probabilities shown as point estimates without uncertainty | No |
| L-1 | LOW | stateMappers.ts | Ad-hoc probability distribution for intermediate outcomes | No |
| L-2 | LOW | ResearchTree.tsx | Hardcoded tier requirements | No |
| L-3 | LOW | ScenarioSetup.tsx | Missing uncertainty qualifiers on scenario descriptions | No |
| L-4 | LOW | PendingDecisions.tsx | Days vs months temporal mismatch | No |

---

## Commendations

1. **Citation system is research-ready:** The `CitationTooltip` component provides a solid foundation for linking all displayed values to their research sources.

2. **Clear player agency framing:** The ScenarioSetup wizard correctly establishes that players "influence" rather than "control," with the memorable quote: "Your choices shift probabilities. They don't guarantee outcomes."

3. **Uncertainty footer on interventions:** The ARIA chat message explicitly states "Each pathway shifts probability distributions differently. No option is guaranteed."

4. **Read-only state architecture:** Using `Readonly<GameState>` for snapshots prevents accidental research parameter mutation from UI code.

5. **Belief calibration as diagnostic:** Correctly separating player belief capture from simulation parameters demonstrates research integrity.

---

## Recommendations for Phase 3

1. **Add uncertainty bands to outcome display:** Even simple ranges (e.g., "8-15%") would significantly improve uncertainty communication.

2. **Connect outcome probabilities to OutcomeInterpreter:** Replace the ad-hoc distribution with the game layer's validated outcome classification.

3. **Add "last updated" indicators:** For metrics that change over time, show when they were last calculated to emphasize they are snapshots, not live values.

4. **Consider Monte Carlo confidence intervals:** For key metrics, show how much variation occurs across simulation runs with the same starting conditions.

---

## Approval Statement

Based on this review, I **CONDITIONALLY APPROVE** Phase 3 to proceed.

**Conditions:**
- MEDIUM issues (M-1, M-2) must be added to the Phase 3 or Phase 4 backlog
- No new features may introduce CRITICAL or HIGH research integrity issues
- Each Phase 3 sprint should include a lightweight research integrity checkpoint

**Non-blocking recommendations:**
- LOW issues should be addressed when touching relevant components
- Consider adding visual uncertainty indicators as part of UX polish

---

**Signed:** Sylvia (Research Skeptic Agent)
**Date:** November 25, 2025

*"Better to find the problems now than after deployment."*
