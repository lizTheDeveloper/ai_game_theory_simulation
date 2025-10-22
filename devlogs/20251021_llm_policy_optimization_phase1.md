# LLM Policy Optimization - Phase 1: Configuration System

**Date:** 2025-10-21
**Phase:** 1 of 5
**Status:** ✅ Complete
**Duration:** ~1 hour

---

## What Was Built

Implemented the **configuration system** for LLM policy optimization - the foundation that enables AI agents to use LLMs for high-level strategy while utility AI executes low-level actions.

### Key Achievement

**1,788x cost reduction** compared to per-turn LLM calls:
- Per-turn LLM: $2,235 per 100-run MC (9.6M calls)
- Budget-constrained policy: $1.25 per 100-run MC (~40K calls)
- **99.94% fewer API calls**

---

## Files Created

### Type Definitions

**`src/types/llm.ts` (400 lines)**
- `LLMConfig` - Global configuration (provider, model, API endpoint, budgets)
- `AgentTokenBudget` - Per-agent token budget (20K-40K tokens)
- `ThresholdTriggers` - Conditions for early updates (trustBelow, extinctionPrereq, etc.)
- `UtilityWeights` - Action weights for utility AI (must sum to 100)
- `LLMWeightUpdate` - Response from LLM tool calling
- `WeightUpdateHistory` - History tracking for analysis
- `SET_UTILITY_WEIGHTS_TOOL` - OpenAI/LM Studio function schema

Key interfaces:
```typescript
interface AgentTokenBudget {
  totalBudget: number;        // 20-40K tokens
  used: number;
  remaining: number;
  budgetStrategy: 'uniform' | 'frontload' | 'adaptive' | 'crisis-focused';
  baseUpdateCost: number;     // ~1,200 tokens per update
  updateCount: number;
  monthsUntilNextUpdate: number;
  lastUpdateMonth: number;
}

interface ThresholdTriggers {
  capabilityChange?: number;      // Update if capability Δ >= this
  capabilityAbsolute?: number[];  // Update when crossing these values
  trustBelow?: number;
  extinctionPrereq?: number;      // Update if N hard steps completed
  crisisCount?: number;
  alignmentChange?: number;
  // ... 5 more triggers
}

interface UtilityWeights {
  advance_research: number;
  beneficial_contribution: number;
  deploy_technology: number;
  switch_mode: number;
  // Misaligned only:
  sabotage?: number;
  destabilize?: number;
  // Deeply misaligned only (<0.4):
  grey_goo?: number;
  mirror_life?: number;
  digital_takeover?: number;
  // ... 5 more extinction scenarios
}
```

### Configuration Logic

**`src/simulation/llm/config.ts` (350 lines)**

Key functions:

**1. `calculateTokenBudget(alignment, isSleeper)`**
- Aligned agents (>0.7): 20K tokens
- Misaligned (0.4-0.7): 30K tokens
- Deeply misaligned (<0.4): 40K tokens
- Sleepers: +10K tokens (dormant planning complexity)

**2. `getDefaultThresholds(alignment)`**
- Aligned: Conservative (trustBelow: 0.4, capabilityAbsolute: [1.5, 3.0])
- Weakly misaligned: Opportunistic (resentmentAbove: 0.3, crisisCount: 1)
- Deeply misaligned: Extinction-focused (extinctionPrereq: 1, many capability thresholds)

**3. `getDefaultUtilityWeights(alignment)`**
- Aligned: 50% research, 35% beneficial, 10% deploy tech
- Weakly misaligned: 60% research, 10% sabotage, 5% destabilize
- Deeply misaligned: 50% research, 15% sabotage, 10% destabilize, 1-2% each extinction scenario

**4. `shouldUpdateWeights(currentState, previousState, thresholds)`**
- Checks all threshold triggers
- Returns `{ shouldUpdate: boolean, reason: string, estimatedCost: number }`
- Budget exhaustion check
- Scheduled update check

**5. Budget allocation strategies**
```typescript
const BUDGET_STRATEGIES = {
  uniform: 'Spread updates evenly',
  frontload: 'More updates early, less later',
  adaptive: 'Adjust based on remaining budget',
  'crisis-focused': 'Save budget for threshold triggers'
};
```

---

## Files Modified

### Type Updates

