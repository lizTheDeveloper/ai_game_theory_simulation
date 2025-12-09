# Tasks: Threshold Uncertainty Modeling

**Change:** M-5 Threshold Uncertainty Modeling
**Status:** In Progress
**Started:** December 7, 2025

---

## Phase 1: Research & Validation

### T1.1: Literature Research
**Owner:** super-alignment-researcher
**Status:** Not Started
**Deliverable:** `research/tipping_threshold_uncertainty_YYYYMMDD.md`

Extract uncertainty distributions for tipping elements:
- AMOC collapse threshold distribution
- Greenland ice sheet threshold
- Amazon dieback threshold
- West Antarctic Ice Sheet threshold
- Permafrost carbon release threshold
- Other major tipping elements (boreal forest, coral reefs, etc.)

For each element, extract:
- Central estimate (best guess threshold)
- Uncertainty distribution type (normal, log-normal, uniform, triangular)
- Distribution parameters (mean/std, or min/mode/max)
- Confidence level / likelihood assessment
- Source citations (2024-2025 preferred)

**Base sources:**
- Armstrong McKay et al. 2022 (baseline)
- IPCC AR6 WG1 Chapter 4
- 2024-2025 updates from climate journals

### T1.2: Research Validation
**Owner:** research-skeptic
**Status:** Not Started
**Deliverable:** `reviews/threshold_uncertainty_critique_YYYYMMDD.md`
**Quality Gate:** MUST PASS before implementation

Validate:
- Parameter extraction methodology
- Distribution type selection (justified by data)
- No cherry-picking of favorable estimates
- Uncertainty ranges match consensus science
- Citations are peer-reviewed and recent

---

## Phase 2: Implementation

### T2.1: Distribution Library
**Owner:** feature-implementer
**Status:** Not Started
**Deliverable:** `src/simulation/utils/distributions.ts`

Implement sampling functions:
- `sampleNormal(mean, std, rng)` - Normal distribution
- `sampleLogNormal(meanLog, stdLog, rng)` - Log-normal distribution
- `sampleUniform(min, max, rng)` - Uniform distribution
- `sampleTriangular(min, mode, max, rng)` - Triangular distribution

Requirements:
- All functions MUST take RNG parameter (no Math.random fallback)
- Use assertion utilities (assertFinite, assertInRange)
- Validate distribution parameters (std > 0, min < max, etc.)
- Add JSDoc comments with distribution formulas
- Support deterministic sampling (reproducible with seed)

### T2.2: Tipping Point Type Updates
**Owner:** feature-implementer
**Status:** Not Started
**Deliverable:** `src/types/tipping-points.ts` (modified)

Add uncertainty fields to TippingElement type:
```typescript
interface TippingElement {
  name: string;
  threshold: number;  // Keep for backward compatibility
  thresholdDistribution?: {
    type: 'normal' | 'log-normal' | 'uniform' | 'triangular';
    params: {
      // Normal: { mean, std }
      // Log-normal: { meanLog, stdLog }
      // Uniform: { min, max }
      // Triangular: { min, mode, max }
    };
  };
  // ... existing fields
}
```

Add to GameState:
```typescript
interface GameState {
  // ...
  sampledTippingThresholds?: Map<string, number>;  // Sampled at initialization
}
```

### T2.3: Phase Integration
**Owner:** feature-implementer
**Status:** Not Started
**Deliverable:** Modified tipping point phases

Update initialization:
- Sample thresholds at simulation start
- Store in `state.sampledTippingThresholds`
- Use sampled values throughout run (not baseline threshold)

Update phase execution:
- Replace `element.threshold` with sampled value
- Fall back to baseline only if distribution not defined
- Add logging for sampled threshold values (first month only)

### T2.4: Unit Tests
**Owner:** feature-implementer
**Status:** Not Started
**Deliverable:** `tests/distributions.test.ts`

Test coverage:
- Each distribution type produces values in expected range
- Mean/std/mode match theoretical values (N=10000 samples)
- Determinism: same seed produces identical sequences
- Edge cases: zero std, min=max, invalid parameters (should throw)
- RNG required (no silent fallback)

### T2.5: Integration Tests
**Owner:** feature-implementer
**Status:** Not Started
**Deliverable:** `tests/tipping-threshold-uncertainty.test.ts`

Test coverage:
- Tipping activation varies across runs (different seeds)
- Sampled thresholds persist throughout single run
- Monte Carlo runs show realistic variance
- Backward compatibility (elements without distributions use baseline)

### T2.6: Monte Carlo Validation
**Owner:** priya (quantitative-validator)
**Status:** Not Started
**Deliverable:** `logs/mc_threshold_uncertainty_YYYYMMDD.log`

Validation criteria:
- N≥10 runs with different seeds
- Coefficient of variation < 0.01% for identical seeds
- Tipping activation timing shows realistic spread
- No NaN/Infinity in sampled thresholds
- Outcome distribution matches expectations

---

## Phase 3: Architecture Review

### T3.1: Architecture Review
**Owner:** architecture-skeptic
**Status:** Not Started
**Deliverable:** `reviews/threshold_uncertainty_architecture_YYYYMMDD.md`
**Quality Gate:** Address CRITICAL/HIGH issues before documentation

Review for:
- Performance overhead (sampling cost)
- State propagation (sampled thresholds accessible where needed)
- Memory usage (Map storage vs alternatives)
- Circular dependencies
- RNG usage (no Math.random)
- Assertion utilities (no silent fallbacks)

---

## Phase 4: Documentation & Archival

### T4.1: Wiki Documentation
**Owner:** wiki-documentation-updater
**Status:** Not Started
**Deliverable:** Updated `docs/wiki/README.md`

Document:
- Uncertainty modeling approach
- Distribution types and when to use each
- How to add uncertainty to new tipping elements
- Monte Carlo interpretation with uncertainty

### T4.2: Spec Merge & Archival
**Owner:** architect
**Status:** Not Started
**Deliverable:**
  - `openspec/specs/simulation/spec.md` (merged deltas)
  - `docs/implementation-history/threshold-uncertainty/` (archived proposal)

Finalize:
- Merge proposal deltas into simulation spec
- Archive completed proposal to implementation-history
- Update Progress Summary
- Mark M-5 as COMPLETED in roadmap

---

## Success Metrics

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Monte Carlo CV < 0.01% (determinism validated)
- [ ] No performance regression (< 1ms overhead)
- [ ] Research validation passes (Quality Gate 1)
- [ ] Architecture review passes (Quality Gate 2)
- [ ] Wiki documentation updated
- [ ] OpenSpec deltas merged
