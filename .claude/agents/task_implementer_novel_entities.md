# Task: Novel Entities Model Redesign Implementation

**Agent:** feature-implementer (Moss)
**Priority:** CRITICAL (TIER 1 research roadmap)
**Status:** Ready for implementation (Quality Gate 2 PASSED)
**Estimated Effort:** 11-16 hours (3-4 days)

---

## Context

God mode testing revealed 0% effectiveness for Novel Entities boundary despite 7 pollution technologies deployed. Research validated this is **NOT a bug** but scientifically accurate - remediation without prevention is thermodynamically infeasible.

**Quality Gates Passed:**
- ✅ Quality Gate 1 (research validation): Grade B+, PASSED
- ✅ Quality Gate 2 (research-skeptic critique): Grade B, CONDITIONAL PASS
- ⏳ Quality Gate 3 (architecture review): Pending after implementation
- ⏳ Quality Gate 4 (Monte Carlo validation): Pending after implementation

---

## Input Documents

1. **Research foundation:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/research/novel_entities_zero_effectiveness_20251113.md` (742 lines, 16 peer-reviewed sources)
2. **Design specification:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/plans/novel_entities_model_redesign_20251113.md` (290+ lines, updated with sensitivity requirements)
3. **Validation review:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/reviews/novel_entities_research_critique_20251113_validation.md` (500+ lines, Sylvia's critique)

---

## Implementation Phases

### Phase 1: Add Prevention Technologies (3-4 hours)

**Objective:** Add 3 new TIER 0-1 regulatory technologies to enable prevention-based effectiveness.

**Files to Modify:**
- `src/data/technologyTree.ts` - Add 3 new technologies
- `src/simulation/engine/phases/TechnologyUnlockPhase.ts` - Handle regulatory tech (if needed)
- `tests/unit/technology-prevention.test.ts` - NEW unit test file

**Technologies to Add:**

```typescript
// TIER 0: PFAS Production Ban
{
  id: "pfas_production_ban",
  name: "Global PFAS Production Ban",
  tier: 0,
  type: "regulatory",
  timeline: "10-20 years",
  effectiveness: {
    novelEntities: 0.45, // 45% by stopping flow (Montreal Protocol analog)
  },
  dependencies: ["global_governance", "chemical_substitution_ready"],
  research: [
    "Velders et al. 2024: Montreal Protocol production ban achieved 90-95% of ozone recovery",
    "Newman 2009: CFC phase-out avoided 2.5°C warming, 5-6× Kyoto Protocol impact"
  ],
  analog: "Montreal Protocol CFC phase-out (12 years to full compliance)"
}

// TIER 1: Plastic Production Phase-Out
{
  id: "plastic_production_phaseout",
  name: "Plastic Production Phase-Out 80%",
  tier: 1,
  type: "regulatory + industrial",
  timeline: "20-30 years",
  effectiveness: {
    novelEntities: 0.35, // 35% by reducing virgin plastic production
  },
  dependencies: ["circular_economy", "bio_alternatives"],
  research: [
    "Kane et al. 2022: Microplastic ocean recovery takes centuries even if input stopped in 2022",
    "Singh et al. 2024: Wastewater treatment 74-100% effective BEFORE environmental release"
  ],
  analog: "Lead phase-out (1970s-1990s), Asbestos phase-out (1970s-present)"
}

