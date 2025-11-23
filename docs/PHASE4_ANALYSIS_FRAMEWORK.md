# Phase 4: Comparative Analysis Framework

**Status:** ✅ Complete and ready for use
**Created:** 2025-11-18
**Purpose:** Extract patterns from Phase 2/3 Monte Carlo results to answer key research questions

---

## Overview

This framework provides 7 analysis scripts that parse scenario Monte Carlo logs and generate structured insights about:
1. **Spiral activation patterns** - Which scenarios activate which upward spirals
2. **Outcome distributions** - Utopia/dystopia rates by scenario
3. **Threshold achievement** - Do scenarios hit their intended targets?
4. **Trade-offs** - Correlations between objectives (climate vs equality, etc.)
5. **Critical paths** - Minimum conditions for success

---

## Quick Start

### Analyze Existing Phase 2 Logs

```bash
# Generate complete comparative analysis report
npx tsx scripts/generatePhase4Report.ts logs/phase2_validation_post_fix_20251118_090346.log

# View report
cat reports/phase4_comparative_analysis_YYYYMMDD.md
```

### Individual Analyses

```bash
# Spiral activation matrix
npx tsx scripts/generateSpiralMatrix.ts logs/phase2_*.log

# Outcome distributions
npx tsx scripts/analyzeOutcomes.ts logs/phase2_*.log

# Threshold achievement
npx tsx scripts/trackThresholds.ts logs/phase2_*.log

# Trade-off analysis (correlations)
npx tsx scripts/analyzeTradeOffs.ts logs/phase2_*.log
```

---

## Analysis Scripts

### 1. Spiral Activation Matrix (`generateSpiralMatrix.ts`)

**Purpose:** Show which scenarios activate which spirals
**Output:** Markdown table + CSV

**Example output:**
```
Scenario               | Abundance | Cognitive | Democratic | Scientific | Meaning | Ecological
-----------------------|-----------|-----------|------------|------------|---------|------------
Scientific Acceleration|    10%    |    40%    |     10%    |     70%    |   15%   |    15%
Equality First         |    80%    |    15%    |     30%    |     10%    |   20%   |    10%
Climate First          |    20%    |    10%    |      5%    |     15%    |   10%   |    60%
```

**Key insights:**
- Which spirals are easiest to activate (cross-scenario avg)
- Which scenario activates the most spirals
- Which scenarios fail to activate ANY spirals

### 2. Outcome Distribution Analyzer (`analyzeOutcomes.ts`)

**Purpose:** Compare outcome rates across scenarios
**Output:** Markdown tables + CSV + statistical summary

**Metrics calculated:**
- Utopia/Flourishing/Mixed/Stagnation/Dystopia/Collapse/Extinction rates
- Average QoL, Gini, Temperature, Governance, Research spending
- Standard deviations (when per-run data available)
- Coefficient of variation (CV) for determinism check

**Key insights:**
- Best Utopia rates by scenario
- Worst outcomes (dystopia/collapse/extinction)
- Highest QoL, lowest inequality, best climate outcomes

### 3. Threshold Achievement Tracker (`trackThresholds.ts`)

**Purpose:** Check if scenarios hit their intended targets
**Output:** Achievement report with ✅/❌ status

**Thresholds checked:**
- Scientific Acceleration: Research spending > $50B/month, Scientific spiral active
- Equality First: Gini < 0.30, Abundance spiral active
- Climate First: Climate stability > 70%, Ecological spiral active
- Democratic Participation: Governance quality > 70%, Democratic spiral active
- AI Alignment First: AI safety research > $30B/month, QoL maintained

**Key insights:**
- Overall achievement rate (X/Y targets hit)
- Which scenarios achieve their goals
- Which targets are consistently missed

### 4. Trade-Off Analysis (`analyzeTradeOffs.ts`)

**Purpose:** Identify trade-offs and synergies between objectives
**Output:** Correlation matrix + interpretation

**Correlations examined:**
- Climate Stability vs Inequality (Gini)
- Research Spending vs Inequality
- Governance Quality vs QoL
- Climate Stability vs QoL
- Temperature Rise vs QoL
- Research Spending vs Spirals Activated

**Key insights:**
- Strong synergies (r > 0.6): Win-win policies
- Strong trade-offs (r < -0.6): Policy dilemmas
- Lack of variance warning (scenarios not diverging)

### 5. Data Aggregation System (`aggregateScenarioResults.ts`)

**Purpose:** Parse logs and extract structured data for custom analysis
**Output:** JSON + CSV with per-run data

