# Research Requests for Model Validation
**Date:** November 14, 2025
**Requester:** Autonomous Worker
**Context:** Issue #15 - 3-6 Month Validation Plan

## PRIORITY 1: Technology Diffusion Delays (20-30h implementation)

**Research Needed:**
- Rogers diffusion curve parameters (2.5% innovators → 13.5% early adopters → 34% early majority → 34% late majority → 16% laggards)
- COVID-19 vaccine rollout data (2021-2023): Time to 50% coverage by country income level
- Historical technology adoption curves:
  - Electricity (1880s-1940s)
  - Automobiles (1900s-1950s)
  - Internet (1990s-2010s)
  - Renewable energy (2000s-2020s)
- Peer-reviewed sources (2020-2025 preferred) on:
  - Barriers to technology adoption in crisis scenarios
  - Infrastructure dependencies for breakthrough tech deployment
  - Socioeconomic factors affecting diffusion speed

**Parameters to Extract:**
- Time lag from invention to 10% adoption (innovators + early adopters)
- Time lag from 10% to 50% adoption (early majority)
- Time lag from 50% to 84% adoption (late majority)
- Laggard holdout duration (never adopt)
- Crisis multipliers (does urgency accelerate or slow adoption?)

**Expected Sources:**
- Rogers, E. M. (2003). Diffusion of Innovations (5th ed.)
- WHO COVID-19 vaccine tracker (2021-2023)
- IRENA renewable energy adoption reports (2024-2025)
- Academic papers on technology diffusion under resource constraints

---

## PRIORITY 2: Supply Chain Brittleness (25-35h implementation)

**Research Needed:**
- Just-In-Time (JIT) failure cascade thresholds
- 2021 Suez Canal blockage: 6 days → 10% global trade disruption
- 2020-2021 semiconductor shortage cascades
- 2022 Ukraine war grain export failures
- Historical supply chain collapse data:
  - World Wars (rationing, substitution)
  - Natural disasters (port closures, route changes)
  - Pandemic disruptions (2020-2023)

**Parameters to Extract:**
- Critical disruption threshold (% capacity loss → cascade)
- Recovery time by industry (food: days, electronics: months)
- Geographic concentration risk (single point of failure)
- Inventory buffer sizes (historical vs modern JIT)
- Cascade amplification factors (primary → secondary → tertiary impacts)

**Expected Sources:**
- McKinsey supply chain resilience reports (2023-2024)
- IMF economic impact assessments (2020-2022)
- Academic papers on supply chain network theory
- Case studies: Suez Canal, COVID-19, Ukraine war

---

## PRIORITY 3: Historical Validation - Additional Events

**Research Needed:**

### 1347 Black Death (30-60% mortality)
- Total deaths by region (Europe, Asia, Middle East)
- Timeline (1347-1353)
- Regional variation (urban vs rural, trade routes)
- Social/economic collapse indicators
- Recovery timeline (50-150 years)

### 536 Volcanic Winter
- Temperature drop magnitude (°C)
- Duration of agricultural failure (years)
- Mortality estimates (if available)
- Geographic extent (hemispheric vs global)
- Historical records (Byzantine, Chinese chronicles)

### 1816 Year Without a Summer
- Temperature anomaly (°C)
- Agricultural production drops (% by region)
- Famine deaths (Europe, North America, Asia)
- Social unrest indicators (riots, migration)
- Recovery duration

### Toba Eruption (74,000 BCE)
- Volcanic winter magnitude
- Genetic bottleneck evidence (10,000-30,000 individuals)
- Duration of population suppression
- Climate impact magnitude
- Archaeological evidence

**Expected Sources:**
- Benedictow, O. J. (2004). The Black Death 1346-1353
- Stothers, R. B. (1984). Mystery cloud of AD 536 (Science)
- Oppenheimer, C. (2003). Climatic, environmental and human consequences of the largest known historic eruption
- Ambrose, S. H. (1998). Late Pleistocene human population bottlenecks (Journal of Human Evolution)

---

## PRIORITY 4: Geopolitical Fragmentation

**Research Needed:**
- International cooperation decay under resource scarcity
- Ukraine war precedent: grain export failures, energy disruptions
- Climate-induced migration → border militarization
- Trade bloc formation/dissolution during crises
- Historical precedents:
  - 1930s nationalist retrenchment
  - Cold War bloc formation
  - 2008 financial crisis protectionism

**Parameters to Extract:**
- Cooperation decay rate as scarcity increases
- Threshold for trade bloc fragmentation
- Military conflict probability vs resource stress
- Refugee crisis → policy hardening timeline
- Recovery of cooperation post-crisis

**Expected Sources:**
- IPCC AR6 on climate migration (2021-2023)
- IMF/World Bank on trade fragmentation (2022-2024)
- Academic papers on cooperation theory under scarcity
- Case studies: Ukraine war, COVID-19 vaccine nationalism

---

## PRIORITY 5: Psychological Factors

**Research Needed:**
- Denial, panic, learned helplessness in crisis response
- Spanish Flu denial patterns (mask resistance, public health rejection)
- Climate change denial persistence despite evidence
- COVID-19 behavioral responses by phase:
  - Initial panic (hoarding, social breakdown)
  - Adaptation phase (normalization)
  - Fatigue phase (non-compliance)
  - Denial/minimization

**Parameters to Extract:**
- % population in denial at different crisis severity levels
- Panic threshold (when does orderly response → chaos?)
- Learned helplessness onset (repeated failures → apathy)
- Recovery from psychological trauma (years)
- Trust degradation curves (government, experts, institutions)

**Expected Sources:**
- Behavioral economics literature (Kahneman, Tversky)
- COVID-19 behavioral studies (2020-2023)
- Climate psychology research (2023-2025)
- Historical case studies: Spanish Flu, Great Depression, WWII

---

## Validation Methodology

**For Each Historical Event:**
1. Identify key metrics (deaths, temperature, duration)
2. Extract parameter ranges (conservative → moderate → aggressive)
3. Document uncertainties (confidence intervals)
4. Map to simulation mechanics (which systems reproduce this?)
5. Define success criteria (within 2× actual for falsification test)

**Quality Standards:**
- 2+ peer-reviewed sources per parameter
- Prefer 2020-2025 sources (latest research)
- Document contradictory evidence (honest uncertainty)
- Quantify parameter sensitivity (how much does ±20% change outcomes?)

---

## Timeline

**Week 1 (BLOCKING):**
- Spanish Flu validation (Phases 3-4, 3-4h remaining)

**Weeks 2-4 (HIGH PRIORITY):**
- Technology diffusion research (5-8h) + implementation (20-30h)
- Supply chain brittleness research (5-8h) + implementation (25-35h)

**Months 2-3 (MEDIUM PRIORITY):**
- Historical validation suite research (20-30h) + implementation (20-30h)
- Geopolitical fragmentation research (10-15h) + implementation (40-60h)

**Month 3+ (LOW PRIORITY):**
- Psychological factors research (15-20h) + implementation (50-80h)

---

## Research Agents

**Cynthia (super-alignment-researcher):**
- Extract parameters from peer-reviewed sources
- Find latest 2024-2025 research on technology diffusion, supply chains
- Compile historical event data with citations

**Sylvia (research-skeptic):**
- Find contradictory evidence for all parameters
- Identify overconfidence in historical estimates
- Flag methodological weaknesses in source studies

**Expected Output:**
- Research reports with full citations (format: `research/[topic]_[date].md`)
- Parameter tables with ranges (conservative, moderate, aggressive)
- Critique documents highlighting uncertainties
- Implementation recommendations with priority levels
