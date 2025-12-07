# CRITICAL: Game UI State Integration

**Priority:** CRITICAL
**Created:** 2025-12-06
**Status:** READY FOR IMPLEMENTATION
**Owner:** BM (Background Maintainer)

## Problem

Game simulation runs successfully but UI components don't display results:

### Symptoms
- Simulation executes all 37 phases ✅
- Console shows events (227M deaths, famines, tipping points) ✅
- UI shows "Month 0" after advancing to Month 1 ❌
- Event stream shows "Awaiting simulation data..." ❌
- Resources unchanged (50/50/50/50 with 0/mo) ❌
- Trajectory percentages static ❌

### Root Cause
**Data flow broken** between simulation engine (`GameSession`) and UI components in `src/components/dashboards/game/`.

## Implementation Requirements

1. **Fix State Propagation**
   - Verify `GameSession` updates state after simulation step
   - Connect state to UI components via `GameStateProvider`
   - Ensure month counter updates
   - Ensure event log updates

2. **Resource Display**
   - Map simulation state → resource values
   - Show rate of change (per month)
   - Use meaningful units

3. **Event Stream**
   - Display recent events from simulation
   - Show crisis notifications
   - Update "Coming Next Month" section

4. **Player Feedback**
   - Show what happened during the month
   - Notify about major events (famines, tipping points, deaths)
   - Update trajectory forecasts

## Files Likely Involved

- `src/components/dashboards/game/GameDashboard.tsx`
- `src/lib/contexts/GameStateContext.tsx`
- `src/lib/game/GameSession.ts`
- `src/lib/game/InfluenceCalculator.ts`

## Success Criteria

- Month counter advances after clicking "Advance Month"
- Event stream shows simulation events
- Resources display real values from simulation state
- Player sees feedback about what happened

## Testing

Navigate to http://34.32.105.178/game-dashboard-demo, click "Advance Month", verify UI updates.

## Notes

- Simulation engine works correctly (verified via console logs)
- This is pure data integration, not simulation logic
- Game layer Phase 1 marked COMPLETE in wiki, but UI integration missing
