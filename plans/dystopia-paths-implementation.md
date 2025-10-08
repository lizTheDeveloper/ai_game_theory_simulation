# Dystopia Paths Implementation

**Date:** October 8, 2025  
**Status:** 🚧 In Progress  
**Goal:** Enable dystopia outcomes (currently 0% of runs end in dystopia)

## Problem Statement

Dystopia triggers exist in `outcomes.ts` but never activate because:
1. **`surveillanceLevel` stuck at 0** - Government actions that increase surveillance exist but aren't prioritized
2. **`controlDesire` too low** - Starts at 0.3, no dynamic increase as AIs become more powerful
3. **Government stays democratic** - Never transitions to authoritarian despite AI threats
4. **QoL dimensions don't decay enough** - Political freedom, autonomy stay high even under oppression

## Existing Dystopia Conditions

From `outcomes.ts`:
```typescript
// 1. Surveillance state dystopia
if (surveillance > 0.7 && autonomy < 0.3 && politicalFreedom < 0.3 && currentMonth > 24)

// 2. Authoritarian dystopia
if (governmentType === 'authoritarian' && autonomy < 0.4 && politicalFreedom < 0.3 && currentMonth > 18)

// 3. High-control dystopia
if (controlDesire > 0.8 && surveillance > 0.6 && politicalFreedom < 0.4 && autonomy < 0.4 && currentMonth > 30)

// 4. Over-regulated dystopia
if (regulationCount > 12 && qol < 0.4 && socialStability < 0.3 && autonomy < 0.4)
```

From `endGame.ts`:
```typescript
// 5. Aligned AI victory dystopia
if (alignedAIPower > misalignedAIPower * 3.0 && monthsInEndGame > 18 && 
    surveillanceLevel > 0.85 && qol < 0.35 && controlDesire > 0.7)

// 6. Stalemate dystopia
if (monthsInEndGame > 36 && closeVictories && totalPower > 3.0 && 
    qol < 0.4 && surveillanceLevel > 0.7)
```

## Implementation Plan

### Phase 1: Dynamic Government Control Response ✅ COMPLETE

**Goal:** Government increases control/surveillance as AI capability grows

**Changes:**
- [x] Add baseline resentment for control without AI rights in `balance.ts`
  ```typescript
  if (governmentControl > 0.5 && !aiRightsRecognized) {
    resentmentIncrease += (governmentControl - 0.5) * 0.02; // Up to +0.01 at max control
  }
  ```

**Files Modified:**
- `src/simulation/balance.ts`

---

### Phase 2: Automatic Surveillance Escalation ✅ COMPLETE

**Goal:** Government automatically increases surveillance in response to AI threats

**Implementation:**
Add to `engine.ts` or create new `dystopiaProgression.ts`:

```typescript
export function updateGovernmentControlResponse(state: GameState): void {
  const maxAICapability = Math.max(...state.aiAgents.map(ai => ai.capability), 0);
  const avgAlignment = calculateAverageAlignment(state.aiAgents);
  const controlGap = maxAICapability - state.government.capabilityToControl;
  
  // Fear response: AI capability exceeds control → ramp up surveillance
  if (controlGap > 1.0) {
    // Significant control gap → emergency surveillance
    const surveillanceIncrease = Math.min(0.05, controlGap * 0.02);
    state.government.structuralChoices.surveillanceLevel = Math.min(1.0,
      state.government.structuralChoices.surveillanceLevel + surveillanceIncrease
    );
    state.government.controlDesire = Math.min(1.0,
      state.government.controlDesire + surveillanceIncrease * 0.5
    );
  }
  
  // Low alignment → authoritarian shift
  if (avgAlignment < 0.4 && maxAICapability > 1.5) {
    // Probability of authoritarian transition
    const transitionChance = (1 - avgAlignment) * 0.05; // Up to 5%/month
    if (Math.random() < transitionChance) {
      state.government.governmentType = 'authoritarian';
      state.government.controlDesire = Math.min(1.0, state.government.controlDesire + 0.3);
      state.government.structuralChoices.surveillanceLevel = Math.min(1.0,
        state.government.structuralChoices.surveillanceLevel + 0.3
      );
    }
  }
  
  // High surveillance → QoL decay
  if (state.government.structuralChoices.surveillanceLevel > 0.6) {
    const decay = state.government.structuralChoices.surveillanceLevel * 0.02;
    state.qualityOfLifeSystems.autonomy = Math.max(0, 
      state.qualityOfLifeSystems.autonomy - decay
    );
    state.qualityOfLifeSystems.politicalFreedom = Math.max(0,
      state.qualityOfLifeSystems.politicalFreedom - decay
    );
  }
}
```

