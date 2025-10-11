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
| [🔬 Breakthrough Technologies](./systems/breakthrough-technologies.md) | ✅ | 12 technologies (includes Interspecies Comm 🐋), resource regeneration |
| [🏛️ Governance Quality](./systems/governance-quality.md) | ✅ | Democratic resilience, decision quality, institutional capacity |
| [🌟 Upward Spirals](./systems/upward-spirals.md) | ✅ | 6 virtuous cascades, multiple paths to Utopia |
| [🎨 Meaning Renaissance](./systems/meaning-renaissance.md) | ✅ | Cultural flourishing, 4 dimensions of meaning |
| [🕊️ Conflict Resolution](./systems/conflict-resolution.md) | ✅ | Diplomatic AI, post-scarcity peace, cyber defense, 4 pillars |
| [☢️ Nuclear Deterrence](./systems/nuclear-deterrence.md) | ✅ | 5 nuclear states, MAD mechanics, bilateral tensions, escalation ladder |

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
| [🔧 Phase 2 Refactoring](./technical/phase2-refactoring.md) | ✅ | Architectural cleanup (Oct 2025) |

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
- **Governance Quality**: Democratic resilience, AI-augmented decision quality, authoritarian resistance (Phase 2C)
- **Upward Spirals**: 6 virtuous cascades (Abundance, Cognitive, Democratic, Scientific, Meaning, Ecological) with cross-amplification (Phase 2D)
- **Meaning Renaissance**: 4 dimensions of cultural flourishing (purpose diversity, self-actualization, artistic renaissance, philosophical maturity) (Phase 2E)
- **Conflict Resolution**: AI-mediated diplomacy, post-scarcity peace dividend, cyber defense systems (Phase 2F)
- **Nuclear Deterrence**: 5 nuclear states, MAD mechanics, escalation ladder, reduced nuclear war 80% → 20% (Oct 2025)
- **Interspecies Communication AI**: Talk to whales/dolphins/octopi, meaning crisis reduction, 12th breakthrough technology (Oct 2025)
- **Resource Regeneration**: Tech-enabled recovery (+4.8%/month), enables Ecological Spiral activation (Oct 2025)
- **Paranoia/Trust System**: Trust can recover via decay + beneficial tech, unblocks Cognitive Spiral (Oct 2025)
- **Monte Carlo**: 1000+ runs in ~10 seconds

### What Needs Tuning ⚠️

**See [Diagnostic Findings](./DIAGNOSTIC_FINDINGS.md) for detailed analysis**

**🔬 Current Test Results (October 9, 2025 - 50 runs × 240 months)**

**Scientific Spiral Mystery** 🚨:
- **Symptom**: Spiral shows "✅ INACTIVE" despite all requirements appearing met
- **Observed**: "5 unlocked, 5 deployed ✅ (need 4+ deployed >50%)"
- **Root Cause**: "Deployed" ≠ "Deployed at >50% level"
  - Technologies start at 10% deployment when unlocked
  - Requirement is 4+ technologies at **>50% deployment level**
  - Current: Technologies deployed but still at 10-40% levels
  - **Deployment is too slow** to reach 50% before crises cascade

**Typical Month 60 Snapshot**:
- Cascading failures: 5 crises active (2.5x degradation)
- Resources: 11% (collapsed)
- Pollution: 99% (catastrophic)
- Biodiversity: 1% (extinction event)
- Meaning crisis: 90% (severe)
- Trust: 40% (blocks Cognitive Spiral)
- Interspecies Comm AI: Just unlocked, 10% deployment
- **Scientific Spiral**: All requirements "✅" but still inactive

**Active Blockers (Post-October Enhancements)**:
1. **Deployment Speed Bottleneck** 🚨 - Technologies unlock but don't deploy fast enough to >50%
2. **Trust Collapse Timing** - Trust drops to 40% before spirals can activate (paranoia system needs Phase 2)
3. **Crisis Cascade Lock-In** - 5+ crises create 2.5x degradation, overwhelms recovery
4. **Resource Death Spiral** - Still collapses to 11% despite regeneration system (needs testing)
5. **Meaning Crisis Severity** - Reaches 90% before social tech can deploy

**Phase 2F+ Status**:
- ✅ Nuclear Deterrence (implemented, reduced nuclear war 80% → 20%)
- ✅ Interspecies Communication AI (implemented, unlocking Month 60)
- ✅ Resource Regeneration (implemented, testing needed)
- ✅ Paranoia/Trust System Phase 1 (implemented, Phase 2 beneficial tech boosts needed)
- 🔄 Testing 50-run Monte Carlo (liztest_100925232_8.log)

**Next Steps**:
1. Implement Phase 2 beneficial tech paranoia reduction (-8% disease elimination, -5% interspecies, etc.)
2. Increase AI-accelerated deployment multiplier (1.2-1.9x → 2.0-3.0x?)
3. Earlier emergency deployment triggers (activate at 3 crises instead of 4?)
4. Debug deployment level tracking (is >50% check working correctly?)

