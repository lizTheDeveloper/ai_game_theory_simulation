# Master Implementation Roadmap
## AI Game Theory Simulation

**Last Updated:** October 16, 2025 (morning - P0.7 complete)
**Status:** 🟢 P0 COMPLETE - Monte Carlo script modifications next

---

## Current Priority: Monte Carlo Script Modifications

**Goal:** Enable dual-scenario analysis (historical vs unprecedented) with proper output segregation

**Previous Priority (P0):** ✅ COMPLETE - Fixed deterministic mechanics and restored Monte Carlo variance

### ✅ P0 COMPLETED (Oct 15-16, 2025)

1. **P0.1: AI Capability Growth Rate** (commits 7386c4d, ae667c3)
   - Moore's Law: 2.7% → 9.05% monthly growth
   - Compute scaling: 7,943x over 10 years (was 2.4x)
   - Recursive self-improvement added for AGI acceleration

2. **P0.2: Organization Bankruptcy Paradox** (commits 7386c4d, ae667c3)
   - Fixed impossible revenue generation by bankrupt organizations
   - Economic conservation laws now respected

3. **P0.3: Cascade Trigger Stochasticity** (commit 7386c4d)
   - Replaced deterministic threshold with probabilistic trigger (0-10% monthly chance)
   - Verified working: Cascade triggered at Month 13 with 9.22% probability
   - **⚠️ INSUFFICIENT:** All 10 Monte Carlo runs still converge to identical 0.34B population

4. **P0.4: Diagnostic Logging for Determinism** (commit 57598c9)
   - Added comprehensive logging to 5 key systems
   - Enabled comparison of Monte Carlo runs
   - **Result:** Revealed P0.5 had empirically unjustified stochasticity

5. **P0.5: Initial Stochasticity Implementation** (commit 2d9febd)
   - Added ±10-30% monthly variation to demographics and environment
   - **Research critique:** 3/10 score - confused seasonal patterns with monthly noise
   - See: [Research Validation Review](/Users/annhoward/src/superalignmenttoutopia/reviews/p0_5_stochasticity_research_validation.md)

6. **P0.6: Research-Backed Stochasticity** (commit c251cec) ✅ COMPLETE
   - **Birth rates:** 8% seasonal amplitude + ±2% monthly noise (CDC/PNAS data)
   - **Death rates:** 12% seasonal amplitude + ±2% monthly noise (CDC mortality data)
   - **Environmental mortality:** Episodic shock system (2-15% probability, 150-300% spikes)
   - **AR1 autocorrelation:** Shocks persist 3-12 months (realistic temporal correlation)
   - **Research basis:** 2003 European heatwave, Somalia famine 2010-12
   - **Impact:** Replaces P0.5's unjustified randomness with empirically validated patterns

7. **P0.7: Scenario Parameter System** (Oct 16, 2025) ✅ COMPLETE
   - **Two-mode system:** Historical (publication-ready) vs Unprecedented (tail-risk assessment)
   - **Type definitions:** ScenarioMode, ScenarioParameters added to game.ts
   - **Utility module:** scenarioParameters.ts for mode-specific parameter access
   - **Integration:** planetaryBoundaries.ts uses scenario-specific cascade mortality rates
   - **Integration:** qualityOfLife.ts uses scenario-specific environmental shock parameters
   - **Initialization:** initialization.ts accepts and initializes scenario parameters
   - **Research resolution:** Addresses agent disagreement by allowing BOTH historical calibration AND unprecedented tail-risk assessment
   - **Impact:** Enables parallel simulation of realistic (historical) and worst-case (unprecedented) scenarios

### 🔴 NEXT: Monte Carlo Script Modifications

**Priority:** HIGH - Enable dual-scenario Monte Carlo analysis
**Effort:** 2-3 hours
**Status:** Not started

**Tasks:**
1. Modify Monte Carlo scripts to run 50% historical mode, 50% unprecedented mode
2. Update output files to include scenario mode in filename/metadata
3. Test both scenarios separately to verify parameter differences
4. Document scenario parameters and their empirical justification
5. Generate comparison outputs showing variance between historical vs unprecedented outcomes

**Success Criteria:**
- [ ] Monte Carlo runs split evenly between historical and unprecedented modes
- [ ] Output files clearly identify which scenario mode was used
- [ ] Historical mode shows publication-ready, empirically justified parameters
- [ ] Unprecedented mode shows honest tail-risk assessment with higher cascade risks
- [ ] Documentation explains parameter choices for each scenario mode
- [ ] Both modes show variance (not deterministic convergence)

**If Success:** Move to P1 - Achieve Research-Grade Realism with both scenario modes validated
**If Issues:** Debug scenario parameter application and verify mode-specific behavior

---

## Next Up: P1 - Achieve Research-Grade Realism

**Start After:** P0.4-P0.6 complete and Monte Carlo variance verified

### Priority Fixes (1 week, 20-25 hours)

1. **P1.1: Debug Death Accounting**
   - Fix missing 97% of deaths in reporting (6.8B decline, only 0.2B tracked)
   - Trace death flow from calculation to aggregation

