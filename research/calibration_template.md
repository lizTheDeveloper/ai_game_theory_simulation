# Calibration Template

**Purpose:** Document rationale for parameter calibration to preserve research backing through git history.

---

## Parameter Name

**Parameter:** [Name of parameter being calibrated]
**Location:** [File path and line number]
**Calibrated by:** [Worker/agent ID]
**Date:** [YYYY-MM-DD]

---

## 1. Motivation

**Why calibrate this parameter?**

[Describe the problem or gap that motivates calibration. Examples:]
- Hindcast validation shows X% deviation from historical data
- Monte Carlo runs produce unrealistic outcome distributions
- Architecture review identified parameter as uncalibrated assumption
- Recent research (YYYY) suggests different value
- Parameter value was placeholder, needs research backing

**Current state:**
- Current value: [X]
- Problem: [Describe issue with current value]
- Impact: [What systems/outcomes are affected?]

---

## 2. Research Backing

**Primary sources (minimum 2 required):**

1. **[Author et al. (YYYY)]** - [Title]
   - Citation: [Full citation]
   - Relevant finding: [What this paper says about the parameter]
   - Parameter value from paper: [X]
   - Confidence: [HIGH/MEDIUM/LOW based on sample size, replication]

2. **[Author et al. (YYYY)]** - [Title]
   - Citation: [Full citation]
   - Relevant finding: [What this paper says about the parameter]
   - Parameter value from paper: [Y]
   - Confidence: [HIGH/MEDIUM/LOW]

**Additional sources (if available):**
- [List other supporting papers with brief notes]

**Uncertainty range:**
- Lower bound: [X] (source: [paper])
- Upper bound: [Y] (source: [paper])
- Best estimate: [Z] (justification: [why this value within range])

**Peer review status:**
- ✅ All sources peer-reviewed in journals
- ✅ Sources from 2024-2025 (or justify if older)
- ✅ No contradictory evidence found (or document and resolve)

---

## 3. Current Value

**Before calibration:**

```typescript
// File: [path/to/file.ts]
const parameterName = X; // [Current comment if any]
```

**Issues with current value:**
- [Why is this value wrong/ungrounded?]
- [What data or research contradicts it?]
- [What unrealistic behavior does it cause?]

---

## 4. Proposed Value

**After calibration:**

```typescript
// File: [path/to/file.ts]
const parameterName = Y; // [Citation] - [Brief justification]
// Uncertainty: ±Z% (range: [lower]-[upper])
```

**Justification:**
- Research backing: [Which paper(s) support this value]
- Calculation: [If derived, show work]
- Comparison: [How does this compare to current value? Why is it better?]
- Regional variation: [If applicable, note geographic differences]

**Expected impact:**
- [What changes in simulation behavior?]
- [Which systems are affected?]
- [What outcome distributions should shift?]

---

## 5. Validation

### Hindcast Validation (if applicable)

**Test:** Run historical simulation (1990-2024) with new parameter value

| Metric | Before | After | Target | Pass? |
|--------|--------|-------|--------|-------|
| Population 2020 | [X%] deviation | [Y%] deviation | <5% | [✅/❌] |
| Temperature 2020 | [X°C] | [Y°C] | ~1.2°C | [✅/❌] |
| GDP 2020 | [X%] deviation | [Y%] deviation | <10% | [✅/❌] |

**Result:** [Pass/Fail with notes]

### Monte Carlo Validation

**Test:** Run N≥10 simulations with different RNG seeds

| Run | Seed | Outcome | Key Metric | Notes |
|-----|------|---------|------------|-------|
| 1 | 42 | [Status] | [X] | - |
| 2 | 123 | [Status] | [Y] | - |
| ... | ... | ... | ... | ... |

**Statistics:**
- Mean: [X]
- Std dev: [Y]
- CV: [Z]% (target: <0.01% for determinism)
- Outcome distribution: [Realistic/Unrealistic - justify]

**Result:** [Pass/Fail with notes]

### Architecture Review

**Reviewer:** [architecture-skeptic / research-skeptic]
**Grade:** [A/B/C/D/F]
**Issues:**
- CRITICAL: [List any]
- HIGH: [List any]
- MEDIUM: [List any]
- LOW: [List any]

**Actions taken:** [How were CRITICAL/HIGH issues addressed?]

---

## 6. Implementation

**Files modified:**
1. `[path/to/file1.ts]` - [Description of change]
2. `[path/to/file2.ts]` - [Description of change]

**Git commit:** [commit hash after implementation]

**Documentation updated:**
- `docs/wiki/README.md` - [Section updated with new parameter]
- `research/[topic]_[date].md` - [Research findings preserved]
- `docs/CALIBRATION_OWNERSHIP.md` - [Marked STABLE]

**Tests passing:**
- ✅ `npm test` - All tests pass
- ✅ `npx tsc --noEmit` - No new type errors
- ✅ Monte Carlo N≥10 - CV < 0.01%
- ✅ Architecture review - Grade B+ or higher

---

## 7. Competing Calibrations (if applicable)

**If another calibration existed for this parameter:**

| Calibration | Value | Research Backing | Status | Notes |
|-------------|-------|------------------|--------|-------|
| This calibration | [Y] | [Papers] | ✅ ACCEPTED | [Why chosen] |
| Competing calibration | [Z] | [Papers] | ❌ REJECTED | [Why rejected] |

**Rationale for rejection:**
- [Weaker research backing / Older sources / Methodological issues / etc.]

---

## 8. Future Monitoring

**Re-calibration triggers:**
- [ ] New research published contradicting this value
- [ ] Hindcast validation shows >5% deviation with new data
- [ ] Monte Carlo outcome distributions become unrealistic
- [ ] Architecture review downgrades to C or lower

**Next review date:** [3 months from calibration date]

**Watch for:**
- [Specific papers/researchers to monitor]
- [Upcoming conferences/reports that may affect this parameter]
- [Related parameters that may need coordinated recalibration]

---

**Saved:** `research/[parameter_name]_calibration_[YYYYMMDD].md`
**Session time:** [X hours]
**Quality gate grades:** Research [A/B/C/D/F], Architecture [A/B/C/D/F]
