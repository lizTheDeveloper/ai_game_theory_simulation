# Proposed: Cleanup Effectiveness Concentration Bug Fix

**Date:** December 1, 2025
**Priority:** MEDIUM (affects cleanup mechanics accuracy)
**Complexity:** 1 system
**Effort:** 1-2 hours
**Blocked By:** Monte Carlo validation (recommended but not required)

## Problem Statement

Current implementation in `energyConstrainedCleanup.ts` produces >100,000% effectiveness when cleaning concentrated waste (concentrationGap ≤ 1). This is thermodynamically backwards - concentrated cleanup should be easier (higher effectiveness), not harder.

**Bug identified by:** Cynthia (super-alignment-researcher)
**Validated by:** Sylvia (research-skeptic) - Grade B+

## Current State

**Current Formula:**
```typescript
const concentrationFactor = Math.pow(1 / concentrationGap, 0.5);
```

**When concentrationGap < 1 (concentrated waste):**
- Gap = 0.1 → factor = 10^0.5 = 3.16 (316% effectiveness) ❌
- Gap = 0.01 → factor = 100^0.5 = 10 (1000% effectiveness) ❌

**When concentrationGap > 1 (dilute waste):**
- Gap = 10 → factor = 0.1^0.5 = 0.316 (31.6% effectiveness) ✅

**Problem:** The relationship is inverted for gap ≤ 1.

## Research Foundation

**Thermodynamic Minimum Work:**
```
W_min = RT ln(1/x)
```
Where x is mole fraction (concentration).

**Key insight:** Work scales logarithmically with concentration ratio. Lower concentration (higher dilution) requires exponentially more energy.

**Real-world validation:**
- Direct Air Capture (400 ppm CO2): 200-3000 kWh/tonne
- Point-source capture (12% CO2): 65 kWh/tonne (3.8× less energy)

**Sources:** 24 peer-reviewed papers (2024-2025), see `research/cleanup_effectiveness_concentration_scaling_20251201.md`

## Proposed Solution

**Keep current exponent (0.5), fix only the gap ≤ 1 branch:**

```typescript
const concentrationFactor = concentrationGap <= 1
  ? 1.0  // Concentrated: no penalty (or slight bonus)
  : Math.pow(1 / concentrationGap, 0.5);  // Dilute: power law penalty
```

**Rationale (from research debate):**
- Cynthia recommended exponent 0.4, but this contradicts her own cited evidence (0.16-0.20 implied)
- Standard Freundlich adsorption isotherms use 0.7-1.0
- Current 0.5 is conservative middle ground
- Research debate Grade B+ supports keeping 0.5 unless Monte Carlo shows otherwise

## Alternative Approaches (for Monte Carlo sensitivity)

**Option A: Smooth transition (no threshold):**
```typescript
const concentrationFactor = Math.pow(Math.max(1, concentrationGap), 0.5);
```
Pro: No discontinuity
Con: Concentrated waste still gets full effectiveness (may be too generous)

**Option B: Variable exponent by pollution type:**
```typescript
const exponent = getPollutionTypeExponent(pollutionType); // 0.3-0.7 range
const concentrationFactor = concentrationGap <= 1
  ? 1.0
  : Math.pow(1 / concentrationGap, exponent);
```
Pro: More realistic (CO2 vs PFAS have different adsorption)
Con: Complexity, needs research per pollutant type

## Implementation Strategy

### Phase 1: Simple Fix (1h)
1. Fix gap ≤ 1 branch to return 1.0 (no penalty)
2. Keep exponent 0.5 for gap > 1
3. Add assertion to prevent >100% effectiveness
4. Write unit tests for edge cases

### Phase 2: Monte Carlo Validation (2-3h, optional)
1. Run N=20 with exponents [0.3, 0.4, 0.5, 0.6, 0.7]
2. Compare outcome distributions
3. Check for realism (mortality, pollution levels)
4. Select best exponent based on empirical fit

### Phase 3: Documentation (0.5h)
1. Update wiki with corrected formula
2. Add research citations to code comments
3. Document thermodynamic foundation

## Success Metrics

- ✅ No effectiveness >100% for any concentration gap
- ✅ Concentrated cleanup more effective than dilute
- ✅ Unit tests pass for edge cases (gap = 0.01, 0.1, 1.0, 10, 100)
- ✅ Monte Carlo outcomes realistic (if Phase 2 executed)

## Risks

**Low:**
- Localized change (one function)
- Well-researched foundation (24 sources)
- Validated by research debate (Grade B+)

**Potential issue:**
- May reduce cleanup effectiveness overall (more realistic but less optimistic)
- Could shift outcome distributions (more collapse scenarios)

**Mitigation:**
- Run Monte Carlo before/after to quantify impact
- If outcomes worsen dramatically, adjust energy budgets instead of effectiveness

## Notes

- **Blocked status:** Not truly blocked - can implement fix immediately
- **Monte Carlo recommended:** Validate exponent sensitivity before final merge
- **Research quality:** A- grade maintained (thermodynamic foundation solid)
