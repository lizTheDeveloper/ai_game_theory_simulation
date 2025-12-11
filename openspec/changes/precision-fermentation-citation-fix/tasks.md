# Precision Fermentation Citation Fix - Implementation Tasks

## Phase 1: Update Citations
**Duration:** 30 minutes

- [ ] Replace CE Delft (2021) with Poore & Nemecek (2018), Science 360(6392):987-992
- [ ] Replace FAO (2024) with Grossmann et al. (2024), Biotechnology Advances 73:108367
- [ ] Add Bouwman et al. (2013), PNAS 110(52):21199-21204
- [ ] Update effectiveness range documentation (30-50% → 25-40%)

## Phase 2: Adjust Parameters
**Duration:** 15 minutes

- [ ] Change `nitrogenReduction: 0.40` to `nitrogenReduction: 0.33`
- [ ] Update comments to reflect midpoint of 25-40% range
- [ ] Verify parameter propagation through tech tree

## Phase 3: Validation
**Duration:** 30 minutes

- [ ] Run `npx tsc --noEmit` (verify no type errors)
- [ ] Run `npm test` (verify all tests pass)
- [ ] Run Monte Carlo simulation (N=10, check ±5% variance)
- [ ] Verify nitrogen reduction effects in output

## Phase 4: Documentation
**Duration:** 15 minutes

- [ ] Update research citation in code comments
- [ ] Note parameter adjustment rationale
- [ ] Link to GitHub issue #796

## Phase 5: Commit
- [ ] Commit with message: "fix(research): Correct precision fermentation nitrogen citations (#796)"
