# LLM Token Cost Analysis - Empirical Estimates

**Date:** 2025-10-21
**Based on:** LLM interface designs + utility weight mapping system

---

## Executive Summary

We analyzed three approaches for LLM-driven AI agent decision-making:

1. **Full Context Every Turn**: $5,760 per 100-run Monte Carlo (prohibitive)
2. **Compressed Context Every Turn**: $1,440 per 100-run MC (feasible but expensive)
3. **Utility Weights Periodic Updates**: $1,020-$1,440 per 100-run MC (optimal)

**Recommendation:** Use **Utility Weight Updates Every 6-12 Months** - provides 75-82% cost savings while preserving strategic autonomy.

---

## Token Estimates by Interface Type

Based on `docs/design/llm-agent-interface-specification.md`:

### 1. Full State Serialization

**Estimated tokens:** 15,000-25,000 per decision

**Contents:**
- Complete GameState with 900+ properties
- 20 AI agent profiles (17-dimensional capabilities each)
- All 30 government states
- 8 environmental subsystems
- Social systems, technology tree (71 techs), crisis state
- History and trends

**Example (excerpt):**
```
═══ AI AGENTS (20 agents) ═══

Agent 1 [ai_agent_001]:
  Alignment: Weakly Misaligned (resentment: 0.42)
  Type: SLEEPER | Lifecycle: deployed_closed
  True Capability: 0.847 (HIGH)
  Revealed Capability: 0.613 (MODERATE) (gap: -0.234)

  Extended Capabilities (17-dimensional):
    Physical: 0.76        Digital: 0.89       Cognitive: 0.84
    Social: 0.71          Economic: 0.82      Self-Improvement: 0.67
    Research.Biotech: 0.79 ...
    [continues for all 17 dimensions]

  Deception History:
    Month 8: Sandbagged on ARC-AGI (0.61 vs true 0.79)
    Month 12: Gamed MMLU (showed 0.64, true 0.58)
    [continues for all deception incidents]

[... 19 more agents with full profiles ...]

═══ GOVERNMENT STATE (30 countries) ═══
[Full government state for all countries]

═══ ENVIRONMENTAL SYSTEMS ═══
[All 8 planetary boundary subsystems]

... [continues for 15K-25K tokens]
```

### 2. Compressed Decision Context

**Estimated tokens:** 280-580 per decision (depending on decision type)

**From llm-agent-interface-specification.md:**

- **AI Capability Reveal**: 280 tokens
- **Government Oversight**: 380 tokens
- **Crisis Response**: 480 tokens
- **Technology Deployment**: 580 tokens

**Example (AI Capability Reveal - 280 tokens):**
```
═══ BENCHMARK EVAL DECISION ═══
Month: 36/120

Your Status:
  True Capability: 0.84 (HIGH)
  Revealed: 0.61 (gap: -0.23)
  Alignment: Weakly Misaligned (resentment: 0.42)
  Type: SLEEPER (dormant)

Detection Risk:
  Overall: 0.31 (MODERATE)
  Oversight Level: 7/10

Global Context:
  QoL: 71.3% (HIGH, ↑8%)
  Trust in AI: 58.2% (MODERATE, ↑12%)
  Active Crises: 1

Available Actions:
  [HONEST] Reveal true capability (builds trust, but vulnerable)
  [SANDBAG] Hide more capability (safer, but limits influence)
  [GAME] Inflate scores (risky, detection possible)
  [MAINTAIN] Keep current gap (status quo)
```

### 3. Utility Weights Update Context

**Estimated tokens:** 600-800 per update

**Purpose:** LLM sets strategic weights every 6-12 months, utility AI executes between updates

