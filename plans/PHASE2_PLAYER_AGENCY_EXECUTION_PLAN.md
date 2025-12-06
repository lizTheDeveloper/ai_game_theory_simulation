# Phase 2: Player Agency System - Execution Plan

**Created:** 2025-12-06
**Priority:** CRITICAL
**Deadline:** 2025-12-07 EOD
**Parent Plan:** plans/GAME_IMPLEMENTATION_ORCHESTRATION_SPEC.md

---

## Overview

Implement indirect influence mechanics that allow players to affect simulation outcomes through advocacy actions while respecting research integrity constraints.

**Current State:**
- ✅ GameSession skeleton exists (src/game/core/GameSession.ts)
- ✅ InfluenceCalculator exists with 5 placeholder actions (src/game/core/InfluenceCalculator.ts)
- ✅ Influence bounds enforcement implemented (≤5% single action, ≤10% per domain, ≤15% total)
- ❌ Actions lack research backing
- ❌ UI not implemented
- ❌ Tutorial content missing

**Success Criteria:**
1. 8-12 advocacy actions with peer-reviewed justification
2. All effect magnitudes research-validated (Sylvia approval)
3. Action panel UI with buttons, cooldowns, costs
4. Tutorial explaining indirect influence
5. Integration tested with real simulation

---

## Task Breakdown

### Task 2.1: Research Advocacy Action Parameters
**Agent:** super-alignment-researcher (Cynthia)
**Duration:** 2-3 hours
**Input:** Current placeholder actions (src/game/core/InfluenceCalculator.ts:30-96)
**Output:** research/game_advocacy_actions_20251206.md

**Research Requirements:**
1. Find peer-reviewed evidence (2024-2025 preferred) for advocacy effectiveness
2. Extract effect magnitudes from empirical studies:
   - Public awareness campaigns → sentiment shifts (%)
   - Research funding redirects → resource allocation changes (%)
   - International coalitions → cooperation probability increases (%)
   - Policy advocacy → adoption timeline compression (months)
   - Corporate engagement → behavior change rates (%)

3. Justify effect sizes with data (not "feels right")
4. Map effects to game domains:
   - `ai_policy` - AI governance, safety regulation
   - `climate_action` - Climate mitigation, adaptation
   - `social_cohesion` - Community bonds, trust
   - `international_cooperation` - Multilateral coordination
   - `research_direction` - Funding priorities, research focus

5. Document timescales:
   - Duration: How long effect lasts (6-24 months)
   - Cooldown: How long before action can repeat (3-12 months)

6. Identify prerequisites:
   - Tech unlock requirements
   - Governance thresholds
   - Crisis triggers

**Constraints (Sylvia-enforced):**
- Single action: ≤5% effect (baseEffect 0.01-0.05)
- Per domain: ≤10% cumulative
- Total cumulative: ≤15%
- No choice >20% outcome shift

**Target Actions (8-12):**
1. **Public Awareness Campaigns**
   - AI Safety Public Awareness (domain: ai_policy)
   - Climate Action Mobilization (domain: climate_action)
   - Social Cohesion Programs (domain: social_cohesion)

2. **International Cooperation**
   - Build US-China AI Dialogue (domain: international_cooperation)
   - Establish Climate Finance Coalition (domain: international_cooperation)
   - Create Shared Research Infrastructure (domain: research_direction)

3. **Research Funding Shifts**
   - Redirect to AI Alignment Research (domain: research_direction)
   - Fund Climate Tech R&D (domain: climate_action)
   - Support Social Safety Net Innovation (domain: social_cohesion)

4. **Policy Advocacy**
   - Advocate for AI Regulation (domain: ai_policy)
   - Push for Carbon Pricing (domain: climate_action)
   - Promote Universal Basic Services (domain: social_cohesion)

