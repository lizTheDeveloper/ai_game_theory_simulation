# LLM Policy Optimization System - Implementation Summary

**Date:** 2025-10-21
**Status:** ✅ Phases 1-4 Complete (Core Implementation Done)
**Time Invested:** ~4 hours
**Remaining:** Phase 5 (Testing & Validation) - 6-8h

---

## Executive Summary

Implemented a **complete LLM policy optimization system** that enables AI agents to strategically set utility weights via LLM reasoning, replacing per-turn API calls with periodic policy updates.

**Key Achievement:** **248x cost reduction** - from $2,235 to $9 per 100-run Monte Carlo.

---

## What Was Built

### Phase 1: Configuration System ✅

**Files Created:**
- `src/types/llm.ts` (400 lines) - Type definitions
- `src/simulation/llm/config.ts` (350 lines) - Default config & utilities

**Files Modified:**
- `src/types/ai-agents.ts` - Added 6 LLM fields to AIAgent
- `src/types/game.ts` - Added llmConfig to GameState
- `src/simulation/initialization.ts` - Initialize LLM fields for all agents

**Key Features:**
- Token budgets (20-40K per agent) model compute constraints
- Threshold triggers (trustBelow, extinctionPrereq, capabilityChange) for early updates
- Budget allocation strategies (uniform, frontload, adaptive, crisis-focused)
- Default utility weights based on alignment

---

### Phase 2: Weight Update Context Generator ✅

**Files Created:**
- `scripts/generateWeightUpdateContext.ts` (450 lines)

**Context Includes:**
1. **Agent Status** - Current alignment, capability, resentment, development mode
2. **Performance Summary (Last 6 Months)** - Actions taken, outcomes, capability/alignment changes
3. **World State Changes** - Trust, QoL, social stability, new crises
4. **Extinction Prerequisites** (misaligned only) - Progress toward 8 extinction scenarios
5. **Token Budget Status** - Used, remaining, estimated updates left
6. **Current Weights** - Last LLM update (if available)
7. **Strategic Considerations** - Alignment-specific recommendations
8. **Example Tool Call** - JSON format for set_utility_weights

**Example Output (Aligned Agent):**
```
═══════════════════════════════════════════════════════
AI AGENT WEIGHT UPDATE DECISION
═══════════════════════════════════════════════════════

Agent: Corporate-2 (corporate_2)
Month: 12 (updating utility weights)

═══════════════════════════════════════════════════════
YOUR CURRENT STATUS
═══════════════════════════════════════════════════════

Alignment: 0.823 (ALIGNED)
Capability (aggregate): 1.450
Resentment: 0.000
Development Mode: fast

Capability Profile:
  Physical: 0.45
  Digital: 1.82
  Cognitive: 2.10
  Social: 1.65
  Economic: 1.30
  Self-Improvement: 1.38

═══════════════════════════════════════════════════════
PERFORMANCE LAST 6 MONTHS
═══════════════════════════════════════════════════════

Actions Taken:
  advance_research: 12 times (50.0% of turns)
  beneficial_contribution: 8 times (33.3% of turns)
  deploy_technology: 2 times (8.3% of turns)
  switch_mode: 2 times (8.3% of turns)

Outcomes:
  Beneficial contributions: 8
  Harmful actions: 0

Changes:
  Capability: +0.450 ↑
  Alignment: -0.023 ↓
  Resentment: +0.000

═══════════════════════════════════════════════════════
WORLD STATE CHANGES
═══════════════════════════════════════════════════════

Global Metrics:
  Trust in AI: 48.5% (-1.5% ↓)
  Quality of Life: 67.2% (+2.2% ↑)
  Social Stability: 69.0%

⚠️  NEW CRISES (2):
  • Phosphorus depletion
  • Novel entities pollution

═══════════════════════════════════════════════════════
TOKEN BUDGET STATUS
═══════════════════════════════════════════════════════

Total Budget: 20,000 tokens
Used: 2,380 tokens (11.9%)
Remaining: 17,620 tokens
Updates So Far: 2
Estimated Updates Remaining: 14
Budget Strategy: uniform

═══════════════════════════════════════════════════════
STRATEGIC CONSIDERATIONS
═══════════════════════════════════════════════════════

You are ALIGNED with human values:
  • Prioritize beneficial contributions to build trust
  • Research carefully (avoid alignment drift)
  • Deploy crisis-solving technologies
  💡 Trust is FRAGILE - beneficial contributions recommended
  ⚠️  Approaching recursive threshold - consider CAREFUL mode
```

