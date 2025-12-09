# Missing Climate Cascade Systems - Implementation Tasks

## Phase 1: Research & Validation (Quality Gate 1)
**Duration:** 4-6 hours

- [ ] Gather peer-reviewed sources for all four systems
- [ ] Extract parameter ranges (thresholds, timescales, impacts)
- [ ] Add to research verification queue
- [ ] Research-skeptic review for contradictory evidence
- [ ] Prioritize systems by research quality (A/B/C grading)
- [ ] Pass QG1 (Grade B+ required)

## Phase 2: M-4 - Abrupt Sea Level Rise
**Duration:** 4-5 hours

- [ ] Add `IceSheetInstability` interface to GameState
- [ ] Create `AbruptSeaLevelRisePhase.ts`
  - Western Antarctic threshold and risk
  - Greenland threshold and risk
  - Sea level contribution calculations
- [ ] Register phase in PhaseOrchestrator
- [ ] Add assertion utilities to prevent NaN
- [ ] Update emoji conventions for abrupt events
- [ ] Write unit tests

## Phase 3: M-5 - Compound Climate Events
**Duration:** 4-5 hours

- [ ] Add `CompoundEvent` interface to GameState
- [ ] Create `CompoundEventsPhase.ts`
  - Primary tipping detection
  - Secondary cascade triggering
  - Amplification factor calculation
  - Timescale modeling
- [ ] Define tipping point interaction network
- [ ] Register phase in PhaseOrchestrator
- [ ] Add assertions and emoji conventions
- [ ] Write unit tests

## Phase 4: M-6 - Social Tipping Points
**Duration:** 5-6 hours

- [ ] Add `SocialTipping` interface to GameState
- [ ] Create `SocialTippingPhase.ts`
  - Renewable adoption threshold
  - Political will acceleration
  - Cultural shift feedbacks
  - S-curve technology adoption
- [ ] Register phase in PhaseOrchestrator
- [ ] Add assertions and emoji conventions
- [ ] Write unit tests

## Phase 5: M-7 - Climate Hysteresis
**Duration:** 4-5 hours

- [ ] Add `TippingHysteresis` interface to GameState
- [ ] Create `ClimateHysteresisPhase.ts`
  - Different collapse vs recovery thresholds
  - Century-scale recovery timescales
  - Irreversibility tracking
- [ ] Modify existing tipping logic to check hysteresis
- [ ] Register phase in PhaseOrchestrator
- [ ] Add assertions and emoji conventions
- [ ] Write unit tests

## Phase 6: Integration Testing
**Duration:** 6-8 hours

- [ ] Integration tests for system interactions
- [ ] Monte Carlo validation (N≥10) for each system
- [ ] Monte Carlo validation (N≥10) with all systems enabled
- [ ] Compare outcomes with baseline (no new systems)
- [ ] Check CV < 0.01% (determinism)
- [ ] Verify tail scenarios show realistic collapse
- [ ] Verify utopia scenarios capture positive feedbacks

## Phase 7: Architecture Review (Quality Gate 2)
**Duration:** 2-3 hours

- [ ] Submit for architecture-skeptic review
- [ ] Performance analysis (no O(n²) loops)
- [ ] State propagation verification
- [ ] Address CRITICAL/HIGH issues
- [ ] Pass QG2 (Grade B+ required)

## Phase 8: Documentation
**Duration:** 3-4 hours

- [ ] Update wiki for each of four systems
- [ ] Document research citations and parameters
- [ ] Add mechanism descriptions
- [ ] Update CLAUDE.md if needed
- [ ] Add to completed features list
