# Quality Gates Specification
## Research Simulation Project Quality Assurance

**Created:** December 7, 2025
**Purpose:** Define mandatory quality gates for all feature implementations

---

## Overview

This specification defines two mandatory quality gates that all features MUST pass before being merged into the main codebase. These gates ensure research validity, architectural integrity, and system stability.

---

## Quality Gate 1: Research Validation

### Purpose
Ensure all mechanics are grounded in peer-reviewed research and parameter values are justified.

### Requirement
The project SHALL validate all features through research review before implementation.

#### Scenario: Research Validation Process
- WHEN a feature is proposed
- THEN it MUST pass Quality Gate 1 before implementation begins
- AND validation MUST be performed by super-alignment-researcher + research-skeptic
- AND the feature MUST achieve Grade B or higher
- AND Grade D/F SHALL block implementation

### Grading Criteria

**Grade A (90-100%):**
- 3+ peer-reviewed sources (2024-2025)
- All parameters justified from research data
- Mechanism description complete with interaction maps
- Expected timeline defined
- Failure modes documented
- No contradictory evidence found

**Grade B (80-89%):**
- 2+ peer-reviewed sources (2024-2025)
- Most parameters justified
- Mechanism description adequate
- Timeline estimated
- Major failure modes documented
- Minor contradictions addressable

**Grade C (70-79%):**
- 2+ sources (may be older)
- Some parameters justified
- Basic mechanism description
- Timeline vague
- Some failure modes documented
- Moderate contradictions require resolution

**Grade D (60-69%):**
- 1-2 sources
- Few parameters justified
- Incomplete mechanism description
- **BLOCKS IMPLEMENTATION** - requires additional research

**Grade F (<60%):**
- Insufficient sources
- No parameter justification
- **BLOCKS IMPLEMENTATION** - feature must be redesigned or abandoned

### Validation Outputs

**Required deliverables:**
1. Research validation report (saved to `research/[feature]_validation_YYYYMMDD.md`)
2. Grade assignment (A/B/C/D/F)
3. List of peer-reviewed sources (2+ required)
4. Parameter justification table
5. Contradictory evidence analysis (if any)
6. Recommendations for implementation

### Agent Workflow

**Research validation must be performed by:**
- **super-alignment-researcher:** Finds peer-reviewed sources, extracts parameters
- **research-skeptic:** Finds contradictory evidence, challenges assumptions

**Process:**
1. super-alignment-researcher conducts literature review
2. research-skeptic reviews findings and searches for contradictions
3. Both agents collaborate on final grade
4. Report saved to `research/` directory
5. If Grade B or higher → proceed to implementation
6. If Grade D or F → block, request additional research

---

## Quality Gate 2: Architecture Review

### Purpose
Ensure implementation maintains system performance, state integrity, and architectural coherence.

### Requirement
The project SHALL review all features post-implementation before merge.

#### Scenario: Architecture Review Process
- WHEN a feature is implemented
- THEN it MUST pass Quality Gate 2 before merge
- AND review MUST be performed by architecture-skeptic
- AND CRITICAL/HIGH issues MUST be addressed before merge
- AND Grade C or lower SHALL block merge

### Grading Criteria

**Grade A (90-100%):**
- No CRITICAL or HIGH issues
- 0-1 MEDIUM issues
- Performance excellent (no regressions)
- State propagation clean
- Code complexity appropriate

**Grade B (80-89%):**
- No CRITICAL issues
- 0-1 HIGH issues (addressable)
- 2-3 MEDIUM issues
- Performance acceptable
- State propagation sound

**Grade C (70-79%):**
- No CRITICAL issues
- 1-2 HIGH issues (must be addressed)
- Multiple MEDIUM issues
- Minor performance concerns
- **BLOCKS MERGE** until HIGH issues resolved

**Grade D (60-69%):**
- 1+ CRITICAL issues
- **BLOCKS MERGE** - critical issues must be resolved
- Requires refactoring

**Grade F (<60%):**
- Multiple CRITICAL issues
- **BLOCKS MERGE** - feature must be redesigned
- Architectural complications threaten system stability

### Review Focus Areas

**1. Performance Bottlenecks:**
- O(n²) operations in hot paths
- Unnecessary deep cloning
- Inefficient loops or searches
- Memory leaks

**2. State Propagation Issues:**
- Stale state
- Race conditions
- Circular dependencies
- Missing updates

**3. Complexity Creep:**
- Over-abstraction
- Premature optimization
- Unclear responsibilities
- Poor separation of concerns

**4. Integration Issues:**
- Breaking changes to existing systems
- Missing cross-system updates
- Incomplete feature implementation
- Test coverage gaps

### Issue Severity Levels

**CRITICAL:**
- System crashes or hangs
- Data corruption
- Security vulnerabilities
- Determinism breaks (Monte Carlo non-reproducibility)

