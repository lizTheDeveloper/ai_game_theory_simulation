# URGENT: Citation Correction Required - DARK_COMPUTE_MONITORING_PARAMS

**Date:** 2025-11-04
**Priority:** HIGH
**File:** `src/simulation/thresholds/tier2InterventionConfig.ts` (lines 80-104)

---

## Executive Summary

The code claims "Epoch AI compute analysis (2024)" as the source for 70-95% detection rates for dark compute monitoring. **This publication does not exist.**

### Verification Results:

✅ **VERIFIED:**
- CTBTO 90% network coverage, 100% NK test detection (official CTBTO sources)
- Shavit 2023 on-chip governance (arXiv:2303.11341) - but claims **90%**, not 70-95%
- Sastry 2024 compute governance (arXiv:2402.08797) - no specific detection rates

❌ **UNVERIFIED:**
- "Epoch AI 2024" energy monitoring research with 70-95% detection rate **does not exist**
- The 70-95% range appears to be a **synthesized estimate** with no single source

---

## What Needs to Change

### Current Code (INCORRECT):
```typescript
/**
 * Citations:
 * - CTBTO monitoring network performance (1996-2024)
 * - Epoch AI compute analysis (2024)  // ❌ THIS DOES NOT EXIST
 * - On-chip governance proposals (Shavit 2023, Sastry 2024)
 */
export const DARK_COMPUTE_MONITORING_PARAMS = {
  detectionRate: {
    distribution: 'beta' as const,
    alpha: 6,
    beta: 2,
    bounds: [0.70, 0.95] as const,  // ❌ NO SOURCE FOR THIS RANGE
    citation: 'Energy monitoring (Epoch AI 2024) + CTBTO analogy (90% network) + on-chip governance'
  },
```

### Required Correction:
```typescript
/**
 * Citations:
 * - CTBTO monitoring network: 90% coverage, 100% NK test detection (CTBTO 1996-2024)
 * - Shavit 2023: On-chip governance, 90% detection probability (arXiv:2303.11341)
 * - Sastry 2024: Compute governance framework (arXiv:2402.08797)
 * - Epoch AI: Energy consumption data (descriptive, not detection rates)
 * 
 * Note: 70-95% is analogy-based estimate combining:
 * - Large training run energy signatures (>1 GW highly detectable)
 * - On-chip governance (Shavit: 90% with inspection)
 * - Supply chain concentration (Sastry: NVIDIA 90% market)
 * - CTBTO analogy (90% network, 100% test detection)
 */
export const DARK_COMPUTE_MONITORING_PARAMS = {
  detectionRate: {
    distribution: 'beta' as const,
    alpha: 6,
    beta: 2,
    bounds: [0.70, 0.95] as const,  // Synthesized from CTBTO analogy + energy detectability
    citation: 'CTBTO analogy (90% network, 6/6 NK tests) + Shavit 2023 (on-chip governance, 90%) + Sastry 2024 (supply chain) + Epoch AI (energy data)'
  },
```

---

## What the Sources Actually Say

### 1. CTBTO (VERIFIED)
- **90% network completion** (337 facilities, 303 operational)
- **100% detection rate** for North Korea's 6 nuclear tests (2006-2017)
- Detection within **2 hours** for all tests
- Worked even at 60% completion (2006 test)

**Source:** https://www.ctbto.org/our-work/detecting-nuclear-tests

### 2. Shavit 2023 (VERIFIED - but different number)
- **90% detection probability** for Chinchilla-scale training runs
- Requires ~232 inspectors (similar to IAEA)
- On-chip firmware snapshots + physical inspection
- **NOT 70-95% range**

**Source:** Shavit, Y. (2023). arXiv:2303.11341

### 3. Sastry 2024 (VERIFIED - but no detection rates)
- Compute governance framework
- NVIDIA 90% market share (supply chain concentration)
- Privacy-preserving workload monitoring
- **NO specific detection rate estimates**

**Source:** Sastry, G. et al. (2024). arXiv:2402.08797

### 4. Epoch AI 2024 (DOES NOT EXIST)
- Epoch AI publishes energy consumption **data** (GPT-4: ~50 GWh)
- They publish power **forecasts** (1-8 GW by 2028-2030)
- They do **NOT** publish detection rate research
- **NO paper on "illicit AI training detection"**

**Sources searched:** https://epoch.ai/research, multiple web searches

---

## Why This Matters

1. **Research Integrity:** Citing non-existent sources undermines the simulation's credibility
2. **Parameter Justification:** The 70-95% range lacks empirical grounding
3. **Misattribution:** Epoch AI's descriptive data ≠ prescriptive detection framework
4. **Downstream Effects:** Other code/docs may cite this incorrect attribution

---

## Recommended Action

1. **Update citations** in `tier2InterventionConfig.ts` (lines 91-95)
2. **Clarify synthesis** - note that 70-95% is analogy-based, not empirical
3. **Create research file** documenting the actual evidence chain
4. **Update wiki** to reflect accurate sources

---

## Full Details

See: `/research/tier2_dark_compute_monitoring_citation_verification_20251104.md`

**Status:** ⚠️ CITATION CORRECTION REQUIRED
