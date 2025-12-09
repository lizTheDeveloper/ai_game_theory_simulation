# Configuration Parameter Research - Tasks

## Phase 1: Research (Quality Gate 1)

### Social Cohesion Parameters
- [x] Research post-conflict reconciliation timelines (Rwanda, Bosnia, Northern Ireland case studies)
- [x] Extract social fragmentation rates from 2024-2025 polarization literature
- [x] Find trust decay/recovery rates from institutional trust research
- [x] Validate or update: SOCIAL_COHESION_DECAY_RATE (0.01), SOCIAL_COHESION_RECOVERY_RATE (0.01)

### Migration/Evacuation Parameters
- [x] Research evacuation capacity in major disasters (Katrina, Syrian crisis)
- [x] Extract IOM/UNHCR data on logistical constraints (2024-2025)
- [x] Document differential mobility by income/region
- [x] Validate or update: MIGRATION_EVACUATION_FRACTION (0.3)

### Economic Collapse Parameters
- [x] Research IMF/World Bank economic collapse definitions
- [x] Extract G20/systemic importance criteria for major economies
- [x] Document global systemic risk triggers (BIS, FSB)
- [x] Validate or update:
  - MAJOR_ECONOMY_COLLAPSE_ECONOMIC_THRESHOLD (2.0)
  - MAJOR_ECONOMY_POPULATION_THRESHOLD (300)
  - MAJOR_ECONOMY_GLOBAL_CRISIS_THRESHOLD (0.5)

### Research Deliverable
- [x] Create `research/config_parameters_justification_20251209.md`
- [x] Document parameter recommendations with citations
- [ ] Pass research-skeptic validation (Grade B+ target)

## Phase 2: Implementation

- [ ] Update `src/simulation/config/centralConfig.ts` with research citations
- [ ] Replace `[RESEARCH NEEDED]` tags with proper `@research` citations
- [ ] Update parameter values if research suggests different values
- [ ] Document uncertainty ranges where applicable

## Phase 3: Validation

- [ ] Run existing Monte Carlo tests to ensure no regressions
- [ ] Verify type checking passes (`npx tsc --noEmit`)
- [ ] Check CV < 0.01% (determinism preserved)

## Phase 4: Architecture Review (Quality Gate 2)

- [ ] Submit for architecture-skeptic review
- [ ] Address any CRITICAL/HIGH issues
- [ ] Pass QG2 (Grade B+ required)

## Phase 5: Documentation

- [ ] Update OpenSpec research quality metrics (C → B+ target)
- [ ] Archive to implementation history
- [ ] Update wiki if parameter changes are significant
