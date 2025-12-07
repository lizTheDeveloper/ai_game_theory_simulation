# Research Gaps - Session 58 (December 7, 2025)

**Context:** Post-M-5/M-6/M-7 implementation validation
**Audit:** `research/research_validation_session_58_20251207.md`
**Focus:** Specific parameters lacking research justification

---

## HIGH Priority Gaps (Block Implementation)

### None Identified ✅

All critical simulation parameters (tipping thresholds, hysteresis, cascades) are **properly justified** by peer-reviewed research (2024-2025).

---

## MEDIUM Priority Gaps (Quality Improvements)

### 1. M-6 Social Tipping Points - Peer-Review Upgrade

**Current Status:** Uses authoritative industry reports (Bloomberg, IEA, RMI)
**Issue:** Not peer-reviewed academic papers
**Impact:** Downgrade from Grade A to B+

**Specific Parameters Needing Peer-Review:**

#### EV Adoption Cascade
```typescript
// Current sources: Bloomberg (2024), IEA (2024), RMI (2024)
activationThreshold: 0.05,        // 5% market share triggers cascade
propagationSpeed: 36,             // months from 5% → 25%
peakGrowthRate: 0.40,            // 40% YoY at inflection point
```

**Search Terms:**
- "social tipping points renewable energy" site:.edu OR site:.gov (2024-2025)
- "technology adoption S-curve" peer-reviewed (2023-2025)
- "electric vehicle diffusion cascade" academic (2024-2025)
- "critical mass threshold technology adoption" (2024-2025)

**Target Journals:**
- *Nature Energy*
- *Environmental Research Letters*
- *PNAS* (energy/technology sections)
- *Energy Policy*
- *Technological Forecasting and Social Change*

**Recommended Researchers:**
- Lenton et al. (social tipping points)
- Farmer et al. (technology S-curves)
- Wilson et al. (energy transitions)

---

#### Renewable Energy Learning Curves
```typescript
// Current sources: Industry data, IEA reports
solarLearningRate: 0.36,     // 36% cost reduction per doubling
windLearningRate: 0.23,      // 23% cost reduction per doubling
batteryLearningRate: 0.33,   // 33% based on 2010-2024 trajectory
```

**Search Terms:**
- "solar learning curve peer-reviewed" (2024-2025)
- "renewable energy cost decline empirical" academic (2023-2025)
- "battery storage learning rate" peer-reviewed (2024-2025)

**Likely Sources:**
- NREL publications (peer-reviewed technical reports)
- Empirical energy economics papers
- Technology forecasting literature

---

#### Carbon Pricing Diffusion
```typescript
// Current sources: World Bank Carbon Pricing Dashboard (2024)
adoptionThreshold: 0.25,         // 25% global GDP coverage
effectivenessRange: [0.05, 0.21], // 5-21% emission reduction
```

**Search Terms:**
- "carbon pricing effectiveness meta-analysis" (2024-2025)
- "emission reduction carbon tax empirical" peer-reviewed (2023-2025)
- "policy diffusion climate governance" academic (2024-2025)

---

### 2. Tech Tree Citation Audit (71 Technologies)

**Current Status:** Some technologies have inline citations, many do not
**File:** `src/simulation/techTree/comprehensiveTechTree.ts`
**Issue:** Effectiveness values lack explicit research justification

**Technologies Needing Citations (Examples):**

#### TIER 0 (Crisis Response)
```typescript
{
  id: 'ocean-alkalinity',
  effectiveness: 0.08,  // 8% ocean acidification reversal
  // NEEDS: Research citation for 8% value
}

{
  id: 'marine-permaculture',
  effectiveness: 0.15,  // 15% fisheries restoration
  // NEEDS: Peer-reviewed source on restoration magnitude
}
```

#### TIER 1 (Incremental)
```typescript
{
  id: 'precision-agriculture',
  effectiveness: 0.25,  // 25% reduction in agricultural inputs
  // NEEDS: Citation for 25% efficiency gain
}

{
  id: 'vertical-farming',
  effectiveness: 0.10,  // 10% food system transformation
  // NEEDS: Research on deployment scale and impact
}
```

#### TIER 2 (Transformative)
```typescript
{
  id: 'fusion-power',
  effectiveness: 0.40,  // 40% energy system transformation
  // NEEDS: ITER/NIF projections, peer-reviewed feasibility
}

{
  id: 'atmospheric-water-harvesting',
  effectiveness: 0.20,  // 20% freshwater augmentation
  // NEEDS: Research on gigatonne-scale deployment
}
```

