# Orchestration Plan: Game Development Phases 2-4

**Created:** 2025-12-06
**Priority:** CRITICAL
**Deadline:** 2025-12-07 EOD
**Status:** Handoffs complete, awaiting agent execution

---

## Executive Summary

**Problem:** User feedback - "This is the research tool, this is not the game."

**Root cause:** Player influence mechanics not implemented (Phases 2-4 incomplete).

**Solution:** Sequential workflow with quality gates:
1. Research & Validation (Cynthia → Sylvia)
2. Implementation (Roy + Tessa + Ray in parallel)
3. Architecture Review (architecture-skeptic)
4. Monte Carlo Validation (Priya)
5. Final Integration & Deployment

**Token budget:** ~144K available, ~60K estimated

---

## Workflow Sequence

### Phase 1: Research & Validation (Quality Gate 1)

**Agent:** super-alignment-researcher (Cynthia)
**Duration:** 2-3 hours
**Handoff:** `.claude/agents/HANDOFF_cynthia_game_advocacy_actions.md`
**Output:** `research/game_advocacy_actions_20251206.md`

**Task:** Extract research-backed parameters for 8-12 advocacy actions (public awareness, international cooperation, research funding, policy advocacy) with peer-reviewed sources (2024-2025 preferred).

**Bounds:** Single action ≤5%, per domain ≤10%, total ≤15%

---

**Agent:** research-skeptic (Sylvia)
**Duration:** 1-2 hours
**Handoff:** `.claude/agents/HANDOFF_sylvia_game_advocacy_validation.md`
**Output:** `reviews/game_advocacy_actions_critique_20251206.md`

**Task:** Validate Cynthia's research (Quality Gate 1). Check research quality, bounds compliance, simplification risks, contradictory evidence.

**Gate decision:**
- ✅ APPROVED / CONDITIONAL → Proceed to implementation
- ❌ REQUIRES REVISION / REJECTED → Loop back to Cynthia or pivot

---

### Phase 2: Implementation & Testing (Parallel)

**Agent:** simulation-maintainer (Roy)
**Duration:** 3-4 hours
**Handoff:** `.claude/agents/HANDOFF_roy_game_advocacy_implementation.md`
**Output:**
- `src/game/data/advocacyActions.ts` (12 actions with research sources)
- Updated `src/game/core/GameSession.ts` (player resources, costs, cooldowns, regeneration)
- Updated `src/game/core/InfluenceCalculator.ts` (catalog import)

**Tasks:**
- 2.3: Create advocacy action catalog
- 2.4: Wire GameSession integration (resources, costs, cooldowns, regeneration)

---

**Agent:** far-future-ux-designer (Tessa)
**Duration:** 5-7 hours
**Handoff:** `.claude/agents/HANDOFF_tessa_game_ui_implementation.md`
**Output:**
- `src/components/dashboards/game/ActionPanel.tsx` (action buttons, resources, cooldowns)
- `src/components/dashboards/game/EventLog.tsx` (real events with attribution)
- `src/components/dashboards/game/OutcomeChart.tsx` (probability distributions)

**Tasks:**
- 2.5: ActionPanel UI
- 4.1: OutcomeChart (probability visualization)
- 4.2: EventLog (event display with attribution)

**Aesthetic:** Elysium-inspired (clean, minimal, soft blue/white, uncertainty shown)

---

**Agent:** sci-fi-tech-visionary (Ray)
**Duration:** 2-3 hours
**Handoff:** `.claude/agents/HANDOFF_ray_game_tutorial.md`
**Output:** `src/game/data/tutorialContent.ts` (500-800 words, 6 sections)

**Task:** 2.6: Write tutorial content framing indirect influence, uncertainty, realistic expectations. Must pass Sylvia review (Quality Gate 1.5).

---

### Phase 3: Architecture Review (Quality Gate 2)

**Agent:** architecture-skeptic
**Duration:** 1-2 hours
**Handoff:** `.claude/agents/HANDOFF_architect_game_architecture_review.md`
**Output:** `reviews/game_integration_architecture_20251206.md`

**Task:** 4.4: Review performance (no O(n²), deep cloning), state propagation (no circular deps), complexity, defensive coding.

**Gate decision:**
- ✅ PASS / CONDITIONAL → Proceed to Monte Carlo validation
- ❌ FAIL → Address CRITICAL issues, re-review required

---

### Phase 4: Monte Carlo Validation

**Agent:** priya
**Duration:** 3-4 hours
**Handoff:** `.claude/agents/HANDOFF_priya_game_monte_carlo.md`
**Output:** `reviews/game_scenario_validation_20251206.md`

**Task:** 4.5 + 3.4: Run N=100 per scenario (300 total). Verify:
- Determinism (CV < 0.01%)
- Player agency bounds (<20% outcome shift)
- Scenarios within ±15% of baseline
- Outcome distributions realistic

**Gate decision:**
- ✅ APPROVED → Proceed to deployment
- ❌ REQUIRES FIXES → Back to Roy/Tessa

---

### Phase 5: Final Integration (If Needed)

**Agents:** simulation-maintainer (Roy) + far-future-ux-designer (Tessa)
**Duration:** 2-3 hours
**Task:** Address any Monte Carlo validation issues, polish UI, final integration

---

### Phase 6: Documentation & Archival