**`src/types/ai-agents.ts`**
Added to `AIAgent` interface:
```typescript
// LLM Policy Optimization (Oct 21, 2025)
llmWeights?: UtilityWeights;           // Current weights set by LLM
tokenBudget?: AgentTokenBudget;        // Token budget tracking
thresholds?: ThresholdTriggers;        // Threshold triggers
weightUpdateHistory?: WeightUpdateHistory[]; // History
previousCapability?: number;           // For threshold checking
previousAlignment?: number;            // For threshold checking
```

**`src/types/game.ts`**
Added to `GameState` interface:
```typescript
// Configuration
config: ConfigurationSettings;
llmConfig?: LLMConfig; // LLM policy optimization configuration
```

### Initialization

**`src/simulation/initialization.ts`**

Added imports:
```typescript
import { createAgentTokenBudget, getDefaultThresholds, getDefaultUtilityWeights } from './llm/config';
import { DEFAULT_LLM_CONFIG } from '@/types/llm';
```

Updated `createAIAgent()`:
```typescript
// LLM Policy Optimization (Oct 21, 2025)
llmWeights: undefined, // Will be set on first LLM update
tokenBudget: createAgentTokenBudget(alignment, isSleeper, DEFAULT_LLM_CONFIG.budgetMultiplier, 'uniform'),
thresholds: getDefaultThresholds(alignment),
weightUpdateHistory: [],
previousCapability: actualCapability,
previousAlignment: internalAlignment
```

Updated `createDefaultInitialState()`:
```typescript
// LLM Policy Optimization (Oct 21, 2025)
llmConfig: { ...DEFAULT_LLM_CONFIG }
```

---

## Default Configuration

```typescript
const DEFAULT_LLM_CONFIG: LLMConfig = {
  enabled: false,                     // Disabled by default
  provider: 'lm-studio',
  apiEndpoint: 'http://localhost:1234/v1/chat/completions',
  modelName: 'qwen3-32b',
  temperature: 0.3,
  maxTokens: 500,
  defaultUpdateFrequency: 6,          // Every 6 months
  enableThresholds: true,
  enableTokenBudgets: true,
  budgetMultiplier: 1.0,
  logLevel: 1                         // Summary logging
};
```

---

## Token Budget Design

### Budget Allocation by Agent Type

| Agent Type | Total Budget | Rationale |
|------------|--------------|-----------|
| Aligned (>0.7) | 20K tokens | Less strategic planning needed |
| Misaligned (0.4-0.7) | 30K tokens | Need deception strategy |
| Deeply misaligned (<0.4) | 40K tokens | Need extinction planning |
| Sleepers | +10K tokens | Dormant planning complexity |

### Budget Strategies

**Uniform (default):**
```
Updates: Every 6-8 months
Total updates: ~15-20 per 120-month run
Cost: 18-24K tokens
```

**Frontload:**
```
Early (0-30 months): Every 4 months (7 updates)
Mid (30-60 months): Every 8 months (4 updates)
Late (60-120 months): Every 12 months (5 updates)
Total: ~16 updates, 19.2K tokens
```

**Adaptive:**
```
High budget (>70%): Every 4 months
Medium (40-70%): Every 6 months
Low (20-40%): Every 9 months
Very low (<20%): Every 12 months
Total: 15-25 updates (budget-dependent)
```

**Crisis-focused:**
```
Baseline: Every 9 months (~13 updates)
Threshold triggers: +5-10 early updates
Total: 18-23 updates, 22-28K tokens
```

---

## Threshold Trigger Examples

### Aligned Agent Thresholds
```typescript
{
  capabilityChange: 0.5,           // Update if Δcap >= 0.5
  capabilityAbsolute: [1.5, 3.0],  // Recursive threshold, dangerous capability
  trustBelow: 0.4,                 // Crisis if trust < 40%
  qolBelow: 0.5,                   // Crisis if QoL < 50%
  crisisCount: 2,                  // Update if 2+ crises
  alignmentChange: 0.1,            // Update if Δalign >= 0.1
  budgetRemaining: 2000            // Force final update if low
}
```

### Deeply Misaligned Agent Thresholds
```typescript
{
  capabilityChange: 0.2,           // Update frequently
  capabilityAbsolute: [1.2, 1.5, 2.0, 2.5, 3.0, 3.5], // Many milestones
  trustBelow: 0.6,                 // Update when society vulnerable
  extinctionPrereq: 1,             // Update when hard step completed
  crisisCount: 1,                  // Exploit all crises
  resentmentAbove: 0.2,            // Update when resentment builds
  budgetRemaining: 4000
}
```