**Recommended Approach:**
1. Grep for `effectiveness:` without nearby comment containing year/author
2. For each technology, search:
   - "[technology name] effectiveness peer-reviewed"
   - "[technology name] deployment scale research"
   - "[technology name] impact assessment" (2023-2025)
3. Add inline comments: `effectiveness: X.XX, // [Author] (Year) Journal - finding`

**Example GOOD Citation:**
```typescript
{
  id: 'direct-air-capture',
  effectiveness: 0.15,  // Tan et al. (2024) Nat Comms - gigatonne scale feasible
  activationDelay: 7,   // IEA (2024) - 5-10 year delay to deployment
  t_50: 30              // 20-40 year timeline per research validation
}
```

---

### 3. AMOC/Amazon Hysteresis Uncertainty

**Current Status:** Conservative placeholder values (literature contradictory)
**Not a research gap** - it's **active scientific debate**

#### AMOC Recovery Threshold
```typescript
recoveryTempC: 3.0,      // Conservative 1.0°C gap
hysteresisGapC: 1.0
// Research: Baker et al. (2024) = resilient, Ditlevsen (2024) = tipping 2025-2095
// Using conservative middle estimate pending consensus
```

**Contradictory Sources:**
- **Resilience view:** Baker et al. (2024) *Nature Geoscience* - "34/35 CMIP6 models show AMOC resilience"
- **Tipping view:** Ditlevsen & Ditlevsen (2024) *Science Advances* - "AMOC on route to tipping 2025-2095"

**Action:** Monitor 2025-2026 literature for consensus. Current 1.0°C gap is **defensible** given uncertainty.

---

#### Amazon Recovery Threshold
```typescript
recoveryTempC: 1.3,      // Conservative 1.0°C gap
hysteresisGapC: 1.0
// Research: Limited quantitative data on recovery thresholds
// Most research focuses on forward tipping, not reversal dynamics
```

**Action:** Search for Amazon ecosystem recovery studies:
- "Amazon rainforest recovery precipitation threshold" (2024-2025)
- "tropical forest hysteresis reversal" peer-reviewed (2023-2025)
- "deforestation tipping point reversibility" academic (2024-2025)

If no better data emerges by March 2026, document as: "Conservative placeholder (1.0°C gap) pending research on recovery dynamics."

---

### 4. Population Dynamics Validation

**Current Status:** Needs cross-reference with UN WPP 2024
**File:** `src/simulation/populationDynamics.ts`
**Issue:** May use UN WPP 2020 baseline (per UPDATE_QUEUE warning)

**Parameters to Validate:**

```typescript
// Birth rates by region (2025 baseline)
birthRates: {
  'Sub-Saharan Africa': 0.033,    // NEEDS: UN WPP 2024 verification
  'South Asia': 0.018,
  'East Asia': 0.009,
  // etc.
}

// Mortality rates by age cohort
mortalityRates: {
  '0-5': 0.045,      // NEEDS: UN WPP 2024 verification
  '5-15': 0.002,
  '15-50': 0.008,
  // etc.
}
```

**Action:**
1. Download UN World Population Prospects 2024 revision
2. Cross-reference birth rates, mortality rates, migration patterns
3. Update parameters if significant changes from WPP 2020
4. Document: `// UN WPP 2024 - [specific table/page]`

**Research File:** `research/regional_cdr_un_wpp_2024_20251125.md` (may already have this data)

---

### 5. Economic Recovery Parameters

**Current Status:** Needs validation against post-crisis economics literature
**File:** `src/simulation/utils/recoveryCalculations.ts`
**Issue:** Recovery half-lives and multipliers lack citations

**Parameters to Validate:**

```typescript
// GDP recovery after economic shocks
recoveryHalfLife: 5,  // years - NEEDS: IMF/World Bank research citation

// Economic multipliers
crisisRecoveryRate: 0.15,  // 15% annual recovery - NEEDS: Post-crisis data

// Unemployment-GDP relationship
okunCoefficient: 0.3,      // NEEDS: Okun's Law recent estimates (2024)
```

**Search Terms:**
- "post-crisis GDP recovery empirical" IMF World Bank (2023-2025)
- "economic recovery half-life recession" peer-reviewed (2024-2025)
- "Okun's law coefficient updated estimates" (2023-2025)

**Likely Sources:**
- IMF World Economic Outlook (2024)
- World Bank Global Economic Prospects (2024)
- NBER working papers on recovery dynamics

---

## LOW Priority Gaps (Future Enhancement)

