# AI Game Theory Simulation - Wiki

**Welcome to the comprehensive documentation for the AI Alignment Game Theory Simulation.**

This simulation explores the dynamics between AI systems, human institutions, and societal forces to model emergent pathways toward three primary outcomes: Cyberpunk Dystopia, Human Extinction, or Solarpunk Utopia.

## 🎯 Quick Start

- **New to the simulation?** Start with [Game Overview](./overview.md)
- **Setting up?** See [Getting Started](./getting-started.md)
- **Running experiments?** Check [Monte Carlo Guide](./monte-carlo.md)
- **Understanding outcomes?** Read [Win Conditions](./outcomes.md)

## 📚 Documentation Structure

### Core Systems

The fundamental building blocks of the simulation:

| System | Status | Description |
|--------|--------|-------------|
| [🏢 Organizations](./systems/organizations.md) | ✅ | Companies that own data centers and AI models |
| [💻 Compute Infrastructure](./systems/compute-infrastructure.md) | ✅ | Data centers, allocation, Moore's law |
| [🤖 AI Agents](./systems/ai-agents.md) | ✅ | AI models, capabilities, alignment, lifecycles |
| [🏛️ Government](./systems/government.md) | ✅ | Regulations, control, policies |
| [👥 Society](./systems/society.md) | ✅ | Trust, unemployment, adaptation |
| [🌍 Environmental](./systems/environmental.md) | ✅ | Resource depletion, pollution, climate, biodiversity |
| [🤝 Social Cohesion](./systems/social-cohesion.md) | ✅ | Meaning crisis, institutional erosion, social bonds |
| [⚠️ Technological Risk](./systems/technological-risk.md) | ✅ | Misalignment, safety debt, concentration, complacency |
| [🔬 Breakthrough Technologies](./systems/breakthrough-technologies.md) | ✅ | Research, unlocks, crisis recovery |

### Game Mechanics

How the simulation operates and what determines outcomes:

| Mechanic | Status | Description |
|----------|--------|-------------|
| [💰 Economics](./mechanics/economics.md) | ✅ | Stages, revenue, expenses, UBI transitions |
| [📊 Quality of Life](./mechanics/quality-of-life.md) | ✅ | 17-dimensional welfare measurement |
| [🎯 Outcomes](./mechanics/outcomes.md) | ✅ | Utopia, Dystopia, Extinction attractors |
| [✨ Golden Age](./mechanics/golden-age.md) | ✅ | Prosperity state vs Utopia outcome |
| [⚡ Crisis Cascades](./mechanics/crisis-cascades.md) | ✅ | How multiple crises compound |
| [⚡ Actions](./mechanics/actions.md) | ✅ | What each agent type can do |
| [⚙️ Simulation Loop](./mechanics/simulation-loop.md) | ✅ | Monthly processing order |

### Advanced Systems

Specialized mechanics and complex interactions:

| System | Status | Description |
|--------|--------|-------------|
| [🔬 Research & Technology](./advanced/research.md) | ✅ | Capability growth, breakthroughs, diffusion |
| [🛡️ Detection & Security](./advanced/detection.md) | ✅ | Benchmark evals, sleeper detection, sandbagging |
| [💀 Extinction Mechanisms](./advanced/extinctions.md) | ⚠️ | 17 ways humanity can end (needs tuning) |
| [🎲 Crisis Points](./advanced/crisis-points.md) | ✅ | Racing dynamics, alignment collapse, recursion |
| [🔄 Lifecycle](./advanced/lifecycle.md) | ✅ | AI birth, training, deployment, retirement |

### Technical Documentation

Implementation details and code references:

| Topic | Status | Description |
|-------|--------|-------------|
| [📁 Codebase Structure](./technical/codebase.md) | ✅ | File organization, module dependencies |
| [🧪 Testing & Monte Carlo](./technical/testing.md) | ✅ | Running simulations, analyzing results |
| [🎮 UI Components](./technical/ui.md) | ✅ | React components, state management |
| [⚙️ Engine Architecture](./technical/engine.md) | ✅ | Core simulation engine design |

## 🔧 System Status Overview

### What's Working ✅

