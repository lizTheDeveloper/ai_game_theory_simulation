# Task: Government Override System for Scenario Testing

**Agent:** Roy (Simulation Maintainer)
**Priority:** HIGH
**Estimated Time:** 1-2 hours

## Context

Scenario Analysis Phase 2 requires ability to override government decision-making for testing. This allows us to test hypotheses like "what if all governments prioritized climate mitigation?" or "what if AI alignment was top priority?"

**Your Domain:** Phase modification with defensive coding, assertion utilities, deterministic RNG

## Task 2.2: Government Override System

### Files to Modify

1. **`src/types/game.ts`** - Add scenarioOverrides field to GameState
2. **`src/simulation/government/executeGovernmentActions.ts`** - Add override logic
3. **`src/simulation/engine/phases/GovernmentActionsPhase.ts`** - Pass overrides through

### Implementation Steps

#### Step 1: Add GameState Field

**File:** `src/types/game.ts`

**Location:** Add to GameState interface (around line 900+)

```typescript
export interface GameState {
  // ... existing 900 lines of fields ...

  /**
   * Scenario testing overrides (optional)
   * 
   * Applied in GovernmentActionsPhase BEFORE normal decision logic.
   * Allows testing governance sufficiency scenarios:
   * - "Climate First": Force all governments to maximize climate spending
   * - "Equality First": Force redistribution priorities
   * - "AI Alignment First": Force alignment research + strict controls
   * 
   * Research foundation:
   * - V-Dem v14 (2024): Government priority indicators
   * - WGI (2024): Institutional capacity baselines
   * - research/verification_P0_government_baselines_20251031.md
   */
  scenarioOverrides?: {
    /**
     * Government priority overrides
     * Applied globally or to specific countries
     */
    governmentPriorities?: GovernmentPriorityOverride[];
  };
}
```

**Note:** The GovernmentPriorityOverride type is already defined in `src/types/scenarios.ts`

#### Step 2: Modify Government Execution Logic

**File:** `src/simulation/government/executeGovernmentActions.ts`

**Current Structure (reference only):**
```typescript
export function executeGovernmentActions(
  state: GameState,
  rng: RNGFunction
): { newState: GameState; events: Event[] } {
  // Current implementation:
  // - Decide AI regulation
  // - Decide tech evaluation spending
  // - Decide tech deployment priorities
  // - Execute crisis responses
  // etc.
}
```

**Add Override Check at TOP:**

```typescript
import { GovernmentPriorityOverride } from '@/types/scenarios';
import { assertFinite, assertInRange, assertDefined } from '@/simulation/utils/assertions';

export function executeGovernmentActions(
  state: GameState,
  rng: RNGFunction
): { newState: GameState; events: Event[] } {
  
  // SCENARIO OVERRIDE: Check for testing overrides BEFORE normal logic
  if (state.scenarioOverrides?.governmentPriorities) {
    return applyGovernmentOverrides(state, rng);
  }
  
  // Normal government decision logic (existing code)
  // ... all existing implementation ...
}

/**
 * Apply scenario government overrides
 * 
 * Replaces normal government decision-making with predefined priorities.
 * Used for testing governance sufficiency scenarios.
 * 
 * DEFENSIVE CODING:
 * - Validate all override values in [0, 1] range
 * - Fail loudly if overrides malformed
 * - Preserve RNG determinism (no new RNG calls)
 * - Use assertion utilities throughout
 */
function applyGovernmentOverrides(
  state: GameState,
  rng: RNGFunction
): { newState: GameState; events: Event[] } {
  
  const overrides = state.scenarioOverrides!.governmentPriorities!;
  const events: Event[] = [];
  
  // Validate overrides array
  assertDefined(overrides, {
    location: 'applyGovernmentOverrides',
    valueName: 'governmentPriorities',
    month: state.currentMonth
  });
  
  for (const override of overrides) {
    // Determine countries to apply to
    const countries = override.scope === 'global'
      ? Object.keys(state.countries)
      : (override.countries || []);
    
    if (countries.length === 0) {
      throw new Error(
        `❌ CRITICAL: Government override with scope='country' but no countries specified ` +
        `(month ${state.currentMonth})`
      );
    }
    
    for (const countryName of countries) {
      const country = state.countries[countryName];
      if (!country) {
        throw new Error(
          `❌ CRITICAL: Government override specified unknown country '${countryName}' ` +
          `(month ${state.currentMonth})`
        );
      }
      
      // Apply priority overrides
      applyPriorityOverride(country, override, state.currentMonth);
      
      // Apply comprehension override (removes AI lag)
      if (override.comprehensionOverride !== undefined) {
        assertInRange(override.comprehensionOverride, 0, 1, {
          location: 'applyGovernmentOverrides',
          valueName: 'comprehensionOverride',
          month: state.currentMonth
        });
        
        // Force comprehension level (bypasses normal learning dynamics)
        // This allows testing "what if governments understood AI capabilities immediately?"
        if (country.aiComprehension) {
          country.aiComprehension.comprehensionLevel = override.comprehensionOverride;
        }
      }
      
      // Apply trust override (removes trust dynamics)
      if (override.trustOverride !== undefined) {
        assertInRange(override.trustOverride, 0, 1, {
          location: 'applyGovernmentOverrides',
          valueName: 'trustOverride',
          month: state.currentMonth
        });
        
        // Force trust level (bypasses normal trust evolution)
        if (country.aiTrust) {
          country.aiTrust.trustLevel = override.trustOverride;
        }
      }
      
      // Apply institutional capacity override
      if (override.institutionalCapacityOverride !== undefined) {
        assertInRange(override.institutionalCapacityOverride, 0, 1, {
          location: 'applyGovernmentOverrides',
          valueName: 'institutionalCapacityOverride',
          month: state.currentMonth
        });
        
        // Force institutional capacity (bypasses capacity building)
        if (country.government) {
          country.government.institutionalCapacity = override.institutionalCapacityOverride;
        }
      }
    }
    
    // Log override application
    events.push({
      type: 'GOVERNMENT_OVERRIDE_APPLIED',
      message: `🎭 Scenario override: ${override.scope} governments priorities modified`,
      month: state.currentMonth,
      severity: 'INFO'
    });
  }
  
  return { newState: state, events };
}

/**
 * Apply priority override to country
 * 
 * Modifies government spending/policy priorities according to scenario.
 * Examples:
 * - climateMitigation: 1.0 → Maximize climate tech spending
 * - inequalityReduction: 1.0 → Maximize redistribution (target Gini < 0.30)
 * - aiSafety: 1.0 → Max alignment research + strict regulation
 */
function applyPriorityOverride(
  country: any,
  override: GovernmentPriorityOverride,
  currentMonth: number
): void {
  
  const priorities = override.priorities;
  
  // Validate all priority values in [0, 1] range
  for (const [key, value] of Object.entries(priorities)) {
    if (value !== undefined) {
      assertInRange(value, 0, 1, {
        location: 'applyPriorityOverride',
        valueName: `priorities.${key}`,
        month: currentMonth
      });
    }
  }
  
  // Apply climate mitigation priority
  if (priorities.climateMitigation !== undefined) {
    // Modify government budget allocation to prioritize climate
    // Increase climate tech spending, reduce other spending
    // This should affect tech deployment decisions in deployment phase
    
    if (country.government?.spending) {
      // Adjust spending priorities (implementation depends on spending structure)
      // For now, store priority for later phases to use
      if (!country.government.scenarioPriorities) {
        country.government.scenarioPriorities = {};
      }
      country.government.scenarioPriorities.climateMitigation = priorities.climateMitigation;
    }
  }
  
  // Apply inequality reduction priority
  if (priorities.inequalityReduction !== undefined) {
    if (country.government?.spending) {
      if (!country.government.scenarioPriorities) {
        country.government.scenarioPriorities = {};
      }
      country.government.scenarioPriorities.inequalityReduction = priorities.inequalityReduction;
    }
  }
  
  // Apply AI safety priority
  if (priorities.aiSafety !== undefined) {
    if (country.government?.spending) {
      if (!country.government.scenarioPriorities) {
        country.government.scenarioPriorities = {};
      }
      country.government.scenarioPriorities.aiSafety = priorities.aiSafety;
    }
  }
  
  // Apply other priorities (economicGrowth, socialStability, environmentalProtection)
  // ... similar pattern for each priority type
}
```