### What's Planned 📋

- **Government Research Prioritization**: Strategic tech research allocation actions
- **Technology Synergies**: Combinations of technologies with enhanced effects
- **International dynamics**: Multiple governments, tech sharing/racing
- **Multi-agent coordination**: Explicit AI coalitions
- **Public opinion**: More granular trust mechanics influenced by tech breakthroughs

## 📊 Current Simulation Characteristics

**Latest Test**: October 9, 2025 - 50 runs × 240 months (liztest_100925232_8.log)

| Metric | Latest Results | Notes |
|--------|---------|-------|
| **Outcome: Dystopia** | Testing | Phase 2F+ nuclear deterrence changes outcome distribution |
| **Outcome: Extinction** | Testing | Nuclear war reduced from 80% → 20% |
| **Outcome: Utopia** | 0% (testing) | Upward spirals not activating (deployment bottleneck) |
| **Game Duration** | 240 months | Extended test to see late-game recovery |
| **Max AI Capability** | 2.0-4.5 | Wider range, China often surpasses US (gap: 1.13) |
| **Economic Stage Reached** | 3-4 | Post-scarcity transitions occurring |
| **Crisis Cascades** | Universal | 5 crises active by Month 60 (2.5x degradation) |
| **Golden Age Duration** | 1-8 months | Very fragile, collapses into crisis cascade quickly |
| **QoL Degradation** | Catastrophic | Environmental collapses (resources 11%, pollution 99%, biodiversity 1%) |
| **Breakthrough Unlocks** | 5 by Month 60 | Interspecies Comm AI unlocking Month 60 |
| **Deployment Levels** | 10-40% | **BOTTLENECK**: Not reaching >50% before cascade |
| **Trust Trajectory** | 100% → 40% | Drops before Cognitive Spiral can activate |
| **Meaning Crisis** | 90% by Month 60 | Severe crisis before social tech deploys |
| **Scientific Spiral** | Appears met, but inactive | **BUG**: Reports "✅" for all requirements but doesn't activate |
| **Virtuous Cascades** | 1 (Abundance only) | Only Abundance activates; others blocked by deployment speed |

**Key Observations**:
- **Nuclear Deterrence Working**: Nuclear war reduced significantly ✅
- **Interspecies Comm AI**: Unlocking around Month 60 (late, crisis already cascading)
- **Deployment Bottleneck Confirmed**: Technologies unlock but don't reach >50% deployment
- **Resource Regeneration**: System implemented but resources still collapse to 11% (needs investigation)
- **Paranoia Phase 1**: Implemented but trust still drops to 40% (Phase 2 beneficial boosts needed)
- **Crisis Cascade Timing**: 5 crises by Month 60 creates 2.5x degradation that overwhelms recovery

> **Note**: Phase 2F+ enhancements (Nuclear Deterrence, Interspecies Comm, Resource Regen, Paranoia/Trust) are implemented but full testing in progress. Deployment speed is the critical blocker preventing spiral activation and Utopia outcomes. Target: 10-30% Utopia rate requires faster deployment (2-3x multiplier increase?) or earlier emergency deployment triggers.

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

### Planning & Specification
- **Original Spec**: `/plans/ai_alignment_game_spec.md`
- **Agent Spec**: `/plans/agent_types_specification.md`
- **Compute Plan**: `/docs/compute-resource-system.md`
- **Organization Plan**: `/docs/organization-agents-system.md`

### Testing & Analysis
- **Monte Carlo Results**: `/docs/MONTE_CARLO_RESULTS.md`
- **[Diagnostic Findings](./DIAGNOSTIC_FINDINGS.md)**: October 2025 deep dive into 0% Utopia blockers

### Devlogs (Recent Key Findings)
- `devlogs/monte-carlo-analysis-oct-9-action-fix.md` - Comprehensive blocker analysis
- `devlogs/spiral-diagnostic-findings-oct-9-2025.md` - Spiral activation rates
- `devlogs/session-oct-9-blockers-fixed.md` - Phase 2F+ implementation
- `devlogs/ai-accelerated-deployment-enhancement.md` - Distribution insight

## 📖 Legend

See [Emoji Legend](./_EMOJI_LEGEND.md) for consistent status indicators and terminology.

---

**Last Updated**: October 9, 2025
**Version**: 2.2 (Phase 2F+: Nuclear Deterrence & Paranoia Systems)
**Status**: Full Phase 2 complete (2A-2F) + October enhancements (nuclear deterrence, interspecies comm, resource regeneration, paranoia/trust)

**October 2025 Additions:**
- ☢️ Nuclear Deterrence System (5 nuclear states, MAD mechanics, escalation ladder)
- 🐋 Interspecies Communication AI (12th breakthrough technology)
- ♻️ Resource Regeneration (+4.8%/month recovery, enables Ecological Spiral)
- 🧠 Paranoia/Trust System (trust recovery mechanics, unblocks Cognitive Spiral)
- 🎯 Target: 10-30% Utopia rate (testing in progress)
