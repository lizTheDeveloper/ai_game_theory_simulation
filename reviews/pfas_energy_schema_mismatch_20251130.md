# PFAS Energy Requirement Schema Mismatch

**Date:** 2025-11-30 01:00 UTC
**Severity:** MEDIUM (pre-existing, not regression)
**Impact:** 11 tests failing in novel-entities-irreversibility.test.ts
**Assignee:** simulation-maintainer (Roy)

## Problem

Energy requirement validation in `energyConstrainedCleanup.ts` expects either:
- `kWhPerKg` (mass-based energy)
- `annualTWhRequired` (annual energy budget)

But `pfas_remediation` tech uses:
- `kWhPerM3` (volume-based energy)

This causes validation error: "Tech 'pfas_remediation' has energyRequirement object but neither kWhPerKg nor annualTWhRequired is defined"

## Root Cause

Schema mismatch between tech tree definition and validation logic:

**Tech Definition** (src/simulation/techTree/comprehensiveTechTree.ts:1108-1115):
```typescript
energyRequirement: {
  kWhPerM3: 420,  // Volume-based (water treatment)
  uncertaintyRange: { ... }
}
```

**Validation Logic** (src/simulation/utils/energyConstrainedCleanup.ts:92-97):
```typescript
if (tech.energyRequirement.kWhPerKg !== undefined) {
  energyReq = tech.energyRequirement.kWhPerKg;
} else if (tech.energyRequirement.annualTWhRequired !== undefined) {
  energyReq = tech.energyRequirement.annualTWhRequired;
} else {
  throw new Error(/* ... */);
}
```

## Impact

**Failing Tests:**
- `should apply PFAS cleanup with energy/concentration constraints`
- `should limit cleanup effectiveness when energy is scarce`
- `should apply microplastic capture with concentration constraints`
- `should apply rebound effects to cleanup (Jevons paradox)`
- `should return 99% of cleanup to atmosphere`
- `should show prevention is far more effective than cleanup`
- `should show layered strategy (prevention + cleanup) is best`
- `should demonstrate effectiveness improvement (0% → 20-40%)`
- `should produce identical results with same seed`
- `should produce different results with different seeds`
- `should validate all intermediate calculations`

**Status:** Tests have been failing since the energy model was added (Nov 11-12, 2025)

## Solution Options

### Option 1: Add kWhPerM3 support to validator
**Pros:** Preserves semantic correctness (water treatment IS volume-based)
**Cons:** Need to convert M3 to Kg somewhere (requires concentration/density)

### Option 2: Convert kWhPerM3 to kWhPerKg in tech definition
**Pros:** Simpler, matches existing schema
**Cons:** Loses semantic accuracy (water treatment energy is naturally volume-based)

### Option 3: Use annualTWhRequired instead
**Pros:** Bypasses unit conversion entirely
**Cons:** Less precise, harder to validate against research

## Recommendation

**Option 1** - Add kWhPerM3 support to validation logic:
1. Extend validation to accept kWhPerM3
2. Convert to effective kWhPerKg using concentration and water density
3. Update interface to document all supported energy units
4. Add tests for M3-based cleanup technologies

**Effort:** ~2-3 hours (~15-20k tokens)
**Priority:** MEDIUM (tests failing, but not blocking critical work)

## Research Context

PFAS remediation energy from Fennell et al. (2024):
- Electrochemical destruction: 370 kWh/m³
- Concentration step: 50 kWh/m³
- Total: 420 kWh/m³ (volume-based is correct semantic unit)

## Next Steps

1. Assign to simulation-maintainer (Roy) for proper energy model design
2. Consider creating unified energy requirement interface
3. Document all supported energy units in types
4. Add validation tests for each energy unit type

## References

- Tech definition: src/simulation/techTree/comprehensiveTechTree.ts:1100-1150
- Validation logic: src/simulation/utils/energyConstrainedCleanup.ts:85-120
- Failing tests: tests/integration/novel-entities-irreversibility.test.ts
- Research: Fennell et al. (2024) - PFAS electrochemical destruction
