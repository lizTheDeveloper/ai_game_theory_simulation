# Extinction Debt Modeling - Orchestration Status

**Date:** December 9, 2025, 14:20 UTC
**Orchestrator:** Claude (orchestrator-1)
**Feature:** Extinction Debt Modeling (MEDIUM priority, 3-5 days)
**Status:** Quality Gate 1 - Research Validation Phase

---

## Current Status: ⚠️ AWAITING RESEARCH VALIDATION

**Workflow Phase:** 1 of 8 (Research Validation - Quality Gate 1)

The extinction debt modeling feature has a complete proposal but requires formal research validation before implementation can proceed. I've prepared the handoff to Sylvia (research-skeptic) for Quality Gate 1 validation.

---

## What's Been Done

1. ✅ **Feature Assessment Complete**
   - Read proposal: `openspec/changes/extinction-debt-modeling/`
   - Verified scope: Adds extinction debt state tracking with 50-400 year lag times
   - Confirmed affected systems: BiosphereTippingPhase, new ExtinctionDebtPhase, food security linkage
   - Reviewed existing research: `research/biodiversity_extinction_rates_20251113.md`

2. ✅ **Todo List Created**
   - 8 tasks tracked from research validation → implementation → reviews → documentation → archival
   - Currently on task 1: Research validation

3. ✅ **Handoff File Created**
   - Location: `.claude/agents/HANDOFF_sylvia_extinction_debt_validation.md`
   - Contains: Full context, sources to verify, quality gate criteria, deliverable specification
   - Ready for: Sylvia (research-skeptic) to validate research foundation

---

## Next Steps (Sequential Workflow)

### Phase 1: Research Validation (CURRENT - Quality Gate 1)
**Agent:** Sylvia (research-skeptic)
**Task:** Validate research foundation before implementation
**Deliverable:** `reviews/extinction_debt_validation_20251209.md` (Grade: A/B/C/D/F)

**Sources to Verify:**
- Tilman et al. (1994) - Foundational extinction debt paper ✅ (cited)
- Kuussaari et al. (2009) - Grasslands 50-200yr ✅ (cited)
- Dullinger et al. (2013) - Alpine plants 300-400yr ✅ (cited)
- Isbell et al. (2011) - Trophic cascade delays ✅ (cited)
- Recent 2024-2025 sources ❓ (need to find)

**Key Questions:**
1. Are lag times (50-400 years) empirically justified?
2. What about marine and tropical ecosystems? (missing)
3. Any contradictory evidence showing faster recovery?
4. Are the four mechanisms well-established science?

**Decision Tree:**
- **Grade A/B:** → Proceed to Phase 2 (Implementation)
- **Grade C:** → Invoke super-alignment-researcher for stronger sources → Re-validate
- **Grade D/F:** → Block implementation, pivot or find new research

---

### Phase 2: Implementation (PENDING - After QG1 Pass)
**Agent:** feature-implementer (Moss)
**Depends On:** Quality Gate 1 passes (Grade B+ or better)

**Tasks:**
1. Add `ExtinctionDebtState` interface to `src/types/game.ts`
2. Modify `BiosphereTippingPhase` to queue extinctions (not instant loss)
3. Create `ExtinctionDebtPhase` (order ~38.0)
4. Link extinction debt to food security (pollination services)
5. Add config flag for testing

**Success Criteria:**
- Code compiles with TypeScript strict mode
- No NaN violations (use assertion utilities)
- Deterministic RNG usage (no Math.random fallbacks)
- Emoji conventions followed (register in EMOJI_EVENT_MAP.txt)

---

### Phase 3: Monte Carlo Validation (PENDING)
**Agent:** feature-implementer (continues) or priya (if issues found)
**Depends On:** Implementation complete

**Tasks:**
1. Run Monte Carlo N≥10, 120 months
2. Verify no crashes
3. Check biodiversity recovery is appropriately slow
4. Validate CV < 0.01% (determinism)
5. Verify pollination collapse affects food production

**Background Execution:**
```bash
npx tsx scripts/monteCarloSimulation.ts > logs/mc_extinction_debt_$(date +%Y%m%d_%H%M%S).log 2>&1 &
```

---

### Phase 4: Architecture Review (PENDING - Quality Gate 2)
**Agent:** architecture-skeptic
**Depends On:** Monte Carlo validation passes

**Review Focus:**
- Performance impact (< 5ms overhead per step)
- State propagation correctness
- Interaction with existing systems
- Complexity assessment

**Decision Tree:**
- **CRITICAL/HIGH issues:** → Must fix before proceeding
- **MEDIUM/LOW issues:** → Document, address if time permits
- **No blocking issues:** → Proceed to Phase 5

