# Novel Entities Crisis System

**Status:** ✅ Implemented (TIER 1.5)
**Phase:** NovelEntitiesPhase (27.0)
**Source:** `src/simulation/novelEntities.ts`
**Research:** Kate Raworth, Stockholm Resilience Centre, peer-reviewed studies

---

## Overview

Models synthetic chemical pollution - the **5th planetary boundary** breached in 2022. Tracks microplastics, PFAS ("forever chemicals"), endocrine disruption, reproductive health decline, and chronic disease epidemics. This is the **slowest extinction pathway** (100-200 years) - gradual poisoning of the entire biosphere.

### Why Critical

- **5th planetary boundary breached in 2022** (now everywhere in environment)
- **Microplastics in 100% of humans** (blood, placenta, brain, organs)
- **PFAS in 99% of human blood** ("forever chemicals" never break down)
- **50% sperm count decline in 50 years** (reproductive failure accelerating)
- **Bioaccumulation hits apex predators** (including humans at top of food chain)
- **No threshold:** Even trace amounts disrupt endocrine systems
- **Irreversible:** Once released, persist for centuries to millennia
- **Real crisis examples:**
  - DDT banned 1972 → still in environment 50+ years later
  - PCBs banned 1979 → still in fish/wildlife
  - PFAS discovered in drinking water of 200+ million Americans
  - Microplastics found in human placentas (2020)
  - Antarctic penguins have microplastics in blood (nowhere is safe)

---

## State Tracking

### NovelEntitiesSystem Interface

```typescript
interface NovelEntitiesSystem {
  // Chemical Contamination
  syntheticChemicalLoad: number;        // [0,1] Overall pollution
  microplasticConcentration: number;    // [0,1] Plastic fragments
  pfasPrevalence: number;               // [0,1] Forever chemicals

  // Health Impacts
  endocrineDisruption: number;          // [0,1] Hormone damage
  reproductiveHealthDecline: number;    // [0,1] Fertility loss
  bioaccumulationFactor: number;        // [0,1] Food chain concentration
  chronicDiseasePrevalence: number;     // [0,1] Cancer/autoimmune

  // Crisis Flags
  boundaryBreached: boolean;            // Breached 2022
  reproductiveCrisisActive: boolean;    // Decline > 50%
  chronicDiseaseEpidemicActive: boolean;// Prevalence > 40%
  bioaccumulationCollapseActive: boolean;// Apex predators failing

  // Timeline
  exposureMonths: number;               // Cumulative exposure tracking

  // Technology Solutions
  greenChemistryDeployment: number;     // [0,1] Non-toxic alternatives
  circularEconomyDeployment: number;    // [0,1] Zero-waste systems
  chemicalBansDeployment: number;       // [0,1] Worst offenders banned
  bioremediationDeployment: number;     // [0,1] Microbe cleanup
}
```

---

## Mechanics

### 1. Synthetic Chemical Load Accumulation

**The Core Problem:**
- 350,000+ synthetic chemicals in commerce
- Testing on <1% before release
- Production scales with economy + manufacturing
- Once released, persist for decades to millennia

**Accumulation Rate:**
```typescript
chemicalAccumulationRate = (economicStage * 0.002) + (manufacturingCap * 0.001);

// Mitigation:
chemicalAccumulationRate *= (1.0 - greenChemistry * 0.6);      // -60% at full deployment
chemicalAccumulationRate *= (1.0 - circularEconomy * 0.4);     // -40% at full deployment
chemicalAccumulationRate *= (1.0 - chemicalBans * 0.3);        // -30% at full deployment

// Remediation (very slow):
bioremediationRate = bioremediationDeployment * 0.001;          // -0.1%/month at full deployment
```

**Key Insight:**
- Production is fast (months to scale)
- Cleanup is extremely slow (decades to break down)
- **Prevention >> Cleanup** (by orders of magnitude)

---

### 2. Microplastics Accumulation

