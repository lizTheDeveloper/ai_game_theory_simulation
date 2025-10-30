# Running Simulations

Complete guide to running simulations: single runs, Monte Carlo analysis, parameter sweeps, and interpreting results.

## Table of Contents

- [Single Simulations](#single-simulations)
- [Monte Carlo Analysis](#monte-carlo-analysis)
- [Command Reference](#command-reference)
- [Output Files](#output-files)
- [Parameter Sweeps](#parameter-sweeps)
- [Performance Optimization](#performance-optimization)
- [Debugging Failed Runs](#debugging-failed-runs)

## Single Simulations

### Interactive Dashboard (Best for Exploration)

**When to use**: First time exploring, testing parameter changes, visual feedback

```bash
npm run dev
```

Open http://localhost:3333 → Click "Configure & Start"

**Advantages:**
- Real-time visualization
- Can adjust parameters mid-run
- Immediate feedback on changes
- Easy to explore "what if" scenarios

**Disadvantages:**
- Slower than headless (UI overhead)
- Only one run at a time
- Can't run in background while working

**Duration**: 2-5 minutes for 120-month simulation

### Headless Simulation (Fast, No UI)

**When to use**: Quick validation, reproducible tests, debugging specific scenarios

```bash
npx tsx scripts/debugCapabilityGrowth.ts
```

**Output**: Console logs with month-by-month progress and final outcome classification

**Advantages:**
- Fast (no rendering overhead)
- Can redirect to file for analysis
- Reproducible with same seed
- Easy to automate

**Disadvantages:**
- No visualization
- Must interpret text output
- Can't adjust parameters mid-run

**Duration**: 30-90 seconds for 120-month simulation

### Saving Simulation Output

```bash
# Save to logs/ directory (IMPORTANT: Always use logs/, never /tmp/)
npx tsx scripts/debugCapabilityGrowth.ts > logs/run_$(date +%Y%m%d_%H%M%S).log 2>&1
```

**Log file contains:**
- Initial configuration (seed, parameters)
- Month-by-month events (breakthroughs, crises, deaths)
- Phase execution timing
- Final outcome classification
- Quality of Life breakdown
- Multi-paradigm DUI scores
- Extinction classification (if applicable)

### Specifying a Seed

**Deterministic reproduction**: Same seed = same outcome

```bash
# Edit scripts/debugCapabilityGrowth.ts, line ~30:
const seed = 42000; // Set your seed here
```

**Seed format**: Integer 0-4,294,967,295 (uint32 range)

**Why seeds matter:**
- Reproduce interesting runs
- Debug specific failure modes
- Compare parameter changes with controlled RNG

**Finding interesting seeds:**
1. Run Monte Carlo with 100+ runs
2. Check `monteCarloOutputs/monte_carlo_summary.json`
3. Look for runs with unusual outcomes (utopia, early extinction, high variance)
4. Extract seed from `run_<seed>_historical_events.json`
5. Re-run with that seed to explore

## Monte Carlo Analysis

**Purpose**: Explore outcome distributions across many runs. Answer questions like:
- What percentage of runs end in extinction?
- Which parameters increase utopia probability?
- How often do sleeper agents activate?
- What's the typical timeline to AGI?

### Basic Monte Carlo Run

```bash
# Quick test (10 runs, ~5 minutes)
npx tsx scripts/monteCarloSimulation.ts

# Custom parameters
npx tsx scripts/monteCarloSimulation.ts --runs=10 --max-months=60
```

**Parameters:**
- `--runs`: Number of simulations (default: 10)
- `--max-months`: Maximum months per run (default: 120)

### Production Monte Carlo (Background Execution)

**CRITICAL: Always run long Monte Carlo analyses in background**

```bash
# Run in background, save logs, continue working
npx tsx scripts/monteCarloSimulation.ts --runs=100 --max-months=120 > logs/mc_$(date +%Y%m%d_%H%M%S).log 2>&1 &
```

**Why background execution?**
- 100 runs × 90 seconds = 2.5 hours
- You can continue working while simulation runs
- Logs persist in `/logs/` directory
- No terminal timeout issues

**Check progress:**
```bash
# See background jobs
jobs

# Watch logs in real-time
tail -f logs/mc_*.log

# Check most recent summary (updated after each run)
cat monteCarloOutputs/monte_carlo_summary.json
```

**Duration estimates:**
- 10 runs: ~10 minutes (quick test)
- 50 runs: ~45 minutes (publication-quality for simple questions)
- 100 runs: ~2.5 hours (publication-quality for complex distributions)
- 1000 runs: ~25 hours (high-precision parameter estimates)

### Output Files

Monte Carlo creates 3 types of files in `monteCarloOutputs/`:

**1. Individual Run Files** (`run_<seed>_historical_events.json`):

```json
{
  "seed": 42000,
  "config": { "governmentActionFrequency": 1.0, ... },
  "initialState": { "population": 8000000000, ... },
  "events": [
    { "month": 12, "type": "BREAKTHROUGH", "tech": "Advanced Manufacturing", ... },
    { "month": 45, "type": "CRISIS_START", "crisis": "Climate Tipping Point", ... }
  ],
  "finalState": { "population": 4200000000, ... },
  "outcome": {
    "type": "pyrrhic-dystopia",
    "mortalityRate": 0.475,
    "extinctionClassification": null,
    ...
  }
}
```

**What you can do with it:**
- Reproduce interesting runs (extract seed)
- Analyze event sequences leading to outcomes
- Debug unexpected behaviors
- Create visualizations of specific trajectories

**2. Summary File** (`monte_carlo_summary.json`):

```json
{
  "totalRuns": 100,
  "completedRuns": 100,
  "failedRuns": 0,
  "outcomeDistribution": {
    "utopia": 5,
    "dystopia": 28,
    "collapse": 35,
    "extinction": 32
  },
  "averagePopulation": 3.2e9,
  "averageDuration": 87.5,
  "parameters": { "governmentActionFrequency": 1.0, ... },
  "extinctionTypes": {
    "rapid": 15,
    "slow": 12,
    "controlled": 3,
    "unintended": 2
  }
}
```

**What you can do with it:**
- Quick outcome distribution check
- Compare different parameter configurations
- Identify high-variance parameters
- Generate summary statistics for reports

**3. Aggregate Statistics** (`monte_carlo_stats.json`):

```json
{
  "outcomes": {
    "utopia": { "count": 5, "percentage": 5.0, "avgPopulation": 8.5e9, "avgQoL": 0.82 },
    "dystopia": { "count": 28, "percentage": 28.0, "avgPopulation": 6.1e9, "avgQoL": 0.45 },
    ...
  },
  "capabilities": {
    "mean": 4.2,
    "median": 3.8,
    "p90": 6.5,
    "max": 9.2
  },
  "alignment": {
    "mean": 0.48,
    "median": 0.52,
    "p10": 0.21,
    "p90": 0.76
  },
  "crises": {
    "avgActiveCrises": 4.3,
    "cascadeEvents": 67,
    "avgCascadeMultiplier": 3.2
  }
}
```

**What you can do with it:**
- Publication-ready statistics
- Parameter sensitivity analysis
- Risk assessment (p10, p90 bounds)
- Hypothesis testing (does parameter X reduce extinction?)

### Visualizing Monte Carlo Results

**Paradigm Trajectories** (single run):

```bash
# Visualize how the 4 paradigms evolved over time
npx tsx scripts/visualizeParadigmTrajectories.ts monteCarloOutputs/run_42000_historical_events.json
```

**Output**:
- Sparkline charts (ASCII art showing trends)
- Heatmap (month × paradigm scores)
- Divergence timeline (when paradigms disagreed most)
- Key events (breakthroughs, crises, inflection points)

**Compare Multiple Runs**:

```bash
# Compare paradigm evolution across all runs in a directory
npx tsx scripts/compareParadigmRuns.ts monteCarloOutputs/
```

**Output**:
- Side-by-side trajectory comparison
- Aggregate statistics (mean, median, variance per paradigm)
- Outcome breakdown by paradigm configurations
- Contested outcome analysis (how often do paradigms disagree?)

### Interpreting Monte Carlo Results

**Outcome Distribution Analysis:**

```json
{
  "utopia": 5,      // 5% - rare, requires high alignment + effective governance
  "dystopia": 28,   // 28% - common, control without quality
  "collapse": 35,   // 35% - most common, systems degrade but humanity survives
  "extinction": 32  // 32% - significant risk, often from uncontrolled AI
}
```

**Questions to ask:**
1. **What's the extinction rate?** If >20%, parameters need adjustment or intervention strategies needed
2. **What's the utopia rate?** If <10%, positive outcomes require specific conditions (what are they?)
3. **What's the collapse rate?** If >50%, most scenarios involve mass death even without extinction
4. **Are outcomes clustered or spread?** High variance = sensitive to initial conditions, low variance = robust patterns

**Parameter Sensitivity Analysis:**

Run Monte Carlo with different parameter values:

```bash
# Baseline (gov action = 1.0)
npx tsx scripts/monteCarloSimulation.ts --runs=50 > logs/mc_baseline.log 2>&1 &

# High gov action (2.5)
# Edit config in scripts/monteCarloSimulation.ts, set governmentActionFrequency = 2.5
npx tsx scripts/monteCarloSimulation.ts --runs=50 > logs/mc_high_gov.log 2>&1 &

# Compare outcomes
diff monteCarloOutputs/monte_carlo_summary.json monteCarloOutputs/monte_carlo_summary_high_gov.json
```

**Look for:**
- Extinction rate change (did high gov action reduce extinction?)
- Outcome distribution shift (more utopia? More dystopia?)
- Population change (did intervention save lives?)
- Capability trajectory (did regulation slow AI development?)

**Trade-off Analysis:**

Many parameters have trade-offs:
- **High gov action**: Reduces extinction risk, increases dystopia risk (authoritarian control)
- **High social adaptation**: Reduces meaning crisis, but may enable harmful tech adoption
- **High AI coordination**: Faster breakthroughs, but amplifies alignment failures (coordinated misalignment)

Monte Carlo reveals these trade-offs empirically.

## Command Reference

### All Simulation Commands

```bash
# Single headless run
npx tsx scripts/debugCapabilityGrowth.ts

# Monte Carlo (10 runs, default)
npx tsx scripts/monteCarloSimulation.ts

# Monte Carlo (custom)
npx tsx scripts/monteCarloSimulation.ts --runs=50 --max-months=60

# Monte Carlo (background, production)
npx tsx scripts/monteCarloSimulation.ts --runs=100 > logs/mc_$(date +%Y%m%d_%H%M%S).log 2>&1 &

# Visualize single run trajectories
npx tsx scripts/visualizeParadigmTrajectories.ts monteCarloOutputs/run_<seed>.json

# Compare multiple runs
npx tsx scripts/compareParadigmRuns.ts monteCarloOutputs/

# Diagnostic scripts (see docs/COMMANDS.md for full list)
npx tsx scripts/diagnosticAdversarialEval.ts      # Sleeper agents, deception
npx tsx scripts/investigateExtinction.ts          # Extinction mechanisms
npx tsx scripts/testControlDystopia.ts            # Authoritarian dynamics
npx tsx scripts/validateTechEffects.ts            # Technology verification
```

### Logging Best Practices

**CRITICAL: Always save logs to `/logs/`, NEVER `/tmp/`**

```bash
# ✅ GOOD - Logs persist, tracked in git
npx tsx scripts/monteCarloSimulation.ts > logs/mc_$(date +%Y%m%d_%H%M%S).log 2>&1 &

# ❌ BAD - /tmp gets cleared, logs lost
npx tsx scripts/monteCarloSimulation.ts > /tmp/output.log 2>&1 &
```

**Log file naming convention:**
- `mc_YYYYMMDD_HHMMSS.log` for Monte Carlo runs
- `run_<seed>_YYYYMMDD.log` for specific seed reproduction
- `debug_<feature>_YYYYMMDD.log` for diagnostic scripts

**Log rotation**: Logs can grow large (100 runs = 50-100 MB). Archive old logs to `logs/archive/` periodically.

## Parameter Sweeps

**Goal**: Systematically explore parameter space to find optimal configurations or understand sensitivity.

### Manual Parameter Sweep

**Example: Government action frequency sweep (0.5, 1.0, 2.0, 3.5)**

```bash
# Create sweep script
cat > scripts/parameterSweep.ts << 'EOF'
import { runSimulation } from './monteCarloSimulation';

const govFrequencies = [0.5, 1.0, 2.0, 3.5];
const runsPerConfig = 25;

for (const freq of govFrequencies) {
  console.log(`\n=== Testing gov frequency: ${freq} ===\n`);

  // Modify config
  const config = { governmentActionFrequency: freq };

  // Run Monte Carlo with this config
  for (let i = 0; i < runsPerConfig; i++) {
    const result = runSimulation(config);
    // Save result
  }
}
EOF

# Run sweep
npx tsx scripts/parameterSweep.ts > logs/sweep_gov_freq_$(date +%Y%m%d).log 2>&1 &
```

**Duration**: 25 runs × 4 configs = 100 runs = ~2.5 hours

**Analysis**:

```bash
# Extract extinction rates per config
grep "Extinction rate:" logs/sweep_gov_freq_*.log

# Plot with Python/R
python scripts/plotParameterSweep.py logs/sweep_gov_freq_*.log
```

### Grid Search (Multiple Parameters)

**Example: 2D grid search (gov action × social adaptation)**

```bash
# Gov action: [0.5, 1.0, 2.0]
# Social adapt: [0.5, 1.0, 1.5]
# Total configs: 3 × 3 = 9
# Runs per config: 20
# Total runs: 9 × 20 = 180 runs (~4.5 hours)

# Automated grid search (create script similar to sweep above)
npx tsx scripts/gridSearch.ts > logs/grid_$(date +%Y%m%d).log 2>&1 &
```

**Output**: Heatmap of extinction rates by (gov action, social adaptation)

**Insights**:
- Which combinations are safe? (low extinction)
- Which combinations are Pareto optimal? (low extinction, high QoL)
- Are there synergies? (parameters that interact non-additively)

## Performance Optimization

### Memory Usage

**Problem**: Monte Carlo runs use 10-100 MB per simulation step due to deep state cloning.

**Solutions**:

1. **Reduce max months**: `--max-months=60` instead of 120 (halves memory)
2. **Reduce history tracking**: Edit `src/lib/gameStore.ts`, reduce history buffer size
3. **Run fewer parallel runs**: Single-threaded is memory-efficient
4. **Close other applications**: Free RAM for simulation

### CPU Usage

**Problem**: Single-threaded simulation is CPU-bound.

**Solutions**:

1. **Use background execution**: `&` operator runs in background, terminal remains usable
2. **Lower process priority**: `nice -n 10 npx tsx scripts/monteCarloSimulation.ts`
3. **Run overnight**: Long sweeps run while you sleep
4. **Use cloud compute**: Spin up AWS/GCP instance for large sweeps

### Disk I/O

**Problem**: Monte Carlo writes many files (100 runs = 100 JSON files).

**Solutions**:

1. **Use SSD**: Faster write speeds (NVMe preferred)
2. **Batch writes**: Modify script to write every 10 runs instead of every run
3. **Compress outputs**: `gzip monteCarloOutputs/*.json` after completion
4. **Use RAM disk** (advanced): `mount -t tmpfs -o size=2G tmpfs /mnt/ramdisk`

### Profiling

**Node.js built-in profiler:**

```bash
# Run with profiler
node --prof $(which tsx) scripts/monteCarloSimulation.ts --runs=10

# Process isolate file
node --prof-process isolate-*.log > profile.txt

# View profile
less profile.txt
```

**Look for**:
- Hot functions (>5% CPU time)
- Deep call stacks (O(n²) operations)
- Excessive object creation (GC pressure)

**Common bottlenecks:**
1. Deep cloning state (10-20% of CPU time)
2. Array operations (filtering, mapping, reducing)
3. Outcome classification (complex conditionals)
4. Quality of Life calculation (17 dimensions × 5 tiers)

See `plans/performance-optimization-plan.md` for detailed performance improvement strategies.

## Debugging Failed Runs

### Simulation Crashes

**Symptom**: Simulation exits with error or throws exception

**Common causes:**
1. **NaN values**: Invalid calculation produces Not-a-Number
2. **Undefined access**: Missing property in state
3. **Type errors**: Strict TypeScript violations
4. **Out of memory**: State too large

**Debugging steps:**

```bash
# Run with verbose logging
DEBUG=* npx tsx scripts/debugCapabilityGrowth.ts 2>&1 | tee logs/debug.log

# Check for NaN
grep -i "nan" logs/debug.log

# Check for undefined
grep -i "undefined" logs/debug.log

# Check last successful month
grep "Month [0-9]" logs/debug.log | tail -5
```

**Fix NaN values:**
- Check assertion utilities in `src/simulation/utils/assertions.ts`
- Use `assertFinite`, `assertProbability`, `assertInRange` to validate calculations
- Never use silent fallbacks (e.g., `value ?? defaultValue` in calculations)

### Unexpected Outcomes

**Symptom**: Simulation completes but outcome is unrealistic

**Examples:**
- Utopia with 2 billion dead (should be pyrrhic-utopia)
- Extinction at Month 10 (too fast)
- Population >10 billion (exceeds carrying capacity)
- Negative QoL or capability values

**Debugging steps:**

```bash
# Extract key events
grep "BREAKTHROUGH\|CRISIS\|DEATH\|EXTINCTION" logs/run_*.log

# Check parameter configuration
grep "Config:" logs/run_*.log

# Trace population changes
grep "Population:" logs/run_*.log

# Check outcome classification
grep "Outcome:" logs/run_*.log
```

**Common issues:**
1. **Wrong outcome classification**: Check thresholds in `src/simulation/outcomes.ts`
2. **Mortality calculation error**: Check `src/simulation/bayesianMortality.ts`
3. **Cascade amplification too high**: Check crisis multipliers
4. **Capability growth too fast**: Check recursive improvement thresholds

**Report bugs:**
- Save full log: `npx tsx scripts/debugCapabilityGrowth.ts > logs/bug_$(date +%Y%m%d).log 2>&1`
- Include seed (for reproduction)
- Describe expected vs actual behavior
- Note which month the issue appeared

### Slow Performance

**Symptom**: Simulation takes >5 minutes for 120 months

**Possible causes:**
1. Too many AI agents (>30 agents)
2. Too many organizations (>20 orgs)
3. Deep history tracking (storing all 120 months)
4. Complex outcome calculations every month

**Profiling:**

```bash
# Run with timing
time npx tsx scripts/debugCapabilityGrowth.ts

# Run with profiler (see Performance Optimization section)
node --prof $(which tsx) scripts/debugCapabilityGrowth.ts --runs=1
```

**Quick fixes:**
1. Reduce max months: `--max-months=60`
2. Disable history tracking: Comment out history push in `src/lib/gameStore.ts`
3. Reduce agent count: Edit `DEFAULT_CONFIG` in `src/types/game.ts`

## Known Issues and Validation Status

**Last Updated:** October 30, 2025

This section tracks ongoing Monte Carlo validation findings and data quality issues. See `/logs/monte_carlo_issues_*.md` for detailed investigation reports.

### Recent Validation (N=100, Oct 29-30, 2025)

**Completed Fixes:**
- ✅ **ISSUE-1** (Western Liberal paradigm null): Field name mismatch in data export - FIXED
- ✅ **ISSUE-2** (Outcome classification reasons): Reason strings didn't reflect actual classification method - FIXED
- ✅ **ISSUE-3** (Biosphere boundary 460× threshold): Normalization error using absolute values instead of safe baseline - FIXED
- ✅ **ISSUE-4** (100% dystopia rate): Validated as working-as-designed for "unprecedented" scenario mode

**Under Investigation:**

**ISSUE-5: AI Gaming Detection at Month 0** (Status: Deferred - research validation needed)
- **Evidence:** Gaming detected at month 0 for Toxic/Niche agents via data contamination
- **Code analysis:** Agents initialize with `evaluationStrategy='honest'`, 3-month protection period
- **Possible explanations:**
  - False positives (12% baseline rate)
  - Month numbering confusion (display vs internal counter)
  - Test-Set Contamination mechanic validates research ("gaming is pervasive")
- **Recommendation:** Accept as realistic behavior OR validate false positive rate
- **Investigation log:** `/logs/issue5_investigation_20251030.md`

**ISSUE-6: Refugee Crisis Initialization (325M at risk)** (Status: Bug found - fix pending)
- **Evidence:** Month 0 shows 325M refugees at risk (3× current global total of ~110M)
- **Root cause:** `refugeeCrises.ts:410` uses GLOBAL population (8B) instead of conflict zone population (~400M)
- **Impact:** 10× over-estimation of displacement (320M vs realistic ~16-32M)
- **Fix required:** Calculate regional conflict zone population, use for displacement calculations
- **Priority:** HIGH - affects refugee crisis realism and cascading social effects

**Data Export Issues (FIXED):**
- ✅ **ISSUE-7** (Population data null): Snapshot export missing population fields - FIXED
- ✅ **ISSUE-8** (Biosphere data null): Snapshot export missing planetary boundary data - FIXED

### Interpreting Validation Results

**When you see unexpected patterns in Monte Carlo runs:**

1. **Check investigation logs:** `/logs/issue*_investigation_*.md` for detailed analysis
2. **Review roadmap:** `plans/SIMULATION_ROADMAP.md` for current bug fix status
3. **Consult research backing:** Many "bugs" are research-validated behaviors
4. **Consider scenario mode:** "unprecedented" vs "historical" have different parameter sets

**Common validation patterns:**

- **High extinction rates (>50%)**: Check for recent parameter changes, cascade amplification bugs
- **No outcome diversity (100% one outcome)**: May be correct for specific scenario modes
- **Month-0 anomalies**: Often initialization bugs (see ISSUE-6 refugee crisis example)
- **Data export nulls**: Snapshot creation bugs, not simulation logic errors

**Reporting new issues:**

1. Run `scripts/monteCarloSimulation.ts --runs=100` with detailed logging
2. Analyze `monteCarloOutputs/monte_carlo_summary.json` for patterns
3. Create investigation log in `/logs/issue*_investigation_YYYYMMDD.md`
4. Update `plans/SIMULATION_ROADMAP.md` with findings
5. Route to `simulation-maintainer` agent for fixes

## Advanced Topics

### Reproducibility

**Challenge**: Ensure same seed produces same outcome across runs, machines, versions.

**Requirements:**
1. **Fixed seed**: Always use same RNG seed
2. **Fixed config**: Same parameters
3. **Fixed version**: Same code version (git commit)
4. **Fixed Node version**: Same Node.js version

**Reproduction protocol:**

```bash
# Record environment
node --version > logs/reproduction_env.txt
git rev-parse HEAD >> logs/reproduction_env.txt
echo "Seed: 42000" >> logs/reproduction_env.txt

# Run with seed
npx tsx scripts/debugCapabilityGrowth.ts > logs/run_42000_$(date +%Y%m%d).log 2>&1

# Archive
mkdir -p logs/archive/reproductions/
cp logs/run_42000_*.log logs/reproduction_env.txt logs/archive/reproductions/
```

**If reproduction fails:**
- Check Node version (different versions may have different Math.random implementations)
- Check git commit (code changes break determinism)
- Check config (parameters must be identical)
- Check RNG usage (any `Math.random()` calls break determinism - all RNG must use seeded RNG function)

### Sensitivity Analysis

**Goal**: Measure how much each parameter affects outcomes.

**Method**: One-at-a-time (OAT) sensitivity

```bash
# Baseline
npx tsx scripts/monteCarloSimulation.ts --runs=50 > logs/baseline.log 2>&1

# Perturb parameter +10%
# Edit config: governmentActionFrequency = 1.1 (was 1.0)
npx tsx scripts/monteCarloSimulation.ts --runs=50 > logs/gov_freq_plus10.log 2>&1

# Calculate sensitivity
python scripts/calculateSensitivity.py logs/baseline.log logs/gov_freq_plus10.log
```

**Sensitivity metric**:
```
Sensitivity = (ΔOutcome / Outcome_baseline) / (ΔParameter / Parameter_baseline)
```

High sensitivity (>2.0) = parameter has strong effect on outcomes

### Variance Analysis

**Goal**: Understand which parameters increase outcome variance (randomness).

**Method**: Compare standard deviation of outcomes across runs.

```bash
# High variance parameters:
# - RNG seed (by definition)
# - Initial AI alignment distribution
# - Crisis timing (stochastic)

# Low variance parameters:
# - Government action frequency (deterministic effect)
# - Economic transition rate (deterministic effect)

# Measure variance
npx tsx scripts/varianceAnalysis.ts monteCarloOutputs/
```

**High variance** = outcomes sensitive to random events (hard to predict)
**Low variance** = outcomes robust to random events (easier to plan for)

## Next Steps

Now that you can run simulations:

1. **Explore parameter space** with Monte Carlo analysis
2. **Identify critical parameters** that most affect outcomes
3. **Test hypotheses** about intervention strategies
4. **Document findings** in research notes
5. **Read Understanding Results guide** for interpreting outcome classifications

Simulation is the core of the research workflow. Systematic exploration reveals insights that intuition misses.
