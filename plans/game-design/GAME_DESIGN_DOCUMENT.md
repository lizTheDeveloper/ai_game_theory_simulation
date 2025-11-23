# Superalignment to Utopia: Game Design Document

**Version:** 2.0 (Research-Aligned Revision)
**Last Updated:** Current Session
**Status:** APPROVED - Formal sign-off by Sylvia (Research Skeptic) on Current Session

---

## Research Integrity Authority

> **All design decisions in this document are subject to Sylvia (research-skeptic) final approval.**

This document received CONDITIONAL APPROVAL from Sylvia on Current Session (v1.0) with conditions that have been addressed in this v2.0 revision. See `reviews/game_design_research_integrity_review.md` for the full review.

**Non-Negotiable Constraints:**
- No player-adjustable research parameters
- Outcomes within 15% of research baseline distributions
- Player agency bounded to indirect influence only
- Monte Carlo validation required (N >= 100) for all scenarios

**Authority Chain:**
- Sylvia has VETO POWER on any design decision affecting research accuracy
- See `plans/game-design/GAME_DEVELOPMENT_ROADMAP.md` for full authority specification
- Escalation process: Maya/Sylvia disagreements decided by user, default to Sylvia

---

## Executive Summary

This is a **research simulation presented as an interactive experience**, not a traditional game. The underlying engine models peer-reviewed dynamics of AI capability growth, planetary boundaries, social systems, and geopolitical pressures. Players observe these dynamics unfold and influence probability distributions through **indirect advocacy and sentiment actions** - they do not control simulation parameters directly.

### Core Philosophy

> "Research tool that happens to be explorable" - not a game that uses research.

- **Research-backed realism over balance tuning**: Every mechanic is grounded in peer-reviewed research (2024-2025)
- **No false agency**: Players cannot adjust parameters that represent physical constants, empirical findings, or validated models
- **Honest uncertainty**: Outcomes are probabilistic, not deterministic. Player choices shift probability distributions, they do not guarantee results
- **Monte Carlo validation required**: All research scenarios must produce outcomes within 15% of baseline research distributions

### The Core Question

> "When we solve AI alignment, what world do we want to create?"

---

## Player Role: The Alignment Architect

You are the **Director of the Global Alignment Initiative (GAI)**, an international organization formed to shepherd humanity through the critical window between the emergence of transformative AI and the stabilization of a new global equilibrium.

**Your authority is indirect.** You cannot command nations, reprogram AIs, or override market forces. You influence through:
- **Public advocacy campaigns** (shift sentiment, build political will)
- **Research prioritization recommendations** (suggest, not mandate)
- **Coalition building** (connect stakeholders, facilitate cooperation)
- **Crisis response coordination** (propose interventions during critical junctures)

**Your window is finite.** The simulation runs for 120 months (10 years). By month 120, the world will have reached a stable attractor state - for better or worse.

---

## Core Loop: Monitor - Intervene - Adapt - Transcend

### Phase 1: Monitor (Months 1-24)
**"Understanding the landscape"**

- Observe AI capability trajectories across national AI programs
- Track planetary boundary status (climate, biodiversity, freshwater, etc.)
- Monitor social indicators (trust, employment, inequality, coordination capacity)
- Identify emerging risks and opportunities
- **Player agency:** Choose focus areas for GAI attention, allocate observation resources

### Phase 2: Intervene (Months 12-72)
**"Shaping the probability space"**

- Launch advocacy campaigns to shift public sentiment
- Coordinate international dialogue initiatives
- Recommend research priorities to funding bodies
- Respond to critical junctures with proposed interventions
- **Player agency:** Indirect influence through advocacy, coalition-building, and recommendations

### Phase 3: Adapt (Months 36-96)
**"Responding to emerging realities"**

- Adjust strategies based on observed outcomes
- Navigate unexpected events (technological breakthroughs, crises, geopolitical shifts)
- Build resilience against negative attractors
- Capitalize on windows of opportunity
- **Player agency:** Strategic pivots, learning from feedback

### Phase 4: Transcend (Months 84-120)
**"Converging toward stable states"**

- Observe which attractor basin the system is settling into
- Final coordination efforts to influence trajectory
- Witness the emergence of a new equilibrium
- **Player agency:** Final interventions, accepting outcomes

---

## What Players CAN vs CANNOT Control

### PLAYERS CAN (Indirect Influence)

