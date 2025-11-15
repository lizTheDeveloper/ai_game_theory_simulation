# Citation Crisis Implementation TODO List

**Status:** Approved - Ready for implementation
**Approach:** One task at a time, check off as completed
**Reference:** `CITATION_CRISIS_IMPLEMENTATION_CHECKLIST.md`

---

## Phase 1: Foundation + Fast Memory (Weeks 1-2)
**Priority:** CRITICAL - Must complete before Phase 2

### 1.1 Infrastructure Setup

- [ ] **1.1.1** Create LSS (Local Surprise Signal) monitoring utility
  - Location: `src/utils/lssMonitor.ts`
  - Functions: `checkParameterDrift()`, `checkClaimDeviation()`, `checkMemoryStaleness()`, `checkVerificationSurprise()`
  - Test: Unit tests in `src/utils/__tests__/lssMonitor.test.ts`

- [ ] **1.1.2** Create multi-level state manager
  - Location: `src/utils/multiLevelState.ts`
  - Class: `MultiLevelState` with levels 0-3, update frequency tracking
  - Methods: `update()`, `shouldUpdate()`, `getLevel()`
  - Test: Unit tests for frequency enforcement

- [ ] **1.1.3** Set up TypeScript interfaces for provenance
  - Location: `src/types/provenance.ts`
  - Interfaces: `ParameterProvenance`, `ClaimData`, `VerificationResult`, `TaskMemory`, `SessionSummary`
  - Export all types

### 1.2 Problem 1 - Parameter Tracking (Fast Memory)

- [ ] **1.2.1** Create parameter provenance type system
  - Update: `src/types/provenance.ts`
  - Add: `'PLACEHOLDER' | 'INFORMED' | 'VERIFIED'` type
  - Add: Confidence scores, timestamps, sensitivity scores

- [ ] **1.2.2** Implement `@provenance` decorator for TypeScript
  - Location: `src/decorators/provenance.ts`
  - Function: Mark numeric constants with metadata
  - Example usage in comments

- [ ] **1.2.3** Create ESLint plugin for provenance enforcement
  - Location: `.eslint/plugins/provenance-required.js`
  - Rule: Detect unmarked numeric constants in simulation code
  - Error message: "Parameter requires @provenance annotation"

- [ ] **1.2.4** Add pre-commit hook for parameter validation
  - Location: `.husky/pre-commit-provenance`
  - Check: All PLACEHOLDER params have `needs_validation: true`
  - Check: All VERIFIED params have valid DOI
  - Block commit if violations found

### 1.3 Problem 2 - Claim Extraction (Fast Memory)

- [ ] **1.3.1** Create claim extraction parser
  - Location: `src/citation/claimExtractor.ts`
  - Function: `extractClaims(markdownContent: string): Claim[]`
  - Regex patterns: `[Citation: ...]`, `X increases by Y%`, `According to Z`

- [ ] **1.3.2** Implement structured claim data schema
  - Location: `src/types/claims.ts`
  - Interface: `Claim` with claim_id, text, source, extracted_value, context
  - Add: File path, line number, timestamp

- [ ] **1.3.3** Build claim extraction CLI tool
  - Location: `scripts/extractClaims.ts`
  - Usage: `npx tsx scripts/extractClaims.ts <markdown-file>`
  - Output: JSON file with all extracted claims

- [ ] **1.3.4** Create claim extraction tests
  - Location: `src/citation/__tests__/claimExtractor.test.ts`
  - Test cases: Citations, percentages, definitive statements
  - Edge cases: Malformed citations, missing sources

### 1.4 Problem 3 - Auto-Save Decorator (Fast Memory)

- [ ] **1.4.1** Create auto-save memory middleware
  - Location: `src/agents/middleware/autoSaveMemory.ts`
  - Decorator: `@autoSaveMemory` for tool functions
  - Triggers: Every tool use, state changes, key decisions

- [ ] **1.4.2** Implement micro-memory storage
  - Location: `src/agents/memory/microMemory.ts`
  - Interface: `MicroMemory` with tool, params, result, timestamp
  - Storage: `.claude/agents/memories/<agent>_micro.json`

- [ ] **1.4.3** Add smart batching for memory saves
  - Update: `src/agents/middleware/autoSaveMemory.ts`
  - Logic: Batch every 5 operations, not every single one
  - Background: Async saves don't block workflow

- [ ] **1.4.4** Test auto-save middleware
  - Location: `src/agents/middleware/__tests__/autoSaveMemory.test.ts`
  - Test: Tool use triggers save
  - Test: Batching works correctly
  - Test: No blocking on save

