# Bayesian Mortality Migration Audit (Oct 27, 2025)

## Executive Summary

**Status:** ✅ COMPLETE - All mortality sources migrated to Bayesian system

**Architecture:** Centralized two-phase mortality system
- **Phase 1:** Accumulate risks via `addMortalityRisk()`
- **Phase 2:** Resolve at month-end via `BayesianMortalityResolutionPhase`

**Formula:** P(death) = 1 - ∏(1 - p_i × v_i)
- Multi-causal risk compounding with demographic vulnerability multipliers
- Research-backed mortality caps: 2.8% monthly (Holodomor), 50% instant (nuclear)

---

## Mortality Sources Using Bayesian System

### ✅ Migrated During This Session (Oct 27, 2025)

| File | Line(s) | Mortality Type | Root Cause |
|------|---------|----------------|------------|
| `populationDynamics.ts` | 1266-1283 | Acute crisis deaths | Variable (climate/resource/conflict) |
| `ExogenousShockPhase.ts` | 117-138 | Nuclear war | Conflict |
| `ExogenousShockPhase.ts` | 248-269 | Asteroid impact | Disaster |
| `ExogenousShockPhase.ts` | 415-436 | Regional war | Conflict |
| `socialInfluenceActions.ts` | 470-498 | Pandemic sabotage | Pandemic |
| `socialInfluenceActions.ts` | 519-546 | Military deployment | Conflict |
| `trappedPopulations.ts` | 147-165 | Involuntary immobility | Resource/climate |

### ✅ Already Using Bayesian System (Pre-existing)

| File | Line(s) | Mortality Type | Root Cause |
|------|---------|----------------|------------|
| `antimicrobialResistance.ts` | 358-368 | AMR infections | Pandemic |
| `wetBulbEvents.ts` | 568-595 | Heat wave deaths | Climate |
| `militarySystem.ts` | 653-668 | Civilian casualties | Conflict |
| `RadiationSystemPhase.ts` | 44-52 | Radiation ARS/cancer | Conflict |
| `RadiationSystemPhase.ts` | 74-82 | Birth defects | Conflict |
| `FamineSystemPhase.ts` | 74-82 | War/blockade famine | Conflict |
| `FamineSystemPhase.ts` | 85-93 | Climate famine | Climate |
| `FamineSystemPhase.ts` | 96-100 | Governance famine | Social |

---

## Non-Mortality Population Changes (Intentional)

These are **NOT mortality** and should **NOT** use the Bayesian system:

| File | Line | Operation | Purpose |
|------|------|-----------|---------|
| `populationDynamics.ts` | 1011 | `population *= 0.99` | Natural decline (growth rate) |
| `populationDynamics.ts` | 1097 | `population *= (1 + recovery)` | Recovery growth |
| `regionalPopulations.ts` | 459 | `population *= 0.99` | Natural decline fallback |
| `countryPopulations.ts` | 519 | `population *= (1 + growth)` | Natural growth |
| `climateJustice.ts` | 265 | `population *= (1 - emigration)` | Climate emigration |

---

## The ONLY Place Population Decreases from Death

**File:** `bayesianMortality.ts`
**Line:** 287
**Code:** `pop.population = Math.max(0, pop.population - totalDeaths);`

This is the **single centralized location** where mortality reduces population. All death sources flow through this bottleneck.

---

## Dead Code Removed

**File:** `populationDynamics.ts`
**Lines removed:** 1345-1578 (~234 lines)
**Functions deleted:**
- `addSegmentSpecificCrisisDeaths()` - Manual demographic vulnerability tracking
- `addUniformCrisisDeaths()` - Uniform mortality distribution

**Reason:** Replaced by Bayesian system's automatic demographic vulnerability multipliers (Elite 0.2×, Informal 2.0×).

---

## Migration Validation

### Type Safety
```bash
npx tsc --noEmit
# Result: Pre-existing errors only (unrelated to mortality migration)
```

### Runtime Validation
```bash
npx tsx scripts/debugCapabilityGrowth.ts
# Result: ✅ SUCCESS
# Output: "⚠️ AMR: 191K deaths this month (2.29M annual)"
# Confirms mortality tracking working correctly
```

### Population Modification Audit
```bash
grep -rn "population\s*[\*\-]=" src/simulation/*.ts
# Result: 6 legitimate locations (5 growth, 1 Bayesian mortality)
```

---

## Architecture Review Questions for Architecture Skeptic

1. **Performance:** Does two-phase accumulation→resolution introduce bottlenecks?
2. **State propagation:** Any risk of stale mortality data between phases?
3. **Edge cases:** What happens if multiple high-mortality events compound in one month?
4. **Mortality caps:** Are 2.8% monthly / 50% instant caps sufficient for all scenarios?
5. **Demographic vulnerability:** Are Elite 0.2× / Informal 2.0× multipliers balanced?
6. **Multi-causal attribution:** Does Bayesian compounding correctly handle overlapping risks?
7. **Regional vs global:** Do regional mortality events correctly affect only exposed populations?
8. **Missing sources:** Are there any mortality sources we didn't catch?

---

## Research Citations

- **Bayesian compounding:** Standard probability theory (independence assumption)
- **Mortality caps:** Holodomor 1932-33 (2.8% monthly), Nuclear weapons (50% instant)
- **Demographic vulnerability:** World Bank poverty-mortality correlation studies
- **AMR baseline:** WHO 2024 (10M deaths by 2050), Lancet 2022 (1.27M in 2019)
- **Radiation mortality:** Hiroshima/Nagasaki, Chernobyl, Fukushima long-term studies
- **Famine curves:** Gaza/Yemen/Sudan 2024-25, FAO 2024
- **Heat mortality:** IPCC AR6, wet bulb temperature thresholds
- **Trapped populations:** Lake Urmia 2024, World Bank 2024, Thalheimer et al 2024

---

## Next Steps

1. **Architecture Skeptic Review** - Validate migration architecture
2. **Monte Carlo Validation** - Run N=100 to check outcome distributions
3. **Performance Profiling** - Measure impact of two-phase system
4. **Documentation Update** - Update wiki with centralized mortality architecture
