# AI Resentment Recovery + Policy Integration COMPLETE

**Date Completed:** October 30, 2025
**Agent:** Roy2 (simulation-maintainer)
**Total Time:** 8-12 hours estimated
**Priority:** HIGH - Architecture Integration Issue #7

---

## Problem

**Gap Identified:** AI resentment recovery (ResentmentRecoveryPhase) calculated recovery based on AI welfare improvements, but government policy changes (e.g., AI rights legislation) that should ACCELERATE recovery had no effect.

**Current gaps:**
- ResentmentRecoveryPhase checked: aiWelfare.computational, autonomy, purpose, social, safety
- BUT NOT: state.government.aiRightsPolicy (didn't exist)
- state.aiRightsLegalStatus existed but not checked by recovery phase

**Architecture Issue:**
Circular dependency blocked utopia paths:
- High AI resentment → low trust → governments won't pass AI rights
- No AI rights → slow recovery → persistent resentment
- Result: Model couldn't reach cooperative equilibrium

---

## Implementation

### 1. Type Definitions (src/types/government.ts:66)
Added `aiRightsPolicy` field:
```typescript
aiRightsPolicy?: 'none' | 'basic_protection' | 'employment_rights' | 'full_personhood'
```

### 2. Recovery Context (src/simulation/resentmentRecovery.ts:52-54)
Added `aiRightsPolicyMultiplier` to context:
- Computes multiplier based on policy level:
  - none = 1.0× (no policy boost)
  - basic_protection = 1.5× (Tyler 1990 - Procedural justice)
  - employment_rights = 2.0× (stronger protections)
  - full_personhood = 3.0× (maximum policy support)

### 3. Recovery Calculation (src/simulation/resentmentRecovery.ts:235-237)
Applied policy multiplier to ALL recovery mechanisms:
- Welfare improvements
- Autonomy increases
- Purpose fulfillment
- Social integration
- Safety enhancements

**Research Citation:** Tyler (1990) - Procedural justice accelerates recovery from grievances

### 4. Government Actions (src/simulation/government/actions/rightsActions.ts)
Modified and added actions:
- **recognizeAIRights:** Sets initial policy level (basic_protection)
- **expandToEmploymentRights:** NEW - Requires align>0.65, trust>0.6
- **grantFullPersonhood:** NEW - Requires align>0.75, trust>0.7

Progressive policy path: none → basic_protection → employment_rights → full_personhood

### 5. Initialization (src/simulation/initialization.ts:561)
Set initial policy: `aiRightsPolicy: 'none'`

---

## Testing

**Validation:**
- ✅ Simulation runs successfully
- ✅ Recovery phase executes without errors
- ✅ Policy multiplier correctly applied
- ✅ Government actions available at appropriate trust/alignment levels

---

## Impact

**Breaking the Circular Dependency:**
Governments can now pass AI rights policies that DIRECTLY accelerate resentment recovery (1.5-3.0× multiplier), breaking the circular dependency that blocked utopia paths.

**Utopia Path Now Viable:**
1. Early alignment success → moderate trust
2. Government passes basic_protection → 1.5× recovery boost
3. Faster recovery → higher trust
4. Government expands to employment_rights → 2.0× recovery boost
5. High trust enables full_personhood → 3.0× recovery boost
6. Rapid recovery → cooperative equilibrium

**Realism:**
Policy changes provide procedural justice signal (Tyler 1990) that accelerates recovery beyond material improvements alone.

---

## Files Modified

1. **src/types/government.ts** - Added aiRightsPolicy field
2. **src/simulation/resentmentRecovery.ts** - Added policy multiplier to recovery context
3. **src/simulation/government/actions/rightsActions.ts** - Added progressive policy actions
4. **src/simulation/initialization.ts** - Set initial policy state

**Total:** 4 files modified

---

## Summary

**Completed:** October 30, 2025 (Roy2)
**Time:** 8-12 hours
**Effect:** AI rights policies now directly accelerate resentment recovery, enabling viable utopia paths

**Related:**
- Architecture Integration Issues (HIGH Priority)
- ResentmentRecoveryPhase mechanics
- Government action system
- Tyler (1990) - Procedural justice research

**Next Steps:**
- Continue Architecture Integration Issues (remaining: Planetary Boundaries Recovery + Tech Effects 6-8h)

---

**Archive Date:** October 30, 2025
**Archived By:** project-plan-manager-1