**Note:** Current Phase 2 logs have summary-level data only. For full per-run extraction, use `runPhase2ScenariosWithJSON.ts` (see below).

### 6. Master Report Generator (`generatePhase4Report.ts`)

**Purpose:** Combine all analyses into comprehensive markdown report
**Output:** Single report at `/reports/phase4_comparative_analysis_YYYYMMDD.md`

**Report sections:**
1. Executive Summary
2. Spiral Activation Matrix
3. Outcome Distribution Analysis
4. Threshold Achievement
5. Trade-Off Analysis
6. Policy Recommendations (auto-generated based on findings)
7. Limitations and Future Work

### 7. Enhanced Monte Carlo Runner (`runPhase2ScenariosWithJSON.ts`)

**Purpose:** Run scenarios with full JSON export for detailed analysis
**Usage:** For future Phase 2/3 runs (replaces `runPhase2Scenarios.ts`)

**Enhanced features:**
- Exports structured JSON with per-run data
- Includes variance metrics (standard deviation, CV)
- Enables full determinism validation (CV < 0.01% check)
- Backward compatible (same console output as original)

**Example:**
```bash
# Run Phase 2 scenarios with JSON export
npx tsx scripts/runPhase2ScenariosWithJSON.ts high > logs/phase2_rerun_$(date +%Y%m%d_%H%M%S).log 2>&1 &

# Analysis scripts work with both .log and .json files
npx tsx scripts/generatePhase4Report.ts logs/phase2_results_2025-11-18T12-00-00.json
```

---

## Current Findings (Phase 2 Validation Run)

**Analysis of:** `logs/phase2_validation_post_fix_20251118_090346.log`
**Scenarios:** 3 (Scientific Acceleration, Equality First, Climate First)
**Runs per scenario:** 10 (N=30 total)

### Critical Issues Detected

✅ **Analysis framework working correctly**
❌ **0/6 spiral activations** across all scenarios
❌ **0/6 threshold achievements** - No scenario hit its target
❌ **100% ONGOING outcomes** - No definitive outcomes reached by month 60
❌ **No behavioral divergence** - Gini, Temp, Governance, Research all identical

### Root Cause Analysis

**Symptoms:**
- All scenarios produce identical metrics (Gini=0.400, Temp=1.50°C, Research=$0B)
- No spirals activate despite different government priorities
- Climate First has best QoL (68.5%) but only slight variance

**Likely causes:**
1. **Scenario configurations not being applied** - `applyScenario()` may not be setting government priorities correctly
2. **Government agent ignoring priorities** - Spending allocation may not respond to scenario config
3. **Spiral thresholds too high** - Activation requirements may be unreachable in 60 months
4. **Initialization overriding scenarios** - Default state may be overwriting scenario modifications

### Recommended Actions

**BLOCKING (must fix before Phase 3):**
1. Debug `applyScenario()` - Verify government priorities are set correctly
2. Add logging to government spending allocation - Trace where money actually goes
3. Check spiral activation logic - Lower thresholds if needed for 60-month window
4. Validate state propagation - Ensure scenario mods survive initialization

**MEDIUM:**
5. Extend simulation to 120 months - Test if outcomes emerge with longer window
6. Increase sample size to N=30 - Improve statistical power

---

## Usage Patterns

### After Phase 2 Monte Carlo Completes

```bash
# Wait for Phase 2 to finish (check progress)
tail -f logs/phase2_revalidation_*.log

# Generate comprehensive report
npx tsx scripts/generatePhase4Report.ts logs/phase2_revalidation_*.log

# View report
cat reports/phase4_comparative_analysis_*.md

# Export CSVs for external analysis
ls logs/*_matrix_*.csv
ls logs/*_analysis_*.csv
```

### For Phase 3 Policy Packages

```bash
# Run Phase 3 scenarios with JSON export
npx tsx scripts/runPhase2ScenariosWithJSON.ts all > logs/phase3_$(date +%Y%m%d_%H%M%S).log 2>&1 &

# When complete, analyze with full variance data
npx tsx scripts/generatePhase4Report.ts logs/phase3_results_*.json

# Compare Phase 2 vs Phase 3
npx tsx scripts/analyzeOutcomes.ts logs/phase2_*.log > phase2_outcomes.txt
npx tsx scripts/analyzeOutcomes.ts logs/phase3_*.json > phase3_outcomes.txt
diff phase2_outcomes.txt phase3_outcomes.txt
```

### Custom Analysis

