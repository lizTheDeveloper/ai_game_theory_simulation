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

---

## Narrative Arc: Crisis Opening

### Design Philosophy

> "The world is on fire, what do we do?"

The game opens **mid-crisis**, not in a peaceful tutorial state. Players should feel immediate urgency - this is not a peaceful city-builder where you gradually build up. You are stepping into a world already teetering on multiple edges.

### Opening State

**Month 1 is not Month 0.** The simulation starts with:
- **Climate Crisis Active**: 2-3 planetary boundaries already in "danger" zone
- **AI Race Tensions**: Major powers in competitive acceleration mode
- **Social Fractures Visible**: Trust metrics showing strain, inequality rising
- **Immediate Crises**: 1-2 active events requiring response (drought, automation displacement, AI incident)

### Emotional Arc

| Phase | Player Emotion | Design Goal |
|-------|---------------|-------------|
| Opening (M1-6) | "Oh god, everything is on fire" | Urgency, stakes |
| Early (M7-24) | "Can we actually fix this?" | Hope tempered by realism |
| Mid (M25-60) | "Some things are working..." | Investment, ownership |
| Late (M61-100) | "We might make it" | Tension, stakes rising again |
| Final (M101-120) | "What did we build?" | Reflection, meaning |

### Crisis as Motivation, Not Punishment

**Key distinction:** Crises are not punishment for player mistakes. They are the **reason the player exists**. The GAI was formed *because* the world needs coordination. Without crises, there's no story.

```
❌ "You failed, here's a disaster"
✅ "The world is struggling, you're here to help"
```

### Cold Open Design

**First 30 seconds:**
1. Black screen, audio: news clips of overlapping crises (climate, AI incidents, social unrest)
2. Fade in: Global holographic view, multiple red warning indicators
3. Text: "Month 1 of the Global Alignment Initiative"
4. AI Advisor appears: "Director, we have a situation. Several, actually."

---

## AI Advisor System

### Overview

The **AI Advisor** is an in-game AI assistant that serves as mentor, explainer, and guide. It represents the institutional knowledge of the GAI and can be consulted at any time.

### Core Principles

1. **Responsive, not preachy**: Advisor responds to player questions, doesn't lecture unsolicited
2. **Explains, doesn't decide**: Provides context and options, respects player agency
3. **Research-grounded**: Answers reference the simulation's research basis
4. **Emotionally intelligent**: Acknowledges player frustration, uncertainty, hard choices

### Interaction Model

| Trigger | Advisor Behavior |
|---------|-----------------|
| Player clicks "?" on any metric | Explains what it means, why it matters |
| Player hovers on crisis event | Contextualizes: causes, stakes, options |
| Player about to make major decision | Can offer analysis if requested |
| Player stuck for > 2 minutes | Gentle prompt: "Would you like to talk through options?" |
| Player explicitly asks | Full conversational response |

### What Advisor Can Do

- **Pause simulation** to explain concepts without time pressure
- **Suggest research priorities** based on current crises ("Given the water crisis, you might consider...")
- **Answer "why" questions**: "Why is trust declining?" → explains causal chains
- **Provide historical context**: "Similar situations in our models suggest..."
- **Offer strategic perspective**: "You have limited attention - what matters most right now?"

### What Advisor CANNOT Do

- Make decisions for the player
- Guarantee outcomes ("If you do X, you'll win")
- Judge player choices morally
- Lecture without being asked
- Override player autonomy

### Implementation Approaches

**Tier 1: Scripted Responses**
- Pre-written explanations for all major systems
- Decision trees for common questions
- Sufficient for core NUX and system explanations

**Tier 2: Dynamic LLM Integration** (stretch goal)
- Connect to actual LLM for freeform questions
- Grounded in simulation state and research documentation
- "Ask me anything about what's happening"
- Would require careful prompt engineering to maintain research integrity

### Personality

**Tone:** Competent, calm, slightly wry. Think: senior researcher who's seen a lot, but hasn't lost hope.

**Sample dialogue:**
- "The climate metrics are... not great. But you knew that. The question is what we prioritize."
- "Ah, the AI race dynamics. This is where it gets complicated. Want the short version or the full picture?"
- "You're asking why trust keeps falling? That's the right question. Let me show you the causal chain."
- "I notice you're cycling through options. No judgment - these are genuinely hard choices."

### Integration with Alignment Architect Role

The AI Advisor is canonically **the GAI's institutional AI system** - a well-aligned AI assistant that helps the human Director (player) navigate complexity. This is diegetic: you're playing a human working *with* an aligned AI, not playing as the AI.

This reinforces the game's themes:
- AI as partner, not replacement
- Human judgment still matters
- Alignment enables collaboration

---

## New User Experience (NUX) Flow

### Design Philosophy

> "Learn by doing in a crisis, not by reading tutorials."

The NUX should feel like being thrown into the deep end with a lifeguard. The player faces real stakes immediately, but has support.