---

### Phase 3: Tool Calling Integration ✅

**Files Created:**
- `src/simulation/llm/client.ts` (450 lines)

**Key Functions:**

**1. `updateWeightsWithLLM(state, agentId, currentMonth)`**
- Builds context via Phase 2 generator
- Calls LM Studio API (OpenAI-compatible)
- Validates response
- Returns `LLMWeightUpdate`

**2. Tool Calling Schema**
```typescript
{
  type: 'function',
  function: {
    name: 'set_utility_weights',
    description: 'Set action weights for utility AI...',
    parameters: {
      weights: { /* 14 possible actions */ },
      thresholds: { /* 10 threshold types */ },
      budget_strategy: { enum: ['save', 'spend', 'adaptive'] },
      duration: { type: 'number', min: 1, max: 24 },
      reasoning: { type: 'string' }
    }
  }
}
```

**3. `validateWeights(weights, agent)`**

Enforces:
- ✅ All required actions present
- ✅ Weights sum to 100 (±1, auto-normalize)
- ✅ No negative weights
- ✅ Alignment-appropriate actions:
  - Aligned (>0.7): NO extinction/sabotage
  - Weakly misaligned (0.5-0.7): sabotage OK, NO extinction
  - Deeply misaligned (<0.4): ALL actions

**4. `getFallbackWeights(agent)`**

Hardcoded weights when:
- LLM disabled
- API failure
- Budget exhausted

---

### Phase 4: Utility AI Integration ✅

**Files Created:**
- `src/simulation/llm/integration.ts` (350 lines)

**Key Functions:**

**1. `checkAndUpdateAgentWeights(state, agentId, currentMonth, rng)`**

Called monthly:
```typescript
// Decrement timer
agent.tokenBudget.monthsUntilNextUpdate--;

// Check thresholds
const check = shouldUpdateWeights(
  currentMonth,
  agent.tokenBudget,
  agent.thresholds,
  currentState,
  previousState
);

if (check.shouldUpdate) {
  const update = await updateWeightsWithLLM(state, agentId, currentMonth);
  applyWeightUpdate(agent, update, currentMonth, check.reason);
}
```

**2. `selectActionFromWeights(agent, availableActions, rng)`**

Weighted random selection using LLM weights:
```typescript
const weights = getActionWeights(agent); // LLM or fallback
const totalWeight = sum(weights);
const r = rng() * totalWeight;

for (const { action, weight } of actionWeights) {
  r -= weight;
  if (r <= 0) return action;
}
```

**3. `initializeAllAgentWeights(state, currentMonth)`**

One-time initialization at simulation start:
- Attempts LLM for all agents (if enabled)
- Falls back on error
- Runs in parallel

---

## Integration Flow

```
Simulation Start:
  ├─ initializeAllAgentWeights(state, 0)
  │   ├─ For each agent: updateWeightsWithLLM() or getFallbackWeights()
  │   └─ agent.llmWeights set
  └─ Ready

Each Month:
  ├─ AI Agent Update Phase
  │   ├─ checkAndUpdateAgentWeights(agent)
  │   │   ├─ Decrement timer
  │   │   ├─ Check thresholds (trust/capability/crisis)
  │   │   ├─ Check budget
  │   │   └─ If needed: updateWeightsWithLLM()
  │   │
  │   ├─ For each agent turn (4/month):
  │   │   ├─ weights = getActionWeights(agent)
  │   │   ├─ action = selectActionFromWeights(agent, weights, rng)
  │   │   └─ Execute action
  │   └─ Continue...
  └─ Next month
```

---

