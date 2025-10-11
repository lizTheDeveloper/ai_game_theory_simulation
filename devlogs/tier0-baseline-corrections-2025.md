# TIER 0: Baseline Corrections - 2025 Realistic Starting Values

**Date:** October 11, 2025  
**Status:** ✅ IMPLEMENTED  
**Priority:** TIER 0 (Foundation for all other work)  
**Source:** `plans/MASTER_IMPLEMENTATION_ROADMAP.md` (Section 0.1)

---

## 📋 Summary

Updated initial starting parameters to match research-backed 2025 reality instead of optimistic projections. This is NOT balance tuning - this is correcting the baseline to match actual crisis levels documented in peer-reviewed research.

---

## 🔧 Changes Implemented

### Environmental Parameters (`src/simulation/environmental.ts`)

| Parameter | Old Value | New Value | Change | Research Source |
|-----------|-----------|-----------|---------|-----------------|
| **Biodiversity Index** | 0.70 | 0.35 | **-50%** | IPBES 2024: 50-70% loss since 1970 |
| **Resource Reserves** | 0.85 | 0.65 | **-24%** | Global Footprint Network 2025: 1.7x overshoot, Earth Overshoot Day July 24 |
| **Pollution Level** | 0.15 | 0.30 | **+100%** | American Lung Assoc 2025: 46% unhealthy air, 7/9 planetary boundaries breached |
| **Climate Stability** | 0.75 | 0.75 | **No change** | KEEP - Validated (Copernicus 2024: +1.2°C warming) |
| **Climate Degradation Rate** | 0.004 | 0.0008 | **-80%** | IPCC AR6: ~0.2°C/decade, not 1°C/decade (was 5x too fast) |

### Social Parameters (`src/simulation/socialCohesion.ts`)

| Parameter | Old Value | New Value | Change | Research Source |
|-----------|-----------|-----------|---------|-----------------|
| **Meaning Crisis Level** | 0.15 | 0.22 | **+47%** | WHO 2025: 17-21% youth lonely, 30-40% adults |
| **Institutional Legitimacy** | 0.65 | 0.65 | **No change** | KEEP - Validated (Pew Research 2024) |
| **Social Cohesion** | 0.60 | 0.60 | **No change** | KEEP - Validated (AAMCH 2024) |
| **Cultural Adaptation** | 0.10 | 0.10 | **No change** | KEEP - Correct for 2025 |

---

## 📊 Expected Impact

### Harder Pathways
- ❌ **Utopia becomes HARDER**: Ecological spiral needs 70% biodiversity, now starting at 35% (was 70%)
- ❌ **Crises trigger FASTER**: Resource crisis at 40%, now starting at 65% (was 85%)
- ❌ **Meaning crisis worse**: Meaning spiral needs <20%, now starting at 22% (was 15%)

### More Realistic Outcomes
- ✅ **Model becomes MORE REALISTIC**: Reflects actual 2025 crisis levels, not optimistic projections
- ✅ **Interventions become MORE MEANINGFUL**: Bigger gap to bridge = more impactful actions
- ✅ **Climate warming realistic**: Was warming 5x too fast, now matches IPCC data

---

## 🔬 Research Citations

### Environmental
1. **IPBES 2024**: Global Assessment Report on Biodiversity and Ecosystem Services
   - Finding: 50-70% species population loss since 1970
   - Justification: biodiversityIndex = 0.35

2. **Global Footprint Network 2025**: Earth Overshoot Day July 24
   - Finding: Humanity uses 1.7x Earth's regenerative capacity
   - Justification: resourceReserves = 0.65

3. **American Lung Association 2025**: State of the Air Report
   - Finding: 46% of Americans breathe unhealthy air
   - Justification: pollutionLevel = 0.30

4. **Stockholm Resilience Centre 2025**: Planetary Boundaries Update
   - Finding: 7 of 9 boundaries breached (all worsening)
   - Justification: pollutionLevel = 0.30

