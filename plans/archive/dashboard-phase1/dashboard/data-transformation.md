# Subplan 0F: Data Transformation Layer

**Phase:** 0 (Foundation)
**Agent Assignment:** Agent 6
**Duration:** 1-2 days
**Priority:** MEDIUM (utilities)
**Dependencies:** Phase -1 complete (API response schemas defined)

---

## Context

Create utilities to transform API responses into UI-ready formats.

---

## Utilities to Implement

### 1. Number Formatting
```typescript
// src/lib/formatters/numbers.ts

export function formatLargeNumber(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toFixed(0);
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}
```

### 2. Time Series Transformers
```typescript
// src/lib/transformers/timeSeries.ts

export function apiToChartData(apiData: number[]): ChartData {
  return {
    labels: apiData.map((_, i) => `Month ${i}`),
    datasets: [{ data: apiData }],
  };
}
```

### 3. Color Scale Generators
```typescript
// src/lib/utils/colorScales.ts

export function getStatusColor(value: number, thresholds: { warning: number; critical: number }) {
  if (value >= thresholds.critical) return 'var(--color-danger)';
  if (value >= thresholds.warning) return 'var(--color-warning)';
  return 'var(--color-success)';
}
```

### 4. Threshold Calculators
```typescript
// src/lib/utils/thresholds.ts

export function checkThreshold(
  current: number,
  threshold: number,
  direction: 'above' | 'below'
): 'normal' | 'warning' | 'critical' {
  // Implementation
}
```

---

## Acceptance Criteria

✅ Number formatters work (2.5B, 67.3%)
✅ Time series transformers convert API → chart format
✅ Color scale generators return correct CSS variables
✅ Threshold calculators classify status correctly
✅ All functions have TypeScript types
✅ Unit tests pass for formatters

---

## Deliverables

**Files:**
- `src/lib/formatters/numbers.ts` (~50 lines)
- `src/lib/transformers/timeSeries.ts` (~80 lines)
- `src/lib/utils/colorScales.ts` (~60 lines)
- `src/lib/utils/thresholds.ts` (~40 lines)

---

**Last Updated:** October 22, 2025