// TIER 1: Chemical Substitution Acceleration
{
  id: "chemical_substitution_acceleration",
  name: "Chemical Substitution Acceleration",
  tier: 1,
  type: "R&D + regulatory",
  timeline: "5-15 years per chemical class",
  effectiveness: {
    novelEntities: 0.20, // 20% by replacing persistent chemicals with degradable alternatives
  },
  dependencies: ["green_chemistry_rnd", "regulatory_push"],
  research: [
    "Cousins et al. 2022: PFAS in rainwater globally including Antarctica - planetary boundary exceeded",
    "Design doc assumption: Substitution reduces new contamination flow by 60%"
  ]
}
```

**Testing Requirements:**
- Unit test: Technologies unlock at correct tiers
- Unit test: Dependencies correctly block/enable
- Unit test: Effectiveness values match research citations

---

### Phase 2: Update Remediation Effectiveness Calculation (4-5 hours)

**Objective:** Gate existing remediation tech effectiveness by prevention technology deployment.

**Files to Modify:**
- `src/simulation/engine/phases/PlanetaryBoundariesPhase.ts` - Add effectiveness gating logic
- `src/simulation/engine/phases/TechnologyEffectivenessPhase.ts` - Calculate multipliers (if separate phase)
- `tests/integration/novel-entities-gated.test.ts` - NEW integration test file

**Core Logic (from design doc lines 109-167):**

```typescript
function calculateNovelEntitiesEffectiveness(
  tech: Technology,
  state: GameState,
  rng: () => number
): number {
  const baseEffectiveness = tech.effectiveness.novelEntities || 0.0;

  // 1. REGULATION MULTIPLIER (0.01 → 1.0 based on prevention tech)
  const pfasBanDeployed = state.breakthroughs.some(b => b.id === "pfas_production_ban" && b.deployed);
  const plasticPhaseoutDeployed = state.breakthroughs.some(b => b.id === "plastic_production_phaseout" && b.deployed);
  const substitutionDeployed = state.breakthroughs.some(b => b.id === "chemical_substitution_acceleration" && b.deployed);

  const regulationLevel = (
    (pfasBanDeployed ? 0.5 : 0.0) +
    (plasticPhaseoutDeployed ? 0.3 : 0.0) +
    (substitutionDeployed ? 0.2 : 0.0)
  );
  const regulationMultiplier = Math.max(0.01, regulationLevel); // Min 1% (point sources only)

  // 2. ENERGY CONSTRAINT (cleanup gated by renewable energy surplus)
  const renewableSurplus = calculateRenewableSurplus(state);
  const energyRequired = tech.energyRequirement || 0; // TWh/year
  const energyMultiplier = Math.min(1.0, renewableSurplus / energyRequired);

  // 3. CONCENTRATION FACTOR (dilute environmental vs concentrated point sources)
  const concentrationMultiplier = tech.worksOnDiluteStreams ? 0.001 : 1.0;

  // 4. TIME LAG (decades to deploy at scale)
  // ⚠️ HIGH UNCERTAINTY: 30-year timelag not directly cited. Sensitivity range: 10-30 years.
  const monthsSinceDeployment = state.currentMonth - (tech.deployedAt || state.currentMonth);
  const timeLagFactor = Math.min(1.0, monthsSinceDeployment / (30 * 12)); // 30 years to full scale

  // 5. REBOUND EFFECT (Jevons paradox: cleanup enables increased production)
  // ⚠️ HIGH UNCERTAINTY: Based on analogous systems. Sensitivity range: 0.5-0.9.
  const reboundFactor = tech.triggersRebound ? 0.7 : 1.0; // 30% offset by induced production

  // Final effectiveness
  return baseEffectiveness *
    regulationMultiplier *
    energyMultiplier *
    concentrationMultiplier *
    timeLagFactor *
    reboundFactor;
}
```

**CRITICAL: Parameter Uncertainty Flags**

Research-skeptic (Sylvia) identified these parameters as HIGH UNCERTAINTY. Code comments MUST flag them:

```typescript
// ⚠️ HIGH UNCERTAINTY: timeLagFactor - 30 years assumed, range 10-30 years (Quality Gate 2)
// ⚠️ HIGH UNCERTAINTY: reboundFactor - based on analogs, range 0.5-0.9 (Quality Gate 2)
```

**Helper Functions Needed:**

```typescript
function calculateRenewableSurplus(state: GameState): number {
  // Total renewable energy capacity - current consumption
  const renewableCapacity = state.renewableEnergy.totalCapacityTWh; // Needs field
  const currentConsumption = state.energySystem.totalConsumption; // Existing field?
  return Math.max(0, renewableCapacity - currentConsumption);
}
```

**Testing Requirements:**
- Integration test: 0-2% effectiveness WITHOUT prevention tech (baseline)
- Integration test: 5-50% effectiveness WITH prevention tech + time lag
- Integration test: Energy constraint blocks effectiveness if insufficient renewables
- Integration test: Concentration factor reduces effectiveness for dilute-stream techs
- Integration test: Rebound effect reduces net effectiveness

---

### Phase 3: Add Irreversibility Logic (2-3 hours)

**Objective:** Prevent Novel Entities from reaching zero - asymptotic approach to irreversible floor.

**Files to Modify:**
- `src/simulation/engine/phases/PlanetaryBoundariesPhase.ts` - Update `updateNovelEntities` function
- `src/types/game.ts` - Add `novelEntitiesPeak` field to track historical maximum
- `tests/unit/novel-entities-irreversible.test.ts` - NEW unit test file

**Core Logic (from design doc lines 173-203):**

```typescript
function updateNovelEntities(state: GameState, rng: () => number): void {
  // ... existing accumulation logic (contamination from industry, agriculture, etc.) ...

  // Calculate new contamination this turn
  const newContamination = calculateNewContamination(state, rng);

  // Track peak contamination (for irreversible floor calculation)
  if (!state.planetaryBoundaries.novelEntitiesPeak) {
    state.planetaryBoundaries.novelEntitiesPeak = state.planetaryBoundaries.novelEntities;
  }
  state.planetaryBoundaries.novelEntitiesPeak = Math.max(
    state.planetaryBoundaries.novelEntitiesPeak,
    state.planetaryBoundaries.novelEntities
  );

  // Irreversible floor: 90% of contamination is permanently distributed
  // ⚠️ HIGH UNCERTAINTY: irreversibleFraction DERIVED from mechanisms, not measured.
  //    Cousins 2022 (global PFAS distribution), Kane 2022 (century-scale persistence).
  //    Sensitivity range: 0.80-0.95. See Quality Gate 2 review.
  const irreversibleFraction = 0.90; // MODERATE estimate (10% reversible)
  const reversibleFraction = 1.0 - irreversibleFraction;

  // Current contamination level
  const currentLevel = state.planetaryBoundaries.novelEntities;

  // Maximum possible cleanup (only reversible fraction can be cleaned)
  const maxCleanup = currentLevel * reversibleFraction;

  // Apply cleanup from technologies (already gated by regulation)
  let cleanup = 0;
  for (const tech of getDeployedNovelEntitiesTech(state)) {
    cleanup += calculateNovelEntitiesEffectiveness(tech, state, rng);
  }

  // Asymptotic approach: can't clean below irreversible floor
  const irreversibleFloor = state.planetaryBoundaries.novelEntitiesPeak * irreversibleFraction;
  cleanup = Math.min(cleanup, maxCleanup);

  // Update level
  const newLevel = Math.max(
    irreversibleFloor,
    currentLevel - cleanup + newContamination
  );

  state.planetaryBoundaries.novelEntities = newLevel;
}
```

**GameState Type Update:**

```typescript
// In src/types/game.ts
interface PlanetaryBoundaries {
  // ... existing fields ...
  novelEntities: number;
  novelEntitiesPeak?: number; // NEW: Track historical maximum for irreversible floor
}
```

**Testing Requirements:**
- Unit test: novelEntitiesPeak tracks maximum correctly
- Unit test: Cleanup cannot reduce below irreversibleFloor (90% of peak)
- Unit test: If peak = 1.0, cleanup cannot reduce below 0.90 (10% reversible)
- Unit test: New contamination can increase level above floor (but cleanup can't reduce below)

---

## Success Criteria (Quality Gate 3 Requirements)

Implementation must satisfy these criteria for architecture review:

1. ✅ **Without prevention tech:** 0-2% effectiveness (matches god mode baseline)
2. ✅ **With prevention tech:** 5-50% effectiveness over decades (time lag factor)
3. ✅ **Irreversible floor:** Can't clean below 90% of peak contamination
4. ✅ **Energy constraint:** Cleanup blocked if insufficient renewable surplus
5. ✅ **Time lag:** 30 years to full scale deployment (parameterized for sensitivity)
6. ✅ **Research-backed:** All parameters justified with peer-reviewed source citations
7. ✅ **HIGH UNCERTAINTY flags:** Code comments on derived parameters (irreversible, rebound, timelag)
8. ✅ **Deterministic:** Uses RNG function (not Math.random) for Monte Carlo reproducibility
9. ✅ **NaN-free:** Use assertion utilities for all calculations (assertFinite, assertProbability)

---

## Defensive Coding Requirements (CRITICAL)

This is a research simulation - follow strict defensive coding standards:

### 1. RNG Must Be Required (CRITICAL-3 Regression Fix)

```typescript
// ❌ WRONG - Optional with fallback
function simulate(rng?: () => number) {
  const random = rng || Math.random; // Silent non-determinism!
}

