# Game Demo Assessment - 2025-12-03

## Executive Summary

**Current State:** Game layer architecture is solid, but UI flow is disconnected from actual gameplay mechanics.

**Gaps for Playable Demo:**
1. ❌ No scenario setup integration - UI exists but not connected to game initialization
2. ❌ No real player actions - queueDecision() is a stub, doesn't call GameSession methods
3. ❌ No simulation runner - advanceMonth() is mock, no actual game loop
4. ❌ No win/lose conditions - no end-game detection or outcome screen
5. ✅ UI components exist and look good (dashboard, events, currencies)
6. ✅ GameSession architecture is solid (advocacy, coalition, crisis response ready)

**Estimated Work:** 4-6 hours to wire everything together for minimal playable demo

---

## What Exists (✅)

### Game Layer Architecture
- **GameSession.ts** - Complete API for game management
  - `queueAdvocacyAction()`, `queueCoalitionAction()`, `queueCrisisResponse()`
  - State observation, event subscriptions, save/load
  - Influence tracking, validation

- **ScenarioSetup.tsx** - Beautiful 5-screen wizard
  - Intro, role explanation, scenario selection, belief calibration, confirmation
  - Captures player beliefs (for research comparison)
  - Returns `ScenarioConfig` with scenario + beliefs

- **GameDashboard.tsx** - Complete UI layout
  - Header, currency panel, pending decisions, world viz, event stream, action bar
  - State mappers for converting simulation state → UI display

- **GameStateProvider.tsx** - React context bridge
  - Wraps GameSession, SimulationObserver, MetricsCollector
  - Event subscriptions, metrics aggregation
  - Provides hooks for components

### Existing Scenarios
- `baseline.ts`, `optimistic.ts`, `pessimistic.ts` - Research-validated scenarios
- Each has 2+ peer-reviewed sources, parameter justification

---

## What's Missing (❌)

### 1. Scenario Setup Flow Integration

**Problem:** ScenarioSetup wizard exists but isn't used in game-dashboard-demo page.

**Current:** Page loads GameDashboard directly with mock data.

**Needed:**
- Show ScenarioSetup first (before GameDashboard)
- On setup completion → initialize GameSession with selected scenario + seed
- Transition to GameDashboard with initialized session

**Estimated:** 30 minutes (simple state machine)

---

### 2. Real Player Actions

**Problem:** `queueDecision(decisionId: string)` is a stub - doesn't map to actual GameSession methods.

**Current:**
```typescript
const queueDecision = (decisionId: string) => {
  addEvent({ text: `Decision queued: ${decisionId}`, severity: 'info' });
  // In real implementation, this would call session.queueAdvocacyAction()
};
```

**Needed:**
- Decision types: advocacy actions, coalition actions, crisis responses
- Map decision IDs to GameSession methods
- Pass real parameters (not just ID strings)
- Example advocacy actions from game layer:
  - `launch_capability_audit_campaign`
  - `establish_international_oversight`
  - `promote_defensive_alignment_research`

**Estimated:** 1-2 hours (requires decision type registry + parameter mapping)

---

### 3. Simulation Runner (Game Loop)

**Problem:** `advanceMonth()` is mock - no real simulation execution.

**Current:**
```typescript
const advanceMonth = () => {
  setCurrentMonth((prev) => prev + 1);
  addEvent({ text: 'Month advanced (demo mode)', severity: 'info' });
};
```

**Needed:**
- Actual simulation step execution
- Two options:
  1. **Lightweight:** Run simulation in Web Worker (for browser demo)
  2. **Full:** Connect to external simulation server (future)

**For minimal demo, use option 1:**
- Create `src/game/runtime/SimulationRunner.ts`
- Import simulation engine phases (from src/simulation/)
- Execute phases with player decisions queued
- Return new GameStateSnapshot
- Update GameStateProvider

**Estimated:** 2-3 hours (worker setup + phase orchestration)

---

### 4. Win/Lose Conditions

**Problem:** No end-game detection or outcome screen.

**Current:** Simulation could run to month 120 with no ending.

**Needed:**
- Detect terminal outcomes:
  - **Win:** Utopia/near-utopia classification at month 120
  - **Partial Win:** Prosperity/stable at month 120
  - **Lose:** Extinction, collapse before month 120
  - **Struggle:** Made it to month 120 but still struggling

- Show outcome screen:
  - Final classification (7-tier system)
  - Key events that shaped trajectory
  - Player influence impact
  - Research comparison (beliefs vs actual outcomes)

- Outcome classification exists in `OutcomeInterpreter.ts` (already built)

**Estimated:** 1-2 hours (detection logic + outcome screen component)

---

## Proposed Implementation Plan

### Phase 1: Wire Up Scenario Setup (30 min)
1. Add `showSetup` state to game-dashboard-demo page
2. Render ScenarioSetup when true
3. On setup completion:
   - Initialize GameSession with scenario + seed
   - Hide setup, show dashboard
   - Load mock simulation state OR run first step

