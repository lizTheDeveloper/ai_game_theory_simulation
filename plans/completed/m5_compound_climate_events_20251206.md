# M-5: Compound Climate Events Implementation Plan

**Priority:** MEDIUM
**Complexity:** 5 interacting systems
**Assignee:** simulation-maintainer (Roy)
**Status:** IN PROGRESS

## Problem Statement

Current tipping point cascade logic uses conservative multipliers that don't match research findings. When 3+ tipping points cross simultaneously, the model should reflect accelerated collapse dynamics found in literature.

**Current behavior:**
- 2 elements: cascadeMultiplier = 1.15
- 3 elements: cascadeMultiplier = 1.35
- 4+ elements: cascadeMultiplier = 1.60

**Research finding:**
> "At a global warming level of 1.5°C, neglecting the polar ice sheets can alter the expected number of tipped elements by more than a factor of 2."
> — Communications Earth & Environment (2024), DOI: 10.1038/s43247-024-01799-5

This indicates current multipliers are too conservative.

## Research Foundation

### Primary Sources

1. **Armstrong McKay et al. (2022)** Science - Global tipping point analysis
2. **Communications Earth & Environment (2024)** DOI: 10.1038/s43247-024-01799-5 - Ice sheets as cascade amplifiers (>2x factor)
3. **van Westen et al. (2024)** Earth System Dynamics - Rate-induced cascades
4. **Global Tipping Points Report 2025** - Compound probabilities

### Key Findings

**Cascade Amplification:**
- Ice sheet tipping alters expected tipped element count by **>2x**
- Suggests strong non-linear amplification, not weak linear scaling

**Compound Event Probabilities:**
- 1.5°C warming: 3+ elements = 5-15% probability
- 2.0°C warming: 3+ elements = 30-50% probability
- 2.5°C warming: Full cascade (5+ elements) = 40-60% probability
- **Interpretation:** Every 0.5°C increment roughly doubles cascade risk

**Cascade Network:**
```
GIS → AMOC (-0.3°C threshold)
GIS → WAIS (-0.1°C threshold)
AMOC → Amazon (-0.5°C threshold)
AMOC → WAIS (-0.2°C threshold)
AMOC → Sahel (-0.4°C threshold)
Amazon → global CO₂ (+90 GtC release)
```

## Implementation Requirements

### 1. Update Cascade Multiplier Logic (ClimateSystemPhase.ts)

**Current code** (lines 372-390):
```typescript
private calculateTippingCascades(state: GameState): void {
  const system = state.tippingPointSystem;
  const activeCascadingElements = system.elements.filter(e =>
    e.progress > 0 && e.cascades
  );
  const cascadeCount = activeCascadingElements.length;

  let cascadeMultiplier: number;
  if (cascadeCount === 0 || cascadeCount === 1) {
    cascadeMultiplier = 1.0;
  } else if (cascadeCount === 2) {
    cascadeMultiplier = 1.15;
  } else if (cascadeCount === 3) {
    cascadeMultiplier = 1.35;
  } else {
    cascadeMultiplier = 1.60;
  }
  // ...
}
```

**Required changes:**

1. **Replace conservative multipliers with research-backed values:**
   ```typescript
   // Research: Communications Earth & Environment (2024)
   // "Alter expected tipped element count by more than factor of 2"
   let cascadeMultiplier: number;
   if (cascadeCount === 0 || cascadeCount === 1) {
     cascadeMultiplier = 1.0;  // No cascade
   } else if (cascadeCount === 2) {
     // Two elements: moderate amplification
     cascadeMultiplier = 1.5;
   } else if (cascadeCount === 3) {
     // THREE+ ELEMENTS: Critical compound threshold
     // Research threshold where acceleration becomes severe
     cascadeMultiplier = 2.0;  // Factor of 2x from research
   } else if (cascadeCount === 4) {
     cascadeMultiplier = 2.5;
   } else {
     // 5+ elements: Full cascade ("Hothouse Earth" scenario)
     cascadeMultiplier = 3.0;
   }
   ```

2. **Add compound event detection and logging:**
   ```typescript
   // Detect compound events (3+ elements tipping simultaneously)
   const newlyTriggeredThisMonth = system.elements.filter(e =>
     e.triggered && e.monthsSinceTrigger === 0
   );

   if (newlyTriggeredThisMonth.length >= 3) {
     console.log(`\n🌍🔥💥 COMPOUND CLIMATE EVENT`);
     console.log(`  ${newlyTriggeredThisMonth.length} tipping points crossed simultaneously`);
     console.log(`  Elements: ${newlyTriggeredThisMonth.map(e => e.name).join(', ')}`);
     console.log(`  Cascade acceleration: ${cascadeMultiplier.toFixed(2)}x`);
     console.log(`  🚨 Accelerated collapse dynamics initiated`);
   }
   ```

3. **Apply cascadeMultiplier to transition speed (not just impacts):**

   In `updateTippingTransitions()` method, scale the transition rate by cascadeMultiplier:
   ```typescript
   // Calculate transition progress with cascade acceleration
   const baseTransitionMonths = rng() * (element.transitionMaxMonths - element.transitionMinMonths)
                                 + element.transitionMinMonths;

   // Apply cascade acceleration - more tipped elements = faster transitions
   const acceleratedMonths = baseTransitionMonths / state.tippingPointSystem.cascadeMultiplier;

   // Progress through transition faster when multiple cascades active
   const transitionTime = acceleratedMonths;
   ```

