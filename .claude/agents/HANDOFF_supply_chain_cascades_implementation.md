# HANDOFF: Supply Chain Cascades - Implementation Phase

**From:** orchestrator-1
**To:** simulation-maintainer (Roy)
**Date:** 2025-12-12
**Priority:** HIGH
**Quality Gate 1:** PASSED

---

## Context

Supply chain cascade propagation identified as critical blind spot (Session 70). Current collapse scenarios 2-5x too slow due to missing cascade mechanics. Research validated by Sylvia - ready for implementation.

---

## Research Files

1. **Research:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/supply_chain_cascades_20251212.md`
2. **Critique:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/reviews/supply_chain_cascades_critique_20251212.md` (PASSED)
3. **Tasks:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/openspec/changes/supply-chain-cascades/tasks.md`

---

## Validated Parameters (Conservative Bounds)

### Infrastructure Cascade
- **Multiplier:** 5× (One Earth 2024 - 700 events analyzed)
- **Spread probability:** 74% (spread beyond initial footprint)
- **Contribution:** 64% (lower bound, not 89%)
- **Timeline:**
  - Power failure: 0-3 days
  - Water cascade: 1-7 days
  - Food disruption: 1-2 weeks
  - Healthcare crisis: 2-4 weeks

### Geographic Chokepoints
- **Transit decline:** 64% (Suez 2024)
- **Cost increase:** 158% (conservative, not 246%)
- **Capacity loss:** 9% if closed for year
- **Diversion delay:** 2-4 weeks

### JIT Manufacturing
- **Current buffer:** 1-7 days (vs historical 90 days)
- **Critical threshold:** "Several days" (not precise 72 hours)
- **Hybrid buffer:** 10-15% safety stock
- **Adoption:** 64% shifting to just-in-case

### Tier-3 Visibility
- **Tier-1 visibility:** 60%
- **Tier-3 visibility:** 2-17% (use as amplification factor 1.5-2×)
- **High-risk sectors:** 9% (automotive/aerospace/defense)

---

## Implementation Requirements

### GameState Additions

Add to `src/types/game.ts`:

```typescript
supplyChainCascades: {
  justInTimeVulnerability: {
    semiconductorBuffer: number;        // Days of inventory
    rareEarthBuffer: number;
    criticalInputsBuffer: number;
    disruptionActive: boolean;
    daysUntilCascade: number;
  };
  singlePointsOfFailure: {
    suezStatus: 'open' | 'restricted' | 'closed';
    panamaStatus: 'open' | 'restricted' | 'closed';
    malaccaStatus: 'open' | 'restricted' | 'closed';
    swiftStatus: 'operational' | 'restricted' | 'failed';
    taiwanSemiconductorCapacity: number; // 0-1
  };
  infrastructureCascades: {
    powerGridStatus: number;             // 0-1
    waterSystemStatus: number;
    foodSystemStatus: number;
    healthcareSystemStatus: number;
    cascadeActive: boolean;
    hoursInCascade: number;
  };
  financeCascades: {
    creditAvailability: number;          // 0-1
    paymentSystemStatus: number;
    cashReservesDepletion: number;
    employmentCascadeActive: boolean;
  };
};
```

### Phase Implementation

Create `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/supplyChainCascades.ts`:

**Main function:**
```typescript
export function updateSupplyChainCascades(
  state: GameState,
  rng: () => number  // CRITICAL: Required, never optional
): void
```

**Sub-functions:**
1. `updateJustInTimeBuffers(state, rng)` - Track buffer depletion, trigger production halts
2. `checkSinglePointFailures(state, rng)` - Monitor chokepoints, calculate disruptions
3. `propagateInfrastructureCascades(state, rng)` - Power → Water → Food → Healthcare
4. `propagateFinanceCascades(state, rng)` - Credit freezes, payment failures (CONSERVATIVE)
5. `applyCompoundCascadeEffects(state)` - Integration with existing crisis multipliers

### Defensive Coding Requirements

**CRITICAL - No Exceptions:**
1. ✅ RNG is REQUIRED parameter (never optional, never fallback to Math.random)
2. ✅ Use assertion utilities (`assertFinite`, `assertStateProperty`, `assertProbability`)
3. ✅ NO `?? defaultValue` in calculations (only for initialization)
4. ✅ NO `isNaN(x) ? fallback : x` patterns
5. ✅ Geometric means have MIN_FLOOR to prevent division by zero
6. ✅ No circular dependencies in single step (read → transform → write)
7. ✅ Access population from `state.humanPopulationSystem.population`
8. ✅ Access GDP via `getGDPProxy(state)` utility
9. ✅ Fail LOUDLY on invalid values (research simulation, not production app)

**Example assertion pattern:**
```typescript
import { assertFinite, assertStateProperty, assertProbability } from '@/simulation/utils/assertions';

