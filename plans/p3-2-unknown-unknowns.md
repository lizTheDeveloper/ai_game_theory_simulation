# P3.2: Unknown Unknown Event System

**Status:** Not yet implemented
**Estimated Time:** 4-6 hours
**Priority:** LOW
**Category:** Enhancement - Realism

## Overview

Add system for truly unexpected events (unknown unknowns) that aren't in the technology tree or crisis system.

## Problem

Current simulation only models known risks and technologies. Real history includes:
- Black swans: 2008 financial crisis, COVID-19, Fukushima
- Unexpected discoveries: CRISPR, Transformers, mRNA vaccines
- Unknown unknowns: Events we can't anticipate

## Proposed Solution

### Unknown Unknown Event System

```typescript
interface UnknownUnknownEvent {
  category: 'breakthrough' | 'crisis' | 'paradigm_shift';
  probability: number; // Very low base rate (0.1-1% per year)
  impact: {
    positive: boolean;
    magnitude: 'minor' | 'major' | 'transformative';
    domains: string[]; // Affected systems
  };
}

function checkForUnknownUnknown(state: GameState): void {
  // Higher probability during high-uncertainty periods
  const baseProb = 0.001; // 0.1% per month
  const uncertaintyMultiplier = 1 + state.globalUncertainty * 2;
  const aiMultiplier = 1 + Math.min(state.maxAICapability * 0.5, 1.0);

  const totalProb = baseProb * uncertaintyMultiplier * aiMultiplier;

  if (Math.random() < totalProb) {
    const event = generateUnknownUnknown(state);
    applyUnknownUnknownImpact(event, state);
    logEvent(state, event);
  }
}
```

### Event Categories

**Breakthroughs:**
- Room-temperature superconductors
- Consciousness uploading
- Faster-than-light communication
- New physics discoveries

**Crises:**
- Solar flare (EMP)
- Gamma-ray burst
- Unforeseen pandemic variant
- AI deception technique

**Paradigm Shifts:**
- New economic system emerges
- Religious movement reshapes society
- Unexpected social technology

## Expected Impact

- Adds true uncertainty to long-term forecasts
- Prevents overconfidence in deterministic outcomes
- Captures "history is weird" phenomenon

## Test Criteria

- [ ] 5-10% of 100-run Monte Carlo experiences unknown unknown
- [ ] Events are plausible but unpredictable
- [ ] Some events are beneficial, some harmful (balanced)

## References

- CRITICAL_RESEARCH_REVIEW.md lines 130-139
- Nassim Taleb's "Black Swan" theory

## Files to Create

- `/src/simulation/engine/phases/UnknownUnknownPhase.ts` - New phase
- `/src/simulation/unknownUnknowns.ts` - Event generation logic
- `/src/types/unknownUnknown.ts` - Type definitions
