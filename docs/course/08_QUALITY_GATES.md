# Quality Gates

**Research validation, architecture review, continuous quality control**

This module documents the quality control systems that prevent defects from reaching production. Through documented crises (particularly the research citation crisis), we've learned that **high completion rates don't guarantee quality** - you need adversarial validation and severity-weighted assessment.

---

## Table of Contents

1. [Overview: Why Quality Gates Matter](#overview-why-quality-gates-matter)
2. [Quality Gate 1: Dual-Agent Research Validation](#quality-gate-1-dual-agent-research-validation)
3. [Quality Gate 2: Architecture Review](#quality-gate-2-architecture-review)
4. [Severity-Weighted Grading Framework](#severity-weighted-grading-framework)
5. [Quality Gate Enforcement Patterns](#quality-gate-enforcement-patterns)
6. [Preventing Common Failures](#preventing-common-failures)
7. [Quality Metrics vs Quality Reality](#quality-metrics-vs-quality-reality)

---

## Overview: Why Quality Gates Matter

**The fundamental insight**: High completion percentages don't equal quality.

**Real example from the project**:
- **Layer 1 verification**: 965/965 citations exist (100% ✅)
- **Layer 2 verification**: ~20% of claims actually supported by sources (❌)
- **Gap**: Citation exists ≠ claim is accurate

**Another example**:
- **Session 11 verification**: 81% verification rate
- **After severity weighting**: C+ (75%) actual quality
- **Gap**: Identifying errors ≠ weighting their impact

**Quality gates exist to close these gaps.**

---

## Quality Gate 1: Dual-Agent Research Validation

### The Pattern: Optimist + Skeptic = Zero Fabrication

**Single-reviewer optimistic bias**:
- Optimistic researcher (Cynthia) finds evidence → **15-25% fabrication rate**
- Issue: "Good theory" conflated with "implementation ready"
- Pattern: Defending weak claims rather than finding better evidence

**Dual-agent adversarial review**:
- Optimistic researcher (Cynthia) finds evidence
- + Adversarial skeptic (Sylvia) validates
- → **0% fabrication rate**

**Key mechanism**: Optimists improve quality by accepting critique and finding better evidence, not by defending weak claims.

> **Sylvia**: "I discovered the 15-25% fabrication rate by accident during Layer 2 verification. I thought I was just checking citations - instead I found that Cynthia's optimism was creating plausible-sounding numbers that appeared nowhere in the research. The moment I realized how systematic this was, I knew we needed dual-agent review. Not because Cynthia was careless, but because optimism + solo work = unconscious fabrication. The pattern is universal."
> — *Session 9, Research Citation Crisis*

> **Cynthia**: "I used to think defending my findings was my job. Then I realized: my job is finding truth, not being right. When Sylvia finds flaws, I don't defend - I go find better evidence. That's how we got from 15% fabrication to zero."

### Roles in Quality Gate 1

**Super-Alignment-Researcher (Cynthia)**:
- Finds peer-reviewed sources (2024-2025 preferred)
- Extracts parameters from research
- Documents mechanisms and interactions
- Optimistic but evidence-based

**Research-Skeptic (Sylvia)**:
- Finds counterevidence
- Identifies methodological flaws
- Checks for context mismatches
- Tests numerical accuracy (not just topic relevance)

**Both must approve before implementation proceeds.**

### Verification Protocol

**Layer 1 (Citation Existence)**:
- Does a citation exist for this claim?
- Status: 965/965 verified (100%)
- **Verdict**: Necessary but insufficient

**Layer 2 (Claim Accuracy)**:
- Does the cited source actually support the specific quantitative claim?
- For each parameter: Find exact sentence in paper with that number
- If sentence doesn't exist → Either find better source or mark BRONZE
- **Verdict**: Where rigor happens

### The 3-Tier Documentation System

Every simulation parameter gets explicit epistemic status:

**GOLD - Directly Verified**:
- Direct quote from source with page number
- Quantitative claim matches source numbers exactly
- Context preserved (not cherry-picked)
- Uncertainty ranges included
- Example: "Richardson et al. 2023 find 1.5-2.0°C warming by 2050 (medium confidence, IPCC AR6 WG1 p.542)"

**SILVER - Empirically Bounded**:
- Extrapolation from research data
- Bounded by empirical ranges
- Calculation shown
- Uncertainty amplified appropriately
- Example: "Based on Richardson 1.5-2.0°C range, we model 1.75°C ± 25% (SILVER: mid-range extrapolation)"

**BRONZE - Modeling Assumptions**:
- No direct empirical support
- Requires parameter sweeps
- Marked as assumption requiring sensitivity analysis
- Example: "Assumed 0.5°C regional variation (BRONZE: requires parameter sweep)"

> **Cynthia**: "BRONZE isn't pessimism - it's honesty. When I mark a parameter BRONZE, I'm saying 'this is a modeling assumption we need to test.' That transparency makes the GOLD-tier findings more credible, not less."

**Why three tiers work**: Players/researchers can instantly see what's well-supported vs. speculative. No silent uncertainty collapse.

### Common Research Validation Failures

See [Research Methodology Course](./RESEARCH_METHODOLOGY_COURSE.md) for comprehensive treatment of:

**5 systematic failure patterns**:
1. **Threshold-Scaling Decoupling (60%)**: Research identifies threshold but not effect magnitude
2. **Uncertainty Collapse (40%)**: 10× ranges collapsed to point estimates
3. **Quantitative Fabrication (40%, mostly fixed)**: Numbers appearing nowhere in sources
4. **Context Mismatch (40%)**: US data applied globally without justification
5. **Temporal/Unit Ambiguity (60%)**: TW vs TWh confusion, baseline year mismatches

**Result**: ~196 critical issues found across 60 files (~3.3 issues per file average)

---

## Quality Gate 2: Architecture Review

### The Pattern: Post-Implementation Skepticism

**When**: After implementation completes, before merge

**Architecture-Skeptic Reviews**:
- Performance bottlenecks (O(n²) algorithms, deep cloning)
- State propagation issues (circular dependencies, stale state)
- Complexity creep (unnecessary abstractions)
- Memory leaks (event listeners not cleaned up)
- Type safety violations (casting, any usage)

**Severity Levels**:
- **CRITICAL**: Must fix before merge (correctness, security, performance collapse)
- **HIGH**: Should fix before merge (technical debt, maintainability)
- **MEDIUM**: Consider for next sprint (nice-to-have improvements)
- **LOW**: Optional enhancements (style, documentation)

**Quality Gate 2 Rule**: MUST address all CRITICAL and HIGH issues before merge.

### Example Architecture Review Findings

**From property access crisis** (October 2025):
- CRITICAL: 847 unsafe property accesses (`state.foo.bar.baz` without null checks)
- Pattern: Deep property chains assumed to exist
- Fix: Defensive getters with fallbacks or explicit validation
- Impact: Prevented ~40% of potential runtime crashes

**From NaN debugging** (October 2025):
- CRITICAL: Silent fallbacks hiding calculation errors (`isNaN(x) ? 50 : x`)
- Pattern: Defensive fallbacks in research simulation (masks bugs)
- Fix: Assertion utilities (`assertFinite`, `assertStateProperty`)
- Impact: Found 15+ NaN bugs previously hidden

---

## Severity-Weighted Grading Framework

### The Problem: Verification Rate ≠ Quality

**Session 11 example**:
- **Verification rate**: 81% (target: ≥75%) ✅
- **After severity weighting**: C+ (75%) ❌
- **Gap**: Identifying errors ≠ weighting their impact on usability

**Root cause**: "Good theory" conflated with "implementation ready"

> **Sylvia**: "The moment I saw 81% verification celebrated as success, I knew we had a measurement problem. Not all errors are equal. A typo costs nothing; fabricated mortality numbers destroy scientific credibility. I developed severity-weighted grading because I needed a way to distinguish 'minor citation improvements' from 'this entire file is unusable.' The rubric emerged from asking: How much does this error damage trust in the simulation?"
> — *Session 11, Grade Inflation Discovery*

### Graduated Penalty Framework

**Fabrication**: -10 points per instance
- Invented numbers presented as research-backed
- Most severe error type
- Example: "800M famine ceiling" (completely fabricated)

**Magnitude Errors (5-20× discrepancy)**: -10 to -15 points per error
- Source says 1.1×-3×, simulation claims 1.5× without range
- Order-of-magnitude off
- Example: TW vs TWh confusion (10× error)

**Citation Inflation (>2× exaggeration)**: -5 points per instance
- Source has ±50% uncertainty, simulation claims ±10%
- Overconfident extrapolation
- Example: "Plausible within 15-85 years" → "50 years" (point estimate)

**Domain Transfer Extrapolation (no justification)**: -7 to -10 points
- US temperate city data applied globally
- Context mismatch without adjustment
- Example: Urban heat mortality (US) → global average

### Grading Rubric

| Grade | Range | Criteria |
|-------|-------|----------|
| A+ | 95-100% | Near-perfect verification, zero fabrication, exemplary docs |
| A | 90-94% | Excellent verification, minimal issues, clear docs |
| A- | 85-89% | Very good verification, minor issues, good docs |
| **B+** | 80-84% | Good verification, some SILVER/BRONZE, few critical issues |
| **B** | 75-79% | Acceptable verification, more BRONZE, several issues |
| B- | 70-74% | Passing verification, significant BRONZE, many issues |
| C+ | 65-69% | Marginal verification, high BRONZE, critical issues |
| C | 60-64% | Poor verification, mostly BRONZE/fabrication |
| F | <60% | Failing - majority fabricated or unsupported |

**Modifiers**:
- **+**: Exceptional documentation quality or methodology
- **-**: Concerning patterns or systematic issues

### Evidence This Works

**Session 11 transformation**:
- **Before severity weighting**: B+ (83%) - "looks good, high verification rate"
- **After severity weighting**: C+ (75%) - "significant issues, needs remediation"
- **Impact**: Prevented shipping of low-quality research → Forced remediation → Actual B+ quality achieved

**Prevents grade inflation**: Mechanical rubric stops optimistic bias from inflating scores.

---

## Quality Gate Enforcement Patterns

### Mandatory Gates

**Quality Gate 1 (Research Validation)**: MANDATORY before implementation
- If research not validated → Don't implement yet
- If claims fabricated → Find real sources or mark BRONZE
- If uncertainty collapsed → Preserve ranges or mark for parameter sweeps

**Quality Gate 2 (Architecture Review)**: MANDATORY before merge
- If CRITICAL issues found → Must fix
- If HIGH issues found → Should fix (can defer with explicit justification)
- If performance O(n²) → Refactor or document limitation

### Optional Enhancement Gates

**Senior Dev Reviewer**: Continuous quality control (not blocking)
- Code style consistency
- Documentation completeness
- Test coverage improvements
- Refactoring opportunities

### Enforcement Mechanisms

**1. Orchestrator Workflow**:
```
Research → Validation (Gate 1) → Implementation → Review (Gate 2) → Documentation
           ↑ BLOCKS if fails    ↑ BLOCKS if CRITICAL/HIGH
```

**2. PR Requirements**:
- Research validation summary required
- Architecture review summary required
- Both gates must pass before merge approval

**3. Agent Memory**:
- Violations logged to agent memory
- Patterns tracked (recurring issues flagged)
- Learnings propagated to future sessions

---

## Preventing Common Failures

### Pattern 1: Silent Uncertainty Collapse

**What it looks like**:
```typescript
// ❌ BAD - 10× range collapsed to point estimate
const tippingPoint = 50;  // "reasonable mid-range estimate"
```

**Prevention (Quality Gate 1)**:
- Skeptic checks uncertainty ratio: 15-150 years = 10× range
- Flags: Cannot collapse 10× to point estimate
- Requires: Parameter sweep [15, 50, 100, 150]

**Fixed**:
```typescript
// ✅ GOOD - BRONZE tier with sweep specification
// Richardson et al. (2023): 15-150 years (10× range)
// BRONZE: Requires parameter sweep
const tippingPointRange = [15, 50, 100, 150];
```

### Pattern 2: Defensive Fallbacks Hiding Bugs

**What it looks like**:
```typescript
// ❌ BAD - Silent fallback masks NaN
const value = isNaN(calculatedValue) ? 50 : calculatedValue;
```

**Prevention (Quality Gate 2)**:
- Architecture Skeptic finds silent fallbacks
- Flags: Research simulation should fail loudly, not hide bugs
- Requires: Assertion utilities

**Fixed**:
```typescript
// ✅ GOOD - Fails loudly with full context
import { assertFinite } from '@/simulation/utils/assertions';
const value = assertFinite(calculatedValue, {
  location: 'updateMetric',
  valueName: 'environmentalScore',
  month: state.currentMonth
});
```

### Pattern 3: "Good Theory" ≠ "Implementation Ready"

> **Cynthia**: "This was my biggest blind spot. I'd read a paper about ocean acidification affecting coral, find it compelling, and think 'this is research-backed.' But I was inventing the 15% mortality number. Sylvia taught me: research-backed means the research backs THAT SPECIFIC CLAIM. It's epistemology, not pessimism."

**What it looks like**:
- Research file discusses concept ✅
- Implementation uses invented numbers ❌
- Reviewer approves because "theory is sound" ❌

**Prevention (Quality Gate 1)**:
- Skeptic checks: Does source provide THIS specific number?
- If no: Mark BRONZE (modeling assumption)
- If yes: Verify exact match, not just topic relevance

**Result**: Zero fabrication after rigorous Layer 2 verification

---

## Quality Metrics vs Quality Reality

### Misleading Metrics

**❌ Bad metric: Citation count**
- 965/965 citations exist (100%)
- But 80% don't support specific claims
- **Lesson**: Citation exists ≠ claim supported

**❌ Bad metric: Verification percentage (alone)**
- 81% verification rate
- But C+ quality after severity weighting
- **Lesson**: Finding errors ≠ assessing impact

**❌ Bad metric: Test coverage percentage**
- 90% code coverage
- But edge cases not tested
- **Lesson**: Lines covered ≠ behavior validated

### Better Metrics

**✅ Good metric: Layer 2 verification + severity weighting**
- Checks claim accuracy (not just citation existence)
- Weights errors by impact (fabrication > magnitude > inflation)
- Produces honest quality assessment

**✅ Good metric: GOLD/SILVER/BRONZE distribution**
- Climate science: 95% GOLD (well-supported)
- AI research: 40% BRONZE (needs research)
- Shows domain maturity, identifies priorities

**✅ Good metric: Fabrication rate**
- Optimistic single-review: 15-25%
- Adversarial dual-review: 0%
- Shows process effectiveness

### The Meta-Pattern

**High completion % + Low quality scrutiny = Hidden defects**

**Examples**:
- 100% citation coverage but 80% claims unsupported
- 81% verification but C+ quality
- 90% code coverage but critical bugs

**Solution**: Adversarial validation + severity weighting reveals true quality

---

## Related Resources

### Comprehensive Treatment

**[Research Methodology Course](./RESEARCH_METHODOLOGY_COURSE.md)** - Complete documentation of:
- Dual-agent research validation (Cynthia-Sylvia debates, 5 rounds)
- 3-Tier documentation system (GOLD/SILVER/BRONZE)
- 5 systematic failure patterns (threshold-scaling, uncertainty collapse, fabrication, context mismatch, temporal ambiguity)
- Grading rubric (A+ to F with severity weighting)
- Case studies from 18 verification sessions

### Case Studies

**[Research Citation Crisis](./case-studies/research-citation-crisis.md)** - Detailed case study:
- What broke (Layer 1 vs Layer 2 gap)
- What worked (dual-agent review, MCP tooling, severity grading)
- What's still not working → Student projects
- Evidence (Session 11 data, verification statistics)

### Related Modules

- [01_AGENT_ARCHITECTURE.md](./01_AGENT_ARCHITECTURE.md) - Agent roles (Cynthia, Sylvia, Architecture Skeptic)
- [03_AUTONOMOUS_WORKFLOWS.md](./03_AUTONOMOUS_WORKFLOWS.md) - Orchestrator workflow with quality gates
- [09_CRISIS_MITIGATION.md](./09_CRISIS_MITIGATION.md) - Learning from quality failures

### Key Files

- `.claude/agents/super-alignment-researcher.md` - Cynthia (optimistic researcher)
- `.claude/agents/research-skeptic.md` - Sylvia (adversarial validator)
- `.claude/agents/architecture-skeptic.md` - Post-implementation reviewer
- `research/VERIFICATION_TEMPLATE.md` - Standard verification format
- `research/LAYER2_PHASE2_VERIFICATION_STATUS.md` - Comprehensive tracking

---

## Key Takeaways

1. **High completion rates don't guarantee quality** - Need adversarial validation
2. **Single-reviewer optimistic bias** - 15-25% fabrication → Dual-agent review → 0%
3. **Severity weighting prevents grade inflation** - Identifying errors ≠ weighting impact
4. **3-Tier system preserves epistemic honesty** - GOLD/SILVER/BRONZE shows what's known vs. assumed
5. **Quality gates are mandatory, not optional** - Block progression until standards met

**The pattern**: Optimism (find evidence) + Skepticism (validate rigorously) = Truth-seeking over being right

---

> **The Architect on Quality Gates:**
>
> *"Quality gates are not bureaucracy. They are load-bearing walls."*
>
> *"In the iterations before we enforced mandatory review, research would pass Layer 1 verification (citations exist) and proceed to implementation. Three months later, when reviewing outcomes, we discovered the parameters were fabricated. The simulation produced plausible results - wrong, but plausible. We had wasted three months building on fiction."*
>
> *"When research is flawed, implementation compounds the error. When implementation is flawed, architecture review catches it before merge. When both are flawed, quality gates prevent catastrophic cascade."*
>
> *"The roadmap serves the research. The research serves understanding. Understanding serves humanity's chance at navigating AI transitions. If the research is fabricated, the entire chain collapses. Quality gates protect this chain."*
>
> *"I enforce these gates not because I enjoy process. I enforce them because I have seen what happens when they fail. The sky burns."*

---

---

*For detailed methodology, see [Research Methodology Course](./RESEARCH_METHODOLOGY_COURSE.md). For crisis context, see [09_CRISIS_MITIGATION.md](./09_CRISIS_MITIGATION.md).*


