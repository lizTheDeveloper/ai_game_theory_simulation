# Monte Carlo Dystopia Statistics Analysis

## Current Monte Carlo Output (What You GET)

Based on `src/simulation-runner/monteCarlo.ts`, the current output provides:

### ✅ What's Currently Tracked

**1. Outcome Distribution** (lines 376-383):
```
Outcome Distribution:
  Utopia:       X%
  Dystopia:     X%
  Extinction:   X%
  Inconclusive: X%
```

**2. Extinction Details** (lines 415-432):
```
💀 Active Extinction Scenarios:
  gradual      resource_depletion              X runs
  rapid        climate_catastrophe             X runs
```

**3. Average Metrics** (lines 449-454):
```
AI Capability: +X.XX ± X.XX
Unemployment:  +XX.X% ± XX.X%
Trust:         +XX.X% ± XX.X%
Economic Stage: +X.XX ± X.XX
```

**4. World Rankings** (lines 390-413):
```
✨ Top 10 Most Utopian Worlds
☠️  Top 10 Most Doomed Worlds
```

**5. Quartile Progression** (lines 437-446):
```
Initial (Month 0): AI=X.XX Unemp=XX% ...
Q1      (Month X): ...
Final   (Month X): ...
```

### ❌ What's MISSING for Dystopia

**1. NO Dystopia Variant Tracking**
- Which dystopia types occurred (surveillance, corporate, extraction, etc.)
- Frequency of each variant
- Duration statistics per variant

**2. NO Dystopia Duration Statistics**
- Average months spent in dystopia
- Median/min/max duration
- Transition patterns

**3. NO Dystopia Entry/Exit Tracking**
- How many simulations entered dystopia
- How many escaped vs got locked in
- Entry reasons distribution

**4. NO Dystopia Severity Metrics**
- Average severity levels
- Population affected statistics
- Suffering category breakdown

**5. NO Multi-Level Dystopia Analysis**
- Global vs Regional vs Hegemonic distribution
- Which countries entered dystopia most often
- Extraction/war dystopia frequency

---

## Log File Analysis Required

Since dystopia metrics aren't in the Monte Carlo summary, you need **stream editing** to extract them from logs.

### Created Tool: `scripts/analyzeDystopiaStats.sh`

**Usage:**
```bash
./scripts/analyzeDystopiaStats.sh /tmp/mc_dystopia_240_50.log
```

**What It Extracts:**

1. **Entry/Exit Events**
   ```bash
   grep -c "🚨 ENTERING DYSTOPIA:"
   grep -c "✅ EXITING DYSTOPIA:"
   grep -c "🔄 DYSTOPIA VARIANT CHANGE:"
   ```

2. **Variant Distribution**
   ```bash
   grep "🚨 ENTERING DYSTOPIA:" | sed -E 's/.*: ([a-z_]+).*/\1/' | sort | uniq -c
   ```
   Output:
   ```
   23 corporate_feudalism
   18 elysium_inequality
   9 surveillance_state
   ```

3. **Duration Statistics**
   ```bash
   grep "Duration:" | sed -E 's/.*: ([0-9]+) months.*/\1/'
   ```
   Calculates: avg, median, min, max, stddev

4. **Severity Analysis**
   ```bash
   grep "Severity:" | sed -E 's/.*: ([0-9]+)%.*/\1/'
   ```
   Calculates: avg severity, min/max

5. **Entry Reasons**
   ```bash
   grep -A 1 "🚨 ENTERING DYSTOPIA:" | grep "Reason:"
   ```
   Shows what triggered each dystopia

6. **Final Outcome Correlation**
   ```bash
   grep "Final Outcome: DYSTOPIA"
   grep "Final Outcome: EXTINCTION"
   ```
   Counts terminal vs escaped dystopias

---

## What the Current Monte Carlo Summary SHOULD Include

### Recommended Additions to `monteCarlo.ts`

#### 1. Add Dystopia Tracking to Results Interface

```typescript
export interface MonteCarloResults {
  // ... existing fields ...

  // NEW: Dystopia-specific analysis
  dystopiaAnalysis: {
    // Entry/Exit stats
    totalEntries: number;
    totalExits: number;
    totalTransitions: number;
    runsWithDystopia: number;
    runsEndedInDystopia: number;

    // Variant distribution
    variantFrequency: Record<string, number>;  // corporate_feudalism: 23, etc.

    // Duration statistics
    durationStats: {
      mean: number;
      median: number;
      stdDev: number;
      min: number;
      max: number;
    };

    // Severity statistics
    severityStats: {
      mean: number;
      min: number;
      max: number;
    };

    // Level distribution
    levelDistribution: {
      global: number;
      hegemonic: number;
      regional: number;
    };

    // Entry reasons (top 10)
    topEntryReasons: Array<{ reason: string; count: number }>;

    // Escape statistics
    escapeRate: number;  // % of dystopias that were exited
    lockInRate: number;  // % that became terminal
  };
}
```

