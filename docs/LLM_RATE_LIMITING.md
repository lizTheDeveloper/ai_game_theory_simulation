# LLM Rate Limiting & Queue Configuration

The LLM policy optimization system includes a semaphore-based request queue with rate limiting to manage API constraints and maximize token usage efficiency.

## Overview

**Key Features:**
- **Concurrency Control**: Limit simultaneous requests (semaphore)
- **Rate Limiting**: Enforce requests per minute/hour/day limits
- **Automatic Retries**: Retry failed requests with exponential backoff
- **Backpressure Management**: Queue requests when at capacity
- **Statistics Tracking**: Monitor request success/failure rates

## Configuration

Add `queue` settings to your `llmConfig`:

```typescript
const llmConfig = {
  enabled: true,
  provider: 'openai', // or 'anthropic', 'lm-studio', etc.
  apiEndpoint: 'https://api.openai.com/v1/chat/completions',
  modelName: 'gpt-4',
  queue: {
    maxConcurrent: 5,           // Max 5 simultaneous requests
    maxRequestsPerMinute: 50,   // 50 requests/minute
    maxRequestsPerHour: 1000,   // 1000 requests/hour
    maxRequestsPerDay: 10000,   // 10K requests/day
    retryOnFailure: true,       // Retry failed requests
    maxRetries: 3               // Up to 3 retries
  }
};
```

## Provider-Specific Configurations

### Grok API (Free Tier)

Grok offers free API access with daily token limits. This configuration maximizes token usage:

```typescript
queue: {
  maxConcurrent: 3,           // Balance speed vs rate limits
  maxRequestsPerMinute: 20,   // Conservative to avoid rate limit errors
  maxRequestsPerHour: 500,
  maxRequestsPerDay: 5000,    // Typical free tier limit
  retryOnFailure: true,
  maxRetries: 3
}
```

**Usage Pattern:**
- Run Monte Carlo overnight to consume all daily tokens
- Queue ensures you hit exactly your limit without waste
- Retries handle temporary network issues

### OpenAI Free Tier

OpenAI free tier has strict rate limits:

```typescript
queue: {
  maxConcurrent: 1,           // Sequential only for free tier
  maxRequestsPerMinute: 3,    // Free tier limit
  maxRequestsPerHour: 200,
  maxRequestsPerDay: 0,       // No daily limit
  retryOnFailure: true,
  maxRetries: 5               // More retries for strict limits
}
```

### Anthropic Claude API

Claude has moderate rate limits:

```typescript
queue: {
  maxConcurrent: 5,
  maxRequestsPerMinute: 50,   // Tier 1 limit
  maxRequestsPerHour: 1000,
  maxRequestsPerDay: 0,
  retryOnFailure: true,
  maxRetries: 3
}
```

### LM Studio (Local)

No rate limits for local inference:

```typescript
queue: {
  maxConcurrent: 1,           // Sequential to avoid memory issues
  maxRequestsPerMinute: 0,    // No limit
  maxRequestsPerHour: 0,
  maxRequestsPerDay: 0,
  retryOnFailure: true,
  maxRetries: 2               // Fewer retries (local is stable)
}
```

**Note:** Even with no rate limits, `maxConcurrent: 1` is recommended for local models to avoid GPU memory exhaustion.

## Monte Carlo Usage Patterns

### Maximize Daily Token Usage

For APIs with daily limits (e.g., Grok free tier):

```bash
# Calculate runs to hit daily limit
# Example: 5000 requests/day, 20 agents, 6 updates per agent = 41 runs
npx tsx scripts/monteCarloSimulation.ts \
  --runs=40 \
  --max-months=120 \
  --llm-enabled \
  > logs/mc_grok_daily_$(date +%Y%m%d).log 2>&1 &
```

**Formula:** `daily_limit / (num_agents * avg_updates_per_agent)`

### Multiple Free Tier Accounts

Rotate between accounts by switching API keys:

```typescript
// Account 1 (morning)
llmConfig.apiEndpoint = 'https://api.provider.com/v1';
llmConfig.apiKey = process.env.API_KEY_1;

// Account 2 (afternoon)
llmConfig.apiKey = process.env.API_KEY_2;
```