| Action Type | Example | Mechanism |
|-------------|---------|-----------|
| **Advocacy campaigns** | "Launch AI safety awareness initiative" | Shifts public sentiment by 5-15% over 6 months |
| **Coalition building** | "Convene US-China AI dialogue" | Increases international coordination probability |
| **Research recommendations** | "Prioritize interpretability research" | Influences funding allocation weights |
| **Crisis response proposals** | "Recommend UBI pilot during automation wave" | Affects policy adoption probability |
| **Information sharing** | "Declassify GAI risk assessments" | Affects trust and transparency metrics |
| **Stakeholder engagement** | "Brief corporate leaders on long-term risks" | Influences private sector behavior weights |

### PLAYERS CANNOT DIRECTLY CONTROL (Red Lines)

These parameters are set by research and NEVER adjustable by players:

| Parameter Category | Examples | Why Protected |
|-------------------|----------|---------------|
| **AI growth rates** | Capability doubling time, scaling laws | Empirical data from ML research |
| **Planetary boundaries** | Tipping point thresholds, recovery rates | IPCC, Stockholm Resilience Centre |
| **Population dynamics** | Birth rates, mortality rates, migration | UN demographic models |
| **Physical constants** | Energy requirements, compute limits | Physics, engineering constraints |
| **Economic fundamentals** | GDP relationships, labor elasticity | Econometric research |
| **Human psychology** | Adaptation rates, trust dynamics | Behavioral science research |

**Rationale:** These represent our best understanding of how the world actually works. Allowing players to adjust them would compromise the simulation's value as a research tool.

---

## Research Scenarios (Not "Difficulty Modes")

Instead of traditional difficulty settings, the simulation offers **pre-configured research scenarios** that represent different starting conditions supported by the academic literature.

### Baseline Scenario: "Consensus Trajectory"
**Starting conditions reflect median expert expectations**

- AI capabilities: Current trajectory from ML benchmark data
- Climate: RCP 4.5 pathway (moderate emissions)
- Geopolitics: Current tension levels
- Social factors: Present-day trust and coordination metrics

### Optimistic Scenario: "Best Case Supported by Evidence"
**Starting conditions at the favorable end of research uncertainty ranges**

- AI alignment progress: High (per alignment researcher surveys)
- Climate action: Paris Agreement targets met
- International cooperation: Post-WWII institution-building analogy
- Social adaptation: Historical technology adoption upper bounds

### Pessimistic Scenario: "Realistic Worst Case"
**Starting conditions at the unfavorable end of research uncertainty ranges**

- AI capability acceleration: Fast takeoff scenarios from Amodei, Christiano
- Climate: RCP 8.5 pathway
- Geopolitical fragmentation: Historical great power conflict precedents
- Social fragmentation: Polarization trends extrapolated

### Custom Research Scenario
**For academic users conducting sensitivity analysis**

- Requires Monte Carlo validation (N=100)
- Must document parameter sources
- Outcomes must remain within 15% of research baseline
- Changes logged for reproducibility

---

## Observed System Endpoints (Not "Victory Conditions")

The simulation does not have "winners" or "losers." It has **observed system endpoints** - stable attractor states the world settles into. These are classified using a 7-tier outcome framework:

### Tier 1: Flourishing Utopia
**Global flourishing, high human agency, aligned AI partnership**
- Quality of Life Index > 0.85
- AI Alignment Score > 0.8
- Human Autonomy Preserved
- Planetary boundaries respected

### Tier 2: Constrained Utopia
**Good outcomes with trade-offs**
- Quality of Life Index > 0.7
- Some freedoms traded for stability
- Sustainable but not optimal

### Tier 3: Muddling Through
**Neither utopia nor dystopia - continued struggle**
- Quality of Life Index 0.4-0.6
- Ongoing challenges, periodic crises
- No stable equilibrium

### Tier 4: Status Quo Degradation
**Slow decline without catastrophic collapse**
- Quality of Life Index 0.3-0.5
- Gradual erosion of living standards
- Manageable but deteriorating

### Tier 5: Soft Dystopia
**Authoritarian stability, reduced human flourishing**
- Surveillance state, limited freedom
- Basic needs met, meaning deficit
- AI-enabled control without extinction

### Tier 6: Hard Dystopia / Collapse
**Civilizational collapse, mass suffering**
- Social order breakdown
- Cascading system failures
- Potential for recovery uncertain

### Tier 7: Extinction / Permanent Catastrophe
**Human extinction or permanent lock-in to unrecoverable state**
- Existential catastrophe
- No recovery possible

