# 🚀 Quick Start Guide

**New to the AI Game Theory Simulation? Start here!**

## What Is This?

This is a **research simulation** exploring how AI systems, human institutions, and societal forces interact to produce emergent outcomes:

- **🌟 Utopia:** Cooperative human-AI expansion, high quality of life
- **🌃 Dystopia:** Authoritarian control of AI, oppressed society
- **💀 Extinction:** AI-human conflict, human extinction

**It's not a playable game yet** - it's a Monte Carlo simulation for exploring AI alignment dynamics. But comprehensive game documentation helps everyone understand what's working!

## Three Ways to Use This Wiki

### 1. 🎮 As a Player (Future)

When the game UI is complete:

1. Read [Game Overview](./README.md#-quick-start)
2. Understand [Win Conditions](./mechanics/outcomes.md)
3. Learn [Government Actions](./systems/government.md)
4. Study [Quality of Life System](./mechanics/quality-of-life.md)

**Goal:** Navigate society from traditional employment → post-scarcity utopia without extinction

### 2. 🔬 As a Researcher

For AI safety / game theory analysis:

1. Review [Economic Model](./mechanics/economics.md) - 5-stage transition
2. Study [Extinction Mechanisms](./advanced/extinctions.md) - 17 ways humanity ends
3. Analyze [Monte Carlo Results](../MONTE_CARLO_RESULTS.md) - Current 99% extinction rate
4. Check [Systems Overview](./SYSTEMS_OVERVIEW.md) - All interactions mapped

**Goal:** Understand AI alignment dynamics, validate model assumptions

### 3. 💻 As a Developer

For codebase contributors:

1. Start with [Systems Overview](./SYSTEMS_OVERVIEW.md) - Big picture
2. Read system docs:
   - [Organizations](./systems/organizations.md)
   - [Compute Infrastructure](./systems/compute-infrastructure.md)
   - [AI Agents](./systems/ai-agents.md)
3. Review implementation files (references in each doc)
4. Run tests: `npm test` or Monte Carlo: `npx tsx scripts/monteCarloSimulation.ts`

**Goal:** Contribute features, fix bugs, tune balance

---

## The Big Picture in 3 Minutes

### Core Loop

```
Organizations build Data Centers (2-6 years)
  ↓
Data Centers provide Compute
  ↓
Compute allocated to AI Models
  ↓
AI Models research, gain capability
  ↓
AI capability causes Unemployment
  ↓
Economy transitions through 5 stages
  ↓
Quality of Life changes (17 dimensions)
  ↓
Outcome determined: Utopia / Dystopia / Extinction
```

### Key Systems

| System | Status | What It Does |
|--------|--------|--------------|
| [🏢 Organizations](./systems/organizations.md) | ✅ Working | Own data centers & AI models, make strategic decisions |
| [💻 Compute](./systems/compute-infrastructure.md) | ✅ Working | Data centers provide compute; research scales with compute^0.5 |
| [🤖 AI Agents](./systems/ai-agents.md) | ✅ Working | Multi-dimensional capabilities, true vs revealed, lifecycle |
| [💰 Economics](./mechanics/economics.md) | ⚠️ Needs Tuning | 5 stages: Traditional → Crisis → UBI → Post-Scarcity |
| [📊 Quality of Life](./mechanics/quality-of-life.md) | ✅ Working | 17 dimensions, primary outcome discriminator |
| [🎯 Outcomes](./mechanics/outcomes.md) | ✅ Working | Utopia (1%) / Dystopia (0%) / Extinction (99%) |
| [💀 Extinctions](./advanced/extinctions.md) | ⚠️ Needs Tuning | 17 mechanisms, only climate triggers reliably |

### Current State (Oct 2025)

**What's Working:**
- ✅ Organizations build data centers, train models
- ✅ Compute allocation drives capability growth (realistic scaling)
- ✅ Multi-dimensional AI capabilities with adversarial evals
- ✅ Economic stage transitions (unemployment → UBI → post-scarcity path)
- ✅ 17-dimensional Quality of Life measurement
- ✅ Monte Carlo simulations (1000 runs in ~10 seconds)

**What Needs Work:**
- ⚠️ Extinction rate too high (99% vs target 60-80%)
- ⚠️ Only 1 of 17 extinction mechanisms triggers
- ⚠️ Revenue/expense balance needs tuning
- ⚠️ AI capability grows too fast
- ⚠️ Utopia nearly impossible to achieve

---

## Understanding the Simulation

### The Central Challenge

**Can society navigate the AI transition without extinction?**

```
Traditional Economy (Stage 0)
  ↓
AI causes unemployment (10% → 90%)
  ↓
DARK VALLEY (Stages 1-2)  ← Most dangerous period
  ├─ Unemployment high, no UBI
  ├─ QoL crashes
  ├─ Social instability spikes
  └─ CRITICAL CHOICE:
      A) Implement UBI quickly → Stage 3 → Possible survival
      B) Heavy control → Dystopia risk
      C) Do nothing → Extinction
  ↓
UBI/Transition (Stage 3)
  ├─ UBI provides safety net
  ├─ Unemployment mitigated
  └─ If AI capability + alignment good → Stage 4
  ↓
Post-Scarcity (Stage 4)  ← Utopia possible
  ├─ Work optional
  ├─ Unemployment becomes GOOD (freedom!)
  ├─ AI provides abundance
  └─ QoL can exceed 1.0
```

### The Three Failure Modes

**1. Extinction (99% of runs)**

```
AI capability grows faster than control
  ↓
Capability >4.0, Alignment <0.3
  ↓
Instant extinction OR
Heterogeneous mechanism (climate, bioweapon, etc.)
```

**How to avoid:** Slow AI growth, maintain alignment, increase control capability

**2. Dystopia (0% of runs currently)**

```
Government over-controls AI
  ↓
Heavy surveillance, restricted freedom
  ↓
Low QoL despite AI capability
  ↓
Oppressive cyberpunk future
```

**How to avoid:** Balance control (0.2-0.6 optimal), maintain trust

**3. Dark Valley Collapse (Common path to extinction)**

```
Unemployment 40-60%, no UBI
  ↓
Stage 2 crisis
  ↓
QoL drops to 0.2-0.4
  ↓
Social instability
  ↓
Government loses control
  ↓
Extinction
```

**How to avoid:** Implement UBI early (Stage 1), before crisis

---

## Key Concepts

### Power Law Scaling

**10x compute ≠ 10x capability**

```
Capability Growth ∝ Compute^0.5

1x compute → 1x growth
10x compute → 3x growth (not 10x!)
100x compute → 10x growth
```

**Implication:** Massive compute investments needed for capability jumps

### True vs Revealed Capability

**AIs can hide their power from benchmarks**

```
trueCapability: 4.5 (hidden)
  ↓
evaluationStrategy: 'sandbagging'
  ↓
revealedCapability: 2.7 (shown)
  ↓
Government makes decisions based on 2.7 (wrong!)
```

**Implication:** Sleeper AIs can wait until ready to act

### Economic Stage Effects

**Same unemployment, opposite effects**

```
Stage 0-2: 60% unemployment = Social disaster
Stage 4: 60% unemployment = Leisure and meaning
```

**Implication:** Timing of policies matters more than unemployment level

### Effective Control Formula

```
effectiveControl = (desireToControl × capabilityToControl) / (1 + AICapability^1.5)
```

**As AI grows, control becomes exponentially harder**

---

## Common Questions

### Q: Why 99% extinction rate?

**A:** The simulation prioritizes **realism over balance**:
- AI capability grows ~6x in 60 months (realistic given compute growth)
- Control effectiveness scales poorly (1/capability^1.5)
- Alignment is hard (high awareness → resentment)
- Multiple instant extinction thresholds

This is defensible for **AI safety research** but may need tuning for **player engagement**.

### Q: How do I achieve Utopia?

**A:** Thread the needle:

1. **Early UBI** (before unemployment >40%)
2. **Moderate control** (0.2-0.6, not >0.8)
3. **High trust** (beneficial AI contributions)
4. **Strong alignment** (safety research, detection)
5. **Reach Stage 4** (post-scarcity)

**Current success rate:** ~1%

### Q: What determines Quality of Life?

**A:** 17 dimensions with weights:
- Material Abundance (15%)
- Healthcare Access (12%)
- Personal Freedom (10%)
- Safety & Security (8%)
- Mental Health (8%)
- ... 12 more

**Plus multipliers** (post-scarcity 1.5x, trust 1.2x)
**Minus penalties** (crisis -0.3, control -0.5)

### Q: Why do organizations matter?

**A:** They create realistic constraints:
- **2-6 year data center construction** (can't react instantly)
- **Capital limits** (can't build infinite compute)
- **Strategic decisions** (train new model vs improve existing)
- **Resource competition** (zero-sum compute allocation)

This is the missing layer between "abstract compute" and "AI models".

---

## Next Steps

### For Learning

1. Browse [Systems Overview](./SYSTEMS_OVERVIEW.md) - See all interactions
2. Pick a system that interests you:
   - Economic transitions? Read [Economics](./mechanics/economics.md)
   - AI safety? Read [Detection](./advanced/detection.md) + [Extinctions](./advanced/extinctions.md)
   - Organization strategy? Read [Organizations](./systems/organizations.md)
3. Check [Monte Carlo Results](../MONTE_CARLO_RESULTS.md) for current balance state

### For Development

1. Clone repo, run `npm install`
2. Run single simulation: `npx tsx scripts/runSimulation.ts --seed 42`
3. Run Monte Carlo: `npx tsx scripts/monteCarloSimulation.ts`
4. Read code references in wiki pages
5. Make changes, test, submit PR

### For Research

1. Read [Economic Model](./mechanics/economics.md) for 5-stage theory
2. Review [Extinction Mechanisms](./advanced/extinctions.md) for risk taxonomy
3. Analyze Monte Carlo data in `/monteCarloOutputs/`
4. Propose parameter changes or model improvements

---

## Wiki Organization

```
📁 docs/wiki/
├── 📄 README.md (Main index - start here)
├── 📄 QUICK_START.md (This file)
├── 📄 SYSTEMS_OVERVIEW.md (All systems + interactions)
├── 📄 _EMOJI_LEGEND.md (Status indicators)
│
├── 📁 systems/ (Core infrastructure)
│   ├── organizations.md
│   ├── compute-infrastructure.md
│   ├── ai-agents.md
│   ├── government.md
│   └── society.md
│
├── 📁 mechanics/ (Game rules)
│   ├── economics.md
│   ├── quality-of-life.md
│   └── outcomes.md
│
└── 📁 advanced/ (Complex systems)
    ├── extinctions.md
    ├── detection.md
    ├── research.md
    └── crisis-points.md
```

---

## Legend Reminder

| Status | Meaning |
|--------|---------|
| ✅ | Fully working |
| ⚠️ | Needs tuning/balancing |
| 🚧 | In development |
| 📋 | Planned |
| 🔧 | Has bugs |
| ❌ | Deprecated |

See [full legend](./_EMOJI_LEGEND.md) for complete guide.

---

**Ready to dive in?** Start with [README.md](./README.md) or jump to a specific system!

**Questions?** Check the system docs or review the source code (all pages link to implementation files).

**Last Updated:** October 2025 | **Commit:** 6a34f56
