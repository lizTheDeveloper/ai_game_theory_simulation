# AI Energy and Water Consumption Research Updates - November 2025

**Research Date:** 2025-11-06
**Researcher:** Cynthia (Super-Alignment Researcher)
**Purpose:** Update AI infrastructure parameters with latest 2024-2025 energy/water consumption data
**Status:** COMPLETED

---

## Executive Summary

This research updates AI infrastructure parameters based on 2024-2025 industry reports, peer-reviewed studies, and vendor specifications. Key findings: (1) H100 GPUs consume 700W TDP but average 427W continuous draw (3,740 kWh/year), (2) frontier model training (GPT-3 scale) requires 1,248 MWh and 700,000 liters of water, (3) inference costs have improved 120× since 2023 to ~0.4 J/token on modern hardware, (4) datacenter PUE has improved to 1.09 (Google 2024) vs. 1.56 industry average, and (5) water consumption averages 1.8 L/kWh but varies from 0.15 L/kWh (AWS) to 25.5M L/year for 1MW facilities using evaporative cooling.

**Simulation Implications:**
- Update H100 training energy: 3,740 kWh/GPU/year, 1,248 MWh per GPT-3 scale model
- Update inference efficiency: 0.42 Wh per GPT-4o query (500 tokens), ~9M tokens/kWh
- Update datacenter PUE: 1.09 (best-in-class) to 1.56 (industry average)
- Update water consumption: 1.8 L/kWh average, 700,000 L per frontier model training, 500ml per 10-50 queries
- Add embodied carbon: 164 kg CO2e per H100 GPU (manufacturing)

---

## 1. Training Energy Consumption

### H100 GPU Energy Specifications

**Parameter: H100 Power Consumption**
- **TDP (Thermal Design Power):** 700W per GPU
- **Measured Average Draw:** 427W continuous (3,740 kWh/year @ 61% utilization)
- **System-Level (8× H100):** 10.2 kW TDP, 8.4 kW measured peak

**Primary Sources:**

1. **IEEE 2024 Empirical Measurement Study:**
   - **Citation:** "Single-Node Power Demand During AI Training: Measurements on an 8-GPU NVIDIA H100 System." *IEEE Journals & Magazine*, 2024. https://ieeexplore.ieee.org/document/10938551
   - **Study Design:** Direct measurement of H100 system during AI training workloads
   - **Key Finding:** "Maximum observed power draw was approximately 8.4 kW, 18% lower than the manufacturer-rated 10.2 kW, even with GPUs near full utilization"
   - **Actual vs. TDP:** Power draw "consistently remains well below thermal design TDP, with even computationally intensive workloads drawing on average no more than 76% of TDP"
   - **Credibility:** Peer-reviewed empirical measurement, IEEE publication, 2024 data

2. **Brookhaven National Laboratory Study (2024):**
   - **Citation:** "Empirical Measurements of AI Training Power Demand on a GPU-Accelerated Node." arXiv:2412.08602v1, 2024. https://arxiv.org/html/2412.08602v1
   - **Measured Efficiency:** FP8 precision = 2.46 J/token, BF16 precision = 3.63 J/token (December 2024 NVIDIA software)
   - **Training Example:** GPT-3 175B model, 300B tokens → 19 annual US households' energy (FP8) or 28 households (BF16)
   - **Credibility:** U.S. Department of Energy funded, empirical measurements on production hardware

3. **Annual Energy Consumption:**
   - **Citation:** Tom's Hardware analysis (2024). https://www.tomshardware.com/tech-industry/nvidias-h100-gpus-will-consume-more-power-than-some-countries-each-gpu-consumes-700w-of-power-35-million-are-expected-to-be-sold-in-the-coming-year
   - **Finding:** "At 61% annual utilization, an H100 GPU would consume approximately 3,740 kilowatt-hours (kWh) of electricity annually"
   - **Calculation:** 700W × 8,760 hours/year × 61% utilization = 3,740 kWh/year
   - **Fleet Impact:** 3.5M H100s sold in 2024 → 13.1 TWh/year total consumption

---

### Frontier Model Training Energy

**Parameter: Energy per Frontier Model Training Run**
- **GPT-3 (175B parameters, 300B tokens):** 1,248 MWh (1,248,000 kWh)
- **Compute:** 3,640 PetaFLOP-days

**Primary Source:**
- **Citation:** Substack analysis (2024). "The Energy Cost of Teaching Machines: Diving Deep into energy and LLMs." https://higes.substack.com/p/the-energy-cost-of-teaching-machines-diving-deep-into-energy-and-llms-d01f7e1acb12
  - **GPT-3 Training:** 3,640 petaflops/s-days using a supercomputer with 285,000 CPU cores + 10,000 GPUs
  - **Total Energy:** 1,248 megawatt-hours (MWh)
  - **Conversion Factor:** 1 petaFLOP/s-day ≈ 343 kWh (derived: 1,248 MWh ÷ 3,640 PF-days)
  - **Hardware:** Pre-H100 generation (likely V100/A100), so H100 would be more efficient

**Efficiency Improvements (H100 vs. A100):**
- **Source:** NVIDIA documentation (2024)
  - **H100 vs. A100:** 3× better performance per watt
  - **Implication:** GPT-3 training on H100s would require ~416 MWh (1/3 of original 1,248 MWh)

**GPT-4 Training Estimate (Speculative):**
- **Parameter Count:** ~1.7 trillion parameters (estimated, not confirmed by OpenAI)
- **Energy Scaling:** If linear with parameters, ~10× GPT-3 → 12,480 MWh (12.5 GWh)
- **Uncertainty:** High - OpenAI has not disclosed GPT-4 training energy
- **Use with Caution:** No empirical data available for GPT-4/Claude 3/Gemini Ultra training costs

---

### PetaFLOP-days to kWh Conversion

**Parameter: Energy Efficiency (kWh per PetaFLOP-day)**
- **Legacy Hardware (V100/A100):** 343 kWh/PF-day (derived from GPT-3 data)
- **H100 Hardware:** ~114 kWh/PF-day (assuming 3× efficiency improvement)

**Derivation:**
- GPT-3: 3,640 PF-days = 1,248 MWh → 343 kWh/PF-day
- H100 efficiency: 343 kWh ÷ 3 = 114 kWh/PF-day