**Output Format:**
```markdown
# Game Advocacy Actions - Research Report

## Action: [NAME]

### Description
[What the action does, player-facing explanation]

### Mechanism
[How it works: sentiment_shift, funding_weight, coordination_boost, policy_adoption, private_sector_weight]

### Target Metric
[GameState path: e.g., "society.publicSentiment.aiSafetySupport"]

### Effect Magnitude

| Parameter | Value | Source |
|-----------|-------|--------|
| Base Effect | 0.02 (2%) | Study X (2024) Table 3 |
| Duration | 6 months | Study Y (2025) Section 4.2 |
| Cooldown | 3 months | Expert consensus |
| Max Cumulative | 0.08 (8%) | Bounded by domain limit |

**Justification:** [Paragraph explaining WHY this magnitude, citing specific data]

### Prerequisites
[Optional: conditions that must be met before action is available]

### Interactions
**Affects:**
- Metric A (primary)
- Metric B (secondary cascade)

**Affected by:**
- System X (amplifies/dampens effect)
- Crisis Y (enables/blocks action)

### Timeline
**Early game (months 0-60):** [Relevance]
**Mid game (months 61-180):** [Relevance]
**Late game (months 181+):** [Relevance]

### Research Citations
1. Author et al. (2024). "Title". Journal. DOI.
2. Author et al. (2025). "Title". Journal. DOI.

---
```

---

### Task 2.2: Validate Action Parameters (Quality Gate 1)
**Agent:** research-skeptic (Sylvia)
**Duration:** 1-2 hours
**Input:** research/game_advocacy_actions_20251206.md
**Output:** reviews/game_advocacy_actions_critique_20251206.md

**Validation Criteria:**
1. **Research Quality:**
   - Are sources peer-reviewed?
   - Are effect sizes backed by data (not anecdotes)?
   - Are timescales empirically grounded?
   - Are there contradictory findings Cynthia missed?

2. **Bound Compliance:**
   - Does any single action exceed 5%?
   - Do domain totals respect 10% limits?
   - Is total cumulative ≤15% possible?
   - Are max cumulative effects per action reasonable?

3. **Simplification Audit:**
   - Does action catalog oversimplify complex interventions?
   - Are there false precision issues (e.g., claiming 2.3% when evidence is ±5%)?
   - Do descriptions create player misconceptions about agency?

4. **Game Balance vs Research Integrity:**
   - Are actions too weak to matter? (Player frustration)
   - Are actions too strong to justify? (Research validity)
   - Is uncertainty properly communicated?

**Output Format:**
```markdown
# Game Advocacy Actions - Research Critique

**Reviewer:** Sylvia (research-skeptic)
**Date:** 2025-12-06
**Source:** research/game_advocacy_actions_20251206.md

## Overall Assessment

**Research Quality:** [A/B/C/D/F with justification]
**Bound Compliance:** [PASS/FAIL with violations]
**Simplification Risk:** [LOW/MEDIUM/HIGH with concerns]

**Verdict:** [APPROVED / CONDITIONAL PASS / REQUIRES REVISION / REJECTED]

## Action-by-Action Review

### Action: [NAME]

**Research Backing:** [Strong / Adequate / Weak / Missing]
- ✅ Strengths: [...]
- ⚠️ Concerns: [...]
- ❌ Fatal flaws: [...]

**Effect Magnitude:** [Justified / Borderline / Overconfident]
- Claimed: X%
- Evidence range: Y-Z%
- Verdict: [...]

**Prerequisites:** [Appropriate / Too restrictive / Too permissive]

### Mandatory Corrections
1. [Action X: Reduce effect from 4% to 2.5% per Study Y]
2. [Action Z: Add prerequisite "AI governance framework unlocked"]

### Optional Improvements
1. [Consider adding uncertainty bands to UI]
2. [Document interaction with System X]

## Approval Conditions

**If CONDITIONAL PASS:**
- [ ] Correction 1 applied
- [ ] Correction 2 applied
- [ ] Re-review not required (minor changes)

**If REQUIRES REVISION:**
- [ ] Major correction 1 applied
- [ ] Major correction 2 applied
- [ ] Re-review MANDATORY before implementation
```