### Cold Open Sequence

**0:00 - Crisis Montage**
- Audio collage: news clips, alarms, concerned voices
- Quick cuts: flooding, AI incident footage, protests, drought
- Establishes: the world is in crisis, this is urgent

**0:30 - Your Office**
- Holographic globe materializes
- Multiple warning indicators pulse
- Text: "Month 1 - Global Alignment Initiative Headquarters"

**0:45 - Advisor Introduction**
- Advisor appears (holographic presence, not robot)
- "Director, I'm your institutional AI. I'm here to help you navigate this."
- "We have several situations developing. Let me bring you up to speed."

**1:00 - First Dashboard View**
- Overview dashboard with 3-4 critical metrics
- One metric blinking urgently (the immediate crisis)
- Advisor: "This one needs attention first."

### First Decision Point

**Crisis:** Water crisis in South Asia affecting 200M people
- **Option A:** Emergency humanitarian response (addresses symptoms)
- **Option B:** Accelerate desalination research (addresses cause)
- **Option C:** Diplomatic intervention for upstream water rights

**Advisor offers context if asked:**
- "Each approach has tradeoffs. Would you like to hear them?"
- Explains: time scales, resource costs, probability of success
- Does NOT say which is "correct"

### Progressive Complexity Reveal

| Session | Systems Introduced | Advisor Role |
|---------|-------------------|--------------|
| First 5 min | Single crisis, basic metrics | Guides first decision |
| 5-15 min | Second crisis, resource tradeoffs | Explains competing priorities |
| 15-30 min | Multiple systems interacting | Shows causal connections |
| 30-60 min | Full dashboard unlocked | Available on request |
| 1+ hour | Advanced analysis tools | Steps back, supports exploration |

### "Aha Moment" Design

Key moments when players realize systems connect:

1. **"Oh, this affects that"**: Climate crisis → migration → social trust
2. **"I can't do everything"**: Limited attention forces prioritization
3. **"My choices shifted probabilities"**: See distribution changes from advocacy
4. **"The research is real"**: Click citation, see actual paper
5. **"There's no perfect answer"**: Tradeoffs are genuine, not artificial

### Failure Handling

**If player makes choices leading to negative outcomes:**
- Advisor does NOT blame: "These were hard choices in hard circumstances"
- Offers analysis: "Here's what the model suggests happened"
- Encourages replay: "Different approaches might reveal different dynamics"
- Maintains research framing: "This is what the research suggests would happen"

---

## Realistic Currency System

### Design Philosophy

> "Every constraint the player faces should reflect a REAL constraint that policymakers and researchers face."

NO arbitrary "action points," "energy," or gamified currencies. All limiting resources must be grounded in actual dynamics from governance, economics, and organizational research.

### Currency Framework

#### 1. Political Capital

**Research Basis:** Governance literature on political feasibility, policy windows, mandate theory

| Aspect | Implementation |
|--------|---------------|
| **Spent on** | Policy changes, institutional reforms, unpopular-but-necessary decisions |
| **Regenerates from** | Public trust, successful outcomes, institutional health |
| **Depleted by** | Unpopular decisions, scandals, failed initiatives, overreach |
| **Range** | 0-100, starts at ~40 (new organization, limited mandate) |

**Key dynamics:**
- Spending on popular causes costs less than unpopular ones
- Crisis response can build OR deplete (depends on outcome)
- Recovery is slow - trust takes time to build
- Can go negative (debt to stakeholders, forced inaction)

**Research sources needed:** (Sylvia review required)
- Kingdon's policy windows theory
- Mandate research in democratic governance
- Crisis leadership literature

#### 2. Research Funding

**Research Basis:** R&D economics, innovation policy, budget allocation theory

| Aspect | Implementation |
|--------|---------------|
| **Spent on** | Tech tree advancement, breakthrough acceleration |
| **Competes with** | Crisis response budgets, basic services |
| **Affected by** | Economic conditions, political priorities, perceived urgency |
| **Range** | Percentage of GDP allocated, ~1-5% realistic range |

**Key dynamics:**
- Funding follows attention (public issues get funded)
- Economic downturns reduce available research funding
- Breakthroughs can unlock more funding (success breeds investment)
- Long-term research competes with short-term crisis response

#### 3. Public Attention

**Research Basis:** Agenda-setting theory, media studies, limited attention research

| Aspect | Implementation |
|--------|---------------|
| **Represents** | Collective focus - what society is paying attention to |
| **Limited to** | 3-5 major issues at once (research-backed cognitive limit) |
| **Affects** | Which issues can gain political capital, funding |
| **Shifted by** | Crises (force attention), advocacy campaigns, media events |

**Key dynamics:**
- New crises can crowd out ongoing issues
- Sustained attention required for long-term solutions
- Attention span for issues decays without renewal
- Some issues (catastrophes) force attention regardless