**HIGH:**
- Performance regressions (>50% slowdown)
- State propagation bugs (visible to users)
- Type safety violations
- Missing error handling in critical paths

**MEDIUM:**
- Minor performance issues (<50% slowdown)
- Code complexity concerns
- Documentation gaps
- Non-critical test failures

**LOW:**
- Code style issues
- Optimization opportunities
- Refactoring suggestions
- Minor documentation improvements

### Validation Outputs

**Required deliverables:**
1. Architecture review report (saved to `reviews/architecture_review_[feature]_YYYYMMDD.md`)
2. Grade assignment (A/B/C/D/F)
3. Issue list with severity ratings (CRITICAL/HIGH/MEDIUM/LOW)
4. Performance metrics (if applicable)
5. Recommendations for addressing issues

### Agent Workflow

**Architecture review must be performed by:**
- **architecture-skeptic:** Reviews implementation for performance, state propagation, complexity

**Process:**
1. architecture-skeptic scans recent commits
2. Identifies performance bottlenecks, state issues, complexity creep
3. Assigns severity ratings to each issue
4. Calculates grade based on severity distribution
5. Report saved to `reviews/` directory
6. If Grade B or higher → proceed to merge (after addressing HIGH issues)
7. If Grade C or lower → block, require fixes

---

## Combined Workflow

### Standard Feature Implementation

**Phase 1: Research Validation (QG1)**
1. Feature proposed
2. super-alignment-researcher + research-skeptic review
3. Grade assigned (A/B/C/D/F)
4. If B or higher → proceed to Phase 2
5. If D or F → block, request more research

**Phase 2: Implementation**
1. Feature implemented by simulation-maintainer or far-future-ux-designer
2. Tests written (unit + integration)
3. Monte Carlo validation (N≥10 runs, deterministic)
4. Implementation complete → proceed to Phase 3

**Phase 3: Architecture Review (QG2)**
1. architecture-skeptic reviews implementation
2. Grade assigned (A/B/C/D/F)
3. Issues identified with severity ratings
4. If B or higher + no HIGH issues → proceed to Phase 4
5. If C or lower OR HIGH issues → block, require fixes

**Phase 4: Merge & Archive**
1. Address all CRITICAL and HIGH issues
2. Merge feature to main branch
3. Update relevant specs (merge OpenSpec deltas)
4. Archive rich notes to `docs/implementation-history/`
5. Update roadmap status

### Orchestrator Coordination

For complex features, the **orchestrator** agent coordinates this workflow:

```
orchestrator spawns:
├── super-alignment-researcher + research-skeptic (QG1)
├── feature-implementer (implementation)
├── unit-test-writer + integration-test-writer (testing)
├── architecture-skeptic (QG2)
└── wiki-documentation-updater + architect (archival)
```

---

## Quality Gate Tracking

### Active Validations

Track active Quality Gate 1 validations in `openspec/specs/research/verification-queue.md`.

### Active Reviews

Track active Quality Gate 2 reviews in `openspec/specs/bugs/critical-queue.md` (or create separate tracking file if needed).

### Historical Reports

All quality gate reports MUST be saved:
- **QG1 reports:** `research/[feature]_validation_YYYYMMDD.md`
- **QG2 reports:** `reviews/architecture_review_[feature]_YYYYMMDD.md`

---

## Enforcement

### Mandatory for ALL features

Quality gates are NOT optional. All features - regardless of size or priority - MUST pass both gates.

**Exceptions:**
- **Trivial fixes:** Single-line typos, documentation-only changes (skip both gates)
- **Urgent hotfixes:** CRITICAL bugs may skip QG1 but MUST pass QG2 post-fix

### Autonomous Workers

Autonomous workers MUST follow quality gate workflow:
1. Check if feature needs research validation (if YES → spawn researchers)
2. Implement only after QG1 passes
3. Request architecture review after implementation (QG2)
4. Address issues before marking complete

### Human Developers

Human developers SHOULD follow quality gate workflow:
1. Request research validation before implementation
2. Implement following research-backed parameters
3. Request architecture review before PR
4. Address CRITICAL/HIGH issues before merge

---

## Success Metrics

**Quality gates are working when:**
1. No features bypass research validation
2. No features merge with unresolved CRITICAL/HIGH issues
3. Research quality sustained at A- or better (>80% sources from 2024-2025)
4. Architecture health sustained at B+ or better (<2 HIGH issues)
5. Monte Carlo validation shows deterministic behavior (CV < 0.01%)

---

## Related Documentation

- `openspec/specs/research/spec.md` - Research standards
- `openspec/specs/research/verification-queue.md` - Active QG1 validations
- `openspec/specs/bugs/critical-queue.md` - Bug tracking (includes QG2 blockers)
- `openspec/AGENTS.md` - AI agent workflow with quality gates
- `docs/DEVELOPMENT_WORKFLOW.md` - Detailed development workflow

---

**Status:** ACTIVE - All features must pass QG1 and QG2 before merge
