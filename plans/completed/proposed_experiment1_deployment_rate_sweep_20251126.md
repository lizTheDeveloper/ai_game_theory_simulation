# Experiment 1: Deployment Rate Sweep - Design Proposal

**Date:** November 26, 2025
**Author:** Orchestrator
**Status:** PROPOSED (awaiting review)
**Context:** Phase 3 Governance Blockers RESOLVED, ready to test deployment timing effects

---

## Executive Summary

**Research question:** How does technology deployment rate affect spiral activation, mortality outcomes, and system stability?

**Hypothesis:** Faster deployment may prevent environmental catastrophe but increase disruption mortality. Slower deployment may reduce disruption but allow environmental collapse. There exists an optimal rate balancing these tradeoffs.

**Previous findings:**
- **Immediate deployment** (119 techs at month 0): 98.8% mortality, 100% crash at month ~170
- **Sequenced deployment** (119 techs over 24 months, 6-month gaps): ~99% mortality, 100% crash at month ~208
- **Root cause:** Fixed spending + environmental cascades + disruption mortality

**New capability:** GDP-adaptive spending (COMPLETE Nov 25) - removes crash blocker

---

## Experimental Design

### Parameters to Vary

**Independent variable:** Technology deployment rate (time to deploy all 119 techs)

**Deployment configurations:**

| Config | Gap (months) | Total Time | Rationale |
|--------|-------------|------------|-----------|
| **Immediate** | 0 | 0 months | Current god-mode baseline, maximum disruption |
| **Fast** | 3 | 12 months | Rapid deployment, test early intervention |
| **Medium** | 6 | 24 months | Current sequenced baseline, previously tested |
| **Slow** | 12 | 48 months | Gradual absorption, institutional adaptation |
| **Very Slow** | 24 | 96 months | Multi-decade rollout, minimal disruption |

**Tier counts (from sequenced deployment analysis):**
- TIER 0: 50 techs
- TIER 1: 8 techs
- TIER 2: 36 techs
- TIER 3: 18 techs
- TIER 4: 7 techs
- **Total:** 119 techs

**Deployment schedule examples:**

```
Immediate:  All 119 at month 0
Fast:       50→8→36→18→7 at months 0, 3, 6, 9, 12
Medium:     50→8→36→18→7 at months 0, 6, 12, 18, 24
Slow:       50→8→36→18→7 at months 0, 12, 24, 36, 48
Very Slow:  50→8→36→18→7 at months 0, 24, 48, 72, 96
```

### Scenarios to Test

**RECOMMENDATION: Subset of 6 governance scenarios** (not all 11)

**Rationale:**
- Reduce computational cost (5 rates × 6 scenarios × N=10 = 300 runs vs 550 runs for all 11)
- Focus on scenarios with distinct mechanisms
- Cover major governance dimensions

**Selected scenarios:**

1. **god-mode** - Baseline (immediate deployment, no overrides)
2. **climate-first** - Environmental priority (10% GDP climate spending)
3. **equality-first** - Social priority (2.5% GDP redistribution)
4. **ai-alignment-first** - Safety priority (1% GDP AI safety)
5. **democratic-participation** - Governance priority (democracy=0.9)
6. **scientific-acceleration** - Research priority (2% GDP research)

**Excluded scenarios:** (can test later if needed)
- authoritarian-efficiency (similar mechanism to democratic-participation)
- high-trust-start, low-inequality-start, strong-institutions-start (initial conditions, orthogonal to deployment rate)
- renewable-first, carbon-removal-first, foundations-first, adaptive-deployment (tech priority, confounds deployment timing)

### Monte Carlo Configuration

**Runs per configuration:** N=10 (matches Phase 3 standard)

**Total runs:** 5 deployment rates × 6 scenarios × 10 seeds = **300 runs**

**Seeds:** 1-10 (deterministic, matches prior runs for comparability)

