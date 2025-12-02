# Monte Carlo Outcome Distribution Analysis - Proposal

**Date:** November 30, 2025
**Status:** PROPOSED
**Priority:** MEDIUM (research insight, not blocking)
**Effort:** ~2-3 hours
**Source:** Recent breakthrough (first utopia achieved), need deeper analysis

## Problem Statement

Recent Monte Carlo validation (Nov 29, HIGH-4) achieved **BREAKTHROUGH:**
- Run 42007: First utopia (22.4% mortality)
- Outcome diversity restored: 9 dystopia, 1 utopia (vs 10/10 dystopia pre-fix)
- Mortality range: 22.4-90.6% (vs 88-99% pre-fix)

**However:** We lack systematic analysis of what factors drive different outcomes.

**Questions:**
1. What differentiates the 1 utopia run from 9 dystopia runs?
2. Are there predictable patterns (e.g., early tech deployment, specific scenarios)?
3. What's the expected distribution with N=100 runs?
4. Which parameters have highest sensitivity for outcome classification?

## Proposed Solution

### Phase 1: Implement Outcome Analysis Script (1 hour)

**Create:** `scripts/analyzeOutcomeDistributions.ts`

**Features:**
1. **Read Monte Carlo output JSON files:**
   - Parse all `monteCarloOutputs/run_*_unprecedented_events.json`
   - Extract final outcome classification (7-tier system)
   - Extract key metrics: mortality %, tech count, resentment level, etc.

2. **Statistical Analysis:**
   - Outcome distribution (utopia, dystopia, collapse, etc.)
   - Mortality distribution (mean, median, range, quartiles)
   - Technology deployment distribution
   - Resentment trajectory analysis
   - Scenario correlation (which scenarios lead to which outcomes?)

3. **Factor Analysis:**
   - Compare utopia runs vs dystopia runs
   - Identify divergence points (when do paths split?)
   - Key differentiators (tech deployment timing, AI coordination, etc.)

**Output:**
```
=== Monte Carlo Outcome Analysis (N=10) ===

Outcome Distribution:
- Utopia: 1 (10%)
- Pyrrhic Dystopia: 9 (90%)
- [Other tiers]: 0

Mortality Statistics:
- Mean: 83.2%
- Median: 88.5%
- Range: 22.4% - 90.6%
- Q1/Q3: 86.1% / 89.8%

Technology Deployment:
- Mean unlocked: 47.2 techs
- Range: 11 - 119 techs
- Bifurcation achieved: 1/10 runs (10%)

Key Differentiators (Utopia vs Dystopia):
1. Tech deployment timing: 12mo earlier in utopia run
2. AI coordination stress: 0.35 lower in utopia run
3. Resentment accumulation: 0.28 lower in utopia run
4. Scenario: TECHNO_OPTIMIST vs DEFAULT_BALANCED

[Detailed tables...]
```

### Phase 2: Time Series Comparison (1 hour)

**Visualize divergence points:**

1. **Plot key metrics over time for all runs:**
   - Mortality trajectory
   - Technology count trajectory
   - Resentment trajectory
   - Ecological paradigm score
   - AI coordination stress

2. **Identify divergence points:**
   - When do utopia/dystopia paths split?
   - What events trigger divergence?
   - Are there tipping points in the simulation?

**Output:**
- ASCII plots (for terminal output)
- JSON data for future dashboard visualization
- Markdown report with key findings

### Phase 3: Scenario Sensitivity Analysis (30 min)

**Cross-tabulate outcomes by scenario:**

```
Scenario          | Utopia | Dystopia | Collapse | Extinction | Total
------------------|--------|----------|----------|------------|------
DEFAULT_BALANCED  |   0    |    6     |    0     |     0      |   6
TECHNO_OPTIMIST   |   1    |    2     |    0     |     0      |   3
SLOW_CAREFUL      |   0    |    1     |    0     |     0      |   1
```

**Questions:**
- Does TECHNO_OPTIMIST have higher utopia rate?
- Are some scenarios doomed to dystopia?
- What's the optimal scenario mix for N=100 validation?

### Phase 4: Generate Insights Report (30 min)

**Create:** `reviews/monte_carlo_outcome_analysis_20251130.md`

**Sections:**
1. **Executive Summary:** Key findings in 3-5 bullets
2. **Outcome Distribution:** Statistical breakdown
3. **Factor Analysis:** What drives different outcomes?
4. **Divergence Points:** When do paths split?
5. **Scenario Sensitivity:** Which scenarios lead where?
6. **Recommendations:**
   - Should we run N=100 to get better statistics?
   - Which parameters need sensitivity testing?
   - Are outcome ratios realistic (10% utopia vs 90% dystopia)?