### 1.5 Problem 4 - Claim Detection in Generation (Fast Memory)

- [ ] **1.5.1** Create claim detection utility
  - Location: `src/verification/claimDetector.ts`
  - Function: `detectClaim(tokenStream: string[]): ClaimCandidate | null`
  - Patterns: Numeric assertions, citations, definitive statements

- [ ] **1.5.2** Implement token stream pause logic
  - Location: `src/verification/generationController.ts`
  - Function: `pauseGeneration()` - save state, kv_cache, logits
  - Function: `resumeGeneration()` - restore state, continue

- [ ] **1.5.3** Add claim candidate scoring
  - Update: `src/verification/claimDetector.ts`
  - Score: 0-1 confidence that text needs verification
  - Threshold: >0.7 triggers verification subprocess

---

## Phase 2: Medium Memory + Automation (Weeks 3-4)
**Priority:** HIGH - Core functionality

### 2.1 Problem 1 - Monte Carlo Sensitivity Analysis

- [ ] **2.1.1** Create parameter sweep script
  - Location: `scripts/parameterSweep.ts`
  - Logic: Vary each PLACEHOLDER ±50%, run N=100 simulations
  - Output: Sensitivity scores to `data/sensitivity_analysis.json`

- [ ] **2.1.2** Implement outcome variance measurement
  - Update: `scripts/parameterSweep.ts`
  - Calculate: σ_outcome / μ_outcome for each parameter
  - Classify: HIGH (>10%), MEDIUM (5-10%), LOW (<5%)

- [ ] **2.1.3** Generate sensitivity heatmaps
  - Location: `scripts/generateHeatmap.ts`
  - Library: Use d3.js or plotly
  - Output: PNG heatmap to `reports/sensitivity_heatmap.png`

- [ ] **2.1.4** Auto-update parameter sensitivity scores
  - Update: Parameter provenance JSON files
  - Field: `sensitivity_score: 'HIGH' | 'MEDIUM' | 'LOW'`
  - Trigger: After each Monte Carlo run

### 2.2 Problem 2 - MCP Verification Integration

- [ ] **2.2.1** Set up MCP research tools client
  - Location: `src/mcp/researchClient.ts`
  - Functions: `searchPapers()`, `extractClaim()`, `getCitation()`
  - Config: MCP endpoint URL, API key from env vars

- [ ] **2.2.2** Implement parallel verification workflow
  - Location: `src/citation/verificationPipeline.ts`
  - Queue: Claims awaiting verification
  - Workers: 5 concurrent MCP queries
  - Rate limit: 10 queries/second

- [ ] **2.2.3** Add fuzzy + semantic matching
  - Update: `src/citation/verificationPipeline.ts`
  - Fuzzy: Levenshtein distance < 0.3
  - Semantic: Cosine similarity > 0.8 (use sentence transformers)
  - Return: `{verified, source_match: 'exact' | 'paraphrase' | 'none'}`

- [ ] **2.2.4** Create verification result caching
  - Location: `src/citation/verificationCache.ts`
  - LRU cache: Max 10,000 entries
  - Key: Claim embedding (hash)
  - Value: `VerificationResult`

- [ ] **2.2.5** Test MCP verification pipeline
  - Location: `src/citation/__tests__/verificationPipeline.test.ts`
  - Mock MCP responses
  - Test: Exact match, paraphrase, no match
  - Test: Caching works, rate limiting works

### 2.3 Problem 3 - Task Completion Logging (Medium Memory)

- [ ] **2.3.1** Create task completion detector
  - Location: `src/agents/memory/taskDetector.ts`
  - Signals: "✅", "completed", file write + test pass, git commit
  - Function: `detectTaskCompletion(messages: Message[]): boolean`

- [ ] **2.3.2** Implement structured task memory
  - Location: `src/agents/memory/taskMemory.ts`
  - Interface: `TaskMemory` with description, outcome, tools_used, duration
  - Storage: `.claude/agents/memories/<agent>_tasks.json`

- [ ] **2.3.3** Add task logging middleware
  - Location: `src/agents/middleware/taskLogger.ts`
  - Trigger: Every ~10 tool calls (f = 0.1)
  - Auto-save: Task summary on completion

### 2.4 Problem 4 - Verification Subprocess

- [ ] **2.4.1** Implement verification subprocess spawner
  - Location: `src/verification/verificationSubprocess.ts`
  - Function: `spawnVerification(claim: string): Promise<VerificationResult>`
  - Async: Don't block generation, max 10s timeout

