# Missing Climate Cascade Systems

**Created:** December 3, 2025
**Source:** Session 51 research validation
**Priority:** MEDIUM
**Effort:** 32-42 hours (~5-7 sessions)

---

## Rationale

Session 51 research debate identified four missing climate cascade mechanisms that are well-documented in peer-reviewed literature but not currently modeled. These gaps create systematic bias in tail scenarios and reduce model realism.

**Four missing systems:**
1. **Abrupt Sea Level Rise** (ice sheet marine instability)
2. **Compound Climate Events** (simultaneous tipping cascades)
3. **Social Tipping Points** (positive decarbonization feedbacks)
4. **Climate Hysteresis** (irreversibility after tipping)

**Impact of gaps:**
- Gradual-only sea level rise misses MISI tail risks
- Independent tipping points miss cascade amplification
- Lack of positive feedbacks creates pessimistic bias in utopia scenarios
- Reversible tipping points allow unrealistic rapid recovery

---

## Scope

Add four new climate cascade systems with research-backed parameters:

1. **Abrupt Sea Level Rise:**
   - Ice sheet instability triggers (temperature thresholds)
   - Abrupt jumps of 1-3m within decades
   - Affects coastal infrastructure and migration

2. **Compound Climate Events:**
   - Tipping point interaction networks
   - Cascade amplification (domino effects)
   - "Hothouse Earth" pathway modeling

3. **Social Tipping Points:**
   - Renewable adoption acceleration feedbacks
   - Political will tipping dynamics
   - Technology adoption S-curves

4. **Climate Hysteresis:**
   - Different thresholds for collapse vs recovery
   - Century-scale recovery timescales
   - Irreversibility emphasis (prevention > reversal)

---

## Success Criteria

1. **Functional:**
   - All four systems implemented with distinct mechanisms
   - Tail scenarios show realistic cascade dynamics
   - Utopia scenarios capture positive feedbacks
   - Recovery scenarios respect hysteresis constraints

2. **Research:**
   - 2+ peer-reviewed sources per system (2024-2025 preferred)
   - Parameter ranges match literature
   - Validation against expert elicitation studies

3. **Performance:**
   - Monte Carlo N≥10 validates all four systems
   - No NaN/Infinity regressions
   - CV < 0.01% maintained
   - Test coverage >80%

---

## Sources

**Abrupt Sea Level Rise:**
- DeConto & Pollard 2016 - Ice cliff instability mechanism
- Kopp et al. 2014 - 10% chance of 2m rise by 2100
- Bamber et al. 2019 - Expert elicitation on tail risks

**Compound Events:**
- Wunderling et al. 2024 - Tipping point interactions
- Lenton et al. 2019 - Network effects in climate system
- Raymond et al. 2020 - Wet bulb temperature compounding

**Social Tipping:**
- Otto et al. 2020 - Social tipping elements
- Farmer et al. 2019 - Technology adoption S-curves
- Centola et al. 2018 - Critical mass for social change

**Climate Hysteresis:**
- Ritchie et al. 2021 - AMOC hysteresis
- Lohmann & Ditlevsen 2021 - Greenland ice sheet irreversibility
- Kriegler et al. 2009 - Planetary boundary hysteresis

**Session context:**
- Session 51 research debate: `reviews/climate_stability_floor_debate_20251203.md`