**Runtime estimate:**
- Previous N=60 (6 scenarios × 10 runs): ~3-4 hours
- This N=300 (5× larger): ~15-20 hours
- **CRITICAL:** Must run in background with log redirection

---

## Success Criteria

### Primary Objectives

**1. Run Completion (Stability)**
- **Target:** >50% of runs complete to month 360 (30 years)
- **Previous:** 0% completion (100% crash due to GDP collapse)
- **Metric:** Completion rate by deployment rate and scenario

**2. Mortality Reduction (Humanitarian)**
- **Target:** <50% mortality by year 15 for at least one deployment rate
- **Previous:** 98.8-99% mortality across all rates tested
- **Metric:** Mean terminal population (% of starting 8.1B)

**3. Spiral Activation (Core Question)**
- **Target:** >0% spiral activation for at least one deployment rate
- **Previous:** 0/120 runs activated any spiral (immediate + sequenced)
- **Metric:** Spiral activation rate by type (cognitive, abundance, democratic, scientific, meaning, ecological)

**4. Cascade Activation (Transformative Change)**
- **Target:** >10% cascade activation for optimal deployment rate
- **Previous:** 0/120 runs activated cascade
- **Metric:** Cascade activation rate and mean cascade strength

### Secondary Objectives

**5. Outcome Distribution**
- **Target:** >0% non-dystopia outcomes
- **Previous:** 100% crash/dystopia
- **Metric:** Distribution across 7 outcome tiers (extinction → utopia)

**6. Environmental Stability**
- **Target:** ≥1 planetary boundary returning to safe zone by year 30
- **Previous:** All boundaries worsening (biosphere 80×, climate 2.1×)
- **Metric:** Boundary trajectories by deployment rate

**7. Economic Stability**
- **Target:** GDP decline <20% by year 15 for optimal rate
- **Previous:** 98.8% GDP decline (from $114T → $1.2T)
- **Metric:** GDP trajectory by deployment rate

---

## Metrics to Track

### Per-Run Outputs (ScenarioResult)

**Existing fields** (already captured):
- `outcome` - 7-tier classification
- `finalQoL` - Quality of Life breakdown (6 dimensions)
- `finalPopulation` - Terminal population
- `finalEnvironment` - Planetary boundaries, temp delta, extinction rate
- `spiralActivation` - Active spirals, cascade status, cascade strength
- `techsDeployed` - Count by tier

**Additional tracking needed:**

1. **Crash statistics** (if run fails to complete)
   - `crashed: boolean`
   - `crashMonth: number`
   - `crashReason: string` (GDP_COLLAPSE, POPULATION_COLLAPSE, EXTINCTION, etc.)

2. **GDP trajectory** (to measure economic impact)
   - `initialGDP: number`
   - `finalGDP: number`
   - `minGDP: number` (lowest point)
   - `gdpDeclinePercent: number`

3. **Mortality trajectory**
   - `year1Mortality: number` (% death in first 12 months)
   - `year5Mortality: number` (cumulative to month 60)
   - `year15Mortality: number` (cumulative to month 180)
   - `terminalMortality: number` (final % from 8.1B)

4. **Spiral activation timing**
   - `firstSpiralMonth: number` (when first spiral activated)
   - `cascadeActivationMonth: number` (when cascade triggered)

### Aggregate Outputs (by deployment rate × scenario)

**Mean metrics:**
- Completion rate (%)
- Mean mortality (by year 1, 5, 15, terminal)
- Mean spiral count
- Spiral activation rate by type (%)
- Cascade activation rate (%)
- Mean cascade strength
- Mean QoL by dimension
- Mean outcome tier
- Mean GDP trajectory

**Distributions:**
- Outcome distribution (% per tier)
- Crash timing distribution (if applicable)
- Spiral activation timing distribution

---

## Implementation Plan

### Phase 1: Script Development (2-3 hours)

**Create:** `scripts/deploymentRateSweep.ts`

**Based on:** `scripts/runPhase3Scenarios.ts` (proven Monte Carlo runner)

**Key modifications:**

