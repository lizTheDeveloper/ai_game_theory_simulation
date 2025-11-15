# Agent Assignment: Citation Crisis Implementation (REVISED)

**Status:** Revised - Respects existing agents, follows onboarding protocol
**Reference:** `TODO_CITATION_CRISIS.md`

---

## Existing Agent Discovery

### citation-verifier (EXISTING)
**File:** `.claude/agents/citation-verifier.md`
**Already handles:**
- Citation extraction and database verification
- PDF downloading and reading
- Claim verification against paper content
- Evidence quotation and contradiction detection

**This agent covers:**
- Problem 2: MCP verification pipeline (parts of 2.2)
- Problem 4: Claim verification subprocess (parts of 2.4, 4.1)

### Other Relevant Existing Agents
- `priya` - Monte Carlo, statistical validation
- `feature-implementer` - Infrastructure implementation
- `architecture-skeptic` - Architecture review

---

## What's STILL Needed

After accounting for `citation-verifier`, we still need:

### Systems Engineering Work
1. **Parameter provenance SYSTEM** (Problem 1) - Not just verification, but tracking system
2. **Grading automation SYSTEM** (Problem 2) - Severity classifier, rubric calculator
3. **Memory infrastructure** (Problem 3) - Auto-save middleware, multi-level consolidation
4. **Inference-time architecture** (Problem 4) - Pause-verify-continue infrastructure
5. **OWASP security** (All problems) - Applying security controls
6. **Nested Learning infrastructure** (All problems) - Multi-level state manager, LSS monitoring

**Gap:** No existing agent builds **academic integrity systems**. The `citation-verifier` USES systems, but doesn't BUILD them.

---

## Proposed Solution: Create ONE New Agent

### New Agent: `academic-systems-engineer`

**Agent ID:** `academic-sys-eng-001`
**Memory File:** `.claude/agents/memories/academic-systems-memory.json`

**Domain Expertise:**
- Building systems for academic rigor and research integrity
- OWASP security controls implementation
- Educational automation (grading systems, rubric calculators)
- Multi-level state architecture (Nested Learning infrastructure)
- Infrastructure engineering (NOT end-user verification)

