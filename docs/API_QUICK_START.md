# API Documentation Quick Start

## 🚀 View the Documentation

```bash
npm run docs:serve
```

Opens http://localhost:8080 with full API documentation.

## 📍 Key Pages to Start With

### 1. Overview & Entry Points
- **Main Index**: `docs/api/index.html` - Start here
- **Module Index**: `docs/api/modules.html` - All modules organized
- **Class Hierarchy**: `docs/api/hierarchy.html` - Inheritance tree

### 2. Core Architecture
| Page | Description |
|------|-------------|
| `modules/simulation_engine_PhaseOrchestrator.html` | **Phase orchestrator** - How simulation executes |
| `interfaces/GameState.html` | **GameState** - Single source of truth (900+ lines) |
| `modules/simulation_initialization.html` | **State creation** - How game state is initialized |

### 3. Type System (Most Referenced)
| Interface | Purpose |
|-----------|---------|
| `interfaces/GameState.html` | Complete game state structure |
| `interfaces/GlobalMetrics.html` | Global metrics and flags |
| `interfaces/AIAgent.html` | AI agent structure |
| `interfaces/GovernmentAgent.html` | Government system |
| `interfaces/QualityOfLifeSystems.html` | Multi-dimensional QoL |
| `interfaces/ResourceEconomy.html` | Full resource system |

### 4. Key Systems
| Module | System |
|--------|--------|
| `modules/simulation_environmental.html` | Environmental accumulation |
| `modules/simulation_socialCohesion.html` | Social cohesion & trust |
| `modules/simulation_techTree_engine.html` | Technology tree |
| `modules/simulation_upwardSpirals.html` | Utopia spirals |
| `modules/simulation_capabilities.html` | AI capability tracking |
| `modules/simulation_planetaryBoundaries.html` | Planetary boundaries |

### 5. Phase System (37 Phases)
All phases: `modules/simulation_engine_phases_index.html`

Key phases to understand:
- `AIAgentPhase` (2.0) - AI agent decisions
- `GovernmentPhase` (3.0) - Government actions
- `TechTreePhase` (12.5) - Technology effects
- `EnvironmentalFeedbackPhase` (17.0) - Environmental updates
- `OutcomeCalculationPhase` (31.0) - Utopia/dystopia calculation

### 6. Utilities & Helpers
| Module | Purpose |
|--------|---------|
| `modules/simulation_utils_assertions.html` | Validation utilities (NO defensive programming!) |
| `modules/simulation_utils_aiHelpers.html` | AI-specific utilities |
| `modules/simulation_utils_mathUtils.html` | Math utilities |
| `modules/simulation_rngUtils.html` | Deterministic RNG |

## 🔍 Search Tips

1. **Use the search bar** (top-right) - searches across all docs
2. **Browse by module** - Click "Modules" in nav
3. **Browse by type** - Click on Classes/Interfaces/Functions
4. **View source** - Each item has a link to the actual source code

## 📊 What's Documented

```
1,749 total pages
  113 classes
  358 interfaces  ← Most important for understanding state
  732 functions
   64 type aliases
  361 modules
```

## 🎯 Common Tasks

### "I want to understand how X system works"
1. Search for system name (e.g., "environmental", "tech tree")
2. Go to the module page (e.g., `modules/simulation_environmental.html`)
3. Read function documentation with research citations

### "I want to add a new property to GameState"
1. Go to `interfaces/GameState.html`
2. See all existing properties with comments
3. Add new property following same pattern
4. Regenerate docs: `npm run docs`

### "I want to understand the phase execution order"
1. Go to `modules/simulation_engine_PhaseOrchestrator.html`
2. See phase list with order numbers
3. Click individual phases for details

### "I want to see all types related to X"
1. Use search for the domain (e.g., "ocean", "AI", "climate")
2. Filter results by Interfaces/Types
3. See complete type definitions

## 📝 Documentation Standards

All systems should document:
- ✅ **Research citations** - Peer-reviewed sources (2024-2025)
- ✅ **Parameter justifications** - Why this value? (data-backed)
- ✅ **Mechanism descriptions** - How it works
- ✅ **Interaction maps** - What affects/is affected
- ✅ **Expected timelines** - When it matters
- ✅ **Failure modes** - What can go wrong

## 🔄 Keeping Docs Updated

```bash
# Regenerate after code changes
npm run docs

# Docs are in docs/api/ (gitignored by default)
# Commit if you want to share HTML
```

## 🏗️ Architecture at a Glance

```
GameState (single source of truth)
    ↓
PhaseOrchestrator (executes 37 phases in order)
    ↓
Phase 0-1:  Time & Init
Phase 2-8:  Agent Actions (AI, Gov, Society)
Phase 9-25: Systems Updates (Env, Social, Tech)
Phase 26-30: Crisis Detection
Phase 31-36: Outcomes & Metrics
    ↓
State mutation (deterministic with RNG seed)
```

## 📚 Related Documentation

- **Code Guide**: `CLAUDE.md` - Development workflow
- **System Wiki**: `docs/wiki/README.md` - Detailed system docs (3,000+ lines)
- **Research**: `research/` - Peer-reviewed research
- **Plans**: `plans/` - Feature roadmap

---

**Generated**: October 27, 2025
**Tool**: TypeDoc 0.28.14 + Mermaid Plugin
**Coverage**: Full simulation engine (`src/simulation/`, `src/types/`)
