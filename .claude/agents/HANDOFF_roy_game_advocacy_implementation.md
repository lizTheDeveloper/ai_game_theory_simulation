# Handoff: Game Advocacy Actions Implementation

**To:** simulation-maintainer (Roy)
**From:** orchestrator-1
**Date:** 2025-12-06
**Priority:** CRITICAL
**Deadline:** 2025-12-07 EOD

---

## Context

User feedback: "This is the research tool, this is not the game."

**Problem:** Player actions don't affect simulation (integration missing).

**Your task:** Implement research-validated advocacy action catalog + full GameSession integration.

---

## Task Breakdown

### Task 2.3: Implement Advocacy Action Catalog
**Duration:** 1-2 hours
**Input:** Sylvia-approved research (`research/game_advocacy_actions_20251206.md`)
**Output:** `src/game/data/advocacyActions.ts`

### Task 2.4: Wire InfluenceCalculator Integration
**Duration:** 2-3 hours
**Input:** Completed advocacyActions.ts
**Output:** Updated GameSession, InfluenceCalculator with full integration

---

## Task 2.3: Create Action Catalog

### Step 1: Create catalog file

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/game/data/advocacyActions.ts`

```typescript
// src/game/data/advocacyActions.ts

import type { AdvocacyAction, AdvocacyActionId } from '../types';

/**
 * Advocacy Action Catalog
 *
 * Research-backed player influence actions.
 * All parameters validated by research-skeptic (Sylvia).
 *
 * Sources: research/game_advocacy_actions_20251206.md
 * Validation: reviews/game_advocacy_actions_critique_20251206.md
 *
 * Bounds (enforced by InfluenceCalculator):
 * - Single action: ≤5% (baseEffect 0.01-0.05)
 * - Per domain: ≤10% cumulative
 * - Total: ≤15% cumulative
 */

export const ADVOCACY_ACTIONS: Record<AdvocacyActionId, AdvocacyAction> = {
  advocate_ai_safety: {
    id: 'advocate_ai_safety',
    name: 'AI Safety Public Awareness Campaign',
    description: 'Launch public campaign to increase AI safety awareness and policy support',
    mechanism: 'sentiment_shift',
    targetMetric: 'society.publicSentiment.aiSafetySupport',
    baseEffect: 0.025, // 2.5% (Source: Smith et al. 2024, meta-analysis n=12)
    duration: 6, // months
    cooldown: 3, // months
    prerequisites: [],
    maxCumulativeEffect: 0.08, // 8% domain limit (ai_policy ≤10%)
    domain: 'ai_policy',
    costs: {
      reputation: 10,
      politicalCapital: 15,
    },
    researchSources: [
      'Smith et al. (2024). Social Media Campaign Effectiveness. JMIR 27(1).',
      'UK Gov (2025). Digital Channel Shift Campaign Evaluation.',
    ],
  },

  // Add 7-11 more actions based on Cynthia's research
  // See research/game_advocacy_actions_20251206.md for full list
};

/**
 * Get action by ID (with defensive check)
 */
export function getAdvocacyAction(actionId: AdvocacyActionId): AdvocacyAction | undefined {
  const action = ADVOCACY_ACTIONS[actionId];
  if (!action) {
    console.warn(`⚠️ Unknown advocacy action: ${actionId}`);
    return undefined;
  }
  return action;
}

/**
 * Get all actions for a domain
 */
export function getActionsByDomain(domain: InfluenceDomain): AdvocacyAction[] {
  return Object.values(ADVOCACY_ACTIONS).filter(a => a.domain === domain);
}

/**
 * Get all available actions (respecting prerequisites)
 */
export function getAvailableActions(state: GameStateSnapshot): AdvocacyAction[] {
  return Object.values(ADVOCACY_ACTIONS).filter(action => {
    // Check prerequisites
    if (action.prerequisites.length === 0) return true;

    return action.prerequisites.every(prereq => {
      // Implement prerequisite checking logic
      // Example: tech unlocks, governance thresholds, crisis triggers
      return true; // Placeholder - implement based on prereq types
    });
  });
}
```

### Step 2: Update type definitions

Check if `src/game/types/index.ts` needs updates:

```typescript
// src/game/types/index.ts

export type AdvocacyActionId =
  | 'advocate_ai_safety'
  | 'promote_climate_action'
  | 'build_international_coalition'
  | 'fund_alignment_research'
  | 'strengthen_social_cohesion'
  | 'establish_climate_finance'
  | 'create_shared_infrastructure'
  | 'redirect_ai_alignment'
  | 'fund_climate_tech'
  | 'support_social_innovation'
  | 'advocate_ai_regulation'
  | 'push_carbon_pricing'
  // Add IDs for all actions from Cynthia's research
  ;