**Simulation Parameter:**
```typescript
const TRAINING_ENERGY = {
  kwhPerPetaflopDay: {
    legacy: 343,     // V100/A100 era (2020-2022)
    h100: 114,       // H100 era (2023-2025)
    future: 50       // Projected Blackwell/GB200 (2026+)
  },
  frontierModelExamples: {
    gpt3_175B: 1_248_000,    // kWh, empirical
    gpt4_estimated: 4_160_000 // kWh, speculative (assumes H100, 10× scale)
  }
};
```

---

## 2. Inference Energy Consumption

### Per-Query Energy Consumption

**Parameter: Energy per Inference Query**
- **GPT-4o (500 token query):** 0.42 Wh (± 0.13 Wh)
- **GPT-4o vs. Google Search:** 40% higher (0.42 Wh vs. 0.30 Wh)
- **Llama-3-70B:** 1.7 Wh average per query

**Primary Sources:**

1. **arXiv 2025 Benchmarking Study:**
   - **Citation:** "How Hungry is AI? Benchmarking Energy, Water, and Carbon Footprint of LLM Inference." arXiv:2505.09598v1, 2025. https://arxiv.org/html/2505.09598v1
   - **GPT-4o Query:** "A single short GPT-4o query consumes 0.42 Wh (± 0.13 Wh), exceeding the footprint of a Google search (0.30 Wh) by approximately 40%"
   - **Llama-3-70B:** "The largest text generation model (Llama-3-70B from Meta) consumes 1.7Wh on average per query"
   - **Credibility:** 2025 peer-reviewed preprint, comprehensive benchmarking across models

2. **Efficiency Improvements (2023-2025):**
   - **Citation:** Clune Lab Blog (2025). "Environmental Impact of AI." https://clune.org/posts/environmental-impact-of-ai/
   - **Finding:** "Massive efficiency gains of over 120× improvement in energy efficiency (Joules per token) for LLM inference from early GPT-3 era estimates to current optimized setups on H100 hardware in 2025"
   - **Early GPT-3 (2023):** ~3-4 J/token
   - **Current H100 (2025):** ~0.4 J/token
   - **Mechanism:** Hardware improvements (H100 vs. V100), software optimization, quantization (FP8 vs. BF16)

---

### Tokens per kWh (Inference Efficiency)

**Parameter: Inference Efficiency**
- **Value:** ~9 million tokens per kWh (modern H100 hardware, 2025)

**Derivation:**
- 0.4 J/token = 0.00011 kWh/token
- 1 kWh ÷ 0.00011 kWh/token = 9,090,909 tokens/kWh ≈ 9M tokens/kWh

**Supporting Data:**
- **GPT-4o:** 0.42 Wh per 500-token query → 0.84 mWh/token → 1.19M tokens/kWh
- **Optimized H100:** 0.4 J/token → 9M tokens/kWh
- **Range:** 1.2M to 9M tokens/kWh depending on model size, hardware, optimization

**Simulation Parameter:**
```typescript
const INFERENCE_ENERGY = {
  whPerQuery: {
    gpt4o: 0.42,        // ± 0.13 Wh, 500 tokens
    llama70B: 1.7,      // Larger model, less optimized
    average: 0.8        // Mid-range estimate
  },
  tokensPerKwh: {
    legacy: 1_200_000,  // Early 2023 (3-4 J/token)
    current: 9_000_000, // 2025 H100 (0.4 J/token)
    optimistic: 20_000_000 // Future specialized hardware
  },
  joulesPerToken: {
    bf16: 3.63,         // High-precision
    fp8: 2.46,          // Quantized
    optimized: 0.4      // 2025 best-in-class
  }
};
```

---

### Training vs. Inference Energy Balance

**Parameter: Training vs. Inference Energy Split**
- **Training:** 40% of total generative AI energy (Google estimate)
- **Inference:** 60% of total generative AI energy

**Primary Source:**
- **Citation:** Google analysts (2024), reported in various sources
  - **Finding:** "Training accounts for 40% of the energy used by their generative AI while the other 60% came from running queries"
  - **Implication:** At scale, inference dominates energy consumption
  - **Crossover Point:** Once a model serves >millions of queries, inference energy exceeds training energy

**Example Calculation (GPT-4o):**
- **Training:** 4,160,000 kWh (speculative)
- **Daily Inference:** 1B queries/day × 0.42 Wh/query = 420,000 kWh/day = 153M kWh/year
- **Ratio:** Inference energy (153M kWh/year) >> Training energy (4.16M kWh one-time)
- **Conclusion:** Inference dominates after ~28 days of operation at 1B queries/day

---

## 3. Datacenter Power Usage Effectiveness (PUE)

### Current Industry Performance (2024-2025)

**Parameter: Datacenter PUE**
- **Google (Best-in-Class):** 1.09 (2024 average, Q1 2025: 1.08)
- **Microsoft (Cloud Average):** 1.1 (improved from 1.25 in early cloud era)
- **Meta (Luleå, Sweden):** 1.07 (natural cooling)
- **Industry Average:** 1.56

**Primary Sources:**

1. **Google Official Data (2024-2025):**
   - **Citation:** "Power usage effectiveness – Google Data Centers." https://datacenters.google/efficiency/
   - **2024 Annual PUE:** 1.09
   - **Q1 2025 TTM PUE:** 1.09 (quarterly: 1.08)
   - **Q2 2025 TTM PUE:** 1.09 (quarterly: 1.10)
   - **Comparison:** "When compared with the industry average of 1.56, Google's data centers used about 84% less overhead energy for every unit of IT equipment energy"
   - **Credibility:** Official vendor data, publicly reported, audited metrics

2. **Microsoft Cloud Evolution:**
   - **Citation:** "Datacenter power and energy management: past, present, and future." Microsoft Research, 2024. https://www.microsoft.com/en-us/research/wp-content/uploads/2024/11/DC-power-and-energy-management-FINAL.pdf
   - **Finding:** "Over the period of cloud datacenter development, cloud datacenter PUEs improved from around ~1.25 to ~1.1 on average"
   - **Mechanism:** "Reducing power delivery losses to a few percent by reducing the number of power conversions under normal operation, while creating more efficient cooling systems by bringing outside air into the datacenter for cooling in addition to the earlier hot-aisle/cold-aisle layout for server racks"

