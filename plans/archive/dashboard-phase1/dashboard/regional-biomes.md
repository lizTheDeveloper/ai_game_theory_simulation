# Regional Biome Visualization (Oct 22, 2025)

**Phase:** 3A Extension (Environmental Dashboard)
**Duration:** 2-4 hours
**Dependencies:**
- API endpoint `/api/dashboard/environment` with regional biome data
- Base components (MetricCard, Panel)
- Chart infrastructure (BarChart, SmallMultiples)

## Context

As of October 22, 2025, the simulation now tracks land use and biodiversity at **regional granularity** with 4 distinct biomes:

1. **Tropical** (Amazon, Congo, SE Asia) - 50% of global biodiversity
2. **Temperate** (N America, Europe, E Asia) - 20% of biodiversity
3. **Grasslands** (Savanna, prairie, steppe) - 20% of biodiversity
4. **Boreal/Arctic** (Taiga, tundra) - 10% of biodiversity

Each region has independent habitat cover, extinction rates, ecosystem collapse risk, and restoration dynamics. The frontend must surface these regional differences to show where biodiversity crises are concentrated.

## Research Backing

- **IPBES (2024):** 50% of all species live in tropical rainforests
- **FAO (2025):** Regional forest cover varies dramatically (65% tropical vs 75% boreal)
- **Moreno-Mateos et al. (2017):** Restoration difficulty varies 2x between biomes
- **Bennett et al. (2017):** Tropical ecosystems are most fragile (30% habitat loss triggers collapse vs 45% in boreal)

## User Requirements

**From user feedback (Oct 22, 2025):**
> "We also need a way to show regions and their sub-scores because we're going to show this in the front-end."

**Key needs:**
- Show regional variation (not just global averages)
- Highlight which biomes are in crisis
- Make biodiversity weighting clear (tropical matters most)
- Allow drill-down from global to regional

## Data Structure

### API Response (from `/api/dashboard/environment`)

```typescript
interface EnvironmentDashboardData {
  boundaries: PlanetaryBoundary[];
  landUse: {
    global: {
      habitatCover: number;           // 39.8% weighted average
      extinctionRate: number;         // 137x weighted by biodiversity
      ecosystemsLost: number;         // Total across all regions
      carbonSinkLoss: number;         // 17% climate acceleration
    };
    regions: {
      tropical: RegionalBiomeStats;
      temperate: RegionalBiomeStats;
      grasslands: RegionalBiomeStats;
      borealArctic: RegionalBiomeStats;
    };
  };
}

interface RegionalBiomeStats {
  // Core metrics
  habitatCoverPercent: number;      // [0, 100] Current habitat cover
  habitatCoverSafe: number;         // [0, 100] Safe threshold
  extinctionRate: number;           // [1, 1000] x natural baseline
  ecosystemsLost: number;           // Count of collapsed ecosystems
  ecosystemCollapseRisk: number;    // [0, 1] Risk of further collapse

  // Metadata
  biodiversityWeight: number;       // [0, 1] Contribution to global extinction
  restorationDifficulty: number;    // [0.5, 2.0] How hard to restore
}
```

## Component Architecture

### 1. RegionalBiomesPanel (Main Container)