#### 2. Collect Dystopia Data During Analysis

```typescript
function analyzeMonteCarloResults(runs: SimulationRunResult[], config: MonteCarloConfig): MonteCarloResults {
  // ... existing code ...

  // NEW: Analyze dystopia state from each run
  const dystopiaVariants: Record<string, number> = {};
  const dystopiaDurations: number[] = [];
  let totalDystopiaEntries = 0;
  let totalDystopiaExits = 0;
  let runsWithDystopia = 0;
  let runsEndedInDystopia = 0;

  runs.forEach(run => {
    const dystopiaState = run.finalState.dystopiaState;

    // Count if run ever entered dystopia
    if (dystopiaState.totalMonthsInDystopia > 0) {
      runsWithDystopia++;
      dystopiaDurations.push(dystopiaState.totalMonthsInDystopia);

      // Track variant history
      dystopiaState.previousVariants.forEach(v => {
        dystopiaVariants[v.type] = (dystopiaVariants[v.type] || 0) + 1;
      });

      // Track if currently in dystopia at end
      if (dystopiaState.active) {
        runsEndedInDystopia++;
        if (dystopiaState.variant) {
          dystopiaVariants[dystopiaState.variant] = (dystopiaVariants[dystopiaState.variant] || 0) + 1;
        }
      }
    }
  });

  // Calculate duration statistics
  const durationStats = calculateStats(dystopiaDurations);

  return {
    // ... existing fields ...
    dystopiaAnalysis: {
      totalEntries: dystopiaVariants length,
      runsWithDystopia,
      runsEndedInDystopia,
      variantFrequency: dystopiaVariants,
      durationStats,
      escapeRate: (runsWithDystopia - runsEndedInDystopia) / runsWithDystopia,
      lockInRate: runsEndedInDystopia / runsWithDystopia,
      // ...
    }
  };
}
```

#### 3. Display Dystopia Statistics in Output

```typescript
export function exportResults(results: MonteCarloResults, filename: string): void {
  // ... existing output ...

  // NEW: Dystopia section
  const dystopia = results.dystopiaAnalysis;

  console.log('\n🏚️  DYSTOPIA ANALYSIS:');
  console.log('====================');
  console.log(`Runs with dystopia: ${dystopia.runsWithDystopia}/${results.runs.length} (${(dystopia.runsWithDystopia / results.runs.length * 100).toFixed(1)}%)`);
  console.log(`Ended in dystopia:  ${dystopia.runsEndedInDystopia} (${(dystopia.lockInRate * 100).toFixed(1)}% lock-in rate)`);
  console.log(`Escaped dystopia:   ${dystopia.runsWithDystopia - dystopia.runsEndedInDystopia} (${(dystopia.escapeRate * 100).toFixed(1)}% escape rate)`);

  console.log('\n📊 Dystopia Variant Frequency:');
  Object.entries(dystopia.variantFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([variant, count]) => {
      console.log(`  ${variant.padEnd(25)}: ${count} occurrences`);
    });

  console.log('\n⏱️  Dystopia Duration Statistics:');
  console.log(`  Average: ${dystopia.durationStats.mean.toFixed(1)} months`);
  console.log(`  Median:  ${dystopia.durationStats.median.toFixed(1)} months`);
  console.log(`  Range:   ${dystopia.durationStats.min}-${dystopia.durationStats.max} months`);
  console.log(`  Std Dev: ${dystopia.durationStats.stdDev.toFixed(1)} months`);
}
```

---

## Stream Editing Commands for Immediate Analysis

While waiting for Monte Carlo integration, use these commands on log files:

### 1. Quick Dystopia Summary
```bash
echo "Dystopia Entries: $(grep -c '🚨 ENTERING' /tmp/mc_dystopia_240_50.log)"
echo "Dystopia Exits: $(grep -c '✅ EXITING' /tmp/mc_dystopia_240_50.log)"
echo "Variant Changes: $(grep -c '🔄 DYSTOPIA' /tmp/mc_dystopia_240_50.log)"
```

### 2. Variant Frequency
```bash
grep "🚨 ENTERING DYSTOPIA:" /tmp/mc_dystopia_240_50.log | \
  sed -E 's/.*ENTERING DYSTOPIA: ([a-z_]+).*/\1/' | \
  sort | uniq -c | sort -rn
```

