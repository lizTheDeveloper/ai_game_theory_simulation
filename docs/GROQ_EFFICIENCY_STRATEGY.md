# Groq Efficiency Strategy: 14x More Requests with Smart Model Selection

## The Problem

Groq's free tier has **VASTLY different limits** for different model sizes:

| Model | Size | Requests/Day | Tokens/Day | Ratio |
|-------|------|--------------|------------|-------|
| **llama-3.1-8b-instant** | 8B | **14,400** | **500,000** | **14.4x** requests |
| **llama-3.3-70b-versatile** | 70B | **1,000** | **100,000** | **Baseline** |
| **qwen/qwen3-32b** | 32B | **1,000** | **500,000** | **5x** tokens |

**Key Insight:** The 8B model has **14.4x more requests per day** than the 70B model!

## The Solution

**Use small models for simple tasks, reserve large models for complex reasoning.**

### Smart Routing Strategy

```yaml
# Priority order (from llm-providers.yaml):
1. groq-8b      (priority: 1)  - 14.4K requests/day - Use for 80% of tasks
2. openai-free  (priority: 2)  - 1M tokens/day     - Fallback #1
3. groq-32b     (priority: 3)  - 1K requests/day   - Medium complexity
4. groq-70b     (priority: 5)  - 1K requests/day   - Only for complex tasks
99. lm-studio   (priority: 99) - No limits         - Local fallback
```

### Task Complexity Mapping

| Complexity | Model | Use Cases | Tokens/Request |
|------------|-------|-----------|----------------|
| **Simple** | 8B | Weight updates, status checks, thresholds | 800 |
| **Medium** | 32B | Strategic planning, crisis response | 1,000 |
| **Complex** | 70B | Extinction scenarios, long-term strategy | 1,500 |

## Efficiency Calculations

### Scenario 1: Using ONLY 70B Model

```python
# Groq 70B limits
requests_per_day = 1,000
tokens_per_day = 100,000

# Simulation parameters
num_agents = 20
updates_per_agent = 6  # Over 120 months
tokens_per_update = 1,500

# Calculate max runs
tokens_per_run = num_agents * updates_per_agent * tokens_per_update
# = 20 × 6 × 1,500 = 180,000 tokens/run

# Can't even complete 1 run per day!
max_runs = tokens_per_day / tokens_per_run
# = 100,000 / 180,000 = 0.55 runs/day
```

**Result: Can't even complete 1 Monte Carlo run per day with 70B model!**

### Scenario 2: Using ONLY 8B Model

```python
# Groq 8B limits
requests_per_day = 14,400
tokens_per_day = 500,000

# Simulation parameters (same)
num_agents = 20
updates_per_agent = 6
tokens_per_update = 800  # Smaller model

# Calculate max runs
tokens_per_run = num_agents * updates_per_agent * tokens_per_update
# = 20 × 6 × 800 = 96,000 tokens/run

max_runs = tokens_per_day / tokens_per_run
# = 500,000 / 96,000 = 5.2 runs/day
```

**Result: 5 Monte Carlo runs per day with 8B model!**

### Scenario 3: OPTIMAL - Mixed Model Strategy

```python
# Distribute tasks by complexity
simple_tasks = 0.80  # 80% simple (weight updates)
medium_tasks = 0.15  # 15% medium (crisis response)
complex_tasks = 0.05 # 5% complex (extinction scenarios)

# Model assignment
simple_model = '8b'   # 800 tokens
medium_model = '32b'  # 1,000 tokens
complex_model = '70b' # 1,500 tokens

# Weighted average tokens per update
avg_tokens = (0.80 * 800) + (0.15 * 1000) + (0.05 * 1500)
# = 640 + 150 + 75 = 865 tokens/update

# Calculate max runs
tokens_per_run = num_agents * updates_per_agent * avg_tokens
# = 20 × 6 × 865 = 103,800 tokens/run

# Check constraints
# 1. Token limit (8B model is bottleneck at 500K/day)
max_runs_tokens = 500_000 / 103_800 = 4.8 runs/day

# 2. Request limit (8B model: 14.4K/day)
requests_per_run = num_agents * updates_per_agent * simple_tasks
# = 20 × 6 × 0.80 = 96 requests/run (8B model)
max_runs_requests = 14_400 / 96 = 150 runs/day

# 3. 70B model limit (only 1K requests/day)
requests_70b_per_run = num_agents * updates_per_agent * complex_tasks
# = 20 × 6 × 0.05 = 6 requests/run (70B model)
max_runs_70b = 1_000 / 6 = 166 runs/day

# Bottleneck is tokens (4.8 runs/day)
max_runs = 4.8
```