- **Organizations System**: Fully operational with data center construction, model training, and strategic decisions
- **Compute Infrastructure**: Data centers, allocation, Moore's law growth
- **Economics**: Revenue models, expenses, stage transitions (0-4)
- **AI Capabilities**: Multi-dimensional profiles with true vs revealed
- **Detection System**: Benchmarks, evals, sleeper detection
- **Quality of Life**: 17-dimensional measurement system
- **Golden Age Detection**: Prosperity state tracking, distinct from Utopia
- **Accumulation Systems**: Environmental, social cohesion, and technological risk tracking
- **Crisis Cascades**: 10 crisis types with compounding degradation (up to 3.0x)
- **Breakthrough Technologies**: 11 technologies with research, unlock, and deployment mechanics
- **Crisis Recovery**: Technologies can reverse active environmental and social crises
- **Monte Carlo**: 1000+ runs in ~10 seconds

### What Needs Tuning ⚠️

- **Breakthrough Tech Research Budget**: Currently using auto-allocation for testing
- **Crisis Resolution Timing**: Balance between prevention and recovery pathways
- **Technology Unlock Timing**: Ensure breakthroughs can arrive in time to prevent cascades
- **Outcome Balance**: Current distribution needs validation (0% Utopia, 60% Dystopia, 40% Extinction)

### What's Planned 📋

- **Government Research Prioritization**: Strategic tech research allocation actions
- **Technology Synergies**: Combinations of technologies with enhanced effects
- **International dynamics**: Multiple governments, tech sharing/racing
- **Multi-agent coordination**: Explicit AI coalitions
- **Public opinion**: More granular trust mechanics influenced by tech breakthroughs

## 📊 Current Simulation Characteristics

Based on recent Monte Carlo results (October 2025):

| Metric | Latest Results | Notes |
|--------|---------|-------|
| **Outcome: Dystopia** | 60% | Surveillance state emerging, control mechanisms working |
| **Outcome: Extinction** | 40% | Slow Takeover scenario reaching 71% in multiple runs |
| **Outcome: Utopia** | 0% | Needs breakthrough tech testing/tuning |
| **Game Duration** | 120 months avg | Testing with 60-120 month runs |
| **Max AI Capability** | 2.5-3.0 | Good range for danger modeling |
| **Economic Stage Reached** | 3-4 | Post-scarcity transitions occurring |
| **Crisis Cascades** | Common | 6 simultaneous crises observed (3.0x degradation) |
| **Golden Age Duration** | 5-30 months | Fragile, often collapses into crisis cascade |
| **QoL Degradation** | Severe | Social: 0.45, Psychological: 0.59 (lowest categories) |

> **Note**: Recent implementation of Golden Age & Accumulation Systems has shifted outcomes from 90% Extinction to 60% Dystopia / 40% Extinction. Breakthrough Technologies system expected to enable Utopia paths (10-15% target).

## 🎮 Using This Wiki

### For Players

If you want to understand how to play the simulation effectively:
1. Read [Game Overview](./overview.md)
2. Study [Win Conditions](./outcomes.md)
3. Learn about [Government Actions](./systems/government.md)
4. Understand [Quality of Life](./mechanics/quality-of-life.md)

### For Researchers

If you're analyzing the simulation model:
1. Check [Economic Model](./mechanics/economics.md)
2. Review [Extinction Mechanisms](./advanced/extinctions.md)
3. Study [Monte Carlo Results](./technical/testing.md)
4. See [Parameter Sensitivity](./technical/parameters.md)

### For Developers

If you're working on the codebase:
1. Start with [Codebase Structure](./technical/codebase.md)
2. Review [Engine Architecture](./technical/engine.md)
3. Check [System Interactions](./technical/interactions.md)
4. See [Testing Guide](./technical/testing.md)

## 🔗 External References

- **Original Spec**: `/plans/ai_alignment_game_spec.md`
- **Agent Spec**: `/plans/agent_types_specification.md`
- **Compute Plan**: `/docs/compute-resource-system.md`
- **Organization Plan**: `/docs/organization-agents-system.md`
- **Monte Carlo Results**: `/docs/MONTE_CARLO_RESULTS.md`

## 📖 Legend

See [Emoji Legend](./_EMOJI_LEGEND.md) for consistent status indicators and terminology.

---

**Last Updated**: October 9, 2025
**Version**: 2.0 (Golden Age & Accumulation Systems + Breakthrough Technologies)
**Status**: Major systems complete, breakthrough tech testing in progress