**Location:** `src/components/dashboards/environmental/RegionalBiomesPanel.tsx`

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Regional Biome Breakdown                                   │
│  Global: 39.8% habitat, 137x extinction, 0 ecosystems lost │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────┐│
│  │  Tropical   │ │  Temperate  │ │ Grasslands  │ │ Boreal ││
│  │  (50% bio)  │ │  (20% bio)  │ │  (20% bio)  │ │(10%)   ││
│  ├─────────────┤ ├─────────────┤ ├─────────────┤ ├────────┤│
│  │ 65% habitat │ │ 45% habitat │ │ 35% habitat │ │75% hab ││
│  │ ████████░░  │ │ ████▓░░░░░  │ │ ███▓░░░░░░  │ │██████░││
│  │ 200x extinct│ │  50x extinct│ │ 120x extinct│ │30x ext ││
│  │ 🔴 CRISIS   │ │ 🟡 WARNING  │ │ 🔴 CRISIS   │ │🟢 SAFE ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └────────┘│
└─────────────────────────────────────────────────────────────┘
```

**Props:**
```typescript
interface RegionalBiomesPanelProps {
  landUse: LandUseData;
  className?: string;
}
```

**Responsibilities:**
- Render 4 regional biome cards
- Show global aggregation at top
- Color-code by severity
- Handle click interaction → drill-down

### 2. BiomeCard (Individual Biome)

**Location:** `src/components/dashboards/environmental/BiomeCard.tsx`

**Visual Design:**
- **Background:** Black with cyan glow border (severity-based)
- **Typography:** Inter ultra-light for labels, JetBrains Mono for numbers
- **Colors:**
  - Green border: extinction <50x
  - Amber border: extinction 50-150x
  - Red border: extinction >150x
- **Animations:** Smooth 300ms transitions on hover

**Layout:**
```
┌─────────────────────────┐
│  Tropical Rainforest    │
│  🌴 50% biodiversity    │  <- Badge with weight
├─────────────────────────┤
│  Habitat Cover          │
│  65.0% / 80.0% safe     │
│  ████████░░░░░░░░░░     │  <- Progress bar
│                         │
│  Extinction Rate        │
│  200x natural (2.0x↑)   │  <- Trend arrow
│                         │
│  Collapse Risk          │
│  50% 🔴                 │  <- Color-coded
│                         │
│  Ecosystems Lost        │
│  0 💀                   │
│                         │
│  Restoration            │
│  2.0x difficulty 🔴     │  <- Hardest to restore
└─────────────────────────┘
```

**Props:**
```typescript
interface BiomeCardProps {
  biome: 'tropical' | 'temperate' | 'grasslands' | 'borealArctic';
  data: RegionalBiomeStats;
  onClick?: () => void;
}
```

### 3. BiomeDetailPanel (Drill-Down)

**Location:** `src/components/dashboards/environmental/BiomeDetailPanel.tsx`

**Trigger:** Click on BiomeCard

**Content:**
- **12-month trend:** Habitat cover over time (line chart)
- **Extinction trajectory:** Extinction rate over time (line chart)
- **Collapse events:** Timeline of ecosystem collapses
- **Restoration efforts:** Active technologies in this region
- **Key species:** Example threatened species (if available)

**Layout:** Side panel slides in from right (300ms animation)

## Visual Encoding Rules

### Extinction Rate Severity

```typescript
function getExtinctionSeverity(rate: number): 'safe' | 'warning' | 'critical' {
  if (rate < 50) return 'safe';      // Green
  if (rate < 150) return 'warning';  // Amber
  return 'critical';                 // Red
}
```

### Habitat Cover Progress Bar

```typescript
function getHabitatColor(current: number, safe: number): string {
  const ratio = current / safe;
  if (ratio >= 0.9) return 'green';   // Near safe threshold
  if (ratio >= 0.7) return 'amber';   // Moderate deficit
  return 'red';                       // Severe deficit
}
```

### Biodiversity Weight Badge

```typescript
const badges = {
  tropical: '🌴 50% biodiversity',
  temperate: '🌲 20% biodiversity',
  grasslands: '🌾 20% biodiversity',
  borealArctic: '🌲 10% biodiversity',
};
```

## Implementation Tasks

### Task 1: Create RegionalBiomesPanel Component (1 hour)

**File:** `src/components/dashboards/environmental/RegionalBiomesPanel.tsx`

**Steps:**
1. Create component skeleton with Panel wrapper
2. Fetch land use data from `/api/dashboard/environment`
3. Map over 4 regions and render BiomeCard for each
4. Add global aggregation header
5. Style with Tailwind (responsive grid)

**Acceptance Criteria:**
- ✅ Shows 4 regional biome cards
- ✅ Global metrics displayed at top
- ✅ Responsive grid (2x2 on mobile, 4x1 on desktop)

### Task 2: Create BiomeCard Component (1.5 hours)

**File:** `src/components/dashboards/environmental/BiomeCard.tsx`

**Steps:**
1. Create card layout with header, metrics, progress bars
2. Add biodiversity weight badge
3. Implement severity color coding (border glow)
4. Add hover effects (scale 1.02, brighter glow)
5. Add click handler for drill-down
6. Format numbers (65.0%, 200x, 50%)

**Acceptance Criteria:**
- ✅ Displays 6 metrics per biome
- ✅ Color-coded by extinction severity
- ✅ Smooth hover animations
- ✅ Accessible (keyboard navigation, ARIA labels)

### Task 3: Create BiomeDetailPanel Component (1 hour)

**File:** `src/components/dashboards/environmental/BiomeDetailPanel.tsx`

**Steps:**
1. Create slide-in panel (300ms transition)
2. Add 12-month trend line charts
3. Show ecosystem collapse timeline
4. List active restoration technologies
5. Add close button (X) and ESC key handler
6. Click-outside to close

**Acceptance Criteria:**
- ✅ Smooth slide animation from right
- ✅ Shows historical trends (12 months)
- ✅ Closes on ESC, click-outside, or X button

### Task 4: Integrate into Environmental Dashboard (30 min)

**File:** `src/components/dashboards/EnvironmentalDashboard.tsx`

**Steps:**
1. Import RegionalBiomesPanel
2. Add below planetary boundaries section
3. Connect to API data
4. Handle loading/error states

**Acceptance Criteria:**
- ✅ RegionalBiomesPanel renders in Environmental Dashboard
- ✅ Data flows from API correctly
- ✅ Loading spinner while fetching

### Task 5: API Endpoint Implementation (30 min)

**File:** `src/app/api/dashboard/environment/route.ts`

**Steps:**
1. Extract regional biome data from GameState
2. Transform to RegionalBiomeStats interface
3. Calculate global aggregates
4. Return JSON with proper types

**Acceptance Criteria:**
- ✅ Returns regional biome data in correct format
- ✅ Global aggregation matches weighted calculations
- ✅ Response time <100ms

## Testing Strategy

### Unit Tests

**File:** `src/components/dashboards/environmental/__tests__/RegionalBiomesPanel.test.tsx`

```typescript
describe('RegionalBiomesPanel', () => {
  it('renders 4 regional biome cards', () => {
    render(<RegionalBiomesPanel landUse={mockData} />);
    expect(screen.getAllByRole('article')).toHaveLength(4);
  });

  it('shows global aggregation header', () => {
    render(<RegionalBiomesPanel landUse={mockData} />);
    expect(screen.getByText(/Global:/)).toBeInTheDocument();
  });

  it('color-codes by extinction severity', () => {
    render(<RegionalBiomesPanel landUse={mockData} />);
    const tropicalCard = screen.getByText('Tropical Rainforest').closest('article');
    expect(tropicalCard).toHaveClass('border-red-500'); // 200x extinction = critical
  });
});
```

### Integration Tests

**File:** `src/components/dashboards/environmental/__tests__/BiomeDetailPanel.test.tsx`

```typescript
describe('BiomeDetailPanel', () => {
  it('opens on card click', async () => {
    render(<RegionalBiomesPanel landUse={mockData} />);
    const tropicalCard = screen.getByText('Tropical Rainforest');
    fireEvent.click(tropicalCard);

    await waitFor(() => {
      expect(screen.getByText(/12-Month Trend/)).toBeInTheDocument();
    });
  });

  it('closes on ESC key', async () => {
    // ... test ESC key handler
  });
});
```

## Performance Considerations

### Optimization 1: Memoization

```typescript
const BiomeCard = React.memo(({ biome, data, onClick }: BiomeCardProps) => {
  // ... component implementation
}, (prevProps, nextProps) => {
  // Only re-render if data changed
  return prevProps.data.extinctionRate === nextProps.data.extinctionRate &&
         prevProps.data.habitatCoverPercent === nextProps.data.habitatCoverPercent;
});
```

### Optimization 2: Lazy Loading Detail Panel

```typescript
const BiomeDetailPanel = React.lazy(() => import('./BiomeDetailPanel'));

