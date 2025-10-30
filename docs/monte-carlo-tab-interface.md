# Monte Carlo Tab Interface

**Location:** `/src/app/monte-carlo/page.tsx`
**Status:** ✅ Implemented (2025-10-30)

## Overview

The Monte Carlo page now features a unified 3-tab interface that guides users through the complete workflow: configuration → progress tracking → comprehensive analysis.

## Tab Structure

### Tab 1: Configure

**Purpose:** Set up parameter sweeps and start batch execution

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ [Enhanced Config Toggle]                                │
│                                                          │
│ LEFT COLUMN (1/3 width):                                 │
│   - EnhancedParameterConfig OR MonteCarloConfigPanel   │
│   - Parameter selection with checkboxes                 │
│   - Value arrays for each parameter                     │
│   - Seed count configuration                            │
│   - "Start Sweep" button                                │
│                                                          │
│ RIGHT COLUMN (2/3 width):                                │
│   - Getting Started guide                               │
│   - Enhanced Configuration info                         │
│   - Current Batch Status (if active)                    │
└─────────────────────────────────────────────────────────┘
```

**Key Features:**
- Toggle between Enhanced Config (comprehensive) and Basic Config (quick sweeps)
- Real-time calculation of total simulations
- Clear workflow instructions
- Visual feedback on batch status

**Visual Design:**
- Cyan glowing borders for active config mode
- Far-future aesthetic with low-opacity panels
- Clear hierarchy with section headers

---

### Tab 2: Progress

**Purpose:** Real-time monitoring of running batches

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ LIVE PROGRESS PANEL:                                     │
│   - Overall progress bar (completed/total)              │
│   - Running simulations count                           │
│   - Estimated time remaining                            │
│   - Cancel button                                       │
│                                                          │
│ BATCH PROGRESS TRACKER:                                  │
│   - Detailed per-run status                             │
│   - Error tracking                                      │
│   - Performance metrics                                 │
└─────────────────────────────────────────────────────────┘
```

**Auto-Switch Behavior:**
- When user clicks "Start Sweep", automatically switches to Progress tab
- Tab shows "Running" badge when batch is active
- Empty state with "Go to Configure" button when no active batch

**Visual Design:**
- Cyan glowing progress bars
- Pulsing animation for active simulations
- Real-time updates via MonteCarloContext

---

### Tab 3: Analysis

