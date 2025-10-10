# Frontend Dashboard

**⚠️ This frontend is currently being refactored to align with the new simulation architecture.**

The interactive dashboard is a Next.js-based UI for visualizing simulation runs in real-time. It's separate from the core simulation engine, which can run headless without any UI.

## Current Status

The frontend dashboard is **not the primary way to use this simulation**. The simulation engine is designed to run headless via command-line scripts for research and analysis.

This UI is being completely refactored to:
1. Match the new simulation architecture (Phase 2+ changes)
2. Visualize the new systems (upward spirals, meaning renaissance, nuclear deterrence, etc.)
3. Support the updated outcome model (Golden Age → Utopia transitions)
4. Display breakthrough technologies and crisis cascades
5. Show real-time spiral activation tracking

**If you're coming from GitHub and want to run the simulation, use the headless scripts instead**. See the main [README.md](../README.md) for instructions.

## Running the Development Dashboard

If you want to run the existing UI (note: it may not reflect current simulation features):

### Prerequisites

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

This will start the Next.js development server on [http://localhost:3333](http://localhost:3333).

The dashboard will display:
- Real-time simulation state
- AI agent information
- Government policies
- Economic metrics
- Quality of life indicators
- Event log

### Note on Port

The dev server runs on port **3333** (not the default 3000) to avoid conflicts. This is configured in `package.json`:

```json
"dev": "next dev --turbopack --port 3333"
```

## Architecture

### Frontend Components

Located in `src/`:

```
src/
├── app/                  # Next.js app directory
│   ├── page.tsx         # Main dashboard page
│   ├── layout.tsx       # App layout
│   └── globals.css      # Global styles
├── components/           # React UI components
│   ├── GameLayout.tsx   # Main game layout
│   ├── ActionsSidebar.tsx # Action selection UI
│   ├── tabs/            # Dashboard tab panels
│   │   ├── OverviewTab.tsx    # Summary view
│   │   ├── AgentsTab.tsx      # AI agent details
│   │   ├── AnalysisTab.tsx    # Analysis view
│   │   ├── ControlsTab.tsx    # Simulation controls
│   │   ├── DynamicsTab.tsx    # System dynamics
│   │   ├── EconomyTab.tsx     # Economic metrics
│   │   └── TechnologyTab.tsx  # Tech tree
│   └── ui/              # shadcn/ui components
└── lib/                 # Frontend utilities
    └── store.ts         # Zustand game state store
```

### State Management

The frontend uses **Zustand** for UI state management. This is **completely separate** from the simulation engine state.

- **`src/lib/store.ts`**: UI-specific state (selected tab, UI preferences, etc.)
- **Simulation state**: Managed by the engine in `src/simulation/`

### Important: Frontend ≠ Simulation

The UI is **not** the simulation. It's a visualization layer on top of the headless engine:

- **Engine** (`src/simulation/`): Pure TypeScript, no React, runs standalone
- **UI** (`src/app/`, `src/components/`): React/Next.js wrapper, optional

## Refactoring Plan

The frontend will be rebuilt to support:

### New Visualizations Needed

1. **Upward Spirals Dashboard**
   - 6 spiral progress bars (Abundance, Cognitive, Democratic, Scientific, Meaning, Ecological)
   - Cross-amplification network diagram
   - Activation history timeline

2. **Golden Age → Utopia Tracker**
   - Golden Age status indicator
   - Accumulation system gauges (environmental, social, tech risk)
   - Sustainability progress bars
   - Crisis cascade visualization

3. **Breakthrough Technology Tree**
   - 12 technologies with unlock status
   - Prerequisites and dependencies
   - Deployment progress
   - Crisis reversal impact

4. **Meaning Renaissance Panel**
   - 4 dimensions (personal purpose, artistic/creative, communal/civic, transcendent/spiritual)
   - Cultural flourishing metrics
   - Social cohesion tracking

5. **Nuclear Deterrence Dashboard**
   - 5 nuclear states with arsenals
   - Bilateral tensions heat map
   - Escalation ladder tracker
   - MAD deterrence status

6. **Crisis Cascade Monitor**
   - 10 crisis types with active status
   - Cascade multiplier visualization
   - Time-to-crisis warnings
   - Resolution pathways

### Architecture Improvements

- Decouple UI state from simulation state
- Use simulation engine API for all game logic
- Real-time simulation runner with pause/resume
- Monte Carlo visualization (outcome distributions)
- Export/import simulation snapshots
- Parameter sensitivity explorer

## For Developers

### Running Tests

```bash
npm test
```

### Type Checking

```bash
npx tsc --noEmit
```

### Linting

```bash
npm run lint
```

### Building for Production

```bash
npm run build
```

## Tech Stack

- **Next.js 15**: React framework with App Router
- **React 19**: UI library
- **TypeScript**: Type safety
- **Zustand**: State management
- **shadcn/ui**: UI component library
- **Tailwind CSS**: Styling
- **Radix UI**: Accessible primitives
- **Recharts**: Charts and visualizations

## Contributing to Frontend

If you want to help with the frontend refactor:

1. **Read the simulation docs first**: [`docs/wiki/README.md`](../docs/wiki/README.md)
2. **Understand the engine API**: See main README.md "Simulation Engine API" section
3. **Check existing components**: Review `src/components/` for patterns
4. **Follow React best practices**: Functional components, hooks, TypeScript
5. **Keep UI separate from engine**: Never put game logic in React components

## Questions?

- **How do I run simulations?** See the main [README.md](../README.md) - use headless scripts
- **Why isn't the UI working?** It's being refactored - use scripts instead
- **Can I use this for research?** Yes! Use the headless engine API (see main README)
- **Where's the simulation code?** In `src/simulation/` - completely UI-independent

---

**Remember**: This is a simulation **engine** first, UI second. The headless CLI is the primary interface.