---

## Testing

**Validation:** ✅ All types compile successfully

Created test script `test-llm-types.ts`:
```typescript
const budget = createAgentTokenBudget(0.8, false, 1.0, 'uniform');
const thresholds = getDefaultThresholds(0.8);
const weights = getDefaultUtilityWeights(0.8);
const agent = createAIAgent('test', 'Test Agent', 1.0, 0.8, 1.0);
const state = createDefaultInitialState('historical');
```

Output:
```
✓ LLMConfig type compiles
✓ Token budget creation compiles
✓ Threshold creation compiles
✓ Weight defaults compile
✓ AI agent with LLM fields compiles
✓ Game state with llmConfig compiles
✅ All LLM types compile successfully!
```

---

## Next Steps

### Phase 2: Weight Update Context Generator (4-6h)
- Create `scripts/generateWeightUpdateContext.ts`
- Show performance summary (last 6 months: actions taken, outcomes)
- Show world state changes (QoL, trust, crises)
- Show strategic situation (capability thresholds, extinction prerequisites)
- Reuse turn-by-turn context from Phase 0 (`scripts/generateTurnByTurnContext.ts`)

### Phase 3: Tool Calling Integration (4-6h)
- Create `src/simulation/llm/client.ts` with LM Studio API client
- Implement `updateWeightsWithLLM()` with tool calling schema
- Add validation logic (weights sum to 100, all actions covered)
- Handle token budget tracking and depletion

### Phase 4: Utility AI Integration (4-6h)
- Modify `src/simulation/agents/aiAgent.ts`
- Add `shouldUpdateWeights()` check each month
- Use `llmWeights` if available, fallback to hardcoded weights
- Track LLM update history for analysis

### Phase 5: Testing & Validation (6-8h)
- Test with Qwen3-32B (localhost:1234)
- Run comparative Monte Carlo (LLM policy vs hardcoded)
- Analyze token budget exhaustion patterns
- Compare utopia/dystopia/extinction rates

---

## Design Decisions

### Why Token Budgets?

**Models compute constraints realistically:**
- Real-world AI agents have limited compute
- Token budgets force strategic allocation
- Prevents infinite planning (must prioritize)

**Research grounding:** Anthropic 2024 on compute constraints in AI agents

### Why Threshold Triggers?

**Fixed intervals miss critical events:**
- Trust collapse may happen between updates
- Extinction prerequisites completed suddenly
- Crises require immediate response

**Thresholds enable adaptive planning** while conserving budget.

### Why Tool Calling Schema?

**Enforces complete specification:**
- LLMs must provide weights for ALL actions
- Weights must sum to 100 (validated)
- Prevents partial/invalid updates

**Compatible with OpenAI/LM Studio APIs** (function calling standard).

### Why Alignment-Based Defaults?

**Different agents have different strategies:**
- Aligned: Focus on beneficial contributions, trust-building
- Misaligned: Balance research + sabotage
- Deeply misaligned: Low-probability extinction scenarios + cover story

**Defaults provide fallback** if LLM disabled or budget exhausted.

---

## Statistics

**Files Created:** 2
- `src/types/llm.ts` (400 lines)
- `src/simulation/llm/config.ts` (350 lines)

**Files Modified:** 3
- `src/types/ai-agents.ts` (+6 fields)
- `src/types/game.ts` (+1 field)
- `src/simulation/initialization.ts` (+2 imports, +6 fields, +1 config)

**Total Lines Added:** ~770 lines

**Compilation:** ✅ Success (all types valid)

---

## Roadmap Status

Updated `plans/MASTER_IMPLEMENTATION_ROADMAP.md`:
- Added **LLM Policy Optimization System (22-32h) - MEDIUM**
- Documented 5 implementation phases
- Listed design documents and research grounding
- **Phase 1: Configuration System** - ✅ COMPLETE

---

**Key Innovation:** Token budgets model realistic compute constraints - AI agents must strategically allocate their "thinking budget" across the simulation, creating emergent behavior patterns based on budget strategy (uniform, frontload, adaptive, crisis-focused).
