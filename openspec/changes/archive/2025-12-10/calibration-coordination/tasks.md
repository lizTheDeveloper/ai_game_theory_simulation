# Calibration Coordination Protocol - Implementation Tasks

## Phase 1: Ownership Registry
**Duration:** 30 minutes

- [ ] Create `docs/CALIBRATION_OWNERSHIP.md`
- [ ] Add table structure (Active Calibrations, Recently Completed)
- [ ] Document protocol (5-step process)
- [ ] Initialize with current stable calibrations
- [ ] Mark ocean pH as STABLE (baseline state)

## Phase 2: Documentation Template
**Duration:** 15 minutes

- [ ] Create `research/calibration_template.md`
- [ ] Include sections:
  - Motivation
  - Research Backing
  - Current Value
  - Proposed Value
  - Validation
  - Implementation

## Phase 3: Worker Integration
**Duration:** 30 minutes

- [ ] Update autonomous worker scripts
- [ ] Add pre-calibration ownership check
- [ ] Block if calibration ACTIVE
- [ ] Reference ownership registry in error message

## Phase 4: Workflow Documentation
**Duration:** 30 minutes

- [ ] Update `docs/DEVELOPMENT_WORKFLOW.md`
- [ ] Add calibration coordination section
- [ ] Explain ownership protocol
- [ ] Document when to use (before calibration work)
- [ ] Link to ownership registry

## Phase 5: Backfill Ocean pH
**Duration:** 45 minutes

- [ ] Create `research/ocean_pH_calibration_20251128.md`
- [ ] Document current 70% reduction value
- [ ] Cite IPCC AR6 WG1 Ch5 backing
- [ ] Note competing 50% calibration was rejected
- [ ] Add to Recently Completed table in ownership registry

## Phase 6: Validation
- [ ] Test worker ownership check with mock calibration
- [ ] Verify protocol documented clearly
- [ ] Commit all files
