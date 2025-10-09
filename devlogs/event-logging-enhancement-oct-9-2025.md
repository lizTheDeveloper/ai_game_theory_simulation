# Event Logging Enhancement

**Date:** October 9, 2025  
**Purpose:** Add comprehensive event logging to Monte Carlo simulations

## Problem

Console.log messages are great for real-time monitoring, but they don't persist in a structured way. We needed:
1. Individual run event logs saved to files
2. Crisis triggers logged as events with timestamps
3. Cascading failure events tracked
4. Summary of crisis events in main Monte Carlo log

## Solution Implemented

### 1. Individual Run Event Logs

Each Monte Carlo run now saves a detailed JSON event log:
- **Location:** `monteCarloOutputs/run_{SEED}_events.json`
- **Contents:**
  - Seed, run number, outcome, outcome reason
  - Full event log from simulation
  - Critical events extracted
  - Initial and final state snapshots

### 2. Crisis Event Logging

Added event logging to all crisis triggers:

**Environmental Crises:**
- Resource Crisis (reserves < 30%)
- Pollution Crisis (pollution > 70%)
- Climate Catastrophe (stability < 40%)
- Ecosystem Collapse (biodiversity < 30%)

**Example Event:**
```json
{
  "type": "crisis",
  "month": 47,
  "description": "Resource Crisis: Reserves depleted to 27.3%",
  "impact": "Material abundance -30%, Energy -20%, Social stability -0.3"
}
```

### 3. Cascading Failure Events

When 3+ crises are active simultaneously:
```json
{
  "type": "cascading_failure",
  "month": 52,
  "description": "Cascading Failures: 5 crises active",
  "impact": "Degradation accelerated 2.5x - Active: Climate, Ecosystem, Meaning, Institutional, ControlLoss"
}
```

### 4. Enhanced Monte Carlo Summary

The main log now includes:
- **Crisis Events by Run section**
- Lists first 5 crisis events per run with months
- References individual event log files for full details

## Files Modified

### 1. `scripts/monteCarloSimulation.ts`
- Changed `logLevel: 'none'` → `logLevel: 'summary'`
- Added individual event log file saving
- Added crisis summary section in final report

### 2. `src/simulation/environmental.ts`
- Added `state.eventLog.push()` for all 4 environmental crises
- Added cascading failure event logging
- Improved cascading failure console message with crisis details

### 3. Social & Technological (TODO)
- Still need to add event logging to social crises
- Still need to add event logging to technological crises

## Usage

### Running Monte Carlo:
```bash
npx tsx scripts/monteCarloSimulation.ts
```

### Output Files:
- `monteCarloOutputs/mc_{TIMESTAMP}.log` - Main summary log
- `monteCarloOutputs/run_{SEED}_events.json` - Individual run events (one per run)

### Analyzing Event Logs:
```bash
# View crisis events from a specific run
cat monteCarloOutputs/run_42005_events.json | jq '.events[] | select(.type == "crisis" or .type == "cascading_failure")'

# Count crisis events by type
cat monteCarloOutputs/run_42005_events.json | jq '.events[] | select(.type == "crisis") | .description' | sort | uniq -c

# Find when cascading failures started
cat monteCarloOutputs/run_42005_events.json | jq '.events[] | select(.type == "cascading_failure") | .month'
```

## Benefits

1. **Persistent Debugging:** Can review what happened in any run without re-running
2. **Crisis Timeline:** See exactly when and why crises triggered
3. **Cascading Detection:** Track when multiple crises compound
4. **Reproducibility:** With seed + event log, can understand any outcome
5. **Analysis:** Can aggregate crisis patterns across runs

## Next Steps

### Immediate:
- [ ] Add event logging to social crisis triggers
- [ ] Add event logging to technological crisis triggers
- [ ] Test that cascading failure timing issue is resolved

### Future Enhancements:
- [ ] Add Golden Age entry/exit events
- [ ] Add extinction trigger events with mechanism details
- [ ] Add government intervention events
- [ ] Add breakthrough technology events
- [ ] Create event log visualization tool

## Example Output

### Console (Month 52):
```
⚠️⚠️⚠️  CASCADING FAILURES (Month 52): 5 crises active [Climate, Ecosystem, Meaning, Institutional, ControlLoss], degradation accelerated 2.5x
```

### Event Log:
```json
{
  "type": "cascading_failure",
  "month": 52,
  "description": "Cascading Failures: 5 crises active",
  "impact": "Degradation accelerated 2.5x - Active: Climate, Ecosystem, Meaning, Institutional, ControlLoss"
}
```

### Monte Carlo Summary:
```
🚨 CRISIS EVENTS BY RUN:
   🔥 Run 5 (Seed 42004): 8 crisis events
      Month 34: Climate Catastrophe: Stability 38.2%
      Month 41: Ecosystem Collapse: Biodiversity 27.8%
      Month 47: Resource Crisis: Reserves depleted to 28.1%
      Month 52: Cascading Failures: 5 crises active
      Month 58: Meaning Collapse triggered
      ... and 3 more (see event log)
```

## Conclusion

Event logging is now comprehensive and persistent. You can analyze any run's crisis progression by examining its event log file. This should help diagnose the "Month 1" cascading failure issue and understand the timing of all crisis triggers.

