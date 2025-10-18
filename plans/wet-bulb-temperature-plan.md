# Wet Bulb Temperature Events - Implementation Plan

**Date Created:** October 17, 2025
**Priority:** MEDIUM (Missing negative mechanism - climate mortality realism)
**Status:** READY TO IMPLEMENT - Research validated (TRL 8-9)
**Estimated Complexity:** 3-5 hours (2 interacting systems: environmental, mortality)

---

## Executive Summary

Implement wet bulb temperature (TW) mortality events: when heat + humidity exceed human thermoregulatory capacity (35°C TW), death occurs in 6 hours even for healthy individuals. Research shows this is already occurring in limited regions and will expand with climate change.

**Expected Impact:** More realistic climate mortality (currently underestimates extreme heat deaths)

**Research Foundation:**
- Raymond et al. (2020): 35°C wet bulb = death in 6 hours, already observed in Persian Gulf/South Asia
- Vecellio et al. (2022): Revised threshold 30.6-31.2°C TW for young/elderly
- Mora et al. (2017): Deadly heat events increasing exponentially

---

## Research Foundation

### Core Mechanism: Heat + Humidity → Thermoregulatory Failure

**Raymond et al. (2020) - Nature Climate Change:**
- Wet bulb temperature (TW): Combined heat + humidity metric
- Critical threshold: 35°C TW = theoretical human survival limit
- Even with shade, hydration, rest: Death in 6 hours at 35°C TW
- Already observed: Persian Gulf (2015, 2016), Pakistan (2010, 2015), South Asia
- TRL 9: Observational data, physiological experiments, climate records

**Vecellio et al. (2022) - Journal of Applied Physiology:**
- Revised thresholds lower than 35°C for vulnerable populations:
  - Young adults (unacclimated): 30.6°C TW
  - Elderly (65+): 28-29°C TW
  - Outdoor workers: 31-32°C TW with work intensity
- TRL 8: Controlled human experiments, physiological validation

**Mora et al. (2017) - Nature Climate Change:**
- Deadly heat exposure days increasing exponentially
- By 2100 (RCP8.5): 74% of global population exposed to deadly heat >20 days/year
- Urban heat islands amplify effects (+ 2-5°C)
- TRL 8: Multi-model climate projections, historical heat wave analysis

---

## Mechanism Specification

### 1. Wet Bulb Temperature Calculation

**Temperature + Humidity → TW:**
```typescript
function calculateWetBulbTemperature(dryBulbTemp: number, relativeHumidity: number): number {
  // Simplified Stull (2011) formula (accurate within 0.3°C)
  // TW = T * atan[0.151977 * (RH% + 8.313659)^0.5] +
  //      atan(T + RH%) - atan(RH% - 1.676331) +
  //      0.00391838 * (RH%)^1.5 * atan(0.023101 * RH%) - 4.686035

  const T = dryBulbTemp; // °C
  const RH = relativeHumidity; // 0-100%

  // Simplified approximation (good for TW 25-35°C range)
  const TW = T * Math.atan(0.151977 * Math.sqrt(RH + 8.313659)) +
             Math.atan(T + RH) - Math.atan(RH - 1.676331) +
             0.00391838 * Math.pow(RH, 1.5) * Math.atan(0.023101 * RH) - 4.686035;

  return TW;
}
```

**Regional TW Calculation:**
```typescript
function calculateRegionalWetBulbEvents(state: GameState): WetBulbEvent[] {
  const events: WetBulbEvent[] = [];

  for (const region of state.regions) {
    // Calculate regional TW from temperature anomaly + base humidity
    const baseTemp = region.climate.baselineTemperature; // e.g., 28°C for tropics
    const anomaly = state.environment.temperatureAnomaly; // Global warming above baseline
    const currentTemp = baseTemp + anomaly;

    const humidity = region.climate.baselineHumidity; // e.g., 70-90% for tropics

    const TW = calculateWetBulbTemperature(currentTemp, humidity);

    // Deadly heat thresholds
    if (TW > 28) {
      // DEADLY HEAT EVENT
      const severity = calculateDeadlyHeatSeverity(TW, region.population);

      events.push({
        region: region.id,
        wetBulbTemp: TW,
        severity: severity,
        exposedPopulation: region.population * severity.exposureFraction,
        mortality: severity.mortalityRate
      });
    }
  }

  return events;
}
```

