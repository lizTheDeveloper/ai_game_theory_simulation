# PDF Review: Patterson et al. (2022) - AI Energy Consumption

**Reviewer:** Sylvia (Research Skeptic)
**Date:** October 29, 2025
**PDF:** `research/papers/patterson_et_al_2022_carbon_footprint_ml.pdf`
**Status:** ✅ PAPER VERIFIED, ❌ METRIC FABRICATED

---

## Citation Verification

### ✅ CORRECT INFORMATION

**Authors:** Patterson, D., Gonzalez, J., Hölzle, U., Le, Q., Liang, C., Munguia, L-M., Rothchild, D., So, D., Texier, M., & Dean, J. (2022)
**Title:** "The Carbon Footprint of Machine Learning Training Will Plateau, Then Shrink"
**Source:** Published paper (Google + UC Berkeley)
**Affiliations:** Google Brain (Patterson, Hölzle, Le, Liang, Munguia, So, Texier, Dean), UC Berkeley (Patterson, Gonzalez, Rothchild)

**Paper quality:** ✅ VERY HIGH
- 12 pages
- 20 references
- Authoritative source (Google + UC Berkeley)
- Multiple case studies
- Real production data

---

## ❌ FABRICATED METRIC IDENTIFIED

### Claim in our research documents:
> "Energy demand: 300-400 kWh per training run (Patterson et al. 2022)"

### Verification result: **FABRICATED**

**The metric "300-400 kWh per training run" does NOT exist in this paper.**

**This is a UNITS ERROR fabrication - off by 1000×**

---

## ✅ WHAT THE PAPER ACTUALLY SAYS

### GPT-3 Energy Consumption (Page 6, Figure 3):

**Energy consumption:** **1,287 MWh** (NOT kWh!)

**Units conversion:**
- 1 MWh = 1,000 kWh
- **GPT-3: 1,287 MWh = 1,287,000 kWh**
- **Fabricated claim: "300-400 kWh"**
- **Error magnitude: 3,000-4,000× TOO SMALL**

---

### GLaM Energy Consumption (Page 6, Figure 3):

**Energy consumption:** **456 MWh** (more efficient than GPT-3)

**GLaM achievements:**
- 2.8× less energy than GPT-3
- Better accuracy than GPT-3
- 456 MWh = **456,000 kWh** (NOT "300-400 kWh")

---

## 📊 ACTUAL METRICS IN PAPER

The paper uses **MWh (MEGAWATT hours)** throughout, NEVER kWh for model training:

### Energy Formula (Page 4):
```
MWh = (Hours to train × Number of Processors × Average Power per Processor) × PUE
```

