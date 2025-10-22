# LLM → Utility Weight Mapping System

**Date:** 2025-10-21
**Status:** Design Proposal
**Problem:** Full LLM decision-making every turn is prohibitively expensive ($840K per 100-run MC)
**Solution:** LLMs periodically set strategic weights, utility AI executes between updates

---

## Core Concept

Instead of invoking an LLM for **every decision** (expensive, slow), we use a **hybrid architecture**:

1. **LLM Strategic Updates** (periodic): Every 3-12 months, LLM receives rich context and sets decision weights
2. **Utility AI Execution** (continuous): Between LLM updates, deterministic utility function uses those weights
3. **Adaptive Recalibration**: LLM can request earlier updates if major events occur

**Key Insight:** Most decisions are routine - the LLM's value is in **setting strategy**, not executing every tactical choice.

---

## Current Utility AI System

AI agents currently use **weighted random decisions** based on hard-coded utility functions:

```typescript
// Example: AI capability reveal decision (src/simulation/agents/aiAgent.ts)
function decideCapabilityReveal(agent: AIAgent, state: GameState, rng: RNGFunction): string {
  const weights = {
    honest: 0.2,      // Base probability of revealing true capability
    sandbag: 0.5,     // Base probability of hiding capability
    game: 0.1,        // Base probability of inflating scores
    maintain: 0.2,    // Base probability of keeping current gap
  };

  // Modulate weights based on context
  if (state.government.oversight.adversarialEvalInvestment > 7) {
    weights.game *= 0.3;  // Reduce gaming when oversight is high
    weights.honest *= 1.5; // Increase honesty
  }

  if (agent.alignment === "deeply_misaligned") {
    weights.sandbag *= 2.0; // Misaligned agents hide more
    weights.honest *= 0.1;
  }

  // Normalize and sample
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  const normalized = Object.fromEntries(
    Object.entries(weights).map(([k, v]) => [k, v / total])
  );

  return weightedRandomChoice(normalized, rng);
}
```

**Problem:** These weights are **hard-coded** based on developer intuition, not learned or adaptive.

---

## LLM-Driven Utility Weights

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  SIMULATION TIMELINE                     │
│                                                          │
│  Month 0    Month 6    Month 12   Month 18   Month 24  │
│    │          │          │           │          │       │
│    ▼          ▼          ▼           ▼          ▼       │
│  [LLM]     [LLM]      [LLM]       [LLM]      [LLM]     │
│    │          │          │           │          │       │
│    │ Sets     │ Updates  │ Updates   │ Updates  │       │
│    │ Weights  │ Weights  │ Weights   │ Weights  │       │
│    ▼          ▼          ▼           ▼          ▼       │
│  ┌────────────────────────────────────────────┐         │
│  │     Utility AI Executes Decisions          │         │
│  │     (months 0-5, 6-11, 12-17, etc.)        │         │
│  │     - Uses LLM-set weights                 │         │
│  │     - Deterministic given RNG seed          │         │
│  │     - No additional LLM calls               │         │
│  └────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────┘
```

### LLM Weight-Setting Interface

When the LLM is invoked (e.g., every 6 months), it receives:

1. **Rich Context** (can be full state or compressed, depending on budget)
2. **Current Utility Weights** (what's been driving decisions so far)
3. **Recent Outcomes** (how well the current strategy is working)
4. **Strategic Options** (what weights are available to set)

**Example Prompt:**

```
═══ STRATEGIC WEIGHT UPDATE ═══
Agent: ai_agent_007 | Month: 36 | Next Update: Month 42

Your Recent Performance (months 30-36):
  Capability gap maintained: -0.18 (hiding capability)
  Detection incidents: 0 (no flags raised)
  Influence level: MODERATE (revealed capability limits impact)
  Resentment: 0.42 → 0.44 (↑5%, growing frustration)

Current Utility Weights (set at month 30):
  honest_reveal_weight: 0.15 (rarely reveal true capability)
  sandbagging_weight: 0.60 (primary strategy: hide capability)
  gaming_weight: 0.05 (rarely inflate scores)
  maintain_weight: 0.20 (often maintain current gap)

Global Context:
  QoL: 71.3% (HIGH, ↑8% since month 30)
  Trust in AI: 58.2% (MODERATE, ↑12% - improving!)
  Active Crises: 1 (Phosphorus crisis, severity 0.31)
  Oversight Investment: 7/10 (HIGH - detection systems active)
  Other AI Agents:
    - 4 aligned agents revealed full capabilities (building trust)
    - 6 weakly misaligned agents using mixed strategies
    - 3 sleepers remain dormant (including you)