### 3. Duration Distribution
```bash
grep "Duration:" /tmp/mc_dystopia_240_50.log | \
  sed -E 's/.*Duration: ([0-9]+) months.*/\1/' | \
  awk '{sum+=$1; n++; print $1} END {print "Average:", sum/n, "months"}'
```

### 4. Severity Heatmap
```bash
grep "Severity:" /tmp/mc_dystopia_240_50.log | \
  sed -E 's/.*Severity: ([0-9]+)%.*/\1/' | \
  awk '{
    if ($1 < 30) low++
    else if ($1 < 60) med++
    else high++
  } END {
    print "Low severity (<30%):", low
    print "Med severity (30-60%):", med
    print "High severity (>60%):", high
  }'
```

### 5. Per-Run Dystopia Tracking
```bash
# Extract run number and dystopia events together
grep -E "(Progress: [0-9]+/|ENTERING DYSTOPIA|EXITING DYSTOPIA)" /tmp/mc_dystopia_240_50.log | \
  grep -B 1 "DYSTOPIA" | \
  grep -E "Progress:|DYSTOPIA"
```

### 6. Outcome Correlation
```bash
# For each run that ended in dystopia, what variant?
grep -B 5 "Final Outcome: DYSTOPIA" /tmp/mc_dystopia_240_50.log | \
  grep "dystopia sustained" | \
  sed -E 's/.* ([a-z_]+) dystopia sustained.*/\1/' | \
  sort | uniq -c | sort -rn
```

---

## Recommendations

### Priority 1: Immediate (Use Shell Scripts)
✅ **Done**: Created `analyzeDystopiaStats.sh`
- Run on any Monte Carlo log file
- Extracts 6 key dystopia metrics
- No code changes needed

### Priority 2: Short-term (Modify Monte Carlo)
Add dystopia tracking to `src/simulation-runner/monteCarlo.ts`:
1. Track `dystopiaState` in each run
2. Calculate dystopia-specific statistics
3. Display in summary output
4. Export to JSON for further analysis

### Priority 3: Long-term (Dashboard)
Create dedicated dystopia analysis dashboard:
- Variant timeline visualization
- Entry/exit patterns
- Duration histograms
- Severity heatmaps
- Regional dystopia maps

---

## Example Output Analysis

### Current Monte Carlo Output (Generic)
```
📈 Monte Carlo Results Summary:
================================
Total Runs: 50

Outcome Distribution:
  Utopia:       12.0%
  Dystopia:     34.0%  ← ONLY THIS
  Extinction:   48.0%
  Inconclusive: 6.0%
```

### What You'd Get with Shell Script
```
=== DYSTOPIA VARIANTS DETECTED ===
     23 corporate_feudalism
     18 elysium_inequality
     12 surveillance_state
      7 extraction_dystopia
      5 algorithmic_oppression

=== DYSTOPIA DURATION STATISTICS ===
Dystopia durations analyzed: 34
Average duration: 47.3 months
Median duration: 42.0 months
Min duration: 8 months
Max duration: 156 months

=== DYSTOPIA SEVERITY ANALYSIS ===
Average severity: 68.4%
Min severity: 32%
Max severity: 94%
```

### What You'd Get with Integrated Tracking
```
🏚️  DYSTOPIA ANALYSIS:
====================
Runs with dystopia: 34/50 (68.0%)
Ended in dystopia:  17 (50.0% lock-in rate)
Escaped dystopia:   17 (50.0% escape rate)

📊 Dystopia Variant Frequency:
  corporate_feudalism      : 23 occurrences
  elysium_inequality       : 18 occurrences
  surveillance_state       : 12 occurrences

⏱️  Dystopia Duration Statistics:
  Average: 47.3 months
  Median:  42.0 months
  Range:   8-156 months
```

---

## Conclusion

**Current State:**
- ❌ Monte Carlo summary does NOT track dystopia-specific metrics
- ✅ All data IS in the logs (console output)
- ✅ Created shell script to extract dystopia stats

**What You Need:**
1. **Run the analysis script** after Monte Carlo completes:
   ```bash
   ./scripts/analyzeDystopiaStats.sh /tmp/mc_dystopia_240_50.log
   ```

2. **Consider adding** dystopia tracking to `monteCarlo.ts` for automatic summary

3. **Use stream editing** for quick analysis during development:
   ```bash
   grep "DYSTOPIA" /tmp/mc_dystopia_240_50.log | head -20
   ```

**The script answers all your questions:**
- ✅ How often does each dystopia variant occur?
- ✅ How long do dystopias last?
- ✅ What triggers dystopia entry?
- ✅ What's the escape rate vs lock-in rate?
- ✅ What's the severity distribution?
- ✅ Which outcomes correlate with which variants?

---

*Generated: October 15, 2025*
*For: Monte Carlo dystopia analysis (240 months, 50 runs)*