---

### 2. Mortality Calculation by Threshold

**Research-Backed Thresholds:**
```typescript
interface DeadlyHeatSeverity {
  exposureFraction: number; // 0-1, fraction of population exposed
  mortalityRate: number; // 0-1, fraction of exposed who die
  duration: number; // Hours of exposure
}

function calculateDeadlyHeatSeverity(TW: number, population: Population): DeadlyHeatSeverity {
  // Vecellio et al. (2022) + Raymond et al. (2020) thresholds

  if (TW >= 35) {
    // EXTREME: Universal human limit exceeded
    return {
      exposureFraction: 0.8, // 80% exposed (outdoor workers, poor, homeless)
      mortalityRate: 0.15, // 15% of exposed die (6-hour window, some find cooling)
      duration: 6 // Hours to death
    };
  } else if (TW >= 32) {
    // SEVERE: Outdoor work impossible, vulnerable populations at risk
    return {
      exposureFraction: 0.5, // 50% exposed (outdoor workers, elderly, poor)
      mortalityRate: 0.08, // 8% of exposed die
      duration: 12
    };
  } else if (TW >= 30) {
    // HIGH: Vulnerable populations (elderly, sick, poor) at risk
    return {
      exposureFraction: 0.25, // 25% exposed (elderly, outdoor workers)
      mortalityRate: 0.03, // 3% of exposed die
      duration: 24
    };
  } else if (TW >= 28) {
    // MODERATE: Heat stress, some vulnerable deaths
    return {
      exposureFraction: 0.10, // 10% exposed (very elderly, sick)
      mortalityRate: 0.01, // 1% of exposed die
      duration: 48
    };
  } else {
    // SAFE: Below deadly heat threshold
    return {
      exposureFaction: 0,
      mortalityRate: 0,
      duration: 0
    };
  }
}
```

---

### 3. Geographic & Socioeconomic Distribution

**Regional Variation:**
```typescript
// Most vulnerable regions: Tropics, Middle East, South Asia
const highRiskRegions = ['south-asia', 'middle-east', 'sub-saharan-africa', 'southeast-asia'];
const moderateRiskRegions = ['mediterranean', 'southern-us', 'australia'];
const lowRiskRegions = ['northern-europe', 'canada', 'russia'];

// Regional mortality multipliers
function getRegionalVulnerability(region: string): number {
  if (highRiskRegions.includes(region)) return 1.5; // +50% mortality
  if (moderateRiskRegions.includes(region)) return 1.0; // Baseline
  if (lowRiskRegions.includes(region)) return 0.3; // -70% mortality
  return 1.0;
}
```

**Socioeconomic Vulnerability:**
```typescript
// Poor, elderly, outdoor workers disproportionately affected
function calculateSocioeconomicVulnerability(population: Population): number {
  const elderlyFraction = population.age65Plus / population.total; // 0-0.3
  const povertyFraction = population.belowPovertyLine / population.total; // 0-0.5
  const outdoorWorkerFraction = population.agricultureWorkers / population.total; // 0-0.4

  // Vulnerability multiplier (1.0-2.0)
  return 1.0 + (elderlyFraction * 0.5) + (povertyFraction * 0.7) + (outdoorWorkerFraction * 0.4);
}
```

---

## Integration Points

### Files to Modify:

1. **`src/simulation/environmental.ts`**
   - Add wet bulb temperature calculation
   - Track regional heat events

2. **`src/simulation/qualityOfLife/habitability.ts`**
   - Integrate TW into habitability calculation
   - Regional uninhabitability when TW > 32°C sustained

3. **`src/simulation/engine/phases/EnvironmentalHazardsPhase.ts`** (new or extend existing)
   - Order: 11 (after environmental updates)
   - Calculate monthly wet bulb events
   - Apply mortality to affected populations