1. **Deployment rate configurations**
```typescript
const DEPLOYMENT_RATES = {
  immediate: { gapMonths: 0 },
  fast: { gapMonths: 3 },
  medium: { gapMonths: 6 },
  slow: { gapMonths: 12 },
  verySlow: { gapMonths: 24 }
};
```

2. **Scenario overrides**
```typescript
function createRateVariant(baseScenario: string, rate: string): ScenarioConfig {
  const base = SCENARIO_CATALOG[baseScenario];
  return {
    ...base,
    id: `${baseScenario}_${rate}`,
    techDeployment: {
      mode: 'sequenced',
      sequencedConfig: DEPLOYMENT_RATES[rate]
    }
  };
}
```

3. **Enhanced tracking**
```typescript
interface EnhancedScenarioResult extends ScenarioResult {
  deploymentRate: string;
  crashed: boolean;
  crashMonth?: number;
  crashReason?: string;
  gdpTrajectory: {
    initial: number;
    final: number;
    min: number;
    declinePercent: number;
  };
  mortalityTrajectory: {
    year1: number;
    year5: number;
    year15: number;
    terminal: number;
  };
  spiralTiming?: {
    firstSpiralMonth: number;
    cascadeMonth?: number;
  };
}
```

4. **Execution loop**
```typescript
for (const rate of Object.keys(DEPLOYMENT_RATES)) {
  for (const scenario of SELECTED_SCENARIOS) {
    for (const seed of SEEDS) {
      const result = runScenario(createRateVariant(scenario, rate), seed, 360);
      // Track enhanced metrics
      // Save to disk incrementally
    }
  }
}
```

**Output files:**
- `logs/deployment_sweep/[scenario]_[rate]_MC10.json` (300 files)
- `reviews/deployment_rate_sweep_results_YYYYMMDD.md` (comprehensive report)

### Phase 2: Validation Run (30 min)

**Quick validation:** N=3 runs per config (5 rates × 6 scenarios × 3 seeds = 90 runs)

**Purpose:**
- Verify GDP-adaptive spending prevents crashes
- Check enhanced tracking works
- Estimate runtime for full N=10
- Catch any regressions

**Command:**
```bash
npx tsx scripts/deploymentRateSweep.ts --validation > logs/deployment_sweep_validation.log 2>&1 &
```

**Success criteria:**
- Script completes without errors
- JSON outputs valid
- At least some runs complete to month 360
- Enhanced metrics populated

### Phase 3: Full Experiment (15-20 hours)

**Full run:** N=10 runs per config (300 total runs)

**Command:**
```bash
npx tsx scripts/deploymentRateSweep.ts > logs/deployment_sweep_full_$(date +%Y%m%d_%H%M%S).log 2>&1 &
```

**Monitoring:**
```bash
# Check progress
tail -100 logs/deployment_sweep_full_*.log

# Check completion
ls logs/deployment_sweep/*.json | wc -l  # Should reach 300

# Check for crashes
grep "❌ FATAL ERROR" logs/deployment_sweep_full_*.log
```

### Phase 4: Analysis & Reporting (2-3 hours)

**Automated report generation:**

1. **Aggregate statistics by rate**
   - Completion rate comparison
   - Mortality comparison
   - Spiral activation comparison
   - Outcome distribution comparison

2. **Find optimal rate**
   - Minimize mortality
   - Maximize spiral activation
   - Maximize completion rate
   - Balance tradeoffs

3. **Identify patterns**
   - Which scenarios benefit from faster deployment?
   - Which require slower absorption?
   - Are there interaction effects (rate × priority)?

4. **Generate visualizations** (if time permits)
   - Mortality vs deployment rate (line chart)
   - Spiral activation vs deployment rate (bar chart)
   - Completion rate vs deployment rate (bar chart)
   - Outcome distribution heatmap (rate × scenario)

**Output:** `reviews/deployment_rate_sweep_results_YYYYMMDD.md`

---

## Risk Assessment

### Technical Risks

