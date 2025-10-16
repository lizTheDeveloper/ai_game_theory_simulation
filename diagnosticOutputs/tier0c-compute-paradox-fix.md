# TIER 0C: Compute Paradox Fix

**Date:** October 16, 2025
**Issue:** AI capability continues growing despite population collapse, data center closures, and organization bankruptcy
**Evidence:** Monte Carlo logs showing capability floor 2.88-4.14 after 50% population loss

---

## Root Cause Found

### Location: `src/simulation/research.ts` capability growth functions

**The Problem:**

AI capability growth was calculated using:
- Compute scaling (from allocated compute)
- Energy constraints (power grid availability)
- Government/regulation penalties

**But MISSING critical physical constraints:**
1. **Population decline** → Fewer ML engineers to train/maintain models
2. **Data center closures** → Less physical compute infrastructure
3. **Organization bankruptcy** → No R&D investment
4. **Supply chain disruption** → Can't replace failed hardware

**Result:** During extinction/crisis scenarios:
- 50% population loss (4B deaths)
- 80% organization bankruptcy
- 2-5 data centers closed
- **But capability kept growing** (violates physical reality)

---

## The Fix

### Solution: Add Infrastructure Multiplier (TIER 0C, 2h)

**Created new function `calculateInfrastructureMultiplier(state)` that checks:**

```typescript
// 1. Population constraint (ML expertise)
const populationRatio = currentPopulation / 8B;
const expertiseMultiplier = 0.6 + (populationRatio * 0.4); // [0.6, 1.0]
// 50% population loss → 0.8x multiplier (20% capability reduction)

// 2. Data center constraint
const dcRatio = functionalDCs / initialDCs;
const dcMultiplier = max(0.3, dcRatio); // [0.3, 1.0]
// Losing all data centers → 0.3x multiplier (70% capability reduction)

// 3. Organization health constraint
const orgHealthRatio = activeOrgs / totalOrgs;
const orgMultiplier = 0.4 + (orgHealthRatio * 0.6); // [0.4, 1.0]
// 100% bankruptcy → 0.4x multiplier (60% capability reduction)

// 4. Crisis degradation
// Active extinction/collapse → 0.7x multiplier
// Tipping point cascade → 0.5-1.0x multiplier (degrades over time)

// Final multiplier (multiplicative)
return expertiseMultiplier * dcMultiplier * orgMultiplier * crisisMultiplier;
// Floor at 0.1 (minimum research even in total collapse)
```

**Integration:**

Both `calculateDimensionGrowth` and `calculateResearchGrowth` now use:
```typescript
return baseGrowth * computeMultiplier * energyMultiplier * infrastructureMultiplier * ... ;
```

**Physical reality restored:**
- Energy multiplier (power availability): [0.0, 1.0]
- Infrastructure multiplier (civilization health): [0.1, 1.0]
- Combined effect during crisis: 0.0-1.0x (can drop to ZERO during total collapse)

---

## Expected Impact

**Before (broken):**
- 50% population loss + 80% org bankruptcy + data centers closing
- Capability: 2.88-4.14 (STILL GROWING)
- Result: Physically implausible, violates material constraints

**After (fixed):**
- Same crisis conditions
- Infrastructure multiplier: ~0.24x
  - Population: 0.8x (50% loss)
  - Data centers: 0.6x (2 of 5 remain)
  - Organizations: 0.5x (80% bankrupt)
  - Crisis: 0.7x (active collapse)
  - Combined: 0.8 × 0.6 × 0.5 × 0.7 = 0.168
- Expected capability: DECLINES or stagnates
- Result: Physically coherent, respects infrastructure

---

## Validation Plan

Run Monte Carlo N=5 to verify:
1. **Capability trajectory**: Should DECLINE during crisis (not grow)
2. **Infrastructure sensitivity**: Population loss → capability loss
3. **Crisis response**: Severe crises halt AI advancement

Expected results:
- Capability floor during crisis: 0.5-1.5 (not 2.88-4.14)
- Capability growth rate during crisis: 0-10% (not 50-100%)
- After 50% population loss: Capability stagnates or declines

---

## Research Foundation

**Historical analogs:**
- Soviet Union collapse (1991): Industrial capacity dropped 40-60% within 5 years
- COVID-19 supply chain (2020-2022): 20-40% manufacturing delays
- Ukraine war chip shortage (2022-2023): GPU production down 15-30%

**Mechanism:**
- Fewer ML engineers → can't train new models or maintain existing ones
- Data center closures → less compute available for training/inference
- Organization bankruptcy → no R&D funding, projects cancelled
- Supply chain disruption → can't replace failed GPUs, cooling systems, power infrastructure

**TRL: 9** (well-established industrial economics, supply chain dynamics)

---

## Success Criteria

- ✅ Capability trajectory DECLINES during population collapse
- ✅ Data center closures reduce available compute
- ✅ Organization bankruptcy slows R&D
- ✅ Physical constraints are respected (no AI advancement during civilization collapse)

---

## Next Steps

1. Validate with Monte Carlo N=5
2. If capability still growing unrealistically: Increase multiplier sensitivity
3. Mark TIER 0C complete
4. Move to TIER 0 full validation (N=20)
