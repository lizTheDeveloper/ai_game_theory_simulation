# Configuration Parameter Research - Tasks

## Phase 1: Research (Quality Gate 1)

### Social Cohesion Parameters
- [ ] Research post-conflict reconciliation timelines (Rwanda, Bosnia, Northern Ireland case studies)
- [ ] Extract social fragmentation rates from 2024-2025 polarization literature
- [ ] Find trust decay/recovery rates from institutional trust research
- [ ] Validate or update: SOCIAL_COHESION_DECAY_RATE (0.01), SOCIAL_COHESION_RECOVERY_RATE (0.01)

### Migration/Evacuation Parameters
- [ ] Research evacuation capacity in major disasters (Katrina, Syrian crisis)
- [ ] Extract IOM/UNHCR data on logistical constraints (2024-2025)
- [ ] Document differential mobility by income/region
- [ ] Validate or update: MIGRATION_EVACUATION_FRACTION (0.3)

### Economic Collapse Parameters
- [ ] Research IMF/World Bank economic collapse definitions
- [ ] Extract G20/systemic importance criteria for major economies
- [ ] Document global systemic risk triggers (BIS, FSB)
- [ ] Validate or update:
  - MAJOR_ECONOMY_COLLAPSE_ECONOMIC_THRESHOLD (2.0)
  - MAJOR_ECONOMY_POPULATION_THRESHOLD (300)
  - MAJOR_ECONOMY_GLOBAL_CRISIS_THRESHOLD (0.5)

### Research Deliverable
- [ ] Create `research/config_parameters_justification_20251209.md`
- [ ] Document parameter recommendations with citations
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
