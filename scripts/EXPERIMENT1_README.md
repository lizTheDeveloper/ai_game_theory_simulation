# Experiment 1: Deployment Rate Sweep

**Created:** November 26, 2025
**Design Document:** `/plans/proposed_experiment1_deployment_rate_sweep_20251126.md`
**Status:** Ready for execution

---

## Overview

Tests how technology deployment rate affects:
- Spiral activation
- Mortality outcomes
- System stability (crash vs completion)
- GDP trajectory
- Environmental outcomes

**Research Question:** What is the optimal deployment rate that balances environmental urgency (deploy fast) against institutional absorption capacity (deploy slow)?

---

## Parameters

**Deployment Rates (5):**
- **Immediate:** All 119 techs at month 0 (0-month gap)
- **Fast:** 119 techs over 12 months (3-month gap between tiers)
- **Medium:** 119 techs over 24 months (6-month gap)
- **Slow:** 119 techs over 48 months (12-month gap)
- **Very Slow:** 119 techs over 96 months (24-month gap)

**Scenarios (6):**
- god-mode
- climate-first
- equality-first
- ai-alignment-first
- democratic-participation
- scientific-acceleration

**Monte Carlo:** N=10 runs per configuration (seeds 1-10)

**Total Runs:** 5 rates × 6 scenarios × 10 seeds = **300 runs**

**Runtime Estimate:** 15-20 hours (background)

---

## Quick Start

### 1. Validation Run (N=3, ~90 runs, ~1-2 hours)

```bash
# Run validation to verify script works and estimate runtime
npx tsx scripts/deploymentRateSweep.ts --validation > logs/experiment1/validation_$(date +%Y%m%d_%H%M%S).log 2>&1 &

# Monitor progress
tail -f logs/experiment1/validation_*.log

# Check for errors
grep "❌ FATAL ERROR" logs/experiment1/validation_*.log
```

**Validation Success Criteria:**
- Script completes without errors
- JSON outputs valid
- At least some runs complete to month 360 (>50% completion rate)
- Enhanced metrics populated (GDP trajectory, mortality, crash stats)

### 2. Full Experiment (N=10, ~300 runs, ~15-20 hours)

**ONLY run after validation succeeds!**

```bash
# Run full experiment in background
npx tsx scripts/deploymentRateSweep.ts > logs/experiment1/full_run_$(date +%Y%m%d_%H%M%S).log 2>&1 &

# Get job ID
jobs

# Monitor progress (every 30 min)
tail -100 logs/experiment1/full_run_*.log

# Check completion
ls logs/experiment1/*.json | wc -l  # Should reach 300 individual results + 30 stats files + 1 summary

# Check for crashes
grep "❌" logs/experiment1/full_run_*.log | tail -20
```

---

## Outputs

### Per-Run Outputs

**Location:** `logs/experiment1/`

**Individual results:** `{scenario}_{rate}_seed{N}.json` (300 files)

**Example:** `god-mode_fast_seed1.json`

**Structure:**
```json
{
  "scenarioId": "god-mode_fast",
  "seed": 1,
  "deploymentRate": "fast",
  "outcome": "DYSTOPIA_MILD",
  "crashed": false,
  "monthsSimulated": 360,
  "gdpTrajectory": {
    "initial": 114000000000000,
    "final": 50000000000000,
    "min": 45000000000000,
    "declinePercent": 56.1
  },
  "mortalityTrajectory": {
    "year1": 0.0,
    "year5": 2.1,
    "year15": 12.3,
    "terminal": 45.6
  },
  "spiralActivation": {
    "activeUpwardSpirals": ["Cognitive", "Scientific"],
    "cascadeActive": false,
    "cascadeStrength": 0.42,
    ...
  },
  ...
}
```

### Aggregate Statistics

**Location:** `logs/experiment1/`

**Stats files:** `{scenario}_{rate}_MC{N}_stats.json` (30 files)

**Example:** `god-mode_fast_MC10_stats.json`

