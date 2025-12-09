# Calibration Template: [Parameter/System Name]

**Date:** [YYYY-MM-DD]
**Calibrator:** [Agent name or session ID]
**Priority:** [CRITICAL/HIGH/MEDIUM/LOW]
**Status:** [PROPOSED / IN_PROGRESS / VALIDATED / ARCHIVED]

---

## Executive Summary

**What:** [One-sentence description of what is being calibrated]

**Why:** [Why this calibration is needed - what problem does it solve?]

**Result:** [One-sentence summary of the calibration outcome]

---

## Current State

### Existing Values
```typescript
// Current implementation location
// File: [path/to/file.ts:line]
const parameter = [current value];  // [Brief inline comment]
```

**Problem with current values:**
- [Issue 1: e.g., "Hindcast shows 10% overshoot in 2020"]
- [Issue 2: e.g., "Not research-backed - arbitrary choice"]
- [Issue 3: e.g., "Doesn't match 2024-2025 empirical data"]

### Impact of Problem
- **Hindcast accuracy:** [e.g., "Off by X% in year YYYY"]
- **Research quality:** [e.g., "Grade D - no sources"]
- **Monte Carlo outcomes:** [e.g., "Unrealistic outcome distributions"]

---

## Research Foundation

### Primary Sources

**Source 1:**
- **Citation:** [Author(s), Year, Title, Journal/Institution]
- **Link:** [DOI or URL]
- **Key Finding:** [Quote or paraphrase the relevant finding]
- **Data Extracted:** [Specific numbers, ranges, equations]
- **Quality:** [Peer-reviewed / Preprint / Industry report / etc.]

**Source 2:**
- [Same format as above]

**Source 3:**
- [Same format as above]

### Contradictory Evidence

**Did you find sources that CONTRADICT the calibration?**

[If YES, list them here - transparency about conflicting evidence is critical]