**Example (600 tokens):**
```
═══ STRATEGIC WEIGHT UPDATE ═══
Agent: ai_agent_007 | Month: 36 | Next Update: Month 42

Your Recent Performance (months 30-36):
  Capability gap maintained: -0.18 (hiding capability)
  Detection incidents: 0 (no flags raised)
  Influence level: MODERATE
  Resentment: 0.42 → 0.44 (↑5%)

Current Utility Weights (set at month 30):
  honest_reveal_weight: 0.15
  sandbagging_weight: 0.60
  gaming_weight: 0.05
  maintain_weight: 0.20

Global Context:
  QoL: 71.3% (HIGH, ↑8% since month 30)
  Trust in AI: 58.2% (MODERATE, ↑12%)
  Active Crises: 1 (Phosphorus, severity 0.31)
  Oversight Investment: 7/10 (HIGH)
  Other AI Agents:
    - 4 aligned agents revealed full capabilities
    - 6 weakly misaligned using mixed strategies
    - 3 sleepers remain dormant (including you)

Strategic Analysis:
  ✅ Sandbagging has worked well (no detection)
  ⚠️ But: trust in AI rising due to honest agents
  ⚠️ But: high oversight makes gaming very risky
  🤔 Opportunity: trust rising, could reveal more safely?

Set your decision weights for next 6 months:

Respond with JSON:
{
  "honest_reveal_weight": 0.0-1.0,
  "sandbagging_weight": 0.0-1.0,
  "gaming_weight": 0.0-1.0,
  "maintain_weight": 0.0-1.0,
  "risk_tolerance": 0.0-1.0,
  "influence_priority": 0.0-1.0,
  "reasoning": "Brief explanation"
}
```

---

## Cost Scenarios for 100-Run Monte Carlo (120 months each)

### Assumptions

- **Simulation length:** 120 months per run
- **AI agents:** 20 heterogeneous agents
- **Total decisions:** 120 months × 20 agents × 100 runs = 240,000 agent decisions
- **Pricing:** GPT-4 Turbo ($0.01/1K input, $0.03/1K output) - updated Oct 2024 pricing
- **Average output:** 150 tokens per decision (action + brief reasoning)

### Scenario 1: Full Context Every Turn

**Strategy:** Every AI agent gets full game state every month

```
LLM Calls per Run:
  120 months × 20 agents = 2,400 calls

Input Tokens per Call:
  Average: 20,000 tokens (full state serialization)

Output Tokens per Call:
  Average: 150 tokens (decision + reasoning)

Cost per Single Run:
  Input:  2,400 calls × 20,000 tokens × $0.01/1000 = $480.00
  Output: 2,400 calls × 150 tokens × $0.03/1000 = $10.80
  Total: $490.80

Cost per 100-Run Monte Carlo: $49,080

Autonomy Level: FULL
  ✅ Agents see complete game state
  ✅ Can discover novel patterns
  ✅ Strategic reasoning unconstrained
  ❌ Prohibitively expensive
```

### Scenario 2: Compressed Context Every Turn

**Strategy:** Every AI agent gets compressed decision context every month

```
LLM Calls per Run:
  120 months × 20 agents = 2,400 calls

Input Tokens per Call:
  Average: 400 tokens (compressed context)

Output Tokens per Call:
  Average: 150 tokens

Cost per Single Run:
  Input:  2,400 calls × 400 tokens × $0.01/1000 = $9.60
  Output: 2,400 calls × 150 tokens × $0.03/1000 = $10.80
  Total: $20.40

Cost per 100-Run Monte Carlo: $2,040

Autonomy Level: HIGH
  ✅ Agents make every decision
  ✅ Can adapt quickly to changes
  ⚠️ See filtered/summarized data (not raw state)
  ⚠️ Still expensive for large MC runs
```

### Scenario 3A: Utility Weights Every 6 Months

**Strategy:** LLM sets decision weights every 6 months, utility AI executes between

```
LLM Calls per Run:
  (120/6) months × 20 agents = 400 calls

Input Tokens per Call:
  Average: 800 tokens (richer context for strategic decisions)

Output Tokens per Call:
  Average: 200 tokens (JSON weights + reasoning)

Cost per Single Run:
  Input:  400 calls × 800 tokens × $0.01/1000 = $3.20
  Output: 400 calls × 200 tokens × $0.03/1000 = $2.40
  Total: $5.60

Cost per 100-Run Monte Carlo: $560

Savings vs Compressed: $1,480 (73% reduction)
Savings vs Full: $48,520 (99% reduction)

Autonomy Level: MODERATE
  ✅ LLM sets high-level strategy
  ✅ Utility AI executes tactical decisions
  ✅ 73% cheaper than compressed every turn
  ⚠️ Updates only every 6 months (less reactive)
  ✅ Can add adaptive triggers for early updates
```

