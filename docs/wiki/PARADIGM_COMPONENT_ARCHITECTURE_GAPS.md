# Paradigm Component Architecture Gaps

**Date:** October 27, 2025
**Issue:** Discovered during Western Liberal audit - components claim to measure broad concepts but actually track narrow proxies

---

## The Core Problem

We have **5 Western Liberal components** and **3 Development components** that claim to measure broad sociological/economic concepts, but many are:
1. **Narrow proxies** (AI regulation → "economic freedom")
2. **Duplicates** (democracy counted twice - FIXED Oct 27)
3. **Hardcoded** (economic freedom = 50 - FIXED Oct 27)
4. **Arbitrary aggregations** (4 survival dimensions → one score)

**User's critical question:** "Is there a big system there that we're just pretending and glossing over?"

---

## Western Liberal Component Audit

### 1. Electoral Democracy ✅
**Claims to measure:** Political participation, free elections
**Actually measures:** `state.government.democracy` (0-1)
**What drives it:** DemocracyDynamicsPhase
**Systems behind it:**
- Government legitimacy
- Social cohesion → civil liberties (affect democracy)
- Authoritarian transition mechanics
- Resentment accumulation
- **GOOD:** Real simulation mechanics, not a proxy

### 2. Civil Liberties ✅
**Claims to measure:** Freedom of speech, assembly, press, religion
**Actually measures:** `state.socialAccumulation.socialCohesion.civilLiberties` (0-100)
**What drives it:** SocialCohesionUpdatePhase
**Systems behind it:**
- Democracy level (civil liberties ↔ democracy feedback)
- Government control desire
- Surveillance level
- Social trust
- **GOOD:** Real simulation mechanics, bidirectional causality

### 3. Rule of Law ✅ *FIXED Oct 27*
**Claims to measure:** Independent judiciary, property rights, equal treatment
**Actually measures:** `state.socialAccumulation.institutionalLegitimacy` (0-1)
**What drives it:** SocialCohesionUpdatePhase, institutional erosion
**Systems behind it:**
- Government legitimacy decay
- Institutional adaptation to crises
- Corruption
- **GOOD:** Distinct from democracy, real mechanics

### 4. Economic Freedom ⚠️ **ARCHITECTURAL GAP**
**Claims to measure:** Market freedom, property rights, trade openness, regulatory burden
**Actually measures:** AI regulation type mapped to 25/50/75/100
**What drives it:** Government regulatory choice (one decision)

**THE PROBLEM:**
Economic freedom (Heritage Foundation / Fraser Institute) has **10 components:**
1. Property rights
2. Business freedom / ease of starting businesses
3. Trade freedom (tariffs, barriers)
4. Investment freedom
5. Financial freedom (capital controls, banking)
6. Labor freedom (regulations, union power)
7. Monetary freedom (inflation, price controls)
8. Tax burden
9. Government spending as % of GDP
10. Fiscal health (debt levels)

**We only simulate:** AI regulation type

**Missing systems:**
- ❌ Trade policy system
- ❌ Tax system (rates, progressivity)
- ❌ Government spending tracking
- ❌ Regulatory burden beyond AI
- ❌ Labor market regulations
- ❌ Capital controls
- ❌ Property rights strength
- ❌ Monetary policy (inflation, price controls)
- ❌ Fiscal health (debt tracking)

**We DO have that could feed into this:**
- ✅ UBI variant (affects labor freedom)
- ✅ Economic transition stage (0-4)
- ✅ Unemployment level
- ✅ Wealth distribution
- ✅ AI-assisted productivity

**Recommendation:**
Either:
1. **Rename component** to "AI Regulation Freedom" (narrow, honest)
2. **Build economic system** (tax, trade, spending, debt tracking)
3. **Use composite proxy** from existing metrics (UBI + unemploy + wealth + AI reg)

### 5. Privacy/Surveillance ✅
**Claims to measure:** Freedom from government surveillance
**Actually measures:** `1 - state.government.structuralChoices.surveillanceLevel` (0-1)
**What drives it:** Government control desire + conditions
**Systems behind it:**
- Control desire × capability to control
- Detection spending
- Crisis conditions (elevate surveillance)
- **GOOD:** Real emergent mechanics

---

## Development Paradigm Component Audit

### 1. Quality of Life ✅
**Claims to measure:** Overall wellbeing
**Actually measures:** `state.globalMetrics.qualityOfLife` (0-2)
**What drives it:** QualityOfLifePhase (17-dimensional aggregation)
**Systems behind it:**
- 5-tier hierarchy (survival → material → psychological → social → health → environmental)
- Crisis penalties
- Tech deployments
- **GOOD:** Extremely detailed, 40+ subsystems feed into this

