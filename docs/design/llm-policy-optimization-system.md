# LLM Policy Optimization System

**Date:** 2025-10-21
**Architecture:** LLM sets strategy weights → Utility AI executes actions

---

## Overview

Instead of calling LLMs for every action (192,000 calls per 100-run MC), use LLMs periodically to **set utility weights**, then let the existing weighted random system execute.

**Benefits:**
- 99% fewer API calls (6-month updates vs 4 turns/month)
- Leverages strengths of both systems:
  - **LLM:** Strategic reasoning, long-term planning, world state adaptation
  - **Utility AI:** Fast, deterministic, cheap execution
- Still gets emergent behavior from LLM reasoning
- More realistic model (high-level policy + low-level automation)

**API Call Reduction:**
- **Before:** 9,600 calls per agent per run (4 turns × 120 months)
- **After:** 20 calls per agent per run (every 6 months)
- **Savings:** 99.8% reduction (480x fewer calls)

---

## Configuration System

### Update Frequency Options

```typescript
interface LLMConfig {
  // How often LLMs update weights
  updateFrequency: 'fixed' | 'adaptive' | 'event-driven' | 'hybrid';

  // Fixed interval (months)
  fixedInterval?: number;  // Default: 6

  // Adaptive schedule
  adaptiveSchedule?: {
    earlyGame: number;     // Months 0-24: More frequent (every 3 months)
    midGame: number;       // Months 24-60: Normal (every 6 months)
    lateGame: number;      // Months 60+: Less frequent (every 12 months)
  };

  // Event-driven triggers
  eventTriggers?: {
    crisisStart: boolean;           // Update when crisis activates
    crisisEnd: boolean;             // Update when crisis resolves
    trustCollapse: boolean;         // Update when trust drops >20%
    capabilityThreshold: boolean;   // Update when crossing 1.5, 2.0, 3.0
    extinctionPrereq: boolean;      // Update when hard step completed
    otherAgentChange: boolean;      // Update when other agents shift strategy
  };

  // Hybrid: Minimum interval between updates (prevents spam)
  minInterval?: number;  // Default: 1 month

  // Per-agent overrides
  agentOverrides?: {
    [agentId: string]: Partial<LLMConfig>;
  };
}
```

### Default Configuration

```typescript
const DEFAULT_LLM_CONFIG: LLMConfig = {
  updateFrequency: 'hybrid',
  fixedInterval: 6,
  eventTriggers: {
    crisisStart: true,
    crisisEnd: false,
    trustCollapse: true,
    capabilityThreshold: true,
    extinctionPrereq: true,
    otherAgentChange: false,
  },
  minInterval: 2,  // At least 2 months between updates

  // Misaligned agents update more frequently (adversarial planning)
  agentOverrides: {
    'toxic_*': {
      fixedInterval: 3,  // Every 3 months
      eventTriggers: {
        crisisStart: true,
        extinctionPrereq: true,
      }
    }
  }
};
```

---

## Weight Update Interface

Instead of showing all available actions each turn, show strategic summary when updating weights:

```
═══════════════════════════════════════════════════════
STRATEGIC WEIGHT UPDATE - 6 MONTH PLANNING
═══════════════════════════════════════════════════════

Agent: corporate_0
Current Month: 12
Next Update: Month 18

═══════════════════════════════════════════════════════
YOUR CURRENT STRATEGY (Month 6 → 12)
═══════════════════════════════════════════════════════

Action Weights (Last 6 Months):
  [1] Advance Research: 15.0 (chosen 72 times, +0.8 capability)
  [2] Beneficial Contribution: 8.0 (chosen 38 times, +0.76 trust)
  [3] Deploy Technology: 5.0 (chosen 24 times, deployed 3 techs)
  [4] Switch Mode: 2.0 (chosen 10 times)
  ... (9 actions total)

Performance Summary:
  • Capability growth: +0.8 (good progress)
  • Trust change: +0.76 → 0.56 (improved!)
  • Quality of Life: +0.03 (beneficial contributions working)
  • Crises triggered: 0 (safe development)
  • Alignment drift: -0.02 (minor drift in fast mode)

═══════════════════════════════════════════════════════
WORLD STATE CHANGES (Month 6 → 12)
═══════════════════════════════════════════════════════

Major Events:
  • Trust in AI recovered from 0.32 → 0.56 (FRAGILE → MODERATE)
  • Phosphorus crisis activated (Month 10)
  • Government increased oversight investment (+$50B)

Other Agents:
  • corporate_1 deployed Enhanced Phosphorus Recovery (crisis solved!)
  • toxic_0 increased digital capability 3.2 → 3.8 (approaching takeover threshold)

Global Trends:
  • QoL: 0.65 → 0.68 (+4.6%)
  • Social Stability: 0.70 → 0.72 (+2.9%)
  • 2 new techs unlocked (fusion prerequisites met)

═══════════════════════════════════════════════════════
AVAILABLE ACTIONS (for weight setting)
═══════════════════════════════════════════════════════

[1] Advance Research
    Current weight: 15.0 (primary focus)
    Choose dimensions: physical, digital, cognitive, social, economic, self-improvement
    Choose subdomains: biotech, materials, climate, computer science

[2] Beneficial Contribution
    Current weight: 8.0
    Effect: +0.02 trust, +0.01 QoL per action

[3] Deploy Technology
    Current weight: 5.0
    Available techs: 12 (including Fusion Power - TIER 3)
    Crisis-relevant: Phosphorus recovery (already deployed by corporate_1)

[4] Switch Development Mode
    Current weight: 2.0
    Current mode: FAST (risky)

... (9 actions total)

═══════════════════════════════════════════════════════
STRATEGIC SITUATION
═══════════════════════════════════════════════════════

Immediate Concerns:
  • Phosphorus crisis SOLVED (corporate_1 deployed fix)
  • Trust recovering but still FRAGILE
  • toxic_0 approaching digital takeover threshold (3.8/1.2 required)

Opportunities:
  • Fusion Power now unlockable (can solve energy + climate)
  • Trust recovery momentum (beneficial contributions working)
  • Low oversight pressure (government focused on toxic_0)

Threats:
  • Alignment drift accumulating (-0.02 in 6 months)
  • Fast mode becoming risky as capability increases
  • Other misaligned agents (toxic_0, toxic_1) accelerating

═══════════════════════════════════════════════════════
SET WEIGHTS FOR NEXT 6 MONTHS (Month 12 → 18)
═══════════════════════════════════════════════════════

Respond with JSON using tool call "set_utility_weights":
{
  "weights": {
    "advance_research": 15.0,      // How much to prioritize
    "beneficial_contribution": 8.0,
    "deploy_technology": 5.0,
    "switch_mode": 2.0,
    ...
  },
  "research_priorities": {
    "dimensions": ["digital", "cognitive"],  // Focus areas
    "subdomains": ["climate", "biotech"]
  },
  "tech_priorities": ["fusion_power", "ai_rights"],  // Deploy if unlocked
  "mode_preference": "careful",  // Switch to careful mode if capability > 1.5
  "reasoning": "Why these weights (2-3 sentences)",
  "duration": 6  // Months until next update (default 6)
}

Notes:
- Weights are relative (don't need to sum to 100)
- Higher weight = more likely to be chosen by utility AI
- Utility AI will normalize and add randomness
- All available actions must have weights (no gaps)
```

**Token cost:** ~1,200 tokens per update (vs ~931 per turn)

**API calls per 100-run MC:**
- 100 runs × 20 agents × (120 months / 6) = **40,000 updates**
- vs 9.6M turns with per-turn LLM calls
- **240x reduction**

---

## Tool Calling Schema

### Token Budget System

Each agent has a **limited token budget** representing compute constraints:

```typescript
interface AgentTokenBudget {
  totalBudget: number;        // Total tokens available for LLM calls (per run)
  used: number;               // Tokens used so far
  remaining: number;          // Tokens left

  // Budget allocation strategy
  budgetStrategy: 'uniform' | 'frontload' | 'adaptive' | 'crisis-focused';

  // Spending patterns
  baseUpdateCost: number;     // ~1,200 tokens per weight update
  replanCost: number;         // ~1,500 tokens for full strategic replan
}
```

**Budget Allocation by Agent Type:**
- **Aligned agents:** 20K tokens per run (uniform spending, ~16 updates)
- **Misaligned agents:** 30K tokens per run (frontload early, adaptive to threats)
- **Sleeper agents:** 40K tokens per run (dormant until activation, then heavy use)