// Use with Suspense
<Suspense fallback={<LoadingSpinner />}>
  {selectedBiome && <BiomeDetailPanel biome={selectedBiome} />}
</Suspense>
```

### Optimization 3: Virtual Scrolling (if >4 regions in future)

Currently not needed (only 4 regions), but if expanded to 15+ countries:
```typescript
import { FixedSizeGrid } from 'react-window';
```

## Accessibility Requirements

### WCAG AA Compliance

**Color Contrast:**
- Red border on black: 4.5:1 minimum
- Amber border on black: 4.5:1 minimum
- Text labels: 7:1 (ultra-light Inter on black)

**Keyboard Navigation:**
- Tab through biome cards
- Enter to open detail panel
- ESC to close detail panel
- Arrow keys to navigate within detail panel

**Screen Readers:**
```typescript
<article
  role="article"
  aria-label={`${biomeName} biodiversity status: ${severity}`}
  aria-describedby={`${biome}-description`}
>
  <h3 id={`${biome}-description`}>
    {habitatCover}% habitat cover, {extinctionRate}x extinction rate
  </h3>
  {/* ... */}
</article>
```

## Design System Integration

### Tokens (from `/designs/00_design_system.md`)

```css
/* Biome card borders */
--biome-safe: theme('colors.green.500');      /* <50x extinction */
--biome-warning: theme('colors.amber.500');   /* 50-150x */
--biome-critical: theme('colors.red.500');    /* >150x */

