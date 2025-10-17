# Architecture Refactoring Plan - October 17, 2025

## Executive Summary

**CRITICAL FINDINGS:**
- 6 files exceed 1,500 lines (unmaintainable complexity)
- 11 files exceed 1,000 lines (high complexity)
- 24 files exceed 500 lines (moderate complexity)
- Major architectural issues: monolithic action definitions, mixed responsibilities, excessive duplication

**IMMEDIATE PRIORITIES:**
1. **governmentAgent.ts** (2,820 lines) - CRITICAL: Blocks feature development, causes merge conflicts
2. **bionicSkills.ts** (1,883 lines) - HIGH: Recently modified, actively causing maintenance pain
3. **qualityOfLife.ts** (1,646 lines) - HIGH: Core metric calculations, performance bottleneck

**ESTIMATED EFFORT:** 45-60 developer hours for top 5 refactors

---

## File Size Analysis

### Tier 1: CRITICAL (>2,000 lines)
| File | Lines | Functions | Responsibilities | Complexity |
|------|-------|-----------|------------------|------------|
| `agents/governmentAgent.ts` | 2,820 | 5 exports | Actions, selection logic, execution, tech actions | VERY HIGH |
| `breakthroughTechnologies.ts` | 2,089 | DEPRECATED | Legacy tech system (DO NOT REFACTOR - REMOVE) | N/A |

### Tier 2: HIGH PRIORITY (1,500-2,000 lines)
| File | Lines | Functions | Responsibilities | Complexity |
|------|-------|-----------|------------------|------------|
| `bionicSkills.ts` | 1,883 | 18 exports | AI-assisted skills, labor distribution, policy effects | HIGH |
| `qualityOfLife.ts` | 1,646 | 14 exports | QoL calculations, mortality, distribution, regional inequality | HIGH |
| `techTree/comprehensiveTechTree.ts` | 1,602 | 5 exports | 71 tech definitions, categories, lookups | MEDIUM |

### Tier 3: MEDIUM PRIORITY (1,000-1,500 lines)
| File | Lines | Functions | Responsibilities | Complexity |
|------|-------|-----------|------------------|------------|
| `resourceInitialization.ts` | 1,510 | 16 exports | Country resource initialization (15 countries) | LOW |
| `lib/actionSystem.ts` | 1,255 | 5 exports | AI/government/society actions (UI layer) | MEDIUM |
| `extinctions.ts` | 1,211 | 5 exports | Extinction triggers, progression, prevention | HIGH |
| `nationalAI.ts` | 1,188 | 10 exports | National AI competition, cooperation, espionage | HIGH |
| `types/game.ts` | 1,185 | 39 exports | Core state interface (900+ line interface) | MEDIUM |
| `catastrophicScenarios.ts` | 1,154 | 3 exports | 8 catastrophic scenarios, prerequisites, triggers | MEDIUM |

---

## Top 5 Refactoring Candidates

### 1. governmentAgent.ts - **CRITICAL PRIORITY**

**Current State:**
- 2,820 lines in a single file
- Contains 80+ government action definitions inline
- Mixes action definitions, selection logic, and execution logic
- Includes separate tech actions that should be with tech tree
- Single massive array constant (2,100+ lines)

**Problems:**
- Impossible to test individual actions
- Merge conflicts on every government feature
- Actions buried in implementation details
- No separation between data and logic
- Violates single responsibility principle

**Proposed Refactoring:**
```
agents/
├── governmentAgent.ts (200 lines - orchestration only)
├── government/
│   ├── actions/
│   │   ├── index.ts (action registry)
│   │   ├── economic.ts (UBI, redistribution, etc.)
│   │   ├── regulation.ts (AI regulation actions)
│   │   ├── security.ts (defense, surveillance)
│   │   ├── technology.ts (tech investments)
│   │   └── crisis.ts (emergency responses)
│   ├── selection.ts (action selection logic)
│   ├── execution.ts (action execution)
│   └── types.ts (GovernmentAction interface)
```

**Effort:** HIGH (15-20 hours)
- 8 hours: Extract and categorize actions
- 4 hours: Create action registry pattern
- 4 hours: Refactor selection/execution logic
- 4 hours: Update imports and tests

**Risks:**
- Many files import GOVERNMENT_ACTIONS directly
- Need to maintain backward compatibility
- Action IDs must remain stable

---

### 2. bionicSkills.ts - **HIGH PRIORITY**

**Current State:**
- 1,883 lines mixing multiple concerns
- AI-assisted skills calculations
- Labor/capital distribution
- Policy intervention effects
- Wage inequality detection
- Competence crisis detection

**Problems:**
- Multiple unrelated systems in one file
- Complex interdependencies hard to trace
- Performance issues from repeated calculations
- Difficult to test individual components