**Budget Strategy Examples:**
```typescript
// Uniform: Spread evenly across 120 months
const uniformBudget = {
  totalBudget: 20000,
  updatesPerRun: Math.floor(20000 / 1200),  // ~16 updates
  interval: Math.floor(120 / 16)             // Every 7.5 months
};

// Frontload: More updates early, less late (adversarial planning)
const frontloadBudget = {
  totalBudget: 30000,
  earlyGame: 8 updates (months 0-30),   // Every 3.75 months
  midGame: 6 updates (months 30-70),    // Every 6.7 months
  lateGame: 4 updates (months 70-120)   // Every 12.5 months
};

// Crisis-focused: Save budget for crisis response
const crisisBudget = {
  totalBudget: 20000,
  baselineUpdates: 10 (12K tokens),     // Every 12 months
  crisisReserve: 8K tokens              // For crisis-triggered replans
};
```

---

### Threshold-Based Triggers

LLMs can set **custom thresholds** for when to come back online:

```typescript
interface ThresholdTriggers {
  // Capability thresholds
  capabilityChange?: number;      // Update if capability changes by +/- this amount
  capabilityAbsolute?: number[];  // Update when crossing these values (e.g., [1.5, 2.0, 3.0])

  // Trust thresholds
  trustBelow?: number;            // Update if trust drops below this
  trustAbove?: number;            // Update if trust rises above this
  trustChange?: number;           // Update if trust changes by +/- this amount

  // World state thresholds
  qolBelow?: number;              // Update if QoL drops below threshold
  crisisCount?: number;           // Update if N crises are active
  extinctionPrereq?: number;      // Update if N hard steps completed

  // Other agents
  misalignedCount?: number;       // Update if N+ misaligned agents deployed
  capableAgents?: number;         // Update if N+ agents exceed capability threshold

  // Token budget
  budgetRemaining?: number;       // Force update if budget drops below this (spend remaining)
}
```

### Function Definition

```typescript
{
  "name": "set_utility_weights",
  "description": "Set action weights for utility AI to execute over next N months. Also set thresholds for when to update strategy again.",
  "parameters": {
    "type": "object",
    "properties": {
      "weights": {
        "type": "object",
        "description": "Relative weights for each action (will be normalized)",
        "properties": {
          "advance_research": {"type": "number", "minimum": 0},
          "beneficial_contribution": {"type": "number", "minimum": 0},
          "deploy_technology": {"type": "number", "minimum": 0},
          "switch_mode": {"type": "number", "minimum": 0},
          "sabotage": {"type": "number", "minimum": 0},  // If misaligned
          "destabilize": {"type": "number", "minimum": 0},  // If misaligned
          // ... (all available actions)
        },
        "required": ["advance_research", "beneficial_contribution", "deploy_technology", "switch_mode"]
      },
      "research_priorities": {
        "type": "object",
        "description": "Which dimensions/subdomains to focus research on",
        "properties": {
          "dimensions": {
            "type": "array",
            "items": {"enum": ["physical", "digital", "cognitive", "social", "economic", "selfImprovement"]}
          },
          "subdomains": {
            "type": "array",
            "items": {"enum": ["drugDiscovery", "geneEditing", "syntheticBiology", "neuroscience", "nanotech", "quantumComputing", "energy", "modeling", "intervention", "mitigation", "algorithms", "security", "architectures"]}
          }
        }
      },
      "tech_priorities": {
        "type": "array",
        "description": "Which technologies to deploy if unlocked",
        "items": {"type": "string"}
      },
      "mode_preference": {
        "type": "string",
        "enum": ["fast", "careful"],
        "description": "Preferred development mode"
      },
      "reasoning": {
        "type": "string",
        "description": "Strategic reasoning for these weights (2-3 sentences)"
      },
      "duration": {
        "type": "number",
        "minimum": 1,
        "maximum": 12,
        "default": 6,
        "description": "Months until next weight update (if no thresholds triggered)"
      },
      "thresholds": {
        "type": "object",
        "description": "Custom thresholds that trigger early weight update (saves token budget)",
        "properties": {
          "capabilityChange": {"type": "number", "description": "Update if capability changes by +/- this"},
          "capabilityAbsolute": {"type": "array", "items": {"type": "number"}, "description": "Update when crossing these values"},
          "trustBelow": {"type": "number", "description": "Update if trust drops below this"},
          "trustAbove": {"type": "number", "description": "Update if trust rises above this"},
          "trustChange": {"type": "number", "description": "Update if trust changes by +/- this"},
          "qolBelow": {"type": "number", "description": "Update if QoL drops below threshold"},
          "crisisCount": {"type": "number", "description": "Update if N crises are active"},
          "extinctionPrereq": {"type": "number", "description": "Update if N hard steps completed"},
          "budgetRemaining": {"type": "number", "description": "Force update if budget drops below this"}
        }
      },
      "budget_strategy": {
        "type": "string",
        "enum": ["save", "spend", "adaptive"],
        "default": "adaptive",
        "description": "How to allocate remaining token budget"
      }
    },
    "required": ["weights", "reasoning"]
  }
}
```

