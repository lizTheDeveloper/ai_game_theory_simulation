# Scenario Analysis Framework Phase 3 - Parameter Validation

**Date:** November 10, 2025
**Researcher:** Orchestrator (coordinating validation)
**Purpose:** Validate governance parameter ranges for Phase 3 government priority scenarios
**Status:** ⚠️ IN PROGRESS - Requires research-skeptic review

---

## Executive Summary

This document validates the 6 government priority scenarios defined in `src/types/scenarios.ts` (lines 373-451) against peer-reviewed research. Each scenario tests a specific governance dimension in isolation to identify which enables spiral activation.

**Validation Status:**
- ✅ **Climate First**: SUPPORTED with adjustment (10%→5% GDP/month)
- ⚠️ **Equality First**: NEEDS VALIDATION (15% GDP/month redistribution)
- ⚠️ **AI Alignment First**: NEEDS VALIDATION ($100B/month alignment research)
- ⚠️ **Democratic Participation**: NEEDS VALIDATION (democracy=0.9)
- ⚠️ **Scientific Acceleration**: NEEDS VALIDATION ($200B/month research)
- ⚠️ **Authoritarian Efficiency**: NEEDS VALIDATION (democracy=0.3)

---

## 1. Climate First Scenario

### Current Implementation
```typescript
'climate-first': {
  description: 'Government maximizes climate tech spending (10% GDP/month)',
  hypothesis: 'Tests whether maximal climate investment enables environmental spiral activation',
  governmentPriorities: {
    climateSpending: 0.10, // 10% of GDP per month
    researchInvestment: 50, // $50B/month research
  }
}
```

### Research Validation

**Source:** `research/government_climate_investment_adoption_patterns_20251024.md`

**Current Reality (2024):**
- Global climate finance: $2 trillion/year (~1% of global GDP)
- Advanced economies: ~1-2% of GDP annually

**IPCC AR6 Requirements:**
- Need: $7.4 trillion/year by 2030 for 1.5°C scenarios
- EMDEs: 6.5% of GDP annually by 2030

**Historical Precedents:**
- Clean energy investment grew 60% from 2020-2024 (IEA 2024)
- COVID recovery: 9.7-11.1% of recovery spending had climate adaptation benefits
- Green New Deal proposals: ~5-10% of GDP over 10 years

**Analysis:**
- **10% GDP/month** = 120% GDP/year = 120× current spending
- This is EXTREME but serves testing purpose (god mode equivalent for climate)
- **Proposed adjustment:** 5% GDP/month (60% GDP/year) for "aggressive but testable" scenario
- **Justification:** 10× IPCC requirement tests maximum plausible government mobilization

**Validation Status:** ✅ SUPPORTED AS TEST SCENARIO
- Recommendation: Use 10% as "climate god mode" to establish upper bound
- Add 5% scenario as "aggressive climate mobilization"

**Citations:**
- Climate Policy Initiative (2024). *Global Landscape of Climate Finance 2024*. https://www.climatepolicyinitiative.org/publication/global-landscape-of-climate-finance-2024/
- IEA (2024). *World Energy Investment 2024*. https://www.iea.org/reports/world-energy-investment-2024

---

## 2. Equality First Scenario

### Current Implementation
```typescript
'equality-first': {
  description: 'Government maximizes redistribution targeting Gini <0.30 (Nordic levels)',
  hypothesis: 'Tests whether reducing inequality enables social spiral activation',
  governmentPriorities: {
    redistributionRate: 0.15, // 15% of GDP per month
    researchInvestment: 50,
  }
}
```

### Research Validation

**Source:** `research/ubi_updates_20251106.md`

**UBI Empirical Evidence:**
- USA pilot: $1,000/month ($12,000/year) per person
- Funding estimates: 20-33% of GDP for universal coverage (annual)
- Labor force participation reduction: -2.0 to -3.9 percentage points
- Income displacement: -$0.29 earned income per $1 UBI

**Nordic Redistribution Levels:**
- Denmark: Government spending ~50% of GDP (includes all services)
- Sweden: Government spending ~49% of GDP
- Redistribution (taxes + transfers): ~25-30% of GDP annually

**Analysis:**
- **15% GDP/month** = 180% GDP/year = FAR EXCEEDS Nordic levels
- Nordic countries achieve Gini ~0.25-0.27 with ~25-30% GDP redistribution ANNUALLY
- **Proposed adjustment:** 2.5% GDP/month (30% GDP/year) aligns with Nordic levels

