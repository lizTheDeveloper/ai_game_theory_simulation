# Citation Verification: DARK_COMPUTE_MONITORING_PARAMS (Tier 2 Interventions)

**Date:** 2025-11-04
**File:** `src/simulation/thresholds/tier2InterventionConfig.ts` (lines 80-104)
**Verification Status:** ⚠️ PARTIALLY VERIFIED - CLAIMS REQUIRE CORRECTION

---

## Summary

The code claims a 70-95% detection rate for dark compute monitoring based on "Epoch AI 2024" research and CTBTO analogy. After thorough investigation, I found:

1. **CTBTO claim (90% network, all 6 NK tests detected):** ✅ **VERIFIED**
2. **Shavit 2023 on-chip governance:** ✅ **VERIFIED** (but provides 90% detection probability, not 70-95% range)
3. **Sastry 2024 compute governance:** ✅ **VERIFIED** (discusses compute monitoring but no specific detection rates)
4. **"Epoch AI 2024" energy monitoring with 70-95% detection rate:** ❌ **UNVERIFIED** - No such publication exists

---

## Detailed Findings

### 1. CTBTO Monitoring Network Performance

**Claim in code (line 80):**
> "CTBTO analogy: 90% network, all 6 NK nuclear tests detected"

**Verification Status:** ✅ **VERIFIED**

**Evidence from CTBTO official sources:**

**Network Coverage:**
- "Around 90 percent of the Treaty's 337 IMS (International Monitoring System) facilities are already up and running, providing real-time monitoring capabilities globally."
- Construction began in 1996 and is now 90% complete.

**North Korea Detection Performance:**
- **All six North Korea nuclear tests detected (2006-2017):**
  - 2006 test: Detected by "more than 20 seismic stations" (network only 60% operational)
  - 2009 test: Recorded at "more than 60 seismic stations around the world" (75% operational)
  - 2013 test: Registered by "94 seismic stations and two infrasound stations"
  - 2017 test: "Registered by more than 100 monitoring stations"

**Direct Quote (CTBTO official statement):**
> "The system has proven highly effective at detecting North Korea's activities: The system has already proved its effectiveness, detecting all six of North Korea's declared nuclear tests between 2006 and 2017."

**Speed of Detection:**
> "Member States received information about the location, magnitude, time and depth of North Korea's nuclear tests within two hours."

**Assessment:** The CTBTO analogy is accurate and well-supported. The 90% network coverage and 100% detection rate (6/6 tests) are verified facts.

---

### 2. Shavit 2023: "What does it take to catch a Chinchilla?"

**Citation:** Shavit, Y. (2023). "What does it take to catch a Chinchilla? Verifying Rules on Large-Scale Neural Network Training via Compute Monitoring." arXiv:2303.11341

**Verification Status:** ✅ **VERIFIED** (paper exists and discusses on-chip governance)

**Key Findings:**

**On-chip governance framework (direct quote):**
> "The system consists of interventions at three stages: (1) using on-chip firmware to occasionally save snapshots of the neural network weights stored in device memory, in a form that an inspector could later retrieve; (2) saving sufficient information about each training run to prove to inspectors the details of the training run that had resulted in the snapshotted weights; and (3) monitoring the chip supply chain to ensure that no actor can avoid discovery by amassing a large quantity of un-tracked chips."

**Detection Probability (90%, not 70-95%):**
> "Given C = 10^7 worldwide chips (> 5× global stocks as of 2022), each of which can output a = 3·10^15·86400 FLOPs per day (3× more FLOP/s than the NVIDIA H100), detecting a Chinchilla-280B-sized run within T = 30 days of its completion anywhere on earth with **90% probability** would require roughly 232,000 worldwide chip samples per year."

**IAEA analogy (not CTBTO):**
> "This would require ≈232 inspectors, slightly smaller than the 280 active IAEA inspectors as of 2021."

**Critical Finding:** Shavit 2023 discusses a **90% detection probability** for a specific scenario (Chinchilla-scale training runs with physical chip inspection), NOT the 70-95% range claimed in the code. The paper focuses on **on-chip firmware monitoring** and **physical inspection**, not energy monitoring.

---

### 3. Sastry 2024: "Computing Power and the Governance of Artificial Intelligence"

**Citation:** Sastry, G. et al. (2024). "Computing Power and the Governance of Artificial Intelligence." arXiv:2402.08797

**Verification Status:** ✅ **VERIFIED** (paper exists and discusses compute governance)

**Key Findings:**

