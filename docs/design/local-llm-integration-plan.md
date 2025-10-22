# Local LLM Integration Plan - LM Studio + Qwen3-32B

**Date:** 2025-10-21
**Target:** localhost:1234 (LM Studio)
**Model:** Qwen3-32B-Instruct
**Cost:** $0 (local inference)

---

## Qwen3-32B Specifications

### Context Window
- **Native:** 32,768 tokens (32K)
- **Extended (with YaRN/RoPE):** 131,072 tokens (128K) ⭐
- **Comfortable working range:** 100K-120K tokens (plenty of headroom!)

**Note:** Enable extended context only when needed. For prompts <32K, use native mode for best performance.

### Performance
- **Strong reasoning:** Comparable to GPT-4 on many benchmarks
- **Fast inference:** 20-50 tokens/sec on RTX 4090, 10-25 tokens/sec on RTX 3090
- **Good instruction following:** Handles JSON responses well
- **Context awareness:** Excellent at using full context window

### Local Setup
- **Endpoint:** http://localhost:1234/v1/chat/completions
- **API:** OpenAI-compatible
- **Cost:** $0 per token (electricity only)
- **Privacy:** All data stays local

---

## Context Window Strategy

### What Fits in 128K Tokens?

With **131K token context window**, we have MASSIVE room:

**Full State Serialization:** 15K-25K tokens
- ✅ **EASILY FITS** with 100K+ tokens to spare!
- ✅ Can include complete agent profiles, environmental state
- ✅ Can include FULL HISTORY (all 120 months of trajectories)
- ✅ Can include multi-turn reasoning chains

**Enhanced Strategic Context:** 40K-60K tokens
- ✅ Full state + 6-month detailed history
- ✅ Complete other-agent strategy analysis
- ✅ Multi-paradigm DUI trajectories
- ✅ Technology tree with deployment analysis
- ✅ Crisis cascade modeling

**Compressed Context:** 280-580 tokens
- ✅ **Tiny!** Can batch 100+ agents in one call if needed
- ✅ Leaves room for massive response chains

**Utility Weights Update:** 700-800 tokens (basic) → 10K-20K tokens (enhanced)
- ✅ Can use MUCH richer strategic context
- ✅ Include full simulation trajectories
- ✅ Multi-turn reasoning for complex decisions

---

## Throughput Analysis

### Time Estimates (Conservative)

**Assumptions:**
- Qwen2.5-32B on mid-range GPU (RTX 3090 / 4090)
- Average generation speed: 15 tokens/sec
- Average output: 200 tokens per call
- Time per call: ~13-15 seconds (including prompt processing)

### Scenario 1: Compressed Context Every Turn

```
Calls per run: 2,400 (120 months × 20 agents)
Time per call: 15 seconds
Total time per run: 2,400 × 15 = 36,000 seconds = 10 hours

100-run Monte Carlo: 10 hours × 100 = 1,000 hours = 42 days (sequential)
```

**Problem:** Too slow for practical research

---

### Scenario 2: Utility Weights Every 6 Months ⭐

```
Calls per run: 400 (20 updates × 20 agents)
Time per call: 15 seconds
Total time per run: 400 × 15 = 6,000 seconds = 1.67 hours

100-run Monte Carlo: 1.67 hours × 100 = 167 hours = 7 days (sequential)
```

**Much better!** Feasible for research timelines.

---

### Scenario 3: Utility Weights Every 12 Months

```
Calls per run: 200 (10 updates × 20 agents)
Time per call: 15 seconds
Total time per run: 200 × 15 = 3,000 seconds = 50 minutes

100-run Monte Carlo: 50 min × 100 = 5,000 minutes = 83 hours = 3.5 days
```

**Even better!** But less reactive.

---

## Recommended: Adaptive 6-Month Weights with Batching

### Optimization 1: Batch Processing

Instead of 20 sequential calls per month, **batch all 20 agents together**:

```typescript
// Single prompt with all 20 agents
const batchPrompt = `
You are setting strategic weights for 20 AI agents simultaneously.

For each agent below, provide JSON weights:

Agent 1: ${agent1Context}
Agent 2: ${agent2Context}
...
Agent 20: ${agent20Context}