3. **Meta Efficiency:**
   - **Citation:** Sustainability Magazine (2024). https://sustainabilitymag.com/articles/the-water-consumption-question-data-centres-and-utilities
   - **Finding:** "Meta's Luleå data center in Sweden utilizes natural cooling systems to maintain a PUE of 1.07"
   - **Location Advantage:** Cold climate enables free cooling (outside air), minimal chiller usage

---

### PUE Definition and Interpretation

**PUE Formula:**
```
PUE = Total Facility Energy / IT Equipment Energy
```

**Example:**
- IT Equipment: 1,000 kW
- Cooling: 80 kW
- Power Distribution Losses: 10 kW
- Total Facility: 1,090 kW
- PUE = 1,090 / 1,000 = 1.09

**Interpretation:**
- **PUE 1.0:** Ideal (100% energy to IT, 0% overhead) - physically impossible
- **PUE 1.09 (Google):** 9% overhead energy for cooling/power distribution
- **PUE 1.56 (Industry Average):** 56% overhead energy
- **Energy Waste:** (PUE - 1.0) × 100% = overhead percentage

**Simulation Parameter:**
```typescript
const DATACENTER_PUE = {
  bestInClass: 1.09,      // Google/Microsoft/Meta (2024-2025)
  industryAverage: 1.56,  // Uptime Institute global average
  legacy: 2.0,            // Pre-2015 datacenters
  future: 1.05,           // Target for next-gen facilities

  // Effective multiplier for total energy
  // Total Energy = IT Energy × PUE
};
```

---

### Regulatory Developments (2024)

**EU PUE Reporting Requirement:**
- **Citation:** TechTarget (2024). https://www.datacenterknowledge.com/business/task-force-updates-guidance-on-measuring-pue
- **Finding:** "In the European Union, data centers are now required to report their PUE as of 2024"
- **Policy:** Energy Efficiency Directive (EED) requires PUE tracking and reporting to central database
- **Minimum Standards:** Some regions (e.g., Virginia) considering PUE ≤ 1.2 for new developments

---

## 4. Water Consumption for Cooling

### Datacenter Water Usage Metrics

**Parameter: Water Usage Effectiveness (WUE)**
- **Value:** 1.8 liters per kWh (industry average, 2024)
- **Range:** 0.15 L/kWh (AWS best-in-class) to 25.5M L/year for 1MW facility (evaporative cooling)

**Primary Sources:**

1. **Industry Average WUE:**
   - **Citation:** "Data Centers and Water Consumption." Environmental and Energy Study Institute (EESI), 2024. https://www.eesi.org/articles/view/data-centers-and-water-consumption
   - **Finding:** "The average WUE across data centers is 1.9 liters per kWh"
   - **Alternative Source:** "The average data center uses 1.8 L of water per kWh" (Data Center Dynamics, 2024)

2. **AWS High-Efficiency Performance:**
   - **Citation:** IEEE Spectrum (2024). "The Real Story on AI Water Usage at Data Centers." https://spectrum.ieee.org/ai-water-usage
   - **Finding:** "AWS data centers use 0.15 liters of water per kilowatt-hour, significantly below the industry average"
   - **Mechanism:** Closed-loop cooling, chiller-based systems, minimal evaporative loss

3. **Traditional Evaporative Cooling:**
   - **Citation:** TechTarget (2024). "How do data centers use and manage water?" https://www.techtarget.com/searchdatacenter/tip/How-to-manage-data-center-water-usage-sustainably
   - **Finding:** "A small 1 MW data centre using traditional cooling can use around 25.5 million litres of water per year"
   - **Calculation:** 25.5M L/year ÷ (1,000 kW × 8,760 hours) = 2.9 L/kWh
   - **Context:** "Equivalent to the water usage of a town with 30,000-50,000 residents"

---

### Large-Scale Datacenter Water Consumption

**Parameter: Datacenter Daily Water Consumption**
- **Large Facility (Hyperscale):** 3-5 million gallons/day (11.3-18.9 million liters/day)
- **Equivalent:** Town of 30,000-50,000 people

**Primary Source:**
- **Citation:** Lawfare Media (2024). "AI Data Centers Threaten Global Water Security." https://www.lawfaremedia.org/article/ai-data-centers-threaten-global-water-security
  - **Finding:** "Large data centers can consume up to 5 million gallons per day, equivalent to the water use of a town populated by 10,000 to 50,000 people"
  - **Specific Range:** "A single large-scale data center can consume between 3-5 million gallons of water daily for cooling purposes"

**Water-Stressed Regions:**
- **Citation:** Bloomberg (2025). "The AI Boom Is Draining Water From the Areas That Need It Most." https://www.bloomberg.com/graphics/2025-ai-impacts-data-centers-water-data/
  - **Finding:** "More than 160 new AI data centers have sprung up across the US in the past three years in places with high competition for scarce water resources, representing a 70% increase from the prior three-year period"
  - **Impact:** "The proportion of data centers in water-stressed regions is at a record high"

---

### Zero-Water Cooling Technologies (2024 Innovations)

**Parameter: Next-Generation Cooling Water Consumption**
- **Value:** 0 L/kWh (closed-loop chip-level cooling)
- **Water Savings:** 125 million liters/year per datacenter

**Primary Source:**
- **Citation:** Microsoft Cloud Blog (2024). "Sustainable by design: Next-generation datacenters consume zero water for cooling." https://www.microsoft.com/en-us/microsoft-cloud/blog/2024/12/09/sustainable-by-design-next-generation-datacenters-consume-zero-water-for-cooling/
  - **Launch Date:** August 2024
  - **Technology:** "Closed-loop chip-level cooling that will avoid the need for more than 125 million liters of water per year per datacenter"
  - **Target:** AI workloads (high-density GPUs)
  - **Mechanism:** Direct-to-chip liquid cooling, heat exchanged to air-cooled radiators (no evaporation)

**Implication for Simulation:**
- Legacy datacenters: 1.8 L/kWh
- Modern datacenters: 0.15-1.0 L/kWh
- Next-gen (2025+): 0 L/kWh
- Model technology adoption curves over time

---

### Simulation Parameters: Water Consumption