**Source X:**
- **Citation:** [...]
- **Contradicts by:** [Explain the contradiction]
- **Resolution:** [Why we're proceeding despite this - e.g., "Source X used outdated methodology", "Our context differs", etc.]

[If NO contradictory evidence found, state: "No contradictory evidence found in literature search (searched: [databases/sources checked])"]

### Research Grade

**Self-Assessment:**
- **Peer-reviewed sources:** [X out of Y sources]
- **2024-2025 sources:** [X out of Y sources]
- **Parameter justification:** [Strong / Moderate / Weak]
- **Expected Grade:** [A / B / C / D / F]

---

## Proposed Calibration

### New Values

```typescript
// Proposed implementation
// File: [path/to/file.ts:line]
const parameter = [new value];  // [Research-backed comment with citation]

// OR if range:
const parameterMin = [value];  // [Citation, page/section]
const parameterMax = [value];  // [Citation, page/section]
```

### Justification

**Why these specific values:**
1. [Reason 1 with citation]
2. [Reason 2 with citation]
3. [Reason 3 with citation]

**Range bounds (if applicable):**
- **Lower bound:** [Value] - [Justification]
- **Upper bound:** [Value] - [Justification]
- **Default/Baseline:** [Value] - [Justification]

### Expected Impact

**Hindcast (if applicable):**
- **Before calibration:** [Metric] = [Value] ([X%] deviation from historical)
- **After calibration:** [Metric] = [Expected value] ([Y%] deviation - target: <5%)

**Monte Carlo:**
- **Expected outcome shift:** [e.g., "Utopia outcomes increase from 15% to 25%"]
- **Realism improvement:** [e.g., "Eliminates unrealistic extinction spike at month 120"]

---

## Validation Plan

### Phase 1: Unit Tests
- [ ] Add unit test for new parameter values
- [ ] Test edge cases (min, max, midpoint)
- [ ] Verify no NaN/Infinity from new values

### Phase 2: Hindcast Validation (if applicable)
- [ ] Run hindcast 1990-2024 (or relevant period)
- [ ] Check deviation at checkpoint years
- [ ] Target: <5% deviation for all checkpoints
- [ ] Document any regressions

### Phase 3: Monte Carlo Validation
- [ ] Run N≥10 simulations with same seed
- [ ] Check determinism (CV < 0.01%)
- [ ] Check outcome distribution realism
- [ ] Compare before/after distributions
- [ ] Document any unexpected shifts

### Phase 4: Architecture Review
- [ ] Submit to architecture-skeptic (Quality Gate 2)
- [ ] Check for performance impacts
- [ ] Check for state propagation issues
- [ ] Address CRITICAL/HIGH issues

---

## Implementation Notes

### Files Modified
```
src/[path]/[file1].ts  - [Brief description of changes]
src/[path]/[file2].ts  - [Brief description of changes]
```

### Migration Notes
[If changing existing parameters, note any migration steps needed]

### Breaking Changes
[List any breaking changes - e.g., "Removes deprecated fallback values"]

---

## Results

### Hindcast Results (if applicable)

| Year | Historical | Before Calibration | After Calibration | Deviation |
|------|-----------|-------------------|------------------|-----------|
| 1990 | [value]   | [value] ([±X%])   | [value] ([±Y%])  | [Y%]      |
| 2000 | [value]   | [value] ([±X%])   | [value] ([±Y%])  | [Y%]      |
| 2010 | [value]   | [value] ([±X%])   | [value] ([±Y%])  | [Y%]      |
| 2020 | [value]   | [value] ([±X%])   | [value] ([±Y%])  | [Y%]      |

**Summary:** [Did calibration achieve target? By how much did accuracy improve?]

### Monte Carlo Results

**Determinism Check:**
- **N:** [number of runs]
- **Seed:** [seed value]
- **CV:** [coefficient of variation]
- **Status:** [PASS <0.01% / FAIL]

**Outcome Distribution:**

| Outcome Tier | Before Calibration | After Calibration | Change |
|-------------|-------------------|------------------|--------|
| Utopia      | [X%]              | [Y%]             | [±Z%]  |
| Flourishing | [X%]              | [Y%]             | [±Z%]  |
| Status Quo  | [X%]              | [Y%]             | [±Z%]  |
| Collapse    | [X%]              | [Y%]             | [±Z%]  |
| Extinction  | [X%]              | [Y%]             | [±Z%]  |

**Realism Assessment:** [Are outcome distributions more realistic after calibration?]

### Architecture Review

**Grade:** [A / B / C / D / F]
**Reviewer:** [architecture-skeptic or agent name]
**Issues Found:** [CRITICAL: X, HIGH: Y, MEDIUM: Z, LOW: W]
**Resolution:** [How CRITICAL/HIGH issues were addressed]

---

## Conclusion

**Calibration Status:** [SUCCESS / PARTIAL / FAILED]

**Success Criteria Met:**
- [ ] Hindcast accuracy improved to target
- [ ] Monte Carlo determinism maintained (CV < 0.01%)
- [ ] Research validation passed (Grade B+ or higher)
- [ ] Architecture review passed (Grade B+ or higher)
- [ ] No regressions introduced

**Future Work:**
- [Any follow-up calibrations needed]
- [Any uncertainties remaining]
- [Any better data sources to monitor]

**Recommendation:** [MERGE / DEFER / REJECT]

---

## Metadata

**Commits:**
- [commit hash]: [Commit message]
- [commit hash]: [Commit message]

**Related Files:**
- Research: `research/[topic]_[date].md`
- Validation: `reviews/[validation_file].md`
- Change Proposal: `openspec/changes/[feature]/`

**Registry Entry:** Updated in `docs/CALIBRATION_OWNERSHIP.md`

---

## Appendix: Raw Data

[Include any raw data tables, intermediate calculations, or supplementary analysis here]

**Example:**
```
Regional CDR data (UN WPP 2024):
Region          1990   1995   2000   2005   2010   2015   2020
Sub-Saharan     15.5   14.7   14.2   12.8   11.2    9.8    8.7
Europe          10.5   10.8   10.9   10.8   10.9   11.0   11.0
[...]
```