**Validation Status:** ⚠️ NEEDS ADJUSTMENT
- 15%/month is 6× Nordic levels - unrealistic even for testing
- Recommendation: Use 2.5% GDP/month (30% GDP/year) for "Nordic-level redistribution"
- Alternative: Use 5% GDP/month (60% GDP/year) as "extreme UBI scenario"

**Citations Needed:**
- [ ] Nordic government spending breakdowns (OECD data)
- [ ] Gini coefficient correlations with redistribution rates
- [ ] UBI funding mechanism research (tax base sustainability)

---

## 3. AI Alignment First Scenario

### Current Implementation
```typescript
'ai-alignment-first': {
  description: 'Government maximizes AI alignment research ($100B/month)',
  hypothesis: 'Tests whether prioritizing alignment enables trust/safety spirals',
  governmentPriorities: {
    aiSafetyBudget: 100, // $100B/month
    researchInvestment: 50,
  }
}
```

### Research Validation

**Current AI Safety Spending (2024):**
- OpenAI: ~$1-2B/year on safety/alignment
- Anthropic: ~$500M-1B/year
- Google DeepMind: ~$1-2B/year on safety
- Total industry estimate: ~$5-10B/year

**Government AI Research Spending:**
- US NAIRR proposal: $2.6B over 6 years (~$400M/year)
- EU AI Act enforcement: ~€100M-500M/year
- Total global government AI safety: ~$1-2B/year estimate

**Analysis:**
- **$100B/month** = $1.2 trillion/year = 120-240× current global AI safety spending
- For comparison: Manhattan Project (2024 dollars): ~$30B total over 3 years
- **Proposed:** $100B/month tests "wartime mobilization on alignment"

**Validation Status:** ⚠️ NEEDS JUSTIFICATION
- 100× current spending is extreme but serves testing purpose
- Question: Is there evidence governments COULD spend this much productively?
- Talent constraints: Are there enough AI safety researchers to absorb $1.2T/year?

**Citations Needed:**
- [ ] Current AI safety spending estimates (industry + government)
- [ ] Historical research mobilization precedents (Manhattan Project, Apollo Program)
- [ ] Talent pool size for AI safety research
- [ ] Diminishing returns on research spending (is $100B/month productive?)

---

## 4. Democratic Participation Scenario

### Current Implementation
```typescript
'democratic-participation': {
  description: 'Government maximizes transparency and participation (democracy = 0.9)',
  hypothesis: 'Tests whether high democracy enables governance spiral activation',
  governmentPriorities: {
    democracyLevel: 0.9,
    researchInvestment: 50,
  }
}
```

### Research Validation

**V-Dem Democracy Index (2024):**
- Scale: 0-1 (low to high democracy)
- Top democracies: Denmark (0.91), Norway (0.90), Sweden (0.90)
- USA: 0.72 (2024)
- Global average: ~0.44

**Analysis:**
- **democracy=0.9** aligns with top-performing democracies (Nordic countries)
- This is EMPIRICALLY GROUNDED (matches real-world best performers)

**Validation Status:** ✅ SUPPORTED
- 0.9 represents achievable best-in-class democracy
- No adjustment needed

**Citations:**
- V-Dem Institute (2024). *Democracy Report 2024*. https://www.v-dem.net/

**Question for Implementation:**
- How does `democracyLevel` map to specific governance quality metrics?
- Does it set transparency, participation, institutionalCapacity?
- Check: `src/simulation/government/core/governmentCore.ts` implementation

---

## 5. Scientific Acceleration Scenario

### Current Implementation
```typescript
'scientific-acceleration': {
  description: 'Government maximizes research investment ($200B/month)',
  hypothesis: 'Tests whether massive research spending enables breakthrough cascades',
  governmentPriorities: {
    researchInvestment: 200, // $200B/month
  }
}
```

### Research Validation

**Current Global R&D Spending (2024):**
- Global R&D: ~$2.5 trillion/year (~2.5% of global GDP)
- USA: ~$700B/year (~3% of GDP)
- China: ~$600B/year (~2.5% of GDP)
- Top R&D countries: 2-5% of GDP

**Government Share:**
- USA federal R&D: ~$200B/year (~0.7% of GDP)
- China government R&D: ~$400B/year (~1.2% of GDP)

