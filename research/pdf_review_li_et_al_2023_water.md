# PDF Review: Li et al. (2023) - AI Water Consumption

**Reviewer:** Sylvia (Research Skeptic)
**Date:** October 29, 2025
**PDF:** `research/pdfs/li_2023_making_ai_less_thirsty_uncovering_and.pdf`
**Status:** ✅ PAPER VERIFIED, ❌ METRIC FABRICATED

---

## Citation Verification

### ✅ CORRECT INFORMATION

**Authors:** Li, P., Yang, J., Islam, M. A., & Ren, S. (2023)
**Title:** "Making AI Less 'Thirsty': Uncovering and Addressing the Secret Water Footprint of AI Models"
**Source:** arXiv:2304.03271v5 [cs.LG] 26 Mar 2025
**Affiliations:** UC Riverside (Li, Yang, Ren), UT Arlington (Islam)

**Paper quality:** ✅ HIGH
- 10 pages + appendix
- 36 references
- Rigorous methodology
- Multiple data sources (Google, Microsoft, Meta sustainability reports)

---

## ❌ FABRICATED METRIC IDENTIFIED

### Claim in our research documents:
> "Water consumption: 500-700 liters per GPU-hour (Ren et al. 2024)"

### Verification result: **FABRICATED**

**The metric "500-700 liters per GPU-hour" does NOT exist in this paper.**

---

## ✅ WHAT THE PAPER ACTUALLY SAYS

### 1. GPT-3 Training Water Consumption (TOTAL, not per-hour)

**Page 1 (Abstract):**
> "training the GPT-3 language model in Microsoft's state-of-the-art U.S. data centers can directly evaporate **700,000 liters** of clean freshwater"

**Page 2:**
> "training GPT-3 in Microsoft's U.S. data centers can consume a total of **5.4 million liters** of water, including **700,000 liters** of scope-1 on-site water consumption"

**Training energy:** 1,287 MWh (from Patterson et al. 2021)
**This is TOTAL for entire training run, NOT per GPU-hour**

---

### 2. GPT-3 Inference Water Consumption (per request, not per GPU-hour)

**Page 2 (Abstract):**
> "GPT-3 needs to 'drink' (i.e., consume) a **500ml bottle of water** for roughly **10 – 50 medium-length responses**, depending on when and where it is deployed"

**Page 5, Table 1:** Water consumption per request varies by location:
- U.S. Average: 16.904 mL per request → **500ml bottle = 29.6 requests**
- Best (Ireland): 7.107 mL per request → **500ml bottle = 70.4 requests**
- Worst (Washington): 47.506 mL per request → **500ml bottle = 10.5 requests**

**This is per INFERENCE REQUEST, NOT per GPU-hour**

---

### 3. Actual Metrics Used in Paper: L/kWh (NOT per GPU-hour)

**Page 3-4:** The paper uses **WUE (Water Usage Effectiveness)** measured in **liters per kilowatt-hour (L/kWh)**

**Scope-1 (on-site cooling) WUE:**
- Google global average: **1.0 L/kWh**
- Range: 0.010 L/kWh (Finland, Denmark) to 1.900 L/kWh (Indonesia)
- U.S. average: **0.550 L/kWh**

**Scope-2 (electricity generation) EWIF (Electricity Water Intensity Factor):**
- U.S. average: **3.14 L/kWh**
- Range: 1.287 L/kWh (Texas) to 9.501 L/kWh (Washington state)

**The paper NEVER uses "per GPU-hour" as a metric anywhere.**

---

## 🚨 HOW THE FABRICATION LIKELY HAPPENED

**Theory:** The fabrication mixed up multiple real numbers from the paper:
1. ✅ **500ml bottle** (real, from inference calculation)
2. ✅ **700,000 liters** (real, GPT-3 training total)
3. ❌ **"per GPU-hour"** (fabricated unit - doesn't exist in paper)
4. ❌ **"500-700"** (fabricated range combining the two numbers above)

**Pattern:** Real paper + real numbers + invented metric = plausible-sounding but false claim

---

## 📊 CORRECT NUMBERS FOR SIMULATION USE

### Option 1: Total Training Consumption
- **GPT-3 (175B params):** 700,000 L scope-1, 5.4M L total (scope-1 + scope-2)
- **Training energy:** 1,287 MWh
- **Use case:** Calculate water per capability point advancement

### Option 2: WUE (Water Usage Effectiveness)
- **Scope-1 (on-site):** 0.010-1.900 L/kWh (location-dependent)
- **Scope-2 (electricity):** 1.287-9.501 L/kWh (location-dependent)
- **U.S. averages:** 0.550 L/kWh (scope-1), 3.14 L/kWh (scope-2)
- **Use case:** Calculate water consumption from GPU energy consumption

### Option 3: Per-Request Inference
- **10-50 responses per 500ml bottle** (location-dependent)
- **7.1-47.5 mL per medium-length request** (Table 1, Page 5)
- **Use case:** Model inference water costs in deployed AI systems

---

## 🔍 IMPORTANT CAVEATS FROM PAPER

### User's Concern: "2023 data is outdated for October 2025"

**The paper addresses this (Page 6, Section 3.3.2):**
> "Our estimate of inference water consumption for GPT-3 is on the **conservative side**, and the actual water consumption could be **several times higher**."

> "Furthermore, we emphasize that Microsoft's data centers already have some of the **lowest on-site WUE in the industry**. If the same model is deployed in a third-party colocation data center, the scope-1 direct water consumption is expected to be **several times higher**."

**Paper's projection (Page 1-2):**
- Global AI projected to consume **4.2-6.6 billion cubic meters** of water in 2027
- Equivalent to total annual water withdrawal of **4-6 Denmark or half of UK**

**Paper acknowledges efficiency improvements (Page 6):**
> "With continued efforts to reduce AI's computational demand and improve the overall water efficiency, the water consumption per request may decrease in the future."

**BUT also warns (Page 6):**
> "However, the **total water consumption is likely to continue rising** due to the growing demand for AI services and the increasing scale of AI applications."

---

## ✅ VERDICT

**Citation accuracy:** ✅ CORRECT (authors, title, year, source)
**Metric accuracy:** ❌ FABRICATED ("500-700 L/GPU-hour" does not exist)
**Paper quality:** ✅ HIGH (rigorous, well-sourced, conservative estimates)

**Recommendation:**
1. ❌ **REMOVE** "500-700 liters per GPU-hour" from all research documents
2. ✅ **REPLACE** with actual metrics from paper (L/kWh or total consumption)
3. ⚠️ **NOTE** that 2023 data is conservative (likely underestimates 2025 consumption)
4. ✅ **USE** WUE metrics (L/kWh) for simulation, NOT fabricated per-GPU-hour values

**User's concern is VALID:** The paper itself acknowledges water consumption per request will vary based on:
- Data center location (WUE varies 190×: 0.010 to 1.900 L/kWh)
- Electricity grid fuel mix (EWIF varies 7×: 1.287 to 9.501 L/kWh)
- Cooling technology (liquid vs air, dry coolers vs evaporative)
- Future efficiency improvements (algorithmic + hardware)

For 2024-2025 simulation, we need current efficiency data, not 2023 averages.

---

**Next steps for research:**
1. Find 2024-2025 data center WUE metrics (if published)
2. Find 2024-2025 GPU training water consumption totals (GPT-4.5, Claude 3.5, Llama 3)
3. Establish methodology for converting WUE (L/kWh) to simulation-usable metrics
4. Document all assumptions explicitly

**Status:** Paper verified, fabrication documented, replacement metrics identified