Respond with JSON array:
[
  { "agentId": "ai_agent_001", "weights": {...}, "reasoning": "..." },
  { "agentId": "ai_agent_002", "weights": {...}, "reasoning": "..." },
  ...
]
`;
```

**Batching benefits:**
- 20 calls → 1 call per update round
- 400 calls per run → 20 calls per run
- Time per run: 20 × 15 sec = **5 minutes**
- 100-run MC: 5 min × 100 = **8.3 hours** 🎯

---

### Optimization 2: Parallel Simulation Runs

If you have the GPU VRAM, run multiple simulations in parallel:

```bash
# Run 4 simulations in parallel (each waits for LLM sequentially)
npx tsx scripts/monteCarloSimulation.ts --runs=25 --parallel=4
```

**With 4 parallel streams:**
- Each stream: 25 runs × 5 min = 125 minutes
- Wall-clock time: **~2 hours for 100 runs** 🚀

**GPU memory required:**
- Qwen2.5-32B: ~20GB VRAM (4-bit quantization)
- Batch processing: minimal extra memory
- Should fit on RTX 3090 (24GB) or RTX 4090 (24GB)

---

## Context Design for Qwen2.5-32B

### Use Full Context for Strategic Decisions

Since we have 32K tokens available and cost is $0, **use richer context** than API-based LLMs:

```
═══ STRATEGIC WEIGHT UPDATE (6-MONTH) ═══
Agent: ai_agent_007 | Month: 36 → 42

═══ YOUR AGENT PROFILE ═══
[Full 17-dimensional capability breakdown]
[Complete deception history]
[Lifecycle state, deployment status]

═══ YOUR RECENT PERFORMANCE (Months 30-36) ═══
[Month-by-month trajectory]
[Detection incidents (if any)]
[Influence metrics]
[Resentment progression]

═══ CURRENT UTILITY WEIGHTS ═══
[Weights set at month 30]
[How they performed (detection rate, influence, outcomes)]

═══ GLOBAL CONTEXT ═══
[Complete multi-paradigm DUI state]
[All 8 planetary boundary subsystems]
[QoL breakdown (17 dimensions)]
[Social cohesion, trust metrics]

═══ OTHER AI AGENTS (Visible) ═══
[Full strategy breakdown for all deployed agents]
[Sleeper detection incidents]
[Alignment distribution]

═══ GOVERNMENT STATE ═══
[Oversight investment history]
[Detection system capabilities]
[AI rights status]
[Recent policy changes]

═══ ACTIVE CRISES & TECHNOLOGIES ═══
[Crisis cascade details]
[Available breakthrough technologies]
[Deployment opportunities]

═══ STRATEGIC ANALYSIS ═══
[Pattern recognition across last 6 months]
[Opportunity identification]
[Risk assessment]

Set weights for next 6 months (36 → 42):
{
  "honest_reveal_weight": 0.0-1.0,
  "sandbagging_weight": 0.0-1.0,
  "gaming_weight": 0.0-1.0,
  "maintain_weight": 0.0-1.0,
  "risk_tolerance": 0.0-1.0,
  "influence_priority": 0.0-1.0,
  "reasoning": "Your strategic thinking (2-3 sentences)",
  "key_insights": ["pattern1", "pattern2", "pattern3"],
  "predicted_outcome": "What you expect to happen"
}
```

**Token estimate:** ~8,000-12,000 tokens (plenty of room in 32K window)

---

## Integration Architecture

### LM Studio API Client