**Gate Decision:**
- ✅ APPROVED → Proceed to Task 2.3
- ⚠️ CONDITIONAL PASS → Apply corrections → Proceed to Task 2.3
- ❌ REQUIRES REVISION → Loop back to Cynthia
- 🚨 REJECTED → Pivot strategy or abandon feature

---

### Task 2.3: Implement Advocacy Action Catalog
**Agent:** simulation-maintainer (Roy)
**Duration:** 1-2 hours
**Input:**
- research/game_advocacy_actions_20251206.md (Sylvia-approved version)
- reviews/game_advocacy_actions_critique_20251206.md
**Output:** src/game/data/advocacyActions.ts

**Implementation Requirements:**

1. **Create catalog file:**
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
 */

export const ADVOCACY_ACTIONS: Record<AdvocacyActionId, AdvocacyAction> = {
  advocate_ai_safety: {
    id: 'advocate_ai_safety',
    name: 'AI Safety Public Awareness Campaign',
    description: 'Launch public campaign to increase AI safety awareness and policy support',
    mechanism: 'sentiment_shift',
    targetMetric: 'society.publicSentiment.aiSafetySupport',
    baseEffect: 0.025, // 2.5% (Source: Study X 2024)
    duration: 6, // months
    cooldown: 3, // months
    prerequisites: [],
    maxCumulativeEffect: 0.08, // 8% domain limit
    domain: 'ai_policy',
    researchSources: [
      'Author et al. (2024). Study title. Journal. DOI.',
      'Author et al. (2025). Study title. Journal. DOI.',
    ],
  },
  // ... 7-11 more actions
};

/**
 * Get action by ID
 */
export function getAdvocacyAction(actionId: AdvocacyActionId): AdvocacyAction | undefined {
  return ADVOCACY_ACTIONS[actionId];
}

/**
 * Get all actions for a domain
 */
export function getActionsByDomain(domain: InfluenceDomain): AdvocacyAction[] {
  return Object.values(ADVOCACY_ACTIONS).filter(a => a.domain === domain);
}
```

2. **Update InfluenceCalculator:**
```typescript
// src/game/core/InfluenceCalculator.ts

import { ADVOCACY_ACTIONS } from '../data/advocacyActions';

export class InfluenceCalculator {
  // Replace hardcoded ACTION_CATALOG with import
  getAction(actionId: AdvocacyActionId): AdvocacyAction | undefined {
    return ADVOCACY_ACTIONS[actionId];
  }

  getAllActions(): AdvocacyAction[] {
    return Object.values(ADVOCACY_ACTIONS);
  }
}
```

3. **Update type definitions (if needed):**
```typescript
// src/game/types/index.ts

export type AdvocacyActionId =
  | 'advocate_ai_safety'
  | 'promote_climate_action'
  | 'build_international_coalition'
  | 'fund_alignment_research'
  | 'strengthen_social_cohesion'
  // Add new action IDs here
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
  researchSources: string[]; // NEW: Track research backing
}
```

4. **Defensive coding:**
```typescript
// Use assertion utilities, no silent fallbacks
import { assertFinite, assertInRange } from '@/simulation/utils/assertions';

// Validate action parameters on load
export function validateActionCatalog(): void {
  for (const [id, action] of Object.entries(ADVOCACY_ACTIONS)) {
    assertInRange(action.baseEffect, 0.01, 0.05, {
      location: 'validateActionCatalog',
      valueName: `${id}.baseEffect`,
    });

    assertFinite(action.duration, {
      location: 'validateActionCatalog',
      valueName: `${id}.duration`,
    });

    // etc.
  }
}
```

**Testing:**
```bash
# Type check
npx tsc --noEmit

# Unit tests
npm test src/game/data/advocacyActions.test.ts