**1. GDP-adaptive spending not fully tested (MEDIUM)**
- **Mitigation:** Run validation phase first (N=3)
- **Fallback:** Debug and fix before full N=10

**2. Runtime exceeds 24 hours (LOW)**
- **Mitigation:** Run in background, use nohup
- **Fallback:** Split into batches if needed

**3. Disk space for 300 JSON files (LOW)**
- **Impact:** ~300MB (1MB per file)
- **Mitigation:** Check disk space before starting

### Scientific Risks

**4. No deployment rate prevents mortality (MEDIUM)**
- **Implication:** Tech effectiveness insufficient, not deployment timing
- **Next step:** Investigate tech effectiveness (was marked "NOT A BUG" in Nov 25 review)
- **Action:** If mortality >90% for all rates, escalate to tech effectiveness re-investigation

**5. All runs still crash (LOW)**
- **Implication:** GDP-adaptive spending incomplete or other blockers exist
- **Next step:** Debug crash reasons, identify new blockers

**6. Spirals still don't activate (MEDIUM)**
- **Implication:** Thresholds genuinely too high or other mechanisms missing
- **Next step:** Spiral threshold validation (Phase 3 blocker 4C)

---

## Alternative Designs Considered

### Option A: Test All 11 Scenarios
- **Pros:** Complete coverage
- **Cons:** 550 runs, 25-30 hours runtime
- **Decision:** Start with 6, expand if needed

### Option B: Add 1-month and 48-month gaps
- **Pros:** Finer granularity
- **Cons:** 420-770 runs (too expensive)
- **Decision:** Use 5 rates with good spacing (0, 3, 6, 12, 24 months)

### Option C: Test deployment modes (immediate, sequenced, gradual, adaptive)
- **Pros:** Different deployment philosophies
- **Cons:** Confounds timing with mechanism
- **Decision:** Fix sequenced mode, vary only gapMonths (clean isolation)

### Option D: Include tech prioritization (climate-first, foundations-first)
- **Pros:** Tests tech ordering effects
- **Cons:** Confounds timing with priority
- **Decision:** Separate experiment (Experiment 2 or 3)

---

## Dependencies

**COMPLETE:**
- ✅ GDP-adaptive spending (Nov 25, 2025)
- ✅ Sequenced deployment mode (Nov 20, 2025)
- ✅ Monte Carlo infrastructure (`runPhase3Scenarios.ts`)
- ✅ Scenario framework (11 scenarios defined)

**REQUIRED (before starting):**
- [ ] Review and approve this design (human or architect agent)
- [ ] Verify disk space (>1GB free)
- [ ] Verify no conflicting long-running jobs

**OPTIONAL (can run in parallel):**
- Tech ineffectiveness investigation (marked "NOT A BUG" but could revisit)
- Spiral threshold validation (separate experiment)

---

## Timeline Estimate

| Phase | Duration | Description |
|-------|----------|-------------|
| **Design Review** | 30 min | Human/architect reviews this plan |
| **Script Development** | 2-3 hours | Create `deploymentRateSweep.ts` with enhanced tracking |
| **Validation Run** | 30 min | N=3 quick test (90 runs) |
| **Debug/Fix** | 0-2 hours | If validation finds issues |
| **Full Experiment** | 15-20 hours | N=10 full run (300 runs, background) |
| **Analysis** | 2-3 hours | Generate reports, identify optimal rate |
| **Documentation** | 30 min | Update roadmap, archive plan |
| **TOTAL** | ~21-29 hours | Can overlap development with background run |

**Wall-clock time:** 2-3 days (mostly background execution)

---

## Success Definition

**Experiment succeeds if:**

1. ✅ All 300 runs complete without script crashes
2. ✅ >30% of runs complete to month 360 (GDP-adaptive spending works)
3. ✅ At least one deployment rate achieves <70% mortality (tech has some effect)
4. ✅ Clear trend visible (faster/slower is better for some metric)
5. ✅ Comprehensive report generated with actionable findings