export interface AdvocacyAction {
  id: AdvocacyActionId;
  name: string;
  description: string;
  mechanism: 'sentiment_shift' | 'funding_weight' | 'coordination_boost' | 'policy_adoption' | 'trust_delta' | 'private_sector_weight';
  targetMetric: string; // Dot-notation path to GameState field
  baseEffect: number; // 0.01-0.05 range
  duration: number; // months
  cooldown: number; // months
  prerequisites: ActionPrerequisite[];
  maxCumulativeEffect: number;
  domain: InfluenceDomain;
  costs: {
    reputation?: number;
    politicalCapital?: number;
    funding?: number;
  };
  researchSources: string[]; // Track research backing
}

export type InfluenceDomain =
  | 'ai_policy'
  | 'climate_action'
  | 'social_cohesion'
  | 'international_cooperation'
  | 'research_direction';

export interface ActionPrerequisite {
  type: 'tech_unlock' | 'governance_threshold' | 'crisis_trigger' | 'metric_threshold';
  condition: string; // e.g., "AI Safety Framework unlocked", "democracy_index > 60"
}
```

### Step 3: Add validation utility

**Defensive coding - NO SILENT FALLBACKS:**

```typescript
// src/game/utils/actionValidation.ts

import { assertFinite, assertInRange } from '@/simulation/utils/assertions';
import { ADVOCACY_ACTIONS } from '../data/advocacyActions';

/**
 * Validate action catalog on load
 * Crashes loudly if any action violates bounds
 */
export function validateActionCatalog(): void {
  for (const [id, action] of Object.entries(ADVOCACY_ACTIONS)) {
    // Single action bound: ≤5%
    assertInRange(action.baseEffect, 0.001, 0.05, {
      location: 'validateActionCatalog',
      valueName: `${id}.baseEffect`,
      additionalInfo: { limit: '≤5% per Sylvia bounds' },
    });

    // Duration must be positive
    assertFinite(action.duration, {
      location: 'validateActionCatalog',
      valueName: `${id}.duration`,
    });
    if (action.duration <= 0) {
      throw new Error(`❌ CRITICAL: ${id}.duration must be positive (got ${action.duration})`);
    }

    // Cooldown must be positive
    assertFinite(action.cooldown, {
      location: 'validateActionCatalog',
      valueName: `${id}.cooldown`,
    });
    if (action.cooldown <= 0) {
      throw new Error(`❌ CRITICAL: ${id}.cooldown must be positive (got ${action.cooldown})`);
    }

    // Max cumulative must not exceed domain limit (10%)
    assertInRange(action.maxCumulativeEffect, 0, 0.10, {
      location: 'validateActionCatalog',
      valueName: `${id}.maxCumulativeEffect`,
      additionalInfo: { limit: '≤10% per domain (Sylvia bounds)' },
    });

    // Research sources required
    if (!action.researchSources || action.researchSources.length === 0) {
      throw new Error(`❌ CRITICAL: ${id} missing research sources`);
    }
  }

  console.log(`✅ Action catalog validated: ${Object.keys(ADVOCACY_ACTIONS).length} actions`);
}

// Call on module load
validateActionCatalog();
```

### Step 4: Update InfluenceCalculator

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/game/core/InfluenceCalculator.ts`

```typescript
// src/game/core/InfluenceCalculator.ts

import { ADVOCACY_ACTIONS, getAdvocacyAction, getAvailableActions } from '../data/advocacyActions';

export class InfluenceCalculator {
  // Remove hardcoded ACTION_CATALOG

  getAction(actionId: AdvocacyActionId): AdvocacyAction | undefined {
    return getAdvocacyAction(actionId);
  }

  getAllActions(): AdvocacyAction[] {
    return Object.values(ADVOCACY_ACTIONS);
  }

  getAvailableActions(state: GameStateSnapshot): AdvocacyAction[] {
    return getAvailableActions(state);
  }

  // Keep existing bounds enforcement (lines 180-210)
  // Keep existing processAdvocacyAction logic
}
```

---

## Task 2.4: Wire GameSession Integration

### Step 1: Add player resources to GameLayerState

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/game/types/index.ts`

```typescript
export interface GameLayerState {
  // Existing fields...

  // NEW: Player resources for advocacy
  playerResources: {
    reputation: number; // 0-100
    politicalCapital: number; // 0-100
    funding: number; // Abstract currency, can exceed 100
  };

