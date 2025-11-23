# Research Verification: AI Infrastructure Resources 2025 Update

**Commit:** dbf14387ccfcf93484879cc941d189cd2f81d538
**Date:** November 23, 2025
**Source File:** `research/ai-infrastructure-resources_20251019.md`
**Status:** PENDING VERIFICATION

---

## Summary

This commit adds 2025 peer-reviewed sources to the AI infrastructure research document. These citations may be used to update simulation parameters for:
- Water consumption (inference and training)
- Energy consumption multipliers
- Geographic modifiers
- 2030 projections

---

## Citations Requiring Verification

### Citation 1: Cornell/Nature Sustainability (2025)

**Location:** `research/ai-infrastructure-resources_20251019.md:283-302`

**Citation Details:**
- Authors: Tianqi Xiao, Fengqi You (Cornell PEESE lab)
- Title: "AI Data Center Environmental Impact Projections"
- Journal: Nature Sustainability
- DOI: 10.1038/s41893-025-01681-y
- URL: https://phys.org/news/2025-11-ai-centers-strain-energy-resources.html

**Claims Made:**
1. Carbon emissions (2030): 24-44 million metric tons CO2 annually
2. Water consumption (2030): 731-1,125 million cubic meters per year
3. Mitigation potential: 73% carbon reduction, 86% water reduction achievable
4. Geographic optimization: Midwest "windbelt" states optimal
5. New York has low-carbon advantage through nuclear/hydropower
6. Arizona currently uses 7.4% of state power for data centers

**Verification Needed:**
- [ ] Paper existence confirmed at DOI
- [ ] Author names and affiliation correct
- [ ] Claims 1-6 supported by specific passages in paper
- [ ] Values are direct quotes, not extrapolations

---

### Citation 2: MIT/Lawrence Berkeley Lab (2025)

**Location:** `research/ai-infrastructure-resources_20251019.md:304-324`

**Citation Details:**
- Authors: Elsa A. Olivetti et al.
- Title: "The Climate and Sustainability Implications of Generative AI"
- Source: MIT News + Berkeley Lab
- URL: https://news.mit.edu/2025/explained-generative-ai-environmental-impact-0117

**Claims Made:**
1. AI training clusters consume 7-8x more energy than typical workloads
2. North America power requirements: 2,688 MW (2022) → 5,341 MW (2023)
3. Global consumption: 460 TWh (2022) → projected 1,050 TWh (2026)
4. U.S. data center share: 183 TWh (2024) = 4% of national electricity
5. 2028 projection: data centers could consume 12% of U.S. electricity
6. GPT-3 training: 1,287 MWh consumed, 552 tons CO2 generated
7. ChatGPT query uses ~5x more electricity than simple web search

**Verification Needed:**
- [ ] Primary paper exists (not just MIT News article)
- [ ] Berkeley Lab report citation confirmed
- [ ] Claims 1-7 supported by specific passages
- [ ] "7-8x" multiplier is direct quote, not inference

---

### Citation 3: IEA (2025)

**Location:** `research/ai-infrastructure-resources_20251019.md:326-341`

**Citation Details:**
- Source: International Energy Agency (2025)
- Secondary Source: Pew Research
- URL: https://www.pewresearch.org/short-reads/2025/10/24/what-we-know-about-energy-use-at-us-data-centers-amid-the-ai-boom/

**Claims Made:**
1. Current (2024): ~560 billion liters annually for data centers globally
2. Projected (2030): ~1,200 billion liters annually
3. 2023 direct consumption: 17 billion gallons
4. Hyperscale + colocation: 84% of total
5. 2028 projection: 16-33 billion gallons for hyperscale alone

**Verification Needed:**
- [ ] IEA primary source located (Pew is secondary)
- [ ] Berkeley Lab 2024 Report citation confirmed
- [ ] Claims 1-5 are from primary sources, not Pew interpretation
- [ ] Conversion between liters and gallons verified

---

## Simulation Parameters Proposed

The research file proposes these parameters based on new citations:

```typescript
// Training water (one-time per major capability increase)
trainingWaterL = 700_000 + (capabilityIncrease * 1_000_000);  // 700K-10M L

// Inference water (monthly ongoing)
inferenceWaterL = baseInfrastructure + (scalingFactor * Math.log2(capability + 1));
// ~2-5M L/month for moderate-scale AI deployment

// AI training cluster multiplier
aiTrainingMultiplier = 7.5;  // MIT: 7-8x typical workload

// Geographic modifiers
desertRegionMultiplier = 2.5;  // water consumption
nordicRegionMultiplier = 0.3;  // water consumption
windbeltCarbonMultiplier = 0.7;  // carbon emissions
```

**Verification Needed:**
- [ ] Parameters derived correctly from cited sources
- [ ] Scaling relationships justified (log2, linear, etc.)
- [ ] Geographic multipliers supported by paper data

---

## Priority

**MEDIUM** - These parameters are not yet in simulation code. This is a research document update that prepares for future implementation. Verification should happen before any code changes reference these values.

---

## Cross-References

- Current wiki documentation: `docs/wiki/README_temp.md:5857` (cites Li et al. 2023 for water: 1-9 L/kWh scope-1)
- Existing parameters may need updating after verification
- Related roadmap item: Water consumption model recalibration

---

## Verification Protocol

For each citation:

1. **Layer 1 - Existence:**
   - Locate primary source (not news articles)
   - Confirm DOI/URL is valid
   - Verify author names and publication date

2. **Layer 2 - Claim Accuracy:**
   - Find specific passage supporting each claim
   - Quote relevant text
   - Flag any extrapolations beyond paper scope
   - Note any context that limits applicability

3. **Assessment:**
   - VERIFIED: Passage directly supports claim
   - PARTIALLY VERIFIED: Paper discusses topic but specific value not found
   - UNVERIFIED: Claim not supported by cited source
   - PHANTOM: Source does not exist
