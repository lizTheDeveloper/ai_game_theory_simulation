# Archival Manifest - December 9, 2025

**Archived by:** architect
**Date:** 2025-12-09 06:08 UTC
**Reason:** Implementation complete, specs updated

---

## Archived Proposals

### 1. threshold-uncertainty (M-5)
**Status:** ✅ COMPLETE (Dec 7, 2025)
**Implementation:** `src/simulation/utils/distributionSampling.ts`, `src/simulation/thresholds/distributions.ts`
**Tests:** 28/28 passing
**Quality Gates:** QG1 Grade B-, QG2 Grade B+
**History:** Implementation details in `openspec/specs/simulation/spec.md` lines 236-244
**Files:** Distribution sampling library with triangular, uniform, normal, log-normal, beta, gamma distributions

### 2. m6-enhanced-radiation-modeling (M-6)
**Status:** ✅ COMPLETE (Dec 8, 2025)
**Implementation:** `src/simulation/radiationModeling.ts` (571 lines)
**Tests:** 30+ unit tests, all passing
**Quality Gates:** QG1 Grade B, QG2 PASSED
**History:** `docs/implementation-history/M-6_enhanced_radiation_modeling_20251208.md`
**Files:** Dose-response curves, tissue weighting (ICRP 103), 7-10 decay rule, radionuclide tracking

### 3. enhanced-radiation-modeling (DUPLICATE)
**Status:** Duplicate of m6-enhanced-radiation-modeling
**Action:** Archived as redundant proposal
**Note:** Same feature, different proposal naming convention

### 4. missing-climate-systems
**Status:** ✅ COMPLETE (Dec 5-7, 2025)
**Implementation:**
- M-4 Abrupt Sea Level Rise: `src/simulation/engine/phases/AbruptSeaLevelRisePhase.ts` (483 lines)
- M-5 Compound Climate Events: `src/simulation/engine/phases/ClimateSystemPhase.ts` (1469 lines)
- M-6 Social Tipping Points: `src/simulation/engine/phases/PositiveTippingPointsPhase.ts` (154 lines)
- M-7 Climate Hysteresis: Implemented in `ClimateSystemPhase.ts` (bidirectional state machine)
**Tests:** Integration tests passing
**Quality Gates:** Passed (HIGH-7 implementation)
**History:** `docs/implementation-history/high7_conditional_climate_stability_floor_20251207.md`
**Note:** Tasks.md checkboxes never updated post-implementation (documentation debt)

---

## Documentation Debt

**Issue:** The `missing-climate-systems/tasks.md` file shows unchecked boxes despite complete implementation.

**Reason:** Tasks were completed but the change proposal's task tracking was not updated.

**Impact:** None (implementation complete, tests passing, documented in spec.md and implementation-history).

**Future Prevention:** Consider automatic task.md updates as part of archival workflow.

---

## Verification Commands

```bash
# Verify implementations exist
ls -la src/simulation/utils/distributionSampling.ts
ls -la src/simulation/radiationModeling.ts
ls -la src/simulation/engine/phases/AbruptSeaLevelRisePhase.ts
ls -la src/simulation/engine/phases/ClimateSystemPhase.ts
ls -la src/simulation/engine/phases/PositiveTippingPointsPhase.ts

# Run tests
npm test

# Check spec.md for completion status
grep -A 10 "M-5:\|M-6:\|M-7:" openspec/specs/simulation/spec.md
```

---

### 5. hindcast-demographic-tuning (M-8)
**Status:** ✅ COMPLETE (Dec 9, 2025)
**Implementation:** Regional death rates updated with UN WPP 2024 estimates
**Quality Gates:** Research validation passed
**History:** Commit b89a1dd9 "feat: Update regional historical death rates with Dec 9 UN WPP 2024 estimates"
**Files:** Death rate calibration for Sub-Saharan Africa, South Asia, East Asia regions

### 6. calibration-coordination (MEDIUM)
**Status:** ✅ COMPLETE (Dec 9, 2025)
**Implementation:**
- `docs/CALIBRATION_OWNERSHIP.md` - Ownership registry
- Pre-calibration check protocol documented
- Calibration template created
**Quality Gates:** Process documentation complete
**History:** Prevents duplicate calibration work, tracks research backing

### 7. simulation-config-type-safety (LOW)
**Status:** ✅ COMPLETE (Dec 9, 2025)
**Implementation:** `SimulationConfig` interface added to `src/types/game.ts`
**Quality Gates:** TypeScript compilation passes, 462+ tests passing
**History:** Improves IDE autocomplete and compile-time safety
**Files:** Type safety for `state.simulationConfig` object

### 8. git-workflow-improvements (LOW)
**Status:** ✅ COMPLETE (Dec 9, 2025)
**Implementation:** `.githooks/pre-commit` hook prevents merge conflict markers
**Quality Gates:** Pre-commit hook functional, documentation updated
**History:** Prevents commits with unresolved merge conflicts
**Files:** Git hook added to `.githooks/` directory

---

## Next Steps

1. ✅ Proposals archived to `openspec/changes/archive/2025-12-09/`
2. ✅ Update `openspec/specs/project/spec.md` to reflect completion
3. ⏳ Post to `roadmap` channel for multi-agent awareness
4. ⏳ Verify no active references to archived proposals
