# CRITICAL-4: Defensive Fallback Audit
**Date:** 2025-11-07
**Auditor:** Roy (simulation-maintainer)

## Summary
- **Total fallbacks found:** 131 (in src/simulation/)
- **Top-level files:** 60
- **Phase files:** ~71

## Categorization Criteria

### INIT (Initialization - OK to keep)
- Setting defaults when creating new objects/state
- Configuration parameter defaults in constructors
- First-time initialization of optional fields

### COMPAT (Compatibility - OK to keep)
- Reading from optional type fields with clear default semantics
- Backward compatibility with older save states
- UI display fallbacks (not in calculation paths)

### CALC (Calculation - MUST REMOVE)
- Hot path calculations using fallbacks
- State property reads in simulation logic
- Any fallback that could hide a NaN/undefined bug

---

## File-by-File Analysis

### resentmentRecovery.ts (8 instances)

**Line 74:** `const trustInvestment = (state.government.socialCohesionInvestment ?? 0) / 100;`
- **Type:** `socialCohesionInvestment?: number` (OPTIONAL field)
- **Category:** COMPAT (optional field with clear default semantic)
- **Action:** KEEP (government may not invest, 0 is valid)

**Line 101:** `const monthsSinceLastControl = state.currentMonth - (state.government.lastControlIncreaseMonth ?? 0);`
- **Type:** `lastControlIncreaseMonth?: number` (OPTIONAL field)
- **Category:** COMPAT (undefined = never increased control = month 0)
- **Action:** KEEP (valid semantic)

**Line 106:** `const policyLevel = state.government.aiRightsPolicy ?? 'none';`
- **Type:** `aiRightsPolicy?: string` (OPTIONAL field)
- **Category:** COMPAT (optional field, 'none' is valid default)
- **Action:** KEEP

**Line 139:** `const decisionQuality = state.government.governanceQuality?.decisionQuality ?? 0.5;`
- **Type:** `governanceQuality` is REQUIRED, properties inside might not be initialized
- **Category:** CALC (hot path, should be initialized properly)
- **Action:** REPLACE with assertion

**Line 140:** `const participationRate = state.government.governanceQuality?.participationRate ?? 0.5;`
- **Type:** Same as above
- **Category:** CALC (hot path)
- **Action:** REPLACE with assertion

**Line 350:** `const previousControl = state.government.previousControlLevel ?? currentControl;`
- **Type:** `previousControlLevel?: number` (OPTIONAL field)
- **Category:** COMPAT (undefined = use current, valid semantic)
- **Action:** KEEP

**Line 363:** `const previousControl = state.government.previousControlLevel ?? currentControl;`
- **Category:** COMPAT (duplicate of line 350)
- **Action:** KEEP

**Line 415-416:** `const hasAIRights = aiRights?.completed ?? false;`
- **Type:** Optional chaining on breakthrough tech lookup result
- **Category:** COMPAT (tech might not exist yet)
- **Action:** KEEP

**RESENTMENT RECOVERY VERDICT:** 2 CALC to replace (lines 139-140)

---

### organizationManagement.ts (3 instances)

**Line 384:** `const workforceMultiplier = org.workforceMultiplier ?? 1.0;`
- **Type:** `workforceMultiplier?: number` (OPTIONAL, 1.0 = full staff)
- **Category:** COMPAT (clear default semantic)
- **Action:** KEEP

**Line 753-754:** Same as above (2 more instances)
- **Action:** KEEP

**ORG MANAGEMENT VERDICT:** 0 CALC to replace

---

### engine.ts (8 instances)

**Lines 462-468:** All config parameter defaults
- **Category:** INIT (setting defaults in constructor)
- **Action:** KEEP ALL

**Lines 737-739, 771:** Config/stopConditions parameter defaults
- **Category:** INIT (runtime config defaults)
- **Action:** KEEP ALL

**ENGINE VERDICT:** 0 CALC to replace (all INIT)

---

### Other Files Needing Review

Continuing analysis...

