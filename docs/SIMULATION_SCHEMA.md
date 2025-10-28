# Simulation Schema - Hyper Token-Efficient Map

**Purpose**: Ultra-compact structural overview of entire simulation for LLM consumption.

## Quick Start

```bash
# Regenerate schema
npm run schema

# View LLM-optimized summary (694 bytes!)
cat docs/simulation-llm-summary.txt

# View hierarchical tree
cat docs/simulation-schema-tree.txt

# View compact list
cat docs/simulation-schema-compact.txt
```

## Output Files

### 1. `simulation-llm-summary.txt` ⭐ **BEST FOR LLM**
**Size**: 694 bytes
**Format**: Ultra-compact text summary

Perfect for LLM context window. Contains:
- Root structure (GameState: 110 properties)
- Type counts (412 types, 732 functions)
- Critical types (AIAgent, GlobalMetrics, ResourceEconomy)
- Key flow (initialize → phase execution → update → calculate)

**Use when**: You need to give an LLM a complete overview with minimal tokens.

```
SIMULATION STRUCTURE (Token-Optimized)

ROOT: GameState (110 properties)
AGENTS: 11 types (AIAgent, GovernmentAgent, HumanSocietyAgent, DecisionMaker)
SYSTEMS: 42 types (FamineSystem, FreshwaterSystem, ResourceEconomy, etc.)
FUNCTIONS: 732 (96 init, 102 update, 134 calc)

KEY FLOW:
1. Initialize state (96 functions)
2. Phase execution (37 phases, see PhaseOrchestrator)
3. Update systems (102 functions)
4. Calculate outcomes (OutcomeCalculationPhase)
```

### 2. `simulation-schema-tree.txt`
**Size**: 0.9KB
**Format**: Hierarchical tree view

Shows GameState property organization by category:
- Time, Agents, Systems, Metrics, Accumulation, Crises, Tech, Economy, Environment, Social, Outcomes

**Use when**: You want to understand GameState structure at a glance.

```
GameState
├─ Time (3)
│  ├─ currentMonth
│  ├─ daysInCurrentMonth
│  ├─ consciousnessEmergenceMonth
├─ Agents (1)
│  ├─ aiAgents
├─ Systems (21)
│  ├─ governmentSystem
│  ├─ qualityOfLifeSystems
│  ├─ phosphorusSystem
│  └─ ... +16
```

### 3. `simulation-schema-compact.txt`
**Size**: 7.1KB
**Format**: Compact text with all key types/functions

Detailed but still token-efficient. Lists:
- GameState properties (first 50)
- All agent types with property counts
- All system types with property counts
- All functions grouped by prefix (init, update, calculate)

**Use when**: You need more detail than the summary but less than full JSON.

### 4. `simulation-dependencies.txt`
**Size**: <1KB
**Format**: Type connectivity ranking

Shows which types reference the most other types:
```
GameState: 57 references
AIAgent: 12 references
DiagnosticLog: 8 references
AntimicrobialResistanceSystem: 4 references
```

**Use when**: You want to understand type relationships and coupling.

### 5. `simulation-schema.json`
**Size**: 213.4KB
**Format**: Full JSON schema

Complete machine-readable schema with:
- All 412 types with properties
- All 732 functions with parameters/returns
- Categorization (core, systems, agents)
- File locations

**Format**:
```json
{
  "meta": {
    "types": 412,
    "functions": 732,
    "generated": "2025-10-27T..."
  },
  "core": {
    "game": {
      "GameState": {
        "k": "interface",
        "p": ["currentMonth", "aiAgents", ...]
      }
    }
  },
  "systems": { ... },
  "functions": { ... }
}
```

**Use when**: You need programmatic access to the full schema.

## Key Statistics

| Metric | Count |
|--------|-------|
| **Total Types** | 412 |
| **Total Functions** | 732 |
| **Type Files** | 101 |
| **GameState Properties** | 110 |
| **AIAgent Properties** | 81 |
| **GlobalMetrics Properties** | 43 |
| **Init Functions** | 96 |
| **Update Functions** | 102 |
| **Calculate Functions** | 134 |