#### Step 3: Update GovernmentActionsPhase (minimal change)

**File:** `src/simulation/engine/phases/GovernmentActionsPhase.ts`

**Current code (line 34-36):**
```typescript
execute(state: GameState, rng: RNGFunction): PhaseResult {
  setDeterministicRng(rng);
  const govResult = executeGovernmentActions(state, rng);
```

**No changes needed!** The override logic is inside executeGovernmentActions, so the phase just passes through as normal.

**However, add comment for clarity:**
```typescript
execute(state: GameState, rng: RNGFunction): PhaseResult {
  // Execute government actions
  // NOTE: If state.scenarioOverrides exists, this will apply scenario overrides
  // instead of normal government decision logic (for testing scenarios)
  setDeterministicRng(rng);
  const govResult = executeGovernmentActions(state, rng);
```

### Defensive Coding Checklist

- [ ] All override values validated with assertInRange(value, 0, 1)
- [ ] No silent fallbacks - fail loudly if overrides malformed
- [ ] RNG determinism preserved (no new rng() calls in override path)
- [ ] Assertion utilities used throughout
- [ ] Clear error messages with context (location, month, valueName)
- [ ] Handle missing fields gracefully with throws (not fallbacks)

### Testing

**After implementation, test with simple override:**

```typescript
// In scripts/scenarioRunner.ts (Moss's task)
state.scenarioOverrides = {
  governmentPriorities: [{
    scope: 'global',
    priorities: {
      climateMitigation: 1.0,
      economicGrowth: 0.1
    }
  }]
};
```

**Validate:**
1. Override applied without errors
2. Government spending priorities reflect override
3. Determinism preserved (same seed = same result)
4. Assertion errors trigger if invalid values provided

### Coordination

**After completion:**
1. Post completion to `.claude/coordination/scenario_phase2_status.md`
2. Notify Moss that government overrides are ready
3. Test with `governance-first` and `climate-prioritized` scenarios

**If blockers:**
- Need to understand government spending structure better?
- Check `src/simulation/government/` files for budget allocation logic
- Coordinate in `.claude/coordination/` if uncertain about implementation

### Success Criteria

- ✅ GameState.scenarioOverrides field added with documentation
- ✅ applyGovernmentOverrides() function implemented with full defensive coding
- ✅ All override values validated with assertions
- ✅ RNG determinism preserved (no new RNG calls)
- ✅ Clear error messages with context
- ✅ No silent fallbacks - fail loudly

### Research Foundation (Already Validated)

**No additional research needed:**
- ✅ Government priorities based on V-Dem v14 indicators
- ✅ Institutional capacity based on WGI 2024
- ✅ Override mechanism is testing tool (not claiming to model real policy)
- ✅ See `research/verification_P0_government_baselines_20251031.md` for baseline data

**Override values (0.8, 1.0, etc.) are testing thresholds, not research claims.**

**Start now - this is HIGH priority work blocking scenario testing.**
