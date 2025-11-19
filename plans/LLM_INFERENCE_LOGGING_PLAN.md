# LLM Inference Logging & GCS Export - Implementation Plan

**Feature ID:** #22 (from roadmap)
**Created:** 2025-11-18
**Status:** Research Phase

## Overview

Add complete audit trail of all LLM inference calls with Google Cloud Storage export for backup, analytics, and compliance.

## Business Context

- **Debugging:** Reproduce exact LLM decisions that led to specific simulation outcomes
- **Analytics:** Analyze prompt engineering effectiveness, model behavior patterns
- **Compliance:** Full audit trail for research reproducibility
- **Prompt Optimization:** Identify which prompts lead to better agent strategies
- **Research Value:** Dataset of strategic AI decision-making under various conditions

## Current State

### Existing LLM Infrastructure

1. **LLM Integration** (`/src/simulation/llm/`)
   - `client.ts` (515 lines): API calls to LM Studio/OpenAI/Anthropic
   - `integration.ts` (367 lines): Weight update orchestration
   - `queue.ts` (299 lines): Request queueing and rate limiting
   - `providerManager.ts` (532 lines): Multi-provider support
   - `config.ts` (312 lines): Configuration logic

2. **Call Flow:**
   ```
   LLMWeightUpdatePhase (monthly)
   → checkAndUpdateAgentWeights() [integration.ts]
   → updateWeightsWithLLM() [client.ts]
   → callLLMAPI() [client.ts] ← **INJECT LOGGING HERE**
   → fetch(apiEndpoint, requestBody)
   ```

3. **Existing Database:** IndexedDB (`/src/lib/eventDatabase.ts`)
   - Already stores simulation events and state snapshots
   - 3 object stores: events, simulations, simulation_metadata
   - Version migration support, storage quota management

## Architecture Decision

### Option Analysis

**Option 1: Server-side Database (Prisma + PostgreSQL)**
- ❌ Requires database hosting (Supabase/Vercel Postgres)
- ❌ Adds infrastructure complexity
- ❌ Simulation can't run offline
- ✅ Powerful querying capabilities

**Option 2: Direct-to-GCS**
- ❌ No local querying for debugging
- ❌ Requires GCS connection during simulation
- ❌ Harder to analyze logs during development
- ✅ Simplest infrastructure

**Option 3: IndexedDB + GCS Export (CHOSEN)**
- ✅ Minimal infrastructure (no hosted DB)
- ✅ Works offline (simulation runs locally)
- ✅ Consistent with existing code patterns
- ✅ Browser-based analytics via IndexedDB queries
- ✅ GCS export for long-term backup/analytics
- ✅ Simple periodic export pattern

### Chosen Architecture: IndexedDB + GCS Export

**Rationale:**
1. Project already uses IndexedDB for events/state (proven pattern)
2. Simulation runs locally in browser (Next.js dev mode)
3. No need for real-time querying (export is for backup/analytics)
4. Keeps infrastructure simple (research tool, not production app)

## Database Schema

### IndexedDB Object Store: `llm_inference_logs`

```typescript
interface LLMInferenceLog {
  // Identity
  id: string;                    // Unique: `${simulationId}_${month}_${agentId}_${timestamp}`
  simulationId: string;          // Group by simulation run

  // Timing
  timestamp: number;             // Real-world Unix timestamp (ms)
  month: number;                 // Simulation month
  durationMs: number;            // API call duration

  // Agent Context
  agentId: string;               // AI agent ID
  agentName: string;             // AI agent name
  agentCapability: number;       // Capability at time of call
  agentAlignment: number;        // Alignment at time of call
  triggerReason: string;         // 'scheduled' | 'threshold' | 'crisis' | 'initial'

  // Request Data
  requestPrompt: string;         // Full context string sent to LLM
  requestBody: object;           // Full request JSON (messages, tools, temperature, etc.)
  provider: string;              // 'lm-studio' | 'openai' | 'anthropic'
  modelName: string;             // Model identifier (e.g., "qwen3-32b")

  // Response Data
  responseBody: object;          // Full response JSON
  tokensUsed: number;            // Token count from response
  weights: object;               // Parsed weights from tool call
  reasoning: string;             // LLM's reasoning text

  // Error Handling
  error?: string;                // Error message if call failed
  usedFallback: boolean;         // True if fallback weights were used

  // GCS Export Tracking
  exportedToGCS: boolean;        // Has this been exported?
  exportTimestamp?: number;      // When it was exported
  gcsPath?: string;              // GCS blob path
}
```

### Indexes

```typescript
// Primary key
{ keyPath: 'id' }

// Query by simulation run
index('simulationId', 'simulationId', { unique: false })

// Query by agent
index('agentId', 'agentId', { unique: false })

// Query by timestamp (for export batching)
index('timestamp', 'timestamp', { unique: false })

// Query unexported logs
index('exportedToGCS', 'exportedToGCS', { unique: false })

// Composite: simulation + month
index('simId_month', ['simulationId', 'month'], { unique: false })
```

## Implementation Phases

### Phase 1: Extend IndexedDB Schema
**File:** `/src/lib/eventDatabase.ts`