### Phase 2: Connect Player Actions (1-2 hours)
1. Create decision type registry (advocacy, coalition, crisis)
2. Map UI decision IDs to GameSession methods
3. Build parameter builders for each action type
4. Wire up PendingDecisions component to show real junctures
5. Test that queueAdvocacyAction() is called correctly

### Phase 3: Simulation Runner (2-3 hours)
1. Create SimulationRunner class
2. Import PhaseOrchestrator + phases
3. Execute simulation step in response to advanceMonth()
4. Handle player decisions queue
5. Return updated GameStateSnapshot
6. Update GameStateProvider to use runner

### Phase 4: Win/Lose Detection (1-2 hours)
1. Check outcome classification each month
2. Detect terminal conditions (extinction, collapse, month 120)
3. Create OutcomeScreen component
4. Show outcome screen when terminal state reached
5. Display final stats, trajectory summary, player impact

---

## Token Budget Considerations

**Total estimated:** 4-6 hours of work

**Token-efficient approach:**
1. **Don't implement** full Web Worker initially - run simulation synchronously
2. **Don't implement** coalition/crisis actions yet - focus on advocacy only
3. **Don't implement** save/load yet - single session only
4. **Don't implement** real juncture detection - use mock pending decisions
5. **Focus:** Scenario setup → advocacy actions → simulation step → outcome detection

**Minimal viable demo:**
- Player picks scenario
- Player makes advocacy decisions (3-5 choices)
- Simulation advances (synchronous, ~37 phases per step)
- Outcome screen shows result after 12 months (not full 120)

This gets us a playable demo in ~2-3 hours instead of 6.

---

## Coordination Plan

### Specialists Needed

**UX Designer (far-future-ux-designer):**
- Wire up ScenarioSetup flow
- Create OutcomeScreen component
- Polish transition animations

**Game Designer (Need new agent or use feature-implementer):**
- Decision type registry
- Map decision IDs to GameSession methods
- Parameter builders for advocacy actions

**Frontend Developer (nextjs-component-writer or far-future-ux-designer):**
- SimulationRunner integration
- GameStateProvider updates
- Game loop coordination

---

## Next Steps

1. **Confirm scope:** Minimal demo (12 months) or full demo (120 months)?
2. **Spawn agents:** UX designer + game designer
3. **Implement phases 1-4** (or minimal viable subset)
4. **Test playthrough:** Start scenario → make decisions → reach outcome
5. **Deploy:** Working demo on /game-dashboard-demo page

---

## Files to Modify

**Minimal changes (for quick demo):**
- `/src/app/game-dashboard-demo/page.tsx` - Add scenario setup flow
- `/src/game/providers/GameStateProvider.tsx` - Connect real actions + simulation step
- `/src/components/dashboards/game/OutcomeScreen.tsx` - NEW (outcome display)
- `/src/game/runtime/SimulationRunner.ts` - NEW (lightweight runner)
- `/src/game/types/decisions.ts` - NEW (decision registry)

**Total files:** 3 modified, 3 new (~500-800 lines total)

---

## Risk Assessment

**High risk:**
- Simulation performance in browser (PhaseOrchestrator is synchronous, may block UI)
- Decision parameter complexity (advocacy actions have many parameters)

**Medium risk:**
- State synchronization (simulation state ↔ game state ↔ UI state)
- RNG determinism (must use separate RNG for game layer)

**Low risk:**
- UI components (already built, just need wiring)
- Scenario setup (complete, just needs integration)

**Mitigation:**
- Start with 12-month demo (not 120) to test performance
- Limit to 3-5 decision types initially
- Use mock data for first iteration, then real simulation

---

## Success Criteria

**Minimal playable demo means:**
1. ✅ Player can select a scenario (consensus/favorable/challenging)
2. ✅ Player can make meaningful decisions (advocacy actions)
3. ✅ Simulation advances in response to decisions
4. ✅ Player can see consequences (events, metrics changing)
5. ✅ Player reaches a win/lose outcome with explanation

**Demo-able means:**
6. ✅ Smooth transitions (setup → game → outcome)
7. ✅ Clear feedback (what did my decision do?)
8. ✅ Compelling narrative (feels like a game, not a spreadsheet)
9. ✅ Research integrity visible (citations, parameter justification)

---

## Time Estimate Summary

| Phase | Task | Time | Priority |
|-------|------|------|----------|
| 1 | Scenario setup integration | 30 min | CRITICAL |
| 2 | Decision action wiring | 1-2 hours | CRITICAL |
| 3 | Simulation runner | 2-3 hours | CRITICAL |
| 4 | Win/lose detection | 1-2 hours | HIGH |
| - | Polish & testing | 1 hour | MEDIUM |

**Total:** 5-8 hours for full demo, 2-3 hours for minimal viable demo

**Recommendation:** Target minimal viable demo first, then iterate if time permits.
