# Nitrogen-Food Production Coupling Constraints Plan

**Status:** Research Phase
**Priority:** TIER 2 HIGH
**Start Date:** 2025-11-15

## Problem Statement

Currently the simulation has no constraint linking nitrogen boundary reduction to food production capacity. This allows unrealistic scenarios where aggressive nitrogen reduction tech triggers unmodeled famine.

## Research Questions

### 1. Minimum Nitrogen Requirements
- What is the minimum nitrogen input required for current global food production?
- How does this vary by:
  * Population level (8B vs 10B vs 6B)
  * Diet composition (meat-heavy vs plant-based)
  * Agricultural efficiency (conventional vs precision agriculture)
- Peer-reviewed sources on nitrogen use efficiency in agriculture

### 2. Food Production Constraints
- Relationship between nitrogen reduction and crop yields
- Can we reduce nitrogen AND maintain food security?
- Technologies that decouple nitrogen use from food production:
  * Precision agriculture (targeted application)
  * Nitrogen-fixing crops (legumes, bioengineered cereals)
  * Synthetic alternatives (lab-grown proteins)
  * Organic nitrogen recycling

### 3. Famine Trigger Thresholds
- At what nitrogen reduction level does food production drop below minimum caloric needs?
- Safety margin needed (buffer for crop failures, distribution inefficiency)
- Regional variation (some areas more nitrogen-dependent than others)

## Implementation Requirements

### 1. Constraint Function
Create a constraint that links nitrogen boundary reduction to food production capacity.

### 2. Safety Guardrails
- Prevent nitrogen tech from reducing boundary below food security threshold
- Gate effectiveness: If food production drops below minimum, nitrogen tech becomes less effective
- Warning system: Flag when approaching food security cliff

### 3. Technology Differentiation
Not all nitrogen reduction tech is equal:
- **Efficiency tech:** Precision agriculture reduces nitrogen WITHOUT reducing yields
- **Substitution tech:** Nitrogen-fixing crops, lab-grown protein reduce nitrogen NEED
- **Restoration tech:** Clean up existing contamination (doesn't affect current production)

### 4. State Interface Updates
```typescript
interface GameState {
  nitrogenFoodCoupling?: {
    minimumNitrogenForFoodSecurity: number; // kg N/year
    currentNitrogenUse: number; // kg N/year
    foodProductionCapacity: number; // calories/year
    safetyMargin: number; // 0-1 (buffer above minimum)
    constraintActive: boolean; // Is nitrogen reduction limited by food security?
  };
}
```

## Expected Outcomes
- Nitrogen boundary can be restored WITHOUT mass famine if:
  * Efficiency technologies deployed (precision agriculture)
  * Alternative proteins adopted (reduce nitrogen need)
  * Population stabilizes or declines
- Constraint prevents unrealistic scenarios where nitrogen drops to zero but food production is unaffected

## Success Criteria
- Constraint function implemented with research-backed parameters
- Warning system flags food security risks before famine
- Monte Carlo validation shows realistic nitrogen-food trade-offs
- Documentation explains how to reduce nitrogen sustainably

## Workflow Phases
1. Research & Validation (Quality Gate 1) - super-alignment-researcher + research-skeptic
2. Implementation - feature-implementer
3. Architecture Review (Quality Gate 2) - architecture-skeptic
4. Monte Carlo Validation - priya
5. Documentation - wiki-documentation-updater

## Research Status
- [ ] Minimum nitrogen requirements research
- [ ] Food production constraints research
- [ ] Famine trigger thresholds research
- [ ] Research validation (research-skeptic)
