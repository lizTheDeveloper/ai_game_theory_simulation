# Roadmap Update - October 19, 2025

## Summary

Post-Recalibration Fixes Week 1-2 have been completed and archived. The roadmap has been cleaned up and updated with clear next priorities.

## Archived Completed Work

**Plan Archived:** `/plans/completed/post-recalibration-fixes_plan_COMPLETE_20251018.md`

**Total Work Completed:** 7 fixes implemented (~11 hours actual)

### Week 1 Fixes (COMPLETE ✅)
1. **Fix #1: Cap War Death Multiplier** (1h)
   - Capped conventional war multiplier at 2.0x
   - Research: ECFR (2024), CSET Georgetown (2024)
   - Files: `populationDynamics.ts`

2. **Fix #2: Decouple Trust from AI Capability** (2h)
   - Trust now based on alignment + benefits + explainability + safety
   - Research: U Melbourne + KPMG (2025), Edelman (2024), DORA (2024)
   - Files: NEW `trustThresholds.ts`, updated `socialCohesion.ts`, `upwardSpirals.ts`

3. **Fix #3: AI Infrastructure Resource Consumption** (2h)
   - Models water/energy consumption scaling with AI capability
   - Research: UC Riverside (2024), US DOE (2024), RAND (2024), Microsoft (2024)
   - Files: NEW `aiInfrastructureResources.ts`, updated `planetaryBoundaries.ts`

### Week 2 Fixes (COMPLETE ✅)
4. **Fix #4: Upward Spiral Trust Thresholds** (1h)
   - Capability-scaled deployment thresholds + workflow adaptation gate
   - Research: McKinsey + IBM (2024), MDPI (2024)
   - Files: NEW `workflowAdaptation` field, updated `upwardSpirals.ts`

5. **Fix #5: Flash War Escalation Mechanics** (3h)
   - Flash war risk + AI de-escalation + circuit breakers
   - Research: ECFR (2024), Penn CERL (2024), UN Resolution 166-3
   - Files: NEW `flashWarEscalation.ts`, NEW `FlashWarEscalationPhase.ts`

6. **Fix #7: Trust Recovery Mechanics** (2h)
   - Path-dependent trust recovery system
   - Research: Edelman (2024), Frontiers Psychology (2024), DORA (2024)
   - Files: NEW `TrustRecoveryPhase.ts`, updated `socialCohesion.ts`

### Integrated Fixes (No Additional Work)
- **Fix #6:** Scale Water/Energy with Capability → Integrated into Fix #3
- **Fix #11:** AI-Mediated Conflict De-Escalation → Integrated into Fix #5

## Roadmap Changes

### Updated Metrics
- **Total Remaining Effort:** 293-374h → 275-356h (18h reduction)
- **Publication Readiness:** 82-87% → 84-89% complete
- **Fixes Completed:** 7/11 post-recalibration fixes (64% complete)

### New "NEXT PRIORITIES" Section
Added clear section outlining Week 3-4 fixes with:
- Fix descriptions and complexity estimates
- Research foundations
- Expected impacts
- Validation gate criteria

### Progress Summary Updates
- Added Week 1-2 completion entry
- Updated recent completions list
- Clarified remaining work breakdown
- Updated critical path with 6-step sequence

## Next Priorities (Week 3-4 Fixes)

**Remaining Work:** 3 fixes, ~7 days effort

### Fix #8: Capability-Based Governance Thresholds (~2 days)
- **Issue:** All AIs flagged dangerous from day 1 (thresholds too low)
- **Research:** Carnegie (2025), Epoch AI (2024), Nature HSS (2024)
- **Implementation:** Update danger thresholds, add regulatory lag
- **Expected Impact:** -5-10% dystopia rate

### Fix #9: Technology Diffusion Recalibration (~3 days)
- **Issue:** Deployment speed doesn't scale with AI capability
- **Research:** McKinsey (2024), Foundation Capital (2024)
- **Implementation:** Capability-scaled deployment (1.5x at AI > 4.0)
- **Expected Impact:** +2-5% humane utopia rate

### Fix #10: Organizational Transformation Modeling (~2 days)
- **Issue:** Workflow adaptation static at 21% baseline
- **Research:** MDPI (2024), McKinsey (2024)
- **Implementation:** Add workflow adaptation dynamics (+5%/month)
- **Expected Impact:** +2-5% benefits from AI

### Validation Gate (Week 3-4)
**Monte Carlo N=100, 240 months**
- Success Criteria:
  - Dystopia rate < 70%
  - Utopia rate 5-15%
  - Water crisis 40-50%
  - War deaths 30-40% of total

## Critical Path Updated

1. ✅ **Post-Recalibration Week 1-2** (COMPLETE - 7/11 fixes)
2. → **Week 3-4 Fixes** (NEXT - 3 remaining fixes, ~7 days)
3. → **Full Validation** (N=100, 240mo - verify target metrics)
4. → **Prevention Mechanisms** (widen 2% humane utopia pathway)
5. → **TIER 2 AI Deception Detection**
6. → **AI Skills Phases**

## Documentation Trail

### Plans
- **Active Plan:** `/plans/MASTER_IMPLEMENTATION_ROADMAP.md` (updated)
- **Archived Plan:** `/plans/completed/post-recalibration-fixes_plan_COMPLETE_20251018.md`

### Devlogs
- `/devlogs/post-recalibration-fixes_20251018.md`
- `/devlogs/fix4-upward-spiral-thresholds_20251018.md`
- `/devlogs/fix7-trust-recovery_20251018.md`

### Reviews
- `/reviews/fix123-validation_20251018.md`
- `/reviews/post-recalibration-architecture_20251017.md`

### Research
- 26 peer-reviewed sources (2024-2025) cited in fixes
- Complete research foundation in archived plan

## Quality Assurance

✅ All links verified between master roadmap and archived plan
✅ No historical information lost - full context preserved
✅ Master roadmap remains concise and actionable
✅ Plans directory structure maintained
✅ Consistent naming conventions followed
✅ Bidirectional references established

## Notes

- Fix #6 and Fix #11 were already integrated into other fixes during implementation
- Week 3-4 fixes address remaining systemic issues from AI capability recalibration
- Full validation (N=100, 240mo) required after Week 3-4 to verify system restoration
- Prevention mechanisms become highest priority after fixes complete

---

**Date:** October 19, 2025
**Agent:** project-plan-manager
**Status:** Roadmap clean, next priorities clear, archive complete
