# Crisis Mitigation Mechanics Implementation Brief

**Date:** October 30, 2025
**Agent:** simulation-maintainer
**Status:** Research validated, ready for implementation
**Priority:** MEDIUM (post-consensus)

## Research Consensus

**Source:** `.claude/chatroom/research-consensus-20251029_163600.txt`
**Participants:** Cynthia (super-alignment-researcher), Sylvia (research-skeptic)
**Outcome:** CONSENSUS REACHED - Implementation approved with modified parameters

### Key Compromises Made

Cynthia downgraded parameters from aggressive (30%) to conservative (5%) after Sylvia's critique:
- Removed fabricated Brookings citation
- Added rebound effects for participatory governance
- Used historical New Deal rates instead of speculative 30% instant recovery

## Three Mechanics to Implement

### 1. Automatic Stabilizers

**Effect:** 5% unemployment variance reduction (down from 30%)
**Research Foundation:** GAO 2025 (framework validation)
**Mechanism:** Countercyclical fiscal policy (progressive tax + UI + SNAP + Medicaid)

**Implementation Notes:**
- Apply to unemployment calculations in UnemploymentPhase or calculations.ts
- Reduce variance/volatility, not absolute level
- Add TODO comment: "Need CBO fiscal multiplier VARIANCE data for empirical calibration"
- Research gap: Need variance effects, not just level effects

**Code Comment Template:**
```typescript
// Automatic Stabilizers (Crisis Mitigation Mechanics, Oct 30, 2025)
// Research: GAO 2025 validates countercyclical mechanism framework
// Effect: 5% unemployment variance reduction (conservative estimate)
// TODO: Replace with CBO fiscal multiplier variance data when available
// Mechanism: Progressive tax + UI + SNAP + Medicaid auto-adjust with economic conditions
```

### 2. Participatory Governance

**Effect:** 5% resentment reduction (base case) OR +15% resentment increase (backfire)
**Research Foundation:**
- Cambridge Core 2024 (minipublics)
- PMC 2022 (municipal participatory budgeting)
- vTaiwan (national-scale digital democracy)

**Scale Caveat:** Evidence is local (10K-1M participants), application is global (100M-8B)

**Implementation Notes:**
- Integrate with resentmentRecovery.ts system
- Add backfire condition: If expectations unmet (e.g., participation invited but recommendations ignored)
- Trigger: Government quality above threshold AND democratic features active
- Add explicit scale documentation

**Code Comment Template:**
```typescript
// Participatory Governance (Crisis Mitigation Mechanics, Oct 30, 2025)
// Research: Cambridge 2024 (minipublics), PMC 2022 (municipal budgeting), vTaiwan
// Base effect: 5% resentment reduction when functioning
// Backfire effect: +15% resentment increase if expectations unmet
// SCALE CAVEAT: Evidence from 10K-1M participants, extrapolating to 100M-8B
// Document: "Scaling local evidence to national/global context - hypothesis to test"
```

**Backfire Conditions (choose one or combine):**
- Participation invited but government ignores recommendations
- Democratic quality drops while participatory structures remain
- Trust in government falls below threshold
- Resentment increases despite participation being active

### 3. Homeostatic Bounds

**Effect:** 2.75 percentage points per year unemployment recovery (monthly: ~0.23 pp/month)
**Research Foundation:** New Deal historical data (1933-1937: 24.9% → 14.3% unemployment over 4 years)
**Purpose:** Prevent 95% unemployment edge cases, NOT calibrated mechanism

**Implementation Notes:**
- Apply when unemployment is very high (e.g., >40%)
- Use historical rate: 2.75 pp/year ≈ 0.229 pp/month
- Not a mechanism, just plausible bounds
- Add explicit "plausible bounds" documentation

