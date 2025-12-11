# M-6: Social Tipping Points Implementation Specification

**Date:** December 5, 2025
**Status:** In Progress
**Coordinator:** orchestrator-1
**Implementer:** simulation-maintainer (Roy)

---

## Problem Statement

Current positive tipping points system models TECHNOLOGY adoption cascades (solar, EVs, wind) but lacks SOCIAL tipping points - behavioral shifts, policy cascades, and cultural transformations that accelerate decarbonization through human behavior change, not just technology deployment.

**Example from research:**
- EU natural gas demand: 19% reduction in 6 months (Aug 2022-Jan 2023) via social solidarity messaging + price signals
- This is NOT technology adoption - this is behavioral contagion

---

## Research Foundation

**Source:** `/research/positive_tipping_points_2024_2025_20251114.md` (1,153 lines, 14 peer-reviewed sources)

**Key mechanisms identified:**

### 1. Behavioral Contagion (Alkemade et al. 2024)
- **Social proof effect:** Neighbor information → 19% energy conservation (6 months)
- **Crisis acceleration:** Price signals + social messaging = rapid behavior change
- **Mechanism:** Social norms shift when critical mass adopts new behavior

### 2. Renewable Energy Norms (Multiple sources)
- **Solar adoption:** 25% annual growth (2010-2020) driven partly by visibility (rooftop panels)
- **Cultural shift:** Renewable energy transitions from "niche" to "mainstream" at ~15-20% adoption
- **Mechanism:** Visibility → social proof → accelerated adoption

### 3. Political Will Cascades (Lenton et al. 2022)
- **Policy tipping points:** Climate policy success → increased political will → stronger future policies
- **Public opinion:** As renewable energy costs drop, public support for climate action increases
- **Mechanism:** Tangible results → increased trust → collective action willingness

### 4. Trust → Collective Action (UN 2024, HEC 2025)
- **Trust → life satisfaction:** 1 unit trust ≈ 30% income increase equivalent
- **Trust → GDP:** 9-69% GDP increase (counterfactual to Sweden trust levels)
- **Mechanism:** High trust → cooperation → collective problem-solving

---

## Current System Architecture