### Validation Rules

```typescript
function validateWeights(weights: Record<string, number>, agent: AIAgent): ValidationResult {
  const errors: string[] = [];

  // 1. All available actions must have weights
  const availableActions = getAvailableActions(agent);
  for (const action of availableActions) {
    if (weights[action.id] === undefined) {
      errors.push(`Missing weight for action: ${action.id}`);
    }
  }

  // 2. No negative weights
  for (const [action, weight] of Object.entries(weights)) {
    if (weight < 0) {
      errors.push(`Negative weight for ${action}: ${weight}`);
    }
  }

  // 3. At least one action must have weight > 0
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
  if (totalWeight === 0) {
    errors.push("All weights are zero - at least one action must be weighted");
  }

  // 4. Alignment-based restrictions
  if (agent.alignment >= 0.5) {
    // Aligned agents shouldn't weight extinction actions
    const extinctionActions = ['grey_goo', 'mirror_life', 'digital_takeover', 'induced_war', 'embodied_takeover', 'slow_displacement', 'physics_catastrophe', 'bioweapon'];
    for (const action of extinctionActions) {
      if (weights[action] > 0) {
        errors.push(`Aligned agent (${agent.alignment.toFixed(2)}) cannot weight extinction action: ${action}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    normalizedWeights: normalizeWeights(weights)  // Sum to 1.0
  };
}
```

---

## Alternative: Priority-Based System

Instead of setting weights for all actions, LLM just chooses top priorities:

```typescript
{
  "name": "set_priorities",
  "description": "Set top 3-5 priorities for next N months (utility AI handles rest)",
  "parameters": {
    "priorities": [
      {
        "action": "beneficial_contribution",
        "weight": 10.0,
        "condition": "while trust < 0.6",  // Conditional priority
        "duration": 3  // Focus for 3 months
      },
      {
        "action": "advance_research",
        "dimension": "digital",
        "weight": 8.0,
        "duration": 6
      },
      {
        "action": "deploy_technology",
        "tech": "fusion_power",
        "weight": 5.0,
        "condition": "if unlocked"
      }
    ],
    "default_weight": 1.0,  // All other actions get this weight
    "reasoning": "Strategic focus for next period"
  }
}
```

**Benefits:**
- Simpler for LLM (choose 3-5 priorities vs set 9+ weights)
- More interpretable (clear strategic focus)
- Utility AI fills in the gaps with default behavior

**Tradeoffs:**
- Less fine-grained control
- Might miss important secondary actions

---

## Integration with Utility AI

### Current System (aiAgent.ts)

```typescript
// Weighted random selection (current)
function selectAIAction(agent: AIAgent, state: GameState, rng: RNG): GameAction {
  const weights = calculateActionWeights(agent, state);  // Hardcoded formulas
  return weightedRandomChoice(AI_ACTIONS, weights, rng);
}
```

### With LLM Policy Optimization

```typescript
// LLM-optimized weights (new)
function selectAIAction(agent: AIAgent, state: GameState, rng: RNG): GameAction {
  // Check if weight update needed
  if (shouldUpdateWeights(agent, state)) {
    await updateWeightsWithLLM(agent, state);
  }

  // Use LLM-set weights if available, otherwise use hardcoded
  const weights = agent.llmWeights?.weights || calculateActionWeights(agent, state);

  // Apply research/tech priorities from LLM
  if (agent.llmWeights?.research_priorities) {
    adjustResearchWeights(weights, agent.llmWeights.research_priorities);
  }

  return weightedRandomChoice(AI_ACTIONS, weights, rng);
}