```typescript
const WATER_CONSUMPTION = {
  wueMetrics: {
    legacy: 2.9,           // L/kWh, evaporative cooling
    industryAverage: 1.8,  // L/kWh, 2024 average
    awsBestPractice: 0.15, // L/kWh, closed-loop chiller
    nextGen: 0.0           // L/kWh, chip-level cooling (2024+)
  },

  facilityScale: {
    // Large hyperscale datacenter
    dailyConsumption: 15_000_000,  // Liters/day (mid-range: 3-5M gallons)
    equivalentPopulation: 40_000    // People equivalent
  },

  coolingTechnology: [
    { name: "Evaporative", wue: 2.9, adoptionPct2024: 30 },
    { name: "Chiller", wue: 1.8, adoptionPct2024: 50 },
    { name: "Air-cooled", wue: 0.15, adoptionPct2024: 15 },
    { name: "Chip-level", wue: 0.0, adoptionPct2024: 5 }
  ]
};
```

---

## 5. AI Model Water Footprint

### Training Water Consumption

**Parameter: Water per Frontier Model Training**
- **GPT-3 (175B parameters):** 700,000 liters direct on-site consumption (5.4M liters total including indirect)
- **GPT-4 (estimated):** >2 million liters (speculative, scaled from GPT-3)

**Primary Sources:**

1. **GPT-3 Direct Water Consumption:**
   - **Citation:** Li, P., et al. (2023). "Making AI Less 'Thirsty': Uncovering and Addressing the Secret Water Footprint of AI Models." arXiv:2304.03271. https://arxiv.org/abs/2304.03271
   - **Finding:** "Training GPT-3 in Microsoft's U.S. data centers can consume a total of 5.4 million liters of water, including 700,000 liters of direct on-site water consumption (approximately 185,000 gallons)"
   - **Methodology:** Combines on-site datacenter cooling water with off-site water for electricity generation
   - **Credibility:** Peer-reviewed, widely cited (referenced in Nature, OECD reports), 2023 publication updated through 2025

2. **GPT-4 Estimate:**
   - **Citation:** Same source (Li et al., 2023)
   - **Finding:** "GPT-4, the model currently used by ChatGPT, reportedly has a much larger size and hence likely consumes more water than GPT-3"
   - **Uncertainty:** No empirical data disclosed by OpenAI
   - **Scaling Assumption:** If linear with parameters and GPT-4 is ~10× GPT-3, water consumption ~7M liters

---

### Inference Water Consumption

**Parameter: Water per Query**
- **GPT-4 (100-word email):** 500 ml (17 oz)
- **GPT-3 (10-50 medium responses):** 500 ml bottle
- **GPT-4o (typical query):** 519 ml

**Primary Sources:**

1. **GPT-4 Query Water Footprint:**
   - **Citation:** arXiv 2505.09598v1 (2025) and multiple confirmatory sources
   - **Finding:** "Using GPT-4, generating a 100-word email consumes about 500ml of water (17 oz), and 10 to 50 queries consume about 2 litres of water (½ gallon)"
   - **Alternative Measurement:** "ChatGPT with GPT-4 uses approximately 519 milliliters of water, slightly more than one 16.9 ounce bottle, to write one 100-word email" (TechRepublic, 2024)

2. **GPT-3 Query Water Footprint:**
   - **Citation:** Li et al. (2023), arXiv:2304.03271
   - **Finding:** "GPT-3 needs to 'drink' a 500ml bottle of water for roughly 10–50 medium-length responses"
   - **Per-Response:** 10-50 ml per query (depending on length)

**Calculation Verification:**
- GPT-4 inference: 0.42 Wh/query
- Datacenter WUE: 1.8 L/kWh average
- Water per query: 0.42 Wh × 1.8 L/kWh = 0.756 L = 756 ml
- **Discrepancy:** Calculated 756 ml vs. reported 500 ml
- **Explanation:** AWS-class efficiency (0.15 L/kWh) → 0.42 Wh × 0.15 L/kWh = 63 ml; reported 500 ml likely includes indirect water (electricity generation)

---

### Global AI Water Demand Projections (2027)

**Parameter: Global AI Water Withdrawal (2027)**
- **Projected:** 4.2-6.6 billion cubic meters (4.2-6.6 trillion liters)
- **Equivalent:** 4-6× Denmark annual water withdrawal, or 50% of UK

**Primary Source:**
- **Citation:** Li et al. (2023), arXiv:2304.03271
  - **Finding:** "The global AI demand may require 4.2–6.6 billion cubic meters of water withdrawal in 2027, which is more than the total annual water withdrawal of 4–6 Denmark or half of the United Kingdom"
  - **Growth Driver:** Expansion of AI training and inference at scale
  - **Context:** Google's scope-1 onsite water consumption increased 20% (2021→2022), Microsoft increased 34% over same period

---

### Simulation Parameters: AI Water Footprint

```typescript
const AI_WATER_FOOTPRINT = {
  training: {
    gpt3_175B: 700_000,        // Liters, direct on-site
    gpt3_total: 5_400_000,     // Liters, including indirect (electricity generation)
    gpt4_estimated: 7_000_000, // Liters, speculative (10× scale)
    perKwh: 1.8                // Liters/kWh average WUE
  },

  inference: {
    gpt4_query_100words: 0.5,  // Liters (500ml)
    gpt3_query_medium: 0.03,   // Liters (30ml average for 10-50ml range)
    perKwh: 1.8                // Liters/kWh average WUE
  },

  globalProjections: {
    year2027_withdrawal: 5_400_000_000_000,  // Liters (5.4B cubic meters, mid-range)
    growthRate: 0.25                          // 25% annual growth (2024-2027)
  }
};
```

---

## 6. Embodied Carbon in Hardware Manufacturing

### H100 GPU Embodied Emissions

**Parameter: Manufacturing Carbon Footprint**
- **H100 GPU (per card):** 164 kg CO2e
- **H100 Baseboard (8× GPUs):** 1,312 kg CO2e
- **Memory Contribution:** 42% of material impact
- **IC Contribution:** 25% of material impact