- Add `llm_inference_logs` object store (DB_VERSION = 3)
- Add indexes for efficient querying
- Add `addLLMLog()` method
- Add `getLLMLogs()` method (paginated)
- Add `getUnexportedLogs()` method
- Add `markAsExported()` method

### Phase 2: Create Logging Module
**File:** `/src/simulation/llm/logging.ts` (new)

```typescript
export interface LoggingContext {
  simulationId: string;
  month: number;
  agentId: string;
  agentName: string;
  agentCapability: number;
  agentAlignment: number;
  triggerReason: string;
}

export async function logLLMInference(
  context: LoggingContext,
  request: { prompt: string; body: object; provider: string; model: string },
  response: { body: object; tokensUsed: number; weights: object; reasoning: string },
  timing: { startTime: number; endTime: number },
  error?: string
): Promise<void>;
```

### Phase 3: Instrument LLM Client
**File:** `/src/simulation/llm/client.ts`

Modify `updateWeightsWithLLM()` and `callLLMAPI()`:
1. Capture start time before API call
2. Capture end time after response
3. Call `logLLMInference()` with full context
4. Handle errors (log failed calls too)

### Phase 4: GCS Export Module
**File:** `/src/lib/gcsExport.ts` (new)

**Dependencies:**
```json
{
  "@google-cloud/storage": "^7.x"
}
```

**Features:**
- Authenticate via service account or ADC
- Export logs in batches (e.g., 1000 at a time)
- Format: JSONL (one JSON object per line)
- Naming: `llm-logs/${simulationId}/${YYYY-MM-DD}/batch-${timestamp}.jsonl`
- Mark exported logs in IndexedDB
- Error handling with retry logic

### Phase 5: Background Export Job
**File:** `/src/app/api/export-llm-logs/route.ts` (Next.js API route)

**Options:**

**A) Manual Trigger (Simpler, for MVP)**
- API route that exports on-demand
- UI button to trigger export
- Progress feedback via streaming response

**B) Cron Job (Future Enhancement)**
- Use Vercel Cron or cron-job.org
- Auto-export every 24 hours
- Email notification on completion/errors

**Start with Option A, migrate to B later.**

### Phase 6: Testing

**Unit Tests:**
- `eventDatabase.test.ts`: IndexedDB CRUD for LLM logs
- `logging.test.ts`: Log formatting, context extraction
- `gcsExport.test.ts`: Batch export logic, JSONL formatting

**Integration Tests:**
- Full pipeline: LLM call → IndexedDB → GCS export
- Error scenarios: Failed API call logged, export retry
- Export idempotency: Re-exporting doesn't duplicate

### Phase 7: UI Integration (Optional)

**Dashboard Panel:**
- Show count of logged inferences for current simulation
- Show count of unexported logs
- "Export to GCS" button
- Export progress indicator

## Configuration

### Environment Variables

```bash
# Google Cloud Storage
GCS_BUCKET_NAME=simulation-llm-logs
GCS_PROJECT_ID=your-project-id

# Auth (choose one)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
# OR use Application Default Credentials (gcloud auth login)
```

### GCS Bucket Setup

```bash
# Create bucket
gsutil mb -p your-project-id -c STANDARD -l us-central1 gs://simulation-llm-logs

# Set lifecycle policy (auto-delete after 1 year)
gsutil lifecycle set lifecycle.json gs://simulation-llm-logs
```

**lifecycle.json:**
```json
{
  "lifecycle": {
    "rule": [
      {
        "action": { "type": "Delete" },
        "condition": { "age": 365 }
      }
    ]
  }
}
```

## Success Criteria

1. ✅ All LLM API calls logged to IndexedDB (prompt, response, metadata)
2. ✅ No performance degradation (logging is async, non-blocking)
3. ✅ Export to GCS working (manual trigger for MVP)
4. ✅ Logs queryable in IndexedDB for debugging
5. ✅ Test coverage >80% for new modules
6. ✅ Documentation updated (wiki + inline comments)

## Open Questions

1. **GCS Authentication:** Service account JSON vs ADC? (Recommend: Service account for CI/CD)
2. **Export Frequency:** Manual vs auto-cron? (Start manual, add cron later)
3. **Log Retention:** How long to keep logs in IndexedDB? (Recommend: 30 days, then GCS-only)
4. **Export Format:** JSONL vs CSV vs Parquet? (JSONL for MVP, Parquet for analytics later)

## Non-Goals (Out of Scope)

- ❌ Real-time analytics dashboard (future enhancement)
- ❌ Log aggregation across multiple simulations (GCS + BigQuery later)
- ❌ Automatic prompt optimization based on logs (future AI feature)
- ❌ Cost tracking per LLM call (add later if needed)

## Next Steps

1. **Research Validation:** Have `research-skeptic` review this architecture
2. **Implementation:** Spawn `simulation-maintainer` for IndexedDB + logging
3. **GCS Integration:** Research GCS SDK patterns, add export module
4. **Testing:** Comprehensive test suite
5. **Review:** Architecture skeptic + senior dev reviewer
6. **Documentation:** Update wiki

## References

- IndexedDB API: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
- Google Cloud Storage Node.js: https://cloud.google.com/storage/docs/reference/libraries#client-libraries-install-nodejs
- Next.js API Routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