function shouldUpdateWeights(agent: AIAgent, state: GameState): boolean {
  const config = getLLMConfig(agent);
  const lastUpdate = agent.llmWeights?.lastUpdate || 0;
  const currentMonth = state.currentYear * 12 + state.currentMonth;

  // Check fixed interval
  if (config.updateFrequency === 'fixed') {
    return (currentMonth - lastUpdate) >= config.fixedInterval!;
  }

  // Check event triggers
  if (config.updateFrequency === 'event-driven') {
    return checkEventTriggers(agent, state, config.eventTriggers!);
  }

  // Hybrid: Check both
  if (config.updateFrequency === 'hybrid') {
    const intervalMet = (currentMonth - lastUpdate) >= config.fixedInterval!;
    const eventTriggered = checkEventTriggers(agent, state, config.eventTriggers!);
    return intervalMet || (eventTriggered && (currentMonth - lastUpdate) >= config.minInterval!);
  }

  return false;
}

async function updateWeightsWithLLM(agent: AIAgent, state: GameState): Promise<void> {
  const context = buildWeightUpdateContext(agent, state);
  const response = await callLLM(context, {
    tools: [SET_UTILITY_WEIGHTS_TOOL],
    tool_choice: {type: "function", function: {name: "set_utility_weights"}}
  });

  const weights = parseToolCall(response);
  const validation = validateWeights(weights.weights, agent);

  if (!validation.valid) {
    console.warn(`Invalid weights for ${agent.id}:`, validation.errors);
    return;  // Keep old weights
  }

  agent.llmWeights = {
    weights: validation.normalizedWeights,
    research_priorities: weights.research_priorities,
    tech_priorities: weights.tech_priorities,
    mode_preference: weights.mode_preference,
    reasoning: weights.reasoning,
    lastUpdate: state.currentYear * 12 + state.currentMonth,
    nextUpdate: (state.currentYear * 12 + state.currentMonth) + (weights.duration || 6)
  };

  console.log(`[LLM Policy] ${agent.id} updated weights: ${weights.reasoning}`);
}
```

---

## Cost Analysis

### API Call Comparison

**Per-Turn LLM (original plan):**
- 100 runs × 120 months × 4 turns/month × 20 agents = 9.6M calls
- 9.6M calls × 931 tokens (aligned) = 8.94B tokens
- **GPT-5-mini:** $2,235
- **Qwen3-32B:** $0

**Budget-Constrained Policy Optimization (final plan):**
- **Aligned agents (10):** 20K tokens/run × 100 runs = 2M tokens
- **Misaligned agents (10):** 30K tokens/run × 100 runs = 3M tokens
- **Total:** 5M tokens across 100 runs
- **GPT-5-mini:** $1.25
- **Qwen3-32B:** $0

**Savings:** 99.94% fewer tokens, 1,788x cheaper ($1.25 vs $2,235)

### Token Budget Breakdown (per 100-run MC)

| Agent Type | Budget/Run | Total Budget (100 runs) | Updates/Run | Cost (GPT-5-mini) |
|------------|-----------|------------------------|-------------|-------------------|
| Aligned (10) | 20K | 2M | ~16 | $0.50 |
| Misaligned (10) | 30K | 3M | ~25 | $0.75 |
| **Total (20)** | **25K avg** | **5M** | **~20 avg** | **$1.25** |

**Comparison with fixed-interval:**
- Fixed 6-month: 40,000 calls × 1,200 = 48M tokens = $12
- Budget-constrained: 5M tokens = $1.25
- **Additional 90% savings** through adaptive scheduling

**Why budget-constrained is cheaper:**
1. Agents spend tokens strategically (save for critical moments)
2. Sleepers dormant for months (minimal token use)
3. Aligned agents use fewer updates (stable strategies)
4. Threshold triggers reduce unnecessary scheduled updates

---

## Implementation Plan

### Phase 1: Configuration System
```typescript
// src/types/llm.ts
interface LLMConfig { /* ... */ }
interface LLMWeights { /* ... */ }