**Purpose:** Comprehensive visualization of completed results

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ TOP ROW (2-column grid):                                 │
│   ┌──────────────────────┬──────────────────────┐      │
│   │ OutcomeDistribution  │ TimelineAnalysis     │      │
│   │ - 7-tier pie chart   │ - Survival curves    │      │
│   │ - Interactive legend │ - Histograms         │      │
│   └──────────────────────┴──────────────────────┘      │
│                                                          │
│ MIDDLE ROW (2-column grid):                              │
│   ┌──────────────────────┬──────────────────────┐      │
│   │ CriticalEventsStream │ EventTypeBreakdown   │      │
│   │ - Real-time feed     │ - Statistical summary│      │
│   │ - Severity-coded     │ - Bar charts         │      │
│   └──────────────────────┴──────────────────────┘      │
│                                                          │
│ PARAMETER SWEEP COMPARISON (full width):                 │
│   - Only shown if sweep exists                          │
│   - Comparative outcome analysis                        │
│   - Sensitivity charts                                  │
│                                                          │
│ RUN INSPECTOR (expandable):                              │
│   - Individual run deep-dive                            │
│   - Event timeline                                      │
│   - State snapshots                                     │
│                                                          │
│ SWEEP RESULTS PANEL (legacy):                            │
│   - Maintained for backward compatibility               │
└─────────────────────────────────────────────────────────┘
```

**Tab State Management:**
- Disabled until batch has results (`hasResults = true`)
- Shows "Ready" badge when results available
- Empty state with "Start New Sweep" button when no results

**Visual Design:**
- 2×2 grid for top panels (outcomes, timeline, events, breakdown)
- Full-width parameter sweep comparison (if applicable)
- Expandable run inspector at bottom
- All panels use consistent far-future aesthetic

---

## Tab Behavior

### Tab Navigation

**Visual Indicators:**
- **Active tab:** Cyan glow (`shadow-[0_0_20px_rgba(0,240,255,0.4)]`), cyan border-bottom
- **Inactive tab:** White/60 opacity, transparent border
- **Disabled tab:** White/20 opacity, cursor-not-allowed
- **Tab badges:** Glowing pills showing status ("Running", "Ready")

**Smooth Transitions:**
- 300ms duration for all tab switches
- Content fades in/out gracefully
- No jarring layout shifts

### Automatic State Management

**Auto-switch to Progress:**
```typescript
useEffect(() => {
  if (isRunning && activeTab === 'configure') {
    setActiveTab('progress')
  }
}, [isRunning, activeTab])
```

**Auto-load results:**
```typescript
useEffect(() => {
  if (aggregateStats && progress && !isRunning) {
    loadBatchResults(progress.batchId)
  }
}, [aggregateStats, progress, isRunning])
```

**Tab enablement:**
```typescript
const hasResults = aggregateStats !== null && runResults.size > 0
const canViewAnalysis = hasResults
```

---

## Data Flow

### From MonteCarloContext

**State consumed:**
- `isRunning` → Progress tab badge, auto-switch behavior
- `progress` → LiveProgressPanel, BatchProgressTracker
- `aggregateStats` → All analysis panels
- `sweepConfig` → Configuration panels

**Actions dispatched:**
- `startSweep()` → Begins batch execution
- `setSweepConfig()` → Updates sweep parameters

### Result Loading

**Automatic loading:**
1. Batch completes → `aggregateStats` becomes non-null
2. `loadBatchResults()` fetches JSON files from `/monteCarloOutputs/`
3. Parses up to 100 run files (run_SEED_events.json)
4. Extracts critical events (severity: destructive/high)
5. Builds `runResults` Map and `criticalEvents` array

**Derived metrics:**
- `outcomeBreakdown` → 7-tier outcome counts (useMemo)
- `eventTypeStats` → Aggregated event type counts (useMemo)

---

## Component Architecture

### Main Component Hierarchy

```
MonteCarloPage
└─ MonteCarloProvider (context)
   └─ MonteCarloPageContent
      ├─ TabButton × 3 (Configure, Progress, Analysis)
      ├─ Configure Tab Content
      │  ├─ EnhancedParameterConfig
      │  ├─ MonteCarloConfigPanel
      │  └─ Info Panels
      ├─ Progress Tab Content
      │  ├─ LiveProgressPanel
      │  └─ BatchProgressTracker
      └─ Analysis Tab Content
         ├─ OutcomeDistributionPanel
         ├─ TimelineAnalysisPanel
         ├─ CriticalEventsStream
         ├─ EventTypeBreakdownPanel
         ├─ ParameterSweepComparison (conditional)
         ├─ RunInspector
         └─ SweepResultsPanel (legacy)
```

### Panel Imports

**New analysis panels (from `/components/monte-carlo/panels/`):**
- `LiveProgressPanel` - Enhanced progress tracking
- `OutcomeDistributionPanel` - Interactive 7-tier pie chart
- `TimelineAnalysisPanel` - Survival curves + histograms
- `CriticalEventsStream` - Real-time event feed
- `EventTypeBreakdownPanel` - Event statistics
- `ParameterSweepComparison` - Enhanced sensitivity analysis
- `RunInspector` - Individual run deep-dive

**Existing components (retained):**
- `MonteCarloConfigPanel` - Basic configuration
- `EnhancedParameterConfig` - Comprehensive parameter selection
- `BatchProgressTracker` - Legacy progress tracking
- `SweepResultsPanel` - Legacy results display

---

## Responsive Design

### Breakpoints

**Desktop (lg: 1024px+):**
- Configure tab: 1/3 config + 2/3 info layout
- Analysis tab: 2-column grid for panels

**Mobile (<1024px):**
- Configure tab: Single column, stacked vertically
- Analysis tab: Single column, panels stack

**Ultra-wide (1800px+):**
- Max width: 1800px (prevents excessive stretching)
- Centered content with symmetrical margins

---

## Keyboard Navigation

**Tab switching:**
- `Tab` key cycles through tab buttons
- `Enter` or `Space` activates selected tab

**Disabled tabs:**
- Cannot be focused when disabled
- Visual feedback (grayed out, no hover state)

---

## Accessibility

**ARIA labels:**
- Tab buttons have implicit role="tab"
- Tab panels have role="tabpanel"
- Disabled state communicated via `aria-disabled="true"`

**Keyboard support:**
- All interactive elements keyboard-accessible
- Focus visible with glowing borders
- No keyboard traps

**Screen reader support:**
- Tab badges announce status ("Running batch", "Results ready")
- Progress updates announce completion percentages
- Error states clearly announced

---

## Performance Optimizations

**useMemo for derived metrics:**
```typescript
const outcomeBreakdown = useMemo(() => {
  // Recalculate only when runResults changes
}, [runResults])