**Compute as intervention point:**
> "AI-relevant compute is a particularly effective point of intervention: it is detectable, excludable, and quantifiable, and is produced via an extremely concentrated supply chain."

**On-chip controls mentioned:**
> "Controls could include physical limits on chip-to-chip networking, or cryptographic technology that allows for remote disabling of AI chips in extreme circumstances."

**Privacy-preserving workload monitoring:**
> "Privacy-preserving 'workload monitoring' to help prevent an arms race if massive compute investments are made without enough transparency."

**GPU market concentration (relevant for enforcement):**
> "Several other links in the supply chain are also dominated by a few providers, including datacenter GPU design (where NVIDIA has a market share of over 90%)."

**Critical Finding:** Sastry 2024 discusses compute governance mechanisms and mentions the concentrated supply chain (NVIDIA 90% market share), but does **NOT provide specific detection rate estimates** (no "70-95%" or similar quantitative claims about monitoring effectiveness).

---

### 4. "Epoch AI 2024" Energy Monitoring Claim

**Claim in code (line 93-94):**
> "Citations: Epoch AI compute analysis (2024)"
> "Energy monitoring (Epoch AI 2024) + CTBTO analogy (90% network) + on-chip governance"

**Verification Status:** ❌ **UNVERIFIED** - No such publication found

**Search Results:**
1. **Epoch AI website search:** No publications about "illicit AI training detection" or "energy monitoring for unauthorized compute"
2. **2024 Epoch AI publications found:**
   - Power usage trends (frontier AI power doubling annually)
   - Compute forecasting through 2030
   - Hardware costs and energy requirements
   - None address **detection rates for illicit training**

3. **Epoch AI 2024 Impact Report:** Focuses on tracking trends, forecasting compute needs, and analyzing costs. Does NOT propose detection mechanisms.

**What Epoch AI DOES publish:**
- Energy consumption data (GPT-4: ~50 GWh, GPT-3: 1.29 GWh)
- Power requirements for frontier training (1-8 GW by 2028-2030)
- Compute scaling trends (4-5x/year)

**What Epoch AI does NOT publish:**
- Detection rates for unauthorized training (70-95% or otherwise)
- Monitoring frameworks for catching illicit compute
- Energy-based detection methodologies

**Assessment:** The "Epoch AI 2024" citation for the 70-95% detection rate appears to be a **misattribution**. Epoch AI provides energy consumption data, but not detection effectiveness estimates.

---

### 5. Origin of the 70-95% Detection Rate

**Search through research files:**

The 70-95% range appears in `/research/tier2_parameter_validation_20251026.md`:

```
Effect on sleeper AI detection: 70-95% detection (conditional on run size and monitoring deployment)
Citation: Energy monitoring, on-chip governance, CTBTO analogy
```

**Critical Issue:** This appears to be a **synthesized estimate** combining:
- Shavit 2023's 90% detection probability (for physical chip inspection)
- CTBTO's 90% network coverage (for nuclear test detection)
- Epoch AI's energy consumption data (descriptive, not prescriptive)

**No single source provides the 70-95% range.** The lower bound (70%) and upper bound (95%) do not appear in any of the cited papers.

---

## Energy Monitoring Evidence (DOES Exist)

While the 70-95% detection claim is unverified, **energy monitoring for large-scale AI training IS highly detectable**:

### From Epoch AI (descriptive data):
- **GPT-3 training:** 1.29 GWh over 14.8 days (10,000 V100 GPUs)
- **GPT-4 training:** ~50 GWh (40× GPT-3)
- **Future frontier models:** 1-8 GW continuous power draw by 2028-2030

### From Sastry 2024:
- Compute governance focuses on supply chain concentration
- NVIDIA 90% market share for datacenter GPUs
- Detectability through supply chain monitoring

### Energy Signature Detectability:
Large training runs (>1 GW) would create detectable energy signatures comparable to:
- Small towns (1 GW = 1 million homes at 1 kW each)
- Industrial facilities
- Nuclear power plants

However, **no peer-reviewed source quantifies detection effectiveness as "70-95%"**.

---

## Recommendations

### 1. Correct the Citation (CRITICAL)

**Current code (lines 91-95) - INCORRECT:**
```typescript
/**
 * Citations:
 * - CTBTO monitoring network performance (1996-2024)
 * - Epoch AI compute analysis (2024)  // ❌ DOES NOT EXIST
 * - On-chip governance proposals (Shavit 2023, Sastry 2024)
 */
```

