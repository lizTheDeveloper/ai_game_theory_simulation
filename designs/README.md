# Superalignment → Utopia Dashboard Design System

## Overview
This design system defines a comprehensive, far-future interface for visualizing complex multi-dimensional data from an AI alignment simulation. The aesthetic draws from sci-fi films like Elysium, Arrival, and Interstellar - creating an interface that feels impossibly advanced yet remains ruthlessly functional.

**Design Philosophy**: Every pixel earns its place through informational value. High data density without clutter. Beauty through clarity, not decoration.

---

## 🎨 Core Design Language

### Visual Identity
- **Color Palette**: Deep black backgrounds, pure white text, glowing cyan/amber/red accents
- **Typography**: Ultra-light sans-serif (Inter, SF Pro), extensive use of tabular numbers
- **Effects**: Subtle glows, smooth transitions, holographic layering via opacity
- **Information Hierarchy**: Brightness = importance, animation = urgency

### Design Principles
1. **Data First**: Visualization over decoration
2. **Progressive Disclosure**: Overview → Details → Deep Dive
3. **Real-time Clarity**: Streaming updates without jarring
4. **Multi-dimensional**: Show complexity without overwhelming
5. **Crisis-Aware**: Interface adapts to severity

---

## 📊 Dashboard Screens

### 1. [Overview Dashboard](01_overview_screen.md)
**Mission Control** - At-a-glance understanding of entire simulation
- Outcome trajectory (utopia/dystopia/extinction probabilities)
- Multi-paradigm status summary
- Critical metrics (population, QoL, trust, AI capability)
- Active crises and positive spirals
- System status grid
- Recent events timeline

**Key Insight**: Shows overall health and trajectory in seconds

### 2. [Multi-Paradigm DUI](02_paradigm_view.md)
**Value System Conflicts** - Four simultaneous perspectives on same world
- Western Liberal, Development, Ecological, Indigenous scores
- Paradigm divergence and conflicts
- Component breakdown heatmaps
- Historical pattern matching
- Radar charts for each paradigm

**Key Insight**: Same world can be utopia AND dystopia simultaneously

### 3. [AI Agents Monitor](03_ai_agents_screen.md)
**Population Tracking** - 20 heterogeneous AI agents
- True vs revealed capabilities (sandbagging/gaming)
- Alignment dynamics and resentment
- Individual agent cards with risk assessment
- Deception strategy distribution
- Capability matrix visualization

**Key Insight**: The gap between what AIs can do and what they show

### 4. [Adversarial Detection](04_sleeper_detection.md)
**Cat-and-Mouse Game** - Detection vs deception arms race
- Detection method effectiveness and costs
- Confidence scores per agent
- Evidence chains and sleeper networks
- Counter-detection evolution
- ROI analysis for detection investment

**Key Insight**: Perpetual race between deception and detection

### 5. [Environmental Systems](05_environmental_systems.md)
**Planetary Boundaries** - Earth's safe operating space
- 9 planetary boundaries radar chart
- Climate metrics and tipping points
- Environmental debt accumulation
- Technology deployment curves (decades-long)
- Regional impact variations

**Key Insight**: Prosperity masks accumulating environmental debt

### 6. [Crisis Dashboard](06_crisis_dashboard.md)
**Cascade Monitoring** - 10 crisis types with multiplier effects
- Severity levels and cascade chains
- Emergency response status
- Intervention windows (time remaining)
- Crisis timeline and projections
- Cascade probability analysis

**Key Insight**: Isolated problems compound into existential threats

### 7. [Technology Tree](07_technology_tree.md)
**71 Breakthrough Technologies** - TIER 0-4 deployment tracking
- Prerequisite dependencies
- Deployment curves (10-40 year timescales)
- Regional variations
- Critical path analysis
- Impact vs deployment gap

**Key Insight**: Solutions exist but take decades to deploy