const eventTypeStats = useMemo(() => {
  // Recalculate only when runResults changes
}, [runResults])
```

**Conditional rendering:**
- Only render active tab content
- Lazy load results when tab activated
- Avoid re-rendering hidden tabs

**Efficient result loading:**
- Fetch JSON files in sequence (no parallel burst)
- Stop loading on first 404 (assumes contiguous seeds)
- Extract only critical events (severity filter)

---

## Future Enhancements

**Potential additions:**
1. **Batch history:** Browse past batches from sidebar
2. **Export results:** Download aggregate stats as CSV/JSON
3. **Live charts:** Real-time outcome distribution updates during run
4. **Comparison mode:** Side-by-side comparison of multiple batches
5. **Preset configs:** Save/load parameter sweep templates
6. **Parallel batches:** Monitor multiple running batches simultaneously

**Known limitations:**
1. Cancel batch not yet implemented (shows console.log only)
2. Result loading assumes contiguous seed ranges
3. No pagination for large result sets (>100 runs)
4. Manual refresh required if files appear after page load

---

## Files Modified

**Created:**
- `/docs/monte-carlo-tab-interface.md` (this file)

**Modified:**
- `/src/app/monte-carlo/page.tsx` - Complete rewrite with 3-tab interface

**Removed:**
- `/src/app/monte-carlo/results/page.tsx` - Functionality integrated into main page

**Dependencies (unchanged):**
- `/src/components/monte-carlo/panels/*.tsx` - All 7 new panel components
- `/src/lib/contexts/MonteCarloContext.tsx` - State management
- `/src/lib/MonteCarloManager.ts` - Backend coordination

---

## Testing Checklist

**Manual testing:**
- [ ] Configure tab shows both config modes (enhanced/basic)
- [ ] Start sweep auto-switches to Progress tab
- [ ] Progress tab shows "Running" badge during execution
- [ ] Analysis tab disabled until results available
- [ ] Analysis tab shows "Ready" badge when results loaded
- [ ] All 7 panels render correctly on Analysis tab
- [ ] Tab switching smooth (300ms transitions)
- [ ] Empty states show correct "Go to..." buttons
- [ ] Responsive layout works on mobile (stacked panels)
- [ ] Keyboard navigation works (Tab, Enter, Space)

**Integration testing:**
- [ ] MonteCarloContext state updates reflected in all tabs
- [ ] Result loading completes for batches with 10/50/100 runs
- [ ] Critical events extracted correctly (severity filter)
- [ ] Outcome breakdown calculates correct percentages
- [ ] Parameter sweep comparison shows only when sweep exists

**Edge cases:**
- [ ] No results: Analysis tab shows empty state
- [ ] No sweep: ParameterSweepComparison hidden
- [ ] Batch cancelled mid-run: Progress tab handles gracefully
- [ ] Page refresh during batch: State recovered from context
- [ ] Missing JSON files: Loading stops without errors

---

## Design Philosophy

This tab interface embodies the **far-future UX aesthetic** of the project:

**Visual Language:**
- **Black & white foundation:** Deep black (#000000) with pure white text
- **Glowing accents:** Cyan (#00F0FF) for active states, shadows for depth
- **Thin, elegant typography:** Light font weights, generous whitespace
- **Minimal borders:** Subtle white/10-20 opacity dividers
- **Smooth animations:** 200-400ms transitions, glowing pulses

**Information Architecture:**
- **Progressive disclosure:** Summary → details → deep-dive
- **Contextual guidance:** Empty states guide users to next action
- **Real-time feedback:** Badges, progress bars, live event streams
- **High data density:** Multiple panels visible without clutter

**Interaction Patterns:**
- **Automatic state management:** System infers next action (auto-switch tabs)
- **Clear affordances:** Buttons glow on hover, disabled states unambiguous
- **Keyboard-first:** All actions accessible without mouse
- **Responsive by default:** Mobile-first, scales to ultrawide

This design enables researchers to **perceive the invisible** - tracking 900+ state variables across hundreds of simulations through an interface that feels effortlessly advanced while remaining ruthlessly functional.

---

**Last updated:** 2025-10-30
**Author:** far-future-ux-designer agent
**Related docs:**
- `/docs/FRONTEND_ROADMAP.md`
- `/src/components/monte-carlo/panels/README.md` (if exists)
- `/docs/wiki/README.md` (system documentation)