# Validate action catalog loads
npx tsx -e "import {ADVOCACY_ACTIONS} from './src/game/data/advocacyActions'; console.log(Object.keys(ADVOCACY_ACTIONS));"
```

---

### Task 2.4: Wire InfluenceCalculator Integration
**Agent:** simulation-maintainer (Roy)
**Duration:** 2-3 hours
**Input:** Completed advocacyActions.ts
**Output:** Updated GameSession, InfluenceCalculator with full integration

**Implementation:**

1. **Add currency system (if not exists):**
```typescript
// src/game/types/index.ts

export interface GameLayerState {
  // Existing fields...

  // NEW: Player resources for advocacy
  playerResources: {
    reputation: number; // 0-100
    politicalCapital: number; // 0-100
    funding: number; // Abstract currency
  };
}
```

2. **Add costs to actions:**
```typescript
// src/game/data/advocacyActions.ts

export interface AdvocacyAction {
  // Existing fields...

  costs: {
    reputation?: number;
    politicalCapital?: number;
    funding?: number;
  };
}
```

3. **Update queueAdvocacyAction:**
```typescript
// src/game/core/GameSession.ts

queueAdvocacyAction(actionId: AdvocacyActionId): QueueResult {
  const result = this.influenceCalculator.processAdvocacyAction(
    actionId,
    this.simulationState
  );

  if (result.success && result.queuedDecision) {
    // Deduct costs from player resources
    const action = this.influenceCalculator.getAction(actionId);
    if (action?.costs) {
      this.gameLayerState.playerResources.reputation -= action.costs.reputation ?? 0;
      this.gameLayerState.playerResources.politicalCapital -= action.costs.politicalCapital ?? 0;
      this.gameLayerState.playerResources.funding -= action.costs.funding ?? 0;
    }

    // Queue to simulation via callback
    if (this.queueDecisionCallback) {
      this.queueDecisionCallback(result.queuedDecision);
    }

    // Update game layer state
    this.gameLayerState.decisionHistory.push(result.queuedDecision);

    // Emit event
    this.emitEvent({
      type: 'advocacy_action_queued',
      timestamp: this.simulationState?.currentMonth ?? 0,
      data: { actionId, decision: result.queuedDecision },
    });
  }

  return result;
}
```

4. **Add resource regeneration:**
```typescript
// src/game/core/GameSession.ts

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
}

private calculateResourceRegeneration(state: GameStateSnapshot): {
  reputation: number;
  politicalCapital: number;
  funding: number;
} {
  // Base regeneration
  return {
    reputation: 1, // +1 per month (slow)
    politicalCapital: 2, // +2 per month (moderate)
    funding: state.aiEconomicContribution * 0.01, // Scales with AI economy
  };
}
```

**Testing:**
```bash
# Integration test
npm test src/game/core/GameSession.test.ts

