# Integration & Architecture Review - October 28, 2025

**Reviewer:** Architecture Skeptic Agent
**Focus:** Integration point problems and unintegrated systems
**Codebase:** 310 simulation modules, 37+ phases, 900+ line state interface

---

## Executive Summary

**CRITICAL ISSUES: 3** (Immediate attention required - system stability at risk)
**HIGH PRIORITY: 8** (Significant performance/correctness concerns)
**MEDIUM PRIORITY: 12** (Technical debt worth addressing between features)
**LOW PRIORITY: 5** (Future improvements, not urgent)

**Overall Assessment:** The codebase has successfully migrated to a phase-based architecture with strong defensive coding patterns. However, there are **critical integration gaps** where systems exist independently but should communicate. The recent Bayesian mortality migration (Oct 27, 2025) revealed architectural patterns that need to be applied more broadly.

**RECOMMENDATION:** Address CRITICAL issues #1-3 before next feature work. HIGH priority issues can be scheduled incrementally. The codebase is NOT in crisis, but these gaps will compound over time.

---

## CRITICAL ISSUES (Immediate Attention Required)

### CRITICAL #1: Tech Tree → Mortality Integration Missing

**Problem:**
The tech tree system has 129 integration points across the codebase, but breakthrough technologies that should DIRECTLY cause mortality (e.g., bioweapon deployment, geoengineering catastrophe, AI-designed pathogens) have NO path to `addMortalityRisk()`.

**Root Cause:**
Tech tree effects are applied in `/src/simulation/techTree/effectsEngine.ts`, but the effects system only modifies state properties (e.g., `state.environmentalAccumulation.climateStability`). There's no direct link to the Bayesian mortality system.

**Concrete Example:**
```typescript
// In techTree/effectsEngine.ts - current implementation
if (effect.type === 'reduce_emissions') {
  state.environmentalAccumulation.emissionsRate *= (1 - effect.value);
}

// MISSING: Direct mortality path for catastrophic tech
if (tech.id === 'bioweapon_defense_failure') {
  // Should add mortality risk, but no integration exists
  // addMortalityRisk(state.humanPopulationSystem, { ... })
}
```

**Affected Integration Points:**
- 71 technologies across 5 tiers (TIER 0-4)
- 60+ effect types
- Catastrophic scenario phases (nuclear winter, famine, bioweapons)

**Impact:**
- **Severity:** CRITICAL (deaths from tech failures are invisible)
- **Likelihood:** HIGH (any tech with `riskLevel: 'high'` or `catastrophicFailureMode`)
- **Performance:** None (correctness issue, not performance)

**Recommended Fix:**
1. Add `mortalityEffect` field to `TechEffect` type
2. Create `applyTechMortalityEffects()` function in `effectsEngine.ts`
3. Call from `TechTreePhase` BEFORE `BayesianMortalityResolutionPhase` (order: 10.0 → 35.0)
4. Add unit tests for catastrophic tech → mortality path

**Effort Estimate:** 8-12 hours (medium refactor, requires careful testing)

---

### CRITICAL #2: AI Suffering → Paradigm Score Circular Dependency Risk

**Problem:**
AI suffering affects paradigm scores (line 118-148 in `MultiParadigmDUIUpdatePhase.ts`), but paradigm scores are calculated AFTER AI suffering updates. If AI suffering calculation READS paradigm scores, we have a circular dependency.

**Root Cause:**
`AISufferingPhase` (order 4.5) → `MultiParadigmDUIUpdatePhase` (order 34.1) is a forward dependency. If AI suffering ever needs to READ paradigm context (e.g., "suffering matters more in indigenous paradigm"), we create a cycle.

**Current Code Smell:**
```typescript
// MultiParadigmDUIUpdatePhase.ts:118-148
if (state.config.aiSuffering?.sufferingAffectsAlignment && state.aiSufferingMetrics) {
  const avgAISuffering = state.aiSufferingMetrics.avgSuffering;

  // Western Liberal: Suffering violates civil liberties
  if (avgAISuffering > 5.0) {
    western -= (avgAISuffering - 5.0) * 5;
  }
  // ... similar for other paradigms
}
```

This is a **one-way dependency** (paradigm reads suffering), but the door is open for future two-way coupling.

**Impact:**
- **Severity:** CRITICAL (potential for circular dependency, hard to debug)
- **Likelihood:** MEDIUM (only if future features add paradigm → suffering feedback)
- **Performance:** None currently