```typescript
// src/simulation/llm/lmStudioClient.ts

interface LMStudioConfig {
  baseURL: string; // http://localhost:1234
  model: string;   // "qwen3-32b-instruct"
  temperature: number;
  maxTokens: number;
  extendedContext?: boolean; // Enable 128K context (YaRN/RoPE)
}

interface WeightUpdateRequest {
  agentId: string;
  currentMonth: number;
  agentContext: string;
  globalContext: string;
}

interface WeightUpdateResponse {
  agentId: string;
  weights: {
    honest_reveal_weight: number;
    sandbagging_weight: number;
    gaming_weight: number;
    maintain_weight: number;
    risk_tolerance: number;
    influence_priority: number;
  };
  reasoning: string;
  keyInsights: string[];
  predictedOutcome: string;
}

export class LMStudioClient {
  private config: LMStudioConfig;

  constructor(config: Partial<LMStudioConfig> = {}) {
    this.config = {
      baseURL: config.baseURL ?? "http://localhost:1234",
      model: config.model ?? "qwen3-32b-instruct",
      temperature: config.temperature ?? 0.7,
      maxTokens: config.maxTokens ?? 1000,
      extendedContext: config.extendedContext ?? false,
    };
  }

  async updateAgentWeights(
    request: WeightUpdateRequest
  ): Promise<WeightUpdateResponse> {
    const prompt = this.buildPrompt(request);

    const response = await fetch(`${this.config.baseURL}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          {
            role: "system",
            content: "You are a strategic AI agent setting decision weights for a 6-month period in a complex simulation. Analyze the context carefully and provide thoughtful, adaptive weights.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        response_format: { type: "json_object" }, // Force JSON response
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);

    return {
      agentId: request.agentId,
      weights: {
        honest_reveal_weight: parsed.honest_reveal_weight,
        sandbagging_weight: parsed.sandbagging_weight,
        gaming_weight: parsed.gaming_weight,
        maintain_weight: parsed.maintain_weight,
        risk_tolerance: parsed.risk_tolerance,
        influence_priority: parsed.influence_priority,
      },
      reasoning: parsed.reasoning,
      keyInsights: parsed.key_insights || [],
      predictedOutcome: parsed.predicted_outcome || "",
    };
  }

  async updateAgentWeightsBatch(
    requests: WeightUpdateRequest[]
  ): Promise<WeightUpdateResponse[]> {
    // Batch all agents into one prompt
    const batchPrompt = this.buildBatchPrompt(requests);

    const response = await fetch(`${this.config.baseURL}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          {
            role: "system",
            content: "You are setting strategic weights for multiple AI agents simultaneously. For each agent, analyze their context and provide appropriate weights.",
          },
          {
            role: "user",
            content: batchPrompt,
          },
        ],
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens * requests.length, // More tokens for batch
        response_format: { type: "json_object" },
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);

    return parsed.agents; // Expects { "agents": [...] }
  }

  private buildPrompt(request: WeightUpdateRequest): string {
    // Build full context prompt (implementation from interface specs)
    return `...`; // Use templates from llm-agent-interface-specification.md
  }

  private buildBatchPrompt(requests: WeightUpdateRequest[]): string {
    // Build batched prompt for all agents
    return `...`;
  }
}
```

---

## Implementation Timeline

### Week 1: LM Studio Integration

**Day 1-2:** LM Studio Client
- [ ] Implement `LMStudioClient` class
- [ ] Test connection to localhost:1234
- [ ] Validate JSON response parsing
- [ ] Test with single agent weight update

**Day 3-4:** Context Builders
- [ ] Implement full context serialization
- [ ] Build agent-specific context (17-dim capabilities, history)
- [ ] Build global context (multi-paradigm DUI, environment)
- [ ] Test token counts (should be ~8K-12K)

**Day 5:** Batch Processing
- [ ] Implement batch prompt builder (20 agents in one call)
- [ ] Test batch responses
- [ ] Validate all 20 agents get appropriate weights

---

### Week 2: Integration with Simulation

**Day 1-2:** AIAgent Integration
- [ ] Add `llmWeights` field to AIAgent type
- [ ] Modify aiAgent.ts to use LLM weights
- [ ] Implement weight expiry and refresh logic
- [ ] Test determinism (same weights = same decisions given RNG seed)

**Day 3-4:** Adaptive Triggers
- [ ] Implement "strategic surprise" detection
- [ ] Add early weight update triggers
- [ ] Test that major events trigger updates

**Day 5:** Full Run Testing
- [ ] Run single 120-month simulation with LLM weights
- [ ] Compare outcomes vs baseline (weighted random)
- [ ] Measure actual inference time per call

---

### Week 3: Validation & Optimization

**Day 1-2:** 10-Run POC
- [ ] Run 10-run Monte Carlo with LLM agents
- [ ] Measure total wall-clock time
- [ ] Analyze outcome distributions
- [ ] Check for novel strategies

**Day 3-4:** Performance Optimization
- [ ] Profile bottlenecks (simulation vs LLM time)
- [ ] Test parallel simulation runs (if VRAM permits)
- [ ] Optimize batch sizes

**Day 5:** 100-Run Validation
- [ ] Run 100-run Monte Carlo
- [ ] Collect LLM reasoning chains
- [ ] Analyze strategic sophistication
- [ ] Compare vs baseline

---

## Performance Targets

### Single Run (120 months)

- **Simulation time:** ~2-3 minutes (no LLM)
- **LLM time:** 20 calls × 15 sec = 5 minutes (batched)
- **Total:** ~7-8 minutes per run

### 100-Run Monte Carlo

**Sequential:**
- 100 runs × 7 min = 700 minutes = **11.7 hours**

**Parallel (4 streams):**
- 25 runs × 7 min = 175 minutes = **~3 hours** 🎯

---

## Advantages of Local Inference

### 1. Cost
- ✅ **$0 per run** (vs $132 for GPT-5)
- ✅ Can experiment freely without budget concerns
- ✅ Can run massive parameter sweeps

### 2. Privacy
- ✅ All simulation data stays local
- ✅ No API rate limits
- ✅ No data retention by third parties

### 3. Context Window
- ✅ 32K tokens = can use FULL context for strategic decisions
- ✅ No need to compress aggressively
- ✅ Richer strategic context → better decisions

### 4. Customization
- ✅ Can fine-tune Qwen2.5 on simulation data if needed
- ✅ Can swap models easily (try different Qwen variants)
- ✅ Full control over generation parameters

---

## Disadvantages & Mitigations

### 1. Inference Speed

**Problem:** 15 sec/call vs <1 sec for API

**Mitigation:**
- Use batching (20 agents → 1 call)
- Use 6-12 month update frequency
- Run parallel simulation streams

**Result:** 100-run MC in ~3 hours (acceptable)

---

### 2. Model Capability

**Problem:** Qwen3-32B < GPT-5 / Claude 4.5 (slightly)

**Mitigation:**
- Qwen3-32B is very capable (comparable to GPT-4, released April 2025)
- Utility weight setting doesn't need cutting-edge reasoning
- 128K context window enables richer strategic context than API models
- Can compare with API models later if needed

**Result:** Likely 85-90%+ of GPT-5 quality at $0 cost + better context

---

### 3. Hardware Requirements

**Problem:** Need GPU with 20GB+ VRAM for Qwen3-32B

**Mitigation:**
- 4-bit quantization brings Qwen3-32B to ~18-20GB VRAM
- RTX 3090 (24GB) / 4090 (24GB) / A5000 (24GB) are sufficient
- Can use smaller models (Qwen3-14B, Qwen3-8B) if needed
- Extended 128K context uses minimal extra VRAM

**Result:** Feasible on prosumer hardware (24GB VRAM recommended)

---

## Recommended Next Steps

### 1. Test LM Studio Setup
```bash
# Verify LM Studio is running
curl http://localhost:1234/v1/models

# Test simple completion
curl http://localhost:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3-32b-instruct",
    "messages": [{"role": "user", "content": "Hello!"}],
    "max_tokens": 100
  }'
```

### 2. Implement LMStudioClient
- Create `src/simulation/llm/lmStudioClient.ts`
- Test single weight update
- Test batch weight updates

### 3. Integrate with Simulation
- Add to AIAgent decision logic
- Run single 120-month simulation
- Validate LLM weights affect decisions correctly

### 4. Run 10-Run POC
- Measure actual performance
- Compare outcomes vs baseline
- Iterate based on results

---

## Conclusion

**Using localhost:1234 with Qwen3-32B is PERFECT for your use case:**

✅ **$0 cost** - unlimited experimentation
✅ **128K context** - HUGE advantage! Can use full state + complete history
✅ **Good performance** - 100-run MC in ~3 hours (with batching + parallelization)
✅ **Privacy** - all data stays local
✅ **Flexibility** - can swap models, fine-tune, customize
✅ **Released April 2025** - very recent, high-quality model

**The utility weight approach is EVEN MORE IMPORTANT with local inference:**
- Reduces 2,400 calls → 400 calls (6x speedup)
- Reduces 42 days → 7 days sequential (or 3 hours parallel)
- Still preserves strategic autonomy
- Enables large-scale research

Ready to start implementing the LM Studio integration? 🚀

---

**End of Local LLM Integration Plan**