## Research Needed

None - pure data analysis of existing Monte Carlo outputs.

## Expected Timeline

- Phase 1 (Analysis script): 1 hour
- Phase 2 (Time series comparison): 1 hour
- Phase 3 (Scenario sensitivity): 30 min
- Phase 4 (Insights report): 30 min
- **Total: 2-3 hours**

## Success Criteria

- ✅ Analysis script reads all Monte Carlo output JSONs
- ✅ Statistical summary of outcomes (distribution, mortality, tech deployment)
- ✅ Factor analysis comparing utopia vs dystopia runs
- ✅ Time series divergence point identification
- ✅ Scenario sensitivity cross-tabulation
- ✅ Insights report with actionable recommendations
- ✅ Script saved to `scripts/analyzeOutcomeDistributions.ts`
- ✅ Report saved to `reviews/monte_carlo_outcome_analysis_20251130.md`

## Risks

**Low risk:**
- Pure analysis, no code changes
- Read-only operations on existing output files

**High value:**
- Understand what drives different outcomes
- Inform parameter sensitivity testing
- Validate whether outcome distributions are realistic
- Guide future research priorities

## Dependencies

None - Monte Carlo outputs already exist.

## Future Work

After this analysis:
- **Parameter sensitivity testing:** Vary key parameters, measure outcome shifts
- **Bifurcation analysis:** Deep dive into tech deployment threshold dynamics
- **Scenario optimization:** Design scenarios to explore outcome space systematically
- **Dashboard visualization:** Add outcome distribution charts to UI
- **Automated regression detection:** Flag if outcome distributions shift unexpectedly

## Example: Key Differentiators Analysis

**Comparing Run 42007 (UTOPIA) vs other runs (DYSTOPIA):**

| Metric                  | Utopia Run | Dystopia Avg | Difference |
|------------------------|------------|--------------|------------|
| Final Mortality        | 22.4%      | 88.9%        | -66.5pp    |
| Tech Unlocked          | 119        | 41.2         | +77.8      |
| Tech Deployment Month  | 18         | 30.4         | -12.4mo    |
| Resentment Level       | 0.42       | 0.78         | -0.36      |
| AI Coord Stress        | 0.28       | 0.65         | -0.37      |
| Ecological Score       | 0.74       | 0.31         | +0.43      |
| Scenario              | TECHNO_OPT | DEFAULT      | -          |

**Insight:** Utopia run achieved 3× faster tech deployment, resulting in 66pp lower mortality. Suggests tech deployment timing is critical control variable.

## Script Outline

```typescript
// scripts/analyzeOutcomeDistributions.ts
import fs from 'fs';
import path from 'path';

interface RunData {
  seed: number;
  outcome: string;
  mortality: number;
  techCount: number;
  resentment: number;
  scenario: string;
  // ... other metrics
}

async function main() {
  // 1. Read all Monte Carlo output files
  const outputDir = 'monteCarloOutputs';
  const files = fs.readdirSync(outputDir).filter(f => f.endsWith('_unprecedented_events.json'));

  // 2. Parse and extract key metrics
  const runs: RunData[] = [];
  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(outputDir, file), 'utf-8'));
    runs.push(extractMetrics(data));
  }

  // 3. Statistical analysis
  const stats = calculateStatistics(runs);
  console.log('=== Outcome Distribution ===');
  console.log(stats.outcomeDistribution);

  // 4. Factor analysis (utopia vs dystopia)
  const factors = compareOutcomes(runs);
  console.log('=== Key Differentiators ===');
  console.log(factors);

  // 5. Scenario sensitivity
  const scenarioTable = crossTabulate(runs);
  console.log('=== Scenario Sensitivity ===');
  console.log(scenarioTable);

  // 6. Save report
  const report = generateReport(stats, factors, scenarioTable);
  fs.writeFileSync('reviews/monte_carlo_outcome_analysis_20251130.md', report);
}

main();
```

## Integration with Priya Agent

**Future:** This analysis could be automated by Priya (quantitative validation agent) after each Monte Carlo run:
- Auto-detect outcome distribution shifts
- Flag unexpected patterns
- Calculate CV for determinism validation
- Generate effectiveness metrics for interventions

**For now:** Run manually to understand current state.