### 2. Survival Fundamentals ⚠️ **USER'S QUESTION**
**Claims to measure:** Basic survival needs met
**Actually measures:** Geometric mean of 4 dimensions (food, water, thermal, shelter)
**What drives it:**
- `foodSecurity`: Regional food system (65-95% by region, FoodSecurityDegradationPhase)
- `waterSecurity`: Freshwater depletion, Day Zero droughts, pollution, desalination
- `thermalHabitability`: Temperature anomaly, wet-bulb limits, climate adaptation
- `shelterSecurity`: Wealth distribution, refugee crises, climate displacement, UBI

**THE USER'S QUESTION:** "Is survival score just development paradigm minus trauma? Or some other arbitrary thing?"

**ANSWER:**
Survival score is NOT arbitrary - it's the **geometric mean of 4 physics-constrained dimensions:**

1. **Food Security (65-95% regional baseline)**
   - Driven by: Agricultural crises, phosphorus depletion, climate impacts, vertical farming tech
   - NOT trauma-based - actual calorie availability by region
   - Research: FAO food security thresholds (1800 kcal/day minimum)

2. **Water Security (freshwater availability)**
   - Driven by: Groundwater depletion, Day Zero droughts (Cape Town 2018), desalination capacity
   - NOT trauma-based - actual liters/person/day
   - Research: WHO 50L/day minimum for health

3. **Thermal Habitability (% land area habitable)**
   - Driven by: Temperature anomaly, wet-bulb temperature limits
   - Physics constraint: Wet-bulb >35°C = human death in 6 hours (Sherwood & Huber 2010)
   - NOT trauma-based - thermodynamics

4. **Shelter Security (% with adequate housing)**
   - Driven by: Wealth distribution, refugee crises, UBI policy, unemployment
   - Economic + climate displacement
   - NOT trauma-based - actual housing access

**Why geometric mean?**
Non-compensatory aggregation: You can't compensate for lack of water with extra shelter.
Matches UNDP HDI methodology.

**So NO - survival score is NOT "development minus trauma".**
It's **4 distinct physics/economic constraints** that all have detailed simulation mechanics behind them.

### 3. Healthcare Quality ✅
**Claims to measure:** Medical outcomes, access
**Actually measures:** `state.qualityOfLifeSystems.healthcareQuality` (0-1)
**What drives it:** QualityOfLifePhase
**Systems behind it:**
- AI capability assistance
- Economic stage (post-scarcity → universal healthcare)
- Tech deployments (disease elimination)
- **GOOD:** Real mechanics

---

## What We're Actually Missing

### **Major Gap 1: Economic Policy System**
**Components claiming to measure this:**
- Western Liberal: Economic Freedom
- (Partially) Development: Material abundance

**What we DON'T simulate:**
- Tax policy (rates, progressivity)
- Government spending (as % of GDP)
- Trade policy (tariffs, openness)
- Monetary policy (inflation, interest rates)
- Fiscal health (debt, deficits)
- Regulatory burden (beyond AI)
- Labor regulations
- Capital controls

**What we DO have:**
- ✅ Economic transition stages (0-4)
- ✅ Unemployment
- ✅ Wealth distribution
- ✅ UBI variants
- ✅ AI-assisted productivity
- ✅ Material abundance (from QoL system)

**Research gap:** None of these are in our research docs because we haven't needed them for AI alignment questions

**Is this a problem?**
- For **AI alignment research:** Probably not critical
- For **paradigm measurement:** Yes - "economic freedom" is too narrow
- For **full economic modeling:** Yes - missing major policy levers

### **Major Gap 2: Information/Belief Systems**
**Components claiming to measure this:**
- Western Liberal: (implicitly) informed citizenry
- Development: (none)

**What we DON'T simulate well:**
- Meme propagation (we have `memetics/beliefEvolution.ts` but limited use)
- Media ecosystem (centralized vs distributed)
- Information integrity
- Propaganda effectiveness
- Social media dynamics
- Filter bubbles
- Epistemic communities

**What we DO have:**
- ✅ `memetics/beliefEvolution.ts` - belief evolution mechanics
- ✅ Trust in AI (social cohesion)
- ✅ Institutional legitimacy
- ✅ Civil liberties (includes press freedom implicitly)

**Is this a problem?**
- For **AI alignment research:** Medium - affects AI control acceptance
- For **paradigm measurement:** Yes - information integrity is a core liberal value
- For **democracy dynamics:** Yes - belief propagation affects stability

---

## Recommendations

### Option 1: Honest Renaming (Quick Fix)
Rename components to match what they actually measure:

**Western Liberal:**
1. Electoral Democracy ✅
2. Civil Liberties ✅
3. Institutional Legitimacy ✅ (was "Rule of Law")
4. **AI Regulatory Freedom** ⚠️ (was "Economic Freedom")
5. Privacy/Anti-Surveillance ✅

**Pros:** Honest, no new code needed
**Cons:** "AI Regulatory Freedom" is narrow, doesn't capture economic liberty paradigm

### Option 2: Composite Proxy (Medium Effort)
Build "economic freedom" from existing metrics:

```typescript
const economicFreedom = geometricMean([
  1 - aiRegulationLevel,      // 0-100 (none=100, ceiling=25)
  ubiGenerosity,               // 0-100 (none=100, generous=25)
  1 - unemploymentLevel,       // 0-100 (0%=100, 90%=10)
  wealthDistribution,          // 0-100 (Gini 0=100, Gini 0.8=20)
  economicStage / 4,           // 0-100 (stage 0=0, stage 4=100)
]);
```

**Pros:** Uses existing simulation state, no new systems
**Cons:** Still not "economic freedom" in Heritage Foundation sense, but closer

### Option 3: Build Economic Policy System (High Effort)
Implement full economic system with:
- Tax policy mechanics
- Government spending tracking
- Trade policy
- Regulatory burden index
- Fiscal health (debt/GDP)

**Pros:** Complete, research-backed, enables new policy experiments
**Cons:** ~40-80 hours of work, needs research phase, may not matter for AI alignment

### Option 4: Drop "Economic Freedom" Component (Radical)
Western Liberal becomes 4 components instead of 5:
1. Electoral Democracy
2. Civil Liberties
3. Institutional Legitimacy
4. Privacy/Anti-Surveillance

**Pros:** Only measure what we actually simulate
**Cons:** Misses major aspect of Western Liberal paradigm (free markets)

---

## My Recommendation

**For AI alignment simulation:** **Option 2** (Composite Proxy)

**Why:**
1. **Honest:** We aggregate existing metrics, don't pretend to simulate tax policy
2. **Research-grounded:** All components (unemployment, wealth, UBI, AI reg) are already research-backed
3. **Sufficient:** For AI alignment questions, these 5 dimensions capture the "economic freedom vs security" tradeoff
4. **Fast:** No new systems needed, just 20-line calculation change

**Renamed to:** "Economic Liberty & Prosperity" (acknowledges it's not pure free-market measure)

**Formula:**
```typescript
// Economic Liberty & Prosperity (composite from 5 existing metrics)
// NOT pure "economic freedom" - includes prosperity outcomes
const components = [
  invertAIRegulation(regulationType),      // Market freedom for AI
  invertUBIGenerosity(ubiVariant),         // Redistributive policy (inverted)
  1 - unemploymentLevel,                    // Job market vitality
  wealthDistribution,                       // Economic equality
  economicStage / 4 * 100,                 // Stage of abundance
];
const economicLiberty = geometricMean(components);
```

This honestly represents what we simulate: The **interplay of regulation, redistribution, unemployment, inequality, and technological abundance** - which IS relevant to both AI alignment and Western Liberal values, even if it's not "pure economic freedom."

---

## Next Steps

1. **User decision:** Which option for "Economic Freedom"?
2. **Survival Score:** Keep as-is (it's actually well-grounded)
3. **Documentation:** Update paradigm docs to clarify what components actually measure
4. **Future work:** If economic policy becomes relevant to AI alignment research, add Option 3

---

## Systems We Actually Have vs Need

### ✅ **Well-Simulated:**
- Democracy dynamics
- Social cohesion
- Institutional legitimacy
- Surveillance
- Quality of life (17 dimensions)
- Food security (regional)
- Water availability
- Climate habitability
- Healthcare
- AI regulation

### ⚠️ **Partially Simulated:**
- Economic freedom (only AI regulation)
- Information ecosystem (memetics exist but underused)

### ❌ **Not Simulated:**
- Tax policy
- Trade policy
- Monetary policy
- Fiscal debt
- Broad regulatory burden
- Labor market regulations
- Media ecosystem
- Propaganda/information warfare

### **Question:** Do we NEED these for AI alignment research?

Most likely **NO** - our core research questions are:
- How do AI agents affect society?
- What governance structures succeed/fail?
- Can we reach sustainable utopia?

Economic policy details (tax rates, tariffs) probably don't matter much for these questions.

**But** information ecosystem (memes, propaganda) DOES matter for:
- Government legitimacy
- Trust in AI
- Acceptance of policies
- Authoritarian transitions

**Suggestion:** Prioritize information/belief systems over detailed economic policy if we expand.