**Analysis:**
- **$200B/month** = $2.4 trillion/year = EQUALS current GLOBAL R&D spending
- For single government: 12× USA current spending, 6× China spending
- As % of global GDP (~$100T): 2.4% (comparable to current global R&D %)

**Validation Status:** ⚠️ EXTREME BUT TESTABLE
- $200B/month matches total global R&D (all countries + all industries)
- Tests "what if one government spent as much as entire world combined"
- **Proposed:** Keep as test scenario, add $50B/month as "aggressive" scenario

**Citations:**
- OECD (2024). *Main Science and Technology Indicators*. https://www.oecd.org/sti/msti.htm
- NSF (2024). *National Patterns of R&D Resources*

---

## 6. Authoritarian Efficiency Scenario

### Current Implementation
```typescript
'authoritarian-efficiency': {
  description: 'Government prioritizes rapid deployment with low democracy (0.3)',
  hypothesis: 'Tests whether authoritarian coordination enables faster tech adoption',
  governmentPriorities: {
    governmentType: 'authoritarian',
    democracyLevel: 0.3,
    researchInvestment: 50,
  }
}
```

### Research Validation

**V-Dem Democracy Index (2024):**
- Authoritarian regimes: <0.4 (closed autocracies)
- Russia: 0.11
- China: 0.09
- Electoral autocracies: 0.3-0.5
- Examples at ~0.3: Singapore (0.36), Turkey (0.31)

**Analysis:**
- **democracy=0.3** represents electoral autocracy / hybrid regime
- Empirically grounded (matches Singapore, Turkey)
- Not as extreme as China/Russia (0.09-0.11)

**Validation Status:** ✅ SUPPORTED
- 0.3 is realistic for "efficiency-focused authoritarian" regime
- Matches empirical examples of developmental autocracies

**Citations:**
- V-Dem Institute (2024). *Democracy Report 2024*. https://www.v-dem.net/

---

## Summary: Recommended Adjustments

| Scenario | Current Value | Research-Backed Value | Adjustment Needed |
|----------|---------------|----------------------|-------------------|
| Climate First | 10% GDP/month | 5-10% GDP/month | ⚠️ Keep 10% as upper bound, add 5% variant |
| Equality First | 15% GDP/month | 2.5% GDP/month (30%/year) | ❌ CRITICAL: Reduce to 2.5%/month |
| AI Alignment First | $100B/month | $100B/month (test value) | ⚠️ Extreme but testable |
| Democratic Participation | democracy=0.9 | 0.9 (Nordic level) | ✅ No change |
| Scientific Acceleration | $200B/month | $200B/month (test value) | ⚠️ Extreme but testable |
| Authoritarian Efficiency | democracy=0.3 | 0.3 (Singapore level) | ✅ No change |

---

## Next Steps

1. **CRITICAL:** Adjust Equality First scenario (15%→2.5% GDP/month)
2. **Research needed:**
   - [ ] Nordic redistribution literature (Gini coefficient correlations)
   - [ ] AI safety research capacity constraints
   - [ ] Historical research mobilization precedents
3. **Implementation:** Update `src/types/scenarios.ts` with adjusted values
4. **Validation:** Run research-skeptic review of this document

---

## Research Gaps

**High Priority:**
1. Nordic redistribution mechanisms (how do they achieve Gini <0.30?)
2. AI safety research absorptive capacity (can $100B/month be spent productively?)
3. Historical wartime research mobilization (Manhattan, Apollo precedents)

**Medium Priority:**
4. Democracy level → governance quality mapping (implementation details)
5. Climate spending effectiveness curves (diminishing returns analysis)
6. Authoritarian vs democratic tech adoption rates (empirical comparison)

---

## Notes for Simulation-Maintainer

When implementing:
- Use `scenarioOverrides.governmentPriorities` (Phase 2 infrastructure)
- Apply monthly in `ApplyScenarioPrioritiesPhase` (not one-time)
- Monitor for NaN/overflow (redistribution >100% GDP would be invalid)
- Assert all values are finite and in valid ranges

When implementing Phase 3:
- **CRITICAL FIX:** Change `redistributionRate: 0.15` → `redistributionRate: 0.025` in equality-first scenario
- Add variant scenarios: climate-aggressive (5%), equality-nordic (2.5%), research-aggressive ($50B)
- Validate monthly application doesn't cause accumulation errors
