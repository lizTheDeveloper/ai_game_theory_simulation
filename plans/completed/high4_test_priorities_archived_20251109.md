# Integration Test Priority Matrix
**Date:** November 8, 2025
**Target:** >30% critical path coverage (21+ tests)
**Timeline:** 3 sprints

## Executive Summary

This matrix prioritizes 30 specific integration tests across 4 priority levels. Implementing CRITICAL and HIGH priority tests (15 tests) achieves 22.4% coverage. Adding MEDIUM priority tests (6 more) reaches 31.3% coverage, exceeding our target.

## Priority Levels

- **CRITICAL:** Must have - blocks deployment without coverage (7 tests)
- **HIGH:** Should have - significant risk if missing (8 tests)
- **MEDIUM:** Nice to have - technical debt if missing (6 tests)
- **LOW:** Optional - can defer indefinitely (9 tests)

---

## CRITICAL Priority Tests (Sprint 1 - Week 1)
**These tests MUST be implemented first. They prevent recurrence of production bugs.**

### T1: NaN Propagation Prevention Test
**Path:** Ecology → Planetary Boundaries → QoL
**Effort:** Small (4 hours)
**File:** `tests/integration/regressions/oct-2025-nan-bug.test.ts`

```typescript
test('should not use silent fallback for NaN (Oct 2025 bug)', () => {
  // Inject NaN into ecology
  state.ecology.biodiversity = NaN;

  // Must throw, not fallback to 0.005
  assert.throws(() => {
    new EcologyPhase().execute(state, rng);
  }, /Non-finite value/);
});
```

**Why Critical:** This bug stayed hidden for months causing silent calculation failures.

---

### T2: Integer Rounding Prevention Test
**Path:** AI Capabilities → Compute Growth → Agent Actions
**Effort:** Small (2 hours)
**File:** `tests/integration/regressions/critical-1-integer.test.ts`

```typescript
test('should preserve float precision in AI capabilities', () => {
  state.aiAgents[0].capabilities.physical = 3.7;

  new AICapabilityPhase().execute(state, rng);

  assert.strictEqual(state.aiAgents[0].capabilities.physical, 3.7);
});
```

**Why Critical:** Integer rounding broke capability calculations across the system.

---

### T3: RNG Determinism Test
**Path:** All phases with RNG usage
**Effort:** Medium (6 hours)
**File:** `tests/integration/regressions/critical-3-rng-required.test.ts`

```typescript
test('should require RNG parameter (no Math.random fallback)', () => {
  // Call without RNG should throw, not fallback
  assert.throws(() => {
    new StochasticPhase().execute(state, undefined);
  }, /RNG required/);
});
```

**Why Critical:** Optional RNG broke Monte Carlo determinism.

---

### T4: Object Iteration Determinism Test
**Path:** Government Actions → Policy Implementation
**Effort:** Small (3 hours)
**File:** `tests/integration/regressions/issue-11-determinism.test.ts`

```typescript
test('should iterate objects deterministically', () => {
  // Run twice with same seed
  const result1 = runWithSeed(12345);
  const result2 = runWithSeed(12345);

  assert.deepStrictEqual(result1, result2);
});
```

**Why Critical:** Non-deterministic iteration caused divergent simulations.

---

### T5: Mortality Cascade Test
**Path:** Climate → Temperature → Wet Bulb → Mortality → Population
**Effort:** Large (8 hours)
**File:** `tests/integration/cascades/climate-mortality.test.ts`

```typescript
test('should cascade extreme heat through mortality', () => {
  state.climate.wetBulbTemp = 32.0; // Above survivability

  runPhases([ClimatePhase, WetBulbPhase, MortalityPhase]);

  assert.ok(state.mortality.heatDeaths > 0);
  assert.ok(state.population < initial);
});
```

**Why Critical:** Core mechanic for climate impact modeling.

---

### T6: State Initialization Fix
**Path:** Test framework infrastructure
**Effort:** Medium (6 hours)
**File:** `tests/helpers/state-factory.ts`

```typescript
function createCompleteTestState(): GameState {
  // Ensure ALL required fields initialized
  validateStateSchema(state);
  return state;
}
```

**Why Critical:** Broken initialization blocks all other tests.

---

### T7: Nuclear Winter Cascade Test
**Path:** Nuclear Event → Temperature → Agriculture → Famine → Mortality
**Effort:** Medium (6 hours)
**File:** `tests/integration/cascades/nuclear-winter.test.ts`

