# Research Verification: GDP Proxy Unit Fix

**Commit:** 66e516f1350cf70515d6885e1918a787a35b10fa
**Date:** Nov 23, 2025
**Files Changed:** `src/simulation/utils/recoveryCalculations.ts`

## Citation Requiring Verification

### 1. GDP Per Capita Baseline - IMF 2025

**Location:** `src/simulation/utils/recoveryCalculations.ts:175-177`
```typescript
// Global GDP per capita baseline (2025 World Bank estimate)
// ~$14,250 global average (IMF April 2025)
const GDP_PER_CAPITA_BASELINE = 14.25; // In thousands USD (so 14.25 = $14,250)
```

**Claim Made:** Global average GDP per capita is ~$14,250 (IMF April 2025)

**Verification Needed:**
- [ ] **Citation Existence:** Does IMF publish global GDP per capita data for 2025?
- [ ] **Claim Accuracy:** Is $14,250 the correct value from that source?
- [ ] **Date Accuracy:** Is "April 2025" a real publication date, or should it be earlier?

**Potential Sources:**
- IMF World Economic Outlook (April 2025 or October 2024)
- World Bank World Development Indicators
- IMF DataMapper

**Notes:**
- The code comment mentions "World Bank estimate" but then cites "IMF April 2025" - inconsistency to resolve
- Value is used to scale GDP proxy from unitless to trillions USD
- Calculation: 8B population * $14,250 per capita = ~$114T global GDP

## Calculation Verification

**Derived Value Check:**
- 8.0 billion * $14,250 = $114 trillion
- World Bank estimates global GDP 2024: ~$100-105T
- IMF 2025 projection: ~$110-115T

**Is $114T reasonable for 2025?** Yes, within expected range.

## Status

- **Created:** Nov 23, 2025 (historian auto-documentation)
- **Status:** PENDING VERIFICATION
- **Assigned To:** Research validation queue

## Action Required

1. Verify IMF/World Bank source for $14,250 global GDP per capita
2. Update code comment to cite correct source (IMF vs World Bank)
3. If value differs significantly from authoritative source, update constant
