# Design System: Far-Future Simulation Dashboard
## Core Visual Language for 2100s Research Interface

### Philosophy
This design system creates a visual language for a research simulation dashboard that feels impossibly advanced yet ruthlessly functional. We draw inspiration from the stark, minimalist interfaces of far-future sci-fi (Elysium, Arrival, Interstellar) while maintaining absolute clarity for complex multi-dimensional data.

**Core Principle**: Every pixel must earn its place through informational value or navigational purpose.

---

## Color Palette

### Primary Colors
```
DEEP BLACK        #000000    Primary background
NEAR BLACK        #0A0A0A    Secondary panels
PURE WHITE        #FFFFFF    Primary text, critical data
```

### Accent Colors (Glowing Effects)
```
CYAN GLOW         #00F0FF    Active states, positive indicators
BLUE GLOW         #0080FF    Secondary active, information
AMBER WARNING     #FFB000    Warning states, attention needed
ORANGE CRITICAL   #FF6B00    Crisis states, urgent attention
RED EXTINCTION    #FF0040    Extinction risks, catastrophic
GREEN SUCCESS     #00FF88    Utopia indicators, positive spirals
EMERALD ALT       #00CC66    Secondary success states
```

### Neutral Tones (Low Opacity)
```
WHITE 10%         #FFFFFF1A  Subtle borders, dividers
WHITE 20%         #FFFFFF33  Secondary text
WHITE 30%         #FFFFFF4D  Inactive elements
WHITE 40%         #FFFFFF66  Hover states
WHITE 60%         #FFFFFF99  Labels, metadata
```

### Paradigm-Specific Colors
```
WESTERN LIBERAL   #00A0FF    Democracy blue
DEVELOPMENT       #00FF88    Growth green
ECOLOGICAL        #00CC66    Nature emerald
INDIGENOUS        #FF8800    Community amber
```

---

## Typography

### Font Stack
```css
font-family: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Type Scale
```
MICRO      10px    font-weight: 400    Metadata, timestamps
CAPTION    11px    font-weight: 400    Secondary labels
BODY       13px    font-weight: 400    Primary text
METRIC     24px    font-weight: 200    Key numbers
DISPLAY    32px    font-weight: 100    Hero metrics
MASSIVE    48px    font-weight: 100    Critical alerts
```

### Text Styles
```css
/* Headers */
.header-primary {
  font-size: 13px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.6);
}

/* Metrics */
.metric-value {
  font-size: 32px;
  font-weight: 200;
  font-variant-numeric: tabular-nums;
  color: #FFFFFF;
}

/* Labels */
.label-secondary {
  font-size: 11px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.4);
}
```

---

## Visual Effects

### Glow System
All interactive and critical elements use CSS glow effects to create a holographic appearance:

```css
/* Subtle glow for panels */
.panel-glow {
  box-shadow:
    0 0 10px rgba(0, 240, 255, 0.1),
    inset 0 0 20px rgba(0, 240, 255, 0.02);
}

/* Strong glow for active elements */
.active-glow {
  box-shadow:
    0 0 20px rgba(0, 240, 255, 0.4),
    0 0 40px rgba(0, 240, 255, 0.2);
  border: 1px solid rgba(0, 240, 255, 0.6);
}

/* Pulsing glow for alerts */
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(255, 107, 0, 0.6); }
  50% { box-shadow: 0 0 40px rgba(255, 107, 0, 0.8); }
}