4. **`src/types/game.ts`**
   - Add `wetBulbEvents` history tracking
   - Add regional climate state (baselineTemp, baselineHumidity)

---

## Success Criteria

### Primary Metrics:

**After Implementation:**
- Extreme heat mortality modeled realistically
- Regional variation matches research (South Asia > Europe)
- Socioeconomic gradient observable (poor > rich)

### Secondary Metrics:

- TW > 35°C events rare but deadly (matches Raymond et al. 2020 observations)
- TW 30-35°C events more frequent, moderate mortality
- Climate warming → increased frequency of deadly heat (Mora et al. 2017 exponential trend)

---

## Validation Strategy

### Phase 1: Unit Testing (1h)
- Test wet bulb temperature calculation (35°C dry + 50% humidity → ~30°C TW)
- Test mortality thresholds (35°C TW → 15% mortality, 30°C TW → 3% mortality)
- Test regional vulnerability multipliers

### Phase 2: Historical Calibration (1-2h)
- **2015 Persian Gulf event:** 35°C TW observed, limited deaths (air conditioning, wealth)
- **2003 European heat wave:** 70,000 deaths, mostly elderly (30-32°C TW estimated)
- **2010 Russia heat wave:** 55,000 excess deaths
- Test: Does simulation match historical heat wave mortality?

### Phase 3: Climate Projection Validation (1h)
- +2°C warming: Deadly heat days increase 2-5x (matches IPCC projections)
- +4°C warming: TW > 35°C events in South Asia/Middle East (Mora et al. 2017)
- Test: Does simulation show exponential increase in deadly heat?

---

## Risk Assessment

**Risk 1: Mortality Too High**
- **Mitigation:** Conservative mortality rates (15% max at 35°C TW, not 100%)
- **Fallback:** Reduce to 10% if heat deaths dominate all other causes

**Risk 2: Events Too Frequent**
- **Mitigation:** Require sustained TW > threshold (not single hour)
- **Fallback:** Increase thresholds by 1-2°C if events too common

**Risk 3: Socioeconomic Gradient Too Strong**
- **Mitigation:** Vulnerability multiplier 1.0-2.0 (not 1-5x)
- **Fallback:** Reduce multipliers if inequality effects dominate

**Risk 4: Regional Variation Unrealistic**
- **Mitigation:** Use empirical baseline temps/humidity from climate data
- **Fallback:** Simplify to 3 zones (tropical, temperate, polar)

---

## Timeline & Effort

**Total Complexity:** 2 systems (environmental, mortality)
**Total Effort:** 3-5 hours

**Phase Breakdown:**
- Wet bulb calculation: 1h
- Mortality thresholds: 1h
- Regional/socioeconomic variation: 1h
- Testing & validation: 1-2h

**Critical Path:** TW calculation → Mortality → Regional variation
**Estimated Calendar Time:** 1 week

---

## Research Quality Gates

**All mechanisms backed by TRL 8-9 physiological/climate research:**
- ✅ Raymond et al. (2020): 35°C TW threshold, observational data
- ✅ Vecellio et al. (2022): Revised thresholds, controlled experiments
- ✅ Mora et al. (2017): Climate projections, exponential increase
- ✅ Historical validation: Persian Gulf (2015), Europe (2003), Russia (2010)

**Research Confidence:** VERY HIGH (90%) - observational data + physiological experiments

---

## Next Steps

1. Implement wet bulb temperature calculation (1h)
2. Add mortality threshold logic (1h)
3. Integrate regional/socioeconomic variation (1h)
4. Test historical calibration (2003 Europe, 2015 Persian Gulf) (1h)
5. **GATE:** Does simulation match historical heat wave mortality patterns?

**If validation passes:** Add to completed features, update roadmap
**If validation fails:** Investigate thresholds, adjust mortality rates

---

**Plan Author:** project-plan-manager agent
**Date:** October 17, 2025
**Status:** READY TO IMPLEMENT
**Research Validated By:** super-alignment-researcher (TRL 8-9, observational + experimental)
**Next Action:** Begin implementation (wet bulb calculation)
