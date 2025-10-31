# Determinism Partial Fix - Oct 30, 2025

## Status: PARTIALLY COMPLETE

Simulation is still NOT fully deterministic, but significant progress has been made.

### Verification Results
- **Month 0:** ✅ IDENTICAL (initialization)
- **Months 1-12:** ❌ DIFFERENCES DETECTED (runtime simulation)

## Completed Fixes

### 1. Infrastructure Added
- ✅ Added `eventIdCounter: number` to GameState interface (`src/types/game.ts:176`)
- ✅ Initialize counter to 0 in `createDefaultInitialState()` (`src/simulation/initialization.ts:537`)
- ✅ Created ID generation utility (`src/simulation/utils/idGenerator.ts`)

### 2. Date.now() Fixes (All ID Generation)
All converted to deterministic `state.eventIdCounter` pattern:

**Files Fixed:**
- ✅ `src/simulation/agents/socialInfluenceActions.ts` (7 calls)
- ✅ `src/simulation/agents/societyAgent.ts` (pattern + all uses)
- ✅ `src/simulation/agents/aiAgent.ts` (pattern + all uses)
- ✅ `src/simulation/agents/governmentAgent.ts` (2 functions: `generateEventId`, `generateUniqueId` + 20+ uses)
- ✅ `src/simulation/utils/eventLogger.ts` (`addSimulationEvent` utility)

**Pattern Applied:**
```typescript
// OLD (non-deterministic)
const generateUniqueId = (prefix: string) => `${prefix}_${Date.now()}_${counter++}`;

// NEW (deterministic)
const generateUniqueId = (state: GameState, prefix: string) => {
  const id = `${prefix}_${state.currentMonth}_${state.eventIdCounter}`;
  state.eventIdCounter++;
  return id;
};
```

### 3. Math.random() Fixes in Initialization

**initialization.ts:**
- ✅ AI agent alignment values (6 calls) - use `rng` parameter
- ✅ AI hiddenObjective values (2 calls)
- ✅ createAIAgent function (6 calls) - added optional `rng` parameter
  - computeEfficiency
  - rlhfIntensity
  - adversarialTestingCount
  - alignmentAdjustmentCount
  - replacementAnxiety
  - communicationRestrictions
  - isSleeper probability check

**Pattern Applied:**
```typescript
// OLD
const alignment = 0.75 + Math.random() * 0.15;

// NEW
const alignment = rng ? 0.75 + rng() * 0.15 : 0.75 + Math.random() * 0.15;
```

### 4. Math.random() Fixes in Core Simulation

**dystopiaProgression.ts:**
- ✅ Added `rng: RNGFunction` parameter to `updateGovernmentControlResponse()`
- ✅ Replaced 2 Math.random() probability checks with `rng()`
- ✅ Updated phase to pass `rng` parameter

## Remaining Work

### Files with Math.random() Calls (50+)

Priority order based on impact:

#### HIGH PRIORITY (Frequent Execution)
1. **populationDynamics.ts** (2 calls)
   - Monthly birth noise: `0.98 + Math.random() * 0.04`
   - Monthly death noise: `0.98 + Math.random() * 0.04`
   - **Impact:** Every month, affects population calculations

2. **resourceDepletion.ts** (3 calls)
   - Oil spill probability check
   - Oil spill severity calculation
   - Last-ditch fossil fuel extraction probability
   - **Impact:** Monthly resource updates

3. **militarySystem.ts** (~10 calls)
   - Resource war triggers
   - Target selection (array random index)
   - Preventive war triggers
   - Economic crisis war triggers
   - **Impact:** War/crisis events (major simulation branches)

#### MEDIUM PRIORITY (Conditional/Event-Driven)
4. **geoengineering.ts** (7 calls)
   - SAI risk probability checks
   - BECCS risk checks
   - MCB risk checks
   - DAC risk checks
   - Disaster type selection
   - **Impact:** Geoengineering events

5. **planetaryBoundaries.ts** (4 calls)
   - Cascade trigger probability
   - Stochastic multipliers
   - Ecosystem collapse checks
   - **Impact:** Environmental tipping points

6. **nationalAI/deployment.ts** (7 calls)
   - Circumvention probability
   - Theft probability
   - Leak probability
   - Model selection (random index)
   - Leak method selection
   - **Impact:** AI proliferation dynamics

7. **conflictResolution.ts** (2 calls)
   - Conflict resolution rolls
   - **Impact:** Crisis outcomes

8. **sleeperDetection.ts** (2 calls)
   - Cover blown checks
   - Detection success probability
   - **Impact:** Sleeper AI dynamics