**What are Microplastics?**
- Plastic fragments <5mm
- Breakdown of larger plastics (bags, bottles, clothing fibers)
- Never fully disappear - just get smaller
- Now in air, water, soil, rain, snow, ice

**Where Found:**
- 100% of humans (blood, lungs, placenta, organs)
- Arctic ice cores
- Mariana Trench (deepest ocean)
- Mountain snow (remote wilderness)
- Table salt, bottled water, beer, honey
- **Nowhere is safe**

**Accumulation Rate:**
```typescript
microplasticRate = (economicStage * 0.0015) + (manufacturingCap * 0.0008);
microplasticRate *= (1.0 - circularEconomy * 0.5); // Reduce plastic production
```

**Key Properties:**
- Persistent: Never fully degrade (just fragment into nanoplastics)
- Pervasive: In every ecosystem on Earth
- Particulate: Cross cell membranes, enter organs
- Vector: Carry other toxic chemicals (sorption)

**Health Effects:**
- Inflammation
- Oxidative stress
- Endocrine disruption
- Unknown long-term effects (too recent to study)

---

### 3. PFAS ("Forever Chemicals")

**What is PFAS?**
- Per- and polyfluoroalkyl substances
- 4,700+ synthetic chemicals
- Called "forever chemicals" - never break down
- Carbon-fluorine bond strongest in organic chemistry

**Uses:**
- Non-stick cookware (Teflon)
- Water-resistant clothing
- Food packaging (grease-proof)
- Firefighting foam
- Industrial processes

**Prevalence:**
- 99% of Americans have PFAS in blood
- Drinking water of 200+ million Americans
- Global contamination (found in polar bears, penguins)

**Accumulation Rate:**
```typescript
pfasRate = economicStage * 0.001; // Industrial use
pfasRate *= (1.0 - chemicalBans * 0.7); // Bans very effective
```

**Health Effects:**
- Cancer (kidney, testicular)
- Thyroid disease
- Immune system damage
- Reproductive harm
- Developmental delays in children
- High cholesterol

**Key Problem:**
- Once released, **never breaks down**
- Accumulates indefinitely
- Bioaccumulates up food chain
- Only solution: Complete ban + containment

---

### 4. Endocrine Disruption

**What is Endocrine Disruption?**
- Chemicals that interfere with hormone systems
- Mimic hormones (estrogen, testosterone, thyroid)
- Block hormone receptors
- Alter hormone production/metabolism

**Mechanism:**
```typescript
avgChemicalExposure = (syntheticChemicalLoad + microplastics + pfas) / 3;
endocrineDisruption = avgChemicalExposure * 0.6; // 60% of chemicals are disruptors
```

**Common Disruptors:**
- Bisphenol A (BPA) - plastic bottles, receipts
- Phthalates - plastic softeners, cosmetics
- PFAS - everywhere
- Atrazine - pesticide (feminizes male frogs)
- Flame retardants - furniture, electronics

**Why Dangerous:**
- No safe threshold (even trace amounts cause effects)
- Timing matters (most harmful during development)
- Multi-generational effects (epigenetic changes)
- Subtle effects (hard to detect, study, regulate)

---

### 5. Reproductive Health Decline

**The Data:**
- 50% sperm count decline in 50 years (1973-2023)
- Accelerating: -1.4%/year before 2000, -2.6%/year after 2000
- Global: Western + non-Western nations
- Unknown cause (likely multi-factor)

**Suspected Factors:**
- PFAS exposure (prenatal + adult)
- Phthalates (anti-androgenic)
- Pesticides (endocrine disruptors)
- Microplastics (inflammation + hormone mimics)
- Heavy metals (neurotoxic + reproductive)

**Model Mechanics:**
```typescript
reproductiveDeclineRate = endocrineDisruption * 0.001; // Up to 0.1%/month
reproductiveDeclineRate *= (1.0 + bioaccumulation * 0.5); // Apex predators hit harder
```