- [ ] **2.4.2** Create claim component extraction
  - Update: `src/verification/verificationSubprocess.ts`
  - Extract: Entity, value, timeframe, source hint
  - Example: "CO2 emissions 2.3% annually [IPCC 2021]" → {entity, value, timeframe, source}

- [ ] **2.4.3** Build MCP query constructor
  - Update: `src/verification/verificationSubprocess.ts`
  - Construct: Natural language query from components
  - Example: "CO2 emissions 2.3% annual IPCC 2021"

---

## Phase 3: Slow Memory + Intelligence (Weeks 5-6)
**Priority:** HIGH - Self-improving systems

### 3.1 Problem 2 - Severity Classifier (Slow Memory)

- [ ] **3.1.1** Define error taxonomy with LSS
  - Location: `src/citation/severityClassifier.ts`
  - Types: FABRICATION (LSS=1.0), MAGNITUDE_ERROR (LSS=deviation), SCOPE_INFLATION, MISATTRIBUTION
  - Penalties: -30, -15, -10, -5 points

- [ ] **3.1.2** Implement associative memory for claims
  - Update: `src/citation/severityClassifier.ts`
  - Memory: Map of claim_embedding → {severity, lss, penalty}
  - Learning: Compress claim→severity patterns

- [ ] **3.1.3** Build self-modification mechanism
  - Update: `src/citation/severityClassifier.ts`
  - Track: Inter-rater reliability (human vs automated)
  - Adjust: Severity weights if reliability < 0.9
  - Update frequency: f = 0.01 (after each grading session)

- [ ] **3.1.4** Create grading history tracker
  - Location: `src/citation/gradingHistory.ts`
  - Store: All grades (automated + manual overrides)
  - Calculate: Cohen's kappa for inter-rater reliability
  - Alert: If reliability drops below 0.9

### 3.2 Problem 3 - Session Summarization (Slow Memory)

- [ ] **3.2.1** Implement LLM-powered summarization
  - Location: `src/agents/memory/sessionSummarizer.ts`
  - Function: `summarizeSession(conversation: Message[]): SessionSummary`
  - LLM prompt: "Extract key learnings from this agent session"

- [ ] **3.2.2** Create structured learning extraction
  - Update: `src/agents/memory/sessionSummarizer.ts`
  - Output: `{main_tasks, learnings, patterns, failures}`
  - De-duplicate: Embedding similarity > 0.9 = same learning

- [ ] **3.2.3** Add auto-categorization for memories
  - Update: `src/agents/memory/sessionSummarizer.ts`
  - Categories: simulation, frontend, testing, research, documentation
  - Link: Related code files, tasks, docs

- [ ] **3.2.4** Set up session summary triggers
  - Location: `src/agents/memory/sessionTriggers.ts`
  - Triggers: Session end, 1-hour idle, explicit command
  - Update frequency: f = 0.01 (every ~100 tool calls)

### 3.3 Problem 4 - Verification Pattern Learning (Slow Memory)

- [ ] **3.3.1** Create verification learner
  - Location: `src/verification/verificationLearner.ts`
  - Class: `VerificationLearner` with memory of claim_pattern → decision
  - History: Track (claim, verified, caught_error)

- [ ] **3.3.2** Implement pattern extraction
  - Update: `src/verification/verificationLearner.ts`
  - Function: `extractPattern(claim: string): string`
  - Patterns: "numeric_climate_claim", "ai_capability_claim", etc.

- [ ] **3.3.3** Build cost-benefit analysis
  - Update: `src/verification/verificationLearner.ts`
  - Calculate: error_rate per pattern, avg_cost per verification
  - Decision: Verify if error_rate > 5% OR high-stakes claim

- [ ] **3.3.4** Add meta-learning update loop
  - Update: `src/verification/verificationLearner.ts`
  - Update frequency: f = 0.01 (every 100 verifications)
  - Adjust: Verification thresholds based on history

### 3.4 Problem 1 - Parameter Drift Monitoring

- [ ] **3.4.1** Implement drift detection
  - Location: `src/utils/parameterDriftMonitor.ts`
  - Function: `checkDrift(param: ParameterProvenance): boolean`
  - LSS: |current - cited| / cited
  - Threshold: > 0.2 (20% drift)

- [ ] **3.4.2** Create automated re-validation workflow
  - Update: `src/utils/parameterDriftMonitor.ts`
  - High LSS → Create GitHub issue with citation link
  - Block deployment if critical parameter drifted

