# P2.3: Heterogeneous Population Segments

**Status:** Not yet implemented
**Estimated Time:** 8-10 hours
**Priority:** MEDIUM
**Category:** Critical Fix - Social Dynamics

## Overview

Replace monolithic society model with heterogeneous population segments showing realistic variance in trust, adaptability, and political power.

## Problem

Current simulation treats society as uniform with single trust/legitimacy values. Real populations show 30-40% variance in crisis responses, polarization, and elite/mass power gaps.

## Implementation

### New Data Structures

```typescript
interface Society {
  segments: SocietySegment[];
  aggregateTrustInAI: number; // Weighted average for backward compatibility
  aggregateLegitimacy: number;
}

interface SocietySegment {
  name: 'techno-optimists' | 'moderates' | 'skeptics' | 'elites';
  populationFraction: number; // 0-1, sum to 1.0
  trustInAI: number; // 0-1
  trustInGovernment: number;
  politicalPower: number; // Weighted influence (elites have >population fraction)
  geographic: string[]; // Regions (e.g., ['urban', 'coastal'])
  adaptability: number; // Ability to cope with crisis (0-1)
}
```

### Example Initialization

```typescript
society.segments = [
  { name: 'techno-optimists', populationFraction: 0.15, trustInAI: 0.8, politicalPower: 0.25 },
  { name: 'moderates', populationFraction: 0.50, trustInAI: 0.5, politicalPower: 0.50 },
  { name: 'skeptics', populationFraction: 0.30, trustInAI: 0.2, politicalPower: 0.20 },
  { name: 'elites', populationFraction: 0.05, trustInAI: 0.7, politicalPower: 0.40 }, // Disproportionate power
];
```

## Expected Impact

- Policy decisions depend on weighted segments, not uniform population
- Elite segment can insulate from crisis (higher survival rate)
- Some segments polarize (trust diverges over time)

## Test Criteria

- [ ] Government AI deployment succeeds if weighted-power-trust > 0.6 (not just average trust)
- [ ] Elite segment shows higher survival rate during crises
- [ ] Some segments polarize (trust diverges over time)

## References

- architecture-review-20251015.md lines 387-445 (ARCH-2)
- CRITICAL_RESEARCH_REVIEW.md lines 98-112

## Files to Modify

- `/src/types/game.ts` - Add Society and SocietySegment interfaces
- `/src/simulation/society.ts` - Update society mechanics
- `/src/simulation/government.ts` - Policy decisions use weighted segments