**Reproductive Crisis Threshold:** 50% decline
- Widespread fertility problems
- IVF becomes necessary
- Population growth impacts
- 8% health QoL drop
- **Population Impact (NEW):** 0.08% mortality rate
  - Despair from failed fertility treatments
  - Psychological trauma from reproductive failure
  - Truly global: PFAS in 99% of human blood (100% exposure)
  - Mechanism: `addAcuteCrisisDeaths(state, 0.0008, reason, 1.00, 'pollution')`

**Extinction Pathway:**
- At 70% decline: Reproduction difficult
- Combined with chronic disease: Slow population collapse
- Timeline: 100+ years of gradual decline

---

### 6. Bioaccumulation

**What is Bioaccumulation?**
- Chemicals concentrate up food chain
- Each trophic level: 10x concentration
- Apex predators (humans) get highest doses

**Example: PCBs in Orcas**
- Plankton: 1 unit
- Small fish: 10 units
- Salmon: 100 units
- Orca: 1,000+ units
- Orca blubber: 1,000,000+ units (lethal)

**Model Mechanics:**
```typescript
bioaccumulationFactor = syntheticChemicalLoad * (0.5 + biodiversity * 0.5);
```

**Key Insight:**
- More biodiversity = more food web pathways = more bioaccumulation
- Apex predators (orcas, eagles, polar bears, humans) hit hardest
- Long-lived species accumulate over lifetime

**Bioaccumulation Collapse Threshold:** 60%
- Apex predators poisoned
- 8% instant biodiversity loss
- Top-down cascade (predator loss → prey overpopulation → ecosystem collapse)
- **Population Impact (NEW):** 0.15% mortality rate
  - Contaminated food chain poisoning
  - Food chain is globally interconnected (100% exposure)
  - Higher mortality than reproductive crisis (direct poisoning vs despair)
  - Mechanism: `addAcuteCrisisDeaths(state, 0.0015, reason, 1.00, 'pollution')`

**Real Examples:**
- Southern Resident Orcas: PCBs so high, cannot reproduce
- Bald eagles: DDT thinned eggshells (near extinction 1960s)
- Polar bears: PFAS + PCBs → immune suppression

---

### 7. Chronic Disease Epidemic

**Tracked Diseases:**
- Cancer (various types)
- Autoimmune disorders (lupus, MS, IBD)
- Developmental abnormalities (ADHD, autism)
- Metabolic disorders (diabetes, obesity)
- Neurodegenerative diseases (Parkinson's, Alzheimer's)

**Model Mechanics:**
```typescript
exposureYears = exposureMonths / 12;
cumulativeExposure = (syntheticChemicalLoad * exposureYears) / 100;

chronicDiseasePrevalence = 0.20 + (cumulativeExposure * 0.3) + (endocrineDisruption * 0.2);
```

**Key Insight:**
- Cumulative over time (longer exposure = more disease)
- Baseline 20% (pre-existing disease rates)
- Can reach 80% with high exposure

**Epidemic Threshold:** 40% prevalence
- Widespread health crisis
- Healthcare systems overwhelmed
- Up to 12% health QoL drop
- **Population Impact (NEW):** 0.4% mortality rate
  - Cancer/autoimmune disease surge
  - Highest mortality of the three crises (widespread disease)
  - Truly global: Chemical exposure is universal (100% exposure)
  - Mechanism: `addAcuteCrisisDeaths(state, 0.004, reason, 1.00, 'pollution')`

**Evidence:**
- Autism: 1 in 150 (2000) → 1 in 36 (2023)
- Childhood cancer: +30% since 1975
- Autoimmune diseases: +5-9%/year (exponential growth)
- Unknown causes (likely environmental)

---

### 8. Extinction Pathway

**Type:** Slow collapse (120 months = 10 years final decline)

**Multi-Century Timeline:**
1. **2022:** Boundary breached (already contaminated)
2. **2025-2075:** Accumulation phase (50 years)
3. **2075-2125:** Reproductive crisis (50 years)
4. **2125-2175:** Chronic disease epidemic (50 years)
5. **2175-2225:** Population decline (50 years)
6. **Total:** 200 years of gradual poisoning

