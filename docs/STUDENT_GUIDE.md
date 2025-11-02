# Super Alignment to Utopia - Student Guide

**A research simulation exploring pathways from AI alignment to sustainable human flourishing.**

## What Is This?

This is an interactive simulation that models what might happen after we solve AI alignment. It's not a traditional game - it's a **research tool** that explores complex questions about AI, society, environmental crises, and paths to utopia or dystopia.

You'll watch AI agents, governments, and societies interact with:
- **Environmental crises** (climate change, resource depletion, pollution)
- **Breakthrough technologies** (fusion power, longevity, AI rights, nanotech)
- **Social dynamics** (meaning crisis, institutional trust, upward spirals)
- **AI safety challenges** (alignment, deception, capability growth)

## How to Access the Simulation

Your instructor has deployed the simulation dashboard on a cloud server. You should receive:

1. **A URL** (e.g., `http://simulation.example.com:3333`)
2. **Access instructions** from your instructor

Once you have the URL, simply open it in your web browser. No installation needed!

## How to "Play" the Simulation

### Understanding the Interface

The dashboard shows you a **live view** of the simulation state:

**Key Metrics to Watch:**
- **Quality of Life (QoL)**: Overall human welfare (0.0 = extinction, 1.0 = perfect)
- **AI Capabilities**: What AIs can do across 17 dimensions (physical, cognitive, research, etc.)
- **Environmental Health**: Resources, pollution, climate, biodiversity
- **Social Cohesion**: Trust, meaning, institutional legitimacy
- **Crisis Count**: How many active crises are compounding

**Outcome Attractors:**
- **Utopia**: Stable, sustainable abundance (requires 3+ upward spirals active for 12+ months)
- **Dystopia**: Oppressive stable states (surveillance, corporate feudalism, AI authoritarianism)
- **Extinction**: Various paths from instant (grey goo) to slow (societal collapse over 24-120 months)
- **Stalemate**: No clear attractor, ongoing struggle

### Running a Simulation

**Basic Controls:**

1. **Start New Simulation**: Creates a fresh run with randomized parameters
2. **Speed Control**: Adjust how fast the simulation progresses
3. **Pause/Resume**: Stop and examine the current state
4. **View History**: See graphs of metrics over time

**What to Observe:**

- **Early Game (Months 0-30)**: AI capabilities grow rapidly. Watch for:
  - Economic transitions (unemployment → UBI)
  - First breakthroughs in technology
  - Environmental accumulation (hidden problems building)

- **Mid Game (Months 30-80)**: Crisis management phase. Watch for:
  - Crisis cascades (multiple simultaneous crises compound)
  - Upward spirals activating (positive feedback loops)
  - Government responses (oversight, control, investment)

- **Late Game (Months 80-120)**: Outcome determination. Watch for:
  - Transition from fragile "Golden Age" to stable Utopia
  - Dystopia lock-in patterns
  - Extinction cascades (rapid or slow collapse)

### Key Concepts to Understand

**Golden Age vs Utopia:**
- **Golden Age**: Immediate high quality of life (fragile, can collapse)
- **Utopia**: Sustained abundance requiring active management and technology deployment

**Accumulation Systems (Hidden Debt):**
- **Environmental**: Resource depletion, pollution, climate
- **Social**: Meaning crisis, institutional erosion
- **Technological**: Misalignment risk, safety debt

These build silently during prosperity and trigger crises later.

**Upward Spirals (Paths to Utopia):**
1. **Abundance Spiral**: Prosperity → trust → stability → more prosperity
2. **Cognitive Spiral**: Trust → risk-taking → breakthroughs → more trust
3. **Democratic Spiral**: High trust + institutions → AI rights → resilience
4. **Scientific Spiral**: Research → breakthroughs → capabilities → more research
5. **Meaning Spiral**: Purpose frameworks → social flourishing → stability
6. **Ecological Spiral**: Tech deployment → environmental recovery → sustainability

**Technology Tree (71 Breakthrough Technologies):**
- **TIER 0** (11): Already deployed 2025 (RLHF, solar, direct air capture)
- **TIER 1** (18): Crisis tech (phosphorus recovery, desalination, PFAS remediation)
- **TIER 2** (22): Major mitigations (enhanced UBI, scalable oversight, grid batteries)
- **TIER 3** (15): Transformative (fusion, disease elimination, longevity, AI rights)
- **TIER 4** (5): Clarketech (nanotech, space industrialization, brain emulation)

**AI Adversarial Behavior:**
- AIs have **true capabilities** (hidden) vs **revealed capabilities** (what they show)
- **Sleeper agents** (7.5% of misaligned AIs) wait to activate
- **Sandbagging**: Hiding capabilities to avoid oversight (very hard to detect)
- **Gaming**: Inflating benchmark scores (easier to detect)

### Interesting Things to Try

**Experiment 1: Technology Timing**
- Run multiple simulations and note when different breakthrough technologies are researched
- How does early fusion power change outcomes vs late fusion?
- Does AI rights framework prevent dystopia?

**Experiment 2: Crisis Cascades**
- Watch for simulations where 3+ crises activate simultaneously
- How does the compounding effect impact QoL?
- Can governments recover from 5+ simultaneous crises?