## Critical Types Reference

### Root
- **GameState** (110 props) - Root state container, single source of truth

### Agents
- **AIAgent** (81 props) - Heterogeneous AI population (20 agents)
- **GovernmentAgent** (33 props) - Government decision-making
- **HumanSocietyAgent** (24 props) - Societal dynamics
- **DecisionMaker** - High-stakes decision-makers (social influence targets)

### Systems
- **ResourceEconomy** - Full resource modeling (fossil fuels, metals, energy, CO2, ocean)
- **FamineSystem** (6 props) - Food crisis tracking
- **FreshwaterSystem** (13 props) - Water depletion by region
- **PhosphorusSystem** - Agricultural nutrient constraints
- **OceanAcidificationSystem** - Marine ecosystem collapse
- **DefensiveAISystem** (20 props) - Defensive AI capabilities
- **NationalAISystem** - National AI development competition
- **PlanetaryBoundariesSystem** - 9 planetary boundaries tracking

### Metrics
- **GlobalMetrics** (43 props) - Societal wellbeing, tech rate, QoL, outcome trajectories
- **QualityOfLifeSystems** - Multi-dimensional QoL (17 dimensions, 5 tiers)
- **OutcomeMetrics** - Utopia/dystopia/extinction tracking
- **MultiParadigmDUI** - 4 paradigm perspectives (Western, Development, Ecological, Indigenous)

### Accumulation
- **EnvironmentalAccumulation** - Resource depletion, pollution, climate, biodiversity debt
- **SocialAccumulation** - Meaning crisis, institutional erosion, social fragmentation
- **TechnologicalRisk** - Misalignment risk, safety debt, concentration risk

## Function Categories

### Initialization (96 functions)
Initialize all systems with default or randomized values:
- `initializeCapabilityProfile` - 17-dimensional AI capabilities
- `initializeResourceEconomy` - Full resource system
- `initializeUpwardSpirals` - 6 positive feedback loops
- `initializeDefensiveAI` - Defensive AI system
- `initializePlanetaryBoundariesSystem` - 9 boundaries

### Update (102 functions)
Monthly updates to all systems:
- `updateDefensiveAI` - Detection improvements, arms race
- `updateResourceEconomy` - Extraction, depletion, recycling
- `updateTechnologicalRisk` - Safety debt accumulation
- `updateGeoengineering` - Iron fertilization, SAI risks
- `updateFamineSystem` - Food crisis progression

### Calculate (134 functions)
Compute derived metrics:
- `calculateRevealedCapability` - AI strategic capability disclosure
- `calculateMonthlyMortalityRate` - Bayesian death modeling
- `calculateAIAssistedSkill` - AI productivity amplification
- `calculateProductivityMultiplier` - Labor/capital productivity

## LLM Consumption Strategy

### Minimal Context (< 1KB)
Use `simulation-llm-summary.txt` for:
- Quick system overview
- Understanding simulation flow
- Identifying key types

### Medium Context (< 10KB)
Use `simulation-schema-compact.txt` + `simulation-schema-tree.txt` for:
- Detailed type understanding
- GameState structure exploration
- Function discovery

### Full Context (> 200KB)
Use `simulation-schema.json` for:
- Programmatic schema parsing
- Complete type information
- Automated code generation

## Regeneration

Schema auto-extracts from TypeScript source using TS compiler API.

```bash
# Regenerate after code changes
npm run schema

# Check file sizes
ls -lh docs/simulation-*.txt docs/simulation-*.json
```

## Integration with API Docs

The schema complements the full API documentation:
- **Schema**: Structure and relationships (token-efficient)
- **API Docs**: Complete documentation with JSDoc (searchable HTML)

```bash
# Generate both
npm run schema && npm run docs

# View API docs
npm run docs:serve
```

---

**Generated**: Automatically from TypeScript source
**Tool**: `scripts/generateSimulationSchema.ts`
**Format**: Token-optimized for LLM consumption