**Mechanism:**
1. Reproductive health decline > 70% (fertility failing)
2. Chronic disease prevalence > 60% (health crisis)
3. Health QoL < 25% (barely surviving)
4. No detoxification technologies (<1.5 deployment total)
5. Each generation: Lower fertility + more disease
6. Population shrinks over 10 years
7. Extinction from slow poisoning

**Prevention:**
- Deploy green chemistry + bioremediation + chemical bans
- Combined deployment > 1.5 (50%+ each, or 100% one + 50% another)
- Timeline: 30-50 years to clean up
- Window: Must start before reproductive decline hits 70%

---

## Breakthrough Technologies

### 1. Green Chemistry
**Cost:** $150B (industry transformation)
**Effect:** -60% new chemical production
**Timeline:** 10-15 years
**Details:** Non-toxic alternatives to hazardous chemicals, AI-designed molecules
**Unlock:** AI capability > 2.0, Total research > 100
**Adoption:** 1.0%/month (gradual industry shift)

**Principles:**
- Design for degradation (chemicals that break down)
- Renewable feedstocks (bio-based, not petroleum)
- Less hazardous synthesis (safer reactions)
- Inherently safer chemistry (prevent accidents)

**Examples:**
- Water-based paints (vs VOC solvents)
- Bio-based plastics (polylactic acid from corn)
- Enzymatic detergents (vs harsh chemicals)
- Supercritical CO2 (vs toxic solvents)

### 2. Advanced Bioremediation
**Cost:** $200B (engineered microbes + deployment)
**Effect:** -0.1%/month cleanup (slow but permanent)
**Timeline:** 15-20 years
**Details:** Engineered microbes break down PFAS, microplastics, pesticides
**Unlock:** Biotech synthetic biology > 2.5, Total research > 150, Chemical load > 50%
**Adoption:** 0.8%/month when chemical load > 60%

**Methods:**
- CRISPR-engineered bacteria (specific enzyme pathways)
- Fungal degradation (white rot fungi break down plastics)
- Enzymatic breakdown (PETase for plastic, fluorinase for PFAS)
- Phytoremediation (plants absorb + concentrate toxics)

**Challenges:**
- PFAS extremely hard to break (C-F bond strongest in nature)
- Microplastics too small to capture (nanoplastics impossible)
- Slow: Decades to clean contaminated sites
- Risk: Engineered microbes in environment (safety testing required)

### 3. Full Circular Economy
**Cost:** $500B (systemic economic transformation)
**Effect:** -40% new chemical production
**Timeline:** 20-30 years
**Details:** Zero-waste manufacturing, closed-loop systems, eliminate pollution
**Unlock:** AI capability > 2.5, Economic stage ≥ 3.0 (post-scarcity)
**Adoption:** 0.6%/month (slowest - requires systemic change)

**Principles:**
- Design for disassembly (products easy to recycle)
- Material loops (all outputs = inputs for other processes)
- Biological nutrients (compostable materials)
- Technical nutrients (infinitely recyclable metals/polymers)
- Energy from renewables (no fossil fuel pollution)

**Examples:**
- Cradle-to-cradle certification
- Extended producer responsibility (take-back programs)
- Industrial symbiosis (one factory's waste = another's feedstock)
- Regenerative agriculture (soil health, not chemicals)

### 4. Chemical Safety Regulations
**Cost:** $50B (enforcement + monitoring)
**Effect:** -30% chemical load (bans worst offenders)
**Timeline:** 5-10 years
**Details:** Ban PFAS, restrict endocrine disruptors, require safety testing
**Unlock:** Government legitimacy > 60%, Chronic disease epidemic active
**Adoption:** 1.2%/month (policy implementation)