### 2. Enhance Regional Impact Stacking

When 3+ elements tip, regional impacts should compound non-linearly:

```typescript
private applyTippingImpacts(state: GameState): void {
  const system = state.tippingPointSystem;

  // Track which regions are hit by multiple tipping points
  const regionalHits: Record<string, number> = {};

  for (const element of system.elements) {
    if (element.progress === 0) continue;

    for (const [region, multiplier] of Object.entries(element.regionalImpacts)) {
      regionalHits[region] = (regionalHits[region] || 0) + 1;
    }
  }

  // Apply compound regional amplification
  for (const [region, hitCount] of Object.entries(regionalHits)) {
    if (hitCount >= 3) {
      // Region hit by 3+ tipping points: amplify damage
      const compoundAmplification = 1.0 + (hitCount - 2) * 0.3;
      console.log(`  🌍⚠️ ${region}: Hit by ${hitCount} tipping points (${compoundAmplification.toFixed(2)}x damage)`);
    }
  }
}
```

### 3. Update Tipping Point Types (if needed)

Check if `TippingPointSystem` needs new fields:

```typescript
export interface TippingPointSystem {
  // ... existing fields ...

  /** Track compound events (3+ simultaneous triggers) */
  compoundEvents: Array<{
    month: number;
    elementIds: string[];
    cascadeMultiplier: number;
  }>;
}
```

### 4. Validation Requirements

**Monte Carlo validation:**
```bash
npx tsx scripts/monteCarloSimulation.ts > logs/mc_m5_$(date +%Y%m%d_%H%M%S).log 2>&1 &
```

**Expected outcomes with M-5:**
- Runs with 3+ tipping points should collapse faster
- Outcome distribution should shift toward catastrophic (COLLAPSE/EXTINCTION) when compound events trigger
- Coefficient of variation should remain <0.01% (determinism preserved)

**Unit tests needed:**
```typescript
describe('M-5: Compound Climate Events', () => {
  it('applies 2.0x multiplier when 3 elements tip', () => {
    // Trigger 3 elements, verify cascadeMultiplier === 2.0
  });

  it('accelerates transitions with cascadeMultiplier', () => {
    // Verify transition speed scales with multiplier
  });

  it('logs compound events when 3+ tip simultaneously', () => {
    // Check for "COMPOUND CLIMATE EVENT" log output
  });

  it('stacks regional impacts for compound-affected regions', () => {
    // Verify regions hit by 3+ elements get amplified damage
  });
});
```

## Implementation Phases

### Phase 1: Core Cascade Logic (CRITICAL)
- Update `calculateTippingCascades()` multiplier values
- Add compound event detection and logging
- Apply cascadeMultiplier to transition speed

### Phase 2: Regional Amplification
- Implement regional hit tracking
- Apply compound damage amplification
- Add regional compound event logging

### Phase 3: Testing & Validation
- Write unit tests for cascade multipliers
- Run Monte Carlo validation (N≥10)
- Verify determinism (CV < 0.01%)

### Phase 4: Edge Cases
- Handle recovery scenarios (cooling below thresholds)
- Ensure assertion utilities used (no silent fallbacks)
- Verify emoji conventions followed

## Defensive Coding Checklist

- [ ] Use `assertFinite()` for all cascade multiplier calculations
- [ ] Use `assertInRange()` for progress values (0-1)
- [ ] No silent fallbacks (fail loudly if data missing)
- [ ] Use required RNG parameter (no Math.random fallback)
- [ ] Follow pictographic event language (🌍🔥💥 for compound events)
- [ ] Add structured logging with emoji prefixes

## Success Criteria

- ✅ cascadeMultiplier reaches 2.0x when 3 elements tip (matches research)
- ✅ Transitions accelerate proportional to cascadeMultiplier
- ✅ Compound events logged with clear pictographic markers
- ✅ Regional impacts stack for multiply-affected regions
- ✅ Monte Carlo validation shows determinism preserved
- ✅ Unit tests achieve >90% coverage of cascade logic
- ✅ No NaN/undefined in cascade calculations

## Files to Modify

1. **src/simulation/engine/phases/ClimateSystemPhase.ts**
   - Line 372-405: `calculateTippingCascades()` method
   - Line 328-370: `updateTippingTransitions()` method (add cascade acceleration)
   - Line 407-450: `applyTippingImpacts()` method (add regional stacking)

2. **src/types/tipping-points.ts** (if compound event tracking added)
   - Line 96-144: `TippingPointSystem` interface

3. **src/simulation/tippingPoints.ts** (if initialization needed)
   - Line 24-46: `initializeTippingPointSystem()` function

## References

### Research Files
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/climate_tipping_cascades_2024_2025.md` (lines 196-265, 440-463)
- `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/arch4_cross_system_integrations_20251108.md` (lines 296-298)

### Code Files
- Current implementation: `src/simulation/engine/phases/ClimateSystemPhase.ts` (lines 372-405)
- Type definitions: `src/types/tipping-points.ts`

### Documentation
- Wiki: `docs/wiki/README.md` (will be updated post-implementation)
- Commands: `docs/COMMANDS.md` (Monte Carlo validation)

---

**Next Steps:**
1. Invoke `simulation-maintainer` agent with this plan
2. Implement Phase 1 (core cascade logic)
3. Run Monte Carlo validation
4. Invoke `architecture-skeptic` for review (Quality Gate 2)
5. Update documentation via `wiki-documentation-updater`
6. Archive plan via `architect`