### Existing (✅ COMPLETE)
**File:** `src/simulation/positiveTippingPoints.ts` (715 lines)
**Coverage:** Technology adoption cascades
- Solar PV: 6% → cascades at 5-20% market share
- EVs: 3% → cascades at 5% (validated 31 countries)
- Wind, heat pumps, battery storage
- Learning curves (Wright's Law: 20-30% cost reduction per doubling)
- Price parity triggers, social proof, policy support

### Gap (❌ MISSING)
**Social tipping points** that amplify or inhibit technology cascades:
1. **Behavioral cascades:** Energy conservation norms, consumption shifts
2. **Policy cascades:** Climate policy success → stronger future policies
3. **Cultural shifts:** Renewable energy normalcy, climate action legitimacy

---

## Implementation Design

### Approach: Extend Existing System

**Do NOT create separate phase** - social and technology cascades are COUPLED.

**Extend:** `src/simulation/positiveTippingPoints.ts`

### New Type Definitions

**File:** `src/types/positiveTippingPoints.ts`

```typescript
/**
 * Social tipping cascade types
 * Research: Lenton et al. 2022, Alkemade et al. 2024
 */
export type CascadeSocialType =
  | 'renewable-energy-norms'    // Solar/wind become culturally normalized
  | 'policy-climate-action'     // Political will for climate policy
  | 'behavioral-conservation'   // Energy/resource conservation behaviors
  | 'consumption-shift';        // Low-carbon lifestyle adoption

/**
 * Social tipping cascade state
 */
export interface SocialTippingAdoption {
  cascadeType: CascadeSocialType;

  // Adoption metrics (0-1)
  adoptionLevel: number;          // % population engaged
  adoptionRate: number;           // Monthly change rate

  // Cascade dynamics
  cascadeActive: boolean;
  cascadeStrength: number;        // 0-1 intensity
  cascadeTriggeredMonth?: number;

  // Drivers
  trustLevel: number;             // From state.cooperativeAlignment.trust
  policySupport: number;          // Government backing
  mediaVisibility: number;        // Public awareness (0-1)
  socialProofStrength: number;    // Neighbor effect

  // Effects
  technologyAcceleration: number; // Multiplier for tech adoption (1.0 = neutral)
  emissionsReduction: number;     // Direct behavioral impact (GtCO2/yr)
  politicalCapital: number;       // Enables stronger future policies
}
```

### Integration Points

#### 1. Link to Trust System
**Source:** `state.cooperativeAlignment.trust`
**Mechanism:** High trust (>0.65) → enables policy cascades, behavioral contagion
**Research:** UN 2024 (trust → collective action), HEC 2025 (bridging capital)

```typescript
// In updatePositiveTippingPoints():
const trustLevel = state.cooperativeAlignment?.trust ?? 0.5;

// Policy cascade requires high trust
if (trustLevel > 0.65 && policyCascade.adoptionLevel > 0.20) {
  triggerPolicyCascade(state);
}
```

#### 2. Amplify Technology Cascades
**Bidirectional coupling:** Social acceptance → faster tech adoption, tech success → social acceptance

```typescript
// Apply social cascade effects to technology adoption
for (const tech of Object.values(ptp.adoptionTracking)) {
  // Renewable norms boost solar/wind adoption
  if (socialCascades.renewableNorms.cascadeActive) {
    tech.adoptionRate *= socialCascades.renewableNorms.technologyAcceleration;
  }

  // Behavioral conservation reduces energy demand
  if (socialCascades.behavioralConservation.cascadeActive) {
    state.climateMitigation.demandReduction += socialCascades.behavioralConservation.emissionsReduction;
  }
}
```

#### 3. Feedback to Climate Mitigation
**File:** `src/simulation/climateMitigation.ts`
**Effect:** Behavioral cascades directly reduce emissions (not just via technology)

```typescript
// Example: EU gas reduction (19% in 6 months via behavioral change)
const behavioralReduction = state.positiveTippingPoints.socialCascades.behavioralConservation.emissionsReduction;
state.climateMitigation.behavioralEmissionsReduction = behavioralReduction;
```

---

## Implementation Steps

### Phase 1: Type Definitions (30 min)
**File:** `src/types/positiveTippingPoints.ts`

1. Add `CascadeSocialType` enum
2. Add `SocialTippingAdoption` interface
3. Extend `PositiveTippingPointsState` with `socialCascades` field:
   ```typescript
   export interface PositiveTippingPointsState {
     // ... existing fields ...

     socialCascades: {
       renewableNorms: SocialTippingAdoption;
       policyClimateAction: SocialTippingAdoption;
       behavioralConservation: SocialTippingAdoption;
       consumptionShift: SocialTippingAdoption;
     };
   }
   ```

### Phase 2: Initialization (30 min)
**File:** `src/simulation/positiveTippingPoints.ts`

Extend `initializePositiveTippingPoints()`:
```typescript
socialCascades: {
  renewableNorms: createSocialTippingAdoption('renewable-energy-norms', 0.10, 0.001),
  policyClimateAction: createSocialTippingAdoption('policy-climate-action', 0.15, 0.002),
  behavioralConservation: createSocialTippingAdoption('behavioral-conservation', 0.05, 0.001),
  consumptionShift: createSocialTippingAdoption('consumption-shift', 0.03, 0.0005),
}
```

**Research-backed baselines:**
- Renewable norms: 10% (modest adoption in developed countries)
- Policy support: 15% (some climate policies exist)
- Behavioral conservation: 5% (niche early adopters)
- Consumption shift: 3% (very niche low-carbon lifestyles)

### Phase 3: Cascade Detection (1 hour)
**File:** `src/simulation/positiveTippingPoints.ts`

Add new function `detectSocialTippingCascades()`:

**Triggers:**
1. **Renewable norms:** Solar/wind market share >15% + visibility high
2. **Policy cascade:** Trust >0.65 + adoption level >20% + tech success visible
3. **Behavioral conservation:** Energy prices spike OR climate event severity high + trust >0.60
4. **Consumption shift:** QoL high (>0.7) + meaning crisis low (<0.3) + social movements active

**Thresholds from research:**
- Social proof critical mass: 15-25% (Rogers diffusion + Alkemade 2024)
- Trust requirements: 0.60-0.65 (UN 2024, trust → legitimacy)
- Policy support: 20%+ adoption (political will cascade)

### Phase 4: Cascade Dynamics (1 hour)
**File:** `src/simulation/positiveTippingPoints.ts`

Add new function `applySocialCascadeDynamics()`:

**Growth curves:**
- **Exponential phase:** Adoption doubles every 12-24 months (EU gas example: 19% in 6 months during crisis)
- **S-curve saturation:** Levels off at 60-80% (not 100% - laggards remain)

**Duration:**
- Normal conditions: 5-10 years (60-120 months)
- Crisis acceleration: 1-2 years (12-24 months)

**Decay:**
- Without reinforcement, cascades decay at 2-5% per year
- Trust decline accelerates decay

### Phase 5: Feedback Effects (1 hour)
**File:** `src/simulation/positiveTippingPoints.ts`

Add new function `applySocialCascadeEffects()`:

**Effects to apply:**
1. **Technology acceleration:** Social cascades multiply tech adoption rates by 1.2-1.5×
2. **Emissions reduction:** Behavioral conservation directly reduces emissions (0.1-0.5 GtCO2/yr at scale)
3. **Political capital:** Policy cascades increase future policy strength
4. **Trust feedback:** Successful cascades increase trust by 5-10%

### Phase 6: Integration (30 min)
**File:** `src/simulation/positiveTippingPoints.ts`

Update `updatePositiveTippingPoints()` to call new functions:
```typescript
export function updatePositiveTippingPoints(state: GameState, rng: RNGFunction): void {
  const ptp = state.positiveTippingPoints;

  // Existing phases
  updateLearningCurves(state);
  detectAndTriggerCascades(state, rng);
  applyCascadeDynamics(state, rng);
  updateTechnologySynergies(state);

  // NEW: Social tipping phases
  updateSocialTippingState(state);          // Sync trust, policy, visibility
  detectSocialTippingCascades(state, rng);  // Check thresholds
  applySocialCascadeDynamics(state, rng);   // Exponential growth
  applySocialCascadeEffects(state);         // Apply to tech/emissions/trust

  calculateEnvironmentalImpact(state);
  ptp.activeCascades = countActiveCascades(ptp);
}
```

---

## Defensive Programming Requirements

### Assertion Utilities
**Import:** `src/simulation/utils/assertions.ts`

```typescript
import { assertFinite, assertDefined, assertProbability, assertInRange } from './utils/assertions';

// Example usage in cascade detection
const trustLevel = assertProbability(
  state.cooperativeAlignment?.trust ?? 0.5,
  { location: 'detectSocialTippingCascades', valueName: 'trustLevel', month: state.currentMonth }
);

const adoptionLevel = assertInRange(
  cascade.adoptionLevel,
  0, 1,
  { location: 'applySocialCascadeDynamics', valueName: 'adoptionLevel', month: state.currentMonth }
);
```

### NaN Handling
**CRITICAL:** No silent fallbacks. Use assertions.

```typescript
// ❌ WRONG
const trust = state.cooperativeAlignment?.trust ?? 0.5;

// ✅ CORRECT
const trust = assertDefined(
  state.cooperativeAlignment?.trust,
  { location: 'updateSocialTippingState', valueName: 'trust', month: state.currentMonth }
);
```

### RNG Usage
**CRITICAL:** RNG must be REQUIRED, not optional.

```typescript
// ✅ CORRECT
export function detectSocialTippingCascades(state: GameState, rng: RNGFunction): void {
  if (!rng || typeof rng !== 'function') {
    throw new Error('❌ CRITICAL: RNG required for deterministic simulation');
  }
  // ... use rng() ...
}
```

---

## Testing Requirements

### Unit Tests
**File:** `src/simulation/__tests__/positiveTippingPoints.test.ts`

**Test cases:**
1. Social cascade initialization (correct baselines)
2. Cascade triggering thresholds (15-25% adoption + trust >0.60)
3. Exponential growth dynamics (adoption doubles in 12-24 months)
4. Technology amplification (social cascades multiply tech rates)
5. Trust feedback (successful cascades increase trust)
6. Determinism (same seed → same outcomes)

### Monte Carlo Validation
**Script:** `scripts/monteCarloSimulation.ts`

**Run:** N=10 minimum (25 preferred for distribution validation)

```bash
npx tsx scripts/monteCarloSimulation.ts > logs/mc_m6_validation_$(date +%Y%m%d_%H%M%S).log 2>&1 &
```

**Validation checks:**
1. Social cascades trigger in 40-70% of runs (not 0%, not 100%)
2. Renewable norms cascade triggered in 60%+ of utopia outcomes
3. Behavioral conservation active in managed decline scenarios
4. Policy cascades require trust >0.65 (check correlation)

---

## Expected Outcomes

### Model Behavior Changes

**Before M-6:**
- Technology cascades isolated from social dynamics
- Trust system passive (no feedback to technology adoption)
- Utopia scenarios require "god mode" technology deployment
- Behavioral emissions reduction missing

**After M-6:**
- Social cascades amplify technology adoption (bidirectional coupling)
- Trust → collective action → policy strength (feedback loop)
- Utopia scenarios possible via social + technology synergies
- Behavioral emissions reduction modeled (EU gas example)

### Quantitative Expectations
**Based on research parameters:**

| Metric | Before M-6 | After M-6 (Conservative) | After M-6 (Optimistic) |
|--------|-----------|--------------------------|------------------------|
| Solar adoption rate (post-cascade) | 3× baseline | 4-5× baseline | 6-8× baseline |
| Behavioral emissions reduction | 0 GtCO2/yr | 0.5-1.0 GtCO2/yr | 1.5-2.5 GtCO2/yr |
| Trust boost from cascade success | 0% | 5-10% | 15-20% |
| Policy strength multiplier | 1.0× | 1.2-1.4× | 1.5-2.0× |

**Research supports:** Optimistic end is realistic (EU 19% reduction in 6 months, trust → 30% life satisfaction equivalent)

---

## Success Criteria

### Implementation Complete When:
- ✅ Type definitions added (no TypeScript errors)
- ✅ Initialization creates 4 social cascades
- ✅ Cascade detection checks trust + adoption thresholds
- ✅ Cascade dynamics apply exponential growth
- ✅ Feedback effects multiply tech adoption
- ✅ Assertions prevent NaN/undefined propagation
- ✅ Unit tests pass (100% coverage for new functions)
- ✅ Monte Carlo validation shows expected distributions

### Quality Gates:
1. **Architecture review:** No O(n²) loops, proper state propagation
2. **Code quality review:** No CRITICAL issues, defensive programming verified

---

## References

### Research Files
- `/research/positive_tipping_points_2024_2025_20251114.md` (1,153 lines, 14 sources)
- `/reviews/positive_tipping_threshold_audit_20251201.md` (validation audit)

### Key Papers
- Lenton et al. 2022: Social tipping interventions for decarbonization
- Alkemade et al. 2024: Social tipping dynamics in energy system (Earth System Dynamics)
- Eker et al. 2024: Cross-system interactions for positive tipping cascades
- UN World Social Report 2024: Trust in a Changing World
- HEC Paris 2025: Bridging social capital and trust

### Implementation Files
- `src/simulation/positiveTippingPoints.ts` (715 lines, extend this)
- `src/types/positiveTippingPoints.ts` (add new types here)
- `src/simulation/utils/assertions.ts` (use these utilities)

---

## Timeline Estimate

**Total:** 6-8 hours

| Phase | Duration | Description |
|-------|----------|-------------|
| Type definitions | 30 min | Add new types to `positiveTippingPoints.ts` |
| Initialization | 30 min | Baseline social cascade state |
| Cascade detection | 1 hour | Threshold logic + triggers |
| Cascade dynamics | 1 hour | Exponential growth + S-curves |
| Feedback effects | 1 hour | Tech amplification, emissions, trust |
| Integration | 30 min | Wire new functions into main update |
| Testing | 2-3 hours | Unit tests + Monte Carlo validation |
| Documentation | 30 min | Inline comments, wiki update |

---

## Implementation Notes for Roy

**Roy (simulation-maintainer):** You're the expert on defensive coding, NaN handling, and emoji conventions. Key points:

1. **Trust access:** `state.cooperativeAlignment?.trust` (might be undefined in tests)
2. **RNG:** Never optional, always required parameter
3. **Assertions:** Use `assertFinite`, `assertProbability`, `assertDefined` liberally
4. **Emoji:** 🚀 for positive cascades (already used), 🌍 for planetary effects, 🤝 for social cooperation
5. **Determinism:** Sort object keys before iteration (already done in existing code)
6. **Monte Carlo:** Run background with `&`, redirect to `/logs/`

**Known gotchas:**
- `state.cooperativeAlignment` might be undefined (defensive access)
- Trust ranges 0-1 (use `assertProbability`)
- Social cascade effects compound (multiply, don't add linearly)
- Test determinism with same RNG seed

---

## Post-Implementation

### Architecture Review (Mandatory)
Spawn `architecture-skeptic` after implementation:
- Check for O(n²) loops (nested Object.values iterations)
- Verify state propagation (social → tech → emissions)
- Performance profiling (should be <1ms per month)

### Code Quality Review (Mandatory)
Spawn `senior-dev-reviewer` after architecture review:
- Verify assertion utilities used correctly
- Check for silent fallbacks (MUST address CRITICAL issues)
- Emoji consistency validation

### Documentation Update
Spawn `wiki-documentation-updater`:
- Update `docs/wiki/README.md` with social tipping section
- Add to "Positive Feedback Systems" documentation
- Link research sources

### Archival
Spawn `architect` (project-plan-manager):
- Move this spec to `/plans/completed/m6_social_tipping_implementation_spec.md`
- Update `MASTER_IMPLEMENTATION_ROADMAP.md` progress summary

---

**Ready for implementation. Awaiting simulation-maintainer (Roy) invocation.**