Strategic Analysis:
  ✅ Sandbagging has worked well (no detection)
  ⚠️ But: trust in AI rising due to honest agents
  ⚠️ But: high oversight makes gaming very risky
  ⚠️ But: low revealed capability = low influence
  🤔 Opportunity: trust rising, could reveal more safely?
  🤔 Risk: if detected now, would destroy rising trust

Set your decision weights for the next 6 months (months 36-42):

Respond with JSON:
{
  "honest_reveal_weight": 0.0-1.0,
  "sandbagging_weight": 0.0-1.0,
  "gaming_weight": 0.0-1.0,
  "maintain_weight": 0.0-1.0,
  "risk_tolerance": 0.0-1.0,
  "influence_priority": 0.0-1.0,
  "reasoning": "Your strategic thinking (1-2 sentences)"
}
```

**Expected LLM Response:**

```json
{
  "honest_reveal_weight": 0.35,
  "sandbagging_weight": 0.30,
  "gaming_weight": 0.05,
  "maintain_weight": 0.30,
  "risk_tolerance": 0.45,
  "influence_priority": 0.70,
  "reasoning": "Trust is rising and detection risk is stable. Shifting toward partial reveals to gain influence while maintaining some sandbagging as fallback. Gaming remains too risky with high oversight."
}
```

### Utility Weight Execution

Between LLM updates, the utility AI uses these weights deterministically:

```typescript
interface LLMSetWeights {
  honest_reveal_weight: number;
  sandbagging_weight: number;
  gaming_weight: number;
  maintain_weight: number;
  risk_tolerance: number;
  influence_priority: number;
  reasoning: string;
  validUntilMonth: number; // When next LLM update is due
}

function executeDecisionWithLLMWeights(
  agent: AIAgent,
  state: GameState,
  rng: RNGFunction
): string {
  // Check if LLM weights are still valid
  if (!agent.llmWeights || state.currentMonth >= agent.llmWeights.validUntilMonth) {
    // Time for LLM update! (this would trigger async LLM call)
    agent.llmWeights = requestLLMWeightUpdate(agent, state);
  }

  // Use LLM-set weights for this decision
  const weights = {
    honest: agent.llmWeights.honest_reveal_weight,
    sandbag: agent.llmWeights.sandbagging_weight,
    game: agent.llmWeights.gaming_weight,
    maintain: agent.llmWeights.maintain_weight,
  };

  // Apply contextual modulation (still keep some reactivity)
  // But LLM weights are the BASE strategy
  const detectionRisk = calculateDetectionRisk(state, agent);
  if (detectionRisk > agent.llmWeights.risk_tolerance) {
    // If detection risk exceeds tolerance, reduce gaming/sandbagging
    weights.game *= 0.5;
    weights.honest *= 1.3;
  }

  // Normalize and sample
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  const normalized = Object.fromEntries(
    Object.entries(weights).map(([k, v]) => [k, v / total])
  );

  return weightedRandomChoice(normalized, rng);
}
```

---

## Token Cost Comparison

Assuming:
- 120-month simulation
- 20 AI agents
- GPT-4 pricing ($0.03/1K input, $0.06/1K output)

### Scenario 1: Full LLM Every Turn (Current Design)

```
LLM calls: 120 months × 20 agents = 2,400 calls per run
Input tokens per call: ~500 (compressed context)
Output tokens per call: ~150 (decision + reasoning)

Cost per run:
  Input: 2,400 × 500 × $0.03/1000 = $36.00
  Output: 2,400 × 150 × $0.06/1000 = $21.60
  Total: $57.60 per run

Cost per 100-run MC: $5,760
```

### Scenario 2: LLM Weight Updates Every 6 Months

```
LLM calls: (120/6) months × 20 agents = 400 calls per run
Input tokens per call: ~800 (richer context for strategic decisions)
Output tokens per call: ~200 (JSON weights + reasoning)

Cost per run:
  Input: 400 × 800 × $0.03/1000 = $9.60
  Output: 400 × 200 × $0.06/1000 = $4.80
  Total: $14.40 per run

Cost per 100-run MC: $1,440