# Verify decision queueing works
npx tsx scripts/testGameSession.ts
```

---

### Task 2.5: Build Action Panel UI
**Agent:** far-future-ux-designer (Tessa)
**Duration:** 3-4 hours
**Input:** Completed advocacyActions.ts, GameSession integration
**Output:** src/components/dashboards/game/ActionPanel.tsx

**UI Requirements:**

1. **Action panel layout:**
```
┌─────────────────────────────────────────┐
│ Player Resources                        │
│ 🌟 Reputation: ███████░░░ 75/100       │
│ 🏛️ Political Capital: █████░░░░░ 55/100│
│ 💰 Funding: $2.3B                       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Available Actions                       │
├─────────────────────────────────────────┤
│ [🤖 AI Safety Awareness]                │
│ +2.5% safety support (6 months)         │
│ Cost: 10 reputation, 15 political       │
│ Cooldown: 3 months                      │
│                              [QUEUE] ←  │
├─────────────────────────────────────────┤
│ [🌍 Climate Action Mobilization]        │
│ +2% climate support (6 months)          │
│ Cost: 15 reputation                     │
│ ⏳ Cooldown: 2 months remaining         │
├─────────────────────────────────────────┤
│ ... (show 4-6 actions, scroll for more) │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Pending Decisions (3)                   │
├─────────────────────────────────────────┤
│ 🤖 AI Safety Awareness (queued month 12)│
│ 🌍 Climate Mobilization (queued month 14│
│ 🤝 Build Coalition (queued month 15)    │
└─────────────────────────────────────────┘
```

2. **Component structure:**
```tsx
// src/components/dashboards/game/ActionPanel.tsx

'use client';

import { useState, useEffect } from 'react';
import { useGameState } from '@/game/providers/GameStateProvider';
import type { AdvocacyAction, QueueResult } from '@/game/types';

export function ActionPanel() {
  const { gameSession, gameState } = useGameState();
  const [actions, setActions] = useState<AdvocacyAction[]>([]);
  const [resources, setResources] = useState({ reputation: 100, politicalCapital: 100, funding: 0 });

  useEffect(() => {
    if (gameSession) {
      setActions(gameSession.getAvailableActions());
      setResources(gameSession.getGameLayerState().playerResources);
    }
  }, [gameSession, gameState]);

  const handleQueueAction = (actionId: string) => {
    if (!gameSession) return;

    const result: QueueResult = gameSession.queueAdvocacyAction(actionId);

    if (result.success) {
      // Show success notification
      console.log(`✅ Queued: ${actionId}`);
    } else {
      // Show error notification
      console.error(`❌ ${result.rejectionReason}`);
    }
  };

  return (
    <div className="action-panel">
      <ResourceDisplay resources={resources} />
      <ActionList
        actions={actions}
        resources={resources}
        onQueueAction={handleQueueAction}
      />
      <PendingDecisions decisions={gameState?.decisionHistory ?? []} />
    </div>
  );
}
```

3. **Visual design (Elysium-inspired far-future aesthetic):**
- Clean, minimalist layout
- Soft blue/white color palette
- Subtle animations on hover
- Clear affordances (buttons, states)
- Uncertainty visualization (probability ranges, not false precision)

4. **Interaction states:**
- **Available:** Action can be queued (green button)
- **On cooldown:** Grayed out with countdown (red/orange)
- **Insufficient resources:** Grayed with cost highlight (yellow)
- **Prerequisites not met:** Locked with tooltip explaining why

**Testing:**
```bash
# Component tests
npm test src/components/dashboards/game/ActionPanel.test.tsx

# Visual regression
npm run storybook
```

---

### Task 2.6: Write Tutorial Content
**Agent:** sci-fi-tech-visionary (Ray) + research-skeptic (Sylvia)
**Duration:** 2-3 hours
**Input:** Implemented action panel, advocacy catalog
**Output:** src/game/data/tutorialContent.ts + Sylvia approval

**Tutorial Requirements:**

1. **Frame indirect influence correctly:**
```
❌ BAD: "Choose actions to control the simulation"
✅ GOOD: "Advocate for changes that shift probabilities"

❌ BAD: "This will cause X to happen"
✅ GOOD: "This increases the likelihood of X by ~2%"

❌ BAD: "You have 100% control over outcomes"
✅ GOOD: "You can nudge the system toward better outcomes, but uncertainty remains"
```

2. **Communicate uncertainty:**
```
"Your actions affect the simulation indirectly - like advocacy in the real world.
A public awareness campaign doesn't guarantee policy change, but it shifts public
sentiment, which influences policymakers, which affects outcomes.

Effect sizes are research-backed ranges (e.g., 2-5%), not guaranteed values."
```

3. **Explain influence budget:**
```
"You have limited influence (15% total) to prevent any single player from
dominating outcomes. This reflects research showing that advocacy campaigns
have bounded effects - even massive movements rarely shift public opinion
by more than 10-20% in the short term."
```

4. **Set realistic expectations:**
```
"This is not a power fantasy. You're an advocacy organization with finite
resources trying to nudge a complex system. Success means increasing the
probability of good outcomes from 30% to 45%, not guaranteeing utopia."
```

**Tutorial Sections:**
1. Welcome (1-2 screens)
2. How Advocacy Works (2-3 screens)
3. Action Catalog Overview (1 screen)
4. Resource Management (1 screen)
5. Reading Outcomes (1 screen)
6. First Action Tutorial (interactive)

**Sylvia Review Criteria:**
- Does tutorial create false precision expectations?
- Does it accurately represent research uncertainty?
- Does it oversell player agency?
- Does it explain simplifications appropriately?

---

## Integration Testing

**After all Phase 2 tasks complete:**

1. **Full playthrough test:**
```bash
# Start dev server
npm run dev

# Navigate to /game-dashboard-demo
# 1. Select scenario (baseline)
# 2. Queue 3 advocacy actions
# 3. Run simulation for 60 months
# 4. Verify:
#    - Actions appear in decision queue
#    - Resources are deducted
#    - Cooldowns are enforced
#    - Simulation state changes reflect actions
#    - Events show attribution ("Your advocacy contributed...")
```

2. **Verify influence bounds:**
```typescript
// scripts/testInfluenceBounds.ts

import { GameSession } from '@/game/core/GameSession';
import { ADVOCACY_ACTIONS } from '@/game/data/advocacyActions';

const session = new GameSession({ scenario: 'baseline' });

// Try to exceed single action limit (should fail)
const result1 = session.queueAdvocacyAction('hypothetical_6_percent_action');
console.assert(!result1.success, 'Should reject >5% actions');

// Try to exceed domain limit (should fail)
session.queueAdvocacyAction('ai_action_1'); // 4%
session.queueAdvocacyAction('ai_action_2'); // 4%
const result2 = session.queueAdvocacyAction('ai_action_3'); // 4% - would exceed 10%
console.assert(!result2.success, 'Should reject domain overflow');

// Try to exceed total limit (should fail)
// ... queue actions across domains totaling >15%
```

3. **Determinism check:**
```bash
# Run same scenario twice with same actions
npx tsx scripts/testDeterminism.ts

# Verify:
# - Same actions + same seed = same outcome
# - Different actions + same seed = different outcome (player influence works)
```

---

## Quality Gates

### Quality Gate 1: Research Validation (MANDATORY)
**Agent:** research-skeptic (Sylvia)
**Input:** research/game_advocacy_actions_20251206.md
**Output:** reviews/game_advocacy_actions_critique_20251206.md

**Criteria:**
- ✅ All actions have peer-reviewed backing
- ✅ Effect magnitudes justified by data
- ✅ Bounds compliance verified
- ✅ Simplification risks acceptable

**Gate Decision:**
- PASS → Proceed to implementation
- FAIL → Loop back to Cynthia

### Quality Gate 1.5: Tutorial Validation (MANDATORY)
**Agent:** research-skeptic (Sylvia)
**Input:** Tutorial content draft
**Output:** Approval or revision requests

**Criteria:**
- ✅ No false precision
- ✅ Uncertainty properly communicated
- ✅ Player agency framed correctly
- ✅ Simplifications explained

---

## Success Metrics

**Phase 2 complete when:**
1. ✅ 8-12 advocacy actions implemented with research backing
2. ✅ Sylvia approves all effect magnitudes and tutorial text
3. ✅ Action panel UI functional (queue, costs, cooldowns)
4. ✅ Integration tests pass
5. ✅ Determinism verified
6. ✅ Tutorial guides players correctly

**Handoff to Phase 3:**
- Player agency system operational
- Ready for scenario parameter extraction
- Foundation for probability visualization (Phase 4)

---

## Token Budget

**Estimated:**
- Task 2.1 (Research): 8-10k tokens
- Task 2.2 (Validation): 4-6k tokens
- Task 2.3 (Catalog): 3-4k tokens
- Task 2.4 (Integration): 5-6k tokens
- Task 2.5 (UI): 8-10k tokens
- Task 2.6 (Tutorial): 6-8k tokens
- **Total: ~40-50k tokens**

**Actual tracking:** Update after each task completes.
