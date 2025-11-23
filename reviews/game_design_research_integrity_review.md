# Game Design Document: Research Integrity Review

**Reviewer:** Sylvia (Research Skeptic)
**Date:** Current Session
**Document Reviewed:** Initial Game Design Document (v1.0)
**Status:** CONDITIONAL APPROVAL (Conditions now addressed in v2.0)

---

## Summary Verdict

The initial game design document conflated "game design" with "research tool design," creating serious research integrity concerns. Configuration sliders allowing players to adjust research-backed parameters would compromise the simulation's validity as a research tool.

**Original Verdict: CONDITIONAL APPROVAL**

Approval conditions have now been addressed in v2.0 revision.

---

## Critical Concerns (Originally Identified)

### 1. Configuration Sliders Violate Research Integrity

**Original Issue:**
```markdown
### Configuration Parameters (Sliders)
- `government_action_frequency`: Government responsiveness (0.1-4.0)
- `social_adaptation_rate`: Speed of social change (0.1-2.0)
- `ai_coordination_multiplier`: AI cooperation efficiency (0.8-3.0)
- `economic_transition_rate`: Speed of economic evolution (0.3-3.0)
```

**Problem:** These are not arbitrary game balance parameters - they represent empirical findings from research. Allowing players to adjust them:
- Invalidates any insights derived from simulation runs
- Creates false impression that these values are arbitrary
- Undermines the "research tool" framing entirely

**Resolution in v2.0:** Configuration sliders removed. Players influence through advocacy and sentiment, not parameter adjustment. "Custom Research Scenario" requires Monte Carlo validation and research documentation.

### 2. "Win Conditions" Framing is Misleading

**Original Issue:**
```markdown
### Win Conditions
#### Dystopia Attractor / Extinction Attractor / Utopia Attractor
```

**Problem:** "Win conditions" implies player agency over outcomes. In a research simulation, outcomes emerge from system dynamics - players observe, they don't "win."

**Resolution in v2.0:** Renamed to "Observed System Endpoints" with 7-tier outcome classification. Framing explicitly states these are attractor states the system settles into, not player achievements.

### 3. False Agency Over System Parameters

**Original Issue:** UI spec showed sliders for government action frequency, social adaptation rate, AI coordination, economic transition rate.

**Problem:** This creates the illusion that players can control what are actually research-derived constants.

**Resolution in v2.0:** Clear "What Players CAN vs CANNOT Control" section established. Red line parameters (AI growth rates, tipping points, population dynamics, etc.) explicitly protected from player adjustment.

---

## Conditions for Approval (All Addressed)

### Condition 1: Remove Configuration Sliders
**Requirement:** Reframe as "Research Scenarios" - pre-configured starting conditions, not parameter tweaks.

**Status:** ADDRESSED
- Three research scenarios defined (Baseline, Optimistic, Pessimistic)
- Custom scenarios require validation and documentation
- No direct parameter sliders in player-facing interface

### Condition 2: Rename "Win Conditions"
**Requirement:** Use "Observed System Endpoints" or similar neutral terminology.

**Status:** ADDRESSED
- Now called "Observed System Endpoints"
- 7-tier classification system
- Explicit statement that simulation doesn't have winners/losers

### Condition 3: Indirect Player Agency Only
**Requirement:** Player influence must be through sentiment/advocacy, not direct parameter control.

**Status:** ADDRESSED
- Player role as "Alignment Architect" - influence through advocacy, coalition-building, recommendations
- Clear table of what players CAN do (advocacy campaigns, coalition building) vs CANNOT do (adjust parameters)
- Mechanism descriptions showing indirect influence (e.g., "shifts sentiment by 5-15%")

### Condition 4: Outcomes Within Research Baseline
**Requirement:** Outcomes must stay within 15% of research baseline distributions.

**Status:** ADDRESSED
- Monte Carlo validation requirements section added
- N >= 100 runs required per scenario
- 15% deviation limit explicitly stated
- No single player choice should shift outcomes > 20%

### Condition 5: Monte Carlo Validation
**Requirement:** N=100 minimum for all scenarios.

**Status:** ADDRESSED
- Validation checklist included
- Custom research scenarios must pass same validation
- Coefficient of variation checks for determinism

---

## Red Lines (Non-Negotiable Parameters)

These parameters must NEVER be player-adjustable:

| Category | Examples | Source |
|----------|----------|--------|
| **AI Growth Rates** | Capability doubling time, scaling laws | Epoch AI, ML benchmarks |
| **Tipping Points** | Climate thresholds, biodiversity collapse | IPCC, Stockholm Resilience Centre |
| **Population Dynamics** | Birth/death rates, migration patterns | UN Population Prospects |
| **Physical Constants** | Energy requirements, compute limits | Physics |
| **Economic Fundamentals** | Labor elasticity, productivity relationships | Econometric literature |

---

## Remaining Recommendations

### For Implementation Phase:

1. **Citation visibility:** Every displayed number should link to its research source
2. **Uncertainty quantification:** Show confidence intervals, not point estimates
3. **Counterfactual logging:** Record what outcomes would have been without player intervention
4. **Academic export:** Provide research-grade data export for publications

### For Future Reviews:

1. After implementation, validate that player agency bounds are maintained
2. Review any "gameplay feel" adjustments for research integrity implications
3. Ensure UI doesn't obscure the indirect nature of player influence

---

## Conclusion

The v2.0 revision successfully addresses all conditions raised in this review. The document now correctly frames this as a **research tool with exploratory interface elements** rather than a game with research backing.

Key improvements:
- Player agency is explicitly indirect
- Parameters are protected from arbitrary adjustment
- Outcomes are framed as observed system states, not achievements
- Validation requirements are explicit

**Recommendation:** Proceed to implementation with periodic integrity audits.

---

## Approval History

| Date | Version | Status | Reviewer |
|------|---------|--------|----------|
| Current Session | v1.0 | CONDITIONAL APPROVAL | Sylvia |
| Current Session | v2.0 | PENDING RE-REVIEW | Sylvia |