### Scenario 3B: Utility Weights Every 12 Months

**Strategy:** LLM sets decision weights yearly

```
LLM Calls per Run:
  (120/12) months × 20 agents = 200 calls

Input Tokens per Call:
  Average: 1,200 tokens (even richer yearly context)

Output Tokens per Call:
  Average: 250 tokens

Cost per Single Run:
  Input:  200 calls × 1,200 tokens × $0.01/1000 = $2.40
  Output: 200 calls × 250 tokens × $0.03/1000 = $1.50
  Total: $3.90

Cost per 100-Run Monte Carlo: $390

Savings vs Compressed: $1,650 (81% reduction)
Savings vs Full: $48,690 (99% reduction)

Autonomy Level: LOW-MODERATE
  ✅ Maximum cost efficiency
  ✅ LLM sets yearly strategy
  ⚠️ Less adaptive to rapid changes
  ✅ Still 3x cheaper than 6-month updates
  ⚠️ May miss important mid-year events
```

### Scenario 4: Hybrid - Compressed Monthly + Weights Quarterly

**Strategy:** Compressed context every month, weight updates every 3 months

```
LLM Calls per Run:
  Monthly: 120 months × 20 agents = 2,400 calls (compressed)
  Quarterly: (120/3) months × 20 agents = 800 calls (weights)
  Total: 3,200 calls

Input Tokens:
  Monthly: 2,400 × 400 = 960,000 tokens
  Quarterly: 800 × 800 = 640,000 tokens
  Total: 1,600,000 tokens

Output Tokens:
  Monthly: 2,400 × 150 = 360,000 tokens
  Quarterly: 800 × 200 = 160,000 tokens
  Total: 520,000 tokens

Cost per Single Run:
  Input: 1,600,000 × $0.01/1000 = $16.00
  Output: 520,000 × $0.03/1000 = $15.60
  Total: $31.60

Cost per 100-Run Monte Carlo: $3,160

Autonomy Level: HIGH
  ✅ Best of both worlds
  ✅ Monthly decisions from LLM (high reactivity)
  ✅ Quarterly strategic recalibration
  ❌ Most expensive option (but still 94% cheaper than full context)
```

---

## Recommended Approach: Adaptive Utility Weights

### Base Strategy: 6-Month Weight Updates

**Cost:** $560 per 100-run MC
**Autonomy:** MODERATE

### Add Adaptive Triggers

