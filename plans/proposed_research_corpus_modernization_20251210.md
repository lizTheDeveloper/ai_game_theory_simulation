# Research Corpus Modernization - Plan Proposal

**Created:** December 10, 2025
**Status:** PROPOSED
**Priority:** MEDIUM (epistemic debt, not simulation-blocking)
**Effort Estimate:** 2-3 weeks (phased approach)

---

## Problem Statement

Research audit revealed **31.6% of sources are >5 years old** (target: <5%), creating epistemic debt and reducing confidence in parameter calibration.

**Current State:**
- 567 research files total
- 179 files (31.6%) with sources >5 years old
- Some critical files have sources from 1989-2007 (18-36 years old)
- Research quality grade: C+ (76.9% sources from 2024-2025)

**Impact:**
- Outdated parameters may not reflect current understanding
- Reduced credibility for research-backed realism goal
- Risk of missed contradictory evidence from recent studies

---

## Proposed Solution

**Three-phase modernization:**

### Phase 1: Critical Systems Update (Week 1)
Priority files affecting simulation parameters:
1. `catastrophe-recovery-analysis-phase1c_20251017.md` (oldest: 1989, 36 years)
2. `climate_collapse_timelines_20251026.md` (oldest: 2007, 18 years)
3. `ai_coordination_transition_mechanics_20251121.md` (oldest: 1990, 35 years)

**Approach:**
- Search for 2024-2025 updates on same topics
- Cross-check if simulation parameters still valid
- Update citations or flag for recalibration

### Phase 2: Moderate Priority (Week 2)
Files with 3-5 year old sources (27 files, 4.8%):
- Review for recent contradictory evidence
- Update parameters if needed
- Mark as "validated current" if no changes

### Phase 3: Systematic Corpus Refresh (Week 3)
Remaining 179 critical files:
- Automated search for recent papers (WebSearch + arxiv API)
- Bulk citation updates
- Quality gate: Achieve <5% sources >5 years old

---

## Research Needed

**Domains to prioritize:**
1. Climate collapse timelines (IPCC AR7 Working Group, 2024-2025)
2. Catastrophe recovery mechanisms (recent resilience research)
3. AI coordination dynamics (OpenAI, Anthropic, DeepMind 2024-2025)
4. Energy infrastructure limits (IEA, datacenter studies 2024-2025)

**Method:**
- Use super-alignment-researcher agent for literature search
- Cross-check with research-skeptic for contradictory evidence
- Document parameter changes in OpenSpec change proposals

---

## Implementation Strategy

**Tools:**
- `super-alignment-researcher` agent (literature search)
- `research-skeptic` agent (validation)
- `wiki-documentation-updater` (documentation sync)

**Quality Gates:**
- QG1: Each updated file must have 2+ peer-reviewed sources (2024-2025)
- QG2: Parameters must be justified from research data (not estimated)

**Success Criteria:**
- <5% sources >5 years old (from 31.6%)
- Research quality grade: A- or better (from C+)
- All critical simulation parameters have 2024-2025 citations

---

## Effort Estimate

**Phase 1 (Critical):** 1 week (3 files, deep research)
**Phase 2 (Moderate):** 1 week (27 files, validation)
**Phase 3 (Systematic):** 1 week (179 files, bulk update)

**Total:** 2-3 weeks

**Parallelization:** Can run alongside MEDIUM priority implementation work (M-1 dual energy systems)

---

## Expected Benefits

1. **Improved research credibility** - Grade C+ → A-
2. **Updated parameter confidence** - Modern understanding
3. **Reduced epistemic debt** - Clear research provenance
4. **Enhanced Monte Carlo validation** - Better baseline expectations

---

## Related Work

- Research Source Validation Audit (Dec 10, 2025)
- Sleeper Agent Research Debate (Dec 10, 2025)
- M-8: Sleeper agent rate documentation (30 min quick fix)

---

## Next Steps

1. Review this proposal with PM/team
2. Create OpenSpec change proposal if approved
3. Spawn super-alignment-researcher for Phase 1
4. Track progress in research verification queue
