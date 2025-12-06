# Radiation System Test Coverage

**Created:** December 2, 2025
**Priority:** LOW
**Effort:** 2-3 hours

---

## Rationale

`src/types/radiation.ts` has 59.60% test coverage with 0 test files. Gaps include lines 42-65, 68-69, 75-138, 141-156, 162-183, 186-188, 192-199, 202-205.

**Exported surface:**
- `RadiationExposureEvent` interface (17 properties)
- `RadiationSystem` interface (12 properties)
- 9 functions: initialize, create, progress, isActive, update, trigger, getStats

---

## Scope

Create comprehensive unit tests for radiation system covering:
1. Initialization and default state
2. Exposure creation (dose calculations, spatial distribution, source types)
3. Progression (half-life decay, population impacts, health effects)
4. System updates (multi-exposure tracking, active/inactive transitions)
5. Edge cases (zero dose, extreme values, concurrent exposures)

**Target:** Coverage >90% (lines 42-205)

---

## Success Criteria

1. Test file created: `src/types/radiation.test.ts`
2. 15+ tests covering all exports
3. Coverage >90% for radiation.ts
4. Research-backed dose calculations validated:
   - Cs-137 half-life: 30.17 years
   - I-131 half-life: 8.02 days
   - Linear no-threshold (LNT) dose-response

---

## Sources

- Coverage report: `docs/underdocumented.json`
- Radiation half-life data (Cs-137, I-131)
- Linear no-threshold (LNT) model for dose-response