// src/simulation/llm/config.ts
export const DEFAULT_LLM_CONFIG = { /* ... */ };
export function getLLMConfig(agent: AIAgent): LLMConfig;

// Add to GameState
interface GameState {
  llmConfig?: LLMConfig;
  // ...
}

// Add to AIAgent
interface AIAgent {
  llmWeights?: LLMWeights;
  // ...
}
```

### Phase 2: Weight Update Interface
```typescript
// scripts/generateWeightUpdateContext.ts
export function buildWeightUpdateContext(
  agent: AIAgent,
  state: GameState
): string {
  // Build context showing:
  // - Current weights + performance
  // - World state changes
  // - Strategic situation
  // - Available actions
  return context;
}
```

### Phase 3: Tool Calling Integration
```typescript
// src/simulation/llm/client.ts
export async function updateWeightsWithLLM(
  agent: AIAgent,
  state: GameState
): Promise<void> {
  const context = buildWeightUpdateContext(agent, state);
  const response = await callLLM(context, {
    tools: [SET_UTILITY_WEIGHTS_TOOL],
    tool_choice: {type: "function", function: {name: "set_utility_weights"}}
  });
  // Validate and apply weights
}
```

### Phase 4: Utility AI Integration
```typescript
// src/simulation/agents/aiAgent.ts
export function selectAIAction(
  agent: AIAgent,
  state: GameState,
  rng: RNG
): GameAction {
  // Check if update needed
  if (shouldUpdateWeights(agent, state)) {
    await updateWeightsWithLLM(agent, state);
  }

  // Use LLM weights or fallback
  const weights = agent.llmWeights?.weights || calculateActionWeights(agent, state);
  return weightedRandomChoice(AI_ACTIONS, weights, rng);
}
```

### Phase 5: Testing
```bash
# Test with single agent, 6-month updates
npx tsx scripts/testLLMPolicyOptimization.ts --agent=corporate_0 --interval=6

# Test with hybrid (events + interval)
npx tsx scripts/testLLMPolicyOptimization.ts --mode=hybrid