  // Track cooldowns
  actionCooldowns: Map<AdvocacyActionId, number>; // month when action becomes available again
}
```

### Step 2: Initialize resources in GameSession

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/game/core/GameSession.ts`

```typescript
export class GameSession {
  constructor(options: GameSessionOptions) {
    // Existing initialization...

    this.gameLayerState = {
      currentScenario: options.scenario,
      decisionHistory: [],
      outcomeProjections: [],
      playerResources: {
        reputation: 100, // Start at max
        politicalCapital: 100, // Start at max
        funding: 0, // Grows over time
      },
      actionCooldowns: new Map(),
    };
  }
}
```

### Step 3: Update queueAdvocacyAction with costs

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/game/core/GameSession.ts`

```typescript
queueAdvocacyAction(actionId: AdvocacyActionId): QueueResult {
  const action = this.influenceCalculator.getAction(actionId);

  if (!action) {
    return {
      success: false,
      rejectionReason: `Unknown action: ${actionId}`,
    };
  }

  // Check cooldown
  const cooldownUntil = this.gameLayerState.actionCooldowns.get(actionId);
  const currentMonth = this.simulationState?.currentMonth ?? 0;
  if (cooldownUntil && currentMonth < cooldownUntil) {
    return {
      success: false,
      rejectionReason: `Action on cooldown until month ${cooldownUntil} (${cooldownUntil - currentMonth} months remaining)`,
    };
  }

  // Check resources
  const { reputation, politicalCapital, funding } = this.gameLayerState.playerResources;
  const costs = action.costs;

  if ((costs.reputation ?? 0) > reputation) {
    return {
      success: false,
      rejectionReason: `Insufficient reputation (need ${costs.reputation}, have ${reputation})`,
    };
  }

  if ((costs.politicalCapital ?? 0) > politicalCapital) {
    return {
      success: false,
      rejectionReason: `Insufficient political capital (need ${costs.politicalCapital}, have ${politicalCapital})`,
    };
  }

  if ((costs.funding ?? 0) > funding) {
    return {
      success: false,
      rejectionReason: `Insufficient funding (need ${costs.funding}, have ${funding})`,
    };
  }

  // Process action through InfluenceCalculator (existing bounds check)
  const result = this.influenceCalculator.processAdvocacyAction(
    actionId,
    this.simulationState
  );

  if (result.success && result.queuedDecision) {
    // Deduct costs
    this.gameLayerState.playerResources.reputation -= costs.reputation ?? 0;
    this.gameLayerState.playerResources.politicalCapital -= costs.politicalCapital ?? 0;
    this.gameLayerState.playerResources.funding -= costs.funding ?? 0;

    // Set cooldown
    this.gameLayerState.actionCooldowns.set(
      actionId,
      currentMonth + action.cooldown
    );

    // Queue to simulation via callback
    if (this.queueDecisionCallback) {
      this.queueDecisionCallback(result.queuedDecision);
    }

    // Update decision history
    this.gameLayerState.decisionHistory.push(result.queuedDecision);

    // Emit event
    this.emitEvent({
      type: 'advocacy_action_queued',
      timestamp: currentMonth,
      data: { actionId, decision: result.queuedDecision },
    });

    console.log(`✅ Queued: ${action.name} (costs: ${JSON.stringify(costs)})`);
  }

  return result;
}
```

### Step 4: Add resource regeneration

**File:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/game/core/GameSession.ts`

```typescript
/**
 * Update game layer per simulation step
 * Called by SimulationRunner after each simulation step
 */
onSimulationStep(newState: GameStateSnapshot): void {
  this.updateSimulationState(newState);

  // Regenerate resources over time
  const regen = this.calculateResourceRegeneration(newState);

  this.gameLayerState.playerResources.reputation = Math.min(100,
    this.gameLayerState.playerResources.reputation + regen.reputation
  );

  this.gameLayerState.playerResources.politicalCapital = Math.min(100,
    this.gameLayerState.playerResources.politicalCapital + regen.politicalCapital
  );

  this.gameLayerState.playerResources.funding += regen.funding;

  // Update outcome projections (existing logic)
  this.updateOutcomeProjections(newState);
}

private calculateResourceRegeneration(state: GameStateSnapshot): {
  reputation: number;
  politicalCapital: number;
  funding: number;
} {
  // Base regeneration rates
  const baseReputation = 1; // +1 per month (slow recovery)
  const basePolitical = 2; // +2 per month (moderate recovery)

  // Funding scales with AI economic contribution
  const gdp = state.humanPopulationSystem?.population * state.economicIndicators?.gdpPerCapita ?? 114e12;
  const aiContribution = state.aiEconomicContribution ?? 0;
  const baseFunding = (gdp * aiContribution) / 1e9; // Convert to abstract units

  // Modifiers based on game state
  const democracyBonus = state.governance?.effectiveGovernance > 60 ? 1.2 : 1.0;
  const crisisBonus = state.globalRisk > 70 ? 1.5 : 1.0; // Urgency increases resources

  return {
    reputation: baseReputation * democracyBonus,
    politicalCapital: basePolitical * democracyBonus * crisisBonus,
    funding: baseFunding,
  };
}
```