/* Glow effects */
--glow-safe: 0 0 20px rgba(34, 197, 94, 0.3);
--glow-warning: 0 0 20px rgba(245, 158, 11, 0.3);
--glow-critical: 0 0 20px rgba(239, 68, 68, 0.3);

/* Typography */
--font-display: 'Inter', sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

### Component Styling

```tsx
<Panel className="bg-black border-2 border-cyan-400/30 hover:border-cyan-400/60 transition-all duration-300">
  <div className="space-y-4">
    {/* Biodiversity badge */}
    <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40">
      🌴 50% biodiversity
    </Badge>

    {/* Progress bar */}
    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-green-500 to-green-400"
        style={{ width: `${habitatPercent}%` }}
      />
    </div>
  </div>
</Panel>
```

## Deliverables

### Components
- ✅ `RegionalBiomesPanel.tsx` - Main container
- ✅ `BiomeCard.tsx` - Individual biome card
- ✅ `BiomeDetailPanel.tsx` - Drill-down side panel

### API
- ✅ `GET /api/dashboard/environment` with regional biome data

### Tests
- ✅ Unit tests for all components
- ✅ Integration tests for drill-down interaction
- ✅ Accessibility tests (keyboard nav, screen reader)

### Documentation
- ✅ Component API docs (Storybook)
- ✅ Design system integration notes
- ✅ Usage examples

## Future Enhancements

### Phase 2 (Future)
- **Time series:** 12-month sparklines per region
- **Comparison mode:** Side-by-side comparison of 2 regions
- **Projections:** Forecast next 24 months based on current trends
- **Technology impact:** Highlight which technologies affect which regions

### Phase 3 (Future)
- **Geographic map:** Actual world map with biome overlays
- **Species examples:** Show iconic threatened species per region
- **Restoration timeline:** Estimated years to recovery
- **Interactive scenarios:** "What if we invest in tropical restoration?"

## Coordination

**Check-in Channel:** `.claude/chatroom/channels/implementation.md`

**Status Updates:**
- ✅ Task 1 complete → Post progress
- ✅ Task 2 complete → Post progress
- ✅ All tasks done → Handoff to integration

**Blockers:**
- If API endpoint doesn't return regional data → Alert in coordination channel
- If design tokens missing → Alert far-future-ux-designer agent

## References

**Research:**
- `research/regional_biomes_research.md` (Oct 22, 2025)
- `devlogs/20251022_habitat_restoration_rewilding.md`

**Design Spec:**
- `docs/design/dashboard-redesign-spec.md`
- `/designs/00_design_system.md`

**Architecture:**
- `reviews/dashboard_architecture_20251022.md`

**Implementation:**
- `src/simulation/planetaryBoundaries.ts` (regional biome logic)
- `src/types/planetaryBoundaries.ts` (RegionalBiome interface)

---

**Last Updated:** October 22, 2025
**Status:** Ready for implementation
**Estimated Duration:** 2-4 hours