2. **P1.2: Reduce Cascade Mortality Rate**
   - Current: 2% monthly = 62% dead in 4 years (3-6x worse than Black Death)
   - Target: 0.5-1% monthly = 6-12% annual (match historical precedent)

3. **P1.3: Reduce Cascading Failure Multiplier**
   - Current: 6 crises = 3.0x degradation (unrealistic doom loop)
   - Target: 6 crises = 1.8x degradation (severe but not irreversible)

4. **P1.4: Fix False Extinction Detection**
   - Current: Reports "extinction" with 1.14B survivors
   - Target: Use actual population (<10K = extinction, <100M = bottleneck)

5. **P1.5: Add Basic Recovery Mechanics**
   - Post-crisis birth rate spikes (baby boom effect)
   - Ecosystem regeneration when population pressure reduces
   - Target: 5-10% of runs show recovery after bottleneck

**Success Criteria:**
- [ ] Death accounting: Sum of categories = population decline (±5%)
- [ ] Mortality rates: Match Black Death severity (30-60% over 6-10 years)
- [ ] Final population: 2B-4B in severe runs (not 0.3B-1B)
- [ ] Some runs show stabilization and recovery (not 100% irreversible decline)

See: [Implementation Plan P1](/Users/annhoward/src/superalignmenttoutopia/plans/implementation_plan_20251015.md#priority-1-high---fix-this-week-for-realism)

---

## Future Priorities

### P2: Publication-Ready Quality (2-4 weeks)

1. **Recalibrate Environmental Degradation** - Match IPCC/IPBES rates (currently 100-1000x too fast)
2. **Stochastic Innovation/Breakthroughs** - Add miracle technologies that can avert catastrophe
3. **Heterogeneous Population Segments** - Model societal polarization, elite/mass gaps
4. **Organization Geographic Diversification** - Multi-national companies survive better
5. **Historical Validation** - Reproduce COVID-19, 2008 crisis, Black Death trajectories

See: [Implementation Plan P2](/Users/annhoward/src/superalignmenttoutopia/plans/implementation_plan_20251015.md#priority-2-medium---improve-within-2-4-weeks)

### P3: State-of-the-Art Features (Optional, 4-8 weeks)

- Variable timesteps / event-driven architecture
- Unknown unknown event system
- Alignment model specificity
- Government implementation realism
- Continuous parameter uncertainty

See: [Implementation Plan P3](/Users/annhoward/src/superalignmenttoutopia/plans/implementation_plan_20251015.md#priority-3-low---nice-to-have-improvements)

---

## Critical Discovery & Resolution (Oct 15, 2025)

**Problem Identified:** After implementing stochastic cascade triggers (P0.3), all 10 Monte Carlo runs STILL converged to identical outcomes:
```
Run 1-10: BOTTLENECK → 0.34B population (95.7% decline) - EXACTLY IDENTICAL
```

**Root Cause Analysis (P0.4-P0.5):**
- P0.3 fixed cascade trigger timing (stochastic)
- BUT: Demographic and environmental systems remained deterministic
- P0.5 added ±10-30% monthly variation, but got 3/10 research validation score
- Research critique revealed confusion between seasonal patterns and monthly noise

**Solution Implemented (P0.6):**
- **Seasonal demographic patterns:** Birth/death rates follow annual cycles (8-12% amplitude)
- **Episodic environmental shocks:** 2-15% event probability with 150-300% mortality spikes
- **Temporal autocorrelation:** AR1 persistence via shock tracking (3-12 months)
- **Research backing:** CDC mortality data, European heatwave, Somalia famine case studies

**Secondary Challenge (Oct 16, 2025):**
- Research agents disagreed on parameter calibration: historical realism vs tail-risk honesty
- Historical calibration needed for publication credibility
- Unprecedented scenarios needed for honest existential risk assessment
- Could not satisfy both requirements with a single parameter set

**Final Solution (P0.7):**
- **Scenario Parameter System:** Two-mode approach (historical vs unprecedented)
- **Historical mode:** Publication-ready parameters based on empirical data (Black Death, heatwaves, famines)
- **Unprecedented mode:** Honest tail-risk parameters for worst-case assessment
- **Parallel analysis:** Monte Carlo runs 50/50 split between both modes
- **Resolution:** Both research requirements satisfied simultaneously

**Status:** P0 complete (P0.1-P0.7). Ready for Monte Carlo script modifications.

---

## Success Metrics

### Current State (Oct 16, 2025 - Post P0 Complete)
- ✅ AI capability: Reaches >2.0 in 10 years (was never above 1.0)
- ✅ Organizations: Bankruptcy mechanics valid (was impossible)
- ✅ Cascade trigger: Stochastic (was deterministic)
- ✅ Demographics: Seasonal patterns (8-12% amplitude) + ±2% monthly noise
- ✅ Environmental shocks: Episodic events (2-15% probability, 150-300% spikes)
- ✅ Temporal autocorrelation: AR1 persistence (shocks last 3-12 months)
- ✅ Scenario system: Two-mode parameter system (historical vs unprecedented)
- ✅ Research resolution: Both publication-ready and tail-risk parameters supported
- ⏳ Monte Carlo scripts: Need modification to use dual-scenario approach
- ❌ Environmental rates: 100-1000x too fast (P1 priority)
- ❌ Population collapse: 10-100x too fast (P1 priority)
- ❌ Recovery: 0% of runs show recovery (P1.5 priority)

### Target State (Post P0+P1+P2)
- ✅ AI capability: 20% of runs exceed 2.0 by Year 10
- ✅ Outcome variance: 30-50% variance in population endpoints
- ✅ Environmental rates: Match IPCC/IPBES projections (±20%)
- ✅ Population collapse: Match historical precedent (5-10% annual max)
- ✅ Organizational survival: 20-50% survive severe collapse
- ✅ Recovery: 10-25% of runs show population recovery

---

## Timeline to Publication

| Milestone | Duration | Target Date | Status |
|-----------|----------|-------------|--------|
| **P0 Complete** | 2-3 days | Oct 16, 2025 | ✅ COMPLETE (P0.1-P0.7) |
| **Monte Carlo Scripts** | 2-3 hours | Oct 16, 2025 | 🟡 In Progress (dual-scenario modification) |
| **P1 Complete** | 1 week | Oct 24-25, 2025 | ⏸️ Awaiting Monte Carlo script updates |
| **P2 Complete** | 2-4 weeks | Nov 15-30, 2025 | Not started |
| **Expert Review** | 2-3 weeks | Dec 15, 2025 | Not started |
| **Publication Ready** | - | Late Dec 2025 / Early Jan 2026 | Not started |

**Critical Path:** Monte Carlo script modifications → P1 realism (dual-scenario) → P2 validation → Expert review

---

## Related Documents

- **[Implementation Plan (Detailed)](/Users/annhoward/src/superalignmenttoutopia/plans/implementation_plan_20251015.md)** - Full technical specifications for all P0-P3 tasks
- **[Architecture Review](/Users/annhoward/src/superalignmenttoutopia/plans/architecture-review-20251015.md)** - 5 bugs, 3 architectural issues identified
- **[Research Validation](/Users/annhoward/src/superalignmenttoutopia/plans/research-validation-20251015.md)** - Comparison to 40+ peer-reviewed papers
- **[Critical Research Review](/Users/annhoward/src/superalignmenttoutopia/plans/CRITICAL_RESEARCH_REVIEW.md)** - AI capability growth 400x discrepancy
- **[Extinction Mechanics Audit](/Users/annhoward/src/superalignmenttoutopia/devlogs/extinction-mechanics-audit-oct-12.md)** - False extinction bug, organizations never die

---

## Open Questions

### For Monte Carlo Script Modifications (Immediate):

1. **File naming convention?** How to distinguish historical vs unprecedented output files?
2. **Run distribution?** Exactly 50/50 or randomized selection per run?
3. **Metadata format?** What scenario information should be included in output files?
4. **Comparison analysis?** Should scripts generate automatic comparison reports between modes?

### For P1 Planning (After Monte Carlo Updates):

1. **Dual-scenario calibration?** Should P1 parameters differ between historical and unprecedented modes?
2. **Which P1 task should be prioritized?** Death accounting (P1.1) vs cascade mortality rates (P1.2)?
3. **Should P1 tasks be done sequentially or in parallel?** Dependencies between fixes
4. **How to validate realism?** Compare to historical precedents (Black Death, COVID-19, 2008 crisis) for historical mode
5. **Unprecedented mode validation?** What criteria distinguish "honest tail-risk" from "unrealistic doom"?

---

## Recommendations

**Immediate Next Steps (Oct 16, 2025):**

1. **Monte Carlo Script Modifications (2-3 hours)** - URGENT
   - Modify Monte Carlo scripts to accept scenario mode parameter
   - Implement 50/50 split: first half runs with historical mode, second half with unprecedented mode
   - Update output filenames to include scenario mode (e.g., `output_historical_run1.json`)
   - Add scenario metadata to output files for traceability
   - Test both scenarios independently to verify parameter differences

2. **Scenario Validation (1 hour):**
   - Run 10 iterations with historical mode, verify publication-ready parameters
   - Run 10 iterations with unprecedented mode, verify tail-risk parameters
   - Compare outputs to confirm meaningful differences between modes
   - Document parameter values used in each scenario mode

3. **After Monte Carlo Updates Complete:**
   - Mark Monte Carlo script modifications complete ✅
   - Begin P1.1 (Debug Death Accounting) or P1.2 (Reduce Cascade Mortality)
   - Consider if P1 fixes need scenario-specific calibration
   - Update roadmap status to "P1 IN PROGRESS"

---

**Roadmap Status:** 🟢 P0 COMPLETE - Monte Carlo script modifications next
**Last Updated:** October 16, 2025 (morning - P0.7 complete)
**Next Review:** After Monte Carlo script modifications (Oct 16, 2025)