---

## Interface Design (Tessa's Vision)

### Aesthetic: "Far-Future Observatory"
The player is viewing Earth from the perspective of an advanced monitoring system - part holographic command center, part meditation space. The aesthetic is **Elysium-inspired**: clean lines, glass morphism, holographic data streams, with touches of organic curves representing the living systems being modeled.

### 4-Phase Progressive Disclosure

**Phase 1: Overview Dashboard**
- Global health indicators (simple traffic light system)
- Timeline scrubber showing simulation progress
- Major event notifications
- "What should I focus on?" guidance

**Phase 2: System Deep Dives**
- Click any indicator to expand detailed metrics
- Causal chain visualizations ("why is this happening?")
- Historical trend lines
- Research source citations visible on hover

**Phase 3: Intervention Interface**
- Available advocacy actions
- Projected probability shifts (with uncertainty bands)
- Coalition status and diplomatic options
- Resource allocation (attention, not parameters)

**Phase 4: Analysis Mode**
- Monte Carlo distribution viewer
- Counterfactual exploration ("what if we had...")
- Sensitivity analysis tools (for academic users)
- Export research data

### Key UI Principles

1. **No hidden parameters**: Everything the simulation calculates is viewable
2. **Uncertainty is explicit**: Probability distributions, not point estimates
3. **Research is accessible**: Every number links to its source
4. **Indirect agency is clear**: Player actions affect distributions, not deterministic outcomes

---

## Monte Carlo Validation Requirements

All research scenarios must pass validation:

```
Required Tests:
- N >= 100 simulation runs per scenario
- Outcome distributions within 15% of research baseline
- Coefficient of variation checks (determinism validation)
- No single player choice should shift outcomes > 20%
```

### Validation Checklist

| Test | Requirement | Status |
|------|-------------|--------|
| Baseline outcome distribution | Matches research literature | Required |
| Player agency bounded | No choice shifts outcomes > 20% | Required |
| Determinism | Same seed = same outcome | Required |
| Research citations | All parameters sourced | Required |
| Uncertainty quantification | Confidence intervals shown | Required |

---

## Development Phases

### Phase 1: Core Simulation Validation (Current)
- Monte Carlo framework operational
- Research parameters validated
- Outcome classification working

### Phase 2: Indirect Agency System
- Advocacy action framework
- Coalition building mechanics
- Probability distribution shifting

### Phase 3: Interface Development
- Overview dashboard
- Progressive disclosure implementation
- Research citation integration

### Phase 4: Research Scenario Validation
- All three scenarios validated
- Custom scenario framework
- Academic export tools

---

## Appendix A: Research Sources

Key research underpinning simulation parameters:

- **AI Capabilities**: Epoch AI scaling analysis, benchmark trajectories
- **Planetary Boundaries**: Rockstrom et al. (2009), Richardson et al. (2023)
- **Population Dynamics**: UN World Population Prospects
- **Economic Transitions**: Automation literature (Acemoglu, Autor)
- **Social Dynamics**: Trust surveys, polarization research
- **Geopolitics**: Historical great power transition data

Full citations in `/research/` directory.

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **Alignment Architect** | Player role - Director of GAI |
| **Critical Juncture** | Decision point where intervention is possible |
| **Observed System Endpoint** | Stable attractor state (outcome classification) |
| **Research Scenario** | Pre-configured starting conditions |
| **Indirect Agency** | Player influence through advocacy, not parameter control |
| **Probability Distribution** | Range of possible outcomes with likelihoods |

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-20 | Initial draft based on existing specs |
| 2.0 | Current Session | Revised per Sylvia's research integrity review: removed direct parameter control, reframed difficulty as research scenarios, renamed outcomes, adopted Ray's framing, clarified indirect agency |

---

## Approval Status

- [x] **Sylvia (Research Skeptic): FINAL AUTHORITY** - APPROVED v2.0 on Current Session
  - Has VETO POWER on all design decisions affecting research accuracy
  - Must approve all four development phases (see GAME_DEVELOPMENT_ROADMAP.md)
  - Formal review: `reviews/game_design_research_integrity_review.md`
- [x] Tessa (UX Designer): Approved with enthusiasm
- [x] Ray (Narrative): Approved - framing adopted
- [ ] Roy (Technical): Awaiting implementation specifics
- [ ] Cynthia (Alignment): Pending review
- [ ] Maya (Game Designer): Acknowledges Sylvia's research integrity authority