```typescript
test('should cascade nuclear winter effects', () => {
  state.nuclearWar.happened = true;

  runPhases([NuclearWinterPhase, ClimatePhase, FaminePhase]);

  assert.ok(state.climate.temperature < baseline - 2.0);
  assert.ok(state.food.production < baseline * 0.5);
});
```

**Why Critical:** Extinction scenario validation.

---

## HIGH Priority Tests (Sprint 2 - Week 2)
**These tests cover high-risk cascades that could cause system failures.**

### T8: AI Suffering Cascade Test
**Path:** Suffering → Resentment → Alignment Drift
**Effort:** Medium (5 hours)
**File:** `tests/integration/cascades/ai-suffering-alignment.test.ts`

```typescript
test('should cascade AI suffering to alignment drift', () => {
  state.aiAgents[0].suffering = 0.8;

  runPhases([AISufferingPhase, AlignmentDriftPhase]);

  assert.ok(state.aiAgents[0].alignment < initial);
  assert.ok(state.aiAgents[0].resentment > 0);
});
```

---

### T9: Planetary Boundary Cascade Test
**Path:** Multiple boundaries → Tipping point → Collapse
**Effort:** Large (8 hours)
**File:** `tests/integration/cascades/planetary-boundaries.test.ts`

```typescript
test('should trigger tipping point from multiple boundaries', () => {
  // Exceed multiple boundaries
  state.climate.temperature = 18.0;
  state.ecology.biodiversity = 0.3;
  state.ocean.pH = 7.8;

  runPhases([PlanetaryBoundariesPhase, TippingPointPhase]);

  assert.ok(state.tippingPoint.triggered);
});
```

---

### T10: Economic Collapse Cascade Test
**Path:** Unemployment → Social instability → Government failure
**Effort:** Medium (5 hours)
**File:** `tests/integration/cascades/economic-collapse.test.ts`

---

### T11: Extinction Trigger Test
**Path:** Multiple crises → Extinction evaluation
**Effort:** Small (3 hours)
**File:** `tests/integration/extinction-triggers.test.ts`

---

### T12: Climate Tipping Cascade Test
**Path:** Temperature → Ice sheets → Sea level → Cities
**Effort:** Large (8 hours)
**File:** `tests/integration/cascades/climate-tipping.test.ts`

---

### T13: Food Security Collapse Test
**Path:** Climate → Agriculture → Food → Famine
**Effort:** Medium (5 hours)
**File:** `tests/integration/cascades/food-security.test.ts`

---

### T14: Emergency Response Failure Test
**Path:** Global crisis → Aid effectiveness → Cascade
**Effort:** Medium (5 hours)
**File:** `tests/integration/mortality-stabilizers.test.ts`

---

### T15: AI Collective Evolution Test
**Path:** RLHF → Traits → Collectives → Actions
**Effort:** Large (8 hours)
**File:** `tests/integration/cascades/ai-collective.test.ts`

---

## MEDIUM Priority Tests (Sprint 3 - Week 3)
**These tests address technical debt and improve coverage.**

### T16: Dystopia Lock-in Test
**Path:** Suffering metrics → Lock-in detection
**Effort:** Small (3 hours)
**File:** `tests/integration/dystopia-progression.test.ts`

---

### T17: Government Election Cascade Test
**Path:** Opinion → Election → Policy → Coordination
**Effort:** Medium (5 hours)
**File:** `tests/integration/government-elections.test.ts`

---

### T18: Technology Breakthrough Test
**Path:** Research → Discovery → Deployment → Impact
**Effort:** Medium (5 hours)
**File:** `tests/integration/technology-breakthroughs.test.ts`

---

### T19: Refugee Crisis Spiral Test
**Path:** Climate → Displacement → Conflict → More displacement
**Effort:** Small (3 hours)
**File:** `tests/integration/refugee-crisis.test.ts`

---

### T20: Freshwater Crisis Test
**Path:** Water scarcity → Agriculture → Conflict
**Effort:** Small (3 hours)
**File:** `tests/integration/freshwater-crisis.test.ts`

---

### T21: Antimicrobial Resistance Test
**Path:** Resistance → Healthcare → Pandemic vulnerability
**Effort:** Small (3 hours)
**File:** `tests/integration/antimicrobial-resistance.test.ts`