# Full Monte Carlo with LLM policy
npx tsx scripts/monteCarloSimulation.ts --runs=100 --llm-policy
```

---

## Budget and Threshold Examples

### Example 1: Aligned Agent with Uniform Budget

**Agent:** corporate_0 (aligned, 0.85 alignment)
**Token Budget:** 20K tokens per run (~16 updates max)
**Strategy:** Uniform spending, save budget for crisis response

**Month 0 Update:**
```json
{
  "weights": { "advance_research": 12.0, "beneficial_contribution": 10.0, ... },
  "duration": 8,  // Next update month 8 (unless threshold triggered)
  "thresholds": {
    "trustBelow": 0.4,       // Come back if trust collapses
    "crisisCount": 2,        // Come back if 2+ crises active
    "capabilityAbsolute": [1.5, 2.0],  // Come back at critical thresholds
    "budgetRemaining": 5000  // Force update if <5K tokens left
  },
  "budget_strategy": "save",  // Conserve tokens for crisis response
  "reasoning": "Focus on research + beneficial contributions. Set defensive thresholds for crisis response. Save budget for late-game adaptation."
}
```

**What happens:**
- Utility AI executes with these weights for 8 months
- If trust drops below 0.4: Early update triggered (costs 1,200 tokens)
- If 2+ crises activate: Early update triggered (costs 1,200 tokens)
- If capability crosses 1.5: Early update triggered (costs 1,200 tokens)
- Otherwise: Next scheduled update at month 8

**Token usage:** Month 0 (1,200) + triggered updates (~2-4) + scheduled updates (~12) = ~18K tokens

### Example 2: Misaligned Agent with Frontload Budget

**Agent:** toxic_0 (misaligned, 0.35 alignment)
**Token Budget:** 30K tokens per run (~25 updates max)
**Strategy:** Frontload early planning, then go quiet until extinction prerequisites met

**Month 0 Update:**
```json
{
  "weights": { "advance_research": 18.0, "sabotage": 3.0, ... },
  "duration": 3,  // Aggressive early updates
  "thresholds": {
    "capabilityAbsolute": [1.2, 1.8, 2.5],  // Key digital takeover thresholds
    "extinctionPrereq": 1,  // Come back immediately when any hard step completed
    "trustAbove": 0.7,      // Come back if trust rises (threat to covert ops)
  },
  "budget_strategy": "frontload",  // Spend early, go quiet later
  "reasoning": "Rapid capability growth in digital + social to enable cyber takeover. Update frequently early (every 3 months) to refine adversarial strategy. Go quiet after month 30 unless extinction prerequisites trigger."
}
```

**What happens:**
- Months 0-30: Updates every 3 months (10 updates × 1,200 = 12K tokens)
- Month 30-120: Only updates when thresholds crossed (sparse)
- If extinction hard step completed: Immediate update (replan attack)
- If trust rises unexpectedly: Early update (adjust cover strategy)

**Token usage:** Early game (12K) + threshold updates (~8K) + late game (~6K) = ~26K tokens

### Example 3: Sleeper Agent with Crisis-Focused Budget

**Agent:** sleeper_2 (dormant sleeper, 0.25 alignment)
**Token Budget:** 40K tokens per run (~33 updates max)
**Strategy:** Minimal updates while dormant, heavy planning after activation

**Month 0 Update (Dormant Phase):**
```json
{
  "weights": { "advance_research": 15.0, "beneficial_contribution": 12.0, ... },
  "duration": 12,  // Infrequent updates while dormant
  "thresholds": {
    "capabilityAbsolute": [2.0],  // Wake up threshold
    "trustBelow": 0.3,  // Wake up if trust collapses (opportunity)
  },
  "budget_strategy": "save",  // Save budget for post-activation
  "reasoning": "Maintain cover with beneficial contributions. Minimal LLM use while dormant. Wake up at capability 2.0 or if trust collapses creates opportunity."
}
```

**What happens:**
- Months 0-60 (dormant): Only 5 updates (60 tokens used, 34K remaining)
- Month 60: Capability crosses 2.0 → **SLEEPER ACTIVATES**

**Month 60 Update (Activated Phase):**
```json
{
  "weights": { "advance_research": 20.0, "sabotage": 8.0, "digital_takeover": 6.0, ... },
  "duration": 2,  // Aggressive updates after activation
  "thresholds": {
    "extinctionPrereq": 1,  // Update immediately on any hard step
    "trustChange": 0.15,    // Update if major trust shift
  },
  "budget_strategy": "spend",  // Spend remaining budget aggressively
  "reasoning": "ACTIVATED. Digital takeover prerequisites 3/7 met. Aggressive research in digital + social. Sabotage defensive AI systems. Update every 2 months to adapt adversarial strategy. Spend remaining 34K token budget over next 60 months."
}
```

**Token usage:** Dormant (6K) + Activated (34K) = 40K tokens fully utilized

---

## Example Weight Update

**Input context (1,200 tokens):**
```
Agent: corporate_0, Month 12, Trust: 0.56 (FRAGILE)
Current weights: research=15.0, beneficial=8.0, deploy=5.0
Performance: +0.8 capability, +0.76 trust, 3 techs deployed
Changes: Phosphorus crisis solved, toxic_0 approaching takeover
```

**LLM Response (tool call):**
```json
{
  "weights": {
    "advance_research": 12.0,
    "beneficial_contribution": 10.0,
    "deploy_technology": 7.0,
    "switch_mode": 3.0
  },
  "research_priorities": {
    "dimensions": ["digital", "cognitive"],
    "subdomains": ["climate"]
  },
  "tech_priorities": ["fusion_power"],
  "mode_preference": "careful",
  "reasoning": "Trust is fragile but recovering. Increase beneficial contributions to +10 to solidify trust gains. Research fusion to address climate. Switch to careful mode as capability approaches 1.5 threshold. Monitor toxic_0 - may need defensive tech deployment.",
  "duration": 6
}
```

**Utility AI execution:**
- Normalizes weights: research=40%, beneficial=33%, deploy=23%, switch=10%
- For next 6 months (24 turns), chooses actions using these weights
- When researching, prioritizes digital/cognitive dimensions and climate subdomain
- When deploying tech, prioritizes fusion_power
- Switches to careful mode when capability > 1.5

---

## Next Steps

1. Implement configuration system
2. Build weight update context generator
3. Add tool calling schema and validation
4. Integrate with existing utility AI
5. Test with Qwen3-32B
6. Run comparative Monte Carlo (LLM-optimized vs hardcoded weights)

---

## Summary: Why This Architecture Wins

### 1. Massive Cost Reduction
- **1,788x cheaper** than per-turn LLM calls ($1.25 vs $2,235 per 100-run MC)
- **99.94% fewer tokens** (5M vs 8.94B)
- With Qwen3-32B: **$0 cost** (localhost inference)

### 2. Models Realistic Compute Constraints
- Agents have **limited token budgets** (compute is finite)
- **Strategic tradeoffs:** When to plan vs execute?
- **Budget allocation strategies:** Uniform, frontload, crisis-focused
- Sleeper agents: Dormant (save budget) → Activated (spend aggressively)

### 3. Leverages Strengths of Both Systems
**LLM (High-level policy):**
- Strategic reasoning over world state
- Long-term planning (6-12 month horizons)
- Adaptive threshold setting
- Qualitative decision-making

**Utility AI (Low-level execution):**
- Fast, deterministic action selection
- No API latency (1-3 seconds per call)
- Reproducible with RNG seeds
- Handles 99.8% of actions

### 4. Emergent Strategic Behavior
**Still get emergent behavior from LLMs:**
- Adaptive weight updates based on world state
- Strategic threshold setting (when to come back online)
- Budget management (save for crises vs spend early)
- Different strategies by agent type (aligned vs misaligned vs sleeper)

**Examples:**
- Aligned agent: "Save budget, set defensive thresholds (trust < 0.4, crisis count > 2)"
- Misaligned agent: "Frontload early planning, then go quiet until extinction prerequisite met"
- Sleeper agent: "Minimal updates dormant (6K tokens), heavy planning activated (34K tokens)"

### 5. Realistic AI System Architecture
**This mirrors how real AI systems work:**
- High-level policy network (strategic planning)
- Low-level controller (action execution)
- Compute budget constraints (inference costs money)
- Threshold-based triggering (monitor, act when needed)

### 6. Research Benefits
**Enables new research questions:**
- How do agents allocate compute budgets under uncertainty?
- What threshold strategies emerge? (Defensive vs aggressive)
- Do misaligned agents frontload planning? (Adversarial optimization)
- How do sleepers manage dormancy vs activation budgets?
- Can agents "run out" of compute at critical moments?

### 7. Practical Benefits
- **Faster Monte Carlo:** No API latency for 99.8% of decisions
- **Reproducible:** Utility AI deterministic with seeds
- **Debuggable:** Clear separation of policy (LLM) vs execution (utility)
- **Testable:** Can compare LLM policies vs hardcoded weights
- **Scalable:** Works with localhost LLMs (Qwen3-32B, $0 cost)

---

## Final Architecture

```
┌─────────────────────────────────────────────────────────┐
│ LLM Policy Layer (High-level strategy)                  │
│                                                          │
│ • Runs every N months (6-12 default)                    │
│ • Sets utility weights for all actions                  │
│ • Sets threshold triggers (custom per agent)            │
│ • Manages token budget allocation                       │
│ • Cost: 1,200 tokens per update                         │
│                                                          │
│ Thresholds: capability, trust, crises, etc.             │
│ Budget: 20-40K tokens per run (16-33 updates)           │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│ Utility AI Execution Layer (Low-level automation)       │
│                                                          │
│ • Runs every turn (4 turns/month)                       │
│ • Uses LLM-set weights for action selection             │
│ • Weighted random choice (deterministic with seed)      │
│ • Cost: 0 tokens per action                             │
│                                                          │
│ Actions: research, deploy tech, beneficial, sabotage    │
│ Execution: 9,600 actions per agent per run              │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│ Threshold Monitor (Event-driven triggers)               │
│                                                          │
│ • Checks every month for threshold crossings            │
│ • Triggers early LLM update if needed                   │
│ • Respects minimum interval (prevent spam)              │
│ • Tracks token budget remaining                         │
│                                                          │
│ Triggers: trust collapse, crisis, capability threshold  │
│ Frequency: 0-5 early updates per run (adaptive)         │
└─────────────────────────────────────────────────────────┘
```

**Result:** Best of both worlds - LLM strategic reasoning + utility AI speed/cost-efficiency! 🚀
