# Optional Chaining & Nullish Coalescing Audit

**Date:** October 30, 2025
**Reviewer:** Roy3 (senior dev review)
**Scope:** Identify silent fallback patterns that mask bugs

---

## Executive Summary

**Found:** 117 `??` operators, 512 `?.` operators, 197 `|| number` patterns
**Risk Level:** MEDIUM - Some legitimate, many potentially masking bugs
**Action Required:** Review high-risk patterns in calculation code

---

## The Problem

Silent fallbacks turn **bugs into incorrect data**:

```typescript
// ❌ BAD: If monthsDeployed is undefined, you get 0 (wrong!)
const monthsDeployed = agent.monthsDeployed || 0;

// ✅ GOOD: If monthsDeployed is undefined, simulation crashes (correct!)
const monthsDeployed = assertDefined(agent.monthsDeployed, {
  location: 'updateStrategy',
  valueName: 'monthsDeployed',
  month: state.currentMonth
});
```

**Why this matters:** The Oct 24-30 Monte Carlo issues were ALL caused by silent fallbacks hiding NaN/undefined bugs for months.

---

## Pattern Categories

### 1. SAFE Uses (Legitimate)

```typescript
// ✅ SAFE: Optional chaining for existence checks
if (state.extinctionState?.active) { ... }

// ✅ SAFE: Nullish coalescing for display/UI
const displayName = agent.name ?? 'Unknown';

// ✅ SAFE: Initialization with explicit defaults
function initializeSystem(): SystemState {
  return {
    value: 0,  // Explicit default, documented
    enabled: false
  };
}
```

### 2. RISKY Uses (Calculation Fallbacks)

```typescript
// 🚨 RISKY: Calculation with fallback (hides NaN bugs)
const growth = (currentValue - previousValue) || 0;

// 🚨 RISKY: State property with fallback (masks missing initialization)
const temperature = state.climate.temperature ?? 15.0;

// 🚨 RISKY: Derived value with fallback (hides upstream bugs)
const capability = ai.capabilityProfile?.cognitive || ai.capability * 0.3;
```

### 3. DANGEROUS Uses (Bug Masking)

```typescript
// ❌ DANGEROUS: Undefined from calculation gets masked
const metric = calculateEnvironmentalMetric(state) ?? 50;
// If calculateEnvironmentalMetric returns NaN, you get 50 (WRONG!)

// ❌ DANGEROUS: Missing required field gets default
const displacedPopulation = crisis.displacedPopulation ?? 0;
// If crisis is malformed, you get 0 refugees (DATA CORRUPTION!)

// ❌ DANGEROUS: Circular dependency masked
const ecology = state.paradigmTrajectory?.ecological ?? 50;
// If paradigm never initialized, entire timeline shows 50 (SILENT FAILURE!)
```

---

## High-Risk Areas to Audit

Based on patterns and recent bugs, prioritize these files:

### Priority 1: Calculation Functions
- `src/simulation/calculations.ts` - Core metrics
- `src/simulation/qualityOfLife/dimensions.ts` - QoL calculations
- `src/simulation/paradigms/aggregator.ts` - Paradigm scoring
- `src/simulation/bayesianMortality.ts` - Death calculations

**Search for:** `?? [0-9]` or `|| [0-9]` in arithmetic operations

### Priority 2: State Updates
- `src/simulation/agents/aiAgent.ts` - AI agent updates
- `src/simulation/lifecycle.ts` - Population dynamics
- `src/simulation/refugeeCrises.ts` - Migration calculations

**Search for:** `.property ?? defaultValue` where property should always exist

### Priority 3: Snapshot/Export
- Anywhere creating snapshots or exporting data
- Issues 7-8 were caused by missing fields defaulting to null

---

## Audit Checklist

For each `??` or `|| defaultValue` found:

1. **Is this a calculation?**
   - YES → Replace with assertion
   - NO → Continue to #2

2. **Should this property always exist?**
   - YES → Replace with assertion
   - NO → Continue to #3

3. **Is this initialization code?**
   - YES → Explicit default is OK (document why)
   - NO → Continue to #4

4. **Is this display/UI code?**
   - YES → Fallback is OK for user-facing strings
   - NO → **RISKY - needs review**

---

## Recommended Fixes

### Replace Calculation Fallbacks

```typescript
// Before:
const growth = (newValue - oldValue) || 0;

// After:
const growth = assertFinite(newValue - oldValue, {
  location: 'calculateGrowth',
  valueName: 'growth',
  month: state.currentMonth,
  additionalInfo: { newValue, oldValue }
});
```

### Replace State Property Fallbacks

```typescript
// Before:
const pH = state.oceanHealth.pH ?? 8.1;

// After:
const pH = assertStateProperty(state.oceanHealth, 'pH', {
  location: 'applyOceanTech',
  month: state.currentMonth
});
```

### Replace Derived Value Fallbacks

```typescript
// Before:
const cognitive = ai.capabilityProfile?.cognitive || ai.capability * 0.3;

// After:
const cognitive = ai.capabilityProfile?.cognitive
  ?? assertFinite(ai.capability * 0.3, {
    location: 'getDerivedCapability',
    valueName: 'cognitive',
    additionalInfo: { aiId: ai.id, capability: ai.capability }
  });
```

---

## Systematic Cleanup Plan

**Phase 1: Stop Adding New Ones** (immediate)
- Add ESLint rule to warn on `?? number` in calculation files
- Code review checklist: "Does this fallback hide a bug?"

**Phase 2: Fix High-Risk Areas** (next 2 weeks)
- Audit Priority 1 files (calculations)
- Replace dangerous patterns with assertions
- Test with Monte Carlo runs

**Phase 3: Comprehensive Cleanup** (next month)
- Audit Priority 2-3 files
- Document legitimate uses (with comments explaining why)
- Create migration guide for team

---

## Estimated Impact

**Files with risky patterns:** ~30-40 files
**Patterns to review:** ~100-150 instances
**Time to audit:** 6-10 hours
**Time to fix:** 10-15 hours

**Benefit:** Catch bugs at source instead of in Monte Carlo validation (weeks later)

---

## Example Bugs Prevented

If we'd had this pattern earlier, we would have caught:

1. **Issue-2 (Biosphere 16x):** `?? 50` fallback masked NaN from geometric mean
2. **Issue-3 (Outcome classification):** `|| 'unknown'` hid null paradigm scores
3. **Issue-7 (Population null):** `?? null` in snapshot export
4. **Issue-8 (Biosphere null):** `?? null` in snapshot export

**All were silent fallbacks hiding upstream bugs.**

---

## Next Steps

1. ✅ Document the problem (this file)
2. 🔜 Add ESLint rule (prevent new ones)
3. 🔜 Audit Priority 1 files (calculations)
4. 🔜 Create tracking issue for systematic cleanup
5. 🔜 Add to development workflow guide

---

**Related:**
- `/docs/CLAUDE.md` - "Defensive Programming Anti-Patterns" section
- `/src/simulation/utils/assertions.ts` - Assertion utilities to use instead
- `/logs/monte_carlo_issues_20251029.md` - Bugs caused by silent fallbacks