**Policies:**
- **Precautionary principle:** Prove safety before release (vs current: find harm after)
- **PFAS ban:** Phase out all uses (cookware, packaging, foam)
- **Endocrine disruptor list:** Restrict BPA, phthalates, flame retardants
- **Mandatory testing:** All chemicals tested before commerce
- **Right to know:** Public database of chemicals in products

**Real Progress:**
- EU REACH: Chemical registration, evaluation, authorization
- California Prop 65: Warning labels for carcinogens
- Stockholm Convention: Ban persistent organic pollutants
- Montreal Protocol: Phased out ozone-depleting chemicals (success story!)

---

## Research Validation

**Primary Sources:**

**Planetary Boundaries:**
- Kate Raworth: 5th boundary (novel entities) breached 2022
- Stockholm Resilience Centre: "Present everywhere in environment"

**Reproductive Health:**
- Meta-analysis (2017): 50-60% sperm count decline 1973-2011
- Update (2022): Decline accelerating, now global

**Microplastics:**
- Environmental Science & Technology (2020): Microplastics in human placenta
- Science (2022): Microplastics in human blood (77% of samples)
- Nature (2024): Microplastics in Antarctic penguins

**PFAS:**
- CDC (2023): PFAS in 99% of US population blood samples
- EWG (2024): PFAS in drinking water of 200+ million Americans
- Stockholm Convention: PFAS proposed for persistent pollutant list

**Endocrine Disruption:**
- Endocrine Society (2015): Scientific statement on endocrine disruptors
- Lancet (2016): $340B/year health costs from endocrine disruptors (US + EU)

**Chronic Disease Trends:**
- Autism: CDC data 1 in 150 (2000) → 1 in 36 (2023)
- Childhood cancer: SEER database +30% since 1975
- Autoimmune: Multiple studies showing 5-9%/year increase

---

## Integration with Other Systems

### Environmental Accumulation
- Biodiversity affects bioaccumulation (more food web = more concentration)
- Chemical load affects ecosystem health
- Bioaccumulation collapse → biodiversity loss (-8%)

### Extinction System
- Triggers environmental collapse extinction pathway
- Slow collapse (10-year final decline, 200-year total)
- Population decline via reproductive failure + chronic disease

### Quality of Life
- Health QoL directly impacted by chemical exposure
- Reproductive crisis: -8% health
- Chronic disease epidemic: Up to -12% health
- Ongoing monthly decline with high chemical load

### Population Dynamics (TIER 1.6)
- **NEW:** Direct population mortality from pollution crises
- Three crisis types with escalating mortality:
  1. Reproductive crisis: 0.08% casualties (despair/failed treatments)
  2. Bioaccumulation collapse: 0.15% casualties (contaminated food)
  3. Chronic disease epidemic: 0.40% casualties (cancer/autoimmune surge)
- All crises are **truly global** (100% exposure fraction)
  - PFAS in 99% of human blood = everyone exposed
  - Food chains globally interconnected
  - Chemical exposure universal
- Deaths tracked in `pollution` category
- Integration: Uses `addAcuteCrisisDeaths()` from populationDynamics.ts

### Breakthrough Technologies
- Tech unlocks require AI capability + biotech + research
- Auto-deployment based on crisis severity
- Circular economy needs post-scarcity economy (Stage 3+)

### Manufacturing & Economy
- Production drives chemical accumulation
- Circular economy reduces need for new chemicals
- Green chemistry transforms industrial processes

---

## Parameter Tuning

**Initial State (2025 - Already Breached):**
- Synthetic chemical load: 0.40 (significant contamination)
- Microplastic concentration: 0.45 (widespread)
- PFAS prevalence: 0.50 (99% of humans = 50% on 0-1 scale)
- Endocrine disruption: 0.25 (early signs)
- Reproductive health decline: 0.25 (50% decline = 50 years = ~25% on path)
- Bioaccumulation factor: 0.30 (concentrating up food chain)
- Chronic disease prevalence: 0.20 (baseline rates)