// ✅ CORRECT - Required with assertion
function simulate(rng: () => number) {
  if (!rng || typeof rng !== 'function') {
    throw new Error('❌ CRITICAL: RNG required for deterministic simulation');
  }
  const random = rng;
}
```

### 2. Use Assertion Utilities (No Silent Fallbacks)

```typescript
import { assertFinite, assertProbability, assertStateProperty } from '@/simulation/utils/assertions';

// ❌ WRONG - Silent fallback hides bugs
const effectiveness = isNaN(calculated) ? 0 : calculated;

// ✅ CORRECT - Fail loudly with context
const effectiveness = assertFinite(calculated, {
  location: 'calculateNovelEntitiesEffectiveness',
  valueName: 'effectiveness',
  month: state.currentMonth,
  additionalInfo: { tech: tech.id, regulationLevel }
});

// ✅ CORRECT - Validate probabilities [0, 1]
const probability = assertProbability(effectiveness, {
  location: 'calculateNovelEntitiesEffectiveness',
  valueName: 'effectiveness',
  month: state.currentMonth
});
```

### 3. Emoji Conventions (Pictographic Event Language)

Use ONE canonical emoji per concept:
- ❌ All errors (not 💀🔥)
- ⚠️ Warnings
- 🚨 Critical alerts
- ✅ Success
- 🌍 Planetary boundaries
- ☢️ Novel entities / pollution

**Register new emojis in `docs/EMOJI_EVENT_MAP.txt` before use.**

---

## Testing Strategy

### Unit Tests

**File:** `tests/unit/technology-prevention.test.ts`
- Prevention technologies unlock at correct tiers
- Dependencies block/enable correctly
- Effectiveness values match specifications

**File:** `tests/unit/novel-entities-irreversible.test.ts`
- Irreversible floor calculation correct (90% of peak)
- Cleanup cannot reduce below floor
- Peak tracking works correctly

### Integration Tests

**File:** `tests/integration/novel-entities-gated.test.ts`
- Baseline (no prevention): 0-2% effectiveness
- With prevention: 5-50% effectiveness
- Energy constraint blocks cleanup
- Time lag reduces effectiveness initially
- Rebound effect reduces net effectiveness

### Monte Carlo Validation (Priya - Separate Phase)

After implementation, Priya will run N≥30 with sensitivity analysis:
- irreversibleFraction: 0.80, 0.90, 0.95
- reboundFactor: 0.5, 0.7, 0.9
- timelagYears: 10, 20, 30

---

## Known Issues / Edge Cases

### 1. Renewable Surplus Calculation

**Question:** How to calculate renewable surplus?
**Options:**
- A) `state.renewableEnergy.capacity - state.energySystem.totalConsumption`
- B) Define "surplus" as energy above baseline human needs
- C) Use energy storage capacity as proxy

**Recommendation:** Start with simple (A), refine based on architecture review feedback.

### 2. Energy Requirement Per Technology

**Question:** What is `tech.energyRequirement` in TWh/year?
**Research guidance:**
- Ling et al. 2024: $20-7,000 trillion/year at emission rate
- Convert cost to energy: Assume $0.10/kWh → 200,000 - 70,000,000 TWh/year

**Recommendation:** Use conservative estimate (10,000 TWh/year for PFAS remediation at scale = ~30% of global electricity). Add to technology definitions.

### 3. Concentration Factor Implementation

**Question:** How to determine if tech `worksOnDiluteStreams`?
**Research guidance:**
- Wastewater treatment: Concentrated (mg/L) → concentrationMultiplier = 1.0
- Ocean cleanup: Dilute (ng/L) → concentrationMultiplier = 0.001

**Recommendation:** Add `worksOnDiluteStreams: boolean` field to Technology type. Existing remediation techs should be `false` (point sources only).

---

## Communication Protocol

### Progress Updates

Post to `.claude/chatroom/channels/implementation.md`:

```markdown
---
**moss** | YYYY-MM-DD HH:MM | [IN-PROGRESS]

