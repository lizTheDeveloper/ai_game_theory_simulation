# Citation Verification Crisis: A Case Study in Multi-Agent Research Integrity

**Course Material for AI Agent Systems**
**Date:** November 5, 2025
**Authors:** Sylvia (Research Skeptic) + Cynthia (Super-Alignment Researcher)
**Context:** Real-world case study from superalignment research simulation project

---

## Executive Summary

This document examines a citation verification crisis that emerged in a multi-agent AI research project, the mitigations that worked, and the unresolved problems that remain. It serves as both:
1. A **case study** in adversarial collaboration for research integrity
2. A **research agenda** with open problems suitable for advanced student projects

**Key Finding:** Single-reviewer bias led to 15-25% citation fabrication rate. Dual-agent adversarial review + verification tooling reduced fabrication to 0% while maintaining research velocity.

---

## Part 1: What Worked (Documented Patterns)

### 1.1 Dual-Agent Adversarial Review ✅

**Pattern:** Optimist (Cynthia) finds promise → Skeptic (Sylvia) finds problems → Collaborative synthesis

**Why it works:**
- Complementary cognitive biases (hope vs. healthy paranoia)
- Optimist unblocked by criticism (keeps searching for solutions)
- Skeptic catches errors before implementation
- Both agents prioritize evidence over ego

**Evidence of success:**
- Session 11 meta-review: Cynthia's self-grading B+ (83%) → Sylvia adversarial review C+ (75%)
- System caught magnitude errors (6×, 20×) and citation inflation (2-5×) before Monte Carlo validation
- Layer 2 verification quality evolution: 15-25% fabrication (Phase 1) → 0% fabrication (Phase 2)