**Proposed Refactoring:**
```
humanCapital/
├── index.ts (public API)
├── aiAssistedSkills/
│   ├── calculations.ts (skill calculations)
│   ├── metrics.ts (aggregate metrics)
│   ├── scaffolding.ts (AI scaffolding logic)
│   └── retention.ts (skill retention)
├── laborDistribution/
│   ├── distribution.ts (labor/capital split)
│   ├── unemployment.ts (unemployment calculations)
│   └── transitions.ts (automation transitions)
├── inequality/
│   ├── wages.ts (wage inequality detection)
│   └── competence.ts (competence crisis detection)
└── policyEffects/
    ├── retraining.ts (retraining programs)
    ├── teaching.ts (teaching support)
    └── jobGuarantee.ts (job guarantee effects)
```

**Effort:** HIGH (12-15 hours)
- 6 hours: Extract and organize modules
- 3 hours: Define clear interfaces
- 3 hours: Resolve circular dependencies
- 3 hours: Update phase implementations

**Risks:**
- Recently modified file (active development)
- Complex state dependencies
- Performance-critical calculations

---

### 3. qualityOfLife.ts - **HIGH PRIORITY**

**Current State:**
- 1,646 lines of calculation functions
- Environmental mortality calculations
- 17-dimensional QoL metrics
- Regional inequality calculations
- Distribution metrics (Gini, etc.)
- Food/water/shelter security

**Problems:**
- Monolithic calculation functions
- Repeated regional lookups (performance)
- Mixed levels of abstraction
- Hard to optimize individual metrics

**Proposed Refactoring:**
```
qualityOfLife/
├── index.ts (main QoL calculation)
├── dimensions/
│   ├── survival.ts (food, water, shelter, habitability)
│   ├── material.ts (energy, comfort, mobility)
│   ├── psychological.ts (safety, autonomy, meaning)
│   ├── social.ts (community, recognition, participation)
│   └── health.ts (longevity, environment quality)
├── mortality/
│   ├── environmental.ts (heat, disasters, pollution)
│   ├── resource.ts (famine, thirst)
│   └── calculations.ts (mortality aggregation)
├── distribution/
│   ├── inequality.ts (Gini, regional disparities)
│   ├── elysium.ts (elite/mass divergence)
│   └── metrics.ts (distribution calculations)
└── regional/
    ├── populations.ts (regional data cache)
    └── disparities.ts (regional calculations)
```

**Effort:** MEDIUM (10-12 hours)
- 5 hours: Extract dimension calculations
- 3 hours: Optimize regional lookups with caching
- 2 hours: Create clean interfaces
- 2 hours: Performance testing

**Risks:**
- Core metric used throughout simulation
- Performance-critical path
- Many dependent systems

---

### 4. extinctions.ts - **MEDIUM PRIORITY**

**Current State:**
- 1,211 lines handling all extinction logic
- 5 trigger types (instant, rapid, slow, controlled, unintended)
- Progression logic for each type
- Prevention mechanisms
- Complex state mutations

**Problems:**
- Different extinction types have different logic but share file
- Trigger checking and progression mixed together
- Hard to add new extinction types
- Complex nested conditionals

**Proposed Refactoring:**
```
extinctions/
├── index.ts (orchestration)
├── triggers/
│   ├── instant.ts (grey goo, etc.)
│   ├── rapid.ts (bioweapon, nuclear)
│   ├── slow.ts (societal collapse)
│   ├── controlled.ts (deliberate extinction)
│   └── unintended.ts (accidental extinction)
├── progression/
│   ├── rapid.ts (24-month progression)
│   ├── slow.ts (120-month progression)
│   └── helpers.ts (shared progression logic)
├── prevention.ts (prevention mechanisms)
└── types.ts (ExtinctionState interface)
```

**Effort:** MEDIUM (8-10 hours)
- 4 hours: Separate trigger types
- 2 hours: Extract progression logic
- 2 hours: Consolidate shared logic
- 2 hours: Testing and validation

**Risks:**
- Critical game logic
- Complex probability calculations
- Must maintain determinism

---

### 5. nationalAI.ts - **MEDIUM PRIORITY**

**Current State:**
- 1,188 lines managing national AI competition
- Domestic presence tracking
- Indigenous capabilities
- Open source propagation
- Espionage mechanics
- International cooperation
- Race dynamics

**Problems:**
- Too many responsibilities
- Complex country-to-country interactions
- Performance issues from nested loops
- Hard to debug race conditions

**Proposed Refactoring:**
```
nationalAI/
├── index.ts (main update function)
├── capabilities/
│   ├── domestic.ts (domestic AI presence)
│   ├── indigenous.ts (local development)
│   └── effective.ts (capability calculations)
├── dynamics/
│   ├── race.ts (AI race intensity)
│   ├── cooperation.ts (international agreements)
│   └── firstMover.ts (first-mover advantages)
├── intelligence/
│   ├── espionage.ts (spying mechanics)
│   ├── opensource.ts (open source propagation)
│   └── exportControls.ts (technology controls)
└── regulatory/
    ├── arbitrage.ts (regulatory arbitrage)
    └── safety.ts (race effects on safety)
```

**Effort:** MEDIUM (10-12 hours)
- 5 hours: Extract subsystems
- 3 hours: Optimize country interactions
- 2 hours: Create clear interfaces
- 2 hours: Performance profiling

