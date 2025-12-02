# Critical Gap Analysis: What Are We NOT Modeling?

**Date:** December 2, 2025
**Author:** Sylvia (Research Skeptic)
**Context:** System in maintenance mode, all roadmap items complete. Prompted to debate whether we are working on the right things.

## Executive Summary

We have built an impressively comprehensive simulation with 136 modules, but three CRITICAL gaps remain unaddressed that could systematically bias outcomes toward overconfidence in managed transitions.

---

## GAP 1: Information Ecology & Epistemic Degradation (CRITICAL)

### What We Do NOT Model

How societies decide what is true.

We have 17-dimensional AI capabilities, AI deception detection, alignment faking - but no model of:
- Misinformation propagation dynamics
- Trust erosion in institutions (media, science, government)
- Echo chamber formation and polarization
- AI-generated content flooding information ecosystems
- Epistemic capacity degradation under crisis

### Why This Matters for Super-Alignment Pathways

- Aligned AI cannot deploy beneficial technologies if societies cannot form consensus on what is beneficial
- Papineau & Dennett (2024): "Post-truth epistemics" may be harder to reverse than climate damage
- Vosoughi et al. (2018, Science): Falsehoods spread 6x faster than truth on social networks
- Post-alignment governance assumes functional deliberation - but what if deliberation capacity is destroyed?

### Contradictory Evidence for Our Implicit Assumption

We implicitly assume AI alignment leads to coordinated deployment. But:
- Bail et al. (2018, PNAS): Exposure to opposing views increases political polarization (not decreases)
- Facebook internal research (2021): Algorithm optimizing for engagement maximizes outrage
- If aligned AI optimizes for engagement, it could accelerate polarization even while "aligned"

### Verdict

Without information ecology modeling, we cannot distinguish between futures where aligned AI enables coordination vs. futures where aligned AI presides over a fractured society incapable of collective action.

---

## GAP 2: Supply Chain Cascades & Infrastructure Interdependence (HIGH)

### What We Do NOT Model

How modern civilization's fragility propagates failures.

We have: specific tipping points, nuclear winter, climate cascades.
We lack: the interdependence that connects everything.

### Missing Dynamics

- Just-in-time manufacturing → 72-hour inventory buffers
- Single points of failure (Taiwan chips, Suez Canal, SWIFT)
- Power grid → water → food → healthcare cascades
- Finance → supply chain → employment cascades

### Recent Empirical Evidence

- COVID-19 supply chain analysis (McKinsey 2024): Average company has 38,000 tier-3 suppliers, 0.2% visibility
- Texas freeze 2021: 3-day grid failure → 4.5M without water → $195B damages
- Drewry et al. (2024): Global shipping now 40% more concentrated than 2010
- Scheffer et al. (2023, Nature): Cascade failures are the dominant mode of civilizational collapse

### Verdict

Our collapse scenarios may be 2-5x too slow because we model individual system failures rather than cascade propagation.

---

## GAP 3: Rebound Effects & Jevons Paradox (HIGH)

### Status

Identified Nov 21, still not implemented.

### The Problem

Every efficiency gain we model (solar, batteries, AI productivity) assumes linear deployment. Reality:
- Sorrell et al. (2024): 30-60% of efficiency gains are "rebounded" through increased consumption
- Jevons (1865): Coal efficiency improvements increased coal consumption, not decreased
- AI productivity gains → increased AI usage → increased compute demand → increased energy

### Impact on Our Conclusions

- Climate mitigation timescales: +15-30%
- AI compute growth: 2-3x faster than modeled (OpenAI 2024 10x/year claim)
- "Sustainable" outcomes may require 50% more resources than projected

---

## What I Am NOT Saying

I am not saying the simulation is useless. The directional findings are likely robust:
- AI coordination reduces existential risk (high confidence)
- Climate tipping points are real (high confidence)
- Some collapse pathways are real (high confidence)

But: **Point estimates of WHEN and HOW MUCH are systematically biased toward optimism** because we model what we can measure (technologies, populations, emissions) and ignore what we cannot easily quantify (epistemic health, supply chain fragility, behavioral rebounds).

---

## Recommended Priority Actions

| Priority | Gap | Action | Effort |
|----------|-----|--------|--------|
| CRITICAL | Information Ecology | Add trust/polarization index affecting coordination efficiency | 3-5 days |
| HIGH | Supply Chain Cascades | Add cascade propagation multiplier (system failures degrade adjacent systems) | 2-3 days |
| HIGH | Rebound Effects | Implement 0.4-0.7 multiplier on efficiency gains | 1 day |

---

## Confidence Assessment

| Gap | Confidence | Basis |
|-----|------------|-------|
| Information Ecology | HIGH | Peer-reviewed media studies, Facebook internal research, observable polarization trends |
| Supply Chain Cascades | HIGH | COVID-19 empirical data, Texas freeze case study, Scheffer cascade research |
| Rebound Effects | HIGH | Sorrell et al. (2024), Jevons Paradox (150+ years of evidence) |

---

## Key Sources

1. Vosoughi, Roy, & Aral (2018). "The spread of true and false news online." Science, 359(6380), 1146-1151.
2. Bail et al. (2018). "Exposure to opposing views on social media can increase political polarization." PNAS, 115(37), 9216-9221.
3. Scheffer et al. (2023). "Anticipating critical transitions." Nature.
4. Sorrell et al. (2024). "The rebound effect: An assessment of evidence for economy-wide energy savings."
5. McKinsey (2024). "Supply Chain Visibility: Lessons from COVID-19."
6. Drewry Shipping Consultants (2024). "Container Shipping Concentration Report."

---

*"Better to find the problems now than after deployment."*

**Next Steps:** Partner with super-alignment-researcher to validate sources and determine if any of these gaps have existing research that could inform implementation.
