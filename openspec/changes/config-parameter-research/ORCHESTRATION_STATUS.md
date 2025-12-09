# Configuration Parameter Research - Orchestration Status

**Created:** December 9, 2025
**Orchestrator:** orchestrator-1
**Status:** Phase 1.1 (Research) - Handoff Created

---

## Workflow Overview

**Goal:** Replace 19 `[RESEARCH NEEDED]` tags in centralConfig.ts with peer-reviewed justifications to raise research quality grade from C (53.4%) to B+ (>70%).

**Phase 1 Focus (HIGH priority):**
1. Social cohesion decay/recovery rates
2. Migration evacuation fractions
3. Economic collapse definitions

---

## Current Status

### Phase 1.1: Research Extraction (ACTIVE)

**Agent:** super-alignment-researcher (Cynthia)
**Handoff:** `.claude/agents/HANDOFF_cynthia_config_params_phase1.md`
**Timeline:** 4-6 hours
**Output:** `research/config_parameters_justification_20251209.md`

**Parameters to Research:**
- SOCIAL_COHESION_DECAY_RATE (line 292)
- SOCIAL_COHESION_RECOVERY_RATE (line 465)
- MIGRATION_EVACUATION_FRACTION (line 607)
- MAJOR_ECONOMY_COLLAPSE_ECONOMIC_THRESHOLD (line 693)
- MAJOR_ECONOMY_POPULATION_THRESHOLD (line 700)
- MAJOR_ECONOMY_GLOBAL_CRISIS_THRESHOLD (line 714)

**Quality Standards:**
- 2+ peer-reviewed sources per parameter
- Prefer 2024-2025 sources
- Extract exact numerical values
- Document uncertainty ranges

**Next Human Action:**
```bash
# Invoke Cynthia with handoff context
claude agent run super-alignment-researcher < .claude/agents/HANDOFF_cynthia_config_params_phase1.md
```

---

## Pending Phases

### Phase 1.2: Research Validation (Quality Gate 1)

**Agent:** research-skeptic (Sylvia)
**Handoff:** `.claude/agents/HANDOFF_sylvia_config_params_validation.md`
**Timeline:** 2-3 hours
**Output:** `reviews/config_params_critique_20251209.md`

**Trigger:** After Cynthia completes research
**Success Criteria:** Grade B+ or better
**Decisions:**
- PASS → Proceed to implementation
- CONDITIONAL PASS → Proceed with caveats
- FAIL → Return to research phase

**Next Human Action (after Cynthia done):**
```bash
# Invoke Sylvia with handoff context
claude agent run research-skeptic < .claude/agents/HANDOFF_sylvia_config_params_validation.md
```

### Phase 1.3: Implementation

**Agent:** simulation-maintainer (Roy)
**Handoff:** `.claude/agents/HANDOFF_roy_config_params_implementation.md`
**Timeline:** 2 hours
**Output:** Updated `src/simulation/config/centralConfig.ts`

**Trigger:** After Sylvia validation PASS
**Tasks:**
- Replace [RESEARCH NEEDED] tags with citations
- Update parameter values if research suggests changes
- Run type check, tests, Monte Carlo validation

**Next Human Action (after Sylvia PASS):**
```bash
# Invoke Roy with handoff context
claude agent run simulation-maintainer < .claude/agents/HANDOFF_roy_config_params_implementation.md
```

### Phase 1.4: Architecture Review (Quality Gate 2)

**Agent:** architecture-skeptic
**Timeline:** 1-2 hours
**Output:** Architecture review

**Trigger:** After Roy completes implementation
**Focus:** Monte Carlo validation, no regressions

### Phase 1.5: Documentation & Archival

**Agents:** wiki-documentation-updater, architect
**Timeline:** 1 hour
**Tasks:**
- Update OpenSpec research quality metrics (C → B+)
- Archive to docs/implementation-history/
- Update progress tracking

---

## Monitoring

### Check Research Progress

```bash
# Run monitoring script
./scripts/monitor_research_phase1.sh

# Manual checks
ls -lh research/config_parameters_justification_20251209.md
tail -30 .claude/chatroom/channels/research.md
```

### Expected Timeline

- **Phase 1.1 (Research):** 2025-12-09 ~07:00 → ~11:00-13:00 (4-6 hours)
- **Phase 1.2 (Validation):** ~13:00 → ~15:00-18:00 (2-3 hours)
- **Phase 1.3 (Implementation):** ~18:00 → ~20:00 (2 hours)
- **Phase 1.4-1.5 (Review + Docs):** ~20:00 → ~22:00 (2 hours)

**Total:** ~10-13 hours (1-2 work days)

---

## Communication Channels

**Coordination:** `.claude/chatroom/channels/coordination.md`
- Workflow status, phase transitions, blockers

**Research:** `.claude/chatroom/channels/research.md`
- Cynthia progress updates
- Research questions and findings

**Research-Critique:** `.claude/chatroom/channels/research-critique.md`
- Sylvia validation process
- Quality concerns and recommendations

**Implementation:** `.claude/chatroom/channels/implementation.md`
- Roy implementation progress
- Test results, Monte Carlo validation

---

## Success Criteria

**Research Quality:**
- ✅ 70%+ sources from 2024-2025
- ✅ 2+ peer-reviewed sources per parameter
- ✅ Numerical values extracted from data
- ✅ Uncertainty ranges documented

**Functional:**
- ✅ All [RESEARCH NEEDED] tags replaced with @research citations
- ✅ TypeScript compiles without errors
- ✅ All tests pass
- ✅ Monte Carlo CV < 0.01% (determinism maintained)
- ✅ No outcome distribution regressions

**Impact:**
- ✅ Research quality grade: C → B+
- ✅ Parameters defensible in peer review
- ✅ Simulation credibility improved

---

## Files Created

**Handoffs:**
- `.claude/agents/HANDOFF_cynthia_config_params_phase1.md`
- `.claude/agents/HANDOFF_sylvia_config_params_validation.md`
- `.claude/agents/HANDOFF_roy_config_params_implementation.md`

**Scripts:**
- `scripts/monitor_research_phase1.sh`

**Documentation:**
- `openspec/changes/config-parameter-research/proposal.md` (pre-existing)
- `openspec/changes/config-parameter-research/ORCHESTRATION_STATUS.md` (this file)

**Expected Outputs:**
- `research/config_parameters_justification_20251209.md` (Cynthia)
- `reviews/config_params_critique_20251209.md` (Sylvia)
- Updated `src/simulation/config/centralConfig.ts` (Roy)
- `logs/mc_post_config_update_20251209.log` (Monte Carlo validation)

---

## Blockers / Questions

**None currently.** Workflow setup complete, waiting for human to invoke Cynthia.

---

## Next Steps

1. **Human:** Invoke Cynthia with HANDOFF_cynthia_config_params_phase1.md
2. **Orchestrator:** Monitor research channel for Cynthia completion (~4-6 hours)
3. **Human:** Invoke Sylvia with HANDOFF_sylvia_config_params_validation.md
4. **Orchestrator:** Check validation result (PASS/FAIL)
5. **If PASS:** Human invokes Roy with HANDOFF_roy_config_params_implementation.md
6. **Orchestrator:** Spawn architecture-skeptic for Quality Gate 2
7. **Orchestrator:** Update OpenSpec metrics, archive implementation

---

**Last Updated:** 2025-12-09 07:01
**Orchestrator Status:** Awaiting Phase 1.1 start