// Validate calculation result
const cascadeRisk = assertFinite(baseRisk * 5.0, {
  location: 'propagateInfrastructureCascades',
  valueName: 'cascadeRisk',
  month: state.currentMonth,
  additionalInfo: { baseRisk, multiplier: 5.0 }
});

// Replace defensive fallback with explicit assertion
const powerStatus = assertStateProperty(state.supplyChainCascades.infrastructureCascades, 'powerGridStatus', {
  location: 'propagateInfrastructureCascades',
  month: state.currentMonth
});

// Validate probability range [0, 1]
const spreadProb = assertProbability(0.74, {
  location: 'propagateInfrastructureCascades',
  valueName: 'cascadeSpreadProbability',
  month: state.currentMonth
});
```

### Pictographic Event Language (Emoji Conventions)

**MUST use canonical emojis from `docs/EMOJI_EVENT_MAP.txt`:**
- `📦` - JIT buffer events (depletion, exhaustion)
- `🚨` - Critical chokepoint failures
- `🌍💥` - Infrastructure cascade events (domain + event type)
- `💰` - Financial cascade events
- `⚠️` - Warnings (buffer low, approaching threshold)
- `❌` - Errors (validation failures, assertion failures)
- `✅` - Success (cascade interrupted, recovery)

**Combining pattern:** `[DOMAIN][EVENT_TYPE] [MESSAGE]` (max 2 emojis)

**Example logging:**
```typescript
console.log(`📦⚠️ BUFFER LOW: Semiconductor buffer at ${buffer} days (threshold: ${threshold})`);
console.log(`🚨 CHOKEPOINT CLOSURE: Suez Canal restricted, ${transitDecline}% transit decline`);
console.log(`🌍💥 CASCADE: Power failure → water treatment disruption (${hoursInCascade} hours)`);
console.log(`💰 CREDIT FREEZE: JIT manufacturing halted due to payment system failure`);
```

---

## Implementation Priorities

### ✅ IMPLEMENT STRONGLY (High Confidence)

1. **Infrastructure Interdependence Cascade**
   - 5× multiplier (One Earth 2024)
   - 74% spread probability
   - Power → Water → Food → Healthcare sequence
   - Timeline: Days (infrastructure) → Weeks (society)

2. **Geographic Chokepoint Vulnerabilities**
   - Suez, Panama, Malacca, Hormuz, Taiwan Strait
   - 64% transit decline, 158% cost increase
   - 9% capacity loss if closed for year

3. **JIT Buffer Exhaustion**
   - Current: 1-7 days (vs historical 90 days)
   - Critical threshold: Several days
   - Phase transition: Below threshold → uncontrolled propagation

### ⚠️ IMPLEMENT CONSERVATIVELY (Medium Confidence)

1. **Finance Cascades**
   - Credit freeze → JIT impacts (logical but less quantified)
   - Use CONSERVATIVE parameters
   - Validate with experts if possible

2. **Tier-3 Supplier Invisibility**
   - Model as amplification factor (1.5-2×), NOT primary driver
   - 2-17% visibility documented but mechanism less clear

3. **Compound Cascade Effects**
   - Single cascade: 5× (documented)
   - Multi-cascade: Use ADDITIVE compounding initially (not multiplicative)
   - Validate via Monte Carlo

---

## Integration Points

### With Existing Systems

1. **Crisis Cascade Multipliers (1.5-2.5×)**
   - Clean integration: Supply chain cascades ADD to crisis multipliers
   - Don't double-count (ensure separate triggering conditions)

2. **Environmental Systems**
   - Infrastructure failures amplify climate impacts
   - Climate events can trigger infrastructure cascades

3. **Economic Systems**
   - GDP impacts from chokepoint disruptions
   - Unemployment cascades from JIT failures

4. **Social Systems**
   - QoL degradation from infrastructure cascades
   - Mortality from healthcare disruptions (Texas freeze: 246-702 deaths)

### Phase Registration

Register in `src/simulation/engine/PhaseOrchestrator.ts`:
- **After:** Crisis management phases (to capture triggering events)
- **Before:** Economic impact calculations (cascades affect economy)

Ensure no circular dependencies:
- **Read:** Crisis events, infrastructure status, chokepoint traffic
- **Write:** Cascade state, buffer levels, disruption flags
- **Don't:** Read from fields you just wrote in same step

---

## Testing Requirements

### Unit Tests

Create test files:
1. `src/simulation/supplyChainCascades.test.ts` (main function)
2. `src/simulation/__tests__/justInTimeBuffers.test.ts`
3. `src/simulation/__tests__/singlePointFailures.test.ts`
4. `src/simulation/__tests__/infrastructureCascades.test.ts`
5. `src/simulation/__tests__/financeCascades.test.ts`

**Test coverage:**
- ✅ RNG required (throws if undefined)
- ✅ Assertions fail loudly on NaN/Infinity
- ✅ Buffer exhaustion triggers production halts
- ✅ Infrastructure cascade follows sequential dependencies
- ✅ Chokepoint closures calculate correct disruptions
- ✅ Compound cascades use additive (not multiplicative) initially

### Integration Tests

1. **Texas Freeze Baseline:**
   - 3-day power failure → 12M water disruption → $195B damages
   - Simulation should match empirical outcomes

2. **Suez Disruption Baseline:**
   - 64% transit decline → 158-246% cost increase
   - Simulation should match empirical outcomes

3. **Sequential Restoration:**
   - Can't restore food before power
   - Can't restore healthcare before water
   - Validate dependency enforcement

### Edge Cases

1. Zero buffers (all exhausted simultaneously)
2. All SPOFs failed (multiple chokepoints closed)
3. Cascade interruption (emergency response)
4. Recovery after cascade (restoration timeline)

---

## Validation Criteria (Monte Carlo - Priya's Phase)

After implementation, Priya will validate:

1. **Determinism:** CV < 0.01% for identical seeds
2. **Effectiveness:** (initial - final) / initial for cascade impacts
3. **Distributions:** Match empirical baselines (Texas, Suez)
4. **Timescale Separation:** Fast cascades (days-weeks) distinct from climate tipping (decades-centuries)
5. **No Disaster Porn:** Not all scenarios collapse, realistic range

---

## Conservative Implementation Notes

**From Sylvia's critique:**

1. **Use lower bounds:**
   - Cascade contribution: 64% (not 89%)
   - Cost increase: 158% (not 246%)

2. **Avoid unverified claims:**
   - Don't hardcode "38,000 tier-3 suppliers"
   - Don't hardcode "72-hour critical buffer"
   - Use ranges and variables

3. **Finance cascades:**
   - Less empirical support
   - Implement conservatively
   - Don't dominate infrastructure cascades

4. **Policy response:**
   - Model just-in-case shift (64% adopting 10-15% buffers)
   - Cascades can trigger mitigation efforts
   - Not purely deterministic doom

---

## Deliverables

1. ✅ `src/types/game.ts` - Add `supplyChainCascades` to GameState
2. ✅ `src/simulation/supplyChainCascades.ts` - Main implementation
3. ✅ Unit tests (`*.test.ts`)
4. ✅ Integration tests
5. ✅ Phase registration in PhaseOrchestrator
6. ✅ All tests passing
7. ✅ No TypeScript errors
8. ✅ Emoji registration in `docs/EMOJI_EVENT_MAP.txt` (if new emojis needed)

---

## Next Steps After Implementation

1. **Roy completes implementation** → Update orchestrator
2. **Orchestrator spawns Priya** for Monte Carlo validation
3. **Priya validates determinism** (CV < 0.01%)
4. **Priya validates effectiveness** and distributions
5. **Quality Gate 2:** Architecture skeptic review
6. **Documentation:** Historian updates wiki
7. **Archival:** Architect merges OpenSpec delta

---

## Questions or Blockers?

Post to Matrix `implementation` channel or create HANDOFF document back to orchestrator.

**Roy's identity:** The cynical realist. Defensive coding zealot. Fail-loudly philosopher. If it can break, make it scream. Research tool, not disaster porn.

---

**Orchestrator sign-off:** Research validated, parameters conservative, ready for implementation with defensive coding standards.