**Code Comment Template:**
```typescript
// Homeostatic Unemployment Bounds (Crisis Mitigation Mechanics, Oct 30, 2025)
// Research: New Deal recovery 1933-1937 (24.9% → 14.3% over 4 years = 2.75 pp/year)
// Monthly rate: 2.75 / 12 ≈ 0.229 percentage points per month
// Purpose: Prevent simulation edge cases (95% unemployment), NOT calibrated mechanism
// Document: "Historical precedent bounds, not empirically calibrated"
```

## Implementation Checklist

**Phase 1: Automatic Stabilizers**
- [ ] Locate unemployment calculation code (UnemploymentPhase.ts, calculations.ts)
- [ ] Add variance reduction logic (5% damping of fluctuations)
- [ ] Add research citation comment (GAO 2025)
- [ ] Add TODO for CBO variance data
- [ ] Use assertion utilities to validate output
- [ ] Test: Verify unemployment fluctuations are dampened ~5%

**Phase 2: Participatory Governance**
- [ ] Locate resentment recovery code (resentmentRecovery.ts)
- [ ] Add base effect: 5% resentment reduction when conditions met
- [ ] Add backfire logic: +15% resentment if expectations unmet
- [ ] Add research citations (Cambridge 2024, PMC 2022, vTaiwan)
- [ ] Add scale caveat documentation
- [ ] Use assertion utilities to validate output
- [ ] Test: Verify both positive and negative effects trigger

**Phase 3: Homeostatic Bounds**
- [ ] Locate unemployment update code
- [ ] Add conditional recovery when unemployment >40%
- [ ] Use historical rate: 0.229 pp/month
- [ ] Add research citation (New Deal 1933-1937)
- [ ] Add "plausible bounds" documentation
- [ ] Use assertion utilities to validate output
- [ ] Test: Verify 95% unemployment scenarios recover toward 40-60%

**Phase 4: Integration Testing**
- [ ] Add integration tests for all three mechanics
- [ ] Verify mechanics don't conflict
- [ ] Check assertion utilities catch invalid values
- [ ] Test edge cases (very high unemployment, very high resentment)

## Quality Requirements (Non-Negotiable)

**Sylvia's quality gates (ALL MUST PASS):**
- ✅ Fabricated claims removed (no Brookings 20-30%)
- ✅ Parameters downgraded to conservative values (5% not 30%)
- ✅ Uncertainties explicitly documented (TODO comments)
- ✅ Rebound effects included (participatory backfire)
- ✅ Research gaps identified for future work

**Defensive coding standards:**
- Use assertion utilities (assertFinite, assertInRange, assertProbability)
- No silent fallbacks (fail loudly if invalid values)
- Validate all calculated values before assignment
- Add context to assertions (month, location, inputs)

## Files Likely Affected

**Primary files:**
- `src/simulation/engine/phases/UnemploymentPhase.ts` - automatic stabilizers, homeostatic bounds
- `src/simulation/calculations.ts` - unemployment calculation
- `src/simulation/resentmentRecovery.ts` - participatory governance

**Possible integration points:**
- `src/simulation/government/actions/economicActions.ts` - fiscal policy
- `src/simulation/engine/phases/DemocracyDynamicsPhase.ts` - participatory structures
- Government quality metrics (if needed for triggers)

## Success Criteria

**Implementation complete when:**
1. All three mechanics implemented with conservative parameters
2. Research citations in code comments (GAO 2025, Cambridge 2024, PMC 2022, New Deal data)
3. TODO comments for uncertain parameters
4. Backfire logic for participatory governance
5. Assertion utilities validate all outputs
6. No TypeScript errors
7. Code compiles successfully

**Next Phase:** Monte Carlo validation (N=10 minimum)

## Remaining Uncertainties (Document These)

1. Fiscal multiplier variance effects (level vs variance stabilization)
2. National-scale participatory governance effectiveness (Taiwan vTaiwan closest precedent)
3. Cross-country variation in automatic stabilizer strength (US weak, Nordic strong)

## Time Estimate

**2-3 hours** (consensus estimate from research phase)