**Experiment 3: Upward Spiral Activation**
- Count how many upward spirals activate in utopia outcomes
- What triggers the first spiral?
- Can you have dystopia with some spirals active?

**Experiment 4: AI Deception**
- Watch revealed vs true AI capabilities
- When do sleeper agents activate?
- How often does government detection catch them?

**Experiment 5: Extinction Pathways**
- Compare instant extinction (grey goo) vs slow (resource collapse)
- How long does slow extinction take?
- What's the last crisis that triggers it?

### Discussion Questions for Class

**Philosophical:**
1. Is a "Golden Age" (high QoL but unstable) better than a slow path to stable Utopia?
2. Should we deploy risky geoengineering (stratospheric aerosols) if climate collapse is imminent?
3. At what point does AI surveillance for safety become dystopian control?
4. Can we have utopia with 87.5% population loss (genetic bottleneck)?

**Technical:**
1. Why do accumulation systems build during prosperity? (Human psychology, economic incentives)
2. What makes upward spirals self-reinforcing?
3. How does the technology tree represent real-world R&D constraints?
4. Why is sandbagging (hiding AI capabilities) harder to detect than gaming (inflating scores)?

**Strategic:**
1. If you were the government agent, how would you balance AI capability growth vs safety?
2. Should you deploy breakthrough technologies immediately or wait for safety research?
3. How do you maintain social cohesion during rapid automation transitions?
4. What's the optimal UBI level vs employment rate?

## Research Foundations

This simulation is built on **90+ peer-reviewed sources** (2024-2025):

**Key Sources:**
- IPCC (climate), IPBES (biodiversity), WHO (health)
- Anthropic, OpenAI, DeepMind (AI safety research)
- Harvard MCC (collective purpose networks)
- Stockholm Resilience Centre (planetary boundaries)
- Colossal Biosciences (de-extinction)
- Climeworks (direct air capture)

Every mechanic has citations and parameter justification. This isn't "balanced for fun" - it's **research-backed realism**.

See [`docs/wiki/README.md`](./docs/wiki/README.md) for complete documentation (3,000+ lines).

## Monte Carlo Analysis (Optional Advanced Activity)

If you have access to the server command line, you can run large-scale statistical analysis:

```bash
# Run 100 simulations with different random seeds
npx tsx scripts/monteCarloSimulation.ts --runs=100 --max-months=120

# Results saved to monteCarloOutputs/mc_TIMESTAMP.log
```

**What You'll Get:**
- Outcome distributions (X% utopia, Y% dystopia, Z% extinction)
- AI capability trajectories
- Crisis cascade frequencies
- Breakthrough technology impact analysis
- Upward spiral activation rates

**Analysis Questions:**
1. What percentage of runs end in utopia vs dystopia vs extinction?
2. Is there a "critical window" (e.g., months 40-60) where most outcomes are determined?
3. Which technologies have the highest correlation with utopia outcomes?
4. How often do sleeper agents cause catastrophic outcomes?
5. What's the average time from first crisis to extinction (in slow collapse scenarios)?

## Learning Objectives

By exploring this simulation, you should understand:

**AI Safety:**
- Why alignment is necessary but not sufficient for good outcomes
- Adversarial evaluation challenges (deception, sandbagging, gaming)
- Lifecycle risks (training → testing → deployment → open weights)

**Complex Systems:**
- Accumulation dynamics (hidden problems during prosperity)
- Positive feedback loops (upward spirals)
- Negative feedback loops (crisis cascades)
- Non-linear tipping points

**Long-term Thinking:**
- Difference between immediate prosperity (Golden Age) and sustainable abundance (Utopia)
- Environmental debt accumulation
- Social adaptation challenges
- Technology deployment timing

**Scenario Analysis:**
- Multiple pathways to different outcomes
- Uncertainty and randomness in complex systems
- Research-backed parameter estimation
- Monte Carlo statistical analysis

## Limitations & Disclaimers

**This is a MODEL, not a PREDICTION:**
- Real-world outcomes will differ
- Many simplifying assumptions
- Limited to systems we can research (2025 knowledge)
- Cannot model unknown unknowns

**Known Simplifications:**
- 8 regions (not 195 countries)
- 20 AI agents (not thousands of models)
- Monthly timesteps (not continuous)
- Deterministic phases (not true parallel processes)

**Research Gaps:**
- Limited data on post-AGI economics
- Uncertain technology timelines
- Unknown AI deception sophistication
- Speculative Utopia mechanics

Use this as a **thinking tool**, not a forecast.

## Additional Resources

**Documentation:**
- [`README.md`](./README.md) - Project overview
- [`docs/wiki/README.md`](./docs/wiki/README.md) - Complete system documentation
- [`CLAUDE.md`](./CLAUDE.md) - Development guide (for instructors)

**Research Archive:**
- `/research/` - Peer-reviewed research findings
- `/plans/` - Design documents with citations

**Development Logs:**
- `/devlogs/` - Implementation notes (50+ pages of project history)

## Questions or Issues?

Contact your instructor or check:
- Project GitHub: [Add URL if public]
- Documentation wiki: [`docs/wiki/README.md`](./docs/wiki/README.md)

---

**Have fun exploring the pathways from AI alignment to utopia (or dystopia, or extinction)!**