- [ ] **3.4.3** Add drift monitoring dashboard
  - Location: `src/monitoring/driftDashboard.ts`
  - Display: Parameters with high drift, last validated time
  - Alert: Email/Slack notification for critical drift

---

## Phase 4: Advanced Features + Optimization (Weeks 7-8)
**Priority:** MEDIUM - Enhanced capabilities

### 4.1 Problem 4 - Backtracking Mechanism

- [ ] **4.1.1** Implement claim revision logic
  - Location: `src/verification/claimRevision.ts`
  - Function: `reviseClaim(original: string, verification: VerificationResult): string`
  - Options: Remove, weaken, use alternative

- [ ] **4.1.2** Build reasoning coherence maintainer
  - Update: `src/verification/claimRevision.ts`
  - Cache: Original claim for context
  - Adjust: Downstream reasoning if claim changes
  - Example: "5°C" → "1.1°C" also adjusts impact statements

- [ ] **4.1.3** Create transition smoothing
  - Update: `src/verification/claimRevision.ts`
  - Use LLM mini-loop to smooth transitions
  - Example: "Therefore" → "However" if claim weakened

### 4.2 Problem 3 - Memory Health Dashboard

- [ ] **4.2.1** Create memory health monitoring UI
  - Location: `src/monitoring/memoryHealthDashboard.tsx` (if web) or CLI
  - Display: Per-agent status (last save, memory size, staleness)
  - Update: Real-time or refresh every 30s

- [ ] **4.2.2** Add staleness alerts
  - Update: `src/monitoring/memoryHealthDashboard.tsx`
  - Alert: Memory >24hrs stale
  - Alert: Session >2hr without save
  - Color coding: Green (fresh), Yellow (warning), Red (stale)

- [ ] **4.2.3** Implement memory coverage metrics
  - Update: `src/monitoring/memoryHealthDashboard.tsx`
  - Calculate: % of tasks documented
  - Display: Memory size growth over time

### 4.3 Performance Optimization

- [ ] **4.3.1** Add verification result caching (if not done in 2.2.4)
  - Already planned in Phase 2.2.4, verify implemented

- [ ] **4.3.2** Implement prefetching for likely claims
  - Location: `src/verification/prefetcher.ts`
  - Predict: Next likely claim based on context
  - Pre-query: MCP in background while generating

- [ ] **4.3.3** Add verification timeouts
  - Update: All verification functions
  - Timeout: 10 seconds max
  - Fallback: Flag as UNVERIFIED, don't block

- [ ] **4.3.4** Create whitelist for common knowledge
  - Location: `data/verification_whitelist.json`
  - Examples: "Earth orbits the Sun", basic math facts
  - Skip verification for whitelisted claims

### 4.4 Context Flow Tracing

- [ ] **4.4.1** Implement trace logging
  - Location: `src/utils/contextFlowTracer.ts`
  - Log: Input → Level 0 → Level 1 → Level 2 → Output
  - Format: JSON with timestamps, level transitions

- [ ] **4.4.2** Create visualization tool
  - Location: `scripts/visualizeContextFlow.ts`
  - Input: Trace log JSON
  - Output: Mermaid diagram or D3.js visualization

---

## Phase 5: Validation + Security Audit (Week 9)
**Priority:** CRITICAL - Production readiness

### 5.1 Benchmarking

- [ ] **5.1.1** Create test corpus (1000+ claims)
  - Location: `data/test_corpus/`
  - Mix: Verified, fabrications, paraphrases, edge cases
  - Domains: Climate, AI, economics, social science
  - Format: JSON with ground truth labels

- [ ] **5.1.2** Generate gold standard labels
  - Process: 3 human reviewers per claim
  - Calculate: Cohen's kappa > 0.8
  - Store: `data/test_corpus/gold_standard.json`

- [ ] **5.1.3** Run performance benchmarks
  - Script: `scripts/runBenchmarks.ts`
  - Metrics: Fabrication rate, latency (mean/p95/p99), false positive rate, recall
  - Output: `reports/benchmark_results.json`

- [ ] **5.1.4** A/B test verification system
  - Baseline: No verification
  - Treatment: Verification enabled
  - Compare: Fabrication rate, user trust, task completion time

### 5.2 OWASP Security Audit

- [ ] **5.2.1** A01 - Access control audit
  - Check: RBAC implemented for level transitions
  - Check: File permissions enforce read-only where needed
  - Test: Attempt unauthorized level access

- [ ] **5.2.2** A02 - Cryptographic review
  - Check: TLS 1.3+ for all API calls
  - Check: API keys encrypted with AES-256
  - Check: Secrets manager configured (Vault/AWS)