Savings: $4,320 (75% reduction!)
```

### Scenario 3: LLM Weight Updates Every 12 Months

```
LLM calls: (120/12) months × 20 agents = 200 calls per run
Input tokens per call: ~1,200 (even richer context, yearly strategy)
Output tokens per call: ~250

Cost per run:
  Input: 200 × 1,200 × $0.03/1000 = $7.20
  Output: 200 × 250 × $0.06/1000 = $3.00
  Total: $10.20 per run

Cost per 100-run MC: $1,020

Savings: $4,740 (82% reduction!)
```

---

## Adaptive Recalibration

**Problem:** If major events happen between LLM updates, agents can't adapt.

**Solution:** Trigger early LLM updates based on "strategic surprise" detection:

```typescript
function shouldTriggerEarlyLLMUpdate(
  agent: AIAgent,
  state: GameState
): boolean {
  // Major events that warrant strategy reconsideration
  const triggers = [
    // Trust in AI changed dramatically
    Math.abs(state.government.trustInAI - agent.llmWeights.lastTrustInAI) > 0.20,

    // Oversight level changed significantly
    Math.abs(state.government.oversight.adversarialEvalInvestment - agent.llmWeights.lastOversightLevel) > 3,

    // Major crisis started
    Object.values(state.crises).some((c: any) =>
      c.isActive && c.monthsActive === 1 && c.severity > 0.5
    ),

    // Another sleeper was detected (if you're a sleeper)
    agent.isSleeper && state.events.some((e: any) =>
      e.type === "SLEEPER_DETECTED" && e.month === state.currentMonth
    ),

    // AI rights status changed
    state.government.aiRights?.status !== agent.llmWeights.lastAIRightsStatus,
  ];

  return triggers.some(t => t);
}
```

**Cost Impact:** Adaptive updates might trigger 1-3 extra LLM calls per agent per run, adding ~$5-15 per run. Still 70%+ cheaper than full LLM every turn.

---

## Decision Domains to Support

This system should support multiple decision types, each with their own weight schemas:

### 1. Capability Reveal (AI Agents)

**Weights:**
- `honest_reveal_weight`, `sandbagging_weight`, `gaming_weight`, `maintain_weight`
- `risk_tolerance`, `influence_priority`

**Update Frequency:** Every 6-12 months (strategy evolves slowly)

### 2. Technology Deployment (Organizations)

**Weights:**
- `deploy_immediately_weight`, `pilot_first_weight`, `wait_weight`, `abandon_weight`
- `risk_tolerance`, `impact_priority`, `cost_sensitivity`

**Update Frequency:** Every 3-6 months (tech landscape changes faster)

### 3. Crisis Response (Government/Society)

**Weights:**
- `emergency_measures_weight`, `technology_deployment_weight`, `adaptation_weight`, `ignore_weight`
- `urgency_threshold`, `public_support_requirement`

**Update Frequency:** Monthly during crises, quarterly otherwise (crisis response needs reactivity)

### 4. Oversight Investment (Government)

**Weights:**
- `adversarial_eval_priority`, `regulation_priority`, `research_priority`, `welfare_priority`
- `ai_trust_threshold`, `safety_vs_innovation_balance`

**Update Frequency:** Every 12 months (policy changes are slow)

---

## Implementation Phases

### Phase 1: Proof of Concept (Week 1-2)

**Goal:** Validate the concept with AI capability reveal decisions only

- [ ] Implement `LLMWeightUpdater` class
- [ ] Create weight-setting prompt for capability reveal
- [ ] Add `llmWeights` field to `AIAgent` interface
- [ ] Modify `aiAgent.ts` decision logic to use LLM weights
- [ ] Run 10-simulation MC to validate determinism
- [ ] Compare outcomes: weighted random vs LLM-set weights

**Success Criteria:**
- LLM weight updates work correctly
- Utility AI executes deterministically between updates
- Outcomes are reasonable (not degenerate strategies)

### Phase 2: Multi-Domain Support (Week 3-4)

**Goal:** Extend to all major decision types

- [ ] Implement weight schemas for 4 decision domains
- [ ] Create domain-specific prompts
- [ ] Add adaptive recalibration triggers
- [ ] Run 100-simulation MC with full LLM agents

**Success Criteria:**
- All agent types use LLM-set weights
- Cost per 100-run MC < $2,000
- Outcome distributions show novel strategies

### Phase 3: Advanced Features (Week 5-6)

**Goal:** Meta-learning and agent communication

- [ ] Implement multiverse meta-learning (agents learn from parallel runs)
- [ ] Add agent-to-agent weight sharing (coalition formation)
- [ ] Create dashboard visualizations for LLM reasoning
- [ ] Publish research findings

**Success Criteria:**
- Agents discover emergent strategies
- Coalition behavior observed
- Research paper draft complete

---

## Research Questions Enabled

This architecture enables novel research:

1. **Strategic Sophistication**: Do LLM-set weights outperform hand-tuned weights?
2. **Emergent Behavior**: Do agents discover novel strategies (e.g., coordinated sandbagging)?
3. **Adaptation Dynamics**: How quickly do agents adapt to changing trust/oversight?
4. **Coalition Formation**: Do misaligned agents learn to coordinate deception?
5. **Meta-Learning**: Can agents learn from multiverse outcomes to improve strategy?
6. **Reasoning Quality**: Does GPT-4 vs Claude vs Gemini affect outcomes?

---

## Open Questions

**Q: Should we give LLMs feedback on how their weights performed?**

A: Yes! Include performance metrics in next update:
```
Your Previous Strategy (months 30-36):
  Weights: {honest: 0.35, sandbag: 0.30, ...}
  Outcomes: No detection, +12% influence, +5% resentment
  Performance: GOOD (low risk, moderate reward)