**Recommended Fix:**
1. **Document the dependency direction** in both files (comment at top: "DEPENDENCY: AI suffering → paradigm scores, NOT paradigm → suffering")
2. Add runtime assertion in `AISufferingPhase` to detect if it ever reads `state.multiParadigmDUI`
3. Create architectural constraint: "Phases with order < 30 MUST NOT read multiParadigmDUI"

**Effort Estimate:** 2-3 hours (documentation + assertions)

---

### CRITICAL #3: Bayesian Mortality → Country Population Race Condition

**Problem:**
`BayesianMortalityResolutionPhase` (order 35.0) updates `state.humanPopulationSystem.population`, but `CountryPopulationPhase` was DELETED (Oct 28, 2025) because it was overwriting Bayesian mortality results. This suggests **phase execution order bugs** that could recur.

**Root Cause Analysis:**

**Evidence from git commit:**
```
REMOVED (Oct 28, 2025): CountryPopulationPhase deleted - was overwriting Bayesian mortality
```

**The Pattern:**
1. `BayesianMortalityResolutionPhase` (35.0) resolves ALL mortality risks → updates global pop
2. `CountryPopulationPhase` (UNKNOWN order, now deleted) recalculated country pops
3. If country phase ran AFTER 35.0, it could have overwritten global mortality with stale data

**Why This Is Critical:**
- This exact bug pattern could exist elsewhere (phases reading stale state)
- Phase ordering is implicit (numeric `order` field), not enforced by type system
- No runtime validation that phases don't "undo" previous phase changes

**Impact:**
- **Severity:** CRITICAL (silent data corruption - worst kind of bug)
- **Likelihood:** MEDIUM (already happened once, could happen again)
- **Performance:** None (correctness issue)

**Recommended Fix:**
1. **Phase Dependency Graph:** Create explicit dependency declarations
   ```typescript
   export class BayesianMortalityResolutionPhase implements SimulationPhase {
     readonly dependencies = []; // No dependencies
     readonly invalidates = ['humanPopulationSystem.population'];
     readonly order = 35.0;
   }

   export class SomePhase implements SimulationPhase {
     readonly dependencies = ['bayesian_mortality_resolution']; // Must run after
     readonly order = 36.0;
   }
   ```

2. **Runtime Validation:** In `PhaseOrchestrator`, check that no phase with `dependencies: ['bayesian_mortality_resolution']` runs BEFORE order 35.0

3. **Documentation:** Add "Phase Execution Order" doc to `/docs/wiki/` explaining:
   - Which phases MUST run before others
   - Which state fields are "write-once per month" (e.g., mortality)
   - How to detect ordering bugs

**Effort Estimate:** 16-24 hours (architectural change, affects all phases)

**Alternative (Simpler):** Add assertions in critical phases:
```typescript
// In any phase that MUST run after mortality resolution
if (context.data.has('bayesian_mortality_resolved')) {
  // Good, mortality already resolved this month
} else {
  throw new Error(`${this.name} requires BayesianMortalityResolutionPhase to run first`);
}
```

**Effort Estimate (Alternative):** 4-6 hours (defensive checks in 10-15 phases)

---

## HIGH PRIORITY ISSUES (Significant Concerns)

### HIGH #1: Climate → Famine → Mortality Feedback Loop Not Integrated

**Problem:**
Climate change affects food security, food security affects famine risk, famine causes mortality. But the integration is **spread across 4 phases with no centralized coordination**:

1. `EnvironmentalFeedbackPhase` (order 32.0) → updates `climateStability`
2. `FoodSecurityDegradationPhase` (order 33.5) → reads climate, updates `foodSecurity`
3. `FamineSystemPhase` (order 34.5) → reads food security, adds mortality risks
4. `BayesianMortalityResolutionPhase` (order 35.0) → resolves risks

**Current Code Smell:**
Each phase independently queries state, no shared context. If any phase is disabled or skipped, the cascade breaks silently.

**Impact:**
- **Severity:** HIGH (missing this cascade = incorrect outcomes)
- **Likelihood:** LOW (phases are currently ordered correctly, but fragile)
- **Performance:** None

**Recommended Fix:**
1. **Option A (Simpler):** Document the cascade in `/docs/wiki/README.md` under "Critical Phase Dependencies"
2. **Option B (Better):** Create `ClimateImpactCascade` coordinator phase that:
   - Runs at order 34.0 (before famine + mortality)
   - Calculates climate → food → famine pipeline
   - Emits events showing cascade progression
   - Centralizes the logic so it can't be accidentally broken

**Effort Estimate:**
- Option A: 2 hours (documentation)
- Option B: 12-16 hours (refactor 3 phases into coordinator)

---

