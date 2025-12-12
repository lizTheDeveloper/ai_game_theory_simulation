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
**Status:** 85% complete (calibration pending)

- [x] Add `IceSheetInstability` interface to GameState
- [x] Create `AbruptSeaLevelRisePhase.ts`
  - Western Antarctic threshold and risk
  - Greenland threshold and risk
  - Sea level contribution calculations
- [x] Register phase in PhaseOrchestrator
- [x] Add assertion utilities to prevent NaN
- [x] Update emoji conventions for abrupt events
- [x] Write unit tests
- [ ] Calibration: Validate threshold probabilities against empirical data

## Phase 3: M-5 - Compound Climate Events
**Duration:** 4-5 hours
**Status:** COMPLETE (Session 52-53, archived 20251206)

- [x] Add `CompoundEvent` interface to GameState
- [x] Create `CompoundEventsPhase.ts`
  - Primary tipping detection
  - Secondary cascade triggering
  - Amplification factor calculation
  - Timescale modeling
- [x] Define tipping point interaction network
- [x] Register phase in PhaseOrchestrator
- [x] Add assertions and emoji conventions
- [x] Write unit tests

## Phase 4: M-6 - Social Tipping Points
**Duration:** 5-6 hours
**Status:** COMPLETE (Session 52-53, archived 20251206)

- [x] Add `SocialTipping` interface to GameState
- [x] Create `SocialTippingPhase.ts`
  - Renewable adoption threshold
  - Political will acceleration
  - Cultural shift feedbacks
  - S-curve technology adoption
- [x] Register phase in PhaseOrchestrator
- [x] Add assertions and emoji conventions
- [x] Write unit tests

## Phase 5: M-7 - Climate Hysteresis
**Duration:** 4-5 hours
**Status:** COMPLETE (Session 52-53, archived 20251206)

- [x] Add `TippingHysteresis` interface to GameState
- [x] Create `ClimateHysteresisPhase.ts`
  - Different collapse vs recovery thresholds
  - Century-scale recovery timescales
  - Irreversibility tracking
- [x] Modify existing tipping logic to check hysteresis
- [x] Register phase in PhaseOrchestrator
- [x] Add assertions and emoji conventions
- [x] Write unit tests

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