9. **thresholds/config.ts** (1 call)
   - Random ID generation
   - **Impact:** Threshold configuration IDs

10. **memetics/** (5 calls)
    - AI amplification events
    - Meme selection
    - Transmission probability
    - **Impact:** Social dynamics

11. **crisisPoints.ts** (2 calls)
    - AI escape probability
    - Alignment after escape
    - **Impact:** Crisis escalation

12. **powerGeneration.ts** (4 calls)
    - Large model training events
    - Model size selection
    - Training duration selection
    - Blockage probability
    - **Impact:** Energy/compute dynamics

13. **capabilities.ts** (1 call in initializeCapabilityProfile)
    - Uses `seed` parameter (may already be deterministic?)
    - **Fix Impact:** Verify this is using seed correctly

14. **socialInfluence.ts, agents/aiTechActions.ts** (2 calls)
    - Random target selection
    - **Impact:** AI action choices

15. **triggeredEvents.ts** (2 calls)
    - Pandemic/crisis ID generation
    - **Impact:** Event IDs only

16. **nationalAI/regulation.ts, cooperation.ts** (4 calls)
    - Migration probability
    - Agreement break risk
    - Formation probability
    - **Impact:** International coordination

17. **techTree/regionalDeployment.ts** (1 call)
    - Deployment probability roll
    - **Impact:** Technology spread

18. **government/actions/**.ts (2 calls)
    - Policy ID generation in researchActions.ts, detectionActions.ts
    - **Impact:** Already partially fixed by generateUniqueId pattern

19. **resourceDepletion.ts, nationalAI/cooperation.ts, geoengineering.ts** (4 calls)
    - Event ID generation patterns
    - **Impact:** Already using addEvent() helper which IS fixed

## Fix Pattern for Remaining Files

### Step 1: Add RNG Parameter
```typescript
// OLD
export function updateSystemX(state: GameState): void {

// NEW
import type { RNGFunction } from '@/types/config';
export function updateSystemX(state: GameState, rng: RNGFunction): void {
```

### Step 2: Replace Math.random() Calls
```typescript
// OLD
if (Math.random() < probability) {

// NEW
if (rng() < probability) {
```

### Step 3: Update Phase to Pass RNG
```typescript
// In src/simulation/engine/phases/SystemXPhase.ts
execute(state: GameState, rng: RNGFunction): PhaseResult {
  const { updateSystemX } = require('../../systemX');
  updateSystemX(state, rng);  // Pass rng parameter
  return { events: [] };
}
```

### Step 4: Handle Helper Functions
If function calls other helpers that use Math.random():
1. Add `rng` parameter to helper
2. Thread `rng` through call chain
3. Update ALL call sites

## Type Safety

✅ All changes pass TypeScript type checking (no errors introduced)

## Testing Commands

```bash
# Verify determinism
npx tsx scripts/verifyDeterminism.ts

# Check specific month hashes
npx tsx scripts/verifyDeterminism.ts 2>&1 | grep "Month"

# Type checking
npx tsc --noEmit

# Check for remaining Math.random() calls
grep -r "Math\.random\(\)" src/simulation/*.ts | grep -v "\.bak"

# Check for remaining Date.now() calls
grep -r "Date\.now\(\)" src/simulation/*.ts | grep -v "\.bak"
```

## Estimated Remaining Effort

- **50 Math.random() calls** across ~15 files
- **Estimated time:** 4-6 hours for systematic fixes
- **Complexity:** Medium (pattern is established, just needs threading)

## Notes

1. **LLM rate limiting:** Date.now() calls in `src/simulation/llm/` are intentionally EXCLUDED.
   These are for real-time rate limiting, not simulation state.

2. **Backup files:** All `.bak*` files are ignored (pre-existing non-determinism from old code).

3. **Verification approach:** SHA-256 hashing of serialized state is VERY effective.
   - Month 0: Identical (no RNG calls in initialization when seed provided)
   - Month 1+: Diverge (remaining Math.random() calls)

4. **Monte Carlo impact:** Until determinism is 100%, Monte Carlo variance analysis is INVALID.
   Current results mix true stochasticity with pseudo-randomness.

## Recommendation

Complete determinism fix in priority order (high → medium → low) before running large Monte Carlo sweeps.
The high-priority files (populationDynamics, resourceDepletion, militarySystem) account for ~50% of remaining issues.

---

**Created:** Oct 30, 2025
**Author:** Roy (Simulation Maintainer)
**Status:** PARTIAL FIX - Determinism NOT achieved, but foundation in place