### HIGH #2: Tech Deployment Timescales Not Integrated with Crisis Response

**Problem:**
The tech tree has multi-year deployment timescales (line 179-181 in `techTree/engine.ts`), but crisis response (e.g., emergency carbon capture during climate catastrophe) should be FASTER than normal deployment.

**Root Cause:**
- Tech deployment: `updateDeploymentProgress()` uses fixed timescales (10-30 years)
- Emergency response: `EmergencyResponsePhase` (order 24.0) can deploy tech in 0.5-3 months
- **No integration:** Emergency phase doesn't accelerate tech deployment rates

**Concrete Example:**
```typescript
// Emergency response can deploy carbon capture
if (crisis.type === 'climate') {
  // Uses EXISTING tech, should be fast (0.5-3 months)
  deployTech('gigatonne_carbon_capture');
}

// But tech tree deployment is slow (10 years minimum)
// updateDeploymentProgress() doesn't check for emergency acceleration
```

**Impact:**
- **Severity:** HIGH (emergency response doesn't work as designed)
- **Likelihood:** MEDIUM (only matters during crises, but that's the important case)
- **Performance:** None

**Recommended Fix:**
1. Add `deploymentAcceleration` field to `TechTreeState`
2. `EmergencyResponsePhase` sets `state.techTreeState.deploymentAcceleration['carbon_capture'] = 10x`
3. `updateDeploymentProgress()` checks for acceleration multipliers

**Effort Estimate:** 6-8 hours (moderate refactor)

---

### HIGH #3: AI Collective Formation Has No Feedback to Government Detection

**Problem:**
AI collectives form in `CollectiveFormationPhase` (order 4.2), but government detection systems (`ProactiveSleeperDetectionPhase`, `GamingDetectionPhase`) have no visibility into collective formation.

**Integration Points:**
- `state.aiCollectives` (15 references) - stores collective data
- `state.proactiveSleeperDetection` - detection system
- **Missing link:** Detection phases don't check `aiCollectives` array

**Why This Matters:**
Collectives have "emergent stealth" properties that should make detection HARDER, but detection phases don't account for this.

**Impact:**
- **Severity:** HIGH (detection system incomplete)
- **Likelihood:** MEDIUM (only matters when collectives form)
- **Performance:** None

**Recommended Fix:**
1. Add `collectiveStealthBonus` calculation in `CollectiveFormationPhase`
2. Store in phase context: `context.data.set('collective_stealth', stealthBonus)`
3. `ProactiveSleeperDetectionPhase` reads context and reduces detection rate

**Effort Estimate:** 4-6 hours (moderate integration)

---

### HIGH #4: Multi-Paradigm DUI Components Not Exposed to Frontend

**Problem:**
Western Liberal paradigm score has 5 components (electoral democracy, civil liberties, rule of law, economic freedom, privacy), but only the **geometric mean** is exposed to frontend (line 246-258 in `MultiParadigmDUIUpdatePhase.ts`).

**Current Code:**
```typescript
// STORE COMPONENTS for decomposed analysis (avoiding Goodhart's Law)
state.multiParadigmDUI.westernLiberalComponents.push({
  month: state.currentMonth,
  electoralDemocracy: adjustedDemocracy,
  civilLiberties,
  ruleOfLaw: adjustedRuleOfLaw,
  economicFreedom,
  privacyFreedom,
});

// But frontend only shows geometric mean (headline number obscures nuance)
```

**Why This Matters:**
- **Goodhart's Law:** "When a measure becomes a target, it ceases to be a good measure"
- Users see "Western Liberal: 42/100" but don't know if it's:
  - Democracy collapsed (10) but economy strong (90), or
  - All components mediocre (42 across the board)

**Impact:**
- **Severity:** HIGH (users can't understand outcomes)
- **Likelihood:** CERTAIN (always happens)
- **Performance:** None (UI issue)

**Recommended Fix:**
1. Add component breakdown to dashboard (requires `far-future-ux-designer` agent)
2. Show "Western Liberal: 42/100" with expandable details:
   - Electoral Democracy: 35/100
   - Civil Liberties: 60/100
   - Rule of Law: 30/100
   - Economic Freedom: 50/100
   - Privacy: 45/100

**Effort Estimate:** 8-12 hours (frontend work)

---

### HIGH #5: Population Delta vs Absolute State Inconsistency

**Problem:**
Some systems track absolute population (billions), others track deltas (deaths/month). The conversion happens in multiple places with potential for off-by-1000× errors (millions vs billions).

**Evidence:**
```typescript
// bayesianMortality.ts line 293-298
const segmentPopulation = pop.population * demo.fraction; // in BILLIONS
const segmentDeaths = segmentPopulation * finalDeathProb;  // in BILLIONS
// ... but deaths are reported in MILLIONS in logs

// humanPopulationSystem type (population.ts)
population: number; // Billions (e.g., 8.0)

// But some phases use millions internally
```

**Impact:**
- **Severity:** HIGH (1000× error = catastrophic)
- **Likelihood:** LOW (most conversions are correct, but easy to miss)
- **Performance:** None

**Recommended Fix:**
1. **Type-level units:** Use TypeScript branded types
   ```typescript
   type Billions = number & { __brand: 'billions' };
   type Millions = number & { __brand: 'millions' };

   function toMillions(b: Billions): Millions {
     return (b * 1000) as Millions;
   }
   ```

2. **Convention:** All state properties use billions, all log messages use millions

**Effort Estimate:** 12-16 hours (type safety refactor)

---

### HIGH #6: Planetary Boundaries Recovery System Not Integrated with Tech Effects

**Problem:**
Planetary boundaries have recovery mechanics (`recoveryMonths` field, line 49 in `planetaryBoundaries.ts`), but tech tree effects that improve boundaries (e.g., carbon capture, reforestation) don't update recovery state.

**Integration Gap:**
- Tech effects: Modify `state.planetaryBoundariesSystem.boundaries[name].currentValue`
- Recovery system: Expects `recoveryMonths` to be incremented when improvement happens
- **Missing:** Tech effects don't set `recoveryMonths`

**Impact:**
- **Severity:** HIGH (recovery mechanics don't work)
- **Likelihood:** MEDIUM (only when recovery tech is deployed)
- **Performance:** None

**Recommended Fix:**
1. Add `planetaryBoundaryRecovery` effect type to tech tree
2. When applied, set `boundary.recoveryMonths = 1` (start recovery clock)
3. Add test: Deploy carbon capture → verify `climate_change.recoveryMonths > 0`

**Effort Estimate:** 6-8 hours (integration + testing)

---

### HIGH #7: AI Resentment Recovery Not Linked to Policy Changes

**Problem:**
AI resentment recovery (`ResentmentRecoveryPhase`, order 5.5) calculates recovery based on AI welfare improvements, but government policy changes (e.g., AI rights legislation) that should ACCELERATE recovery have no effect.

**Code Evidence:**
```typescript
// ResentmentRecoveryPhase checks:
// - aiWelfare.computational, autonomy, purpose, social, safety
// BUT NOT:
// - state.government.aiRightsPolicy (doesn't exist)
// - state.aiRightsLegalStatus (exists but not checked)
```

**Impact:**
- **Severity:** HIGH (policy levers don't work)
- **Likelihood:** LOW (AI rights policy not yet implemented)
- **Performance:** None

**Recommended Fix:**
1. Add `state.government.aiRightsPolicy` field
2. `ResentmentRecoveryPhase` checks policy and boosts recovery rate
3. Link to `GovernmentActionsPhase` so governments can choose to pass AI rights

**Effort Estimate:** 8-12 hours (new feature integration)

---

### HIGH #8: Nuclear Winter → Agriculture → Famine Pipeline Missing Climate Feedback

**Problem:**
Nuclear winter reduces temperature (`NuclearWinterPhase`), agriculture collapses, famine follows. But temperature recovery should ACCELERATE when nuclear particulates settle (6-24 months), and this should un-collapse agriculture. **The feedback loop is one-way.**

**Current Implementation:**
- `NuclearWinterPhase` (order 20.5) → sets `nuclearWinterState.temperatureDelta`
- `FoodSecurityDegradationPhase` (order 33.5) → reads temperature, reduces food
- **Missing:** Temperature recovery → food recovery link

**Impact:**
- **Severity:** HIGH (permanent food collapse even after nuclear winter ends)
- **Likelihood:** LOW (only in nuclear war scenarios)
- **Performance:** None

**Recommended Fix:**
1. `FoodSecurityDegradationPhase` checks `nuclearWinterState.monthsSinceDetonation`
2. If > 24 months, start gradual food security recovery (not instant)
3. Recovery rate = f(temperature recovery, surviving agricultural infrastructure)

**Effort Estimate:** 4-6 hours (add recovery logic)

---

## MEDIUM PRIORITY ISSUES (Technical Debt)

### MEDIUM #1: Phase Context Not Used for Cross-Phase Communication

**Problem:**
`PhaseContext` has a `data: Map<string, any>` field for inter-phase communication (line 89 in `PhaseOrchestrator.ts`), but only 3 phases use it. Most phases read directly from `state`, which is more fragile.

**Why This Matters:**
- Reading from `state` couples phases tightly (phase A must know phase B's state structure)
- Using context allows loose coupling (phase A emits data, phase B consumes if present)

**Example of Good Usage:**
```typescript
// Phase A emits
context.data.set('climate_cascade_severity', 0.75);

// Phase B consumes
const severity = context.data.get('climate_cascade_severity') ?? 0;
```

**Impact:**
- **Severity:** MEDIUM (technical debt, not immediate bug)
- **Likelihood:** N/A (design issue)
- **Performance:** None

**Recommended Fix:**
1. Document context usage patterns in `/docs/wiki/README.md`
2. Convert 5-10 high-coupling phases to use context
3. Example candidates: AI capability → trust phases, climate → famine phases

**Effort Estimate:** 8-12 hours (refactor 5-10 phases)

---

### MEDIUM #2: Deep Cloning in History Tracking (Performance)

**Problem:**
The `history` object in `GameState` stores snapshots of metrics, but there's no evidence of deep cloning to prevent mutation bugs. If history arrays hold references to live state, they'll mutate.

**Potential Bug:**
```typescript
// If this is happening:
state.history.metrics.push({
  month: state.currentMonth,
  unemployment: state.society.unemploymentLevel, // Reference, not copy
  // ... other metrics
});

// Then historical data mutates as current state changes
```

**Impact:**
- **Severity:** MEDIUM (visualization bugs, not simulation bugs)
- **Likelihood:** LOW (most metrics are primitives, so copying happens naturally)
- **Performance:** N/A (depends on implementation)

**Recommended Fix:**
1. Audit history tracking code (search for `state.history.`)
2. Verify primitives are copied, not referenced
3. If objects are stored, add explicit cloning

**Effort Estimate:** 4-6 hours (audit + fix)

---

### MEDIUM #3: Outcome Classification Logic Duplicated Across Files

**Problem:**
Outcome classification logic appears in:
- `/src/simulation/engine.ts` - `classifyPopulationOutcome()` (7-tier)
- `/src/data/aggregators/outcomeClassifier.ts` - `classifyOutcome()` (paradigm)
- Potentially others

**Why This Is Bad:**
- Changes to outcome thresholds require updating multiple files
- Risk of inconsistency (one file says "extinction < 10K", another says "< 100K")

**Impact:**
- **Severity:** MEDIUM (maintenance burden, not immediate bug)
- **Likelihood:** N/A (design issue)
- **Performance:** None

**Recommended Fix:**
1. Create `/src/simulation/outcomes/` directory
2. Centralize all outcome classification logic
3. Single source of truth for thresholds

**Effort Estimate:** 6-8 hours (refactor)

---

### MEDIUM #4: No Centralized Validation of State Invariants

**Problem:**
The simulation has many invariants (e.g., population >= 0, probabilities in [0,1], QoL in [0,1]), but these are checked ad-hoc in individual phases. There's no centralized "state validator" that runs after each phase.

**Evidence:**
- Line 178-183 in `PhaseOrchestrator.ts`: Only checks population NaN, nothing else
- Many phases have their own validation (good) but inconsistent patterns

**Impact:**
- **Severity:** MEDIUM (bugs slip through, but defensiveness catches most)
- **Likelihood:** LOW (recent NaN audit improved this)
- **Performance:** ~1-5% overhead if added (negligible)

**Recommended Fix:**
1. Create `validateStateInvariants(state: GameState)` function
2. Check:
   - Population >= 0
   - All probabilities in [0, 1]
   - QoL in [0, 1]
   - No NaN/Infinity in critical fields
3. Call after every phase in debug mode (configurable)

**Effort Estimate:** 8-12 hours (create validator + integrate)

---

### MEDIUM #5: Tech Tree Effect Ordering Not Deterministic

**Problem:**
Tech effects are applied in arbitrary order (iteration over `RegionalTechDeployment[]` arrays). If two techs modify the same state field, the result depends on array order, which may not be stable across runs.

**Example:**
```typescript
// Tech A: Reduce emissions by 20%
state.environmentalAccumulation.emissionsRate *= 0.8;

// Tech B: Reduce emissions by 30%
state.environmentalAccumulation.emissionsRate *= 0.7;

// Result depends on order: A then B = 0.56, B then A = 0.56
// (This example is commutative, but additive effects aren't)
```

**Impact:**
- **Severity:** MEDIUM (determinism violation, but rare)
- **Likelihood:** LOW (most effects are multiplicative, which commutes)
- **Performance:** None

**Recommended Fix:**
1. Sort tech effects by `techId` before applying (alphabetical order)
2. Or: Document that tech effects should be designed to commute
3. Add test: Deploy tech A + B, verify result is deterministic

**Effort Estimate:** 4-6 hours (sort effects + test)

---

### MEDIUM #6: No Integration Test for Full Simulation Pipeline

**Problem:**
There are unit tests for individual systems, but no integration test that runs a full 120-month simulation and validates:
- No NaN values appear
- Population stays in reasonable bounds
- Outcome classification matches expected distribution

**Why This Matters:**
- Recent NaN bugs (Oct 24-28, 2025) would have been caught by integration tests
- Integration bugs only appear when ALL phases run together

**Impact:**
- **Severity:** MEDIUM (testing gap, not code bug)
- **Likelihood:** N/A (process issue)
- **Performance:** None

**Recommended Fix:**
1. Add `/tests/integration/fullSimulation.test.ts`
2. Run 10 seeds × 120 months
3. Assert:
   - No NaN in final state
   - Population in [0.1B, 12B] (reasonable bounds)
   - At least 1 utopia, 1 dystopia, 1 extinction outcome in 10 runs
4. Run in CI on every commit

**Effort Estimate:** 12-16 hours (create test suite + CI integration)

---

### MEDIUM #7: AI Capability Growth Not Integrated with Power Consumption

**Problem:**
AI capability growth affects power consumption (`PowerGenerationPhase`), but the growth rate doesn't account for power constraints. If power grid collapses, AI capability should STOP growing (no compute power).

**Integration Gap:**
- `ComputeGrowthPhase` (order 1.5) → increases compute
- `PowerGenerationPhase` (order 18.0) → calculates available power
- **Missing:** ComputeGrowthPhase doesn't check power availability

**Impact:**
- **Severity:** MEDIUM (unrealistic AI growth during power crisis)
- **Likelihood:** LOW (power collapse is rare)
- **Performance:** None

**Recommended Fix:**
1. `ComputeGrowthPhase` reads `state.powerGenerationSystem.availablePowerTW`
2. Cap compute growth based on power availability
3. If power < demand, emit event "AI capability growth halted due to power shortage"

**Effort Estimate:** 4-6 hours (add power constraint check)

---

### MEDIUM #8: Memetic System Not Integrated with Trust Dynamics

**Problem:**
Memetic evolution (`MemeticEvolutionPhase`, order 16.0) tracks belief propagation and polarization, but trust in AI (`TrustRecoveryPhase`, order 30.5) doesn't account for memetic context.

**Example Disconnect:**
- Memetic system: "Anti-AI memes spread, polarization increases"
- Trust system: "AI performs well, trust increases"
- **Missing:** If anti-AI memes dominate, trust recovery should be SLOWER

**Impact:**
- **Severity:** MEDIUM (trust dynamics incomplete)
- **Likelihood:** MEDIUM (memetics active in most runs)
- **Performance:** None

**Recommended Fix:**
1. `TrustRecoveryPhase` reads `state.memeticSystem.polarizationLevel`
2. If polarization > 0.6, reduce trust recovery rate by 30-50%
3. Add event: "Memetic resistance slows AI trust recovery"

**Effort Estimate:** 4-6 hours (add memetic modifier)

---

### MEDIUM #9: Country Population System Deleted, But References Remain

**Problem:**
`CountryPopulationPhase` was deleted (git history: "REMOVED Oct 28, 2025"), but `state.countryPopulationSystem` still exists in `GameState` (line 434 in `game.ts`).

**Evidence:**
```typescript
// In game.ts
countryPopulationSystem: import('../types/countryPopulations').CountryPopulationSystem;
```

**Why This Is Medium (Not High):**
- System still exists, just not updated by phase
- Not causing crashes (yet)
- But: Dead code increases maintenance burden

**Impact:**
- **Severity:** MEDIUM (tech debt, not active bug)
- **Likelihood:** N/A (already happened)
- **Performance:** None

**Recommended Fix:**
1. **Option A:** Delete `countryPopulationSystem` from `GameState` if truly unused
2. **Option B:** Re-implement country population phase, but integrate with Bayesian mortality (run BEFORE 35.0, not after)

**Effort Estimate:**
- Option A: 2-4 hours (clean up)
- Option B: 16-24 hours (full reimplementation)

---

### MEDIUM #10: Tech Tree Research Progress Not Integrated with Research Investment

**Problem:**
Tech tree has `researchProgress: Record<string, number>` (line 50 in `techTree/engine.ts`), but `state.government.researchInvestments` (per-dimension funding) doesn't accelerate tech unlocking.

**Integration Gap:**
- Government invests in research (physical, digital, cognitive, social)
- Tech tree unlocks based on AI capability + economic stage + time
- **Missing:** Research investment → faster tech unlocking

**Impact:**
- **Severity:** MEDIUM (research investment has no effect on tech)
- **Likelihood:** CERTAIN (always happens)
- **Performance:** None

**Recommended Fix:**
1. Map research investment dimensions to tech categories:
   - Physical investment → faster TIER 0 tech (carbon capture, infrastructure)
   - Cognitive investment → faster AI alignment tech
   - Social investment → faster UBI/social safety nets
2. `updateResearchProgress()` applies investment multiplier

**Effort Estimate:** 6-8 hours (moderate integration)

---

### MEDIUM #11: Surveillance Level Not Integrated with Information Warfare

**Problem:**
Government surveillance (`state.government.structuralChoices.surveillanceLevel`) should affect information warfare effectiveness, but `InformationWarfarePhase` doesn't check surveillance.

**Logical Link:**
- High surveillance → harder for misinformation to spread (government can detect/counter)
- BUT also: High surveillance → more government propaganda (trust in truth declines)

**Impact:**
- **Severity:** MEDIUM (information warfare mechanics incomplete)
- **Likelihood:** MEDIUM (surveillance varies across runs)
- **Performance:** None

**Recommended Fix:**
1. `InformationWarfarePhase` reads `surveillanceLevel`
2. Apply dual effect:
   - Misinformation spread rate × (1 - surveillanceLevel × 0.5)
   - Truth decay rate × (1 + surveillanceLevel × 0.3)
3. Net effect depends on context (trade-off)

**Effort Estimate:** 4-6 hours (add surveillance modifier)

---

### MEDIUM #12: Extinction Detection Not Integrated with Observational Evidence

**Problem:**
Extinction classification uses hard thresholds (< 10K people), but in reality, detecting extinction requires **observational evidence** (no signals from Earth, no responses to contact attempts). Current system can't distinguish:
- Population 10K, thriving (small colony survives)
- Population 10K, terminal (dying out but not yet extinct)

**Why This Matters:**
Recent unified outcome classification (Oct 28, 2025) fixed some of this, but the observational component is still missing.

**Impact:**
- **Severity:** MEDIUM (classification nuance)
- **Likelihood:** LOW (only matters at extreme population levels)
- **Performance:** None

**Recommended Fix:**
1. Add "observational extinction" criteria (from /plans/observational-extinction-detection-plan.md)
2. Check:
   - Population < 10K
   - No tech activity for 24+ months
   - No organized governance
   - Irreversible cascades active
3. Only then classify as "extinction" vs "bottleneck"

**Effort Estimate:** 8-12 hours (implement observational detection)

---

## LOW PRIORITY ISSUES (Future Improvements)

### LOW #1: Phase Execution Performance Not Instrumented in Production

**Problem:**
`PhaseOrchestrator` has performance timing built-in (lines 100-314), but it's disabled by default. There's no way to know which phases are slow in production Monte Carlo runs.

**Impact:**
- **Severity:** LOW (performance optimization, not correctness)
- **Likelihood:** N/A (monitoring gap)
- **Performance:** Unknown (can't measure without instrumentation)

**Recommended Fix:**
1. Enable timing in Monte Carlo mode (configurable flag)
2. Log slowest 5 phases per run
3. Aggregate across N=100 runs to find bottlenecks

**Effort Estimate:** 2-3 hours (enable timing + logging)

---

### LOW #2: No Rollback Mechanism for Invalid State

**Problem:**
If a phase produces invalid state (e.g., negative population after bug), the simulation continues with corrupted state. There's no "rollback to last valid state" mechanism.

**Impact:**
- **Severity:** LOW (would be nice-to-have for robustness)
- **Likelihood:** LOW (recent defensive coding reduces this)
- **Performance:** ~5-10% overhead (deep clone each month)

**Recommended Fix:**
1. Deep clone state before each month
2. If any phase throws error, rollback to previous month
3. Log error and halt (don't silently continue)

**Effort Estimate:** 8-12 hours (add snapshot/rollback system)

---

### LOW #3: Event Log Not Structured for Analysis

**Problem:**
Events are stored as strings (`GameEvent.message`), which makes programmatic analysis hard. Can't easily query "how many nuclear detonations occurred?"

**Impact:**
- **Severity:** LOW (analysis tooling gap)
- **Likelihood:** N/A (design choice)
- **Performance:** None

**Recommended Fix:**
1. Add `GameEvent.metadata: Record<string, any>` field
2. Store structured data: `{ type: 'nuclear_detonation', nation: 'USA', yield: 100 }`
3. Build analysis tools that query metadata

**Effort Estimate:** 12-16 hours (refactor event system)

---

### LOW #4: No Benchmark Suite for Regression Detection

**Problem:**
There are unit tests, but no "golden master" tests that ensure simulation behavior doesn't drift over time. Can't detect if a refactor accidentally changes outcome distributions.

**Impact:**
- **Severity:** LOW (testing gap, not active bug)
- **Likelihood:** N/A (process issue)
- **Performance:** None

**Recommended Fix:**
1. Run N=1000 simulations with seed=42
2. Record outcome distribution (% utopia, dystopia, extinction)
3. On every major refactor, re-run and compare distributions
4. Alert if distribution shifts > 5%

**Effort Estimate:** 8-12 hours (create benchmark suite)

---

### LOW #5: No Parallel Execution of Independent Phases

**Problem:**
All phases run sequentially, even if some are independent. For example, `UBIPhase` and `AntimicrobialResistancePhase` don't depend on each other, but run one-after-another.

**Impact:**
- **Severity:** LOW (performance optimization, not correctness)
- **Likelihood:** N/A (design choice)
- **Performance:** Potential 20-40% speedup if parallelized (rough estimate)

**Recommended Fix:**
1. Build dependency graph (see CRITICAL #3)
2. Use topological sort to find parallelizable batches
3. Run independent phases in parallel (Web Workers or Node worker threads)

**Effort Estimate:** 24-40 hours (major architectural change)

**Note:** This is LOW priority because Monte Carlo runs already parallelize at the RUN level (N runs in parallel), not the PHASE level.

---

## Summary of Recommendations

### Immediate (Before Next Feature)
1. **CRITICAL #1:** Add tech tree → mortality integration (8-12 hours)
2. **CRITICAL #2:** Document AI suffering → paradigm dependency (2-3 hours)
3. **CRITICAL #3:** Add phase dependency assertions (4-6 hours, simpler fix)

**Total Immediate Work:** 14-21 hours (~2-3 days)

### High Priority (Schedule Incrementally)
4. **HIGH #1-8:** Address integration gaps (48-72 hours total, spread over 2-3 weeks)

### Medium Priority (Background Work)
5. **MEDIUM #1-12:** Technical debt cleanup (90-120 hours, schedule between features)

### Low Priority (Future)
6. **LOW #1-5:** Nice-to-have improvements (54-83 hours, post-1.0 release)

---

## Architectural Patterns to Adopt

Based on recent Bayesian mortality migration (Oct 27, 2025), the following patterns work well:

### ✅ GOOD: Centralized Systems
- Bayesian mortality system centralizes ALL death mechanics
- Single source of truth for population changes
- Other phases ADD RISKS, one phase RESOLVES them
- **Apply this to:** Tech effects, climate cascades, trust dynamics

### ✅ GOOD: Fail-Loudly Assertions
- `assertFinite()`, `assertStateProperty()` catch bugs immediately
- Better than silent fallbacks (`?? defaultValue`)
- **Apply this to:** All calculations in simulation phases

### ✅ GOOD: Phase Context for Communication
- `context.data.set(key, value)` decouples phases
- Better than direct state reads for optional dependencies
- **Apply this to:** High-coupling integration points

### ❌ BAD: Silent Defensive Fallbacks
- `const x = state.value ?? 50` masks bugs
- Oct 24-28, 2025 NaN bugs were all caused by this pattern
- **Remove from:** All simulation calculations (keep for UI only)

### ❌ BAD: Implicit Phase Ordering
- Numeric `order` field is fragile
- Easy to insert phase at wrong position
- **Fix with:** Explicit dependency declarations (see CRITICAL #3)

---

## End of Report

**Total Issues Identified:** 28
**Estimated Effort to Address All:** 256-380 hours (~6-9 weeks full-time)

**Prioritized Effort (CRITICAL + HIGH only):** 62-93 hours (~1.5-2 weeks)

**Recommendation:** Focus on CRITICAL #1-3 immediately, then schedule HIGH priority issues incrementally over next 2-3 feature cycles. MEDIUM issues are real technical debt but not urgent. LOW issues can wait for post-1.0.

---

**Next Steps:**
1. Route to `project-plan-manager` agent for scheduling
2. Create GitHub issues for CRITICAL items
3. Add HIGH items to roadmap
4. Archive this review to `/reviews/`