**Research sources needed:**
- McCombs & Shaw agenda-setting theory
- Issue-attention cycle (Downs)
- Limited attention in policy-making

#### 4. Institutional Capacity

**Research Basis:** Organizational theory, change management, bureaucratic capacity

| Aspect | Implementation |
|--------|---------------|
| **Represents** | How much change can be implemented per turn |
| **Depleted by** | Rapid reform, crisis response, personnel turnover |
| **Regenerates from** | Stability, successful implementation, capacity building |
| **Affected by** | Social cohesion, institutional health, expertise availability |

**Key dynamics:**
- Implementing too much at once leads to failure
- Crisis mode depletes long-term capacity
- Investment in capacity pays off later
- Fragile institutions break under pressure

**Research sources needed:**
- Organizational change literature
- State capacity research (Besley & Persson)
- Implementation science

#### 5. International Cooperation Points

**Research Basis:** International relations theory, treaty compliance, global governance

| Aspect | Implementation |
|--------|---------------|
| **Built through** | Diplomacy, successful joint actions, trust-building |
| **Required for** | Global-scale interventions, coordinated policy, technology sharing |
| **Affected by** | Past agreements (honored/broken), power dynamics, shared threats |
| **Range** | Per-relationship and aggregate metrics |

**Key dynamics:**
- Built slowly through repeated positive interactions
- Destroyed quickly by defection or failure
- Shared crises can accelerate or destroy cooperation
- Different nations have different cooperation thresholds

**Research sources needed:**
- Keohane's cooperation theory
- Treaty compliance literature
- Global governance effectiveness research

### Currency Interaction Map

```
                    ┌─────────────────────────────┐
                    │      Public Attention       │
                    │   (What issues matter now)  │
                    └────────────┬────────────────┘
                                 │
            ┌────────────────────┼────────────────────┐
            │                    │                    │
            ▼                    ▼                    ▼
    ┌───────────────┐    ┌───────────────┐    ┌───────────────┐
    │   Political   │    │   Research    │    │ International │
    │    Capital    │◄──►│   Funding     │◄──►│  Cooperation  │
    │ (What can be  │    │ (What can be  │    │ (What can be  │
    │   decided)    │    │  developed)   │    │  coordinated) │
    └───────┬───────┘    └───────┬───────┘    └───────────────┘
            │                    │
            └────────┬───────────┘
                     │
                     ▼
           ┌─────────────────────┐
           │   Institutional     │
           │     Capacity        │
           │  (What can be       │
           │   implemented)      │
           └─────────────────────┘
```

### Anti-Gamification Principles

| Gamified Currency | Our Realistic Alternative |
|-------------------|--------------------------|
| "Action Points" (arbitrary limit) | Institutional Capacity (organizational reality) |
| "Energy" (recharges over time) | Political Capital (builds/depletes based on actions) |
| "Influence" (abstract resource) | Public Attention + International Cooperation |
| "Tech Points" (grind to earn) | Research Funding (economic allocation) |
| "Karma" (moral accounting) | NO equivalent - outcomes, not morality |

### Sylvia Review Required

**CRITICAL:** All currency parameters require research validation before implementation.

Required validation:
- [ ] Political capital regeneration rates - governance research
- [ ] Attention span limits - cognitive science
- [ ] Institutional capacity bounds - organizational research
- [ ] Cooperation building/decay rates - IR literature
- [ ] Economic allocation constraints - R&D economics

---

## Integration Notes

### AI Advisor + Alignment Architect Role

The AI Advisor is the GAI's institutional AI - a well-aligned AI helping a human Director. This is diegetic and thematic:
- Demonstrates AI-human collaboration
- Player experiences what "aligned AI partnership" feels like
- Contrasts with unaligned AI threats in simulation

### Currencies + Simulation Parameters

| Currency | Maps To | Simulation System |
|----------|---------|------------------|
| Political Capital | Policy adoption probability | governance/policyAdoption.ts |
| Research Funding | Tech tree investment weights | techTree/funding.ts |
| Public Attention | Issue salience multipliers | social/publicAttention.ts |
| Institutional Capacity | Implementation success rates | governance/institutionalCapacity.ts |
| International Cooperation | Coalition effectiveness | international/cooperation.ts |

### Research Validation Checklist

- [ ] Crisis opening scenario - validate starting conditions
- [ ] Advisor response accuracy - research grounding
- [ ] Currency parameter ranges - peer-reviewed sources
- [ ] NUX pacing - UX research on cognitive load
- [ ] Interaction effects - Monte Carlo validation

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-20 | Initial draft based on existing specs |
| 2.0 | 2025-11-20 | Revised per Sylvia's research integrity review: removed direct parameter control, reframed difficulty as research scenarios, renamed outcomes, adopted Ray's framing, clarified indirect agency |
| 3.0 | 2025-11-22 | Added: Crisis Opening narrative, AI Advisor system, NUX flow, Realistic Currency system (Maya) |

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