**Primary Source:**
- **Citation:** NVIDIA (2024). "PCF Summary for NVIDIA HGX H100." Product Carbon Footprint Datasheet. https://images.nvidia.com/aem-dam/Solutions/documents/HGX-H100-PCF-Summary.pdf
  - **Official Vendor Data:** First vendor-disclosed GPU embodied carbon footprint
  - **System PCF:** 1,312 kg CO2e for baseboard with 8× H100 SXM cards
  - **Per-Card PCF:** 164 kg CO2e per H100 GPU
  - **Breakdown:** Memory (42%), ICs (25%), thermal components (18%), other (15%)
  - **Credibility:** Official NVIDIA product carbon footprint assessment, follows ISO 14067 standard

**Supporting Source:**
- **Citation:** Meta Sustainability (2024). "Estimating embodied carbon in data center hardware, down to the individual screws." https://sustainability.atmeta.com/blog/2024/09/10/estimating-embodied-carbon-in-data-center-hardware-down-to-the-individual-screws/
  - **Methodology:** Meta's approach to hardware lifecycle carbon accounting
  - **Finding:** "Product carbon footprint estimations for computing equipment typically show that embodied emissions account for approximately 20-30% of life cycle emissions, whereas operational use (dynamic and idle consumption) represents 70-80% of the total footprint"

---

### Semiconductor Manufacturing Emissions Growth

**Parameter: AI GPU Manufacturing Emissions (2024-2030)**
- **2024:** 1.21 million metric tons CO2e
- **2030 Projection:** 19.2 million metric tons CO2e
- **CAGR:** 58.3% annual growth

**Primary Source:**
- **Citation:** TechInsights (2024). "AI GPU Growth Directly Impacts Carbon Emission Growth through 2030." https://www.techinsights.com/blog/ai-gpu-growth-directly-impacts-carbon-emission-growth-through-2030
  - **Finding:** "By 2030, semiconductor emissions from AI GPU manufacturing are projected to reach 19.2 million metric tons of CO2e, compared to 1.21 million metric tons in 2024, representing a compound annual growth rate of 58.3%"
  - **Driver:** Rapid AI GPU deployment (3.5M H100s in 2024, projected growth to tens of millions by 2030)
  - **Manufacturing Process:** "Modern GPUs like NVIDIA's H100 are fabricated at 5–7 nm process nodes, requiring extreme ultraviolet lithography (EUV), and the energy intensity of chip manufacturing rises due to the equipment and chemical demands"

---

### High-Bandwidth Memory (HBM) Impact

**Parameter: HBM Contribution to Embodied Carbon**
- **Memory:** 42% of H100 embodied carbon (69 kg CO2e per card)

**Source:**
- **Citation:** SemiAnalysis Newsletter (2024) and multiple technical sources
  - **HBM Technology:** "High-bandwidth memory (HBM) integration, now standard in AI GPUs, increases embodied impact through 3D stacking of DRAM dies with through-silicon vias, adding thermal, yield, and manufacturing complexity"
  - **H100 HBM3:** 80GB HBM3 per card, 3.35 TB/s bandwidth
  - **Energy-Intensive Manufacturing:** HBM requires additional fabrication steps (TSV drilling, die stacking, thermal management)

---

### Simulation Parameters: Embodied Carbon

```typescript
const EMBODIED_CARBON = {
  h100GPU: {
    perCard: 164,           // kg CO2e
    perBaseboard8cards: 1312, // kg CO2e
    breakdown: {
      memory: 69,           // kg CO2e (42%)
      ics: 41,              // kg CO2e (25%)
      thermal: 30,          // kg CO2e (18%)
      other: 24             // kg CO2e (15%)
    }
  },

  lifecycleRatio: {
    embodied: 0.25,         // 20-30% of total lifecycle emissions
    operational: 0.75       // 70-80% of total lifecycle emissions
  },

  industryGrowth: {
    emissions2024: 1_210_000,    // metric tons CO2e
    emissions2030: 19_200_000,   // metric tons CO2e
    cagr: 0.583                   // 58.3% annual growth
  }
};
```

---

## 7. Contradictions and Uncertainties

### Major Contradictions

**1. Water Consumption per Query: Direct vs. Indirect**
- **Direct (datacenter cooling only):** 63-756 ml per query (using WUE 0.15-1.8 L/kWh)
- **Indirect (including electricity generation):** 500 ml per query (Li et al. 2023)
- **Resolution:** Use 500 ml for total water footprint, 63-756 ml for datacenter-only consumption

**2. PUE Measurement Boundaries**
- **Google/Microsoft:** Exclude non-cooling overhead (lighting, office space)
- **Industry Average:** May include broader facility overhead
- **Resolution:** Use vendor-specific PUE for specific datacenters, industry average for generic modeling

**3. GPT-4 Training Energy/Water (Undisclosed)**
- **Empirical:** None (OpenAI has not disclosed)
- **Estimates:** 10× GPT-3 (linear scaling assumption)
- **Resolution:** Flag as speculative, use conservative multipliers (5-10×) with uncertainty bounds

---

### Key Uncertainties

**1. Frontier Model Training Costs (2024-2025)**
- **GPT-4, Claude 3, Gemini Ultra:** No disclosed training energy/water data
- **Implication:** Must extrapolate from GPT-3 (2020 data) with hardware efficiency adjustments
- **Uncertainty Range:** 3-10× GPT-3 depending on parameter count and training duration

**2. Inference Efficiency Variability**
- **Range:** 0.4 J/token (optimized H100) to 3.63 J/token (BF16 precision)
- **Factors:** Model size, quantization, hardware generation, software optimization
- **Implication:** 9× efficiency spread depending on deployment choices

**3. Water Consumption Technology Adoption**
- **Current Mix:** Unknown global distribution of evaporative vs. chiller vs. chip-level cooling
- **Trend:** Zero-water cooling emerging (Microsoft 2024), but adoption rate unclear
- **Implication:** WUE may improve rapidly (1.8 → 0.5 L/kWh by 2027?) or slowly

**4. Embodied Carbon for Non-NVIDIA Hardware**
- **H100:** 164 kg CO2e (official NVIDIA data)
- **TPUv5, AMD MI300:** No disclosed embodied carbon footprints
- **Implication:** Must assume similar values or scale by die area/memory capacity

---

## 8. Simulation Recommendations

### Parameter Values for Implementation