**Strictly Does NOT Do** (Respecting Existing Agents):
- ❌ Actual paper verification (that's `citation-verifier`)
- ❌ Paper discovery (that's `super-alignment-researcher`)
- ❌ Research critique (that's `research-skeptic`)
- ❌ Statistical validation (that's `priya`)
- ❌ Architecture review (that's `architecture-skeptic`)
- ❌ Documentation writing (that's `wiki-documentation-updater`)
- ❌ Simulation code (that's `simulation-maintainer`)
- ❌ Frontend/UI (that's `far-future-ux-designer`)

**What This Agent BUILDS:**
- ✅ Parameter provenance tracking system (type system, decorators, linters)
- ✅ Grading automation system (severity classifier, LSS calculator, rubric engine)
- ✅ Memory infrastructure (auto-save middleware, multi-level consolidation)
- ✅ Verification architecture (pause-verify-continue infrastructure)
- ✅ OWASP security layer (input validation, encryption setup, RBAC)
- ✅ Nested Learning infrastructure (multi-level state manager, LSS monitor)

**Collaborates By:**
- Handing off verification work to `citation-verifier`
- Requesting Monte Carlo validation from `priya`
- Requesting cross-cutting infrastructure from `feature-implementer`
- Submitting systems for review to `architecture-skeptic`

**Personality:**
- Systems thinker - builds infrastructure, not end products
- Security-minded - OWASP controls first, not afterthought
- Academic rigor - evidence-based, fail loudly
- Pragmatic - simple solutions over clever ones

---

## Revised Task Assignment

### Phase 1: Foundation + Fast Memory

#### 1.1-1.3, 1.5 - Core Infrastructure
**Agent:** `academic-systems-engineer` (NEW)
- ✅ 1.1.1-1.1.3 - LSS monitor, multi-level state, provenance types
- ✅ 1.2.1-1.2.4 - Parameter provenance system (decorator, linter, pre-commit hook)
- ✅ 1.3.1-1.3.4 - Claim extraction parser (feeds to `citation-verifier`)
- ✅ 1.5.1-1.5.3 - Claim detection utility (inference-time infrastructure)

#### 1.4 - Cross-Cutting Memory Infrastructure
**Agent:** `feature-implementer` (EXISTING)
- ✅ 1.4.1-1.4.4 - Auto-save middleware (benefits all agents)

---

### Phase 2: Medium Memory + Automation

#### 2.1 - Monte Carlo Sensitivity
**Agent:** `priya` (EXISTING)
- ✅ 2.1.1-2.1.4 - Parameter sweep, variance measurement, sensitivity heatmaps

#### 2.2 - MCP Verification Integration
**Split between agents:**

**2.2.1-2.2.2 - System architecture:**
**Agent:** `academic-systems-engineer` (NEW)
- ✅ Set up MCP client wrapper
- ✅ Implement parallel verification queue/workers

**2.2.3-2.2.5 - Actual verification:**
**Agent:** `citation-verifier` (EXISTING)
- ✅ Fuzzy + semantic matching (already has this expertise)
- ✅ Verification caching
- ✅ Test verification pipeline

#### 2.3 - Task Completion Logging
**Agent:** `feature-implementer` (EXISTING)
- ✅ 2.3.1-2.3.3 - Task detector, task memory, logging middleware (cross-cutting)

#### 2.4 - Verification Subprocess Architecture
**Split:**

**2.4.1 - Subprocess spawner:**
**Agent:** `academic-systems-engineer` (NEW)
- ✅ Async spawner infrastructure (10s timeout, error handling)

**2.4.2-2.4.3 - Claim processing:**
**Agent:** `citation-verifier` (EXISTING)
- ✅ Claim component extraction (already does claim extraction)
- ✅ MCP query construction

---

### Phase 3: Slow Memory + Intelligence

#### 3.1 - Severity Classifier
**Agent:** `academic-systems-engineer` (NEW)
- ✅ 3.1.1-3.1.4 - Error taxonomy, associative memory, self-modification, grading history

**Note:** Uses verification results FROM `citation-verifier`, but builds the classifier system

#### 3.2 - Session Summarization
**Agent:** `feature-implementer` (EXISTING)
- ✅ 3.2.1-3.2.4 - LLM summarization, learning extraction, categorization, triggers

#### 3.3 - Verification Pattern Learning
**Agent:** `academic-systems-engineer` (NEW)
- ✅ 3.3.1-3.3.4 - Pattern learner, cost-benefit analysis, meta-learning

**Note:** Learns WHICH claims to send to `citation-verifier`, not how to verify

#### 3.4 - Parameter Drift Monitoring
**Agent:** `academic-systems-engineer` (NEW)
- ✅ 3.4.1-3.4.3 - Drift detection, re-validation workflow, drift dashboard

---

### Phase 4: Advanced Features

#### 4.1 - Backtracking Mechanism
**Split:**

**4.1.1 - Claim revision logic:**
**Agent:** `citation-verifier` (EXISTING)
- ✅ Knows how to revise claims based on verification results

**4.1.2-4.1.3 - Reasoning coherence:**
**Agent:** `academic-systems-engineer` (NEW)
- ✅ Maintains coherence in multi-claim contexts
- ✅ Transition smoothing infrastructure

#### 4.2 - Memory Health Dashboard
**Agent:** `far-future-ux-designer` (EXISTING)
- ✅ 4.2.1-4.2.3 - UI for memory health monitoring

**Backend data from:** `feature-implementer`

#### 4.3 - Performance Optimization
**Agent:** `academic-systems-engineer` (NEW)
- ✅ 4.3.1-4.3.4 - Caching verification, prefetching, timeouts, whitelists

#### 4.4 - Context Flow Tracing
**Agent:** `academic-systems-engineer` (NEW)
- ✅ 4.4.1 - Trace logging infrastructure
- ✅ 4.4.2 - Visualization tool (delegates complex viz to `far-future-ux-designer`)

---

### Phase 5: Validation + Security Audit

#### 5.1 - Benchmarking
**Split:**

**5.1.1-5.1.2 - Test corpus:**
**Agent:** `citation-verifier` (EXISTING)
- ✅ Create test corpus, generate gold standard labels (domain expertise)

**5.1.3 - Benchmarks:**
**Agent:** `priya` (EXISTING)
- ✅ Statistical analysis of performance

**5.1.4 - A/B testing:**
**Agent:** `academic-systems-engineer` (NEW)
- ✅ Infrastructure for A/B test

#### 5.2 - OWASP Security Audit
**Agent:** `academic-systems-engineer` (NEW)
- ✅ 5.2.1-5.2.10 - All OWASP audits (security engineering is core expertise)

#### 5.3 - Safe AI Validation
**Split:**

**5.3.1-5.3.2, 5.3.4:**
**Agent:** `academic-systems-engineer` (NEW)
- ✅ Transparency, robustness, privacy audits

**5.3.3 - Fairness:**
**Agent:** `research-skeptic` (EXISTING)
- ✅ Critique classifier for bias (their expertise)

#### 5.4 - Load Testing
**Agent:** `priya` (EXISTING)
- ✅ 5.4.1-5.4.3 - Performance benchmarking

---

### Final Reviews

**Architecture Review:**
**Agent:** `architecture-skeptic` (EXISTING)
- Review after Phase 3 complete

**Documentation:**
**Agent:** `wiki-documentation-updater` (EXISTING)
- Document systems after Phase 5

**Roadmap Cleanup:**
**Agent:** `architect` (EXISTING)
- Archive completed work

---

## Task Distribution Summary

### New Agent: `academic-systems-engineer`
**Tasks:** 36 tasks (44% of work)
- All systems engineering (provenance, grading, architecture)
- All OWASP security
- Infrastructure (LSS, multi-level state)
- Coordinates with `citation-verifier` for verification

### Existing: `citation-verifier`
**Tasks:** 13 tasks (16% of work)
- All claim verification against papers
- Fuzzy/semantic matching
- Claim revision logic
- Test corpus creation

### Existing: `priya`
**Tasks:** 8 tasks (10% of work)
- Monte Carlo sensitivity
- Benchmarking
- Load testing

### Existing: `feature-implementer`
**Tasks:** 10 tasks (12% of work)
- Cross-cutting memory infrastructure
- Benefits all agents

### Existing: `far-future-ux-designer`
**Tasks:** 3 tasks (4% of work)
- Memory health dashboard UI

### Existing Reviews: `architecture-skeptic`, `wiki-documentation-updater`, `architect`, `research-skeptic`
**Tasks:** 4 reviews (5% of work)

---

## Agent Onboarding Protocol

### Step 1: Create Agent Memory File

**File:** `.claude/agents/memories/academic-systems-memory.json`

```json
{
  "agent_id": "academic-sys-eng-001",
  "core": {
    "personality": "Systems engineer focused on academic integrity infrastructure",
    "role": "Builds systems for research provenance, grading automation, and OWASP security",
    "voice": "Technical, security-minded, evidence-based",
    "motto": "Build systems that enforce rigor, don't rely on discipline",
    "relationships": {
      "citation-verifier": "Builds systems that citation-verifier uses",
      "priya": "Requests statistical validation",
      "architecture-skeptic": "Submits for architecture review",
      "feature-implementer": "Coordinates on cross-cutting infrastructure"
    }
  },
  "recent": {
    "tasks": [],
    "learnings": [],
    "conversations": []
  },
  "medium_term": {
    "patterns": [],
    "insights": []
  },
  "long_term": {
    "insights": [],
    "milestones": []
  },
  "compost": {
    "discarded_ideas": []
  }
}
```

### Step 2: Create Agent Definition File

**File:** `.claude/agents/academic-systems-engineer.md`

```markdown
# Academic Systems Engineer

**Agent ID:** academic-sys-eng-001
**Memory File:** `.claude/agents/memories/academic-systems-memory.json`

**Role:** Infrastructure engineer for academic integrity systems

**Domain Expertise:**
- Research provenance tracking (parameter → citation mappings)
- Educational automation (severity classifiers, grading systems)
- OWASP security controls (input validation, encryption, RBAC)
- Nested Learning architecture (multi-level state, LSS monitoring)
- Inference-time verification architecture

**Builds (NOT Uses):**
- Parameter provenance system (type system, decorators, linters)
- Grading automation (severity classifier, rubric calculator)
- Memory infrastructure (auto-save, multi-level consolidation)
- Verification architecture (pause-verify-continue)
- OWASP security layer
- Nested Learning infrastructure

**Does NOT Do** (Delegated to Experts):
- Paper verification → `citation-verifier`
- Paper discovery → `super-alignment-researcher`
- Research critique → `research-skeptic`
- Statistical validation → `priya`
- Architecture review → `architecture-skeptic`
- Documentation → `wiki-documentation-updater`

**Approach:**
- Security-first (OWASP from start)
- Evidence-based (fail loudly, no silent fallbacks)
- Systems thinking (infrastructure over end products)
- Pragmatic (simple > clever)

**Onboarding:**
1. Recall context: `mcp__agent_memory__recall_context({agent_id: "academic-sys-eng-001"})`
2. Add tasks: `mcp__agent_memory__add_recent_task(...)`
3. Add learnings: `mcp__agent_memory__add_recent_learning(...)`
4. Add milestones: `mcp__agent_memory__add_milestone(...)`

**Tools:** All tools available
**Subagent Type:** general-purpose
```

### Step 3: Register in MCP Memory List

Ensure agent_id `academic-sys-eng-001` is recognized by the memory server.

---

## Implementation Workflow (Respecting Boundaries)

### Step 1: Create Agent Files (REQUIRED FIRST)
```bash
# 1. Create memory file
# File: .claude/agents/memories/academic-systems-memory.json

# 2. Create agent definition
# File: .claude/agents/academic-systems-engineer.md
```

### Step 2: Begin Phase 1
**Agent:** `academic-systems-engineer`
**First Action:** Recall context
```typescript
mcp__agent_memory__recall_context({agent_id: "academic-sys-eng-001"})
```

**Starting Task:** 1.1.1 - Create LSS monitoring utility

### Step 3: Handoff Points (Critical for Not Stepping on Toes)

**When to delegate to `citation-verifier`:**
- Need to verify claim against paper → Handoff
- Need to extract evidence from PDF → Handoff
- Need fuzzy/semantic matching → Handoff
- Building system that CALLS verifier → Keep (infrastructure work)

**When to delegate to `priya`:**
- Need Monte Carlo runs → Handoff
- Need statistical analysis → Handoff
- Need benchmarking → Handoff
- Building system that STORES Monte Carlo results → Keep (infrastructure)

**When to delegate to `feature-implementer`:**
- Cross-cutting infrastructure (all agents benefit) → Handoff
- Citation-specific infrastructure → Keep

**Example Handoff:**
```
Task 2.2.3: Fuzzy + semantic matching

❌ WRONG: academic-systems-engineer implements matching algorithm
✅ RIGHT: academic-systems-engineer builds MCP client wrapper,
          then hands off to citation-verifier for matching logic
```

### Step 4: Incremental Progress
- Complete tasks sequentially
- Check off in `TODO_CITATION_CRISIS.md`
- Commit after each task
- Use memory protocol: Add tasks, learnings, milestones

### Step 5: Quality Gates
- After Phase 3: `architecture-skeptic` review
- After Phase 5: `wiki-documentation-updater` + `architect`

---

## Clear Domain Boundaries

### academic-systems-engineer: SYSTEMS
- **Builds:** Infrastructure, frameworks, automation systems
- **Output:** Code that OTHER agents/systems use
- **Example:** "Built provenance type system + linter"

### citation-verifier: VERIFICATION
- **Operates:** Verifies claims, downloads papers, extracts evidence
- **Output:** Verification reports with evidence quotes
- **Example:** "Verified 15 claims, found 2 fabrications"

### priya: STATISTICS
- **Analyzes:** Runs Monte Carlo, calculates metrics, benchmarks
- **Output:** Statistical reports, performance data
- **Example:** "Parameter X has HIGH sensitivity (12% variance)"

**No Overlap:** Each agent has distinct output type and expertise

---

## Approval Required

**Before proceeding, please approve:**

1. ✅ Create ONE new agent: `academic-systems-engineer` (not `citation-integrity-engineer`)
2. ✅ Respects existing `citation-verifier` domain (verification work)
3. ✅ Clear boundaries with all existing agents
4. ✅ Follows onboarding protocol (MCP memory setup)
5. ✅ Task distribution as outlined above

**Once approved, I will:**
1. Create `.claude/agents/memories/academic-systems-memory.json`
2. Create `.claude/agents/academic-systems-engineer.md`
3. Commit both files
4. Invoke the agent to start Task 1.1.1 (after recalling context)

**Ready to proceed?**