### Specific Models:
- **GPT-3 (2020):** 1,287 MWh on V100 GPUs
- **GLaM (2021):** 456 MWh on TPUv4s
- **Transformer (2017 baseline):** ~15.5 MWh (calculated from paper's efficiency improvements)

### The Paper NEVER mentions:
- ❌ "300-400 kWh"
- ❌ "per training run" (in the sense of a generic run)
- ❌ Any kWh metrics for full model training

---

## 🚨 HOW THE FABRICATION LIKELY HAPPENED

**Theory:** The fabricator made a units error:
1. ✅ Real paper discusses GPT-3 energy (1,287 MWh)
2. ❌ Confused MWh with kWh (1000× error)
3. ❌ Invented a range "300-400" (nowhere in paper)
4. ❌ Added "per training run" (vague, not in paper)

**Pattern:** Real paper + real concept (energy) + units confusion (MWh → kWh) + invented range = plausible-sounding but catastrophically wrong claim

**This is particularly dangerous** because it makes AI training energy look 1000× smaller than it actually is!

---

## 💡 CORRECT NUMBERS FOR SIMULATION USE

### Option 1: Use Actual Model Energy (MWh)
- **GPT-3 (175B params):** 1,287 MWh total
- **GLaM (1.2T params, 95B active):** 456 MWh total
- **Transformer (baseline 2017):** ~15-20 MWh estimated
- **Use case:** Calculate energy per capability advancement

### Option 2: Energy Reduction Factors (4Ms Framework)
The paper's "4Ms" best practices reduce energy by up to **100×**:

1. **Model:** Efficient architectures (sparse vs dense) → ~5-10× reduction
2. **Machine:** ML-optimized processors (TPU vs generic GPU) → 2-5× reduction
3. **Mechanization:** Cloud datacenters (better PUE) → 1.4-2× reduction
4. **Map:** Low-carbon locations (clean energy) → 5-10× carbon reduction

**Combined:** 83× energy reduction, 747× CO₂ reduction (2017 → 2021)

### Option 3: Trend Data (Google ML Energy)
**Page 7:** Google's ML energy = **10-15% of total** Google energy consumption
- Stable over 2019-2021 despite ML growth
- **⅗ (60%)** for inference, **⅖ (40%)** for training
- Google total 2020: 15.4 TWh → ML ≈ 1.5-2.3 TWh

---

## 🔍 KEY INSIGHTS FROM PAPER

### 1. Energy ≠ Carbon
**Carbon intensity varies 5× by location** (Page 4, Figure 2):
- Oklahoma: 96% carbon-free energy (CFE) in 2019
- Iowa: 93% CFE in 2020
- Nevada: 19% CFE
- **Same energy, 5× different carbon impact**

### 2. ML Energy Is NOT Skyrocketing
**Despite ML growth, percentage of Google's energy is stable** (Page 7):
- 2019, 2020, 2021: ML = 10-15% of total (consistent)
- Algorithmic + hardware improvements compensate for growth

### 3. Best Practices Work
**Figure 1 (Page 2):** Transformer model efficiency improvements:
- 2017 baseline: 1.0× reference
- 2019 (TPUv2 + best practices): 65× reduction
- 2021 (TPUv4 + best practices): **747× reduction** in CO₂

---

## ⚠️ CRITICAL NOTES

### Paper's Own Warnings About Extrapolation (Page 5):
> "These drastic overall improvements, as well as their trajectory over time, suggest that **extrapolating current parameters to predict future CO₂e is fraught with peril**."

**Why this matters for 2025 simulation:**
- Paper is from 2022 (based on 2021 data)
- Shows 747× improvement 2017 → 2021 (4 years)
- We're now in October 2025 (4 more years)
- **Cannot assume 2021 numbers are still accurate**

### Paper's Recommendation (Page 10):
> "ML researchers should [...] publish their energy consumption and carbon footprint, both in order to foster competition on more than just model quality and to ensure accurate accounting of their work, **which is difficult to do accurately post-hoc**."

**This is EXACTLY the problem we're having** - trying to estimate 2025 metrics from 2021 data!

---

## ✅ VERDICT

**Citation accuracy:** ✅ CORRECT (authors, title, year, affiliation)
**Metric accuracy:** ❌ CATASTROPHICALLY WRONG FABRICATION
- Claimed: "300-400 kWh"
- Actual: 1,287,000 kWh (GPT-3), 456,000 kWh (GLaM)
- **Error: 1000× underestimate (units confusion: kWh vs MWh)**

**Paper quality:** ✅ AUTHORITATIVE (Google + Berkeley, production data)

**Recommendation:**
1. ❌ **REMOVE** "300-400 kWh per training run" from ALL research documents
2. ✅ **REPLACE** with actual MWh values from paper (1,287 MWh for GPT-3)
3. ⚠️ **NOTE** that 2021 data may not reflect 2025 efficiency improvements
4. ✅ **DOCUMENT** that paper explicitly warns against extrapolation
5. 🔍 **SEARCH** for 2024-2025 energy consumption data for recent models

**User's concern is DOUBLY VALID:**
1. Paper uses 2021 data (4 years old for Oct 2025 simulation)
2. Paper itself shows 100-1000× improvements are possible in 4 years
3. Paper explicitly warns "extrapolating current parameters to predict future CO₂e is fraught with peril"

**For 2024-2025 simulation:**
- Need current model energy consumption (GPT-4.5, Claude 3.5, Llama 3, etc.)
- Need current data center PUE values (likely improved)
- Need current carbon intensity by region (renewable energy adoption increased)
- Paper's 2021 numbers are **baseline reference**, NOT current reality

---

## 📋 FABRICATION PATTERN RECOGNITION

**This is FABRICATION TYPE: Units Confusion**

**Characteristics:**
- ✅ Real paper (Patterson et al. 2022 exists)
- ✅ Real concept (ML training energy consumption)
- ❌ Wrong units (kWh instead of MWh)
- ❌ Wrong magnitude (1000× too small)
- ❌ Invented range ("300-400" not in paper)

**How to detect:**
1. Check units carefully (kWh vs MWh vs GWh)
2. Sanity check: "300 kWh to train GPT-3?" (that's ~$30 at $0.10/kWh - obviously wrong)
3. Verify specific numbers appear in paper (not just concepts)

**Remember:** This fabrication makes AI training look 1000× more energy-efficient than it actually is - **dangerously misleading** for climate impact assessment!

---

**Status:** Paper verified, catastrophic fabrication documented, correct metrics identified
**Next:** Continue systematic review of remaining PDFs
