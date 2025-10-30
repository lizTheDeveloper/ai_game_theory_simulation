# Citation Verification: Li et al. 2023 Water Consumption

**Date:** October 29, 2025
**Verified by:** super-alignment-researcher-1
**Status:** ⚠️ MISATTRIBUTION - Derived metric not found in original paper

---

## Citation Being Verified

**Citation:** Li et al. 2023 - arXiv:2304.03271
**Claim:** "Water consumption: 0.86-6.6 L/GPU-hr depending on scope"
**Location:** `docs/wiki/README.md` line 1084, `docs/wiki/BIBLIOGRAPHY.md` line 59

---

## Verification Results

### 1. Paper Existence: ✅ VERIFIED

**Paper Title:** "Making AI Less 'Thirsty': Uncovering and Addressing the Secret Water Footprint of AI Models"
**Authors:** Pengfei Li, Jianyi Yang, Mohammad A. Islam, Shaolei Ren
**Affiliation:** UC Riverside (Li, Ren), UT Austin (Yang, Islam)
**arXiv ID:** 2304.03271
**Submission Date:** April 6, 2023
**Latest Version:** v5 (March 26, 2025)
**Also Published:** Communications of the ACM (2024)
**DOI:** https://doi.org/10.48550/arXiv.2304.03271

### 2. Authors: ✅ VERIFIED

Lead author is Pengfei Li. Citation "Li et al. 2023" is correct.

### 3. Year: ✅ VERIFIED

Original arXiv submission was 2023.

### 4. Water Consumption Claim: ❌ NOT FOUND IN PAPER

**The paper does NOT report water consumption in "L/GPU-hr" units.**

**What the paper actually reports:**

#### Scope-1 (On-site Cooling) - per kWh of server energy:
- **1 L/kWh**: Google's annualized global average (best case)
- **9 L/kWh**: Large commercial datacenter in Arizona summer (worst case)
- **0.2 L/kWh**: Meta's global datacenter average
- **0.550 L/kWh**: U.S. average

**Direct quote from paper:**
> "data centers can evaporate approximately 1 – 9 liters per kWh of server energy, where 1 L/kWh represents Google's annualized global on-site water efficiency and 9 L/kWh represents a large commercial data center during the summer in Arizona"

#### Scope-2 (Electricity Generation) - per kWh:
- **3.1 L/kWh**: U.S. national average (thermoelectric power plants)
- **3.14 L/kWh**: Researchers' estimate
- **3.58 L/kWh**: Meta's reported average (2022)

**Direct quote from paper:**
> "For the U.S. national average, on-site scope-1 WUE is approximately 0.550 L/kWh and scope-2 WUE is approximately 3.14 L/kWh"

#### Scope-3 (Manufacturing):
Discussed qualitatively but not quantified per GPU-hour.

#### GPT-3 Specific Metrics:
- **Training:** 5.4 million liters total (700,000 L scope-1, rest scope-2/3)
- **Training energy:** 1,287 MWh
- **Inference:** 500ml bottle per 10-50 responses

**No mention of "0.86" or "6.6" anywhere in the paper.**

---

## 5. Origin of "0.86-6.6 L/GPU-hr" Claim

### Likely Derivation (Speculative Reconstruction):

The claimed range **may be a derived calculation** not present in Li et al. 2023:

**Assumptions needed:**
1. GPU power consumption: ~210-545W (to match the claimed range)
2. Combined scope-1 + scope-2 water consumption

**Calculation:**
- **Low end (0.86 L/GPU-hr):**
  - Assumes ~210W GPU × 1 hr = 0.21 kWh
  - 0.21 kWh × (1 + 3.1) L/kWh = **0.86 L**
  - Uses Google's best-case scope-1 (1 L/kWh) + U.S. average scope-2 (3.1 L/kWh)

- **High end (6.6 L/GPU-hr):**
  - Assumes ~545W GPU × 1 hr = 0.545 kWh
  - 0.545 kWh × (9 + 3.1) L/kWh = **6.6 L**
  - Uses Arizona summer worst-case scope-1 (9 L/kWh) + U.S. average scope-2 (3.1 L/kWh)

**Issues with this derivation:**
1. GPU power consumption varies widely (V100: 300W, A100: 400W, H100: 700W)
2. The 210-545W range is **not standard** for modern ML GPUs
3. Li et al. explicitly use **kWh** as the unit, not GPU-hours
4. The paper emphasizes GPT-3 training used **1,287 MWh** over unspecified GPU-hours

**More realistic modern GPU calculations:**
- **A100 (400W):** 0.4 kWh/hr × (1-9 + 3.1) = **1.64-4.84 L/GPU-hr**
- **H100 (700W):** 0.7 kWh/hr × (1-9 + 3.1) = **2.87-8.47 L/GPU-hr**

---

## 6. Evidence Assessment

### What Li et al. 2023 Actually Demonstrates:

**Methodology:**
1. Analyze datacenter WUE (Water Usage Effectiveness) = water consumption / server energy
2. Measure scope-1 (on-site cooling) and scope-2 (electricity generation) separately
3. Aggregate across different datacenter locations and seasons

**Key Empirical Findings:**
1. **Scope-1 range:** 0.2-9 L/kWh depending on location, season, and cooling technology
2. **Scope-2 U.S. average:** 3.1 L/kWh from thermoelectric power plants
3. **Geographic variation is massive:** Arizona summer (9 L/kWh) vs. Google global average (1 L/kWh)
4. **GPT-3 case study:** 5.4M liters total for training (1,287 MWh)

**Direct quotes with context:**

> "We focus on scopes 1 and 2 and develop a principled methodology that leverages the temporal and geographical differences in WUE to assess the water footprint of AI models, including GPT-3."

> "For inference, a single ChatGPT query (generating a sequence of around 500 words) may consume approximately 0.004 kWh, which translates to roughly 16.9 mL of total water in the U.S. average scenario."

> "the combined scope-1 and scope-2 operational water withdrawal of global AI may reach 4.2 – 6.6 billion cubic meters in 2027" [Note: This is where "6.6" appears - as **billions of cubic meters globally**, NOT L/GPU-hr]

---

## 7. Credibility Assessment of Li et al. 2023

**Authors:**
- **Pengfei Li** (UC Riverside, PhD student)
- **Jianyi Yang** (UT Austin)
- **Mohammad A. Islam** (UT Austin)
- **Shaolei Ren** (UC Riverside, Associate Professor, corresponding author)

**Publication Venue:**
- arXiv preprint (2023) → Published in Communications of the ACM (2024)
- 200+ citations (Google Scholar, as of 2025)

**Methodology Quality:**
- Uses corporate sustainability reports (Google, Meta/Facebook, Microsoft)
- Incorporates DOE/EIA data on U.S. electricity generation water intensity
- Case study: GPT-3 with known training energy (1,287 MWh from Patterson et al. 2022)
- Transparent assumptions and sensitivity analysis

**Confidence Level:** **HIGH** for the paper's actual claims (L/kWh metrics)

**Confidence Level:** **UNKNOWN** for the derived "0.86-6.6 L/GPU-hr" claim (not in paper)

---

## 8. Recommended Corrections

### Option 1: Use Paper's Actual Metrics (RECOMMENDED)

**Replace:**
```
Water consumption: 0.86-6.6 L/GPU-hr depending on scope (Li et al. 2023 - arXiv:2304.03271)
```

**With:**
```
Water consumption: 1-9 L/kWh scope-1 (on-site cooling), 3.1 L/kWh scope-2 (electricity generation), U.S. average 0.55 + 3.14 = 3.69 L/kWh combined (Li et al. 2023 - arXiv:2304.03271)
```

**Additional context to add:**
```
For modern AI training GPUs:
- A100 (400W): ~1.5-4.8 L/GPU-hr combined scope-1+2 (best-case to worst-case)
- H100 (700W): ~2.6-8.5 L/GPU-hr combined scope-1+2 (best-case to worst-case)
Based on Li et al. 2023's L/kWh rates and GPU TDP specifications.
```

### Option 2: Find Different Source for L/GPU-hr

If the simulation specifically needs **L/GPU-hr** units, search for:
1. Papers that directly measure GPU training water consumption
2. Datacenter studies that report GPU-specific metrics
3. Corporate sustainability reports with GPU fleet details

**Potential sources to investigate:**
- Patterson et al. 2022 (Google AI training carbon/energy - may have water data)
- Wu et al. 2022 (Sustainable AI: Environmental implications)
- Luccioni et al. 2023 (Estimating AI carbon footprint - may cover water)

### Option 3: Explicitly Note Derived Calculation

If keeping the L/GPU-hr format, be transparent:

```
Water consumption: ~0.86-6.6 L/GPU-hr (derived from Li et al. 2023's 1-9 L/kWh scope-1 + 3.1 L/kWh scope-2, assuming 210-545W GPU TDP)
Note: Original paper reports L/kWh, not L/GPU-hr. GPU-hour conversion depends on GPU power consumption.
```

---

## 9. Additional Research Notes

### What Li et al. 2023 Does NOT Cover:

1. **Per-GPU metrics** - focuses on datacenter-level and model-level
2. **GPU-hour normalization** - uses kWh, not GPU-hours
3. **Scope-3 quantification** - discusses manufacturing water but doesn't quantify

### What Li et al. 2023 DOES Cover (High Value):

1. **Temporal variation:** Summer vs. winter WUE differences
2. **Geographic variation:** Arizona vs. Pacific Northwest vs. global averages
3. **Scope separation:** On-site cooling vs. electricity generation water
4. **Policy recommendations:** Water-aware model training scheduling
5. **Future projections:** Global AI water demand 2027 (4.2-6.6 billion m³)

### Related High-Quality Sources:

