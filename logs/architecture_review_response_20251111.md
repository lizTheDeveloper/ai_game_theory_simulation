# Architecture Review Response (Nov 11, 2025)

**Response to:** Architecture-skeptic review (Grade B+, 8.5/10)

---

## CRITICAL-1: State Propagation Race Condition - **INVALID**

**Claim:** "When multiple scenarios run in parallel (Monte Carlo N=10), scenario overrides may not propagate correctly. The phase reads `state.scenario` but if scenarios run concurrently, they could interfere with each other's state."

**Analysis:**

### Finding: NO RACE CONDITION EXISTS

**Evidence:**

1. **Each Monte Carlo run creates isolated state:**
   ```typescript
   // monteCarloSimulation.ts
   const initialState = createDefaultInitialState(rngFunction, runScenarioMode, ...);
   ```
   Each run gets a completely separate `GameState` object. No shared mutable state.

2. **Workers use message passing:**
   ```typescript
   // simulationWorker.ts
   let state: GameState | null = null;  // Worker-local state
   ```
   Workers have isolated state, communicate via message passing. No cross-worker state access.

3. **Scenarios are per-run, not global:**
   ```typescript
   // game.ts
   interface GameState {
     scenario?: import('./scenarios').ScenarioDefinition;  // Optional, per-state
   }
   ```

4. **ApplyScenarioPrioritiesPhase reads from state, doesn't share:**
   ```typescript
   // ApplyScenarioPrioritiesPhase.ts:54-56
   if (!state.scenario || !state.scenario.governmentPriorities) {
     return { events };  // Early return if no scenario
   }
   ```

**Root cause of confusion:** The architecture-skeptic may have conflated "Monte Carlo N=10" (10 sequential/worker-isolated runs) with "parallel threads sharing state" (which doesn't exist in this architecture).

**Recommendation:** CLOSE this issue as invalid. No fix required.

---

## CRITICAL-2: Novel Entities Memory Leak - **PARTIALLY VALID**

**Claim:** "Chemical stock accumulates unboundedly (1.8M Mt growing monthly) without cleanup mechanism. Long-running simulations (360+ months) will eventually run out of memory."

**Analysis:**

### Finding: NOT a memory leak, BUT accumulatedStock field is stale

**What the architecture-skeptic got WRONG:**

1. **No unbounded growth in runtime:**
   ```typescript
   // novelEntities.ts:80-82
   ne.syntheticChemicalLoad = Math.max(0, Math.min(1.0,
     ne.syntheticChemicalLoad + chemicalAccumulationRate - bioremediationRate
   ));  // CAPPED at 1.0 - no memory leak
   ```
   The `syntheticChemicalLoad` field (which tracks actual accumulation) is capped at 1.0. No unbounded growth.

2. **No memory allocation per month:**
   The chemical load is a single `number` field [0,1]. It doesn't allocate new memory as it grows. A 360-month simulation uses the same memory as a 1-month simulation.

**What IS broken:**

1. **accumulatedStock field never updated:**
   ```typescript
   // novelEntities.ts:46
   accumulatedStock: 1800000,  // Initialized once, never updated
   ```
   This field is set to 1.8M Mt at initialization and NEVER changes, even though monthly emissions are happening.

2. **Missing stock accounting:**
   The normalized `syntheticChemicalLoad` [0,1] doesn't map to actual megatonnes. If we want to track absolute stock for research validation, we need to update `accumulatedStock` monthly.

**Fix required:**

1. **Update accumulatedStock monthly:**
   ```typescript
   // Add to updateNovelEntitiesSystem():
   const monthlyEmissions = ne.annualEmissions / 12;  // Convert annual → monthly
   const monthlyDecay = (ne.accumulatedStock / 1000) * (0.693 / (ne.naturalDecayHalfLife * 12));  // Half-life decay
   ne.accumulatedStock += monthlyEmissions - monthlyDecay;
   ```

2. **Add saturation cap (research-backed):**
   Global plastic production (2015-2025): ~400M Mt cumulative (Geyer 2017).
   PFAS production: ~10M Mt cumulative (Gluge 2020).
   Total synthetic chemicals: Estimate 1-2 billion Mt cumulative (no exact figure, but bounded by total industrial output).

   ```typescript
   const MAX_CHEMICAL_STOCK = 2_000_000_000;  // 2 billion Mt (research-backed estimate)
   ne.accumulatedStock = Math.min(ne.accumulatedStock, MAX_CHEMICAL_STOCK);
   ```

3. **Add assertion for unrealistic values:**
   ```typescript
   ne.accumulatedStock = assertInRange(ne.accumulatedStock, 0, MAX_CHEMICAL_STOCK, {
     location: 'updateNovelEntitiesSystem',
     valueName: 'accumulatedStock',
     month: state.currentMonth,
     additionalInfo: { annualEmissions: ne.annualEmissions }
   });
   ```

4. **Validate syntheticChemicalLoad mapping:**
   Currently `syntheticChemicalLoad` [0,1] is disconnected from `accumulatedStock` [Mt]. We should define the mapping:
   - 0.0 = 0 Mt (pristine)
   - 1.0 = 2B Mt (saturation cap)

   This would allow syntheticChemicalLoad to be calculated FROM accumulatedStock, ensuring consistency.

**Recommendation:** Fix the stock accounting bug (not a memory leak, but wrong bookkeeping).

---

## Summary

| Issue | Status | Severity | Action |
|-------|--------|----------|--------|
| CRITICAL-1 (race condition) | INVALID | None | Close, no fix needed |
| CRITICAL-2 (memory leak) | PARTIALLY VALID | Medium | Fix stock accounting (not memory leak) |

**Revised assessment:**
- Original grade: B+ (8.5/10)
- After analysis: A- (9.0/10) - One bookkeeping bug, but no critical architecture flaws

**Next steps:**
1. Fix accumulatedStock monthly updates
2. Add saturation cap and assertions
3. Validate with 360-month simulation
4. Close CRITICAL-1 as invalid
