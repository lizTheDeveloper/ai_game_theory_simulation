# Simulation Spec Delta: Threshold Uncertainty Modeling

**Change:** M-5 Threshold Uncertainty Modeling
**Target Spec:** openspec/specs/simulation/spec.md
**Type:** ADDITION (new requirement + modified tipping point behavior)

---

## ADDED: Requirement: Probabilistic Tipping Thresholds

The simulation SHALL model tipping point thresholds as probability distributions reflecting scientific uncertainty.

### Scenario: Threshold Sampling at Initialization
- WHEN a new simulation is initialized
- THEN each tipping element with defined uncertainty distribution MUST sample a threshold value
- AND sampled values MUST be stored in `state.sampledTippingThresholds`
- AND sampling MUST use the RNG function (deterministic, no Math.random)
- AND sampled values MUST remain constant throughout the run

### Scenario: Threshold Activation
- WHEN evaluating tipping point activation
- THEN the system MUST use sampled threshold (if available)
- AND fall back to baseline threshold only if distribution not defined
- AND threshold comparison MUST be deterministic (no re-sampling)

### Scenario: Distribution Types
- WHEN defining tipping element uncertainty
- THEN distribution type MUST be one of: normal, log-normal, uniform, triangular
- AND distribution parameters MUST be research-backed (2+ peer-reviewed sources)
- AND central estimate SHOULD match Armstrong McKay et al. 2022 best estimates
- AND uncertainty ranges SHOULD match IPCC AR6 WG1 consensus

### Scenario: Monte Carlo Variance
- WHEN running Monte Carlo simulations with different seeds
- THEN tipping activation timing MUST vary realistically (not identical)
- AND variance MUST be within research-backed uncertainty ranges
- AND identical seeds MUST produce identical sampled thresholds (CV < 0.01%)

---

## MODIFIED: Planetary Boundaries Modeling

### Updated Scenario: Tipping Element Thresholds (REPLACES existing)
- WHEN defining tipping element thresholds
- THEN central estimate MUST match literature consensus
- AND uncertainty distribution SHOULD be defined (type + parameters)
- AND distribution parameters MUST be justified by peer-reviewed sources
- AND fallback to deterministic threshold IS ALLOWED for backward compatibility

---

## ADDED: Distribution Sampling Utilities

### Requirement: Deterministic Distribution Sampling
The simulation SHALL provide utilities for sampling from probability distributions.

#### Scenario: Normal Distribution Sampling
- WHEN sampling from normal distribution
- THEN function MUST accept (mean, std, rng) parameters
- AND std MUST be > 0 (validated with assertion)
- AND output MUST be validated with assertFinite
- AND RNG MUST be required (no Math.random fallback)

#### Scenario: Log-Normal Distribution Sampling
- WHEN sampling from log-normal distribution
- THEN function MUST accept (meanLog, stdLog, rng) parameters
- AND stdLog MUST be > 0 (validated)
- AND output MUST be positive (log-normal produces only positive values)
- AND RNG MUST be required

#### Scenario: Uniform Distribution Sampling
- WHEN sampling from uniform distribution
- THEN function MUST accept (min, max, rng) parameters
- AND min MUST be < max (validated)
- AND output MUST be in [min, max] range
- AND RNG MUST be required

#### Scenario: Triangular Distribution Sampling
- WHEN sampling from triangular distribution
- THEN function MUST accept (min, mode, max, rng) parameters
- AND min <= mode <= max MUST be validated
- AND output MUST be in [min, max] range
- AND mode MUST be the most likely value
- AND RNG MUST be required

---

## Limitations

### Tipping Cascade Interactions NOT Modeled

**Issue:** Threshold sampling is independent across tipping elements. Armstrong McKay et al. 2022 explicitly warns that tipping elements interact (e.g., AMOC collapse lowers GrIS threshold), but M-5 does NOT model these cascading effects.

**Justification:** Interaction modeling is out of scope for M-5 (distribution sampling library). Independent sampling is a reasonable first-order approximation. Wunderling et al. 2024 shows interaction effects are modest amplification (62% → ~65-70% trigger probability), not order-of-magnitude changes.

**Future Work:** Add tipping cascade interactions using Wunderling et al. 2024 framework (separate feature, likely MEDIUM priority).

### Permafrost NOT in Threshold System

**Issue:** Nitzbon et al. 2024 (Nature Climate Change) found permafrost does NOT exhibit a global tipping point - instead showing quasilinear response to warming with local/regional thresholds.

**Resolution:** Permafrost is already modeled in `src/simulation/specificTippingPoints.ts` as a `PermafrostSystem` with continuous `thawRate`, NOT as a `TippingElement` with threshold. This is architecturally correct per 2024 research.

**Implication:** M-5 distribution sampling does NOT apply to permafrost. No architecture change needed.

### Non-Stationary Thresholds

**Issue:** Some thresholds may lower over time as systems degrade (e.g., Amazon 40% → 20-25% deforestation threshold already happened).

**Justification:** Sampling at initialization is sufficient for Monte Carlo uncertainty analysis. Across ensemble runs, some will sample lower thresholds (effectively models degradation risk). Dynamic threshold adjustment is complex and out of M-5 scope.

**Future Work:** Consider non-stationary threshold modeling if evidence emerges that threshold lowering is widespread.

---

## Implementation Notes

**Files affected:**
- NEW: `src/simulation/utils/distributions.ts` - Distribution sampling library
- MODIFIED: `src/types/tipping-points.ts` - Add `thresholdDistribution` field
- MODIFIED: `src/types/game.ts` - Add `sampledTippingThresholds` to GameState
- MODIFIED: `src/simulation/phases/tippingPoints/*` - Use sampled thresholds
- NEW: `tests/distributions.test.ts` - Unit tests
- NEW: `tests/tipping-threshold-uncertainty.test.ts` - Integration tests
- NOT AFFECTED: `src/simulation/specificTippingPoints.ts` - Permafrost already uses continuous model

**Research backing:**
- Armstrong McKay et al. 2022 - Baseline threshold estimates and uncertainty
- IPCC AR6 WG1 Chapter 4 - Consensus ranges
- 2024-2025 climate literature - Updated estimates (to be extracted by super-alignment-researcher)

**Quality Gates:**
1. Research validation (research-skeptic) - MUST PASS before implementation
2. Architecture review (architecture-skeptic) - Address CRITICAL/HIGH before merge

**Validation:**
- Monte Carlo runs (N≥10) with CV < 0.01% for determinism
- Unit test coverage for all distribution types
- Integration test coverage for tipping point activation variance