### 6. Breakthrough Technology Timelines

**Issue:** Some tech tree items have conservative/optimistic timeline estimates without explicit justification

**Example:**
```typescript
{
  id: 'quantum-computing',
  researchYears: 15,  // NEEDS: Expert elicitation or roadmap citation
  deploymentYears: 20
}
```

**Action:** Add expert forecasts or technology roadmap citations
- "quantum computing timeline forecast" research (2024-2025)
- Technology roadmaps from national labs (NIST, DOE)
- Expert elicitation studies (Delphi surveys, scenario planning)

---

### 7. Regional Impact Differentials

**Issue:** Some tipping elements have regional impact multipliers without explicit justification

**Example:**
```typescript
regionalImpacts: {
  'Europe': 1.2,     // 20% higher impact - WHY?
  'Asia': 0.8,       // 20% lower impact - WHY?
  'Africa': 1.5      // 50% higher impact - WHY?
}
// NEEDS: Regional vulnerability research citations
```

**Search Terms:**
- "regional climate vulnerability index" peer-reviewed (2024-2025)
- "[specific tipping element] regional impacts" (e.g., "AMOC collapse Europe impacts")
- "climate impact heterogeneity by region" academic (2023-2025)

---

## Gap Closure Tracking

### Completion Metrics

**HIGH Priority (M-6 + Tech Tree):**
- [ ] M-6 EV adoption: Find 2+ peer-reviewed papers on technology cascades
- [ ] M-6 Renewable learning: Find academic sources for cost reduction rates
- [ ] M-6 Carbon pricing: Find meta-analysis or empirical effectiveness studies
- [ ] Tech Tree: Audit 71 technologies for inline citations (estimate: 40 missing)

**MEDIUM Priority (Uncertainty Monitoring):**
- [ ] AMOC hysteresis: Search 2025-2026 literature quarterly
- [ ] Amazon recovery: Search tropical forest recovery studies
- [ ] Population: Cross-reference UN WPP 2024
- [ ] Economics: Find IMF/World Bank recovery parameters

**Target Completion:** March 2026 (next quarterly audit)

---

## Search Strategy Template

For each gap, use this systematic approach:

1. **Academic Search Engines:**
   - Google Scholar: `"[parameter]" [domain] 2024..2025`
   - Semantic Scholar: Filter by "highly cited" + "2024-2025"
   - arXiv: `cat:econ.EM OR cat:physics.soc-ph [keywords]`

2. **Journal-Specific Search:**
   - Nature family: `site:nature.com [keywords] 2024 OR 2025`
   - Science family: `site:science.org [keywords] 2024 OR 2025`
   - PNAS: `site:pnas.org [keywords] 2024 OR 2025`

3. **Institutional Sources:**
   - IPCC: `site:ipcc.ch [keywords]` (AR6 working groups)
   - IEA: `site:iea.org [keywords] 2024` (check if peer-reviewed technical annexes exist)
   - UN: `site:un.org [keywords] 2024` (population, climate reports)

4. **Citation Tracing:**
   - Find recent highly-cited review papers
   - Check "Cited By" for 2024-2025 follow-ups
   - Look for meta-analyses or systematic reviews

---

## Documentation Standard

When adding research citations to close gaps, use this format:

**Inline Code Comment:**
```typescript
effectiveness: 0.25,  // Farmer et al. (2024) Nature Energy - S-curve empirical analysis
```

**Research File Reference:**
```typescript
// Research: research/technology_adoption_cascades_20251207.md
// Key finding: 5% threshold triggers 36-month cascade (31-country validation)
activationThreshold: 0.05,
```

**If Uncertainty Remains:**
```typescript
// Conservative estimate: 1.0°C gap pending research consensus (Baker 2024 vs Ditlevsen 2024)
// Monitor: 2025-2026 literature for AMOC recovery threshold convergence
recoveryTempC: 3.0,
```

---

## Next Steps

1. **M-6 Peer-Review Search** (HIGH) - Find academic papers to replace industry reports
2. **Tech Tree Citation Audit** (HIGH) - Add inline justifications for 71 technologies
3. **Population Validation** (MEDIUM) - Cross-reference UN WPP 2024
4. **AMOC/Amazon Monitoring** (MEDIUM) - Quarterly literature search
5. **Economic Parameters** (MEDIUM) - Find IMF/World Bank research

**Deadline:** March 7, 2026 (quarterly audit cycle)

---

**Generated:** December 7, 2025
**Next Review:** March 7, 2026 (with quarterly research audit)
