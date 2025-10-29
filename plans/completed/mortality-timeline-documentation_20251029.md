# Mortality Timeline Documentation - COMPLETE

**Date Completed:** October 29, 2025
**Priority:** HIGH/MEDIUM (Priority #4 on roadmap)
**Estimated Time:** 15-30 minutes
**Complexity:** 0 systems (documentation only)

---

## Overview

Added comprehensive timeline compression caveat to wiki documentation. The simulation uses accelerated timescales (30 years) vs peer-reviewed climate research (75 years), compressing mortality impacts by 2.5× for simulation practicality.

## Research Foundation

**Primary Source:**
- **Richards et al. (2023)** - Climate collapse mortality projections (75-year window)
  - Baseline scenario: 6 billion deaths over 75 years (2025-2100)
  - Climate-driven mortality from heat stress, famines, ecosystem collapse

**Consensus Agreement:** `research-consensus-20251028_215926.txt` (confirmed by research team)

---

## Changes Implemented

**File:** `docs/wiki/README.md` (Lines 1129-1162)

### 1. Mortality Timeline Compression Caveat Section

**Added comprehensive section:**

```markdown
#### ⚠️ Mortality Timeline Compression Caveat

**IMPORTANT: This simulation uses accelerated timescales, not baseline projections.**

**Timeline Compression:**
- **Simulation:** 30-year window (typical runs: 2025-2055)
- **Peer-reviewed research:** 75-year window (2025-2100)
- **Compression factor:** 2.5× faster than published climate models

**Research Comparison:**
- **Richards et al. (2023):** 6 billion deaths over 75 years (baseline climate collapse scenario)
- **This simulation:** 7.76 billion deaths over 30 years (accelerated scenario)
- **Magnitude comparable, timeline compressed**

**Why the compression?**
1. Simulation practicality: 30-year window fits typical gameplay session
2. Near-term focus: Models critical period (2025-2055) where AI alignment decisions matter most
3. Exploratory modeling: Tests "what if" scenarios, not baseline predictions
4. Monte Carlo feasibility: 30yr runs enable N≥100 replication for uncertainty quantification

**Remaining Uncertainties:**
1. Tipping point timing: Climate models show high variance in cascade trigger dates
2. Adaptation capacity: Human response speed under extreme stress poorly understood
3. AI intervention effectiveness: No empirical data on AI-accelerated mitigation
4. Cascade interaction: Multi-system feedback loops (climate + social + AI) unvalidated

**Validation Status:**
- ✅ Mechanism plausibility: Multi-system cascades match IPCC AR6 feedback loops
- ✅ Magnitude plausibility: 7.76B deaths comparable to Richards 6B baseline
- ✅ Exploratory modeling legitimacy: Low-probability, high-impact scenarios are valid research tools (Ord 2020, Tonn 2009)
- ⚠️ **Timeline validity:** Compressed for simulation practicality, not validated against climate models

**Label for outputs:** "Accelerated scenario" or "Compressed timeline model" - NOT "baseline projection"

**Research Foundation:**
- Richards et al. (2023): Climate collapse mortality projections (75-year window)
```

---

## Impact Assessment

**Documentation Improvements:**
- **Transparency:** Users understand simulation is accelerated, not baseline projection
- **Research integrity:** Clear disclaimer on timeline compression (2.5× factor)
- **Uncertainty quantification:** 4 remaining uncertainties documented explicitly

**No Code Changes:**
- Documentation only - no simulation mechanics affected
- Existing 30-year window retained for practicality
- Optional future enhancement: Add 75-year mode for validation

**Related Documentation:**
- Links to mortality system documentation (population dynamics, Bayesian mortality)
- Cross-references climate collapse cascades (IPCC AR6 feedback loops)
- Provides research citation (Richards et al. 2023)

---

## Lessons Learned

**Research Communication:**
- ALWAYS label accelerated scenarios explicitly (not "baseline projection")
- Document compression factors explicitly (2.5× faster than research)
- Provide research comparison (simulation 7.76B vs Richards 6B)

**Uncertainty Transparency:**
- List remaining uncertainties explicitly (4 categories documented)
- Distinguish mechanism plausibility (✅) from timeline validity (⚠️)
- Acknowledge exploratory modeling legitimacy (Ord 2020, Tonn 2009)

**Timeline Compression Trade-offs:**
- **Benefit:** Enables Monte Carlo replication (N≥100 runs feasible)
- **Cost:** Timeline not validated against climate models
- **Acceptable:** Exploratory modeling, not prediction

---

## Time Investment

**Estimated:** 15-30 minutes
**Actual:** ~20 minutes (section writing + cross-references + research citation)

---

## Status: COMPLETE ✅

All planned documentation added:
- ✅ Timeline compression documented (30yr sim vs 75yr peer-reviewed)
- ✅ Labeled as "accelerated scenario"
- ✅ Research comparison: Richards 6B/75y vs Sim 7.76B/30y
- ✅ Remaining uncertainties documented (4 categories)
- ✅ Validation status: Mechanism plausibility ✅, Timeline validity ⚠️

**Section location:** `docs/wiki/README.md` lines 1129-1162