**Crisis Thresholds:**
- Boundary breach: 2022 (starts breached)
- Reproductive crisis: >50% decline (fertility widespread problem)
- Chronic disease epidemic: >40% prevalence (health crisis)
- Bioaccumulation collapse: >60% factor (apex predators failing)
- Extinction pathway: >70% reproductive + >60% disease + <25% health + <1.5 tech

**Accumulation Rates:**
- Synthetic chemicals: 0.2-0.3%/month (scales with economy + manufacturing)
- Microplastics: 0.15-0.23%/month (persistent, never disappears)
- PFAS: 0.1%/month (forever chemicals, accumulate indefinitely)
- Reproductive health: 0.1%/month max (accelerated by bioaccumulation)
- Chronic disease: Cumulative (exposure years × chemical load)

**Technology Deployment:**
- Green chemistry: 1.0%/month (industry transformation)
- Bioremediation: 0.8%/month (slow cleanup)
- Circular economy: 0.6%/month (systemic change, slowest)
- Chemical bans: 1.2%/month (policy, fastest)

**Cleanup Rates:**
- Bioremediation: -0.1%/month at full deployment (very slow!)
- Bans: Prevent new accumulation (don't remove existing)
- Key insight: **Prevention >> Cleanup** (10x more effective)

---

## Testing & Validation

**Monte Carlo Results (N=25):**
- Boundary breached: 100% of runs (starts breached 2022)
- Reproductive crisis: 8% of runs (2/25)
- Chronic disease epidemic: 12% of runs (3/25)
- Bioaccumulation collapse: 4% of runs (1/25)
- Extinction via chemical poisoning: 0% (green chemistry deployed in time)
- Mean chemical load at end: 52% (ongoing contamination but manageable)

**Scenarios Tested:**
1. **Business as usual:** Slow accumulation, reproductive crisis in 2070s
2. **Green chemistry early:** Prevents crisis, chemical load plateaus at 45%
3. **No intervention:** Reproductive crisis + chronic disease → extinction pathway triggered
4. **Bioremediation only:** Too slow, crisis still happens (prevention > cleanup)

---

## Future Enhancements (Post-TIER 1)

### Specific Chemical Classes
- Per-chemical tracking (PFAS, microplastics, pesticides, pharmaceuticals)
- Different health effects per class
- Different cleanup strategies per class
- Regulatory targeting of worst offenders

### Regional Contamination
- Industrial areas vs rural
- Developed nations vs developing (waste dumping)
- Hotspots (Superfund sites, e-waste dumps)
- Transboundary pollution (rivers, air)

### Multigenerational Effects
- Epigenetic changes (inherited traits)
- Declining baseline health each generation
- Accelerating decline (each generation more vulnerable)
- Point of no return (genetic damage too widespread)

### Food Web Modeling
- Explicit bioaccumulation chains
- Species-specific vulnerability
- Trophic magnification factors
- Ecosystem collapse cascades

---

## Code Structure

**Main File:** `src/simulation/novelEntities.ts`
- `updateNovelEntitiesSystem()` - Monthly update logic
- `checkNovelEntitiesTechUnlocks()` - Breakthrough detection & auto-deployment

**Phase:** `src/simulation/engine/phases/NovelEntitiesPhase.ts`
- Order: 27.0 (after ocean acidification, during environmental updates)
- Calls `updateNovelEntitiesSystem(state)` and `checkNovelEntitiesTechUnlocks(state)`

**Types:** `src/types/novelEntities.ts`
- `NovelEntitiesSystem` - Complete state interface

**Key Functions:**
- Synthetic chemical accumulation (lines 55-73)
- Microplastics (lines 75-80)
- PFAS (lines 82-87)
- Endocrine disruption (lines 89-92)
- Reproductive health decline (lines 94-114)
- Bioaccumulation (lines 116-135)
- Chronic disease epidemic (lines 137-157)
- Ongoing health impacts (lines 159-164)
- Extinction pathway (lines 166-192)

---

## References

**Primary Research:**
- Kate Raworth: Planetary boundaries, 5th boundary breached 2022
- Stockholm Resilience Centre: Novel entities ubiquitous

**Reproductive Health:**
- Levine et al. (2017): Sperm count decline meta-analysis
- Levine et al. (2022): Decline update, accelerating globally

**Microplastics:**
- Environmental Science & Technology: Microplastics in human placenta (2020), blood (2022)
- Science (2024): Microplastics in Antarctic wildlife
- Nature: Global microplastic distribution

**PFAS:**
- CDC NHANES: 99% prevalence in US blood samples
- EWG: Drinking water contamination mapping
- ATSDR: Health effects of PFAS exposure

**Endocrine Disruption:**
- Endocrine Society: Scientific statement (2015)
- Lancet: Economic costs ($340B/year US+EU)
- Environmental Health Perspectives: Multiple studies

**Chronic Disease:**
- CDC: Autism prevalence trends
- NCI SEER: Childhood cancer incidence
- Multiple journals: Autoimmune disease trends

---

## Recent Implementation (November 2025)

**Prevention vs Remediation Gating (Nov 13, 2025 - IMPLEMENTED):**
God mode testing revealed 0% effectiveness for Novel Entities boundary despite 7 pollution technologies deployed. Research validated this is **NOT a bug** but thermodynamically and economically accurate. Full prevention-gated remediation system now implemented.

**Research Foundation (16 peer-reviewed sources):**
1. **Energy Trap:** Removing PFAS at emission rate costs $20-7,000 trillion/year (0.2-66× global GDP) - Ling 2024
2. **Concentration Problem:** Lab scale (mg/L) vs environmental (ng/L) = 10^6-10^9× dilution, cost scales 12-47× - Li 2024
3. **Irreversibility:** Microplastic ocean recovery takes centuries even if input stopped, <10% reversible fraction - Kane 2022, Cousins 2022
4. **Montreal Protocol Analog:** Production ban = 90-95% recovery, cleanup = 5-10% → 10:1 ratio - Dodds 2024
5. **Rebound Effects:** Waste generation +81% (2023-2050) despite technology (Jevons paradox) - UNEP 2024, Sorrell 2025

**Implementation Architecture:**

**New Module:** `src/simulation/utils/novelEntitiesEffectiveness.ts` (262 lines)

**Prevention Technologies (Already in Tech Tree):**
- `global_pfas_ban`: 99% emission reduction, 120-month deployment (10 years)
- `plastic_production_phaseout`: 80% emission reduction, 240 months (20 years)
- `green_chemistry_substitution`: 70% emission reduction, 60 months (5 years)

**Gating Order (5 multipliers):**
1. **Regulation Gating (CRITICAL):** Without production controls, cleanup is futile (refills as fast as you clean)
   - No prevention tech: 1% effectiveness (point sources only - concentrated wastewater, industrial sites)
   - PFAS ban deployed: Up to 50% effectiveness (50% weight - worst offender)
   - All 3 prevention techs: 100% effectiveness (production controlled, cleanup works)
   - Research: Montreal Protocol 10:1 prevention:remediation ratio (Dodds 2024)

2. **Energy Constraint (OPTIONAL):** Thermodynamic trap - cleanup requires massive energy
   - Checks renewable surplus vs tech energy requirements
   - Graceful degradation if power generation data unavailable
   - Research: Li 2024 (5-7 kWh/m³), Ling 2024 (850-1200°C thermal destruction)

3. **Concentration Factor (CRITICAL):** Lab scale vs environmental scale dilution
   - Lab concentrations (mg/L): 100% effectiveness
   - Environmental dilution (ng/L): 0.1% effectiveness (10^6-10^9× dilution)
   - Research: Li 2024 (12-47× cost scaling), Newell 2025 (sub-ng/L infeasible)

4. **Time Lag Differentiation:** Prevention faster than remediation
   - Prevention tech (bans): 10-20 years (Montreal Protocol did 12 years)
   - Remediation tech (infrastructure): 30-50 years (massive scale-up)
   - Validation requirement: Sylvia insisted on differentiation

5. **Rebound Effects (Jevons Paradox):** Cleanup success → increased production (moral hazard)
   - 30% effectiveness offset when regulation < 80%
   - Research: UNEP 2024 (waste +81%), Sorrell 2025 (AI hardware)
   - Derived assumption: 30% is CONSERVATIVE (theory: 20-80%)

**Irreversibility Floor (90%):**
- Modified: `src/simulation/planetaryBoundaries.ts`
- Added `peakValue` field to track peak contamination
- Asymptotic approach to 90% of peak (can't clean below this floor)
- Research basis: Cousins 2022 (global distribution), Kane 2022 (centuries recovery), Ling 2024 (thermodynamic constraints)
- Derived assumption: Not directly measured, requires sensitivity testing

**Type System Updates:**
- Modified: `src/types/planetaryBoundaries.ts`
- Added `peakValue?: number` to PlanetaryBoundary interface
- Comprehensive JSDoc with research citations

**Integration:**
- Modified: `src/simulation/techTree/effectsEngine.ts` - Calls `calculateNovelEntitiesRemediationEffectiveness()` for cleanup tech
- Modified: `src/simulation/techTree/engine.ts` - Pass RNG to applyAllTechEffects (determinism fix)

**Parameter Classification:**
- **VERIFIED (directly stated in sources):** Ling 2024 costs, Cousins 2022 distribution, Li 2024 energy
- **CALCULATED (derived from source data):** Montreal Protocol 10:1 ratio (Dodds 2024)
- **DERIVED ASSUMPTIONS (model assumptions):** 90% irreversible fraction, 30% rebound factor, 0.001 concentration multiplier

**Expected Results:**
- Baseline (no prevention): 0-2% effectiveness (matches god mode observation)
- Regulated (prevention + remediation): 5-50% effectiveness over 30-50 years
- Irreversibility floor: Prevents >10% total recovery

**Quality Gates:**
- ✅ **Research (Quality Gate 1):** PASSED - Grade B+ (defensible with noted uncertainties)
- ✅ **Implementation:** COMPLETE
- 🔄 **Monte Carlo Validation (Priya):** PENDING - N≥30 runs with sensitivity testing
  - irreversibleFraction: [0.70, 0.90, 0.95]
  - reboundFactor: [0.5, 0.7, 0.9]
  - Baseline vs Regulated scenarios

**Research Files:**
- Analysis: `research/novel_entities_zero_effectiveness_20251113.md` (742 lines, 16 sources)
- Design: `plans/novel_entities_model_redesign_20251113.md` (276 lines)
- Verification: `research/verification_7ac8b8f_20251113.md` (citation + claim verification)
- Review: `reviews/novel_entities_research_critique_20251113.md` (Grade B+, Quality Gate 1 PASSED)
- Handoff: `.claude/handoffs/novel_entities_implementation_handoff.md`

**Research Citations:**
- Ling, A. L. (2024). Science of the Total Environment, 918, 170647
- Cousins, I. T., et al. (2022). Environmental Science & Technology, 56(16), 11172-11179
- Dodds, K. C., et al. (2024). Nature Geoscience, 17(2), 170-177
- Li, L., et al. (2024). Water Research, 248, 120850
- Newell, C. J., et al. (2025). Environmental Science & Technology, 59(1), 234-245
- Kane, I. A., et al. (2022). Science, 377(6608), 924-927
- UNEP (2024). Global Waste Management Outlook 2024
- Sorrell, S., et al. (2025). Energy Policy, 178, 113597

---

**Last Updated:** November 13, 2025
**Implementation Status:** ✅ Prevention-gated remediation COMPLETE, 🔄 Monte Carlo validation PENDING
**Next Steps:** Priya validation (N≥30 with sensitivity), then per-chemical tracking + multigenerational effects (TIER 2+)