- [ ] **5.2.3** A03 - Injection testing
  - Test: SQL injection (if using DB)
  - Test: Command injection in claim extraction
  - Test: Prompt injection in MCP queries
  - Tool: Use OWASP ZAP or Burp Suite

- [ ] **5.2.4** A04 - Threat modeling
  - Create: Threat model diagram (STRIDE methodology)
  - Identify: Attack surfaces, trust boundaries
  - Document: `docs/security/threat_model.md`

- [ ] **5.2.5** A05 - Configuration review
  - Check: Secure defaults in production
  - Check: Debug logging disabled
  - Check: HTTPS only, strict CORS

- [ ] **5.2.6** A06 - Dependency scan
  - Run: `npm audit`
  - Run: Snyk scan
  - Fix: All HIGH/CRITICAL vulnerabilities

- [ ] **5.2.7** A07 - Authentication audit
  - Check: API key rotation policy (90 days)
  - Check: Session timeouts configured
  - Check: MFA enabled for admin

- [ ] **5.2.8** A08 - Integrity checks
  - Check: DOI validation implemented
  - Check: SHA-256 checksums for downloads
  - Check: JSON schema validation for MCP responses

- [ ] **5.2.9** A09 - Logging audit
  - Check: All security events logged
  - Check: Centralized logging configured
  - Check: 90-day retention policy

- [ ] **5.2.10** A10 - SSRF testing
  - Check: URL whitelist enforced
  - Check: Internal IP blacklist active
  - Test: Attempt localhost/private IP access

### 5.3 Safe AI Principles Validation

- [ ] **5.3.1** Transparency audit
  - Verify: All LSS scores visible in outputs
  - Verify: Source citations linked
  - Verify: Decision reasoning documented

- [ ] **5.3.2** Robustness testing
  - Test: Graceful degradation when Level 1 fails
  - Test: Fallback behavior when MCP unavailable
  - Test: Recovery from save failures

- [ ] **5.3.3** Fairness validation
  - Test: Classifier on diverse claim types
  - Measure: Performance across domains
  - Check: No bias against unconventional sources

- [ ] **5.3.4** Privacy compliance
  - Verify: PII redaction working
  - Verify: API key sanitization
  - Verify: 90-day retention policy

### 5.4 Load Testing

- [ ] **5.4.1** Parameter system load test
  - Test: 100+ parameters with concurrent access
  - Measure: Drift detection performance
  - Target: <100ms per parameter check

- [ ] **5.4.2** Claim verification load test
  - Test: 1000+ claims in batch
  - Measure: Verification throughput
  - Target: >100 claims/minute

- [ ] **5.4.3** Memory system load test
  - Test: 1000+ tool calls in session
  - Measure: Save latency, memory growth
  - Target: <50ms per save, linear growth

---

## Success Criteria (Final Validation)

### Problem 1: Unsourced Parameters
- [ ] All parameters have provenance annotations
- [ ] <5% cognitive overhead for developers
- [ ] <5% parameters with high drift
- [ ] Linter blocks all unmarked parameters

### Problem 2: Grade Inflation
- [ ] Inter-rater reliability ≥0.9
- [ ] Detects 100% of fabrications in test corpus
- [ ] False positive rate <5%
- [ ] Classifier accuracy improves over time

### Problem 3: Memory Discipline
- [ ] 100% task→memory correlation
- [ ] Zero amnesia over 30-day test
- [ ] <10% cognitive overhead
- [ ] All 4 memory levels operational

### Problem 4: Inference-Time Verification
- [ ] Fabrication rate <1%
- [ ] p95 latency <10s/claim
- [ ] False positive rate <5%
- [ ] Pattern learner reduces verification costs

### Nested Learning Metrics
- [ ] Update frequency hierarchy maintained (f_L0 > f_L1 > f_L2 > f_L3)
- [ ] LSS monitoring active and alerting
- [ ] Memory grows sublinearly with data
- [ ] No cross-level gradient contamination

---

## How to Use This TODO List

1. **Work sequentially** - Complete Phase 1 before Phase 2
2. **Check off items** - Mark with `[x]` when done
3. **Commit after each item** - Small, atomic commits
4. **Test as you go** - Don't defer testing to the end
5. **Update this file** - If you discover new tasks, add them
6. **Track blockers** - Note any blocked items with reason

**Current Phase:** Phase 1 (Foundation)
**Next Task:** 1.1.1 - Create LSS monitoring utility

**Ready to start?** Let me know when you want to begin implementation!
