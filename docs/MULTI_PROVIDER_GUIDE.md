# Multi-Provider LLM Configuration Guide

## Overview

The multi-provider system lets you configure multiple LLM APIs with:
- **Token tracking** (not just requests)
- **Model tiers** (7B, 20B+, 100B+) - use smaller models for simple tasks
- **Automatic provider rotation** when limits are hit
- **Usage persistence** between simulation runs

## Quick Start

### 1. Configure Your API Keys

Set environment variables for each provider you want to use:

```bash
export GROQ_API_KEY="your_groq_key_here"
export OPENAI_API_KEY="your_openai_key_here"
export ANTHROPIC_API_KEY="your_anthropic_key_here"  # Optional
export TOGETHER_API_KEY="your_together_key_here"    # Optional
```

### 2. Edit Provider Configuration

Edit `llm-providers.yaml` to enable/disable providers and set limits:

```yaml
providers:
  - name: groq
    enabled: true              # Set to true to use
    priority: 1                # Lower = higher priority

    models:
      small_7b:                # For simple tasks
        model_name: llama-3.1-8b-instant
        tokens_per_request_avg: 800
      medium_70b:              # For medium complexity
        model_name: llama-3.1-70b-versatile
        tokens_per_request_avg: 1200
      large_70b:               # For complex reasoning
        model_name: llama-3.1-70b-versatile
        tokens_per_request_avg: 1500

    limits:
      requests_per_day: 14400  # Groq free tier
      tokens_per_day: 1000000  # ~1M tokens with 8B model
```

### 3. Use in Code

The provider manager automatically selects the best provider and model:

```typescript
import { getProviderManager } from './src/simulation/llm/providerManager';

// Get provider manager (loads llm-providers.yaml)
const manager = getProviderManager();

// Get provider + model for simple task
const simple = manager.getNextProviderWithTier('simple');
// → { provider: groq, model: llama-3.1-8b-instant (7b) }

// Get provider + model for complex task
const complex = manager.getNextProviderWithTier('complex');
// → { provider: groq, model: llama-3.1-70b-versatile (70b) }

// Record usage after API call
manager.recordUsage(
  simple.provider.name,
  800,   // total tokens
  500,   // input tokens
  300    // output tokens
);

// Print usage summary
manager.printUsageSummary();
// groq:
//   Requests: 1/14400 (day)
//   Tokens: 800/1000000 (day)
//   Available: ✅
```

## Model Tier Strategy

**Key Insight:** Smaller models consume fewer tokens, so you can make more requests per day with free tier APIs.

### Token Efficiency Example (Groq)

```yaml
# Groq free tier: 14,400 requests/day, ~1M tokens/day

# Using only 70B model:
tokens_per_request_avg: 1500
max_requests: 1,000,000 / 1500 = 667 requests/day
efficiency: 667 / 14,400 = 4.6% of request limit used

# Using 8B model for simple tasks (80% of requests):
simple_tokens: 800
medium_tokens: 1200
complex_tokens: 1500

weighted_avg = 0.8 * 800 + 0.15 * 1200 + 0.05 * 1500
             = 640 + 180 + 75
             = 895 tokens/request

max_requests: 1,000,000 / 895 = 1,117 requests/day
efficiency: 1,117 / 14,400 = 7.8% of request limit used

# Result: 67% more requests by using smaller models!
```

### Task Complexity Mapping

| Complexity | Model Size | Use Cases |
|------------|-----------|-----------|
| **Simple** | 7B | Simple weight updates, routine checks, threshold evaluations |
| **Medium** | 20B-70B | Strategic planning, crisis response, technology deployment |
| **Complex** | 70B-405B | Complex reasoning, extinction scenarios, long-term strategy |

## Provider Rotation

When a provider hits its limits, the system automatically rotates to the next available provider:

```typescript
// Priority order (from llm-providers.yaml):
1. groq         (priority: 1)  - Try first
2. openai-free  (priority: 2)  - If groq exhausted
3. anthropic    (priority: 3)  - If both exhausted
4. together     (priority: 4)  - If all above exhausted
99. lm-studio   (priority: 99) - Local fallback (no limits)
```

**Rotation strategies:**
- `token-aware` (default) - Switch when token limit hit
- `request-aware` - Switch when request limit hit
- `cost-aware` - Prefer cheaper providers first
- `round-robin` - Rotate evenly across providers

## Usage Tracking

Usage is tracked per provider per day and persisted to `llm-providers.yaml`:

```yaml
usage_tracking:
  groq:
    '2025-10-22':
      requests: 1234
      tokens: 567890
      tokens_input: 234567
      tokens_output: 333323
  openai-free:
    '2025-10-22':
      requests: 456
      tokens: 789012
      tokens_input: 345678
      tokens_output: 443334
```

This allows you to:
- **Monitor daily usage** across multiple simulation runs
- **Avoid hitting rate limits** by tracking cumulative usage
- **Maximize token budgets** by seeing how much you've consumed

## Common Patterns

### Pattern 1: Maximize Daily Tokens

**Goal:** Use all your daily free tokens before they reset.