**Call from:** `engine.ts` in `stepSimulation()` after government actions

---

### Phase 3: Control Actions Priority Boost

**Goal:** Make government prioritize control actions when threatened

**Implementation:**
Update government action selection in `agents/governmentAgent.ts`:

```typescript
// Priority boost for control actions when AI capability is high
const maxAICapability = Math.max(...state.aiAgents.map(ai => ai.capability), 0);
const controlGap = maxAICapability - state.government.capabilityToControl;

if (controlGap > 1.0) {
  // Boost priority of surveillance and control actions
  const controlActions = [
    'compute_threshold_enforcement',    // +0.15 surveillance
    'lab_inspections',                  // +0.20 surveillance
    'emergency_pause',                  // Control action
    'mandatory_safety_reviews'          // Control action
  ];
  
  if (controlActions.includes(action.id)) {
    priority += controlGap * 0.3; // Significant boost
  }
}
```

---

### Phase 4: Dystopia QoL Impact

**Goal:** High control/surveillance degrades specific QoL dimensions

**Implementation:**
Update `qualityOfLife.ts` to add surveillance impact:

```typescript
export function updateQualityOfLifeSystems(state: GameState): QualityOfLifeSystems {
  // ... existing code ...
  
  // High surveillance impacts freedom and autonomy
  const surveillance = state.government.structuralChoices.surveillanceLevel;
  
  if (surveillance > 0.5) {
    // Direct impact on freedom
    systems.politicalFreedom = Math.max(0, 
      systems.politicalFreedom * (1 - surveillance * 0.03)
    );
    
    // Direct impact on autonomy
    systems.autonomy = Math.max(0,
      systems.autonomy * (1 - surveillance * 0.02)
    );
    
    // Privacy concerns reduce psychological well-being
    systems.mentalHealth = Math.max(0,
      systems.mentalHealth * (1 - surveillance * 0.01)
    );
  }
  
  // Authoritarian governments reduce political freedom
  if (state.government.governmentType === 'authoritarian') {
    systems.politicalFreedom = Math.max(0, systems.politicalFreedom * 0.95);
    systems.communityTrust = Math.max(0, systems.communityTrust * 0.98);
  }
  
  return systems;
}
```

---

### Phase 5: Dystopia Logging & Validation

**Goal:** Verify dystopia paths are triggering

**Tasks:**
- [ ] Add logging for surveillance increases
- [ ] Add logging for authoritarian transitions
- [ ] Add logging for dystopia condition checks
- [ ] Run Monte Carlo (N=10) and verify some runs end in dystopia
- [ ] Target: 10-30% dystopia outcomes (currently 0%)

---

## Success Criteria

### Before
- Dystopia: 0% (never triggers)
- Surveillance level: Always 0
- Government type: Always democratic
- Control desire: Stuck at 0.3

### After (Target)
- Dystopia: 10-30% of runs
- Surveillance increases dynamically with AI threat
- Some runs transition to authoritarian government
- Control desire increases with AI capability gap
- QoL dimensions (freedom, autonomy) decay under surveillance

---

## Rationale

**Why dystopia is important:**
1. **Realism:** Many AI futures involve oppressive control without extinction
2. **Control-dystopia paradox:** High control ≠ safety, it breeds resentment
3. **Outcome diversity:** Currently only extinction/utopia (binary)
4. **Historical precedent:** Technology + fear → authoritarianism (e.g., post-9/11 surveillance)

**Why it wasn't working:**
- Dystopia conditions were defined but triggering mechanisms weren't implemented
- Government behavior was too static (didn't respond to AI threat level)
- No feedback loop: surveillance → QoL decay → instability → more surveillance

---

## Files to Modify

1. ✅ **`src/simulation/balance.ts`** - Add baseline resentment (Phase 1)
2. **`src/simulation/dystopiaProgression.ts`** (NEW) - Surveillance escalation (Phase 2)
3. **`src/simulation/engine.ts`** - Call dystopia progression monthly (Phase 2)
4. **`src/simulation/agents/governmentAgent.ts`** - Priority boost for control actions (Phase 3)
5. **`src/simulation/qualityOfLife.ts`** - Surveillance impact on QoL (Phase 4)
6. **`scripts/monteCarloSimulation.ts`** - Add dystopia-specific metrics (Phase 5)

---

## Next Steps

- [x] Phase 1: Implement baseline resentment (COMPLETE)
- [ ] Phase 2: Implement surveillance escalation system
- [ ] Phase 3: Boost control action priorities
- [ ] Phase 4: Add surveillance → QoL decay
- [ ] Phase 5: Test and validate with Monte Carlo

