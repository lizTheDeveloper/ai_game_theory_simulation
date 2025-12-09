# Enhanced Radiation Modeling - Tasks

**Status:** RESEARCH
**Priority:** MEDIUM

---

## Quality Gate 1: Research Validation

### T1.1 Literature Research [IN-PROGRESS]
**Agent:** super-alignment-researcher
**Input:** Change proposal, ICRP standards, medical literature
**Output:** `research/radiation_health_effects_YYYYMMDD.md`

**Requirements:**
- ICRP tissue weighting factors (w_T) with citations
- Acute exposure thresholds (LD50/60, time dependency, dose-rate effects)
- Chronic exposure limits (annual dose, cumulative modeling)
- Medical evidence (Hiroshima LSS, Chernobyl liquidators, Fukushima surveillance)
- 2+ peer-reviewed sources (2024-2025 preferred) per category

### T1.2 Research Validation [BLOCKED: T1.1]
**Agent:** research-skeptic
**Input:** Research findings from T1.1
**Output:** `reviews/radiation_health_effects_critique_YYYYMMDD.md`
**Gate:** Must achieve Grade B or higher to proceed

---

## Implementation Phase

### T2.1 Tissue Weighting Implementation [BLOCKED: T1.2]
**Agent:** feature-implementer
**Files:** `src/types/radiation.ts`
**Changes:**
- Add `TissueSensitivity` interface with ICRP w_T values
- Add `OrganDose` calculations (absorbed dose × tissue weighting)
- Add `effectiveDose()` function (sum of weighted organ doses)

### T2.2 Acute vs Chronic Exposure [BLOCKED: T1.2]
**Agent:** feature-implementer
**Files:** `src/types/radiation.ts`
**Changes:**
- Add `ExposureType` enum (ACUTE, CHRONIC)
- Add `AcuteExposure` interface (dose, duration, LD50 threshold)
- Add `ChronicExposure` interface (dose rate, cumulative dose, annual limits)
- Modify `createRadiationExposure()` to distinguish types

### T2.3 Dose-Rate Dependency [BLOCKED: T1.2]
**Agent:** feature-implementer
**Files:** `src/types/radiation.ts`
**Changes:**
- Add `doseRate` field (Gy/hour)
- Implement dose-rate effectiveness factor (DREF)
- High dose-rate (>0.1 Gy/min) → full effect
- Low dose-rate (<0.1 Gy/min) → reduced effect (DREF ~ 2)

### T2.4 Nuclear Winter Integration [BLOCKED: T2.1, T2.2]
**Agent:** feature-implementer
**Files:** `src/simulation/nuclearWinter.ts`
**Changes:**
- Distinguish immediate casualties (acute exposure, LD50)
- Model long-term cancer risk (chronic accumulation, tissue-specific)
- Apply tissue weighting to radiation zones
- Track dose-rate from fallout vs residual contamination

---

## Quality Gate 2: Architecture Review

### T3.1 Unit Tests [BLOCKED: T2.4]
**Agent:** unit-test-writer
**Files:** `src/types/radiation.test.ts`
**Coverage:**
- Tissue weighting calculations
- Acute LD50 threshold logic
- Chronic accumulation over time
- Dose-rate effectiveness factor
- Target: >90% coverage

### T3.2 Monte Carlo Validation [BLOCKED: T2.4]
**Agent:** priya
**Files:** `scripts/validate-radiation-model.ts` (new)
**Requirements:**
- N≥10 runs with different seeds
- Check determinism (same seed → same output)
- Validate CV < 0.01% for deterministic outputs
- Compare acute/chronic death distributions to historical data

### T3.3 Architecture Review [BLOCKED: T3.1, T3.2]
**Agent:** architecture-skeptic
**Input:** Completed implementation + tests
**Output:** `reviews/enhanced_radiation_architecture_YYYYMMDD.md`
**Gate:** Must address CRITICAL/HIGH issues

---

## Documentation Phase

### T4.1 Wiki Update [BLOCKED: T3.3]
**Agent:** wiki-documentation-updater
**Files:** `docs/wiki/README.md`
**Changes:**
- Document tissue weighting methodology
- Explain acute vs chronic exposure distinction
- Add references to ICRP standards
- Link medical evidence (Hiroshima/Chernobyl/Fukushima)

### T4.2 Archival [BLOCKED: T4.1]
**Agent:** architect
**Actions:**
- Move change proposal to `docs/implementation-history/`
- Update `openspec/specs/simulation/spec.md` with M-6 completion
- Mark M-6 as complete in roadmap
