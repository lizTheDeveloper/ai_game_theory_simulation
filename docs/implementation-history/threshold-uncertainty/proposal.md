# Threshold Uncertainty Modeling (M-5)

**Created:** December 7, 2025
**Author:** orchestrator-1
**Priority:** MEDIUM
**Effort:** 3-4 days

---

## Rationale

Current tipping point thresholds are deterministic (e.g., AMOC triggers at exactly +2.0°C), but climate science literature shows these thresholds have significant uncertainty ranges. This creates unrealistic precision in the model.

**Real-world uncertainty (Armstrong McKay et al. 2022, Nature Climate Change):**
- AMOC collapse: 1.4-8.0°C uncertainty range (central: 4.0°C)
- Greenland ice sheet: 0.8-3.0°C (central: 1.5°C)
- Amazon dieback: 2.0-6.0°C (central: 3.5°C)
- West Antarctic Ice Sheet: 1.0-3.0°C (central: 1.5°C)

**Current limitation:** Deterministic thresholds don't capture this uncertainty, leading to unrealistic step-function behavior in Monte Carlo runs.

---

## Scope

Create a distribution sampling library for probabilistic tipping point thresholds. Each simulation run samples threshold values from research-backed uncertainty distributions.

**Affected systems:**
- New: `src/simulation/utils/distributions.ts` - Distribution sampling library
- Modified: `src/types/tipping-points.ts` - Add uncertainty fields to threshold definitions
- Modified: `src/simulation/phases/tippingPoints/` - Use sampled thresholds instead of fixed values
- GameState - Add sampled threshold tracking (for determinism)

**Distribution types needed:**
- Normal distribution (for symmetric uncertainty)
- Log-normal distribution (for skewed, positive-only values)
- Uniform distribution (for bounded ranges with no central tendency)
- Triangular distribution (for expert-elicited min/mode/max estimates)

---

## Success Criteria

1. **Functional:**
   - Each simulation run samples unique threshold values (within research ranges)
   - Sampled thresholds remain constant throughout a single run (deterministic)
   - Monte Carlo runs show realistic variance in tipping activation timing
   - Coefficient of variation validates determinism (CV < 0.01% for same seed)

2. **Research:**
   - 2+ peer-reviewed sources (2024-2025) for each major tipping element
   - Uncertainty distributions match literature (normal/log-normal/triangular/uniform)
   - Central estimates match Armstrong McKay et al. 2022 best estimates
   - Uncertainty ranges validated against IPCC AR6 WG1

3. **Performance:**
   - Distribution sampling overhead < 1ms per simulation initialization
   - No performance regression in phase execution
   - Monte Carlo runs complete within existing time budgets

4. **Architecture:**
   - No circular dependencies
   - Assertion utilities used (no silent fallbacks)
   - Deterministic RNG (no Math.random)
   - State propagation validated

---

## Sources

- Armstrong McKay et al. 2022, *Nature Climate Change* - Tipping element thresholds and uncertainty ranges
- IPCC AR6 WG1 Chapter 4 - Future Global Climate
- Lenton et al. 2019, *Nature* - Climate tipping points — too risky to bet against
- Wunderling et al. 2024 - Tipping point interactions

**Research Task:** super-alignment-researcher to find 2024-2025 updates and extract specific distributions for each tipping element.

---

## Implementation Plan

### Phase 1: Research & Validation (Quality Gate 1)
1. super-alignment-researcher: Extract uncertainty distributions from climate literature
2. research-skeptic: Validate methodology and parameter extraction

### Phase 2: Implementation
1. Create distribution sampling library with 4+ distribution types
2. Integrate with tipping point system (initialization + state tracking)
3. Unit tests for each distribution type
4. Integration tests with tipping point phases
5. Monte Carlo validation (N≥10, CV < 0.01%)

### Phase 3: Architecture Review (Quality Gate 2)
1. architecture-skeptic: Performance analysis, state propagation validation
2. Address CRITICAL/HIGH issues

### Phase 4: Documentation & Archival
1. wiki-documentation-updater: Update wiki with uncertainty modeling
2. architect: Merge deltas into OpenSpec, archive to implementation-history

---

## Related Work

- **M-4:** Monte Carlo Sensitivity Analysis (completed) - provides validation framework
- **Missing Climate Systems:** Tipping point interactions (future work)
- **Energy Budget Constraints:** Shows pattern for constraint systems