**Experiment provides valuable negative results if:**

1. All deployment rates have >90% mortality
   - **Conclusion:** Tech effectiveness insufficient (not timing issue)
   - **Next:** Re-investigate tech effectiveness (was "NOT A BUG", may need revision)

2. All deployment rates have 0% spiral activation
   - **Conclusion:** Thresholds too high OR other mechanisms missing
   - **Next:** Spiral threshold validation experiment (4C from Phase 3 blockers)

3. No deployment rate prevents crashes
   - **Conclusion:** GDP-adaptive spending incomplete OR other blockers
   - **Next:** Debug crash reasons, fix blockers

**Experiment fails if:**

1. Script crashes during development/validation
   - **Action:** Debug and fix before full run

2. Runs crash with new error types (not GDP collapse)
   - **Action:** Identify root cause, fix, restart

---

## Next Steps After Experiment

**If optimal rate found:**
1. Use optimal rate as default for future scenarios
2. Update SCENARIO_CATALOG with recommended gapMonths
3. Proceed to Experiment 2 (spending level sweep) or Experiment 3 (priority dimensions)

**If no rate succeeds:**
1. Investigate tech effectiveness (quantitative deep-dive)
2. Investigate spiral thresholds (validation experiment)
3. Revisit environmental mortality modeling (99% mortality seems extreme)

**If results ambiguous:**
1. Extend to all 11 scenarios (may reveal scenario-specific effects)
2. Add intermediate rates (1, 2, 4, 8, 16 month gaps)
3. Run longer durations (480 months = 40 years)

---

## Open Questions

**For review:**

1. **Is N=10 sufficient?** (vs N=20 for god-mode, or N=100 for baseline)
   - **Recommendation:** Start N=10, extend if high variance

2. **Should we test 1-month gaps?** (very fast deployment)
   - **Recommendation:** No (0 and 3 months sufficient for fast end)

3. **Should we test 48-month gaps?** (between 24 and no upper bound)
   - **Recommendation:** No (24 months = 8 years, very slow already)

4. **Should we include tech prioritization scenarios?**
   - **Recommendation:** No (separate experiment to avoid confounds)

5. **Should we track year-by-year trajectories?** (vs just terminal values)
   - **Recommendation:** Yes for GDP and mortality (every 12 months)
   - **Reason:** Identify when divergence occurs

6. **Should validation use N=3 or N=5?**
   - **Recommendation:** N=3 (enough to catch errors, fast turnaround)

---

## Approval Checklist

Before implementation:

- [ ] Design reviewed by human or architect agent
- [ ] Scientific question clear and testable
- [ ] Success criteria measurable
- [ ] Runtime acceptable (15-20 hours background)
- [ ] Disk space sufficient (1GB)
- [ ] Dependencies verified (GDP-adaptive spending works)
- [ ] No conflicting experiments running
- [ ] Backup plan if results negative

---

## Appendix: Research Context

**Deployment timing literature:**

1. **Technology absorption capacity** (Acemoglu et al., 2024)
   - Institutions require time to adapt to transformative tech
   - Too-rapid deployment causes disruption (unemployment, inequality, instability)
   - Gradual rollout allows skill development, regulatory adaptation, social acceptance

2. **Environmental tipping points** (Lenton et al., 2024)
   - Climate tipping cascades may occur 2030-2050
   - Rapid deployment needed to prevent runaway warming
   - But tech disruption could worsen social collapse

3. **AI safety timelines** (Hendrycks et al., 2024)
   - Alignment research needs to precede capability deployment
   - Premature deployment risks misalignment catastrophe
   - But delay allows competing nations to deploy unsafe systems

**Tradeoff hypothesis:** Optimal deployment balances environmental urgency (deploy fast) against institutional absorption (deploy slow). Experiment 1 tests this empirically.

---

**Generated:** November 26, 2025
**Author:** Orchestrator
**Next Action:** Review → Approve → Implement → Execute → Analyze
