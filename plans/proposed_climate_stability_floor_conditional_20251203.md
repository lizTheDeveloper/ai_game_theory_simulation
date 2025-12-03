# HIGH-7: Conditional Climate Stability Floor

**Priority:** HIGH
**Created:** 2025-12-03
**Source:** Session 51 research validation (research debate)
**Status:** DEFERRED (token conservation mode)

## Problem Statement

The current 5% climate stability floor in `ClimateSystemPhase.ts` creates systematic optimistic bias in tail scenarios:

1. **Contradicts 83% of peer-reviewed research** (5/6 papers)
2. **Wunderling et al. 2024** shows "many tipping interactions are DESTABILIZING" (opposite of self-limiting)
3. **Prevents simulation from showing true cascade risk** in worst-case scenarios
4. **Documentation now honest** (D- research grade, labeled "implementation choice")

### Current Implementation

```typescript
// ClimateSystemPhase.ts (approximate location)
const stabilityFactor = Math.max(0.05, calculatedStability);
```

This prevents climate stability from falling below 5%, even when research suggests cascades could drive it much lower.

## Proposed Solution

**Apply the 5% floor CONDITIONALLY based on governance success:**

### Option A: Paris Agreement Success Gate
```typescript
// Apply floor ONLY when Paris Agreement targets are being met
const parisSuccess = state.globalTemperatureAnomaly < 1.5;
const stabilityFloor = parisSuccess ? 0.05 : 0.0;
const stabilityFactor = Math.max(stabilityFloor, calculatedStability);
```

### Option B: Tipping Point Threshold
```typescript
// Apply floor ONLY when fewer than 3 tipping points crossed
const tippingsCrossed = countCrossedTippings(state);
const stabilityFloor = tippingsCrossed < 3 ? 0.05 : 0.0;
const stabilityFactor = Math.max(stabilityFloor, calculatedStability);
```

### Option C: Gradual Floor Decay
```typescript
// Floor decays as more tipping points are crossed
const tippingsCrossed = countCrossedTippings(state);
const stabilityFloor = Math.max(0.0, 0.05 - (0.015 * tippingsCrossed));
const stabilityFactor = Math.max(stabilityFloor, calculatedStability);
```

## Research Foundation

**Supporting Research (83% consensus):**
- Wunderling et al. 2024: "Many tipping interactions are destabilizing"
- Armstrong McKay et al. 2022: Tipping risk at 1.5-2C
- Lenton et al. 2023: Cascades cannot be ruled out
- Steffen et al. 2018: Hothouse Earth pathways
- Rockström et al. 2009: Planetary boundaries framework

**Contradicting Research (17%):**
- None found that directly supports a 5% self-limiting floor

**Current Documentation:** D- research grade (fixed in Session 49)

## Implementation Steps

### Phase 1: Research & Validation (Quality Gate 1)
1. Verify Wunderling et al. 2024 findings
2. Cross-check against IPCC AR6 WG1
3. Identify which scenario justifies floor (if any)
4. Get research-skeptic approval

### Phase 2: Implementation
1. Add conditional logic to ClimateSystemPhase.ts
2. Update stabilityFactor calculation
3. Add assertions to prevent NaN
4. Update inline comments with research citations

### Phase 3: Testing
1. Unit tests for conditional floor logic
2. Monte Carlo validation (N≥10)
3. Compare outcomes with/without floor
4. Verify tail scenarios show realistic collapse

### Phase 4: Architecture Review (Quality Gate 2)
1. Performance check (no O(n²) added)
2. State propagation verification
3. Address CRITICAL/HIGH issues

### Phase 5: Documentation
1. Update wiki with new mechanism
2. Document research justification
3. Update CLAUDE.md if needed

## Expected Impact

### Behavior Changes
- **Paris success scenarios:** No change (floor still applies)
- **Paris failure scenarios:** Climate can collapse below 5%
- **Cascade scenarios:** Model can show true tail risk

### Outcome Distribution
- **Utopia/Status Quo:** Unchanged
- **Managed Decline:** Unchanged
- **Collapse/Extinction:** Increased realism in tail scenarios

## Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Too pessimistic | Low | Medium | Gate on Paris targets (validated predictor) |
| Breaks existing calibration | Medium | High | Monte Carlo validation before merge |
| Numerical instability | Low | High | Assertion utilities prevent NaN |

## Effort Estimate

- **Research:** 1-2 hours (already done in Session 51)
- **Implementation:** 2-4 hours
- **Testing:** 2-3 hours (Monte Carlo N=10)
- **Review:** 1-2 hours
- **Total:** ~8-11 hours (1-2 sessions)

## Success Criteria

1. ✅ Conditional floor implemented with research justification
2. ✅ Monte Carlo validation shows realistic tail scenarios
3. ✅ No NaN/Infinity regressions
4. ✅ Architecture review passes (B+ or better)
5. ✅ Wiki documentation updated

## Related Work

- **M-4 to M-7:** Missing climate systems (compound events, hysteresis, etc.)
- **HIGH-4:** Technology bifurcation investigation (completed)
- **CRITICAL-1:** Hindcast validation (completed)

## References

1. Wunderling et al. 2024 - Tipping point interactions and cascades
2. Armstrong McKay et al. 2022 - Climate tipping points
3. Session 51 research debate: `reviews/climate_stability_floor_debate_20251203.md`
4. Session 51 validation: `research/research_validation_session_51_20251203.md`
