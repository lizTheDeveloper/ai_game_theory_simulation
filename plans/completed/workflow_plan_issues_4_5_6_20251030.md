# Workflow Plan: Monte Carlo Validation Issues #4, #5, #6

**Date:** October 30, 2025
**Orchestrator:** orchestrator-1
**Source:** `/reviews/monte_carlo_validation_critique_20251030.md` (Sylvia's critique)
**Priority:** HIGH - Blocks research validity of entire simulation
**Timeline:** 14-21 hours across 6 sequential agent invocations

---

## Executive Summary

The simulation currently shows three critical research validity failures:
1. **74-81% mortality rates** - Exceeds all historical precedents, lacks stabilizing mechanisms
2. **100% dystopia outcomes** - No variance despite Monte Carlo randomness
3. **Homogeneous famine** - 100% regional impact, ignores Sen's distribution theory

This workflow coordinates the full research → validation → implementation → review → documentation pipeline to fix these issues with research-backed mechanisms.

---

## Three Issues

### Issue #4: 74-81% Mortality Rates Unjustified
**Problem:** Current mortality exceeds Black Death (30-60%), matches Toba extinction (60-90%)

**Missing Mechanisms:**
- International cooperation during crisis (emergency aid, resource sharing)
- Adaptation mechanisms (behavioral, technological, cultural responses)
- Migration/relocation (successful relocation, not just trapped populations)
- Government emergency response (effectiveness, resource mobilization)

**Expected Fix:** Mortality reduced to <60% (historical maximum)

### Issue #5: 100% Dystopia Outcome - No Variance
**Problem:** N=10 runs show 80% "Ecological/Indigenous Dystopia", 20% "Ecological Dystopia", 0% other

**Root Causes:**
- Random events have negligible impact (defeats Monte Carlo purpose)
- Initial conditions overdetermine outcomes (no path dependence)
- Positive feedback loops dominate recovery mechanics (doom loops inevitable)

**Expected Fix:** >3 distinct outcome types with meaningful variance

### Issue #6: Famine Mechanism Homogeneity
**Problem:** 100% famine occurrence across all 10 regions, production-based only

**Sen's Theory:** Famines are distributional failures (Bengal 1943: famine WITH rice exports)

**Missing Dynamics:**
- Distribution networks (transport, storage, markets)
- Entitlement systems (market/income/employment impact on food access)
- Political factors (conflict, aid blockades, governance failure)
- Regional heterogeneity (vulnerability, capacity, trade dependence)

**Expected Fix:** Regional variance with <50% regions affected

---

## Sequential Workflow

### Phase 0: Planning ✅ COMPLETE
**Duration:** 1 hour
**Agent:** Orchestrator
**Deliverables:**
- ✅ Comprehensive research prompt: `/tmp/research_prompt_issues_4_5_6.md` (350 lines)
- ✅ Roadmap updates: Issues #4, #5, #6 status tracked
- ✅ Handoff posted to research channel

---

### Phase 1A: Research ⏳ PENDING USER INVOCATION
**Duration:** 4-6 hours
**Agent:** Cynthia (super-alignment-researcher)
**Invocation:** `"Cynthia, complete the research request in /tmp/research_prompt_issues_4_5_6.md"`

**Tasks:**
1. **Mortality Stabilizing Mechanisms** (1.5-2h)
   - Find peer-reviewed sources on aid effectiveness, adaptation, migration, emergency response
   - Extract quantitative parameters for implementation
   - Deliverable: `/research/mortality_stabilizing_mechanisms_20251030.md`

2. **Outcome Variance Mechanisms** (1-1.5h)
   - Research Monte Carlo best practices, historical crisis variance, recovery mechanisms
   - Identify bifurcation points and threshold parameters
   - Deliverable: `/research/outcome_variance_mechanisms_20251030.md`

3. **Famine Distribution Mechanisms** (1.5-2.5h)
   - Extract Sen's entitlement theory parameters
   - Research distribution network failures, regional heterogeneity factors
   - Deliverable: `/research/famine_distribution_mechanisms_20251030.md`

**Research Standards (ALL THREE):**
- 2+ peer-reviewed sources per claim (2024-2025 preferred)
- Quantitative parameters for implementation
- Mechanism descriptions (how it works, not just effects)
- Implementation guidance (JSDoc comments, function signatures)

**Success Criteria:**
- All three research documents created with peer-reviewed sources
- Parameters clear enough for Roy (simulation-maintainer) to implement
- No speculative values - everything research-backed
- Summary posted to research channel

---

### Phase 1B: Research Validation ⏳ PENDING
**Duration:** 1-2 hours
**Agent:** Sylvia (research-skeptic)
**Invocation:** `"Sylvia, validate the three research documents Cynthia just created"`
**Quality Gate 1:** MANDATORY - Must pass before implementation

**Tasks:**
1. Review `/research/mortality_stabilizing_mechanisms_20251030.md`
2. Review `/research/outcome_variance_mechanisms_20251030.md`
3. Review `/research/famine_distribution_mechanisms_20251030.md`
4. Find contradictory evidence, check for overconfidence
5. Post critique to research-critique channel

**Pass Criteria:**
- No fatal methodological flaws
- Parameters justified by data (not speculative)
- Sources appropriately peer-reviewed (not blog posts)
- Implementation guidance clear and actionable

**Fail Criteria:**
- Fabricated citations (loop back to Cynthia)
- Speculative parameters without data (request additional research)
- Contradictory evidence not addressed (request revision)

**If Fails:** Loop back to Phase 1A with specific corrections needed

---

### Phase 2: Implementation ⏳ PENDING
**Duration:** 6-8 hours
**Agent:** Roy (simulation-maintainer)
**Invocation:** `"Roy, implement the research-backed mechanisms from the three validated research documents"`

**Tasks:**
1. **Mortality Stabilizing Mechanisms**
   - Add international cooperation system (aid effectiveness, resource sharing)
   - Add adaptation mechanisms (behavioral, technological responses)
   - Add migration/relocation success logic
   - Add government emergency response effectiveness

2. **Outcome Variance Mechanisms**
   - Audit Monte Carlo randomness weighting
   - Add bifurcation points and threshold parameters
   - Strengthen recovery mechanisms (upward spirals)
   - Test sensitivity to initial conditions

3. **Famine Distribution Mechanisms**
   - Redesign famine system using Sen's entitlement theory
   - Add distribution networks (transport, storage, markets)
   - Add regional heterogeneity factors
   - Integrate political/conflict factors from governance system

**Coding Standards:**
- Use assertion utilities (`assertFinite`, `assertInRange`, `assertStateProperty`)
- No silent fallbacks (fail loudly with context)
- JSDoc citations to research documents
- Emoji conventions (one canonical emoji per concept)
- Deterministic RNG (use `rng()` parameter, never `Math.random()`)

**Deliverables:**
- Working code in `src/simulation/`
- Type checking passes (`npx tsc --noEmit`)
- Basic tests pass (`npm test`)
- Implementation posted to implementation channel

---

### Phase 3: Monte Carlo Validation ⏳ PENDING
**Duration:** 2-3 hours
**Agent:** User (command-line)
**Command:**
```bash
npx tsx scripts/monteCarloSimulation.ts --runs 10 > logs/mc_validation_issues_4_5_6_$(date +%Y%m%d_%H%M%S).log 2>&1 &
```

**Validation Criteria:**
1. **Mortality Rates:** Reduced to <60% (historical maximum)
   - Current: 74-81% → Expected: 30-60%
   - Verify stabilizing mechanisms functioning (aid, adaptation, migration, emergency response)

2. **Outcome Variance:** >3 distinct outcome types
   - Current: 80% Ecological/Indigenous Dystopia, 20% Ecological Dystopia
   - Expected: Mix of utopia, status quo, dystopia, collapse with meaningful variance

3. **Famine Regional Heterogeneity:** <50% regions affected
   - Current: 100% homogeneous impact
   - Expected: Distribution failures show regional variance (some areas more vulnerable)

**Analysis:**
- Parse log file for outcome distribution
- Check mortality statistics (mean, std dev, min, max)
- Verify famine regional variance (histogram of affected regions)
- Document improvements in validation report

---

### Phase 4: Architecture Review ⏳ PENDING
**Duration:** 1-2 hours
**Agent:** Architecture-skeptic
**Invocation:** `"Architecture-skeptic, review the Monte Carlo validation fixes for issues #4, #5, #6"`
**Quality Gate 2:** MANDATORY - Must address CRITICAL/HIGH issues

**Review Focus:**
1. **Performance:** Check for O(n²) loops, deep cloning, inefficient algorithms
2. **State Propagation:** Verify new systems properly update/read GameState
3. **Complexity:** Identify unnecessary abstractions or over-engineering
4. **Integration:** Check interactions with existing systems (environmental, social, government)

**Severity Levels:**
- **CRITICAL:** Must fix before proceeding (blocks merge)
- **HIGH:** Strongly recommended to fix (technical debt)
- **MEDIUM:** Nice to have (future improvement)
- **LOW:** Minor polish (optional)

**Deliverables:**
- Review document: `/reviews/issues_4_5_6_architecture_20251030.md`
- Posted to coordination channel

**If CRITICAL/HIGH Issues:** Roy must address before Phase 5

---

### Phase 5: Documentation ⏳ PENDING
**Duration:** 1-2 hours
**Agent:** Historian (wiki-documentation-updater)
**Invocation:** `"Historian, update documentation with the new stabilizing mechanisms from issues #4, #5, #6"`

**Tasks:**
1. **Update Wiki** (`docs/wiki/README.md`):
   - Add section on mortality stabilizing mechanisms (aid, adaptation, migration, emergency response)
   - Add section on outcome variance mechanisms (bifurcation points, recovery dynamics)
   - Add section on famine distribution system (Sen's entitlement theory implementation)

2. **Create Devlog** (`devlogs/monte_carlo_validation_fixes_20251030.md`):
   - Document the three issues and root causes
   - Summarize research findings (key papers, parameters)
   - Describe implementation approach
   - Show Monte Carlo validation results (before/after)
   - Lessons learned

3. **Update Research Index** (`research/README.md`):
   - Add three new research documents to index
   - Cross-reference with related research

**Deliverables:**
- Updated wiki with new systems documented
- Devlog capturing full workflow
- Research index updated

---

### Phase 6: Roadmap Cleanup ⏳ PENDING
**Duration:** 15 minutes
**Agent:** Architect
**Invocation:** `"Architect, mark issues #4, #5, #6 as complete in roadmap"`

**Tasks:**
1. Update `plans/MASTER_IMPLEMENTATION_ROADMAP.md`:
   - Change status from 🔄 IN PROGRESS to ✅ COMPLETE
   - Update Phase tracking (all phases marked ✅)
   - Add completion date
   - Add links to deliverables

2. Archive this workflow plan:
   - Move to `/plans/completed/workflow_plan_issues_4_5_6_20251030.md`

**Deliverables:**
- Roadmap updated with completion status
- Workflow plan archived

---

## Quality Gates

### Quality Gate 1: Research Validation (Phase 1B)
**Gatekeeper:** Sylvia (research-skeptic)
**Criteria:**
- ❌ Fatal methodological flaws → Loop back to research
- ❌ Speculative parameters → Request additional research
- ✅ Research-backed, peer-reviewed, implementable → Proceed to implementation

### Quality Gate 2: Architecture Review (Phase 4)
**Gatekeeper:** Architecture-skeptic
**Criteria:**
- ❌ CRITICAL performance/integration issues → Fix before proceeding
- ⚠️ HIGH issues → Strongly recommended to fix
- ✅ No CRITICAL issues → Proceed to documentation

---

## Success Criteria

Workflow is complete when:
- ✅ All three research documents created with peer-reviewed sources
- ✅ Both quality gates passed (research validation + architecture review)
- ✅ Monte Carlo validation shows improvements:
  - Mortality: 74-81% → <60%
  - Outcome variance: 100% dystopia → >3 types
  - Famine: 100% homogeneous → <50% regional impact
- ✅ Code implemented with defensive assertions (no silent fallbacks)
- ✅ Documentation updated (wiki + devlog)
- ✅ Roadmap marked complete

---

## Key Files

**Planning:**
- `/tmp/research_prompt_issues_4_5_6.md` - Comprehensive research request (350 lines)
- `/plans/MASTER_IMPLEMENTATION_ROADMAP.md` - Issues #4, #5, #6 tracking

**Research (Phase 1A deliverables):**
- `/research/mortality_stabilizing_mechanisms_20251030.md`
- `/research/outcome_variance_mechanisms_20251030.md`
- `/research/famine_distribution_mechanisms_20251030.md`

**Implementation (Phase 2):**
- `src/simulation/` - Core simulation code with new mechanisms

**Validation (Phase 3):**
- `logs/mc_validation_issues_4_5_6_*.log` - Monte Carlo results

**Review (Phase 4):**
- `/reviews/issues_4_5_6_architecture_20251030.md`

**Documentation (Phase 5):**
- `docs/wiki/README.md` - Updated with new systems
- `devlogs/monte_carlo_validation_fixes_20251030.md`

**Coordination:**
- `.claude/chatroom/channels/coordination.md` - Workflow status updates
- `.claude/chatroom/channels/research.md` - Research handoffs and validation
- `.claude/chatroom/channels/implementation.md` - Implementation progress

---

## Timeline Estimate

| Phase | Agent | Duration | Dependencies |
|-------|-------|----------|--------------|
| 0. Planning | Orchestrator | 1h | None |
| 1A. Research | Cynthia | 4-6h | Phase 0 |
| 1B. Validation | Sylvia | 1-2h | Phase 1A |
| 2. Implementation | Roy | 6-8h | Phase 1B (QG1 pass) |
| 3. Monte Carlo | User | 2-3h | Phase 2 |
| 4. Arch Review | Architecture-skeptic | 1-2h | Phase 3 |
| 5. Documentation | Historian | 1-2h | Phase 4 (QG2 pass) |
| 6. Roadmap | Architect | 15min | Phase 5 |

**Total:** 14-21 hours across 6 sequential agent invocations

---

## Next Action

**User should invoke:**
```
"Cynthia, complete the research request in /tmp/research_prompt_issues_4_5_6.md"
```

Cynthia will:
1. Recall her memory: `mcp__agent-memory__recall_context({agent_id: "cynthia"})`
2. Read the research prompt: `/tmp/research_prompt_issues_4_5_6.md`
3. Conduct research for all three issues
4. Create three research documents with peer-reviewed sources
5. Post summary to research channel
6. Update her memory before exit

---

*Workflow coordinated by orchestrator-1 on October 30, 2025*
*Source: Sylvia's critique `/reviews/monte_carlo_validation_critique_20251030.md`*
