# Orchestration Plan: Irreversibility Framework Phase 2

**Date:** 2025-11-18
**Orchestrator:** orchestrator-1
**Status:** READY FOR EXECUTION
**Branch:** `claude/implement-w-feature-01XEoXAegA8uLD9pC4TFd2y6`

---

## Current State Analysis

✅ **COMPLETE:**
- Research (75KB, 41 sources, Grade B-)
- Research critique (conditional pass)
- Implementation plan (34KB, comprehensive)
- Type definitions (planetaryBoundaries.ts, irreversibility.ts)
- Utility functions (asymptoteRecovery, legacyStockRelease)

⏸️ **PENDING:**
- Phase 2: Integration into novelEntities.ts
- Phase 2: Testing & validation
- Phase 3: Architecture review
- Phase 4: Documentation & archival

**Problem Identified:** The `novelEntities.ts` file does NOT currently call `asymptoteRecovery()` or `legacyStockRelease()`. The mechanics exist but aren't wired in.

---

## Execution Plan

### Phase 2: Implementation (3-4 hours)

**Agent:** `simulation-maintainer` (Roy)

**Handoff Document:** `/home/user/ai_game_theory_simulation/.claude/agents/HANDOFF_roy_irreversibility_final_integration.md`

**Primary Reference:** `/home/user/ai_game_theory_simulation/plans/irreversibility_framework_implementation_20251116.md`

**Key Changes Required:**

1. **Integrate asymptotic recovery** into `src/simulation/novelEntities.ts`
   - Import utility functions
   - Apply to Novel Entities boundary
   - 75-year half-life, 15% floor

2. **Add prevention-first logic**
   - Prevention: 60-90% effectiveness (no energy trap)
   - Cleanup: 10-25% effectiveness (energy gated)

3. **Update initialization** in `src/simulation/initialization.ts`
   - Set `irreversible: true`
   - Set `recoveryHalfLife: 75`
   - Set `minimumAsymptoticValue: 0.15`
   - Set `legacyStock: 46000`

4. **Apply defensive coding standards**
   - Use assertion utilities
   - No silent fallbacks
   - Fail loudly

**Expected Outcome:**
- Novel entities effectiveness: 0% → 20-40% (with prevention + fusion)
- Multi-century recovery timescales
- 15% asymptotic floor enforced

---

### Phase 2: Testing (1 hour)

**Commands:**
```bash
# Type check
npx tsc --noEmit

# Monte Carlo validation (N=10)
npx tsx scripts/monteCarloSimulation.ts > logs/mc_irreversibility_$(date +%Y%m%d_%H%M%S).log 2>&1 &
```

**Pass Criteria:**
- CV < 0.01% (deterministic)
- Effectiveness > 0% (currently 0%)
- No NaN values
- Realistic outcome distributions

---

### Phase 3: Architecture Review (1 hour)

**Agent:** `architecture-skeptic`

**Quality Gate 2:** MANDATORY
- Must address CRITICAL/HIGH issues before proceeding

---

### Phase 4: Documentation & Archival (1.5 hours)

**Agent:** `wiki-documentation-updater` (historian)
- Update `/home/user/ai_game_theory_simulation/docs/wiki/README.md`
- Add irreversibility framework section

**Agent:** `architect`
- Move plan to `/home/user/ai_game_theory_simulation/plans/completed/`
- Update MASTER_IMPLEMENTATION_ROADMAP.md

---

## Agent Invocation

### Option A: Direct Invocation (If supported)

```typescript
// Phase 2: Implementation
Task({
  subagent_type: "simulation-maintainer",
  description: "Complete irreversibility framework integration",
  prompt: "Please complete the integration described in .claude/agents/HANDOFF_roy_irreversibility_final_integration.md. Wire asymptotic recovery mechanics into novelEntities.ts, add prevention-first logic, and update initialization."
})

// Phase 3: Architecture Review (after Phase 2)
Task({
  subagent_type: "architecture-skeptic",
  description: "Review irreversibility framework architecture",
  prompt: "Review the completed irreversibility framework integration. Check for performance issues, state propagation problems, and complexity creep. Focus on the changes in novelEntities.ts and initialization.ts."
})

// Phase 4: Documentation (after Phase 3)
Task({
  subagent_type: "wiki-documentation-updater",
  description: "Update wiki with irreversibility framework",
  prompt: "Add irreversibility framework section to docs/wiki/README.md. Describe asymptotic recovery, legacy stock release, energy gates, and prevention-first paradigm."
})

// Phase 4: Archival (final step)
Task({
  subagent_type: "architect",
  description: "Archive irreversibility framework plan",
  prompt: "Move plans/irreversibility_framework_implementation_20251116.md to plans/completed/. Update MASTER_IMPLEMENTATION_ROADMAP.md progress summary."
})
```

### Option B: Manual Coordination (If direct invocation not available)

1. Open new Claude Code session
2. Reference: `.claude/agents/simulation-maintainer.md`
3. Task: `.claude/agents/HANDOFF_roy_irreversibility_final_integration.md`
4. Ask Roy to complete the integration

Repeat for each agent in sequence.

---

## Timeline

- **Phase 2:** 3-4 hours (Roy implementation + testing)
- **Phase 3:** 1 hour (architecture review)
- **Phase 4:** 1.5 hours (documentation + archival)
- **TOTAL:** 5.5-6.5 hours

---

## Success Criteria

**Workflow Complete When:**
- ✅ Code integrated (asymptoteRecovery called from novelEntities.ts)
- ✅ Tests pass (Monte Carlo N≥10, CV < 0.01%)
- ✅ Architecture review approved (no CRITICAL issues)
- ✅ Wiki updated
- ✅ Plan archived to completed/

**Impact Metrics:**
- Novel entities effectiveness increases from 0% to 20-40%
- Recovery shows multi-century timescales (50-100 years)
- 15% floor enforced (never reaches 0%)
- Energy trap validated (cleanup requires fusion)

---

## Blocking Issues

**None.** All prerequisites complete:
- ✅ Research validated
- ✅ Utility functions implemented
- ✅ Type system ready
- ✅ Implementation plan comprehensive

**Ready to execute immediately.**

---

**Next Action:** Invoke simulation-maintainer (Roy) or coordinate manually with handoff document.
