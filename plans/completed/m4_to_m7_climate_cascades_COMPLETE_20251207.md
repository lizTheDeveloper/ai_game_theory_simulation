# MEDIUM Priority: Missing Climate Cascade Systems

**Priority:** MEDIUM (M-4 to M-7)
**Created:** 2025-12-03
**Source:** Session 51 research validation (research debate)
**Status:** DEFERRED (token conservation mode)

## Overview

Session 51 research debate identified four missing climate cascade mechanisms that are well-documented in peer-reviewed literature but not currently modeled:

1. **M-4: Abrupt Sea Level Rise** (ice sheet marine instability)
2. **M-5: Compound Climate Events** (simultaneous tipping cascades)
3. **M-6: Social Tipping Points** (positive decarbonization feedbacks)
4. **M-7: Climate Hysteresis** (irreversibility after tipping)

## M-4: Abrupt Sea Level Rise

### Problem Statement
Current model treats sea level rise as gradual. Research shows marine ice sheet instability (MISI) can cause abrupt jumps of 1-3 meters within decades.

### Research Foundation
- **DeConto & Pollard 2016:** Ice cliff instability mechanism
- **Kopp et al. 2014:** 10% chance of 2m rise by 2100
- **Bamber et al. 2019:** Expert elicitation suggests higher tail risks

### Implementation Approach
```typescript
interface IceSheetInstability {
  westernAntarctic: {
    threshold: number;      // Temperature trigger
    riskPerDecade: number;  // Probability of collapse
    seaLevelContribution: number; // Meters if triggered
  };
  greenland: { /* similar */ };
}
```

### Expected Impact
- Adds tail risk to coastal infrastructure
- Affects migration patterns in coastal regions
- Triggers adaptation costs earlier than gradual rise

### Effort: 6-8 hours

---

## M-5: Compound Climate Events

### Problem Statement
Current model treats tipping points independently. Research shows cascades can trigger simultaneously, amplifying impacts.

### Research Foundation
- **Wunderling et al. 2024:** Tipping point interactions
- **Lenton et al. 2019:** Network effects in climate system
- **Raymond et al. 2020:** Wet bulb temperature compounding

### Implementation Approach
```typescript
interface CompoundEvent {
  primaryTipping: string;    // e.g., "AMOC collapse"
  secondaryTippings: string[]; // Triggered cascades
  amplificationFactor: number; // Impact multiplier
  timescale: number;          // Months to cascade
}
```

### Expected Impact
- More realistic tail scenarios
- Reduced optimistic bias in multi-tipping scenarios
- Better captures "hothouse Earth" pathway

### Effort: 8-10 hours

---

## M-6: Social Tipping Points

### Problem Statement
Current model lacks positive feedbacks from decarbonization success. Research shows social tipping can accelerate transitions.

### Research Foundation
- **Otto et al. 2020:** Social tipping elements
- **Farmer et al. 2019:** Technology adoption S-curves
- **Centola et al. 2018:** Critical mass for social change

### Implementation Approach
```typescript
interface SocialTipping {
  renewableAdoption: {
    threshold: number;        // Market share trigger
    accelerationFactor: number; // Feedback strength
    persistence: number;      // How long it lasts
  };
  politicalWill: { /* similar */ };
  culturalShift: { /* similar */ };
}
```

### Expected Impact
- Adds realism to utopia scenarios
- Captures positive feedback loops
- Reduces overly pessimistic bias

### Effort: 10-12 hours

---

## M-7: Climate Hysteresis

### Problem Statement
Current model allows tipping points to reverse too easily. Research shows many tippings are irreversible on human timescales.

### Research Foundation
- **Ritchie et al. 2021:** AMOC hysteresis
- **Lohmann & Ditlevsen 2021:** Greenland ice sheet irreversibility
- **Kriegler et al. 2009:** Planetary boundary hysteresis

### Implementation Approach
```typescript
interface TippingHysteresis {
  amoc: {
    collapseThreshold: number;   // Temperature to trigger
    recoveryThreshold: number;   // Lower temp needed to reverse
    recoveryTimescale: number;   // Centuries to recover
  };
  // Similar for other tipping points
}
```

### Expected Impact
- Prevents unrealistic rapid recovery in optimistic scenarios
- Adds realism to "managed decline" outcomes
- Emphasizes prevention over reversal

### Effort: 8-10 hours

---

## Combined Implementation Plan

### Phase 1: Research & Validation (Quality Gate 1)
**Duration:** 4-6 hours
1. Gather peer-reviewed sources for all four systems
2. Extract parameter ranges (thresholds, timescales, impacts)
3. Research-skeptic review for contradictory evidence
4. Prioritize systems by research quality

### Phase 2: Implementation
**Duration:** 16-20 hours (4-5 hours per system)
1. Add new interfaces to `src/types/game.ts`
2. Create new phase modules:
   - `AbruptSeaLevelRisePhase.ts`
   - `CompoundEventsPhase.ts`
   - `SocialTippingPhase.ts`
   - `ClimateHysteresisPhase.ts`
3. Register phases in PhaseOrchestrator
4. Add assertion utilities to prevent NaN
5. Update emoji conventions for new events

### Phase 3: Testing
**Duration:** 6-8 hours
1. Unit tests for each system
2. Integration tests for interactions
3. Monte Carlo validation (N≥10)
4. Compare outcomes with baseline

### Phase 4: Architecture Review (Quality Gate 2)
**Duration:** 2-3 hours
1. Performance analysis (no O(n²) loops)
2. State propagation verification
3. Address CRITICAL/HIGH issues

### Phase 5: Documentation
**Duration:** 3-4 hours
1. Update wiki for each system
2. Document research citations
3. Add to CLAUDE.md if needed

**Total Effort:** 32-42 hours (~5-7 sessions)

## Success Criteria

1. ✅ All four systems implemented with peer-reviewed backing (2024-2025)
2. ✅ Monte Carlo validation shows realistic impact on outcome distribution
3. ✅ No NaN/Infinity regressions
4. ✅ Architecture review passes (B+ or better)
5. ✅ Wiki documentation complete
6. ✅ Test coverage maintained (>80%)

## Related Work

- **HIGH-7:** Conditional climate stability floor (should be done first)
- **HIGH-4:** Technology bifurcation (completed)
- **Climate systems:** Already modeled planetary boundaries, this adds cascade dynamics

## References

1. Wunderling et al. 2024 - Tipping interactions
2. Otto et al. 2020 - Social tipping dynamics
3. DeConto & Pollard 2016 - Ice sheet instability
4. Ritchie et al. 2021 - AMOC hysteresis
5. Session 51 debate: `reviews/climate_stability_floor_debate_20251203.md`