---

### Phase 5: Code Quality Review (PENDING - Quality Gate 3)
**Agent:** senior-dev-reviewer
**Depends On:** Architecture review passes

**Review Focus:**
- Code quality, readability
- TypeScript best practices
- Test coverage
- Documentation completeness

**Decision Tree:**
- **CRITICAL issues:** → MUST fix before documentation
- **HIGH issues:** → Strongly recommended to fix
- **Passes:** → Proceed to Phase 6

---

### Phase 6: Documentation (PENDING)
**Agent:** wiki-documentation-updater (Historian)
**Depends On:** Code quality review passes

**Tasks:**
1. Update `docs/wiki/README.md` with extinction debt mechanics
2. Document parameter sources and lag times
3. Add ecosystem-specific examples
4. Update devlog

---

### Phase 7: OpenSpec Update (PENDING)
**Agent:** architect
**Depends On:** Documentation complete

**Tasks:**
1. Merge delta into `openspec/specs/simulation/spec.md`
2. Archive to `docs/implementation-history/extinction-debt/`
3. Update project spec completion status

---

### Phase 8: Cleanup (PENDING)
**Agent:** architect
**Depends On:** All phases complete

**Tasks:**
1. Remove `openspec/changes/extinction-debt-modeling/`
2. Update verification queue (mark as Recently Resolved)
3. Final status update

---

## Coordination Notes

**Parallel Work Considerations:**
- This feature touches BiosphereTippingPhase - check if other agents are modifying it
- New phase at order 38.0 - verify no conflicts with existing phase order
- Food security integration - coordinate if food system work ongoing

**Token Budget:**
- Research validation: ~5-10k tokens (Sylvia efficient, focused analysis)
- Implementation: ~15-20k tokens (new phase + state modifications)
- Reviews: ~10-15k tokens (architecture + code quality)
- Documentation: ~5-10k tokens
- **Total estimated:** ~35-55k tokens (well within budget)

**Timeline Estimate:**
- Research validation: 1 hour (Sylvia review)
- Implementation: 4-6 hours (new phase, state integration, testing)
- Monte Carlo + reviews: 2-3 hours
- Documentation: 1-2 hours
- **Total:** 8-12 hours active work (3-5 days calendar time with async Monte Carlo runs)

---

## Communication Plan

**Status Updates:**
- Post to coordination channel at each phase transition
- Alert if blocked on Quality Gates
- Request help if conflicting work detected

**Handoffs:**
- Each agent gets clear handoff file with context
- Deliverables specified upfront
- Decision trees for different outcomes

---

## How to Proceed

**Option 1: Invoke Sylvia Now (Recommended)**
```bash
# User should invoke research-skeptic agent:
# In Claude Code, open a new agent session with "research-skeptic"
# Reference handoff file: .claude/agents/HANDOFF_sylvia_extinction_debt_validation.md
```

**Option 2: If Research Looks Solid, Skip to Implementation**
```bash
# Only if user is confident research foundation is strong
# Would skip Quality Gate 1 (not recommended for research-critical features)
```

**Option 3: Find Additional Research First**
```bash
# Invoke super-alignment-researcher to strengthen research foundation
# Then validate with research-skeptic
```

---

## Risk Assessment

**LOW RISK - Proceed with confidence:**
- ✅ Well-established science (extinction debt is standard ecology)
- ✅ Clear scope (isolated new phase + state tracking)
- ✅ Proposal already exists (detailed specification)
- ✅ Identified in research debate session (Sylvia endorsed as missing critical system)
- ✅ Similar patterns exist (other delayed-effect systems in codebase)

**Minor Concerns:**
- ⚠️ Marine/tropical ecosystem lag times not specified (need research)
- ⚠️ Food security integration may need careful calibration
- ⚠️ Performance impact of extinction queue processing (should be negligible but validate)

---

## Orchestrator Assessment

**Recommendation:** **PROCEED WITH RESEARCH VALIDATION**

This feature has a solid foundation but needs formal Quality Gate 1 validation to ensure:
1. Lag time parameters are empirically justified
2. All ecosystem types are covered (grassland/alpine/marine/tropical)
3. No contradictory evidence exists showing faster recovery
4. Recent 2024-2025 sources incorporated

The research validation will take ~1 hour and prevent potential issues during implementation. This is exactly what Quality Gate 1 is designed for.

**Next Action:** User should invoke Sylvia (research-skeptic) referencing the handoff file.

---

**Orchestrator:** orchestrator-1 (Claude)
**Status:** Phase 1 prep complete, awaiting research validation agent