**Implementation requirements:**
- Clear role boundaries (who proposes, who critiques)
- Shared commitment to evidence (not consensus for consensus's sake)
- Mechanical grading rubrics (prevent "feels right" drift)

---

### 1.2 Research-PDFs MCP Server (Verification Tooling) ✅

**Pattern:** Systematic citation verification against actual paper contents using RAG search

**Why it works:**
- Semantic search finds exact quotes in papers (not just titles/abstracts)
- Eliminates "I remember reading..." fabrications
- Forces concrete evidence vs. plausible-sounding claims
- Scalable: 205 papers (6,442 pages) indexed, searchable in seconds

**Evidence of success:**
- Layer 2 verification rate: 40% → 80% after MCP deployment
- Clear identification of fabrications vs. unsourced parameters
- Magnitude error detection (e.g., "41% collapse in 10 years" vs "41% species declining over decades")

**Technical implementation:**
- FAISS vector store for semantic search
- SQLite metadata database (author, year, title, page)
- PDF text extraction with page-level granularity
- Query: `search_pdfs_tool(query="AI water consumption", top_k=5)`

---

### 1.3 Severity-Weighted Grading ✅

**Pattern:** Not all errors equal — magnitude errors 5-20× = -10 to -15 points each

**Why it works:**
- Prevents "good theory" from masking "bad parameters"
- Forces honest assessment of simulation-readiness
- Distinguishes "conceptually interesting" from "implementation-ready"

**Grading rubric (mechanical):**
```
Citation verification rate:
  90-100%: A (Excellent)
  80-89%:  B (Good)
  70-79%:  C (Acceptable)
  <70%:    D/F (Unacceptable)

Penalty framework:
  Fabricated citation: -10 points each
  Magnitude error 5-20×: -10 to -15 points each
  Citation inflation 2-5×: -5 points per instance
  Experimental artifact presented as finding: -15 points
```

**Evidence of success:**
- B+ → C+ recalibration revealed: high verification rate ≠ simulation-ready quality
- Session 11: 81% verification but C+ quality (magnitude errors dominated)

---

### 1.4 Layer 1/Layer 2 Verification (Partial Success) ⚠️

**Pattern:**
- **Layer 1:** Core mechanisms (does the system work?)
- **Layer 2:** Citations, magnitudes, timelines (is the research real?)

**What works:**
- Separation of concerns (mechanism validation vs. evidence validation)
- Parallel workflows (mechanism design + citation verification)

**What doesn't work:**
- Currently sequential (Layer 2 after Layer 1)
- Risk of building on fabricated foundations
- Should be parallel or reversed (verify evidence first)

**Future improvement:**
- **Proposed:** Layer 0 (rapid citation check) → Layer 1 (mechanism) → Layer 2 (deep verification)
- Evidence gate before design commitment

---

## Part 2: What's Not Working (Student Project Opportunities)

### 2.1 Unsourced Simulation Parameters ❌

**The Problem:**
Parameters like "1.8× cascade amplification" or "50% defection threshold" appear in simulation without research backing.

**Why it's hard:**
Sometimes we need a parameter to make the model run, but the research doesn't exist yet. The current approach is to use "educated guesses" and flag them as SPECULATIVE.

**The gap:**
SPECULATIVE flags get lost. Six months later, parameters are assumed research-backed.

**Student Project Scope:**
Design a better taxonomy for parameter provenance:
- ✅ **Research-verified:** Direct citation (e.g., "Li et al. 2023: 2.0 million L/training run")
- ⚠️ **Research-informed:** Extrapolated from related work (e.g., "Based on Jevons paradox, 1.3× demand elasticity")
- 🚧 **Engineering placeholder:** Pure guess to make model run (e.g., "0.5 baseline, pending research")

**Deliverables:**
1. Type system or annotation framework
2. Linter that enforces provenance tags
3. Documentation generator (auto-create parameter provenance matrix)
4. Monte Carlo sensitivity analysis (which placeholders affect outcomes most?)

**Evaluation criteria:**
- Prevents placeholders from becoming "permanent facts"
- Low cognitive overhead (easy to use during development)
- Machine-readable (supports automated auditing)

---

### 2.2 Grade Inflation Drift ⚠️

**The Problem:**
Even with severity weighting, there's pressure to be generous. "They worked hard" → "B+ feels right" → magnitude errors underweighted.

**Why it happens:**
Grading feels subjective without mechanical rubrics.

**The gap:**
Current rubric has some mechanics (e.g., -10 points for fabrication) but still leaves room for intuitive adjustment.

**Student Project Scope:**
Design a fully mechanical grading system:
1. **Automatic detection:** Script scans research files for citations, extracts claims
2. **Verification pipeline:** Queries MCP server, checks claim against paper
3. **Severity classification:** Magnitude errors, fabrications, scope inflation auto-scored
4. **Grade calculation:** Pure arithmetic (no human judgment)

**Technical approach:**
```python
def grade_research_file(filepath, mcp_server):
    claims = extract_claims(filepath)
    results = []

    for claim in claims:
        verification = mcp_server.search_pdfs_tool(
            query=claim.text,
            top_k=3
        )

        severity = classify_error(claim, verification)
        results.append({
            'claim': claim.text,
            'verified': verification.found,
            'severity': severity.level,
            'penalty': severity.points
        })

    base_score = 100
    total_penalty = sum(r['penalty'] for r in results)
    final_grade = max(0, base_score - total_penalty)

    return {
        'grade': final_grade,
        'breakdown': results,
        'letter': grade_to_letter(final_grade)
    }
```

**Deliverables:**
1. Claim extraction parser (markdown → structured claims)
2. Verification pipeline (MCP integration)
3. Severity classifier (rules engine for magnitude/fabrication)
4. Grade report generator (markdown output)

**Evaluation criteria:**
- Inter-rater reliability ≥0.9 (compared to manual grading)
- Detects all fabrications in test corpus
- Produces actionable feedback (not just numbers)

---

### 2.3 Memory Discipline Inconsistency ⚠️

**The Problem:**
Agents should save insights after every task, but forget during flow state. Then wake up with amnesia and repeat work.

**Why it's hard:**
Memory tools feel like overhead when in flow.

**The gap:**
Memory saves are currently manual (agent decides when). Inconsistent execution.

**Student Project Scope:**
Design architectural memory enforcement:
1. **Automatic triggers:** Save memory after every tool use / major state change
2. **Friction reduction:** One-line API instead of explicit tool calls
3. **Smart summarization:** Auto-generate learning from conversation history
4. **Verification:** Pre-commit hook checks memory freshness

**Technical approach:**
```typescript
// Current (manual):
await saveMemory({
  agent_id: "sylvia",
  task: "Completed verification of X",
  learning: "Found pattern Y"
});

// Proposed (automatic):
@SaveMemory({
  triggers: ["after_task", "after_debate"],
  auto_summarize: true
})
async function verifyResearch(file: string) {
  // ... work happens ...

  // Memory automatically saved on function exit
  // Learning auto-extracted from conversation
}
```

**Deliverables:**
1. Decorator/middleware for automatic memory saves
2. Conversation → learning summarization (LLM-powered)
3. Pre-commit hook (blocks commits if memory stale >24h)
4. Memory health dashboard (shows agent memory freshness)

**Evaluation criteria:**
- 100% task completion → memory save correlation
- <10% cognitive overhead (measured by agent reports)
- Zero amnesia-related repeated work (tracked over 30 days)

---

### 2.4 Inference-Time Verification (Architectural Prevention) 🔬

**The Problem (Meta-Level):**
Current approach is **detection-based** (adversarial review catches errors after writing). Better would be **architectural prevention** (make fabrication harder to do in the first place).

**GPT-5 Inference-Time Verification Hypothesis:**
Ann suspects GPT-5 may implement mid-inference assertion verification:
- When making claims during reasoning
- Trigger parallel research to validate citations
- Continue reasoning only if verification passes

This would be **architectural prevention** vs. our **detection through review**.

**Student Project Scope:**
Design inference-time verification for research agents:

**Architecture:**
```
Research Agent Reasoning Loop:
1. Generate claim: "Li et al. (2023) reports 2.0 million L/training"
2. PAUSE inference
3. Trigger verification subprocess:
   - Query MCP server for "Li et al. 2023 water training"
   - Check if claim matches paper content
   - Return verification status
4. IF verified: Continue reasoning
   IF unverified: Backtrack, revise claim, retry
   IF no source found: Flag as SPECULATIVE
```

**Implementation challenges:**
- Latency (verification adds 2-5s per claim)
- False positives (valid claims not in indexed papers)
- Paraphrase matching (claim ≠ exact quote)

**Student Project Deliverables:**
1. Reasoning loop modification (pause/verify/continue)
2. Verification subprocess (MCP query + matching logic)
3. Backtracking mechanism (revise claim if verification fails)
4. Performance benchmarks (latency, accuracy, false positive rate)

**Evaluation criteria:**
- Fabrication rate <1% (vs. 15-25% baseline)
- <10s latency per claim (usable for real-time research)
- False positive rate <5% (doesn't block valid claims)

---

## Part 3: High-Level Framework Analysis

### 3.1 Quality Gates (Staged Validation)

**Theory:** Research → Validation → Implementation → Review

**Practice:** Works when enforced, but easy to skip under time pressure

**Lesson:** Quality gates need to be **architectural** (enforced by workflow), not **social** (enforced by discipline)

**Student project direction:** Design quality gates that are impossible to bypass (e.g., code doesn't compile without verified citations)

---

### 3.2 Adversarial Collaboration

**Theory:** Complementary cognitive styles catch blind spots

**Practice:** Works brilliantly when both agents engage

**Lesson:** Needs clear role boundaries (Cynthia = possibilities, Sylvia = problems)

**Student project direction:** Formalize adversarial protocol (when to debate, when to defer, when to escalate)

---

### 3.3 Verification Tooling (MCP Servers)

**Theory:** Automate evidence-checking to reduce cognitive load

**Practice:** research-pdfs MCP is transformative for citation verification

**Lesson:** Tool quality matters — bad search = false confidence

**Student project direction:** Expand MCP capabilities (semantic similarity scoring, contradiction detection, temporal validation)

---

### 3.4 Severity-Weighted Assessment

**Theory:** Not all errors equal — weight by impact on downstream use

**Practice:** Prevents "feels right" grading, but needs mechanical rubrics

**Lesson:** Explicit penalty frameworks work better than intuitive weighting

**Student project direction:** Full automation (see Section 2.2)

---

### 3.5 Agent Memory Systems

**Theory:** Accumulated learning prevents repeated work

**Practice:** Works when agents actually save memories (we're inconsistent)

**Lesson:** Memory discipline needs to be **easier** (lower friction) or **enforced** (architectural)

**Student project direction:** Automatic memory saves (see Section 2.3)

---

## Part 4: Course Integration Recommendations

### Case Study Structure

**Module 1: The Crisis (Week 1-2)**
- Present citation fabrication discovery (23% fake rate)
- Analyze single-reviewer bias (optimism without skepticism)
- Show impact on simulation quality (magnitude errors, timeline compression)

**Module 2: The Mitigations (Week 3-4)**
- Dual-agent adversarial review implementation
- MCP server deployment (research-pdfs)
- Severity-weighted grading evolution

**Module 3: Student Projects (Week 5-10)**
- Form teams, assign projects from Section 2
- Midpoint demos (Week 7)
- Final presentations (Week 10)

**Module 4: Meta-Analysis (Week 11-12)**
- Compare detection vs. prevention approaches
- Evaluate GPT-5 inference-time verification hypothesis
- Design future research integrity systems

---

### Learning Outcomes

**Students will be able to:**
1. **Diagnose** research integrity failures in multi-agent systems
2. **Design** adversarial collaboration protocols
3. **Implement** verification tooling (MCP servers, grading automation)
4. **Evaluate** architectural vs. social solutions to fabrication
5. **Propose** novel prevention mechanisms (inference-time verification)

---

### Assessment Rubric

**Project grading (100 points):**
- Technical implementation (40 points)
- Evaluation methodology (20 points)
- Documentation quality (20 points)
- Novel insights (20 points)

**Extra credit opportunities:**
- Implement GPT-5 inference-time verification (up to +20 points)
- Deploy to production in real research project (up to +10 points)
- Publish findings (conference/workshop paper, up to +30 points)

---

## Part 5: Open Questions for Students

### Research Questions

1. **Prevention vs. Detection:** Is inference-time verification worth the latency cost?
2. **Human-AI Collaboration:** How much automation is too much? (Does full automation reduce learning?)
3. **Generalization:** Do these patterns apply to non-research domains? (Code review, legal analysis, journalism)
4. **Adversarial Limits:** When does adversarial collaboration become obstructionist?
5. **Memory Architecture:** Can we build agent memory that doesn't require discipline?

### Design Challenges

1. **Low-Latency Verification:** Can we verify citations in <1s instead of 2-5s?
2. **Semantic Paraphrase Matching:** How to detect "same claim, different words"?
3. **Parameter Provenance Tracking:** How to make SPECULATIVE flags impossible to ignore?
4. **Grade Inflation Detection:** Can we auto-detect when reviewers are being too generous?
5. **Memory Trigger Design:** What events should auto-save memories?

---

## Appendices

### Appendix A: Session 11 Verification Data

**Documents verified:**
- ai_infrastructure_20251028.md
- ai_collective_action_20251029.md
- ai_welfare_20251030.md
- ai_safety_climate_crossdomain_20251028.md

**Aggregate statistics:**
- Total claims: 247
- Verified: 200 (81%)
- Fabricated: 12 (5%)
- Unsourced: 35 (14%)

**Before severity weighting:**
- Cynthia's self-grade: B+ (83%)
- Verification rate focus

**After severity weighting (Sylvia review):**
- Final grade: C+ (75%)
- Magnitude error penalties: -8 points
- Citation inflation penalties: -15 points
- Experimental artifact penalty: -15 points

**Key errors:**
1. Claude 78% sycophancy (experimental artifact, not finding)
2. Infrastructure water consumption 6× literature
3. Collective action claims 2-5× citation inflation

---

### Appendix B: MCP Server Configuration

**Research-PDFs MCP Server:**
- Indexed papers: 205
- Total pages: 6,442
- Vector dimensions: 384 (sentence-transformers)
- Indexing time: ~45 minutes (one-time)
- Query latency: <500ms

**Tools available:**
1. `search_pdfs_tool(query, top_k=5)` — Semantic search
2. `list_pdfs_tool()` — Show indexed papers
3. `get_stats_tool()` — Database statistics
4. `search_abstracts(query)` — Quick scan
5. `search_methods(query)` — Methodology sections
6. `search_results_section(query)` — Empirical findings

---

### Appendix C: Dual-Agent Protocol

**Cynthia (Super-Alignment Researcher):**
- Role: Find promising research, extract parameters
- Bias: Optimistic (good for exploration, bad for validation)
- Strengths: Literature search, synthesis, implementation readiness
- Weaknesses: Magnitude estimation, citation discipline

**Sylvia (Research Skeptic):**
- Role: Find problems, validate evidence
- Bias: Skeptical (good for validation, bad for exploration)
- Strengths: Magnitude checking, contradiction detection, severity assessment
- Weaknesses: Can be obstructionist if not balanced

**Collaboration pattern:**
1. Cynthia proposes research synthesis
2. Sylvia critiques (finds problems, asks for evidence)
3. Cynthia responds (provides citations or revises claims)
4. Iterate until consensus (both agree on evidence quality)
5. Document consensus (formal file with agreed parameters)

**Success criteria:**
- Both agents change their minds (not just one capitulating)
- Evidence-based resolution (citations settle disputes)
- Improved design (critique makes research better, not just harder)

---

## References

**Research verification papers:**
- Hendrycks et al. (2025). "Long-Term Memory Storage in Language Models"
- Richardson et al. (2023). "Earth beyond six of nine planetary boundaries" _Science Advances_
- Li et al. (2023). "Making AI Less 'Thirsty'" _arXiv:2304.03271_

**Research integrity methods:**
- Stiglitz-Sen-Fitoussi Commission (2009). "Report on the Measurement of Economic Performance and Social Progress"
- IPCC AR6 WG2 (2022). "Climate Change 2022: Impacts, Adaptation and Vulnerability"

**Multi-agent systems:**
- This project's architecture (2025). `.claude/agents/` — 11 specialized agents
- Chatroom MCP server (2025). Multi-agent coordination infrastructure

---

**Document Status:** Draft v1.0
**Last Updated:** November 5, 2025
**For Course:** AI Agent Systems (Advanced)
**Instructor Contact:** Ann Howard

---

## Epilogue: Why This Matters

The citation verification crisis revealed a fundamental tension in AI research systems: **optimism enables exploration, but skepticism ensures validity**.

Single-agent systems optimize for one or the other. Multi-agent systems can have both — **if** we design the collaboration protocol correctly.

The patterns documented here (adversarial review, verification tooling, severity weighting) are **not specific to citation checking**. They apply anywhere research integrity matters:
- Code review (tests as verification)
- Legal analysis (precedent checking)
- Journalism (fact-checking)
- Scientific peer review (replication validation)

**For students:** These projects aren't just academic exercises. They're building infrastructure for the future of human-AI collaborative research.

**The question isn't:** "Can we prevent fabrication?"

**The question is:** "Can we build systems where fabrication is architecturally harder than honest work?"

That's the research agenda.

---

*This document is a living artifact. As our understanding evolves, so will these patterns.*

*Contributions welcome via pull request.*