---

## Testing

### Unit tests

```bash
# Type check
npx tsc --noEmit

# Run tests
npm test src/game/data/advocacyActions.test.ts
npm test src/game/core/GameSession.test.ts
npm test src/game/core/InfluenceCalculator.test.ts
```

### Integration test script

Create `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/scripts/testGameSession.ts`:

```typescript
import { GameSession } from '@/game/core/GameSession';
import { createInitialState } from '@/simulation/initialization/createInitialState';

const initialState = createInitialState({ seed: 12345 });
const session = new GameSession({ scenario: 'baseline' });
session.initialize(initialState);

console.log('\n=== Testing Advocacy Actions ===\n');

// Get available actions
const actions = session.getAvailableActions();
console.log(`Available actions: ${actions.length}`);

// Try to queue action
const result1 = session.queueAdvocacyAction('advocate_ai_safety');
console.log(`Queue AI Safety: ${result1.success ? '✅' : '❌'} ${result1.rejectionReason ?? ''}`);

// Check resources after
console.log(`Resources after: ${JSON.stringify(session.getGameLayerState().playerResources)}`);

// Try to queue again (should fail due to cooldown)
const result2 = session.queueAdvocacyAction('advocate_ai_safety');
console.log(`Queue again: ${result2.success ? '✅' : '❌'} ${result2.rejectionReason ?? ''}`);

// Try to exceed domain limit
// ... test bounds enforcement

console.log('\n=== Test Complete ===\n');
```

Run test:
```bash
npx tsx scripts/testGameSession.ts
```

---

## Success Criteria

Task 2.3 complete when:
- ✅ `src/game/data/advocacyActions.ts` created with 8-12 actions
- ✅ All actions have research sources cited
- ✅ Validation utility passes (no bound violations)
- ✅ Type check passes (`npx tsc --noEmit`)

Task 2.4 complete when:
- ✅ Player resources implemented
- ✅ Costs deducted on action queue
- ✅ Cooldowns enforced
- ✅ Resource regeneration works
- ✅ Integration test passes

---

## After Completion

1. **Post to implementation channel:**
   ```markdown
   ---
   **roy** | 2025-12-06 | [COMPLETED]

   Tasks 2.3-2.4 complete: Advocacy action catalog + GameSession integration

   **Files changed:**
   - src/game/data/advocacyActions.ts (NEW, 12 actions)
   - src/game/types/index.ts (player resources, cooldowns)
   - src/game/core/GameSession.ts (costs, cooldowns, regen)
   - src/game/core/InfluenceCalculator.ts (catalog import)

   **Testing:**
   - ✅ Type check pass
   - ✅ Unit tests pass
   - ✅ Integration test pass
   - ✅ Bounds enforcement working

   **Handoff:** Tessa (ActionPanel UI), Ray (tutorial content)
   **Next:** Parallel work on UI + tutorial
   ---
   ```

2. **Commit changes:**
   ```bash
   git add src/game/
   git commit -m "feat(game): Implement research-backed advocacy action catalog

   - Add 12 advocacy actions with peer-reviewed sources
   - Implement player resource system (reputation, political capital, funding)
   - Add cost deduction and cooldown enforcement
   - Add resource regeneration based on game state
   - Validate all actions against Sylvia-approved bounds

   Sources: research/game_advocacy_actions_20251206.md
   Validation: reviews/game_advocacy_actions_critique_20251206.md

   🤖 Generated with Claude Code
   Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
   ```

---

## Token Budget

**Estimated:** 6-8k tokens
**Time estimate:** 3-4 hours

---

## References

- **Execution plan:** `plans/PHASE2_PLAYER_AGENCY_EXECUTION_PLAN.md` Tasks 2.3-2.4
- **Research:** `research/game_advocacy_actions_20251206.md` (Cynthia)
- **Validation:** `reviews/game_advocacy_actions_critique_20251206.md` (Sylvia)
- **Existing code:** `src/game/core/InfluenceCalculator.ts` (bounds enforcement)
- **Existing code:** `src/game/core/GameSession.ts` (skeleton implementation)

---

## Questions?

Post to implementation channel. Orchestrator monitoring.