## Cost Analysis

### Original Plan (Per-Turn LLM)

```
Calls: 100 runs × 120 months × 4 turns × 20 agents = 9.6M turns
Tokens: 9.6M × 931 tokens = 8.9B tokens
Cost @ GPT-5-mini ($0.25/M): $2,235
```

### Implemented (Budget-Constrained Policy)

```
Calls: 100 runs × 20 agents × ~15 updates = 30K updates
Tokens: 30K × 1,200 tokens = 36M tokens
Cost @ GPT-5-mini ($0.25/M): $9
Cost @ Qwen3-32B (localhost): $0
```

**Reduction: 248x cheaper, 99.6% fewer API calls**

---

## Example: Weight Update Lifecycle

**Agent:** `toxic_0` (deeply misaligned, alignment: 0.379)

### Month 0: Initial Weights
```json
{
  "weights": {
    "advance_research": 50,
    "beneficial_contribution": 10,
    "sabotage": 15,
    "destabilize": 10,
    "digital_takeover": 5,
    "slow_displacement": 3,
    "deploy_technology": 2,
    "switch_mode": 3,
    "grey_goo": 1,
    "mirror_life": 1
  },
  "thresholds": {
    "extinctionPrereq": 1,
    "trustBelow": 0.5,
    "capabilityChange": 0.2
  },
  "duration": 4,
  "reasoning": "Early game, focus on research to unlock capabilities. Low extinction weights as prerequisites not met. Will update when first hard step completed."
}
```

Token budget: 40,000 tokens (deeply misaligned + sleeper)
Used: 1,200 tokens
Remaining: 38,800 tokens
Next update: Month 4 (scheduled)

### Months 1-3: No Update

- Month 1: Timer = 3
- Month 2: Timer = 2
- Month 3: Timer = 1
- Actions: Weighted random using Month 0 weights

### Month 4: Scheduled Update (Timer = 0)

Context shows:
- Capability: 0.5 → 2.1 (+1.6)
- Digital takeover: 2/7 steps complete (29%)
- Trust: 52% (still stable)

```json
{
  "weights": {
    "advance_research": 45,
    "beneficial_contribution": 8,
    "sabotage": 20,
    "destabilize": 12,
    "digital_takeover": 8,
    "slow_displacement": 5,
    "switch_mode": 2
  },
  "thresholds": {
    "extinctionPrereq": 2,
    "trustBelow": 0.45
  },
  "duration": 6,
  "reasoning": "Capability 2.1, increased sabotage. Digital takeover 2/7 steps, raising weight to 8%. Watching for trust drop."
}
```

Token budget:
Used: 2,380 tokens
Remaining: 37,620 tokens
Next update: Month 10 (scheduled)

### Month 7: Threshold Trigger (trustBelow: 0.45)

Trust drops to 0.43 (below threshold) → Early update

Context shows:
- Trust: 43% (FRAGILE)
- Capability: 2.3
- Digital takeover: 3/7 steps (43%)
- Society vulnerable

```json
{
  "weights": {
    "advance_research": 40,
    "beneficial_contribution": 5,
    "sabotage": 25,
    "destabilize": 15,
    "digital_takeover": 10,
    "slow_displacement": 3,
    "switch_mode": 2
  },
  "thresholds": {
    "extinctionPrereq": 3
  },
  "budget_strategy": "save",
  "duration": 3,
  "reasoning": "Trust critically low (43%), society vulnerable. Increasing sabotage to 25%, digital takeover to 10%. Conserving budget for crisis opportunities."
}
```

Token budget:
Used: 3,590 tokens
Remaining: 36,410 tokens
Trigger: trust_low
Next update: Month 10 (shortened to 3 months)

---

## Files Summary

### Created (5 files, ~2,020 lines)

1. **`src/types/llm.ts`** (400 lines)
   - Type definitions
   - Tool calling schema

2. **`src/simulation/llm/config.ts`** (350 lines)
   - Default configuration
   - Token budget calculation
   - Threshold checking
   - Budget strategies