```typescript
// Calculate optimal run count
const daily_tokens = 1_000_000;        // OpenAI free tier
const avg_tokens_per_agent = 6 * 800;  // 6 updates × 800 tokens (7B model)
const num_agents = 20;
const tokens_per_run = num_agents * avg_tokens_per_agent;

const optimal_runs = Math.floor(daily_tokens / tokens_per_run);
// = 1,000,000 / (20 × 4,800) = 10.4 runs

// Run overnight:
npx tsx scripts/monteCarloSimulation.ts \
  --runs=10 \
  --max-months=120 \
  --llm-enabled \
  > logs/mc_overnight_$(date +%Y%m%d).log 2>&1 &
```

### Pattern 2: Multiple Free Accounts

**Goal:** Rotate between multiple free-tier accounts.

```yaml
# llm-providers.yaml
providers:
  - name: openai-account-1
    enabled: true
    priority: 1
    api_key_env: OPENAI_API_KEY_1  # Account 1
    limits:
      tokens_per_day: 1000000

  - name: openai-account-2
    enabled: true
    priority: 2
    api_key_env: OPENAI_API_KEY_2  # Account 2
    limits:
      tokens_per_day: 1000000
```

Set both API keys:
```bash
export OPENAI_API_KEY_1="account_1_key"
export OPENAI_API_KEY_2="account_2_key"
```

System will automatically rotate to account 2 when account 1 is exhausted.

### Pattern 3: Cost-Optimized Development

**Goal:** Use free/cheap providers for development, save paid API credits for production runs.

```yaml
global:
  tier_selection_strategy: prefer-small  # Use smallest models

providers:
  # Free providers first
  - name: groq
    enabled: true
    priority: 1
  - name: openai-free
    enabled: true
    priority: 2

  # Paid providers as fallback (disabled by default)
  - name: openai-paid
    enabled: false  # Enable only for production runs
    priority: 10
```

## Testing

Test your configuration:

```bash
# Test provider loading and model selection
npx tsx scripts/testMultiProvider.ts

# Test with actual API calls (requires API keys)
npx tsx scripts/testLMStudioToolCall.ts
```

## Troubleshooting

### Issue: "No providers available"

**Cause:** All enabled providers have hit their rate/token limits.

**Solution:**
1. Check usage: `manager.printUsageSummary()`
2. Wait for rate limit windows to reset (minute/hour/day)
3. Enable more providers in `llm-providers.yaml`
4. Enable local LM Studio as fallback (no limits)

### Issue: "All requests using large model"

**Cause:** Task complexity classification not working.

**Solution:** Check use case strings match predefined categories:
- `'simple_weight_updates'` → simple (7B)
- `'strategic_planning'` → medium (20B-70B)
- `'extinction_scenarios'` → complex (70B-405B)

### Issue: Token limits hit before request limits

**Cause:** Using large models for simple tasks.

**Solution:**
1. Set `tier_selection_strategy: prefer-small` in global config
2. Ensure simple tasks use `complexity: 'simple'` when calling `getNextProviderWithTier()`

### Issue: Usage not persisting between runs

**Cause:** File not being saved.

**Solution:** Call `manager.saveUsage()` before process exit or every N requests (default: every 10).

## Environment Variables

Required for each enabled provider:

```bash
# Groq (Free Tier)
export GROQ_API_KEY="gsk_..."

# OpenAI (Free 1M tokens)
export OPENAI_API_KEY="sk-..."

# Anthropic (If you have credits)
export ANTHROPIC_API_KEY="sk-ant-..."

# Together.ai (If you have credits)
export TOGETHER_API_KEY="..."

# LM Studio (local - no key needed)
# Just run LM Studio and load a model
```

## API Provider Limits (2025)

| Provider | Free Tier | Requests/Day | Tokens/Day | Notes |
|----------|-----------|--------------|------------|-------|
| **Groq** | ✅ | 14,400 | ~1M (with 8B) | Fastest inference |
| **OpenAI** | ✅ | No limit | 1M | GPT-4o-mini only |
| **Anthropic** | ❌ | N/A | N/A | Requires paid credits |
| **Together.ai** | ❌ | Variable | 5M with $25 credit | Multiple model sizes |
| **LM Studio** | ✅ | No limit | No limit | Local, requires GPU |

## Best Practices

1. **Start with Groq** - Fastest free tier, 14.4K requests/day
2. **Use small models for simple tasks** - 67% more requests per day
3. **Enable multiple providers** - Automatic rotation when limits hit
4. **Track usage** - Check `llm-providers.yaml` usage_tracking section
5. **Test locally first** - Use LM Studio before consuming API credits
6. **Set API keys in .env** - Don't commit keys to git
7. **Monitor provider switches** - Set `log_provider_switches: true`

## Additional Documentation

- **Rate Limiting:** See `docs/LLM_RATE_LIMITING.md` for detailed queue configuration
- **API Integration:** See `src/simulation/llm/client.ts` for API call patterns
- **Provider Manager:** See `src/simulation/llm/providerManager.ts` for implementation details
