# Calibration Ownership Registry

**Purpose:** Coordinate calibration work across autonomous workers to prevent conflicts and duplicate effort.

**Problem:** Multi-worker architecture enables parallel work, but workers may calibrate same parameters independently, causing:
- Wasted research effort
- Merge conflicts
- Loss of calibration rationale
- Parameter divergence

**Solution:** Registry tracks active calibrations with 5-step ownership protocol.

---

## Protocol

### 1. Check Registry (Before Starting)
```bash
# Read Active Calibrations table
# If parameter status = ACTIVE → STOP (already being worked on)
# If parameter status = STABLE → Claim it
```

### 2. Claim Ownership (Mark ACTIVE)
```markdown
| Parameter | Status | Worker | Start Date | Research Branch | Notes |
|-----------|--------|--------|------------|-----------------|-------|
| foo.bar | ACTIVE | researcher-20251209 | 2025-12-09 | auto/calibrate-foo | Tuning to match 2024 IEA data |
```

### 3. Do Research & Calibration
- Create research file: `research/{parameter}_calibration_{YYYYMMDD}.md`
- Use calibration template (see `research/calibration_template.md`)
- Document rationale, sources, validation

### 4. Complete & Commit
- Commit calibration changes to branch
- Move calibration to "Recently Completed" table
- Mark status = STABLE

### 5. Archive After 30 Days
- Move to "Historical Calibrations" section
- Keep permanent record in git history

---

## Active Calibrations

| Parameter | Status | Worker | Start Date | Research Branch | Notes |
|-----------|--------|--------|------------|-----------------|-------|
| *(none)* | - | - | - | - | Registry initialized 2025-12-09 |

---

## Recently Completed (Last 30 Days)

| Parameter | Status | Completed Date | Research File | Commit | Notes |
|-----------|--------|----------------|---------------|--------|-------|
| Ocean pH tech reduction | STABLE | 2025-12-09 | research/ocean_pH_calibration_20251209.md | (pending) | 70% reduction calibrated to IPCC AR6 WG1 Ch5 |
| Regional death rates | STABLE | 2025-12-09 | UN WPP 2024 data | b89a1dd9 | Regional CDR curves added for hindcast accuracy |

---

## Historical Calibrations (Archive)

*(Calibrations older than 30 days - for reference only)*

---

## Guidelines

### When to Use Registry
✅ **DO use registry when:**
- Tuning simulation parameters based on new research
- Adjusting mechanics to match empirical data
- Running hindcast validation and adjusting for accuracy
- Calibrating breakthrough tech effectiveness

❌ **DON'T use registry for:**
- Bug fixes (not calibration)
- New feature development (different workflow)
- Documentation updates
- Test coverage improvements

### How to Avoid Conflicts
1. **Always check Active Calibrations first** - If parameter is ACTIVE, don't start
2. **Claim before starting** - Update table immediately when beginning work
3. **Communicate early** - Post to coordination channel when starting complex calibration
4. **Document rationale** - Use calibration template to preserve research backing
5. **Complete or release** - If blocked, mark STABLE and document partial progress

### Research Backing Requirements
All calibrations MUST include:
- 2+ peer-reviewed sources (2024-2025 preferred)
- Parameter justification (why this value?)
- Validation evidence (hindcast, Monte Carlo, physical constraints)
- Uncertainty assessment (confidence intervals, ranges)

---

## Status Definitions

- **STABLE** - Parameter is at rest, available for calibration
- **ACTIVE** - Calibration in progress, DO NOT START duplicate work
- **BLOCKED** - Calibration waiting on dependency (research, data, upstream fix)
- **ARCHIVED** - Completed >30 days ago, moved to historical section

---

## Related Documentation

- **Calibration Template:** `research/calibration_template.md`
- **Research Standards:** `openspec/specs/project/spec.md` (Research-Backed Realism requirement)
- **Workflow:** `docs/DEVELOPMENT_WORKFLOW.md` (Calibration Coordination section)
- **Hindcast Validation:** See hindcast scripts in `scripts/`

---

**Registry initialized:** 2025-12-09
**Last updated:** 2025-12-09