All scripts output structured CSVs that can be imported into:
- Jupyter notebooks (pandas)
- R (read.csv)
- Excel/Google Sheets
- Tableau/PowerBI

**Example CSV locations:**
- `/logs/spiral_matrix_YYYYMMDD.csv`
- `/logs/outcome_analysis_YYYYMMDD.csv`

---

## Implementation Notes

### Parsing Strategy

**Current approach:** Parse summary-level data from log files (formatted output from `runPhase2Scenarios.ts`)

**Limitations:**
- No per-run variance (only averages)
- Cannot calculate CV for determinism check
- Cannot analyze individual seed behaviors

**Future approach:** Parse JSON exports from `runPhase2ScenariosWithJSON.ts`

**Advantages:**
- Full per-run data (all seeds)
- Variance metrics (standard deviation, CV)
- Determinism validation (CV < 0.01% required)
- Spiral activation timing (month-by-month)

### Extensibility

**Adding new analyses:**

1. Create script in `/scripts/` following naming pattern: `analyze*.ts` or `generate*.ts`
2. Accept log file path as `process.argv[2]`
3. Output to console (for master report) + save CSV to `/logs/`
4. Add to `generatePhase4Report.ts` if should be included in master report

**Example:**
```typescript
// scripts/analyzeCriticalPath.ts
const logFile = process.argv[2];
const data = parseLogFile(logFile);
const criticalPath = findMinimumConditionsForUtopia(data);
console.log(formatCriticalPath(criticalPath));
fs.writeFileSync('/logs/critical_path_*.csv', toCSV(criticalPath));
```

---

## Testing

All scripts tested on existing Phase 2 logs:
- ✅ `generateSpiralMatrix.ts` - Generates tables, identifies zero activation
- ✅ `analyzeOutcomes.ts` - Calculates distributions, detects lack of variance
- ✅ `trackThresholds.ts` - Checks targets, flags 0% achievement
- ✅ `analyzeTradeOffs.ts` - Computes correlations, warns about identical metrics
- ✅ `generatePhase4Report.ts` - Combines all analyses, generates recommendations

---

## Next Steps

**Immediate (when Phase 2 completes):**
1. Run `generatePhase4Report.ts` on completed logs
2. Review findings in master report
3. Validate critical issues (spiral activation, behavioral divergence)
4. Create GitHub issue with findings if problems persist

**Short-term:**
1. Debug scenario application based on Phase 4 findings
2. Re-run Phase 2 with fixes
3. Validate that scenarios now diverge properly

**Long-term:**
1. Use JSON export for all future Monte Carlo runs
2. Extend to N=30 runs per scenario
3. Implement Phase 3 policy package analysis
4. Add predictive modeling (which policy combinations work best?)

---

## File Manifest

**Analysis scripts:**
- `/scripts/aggregateScenarioResults.ts` - Data extraction (summary-level)
- `/scripts/generateSpiralMatrix.ts` - Spiral activation table
- `/scripts/analyzeOutcomes.ts` - Outcome distributions + CV
- `/scripts/trackThresholds.ts` - Target achievement checker
- `/scripts/analyzeTradeOffs.ts` - Correlation analysis
- `/scripts/generatePhase4Report.ts` - Master report generator
- `/scripts/runPhase2ScenariosWithJSON.ts` - Enhanced Monte Carlo runner

**Output locations:**
- `/reports/phase4_comparative_analysis_*.md` - Master reports
- `/logs/spiral_matrix_*.csv` - Spiral data
- `/logs/outcome_analysis_*.csv` - Outcome data
- `/logs/phase2_results_*.json` - Full per-run data (when using JSON export)

**Documentation:**
- `/docs/PHASE4_ANALYSIS_FRAMEWORK.md` - This file

---

## Roy's Notes

*sigh* Everything's working. The analysis framework is solid. BUT... it's revealing that nothing in the simulation is actually working. Zero spiral activation. No behavioral divergence. Identical metrics across scenarios.

The good news? The diagnostics are LOUD. The framework immediately flagged the issues. No silent failures. No hidden bugs. Just cold, hard truth: scenarios aren't doing what they're supposed to.

Added assertions everywhere in the analysis scripts. NaN guards. Fallback prevention. If something breaks, you'll know exactly why.

The framework is production-ready. The simulation... not so much. But at least now we have the tools to see what's broken.

Have you tried turning it off and on again? (Seriously, maybe re-initialize the scenarios.)

---

**Framework Status:** ✅ COMPLETE
**Simulation Status:** ⚠️ NEEDS DEBUGGING
**Next Task:** Investigate why scenarios produce identical results