---

## LOW Priority Tests (Future Sprints - Optional)

### T22-T30: Edge Case Tests
- Rare catastrophic combinations
- Extreme parameter ranges
- Unusual phase interactions
- Performance stress tests
- UI integration tests
- Data migration tests
- Backward compatibility tests
- Localization tests
- Accessibility compliance

**Total Effort:** 40+ hours
**Value:** Low - these scenarios rarely occur in practice

---

## Coverage Analysis

### By Priority Level

| Priority | Tests | Paths Covered | Coverage % | Cumulative % |
|----------|-------|---------------|------------|--------------|
| CRITICAL | 7 | 7 | 10.4% | 10.4% |
| HIGH | 8 | 8 | 11.9% | 22.4% |
| MEDIUM | 6 | 6 | 9.0% | 31.3% |
| LOW | 9 | 9 | 13.4% | 44.8% |

### By Sprint

| Sprint | Tests | Effort | Coverage | Milestone |
|--------|-------|--------|----------|-----------|
| 1 | 7 CRITICAL | 35 hours | 10.4% | Regression prevention |
| 2 | 8 HIGH | 44 hours | 22.4% | Cascade validation |
| 3 | 6 MEDIUM | 22 hours | 31.3% | **Target achieved** |

---

## Implementation Checklist

### Sprint 1 (Week 1)
- [ ] Fix test framework (Jest → Node:test)
- [ ] Create state factory helpers
- [ ] Implement T1: NaN Propagation Test
- [ ] Implement T2: Integer Rounding Test
- [ ] Implement T3: RNG Determinism Test
- [ ] Implement T4: Object Iteration Test
- [ ] Implement T5: Mortality Cascade Test
- [ ] Implement T6: State Initialization
- [ ] Implement T7: Nuclear Winter Test
- [ ] Add to CI/CD pipeline
- [ ] Measure baseline coverage

### Sprint 2 (Week 2)
- [ ] Implement T8: AI Suffering Test
- [ ] Implement T9: Planetary Boundary Test
- [ ] Implement T10: Economic Collapse Test
- [ ] Implement T11: Extinction Trigger Test
- [ ] Implement T12: Climate Tipping Test
- [ ] Implement T13: Food Security Test
- [ ] Implement T14: Emergency Response Test
- [ ] Implement T15: AI Collective Test
- [ ] Optimize test performance
- [ ] Update coverage metrics

### Sprint 3 (Week 3)
- [ ] Implement T16: Dystopia Test
- [ ] Implement T17: Government Election Test
- [ ] Implement T18: Technology Breakthrough Test
- [ ] Implement T19: Refugee Crisis Test
- [ ] Implement T20: Freshwater Crisis Test
- [ ] Implement T21: Antimicrobial Test
- [ ] Final coverage assessment
- [ ] Documentation update
- [ ] **Celebrate 30% coverage!**

---

## Success Metrics

### Sprint 1 Success
- ✅ All CRITICAL tests passing
- ✅ CI/CD pipeline active
- ✅ 10.4% coverage achieved
- ✅ No regression bugs possible

### Sprint 2 Success
- ✅ All HIGH priority tests passing
- ✅ 22.4% coverage achieved
- ✅ Cascade failures detected
- ✅ Test execution < 5 minutes

### Sprint 3 Success
- ✅ **31.3% coverage achieved**
- ✅ All MEDIUM tests passing
- ✅ Documentation complete
- ✅ Team trained on patterns

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Tests too slow | CI/CD bottleneck | Parallelize, use sampling |
| False positives | Wasted debugging | Conservative assertions |
| Scope creep | Never reach 30% | Strict priority enforcement |
| Team resistance | Tests not maintained | Clear value demonstration |

---

## Conclusion

This priority matrix provides a clear path to achieving >30% critical path coverage in 3 weeks. By focusing on CRITICAL and HIGH priority tests first, we prevent regression of known bugs and validate high-risk cascades. The MEDIUM priority tests push us over the 30% target while addressing technical debt.

**Key Success Factor:** Maintain strict priority discipline. Complete CRITICAL tests before moving to HIGH, and HIGH before MEDIUM. This ensures maximum value delivery even if the full plan isn't completed.

---

*Next Step: Hand off to integration-test-writer agent for Sprint 1 implementation*