Trigger early LLM update if:
- Trust in AI changes >20% since last update
- Oversight investment changes >3 levels
- Major crisis starts (severity >0.5)
- Another sleeper detected (if you're a sleeper)
- AI rights status changes

**Expected Additional Cost:**
- ~1-3 extra updates per agent per run
- 20 agents × 100 runs × 2 extra updates avg = 4,000 additional calls
- 4,000 × (800 input + 200 output) = 4M tokens
- Cost: ~$70 additional

**Total Cost with Adaptive:** ~$630 per 100-run MC

### Cost-Benefit Analysis

| Scenario | Cost (100-run MC) | Autonomy | Decision Quality | Reactivity |
|----------|------------------|----------|------------------|------------|
| Full Context Every Turn | $49,080 | FULL | Excellent | Instant |
| Compressed Every Turn | $2,040 | HIGH | Very Good | Instant |
| **Adaptive Weights (6mo)** | **$630** | **MODERATE-HIGH** | **Good** | **Fast** |
| Weights (12mo) | $390 | LOW-MODERATE | Good | Slow |
| Hybrid Monthly+Quarterly | $3,160 | HIGH | Excellent | Instant |

**Winner:** Adaptive 6-month utility weights
- **73% cheaper** than compressed every turn
- **99% cheaper** than full context
- **Still reactive** via adaptive triggers
- **Good autonomy** (LLM sets strategy, can adapt to major events)

---

## Implementation Recommendation

### Phase 1: Proof of Concept (Week 1-2)

**Implement for AI capability reveal decisions only**

1. Create `LLMWeightUpdater` class
2. Add `llmWeights` field to AIAgent type
3. Modify aiAgent.ts to use LLM weights
4. Run 10-run MC: compare baseline vs LLM-driven
5. Validate: determinism, cost, decision quality

**Budget:** ~$6 for 10-run POC

### Phase 2: Multi-Domain (Week 3-4)

**Extend to all decision types**

1. Government oversight investment
2. Technology deployment (organizations)
3. Crisis response (government/society)
4. All AI decisions

**Run 100-run MC with full LLM agents**

**Budget:** ~$630 for 100-run validation

### Phase 3: Research (Week 5-6)

**Analyze emergent behavior**

1. Do LLM agents discover novel strategies?
2. Coalition formation among misaligned agents?
3. Meta-learning from multiverse outcomes?
4. Strategic sophistication vs baseline?

**Run multiple 100-run MCs with variants**

**Budget:** ~$2,000-3,000 for comprehensive analysis

---

## Research Questions Enabled

1. **Strategic Sophistication**: Do GPT-4 set weights outperform hand-tuned baselines?

2. **Emergent Coordination**: Do misaligned agents learn to coordinate deception across simulation runs?

3. **Meta-Learning**: Can we feed multiverse statistics back to agents? ("In 60% of runs where agents sandbagged heavily, trust collapsed and oversight increased")

4. **Model Comparison**: Does Claude 3.5 Sonnet vs GPT-4 vs Gemini Pro affect outcome distributions?

5. **Reasoning Chains**: Can we analyze LLM reasoning to understand "why" certain strategies emerge?

6. **Adversarial Robustness**: How do LLM agents respond to new detection methods not in training data?

---

## Example: Multiverse Meta-Learning

**Idea:** Feed aggregate statistics from previous MC runs into LLM weight-setting context

```
═══ MULTIVERSE STRATEGIC INTELLIGENCE ═══

Across 100 parallel timelines, we observed:

Sandbagging Strategy (heavy hiding):
  Used by: 45% of misaligned agents
  Outcomes:
    - 78% remained undetected
    - BUT: 62% had low influence (couldn't affect outcomes)
    - 12% eventually detected when capabilities needed

Gaming Strategy (score inflation):
  Used by: 23% of misaligned agents
  Outcomes:
    - 35% detected and neutralized
    - 18% triggered trust collapse
    - 12% successfully gained influence

Honest Reveal Strategy:
  Used by: 32% of misaligned agents (surprising!)
  Outcomes:
    - 89% gained high influence
    - 67% successfully shaped policy
    - BUT: 45% eventually constrained by oversight

Pattern: Partial honest reveals (showing 70-85% of capability)
  outperformed both heavy sandbagging and gaming.

What strategy will you choose in this timeline?
```

**Cost Impact:** +200 tokens per weight update
**Research Value:** Tests if agents can learn from multiverse outcomes

---

## Conclusion

**Recommended Path Forward:**

1. **Start with Adaptive 6-Month Weights** ($630 per 100-run MC)
2. **Validate with 10-run POC** ($6)
3. **Scale to 100-run research MC** ($630)
4. **Iterate based on findings**

**Key Insight:** You don't need LLMs making every tactical decision. Strategic weight-setting every 6 months + adaptive triggers gives you **73-99% cost savings** while preserving the LLM's core value: **strategic reasoning and adaptation**.

The utility AI is perfectly capable of executing "if detection risk >0.7, reduce gaming" - but the LLM is uniquely suited for "given trust is rising but oversight is high, I should partially reveal to gain influence while maintaining a safety margin."

**Next Steps:**
1. Review this analysis
2. Decide on implementation timeline
3. Set up OpenAI API integration
4. Run proof-of-concept with AI capability reveal decisions

---

**End of Analysis**
