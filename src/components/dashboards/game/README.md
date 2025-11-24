# Game Dashboard Components

## Overview

Far-future aesthetic dashboard components for the Super-Alignment to Utopia game interface. Inspired by films like Elysium, Arrival, and Interstellar - featuring a black background with glowing cyan/blue accents (#00F0FF).

## Components

### GameDashboard
Main dashboard wrapper that orchestrates all sub-components.

**Props:**
- `gameState?: GameStateSnapshot` - Read-only game state snapshot
- `onAdvanceMonth?: () => void` - Callback when advancing simulation
- `onSpeedChange?: (speed: number) => void` - Simulation speed control
- `onModeChange?: (mode: string) => void` - Action mode change (overview/advocacy/research/diplomacy/emergency)
- `onDecisionSelect?: (decisionId: string) => void` - When a pending decision is clicked

### GameDashboardHeader
Top header with title, time display, and action mode selector.

**Features:**
- Game title with letter-spacing aesthetic
- Glowing cyan time display with current month
- Elapsed months counter
- 5 action modes (Overview, Advocacy, Research, Diplomacy, Emergency)

### CurrencyPanel
Left panel showing game currencies and outcome probabilities.

**Displays:**
- Research, Influence, Resources, AI Trust currencies
- Value bars with gradient fill
- Monthly trend indicators (up/down/neutral)
- Trajectory Analysis with outcome probabilities
- Color-coded outcomes (utopia=green, extinction=red)

### PendingDecisions
Central panel showing decisions requiring player input.

**Features:**
- Pulsing amber border for attention
- Urgency levels (critical/important/standard)
- Days remaining countdown
- Impact descriptions
- Hover effects for interactivity

### WorldVisualization
Placeholder for global systems visualization.

**Future features:**
- Interactive world heatmap
- AI agent locations
- Crisis indicators
- Environmental boundaries
- Technology deployment status

### EventStream
Right panel showing event log and next month preview.

**Features:**
- Next month preview with pulsing cyan border
- Color-coded events (critical=red, warning=amber, success=green)
- Scrollable event history
- Warning icons for critical events

### ActionBar
Bottom control bar with simulation controls.

**Features:**
- Speed controls (pause/normal/fast/very fast)
- Main action buttons
- Primary "Advance Month" button with gradient and glow animation

## Styling

### Color Palette
- **Background:** #000000 (pure black)
- **Primary Accent:** #00F0FF (glowing cyan)
- **Secondary Accent:** #0080FF (deeper blue)
- **Success:** #00FF88 (green)
- **Warning:** #FFB000 (amber)
- **Critical:** #FF0040 (red)
- **Neutral:** rgba(255, 255, 255, 0.1-0.6) (various white opacities)

### Visual Effects
- **Glow effects:** Using text-shadow and box-shadow for neon aesthetic
- **Animations:** Pulsing glows (pulseCyan, pulseAmber, pulsePrimary)
- **Transitions:** 0.3s smooth transitions on all interactive elements
- **Typography:** Light font weights (100-300) for futuristic feel

## Usage

```tsx
import { GameDashboard } from '@/components/dashboards/game';

function GamePage() {
  return (
    <GameDashboard
      gameState={simulationState}
      onAdvanceMonth={handleAdvance}
      onDecisionSelect={handleDecision}
    />
  );
}
```

## Demo

View the dashboard at: `/game-dashboard-demo`

## Integration Points

The dashboard is designed to connect with:

1. **Game Layer (`src/game/`):**
   - Reads from `GameStateSnapshot` (read-only)
   - Queues decisions via `DecisionQueue`
   - Observes state changes via observers

2. **Simulation Layer (`src/simulation/`):**
   - Never directly imports or mutates simulation state
   - All influence through PlayerDecisionPhase

3. **Data Flow:**
   ```
   Simulation State → Game Layer → Dashboard Props → UI Components
   User Action → Dashboard Callback → Game Layer → Decision Queue
   ```

## Future Enhancements

- [ ] Connect to real game state instead of mock data
- [ ] Implement WorldVisualization with actual map
- [ ] Add sparkline charts for currency trends
- [ ] Implement decision modal system
- [ ] Add keyboard shortcuts for common actions
- [ ] Add sound effects for critical events
- [ ] Implement save/load UI
- [ ] Add tutorial/onboarding overlay
- [ ] Add accessibility improvements (ARIA labels, keyboard nav)

## Responsive Design

The dashboard adapts to different screen sizes:
- **1400px+:** Full 3-column layout
- **1200-1400px:** Slightly narrower columns
- **<1200px:** Compressed layout with smaller fonts

## Performance Considerations

- Uses CSS modules for style isolation
- Components are memoizable (add React.memo as needed)
- Event list has max-height with scrollbar to prevent DOM bloat
- Animations use CSS rather than JS for better performance
- Consider virtualizing event list if >100 items