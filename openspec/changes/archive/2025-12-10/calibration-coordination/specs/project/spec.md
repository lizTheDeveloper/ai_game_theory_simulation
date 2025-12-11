# Delta for Project Specification

## ADDED Requirements

### Requirement: Calibration Coordination Protocol
The project SHALL prevent conflicting parameter calibrations through ownership registry and pre-calibration checks.

#### Scenario: Prevent Duplicate Calibration Work
- WHEN autonomous worker considers calibrating a parameter
- THEN worker SHALL check `docs/CALIBRATION_OWNERSHIP.md` first
- AND worker SHALL block if parameter status is ACTIVE
- AND worker SHALL claim ownership before starting calibration

#### Scenario: Document Calibration Rationale
- WHEN completing a calibration
- THEN research backing SHALL be documented in `research/` folder
- AND calibration SHALL follow standard template
- AND ownership registry SHALL be updated to STABLE state
- AND wiki SHALL be updated with final values

#### Scenario: Resolve Calibration Conflicts
- WHEN two competing calibrations exist
- THEN ownership registry SHALL show who owns calibration
- AND research backing SHALL determine which approach is correct
- AND losing approach SHALL be documented in Recently Completed table

---

## Implementation Notes

**New files:**
- `docs/CALIBRATION_OWNERSHIP.md` - Ownership registry
- `research/calibration_template.md` - Standard template

**Ownership registry structure:**
```markdown
## Active Calibrations

| Parameter | File | Owner | Status | Started | Research Backing |
|-----------|------|-------|--------|---------|------------------|
| Ocean pH decline | oceanAcidification.ts | [none] | STABLE | Nov 28 | IPCC AR6 WG1 Ch5 |

## Recently Completed

| Parameter | Date | Final Value | Research | Commit |
|-----------|------|-------------|----------|--------|
| Ocean pH decline rate | Nov 28 | 70% reduction | IPCC AR6 | [hash] |
```

**Worker check (bash):**
```bash
# Before starting calibration work
grep -i "ocean.*pH.*ACTIVE" docs/CALIBRATION_OWNERSHIP.md
if [ $? -eq 0 ]; then
  echo "⚠️ Warning: Ocean pH calibration already in progress"
  echo "See docs/CALIBRATION_OWNERSHIP.md for ownership"
  exit 1
fi
```

**Calibration states:**
- STABLE: Available for calibration
- ACTIVE: Being worked on, do not duplicate

**Benefits:**
- Prevents duplicate work
- Preserves research traceability
- Clear conflict resolution
- Knowledge persists beyond git commits