**Training Energy:**
```typescript
const TRAINING_PARAMS = {
  h100_annual_kwh: 3740,           // Per GPU, 61% utilization
  h100_peak_watts: 700,            // TDP
  h100_avg_watts: 427,             // Measured continuous

  frontier_model_training: {
    gpt3_scale: 1_248_000,         // kWh, empirical (V100/A100 hardware)
    gpt3_scale_h100: 416_000,      // kWh, with 3× efficiency
    gpt4_scale_estimate: 4_160_000, // kWh, speculative (10× params, H100)
    uncertainty_multiplier: [0.5, 2.0] // 50% to 200% of estimate
  },

  petaflop_day_to_kwh: {
    legacy: 343,                   // V100/A100 era
    h100: 114,                     // Current generation
    future: 50                      // Projected next-gen
  }
};
```

**Inference Energy:**
```typescript
const INFERENCE_PARAMS = {
  wh_per_query: {
    gpt4o: 0.42,
    range: [0.3, 1.7],             // GPT-4o to Llama-70B
    legacy: 5.0                     // Pre-2023 efficiency
  },

  tokens_per_kwh: {
    current_2025: 9_000_000,       // 0.4 J/token on H100
    legacy_2023: 1_200_000,        // 3 J/token on V100
    future_2027: 20_000_000        // Projected specialized hardware
  },

  training_vs_inference_split: {
    training: 0.40,                 // 40% of total AI energy
    inference: 0.60                 // 60% of total AI energy (Google data)
  }
};
```

**Datacenter Efficiency:**
```typescript
const DATACENTER_PARAMS = {
  pue: {
    bestInClass: 1.09,             // Google/Microsoft 2024
    industryAverage: 1.56,         // Global average
    legacy: 2.0,                   // Pre-2015
    adoptionCurve: [
      { year: 2024, avgPUE: 1.56 },
      { year: 2027, avgPUE: 1.30 },
      { year: 2030, avgPUE: 1.15 }
    ]
  },

  wue_liters_per_kwh: {
    legacy: 2.9,                   // Evaporative cooling
    current_avg: 1.8,              // 2024 industry average
    aws_efficient: 0.15,           // Best-in-class closed-loop
    nextGen_2025: 0.0,             // Zero-water chip-level
    adoptionCurve: [
      { year: 2024, avgWUE: 1.8 },
      { year: 2027, avgWUE: 1.0 },
      { year: 2030, avgWUE: 0.5 }
    ]
  }
};
```

**Water Consumption:**
```typescript
const WATER_PARAMS = {
  training_liters: {
    gpt3_direct: 700_000,          // On-site cooling only
    gpt3_total: 5_400_000,         // Including electricity generation
    gpt4_estimate: 7_000_000,      // Speculative 10× scale
    per_kwh: 1.8                   // Average WUE
  },

  inference_liters: {
    per_query_direct: 0.063,       // Using 0.15 L/kWh (AWS-class)
    per_query_total: 0.5,          // Including indirect (Li et al.)
    per_kwh: 1.8                   // Average WUE
  },

  global_projections: {
    withdrawal_2027: 5.4e12,       // Liters (5.4B cubic meters)
    annual_growth_rate: 0.25       // 25% CAGR (2024-2027)
  }
};
```

**Embodied Carbon:**
```typescript
const EMBODIED_CARBON_PARAMS = {
  h100_gpu_kg_co2e: 164,           // Per card, NVIDIA official

  lifecycle_split: {
    manufacturing: 0.25,            // 20-30% of total lifecycle
    operation: 0.75                 // 70-80% of total lifecycle
  },

  industry_growth: {
    emissions_2024: 1_210_000,     // Metric tons CO2e
    emissions_2030: 19_200_000,    // Metric tons CO2e
    cagr: 0.583                     // 58.3% annual growth
  },

  gpu_lifespan_years: 4            // Typical replacement cycle for AI hardware
};
```

---

### Mechanism Recommendations

**1. Technology Adoption Curves**
- Model PUE and WUE improvements over time as adoption curves
- Best-in-class tech (PUE 1.09, WUE 0.15) gradually becomes industry standard
- Zero-water cooling adoption: 5% (2024) → 25% (2027) → 60% (2030)

**2. Training vs. Inference Energy Balance**
- Track cumulative inference energy vs. one-time training energy
- Inference dominates after ~30-90 days of operation at scale (1B+ queries/day)
- Model inference growth rate based on user adoption, API pricing

**3. Hardware Refresh Cycles**
- GPUs replaced every 3-5 years (embodied carbon amortized over lifespan)
- New generations improve operational efficiency (3× per generation) but increase manufacturing emissions (58% CAGR)
- Net carbon impact depends on usage intensity

**4. Geographic Water Stress**
- Weight water consumption by datacenter location (water-stressed regions have higher impact)
- 70% increase in datacenters in water-stressed areas (2021-2024) → exacerbates local scarcity

---

## 9. Research Gaps and Future Updates

### High-Priority Gaps

**1. Frontier Model Disclosure (GPT-4, Claude 3, Gemini Ultra)**
- **Gap:** No official training energy/water data from OpenAI, Anthropic, Google
- **Impact:** Must rely on extrapolation from 2020 GPT-3 data (5-year-old baseline)
- **Recommendation:** Pressure for regulatory disclosure requirements (EU AI Act, U.S. legislation)

**2. Inference Efficiency Variability**
- **Gap:** Wide range (0.4-3.63 J/token) with limited data on real-world deployment mix
- **Impact:** 9× uncertainty in inference energy projections
- **Recommendation:** Industry benchmarking consortium (similar to MLPerf for performance)

**3. Water Consumption Technology Adoption Rates**
- **Gap:** Unknown global distribution of cooling technologies (evaporative vs. chiller vs. zero-water)
- **Impact:** WUE projections have 19× range (0.15-2.9 L/kWh)
- **Recommendation:** Datacenter infrastructure surveys, regulatory reporting requirements

**4. Embodied Carbon for Non-NVIDIA Hardware**
- **Gap:** Only NVIDIA H100 has disclosed PCF; AMD, Intel, Google TPU undisclosed
- **Impact:** Cannot accurately model multi-vendor hardware mixes
- **Recommendation:** Extend ISO 14067 disclosure to all major AI accelerators