### 8. [Population & Regions](08_population_regions.md)
**Inequality Tracking** - Regional QoL and demographics
- Population distribution by class
- "Elysium" pattern detection
- Migration flows
- Regional crisis impacts
- Inequality trends

**Key Insight**: Elite prosperity can coexist with mass suffering

### 9. [Timeline View](09_timeline_view.md)
**Event Narrative** - Chronological story of simulation
- Filterable event log
- Cause-effect chains
- Milestone tracking
- Pattern identification
- Event statistics

**Key Insight**: Individual events chain into larger patterns

### 10. [Monte Carlo Results](10_monte_carlo_results.md)
**Statistical Analysis** - Outcomes across multiple runs
- Outcome probability distributions
- Confidence intervals
- Survival curves
- Outlier analysis
- Common patterns

**Key Insight**: Which patterns are robust vs random

---

## 🛠 Implementation Guide

### Technology Stack
```typescript
// Recommended stack
- Framework: Next.js 14+ (App Router)
- Styling: Tailwind CSS (configured for design system)
- Charts: Recharts or D3.js for complex visualizations
- State: Zustand or Context API
- Real-time: WebSocket or Server-Sent Events
- Performance: React.memo, virtualization, Web Workers
```

### Component Architecture
```
src/
├── components/
│   ├── core/           # Base components (Panel, MetricCard, etc.)
│   ├── charts/         # Visualization components
│   ├── dashboards/     # Screen-level components
│   └── ui/             # Design system primitives
├── lib/
│   ├── calculations/   # Data processing functions
│   ├── hooks/          # Custom React hooks
│   └── utils/          # Helpers and formatters
└── styles/
    └── globals.css     # CSS variables and base styles
```

### Design Tokens
```css
/* CSS Variables in globals.css */
:root {
  --color-black: #000000;
  --color-cyan: #00F0FF;
  --color-amber: #FFB000;
  --color-red: #FF0040;
  --color-green: #00FF88;

  --glow-sm: 0 0 10px rgba(0, 240, 255, 0.1);
  --glow-md: 0 0 20px rgba(0, 240, 255, 0.2);
  --glow-lg: 0 0 40px rgba(0, 240, 255, 0.4);

  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Data Flow Architecture
```typescript
// Simulation engine (pure TypeScript)
GameState → PhaseOrchestrator → 37 Phases → Updated State

// Dashboard (Next.js)
Server Component → Fetch State → Client Components → Visualizations

// Real-time updates
WebSocket/SSE → State Updates → React Re-render → Smooth Transitions
```

---

## 🎯 Key Design Patterns

### Progressive Information Density
1. **Overview**: Highest-level metrics only
2. **Standard**: Primary metrics with trends
3. **Detailed**: All metrics with context
4. **Debug**: Full state visibility

### Alert Escalation
1. **Normal**: Default styling
2. **Attention**: Yellow dot indicator
3. **Warning**: Amber border pulse
4. **Critical**: Orange glow + sound
5. **Extinction**: Red strobe + modal

### Responsive Breakpoints
- **Mobile** (< 640px): Stack vertically, essential only
- **Tablet** (640-1024px): 2-column, condensed
- **Desktop** (≥ 1024px): Full layout, all features
- **Ultra-wide** (≥ 1536px): Extended panels, multi-monitor

---

## 🚀 Performance Guidelines

### Critical Optimizations
1. **Virtualize** lists over 100 items
2. **Debounce** updates to 60fps max
3. **Memoize** expensive calculations
4. **Lazy load** off-screen panels
5. **Canvas** for complex visualizations
6. **Web Workers** for heavy computations

### Data Limits
- Event log: 1000 entries (virtualized)
- Sparklines: 60 data points max
- Heatmaps: 50×50 grid maximum
- Agent cards: 3-5 visible, rest on demand

---

## ♿ Accessibility Requirements

### Standards
- WCAG AA contrast (4.5:1 minimum)
- Full keyboard navigation
- Screen reader support with ARIA
- Respect `prefers-reduced-motion`
- Alternative text for visualizations

### Implementation
```tsx
// Example accessible component
<Panel
  role="region"
  aria-label="Crisis monitoring dashboard"
  aria-live="polite"
  aria-atomic="false"
