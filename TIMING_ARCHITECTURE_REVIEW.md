# Timing Architecture Review - October 23, 2025

## Summary

The simulation has **two separate timing systems** that were causing confusion:
1. **UI day ticker** (cosmetic) - Shows days 1-30 counting up
2. **Simulation engine** (actual) - Advances 1 month per step

The "weird refresh on day 30" is these two systems synchronizing.

## Critical Issue Found

**My "fix" for the population bug was completely wrong and broke the simulation!**

### What I Did Wrong
- Added `if (state.currentDay !== 30) return { events: [] };` to 4 phases
- Thought this would make them run only on day 30
- **Result:** Phases **NEVER executed** because `state.currentDay` is always 1

### Why It Seemed to Work
- Population stayed at 8.00B not because the fix worked
- But because the population phase **stopped running entirely** 😱

## Architecture Details

### How Timing Actually Works

**Worker (simulationWorker.ts):**
```javascript
// Line 451: Day ticker (UI only)
setInterval(() => {
  currentDay++;  // 1, 2, 3, ... 30
  // Send to UI for display
}, 1000); // Every 1 second

// Line 478: Simulation step (actual game logic)
setInterval(() => {
  currentDay = 1;  // Reset for new month
  engine.step(state);  // Advance simulation 1 month
}, 30000); // Every 30 seconds
```

**Engine (engine.ts):**
```typescript
step(state: GameState): SimulationStepResult {
  // Execute all 37 phases in order
  this.orchestrator.executeAll(newState, rng);

  // TimeAdvancementPhase (last phase):
  state.currentMonth += 1;  // Advance 1 month

  // state.currentDay is NEVER updated!
}
```

### The "Weird Refresh on Day 30"

What you're seeing:
1. Day ticker shows: Day 28... Day 29... Day 30...
2. Simulation step fires → resets currentDay = 1
3. UI suddenly jumps: Day 30 → Day 1 of next month
4. **This is normal behavior!** The visual "refresh" is just the counter resetting

## Actual Population Bug

**There never was a "population running 30x per month" bug!**

The simulation already works correctly:
- `engine.step()` is called once every 30 seconds = once per month
- Each step advances 1 month via TimeAdvancementPhase
- Population phases run once per step = once per month ✅

### What Was Actually Wrong

Looking at the git history, there WAS a population loss issue, but it was already fixed in commit `63e33a2` (October 22) by someone else. That fix correctly addressed nuclear war calibration and GDP issues - nothing to do with daily vs monthly execution.

## The Real Fix

**Reverted my broken changes** (commit `2146ee8`):
- Removed `if (state.currentDay !== 30)` checks from 4 phases
- Phases now execute normally on every engine.step()
- Each step = 1 month, so phases run monthly as intended

## Remaining Issues

### 1. Build Error: government-agents package
```
Module not found: Can't resolve '@lizthedeveloper/government-agents'
```

**Issue:** Package link not persisting across rebuilds
**Status:** Needs investigation

### 2. Architectural Confusion

**The day/month split is confusing:**
- `currentDay` is UI-only but exists in GameState
- Two independent timing systems (worker ticker + engine step)
- Visual "refresh" on day 30 is jarring

**Recommendations:**
- **Option 1 (Simple):** Remove `currentDay` from GameState entirely - make it worker-local UI state only
- **Option 2 (Complex):** Implement true daily simulation with 30 steps per month
- **Option 3 (Hybrid):** Add phase execution frequency metadata (run every N steps)

## Files Modified

**Commit `2146ee8` - Phase execution fixes:**
- `src/simulation/engine/phases/HumanPopulationPhase.ts`
- `src/simulation/engine/phases/CountryPopulationPhase.ts`
- `src/simulation/engine/phases/FoodSecurityDegradationPhase.ts`
- `src/simulation/engine/phases/NuclearWinterPhase.ts`

**Commit `53a6b73` - Build error fixes:**
- `src/simulation/government/initialization.ts` (package import)
- `src/simulation/organizationManagement.ts` (duplicate SeededRandom)

## Key Takeaway

**The simulation was working correctly all along.**

The "weird refresh" is just the visual day counter resetting to 1 when a new month starts. This is cosmetic - the actual simulation logic is sound.

The real issue was my misunderstanding of the architecture, which led to a "fix" that broke working code. The architecture-skeptic agent correctly identified this architectural mismatch between UI time representation and simulation time logic.

---

**Architecture-Skeptic Review:** See `.claude/chatroom/channels/architecture.md` for the full analysis that caught these issues.