**Structure:**
```json
{
  "configKey": "god-mode_fast",
  "scenario": "god-mode",
  "deploymentRate": "fast",
  "monteCarloN": 10,
  "completionRate": 0.8,
  "avgMortality": 52.3,
  "spiralActivationRates": {
    "Cognitive": 0.6,
    "Abundance": 0.0,
    ...
  },
  "cascadeActivationRate": 0.1,
  "avgCascadeStrength": 0.23,
  "outcomeDistribution": {
    "DYSTOPIA_MILD": 7,
    "STATUS_QUO": 2,
    "CRASH": 1
  }
}
```

### Comprehensive Summary

**Location:** `logs/experiment1/`

**Summary file:** `experiment1_summary_{timestamp}.json`

**Contains:** All results + metadata + aggregate statistics by rate

---

## Analysis Checklist

After experiment completes:

- [ ] Check completion rates by deployment rate
- [ ] Compare mortality by deployment rate
- [ ] Compare spiral activation by deployment rate
- [ ] Identify optimal rate (minimize mortality, maximize spirals)
- [ ] Check for interaction effects (rate × scenario)
- [ ] Look for patterns (which scenarios benefit from faster/slower deployment)
- [ ] Generate visualizations (mortality vs rate, spirals vs rate, etc.)
- [ ] Write comprehensive report: `reviews/deployment_rate_sweep_results_YYYYMMDD.md`

---

## Troubleshooting

**Script crashes during validation:**
- Check logs for error stack trace
- Verify scenarioRunner.ts works: `npx tsx scripts/scenarioRunner.ts god-mode 1 360`
- Check disk space: `df -h`
- Fix and re-run validation

**High crash rate (>50% runs crash):**
- Check crash reasons in logs
- If GDP_COLLAPSE: GDP-adaptive spending may need tuning
- If POPULATION_COLLAPSE: Environmental mortality may be too high
- If EXTINCTION: Multiple cascading failures

**Validation passes, full run crashes:**
- Likely disk space issue (300 JSON files = ~300MB)
- Check: `df -h`
- Clean old logs if needed: `rm -rf logs/old_experiments`

**Runtime exceeds 24 hours:**
- Split into batches (run 2-3 deployment rates at a time)
- Run on multiple machines if available
- Reduce N to 5 (150 runs, ~7-10 hours)

---

## Success Criteria

**Primary Objectives:**

1. **Run Completion:** >50% of runs complete to month 360
2. **Mortality Reduction:** At least one deployment rate achieves <50% mortality by year 15
3. **Spiral Activation:** >0% spiral activation for at least one deployment rate
4. **Cascade Activation:** >10% cascade activation for optimal deployment rate

**Secondary Objectives:**

5. **Outcome Distribution:** >0% non-dystopia outcomes
6. **Environmental Stability:** ≥1 planetary boundary returning to safe zone
7. **Economic Stability:** GDP decline <20% for optimal rate

**If all objectives fail:**

- Re-investigate tech effectiveness (marked "NOT A BUG" in Nov 25 review, may need revision)
- Validate spiral thresholds (Phase 3 blocker 4C)
- Check for other blockers preventing spiral activation

---

## Next Steps

**After experiment completes:**

1. Run analysis script (TODO: create `scripts/analyzeDeploymentSweep.ts`)
2. Generate report: `reviews/deployment_rate_sweep_results_YYYYMMDD.md`
3. Update roadmap with findings
4. If optimal rate found:
   - Use as default for future scenarios
   - Proceed to Experiment 2 (spending level sweep)
   - Proceed to Experiment 3 (priority dimensions)
5. If no rate succeeds:
   - Investigate tech effectiveness (quantitative deep-dive)
   - Investigate spiral thresholds (validation experiment)
   - Revisit environmental mortality modeling

---

**For questions or issues, see:**
- Design document: `/plans/proposed_experiment1_deployment_rate_sweep_20251126.md`
- Implementation: `/scripts/deploymentRateSweep.ts`
- Scenario framework: `/src/types/scenarios.ts`
