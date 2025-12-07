# Subplan 1B: Critical Metrics Row

**Phase:** 1 (Mission Control)
**Agent Assignment:** Agent 2
**Duration:** 1-2 days
**Priority:** HIGH
**Dependencies:** Phase 0 complete, Phase -1C complete (critical-metrics API)

---

## Context

Display 4 critical metrics at the top of Mission Control:
1. Global Population (with alert if <2B)
2. Quality of Life (tier distribution, NOT just single number)
3. AI Capability (distribution of 20 agents)
4. Alignment Score (distribution of 20 agents)

### API Endpoint
`/api/dashboard/critical-metrics` (Subplan -1C)

---

## Implementation

### 1. Critical Metrics Row
```typescript
// src/components/dashboard/CriticalMetricsRow.tsx

export function CriticalMetricsRow() {
  const { data, isLoading } = useCriticalMetrics();

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="grid grid-cols-4 gap-6 mb-8">
      <PopulationCard data={data.population} />
      <QualityOfLifeCard data={data.qualityOfLife} />
      <AICapabilityCard data={data.aiCapability} />
      <AlignmentCard data={data.alignment} />
    </div>
  );
}
```

### 2. Population Card
```typescript
// With status alert if <2B

interface PopulationCardProps {
  data: {
    current: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    sparkline: number[];
    status: 'normal' | 'warning' | 'critical';
  };
}

export function PopulationCard({ data }: PopulationCardProps) {
  return (
    <MetricCard
      label="Global Population"
      value={formatLargeNumber(data.current)}
      trend={data.trend}
      sparkline={data.sparkline}
      status={data.status}
    />
  );
}
```

### 3. Quality of Life Card
```typescript
// Show tier distribution, NOT just average

interface QoLCardProps {
  data: {
    average: number;
    tierDistribution: Record<string, number>; // % in each tier
    trend: 'improving' | 'worsening' | 'stable';
    sparkline: number[];
  };
}

export function QualityOfLifeCard({ data }: QoLCardProps) {
  return (
    <div className="glass p-6 rounded-xl">
      <div className="text-sm text-gray-400">Quality of Life</div>
      <div className="text-3xl font-bold mt-2">
        {(data.average * 100).toFixed(1)}
      </div>

      {/* Tier Distribution Bar */}
      <div className="flex h-2 mt-3 rounded-full overflow-hidden">
        {Object.entries(data.tierDistribution).map(([tier, pct]) => (
          <div
            key={tier}
            className={`bg-tier-${tier}`}
            style={{ width: `${pct}%` }}
            title={`${tier}: ${pct.toFixed(1)}%`}
          />
        ))}
      </div>

      <LineChart data={data.sparkline} width={200} height={40} />
    </div>
  );
}
```

### 4. AI Capability Card
```typescript
// Show distribution, NOT just average

interface AICapabilityCardProps {
  data: {
    distribution: {
      mean: number;
      median: number;
      min: number;
      max: number;
    };
    trend: 'increasing' | 'decreasing' | 'stable';
  };
}

export function AICapabilityCard({ data }: AICapabilityCardProps) {
  return (
    <div className="glass p-6 rounded-xl">
      <div className="text-sm text-gray-400">AI Capability</div>
      <div className="flex justify-between items-baseline mt-2">
        <div className="text-3xl font-bold">
          {(data.distribution.mean * 100).toFixed(0)}
        </div>
        <div className="text-xs text-gray-500">
          Range: {(data.distribution.min * 100).toFixed(0)}-
          {(data.distribution.max * 100).toFixed(0)}
        </div>
      </div>
      <TrendArrow trend={data.trend} />
    </div>
  );
}
```

### 5. Alignment Card
```typescript
// Show misaligned count

interface AlignmentCardProps {
  data: {
    distribution: {
      mean: number;
      median: number;
    };
    misalignedCount: number; // < 0.3
    deeplyMisalignedCount: number; // < 0.1
  };
}

export function AlignmentCard({ data }: AlignmentCardProps) {
  return (
    <div className="glass p-6 rounded-xl">
      <div className="text-sm text-gray-400">Alignment Score</div>
      <div className="text-3xl font-bold mt-2">
        {(data.distribution.mean * 100).toFixed(0)}
      </div>
      {data.misalignedCount > 0 && (
        <div className="text-xs text-danger mt-2">
          ⚠️ {data.misalignedCount} misaligned agents
        </div>
      )}
    </div>
  );
}
```

---

## Acceptance Criteria

✅ 4 metric cards render in grid
✅ Population shows trend + alert if <2B
✅ QoL shows tier distribution (NOT just average)
✅ AI Capability shows mean + range
✅ Alignment shows misaligned count
✅ Sparklines render for population + QoL
✅ Status colors applied correctly
✅ Responsive layout

---

## Deliverables

**Files:**
- `src/components/dashboard/CriticalMetricsRow.tsx` (~50 lines)
- `src/components/dashboard/PopulationCard.tsx` (~60 lines)
- `src/components/dashboard/QualityOfLifeCard.tsx` (~80 lines)
- `src/components/dashboard/AICapabilityCard.tsx` (~70 lines)
- `src/components/dashboard/AlignmentCard.tsx` (~70 lines)
- `src/hooks/useCriticalMetrics.ts` (~30 lines)

---

**Last Updated:** October 22, 2025
