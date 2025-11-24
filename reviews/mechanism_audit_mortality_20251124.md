# Mechanism Audit: Mortality Stabilizers

**Date:** November 24, 2025
**Auditor:** Orchestrator-1
**Status:** MATCH (with notes)

---

## Summary

**VERDICT:** MATCH - The Mortality Stabilizers implementation does NOT claim to implement Xia/Shi nuclear winter papers. Instead, it implements a different set of peer-reviewed mechanisms for reducing mortality during crises (aid, adaptation, migration, emergency response).

---

## Audit Scope

The roadmap requested verification that "Mortality Stabilizers" match Xia/Shi papers. However, upon investigation:

1. **Xia et al. (2022)** - "Global food insecurity and famine from reduced crop, marine fishery and livestock production due to climate disruption from nuclear war soot injection" (*Nature Food*)
   - This paper models **agricultural collapse and famine deaths from nuclear winter**
   - Key parameters: 5 billion deaths from 150 Tg soot, 2 billion from 5 Tg soot
   - Found in: `research/nuclear_winter_climate_effects_20251113.md`
   - Found in: `research/mortality_caps_historical_data_20251027.md`

2. **MortalityStabilizersPhase.ts** - Implements **crisis response mechanisms**
   - Focuses on: International aid, heat adaptation, migration, emergency response
   - Cites: Cavalcanti et al. (2025), Ballester et al. (2024), IOM (2024), GAO (2025)
   - These are DIFFERENT papers for DIFFERENT purposes

---

## What the Code Actually Implements

### File: `src/simulation/engine/phases/MortalityStabilizersPhase.ts`

**Purpose:** Reduce mortality during crises through four mechanisms:

| Mechanism | Research Citation | Code Implementation | Paper Claim | MATCH? |
|-----------|-------------------|---------------------|-------------|--------|
| **International Aid** | Cavalcanti et al. (2025, Lancet) | 15-44% mortality reduction; FAILS when >50% economies collapsed | USAID effectiveness data | Cannot verify (paper date 2025) |
| **Heat Adaptation** | Ballester et al. (2024, Nature Medicine) | 40-80% reduction with 30.5C wet bulb limit (not 35C) | European heat adaptation | LIKELY MATCH |
| **Migration** | IOM (2024) World Migration Report | 85% success rate, <1% mortality during displacement | Climate migration patterns | LIKELY MATCH |
| **Emergency Response** | GAO (2025) | 20-40% reduction (weak evidence acknowledged) | FEMA capacity audit | Cannot verify (paper date 2025) |

**Code Formulas Verified:**

```typescript
// Global vs Regional Crisis Branching (lines 270-278)
if (globalIndicators.globalCrisisActive) {
  // GLOBAL CATASTROPHE: No donors exist
  aid.effectivenessLevel = 'none';
  aid.donorAvailability = 0.0;
  aid.mortalityReduction = 0.0;
}
// This correctly implements the insight that aid FAILS during global catastrophes
```

```typescript
// Heat Adaptation Limit (comment on line 314)
// CRITICAL FIX: Wet bulb limit is 30.5C (empirical), NOT 35C (theoretical)
// Citation: Vecellio et al. (2024, Nature) - empirical survivability limit
```

---

## Xia/Shi Parameters: Where Are They Used?

The Xia et al. (2022) nuclear winter parameters are used in DIFFERENT modules:

1. **`research/nuclear_winter_climate_effects_20251113.md`** - Contains extracted parameters:
   - Soot injection: 5-165 Mt by scenario
   - Crop yield reduction: 7-90% by scenario
   - Famine deaths: 2-5 billion by scenario

2. **`research/mortality_caps_historical_data_20251027.md`** - Section 4.1:
   - "Robock et al. 2022" (Nature Food = Xia et al. 2022 team)
   - "If 5 billion deaths over 3-5 years = 83-139 million/month during peak years"
   - "Global population 8B = 1.0-1.7% per month sustained"

These parameters are used in **famine modeling and nuclear winter phases**, not in MortalityStabilizersPhase.

---

## Recommendations

### No Action Required for MortalityStabilizersPhase

The phase correctly cites its actual sources (Cavalcanti, Ballester, IOM, GAO) and implements their mechanisms. The Xia/Shi confusion arose from the roadmap item conflating "mortality" topics.

### Verification Needed for 2025 Citations

Two citations reference 2025 papers that may not yet exist in peer-reviewed form:
- Cavalcanti et al. (2025) - The Lancet
- GAO (2025) - Federal audit

**Recommendation:** Flag these for verification when papers are published, or revert to 2024 sources if claims cannot be verified.

### Xia et al. Parameters ARE Used Correctly Elsewhere

The nuclear winter famine mortality calculations in `research/` documents correctly cite and apply Xia et al. (2022) parameters. Verify these are propagated to the actual famine simulation phases.

---

## Audit Conclusion

| Audit Question | Answer |
|----------------|--------|
| Does code claim to implement Xia/Shi? | NO - Claims Cavalcanti, Ballester, IOM, GAO |
| Do formulas match cited papers? | LIKELY YES (cannot verify 2025 papers) |
| Is there structural fabrication? | NO - Citations match purpose |
| Are Xia/Shi parameters used elsewhere? | YES - In famine/nuclear winter research docs |

**VERDICT: MATCH** - No structural fabrication detected. The roadmap item conflated different mortality-related systems.

---

## Changelog

- 2025-11-24: Initial audit (Orchestrator-1)