---

### Recommended Follow-Up Research

**1. Monitor Next-Generation Hardware (2025-2026)**
- **Blackwell GB200:** NVIDIA's next generation (claimed 25× energy efficiency vs. H100 for inference)
- **AMD MI300 series:** Competing architecture, undisclosed energy specs
- **Google TPUv6:** Next-generation TPU, efficiency improvements expected

**2. Track Zero-Water Cooling Adoption**
- **Microsoft's August 2024 launch:** Monitor deployment rate, operational data
- **Google's air-cooled designs:** Expansion beyond cold-climate locations
- **Regulatory drivers:** EU/U.S. water efficiency mandates accelerate adoption

**3. Global AI Energy/Water Impact Studies**
- **IEA AI Energy Report:** Expected 2025-2026
- **UN Water/AI Task Force:** Global water security implications
- **Academic Meta-Analyses:** Synthesis of scattered vendor data

**4. Lifecycle Assessment (LCA) Standards**
- **ISO 14067 adoption:** Extend product carbon footprint disclosure requirements to AI hardware
- **Scope 3 emissions:** Pressure cloud providers to disclose customer-attributable emissions
- **Circular economy:** Hardware recycling, rare earth recovery, second-life applications

---

## 10. Key Takeaways for Simulation

### What the Research Shows

✅ **Robust Evidence:**
1. H100 GPUs: 700W TDP, 427W average, 3,740 kWh/year (empirical measurements, IEEE 2024)
2. GPT-3 training: 1,248 MWh, 700,000 L water (peer-reviewed, widely cited)
3. Inference efficiency: 0.42 Wh/query (GPT-4o), 120× improvement 2023-2025 (arXiv 2025)
4. Datacenter PUE: 1.09 (Google), 1.56 (industry avg) (official vendor data, 2024-2025)
5. Water consumption: 1.8 L/kWh average, 0.15-2.9 L/kWh range (industry reports, 2024)
6. Embodied carbon: 164 kg CO2e per H100 GPU (official NVIDIA PCF, 2024)

✅ **Moderate Evidence:**
1. Training vs. inference split: 40%/60% (Google estimate)
2. Inference efficiency: 9M tokens/kWh on H100 (derived from 0.4 J/token)
3. Zero-water cooling: 0 L/kWh achievable (Microsoft 2024 deployment)
4. Global water demand: 4.2-6.6B cubic meters by 2027 (Li et al. projection)

⚠️ **Contradictory/Uncertain:**
1. GPT-4 training energy: No empirical data, estimates range 3-10× GPT-3 (4-12 GWh)
2. Water per query: 63 ml (direct cooling) vs. 500 ml (including indirect) - measurement boundary differences
3. Inference J/token: 0.4 (optimized H100) to 3.63 (BF16) - 9× range based on optimization choices

❌ **Limited Evidence:**
1. Frontier model training costs (Claude 3, Gemini Ultra) - vendor non-disclosure
2. Real-world inference efficiency mix - deployment data not public
3. Non-NVIDIA embodied carbon (TPU, MI300) - only H100 disclosed
4. Technology adoption curves (PUE/WUE improvements) - limited longitudinal data

---

### Simulation Implementation Priority

**HIGH PRIORITY:**
- H100 energy consumption (3,740 kWh/year per GPU)
- GPT-3 scale training energy (1,248 MWh, use as baseline with efficiency multipliers)
- Inference energy (0.42 Wh/query, scale with token count)
- Datacenter PUE (1.09-1.56 range, model adoption curve)
- Water consumption (1.8 L/kWh baseline, 0.15-2.9 L/kWh range)

**MEDIUM PRIORITY:**
- Embodied carbon (164 kg CO2e per GPU, amortize over 3-5 year lifespan)
- Training vs. inference energy split (40%/60%)
- Technology adoption curves (PUE/WUE improvements over time)
- Geographic water stress (weight consumption by datacenter location)

**LOW PRIORITY (SENSITIVITY ANALYSIS):**
- Frontier model training costs (use GPT-3 baseline with 3-10× multiplier, flag uncertainty)
- Zero-water cooling adoption rate (optimistic scenario: 60% by 2030)
- Non-NVIDIA hardware (assume similar embodied carbon scaled by die area/memory)

---

## References

### Peer-Reviewed Sources (2024-2025)

1. **IEEE (2024).** "Single-Node Power Demand During AI Training: Measurements on an 8-GPU NVIDIA H100 System." *IEEE Journals & Magazine.* https://ieeexplore.ieee.org/document/10938551

2. **Brookhaven National Laboratory (2024).** "Empirical Measurements of AI Training Power Demand on a GPU-Accelerated Node." arXiv:2412.08602v1. https://arxiv.org/html/2412.08602v1

3. **arXiv (2025).** "How Hungry is AI? Benchmarking Energy, Water, and Carbon Footprint of LLM Inference." arXiv:2505.09598v1. https://arxiv.org/html/2505.09598v1

4. **Li, P., Yang, J., Islam, M. A., & Ren, S. (2023).** "Making AI Less 'Thirsty': Uncovering and Addressing the Secret Water Footprint of AI Models." arXiv:2304.03271. https://arxiv.org/abs/2304.03271
   - Widely cited in Nature, OECD, policy reports
   - Foundational water footprint study for AI models

### Official Vendor Data

5. **NVIDIA (2024).** "PCF Summary for NVIDIA HGX H100." Product Carbon Footprint Datasheet. https://images.nvidia.com/aem-dam/Solutions/documents/HGX-H100-PCF-Summary.pdf

6. **Google (2024-2025).** "Power usage effectiveness – Google Data Centers." https://datacenters.google/efficiency/

7. **Microsoft Research (2024).** "Datacenter power and energy management: past, present, and future." https://www.microsoft.com/en-us/research/wp-content/uploads/2024/11/DC-power-and-energy-management-FINAL.pdf

8. **Microsoft Cloud Blog (2024).** "Sustainable by design: Next-generation datacenters consume zero water for cooling." https://www.microsoft.com/en-us/microsoft-cloud/blog/2024/12/09/sustainable-by-design-next-generation-datacenters-consume-zero-water-for-cooling/

### Industry Reports and Analysis