**Agent:** wiki-documentation-updater
**Duration:** 1-2 hours
**Task:** 4.6: Update `docs/wiki/README.md` with game layer architecture, advocacy mechanics, scenarios, tutorial

---

**Agent:** project-plan-manager (architect)
**Duration:** 1 hour
**Task:** Archive completed plans to `plans/completed/`, update roadmap, clean up

---

## Success Criteria

Full workflow complete when:

1. ✅ Research validated (Sylvia approval)
2. ✅ Implementation complete (Roy + Tessa + Ray)
3. ✅ Architecture reviewed (no CRITICAL/HIGH issues)
4. ✅ Monte Carlo validated (determinism, bounds, scenarios)
5. ✅ Documentation updated
6. ✅ Deployed to production (http://34.32.105.178/game-dashboard-demo)

**User can:**
- Select scenario (baseline, optimistic, pessimistic)
- Queue advocacy actions
- See actions affect simulation outcomes
- View probability distributions
- Read events with attribution

---

## Quality Gates (NON-NEGOTIABLE)

**Gate 1: Research Validation**
- Sylvia approves all parameters before implementation
- If FAIL: Loop back to Cynthia or pivot

**Gate 1.5: Tutorial Validation**
- Sylvia approves tutorial content
- If FAIL: Ray revises

**Gate 2: Architecture Review**
- architecture-skeptic finds no CRITICAL/HIGH issues
- If FAIL: Roy/Tessa address issues, re-review

**Gate 3: Monte Carlo Validation**
- Priya confirms determinism, bounds, scenarios
- If FAIL: Roy/Tessa fix issues, re-validate

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Parameter drift during implementation | Research validity compromised | Sylvia veto on all parameter changes |
| Player agency exceeds bounds | Unrealistic outcomes | Monte Carlo validation enforces <20% deviation |
| UI obscures uncertainty | False precision | Sylvia review of all data displays |
| Tutorial creates misconceptions | Player misunderstanding | Sylvia approval required |
| Scope creep | Deadline missed | Focus on 8-12 core actions only |
| Architecture issues late | Rework delays | Early architecture review (Gate 2) |

---

## Coordination Protocol

### Chatroom channels

- **coordination** - Orchestrator posts workflow updates
- **research** - Cynthia + Sylvia coordination
- **research-critique** - Sylvia validation discussions
- **implementation** - Roy + Tessa + Ray coordination
- **architecture** - architecture-skeptic review
- **testing** - Priya Monte Carlo validation

### Status updates

Agents should post at:
- Task start (STARTED)
- Major milestones (IN-PROGRESS)
- Blockers (BLOCKED)
- Task complete (COMPLETED)
- Handoffs (HANDOFF)

Format:
```markdown
---
**agent-name** | YYYY-MM-DD HH:MM | [STATUS]

[Brief update]

**Output:** [Files created/modified]
**Handoff:** [Next agent]
**Next:** [What happens next]
---
```

---

## Token Budget Tracking

| Phase | Agent | Estimated | Actual |
|-------|-------|-----------|--------|
| 1.1 | Cynthia | 10k | - |
| 1.2 | Sylvia | 6k | - |
| 2.3-2.4 | Roy | 8k | - |
| 2.5, 4.1-4.2 | Tessa | 12k | - |
| 2.6 | Ray | 6k | - |
| 3 | architecture-skeptic | 4k | - |
| 4 | Priya | 8k | - |
| 5 | Roy + Tessa | 4k | - |
| 6 | wiki + architect | 2k | - |
| **TOTAL** | | **60k** | **0k** |

**Remaining:** 144K - 60K = 84K buffer

---

## Timeline

**Dec 6 (Today):**
- Orchestrator creates handoffs ✅
- Agents begin execution (Cynthia → Sylvia → Roy/Tessa/Ray)

**Dec 7 (Deadline):**
- Architecture review complete
- Monte Carlo validation complete
- Deployment to production
- User testing

---

## References

- **Orchestration spec:** `plans/GAME_IMPLEMENTATION_ORCHESTRATION_SPEC.md`
- **Execution plans:**
  - `plans/PHASE2_PLAYER_AGENCY_EXECUTION_PLAN.md`
  - `plans/PHASE3_RESEARCH_SCENARIOS_EXECUTION_PLAN.md`
  - `plans/PHASE4_INTEGRATION_POLISH_EXECUTION_PLAN.md`
- **Handoff documents:**
  - `.claude/agents/HANDOFF_cynthia_game_advocacy_actions.md`
  - `.claude/agents/HANDOFF_sylvia_game_advocacy_validation.md`
  - `.claude/agents/HANDOFF_roy_game_advocacy_implementation.md`
  - `.claude/agents/HANDOFF_tessa_game_ui_implementation.md`
  - `.claude/agents/HANDOFF_ray_game_tutorial.md`
  - `.claude/agents/HANDOFF_architect_game_architecture_review.md`
  - `.claude/agents/HANDOFF_priya_game_monte_carlo.md`

---

## Next Steps

1. **Human/autonomous worker picks up first handoff** (Cynthia's research)
2. **Execute sequentially** (Cynthia → Sylvia → parallel implementation)
3. **Pass quality gates** (research validation → architecture review → Monte Carlo)
4. **Deploy to production**
5. **User testing**

**Orchestrator role:** Monitor coordination channel, track progress, escalate blockers.