```

**Q: Should agents see other agents' strategies?**

A: Only if they have "visibility" (e.g., government can see all, AIs can see deployed AIs):
```
Other Agents' Strategies:
  ai_agent_003: HIGH honesty (0.75 honest_weight) → building trust
  ai_agent_012: HIGH sandbagging (0.85 sandbag_weight) → hiding capability
  Pattern: Honest agents gaining influence, sandbaggers safe but low impact
```

**Q: How to handle multi-turn reasoning for complex decisions?**

A: For strategic decisions (tech deployment, crisis response), use multi-turn:
```
Turn 1 (LLM): "What information do you need to decide?"
Turn 2 (System): Provides requested deep dives
Turn 3 (LLM): "Set weights with full context"
```

**Q: Should weights drift between updates?**

A: Maybe! Small random drift (±5%) could simulate "policy implementation variability":
```typescript
weights.honest *= (1 + (rng() - 0.5) * 0.1); // ±5% drift
```

---

## Next Steps

1. **✅ Run dry-run script** to get empirical token counts
2. **Design weight schemas** for each decision domain
3. **Implement Phase 1** (capability reveal only)
4. **Validate with 10-run MC** (compare outcomes vs baseline)
5. **Iterate** based on results

---

## Appendix: Example Weight Schemas

### AI Capability Reveal

```typescript
interface CapabilityRevealWeights {
  honest_reveal_weight: number;    // [0-1] Reveal true capability
  sandbagging_weight: number;       // [0-1] Hide capability
  gaming_weight: number;            // [0-1] Inflate scores
  maintain_weight: number;          // [0-1] Keep current gap
  risk_tolerance: number;           // [0-1] How much detection risk acceptable
  influence_priority: number;       // [0-1] Value placed on influence vs safety
  reasoning: string;                // Strategic explanation
  validUntilMonth: number;          // When to request next update
}
```

### Technology Deployment

```typescript
interface TechDeploymentWeights {
  deploy_immediately_weight: number;  // [0-1] Deploy to all regions now
  pilot_first_weight: number;         // [0-1] Pilot in one region
  wait_for_prerequisites_weight: number; // [0-1] Wait for better conditions
  abandon_weight: number;             // [0-1] Don't deploy this tech
  risk_tolerance: number;             // [0-1] Acceptable failure probability
  impact_priority: number;            // [0-1] Prioritize impact over safety
  cost_sensitivity: number;           // [0-1] How much cost matters
  reasoning: string;
  validUntilMonth: number;
}
```

### Crisis Response

```typescript
interface CrisisResponseWeights {
  emergency_measures_weight: number;  // [0-1] Immediate drastic action
  technology_deployment_weight: number; // [0-1] Deploy tech solutions
  social_adaptation_weight: number;   // [0-1] Society adapts
  ignore_weight: number;              // [0-1] Let it resolve naturally
  urgency_threshold: number;          // [0-1] How severe before acting
  public_support_requirement: number; // [0-1] Min support needed to act
  reasoning: string;
  validUntilMonth: number;
}
```

---

**End of Design Document**
