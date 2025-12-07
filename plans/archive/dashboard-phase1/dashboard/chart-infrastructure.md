# Subplan 0D: Chart Infrastructure

**Phase:** 0 (Foundation)
**Agent Assignment:** Agent 4
**Duration:** 2-3 days
**Priority:** CRITICAL (visualization foundation)
**Dependencies:** Subplan 0A complete (design system)

---

## Context

**CRITICAL ARCHITECTURE CHANGE:** Use Visx (complex) + Chart.js (simple) + WebGL (heatmaps), NOT just Recharts.

### Why NOT Just Recharts

**From Architecture Review (CRITICAL Issue #3):**
> "Recharts cannot handle:
> - Violin plots (no support)
> - 40+ simultaneous charts
> - 2,400 data points per visualization"

### Chart Library Strategy

- **Visx:** Complex charts (violin plots, small multiples, capability matrix)
- **Chart.js:** Simple charts (sparklines, bar charts, line charts)
- **D3 + WebGL:** Heatmaps (20 agents × 17 dimensions)

---

## Implementation Tasks

### Step 1: Install Dependencies
```bash
npm install @visx/visx chart.js react-chartjs-2 d3
npm install --save-dev @types/d3
```

### Step 2: Create Chart Wrappers

**Violin Plot (Visx):**
```typescript
// src/components/charts/ViolinPlot.tsx
import { ViolinPlot as VisxViolin } from '@visx/stats';

interface ViolinPlotProps {
  data: Array<{ value: number; count: number }>;
  width: number;
  height: number;
  color?: string;
}

export function ViolinPlot({ data, width, height, color = 'cyan' }: ViolinPlotProps) {
  // Visx violin plot implementation
}
```

**Bar Chart (Chart.js):**
```typescript
// src/components/charts/BarChart.tsx
import { Bar } from 'react-chartjs-2';

interface BarChartProps {
  data: number[];
  labels: string[];
  color?: string;
}

export function BarChart({ data, labels, color }: BarChartProps) {
  // Chart.js bar chart
}
```

**Line Chart (Chart.js):**
```typescript
// src/components/charts/LineChart.tsx
import { Line } from 'react-chartjs-2';

interface LineChartProps {
  data: number[];
  labels?: string[];
}

export function LineChart({ data, labels }: LineChartProps) {
  // Chart.js line chart (sparkline variant)
}
```

**Capability Matrix Heatmap (D3 + Canvas):**
```typescript
// src/components/charts/CapabilityMatrix.tsx
import * as d3 from 'd3';

interface CapabilityMatrixProps {
  agents: Array<{ id: string; capabilities: Record<string, number> }>;
  dimensions: string[];
}

export function CapabilityMatrix({ agents, dimensions }: CapabilityMatrixProps) {
  // D3 + Canvas heatmap (20 × 17 grid)
}
```

**Small Multiples (Visx):**
```typescript
// src/components/charts/SmallMultiples.tsx

interface SmallMultiplesProps {
  data: Array<{ label: string; values: number[] }>;
  chartType: 'line' | 'bar';
}

export function SmallMultiples({ data, chartType }: SmallMultiplesProps) {
  // Grid of small charts for regional comparison
}
```

---

## Acceptance Criteria

✅ Visx installed and working
✅ Chart.js installed and working
✅ D3 installed for heatmap utilities
✅ ViolinPlot component renders distributions
✅ BarChart, LineChart components work
✅ CapabilityMatrix renders 20×17 heatmap
✅ SmallMultiples renders grid layout
✅ Responsive sizing utilities created
✅ Design system colors applied to charts

---

## Deliverables

**Files:**
- `src/components/charts/ViolinPlot.tsx` (~150 lines)
- `src/components/charts/BarChart.tsx` (~80 lines)
- `src/components/charts/LineChart.tsx` (~80 lines)
- `src/components/charts/CapabilityMatrix.tsx` (~200 lines)
- `src/components/charts/SmallMultiples.tsx` (~120 lines)
- `src/components/charts/index.ts` (re-exports)

---

**Last Updated:** October 22, 2025