5. **IPCC AR6 (2023-2024)**: Climate Change Reports
   - Finding: ~0.2°C warming per decade (0.0167°C/year, 0.00139°C/month)
   - Justification: climateDegradationRate = 0.0008 (was 0.004, 5x too fast)

6. **Copernicus 2024**: Global Climate Report
   - Finding: +1.2°C warming above pre-industrial
   - Justification: climateStability = 0.75 (validated, no change)

### Social
1. **WHO 2025**: Mental Health and Loneliness Report
   - Finding: 17-21% youth lonely, 30-40% adults experiencing loneliness
   - Justification: meaningCrisisLevel = 0.22

2. **Pew Research 2024**: Trust in Government Survey
   - Finding: ~65% institutional trust (moderate, declining)
   - Justification: institutionalLegitimacy = 0.65 (validated, no change)

3. **AAMCH 2024**: Social Cohesion Studies
   - Finding: ~60% social cohesion baseline
   - Justification: socialCohesion = 0.60 (validated, no change)

---

## 🎯 Philosophical Alignment

> "We are never going for specific outcomes, only trying to figure out the most realistic, defensible model we can - let the model show what it shows."

This change is about **scientific validity**, not game balance:
- NOT tuning for "fun" or desired outcome distribution
- NOT adjusting to make Utopia easier or Extinction harder
- YES setting parameters to real-world 2025 values
- YES letting emergent outcomes arise from realistic mechanisms

---

## 📝 Next Steps (Validation)

### Immediate
- [x] Implement parameter changes
- [ ] Run Monte Carlo (N=20) with NEW baseline
- [ ] Compare with previous baseline outcomes
- [ ] Document differences in outcomes

### Follow-up
- [ ] Update wiki documentation (`docs/wiki/systems/environmental.md`)
- [ ] Update wiki documentation (`docs/wiki/systems/social-cohesion.md`)
- [ ] Review spiral activation thresholds (may need adjustment for new baseline)
- [ ] Check if any breakthrough tech prerequisites need updating

### Research Questions
1. **How much harder is Utopia now?** (ecological spiral needs +35% biodiversity gain vs +0% before)
2. **How much faster do crises trigger?** (resource crisis 25% closer to threshold)
3. **Are warming rates now realistic?** (IPCC validation check)
4. **Does meaning spiral still activate?** (now starting 2% closer to threshold)

---

## 🔗 Related Files

### Modified
- `src/simulation/environmental.ts` - Environmental baseline + climate rate
- `src/simulation/socialCohesion.ts` - Social baseline

### Related Documentation
- `plans/MASTER_IMPLEMENTATION_ROADMAP.md` - Source specification
- `plans/initialization-parameters-validation.md` - 700+ lines, 30+ sources (full research)

### Logs (for comparison)
- `logs/liztest_101125232_26.log` - Pre-change baseline (400 runs)
- Next: Run new baseline for comparison

---

## 📈 Validation Metrics to Track

Compare OLD vs NEW baseline (N=20 each):

1. **Extinction Rate**: Expect increase (harder to mitigate with worse starting conditions)
2. **Utopia Rate**: Expect decrease (harder to reach spiral thresholds)
3. **Dystopia Rate**: Expect change (unclear direction)
4. **Nuclear War Rate**: Should be similar (not affected by environmental baseline)
5. **Average Survival Time**: May decrease (crises trigger faster)
6. **Spiral Activation Rates**: Likely decrease (thresholds harder to reach)

---

## 💡 Design Philosophy Note

Making the baseline MORE REALISTIC makes Utopia HARDER. This is CORRECT:
- Real 2025 is in crisis (7/9 boundaries breached, 1.7x overshoot, mass extinction)
- Achieving Utopia from THIS starting point should require heroic effort
- Optimistic starting values created false sense of "easy Utopia"
- Realistic starting values reflect the actual challenge humanity faces

If the model shows 90% extinction with realistic parameters, that's a WARNING, not a bug.

---

**Implemented by:** AI Assistant  
**Date:** October 11, 2025  
**Dev Time:** ~1 hour  
**Complexity:** LOW (simple value changes)  
**Testing:** Awaiting Monte Carlo validation

