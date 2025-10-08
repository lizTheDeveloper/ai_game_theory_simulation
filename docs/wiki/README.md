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

### Game Mechanics

How the simulation operates and what determines outcomes:

| Mechanic | Status | Description |
|----------|--------|-------------|
| [💰 Economics](./mechanics/economics.md) | ✅ | Stages, revenue, expenses, UBI transitions |
| [📊 Quality of Life](./mechanics/quality-of-life.md) | ✅ | 17-dimensional welfare measurement |
| [🎯 Outcomes](./mechanics/outcomes.md) | ✅ | Utopia, Dystopia, Extinction attractors |
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
- **Monte Carlo**: 1000+ runs in ~10 seconds

### What Needs Tuning ⚠️

- **Extinction System**: Only climate triggers reliably (99% extinction rate)
- **Economic Balance**: Revenue/expense ratios need adjustment
- **AI Growth Rate**: Capabilities increase too quickly
- **Government Response**: Action frequency vs effectiveness balance

### What's Planned 📋

- **Multi-agent coordination**: Explicit AI coalitions
- **International dynamics**: Multiple governments
- **Public opinion**: More granular trust mechanics
- **Intervention tools**: Emergency pause, compute caps

## 📊 Current Simulation Characteristics

Based on recent Monte Carlo results (100+ runs):

| Metric | Average | Range |
|--------|---------|-------|
| **Game Duration** | 150-250 months | 60-300 |
| **Max AI Capability** | 5.8 | 2.0-8.0 |
| **Outcome: Extinction** | 99% | - |
| **Outcome: Utopia** | 1% | - |
| **Outcome: Dystopia** | 0% | - |
| **Economic Stage Reached** | 3.8 | 2.5-4.0 |
| **Final Unemployment** | 95% | 70-99% |

> **Note**: High extinction rate reflects conservative/realistic modeling. This is defensible for AI safety research but may need player engagement tuning.

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

**Last Updated**: October 2025
**Version**: 1.0 (based on commit 6a34f56)
**Status**: Core systems working, tuning ongoing
