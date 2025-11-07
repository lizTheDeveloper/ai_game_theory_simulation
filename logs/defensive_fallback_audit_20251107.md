# Defensive Fallback Audit - Nov 7, 2025

**Context:** CRITICAL-4 regression - defensive fallbacks remain despite WEEK 2 "complete" cleanup claims.

**Methodology:**
1. Search for `?? value` and `|| value` patterns in src/simulation/*.ts
2. Categorize by risk: CRITICAL (calculations), HIGH (state access), MEDIUM (initialization), LOW (UI/display)
3. Replace CRITICAL/HIGH with assertion utilities

## Results

### Nullish Coalescing (??) Usage

**Total occurrences:** 49 in src/simulation/*.ts

**Category breakdown:**

#### CRITICAL - Calculations Using Fallback Values (MUST FIX)
These hide NaN/undefined bugs in active calculations. Like the Oct 2025 ecology pH bug.

| File | Line | Code | Risk | Fix |
|------|------|------|------|-----|
| TBD | TBD | TBD | TBD | TBD |

#### HIGH - State Access Without Validation (SHOULD FIX)
State properties that might be undefined but are used in logic.

| File | Line | Code | Risk | Fix |
|------|------|------|------|-----|
| aiSuffering.ts | 187 | `state.aiSufferingMetrics?.publicAwarenessOfSuffering ?? 0` | HIGH | Use assertStateProperty or ensure initialization |
| aiSuffering.ts | 219 | `state.aiSufferingMetrics?.publicAwarenessOfSuffering ?? 0` | HIGH | Use assertStateProperty |
| aiSuffering.ts | 409 | `state.aiSufferingMetrics?.avgSuffering ?? 0` | HIGH | Use assertStateProperty |
| aiWelfare.ts | 64 | `state.aiWelfare?.consistency ?? 0.8` | HIGH | Use assertStateProperty |
| calculations.ts | 584 | `society.paranoiaLevel ?? 0.15` | HIGH | Use assertStateProperty |
| dystopiaProgression.ts | 285 | `state.qualityOfLifeSystems?.autonomy ?? 1.0` | HIGH | Use assertStateProperty |
| dystopiaProgression.ts | 289 | `state.qualityOfLifeSystems?.politicalFreedom ?? 1.0` | HIGH | Use assertStateProperty |
| bayesianNuclearRisk.ts | 274 | `state.nuclearStates ?? []` | HIGH | Use assertNonEmpty or ensure init |
| earlyWarningSystems.ts | 324 | `gov.resources ?? 0` | HIGH | Use assertStateProperty |

#### MEDIUM - Initialization with Defaults (OK, but document)
Setting default values when creating new objects. These are acceptable.

| File | Line | Code | Rationale |
|------|------|------|-----------|
| engine.ts | 462-466 | `config.seed ?? Date.now()`, `maxMonths ?? 1000`, etc | Config defaults - acceptable |
| alignmentDynamics.ts | 38 | `attractorPositions[basinIndex] ?? 0.5` | Array access default - acceptable |
| alignmentDynamics.ts | 41 | `epicycleConfig.phaseOffset ?? rng() * 2 * Math.PI` | Config default - acceptable |

#### LOW - UI/Display (OK)
Values used for display only, not calculations.

| File | Line | Code | Rationale |
|------|------|------|-----------|
| (none found in simulation layer) | | | |

#### SPECIAL CASES - Needs Investigation

| File | Line | Code | Notes |
|------|------|------|-------|
| aiSuffering.ts | 338 | `agent.becameConsciousMonth ?? Infinity` | Using Infinity as "never" - acceptable? |
| behavioralDetection.ts | 162 | `const safeVal = trueVal ?? 0` | Named "safeVal" - smells like hiding bugs |
| catastrophicScenarios.ts | 1102 | `scenario.prerequisites[5]?.met ?? false` | Array access - needs validation |
| catastrophicScenarios.ts | 1114 | `scenario.prerequisites[5]?.metDate ?? currentMonth` | Array access - needs validation |
| computeInfrastructure.ts | 726 | `state.consciousnessGovernanceReadiness?.precautionaryCosts?.global ?? 0` | Deep optional chain - needs validation |

### || (Logical OR) Fallbacks

**Total occurrences:** (pending search)

(Will update after || search)

## Summary Statistics

- **CRITICAL**: 0 (so far)
- **HIGH**: 9
- **MEDIUM**: 5
- **LOW**: 0
- **SPECIAL**: 5
- **Total**: 19 categorized (out of 49 found)

## Next Steps

1. Continue categorizing remaining 30 occurrences
2. Fix all CRITICAL issues (replace with assertFinite)
3. Fix all HIGH issues (replace with assertStateProperty)
4. Document MEDIUM cases (why defaults are acceptable)
5. Investigate SPECIAL cases (determine if bugs or acceptable)