>
  <h2 id="crisis-heading">Active Crises</h2>
  <div role="list" aria-labelledby="crisis-heading">
    {/* Crisis items */}
  </div>
</Panel>
```

---

## 📱 Mobile Considerations

### Touch Optimizations
- Minimum touch target: 44×44px
- Swipe gestures for navigation
- Pinch-to-zoom for detailed views
- Bottom sheets for details
- Simplified visualizations

### Performance on Mobile
- Reduce animation complexity
- Limit concurrent data streams
- Progressive loading
- Simplified charts
- Focus on critical metrics

---

## 🎮 Interaction Patterns

### Common Interactions
1. **Click panel** → Navigate to detailed view
2. **Hover metric** → Show tooltip with history
3. **Drag threshold** → Adjust warning levels
4. **Toggle filters** → Update visualizations
5. **Time slider** → Historical/future view

### Keyboard Shortcuts
```
1-9: Quick navigation to screens
Tab: Navigate between panels
Enter: Activate/expand
Esc: Close modal/return to overview
?: Show keyboard shortcuts
```

---

## 🔄 Development Workflow

### Getting Started
1. Review design system document (00_design_system.md)
2. Implement core components first
3. Build Overview dashboard as foundation
4. Add specialized screens progressively
5. Integrate with simulation engine

### Testing Approach
- Component testing with React Testing Library
- Visual regression with Playwright
- Performance profiling with Lighthouse
- Accessibility audit with axe-core
- Real device testing for mobile

---

## 📚 Resources

### Design Inspiration
- Films: Elysium (2013), Arrival (2016), Interstellar (2014)
- Games: Deus Ex UI, EVE Online interfaces
- Real: NASA Mission Control, Bloomberg Terminal

### Technical References
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Recharts](https://recharts.org) or [D3.js](https://d3js.org)
- [React Performance](https://react.dev/learn/render-and-commit)

---

## 🚨 Critical Considerations

### Research Tool, Not Game
- Avoid gamification elements
- Show uncertainty and confidence intervals
- Preserve complexity and nuance
- Research-backed visualizations only

### Edge Cases
- Handle extinction scenarios gracefully
- Show data gaps transparently
- Degrade gracefully on connection loss
- Support wide range of screen sizes

### Future Enhancements
- VR/AR dashboard views
- Voice interface integration
- AI-assisted analysis
- Collaborative viewing sessions
- Custom dashboard layouts

---

## 📄 File Index

| File | Purpose |
|------|---------|
| [00_design_system.md](00_design_system.md) | Core visual language and components |
| [01_overview_screen.md](01_overview_screen.md) | Mission control main dashboard |
| [02_paradigm_view.md](02_paradigm_view.md) | Multi-paradigm DUI visualization |
| [03_ai_agents_screen.md](03_ai_agents_screen.md) | AI population monitoring |
| [04_sleeper_detection.md](04_sleeper_detection.md) | Adversarial detection systems |
| [05_environmental_systems.md](05_environmental_systems.md) | Planetary boundaries tracking |
| [06_crisis_dashboard.md](06_crisis_dashboard.md) | Crisis cascade monitoring |
| [07_technology_tree.md](07_technology_tree.md) | Technology deployment interface |
| [08_population_regions.md](08_population_regions.md) | Regional population dynamics |
| [09_timeline_view.md](09_timeline_view.md) | Event chronology |
| [10_monte_carlo_results.md](10_monte_carlo_results.md) | Statistical analysis dashboard |

---

**Created**: October 2025
**Purpose**: Research simulation dashboard for AI alignment → human flourishing
**Aesthetic**: Far-future sci-fi, impossibly advanced yet functional

This design system enables visualization of 900+ state variables across 40+ subsystems, revealing the complex dynamics between AI development, environmental collapse, social cohesion, and paths to utopia or extinction.