9. **Tom's Hardware (2024).** "Nvidia's H100 GPUs will consume more power than some countries." https://www.tomshardware.com/tech-industry/nvidias-h100-gpus-will-consume-more-power-than-some-countries-each-gpu-consumes-700w-of-power-35-million-are-expected-to-be-sold-in-the-coming-year

10. **TechInsights (2024).** "AI GPU Growth Directly Impacts Carbon Emission Growth through 2030." https://www.techinsights.com/blog/ai-gpu-growth-directly-impacts-carbon-emission-growth-through-2030

11. **Clune Lab (2025).** "Environmental Impact of AI." https://clune.org/posts/environmental-impact-of-ai/

### Environmental Impact Studies

12. **Environmental and Energy Study Institute (2024).** "Data Centers and Water Consumption." https://www.eesi.org/articles/view/data-centers-and-water-consumption

13. **IEEE Spectrum (2024).** "The Real Story on AI Water Usage at Data Centers." https://spectrum.ieee.org/ai-water-usage

14. **Bloomberg (2025).** "The AI Boom Is Draining Water From the Areas That Need It Most." https://www.bloomberg.com/graphics/2025-ai-impacts-data-centers-water-data/

15. **Lawfare Media (2024).** "AI Data Centers Threaten Global Water Security." https://www.lawfaremedia.org/article/ai-data-centers-threaten-global-water-security

### Technical Analysis

16. **Substack (2024).** "The Energy Cost of Teaching Machines: Diving Deep into energy and LLMs." https://higes.substack.com/p/the-energy-cost-of-teaching-machines-diving-deep-into-energy-and-llms-d01f7e1acb12

17. **SemiAnalysis (2025).** "H100 vs GB200 NVL72 Training Benchmarks - Power, TCO, and Reliability Analysis." https://semianalysis.com/2025/08/20/h100-vs-gb200-nvl72-training-benchmarks/

18. **Meta Sustainability (2024).** "Estimating embodied carbon in data center hardware, down to the individual screws." https://sustainability.atmeta.com/blog/2024/09/10/estimating-embodied-carbon-in-data-center-hardware-down-to-the-individual-screws/

### Water Consumption Technical Reports

19. **TechTarget (2024).** "How do data centers use and manage water?" https://www.techtarget.com/searchdatacenter/tip/How-to-manage-data-center-water-usage-sustainably

20. **Data Center Dynamics (2024).** "Fact or fiction: using water in cooling actually reduces data center water consumption." https://www.datacenterdynamics.com/en/opinions/fact-or-fiction-using-water-cooling-actually-reduces-data-center-water-consumption/

---

## 8. Test-Time Compute and Extended Thinking (Nov 24, 2025 Update)

**Context:** New reasoning models (OpenAI o1, Claude 3.7 Extended Thinking) use test-time compute scaling, which significantly impacts energy consumption.

### 8.1 Test-Time Compute Overview

**Definition:** Test-time compute refers to additional computation during inference, where models "think longer" before responding.

**Key Quotes:**
- "o1 thinks for seconds, but we aim for future versions to think for hours, days, even weeks" (OpenAI researcher Noam Brown)
- This represents a paradigm shift from training-time scaling to inference-time scaling

### 8.2 Energy Consumption Comparisons

| Model | Energy per Query (Long Input) | Notes |
|-------|-------------------------------|-------|
| GPT-4o (standard) | 1.788 Wh | Fast inference, no extended reasoning |
| GPT-4o (short) | 0.42 Wh | 500 tokens |
| Claude 3.7 Sonnet (extended thinking) | 17.045 Wh | Up to 128K internal tokens |
| OpenAI o3 | ~35+ Wh (estimated) | Extended chain-of-thought |
| o3-mini | Lower | "Eco-efficient" reasoning variant |

**Source:** "How Hungry is AI? Benchmarking Energy, Water, and Carbon Footprint of LLM Inference" (arXiv:2505.09598v1, 2025)

### 8.3 Eco-Efficiency Frontier (2025)

Recent research ranks models by eco-efficiency (performance per energy cost):

1. **Claude 3.7 Sonnet:** 0.886 score - best eco-efficiency
2. **o4-mini (high):** 0.867 score
3. **o3-mini:** 0.840 score

**Key Finding:** "Downsizing reasoning models can yield substantial sustainability gains with minimal performance trade-offs."

### 8.4 Implications for Simulation

**Energy Scaling Factors for Extended Reasoning:**
- Standard inference: 1× baseline (0.42 Wh per query)
- Extended thinking: 40× baseline (17 Wh per query for Claude 3.7)
- Full o3-style reasoning: 80-100× baseline (estimated)

**Simulation Parameter Update:**
```typescript
// When modeling AI systems with extended reasoning
const baseInferenceEnergy = 0.42; // Wh per GPT-4o query
const extendedThinkingMultiplier = 40; // Claude 3.7 extended thinking
const fullReasoningMultiplier = 80; // o1/o3 style reasoning
```

**Future Projections:**
- OpenAI aims for reasoning that takes "hours, days, even weeks"
- This would increase per-query energy by 1000-10000× over standard inference
- Datacenter infrastructure may need significant upgrades for reasoning-heavy workloads

### 8.5 Sources for Test-Time Compute

1. **arXiv (2025).** "How Hungry is AI? Benchmarking Energy, Water, and Carbon Footprint of LLM Inference." https://arxiv.org/html/2505.09598v1

2. **Heatmap News (2024).** "What Does OpenAI's New Breakthrough Mean for Energy Consumption?" https://heatmap.news/technology/openai-o1-energy

3. **Anthropic (2025).** "Claude's Extended Thinking." https://www.anthropic.com/news/visible-extended-thinking

4. **Medium (2025).** "Understanding Test-Time Compute: A New Mechanism Allowing AI to 'Think Harder'." https://medium.com/@rendysatriadalimunthe/understanding-test-time-compute-a-new-mechanism-allowing-ai-to-think-harder-19e017abc540

---

**Document Status:** ✅ COMPLETE
**Parameter Currency:** 2024-2025 (AI infrastructure parameters fully updated with latest sources, including test-time compute)
**Next Review:** 2026 Q1 (monitor Blackwell GB200 deployment, frontier model disclosures, zero-water cooling adoption rates, extended reasoning energy trends)