**Result: 4-5 Monte Carlo runs per day with optimal model selection!**

## Implementation

The system **automatically routes tasks to appropriate models** based on complexity:

```typescript
import { getProviderManager } from './src/simulation/llm/providerManager';

const manager = getProviderManager();

// Simple task → groq-8b (llama-3.1-8b-instant)
const simple = manager.getNextProviderWithTier('simple');
// { provider: groq-8b, model: llama-3.1-8b-instant (8b), tokens: 800 }

// Medium task → groq-32b (qwen3-32b)
const medium = manager.getNextProviderWithTier('medium');
// { provider: groq-32b, model: qwen/qwen3-32b (32b), tokens: 1000 }

// Complex task → groq-70b (llama-3.3-70b-versatile)
const complex = manager.getNextProviderWithTier('complex');
// { provider: groq-70b, model: llama-3.3-70b-versatile (70b), tokens: 1500 }
```

## Overnight Run Strategy

### Goal: Maximize Daily Token Usage

```bash
# Calculate optimal runs for 80% simple / 15% medium / 5% complex mix
tokens_per_day=500000
tokens_per_run=103800
optimal_runs=$((tokens_per_day / tokens_per_run))
# = 4 runs/day

# Run overnight
npx tsx scripts/monteCarloSimulation.ts \
  --runs=4 \
  --max-months=120 \
  --llm-enabled \
  --complexity-mix="0.80,0.15,0.05" \
  > logs/mc_groq_overnight_$(date +%Y%m%d).log 2>&1 &

echo "Started 4 Monte Carlo runs (will consume ~400K tokens)"
echo "Check logs/mc_groq_overnight_*.log for progress"
```

### Expected Token Consumption

```
Run 1: 103,800 tokens
Run 2: 103,800 tokens
Run 3: 103,800 tokens
Run 4: 103,800 tokens
Total: 415,200 tokens (83% of daily limit)
```

## Provider Rotation When Limits Hit

The system automatically rotates providers when limits are reached:

```
1. Start with groq-8b (14.4K requests/day, 500K tokens/day)
   → Use for simple tasks until token limit hit (~400K tokens)

2. Switch to openai-free (1M tokens/day)
   → Continue with remaining simple tasks

3. Use groq-32b for medium complexity (1K requests/day)
   → Strategic planning, crisis response

4. Reserve groq-70b for complex only (1K requests/day)
   → Extinction scenarios, critical decisions

5. Fallback to lm-studio (no limits)
   → Local inference when all APIs exhausted
```

## Best Practices

1. **Classify Tasks Correctly**
   - Simple: Weight updates, status checks (80% of tasks)
   - Medium: Strategic decisions, crisis response (15% of tasks)
   - Complex: Extinction scenarios, long-term planning (5% of tasks)

2. **Monitor Usage**
   ```typescript
   manager.printUsageSummary();
   // groq-8b:
   //   Requests: 96/14400 (day)
   //   Tokens: 103800/500000 (day)
   ```

3. **Run Overnight**
   - Calculate optimal runs: `tokens_per_day / tokens_per_run`
   - Set complexity mix: `--complexity-mix="0.80,0.15,0.05"`
   - Monitor logs: `tail -f logs/mc_groq_overnight_*.log`

4. **Use Multiple Accounts**
   - Groq account 1: 500K tokens/day
   - Groq account 2: 500K tokens/day
   - Total: 1M tokens/day → 9 runs/day

5. **Combine with OpenAI Free**
   - Groq 8B: 500K tokens/day
   - OpenAI mini: 1M tokens/day
   - Total: 1.5M tokens/day → 14 runs/day

## Key Takeaways

- **70B model is 14x more expensive on requests** (1K vs 14.4K/day)
- **70B model is 5x more expensive on tokens** (100K vs 500K/day)
- **Smart routing to 8B model = 5x more Monte Carlo runs per day**
- **Reserve large models for complex reasoning only** (5% of tasks)
- **Combine multiple free tier providers** for 14+ runs per day

## Configuration

See `llm-providers.yaml` for complete provider configuration with actual Groq limits.

**Provider priorities:**
1. `groq-8b` (priority: 1) - Use first for simple tasks
2. `openai-free` (priority: 2) - Fallback after Groq 8B exhausted
3. `groq-32b` (priority: 3) - Medium complexity only
4. `groq-70b` (priority: 5) - Complex reasoning only
99. `lm-studio` (priority: 99) - Local fallback (no limits)

**Usage tracking:** Automatically persisted to `llm-providers.yaml` between runs.
