# Phase 4: Government & Regional Dashboard (4 Subplans)

## 4A: 30-Country Overview
**Agent:** 1 | **Duration:** 2 days | **API:** `/api/dashboard/government`

**FIXES:** RegionsDashboard currently uses FAKE data

**Components:**
- Small multiples: 30 country cards
- Political regime type (democracy, autocracy, hybrid)
- Government effectiveness
- Policy positions (AI regulation, climate, social welfare)
- Election cycles
- Coalition structures

**Files:** `CountryOverview.tsx` (~150 lines)

---

## 4B: Regional Populations
**Agent:** 2 | **Duration:** 1-2 days | **API:** `/api/dashboard/government`

**Components:**
- 15 key countries population tracking
- Quality of Life breakdown (17D × 5 tiers)
- Inequality metrics (Gini, top vs bottom)
- Migration flows
- Crisis-affected populations
- "Elysium" pattern detection

**Files:** `RegionalPopulations.tsx` (~120 lines)

---

## 4C: Bilateral Tensions
**Agent:** 3 | **Duration:** 2 days | **API:** `/api/dashboard/government`

**Components:**
- Network graph of country relationships
- Tension levels (cooperative, neutral, adversarial)
- Nuclear deterrence (MAD)
- Conflict probabilities
- Alliance structures

**Files:** `BilateralTensions.tsx` (~150 lines)

---

## 4D: Government Policies
**Agent:** 4 | **Duration:** 1-2 days | **API:** `/api/dashboard/government`

**Components:**
- AI regulation levels (30 countries)
- Climate policies
- Social safety nets
- UBI deployment
- Emergency management capabilities
- Policy coordination scores

**Files:** `GovernmentPolicies.tsx` (~120 lines)

---

**Total Effort:** 4 agents × 1-2 days = 4-8 days (parallelizable to 1-2 weeks)