Queue stats help track usage per account:

```typescript
import { getLLMQueueStats } from './simulation/llm/client';

const stats = getLLMQueueStats();
console.log(`Requests today: ${stats.rateLimitStatus.day}`);
```

## Monitoring Queue Status

### Get Statistics

```typescript
import { getLLMQueueStats } from './simulation/llm/client';

const stats = getLLMQueueStats();
console.log(stats);
// {
//   totalRequests: 120,
//   successfulRequests: 115,
//   failedRequests: 5,
//   retriedRequests: 8,
//   queuedRequests: 3,
//   activeRequests: 2,
//   pendingRequests: 1,
//   rateLimitHits: 2,
//   rateLimitStatus: {
//     minute: '18/20',
//     hour: '450/500',
//     day: '4500/5000'
//   }
// }
```

### Reset Between Runs

```typescript
import { resetLLMQueue } from './simulation/llm/client';

// Clear queue before new Monte Carlo run
resetLLMQueue();
```

### Wait for Completion

```typescript
import { drainLLMQueue } from './simulation/llm/client';

// Wait for all requests to finish
await drainLLMQueue();
console.log('All LLM requests completed');
```

## Advanced Patterns

### Dynamic Rate Adjustment

Adjust rates based on time of day:

```typescript
const isOffPeak = new Date().getHours() < 8 || new Date().getHours() > 20;

queue: {
  maxConcurrent: isOffPeak ? 10 : 5,
  maxRequestsPerMinute: isOffPeak ? 100 : 50
}
```

### Token Budget Optimization

Align queue limits with token budgets:

```typescript
// If agents have 30K token budget and each update costs 1200 tokens:
// 30K / 1200 = 25 updates per agent
// With 20 agents = 500 total updates per run
// Set daily limit to match: maxRequestsPerDay: 500
```

### Comparative Testing

Test with/without rate limits:

```bash
# Control (no limits)
npx tsx scripts/monteCarloSimulation.ts --runs=10 --max-months=120

# With Grok limits
npx tsx scripts/monteCarloSimulation.ts --runs=10 --max-months=120 --llm-enabled
```

## Troubleshooting

### Issue: Requests Queuing Forever

**Cause:** Rate limit set too low for workload

**Solution:** Increase `maxRequestsPerMinute` or reduce agent count

### Issue: Rate Limit Errors Still Occurring

**Cause:** API provider has stricter limits than configured

**Solution:** Lower your configured limits by 20%:

```typescript
maxRequestsPerMinute: 40  // Instead of 50
```

### Issue: Slow Simulation

**Cause:** Sequential processing (`maxConcurrent: 1`)

**Solution:** Increase concurrency if API allows:

```typescript
maxConcurrent: 3  // Parallel requests
```

### Issue: Memory Exhaustion (Local Models)

**Cause:** Too many concurrent requests for GPU memory

**Solution:** Keep `maxConcurrent: 1` for local models

## Best Practices

1. **Start Conservative**: Begin with low limits, increase gradually
2. **Monitor Stats**: Check `getLLMQueueStats()` regularly
3. **Use Retries**: Enable `retryOnFailure` for production
4. **Account for Retries**: Retries count toward rate limits
5. **Test Locally First**: Validate logic before using paid APIs
6. **Reset Between Runs**: Call `resetLLMQueue()` before new simulations
7. **Drain Before Exit**: Call `drainLLMQueue()` to ensure completion

## Example: Overnight Grok Run

```bash
#!/bin/bash
# overnight_grok_run.sh

# Grok free tier: 5000 requests/day
# 20 agents × ~6 updates = ~120 requests per run
# 5000 / 120 = 41 runs per day

npx tsx scripts/monteCarloSimulation.ts \
  --runs=41 \
  --max-months=120 \
  --llm-enabled \
  > logs/mc_grok_$(date +%Y%m%d).log 2>&1 &

PID=$!
echo "Started Monte Carlo (PID: $PID)"
echo "Consuming Grok free tier tokens overnight..."
echo "Check logs/mc_grok_$(date +%Y%m%d).log for progress"
```

Run every night to maximize free token usage!