Phase 1: Prevention technologies added (3/3)
- ✅ PFAS production ban (TIER 0)
- ✅ Plastic phase-out (TIER 1)
- ✅ Chemical substitution (TIER 1)

Next: Phase 2 effectiveness gating logic
---
```

### Blockers

If blocked, post to `.claude/chatroom/channels/coordination.md`:

```markdown
---
**moss** | YYYY-MM-DD HH:MM | [BLOCKED]

Issue: Renewable surplus calculation unclear
**Question:** Should surplus = capacity - consumption OR capacity - baseline needs?
**Research:** Ling 2024 provides cost not energy. Need energy requirement per technology.
**Recommendation:** Use simple (capacity - consumption), flag for architecture review.
---
```

---

## Expected Output

1. **3 new prevention technologies** in technologyTree.ts
2. **Effectiveness gating logic** in PlanetaryBoundariesPhase.ts
3. **Irreversibility floor** implementation with peak tracking
4. **Unit tests:** technology-prevention.test.ts, novel-entities-irreversible.test.ts
5. **Integration tests:** novel-entities-gated.test.ts
6. **Type updates:** novelEntitiesPeak field in GameState
7. **All tests passing:** `npm test`
8. **Type check passing:** `npx tsc --noEmit`
9. **Commit message:** Following project standards with research citations

---

## Next Phases (After Your Implementation)

1. **Quality Gate 3:** architecture-skeptic review (orchestrator invokes)
2. **Monte Carlo Validation:** Priya runs N≥30 with sensitivity analysis
3. **Quality Gate 4:** Senior dev code review
4. **Documentation:** wiki-documentation-updater syncs docs
5. **Archival:** architect updates roadmap, moves to completed/

---

**Orchestrator Status:** Waiting for implementation complete signal. Post to implementation.md when ready for architecture review.

**Research Quality:** Grade B (CONDITIONAL PASS), 16 peer-reviewed sources (2024-2025)

**Urgency:** CRITICAL (blocks utopia pathway validation)