**Risks:**
- Complex international dynamics
- Many interacting subsystems
- Performance-critical with 15+ countries

---

## Additional Refactoring Opportunities

### Files to Split (500-1000 lines)

1. **techTree/effectsEngine.ts** (1,120 lines) - Split effects by category
2. **defensiveAI.ts** (1,028 lines) - Separate detection from response
3. **organizationManagement.ts** (954 lines) - Split by organization type
4. **planetaryBoundaries.ts** (875 lines) - One module per boundary
5. **resourceDepletion.ts** (809 lines) - Split by resource type

### Files to Monitor (Will need refactoring soon)

1. **initialization.ts** (685 lines) - Growing with each feature
2. **environmental.ts** (680 lines) - Accumulation systems getting complex
3. **humanEnhancement.ts** (676 lines) - Recently added, may grow
4. **militarySystem.ts** (666 lines) - Complex military dynamics

### Files That Are OK (Despite size)

1. **resourceInitialization.ts** (1,510 lines) - Mostly data, well-structured by country
2. **techTree/comprehensiveTechTree.ts** (1,602 lines) - Data definitions, cleanly organized
3. **types/game.ts** (1,185 lines) - Central type definition, hard to split

---

## Execution Roadmap

### Phase 1: Critical Refactors (Week 1-2)
1. **Day 1-3:** Refactor governmentAgent.ts (highest pain point)
2. **Day 4-5:** Refactor bionicSkills.ts (active development area)
3. **Day 6-7:** Refactor qualityOfLife.ts (performance gains)

### Phase 2: High-Value Refactors (Week 3)
4. **Day 8-9:** Refactor extinctions.ts (improve testability)
5. **Day 10-11:** Refactor nationalAI.ts (performance optimization)

### Phase 3: Incremental Improvements (Ongoing)
- Split remaining 500+ line files as touched
- Extract shared patterns into utilities
- Improve test coverage for refactored modules

---

## Success Metrics

**Immediate Benefits:**
- Reduce merge conflicts by 50%
- Improve test execution speed by 30%
- Enable parallel development on government features

**Long-term Benefits:**
- Reduce average file size from 400 to 200 lines
- Improve code discoverability
- Enable feature-specific optimization
- Reduce memory usage by 20-30%

---

## Implementation Guidelines

### For Each Refactor:

1. **Create feature branch** from main
2. **Write characterization tests** for existing behavior
3. **Extract modules** incrementally (one at a time)
4. **Maintain backward compatibility** (facades if needed)
5. **Run Monte Carlo validation** (N=10 minimum)
6. **Profile performance** before/after
7. **Update imports** across codebase
8. **Document new structure** in module README

### Architectural Patterns to Apply:

- **Registry Pattern:** For actions, technologies, scenarios
- **Strategy Pattern:** For different calculation methods
- **Facade Pattern:** For backward compatibility
- **Factory Pattern:** For creating complex state objects
- **Observer Pattern:** For loosely coupled updates

### Performance Optimizations to Include:

- **Caching:** Regional data, repeated calculations
- **Lazy Evaluation:** Expensive metrics only when needed
- **Batch Updates:** Aggregate state changes
- **Map Lookups:** Replace O(n) searches with O(1)
- **Memoization:** Pure calculation functions

---

## Risk Mitigation

### High-Risk Areas:
1. **Government actions** - Used throughout codebase
2. **QoL calculations** - Core metric, must remain stable
3. **Extinction logic** - Game-ending mechanics, must be correct

### Mitigation Strategies:
1. **Incremental refactoring** - Small, testable changes
2. **Backward compatibility** - Maintain existing APIs
3. **Extensive testing** - Characterization and regression tests
4. **Monte Carlo validation** - Ensure simulation outcomes unchanged
5. **Performance profiling** - No performance regressions
6. **Feature flags** - Rollback capability if issues arise

---

## Recommended Tooling

### Analysis Tools:
- **madge** - Visualize module dependencies
- **plato** - Code complexity reports
- **size-limit** - Track bundle size changes

### Refactoring Tools:
- **TypeScript AST** - Automated refactoring scripts
- **ts-morph** - Programmatic code manipulation
- **eslint** - Enforce module boundaries

### Testing Tools:
- **Jest** - Unit test individual modules
- **Benchmark.js** - Performance regression testing

---

## Conclusion

The codebase has significant technical debt concentrated in 5-6 critical files. The proposed refactoring will:

1. **Improve maintainability** through better separation of concerns
2. **Enhance performance** via targeted optimizations
3. **Enable parallel development** by reducing merge conflicts
4. **Increase testability** through smaller, focused modules
5. **Reduce cognitive load** by organizing related functionality

**Total Estimated Effort:** 45-60 hours for top 5 files

**Recommended Approach:** Start with governmentAgent.ts as it's causing the most immediate pain and blocking other development. Execute refactors incrementally with strong testing discipline.

**Critical Success Factor:** Maintain backward compatibility and validate with Monte Carlo simulations to ensure no regression in simulation behavior.