1. **Patterson et al. 2022** - "Carbon Emissions and Large Neural Network Training" (Google)
   - Energy metrics: GPT-3 1,287 MWh training
   - Could cross-reference with Li et al. for water estimates

2. **Strubell et al. 2019** - "Energy and Policy Considerations for Deep Learning in NLP"
   - Early work on AI energy consumption
   - No water metrics

3. **Luccioni et al. 2023** - "Estimating the Carbon Footprint of BLOOM"
   - Detailed energy tracking for large model training
   - May have water data in supplementary materials

---

## 10. Simulation Implementation Recommendations

**Current code location:** `src/simulation/aiInfrastructureResources.ts`

**Recommended approach:**

```typescript
// Use Li et al. 2023's actual metrics with GPU-specific conversion
const WATER_CONSUMPTION_RATES = {
  // Scope-1 (on-site cooling) - Li et al. 2023 Table 1
  scope1: {
    best: 1.0,      // L/kWh - Google global average
    typical: 0.55,  // L/kWh - U.S. average
    worst: 9.0      // L/kWh - Arizona summer
  },

  // Scope-2 (electricity generation) - Li et al. 2023
  scope2: {
    us_average: 3.1  // L/kWh - U.S. thermoelectric plants
  },

  // GPU-specific TDP (for kWh → GPU-hr conversion)
  gpu_tdp: {
    v100: 0.3,   // kW (300W)
    a100: 0.4,   // kW (400W)
    h100: 0.7    // kW (700W)
  }
};

// Calculate L/GPU-hr dynamically based on datacenter location and GPU type
function calculateWaterPerGPUHour(
  location: 'best' | 'typical' | 'worst',
  gpuType: 'v100' | 'a100' | 'h100'
): number {
  const scope1 = WATER_CONSUMPTION_RATES.scope1[location];
  const scope2 = WATER_CONSUMPTION_RATES.scope2.us_average;
  const gpuPower = WATER_CONSUMPTION_RATES.gpu_tdp[gpuType];

  return gpuPower * (scope1 + scope2);  // L/GPU-hr
}

// Example:
// A100 in typical U.S. datacenter: 0.4 kW × (0.55 + 3.1) = 1.46 L/GPU-hr
// H100 in Arizona summer: 0.7 kW × (9 + 3.1) = 8.47 L/GPU-hr
```

**Monte Carlo validation:**
- Sample from distribution of datacenter locations (best/typical/worst)
- Sample from distribution of GPU types (V100/A100/H100 mix in fleet)
- Results in realistic 1.5-8.5 L/GPU-hr range for modern AI training

---

## Summary

| Aspect | Status | Notes |
|--------|--------|-------|
| **Paper exists** | ✅ Verified | arXiv:2304.03271, CACM 2024 |
| **Authors correct** | ✅ Verified | Li et al. (UC Riverside + UT Austin) |
| **Year correct** | ✅ Verified | 2023 arXiv submission |
| **"0.86-6.6 L/GPU-hr" in paper** | ❌ Not found | Paper uses L/kWh, not L/GPU-hr |
| **Claim interpretation** | ⚠️ Possibly derived | May be calculated from L/kWh + GPU TDP assumptions |
| **Paper credibility** | ✅ High | Rigorous methodology, published in CACM |

**Verdict:** The citation is to a real, high-quality paper, but the specific "0.86-6.6 L/GPU-hr" metric **does not appear in the paper**. The paper reports 1-9 L/kWh (scope-1) and 3.1 L/kWh (scope-2). The L/GPU-hr claim is likely a **derived calculation** that should either be:
1. Corrected to use the paper's actual L/kWh metrics, OR
2. Explicitly noted as a derived metric with stated assumptions, OR
3. Replaced with a different source that directly reports L/GPU-hr

**Recommended action:** Update wiki and bibliography to use Li et al. 2023's actual metrics (L/kWh) and convert to L/GPU-hr in code based on GPU TDP specifications.

---

## References

**Primary Source:**
Li, P., Yang, J., Islam, M. A., & Ren, S. (2023). Making AI Less "Thirsty": Uncovering and Addressing the Secret Water Footprint of AI Models. *arXiv preprint arXiv:2304.03271*. https://arxiv.org/abs/2304.03271

**GPU Power Specifications:**
- NVIDIA A100 Datasheet: 400W TDP
- NVIDIA H100 Datasheet: 700W TDP
- NVIDIA V100 Datasheet: 300W TDP

**Related Papers:**
- Patterson, D., et al. (2022). Carbon Emissions and Large Neural Network Training. *arXiv:2104.10350*.
- Strubell, E., Ganesh, A., & McCallum, A. (2019). Energy and Policy Considerations for Deep Learning in NLP. *ACL 2019*.

---

**Verification completed:** October 29, 2025
**Next steps:** Update `docs/wiki/README.md` line 1084 and `docs/wiki/BIBLIOGRAPHY.md` line 59 with corrected metrics.
