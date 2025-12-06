# Hindcast Demographic Transition Tuning

**Created:** November 25, 2025
**Priority:** MEDIUM
**Effort:** 6-8 hours

---

## Rationale

The hindcast validation shows population tracking within 5% through 2005, but 6-10% overshoot in 2010-2020. The model produces ~500M too many people by 2020.

**Deviation by year:**
- 1990: -0.57% (nearly perfect)
- 1995: -5.62% (slight undershoot)
- 2000: +1.72% (excellent)
- 2005: +3.96% (good)
- 2010: +6.86% (overshoot)
- 2020: +10.30% (overshoot)

**Root cause:** Regional birth rates have been fixed with historical curves, but regional death rates still use only global HISTORICAL_CDR. Death rates varied significantly by region 1990-2020:
- Sub-Saharan Africa: ~15/1000 → ~8/1000
- Europe: ~11/1000 → ~12/1000 (aging population)

Missing regional CDR scaling likely accounts for the overshoot.

---

## Scope

Add region-specific historical death rate curves parallel to existing birth rate implementation.

**Affected systems:**
- `BaselineMortalityPhase.ts` - Add `getRegionalHistoricalDeathRate()`
- `regionalPopulations.ts` - Apply regional CDR in historical mode

**Data source:** UN World Population Prospects 2024 regional CDR data

---

## Success Criteria

1. **Functional:**
   - Population deviation <5% for all checkpoint years (1990-2020)
   - No regression in early years (maintain accuracy through 2005)
   - Regional CDR curves match UN WPP 2024 data

2. **Research:**
   - UN WPP 2024 data for 10 regions
   - CDR trends documented 1990-2025 per region
   - Parameter justifications from official sources

3. **Performance:**
   - Monte Carlo N≥10 hindcast validation
   - CV < 0.01% maintained
   - Target: <5% deviation for all years

---

## Sources

- UN World Population Prospects 2024: https://population.un.org/wpp/
- Existing implementation: `src/simulation/engine/phases/BaselineMortalityPhase.ts`
- Regional population system: `src/simulation/regionalPopulations.ts`