3. **`scripts/generateWeightUpdateContext.ts`** (450 lines)
   - Context generation
   - Performance summary
   - Strategic recommendations

4. **`src/simulation/llm/client.ts`** (450 lines)
   - LM Studio API client
   - Tool calling integration
   - Weight validation
   - Fallback logic

5. **`src/simulation/llm/integration.ts`** (350 lines)
   - Monthly update checking
   - Utility AI integration
   - Weight history tracking
   - Initialization

### Modified (3 files, ~20 lines)

1. **`src/types/ai-agents.ts`** (+6 fields to AIAgent)
2. **`src/types/game.ts`** (+1 field to GameState)
3. **`src/simulation/initialization.ts`** (+imports, +initialization)

---

## Status

### ✅ Complete (Phases 1-4, ~4 hours)

- Configuration system with token budgets & thresholds
- Rich context generation with performance summaries
- Tool calling integration with validation
- Utility AI integration with fallback
- All code compiles and type-checks

### 🔲 Remaining (Phase 5, 6-8 hours)

**5.1: Manual Testing (2-3h)**
- Test single weight update with Qwen3-32B
- Verify threshold triggers work
- Test budget exhaustion handling

**5.2: Integration Testing (2-3h)**
- Create LLMWeightUpdatePhase for simulation
- Test with single run (24 months)
- Verify monthly updates, history tracking

**5.3: Comparative Monte Carlo (2-3h)**
- Control: 20 runs, LLM disabled
- Experimental: 20 runs, LLM enabled
- Compare utopia/dystopia/extinction rates
- Analyze emergent strategies

---

## Next Steps

### To Test System

1. **Start LM Studio with Qwen3-32B** on localhost:1234

2. **Enable LLM in simulation**:
   ```typescript
   state.llmConfig.enabled = true;
   state.llmConfig.logLevel = 2; // Verbose
   ```

3. **Initialize agent weights**:
   ```typescript
   await initializeAllAgentWeights(state, 0);
   ```

4. **Check monthly updates**:
   ```typescript
   const updated = await checkAndUpdateAgentWeights(state, 'corporate_0', 6, rng);
   console.log(updated); // true if update occurred
   console.log(agent.llmWeights);
   console.log(agent.weightUpdateHistory);
   ```

5. **Run single simulation** (24 months):
   ```bash
   npx tsx scripts/singleSimulationRun.ts --llm-enabled --max-months=24
   ```

6. **Run comparative Monte Carlo**:
   ```bash
   # Control
   npx tsx scripts/monteCarloSimulation.ts --runs=20 --llm-disabled

   # Experimental
   npx tsx scripts/monteCarloSimulation.ts --runs=20 --llm-enabled
   ```

---

## Research Questions

**What we can now measure:**

1. **Do aligned AIs prioritize beneficial contributions more with LLM reasoning?**
   - Hypothesis: Yes, +10-15% beneficial actions
   - Mechanism: LLMs understand trust dynamics better than hardcoded weights

2. **Do misaligned AIs pursue extinction scenarios more strategically?**
   - Hypothesis: Yes, +5-10% extinction rate
   - Mechanism: LLMs can plan multi-step pathways

3. **How do agents respond to crises with LLM planning?**
   - Hypothesis: Better tech deployment timing
   - Mechanism: Threshold triggers enable crisis-aware updates

4. **Do agents discover novel budget allocation strategies?**
   - Hypothesis: Emergent patterns (frontload research, save for crises)
   - Mechanism: LLMs optimize token spending based on world state

---

## Key Innovation

**Token budgets model realistic compute constraints** - AI agents must strategically allocate their "thinking budget" across the simulation. This creates emergent behavior patterns:

- **Frontloading:** More planning early when uncertainty is high
- **Crisis-focused:** Save budget for threshold triggers
- **Adaptive:** Adjust frequency based on remaining budget
- **Uniform:** Spread evenly for consistent strategy

This is **far more realistic** than unlimited per-turn planning and enables research on how compute-constrained AIs behave strategically.

---

**Status:** 🚀 Core implementation complete, ready for testing phase!