.alert-pulse {
  animation: pulse-glow 2s ease-in-out infinite;
}
```

### Transitions
All state changes use smooth transitions:

```css
.smooth-transition {
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.fast-transition {
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## Component Patterns

### Panel Structure
```
┌─────────────────────────────────────┐
│ PANEL TITLE                   [···] │  <- Header with actions
├─────────────────────────────────────┤
│                                     │
│         Content Area                │  <- Main content
│                                     │
├─────────────────────────────────────┤
│ Metadata · Updated 2s ago          │  <- Footer (optional)
└─────────────────────────────────────┘
```

### Metric Card
```
┌──────────────┐
│ LABEL        │
│              │
│ 47.3         │  <- Large metric
│ ▅▆▇█▇▆▅      │  <- Sparkline
│ +2.1 (4.6%)  │  <- Change indicator
└──────────────┘
```

### Status Indicator
```
● Active     (green glow)
◐ Warning    (amber pulse)
○ Inactive   (white 30%)
⊗ Error      (red glow)
```

### Data Density Levels
1. **Overview** - Highest level metrics only
2. **Standard** - Primary metrics with trends
3. **Detailed** - All metrics with context
4. **Debug** - Full state visibility

---

## Grid System

### Layout Grid
- **Columns**: 24-column grid
- **Gutters**: 16px
- **Margins**: 24px (desktop), 16px (tablet), 12px (mobile)

### Breakpoints
```css
/* Mobile First */
@media (min-width: 640px)  { /* sm: Tablet */ }
@media (min-width: 768px)  { /* md: Small Desktop */ }
@media (min-width: 1024px) { /* lg: Desktop */ }
@media (min-width: 1280px) { /* xl: Large Desktop */ }
@media (min-width: 1536px) { /* 2xl: Ultra-wide */ }
```

### Panel Sizes
```
MICRO     200px × 120px    Quick stats
SMALL     400px × 240px    Single metric focus
MEDIUM    600px × 360px    Standard panel
LARGE     800px × 480px    Complex visualizations
FULL      100% × 100%       Full-screen takeover
```

---

## Data Visualization Patterns

### Sparklines
Compact trend visualization using Unicode blocks:
```
▁▂▃▄▅▆▇█▇▆▅▄▃▂▁  Normal trend
▁▁▂▃▅▇████████  Exponential growth
████▇▅▃▂▁▁▁▁▁▁  Collapse pattern
```

### Heatmaps
Grid-based intensity visualization:
```
░░░▒▒▒▓▓▓███  Gradient scale
```

### Progress Bars
```
████████░░░░░░░░  50% complete
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  100% (different shade)
```

### Multi-dimensional Radar
For 17-dimensional capability profiles:
```
     Physical
         █
    ████ ████
Digital ████████ Social
    ████ ████
     Economic
```

---

## Interaction States

### Hover
- Border brightens: `border-color: rgba(0, 240, 255, 0.6)`
- Subtle scale: `transform: scale(1.02)`
- Glow intensifies: Additional box-shadow layer

### Active/Selected
- Strong border: `border: 1px solid #00F0FF`
- Background shift: `background: rgba(0, 240, 255, 0.05)`
- Persistent glow effect

### Disabled
- Opacity reduction: `opacity: 0.3`
- No hover effects
- Cursor: `not-allowed`

### Loading
- Skeleton screens with animated gradient
- Pulsing opacity for placeholders
- Spinning indicators for active processes

---

## Alert Hierarchy

### Severity Levels
1. **INFO** - White text, no special styling
2. **SUCCESS** - Green glow (#00FF88)
3. **WARNING** - Amber pulse (#FFB000)
4. **CRITICAL** - Orange strong glow (#FF6B00)
5. **EXTINCTION** - Red strobe effect (#FF0040)

### Alert Patterns
```css
.alert-info { border-left: 2px solid rgba(255,255,255,0.3); }
.alert-success { border-left: 2px solid #00FF88; }
.alert-warning {
  border-left: 2px solid #FFB000;
  animation: pulse-glow 2s infinite;
}
.alert-critical {
  border-left: 2px solid #FF6B00;
  box-shadow: 0 0 30px rgba(255, 107, 0, 0.4);
}
.alert-extinction {
  border-left: 2px solid #FF0040;
  animation: strobe 0.5s infinite;
}
```

---

## Accessibility

### Contrast Requirements
- **Text on Black**: Minimum 4.5:1 (WCAG AA)
- **Interactive Elements**: Minimum 3:1
- **Critical Alerts**: Enhanced to 7:1

### Keyboard Navigation
- All interactive elements accessible via Tab
- Focus indicators: Cyan glow outline
- Skip links for major sections
- Keyboard shortcuts for common actions

### Screen Reader Support
- Semantic HTML structure
- ARIA labels for complex visualizations
- Live regions for real-time updates
- Alternative text for all visual indicators

### Motion Sensitivity
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Component Library

### Core Components
- `MetricCard` - Single metric with sparkline
- `Panel` - Container with header/content/footer
- `Heatmap` - Multi-dimensional grid visualization
- `Timeline` - Chronological event display
- `RadarChart` - Multi-dimensional profile
- `ProgressBar` - Completion/deployment indicator
- `Alert` - Severity-based notification
- `StatusBadge` - Compact status indicator

### Composite Components
- `ParadigmComparison` - 4-paradigm parallel view
- `AIAgentProfile` - Complete agent status
- `CrisisCascade` - Chain reaction visualization
- `TechTree` - Hierarchical technology display
- `OutcomeProjection` - Probability distributions

---

## Performance Guidelines

### Optimization Rules
1. **Virtualize** lists over 100 items
2. **Debounce** updates to 60fps maximum
3. **Memoize** expensive calculations
4. **Lazy load** off-screen panels
5. **Use CSS transforms** for animations (GPU-accelerated)

### Data Limits
- Maximum 1000 events in timeline (virtualized)
- Maximum 100 simultaneous alerts
- Sparklines sample to 60 points
- Heatmaps maximum 50×50 grid

---

## Responsive Behavior

### Mobile (< 640px)
- Stack all panels vertically
- Collapse detailed metrics to summary
- Swipe navigation between screens
- Bottom tab navigation

### Tablet (640px - 1024px)
- 2-column grid maximum
- Condensed metric cards
- Touch-optimized interactions
- Collapsible sidebars

### Desktop (> 1024px)
- Full grid system
- Multiple panels visible
- Hover interactions enabled
- Keyboard shortcuts active

### Ultra-wide (> 1536px)
- Extended dashboard view
- Side-by-side comparisons
- Additional detail panels
- Multi-monitor support

---

## Animation Patterns

### Entrance
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Data Update
```css
@keyframes dataFlash {
  0%, 100% { background: transparent; }
  50% { background: rgba(0, 240, 255, 0.1); }
}
```

### Critical Alert
```css
@keyframes criticalPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 20px rgba(255, 107, 0, 0.6);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 40px rgba(255, 107, 0, 1);
  }
}
```

---

## Example Implementation

### Metric Card Component
```tsx
export function MetricCard({
  title,
  value,
  trend,
  severity = 'neutral',
  change,
  unit
}: MetricCardProps) {
  return (
    <div className="
      bg-black
      border border-white/20
      p-4
      rounded-sm
      hover:border-cyan-400/60
      transition-all duration-300
      shadow-[0_0_10px_rgba(0,240,255,0.1)]
      hover:shadow-[0_0_20px_rgba(0,240,255,0.2)]
    ">
      <h3 className="
        text-white/60
        text-xs
        uppercase
        tracking-wider
        mb-2
      ">
        {title}
      </h3>

      <div className="
        text-white
        text-3xl
        font-light
        tabular-nums
        mb-2
      ">
        {value}
        {unit && (
          <span className="text-base text-white/40 ml-1">
            {unit}
          </span>
        )}
      </div>

      {trend && (
        <div className="mt-2 h-8">
          <Sparkline
            data={trend}
            color={severityToColor(severity)}
          />
        </div>
      )}

      {change && (
        <div className={`
          text-xs
          mt-2
          ${change > 0 ? 'text-green-400' : 'text-red-400'}
        `}>
          {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
        </div>
      )}
    </div>
  );
}
```

---

## Design Tokens

Export as CSS variables for consistent usage:

```css
:root {
  /* Colors */
  --color-black: #000000;
  --color-near-black: #0A0A0A;
  --color-white: #FFFFFF;
  --color-cyan: #00F0FF;
  --color-blue: #0080FF;
  --color-amber: #FFB000;
  --color-orange: #FF6B00;
  --color-red: #FF0040;
  --color-green: #00FF88;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;

  /* Borders */
  --border-subtle: 1px solid rgba(255, 255, 255, 0.1);
  --border-default: 1px solid rgba(255, 255, 255, 0.2);
  --border-active: 1px solid rgba(0, 240, 255, 0.6);

  /* Shadows */
  --shadow-glow-sm: 0 0 10px rgba(0, 240, 255, 0.1);
  --shadow-glow-md: 0 0 20px rgba(0, 240, 255, 0.2);
  --shadow-glow-lg: 0 0 40px rgba(0, 240, 255, 0.4);

  /* Transitions */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 300ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

This design system creates a visual language that feels simultaneously futuristic and functional, worthy of a 2100s interface while maintaining absolute clarity for complex research data.