**Recommended correction:**
```typescript
/**
 * Citations:
 * - CTBTO monitoring network: 90% coverage, 100% detection of NK tests (CTBTO 1996-2024)
 * - On-chip governance: Shavit 2023 (90% detection probability with physical inspection)
 * - Compute governance framework: Sastry et al. 2024 (supply chain monitoring)
 * - Energy consumption data: Epoch AI (descriptive trends, not detection rates)
 *
 * Note: 70-95% range is a synthesized estimate based on:
 * - Large-scale training energy signatures (>1 GW highly detectable)
 * - On-chip governance mechanisms (Shavit: 90% with inspection)
 * - Supply chain concentration (Sastry: NVIDIA 90% market share)
 * - CTBTO analogy (90% network, 100% test detection)
 * No single source provides the specific 70-95% range.
 */
```

### 2. Update Evidence Quality

**Current:** 🟡 MODERATE (upgraded from WEAK)

**Recommended:** 🟡 MODERATE (but note: synthesized estimate, not empirical)

**Justification:**
- ✅ Energy detectability is real (Epoch AI data)
- ✅ On-chip governance is feasible (Shavit 2023)
- ✅ Supply chain concentration enables enforcement (Sastry 2024)
- ✅ CTBTO analogy is valid (verified)
- ❌ Specific 70-95% range lacks empirical grounding
- ⚠️ "Epoch AI 2024" detection research does not exist

### 3. Add Detection Caveats

The 70-95% range should include:
- **Conditional on:** International treaty, chip manufacturer cooperation
- **Highly effective for:** Large runs (>1 GW)
- **Vulnerable to:** Distributed compute, older chips, custom ASICs
- **Analogous to:** CTBTO (not perfect, but high detection rate)

### 4. Create Proper Research File

Move detailed findings to: `/research/dark_compute_monitoring_feasibility_20251104.md`

Include:
- Energy signatures of frontier training runs
- On-chip governance mechanisms (Shavit)
- Supply chain concentration (Sastry)
- CTBTO analogy limitations
- Cost multipliers for circumvention (2-10×)

---

## Conclusion

**Verification Results:**

| Claim | Status | Source |
|-------|--------|--------|
| CTBTO 90% network, 6/6 NK tests | ✅ VERIFIED | CTBTO official |
| Shavit 2023 on-chip governance | ✅ VERIFIED | arXiv:2303.11341 |
| Sastry 2024 compute governance | ✅ VERIFIED | arXiv:2402.08797 |
| "Epoch AI 2024" detection research | ❌ UNVERIFIED | Does not exist |
| 70-95% detection rate | ⚠️ SYNTHESIZED | No single source |

**Key Issue:** The code attributes a specific detection rate (70-95%) to "Epoch AI 2024," but no such publication exists. The range appears to be a **reasonable but unverified estimate** synthesized from:
- Shavit's 90% detection probability (physical inspection)
- CTBTO's high detection rate (100% for NK tests)
- Energy signature detectability (Epoch AI descriptive data)
- Supply chain concentration (Sastry)

**Recommendation:** Update citations to accurately reflect that the 70-95% range is an **analogy-based estimate**, not an empirical finding from "Epoch AI 2024."

**Evidence Quality:** Remains 🟡 MODERATE, but requires citation correction to maintain research integrity.

---

## References

1. **CTBTO (1996-2024).** International Monitoring System. https://www.ctbto.org/our-work/international-monitoring-system
   - 90% network completion verified
   - All 6 North Korea nuclear tests detected (2006-2017)

2. **Shavit, Y. (2023).** "What does it take to catch a Chinchilla? Verifying Rules on Large-Scale Neural Network Training via Compute Monitoring." arXiv:2303.11341.
   - On-chip governance framework
   - 90% detection probability (with physical chip inspection)
   - IAEA-scale inspector requirements (≈232 inspectors)

3. **Sastry, G., Heim, L., et al. (2024).** "Computing Power and the Governance of Artificial Intelligence." arXiv:2402.08797.
   - Compute governance framework
   - Supply chain concentration (NVIDIA 90% market share)
   - Privacy-preserving workload monitoring proposals

4. **Epoch AI (2024).** Various publications on compute trends:
   - Power usage trends: https://epoch.ai/data-insights/power-usage-trend
   - Energy requirements: https://epoch.ai/blog/power-demands-of-frontier-ai-training
   - **Note:** No publication on detection rates for illicit AI training

---

**Verification conducted by:** Autonomous research agent
**Date:** 2025-11-04
**Status:** ⚠️ CITATION CORRECTION REQUIRED
