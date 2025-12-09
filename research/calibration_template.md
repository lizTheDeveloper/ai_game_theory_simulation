# Calibration: [Parameter Name]

**Date:** YYYY-MM-DD
**Calibrator:** [worker-name or agent-name]
**Research Branch:** [git branch if applicable]
**Status:** [IN_PROGRESS / COMPLETED / BLOCKED]

---

## 1. Motivation

**Why is this calibration needed?**

*(Describe the problem being solved - e.g., hindcast deviation, Monte Carlo unrealistic behavior, new research contradicting current values, physical constraints violated)*

**Current behavior:**
- *(What happens with current parameter values?)*
- *(Quantify the issue - e.g., "10% overshoot in 2020 hindcast")*

**Expected improvement:**
- *(What should happen after calibration?)*
- *(Target metrics - e.g., "<5% deviation across all checkpoint years")*

---

## 2. Research Backing

**Primary sources:**

1. [Author et al. (Year)] "Paper Title" - *Journal*
   - **Key finding:** *(Extract specific parameter value or range)*
   - **Zotero ID:** [if tracked]
   - **Quality:** [peer-reviewed / gray literature / report]
   - **Recency:** [2024-2025 preferred, note if older]

2. [Author et al. (Year)] "Paper Title" - *Journal*
   - **Key finding:** *(Extract specific parameter value or range)*
   - **Zotero ID:** [if tracked]
   - **Quality:** [peer-reviewed / gray literature / report]

**Supporting sources:**

3. *(Additional sources that corroborate findings)*

**Contradictory evidence:**

- *(If any sources disagree, document them here)*
- *(Explain why primary sources were chosen over contradictory ones)*

---

## 3. Current Value

**Location:** `src/simulation/[path/to/file.ts:line]`

**Current implementation:**
```typescript
// Code snippet showing current parameter value
const parameterName = 0.50; // Current value
```

**Rationale (if known):**
- *(Why was this value chosen originally?)*
- *(If unknown, note: "Initial value, source unclear")*

**Current validation results:**
- Hindcast: *(Deviation from historical data)*
- Monte Carlo: *(Typical outcomes with current value)*
- Physical constraints: *(Violations if any)*

---

## 4. Proposed Value

**New value:** `[specific number with units]`

**Calculation (if derived):**
```
[Show math if computing from source data]
Example:
  Source: 34-51 GJ/tCO2 (MIT Energy Initiative 2024)
  Convert: 34 GJ/tCO2 × (1 kWh / 3.6 MJ) = 9,444 kWh/tCO2
  Midpoint: (9,444 + 14,167) / 2 ≈ 11,800 kWh/tCO2
```

**Uncertainty range:**
- **Low estimate:** [lower bound] *(conservative scenario)*
- **Best estimate:** [midpoint] *(baseline value)*
- **High estimate:** [upper bound] *(optimistic scenario)*
- **Confidence:** [high / medium / low]

**Justification:**
- *(Why this specific value within the range?)*
- *(Conservative vs aggressive calibration choice)*
- *(Alignment with other parameters in system)*

---

## 5. Validation

### Hindcast Validation (if applicable)
**Test:** Run simulation 1990-2024 with new parameter value

**Results:**
| Year | Historical | Simulated | Deviation |
|------|-----------|-----------|-----------|
| 1990 | [value] | [value] | [%] |
| 2000 | [value] | [value] | [%] |
| 2010 | [value] | [value] | [%] |
| 2020 | [value] | [value] | [%] |

**Assessment:** [PASS / FAIL / CONDITIONAL]
- *(Comment on accuracy improvement)*

### Monte Carlo Validation
**Test:** N≥10 runs with new parameter (seeds 420-429)

**Results:**
- **Determinism check:** CV < 0.01%? [YES / NO]
- **Typical outcomes:** *(Distribution of final states)*
- **Physical constraints:** *(Any violations?)*
- **Edge case behavior:** *(Does parameter cause crashes or unrealistic extremes?)*

**Assessment:** [PASS / FAIL / CONDITIONAL]

### Physical Constraints Check
- **Energy conservation:** [OK / VIOLATED]
- **Mass conservation:** [OK / VIOLATED]
- **Momentum conservation:** [OK / VIOLATED]
- **Thermodynamic limits:** [OK / VIOLATED]
- **Dimensional analysis:** [OK / VIOLATED]

---

## 6. Implementation

**Files modified:**
- `src/simulation/[file1.ts]` - *(Description of change)*
- `src/simulation/[file2.ts]` - *(Description of change)*
- `src/types/game.ts` - *(If interface changes needed)*

**Code changes:**
```typescript
// Before
const oldParameter = 0.50;

// After
const newParameter = 0.70; // Calibrated to [SOURCE]
```

**Side effects:**
- *(What else changes when this parameter is updated?)*
- *(Interactions with other systems)*
- *(Downstream validation needed)*

**Testing:**
```bash
# Commands to validate implementation
npm test
npx tsx scripts/monteCarloSimulation.ts
```

---

## 7. Uncertainty & Limitations

**Known uncertainties:**
- *(Parameter ranges in literature)*
- *(Measurement error in source data)*
- *(Model structural uncertainty)*

**Limitations:**
- *(What isn't captured by this calibration?)*
- *(Missing mechanisms or interactions)*
- *(Future research needs)*

**Sensitivity:**
- *(How sensitive are outcomes to this parameter?)*
- *(If uncertain, what's the impact range?)*

---

## 8. Next Steps

**After completion:**
- [ ] Update `docs/CALIBRATION_OWNERSHIP.md` (mark STABLE)
- [ ] Commit changes to branch
- [ ] Run full validation suite
- [ ] Update wiki documentation (if mechanic description changed)
- [ ] Post summary to coordination channel

**Future calibration needs:**
- *(Identify related parameters that may need tuning)*
- *(Note dependencies for future work)*

---

## 9. Sign-off

**Calibrator:** [name]
**Date completed:** YYYY-MM-DD
**Research validation grade:** [A+ / A / A- / B+ / B / B- / C+ / C / D / F]
**Architecture review grade:** [if applicable]
**Merged to:** [branch name / commit hash]

---

**Notes:**

*(Any additional context, gotchas, or future considerations)*
